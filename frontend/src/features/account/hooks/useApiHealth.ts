import { useEffect, useState } from "react";
import { checkApiHealth } from "../account.api";

const VITE_ALLOW_API = import.meta.env.VITE_ALLOW_API;
const FRONTEND_ENV = import.meta.env.VITE_ENV;

export function useApiHealth() {
  const [isHealthy, setIsHealthy] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        if (!VITE_ALLOW_API) {
          console.log("API health check skipped because VITE_ALLOW_API is false");
          return;
        }
        const health = await checkApiHealth();
        const healthy = health.status === "ok" && health.env === FRONTEND_ENV;
        if (!cancelled) setIsHealthy(healthy);
      } catch {
        if (!cancelled) setIsHealthy(false);
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, []);

  return { isHealthy, isChecking };
}
