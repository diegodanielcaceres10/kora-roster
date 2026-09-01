import { useCallback, useState } from "react";
import { loginAccount } from "../account.api";
import type { LoginPayload, LoginResponse } from "../account.types";
import { ApiError } from "../../../lib/http/httpClient";
import { authStorage } from "../../../lib/auth/authStorage";
import { useAccount } from "../AccountContext";

type Status = "idle" | "loading" | "success" | "error";

function toErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return "No se pudo iniciar sesión";

  switch (err.code) {
    case "INVALID_CREDENTIALS":
      return "Email o contraseña incorrectos";
    case "ACCOUNT_NOT_ACTIVE":
      return "Tu cuenta todavía no está activada. Revisá tu email para crear la contraseña";
    case "VALIDATION_ERROR":
      return "Revisá los datos ingresados";
    default:
      return "No se pudo iniciar sesión, intentá de nuevo";
  }
}

export function useLogin() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const { setAccount } = useAccount();

  const submit = useCallback(
    async (payload: LoginPayload) => {
      setStatus("loading");
      setError(null);

      try {
        const result = await loginAccount(payload);
        authStorage.setTokens(result.accessToken, result.refreshToken);
        setAccount(result.user);
        setStatus("success");
        return result;
      } catch (err) {
        setError(toErrorMessage(err));
        setStatus("error");
        return null;
      }
    },
    [setAccount],
  );

  return { submit, status, error };
}

export type { LoginResponse };
