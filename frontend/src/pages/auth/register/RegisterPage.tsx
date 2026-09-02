import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import styles from "./RegisterPage.module.scss";
import { useRegisterAccount } from "../../../features/account/hooks/useRegisterAccount";
import { useGoogleAuth } from "../../../features/account/hooks/useGoogleAuth";
import { GoogleAuthButton } from "../../../features/account/components/GoogleAuthButton";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [marketingConsent, setmarketingConsent] = useState(false);
  const { submit, status, error } = useRegisterAccount();
  const { status: googleStatus } = useGoogleAuth();
  const intl = useIntl();

  const isLoading = status === "loading" || googleStatus === "loading";
  const isSuccess = status === "success" || googleStatus === "success";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    if (isLoading || !acceptedTerms) return;
    submit({ email, name, lastname, acceptedTerms, marketingConsent });
  };

  return (
    <section className={styles.register}>
      <div className={styles.register__content}>
        <header>
          <p className={styles.register__eyebrow}>
            <FormattedMessage id="login.createAccountLink" />
          </p>
          <h1 className={styles.register__title}>
            <FormattedMessage id="register.title" />
          </h1>
        </header>

        {isSuccess ? (
          <div className={styles.register__success}>
            <p className={styles.register__successTitle}>
              <FormattedMessage id="register.success.title" />
            </p>
            <p className={styles.register__successDescription}>{googleStatus === "success" ? <FormattedMessage id="register.success.google" /> : <FormattedMessage id="register.success.email" values={{ email }} />}</p>
          </div>
        ) : (
          <form className={styles.register__form} onSubmit={handleSubmit}>
            <div className={styles.register__field}>
              <label className={styles.register__label} htmlFor="name">
                <FormattedMessage id="register.nameLabel" />
              </label>
              <input id="name" name="name" type="text" placeholder="Diego" value={name} onChange={(event) => setName(event.target.value)} disabled={isLoading} required />
            </div>

            <div className={styles.register__field}>
              <label className={styles.register__label} htmlFor="lastname">
                <FormattedMessage id="register.lastnameLabel" />
              </label>
              <input id="lastname" name="lastname" type="text" placeholder="Caceres" value={lastname} onChange={(event) => setLastname(event.target.value)} disabled={isLoading} required />
            </div>

            <div className={styles.register__field}>
              <label className={styles.register__label} htmlFor="email">
                <FormattedMessage id="register.emailLabel" />
              </label>
              <input id="email" name="email" type="email" placeholder={intl.formatMessage({ id: "register.emailPlaceholder" })} value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} required />
            </div>

            <div className={styles.register__checkboxes}>
              <label className={styles.register__checkboxField}>
                <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} disabled={isLoading} required />
                <span>
                  <FormattedMessage
                    id="register.termsCheckbox"
                    values={{
                      terms: (chunks: React.ReactNode) => (
                        <Link to="/terms" target="_blank" rel="noreferrer" className={styles.register__inlineLink}>
                          {chunks}
                        </Link>
                      ),
                      privacy: (chunks: React.ReactNode) => (
                        <Link to="/privacy" target="_blank" rel="noreferrer" className={styles.register__inlineLink}>
                          {chunks}
                        </Link>
                      ),
                    }}
                  />
                </span>
              </label>

              <label className={styles.register__checkboxField}>
                <input type="checkbox" checked={marketingConsent} onChange={(event) => setmarketingConsent(event.target.checked)} disabled={isLoading} />
                <span>
                  <FormattedMessage id="register.marketingCheckbox" />
                </span>
              </label>
            </div>

            <button type="submit" className={styles.register__submit} disabled={isLoading || !acceptedTerms}>
              {isLoading && <span className={styles.register__spinner} aria-hidden="true" />}
              <span>
                <FormattedMessage id={isLoading ? "register.submittingButton" : "register.submitButton"} />
              </span>
            </button>

            <GoogleAuthButton text="continue_with" redirectTo="/" />

            {status === "error" && (
              <p className={styles.register__error} role="alert">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
