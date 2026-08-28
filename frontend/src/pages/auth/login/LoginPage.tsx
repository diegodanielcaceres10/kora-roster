import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import styles from "./LoginPage.module.scss";
import { useLogin } from "../../../features/account/hooks/useLogin";
import { useGoogleAuth } from "../../../features/account/hooks/useGoogleAuth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { submit, status, error } = useLogin();
  const { submit: submitGoogle, status: googleStatus, error: googleError } = useGoogleAuth();
  const navigate = useNavigate();

  const isLoading = status === "loading" || googleStatus === "loading";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    const result = await submit({ email, password });
    if (result) {
      navigate("/");
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    const result = await submitGoogle(credential);
    if (result) {
      navigate("/");
    }
  };

  return (
    <section className={styles.login}>
      <div className={styles.login__content}>
        <header>
          <p className={styles.login__eyebrow}>Iniciar sesión</p>
          <h1 className={styles.login__title}>Entrá a tu cuenta</h1>
        </header>

        <form className={styles.login__form} onSubmit={handleSubmit}>
          <div className={styles.login__field}>
            <label className={styles.login__label} htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" placeholder="vos@email.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} required />
          </div>

          <div className={styles.login__field}>
            <label className={styles.login__label} htmlFor="password">
              Contraseña
            </label>
            <input id="password" name="password" type={showConfirmPassword ? "text" : "password"} placeholder="••••••" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isLoading} required />
            <button type="button" className={styles.login__toggleVisibility} onClick={() => setShowConfirmPassword((prev) => !prev)} aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"} tabIndex={-1}>
              {showConfirmPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
            </button>
          </div>

          <button type="submit" className={styles.login__submit} disabled={isLoading}>
            {isLoading && <span className={styles.login__spinner} aria-hidden="true" />}
            <span>{isLoading ? "Ingresando..." : "Iniciar sesión"}</span>
          </button>

          <GoogleLogin
            onSuccess={(res) => {
              if (res.credential) handleGoogleSuccess(res.credential);
            }}
            onError={() => console.error("Google login failed")}
          />

          {googleStatus === "error" && (
            <p className={styles.login__error} role="alert">
              {googleError}
            </p>
          )}

          {status === "error" && (
            <p className={styles.login__error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.login__links}>
            <Link to="/forgot" className={styles.login__link}>
              Olvidé mi contraseña
            </Link>
            <Link to="/register" className={styles.login__link}>
              Crear cuenta
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
