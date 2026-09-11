import { useCallback, useState } from "react";
import { googleRegister } from "../google.api";
import { ApiError } from "../../../../lib/http/httpClient";
import { authStorage } from "../../../../lib/auth/authStorage";
import { useAccount } from "../../../account/AccountContext";
import type { GoogleRegisterPayload } from "../google.types";

type Status = "idle" | "loading" | "success" | "error";

function toErrorMessageId(err: unknown): string {
  if (!(err instanceof ApiError)) return "googleAuth.error.generic";

  switch (err.code) {
    case "EMAIL_TAKEN":
      return "register.error.emailTaken";
    case "INVALID_GOOGLE_TOKEN":
      return "googleAuth.error.invalidToken";
    default:
      return "googleAuth.error.tryAgain";
  }
}

export function useGoogleRegister() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorId, setErrorId] = useState<string | null>(null);
  const { setAccount } = useAccount();

  const submit = useCallback(
    async (payload: GoogleRegisterPayload) => {
      setStatus("loading");
      setErrorId(null);

      try {
        const result = await googleRegister(payload);
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