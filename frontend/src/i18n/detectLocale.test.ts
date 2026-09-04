import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detectDefaultLocale } from "./detectLocale";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from "./config";

function mockBrowserLanguages(languages: string[]) {
  vi.spyOn(window.navigator, "languages", "get").mockReturnValue(languages);
  vi.spyOn(window.navigator, "language", "get").mockReturnValue(languages[0] ?? "en-US");
}

describe("detectDefaultLocale", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prefers a supported locale already stored, ignoring the browser language", () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "pt-BR");
    mockBrowserLanguages(["en-US"]);
    expect(detectDefaultLocale()).toBe("pt-BR");
  });

  it("ignores a stored value that isn't a supported locale", () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "fr-FR");
    mockBrowserLanguages(["en-US"]);
    expect(detectDefaultLocale()).toBe("en-US");
  });

  it("matches an exact supported browser language when nothing is stored", () => {
    mockBrowserLanguages(["en-US", "fr-FR"]);
    expect(detectDefaultLocale()).toBe("en-US");
  });

  it("falls back to matching by base language (e.g. es-AR -> es-419)", () => {
    mockBrowserLanguages(["fr-FR", "es-AR"]);
    expect(detectDefaultLocale()).toBe("es-419");
  });

  it("falls back to the app default when nothing matches", () => {
    mockBrowserLanguages(["de-DE"]);
    expect(detectDefaultLocale()).toBe(DEFAULT_LOCALE);
  });
});
