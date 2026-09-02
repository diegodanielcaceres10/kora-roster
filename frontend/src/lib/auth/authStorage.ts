const ACCESS_TOKEN_KEY = "kora.accessToken";
const REFRESH_TOKEN_KEY = "kora.refreshToken";

// Fired by httpClient when a token refresh fails for good (expired/used
// refresh token, or none stored). AccountContext listens for this to clear
// the session from anywhere in the app, not just from screens that call
// getMe().
export const AUTH_SESSION_EXPIRED_EVENT = "kora:auth-session-expired";

export const authStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
