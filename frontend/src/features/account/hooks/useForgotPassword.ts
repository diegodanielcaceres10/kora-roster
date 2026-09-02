import { useCallback, useState } from "react";
import { forgotPassword } from "../account.api";
import type { ForgotPasswordPayload } from "../account.types";
import { ApiError } from "../../../lib/http/httpClient";

type Status = "idle" | "loading" | "success" | "error";

function toErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return "No se pudo procesar la solicitud";

  switch (err.code) {
    case "VALIDATION_ERROR":
      return "Ingresá un email válido";
    default:
      return "No se pudo procesar la solicitud, intentá de nuevo";
  }
}

export function useForgotPassword() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (payload: ForgotPasswordPayload) => {
    setStatus("loading");
    setError(null);

    try {
      await forgotPassword(payload);
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
