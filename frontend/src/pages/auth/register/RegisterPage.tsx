import { useState, type FormEvent } from "react";
import styles from "./RegisterPage.module.scss";
import { useRegisterAccount } from "../../../features/account/hooks/useRegisterAccount";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const { submit, status, error } = useRegisterAccount();

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    submit({ email, name, lastname });
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

            <button type="submit" className={styles.register__submit} disabled={isLoading}>
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
