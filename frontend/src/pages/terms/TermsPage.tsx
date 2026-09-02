import { FormattedMessage } from "react-intl";
import styles from "./TermsPage.module.scss";

export function TermsPage() {
  return (
    <section className={styles.terms}>
      <div className={styles.terms__container}>
        <header>
          <p className={styles.terms__eyebrow}>
            <FormattedMessage id="terms.eyebrow" />
          </p>
          <h1 className={styles.terms__title}>
            <FormattedMessage id="footer.links.terms" />
          </h1>
          <p className={styles.terms__updated}>
            <FormattedMessage id="terms.updated" />
          </p>
        </header>

        <div className={styles.terms__body}>
          <p>
            <FormattedMessage id="terms.intro" />
          </p>

          <h2>
            <FormattedMessage id="terms.section1.title" />
          </h2>
          <p>
            <FormattedMessage id="terms.section1.body" />
          </p>

          <h2>
            <FormattedMessage id="terms.section2.title" />
          </h2>
          <p>
            <FormattedMessage id="terms.section2.body" />
          </p>

          <h2>
            <FormattedMessage id="terms.section3.title" />
          </h2>
          <p>
            <FormattedMessage id="terms.section3.body" />
          </p>

          <h2>
            <FormattedMessage id="terms.section4.title" />
          </h2>
          <p>
            <FormattedMessage id="terms.section4.body" />
          </p>

          <h2>
            <FormattedMessage id="terms.section5.title" />
          </h2>
          <p>
            <FormattedMessage id="terms.section5.body" />
          </p>

          <h2>
            <FormattedMessage id="terms.section6.title" />
          </h2>
          <p>
            <FormattedMessage id="terms.section6.body" />
          </p>

          <h2>
            <FormattedMessage id="terms.section7.title" />
          </h2>
          <p>
            <FormattedMessage id="terms.section7.body" />
          </p>

          <h2>
            <FormattedMessage id="terms.section8.title" />
          </h2>
          <p>
            <FormattedMessage id="terms.section8.body" />
          </p>
        </div>
      </div>
    </section>
  );
}
