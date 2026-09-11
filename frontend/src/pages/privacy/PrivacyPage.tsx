import { FormattedMessage, useIntl } from "react-intl";
import styles from "./PrivacyPage.module.scss";
import { useCurrentTerms } from "../../features/terms/hooks/useCurrentTerms";

export function PrivacyPage() {
  const { locale } = useIntl();
  const { terms, isLoading, hasError } = useCurrentTerms("privacy");

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
          <p className={styles.privacy__updated}>{isLoading ? <FormattedMessage id="terms.updated" /> : terms ? `${new Intl.DateTimeFormat(locale).format(new Date(terms.updatedAt))} · v${terms.version}` : null}</p>
        </header>

        <div className={styles.privacy__body}>
          {hasError ? null : terms ? (
            <>
              <p>{terms.intro}</p>
              {terms.sections.map((section) => (
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
