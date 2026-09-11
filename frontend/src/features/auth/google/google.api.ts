import { getCurrentApiLang } from "../../../i18n/apiLang";
import { httpClient } from "../../../lib/http/httpClient";
import type { GoogleAuthResponse, GoogleLoginPayload, GoogleRegisterPayload } from "./google.types";

export function googleLogin(payload: GoogleLoginPayload) {
  return httpClient.post<GoogleAuthResponse>("/google/login", { ...payload, lang: getCurrentApiLang() });
}

export function googleRegister(payload: GoogleRegisterPayload) {
  return httpClient.post<GoogleAuthResponse>("/google/register", { ...payload, lang: getCurrentApiLang() });
}