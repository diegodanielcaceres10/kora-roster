import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "./LoginPage";
import { useLogin } from "../../../features/account/hooks/useLogin";
import { useGoogleAuth } from "../../../features/account/hooks/useGoogleAuth";
import messages from "../../../i18n/locales/en-US.json";

vi.mock("../../../features/account/hooks/useLogin");
vi.mock("../../../features/account/hooks/useGoogleAuth");
vi.mock("../../../features/account/components/GoogleAuthButton", () => ({ GoogleAuthButton: () => null }));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <IntlProvider locale="en-US" messages={messages}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </IntlProvider>
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  const submit = vi.fn();

  beforeEach(() => {
    submit.mockReset();
    vi.mocked(useLogin).mockReturnValue({ submit, status: "idle", errorId: null });
    vi.mocked(useGoogleAuth).mockReturnValue({ submit: vi.fn(), status: "idle", errorId: null });
  });

  it("submits the entered email and password", async () => {
    submit.mockResolvedValueOnce({ user: {}, accessToken: "a", refreshToken: "r" });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(submit).toHaveBeenCalledWith({ email: "a@b.com", password: "secret123" }));
  });

  it("navigates home after a successful login", async () => {
    submit.mockResolvedValueOnce({ user: {}, accessToken: "a", refreshToken: "r" });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(screen.getByText("Home")).toBeInTheDocument());
  });

  it("does not navigate when the login fails", async () => {
    submit.mockResolvedValueOnce(null);
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
  });

  it("shows the mapped error message when the login hook reports one", () => {
    vi.mocked(useLogin).mockReturnValue({ submit, status: "error", errorId: "login.error.invalidCredentials" });

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent("Incorrect email or password");
  });

  it("disables the form while a submission is loading", () => {
    vi.mocked(useLogin).mockReturnValue({ submit, status: "loading", errorId: null });

    renderPage();

    expect(screen.getByRole("button", { name: /Signing in/ })).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    renderPage();

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(passwordInput.type).toBe("text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(passwordInput.type).toBe("password");
  });
});
