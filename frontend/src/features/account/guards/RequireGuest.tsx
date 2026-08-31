import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAccount } from "../AccountContext";
import { useApiHealth } from "../hooks/useApiHealth";
import { authStorage } from "../../../lib/auth/authStorage";
import { Spinner } from "../../../components/spinner/spinner";
import { ServiceUnavailable } from "../../../components/service-unavailable/service-unavailable";

/**
 * Wrap routes meant for logged-out visitors (login, register, forgot,
 * set-password). Redirects to home when there's already a valid session.
 * If the backend health check fails, blocks access with a service
 * unavailable message instead of hitting the API.
 */
export function RequireGuest({ children }: { children: ReactNode }) {
  const { account, ensureLoaded } = useAccount();
  const { isHealthy, isChecking } = useApiHealth();

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  if (isChecking) {
    return <Spinner size="lg" label="Verificando disponibilidad del servicio..." />;
  }

  if (!isHealthy) {
    return <ServiceUnavailable />;
  }

  const hasToken = Boolean(authStorage.getAccessToken());

  if (hasToken && !account) {
    return <Spinner size="lg" label="Verificando sesión..." />;
  }

  if (account) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
