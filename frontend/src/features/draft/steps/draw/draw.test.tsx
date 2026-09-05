import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";
import { StepDraw } from "./draw";
import type { DraftConfig } from "../../draft.types";
import messages from "../../../../i18n/locales/en-US.json";

function makeHandlers() {
  return {
    setAssignmentMode: vi.fn(),
    resetAssignments: vi.fn(),
    assignPlayerToTeam: vi.fn(),
    unassignPlayer: vi.fn(),
    drawTeams: vi.fn(),
    onNext: vi.fn(),
    onBack: vi.fn(),
  };
}

function renderDraw(config: DraftConfig, handlers = makeHandlers()) {
  render(
    <IntlProvider locale="en-US" messages={messages}>
      <StepDraw config={config} {...handlers} />
    </IntlProvider>,
  );
  return handlers;
}

// Team A is pre-filled (its single spot has a goalkeeper); Team B is empty.
// playersPerTeam: 1 keeps each team down to a single, unambiguous field spot.
const baseConfig: DraftConfig = {
  teamCount: 2,
  playersPerTeam: 1,
  assignmentMode: null,
  teams: [
    { id: "t1", name: "Team A", color: "green" },
    { id: "t2", name: "Team B", color: "gold" },
  ],
  players: [
    { id: "p1", name: "Ana", teamId: "t1", spotIndex: 0, isGoalkeeper: true },
    { id: "p2", name: "Bruno", teamId: null, spotIndex: null, isGoalkeeper: false },
    { id: "p3", name: "Carla", teamId: null, spotIndex: null, isGoalkeeper: true },
  ],
};

describe("StepDraw - top-level actions", () => {
  it("draws teams automatically and marks the assignment mode as random", async () => {
    const user = userEvent.setup();
    const handlers = renderDraw(baseConfig);

    await user.click(screen.getByText("Draw teams"));

    expect(handlers.drawTeams).toHaveBeenCalledTimes(1);
    expect(handlers.setAssignmentMode).toHaveBeenCalledWith("random");
  });

  it("disables Clear assignments when nobody has been assigned yet", () => {
    const emptyConfig: DraftConfig = { ...baseConfig, players: baseConfig.players.map((p) => ({ ...p, teamId: null, spotIndex: null })) };
    renderDraw(emptyConfig);

    expect(screen.getByText("Clear assignments")).toBeDisabled();
  });

  it("enables and triggers Clear assignments once at least one player is placed", async () => {
    const user = userEvent.setup();
    const handlers = renderDraw(baseConfig);

    const resetButton = screen.getByText("Clear assignments");
    expect(resetButton).toBeEnabled();
    await user.click(resetButton);

    expect(handlers.resetAssignments).toHaveBeenCalledTimes(1);
  });

  it("disables Continue until every player is assigned to a team", () => {
    renderDraw(baseConfig); // Bruno and Carla are still unassigned
    expect(screen.getByText("Continue")).toBeDisabled();
  });

  it("enables Continue once every player has a team", () => {
    const fullyAssigned: DraftConfig = {
      ...baseConfig,
      teamCount: 1,
      teams: [{ id: "t1", name: "Team A", color: "green" }],
      players: [{ id: "p1", name: "Ana", teamId: "t1", spotIndex: 0, isGoalkeeper: false }],
    };
    renderDraw(fullyAssigned);
    expect(screen.getByText("Continue")).toBeEnabled();
  });

  it("calls onBack from its button", async () => {
    const user = userEvent.setup();
    const handlers = renderDraw(baseConfig);

    await user.click(screen.getByText("Back"));

    expect(handlers.onBack).toHaveBeenCalledTimes(1);
  });
});

describe("StepDraw - spot assignment modal", () => {
  it("opens the modal for an empty spot and assigns the chosen player", async () => {
    const user = userEvent.setup();
    const handlers = renderDraw(baseConfig);

    // Team A is selected by default; switch to Team B, which is still empty.
    await user.click(screen.getByRole("button", { name: /Team B/ }));
    await user.click(screen.getByText("Drag a player here"));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Choose an available player to assign to this spot.")).toBeInTheDocument();

    await user.click(within(dialog).getByText("Bruno"));

    expect(handlers.assignPlayerToTeam).toHaveBeenCalledWith("p2", "t2", 0);
  });

  it("is reachable via Tab and opens the modal with Enter (keyboard, no mouse)", async () => {
    const user = userEvent.setup();
    renderDraw(baseConfig);

    await user.click(screen.getByRole("button", { name: /Team B/ }));
    const spot = screen.getByRole("button", { name: "Spot 1: Drag a player here" });
    expect(spot).toHaveAttribute("tabindex", "0");

    spot.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("also opens the modal with Space on a focused spot", async () => {
    const user = userEvent.setup();
    renderDraw(baseConfig);

    await user.click(screen.getByRole("button", { name: /Team B/ }));
    const spot = screen.getByRole("button", { name: "Spot 1: Drag a player here" });
    spot.focus();
    await user.keyboard(" ");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens the modal for a filled spot and unassigns the player from there", async () => {
    const user = userEvent.setup();
    const handlers = renderDraw(baseConfig);

    // Team A is selected by default and its only spot already holds Ana.
    await user.click(screen.getByText("Ana"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Unassign Ana"));

    expect(handlers.unassignPlayer).toHaveBeenCalledWith("p1");
  });

  it("closes the modal via the close button without calling assign/unassign", async () => {
    const user = userEvent.setup();
    const handlers = renderDraw(baseConfig);

    await user.click(screen.getByRole("button", { name: /Team B/ }));
    await user.click(screen.getByText("Drag a player here"));
    await user.click(screen.getByLabelText("Close"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(handlers.assignPlayerToTeam).not.toHaveBeenCalled();
    expect(handlers.unassignPlayer).not.toHaveBeenCalled();
  });

  it("excludes goalkeepers from the assignable list for a non-first spot on a two-spot team", async () => {
    const twoSpotConfig: DraftConfig = {
      teamCount: 1,
      playersPerTeam: 2,
      assignmentMode: null,
      teams: [{ id: "t1", name: "Team A", color: "green" }],
      players: [
        { id: "p1", name: "Ana", teamId: "t1", spotIndex: 0, isGoalkeeper: false },
        { id: "p2", name: "Bruno", teamId: null, spotIndex: null, isGoalkeeper: false },
        { id: "p3", name: "Carla", teamId: null, spotIndex: null, isGoalkeeper: true },
      ],
    };
    const user = userEvent.setup();
    renderDraw(twoSpotConfig);

    await user.click(screen.getByText("Drag a player here"));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Bruno")).toBeInTheDocument();
    expect(within(dialog).queryByText("Carla")).not.toBeInTheDocument();
  });
});
