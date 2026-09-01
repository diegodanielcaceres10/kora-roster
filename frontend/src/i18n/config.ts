export const SUPPORTED_LOCALES = ["es-419", "pt-BR", "en-US"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "es-419";

export const LOCALE_STORAGE_KEY = "kora-locale";

export const LOCALE_LABELS: Record<AppLocale, string> = {
  "es-419": "Español",
  "pt-BR": "Português",
  "en-US": "English",
};
