import { useCallback, useState } from "react";
import { googleLogin } from "../account.api";
import { ApiError } from "../../../lib/http/httpClient";
import { authStorage } from "../../../lib/auth/authStorage";
import { useAccount } from "../AccountContext";
import type { GoogleAuthResponse } from "../account.types";

type Status = "idle" | "loading" | "success" | "error";

type GoogleLoginResult = { status: "success"; data: GoogleAuthResponse } | { status: "not_found" } | { status: "error" };

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

export function useGoogleLogin() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorId, setErrorId] = useState<string | null>(null);
  const { setAccount } = useAccount();

  const submit = useCallback(
    async (idToken: string): Promise<GoogleLoginResult> => {
      setStatus("loading");
      setErrorId(null);

      try {
        const result = await googleLogin({ idToken });
        authStorage.setTokens(result.accessToken, result.refreshToken);
        setAccount(result.user);
        setStatus("success");
        return { status: "success", data: result };
      } catch (err) {
        if (err instanceof ApiError && err.code === "GOOGLE_ACCOUNT_NOT_FOUND") {
          setStatus("idle");
          return { status: "not_found" };
        }
        setErrorId(toErrorMessageId(err));
        setStatus("error");
        return { status: "error" };
      }
    },
    [setAccount],
  );

  return { submit, status, errorId };
}
