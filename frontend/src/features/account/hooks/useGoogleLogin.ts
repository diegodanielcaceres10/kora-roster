import { useCallback, useState } from "react";
import { googleLogin } from "../account.api";
import { ApiError } from "../../../lib/http/httpClient";
import { authStorage } from "../../../lib/auth/authStorage";
import { useAccount } from "../AccountContext";
import type { GoogleAccountNotFoundProfile } from "../account.types";

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

function extractNotFoundProfile(err: unknown): GoogleAccountNotFoundProfile | null {
  if (!(err instanceof ApiError) || err.code !== "GOOGLE_ACCOUNT_NOT_FOUND") return null;
  const body = err.body as { errors?: { googleProfile?: GoogleAccountNotFoundProfile } } | undefined;
  return body?.errors?.googleProfile ?? null;
}

export function useGoogleLogin() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorId, setErrorId] = useState<string | null>(null);
  const [accountNotFound, setAccountNotFound] = useState<GoogleAccountNotFoundProfile | null>(null);
  const { setAccount } = useAccount();

  const submit = useCallback(
    async (idToken: string) => {
      setStatus("loading");
      setErrorId(null);
      setAccountNotFound(null);

      try {
        const result = await googleLogin({ idToken });
        authStorage.setTokens(result.accessToken, result.refreshToken);
        setAccount(result.user);
        setStatus("success");
        return result;
      } catch (err) {
        const notFoundProfile = extractNotFoundProfile(err);
        if (notFoundProfile) {
          setAccountNotFound(notFoundProfile);
          setStatus("idle");
          return null;
        }
        setErrorId(toErrorMessageId(err));
        setStatus("error");
        return null;
      }
    },
    [setAccount],
  );

  return { submit, status, errorId, accountNotFound };
}
