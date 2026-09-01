import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "./SetPasswordPage.module.scss";
import { useSetPassword } from "../../../features/account/hooks/useSetPassword";

const MIN_PASSWORD_LENGTH = 8;

type PasswordRule = {
  id: string;
  label: string;
  test: (value: string) => boolean;
};

const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`,
    test: (value) => value.length >= MIN_PASSWORD_LENGTH,
  },
  {
    id: "uppercase",
    label: "Una letra mayúscula",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "Una letra minúscula",
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "Un número",
    test: (value) => /[0-9]/.test(value),
  },
  {
    id: "symbol",
    label: "Un símbolo (!@#$%^&*...)",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

export function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

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
      setMismatchError("La contraseña no cumple con los requisitos");
      return;
    }

    if (password !== confirmPassword) {
      setMismatchError("Las contraseñas no coinciden");
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
            <p className={styles.setPassword__eyebrow}>Crear contraseña</p>
            <h1 className={styles.setPassword__title}>Link inválido</h1>
          </header>
          <p className={styles.setPassword__description}>Este link no tiene un token válido. Pedí uno nuevo desde "Olvidé mi contraseña" o revisá que copiaste la URL completa del mail.</p>
          <Link to="/forgot" className={styles.setPassword__link}>
            Ir a "Olvidé mi contraseña"
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.setPassword}>
      <div className={styles.setPassword__content}>
        <header>
          <p className={styles.setPassword__eyebrow}>Crear contraseña</p>
          <h1 className={styles.setPassword__title}>Definí tu contraseña</h1>
        </header>

        {isSuccess ? (
          <div className={styles.setPassword__success}>
            <p className={styles.setPassword__successTitle}>¡Listo!</p>
            <p className={styles.setPassword__successDescription}>Tu contraseña se guardó correctamente. Ya podés iniciar sesión.</p>
            <Link to="/login" className={styles.setPassword__link}>
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
          <form className={styles.setPassword__form} onSubmit={handleSubmit}>
            <p className={styles.setPassword__description}>Elegí una contraseña que cumpla con los siguientes requisitos.</p>

            <div className={styles.setPassword__field}>
              <label className={styles.setPassword__label} htmlFor="password">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isLoading}
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
              <button
                type="button"
                className={styles.setPassword__toggleVisibility}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                tabIndex={-1}
              >
                {showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
              </button>
            </div>

            <div className={styles.setPassword__field}>
              <label className={styles.setPassword__label} htmlFor="confirmPassword">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isLoading}
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
              <button
                type="button"
                className={styles.setPassword__toggleVisibility}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                tabIndex={-1}
              >
                {showConfirmPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
              </button>
            </div>

            <ul className={styles.setPassword__rules}>
              {ruleResults.map((rule) => (
                <li key={rule.id} className={[styles.setPassword__rule, rule.valid ? styles["setPassword__rule--valid"] : styles["setPassword__rule--pending"]].join(" ")}>
                  <i className="fa-solid fa-check"></i>
                  <span>{rule.label}</span>
                </li>
              ))}
            </ul>

            <button type="submit" className={styles.setPassword__submit} disabled={isLoading || !isPasswordValid}>
              {isLoading && <span className={styles.setPassword__spinner} aria-hidden="true" />}
              <span>{isLoading ? "Guardando..." : "Guardar contraseña"}</span>
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
