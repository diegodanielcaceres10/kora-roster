export interface RegisterAccountPayload {
  email: string;
  name: string;
  lastname: string;
  acceptedTerms: boolean;
  acceptedMarketing: boolean;
}

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
