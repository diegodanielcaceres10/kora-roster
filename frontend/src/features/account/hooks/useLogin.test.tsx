import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLogin } from "./useLogin";
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
  return { login: useLogin(), account: useAccount() };
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

describe("useLogin", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(accountApi.loginAccount).mockReset();
  });

  it("persists tokens, updates the shared account and reports success", async () => {
    vi.mocked(accountApi.loginAccount).mockResolvedValueOnce({
      user: fakeUser,
      accessToken: "access-1",
      refreshToken: "refresh-1",
    });

    const { result } = renderHook(useTestSetup, { wrapper: Providers });

    await act(async () => {
      await result.current.login.submit({ email: "a@b.com", password: "secret" });
    });

    expect(result.current.login.status).toBe("success");
    expect(result.current.login.errorId).toBeNull();
    expect(authStorage.getAccessToken()).toBe("access-1");
    expect(authStorage.getRefreshToken()).toBe("refresh-1");
    expect(result.current.account.account).toEqual(fakeUser);
  });

  it.each([
    ["INVALID_CREDENTIALS", "login.error.invalidCredentials"],
    ["ACCOUNT_NOT_ACTIVE", "login.error.accountNotActive"],
    ["VALIDATION_ERROR", "login.error.validation"],
    ["SOME_UNMAPPED_CODE", "login.error.tryAgain"],
  ])("maps ApiError code %s to the %s message id, without touching stored tokens", async (code, expectedId) => {
    vi.mocked(accountApi.loginAccount).mockRejectedValueOnce(new ApiError(400, "boom", code, {}));

    const { result } = renderHook(useTestSetup, { wrapper: Providers });

    await act(async () => {
      await result.current.login.submit({ email: "a@b.com", password: "bad" });
    });

    expect(result.current.login.status).toBe("error");
    expect(result.current.login.errorId).toBe(expectedId);
    expect(authStorage.getAccessToken()).toBeNull();
    expect(result.current.account.account).toBeNull();
  });

  it("maps a non-ApiError failure (e.g. a network error) to a generic message id", async () => {
    vi.mocked(accountApi.loginAccount).mockRejectedValueOnce(new TypeError("network down"));

    const { result } = renderHook(useTestSetup, { wrapper: Providers });

    await act(async () => {
      await result.current.login.submit({ email: "a@b.com", password: "bad" });
    });

    expect(result.current.login.errorId).toBe("login.error.generic");
  });
});
