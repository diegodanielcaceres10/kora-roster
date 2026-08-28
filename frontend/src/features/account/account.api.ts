import { httpClient } from "../../lib/http/httpClient";
import type { Account, ForgotPasswordPayload, LoginPayload, LoginResponse, RegisterAccountPayload, SetPasswordPayload, Me, GoogleAuthPayload, GoogleAuthResponse } from "./account.types";

export function registerAccount(payload: RegisterAccountPayload) {
  return httpClient.post<Account>("/auth/register", payload);
}

export function loginAccount(payload: LoginPayload) {
  return httpClient.post<LoginResponse>("/auth/login", payload);
}

export function forgotPassword(payload: ForgotPasswordPayload) {
  return httpClient.post<{ message: string; code: string }>("/auth/forgot-password", payload);
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

export function googleAuth(payload: GoogleAuthPayload) {
  return httpClient.post<GoogleAuthResponse>("/auth/google", payload);
}
