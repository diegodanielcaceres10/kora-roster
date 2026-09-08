export interface Account {
  id: number;
  email: string;
  name: string;
  lastname: string;
  phone: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterAccountPayload {
  email: string;
  name: string;
  lastname: string;
  acceptedTerms: boolean;
  marketingConsent: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Account;
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface SetPasswordPayload {
  token: string;
  password: string;
}

export type Me = Account;

export interface GoogleLoginPayload {
  idToken: string;
}

export interface GoogleRegisterPayload {
  idToken: string;
  name: string;
  lastname: string;
  marketingConsent: boolean;
}

export interface GoogleAuthResponse extends LoginResponse {
  linkedAccount?: boolean;
}

export interface GoogleAccountNotFoundProfile {
  email: string;
  name: string;
  lastname: string;
  idToken: string;
}

export interface ApiHealth {
  status: string;
  env: string;
}
