import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";
import { StepPlayerList } from "./StepPlayerList";
import type { Player } from "../../../draft.types";
import messages from "../../../../../i18n/locales/en-US.json";

function makePlayer(overrides: Partial<Player> = {}): Player {
  return { id: `p-${Math.random()}`, name: "Player", teamId: null, spotIndex: null, isGoalkeeper: false, ...overrides };
}

function renderStep(overrides: Partial<React.ComponentProps<typeof StepPlayerList>> = {}) {
  const handlers = {
    onAdd: vi.fn(),
    onAddMany: vi.fn(),
    onRemove: vi.fn(),
    onRemoveAll: vi.fn(),
    onToggleGoalkeeper: vi.fn(),
    onNext: vi.fn(),
    onBack: vi.fn(),
  };
  const props = { players: [], totalNeeded: 6, teamCount: 2, ...handlers, ...overrides };

  render(
    <IntlProvider locale="en-US" messages={messages}>
      <StepPlayerList {...props} />
    </IntlProvider>,
  );

  return handlers;
}

describe("StepPlayerList - adding players", () => {
  it("adds a trimmed name via the form and clears the input", async () => {
    const user = userEvent.setup();
    const { onAdd } = renderStep({ players: [] });

    const input = screen.getByPlaceholderText("Player's name");
    await user.type(input, "  Ana  ");
    await user.click(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledWith("  Ana  ");
  });

  it("does not call onAdd for a blank name", async () => {
    const user = userEvent.setup();
    const { onAdd } = renderStep({ players: [] });

    await user.click(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("disables the input and add button once the list is complete", () => {
    const players = Array.from({ length: 6 }, () => makePlayer());
    renderStep({ players, totalNeeded: 6 });

    expect(screen.getByPlaceholderText("You've completed the list")).toBeDisabled();
    expect(screen.getByText("Add")).toBeDisabled();
  });

  it("shows an overflow alert when there are more players than needed", () => {
    const players = Array.from({ length: 7 }, () => makePlayer());
    renderStep({ players, totalNeeded: 6 });

    expect(screen.getByText(/You have 1 player too many/)).toBeInTheDocument();
  });
});

describe("StepPlayerList - paste mode", () => {
  it("switches to the paste textarea and loads the parsed entries", async () => {
    const user = userEvent.setup();
    const { onAddMany } = renderStep({ players: [] });

    await user.click(screen.getByText("Got a list? Paste it here"));
    const textarea = screen.getByPlaceholderText(/Paste the names/);
    await user.type(textarea, "Ana{enter}Bruno (arquero)");
    await user.click(screen.getByText("Load list"));

    expect(onAddMany).toHaveBeenCalledWith([
      { name: "Ana", isGoalkeeper: false },
      { name: "Bruno", isGoalkeeper: true },
    ]);
  });

  it("does not call onAddMany when the pasted text has no valid entries", async () => {
    const user = userEvent.setup();
    const { onAddMany } = renderStep({ players: [] });

    await user.click(screen.getByText("Got a list? Paste it here"));
    await user.click(screen.getByText("Load list"));

    expect(onAddMany).not.toHaveBeenCalled();
  });

  it("cancels paste mode and clears the textarea without submitting", async () => {
    const user = userEvent.setup();
    renderStep({ players: [] });

    await user.click(screen.getByText("Got a list? Paste it here"));
    await user.type(screen.getByPlaceholderText(/Paste the names/), "Ana");
    await user.click(screen.getByText("Cancel"));

    expect(screen.getByPlaceholderText("Player's name")).toBeInTheDocument();
  });
});

describe("StepPlayerList - goalkeeper cap and player rows", () => {
  it("disables marking a new goalkeeper once the team-count cap is reached", () => {
    const players = [makePlayer({ id: "a", name: "Ana", isGoalkeeper: true }), makePlayer({ id: "b", name: "Bruno", isGoalkeeper: true }), makePlayer({ id: "c", name: "Carla", isGoalkeeper: false })];
    renderStep({ players, teamCount: 2 });

    const carlaRow = screen.getByText("Carla").closest("li")!;
    const goalkeeperButton = carlaRow.querySelector("button");
    expect(goalkeeperButton).toBeDisabled();
  });

  it("still allows un-marking an existing goalkeeper even when the cap is reached", () => {
    const players = [makePlayer({ id: "a", name: "Ana", isGoalkeeper: true }), makePlayer({ id: "b", name: "Bruno", isGoalkeeper: true })];
    renderStep({ players, teamCount: 2 });

    const anaRow = screen.getByText("Ana").closest("li")!;
    const goalkeeperButton = anaRow.querySelector("button");
    expect(goalkeeperButton).not.toBeDisabled();
  });

  it("calls onToggleGoalkeeper with the player's id", async () => {
    const user = userEvent.setup();
    const players = [makePlayer({ id: "a", name: "Ana" })];
    const { onToggleGoalkeeper } = renderStep({ players, teamCount: 2 });

    const anaRow = screen.getByText("Ana").closest("li")!;
    await user.click(anaRow.querySelector("button")!);

    expect(onToggleGoalkeeper).toHaveBeenCalledWith("a");
  });

  it("calls onRemove with the player's id", async () => {
    const user = userEvent.setup();
    const players = [makePlayer({ id: "a", name: "Ana" })];
    const { onRemove } = renderStep({ players });

    await user.click(screen.getByLabelText("Remove Ana"));

    expect(onRemove).toHaveBeenCalledWith("a");
  });

  it("only shows the clear-list button when there is more than one player", () => {
    renderStep({ players: [makePlayer({ name: "Solo" })] });
    expect(screen.queryByText("Clear list")).not.toBeInTheDocument();
  });

  it("calls onRemoveAll from the clear-list button", async () => {
    const user = userEvent.setup();
    const players = [makePlayer({ name: "Ana" }), makePlayer({ name: "Bruno" })];
    const { onRemoveAll } = renderStep({ players });

    await user.click(screen.getByText("Clear list"));

    expect(onRemoveAll).toHaveBeenCalledTimes(1);
  });
});

describe("StepPlayerList - navigation", () => {
  it("disables Continue until the roster is complete", () => {
    const players = [makePlayer()];
    renderStep({ players, totalNeeded: 6 });
    expect(screen.getByText("Continue")).toBeDisabled();
  });

  it("enables Continue once the roster reaches the required total", () => {
    const players = Array.from({ length: 6 }, () => makePlayer());
    renderStep({ players, totalNeeded: 6 });
    expect(screen.getByText("Continue")).toBeEnabled();
  });

  it("calls onBack when Back is clicked", async () => {
    const user = userEvent.setup();
    const { onBack } = renderStep({ players: [] });

    await user.click(screen.getByText("Back"));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
