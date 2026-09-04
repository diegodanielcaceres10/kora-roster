import { beforeEach, describe, expect, it } from "vitest";
import { getCurrentApiLang, toApiLang } from "./apiLang";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from "./config";

describe("toApiLang", () => {
  it("maps every supported app locale to its API language code", () => {
    expect(toApiLang("es-419")).toBe("es");
    expect(toApiLang("pt-BR")).toBe("pt");
    expect(toApiLang("en-US")).toBe("en");
  });
});

describe("getCurrentApiLang", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("derives the API language from the locale stored by the app", () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "pt-BR");
    expect(getCurrentApiLang()).toBe("pt");
  });

  it("falls back to the default locale's API language when nothing is stored", () => {
    expect(getCurrentApiLang()).toBe(toApiLang(DEFAULT_LOCALE));
  });

  it("falls back to the default locale's API language when the stored value is invalid", () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "not-a-real-locale");
    expect(getCurrentApiLang()).toBe(toApiLang(DEFAULT_LOCALE));
  });
});
