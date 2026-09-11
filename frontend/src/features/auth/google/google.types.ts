import type { LoginResponse, RegisterAccountPayload } from "../../account/account.types";

export interface GoogleLoginPayload {
  idToken: string;
}

export interface GoogleRegisterPayload extends RegisterAccountPayload {
  idToken: string;
}

export interface GoogleAuthResponse extends LoginResponse {
  linkedAccount?: boolean;
}

export interface GoogleProfile {
  idToken: string;
  email: string;
  name: string;
  lastname: string;
}
