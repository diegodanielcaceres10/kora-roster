import { useCallback, useState } from "react";
import { googleAuth } from "../account.api";
import { ApiError } from "../../../lib/http/httpClient";
import { authStorage } from "../../../lib/auth/authStorage";
import { useAccount } from "../AccountContext";

type Status = "idle" | "loading" | "success" | "error";

function toErrorMessageId(err: unknown): string {
  if (!(err instanceof ApiError)) return "googleAuth.error.generic";

  switch (err.code) {
    case "INVALID_GOOGLE_TOKEN":
      return "googleAuth.error.invalidToken";
    case "ACCOUNT_NOT_ACTIVE":
      return "googleAuth.error.accountNotActive";
    default:
      return "googleAuth.error.tryAgain";
  }
}

export function useGoogleAuth() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorId, setErrorId] = useState<string | null>(null);
  const { setAccount } = useAccount();

  const submit = useCallback(
    async (idToken: string) => {
      setStatus("loading");
      setErrorId(null);

      try {
        const result = await googleAuth({ idToken });
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
