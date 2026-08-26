import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAccount } from "../AccountContext";
import { authStorage } from "../../../lib/auth/authStorage";
import { Spinner } from "../../../components/spinner/spinner";

/**
 * Wrap routes meant for logged-out visitors (login, register, forgot,
 * set-password). Redirects to home when there's already a valid session.
 */
export function RequireGuest({ children }: { children: ReactNode }) {
  const { account, ensureLoaded } = useAccount();

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const hasToken = Boolean(authStorage.getAccessToken());

  if (hasToken && !account) {
    return <Spinner size="lg" label="Verificando sesión..." />;
  }

  if (account) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
