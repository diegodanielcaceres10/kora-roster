import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import styles from "./RegisterPage.module.scss";
import { useRegisterAccount } from "../../../features/account/hooks/useRegisterAccount";
import { useGoogleRegister } from "../../../features/account/hooks/useGoogleRegister";
import { GoogleAuthButton, type GoogleProfile } from "../../../features/account/components/GoogleAuthButton";
import { Button } from "../../../shared/components/Button/Button";

interface RegisterLocationState {
  googleProfile?: GoogleProfile;
}

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [marketingConsent, setmarketingConsent] = useState(false);
  const [googleProfile, setGoogleProfile] = useState<GoogleProfile | null>(null);
  const { submit, status, errorId } = useRegisterAccount();
  const { submit: submitGoogle, status: googleStatus, errorId: googleErrorId } = useGoogleRegister();
  const intl = useIntl();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as RegisterLocationState | null;
    if (state?.googleProfile) {
      const { idToken, email: profileEmail, name: profileName, lastname: profileLastname } = state.googleProfile;
      setGoogleProfile({ idToken, email: profileEmail, name: profileName, lastname: profileLastname });
      setEmail(profileEmail);
      setName(profileName);
      setLastname(profileLastname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = status === "loading" || googleStatus === "loading";
  const isSuccess = status === "success" || googleStatus === "success";

  const handleGoogleProfile = (profile: GoogleProfile) => {
    setGoogleProfile(profile);
    setEmail(profile.email);
    setName(profile.name);
    setLastname(profile.lastname);
  };

  const handleCancelGoogle = () => {
    setGoogleProfile(null);
    setEmail("");
    setName("");
    setLastname("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading || !acceptedTerms) return;

    if (googleProfile) {
      submitGoogle({ idToken: googleProfile.idToken, email, name, lastname, acceptedTerms, marketingConsent });
      return;
    }

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
              <input id="name" name="name" type="text" placeholder="Diego" value={name} onChange={(event) => setName(event.target.value)} disabled={isLoading || !!googleProfile} required />
            </div>

            <div className={styles.register__field}>
              <label className={styles.register__label} htmlFor="lastname">
                <FormattedMessage id="register.lastnameLabel" />
              </label>
              <input id="lastname" name="lastname" type="text" placeholder="Caceres" value={lastname} onChange={(event) => setLastname(event.target.value)} disabled={isLoading || !!googleProfile} required />
            </div>

            <div className={styles.register__field}>
              <label className={styles.register__label} htmlFor="email">
                <FormattedMessage id="register.emailLabel" />
              </label>
              <input id="email" name="email" type="email" placeholder={intl.formatMessage({ id: "register.emailPlaceholder" })} value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading || !!googleProfile} required />
            </div>

            {googleProfile && (
              <Button type="button" className={styles.register__inlineLink} onClick={handleCancelGoogle} disabled={isLoading}>
                <FormattedMessage id="register.googleCancel" />
              </Button>
            )}

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

            <Button type="submit" className={styles.register__submit} disabled={isLoading || !acceptedTerms}>
              {isLoading && <span className={styles.register__spinner} aria-hidden="true" />}
              <span>
                <FormattedMessage id={isLoading ? "register.submittingButton" : "register.submitButton"} />
              </span>
            </Button>

            {!googleProfile && <GoogleAuthButton mode="register" text="continue_with" onRegisterProfile={handleGoogleProfile} />}

            {(status === "error" && errorId) || (googleStatus === "error" && googleErrorId) ? (
              <p className={styles.register__error} role="alert">
                <FormattedMessage id={errorId ?? googleErrorId ?? ""} />
              </p>
            ) : null}
          </form>
        )}
      </div>
    </section>
  );
}
