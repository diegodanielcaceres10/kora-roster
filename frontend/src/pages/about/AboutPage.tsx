import { FormattedMessage, useIntl } from "react-intl";
import styles from "./AboutPage.module.scss";
import authorLogo from "../../assets/diegodanielcaceres.png";

export function AboutPage() {
  const intl = useIntl();

  return (
    <section className={styles.about}>
      <div className={styles.about__container}>
        <header>
          <p className={[styles.about__eyebrow, styles.about__eyebrow].join(" ")}>
            <FormattedMessage id="header.nav.about" />
          </p>
          <h1 className={styles.about__title}>
            <FormattedMessage id="about.title" />
          </h1>
        </header>

        <p className={styles.about__description}>
          <FormattedMessage id="about.description" />
        </p>

        <a className={styles.about__author} href="https://diegodanielcaceres10.github.io/nura/" target="_blank" rel="noreferrer" aria-label={intl.formatMessage({ id: "about.authorAriaLabel" })}>
          <div className={styles.about__authorLogo}>
            <img src={authorLogo} alt="Diego Daniel Caceres" />
          </div>
          <i className="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    </section>
  );
}
