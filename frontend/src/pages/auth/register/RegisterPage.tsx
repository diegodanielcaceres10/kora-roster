import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import styles from "./RegisterPage.module.scss";
import { useRegisterAccount } from "../../../features/account/hooks/useRegisterAccount";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);
  const { submit, status, error } = useRegisterAccount();

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading || !acceptedTerms) return;
    submit({ email, name, lastname, acceptedTerms, acceptedMarketing });
  };

  return (
    <section className={styles.register}>
      <div className={styles.register__content}>
        <header>
          <p className={styles.register__eyebrow}>Crear cuenta</p>
          <h1 className={styles.register__title}>Registrate en Kora</h1>
        </header>

        {isSuccess ? (
          <div className={styles.register__success}>
            <p className={styles.register__successTitle}>¡Cuenta creada!</p>
            <p className={styles.register__successDescription}>Te enviamos un email a {email} para que crees tu contraseña y termines de activar la cuenta.</p>
          </div>
        ) : (
          <form className={styles.register__form} onSubmit={handleSubmit}>
            <div className={styles.register__field}>
              <label className={styles.register__label} htmlFor="name">
                Nombre
              </label>
              <input id="name" name="name" type="text" placeholder="Diego" value={name} onChange={(event) => setName(event.target.value)} disabled={isLoading} required />
            </div>

            <div className={styles.register__field}>
              <label className={styles.register__label} htmlFor="lastname">
                Apellido
              </label>
              <input id="lastname" name="lastname" type="text" placeholder="Caceres" value={lastname} onChange={(event) => setLastname(event.target.value)} disabled={isLoading} required />
            </div>

            <div className={styles.register__field}>
              <label className={styles.register__label} htmlFor="email">
                Email
              </label>
              <input id="email" name="email" type="email" placeholder="vos@email.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} required />
            </div>

            <div className={styles.register__checkboxes}>
              <label className={styles.register__checkboxField}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  disabled={isLoading}
                  required
                />
                <span>
                  Leí y acepto los{" "}
                  <Link to="/terms" target="_blank" rel="noreferrer" className={styles.register__inlineLink}>
                    Términos y Condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link to="/privacy" target="_blank" rel="noreferrer" className={styles.register__inlineLink}>
                    Política de Privacidad
                  </Link>
                  .
                </span>
              </label>

              <label className={styles.register__checkboxField}>
                <input type="checkbox" checked={acceptedMarketing} onChange={(event) => setAcceptedMarketing(event.target.checked)} disabled={isLoading} />
                <span>Quiero recibir novedades y comunicaciones de marketing de Kora por email (opcional).</span>
              </label>
            </div>

            <button type="submit" className={styles.register__submit} disabled={isLoading || !acceptedTerms}>
              {isLoading && <span className={styles.register__spinner} aria-hidden="true" />}
              <span>{isLoading ? "Creando cuenta..." : "Crear cuenta"}</span>
            </button>

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

