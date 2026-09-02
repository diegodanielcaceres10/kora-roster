import { useCallback, useState } from "react";
import { setPassword } from "../account.api";
import { ApiError } from "../../../lib/http/httpClient";

type Status = "idle" | "loading" | "success" | "error";

function toErrorMessageId(err: unknown): string {
  if (!(err instanceof ApiError)) return "setPassword.error.generic";

  switch (err.code) {
    case "TOKEN_EXPIRED":
      return "setPassword.error.tokenExpired";
    case "TOKEN_ALREADY_USED":
      return "setPassword.error.tokenAlreadyUsed";
    case "INVALID_TOKEN":
      return "setPassword.error.invalidToken";
    case "VALIDATION_ERROR":
      return "setPassword.error.validation";
    default:
      return "setPassword.error.tryAgain";
  }
}

export function useSetPassword() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorId, setErrorId] = useState<string | null>(null);

  const submit = useCallback(async (token: string, password: string) => {
    setStatus("loading");
    setErrorId(null);

    try {
      await setPassword({ token, password });
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
