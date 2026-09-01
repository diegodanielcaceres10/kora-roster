import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type AppLocale } from "./config";
import { detectDefaultLocale } from "./detectLocale";
import esLocale from "./locales/es-419.json";
import ptLocale from "./locales/pt-BR.json";
import enLocale from "./locales/en-US.json";

const MESSAGES: Record<AppLocale, Record<string, string>> = {
  "es-419": esLocale,
  "pt-BR": ptLocale,
  "en-US": enLocale,
};

interface LocaleContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<AppLocale>(() => detectDefaultLocale());

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => ({ locale, setLocale }), [locale]);

  return (
    <LocaleContext.Provider value={value}>
      <IntlProvider locale={locale} defaultLocale={DEFAULT_LOCALE} messages={MESSAGES[locale]}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
