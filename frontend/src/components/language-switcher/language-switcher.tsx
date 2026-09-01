import { useIntl } from "react-intl";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type AppLocale } from "../../i18n/config";
import { useLocale } from "../../i18n/LocaleContext";
import styles from "./language-switcher.module.scss";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const intl = useIntl();

  return (
    <label className={styles.languageSwitcher}>
      <span className={styles.languageSwitcher__srOnly}>{intl.formatMessage({ id: "languageSwitcher.label" })}</span>
      <select
        className={styles.languageSwitcher__select}
        value={locale}
        onChange={(event) => setLocale(event.target.value as AppLocale)}
        aria-label={intl.formatMessage({ id: "languageSwitcher.label" })}
      >
        {SUPPORTED_LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
