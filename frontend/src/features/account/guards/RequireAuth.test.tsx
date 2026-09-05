import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequireAuth } from "./RequireAuth";
import { useAccount } from "../AccountContext";
import { useApiHealth } from "../hooks/useApiHealth";
import { authStorage } from "../../../lib/auth/authStorage";
import messages from "../../../i18n/locales/en-US.json";

vi.mock("../AccountContext");
vi.mock("../hooks/useApiHealth");

function renderGuard(ui: ReactNode) {
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <IntlProvider locale="en-US" messages={messages}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/protected" element={ui} />
        </Routes>
      </IntlProvider>
    </MemoryRouter>,
  );
}

describe("RequireAuth", () => {
  const ensureLoaded = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    ensureLoaded.mockReset();
    vi.mocked(useAccount).mockReturnValue({
      account: null,
      isLoading: false,
      ensureLoaded,
      setAccount: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("shows a service-checking spinner while the health check is in flight", () => {
    vi.mocked(useApiHealth).mockReturnValue({ isHealthy: false, isChecking: true });

    renderGuard(
      <RequireAuth>
        <div>Secret content</div>
      </RequireAuth>,
    );

    expect(screen.getByText("Checking service availability...")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("shows the service-unavailable message when the backend health check fails", () => {
    vi.mocked(useApiHealth).mockReturnValue({ isHealthy: false, isChecking: false });

    renderGuard(
      <RequireAuth>
        <div>Secret content</div>
      </RequireAuth>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("redirects to / when the API is healthy but there is no stored token", () => {
    vi.mocked(useApiHealth).mockReturnValue({ isHealthy: true, isChecking: false });

    renderGuard(
      <RequireAuth>
        <div>Secret content</div>
      </RequireAuth>,
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("shows a session-checking spinner when a token is stored but the account hasn't loaded yet", () => {
    vi.mocked(useApiHealth).mockReturnValue({ isHealthy: true, isChecking: false });
    authStorage.setTokens("access-1", "refresh-1");

    renderGuard(
      <RequireAuth>
        <div>Secret content</div>
      </RequireAuth>,
    );

    expect(screen.getByText("Checking session...")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("renders the protected content once healthy, tokened and the account has loaded", () => {
    vi.mocked(useApiHealth).mockReturnValue({ isHealthy: true, isChecking: false });
    authStorage.setTokens("access-1", "refresh-1");
    vi.mocked(useAccount).mockReturnValue({
      account: { id: 1, email: "a@b.com", name: "Ana", lastname: "Lima", phone: null, status: "active", createdAt: "", updatedAt: "" },
      isLoading: false,
      ensureLoaded,
      setAccount: vi.fn(),
      logout: vi.fn(),
    });

    renderGuard(
      <RequireAuth>
        <div>Secret content</div>
      </RequireAuth>,
    );

    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });

  it("calls ensureLoaded on mount regardless of the current state", async () => {
    vi.mocked(useApiHealth).mockReturnValue({ isHealthy: true, isChecking: false });

    renderGuard(
      <RequireAuth>
        <div>Secret content</div>
      </RequireAuth>,
    );

    await waitFor(() => expect(ensureLoaded).toHaveBeenCalledTimes(1));
  });
});
