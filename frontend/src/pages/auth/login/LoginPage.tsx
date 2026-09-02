import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import styles from "./LoginPage.module.scss";
import { useLogin } from "../../../features/account/hooks/useLogin";
import { useGoogleAuth } from "../../../features/account/hooks/useGoogleAuth";
import { GoogleAuthButton } from "../../../features/account/components/GoogleAuthButton";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { submit, status, errorId } = useLogin();
  const { status: googleStatus } = useGoogleAuth();
  const navigate = useNavigate();
  const intl = useIntl();

  const isLoading = status === "loading" || googleStatus === "loading";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    const result = await submit({ email, password });
    if (result) {
      navigate("/");
    }
  };

  return (
    <section className={styles.login}>
      <div className={styles.login__content}>
        <header>
          <p className={styles.login__eyebrow}>
            <FormattedMessage id="login.eyebrow" />
          </p>
          <h1 className={styles.login__title}>
            <FormattedMessage id="login.title" />
          </h1>
        </header>

        <form className={styles.login__form} onSubmit={handleSubmit}>
          <div className={styles.login__field}>
            <label className={styles.login__label} htmlFor="email">
              <FormattedMessage id="login.emailLabel" />
            </label>
            <input id="email" name="email" type="email" placeholder={intl.formatMessage({ id: "login.emailPlaceholder" })} value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} required />
          </div>

          <div className={styles.login__field}>
            <label className={styles.login__label} htmlFor="password">
              <FormattedMessage id="login.passwordLabel" />
            </label>
            <input id="password" name="password" type={showConfirmPassword ? "text" : "password"} placeholder="••••••" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isLoading} required />
            <button
              type="button"
              className={styles.login__toggleVisibility}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={intl.formatMessage({
                id: showConfirmPassword ? "login.hidePasswordAriaLabel" : "login.showPasswordAriaLabel",
              })}
              tabIndex={-1}
            >
              {showConfirmPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
            </button>
          </div>

          <button type="submit" className={styles.login__submit} disabled={isLoading}>
            {isLoading && <span className={styles.login__spinner} aria-hidden="true" />}
            <span>
              <FormattedMessage id={isLoading ? "login.submittingButton" : "login.submitButton"} />
            </span>
          </button>

          <GoogleAuthButton text="continue_with" redirectTo="/" />

          {status === "error" && errorId && (
            <p className={styles.login__error} role="alert">
              <FormattedMessage id={errorId} />
            </p>
          )}

          <div className={styles.login__links}>
            <Link to="/forgot" className={styles.login__link}>
              <FormattedMessage id="login.forgotPasswordLink" />
            </Link>
            <Link to="/register" className={styles.login__link}>
              <FormattedMessage id="login.createAccountLink" />
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
