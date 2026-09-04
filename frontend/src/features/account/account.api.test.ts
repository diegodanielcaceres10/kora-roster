import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpClient } from "../../lib/http/httpClient";
import { LOCALE_STORAGE_KEY } from "../../i18n/config";
import { checkApiHealth, forgotPassword, getMe, googleAuth, loginAccount, logoutAccount, registerAccount, setPassword } from "./account.api";

vi.mock("../../lib/http/httpClient", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("account.api", () => {
  beforeEach(() => {
    vi.mocked(httpClient.get).mockReset();
    vi.mocked(httpClient.post).mockReset();
    localStorage.clear();
    localStorage.setItem(LOCALE_STORAGE_KEY, "pt-BR");
  });

  it("registerAccount posts to /auth/register with the current API language attached", () => {
    registerAccount({ email: "a@b.com", name: "Ana", lastname: "Lima", acceptedTerms: true, marketingConsent: false });

    expect(httpClient.post).toHaveBeenCalledWith("/auth/register", {
      email: "a@b.com",
      name: "Ana",
      lastname: "Lima",
      acceptedTerms: true,
      marketingConsent: false,
      lang: "pt",
    });
  });

  it("loginAccount posts to /auth/login without attaching a language", () => {
    loginAccount({ email: "a@b.com", password: "secret" });

    expect(httpClient.post).toHaveBeenCalledWith("/auth/login", { email: "a@b.com", password: "secret" });
  });

  it("forgotPassword posts to /auth/forgot-password with the current API language attached", () => {
    forgotPassword({ email: "a@b.com" });

    expect(httpClient.post).toHaveBeenCalledWith("/auth/forgot-password", { email: "a@b.com", lang: "pt" });
  });

  it("setPassword posts to /auth/set-password without attaching a language", () => {
    setPassword({ token: "tok", password: "newpass" });

    expect(httpClient.post).toHaveBeenCalledWith("/auth/set-password", { token: "tok", password: "newpass" });
  });

  it("getMe requests /auth/me with auth enabled", () => {
    getMe();

    expect(httpClient.get).toHaveBeenCalledWith("/auth/me", { auth: true });
  });

  it("logoutAccount posts to /auth/logout with the refresh token", () => {
    logoutAccount("refresh-123");

    expect(httpClient.post).toHaveBeenCalledWith("/auth/logout", { refreshToken: "refresh-123" });
  });

  it("googleAuth posts to /auth/google with the current API language attached", () => {
    googleAuth({ idToken: "id-token" });

    expect(httpClient.post).toHaveBeenCalledWith("/auth/google", { idToken: "id-token", lang: "pt" });
  });

  it("checkApiHealth requests /health without auth", () => {
    checkApiHealth();

    expect(httpClient.get).toHaveBeenCalledWith("/health");
  });
});
