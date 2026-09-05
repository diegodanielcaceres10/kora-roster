import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterPage } from "./RegisterPage";
import { useRegisterAccount } from "../../../features/account/hooks/useRegisterAccount";
import { useGoogleAuth } from "../../../features/account/hooks/useGoogleAuth";
import messages from "../../../i18n/locales/en-US.json";

vi.mock("../../../features/account/hooks/useRegisterAccount");
vi.mock("../../../features/account/hooks/useGoogleAuth");
vi.mock("../../../features/account/components/GoogleAuthButton", () => ({ GoogleAuthButton: () => null }));

function renderPage() {
  return render(
    <MemoryRouter>
      <IntlProvider locale="en-US" messages={messages}>
        <RegisterPage />
      </IntlProvider>
    </MemoryRouter>,
  );
}

describe("RegisterPage", () => {
  const submit = vi.fn();

  beforeEach(() => {
    submit.mockReset();
    vi.mocked(useRegisterAccount).mockReturnValue({ submit, status: "idle", account: null, errorId: null });
    vi.mocked(useGoogleAuth).mockReturnValue({ submit: vi.fn(), status: "idle", errorId: null });
  });

  it("keeps the submit button disabled until the terms checkbox is accepted", async () => {
    const user = userEvent.setup();
    renderPage();

    const submitButton = screen.getByRole("button", { name: "Crear cuenta" });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(screen.getByLabelText("Apellido"), "Lima");
    await user.type(screen.getByLabelText("Email"), "ana@b.com");
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: /Términos y Condiciones/ }));
    expect(submitButton).toBeEnabled();
  });

  it("submits the form with the entered data once terms are accepted", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(screen.getByLabelText("Apellido"), "Lima");
    await user.type(screen.getByLabelText("Email"), "ana@b.com");
    await user.click(screen.getByRole("checkbox", { name: /Términos y Condiciones/ }));
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(submit).toHaveBeenCalledWith({
      email: "ana@b.com",
      name: "Ana",
      lastname: "Lima",
      acceptedTerms: true,
      marketingConsent: false,
    });
  });

  it("includes marketing consent in the payload when that checkbox is also checked", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(screen.getByLabelText("Apellido"), "Lima");
    await user.type(screen.getByLabelText("Email"), "ana@b.com");
    await user.click(screen.getByRole("checkbox", { name: /Términos y Condiciones/ }));
    await user.click(screen.getByRole("checkbox", { name: /novedades y comunicaciones/ }));
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ marketingConsent: true }));
  });

  it("shows the mapped error message when registration fails", () => {
    vi.mocked(useRegisterAccount).mockReturnValue({ submit, status: "error", account: null, errorId: "register.error.emailTaken" });

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent("That email is already registered");
  });

  it("shows the email success view instead of the form after a successful email registration", () => {
    vi.mocked(useRegisterAccount).mockReturnValue({ submit, status: "success", account: null, errorId: null });

    renderPage();

    expect(screen.queryByRole("button", { name: "Crear cuenta" })).not.toBeInTheDocument();
    expect(screen.getByText("¡Cuenta creada!")).toBeInTheDocument();
  });

  it("shows the Google success variant when the Google sign-up succeeded instead", () => {
    vi.mocked(useGoogleAuth).mockReturnValue({ submit: vi.fn(), status: "success", errorId: null });

    renderPage();

    expect(screen.getByText("Ya iniciaste sesión con Google.")).toBeInTheDocument();
  });
});
