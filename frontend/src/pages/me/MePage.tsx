import { useNavigate } from "react-router-dom";
import styles from "./MePage.module.scss";
import { useAccount } from "../../features/account/AccountContext";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  PENDING: "Pendiente",
};

export function MePage() {
  // RequireAuth already guarantees `account` is loaded and valid before
  // this component renders, so there's no need to re-validate the session
  // here or handle a loading/missing-account state.
  const { account, logout } = useAccount();
  const navigate = useNavigate();

  if (!account) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
