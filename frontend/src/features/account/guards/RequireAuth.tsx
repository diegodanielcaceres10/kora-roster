import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAccount } from "../AccountContext";
import { authStorage } from "../../../lib/auth/authStorage";
import { Spinner } from "../../../components/spinner/spinner";

/**
 * Wrap routes that require an authenticated session (e.g. /me).
 * Redirects to /login when there's no token, or when the stored
 * token turns out to be invalid/expired after checking with the API.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { account, ensureLoaded } = useAccount();

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const hasToken = Boolean(authStorage.getAccessToken());

  if (!hasToken) {
    return <Navigate to="/" replace />;
  }

  if (!account) {
    return <Spinner size="lg" label="Verificando sesión..." />;
  }

  return <>{children}</>;
}
