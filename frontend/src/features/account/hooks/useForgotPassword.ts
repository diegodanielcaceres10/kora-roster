import { useCallback, useState } from "react";
import { forgotPassword } from "../account.api";
import type { ForgotPasswordPayload } from "../account.types";
import { ApiError } from "../../../lib/http/httpClient";

type Status = "idle" | "loading" | "success" | "error";

function toErrorMessageId(err: unknown): string {
  if (!(err instanceof ApiError)) return "forgot.error.generic";

  switch (err.code) {
    case "VALIDATION_ERROR":
      return "forgot.error.invalidEmail";
    default:
      return "forgot.error.tryAgain";
  }
}

export function useForgotPassword() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorId, setErrorId] = useState<string | null>(null);

  const submit = useCallback(async (payload: ForgotPasswordPayload) => {
    setStatus("loading");
    setErrorId(null);

    try {
      await forgotPassword(payload);
      setStatus("success");
      return true;
    } catch (err) {
      setErrorId(toErrorMessageId(err));
      setStatus("error");
      return false;
    }
  }, []);

  return { submit, status, errorId };
}
