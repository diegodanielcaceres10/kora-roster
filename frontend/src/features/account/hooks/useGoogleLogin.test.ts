import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGoogleLogin } from "./useGoogleLogin";
import { ApiError } from "../../../lib/http/httpClient";
import { authStorage } from "../../../lib/auth/authStorage";

const { googleLogin } = vi.hoisted(() => ({ googleLogin: vi.fn() }));
vi.mock("../account.api", () => ({ googleLogin }));

const { setAccount } = vi.hoisted(() => ({ setAccount: vi.fn() }));
vi.mock("../AccountContext", () => ({ useAccount: () => ({ setAccount }) }));

describe("useGoogleLogin", () => {
  beforeEach(() => {
    localStorage.clear();
    googleLogin.mockReset();
    setAccount.mockClear();
  });

  it("stores tokens, sets the account, and returns a success result", async () => {
    const response = { user: { id: 1, email: "a@b.com" } as any, accessToken: "at", refreshToken: "rt" };
    googleLogin.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useGoogleLogin());

    let outcome;
    await act(async () => {
      outcome = await result.current.submit("id-token");
    });

    expect(outcome).toEqual({ status: "success", data: response });
    expect(result.current.status).toBe("success");
    expect(result.current.errorId).toBeNull();
    expect(authStorage.getAccessToken()).toBe("at");
    expect(authStorage.getRefreshToken()).toBe("rt");
    expect(setAccount).toHaveBeenCalledWith(response.user);
    expect(googleLogin).toHaveBeenCalledWith({ idToken: "id-token" });
  });

  it("returns not_found and resets to idle (not error) on GOOGLE_ACCOUNT_NOT_FOUND", async () => {
    googleLogin.mockRejectedValueOnce(new ApiError(404, "No account found", "GOOGLE_ACCOUNT_NOT_FOUND", {}));

    const { result } = renderHook(() => useGoogleLogin());

    let outcome;
    await act(async () => {
      outcome = await result.current.submit("id-token");
    });

    expect(outcome).toEqual({ status: "not_found" });
    expect(result.current.status).toBe("idle");
    expect(result.current.errorId).toBeNull();
    expect(setAccount).not.toHaveBeenCalled();
    expect(authStorage.getAccessToken()).toBeNull();
  });

  it.each([
    ["INVALID_GOOGLE_TOKEN", "googleAuth.error.invalidToken"],
    ["ACCOUNT_NOT_ACTIVE", "googleAuth.error.accountNotActive"],
    ["SOME_OTHER_CODE", "googleAuth.error.tryAgain"],
  ])("maps ApiError code %s to errorId %s", async (code, expectedId) => {
    googleLogin.mockRejectedValueOnce(new ApiError(400, "failed", code, {}));

    const { result } = renderHook(() => useGoogleLogin());
    let outcome;
    await act(async () => {
      outcome = await result.current.submit("id-token");
    });

    expect(outcome).toEqual({ status: "error" });
    expect(result.current.status).toBe("error");
    expect(result.current.errorId).toBe(expectedId);
  });

  it("maps a non-ApiError failure to a generic errorId", async () => {
    googleLogin.mockRejectedValueOnce(new Error("network down"));

    const { result } = renderHook(() => useGoogleLogin());
    await act(async () => {
      await result.current.submit("id-token");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorId).toBe("googleAuth.error.generic");
  });

  it("is in loading state while the request is in flight", async () => {
    let resolvePromise: (value: unknown) => void;
    googleLogin.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result } = renderHook(() => useGoogleLogin());

    let submitPromise: Promise<unknown>;
    act(() => {
      submitPromise = result.current.submit("id-token");
    });

    expect(result.current.status).toBe("loading");

    await act(async () => {
      resolvePromise({ user: { id: 1 }, accessToken: "at", refreshToken: "rt" });
      await submitPromise;
    });

    expect(result.current.status).toBe("success");
  });
});
