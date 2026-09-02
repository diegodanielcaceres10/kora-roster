import { FormattedMessage } from "react-intl";
import styles from "./PrivacyPage.module.scss";

export function PrivacyPage() {
  return (
    <section className={styles.privacy}>
      <div className={styles.privacy__container}>
        <header>
          <p className={styles.privacy__eyebrow}>
            <FormattedMessage id="terms.eyebrow" />
          </p>
          <h1 className={styles.privacy__title}>
            <FormattedMessage id="footer.links.privacy" />
          </h1>
          <p className={styles.privacy__updated}>
            <FormattedMessage id="terms.updated" />
          </p>
        </header>

        <div className={styles.privacy__body}>
          <p>
            <FormattedMessage id="privacy.intro" />
          </p>

          <h2>
            <FormattedMessage id="privacy.section1.title" />
          </h2>
          <p>
            <FormattedMessage id="privacy.section1.body" />
          </p>

          <h2>
            <FormattedMessage id="privacy.section2.title" />
          </h2>
          <p>
            <FormattedMessage id="privacy.section2.body" />
          </p>

          <h2>
            <FormattedMessage id="privacy.section3.title" />
          </h2>
          <p>
            <FormattedMessage id="privacy.section3.body" />
          </p>

          <h2>
            <FormattedMessage id="privacy.section4.title" />
          </h2>
          <p>
            <FormattedMessage id="privacy.section4.body" />
          </p>

          <h2>
            <FormattedMessage id="privacy.section5.title" />
          </h2>
          <p>
            <FormattedMessage id="privacy.section5.body" />
          </p>

          <h2>
            <FormattedMessage id="privacy.section6.title" />
          </h2>
          <p>
            <FormattedMessage id="privacy.section6.body" />
          </p>

          <h2>
            <FormattedMessage id="privacy.section7.title" />
          </h2>
          <p>
            <FormattedMessage id="privacy.section7.body" />
          </p>

          <h2>
            <FormattedMessage id="privacy.section8.title" />
          </h2>
          <p>
            <FormattedMessage id="privacy.section8.body" />
          </p>
        </div>
      </div>
    </section>
  );
}
