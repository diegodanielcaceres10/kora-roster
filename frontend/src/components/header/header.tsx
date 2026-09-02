import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import styles from "./header.module.scss";
import kRosterLogo from "/favicon.png";
import { useAccount } from "../../features/account/AccountContext";
import { useApiHealth } from "../../features/account/hooks/useApiHealth";
import { LanguageSwitcher } from "../language-switcher/language-switcher";

const NAV_LINKS = [
  { id: "header.nav.home", to: "/" },
  { id: "header.nav.tutorial", to: "/tutorial" },
  { id: "header.nav.faq", to: "/faq" },
  { id: "header.nav.about", to: "/about" },
] as const;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { account, ensureLoaded } = useAccount();
  const { isHealthy } = useApiHealth();
  const intl = useIntl();

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  return (
    <header className={styles.nav}>
      <div className={styles.nav__content}>
        <div className={styles.nav__menu}>
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? intl.formatMessage({ id: "header.menu.close" }) : intl.formatMessage({ id: "header.menu.open" })}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-bars-staggered"></i>}
          </button>
          <div className={styles.nav__logo}>
            <img src={kRosterLogo} alt="" />
          </div>
        </div>

        <nav className={[styles.nav__links, isMenuOpen ? styles["nav__links--open"] : ""].join(" ")}>
          {NAV_LINKS.map(({ id, to }) => (
            <Link key={id} to={to} className={[styles.nav__link, pathname === to ? styles["nav__link--active"] : ""].join(" ")} onClick={() => setIsMenuOpen(false)}>
              <FormattedMessage id={id} />
            </Link>
          ))}
        </nav>

        <LanguageSwitcher />

        {isHealthy &&
          (account ? (
            <Link key="Perfil" to="/me" className={styles.nav__user}>
              <i className="fa-regular fa-circle-user"></i>
              <span>{account.name}</span>
            </Link>
          ) : (
            <Link key="Ingresar" to="/login" className={styles.nav__login}>
              <i className="fa-regular fa-circle-user"></i>
              <span>
                <FormattedMessage id="header.account.login" />
              </span>
            </Link>
          ))}
      </div>
    </header>
  );
}
