import { useCallback, useState } from "react";
import { registerAccount } from "../account.api";
import type { Account, RegisterAccountPayload } from "../account.types";
import { ApiError } from "../../../lib/http/httpClient";

type Status = "idle" | "loading" | "success" | "error";

function toErrorMessageId(err: unknown): string {
  if (!(err instanceof ApiError)) return "register.error.generic";

  switch (err.code) {
    case "EMAIL_TAKEN":
      return "register.error.emailTaken";
    case "VALIDATION_ERROR":
      return "register.error.validation";
    default:
      return "register.error.tryAgain";
  }
}

export function useRegisterAccount() {
  const [status, setStatus] = useState<Status>("idle");
  const [account, setAccount] = useState<Account | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const submit = useCallback(async (payload: RegisterAccountPayload) => {
    setStatus("loading");
    setErrorId(null);

    try {
      const created = await registerAccount(payload);
      setAccount(created);
      setStatus("success");
      return created;
    } catch (err) {
      setErrorId(toErrorMessageId(err));
      setStatus("error");
      return null;
    }
  }, []);

  return { submit, status, account, errorId };
}
