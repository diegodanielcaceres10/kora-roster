import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { WizardStep, DraftConfig, Player, Team, AssignmentMode } from "../draft.types";
import { DEFAULT_TEAM_COUNT, DEFAULT_PLAYERS_PER_TEAM, TEAM_COLOR_PALETTE } from "../draft.constants";

const STEP_ORDER: WizardStep[] = ["welcome", "setup", "draw", "export"];
const QUICK_TEAM_COUNT = 2;
const MIN_PLAYERS_QUICK = 6;
const MAX_PLAYERS_PER_TEAM = 11;

const buildTeams = (count: number): Team[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `team-${i}`,
    name: `Equipo ${String.fromCharCode(65 + i)}`,
    color: TEAM_COLOR_PALETTE[i % TEAM_COLOR_PALETTE.length],
  }));

const createEmptyConfig = (): DraftConfig => ({
  teamCount: DEFAULT_TEAM_COUNT,
  playersPerTeam: DEFAULT_PLAYERS_PER_TEAM,
  teams: buildTeams(DEFAULT_TEAM_COUNT),
  players: [],
  assignmentMode: null,
});

export function useDraftWizard() {
  const navigate = useNavigate();
  const location = useLocation();

  const step = (location.state as { step?: WizardStep } | null)?.step ?? "welcome";

  useEffect(() => {
    const stateStep = (location.state as { step?: WizardStep } | null)?.step;

    if (!stateStep) {
      navigate(".", { replace: true, state: { step: "welcome" } });
      return;
    }
    if (stateStep !== "welcome" && config.players.length === 0) {
      navigate(".", { replace: true, state: { step: "setup" } });
    }
  }, []);

  const [config, setConfig] = useState<DraftConfig>(createEmptyConfig());

  const quickFriendlyDraft = useCallback(
    (entries: { name: string; isGoalkeeper?: boolean }[]) => {
      const parsed = entries.map((e) => ({ name: e.name.trim(), isGoalkeeper: Boolean(e.isGoalkeeper) })).filter((e) => e.name);
      if (parsed.length < MIN_PLAYERS_QUICK) return;

      const playersPerTeam = Math.max(1, Math.min(MAX_PLAYERS_PER_TEAM, Math.floor(parsed.length / QUICK_TEAM_COUNT)));
      const teams = buildTeams(QUICK_TEAM_COUNT);
      const capacity = playersPerTeam * QUICK_TEAM_COUNT;

      const shuffled = [...parsed].sort(() => Math.random() - 0.5).slice(0, capacity);

      let goalkeeperSlotsLeft = QUICK_TEAM_COUNT;
      const players: Player[] = shuffled.map((entry, i) => {
        const team = teams[i % QUICK_TEAM_COUNT];
        const isGoalkeeper = entry.isGoalkeeper && goalkeeperSlotsLeft > 0;
        if (isGoalkeeper) goalkeeperSlotsLeft -= 1;
        return {
          id: `player-${Date.now()}-${i}`,
          name: entry.name,
          teamId: team.id,
          spotIndex: Math.floor(i / QUICK_TEAM_COUNT),
          isGoalkeeper,
        };
      });

      setConfig({ teamCount: QUICK_TEAM_COUNT, playersPerTeam, teams, players, assignmentMode: "random" });
      navigate(".", { state: { step: "export" } });
    },
    [navigate],
  );

  const goNext = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(step);
    const next = STEP_ORDER[Math.min(currentIndex + 1, STEP_ORDER.length - 1)];
    navigate(".", { state: { step: next } });
  }, [step, navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const setTeamCount = useCallback((count: number) => {
    setConfig((prev) => ({
      ...prev,
      teamCount: count,
      teams: buildTeams(count),
    }));
  }, []);

  const setPlayersPerTeam = useCallback((count: number) => {
    setConfig((prev) => ({ ...prev, playersPerTeam: count }));
  }, []);

  const addPlayer = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setConfig((prev) => ({
      ...prev,
      players: [
        ...prev.players,
        {
          id: `player-${Date.now()}-${prev.players.length}`,
          name: trimmed,
          teamId: null,
          spotIndex: null,
          isGoalkeeper: false,
        },
      ],
    }));
  }, []);

  const addPlayers = useCallback((entries: { name: string; isGoalkeeper?: boolean }[]) => {
    const trimmed = entries.map((e) => ({ name: e.name.trim(), isGoalkeeper: Boolean(e.isGoalkeeper) })).filter((e) => e.name.length > 0);
    if (trimmed.length === 0) return;

    setConfig((prev) => {
      const existingGoalkeepers = prev.players.filter((p) => p.isGoalkeeper).length;
      let slotsLeft = Math.max(0, prev.teamCount - existingGoalkeepers);

      const newPlayers: Player[] = trimmed.map((entry, i) => {
        const isGoalkeeper = entry.isGoalkeeper && slotsLeft > 0;
        if (isGoalkeeper) slotsLeft -= 1;
        return {
          id: `player-${Date.now()}-${prev.players.length + i}`,
          name: entry.name,
          teamId: null,
          spotIndex: null,
          isGoalkeeper,
        };
      });

      return { ...prev, players: [...prev.players, ...newPlayers] };
    });
  }, []);

  const removePlayer = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      players: prev.players.filter((player) => player.id !== id),
    }));
  }, []);

  const removeAllPlayers = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      players: [],
    }));
  }, []);

  const toggleGoalkeeper = useCallback((id: string) => {
    setConfig((prev) => {
      const target = prev.players.find((player) => player.id === id);
      if (!target) return prev;

      if (!target.isGoalkeeper) {
        const goalkeeperCount = prev.players.filter((player) => player.isGoalkeeper).length;
        if (goalkeeperCount >= prev.teamCount) return prev;
      }

      return {
        ...prev,
        players: prev.players.map((player) => (player.id === id ? { ...player, isGoalkeeper: !player.isGoalkeeper } : player)),
      };
    });
  }, []);

  const setAssignmentMode = useCallback((mode: AssignmentMode) => {
    setConfig((prev) => ({ ...prev, assignmentMode: mode }));
  }, []);

  const resetAssignments = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      assignmentMode: null,
      players: prev.players.map((player) => ({
        ...player,
        teamId: null,
        spotIndex: null,
      })),
    }));
  }, []);

  const assignPlayerToTeam = useCallback((playerId: string, teamId: string, spotIndex?: number) => {
    setConfig((prev) => {
      const target = prev.players.find((p) => p.id === playerId);
      if (!target) return prev;

      const teammates = prev.players.filter((p) => p.teamId === teamId && p.id !== playerId);
      const isMovingWithinTeam = target.teamId === teamId;

      if (target.isGoalkeeper && spotIndex !== undefined && spotIndex !== 0) {
        return prev;
      }

      const requestedSpotIndex = target.isGoalkeeper ? 0 : spotIndex;

      if (!isMovingWithinTeam && teammates.length >= prev.playersPerTeam) {
        return prev;
      }

      if (target.isGoalkeeper && teammates.some((p) => p.isGoalkeeper)) {
        return prev;
      }

      if (requestedSpotIndex !== undefined && teammates.some((player) => player.spotIndex === requestedSpotIndex)) {
        return prev;
      }

      const occupiedSpots = new Set(teammates.map((player) => player.spotIndex).filter((index): index is number => index !== null));
      const nextFreeSpot = Array.from({ length: prev.playersPerTeam }, (_, index) => index).find((index) => !occupiedSpots.has(index));

      const nextSpotIndex = requestedSpotIndex ?? (isMovingWithinTeam && target.spotIndex !== null ? target.spotIndex : nextFreeSpot);

      if (nextSpotIndex === undefined) return prev;

      return {
        ...prev,
        players: prev.players.map((player) => (player.id === playerId ? { ...player, teamId, spotIndex: nextSpotIndex } : player)),
      };
    });
  }, []);

  const unassignPlayer = useCallback((playerId: string) => {
    setConfig((prev) => ({
      ...prev,
      players: prev.players.map((player) => (player.id === playerId ? { ...player, teamId: null, spotIndex: null } : player)),
    }));
  }, []);

  const drawTeams = useCallback(() => {
    setConfig((prev) => {
      const shuffle = <T>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

      const goalkeepers = shuffle(prev.players.filter((p) => p.isGoalkeeper));
      const rest = shuffle(prev.players.filter((p) => !p.isGoalkeeper));

      let teamIndex = 0;
      const nextSpotByTeam = prev.teams.reduce<Record<string, number>>((acc, team) => ({ ...acc, [team.id]: 0 }), {});
      const assignRoundRobin = (list: Player[]): Player[] =>
        list.map((player) => {
          const team = prev.teams[teamIndex % prev.teams.length];
          teamIndex += 1;
          const spotIndex = nextSpotByTeam[team.id];
          nextSpotByTeam[team.id] += 1;
          return { ...player, teamId: team.id, spotIndex };
        });

      const playersWithTeams = [...assignRoundRobin(goalkeepers), ...assignRoundRobin(rest)];

      return { ...prev, players: playersWithTeams };
    });
  }, []);

  const reset = useCallback(() => {
    setConfig(createEmptyConfig());
    navigate(".", { replace: true, state: { step: "welcome" } });
  }, [navigate]);

  return {
    step,
    config,
    quickFriendlyDraft,
    goNext,
    goBack,
    setTeamCount,
    setPlayersPerTeam,
    addPlayer,
    addPlayers,
    removePlayer,
    removeAllPlayers,
    toggleGoalkeeper,
    setAssignmentMode,
    resetAssignments,
    assignPlayerToTeam,
    unassignPlayer,
    drawTeams,
    reset,
  };
}
