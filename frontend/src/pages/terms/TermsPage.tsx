import { FormattedMessage, useIntl } from "react-intl";
import styles from "./TermsPage.module.scss";
import { useCurrentTerms } from "../../features/terms/hooks/useCurrentTerms";

export function TermsPage() {
  const { locale } = useIntl();
  const { terms, isLoading, hasError } = useCurrentTerms("terms");

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
          <p className={styles.terms__updated}>{isLoading ? <FormattedMessage id="terms.updated" /> : terms ? `${new Intl.DateTimeFormat(locale).format(new Date(terms.updatedAt))} · v${terms.version}` : null}</p>
        </header>

        <div className={styles.terms__body}>
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
