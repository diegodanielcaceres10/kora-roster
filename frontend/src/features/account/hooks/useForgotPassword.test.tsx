import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useForgotPassword } from "./useForgotPassword";
import { ApiError } from "../../../lib/http/httpClient";
import * as accountApi from "../account.api";

vi.mock("../account.api");

describe("useForgotPassword", () => {
  beforeEach(() => {
    vi.mocked(accountApi.forgotPassword).mockReset();
  });

  it("reports success and returns true when the request succeeds", async () => {
    vi.mocked(accountApi.forgotPassword).mockResolvedValueOnce({ message: "sent", code: "OK" });

    const { result } = renderHook(() => useForgotPassword());

    let returnedValue: boolean | undefined;
    await act(async () => {
      returnedValue = await result.current.submit({ email: "a@b.com" });
    });

    expect(returnedValue).toBe(true);
    expect(result.current.status).toBe("success");
    expect(result.current.errorId).toBeNull();
  });

  it.each([
    ["VALIDATION_ERROR", "forgot.error.invalidEmail"],
    ["SOME_UNMAPPED_CODE", "forgot.error.tryAgain"],
  ])("maps ApiError code %s to the %s message id and returns false", async (code, expectedId) => {
    vi.mocked(accountApi.forgotPassword).mockRejectedValueOnce(new ApiError(400, "boom", code, {}));

    const { result } = renderHook(() => useForgotPassword());

    let returnedValue: boolean | undefined;
    await act(async () => {
      returnedValue = await result.current.submit({ email: "a@b.com" });
    });

    expect(returnedValue).toBe(false);
    expect(result.current.status).toBe("error");
    expect(result.current.errorId).toBe(expectedId);
  });
});
