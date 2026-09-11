import { FormattedMessage, useIntl } from "react-intl";
import styles from "./TermsPage.module.scss";
import { useCurrentLegalDocument } from "../../features/legal/hooks/useCurrentLegalDocument";

export function TermsPage() {
  const { locale } = useIntl();
  const { legalDocument, isLoading, hasError } = useCurrentLegalDocument("terms");

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
          <p className={styles.terms__updated}>{isLoading ? <FormattedMessage id="terms.updated" /> : legalDocument ? `${new Intl.DateTimeFormat(locale).format(new Date(legalDocument.updatedAt))} · v${legalDocument.version}` : null}</p>
        </header>

        <div className={styles.terms__body}>
          {hasError ? null : legalDocument ? (
            <>
              <p>{legalDocument.intro}</p>
              {legalDocument.sections.map((section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                </section>
              ))}
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
