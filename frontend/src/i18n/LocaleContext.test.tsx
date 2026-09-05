import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useIntl } from "react-intl";
import { beforeEach, describe, expect, it } from "vitest";
import { LocaleProvider, useLocale } from "./LocaleContext";
import { LOCALE_STORAGE_KEY } from "./config";

function Consumer() {
  const { locale, setLocale } = useLocale();
  const intl = useIntl();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="message">{intl.formatMessage({ id: "guards.checkingService" })}</span>
      <button onClick={() => setLocale("pt-BR")}>switch</button>
    </div>
  );
}

describe("LocaleProvider / useLocale", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = "";
  });

  it("initializes using the locale detected from storage", () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "pt-BR");

    render(
      <LocaleProvider>
        <Consumer />
      </LocaleProvider>,
    );

    expect(screen.getByTestId("locale").textContent).toBe("pt-BR");
  });

  it("provides the matching message catalog to nested components via IntlProvider", () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "pt-BR");

    render(
      <LocaleProvider>
        <Consumer />
      </LocaleProvider>,
    );

    expect(screen.getByTestId("message").textContent).toBe("Verificando a disponibilidade do serviço...");
  });

  it("updates document.lang and persists the new locale when setLocale is called", async () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "en-US");
    const user = userEvent.setup();

    render(
      <LocaleProvider>
        <Consumer />
      </LocaleProvider>,
    );

    expect(screen.getByTestId("message").textContent).toBe("Checking service availability...");

    await user.click(screen.getByText("switch"));

    expect(screen.getByTestId("locale").textContent).toBe("pt-BR");
    expect(document.documentElement.lang).toBe("pt-BR");
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("pt-BR");
    expect(screen.getByTestId("message").textContent).toBe("Verificando a disponibilidade do serviço...");
  });
});

describe("useLocale outside a provider", () => {
  it("throws a descriptive error instead of silently returning undefined", () => {
    function Bare() {
      useLocale();
      return null;
    }

    expect(() => render(<Bare />)).toThrow("useLocale must be used within a LocaleProvider");
  });
});
