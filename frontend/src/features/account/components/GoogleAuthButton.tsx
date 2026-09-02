import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import styles from "./GoogleAuthButton.module.scss";

interface GoogleAuthButtonProps {
  text?: "signin_with" | "signup_with" | "continue_with";
  redirectTo?: string;
}

export function GoogleAuthButton({ text = "continue_with", redirectTo = "/" }: GoogleAuthButtonProps) {
  const { submit, status, error } = useGoogleAuth();
  const navigate = useNavigate();

  const isLoading = status === "loading";

  const handleSuccess = async (credential: string) => {
    const result = await submit(credential);
    if (result) {
      navigate(redirectTo);
    }
  };

  return (
    <div className={styles.google}>
      <div className={styles.google__auth}>
        <GoogleLogin
          onSuccess={(res) => {
            if (res.credential) handleSuccess(res.credential);
          }}
          onError={() => console.error("Google login failed")}
          text={text}
        />
        {status === "error" && (
          <p className={styles.google__error} role="alert">
            {error}
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
