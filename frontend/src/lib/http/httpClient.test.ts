import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, httpClient } from "./httpClient";
import { authStorage, AUTH_SESSION_EXPIRED_EVENT } from "../auth/authStorage";

function base64UrlEncode(value: unknown): string {
  const base64 = btoa(JSON.stringify(value));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Builds a fake (unsigned) JWT that expires `expiresInSeconds` from now. */
function makeToken(expiresInSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const header = base64UrlEncode({ alg: "HS256", typ: "JWT" });
  const payload = base64UrlEncode({ exp });
  return `${header}.${payload}.signature`;
}

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (key: string) => (key.toLowerCase() === "content-type" ? "application/json" : null) },
    json: async () => body,
  } as Response;
}

describe("httpClient", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends a GET request with JSON headers and returns the parsed body", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const result = await httpClient.get<{ ok: boolean }>("/health");

    expect(result).toEqual({ ok: true });
    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(init?.method).toBe("GET");
    expect((init?.headers as Record<string, string> | undefined)?.["Content-Type"]).toBe("application/json");
    expect((init?.headers as Record<string, string> | undefined)?.Authorization).toBeUndefined();
  });

  it("sends a POST request with a JSON-stringified body", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { id: 1 }));

    await httpClient.post("/auth/login", { email: "a@b.com", password: "x" });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(init?.body).toBe(JSON.stringify({ email: "a@b.com", password: "x" }));
  });

  it("attaches Authorization when auth:true and a fresh token is stored", async () => {
    const token = makeToken(3600);
    authStorage.setTokens(token, "refresh-token");
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { name: "kora" }));

    await httpClient.get("/auth/me", { auth: true });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect((init?.headers as Record<string, string> | undefined)?.Authorization).toBe(`Bearer ${token}`);
  });

  it("omits Authorization when auth:true but there is no token stored", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, {}));

    await httpClient.get("/auth/me", { auth: true });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect((init?.headers as Record<string, string> | undefined)?.Authorization).toBeUndefined();
  });

  it("proactively refreshes a token that's about to expire before sending the request", async () => {
    const oldToken = makeToken(5); // within the 10s buffer
    authStorage.setTokens(oldToken, "refresh-token");
    const newToken = makeToken(3600);

    vi.mocked(fetch).mockImplementation(async (url) => {
      if (String(url).includes("/auth/refresh-token")) {
        return jsonResponse(200, { accessToken: newToken, refreshToken: "new-refresh-token" });
      }
      return jsonResponse(200, { ok: true });
    });

    await httpClient.get("/auth/me", { auth: true });

    expect(fetch).toHaveBeenCalledTimes(2);
    const meCall = vi.mocked(fetch).mock.calls.find(([url]) => String(url).includes("/auth/me"));
    expect((meCall?.[1]?.headers as Record<string, string> | undefined)?.Authorization).toBe(`Bearer ${newToken}`);
    expect(authStorage.getAccessToken()).toBe(newToken);
  });

  it("shares a single in-flight refresh across concurrent requests", async () => {
    authStorage.setTokens(makeToken(5), "refresh-token");
    const newToken = makeToken(3600);
    let refreshCalls = 0;

    vi.mocked(fetch).mockImplementation(async (url) => {
      if (String(url).includes("/auth/refresh-token")) {
        refreshCalls += 1;
        return jsonResponse(200, { accessToken: newToken, refreshToken: "new-refresh-token" });
      }
      return jsonResponse(200, { ok: true });
    });

    await Promise.all([httpClient.get("/a", { auth: true }), httpClient.get("/b", { auth: true })]);

    expect(refreshCalls).toBe(1);
  });

  it("retries a request once after a reactive 401 TOKEN_EXPIRED refresh", async () => {
    authStorage.setTokens(makeToken(3600), "refresh-token"); // not expiring soon, so no proactive refresh
    const newToken = makeToken(7200);
    let meCalls = 0;

    vi.mocked(fetch).mockImplementation(async (url) => {
      if (String(url).includes("/auth/refresh-token")) {
        return jsonResponse(200, { accessToken: newToken, refreshToken: "new-refresh-token" });
      }
      meCalls += 1;
      return meCalls === 1 ? jsonResponse(401, { message: "expired", code: "TOKEN_EXPIRED" }) : jsonResponse(200, { ok: true });
    });

    const result = await httpClient.get("/auth/me", { auth: true });

    expect(result).toEqual({ ok: true });
    expect(meCalls).toBe(2);
  });

  it("does not attempt a refresh for a generic 401 without TOKEN_EXPIRED", async () => {
    authStorage.setTokens(makeToken(3600), "refresh-token");
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(401, { message: "nope", code: "UNAUTHORIZED" }));

    await expect(httpClient.get("/auth/me", { auth: true })).rejects.toThrow(ApiError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("clears tokens and dispatches session-expired when the refresh call itself fails, then sends the request without auth", async () => {
    authStorage.setTokens(makeToken(5), "bad-refresh-token");
    const listener = vi.fn();
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, listener);

    vi.mocked(fetch).mockImplementation(async (url) => {
      if (String(url).includes("/auth/refresh-token")) {
        return jsonResponse(401, { message: "invalid refresh token" });
      }
      return jsonResponse(200, { ok: true });
    });

    const result = await httpClient.get("/auth/me", { auth: true });

    expect(result).toEqual({ ok: true });
    expect(authStorage.getAccessToken()).toBeNull();
    expect(authStorage.getRefreshToken()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, listener);
  });

  it("adopts another tab's already-rotated tokens when the backend reports TOKEN_ALREADY_USED", async () => {
    authStorage.setTokens(makeToken(3600), "old-refresh-token"); // not expiring soon: exercises the reactive 401 path
    const rotatedAccessToken = makeToken(7200);
    const rotatedRefreshToken = "rotated-refresh-token";
    let meCalls = 0;

    vi.mocked(fetch).mockImplementation(async (url) => {
      if (String(url).includes("/auth/refresh-token")) {
        // Simulate another tab rotating the token while this refresh call is in flight.
        authStorage.setTokens(rotatedAccessToken, rotatedRefreshToken);
        return jsonResponse(409, { message: "already used", code: "TOKEN_ALREADY_USED" });
      }
      meCalls += 1;
      return meCalls === 1 ? jsonResponse(401, { message: "expired", code: "TOKEN_EXPIRED" }) : jsonResponse(200, { ok: true });
    });

    const result = await httpClient.get("/auth/me", { auth: true });

    expect(result).toEqual({ ok: true });
    expect(authStorage.getAccessToken()).toBe(rotatedAccessToken);
    expect(authStorage.getRefreshToken()).toBe(rotatedRefreshToken);
  });

  it("does NOT adopt a stored token from an unrelated refresh failure (only TOKEN_ALREADY_USED is trusted)", async () => {
    // Regression test: storage happening to hold a different token is not
    // by itself proof of a legitimate cross-tab rotation - only a backend
    // response explicitly coded TOKEN_ALREADY_USED is trusted for that.
    authStorage.setTokens(makeToken(5), "old-refresh-token"); // expiring soon: exercises the proactive path
    const listener = vi.fn();
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, listener);

    vi.mocked(fetch).mockImplementation(async (url) => {
      if (String(url).includes("/auth/refresh-token")) {
        // Storage differs from what we sent, but the failure is a generic
        // server error, not TOKEN_ALREADY_USED.
        authStorage.setTokens("unrelated-access-token", "unrelated-refresh-token");
        return jsonResponse(500, { message: "internal error" });
      }
      return jsonResponse(200, { ok: true });
    });

    const result = await httpClient.get("/auth/me", { auth: true });

    expect(result).toEqual({ ok: true }); // request still goes out, just without Authorization
    expect(authStorage.getAccessToken()).toBeNull();
    expect(authStorage.getRefreshToken()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, listener);
  });

  it("throws an ApiError with status, code, message and body parsed from the response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(422, { message: "Invalid email", code: "VALIDATION_ERROR", field: "email" }));

    await expect(httpClient.post("/auth/register", { email: "bad" })).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      code: "VALIDATION_ERROR",
      message: "Invalid email",
    });
  });

  it("falls back to a generic message when the error response has no JSON body", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => null },
      json: async () => ({}),
    } as unknown as Response);

    await expect(httpClient.get("/health")).rejects.toMatchObject({
      status: 500,
      message: "Request failed with status 500",
    });
  });
});
