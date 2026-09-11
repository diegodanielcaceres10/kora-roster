import { FormattedMessage, useIntl } from "react-intl";
import styles from "./PrivacyPage.module.scss";
import { useCurrentLegalDocument } from "../../features/legal/hooks/useCurrentLegalDocument";

export function PrivacyPage() {
  const { locale } = useIntl();
  const { legalDocument, isLoading, hasError } = useCurrentLegalDocument("privacy");

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
          <p className={styles.privacy__updated}>{isLoading ? <FormattedMessage id="terms.updated" /> : legalDocument ? `${new Intl.DateTimeFormat(locale).format(new Date(legalDocument.updatedAt))} · v${legalDocument.version}` : null}</p>
        </header>

        <div className={styles.privacy__body}>
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
