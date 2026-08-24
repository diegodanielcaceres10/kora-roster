import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getMe } from "./account.api";
import type { Me } from "./account.types";
import { authStorage, AUTH_SESSION_EXPIRED_EVENT } from "../../lib/auth/authStorage";
import { ApiError } from "../../lib/http/httpClient";

interface AccountContextValue {
  account: Me | null;
  isLoading: boolean;
  ensureLoaded: () => Promise<void>;
  setAccount: (account: Me | null) => void;
  logout: () => void;
}

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Me | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const ensureLoaded = useCallback(async () => {
    if (account) return;

    const token = authStorage.getAccessToken();
    if (!token) return;

    setIsLoading(true);
    try {
      const me = await getMe();
      setAccount(me);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.code === "TOKEN_EXPIRED")) {
        authStorage.clearTokens();
      }
      setAccount(null);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  const logout = useCallback(() => {
    authStorage.clearTokens();
    setAccount(null);
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, logout);
  }, [logout]);

  return <AccountContext.Provider value={{ account, isLoading, ensureLoaded, setAccount, logout }}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within an AccountProvider");
  return ctx;
}
