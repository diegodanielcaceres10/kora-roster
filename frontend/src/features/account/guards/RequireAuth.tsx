import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useIntl } from "react-intl";
import { useAccount } from "../AccountContext";
import { useApiHealth } from "../hooks/useApiHealth";
import { authStorage } from "../../../lib/auth/authStorage";
import { Spinner } from "../../../components/spinner/spinner";
import { ServiceUnavailable } from "../../../components/service-unavailable/service-unavailable";

/**
 * Wrap routes that require an authenticated session (e.g. /me).
 * Redirects to /login when there's no token, or when the stored
 * token turns out to be invalid/expired after checking with the API.
 * If the backend health check fails, blocks access with a service
 * unavailable message instead of hitting the API.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { account, ensureLoaded } = useAccount();
  const { isHealthy, isChecking } = useApiHealth();
  const intl = useIntl();

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  if (isChecking) {
    return <Spinner size="lg" label={intl.formatMessage({ id: "guards.checkingService" })} />;
  }

  if (!isHealthy) {
    return <ServiceUnavailable />;
  }

  const hasToken = Boolean(authStorage.getAccessToken());

  if (!hasToken) {
    return <Navigate to="/" replace />;
  }

  if (!account) {
    return <Spinner size="lg" label={intl.formatMessage({ id: "guards.checkingSession" })} />;
  }

  return <>{children}</>;
}
