import { Link } from "react-router-dom";
import styles from "./footer.module.scss";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <small>© 2026 Kora • Diego Daniel Caceres</small>
      <nav className={styles.footer__links}>
        <Link to="/terms">Términos y Condiciones</Link>
        <Link to="/privacy">Política de Privacidad</Link>
      </nav>
    </footer>
  );
}
