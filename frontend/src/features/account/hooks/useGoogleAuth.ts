import { useCallback, useState } from "react";
import { googleAuth } from "../account.api";
import { ApiError } from "../../../lib/http/httpClient";
import { authStorage } from "../../../lib/auth/authStorage";
import { useAccount } from "../AccountContext";

type Status = "idle" | "loading" | "success" | "error";

function toErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return "No se pudo iniciar sesión con Google";

  switch (err.code) {
    case "INVALID_GOOGLE_TOKEN":
      return "No pudimos validar tu cuenta de Google, intentá de nuevo";
    case "ACCOUNT_NOT_ACTIVE":
      return "Tu cuenta no está activa";
    default:
      return "No se pudo iniciar sesión con Google, intentá de nuevo";
  }
}

export function useGoogleAuth() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const { setAccount } = useAccount();

  const submit = useCallback(
    async (idToken: string) => {
      setStatus("loading");
      setError(null);

      try {
        const result = await googleAuth({ idToken });
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
