import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `useApiHealth` reads import.meta.env at module load time, so each test
// stubs the env vars it needs and re-imports the module fresh afterwards.
describe("useApiHealth", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("skips the check (and still stops 'checking') when the API isn't allowed", async () => {
    vi.stubEnv("VITE_ALLOW_API", "false");
    vi.doMock("../account.api", () => ({ checkApiHealth: vi.fn() }));

    const { useApiHealth } = await import("./useApiHealth");
    const { checkApiHealth } = await import("../account.api");
    const { result } = renderHook(() => useApiHealth());

    await waitFor(() => expect(result.current.isChecking).toBe(false));
    expect(result.current.isHealthy).toBe(false);
    expect(checkApiHealth).not.toHaveBeenCalled();
  });

  it("reports healthy when the API responds ok and its env matches the frontend env", async () => {
    vi.stubEnv("VITE_ALLOW_API", "true");
    vi.stubEnv("VITE_ENV", "test");
    vi.doMock("../account.api", () => ({ checkApiHealth: vi.fn().mockResolvedValue({ status: "ok", env: "test" }) }));

    const { useApiHealth } = await import("./useApiHealth");
    const { result } = renderHook(() => useApiHealth());

    await waitFor(() => expect(result.current.isChecking).toBe(false));
    expect(result.current.isHealthy).toBe(true);
  });

  it("reports unhealthy when the API's env doesn't match the frontend's env", async () => {
    vi.stubEnv("VITE_ALLOW_API", "true");
    vi.stubEnv("VITE_ENV", "production");
    vi.doMock("../account.api", () => ({ checkApiHealth: vi.fn().mockResolvedValue({ status: "ok", env: "staging" }) }));

    const { useApiHealth } = await import("./useApiHealth");
    const { result } = renderHook(() => useApiHealth());

    await waitFor(() => expect(result.current.isChecking).toBe(false));
    expect(result.current.isHealthy).toBe(false);
  });

  it("reports unhealthy when the health check request fails", async () => {
    vi.stubEnv("VITE_ALLOW_API", "true");
    vi.doMock("../account.api", () => ({ checkApiHealth: vi.fn().mockRejectedValue(new Error("network down")) }));

    const { useApiHealth } = await import("./useApiHealth");
    const { result } = renderHook(() => useApiHealth());

    await waitFor(() => expect(result.current.isChecking).toBe(false));
    expect(result.current.isHealthy).toBe(false);
  });
});
