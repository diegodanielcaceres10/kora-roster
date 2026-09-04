import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSetPassword } from "./useSetPassword";
import { ApiError } from "../../../lib/http/httpClient";
import * as accountApi from "../account.api";

vi.mock("../account.api");

describe("useSetPassword", () => {
  beforeEach(() => {
    vi.mocked(accountApi.setPassword).mockReset();
  });

  it("submits the token and password, and reports success", async () => {
    vi.mocked(accountApi.setPassword).mockResolvedValueOnce({ message: "done", code: "OK" });

    const { result } = renderHook(() => useSetPassword());

    let returnedValue: boolean | undefined;
    await act(async () => {
      returnedValue = await result.current.submit("reset-token", "new-password");
    });

    expect(accountApi.setPassword).toHaveBeenCalledWith({ token: "reset-token", password: "new-password" });
    expect(returnedValue).toBe(true);
    expect(result.current.status).toBe("success");
  });

  it.each([
    ["TOKEN_EXPIRED", "setPassword.error.tokenExpired"],
    ["TOKEN_ALREADY_USED", "setPassword.error.tokenAlreadyUsed"],
    ["INVALID_TOKEN", "setPassword.error.invalidToken"],
    ["VALIDATION_ERROR", "setPassword.error.validation"],
    ["SOME_UNMAPPED_CODE", "setPassword.error.tryAgain"],
  ])("maps ApiError code %s to the %s message id and returns false", async (code, expectedId) => {
    vi.mocked(accountApi.setPassword).mockRejectedValueOnce(new ApiError(400, "boom", code, {}));

    const { result } = renderHook(() => useSetPassword());

    let returnedValue: boolean | undefined;
    await act(async () => {
      returnedValue = await result.current.submit("reset-token", "new-password");
    });

    expect(returnedValue).toBe(false);
    expect(result.current.status).toBe("error");
    expect(result.current.errorId).toBe(expectedId);
  });
});
