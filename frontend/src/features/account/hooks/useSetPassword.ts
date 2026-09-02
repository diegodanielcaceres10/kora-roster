import { useCallback, useState } from "react";
import { setPassword } from "../account.api";
import { ApiError } from "../../../lib/http/httpClient";

type Status = "idle" | "loading" | "success" | "error";

function toErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return "No se pudo actualizar la contraseña";

  switch (err.code) {
    case "TOKEN_EXPIRED":
      return "El link venció. Pedí uno nuevo desde 'Olvidé mi contraseña'";
    case "TOKEN_ALREADY_USED":
      return "Este link ya fue usado. Pedí uno nuevo si lo necesitás";
    case "INVALID_TOKEN":
      return "El link no es válido. Pedí uno nuevo desde 'Olvidé mi contraseña'";
    case "VALIDATION_ERROR":
      return "Revisá la contraseña ingresada";
    default:
      return "No se pudo actualizar la contraseña, intentá de nuevo";
  }
}

export function useSetPassword() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (token: string, password: string) => {
    setStatus("loading");
    setError(null);

    try {
      await setPassword({ token, password });
      setStatus("success");
      return true;
    } catch (err) {
      setError(toErrorMessage(err));
      setStatus("error");
      return false;
    }
  }, []);

  return { submit, status, error };
}
