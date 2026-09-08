import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { decodeJwtPayload } from "../../../lib/auth/jwt";
import styles from "./GoogleAuthButton.module.scss";

export interface GoogleProfile {
  idToken: string;
  email: string;
  name: string;
  lastname: string;
}

interface GoogleAuthButtonProps {
  mode: "login" | "register";
  text?: "signin_with" | "signup_with" | "continue_with";
  redirectTo?: string;
  // Requerido cuando mode="register": en vez de loguear/crear directo, se le
  // pasa el perfil decodificado del idToken para que la página lo use como
  // prefill y decida cuándo mandar la cuenta al backend (después de que el
  // usuario tilde los términos).
  onRegisterProfile?: (profile: GoogleProfile) => void;
}

interface GoogleIdTokenClaims {
  email?: string;
  given_name?: string;
  family_name?: string;
}

export function GoogleAuthButton({ mode, text = "continue_with", redirectTo = "/", onRegisterProfile }: GoogleAuthButtonProps) {
  const { submit, status, errorId } = useGoogleAuth();
  const navigate = useNavigate();

  const isLoading = status === "loading";

  const handleCredential = async (credential: string) => {
    if (mode === "register") {
      const claims = decodeJwtPayload<GoogleIdTokenClaims>(credential);
      onRegisterProfile?.({
        idToken: credential,
        email: claims?.email ?? "",
        name: claims?.given_name ?? "",
        lastname: claims?.family_name ?? "",
      });
      return;
    }

    const result = await submit(credential);
    if (result) navigate(redirectTo);
  };

  return (
    <div className={styles.google}>
      <div className={styles.google__auth}>
        <GoogleLogin
          onSuccess={(res) => {
            if (res.credential) handleCredential(res.credential);
          }}
          onError={() => console.error("Google login failed")}
          text={text}
        />
        {status === "error" && errorId && (
          <p className={styles.google__error} role="alert">
            <FormattedMessage id={errorId} />
          </p>
        )}
      </div>
      {isLoading ? (
        <span className={styles.google__spinner} aria-hidden="true" />
      ) : (
        <div className={styles.google__name}>
          <i className="fa-brands fa-google"></i>
          <span>
            <FormattedMessage id="googleAuth.buttonLabel" />
          </span>
        </div>
      )}
    </div>
  );
}
