import { authStorage, onTokensChangedExternally, AUTH_SESSION_EXPIRED_EVENT } from "../auth/authStorage";
import { isJwtExpiringSoon } from "../auth/jwt";

const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly body: unknown;

  constructor(status: number, message: string, code: string | undefined, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// The backend rotates the refresh token: every time it's used, it gets
// invalidated and a new one is issued. If two requests run out of a valid
// access token at the same time and each triggers its own refresh, the
// second one would arrive with an already-used refresh token
// (TOKEN_ALREADY_USED) and force an unnecessary logout. So every request
// that comes in while a refresh is in flight awaits the same promise
// instead of starting a new one.
let refreshPromise: Promise<string> | null = null;

// If another tab rotates the token while ours is mid-flight, our in-flight
// fetch already went out with the old one and can't be cancelled — but we
// can drop our cached promise so the NEXT caller reads the fresh token from
// storage instead of piggybacking on a request that's bound to fail.
onTokensChangedExternally(() => {
  refreshPromise = null;
});

async function performRefresh(): Promise<string> {
  const sentRefreshToken = authStorage.getRefreshToken();
  if (!sentRefreshToken) {
    authStorage.clearTokens();
    window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
    throw new Error("NO_REFRESH_TOKEN");
  }

  const response = await fetch(`${API_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: sentRefreshToken }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => undefined);
    const code = errorBody && typeof errorBody === "object" ? (errorBody as { code?: string }).code : undefined;

    // Another tab may have rotated with this same refresh token while our
    // request was in flight (e.g. both tabs waking from background at
    // once). Only treat this as that legitimate rotation - and adopt what
    // the other tab wrote - when the backend specifically reports the
    // token as already used. Any other failure (network hiccup, rate
    // limit, server error) must not be papered over just because storage
    // happens to hold a different token for some unrelated reason.
    if (code === "TOKEN_ALREADY_USED") {
      const currentRefreshToken = authStorage.getRefreshToken();
      const currentAccessToken = authStorage.getAccessToken();
      if (currentAccessToken && currentRefreshToken && currentRefreshToken !== sentRefreshToken) {
        return currentAccessToken;
      }
    }

    authStorage.clearTokens();
    window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
    throw new Error("REFRESH_FAILED");
  }

  const data = (await response.json()) as RefreshTokenResponse;
  authStorage.setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// Single choke point for every request with auth: true. If the access token
// is expired or less than 10s from expiring, refresh BEFORE sending the
// request instead of waiting for the backend to respond 401. Saves the
// round trip of "request fails -> refresh -> retry" in the common case.
// Reuses the same refreshPromise as the reactive handling below, so if a
// refresh is already in flight (triggered by another request) this doesn't
// start a duplicate one.
async function getValidAccessToken(): Promise<string | null> {
  const token = authStorage.getAccessToken();
  if (!token) return null;

  if (!isJwtExpiringSoon(token)) return token;

  try {
    return await refreshAccessToken();
  } catch {
    // The refresh also failed (or there was no refresh token): let the
    // request go out without an Authorization header. The backend will
    // reject it with 401 UNAUTHORIZED, which is a consistent outcome
    // already handled by the rest of the app (see AccountContext /
    // AUTH_SESSION_EXPIRED_EVENT).
    console.warn("Access token expired and refresh failed, logging out");
    return null;
  }
}

async function request<TResponse>(path: string, options: RequestOptions = {}, isRetry = false): Promise<TResponse> {
  const { body, headers, auth, ...rest } = options;
  const authHeaders: Record<string, string> = {};
  if (auth) {
    const token = await getValidAccessToken();
    if (token) authHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const errorBody = data && typeof data === "object" ? (data as Record<string, unknown>) : undefined;
    const message = (errorBody?.message ? String(errorBody.message) : undefined) ?? `Request failed with status ${response.status}`;
    const code = errorBody?.code ? String(errorBody.code) : undefined;

    // Access token expired: try to refresh once and retry the original
    // request with the new token. Only for TOKEN_EXPIRED (not for a generic
    // UNAUTHORIZED, which means the token is missing/invalid/tampered and a
    // refresh won't fix that).
    if (auth && !isRetry && response.status === 401 && code === "TOKEN_EXPIRED") {
      try {
        await refreshAccessToken();
        return request<TResponse>(path, options, true);
      } catch {
        // The refresh token is also invalid or expired: fall through with
        // the original error so the caller handles it the same way as
        // today (see AccountContext.ensureLoaded).
        console.warn("Access token expired and refresh failed, logging out");
      }
    }

    throw new ApiError(response.status, message, code, data);
  }

  return data as TResponse;
}

export const httpClient = {
  get: <TResponse>(path: string, options?: RequestOptions) => request<TResponse>(path, { ...options, method: "GET" }),
  post: <TResponse>(path: string, body?: unknown, options?: RequestOptions) => request<TResponse>(path, { ...options, method: "POST", body }),
};
