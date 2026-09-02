import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import styles from "./SetPasswordPage.module.scss";
import { useSetPassword } from "../../../features/account/hooks/useSetPassword";

const MIN_PASSWORD_LENGTH = 8;

type PasswordRule = {
  id: string;
  labelId: string;
  labelValues?: Record<string, string | number>;
  test: (value: string) => boolean;
};

const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    labelId: "setPassword.rules.length",
    labelValues: { min: MIN_PASSWORD_LENGTH },
    test: (value) => value.length >= MIN_PASSWORD_LENGTH,
  },
  {
    id: "uppercase",
    labelId: "setPassword.rules.uppercase",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    labelId: "setPassword.rules.lowercase",
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: "number",
    labelId: "setPassword.rules.number",
    test: (value) => /[0-9]/.test(value),
  },
  {
    id: "symbol",
    labelId: "setPassword.rules.symbol",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

export function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const intl = useIntl();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mismatchError, setMismatchError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { submit, status, error } = useSetPassword();

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  const ruleResults = useMemo(
    () =>
      PASSWORD_RULES.map((rule) => ({
        ...rule,
        valid: rule.test(password),
      })),
    [password],
  );

  const isPasswordValid = ruleResults.every((rule) => rule.valid);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading || !token) return;

    if (!isPasswordValid) {
      setMismatchError(intl.formatMessage({ id: "setPassword.error.requirementsNotMet" }));
      return;
    }

    if (password !== confirmPassword) {
      setMismatchError(intl.formatMessage({ id: "setPassword.error.mismatch" }));
      return;
    }
    setMismatchError(null);
    submit(token, password);
  };

  if (!token) {
    return (
      <section className={styles.setPassword}>
        <div className={styles.setPassword__content}>
          <header>
            <p className={styles.setPassword__eyebrow}>
              <FormattedMessage id="setPassword.eyebrow" />
            </p>
            <h1 className={styles.setPassword__title}>
              <FormattedMessage id="setPassword.invalidLink.title" />
            </h1>
          </header>
          <p className={styles.setPassword__description}>
            <FormattedMessage id="setPassword.invalidLink.description" />
          </p>
          <Link to="/forgot" className={styles.setPassword__link}>
            <FormattedMessage id="setPassword.invalidLink.link" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.setPassword}>
      <div className={styles.setPassword__content}>
        <header>
          <p className={styles.setPassword__eyebrow}>
            <FormattedMessage id="setPassword.eyebrow" />
          </p>
          <h1 className={styles.setPassword__title}>
            <FormattedMessage id="setPassword.title" />
          </h1>
        </header>

        {isSuccess ? (
          <div className={styles.setPassword__success}>
            <p className={styles.setPassword__successTitle}>
              <FormattedMessage id="setPassword.success.title" />
            </p>
            <p className={styles.setPassword__successDescription}>
              <FormattedMessage id="setPassword.success.description" />
            </p>
            <Link to="/login" className={styles.setPassword__link}>
              <FormattedMessage id="setPassword.success.link" />
            </Link>
          </div>
        ) : (
          <form className={styles.setPassword__form} onSubmit={handleSubmit}>
            <p className={styles.setPassword__description}>
              <FormattedMessage id="setPassword.description" />
            </p>

            <div className={styles.setPassword__field}>
              <label className={styles.setPassword__label} htmlFor="password">
                <FormattedMessage id="setPassword.newPasswordLabel" />
              </label>
              <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isLoading} minLength={MIN_PASSWORD_LENGTH} required />
              <button
                type="button"
                className={styles.setPassword__toggleVisibility}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={intl.formatMessage({
                  id: showPassword ? "login.hidePasswordAriaLabel" : "login.showPasswordAriaLabel",
                })}
                tabIndex={-1}
              >
                {showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
              </button>
            </div>

            <div className={styles.setPassword__field}>
              <label className={styles.setPassword__label} htmlFor="confirmPassword">
                <FormattedMessage id="setPassword.confirmPasswordLabel" />
              </label>
              <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={isLoading} minLength={MIN_PASSWORD_LENGTH} required />
              <button
                type="button"
                className={styles.setPassword__toggleVisibility}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={intl.formatMessage({
                  id: showConfirmPassword ? "login.hidePasswordAriaLabel" : "login.showPasswordAriaLabel",
                })}
                tabIndex={-1}
              >
                {showConfirmPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
              </button>
            </div>

            <ul className={styles.setPassword__rules}>
              {ruleResults.map((rule) => (
                <li key={rule.id} className={[styles.setPassword__rule, rule.valid ? styles["setPassword__rule--valid"] : styles["setPassword__rule--pending"]].join(" ")}>
                  <i className="fa-solid fa-check"></i>
                  <span>
                    <FormattedMessage id={rule.labelId} values={rule.labelValues} />
                  </span>
                </li>
              ))}
            </ul>

            <button type="submit" className={styles.setPassword__submit} disabled={isLoading || !isPasswordValid}>
              {isLoading && <span className={styles.setPassword__spinner} aria-hidden="true" />}
              <span>
                <FormattedMessage id={isLoading ? "setPassword.submittingButton" : "setPassword.submitButton"} />
              </span>
            </button>

            {(mismatchError || (status === "error" && error)) && (
              <p className={styles.setPassword__error} role="alert">
                {mismatchError ?? error}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
