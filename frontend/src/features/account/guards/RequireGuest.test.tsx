import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequireGuest } from "./RequireGuest";
import { useAccount } from "../AccountContext";
import { useApiHealth } from "../hooks/useApiHealth";
import { authStorage } from "../../../lib/auth/authStorage";
import messages from "../../../i18n/locales/en-US.json";

vi.mock("../AccountContext");
vi.mock("../hooks/useApiHealth");

function renderGuard(ui: ReactNode) {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <IntlProvider locale="en-US" messages={messages}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/login" element={ui} />
        </Routes>
      </IntlProvider>
    </MemoryRouter>,
  );
}

describe("RequireGuest", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(useAccount).mockReturnValue({
      account: null,
      isLoading: false,
      ensureLoaded: vi.fn(),
      setAccount: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("shows a service-checking spinner while the health check is in flight", () => {
    vi.mocked(useApiHealth).mockReturnValue({ isHealthy: false, isChecking: true });

    renderGuard(
      <RequireGuest>
        <div>Login form</div>
      </RequireGuest>,
    );

    expect(screen.getByText("Checking service availability...")).toBeInTheDocument();
  });

  it("shows the service-unavailable message when the backend health check fails", () => {
    vi.mocked(useApiHealth).mockReturnValue({ isHealthy: false, isChecking: false });

    renderGuard(
      <RequireGuest>
        <div>Login form</div>
      </RequireGuest>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders the guest content when the API is healthy and there is no session", () => {
    vi.mocked(useApiHealth).mockReturnValue({ isHealthy: true, isChecking: false });

    renderGuard(
      <RequireGuest>
        <div>Login form</div>
      </RequireGuest>,
    );

    expect(screen.getByText("Login form")).toBeInTheDocument();
  });

  it("shows a session-checking spinner when a token is stored but the account hasn't resolved yet", () => {
    vi.mocked(useApiHealth).mockReturnValue({ isHealthy: true, isChecking: false });
    authStorage.setTokens("access-1", "refresh-1");

    renderGuard(
      <RequireGuest>
        <div>Login form</div>
      </RequireGuest>,
    );

    expect(screen.getByText("Checking session...")).toBeInTheDocument();
    expect(screen.queryByText("Login form")).not.toBeInTheDocument();
  });

  it("redirects to / when there is already a resolved account (already logged in)", () => {
    vi.mocked(useApiHealth).mockReturnValue({ isHealthy: true, isChecking: false });
    authStorage.setTokens("access-1", "refresh-1");
    vi.mocked(useAccount).mockReturnValue({
      account: { id: 1, email: "a@b.com", name: "Ana", lastname: "Lima", phone: null, status: "active", createdAt: "", updatedAt: "" },
      isLoading: false,
      ensureLoaded: vi.fn(),
      setAccount: vi.fn(),
      logout: vi.fn(),
    });

    renderGuard(
      <RequireGuest>
        <div>Login form</div>
      </RequireGuest>,
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("Login form")).not.toBeInTheDocument();
  });
});
