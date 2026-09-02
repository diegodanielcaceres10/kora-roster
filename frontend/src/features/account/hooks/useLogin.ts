import { useCallback, useState } from "react";
import { loginAccount } from "../account.api";
import type { LoginPayload, LoginResponse } from "../account.types";
import { ApiError } from "../../../lib/http/httpClient";
import { authStorage } from "../../../lib/auth/authStorage";
import { useAccount } from "../AccountContext";

type Status = "idle" | "loading" | "success" | "error";

function toErrorMessageId(err: unknown): string {
  if (!(err instanceof ApiError)) return "login.error.generic";

  switch (err.code) {
    case "INVALID_CREDENTIALS":
      return "login.error.invalidCredentials";
    case "ACCOUNT_NOT_ACTIVE":
      return "login.error.accountNotActive";
    case "VALIDATION_ERROR":
      return "login.error.validation";
    default:
      return "login.error.tryAgain";
  }
}

export function useLogin() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorId, setErrorId] = useState<string | null>(null);
  const { setAccount } = useAccount();

  const submit = useCallback(
    async (payload: LoginPayload) => {
      setStatus("loading");
      setErrorId(null);

      try {
        const result = await loginAccount(payload);
        authStorage.setTokens(result.accessToken, result.refreshToken);
        setAccount(result.user);
        setStatus("success");
        return result;
      } catch (err) {
        setErrorId(toErrorMessageId(err));
        setStatus("error");
        return null;
      }
    },
    [setAccount],
  );

  return { submit, status, errorId };
}

export type { LoginResponse };
