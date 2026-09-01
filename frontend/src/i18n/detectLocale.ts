import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, type AppLocale } from "./config";

function isSupportedLocale(value: string | null): value is AppLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value ?? "");
}

function matchBrowserLocale(candidates: readonly string[]): AppLocale | null {
  for (const candidate of candidates) {
    if (isSupportedLocale(candidate)) return candidate;
  }

  for (const candidate of candidates) {
    const base = candidate.split("-")[0].toLowerCase();
    const match = SUPPORTED_LOCALES.find((locale) => locale.split("-")[0].toLowerCase() === base);
    if (match) return match;
  }

  return null;
}

export function detectDefaultLocale(): AppLocale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (isSupportedLocale(stored)) return stored;

  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return matchBrowserLocale(browserLanguages) ?? DEFAULT_LOCALE;
}
