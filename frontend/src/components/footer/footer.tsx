import { Link } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import styles from "./footer.module.scss";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <small>
        <FormattedMessage id="footer.copyright" />
      </small>
      <nav className={styles.footer__links}>
        <Link to="/terms">
          <FormattedMessage id="footer.links.terms" />
        </Link>
        <Link to="/privacy">
          <FormattedMessage id="footer.links.privacy" />
        </Link>
      </nav>
    </footer>
  );
}
