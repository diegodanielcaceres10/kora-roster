import { LOCALE_STORAGE_KEY, DEFAULT_LOCALE, type AppLocale } from "./config";

export type ApiLang = "en" | "es" | "pt";

const API_LANG_BY_LOCALE: Record<AppLocale, ApiLang> = {
  "es-419": "es",
  "pt-BR": "pt",
  "en-US": "en",
};

export function toApiLang(locale: AppLocale): ApiLang {
  return API_LANG_BY_LOCALE[locale];
}

export function getCurrentApiLang(): ApiLang {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as AppLocale | null;
    if (stored && stored in API_LANG_BY_LOCALE) return toApiLang(stored);
  } catch {
    console.warn("Failed to read locale from localStorage");
  }
  return toApiLang(DEFAULT_LOCALE);
}
