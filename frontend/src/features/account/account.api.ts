import { httpClient } from "../../lib/http/httpClient";
import { getCurrentApiLang } from "../../i18n/apiLang";
import type { Account, ForgotPasswordPayload, LoginPayload, LoginResponse, RegisterAccountPayload, SetPasswordPayload, Me, ApiHealth, GoogleLoginPayload, GoogleRegisterPayload, GoogleAuthResponse } from "./account.types";

export function registerAccount(payload: RegisterAccountPayload) {
  return httpClient.post<Account>("/auth/register", { ...payload, lang: getCurrentApiLang() });
}

export function loginAccount(payload: LoginPayload) {
  return httpClient.post<LoginResponse>("/auth/login", payload);
}

export function forgotPassword(payload: ForgotPasswordPayload) {
  return httpClient.post<{ message: string; code: string }>("/auth/forgot-password", { ...payload, lang: getCurrentApiLang() });
}

export function setPassword(payload: SetPasswordPayload) {
  return httpClient.post<{ message: string; code: string }>("/auth/set-password", payload);
}

export function getMe() {
  return httpClient.get<Me>("/auth/me", { auth: true });
}

export function logoutAccount(refreshToken: string) {
  return httpClient.post<{ message: string; code: string }>("/auth/logout", { refreshToken });
}

export function googleLogin(payload: GoogleLoginPayload) {
  return httpClient.post<GoogleAuthResponse>("/google/login", { ...payload, lang: getCurrentApiLang() });
}

export function googleRegister(payload: GoogleRegisterPayload) {
  return httpClient.post<GoogleAuthResponse>("/google/register", { ...payload, lang: getCurrentApiLang() });
}

export function checkApiHealth() {
  return httpClient.get<ApiHealth>("/health/ready");
}
