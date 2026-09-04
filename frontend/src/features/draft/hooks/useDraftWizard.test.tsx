import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";
import { shuffle, useDraftWizard } from "./useDraftWizard";
import messages from "../../../i18n/locales/en-US.json";

function Providers({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <IntlProvider locale="en-US" messages={messages}>
        {children}
      </IntlProvider>
    </MemoryRouter>
  );
}

describe("shuffle", () => {
  it("keeps every element and the same length", () => {
    const input = ["a", "b", "c", "d"];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3];
    shuffle(input);
    expect(input).toEqual([1, 2, 3]);
  });

  it("produces a roughly uniform distribution over all permutations", () => {
    // Regression test for the bug fixed in this PR: `arr.sort(() => Math.random() - 0.5)`
    // is NOT a fair shuffle. With 3 elements there are 3! = 6 possible orderings;
    // a fair Fisher-Yates shuffle should land on each with roughly equal frequency.
    const counts = new Map<string, number>();
    const iterations = 6000;

    for (let i = 0; i < iterations; i += 1) {
      const key = shuffle([1, 2, 3]).join(",");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    expect(counts.size).toBe(6);

    const expected = iterations / 6;
    for (const count of counts.values()) {
      // generous tolerance (±40%) - this only needs to catch a badly biased
      // shuffle, not assert perfect statistical uniformity.
      expect(count).toBeGreaterThan(expected * 0.6);
      expect(count).toBeLessThan(expected * 1.4);
    }
  });
});

describe("useDraftWizard - quickFriendlyDraft", () => {
  it("does nothing when there are fewer than the minimum required players", () => {
    const { result } = renderHook(() => useDraftWizard(), { wrapper: Providers });

    act(() => {
      result.current.quickFriendlyDraft([{ name: "Juan" }, { name: "Pedro" }]);
    });

    expect(result.current.config.players).toHaveLength(0);
  });

  it("splits players into exactly 2 teams as evenly as possible", () => {
    const { result } = renderHook(() => useDraftWizard(), { wrapper: Providers });
    const entries = ["Ana", "Bruno", "Carla", "Diego", "Elena", "Fabio"].map((name) => ({ name }));

    act(() => {
      result.current.quickFriendlyDraft(entries);
    });

    const { config } = result.current;
    expect(config.teams).toHaveLength(2);
    expect(config.players).toHaveLength(6);

    const perTeam = config.teams.map((team) => config.players.filter((p) => p.teamId === team.id).length);
    expect(perTeam.sort()).toEqual([3, 3]);
  });

  it("caps the number of goalkeepers at the team count, regardless of shuffle order", () => {
    const { result } = renderHook(() => useDraftWizard(), { wrapper: Providers });
    // 4 players request goalkeeper duty, but there are only 2 teams (2 slots)
    const entries = [
      { name: "Ana", isGoalkeeper: true },
      { name: "Bruno", isGoalkeeper: true },
      { name: "Carla", isGoalkeeper: true },
      { name: "Diego", isGoalkeeper: true },
      { name: "Elena" },
      { name: "Fabio" },
    ];

    act(() => {
      result.current.quickFriendlyDraft(entries);
    });

    const goalkeeperCount = result.current.config.players.filter((p) => p.isGoalkeeper).length;
    expect(goalkeeperCount).toBe(2);
  });

  it("assigns goalkeeper duty to a single requesting player regardless of order", () => {
    const { result } = renderHook(() => useDraftWizard(), { wrapper: Providers });
    const entries = [
      { name: "Ana" },
      { name: "Bruno" },
      { name: "Carla", isGoalkeeper: true },
      { name: "Diego" },
      { name: "Elena" },
      { name: "Fabio" },
    ];

    act(() => {
      result.current.quickFriendlyDraft(entries);
    });

    const goalkeepers = result.current.config.players.filter((p) => p.isGoalkeeper);
    expect(goalkeepers).toHaveLength(1);
    expect(goalkeepers[0].name).toBe("Carla");
  });
});

describe("useDraftWizard - drawTeams", () => {
  it("assigns every player to one of the configured teams with a balanced spread", () => {
    const { result } = renderHook(() => useDraftWizard(), { wrapper: Providers });

    act(() => {
      result.current.setTeamCount(3);
    });
    act(() => {
      result.current.addPlayers(
        ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9"].map((name) => ({ name, isGoalkeeper: false })),
      );
    });
    act(() => {
      result.current.drawTeams();
    });

    const { config } = result.current;
    expect(config.players.every((p) => p.teamId !== null)).toBe(true);

    const perTeam = config.teams.map((team) => config.players.filter((p) => p.teamId === team.id).length);
    expect(Math.max(...perTeam) - Math.min(...perTeam)).toBeLessThanOrEqual(1);
  });

  it("never assigns two players to the same team and spot", () => {
    const { result } = renderHook(() => useDraftWizard(), { wrapper: Providers });

    act(() => {
      result.current.setTeamCount(2);
    });
    act(() => {
      result.current.addPlayers(
        ["P1", "P2", "P3", "P4", "P5", "P6"].map((name) => ({ name, isGoalkeeper: false })),
      );
    });
    act(() => {
      result.current.drawTeams();
    });

    for (const team of result.current.config.teams) {
      const spots = result.current.config.players.filter((p) => p.teamId === team.id).map((p) => p.spotIndex);
      expect(new Set(spots).size).toBe(spots.length);
    }
  });

  it("keeps goalkeepers capped at one per team", () => {
    const { result } = renderHook(() => useDraftWizard(), { wrapper: Providers });

    act(() => {
      result.current.setTeamCount(2);
    });
    act(() => {
      result.current.addPlayers([
        { name: "GK1", isGoalkeeper: true },
        { name: "GK2", isGoalkeeper: true },
        { name: "P1", isGoalkeeper: false },
        { name: "P2", isGoalkeeper: false },
      ]);
    });
    act(() => {
      result.current.drawTeams();
    });

    for (const team of result.current.config.teams) {
      const goalkeepersInTeam = result.current.config.players.filter((p) => p.teamId === team.id && p.isGoalkeeper);
      expect(goalkeepersInTeam.length).toBeLessThanOrEqual(1);
    }
  });
});
