import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type AppLocale } from "../../i18n/config";
import { useLocale } from "../../i18n/LocaleContext";
import styles from "./language-switcher.module.scss";

const LOCALE_FLAGS: Record<AppLocale, string> = {
  "es-419": "🇪🇸",
  "pt-BR": "🇧🇷",
  "en-US": "🇺🇸",
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const intl = useIntl();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentLabel = LOCALE_LABELS[locale];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (nextLocale: AppLocale) => {
    setLocale(nextLocale);
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={styles.languageSwitcher}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.languageSwitcher__trigger}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={intl.formatMessage({
          id: "languageSwitcher.label",
        })}
      >
        <span className={styles.languageSwitcher__flag} aria-hidden="true">
          {LOCALE_FLAGS[locale]}
        </span>

        <span className={styles.languageSwitcher__label}>{currentLabel}</span>

        <svg className={`${styles.languageSwitcher__chevron} ${open ? styles["languageSwitcher__chevron--open"] : ""}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className={styles.languageSwitcher__menu}
          role="menu"
          aria-label={intl.formatMessage({
            id: "languageSwitcher.label",
          })}
        >
          {SUPPORTED_LOCALES.map((code) => {
            const selected = code === locale;

            return (
              <button key={code} type="button" role="menuitemradio" aria-checked={selected} className={`${styles.languageSwitcher__option} ${selected ? styles["languageSwitcher__option--selected"] : ""}`} onClick={() => handleSelect(code)}>
                <span className={styles.languageSwitcher__optionFlag} aria-hidden="true">
                  {LOCALE_FLAGS[code]}
                </span>

                <span className={styles.languageSwitcher__optionLabel}>{LOCALE_LABELS[code]}</span>

                {selected && (
                  <svg className={styles.languageSwitcher__check} viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
