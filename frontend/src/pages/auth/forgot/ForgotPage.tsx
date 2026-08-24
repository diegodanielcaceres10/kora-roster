import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import styles from "./ForgotPage.module.scss";
import { useForgotPassword } from "../../../features/account/hooks/useForgotPassword";

export function ForgotPage() {
  const [email, setEmail] = useState("");
  const { submit, status, error } = useForgotPassword();

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
          <p className={styles.forgot__eyebrow}>Recuperar acceso</p>
          <h1 className={styles.forgot__title}>Olvidé mi contraseña</h1>
        </header>

        {isSuccess ? (
          <div className={styles.forgot__success}>
            <p className={styles.forgot__successTitle}>Listo</p>
            <p className={styles.forgot__successDescription}>Si el email existe en Kora, te va a llegar un correo con los pasos para restablecer tu contraseña.</p>
          </div>
        ) : (
          <form className={styles.forgot__form} onSubmit={handleSubmit}>
            <p className={styles.forgot__description}>Ingresá el email de tu cuenta y te enviamos un link para crear una nueva contraseña.</p>

            <div className={styles.forgot__field}>
              <label className={styles.forgot__label} htmlFor="email">
                Email
              </label>
              <input id="email" name="email" type="email" placeholder="vos@email.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} required />
            </div>

            <button type="submit" className={styles.forgot__submit} disabled={isLoading}>
              {isLoading && <span className={styles.forgot__spinner} aria-hidden="true" />}
              <span>{isLoading ? "Enviando..." : "Enviar instrucciones"}</span>
            </button>

            {status === "error" && (
              <p className={styles.forgot__error} role="alert">
                {error}
              </p>
            )}
          </form>
        )}

        <Link to="/login" className={styles.forgot__link}>
          Volver a iniciar sesión
        </Link>
      </div>
    </section>
  );
}
