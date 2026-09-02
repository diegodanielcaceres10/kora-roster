import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import styles from "./ForgotPage.module.scss";
import { useForgotPassword } from "../../../features/account/hooks/useForgotPassword";

export function ForgotPage() {
  const [email, setEmail] = useState("");
  const { submit, status, error } = useForgotPassword();
  const intl = useIntl();

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    submit({ email });
  };

  return (
    <section className={styles.forgot}>
      <div className={styles.forgot__content}>
        <header>
          <p className={styles.forgot__eyebrow}>
            <FormattedMessage id="forgot.eyebrow" />
          </p>
          <h1 className={styles.forgot__title}>
            <FormattedMessage id="login.forgotPasswordLink" />
          </h1>
        </header>

        {isSuccess ? (
          <div className={styles.forgot__success}>
            <p className={styles.forgot__successTitle}>
              <FormattedMessage id="forgot.success.title" />
            </p>
            <p className={styles.forgot__successDescription}>
              <FormattedMessage id="forgot.success.description" />
            </p>
          </div>
        ) : (
          <form className={styles.forgot__form} onSubmit={handleSubmit}>
            <p className={styles.forgot__description}>
              <FormattedMessage id="forgot.description" />
            </p>

            <div className={styles.forgot__field}>
              <label className={styles.forgot__label} htmlFor="email">
                <FormattedMessage id="login.emailLabel" />
              </label>
              <input id="email" name="email" type="email" placeholder={intl.formatMessage({ id: "login.emailPlaceholder" })} value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} required />
            </div>

            <button type="submit" className={styles.forgot__submit} disabled={isLoading}>
              {isLoading && <span className={styles.forgot__spinner} aria-hidden="true" />}
              <span>
                <FormattedMessage id={isLoading ? "forgot.submittingButton" : "forgot.submitButton"} />
              </span>
            </button>

            {status === "error" && (
              <p className={styles.forgot__error} role="alert">
                {error}
              </p>
            )}
          </form>
        )}

        <Link to="/login" className={styles.forgot__link}>
          <FormattedMessage id="forgot.backToLoginLink" />
        </Link>
      </div>
    </section>
  );
}
