import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGoogleRegister } from "./useGoogleRegister";
import { ApiError } from "../../../lib/http/httpClient";
import { authStorage } from "../../../lib/auth/authStorage";
import type { GoogleRegisterPayload } from "../account.types";

const { googleRegister } = vi.hoisted(() => ({ googleRegister: vi.fn() }));
vi.mock("../account.api", () => ({ googleRegister }));

const { setAccount } = vi.hoisted(() => ({ setAccount: vi.fn() }));
vi.mock("../AccountContext", () => ({ useAccount: () => ({ setAccount }) }));

const payload: GoogleRegisterPayload = {
  idToken: "id-token",
  email: "a@b.com",
  name: "Diego",
  lastname: "Caceres",
  acceptedTerms: true,
  marketingConsent: false,
};

describe("useGoogleRegister", () => {
  beforeEach(() => {
    localStorage.clear();
    googleRegister.mockReset();
    setAccount.mockClear();
  });

  it("stores tokens, sets the account, and returns the created result", async () => {
    const response = { user: { id: 1, email: payload.email } as any, accessToken: "at", refreshToken: "rt" };
    googleRegister.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useGoogleRegister());

    let outcome;
    await act(async () => {
      outcome = await result.current.submit(payload);
    });

    expect(outcome).toEqual(response);
    expect(result.current.status).toBe("success");
    expect(authStorage.getAccessToken()).toBe("at");
    expect(authStorage.getRefreshToken()).toBe("rt");
    expect(setAccount).toHaveBeenCalledWith(response.user);
    expect(googleRegister).toHaveBeenCalledWith(payload);
  });

  it("maps EMAIL_TAKEN to the register-specific errorId and returns null", async () => {
    googleRegister.mockRejectedValueOnce(new ApiError(409, "Email already taken", "EMAIL_TAKEN", {}));

    const { result } = renderHook(() => useGoogleRegister());

    let outcome;
    await act(async () => {
      outcome = await result.current.submit(payload);
    });

    expect(outcome).toBeNull();
    expect(result.current.status).toBe("error");
    expect(result.current.errorId).toBe("register.error.emailTaken");
    expect(setAccount).not.toHaveBeenCalled();
  });

  it.each([
    ["INVALID_GOOGLE_TOKEN", "googleAuth.error.invalidToken"],
    ["SOME_OTHER_CODE", "googleAuth.error.tryAgain"],
  ])("maps ApiError code %s to errorId %s", async (code, expectedId) => {
    googleRegister.mockRejectedValueOnce(new ApiError(400, "failed", code, {}));

    const { result } = renderHook(() => useGoogleRegister());
    await act(async () => {
      await result.current.submit(payload);
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorId).toBe(expectedId);
  });

  it("maps a non-ApiError failure to a generic errorId", async () => {
    googleRegister.mockRejectedValueOnce(new Error("network down"));

    const { result } = renderHook(() => useGoogleRegister());
    await act(async () => {
      await result.current.submit(payload);
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorId).toBe("googleAuth.error.generic");
  });

  it("is in loading state while the request is in flight", async () => {
    let resolvePromise: (value: unknown) => void;
    googleRegister.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result } = renderHook(() => useGoogleRegister());

    let submitPromise: Promise<unknown>;
    act(() => {
      submitPromise = result.current.submit(payload);
    });

    expect(result.current.status).toBe("loading");

    await act(async () => {
      resolvePromise({ user: { id: 1 }, accessToken: "at", refreshToken: "rt" });
      await submitPromise;
    });

    expect(result.current.status).toBe("success");
  });
});
