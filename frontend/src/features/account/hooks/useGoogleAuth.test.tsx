import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGoogleAuth } from "./useGoogleAuth";
import { AccountProvider, useAccount } from "../AccountContext";
import { ApiError } from "../../../lib/http/httpClient";
import { authStorage } from "../../../lib/auth/authStorage";
import messages from "../../../i18n/locales/en-US.json";
import * as accountApi from "../account.api";

vi.mock("../account.api");

function Providers({ children }: { children: ReactNode }) {
  return (
    <IntlProvider locale="en-US" messages={messages}>
      <AccountProvider>{children}</AccountProvider>
    </IntlProvider>
  );
}

function useTestSetup() {
  return { googleAuth: useGoogleAuth(), account: useAccount() };
}

const fakeUser = {
  id: 1,
  email: "a@b.com",
  name: "Ana",
  lastname: "Lima",
  phone: null,
  status: "active",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

describe("useGoogleAuth", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(accountApi.googleAuth).mockReset();
  });

  it("persists tokens and updates the shared account on success", async () => {
    vi.mocked(accountApi.googleAuth).mockResolvedValueOnce({
      user: fakeUser,
      accessToken: "access-1",
      refreshToken: "refresh-1",
    });

    const { result } = renderHook(useTestSetup, { wrapper: Providers });

    await act(async () => {
      await result.current.googleAuth.submit("id-token-123");
    });

    expect(accountApi.googleAuth).toHaveBeenCalledWith({ idToken: "id-token-123" });
    expect(result.current.googleAuth.status).toBe("success");
    expect(authStorage.getAccessToken()).toBe("access-1");
    expect(result.current.account.account).toEqual(fakeUser);
  });

  it.each([
    ["INVALID_GOOGLE_TOKEN", "googleAuth.error.invalidToken"],
    ["ACCOUNT_NOT_ACTIVE", "googleAuth.error.accountNotActive"],
    ["SOME_UNMAPPED_CODE", "googleAuth.error.tryAgain"],
  ])("maps ApiError code %s to the %s message id", async (code, expectedId) => {
    vi.mocked(accountApi.googleAuth).mockRejectedValueOnce(new ApiError(400, "boom", code, {}));

    const { result } = renderHook(useTestSetup, { wrapper: Providers });

    await act(async () => {
      await result.current.googleAuth.submit("id-token-123");
    });

    expect(result.current.googleAuth.status).toBe("error");
    expect(result.current.googleAuth.errorId).toBe(expectedId);
    expect(authStorage.getAccessToken()).toBeNull();
  });
});
