import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MePage.module.scss";
import { useAccount } from "../../features/account/AccountContext";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  PENDING: "Pendiente",
};

export function MePage() {
  const { account, isLoading, ensureLoaded, logout } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading && !account) {
    return (
      <section className={styles.me}>
        <p className={styles.me__status}>Cargando datos...</p>
      </section>
    );
  }

  if (!account) {
    return (
      <section className={styles.me}>
        <p className={styles.me__status}>No pudimos cargar tu cuenta. Iniciá sesión nuevamente.</p>
      </section>
    );
  }

  const createdAt = new Date(account.createdAt).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className={styles.me}>
      <div className={styles.me__container}>
        <header>
          <p className={styles.me__eyebrow}>Mi cuenta</p>
          <h1 className={styles.me__title}>
            {account.name} {account.lastname}
          </h1>
        </header>

        <dl className={styles.me__details}>
          <div className={styles.me__row}>
            <dt>Email</dt>
            <dd>{account.email}</dd>
          </div>

          <div className={styles.me__row}>
            <dt>Teléfono</dt>
            <dd>{account.phone || ""}</dd>
          </div>

          <div className={styles.me__row}>
            <dt>Estado</dt>
            <dd>{STATUS_LABEL[account.status] ?? account.status}</dd>
          </div>

          <div className={styles.me__row}>
            <dt>Miembro desde</dt>
            <dd>{createdAt}</dd>
          </div>
        </dl>

        <button type="button" className={styles.me__logout} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </section>
  );
}
