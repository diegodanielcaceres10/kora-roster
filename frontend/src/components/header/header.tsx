import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./header.module.scss";
import kRosterLogo from "/favicon.png";

const NAV_LINKS = [
  { label: "Inicio", to: "/" },
  { label: "Cómo funciona", to: "/como-funciona" },
  { label: "FAQ", to: "/faq" },
  { label: "Sobre Kora", to: "/sobre-kora" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className={styles.nav}>
      <div className={styles.nav__content}>
        <div className={styles.nav__menu}>
          <button type="button" aria-expanded={isMenuOpen} aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => setIsMenuOpen((open) => !open)}>
            {isMenuOpen ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-bars-staggered"></i>}
          </button>
          <div className={styles.nav__logo}>
            <img src={kRosterLogo} alt="" />
          </div>
        </div>

        <nav className={[styles.nav__links, isMenuOpen ? styles["nav__links--open"] : ""].join(" ")}>
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={label} to={to} className={[styles.nav__link, pathname === to ? styles["nav__link--active"] : ""].join(" ")} onClick={() => setIsMenuOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>

        {/* <Link key="Ingresar" to="crear-cuenta" className={styles.nav__login}>
          <i className="fa-regular fa-circle-user"></i>
          <span>Ingresar</span>
        </Link> */}
      </div>
    </header>
  );
}
