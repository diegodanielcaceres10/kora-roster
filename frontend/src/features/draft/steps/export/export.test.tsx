import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toPng } from "html-to-image";
import { StepExport } from "./export";
import type { DraftConfig } from "../../draft.types";
import messages from "../../../../i18n/locales/en-US.json";

vi.mock("html-to-image", () => ({ toPng: vi.fn() }));

const config: DraftConfig = {
  teamCount: 2,
  playersPerTeam: 2,
  assignmentMode: "random",
  teams: [
    { id: "t1", name: "Team A", color: "green" },
    { id: "t2", name: "Team B", color: "gold" },
  ],
  players: [
    { id: "p1", name: "Ana", teamId: "t1", spotIndex: 0, isGoalkeeper: true },
    { id: "p2", name: "Bruno", teamId: "t1", spotIndex: 1, isGoalkeeper: false },
    { id: "p3", name: "Carla", teamId: "t2", spotIndex: 0, isGoalkeeper: false },
    { id: "p4", name: "Diego", teamId: "t2", spotIndex: 1, isGoalkeeper: false },
  ],
};

function renderExport(onBack = vi.fn(), onReset = vi.fn()) {
  render(
    <IntlProvider locale="en-US" messages={messages}>
      <StepExport config={config} onBack={onBack} onReset={onReset} />
    </IntlProvider>,
  );
  return { onBack, onReset };
}

describe("StepExport - copy as text", () => {
  function mockClipboard(impl: () => Promise<void>) {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn(impl) },
      configurable: true,
    });
  }

  it("copies a plain-text roster (goalkeeper label included) to the clipboard", async () => {
    // userEvent.setup() installs its own navigator.clipboard stub, so our
    // mock must be defined AFTER it, or it gets overwritten.
    const user = userEvent.setup();
    mockClipboard(() => Promise.resolve());
    renderExport();

    await user.click(screen.getByText("Copy text"));

    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1));
    const copiedText = vi.mocked(navigator.clipboard.writeText).mock.calls[0][0];
    expect(copiedText).toContain("Team A");
    expect(copiedText).toContain("Team B");
    expect(copiedText).toContain("1. Ana");
    expect(copiedText).toContain("2. Bruno");
  });

  it("shows a success message once the copy resolves", async () => {
    const user = userEvent.setup();
    mockClipboard(() => Promise.resolve());
    renderExport();

    await user.click(screen.getByText("Copy text"));

    expect(await screen.findByText(/Copied/i)).toBeInTheDocument();
  });

  it("shows an error message when the clipboard write fails", async () => {
    const user = userEvent.setup();
    mockClipboard(() => Promise.reject(new Error("denied")));
    renderExport();

    await user.click(screen.getByText("Copy text"));

    expect(await screen.findByText("Couldn't copy the list.")).toBeInTheDocument();
  });
});

describe("StepExport - download", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates a PNG and triggers a download", async () => {
    vi.mocked(toPng).mockResolvedValueOnce("data:image/png;base64,fake");
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const user = userEvent.setup();
    renderExport();

    await user.click(screen.getByText("Download"));

    await waitFor(() => expect(toPng).toHaveBeenCalledTimes(1));
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when image generation fails", async () => {
    vi.mocked(toPng).mockRejectedValueOnce(new Error("canvas failed"));
    const user = userEvent.setup();
    renderExport();

    await user.click(screen.getByText("Download"));

    expect(await screen.findByText(/couldn.?t/i)).toBeInTheDocument();
  });
});

describe("StepExport - navigation", () => {
  it("calls onBack and onReset from their buttons", async () => {
    const user = userEvent.setup();
    const { onBack, onReset } = renderExport();

    await user.click(screen.getByText("Back"));
    expect(onBack).toHaveBeenCalledTimes(1);

    await user.click(screen.getByText("New draw"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
