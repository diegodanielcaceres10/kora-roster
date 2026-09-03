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

        <div className={styles.about__author}>
          <div className={styles.about__signature}>
            <img src={authorLogo} alt="Diego Daniel Caceres" />
          </div>
          <a className={styles.about__portfolio} href="https://diegodanielcaceres10.github.io/nura/" target="_blank" rel="noreferrer" aria-label={intl.formatMessage({ id: "about.authorAriaLabel" })}>
            Portfolio
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
