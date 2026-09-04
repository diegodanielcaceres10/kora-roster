import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRegisterAccount } from "./useRegisterAccount";
import { ApiError } from "../../../lib/http/httpClient";
import * as accountApi from "../account.api";

vi.mock("../account.api");

const payload = {
  email: "a@b.com",
  name: "Ana",
  lastname: "Lima",
  acceptedTerms: true,
  marketingConsent: false,
};

describe("useRegisterAccount", () => {
  beforeEach(() => {
    vi.mocked(accountApi.registerAccount).mockReset();
  });

  it("stores the created account and reports success", async () => {
    const created = { id: 1, ...payload, phone: null, status: "pending", createdAt: "2026-01-01", updatedAt: "2026-01-01" };
    vi.mocked(accountApi.registerAccount).mockResolvedValueOnce(created);

    const { result } = renderHook(() => useRegisterAccount());

    await act(async () => {
      await result.current.submit(payload);
    });

    expect(result.current.status).toBe("success");
    expect(result.current.account).toEqual(created);
    expect(result.current.errorId).toBeNull();
  });

  it.each([
    ["EMAIL_TAKEN", "register.error.emailTaken"],
    ["VALIDATION_ERROR", "register.error.validation"],
    ["SOME_UNMAPPED_CODE", "register.error.tryAgain"],
  ])("maps ApiError code %s to the %s message id", async (code, expectedId) => {
    vi.mocked(accountApi.registerAccount).mockRejectedValueOnce(new ApiError(400, "boom", code, {}));

    const { result } = renderHook(() => useRegisterAccount());

    await act(async () => {
      await result.current.submit(payload);
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorId).toBe(expectedId);
    expect(result.current.account).toBeNull();
  });

  it("maps a non-ApiError failure to a generic message id", async () => {
    vi.mocked(accountApi.registerAccount).mockRejectedValueOnce(new TypeError("network down"));

    const { result } = renderHook(() => useRegisterAccount());

    await act(async () => {
      await result.current.submit(payload);
    });

    expect(result.current.errorId).toBe("register.error.generic");
  });
});
