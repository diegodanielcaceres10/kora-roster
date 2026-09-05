import { useMemo, useState, type DragEvent } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import type { AssignmentMode, DraftConfig, Player, Team } from "../../draft.types";
import styles from "./draw.module.scss";

interface StepDrawProps {
  config: DraftConfig;
  setAssignmentMode: (mode: AssignmentMode) => void;
  resetAssignments: () => void;
  assignPlayerToTeam: (playerId: string, teamId: string, spotIndex?: number) => void;
  unassignPlayer: (playerId: string) => void;
  drawTeams: () => void;
  onNext: () => void;
  onBack: () => void;
}

const FORMATION_SPOTS_BY_SIZE: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 50, y: 48 }],
  2: [
    { x: 38, y: 38 },
    { x: 62, y: 62 },
  ],
  3: [
    { x: 50, y: 18 },
    { x: 34, y: 52 },
    { x: 66, y: 52 },
  ],
  4: [
    { x: 50, y: 15 },
    { x: 30, y: 45 },
    { x: 70, y: 45 },
    { x: 50, y: 75 },
  ],
  5: [
    { x: 50, y: 12 },
    { x: 32, y: 34 },
    { x: 68, y: 34 },
    { x: 35, y: 68 },
    { x: 65, y: 68 },
  ],
  6: [
    { x: 50, y: 12 },
    { x: 30, y: 34 },
    { x: 70, y: 34 },
    { x: 30, y: 62 },
    { x: 70, y: 62 },
    { x: 50, y: 82 },
  ],
  7: [
    { x: 50, y: 12 },
    { x: 26, y: 32 },
    { x: 50, y: 32 },
    { x: 74, y: 32 },
    { x: 34, y: 62 },
    { x: 66, y: 62 },
    { x: 50, y: 82 },
  ],
  8: [
    { x: 50, y: 10 },
    { x: 26, y: 30 },
    { x: 50, y: 30 },
    { x: 74, y: 30 },
    { x: 26, y: 56 },
    { x: 50, y: 56 },
    { x: 74, y: 56 },
    { x: 50, y: 80 },
  ],
  9: [
    { x: 50, y: 10 },
    { x: 26, y: 30 },
    { x: 50, y: 30 },
    { x: 74, y: 30 },
    { x: 22, y: 55 },
    { x: 50, y: 48 },
    { x: 78, y: 55 },
    { x: 36, y: 78 },
    { x: 64, y: 78 },
  ],
  10: [
    { x: 50, y: 10 },
    { x: 22, y: 28 },
    { x: 41, y: 28 },
    { x: 59, y: 28 },
    { x: 78, y: 28 },
    { x: 28, y: 55 },
    { x: 50, y: 52 },
    { x: 72, y: 55 },
    { x: 38, y: 80 },
    { x: 62, y: 80 },
  ],
  11: [
    { x: 50, y: 10 },
    { x: 20, y: 27 },
    { x: 40, y: 27 },
    { x: 60, y: 27 },
    { x: 80, y: 27 },
    { x: 25, y: 52 },
    { x: 50, y: 50 },
    { x: 75, y: 52 },
    { x: 30, y: 78 },
    { x: 50, y: 82 },
    { x: 70, y: 78 },
  ],
};

export function StepDraw({ config, setAssignmentMode, resetAssignments, assignPlayerToTeam, unassignPlayer, drawTeams, onNext, onBack }: StepDrawProps) {
  const intl = useIntl();
  const [selectedTeamId, setSelectedTeamId] = useState(config.teams[0]?.id ?? "");
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [spotModal, setSpotModal] = useState<{
    teamId: string;
    spotIndex: number;
  } | null>(null);

  const selectedTeam = config.teams.find((team) => team.id === selectedTeamId) ?? config.teams[0];

  const assignedCount = config.players.filter((player) => player.teamId !== null).length;
  const availablePlayers = config.players.filter((player) => player.teamId === null);
  const draggedPlayer = config.players.find((player) => player.id === draggedPlayerId);
  const availableCount = config.players.length - assignedCount;
  const allAssigned = config.players.length > 0 && config.players.every((player) => player.teamId !== null);

  const playersByTeam = useMemo(
    () =>
      config.teams.reduce<Record<string, typeof config.players>>(
        (acc, team) => ({
          ...acc,
          [team.id]: config.players.filter((player) => player.teamId === team.id),
        }),
        {},
      ),
    [config.players, config.teams],
  );
  const lineupsByTeam = useMemo(
    () =>
      config.teams.reduce<Record<string, Array<Player | undefined>>>((acc, team) => {
        const lineup: Array<Player | undefined> = Array.from({
          length: config.playersPerTeam,
        });
        const unplacedPlayers: Player[] = [];

        (playersByTeam[team.id] ?? []).forEach((player) => {
          if (player.spotIndex !== null && player.spotIndex >= 0 && player.spotIndex < config.playersPerTeam && !lineup[player.spotIndex]) {
            lineup[player.spotIndex] = player;
            return;
          }

          unplacedPlayers.push(player);
        });

        unplacedPlayers.forEach((player) => {
          const nextIndex = lineup.findIndex((spotPlayer) => !spotPlayer);
          if (nextIndex !== -1) lineup[nextIndex] = player;
        });

        return { ...acc, [team.id]: lineup };
      }, {}),
    [config.playersPerTeam, config.teams, playersByTeam],
  );
  const formationSpots = FORMATION_SPOTS_BY_SIZE[config.playersPerTeam] ?? FORMATION_SPOTS_BY_SIZE[11];
  const spotModalTeam = spotModal ? config.teams.find((team) => team.id === spotModal.teamId) : undefined;
  const spotModalPlayer = spotModal && spotModalTeam ? lineupsByTeam[spotModalTeam.id]?.[spotModal.spotIndex] : undefined;
  const spotModalTeamHasGoalkeeper = spotModalTeam ? playersByTeam[spotModalTeam.id]?.some((player) => player.isGoalkeeper) : false;
  const assignableModalPlayers = spotModal
    ? availablePlayers.filter((player) => {
        if (!player.isGoalkeeper) return true;
        if (spotModal.spotIndex !== 0) return false;
        return !spotModalTeamHasGoalkeeper;
      })
    : [];

  const handleDragStart = (event: DragEvent<HTMLElement>, playerId: string) => {
    event.dataTransfer.setData("text/plain", playerId);
    event.dataTransfer.effectAllowed = "move";
    setDraggedPlayerId(playerId);
  };

  const handleDragEnd = () => {
    setDraggedPlayerId(null);
    setDragOverZone(null);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>, zone: string) => {
    event.preventDefault();
    if (dragOverZone !== zone) setDragOverZone(zone);
  };

  const handleDropOnTeam = (event: DragEvent<HTMLElement>, team: Team, spotIndex?: number) => {
    event.preventDefault();
    event.stopPropagation();
    const playerId = event.dataTransfer.getData("text/plain");
    setDragOverZone(null);
    if (!playerId) return;

    setAssignmentMode("manual");
    setSelectedTeamId(team.id);
    assignPlayerToTeam(playerId, team.id, spotIndex);
  };

  const handleDropOnAvailable = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const playerId = event.dataTransfer.getData("text/plain");
    setDragOverZone(null);
    if (!playerId) return;

    setAssignmentMode("manual");
    unassignPlayer(playerId);
  };

  const handleDrawTeams = () => {
    setAssignmentMode("random");
    drawTeams();
  };

  const handleResetAssignments = () => {
    resetAssignments();
    setSelectedTeamId(config.teams[0]?.id ?? "");
    setSpotModal(null);
  };

  const handleOpenSpotModal = (team: Team, spotIndex: number) => {
    setSelectedTeamId(team.id);
    setSpotModal({ teamId: team.id, spotIndex });
  };

  const handleAssignFromModal = (playerId: string) => {
    if (!spotModalTeam || !spotModal) return;

    setAssignmentMode("manual");
    assignPlayerToTeam(playerId, spotModalTeam.id, spotModal.spotIndex);
    setSpotModal(null);
  };

  const handleUnassignFromModal = () => {
    if (!spotModalPlayer) return;

    setAssignmentMode("manual");
    unassignPlayer(spotModalPlayer.id);
    setSpotModal(null);
  };

  return (
    <section className={styles.draw}>
      <div className={styles.draw__content}>
        <div className={styles.draw__board}>
          <div className={styles.draw__container}>
            <div className={styles.draw__header}>
              <p className={styles.draw__eyebrow}>
                <FormattedMessage id="draw.header.eyebrow" />
              </p>
              <h1 className={styles.draw__title}>
                <FormattedMessage id="draw.header.title" />
              </h1>
              <p className={styles.draw__description}>
                <FormattedMessage id="draw.header.description" />
              </p>
            </div>
            <button type="button" className={styles.draw__automatic} onClick={handleDrawTeams}>
              <i className="fa-solid fa-shuffle"></i>
              <FormattedMessage id="draw.automaticButton" />
            </button>
            <div className={styles.draw__summary}>
              <span>
                <i className="fa-solid fa-shirt"></i>
                <FormattedMessage id="draw.summary.teams" values={{ count: config.teamCount }} />
              </span>
              <span>
                <i className="fa-solid fa-user-group"></i>
                <FormattedMessage id="draw.summary.players" values={{ assigned: assignedCount, total: config.players.length }} />
              </span>
            </div>
            <div className={[styles.draw__panel, dragOverZone === "available" ? styles["draw__panel--over"] : ""].join(" ")} onDragOver={(event) => handleDragOver(event, "available")} onDragLeave={() => setDragOverZone(null)} onDrop={handleDropOnAvailable}>
              <div className={styles.draw__available}>
                <h2>
                  <FormattedMessage id="draw.available.title" />
                </h2>
                <span>{availableCount}</span>
              </div>
              <ul className={[styles.draw__list, "custom_scroll"].join(" ")}>
                {availablePlayers.map((player) => {
                  return (
                    <li key={player.id} className={styles.draw__player} draggable onDragStart={(event) => handleDragStart(event, player.id)} onDragEnd={handleDragEnd}>
                      <i className="fa-solid fa-grip-vertical"></i>
                      <strong>{player.name}</strong>
                      <span className={[styles.draw__badge, player.isGoalkeeper ? styles["draw__badge--keeper"] : ""].join(" ")}>
                        <i className={player.isGoalkeeper ? "fa-solid fa-mitten" : "fa-solid fa-shirt"}></i>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className={styles.draw__hint}>
                <i className="fa-regular fa-hand-pointer"></i>
                <FormattedMessage id="draw.available.hint" />
              </div>
            </div>
          </div>
          <div className={styles.draw__container}>
            <div className={styles.draw__teams}>
              {config.teams.map((team) => {
                const roster = playersByTeam[team.id] ?? [];
                const filled = roster.length === config.playersPerTeam;
                return (
                  <button key={team.id} type="button" className={[styles.draw__team, filled ? `custom-bib-${team.color}` : undefined, selectedTeam?.id === team.id ? styles["draw__team--active"] : ""].join(" ")} onClick={() => setSelectedTeamId(team.id)} onDragOver={(event) => handleDragOver(event, team.id)} onDragLeave={() => setDragOverZone(null)} onDrop={(event) => handleDropOnTeam(event, team)}>
                    {filled ? <i className="fa-solid fa-shirt"></i> : <i className="fa-solid fa-triangle-exclamation"></i>}
                    <span>{team.name}</span>
                    <strong>
                      {roster.length}/{config.playersPerTeam}
                    </strong>
                  </button>
                );
              })}
            </div>
            <div className={styles.draw__field} onDragOver={(event) => selectedTeam && handleDragOver(event, selectedTeam.id)} onDragLeave={() => setDragOverZone(null)} onDrop={(event) => selectedTeam && handleDropOnTeam(event, selectedTeam)}>
              <div className={styles.draw__pitchLines} aria-hidden="true">
                <span className={styles.draw__boxTop}></span>
                <span className={styles.draw__centerLine}></span>
                <span className={styles.draw__centerCircle}></span>
              </div>
              {formationSpots.map((spot, index) => {
                const player = selectedTeam ? lineupsByTeam[selectedTeam.id]?.[index] : undefined;
                const spotZone = selectedTeam && `${selectedTeam.id}-spot-${index}`;
                const isDraggedPlayerOnSpot = player?.id === draggedPlayerId;
                const canDropOnSpot = !draggedPlayer || ((!draggedPlayer.isGoalkeeper || index === 0) && (!player || isDraggedPlayerOnSpot));

                const openSpotModal = () => {
                  if (selectedTeam) handleOpenSpotModal(selectedTeam, index);
                };
                const spotAriaLabel = `${intl.formatMessage({ id: "draw.modal.spotTitle" }, { number: index + 1 })}: ${player ? player.name : intl.formatMessage({ id: "draw.field.emptySpot" })}`;

                return (
                  <div
                    key={index}
                    className={[styles.draw__spot, dragOverZone === spotZone ? styles["draw__spot--over"] : "", dragOverZone === spotZone && !canDropOnSpot ? styles["draw__spot--blocked"] : ""].join(" ")}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    draggable={Boolean(player)}
                    role="button"
                    tabIndex={0}
                    aria-label={spotAriaLabel}
                    onDragStart={(event) => {
                      if (player) handleDragStart(event, player.id);
                    }}
                    onDragEnd={handleDragEnd}
                    onDragOver={(event) => {
                      event.stopPropagation();
                      if (!spotZone) return;

                      if (canDropOnSpot) {
                        handleDragOver(event, spotZone);
                        return;
                      }

                      event.dataTransfer.dropEffect = "none";
                      if (dragOverZone !== spotZone) setDragOverZone(spotZone);
                    }}
                    onDragLeave={() => setDragOverZone(null)}
                    onDrop={(event) => {
                      if (!selectedTeam) return;

                      if (!canDropOnSpot) {
                        event.preventDefault();
                        event.stopPropagation();
                        setDragOverZone(null);
                        return;
                      }

                      handleDropOnTeam(event, selectedTeam, index);
                    }}
                    onClick={openSpotModal}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      openSpotModal();
                    }}
                  >
                    <span className={[styles.draw__spotIcon, player ? styles["draw__spotIcon--filled"] : "", player ? `custom-bib-${selectedTeam.color}` : ""].join(" ")}>
                      <i className={player?.isGoalkeeper ? "fa-solid fa-mitten" : "fa-solid fa-shirt"}></i>
                    </span>
                    <small>{player?.name ?? intl.formatMessage({ id: "draw.field.emptySpot" })}</small>
                  </div>
                );
              })}
            </div>
            <div className={styles.draw__actions}>
              <button type="button" className={styles.draw__secondaryButton} onClick={onBack}>
                <i className="fa-solid fa-arrow-left"></i>
                <FormattedMessage id="draw.actions.back" />
              </button>
              <button type="button" className={styles.draw__ghostButton} onClick={handleResetAssignments} disabled={assignedCount === 0}>
                <FormattedMessage id="draw.actions.reset" />
              </button>
              <button type="button" className={styles.draw__primaryButton} onClick={onNext} disabled={!allAssigned}>
                <FormattedMessage id="draw.actions.next" />
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {spotModal && spotModalTeam && (
        <div className={styles.draw__modalBackdrop} role="presentation" onClick={() => setSpotModal(null)}>
          <section className={styles.draw__modal} role="dialog" aria-modal="true" aria-labelledby="spot-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className={styles.draw__modalHeader}>
              <div>
                <p>{spotModalTeam.name}</p>
                <h2 id="spot-modal-title">
                  <FormattedMessage id="draw.modal.spotTitle" values={{ number: spotModal.spotIndex + 1 }} />
                </h2>
              </div>
              <button type="button" className={styles.draw__modalClose} aria-label={intl.formatMessage({ id: "draw.modal.closeAriaLabel" })} onClick={() => setSpotModal(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {spotModalPlayer ? (
              <div className={styles.draw__assignedPlayer}>
                <span className={styles.draw__assignedIcon}>
                  <i className={spotModalPlayer.isGoalkeeper ? "fa-solid fa-mitten" : "fa-solid fa-shirt"}></i>
                </span>
                <strong>{spotModalPlayer.name}</strong>
                <button type="button" className={styles.draw__unassignButton} aria-label={intl.formatMessage({ id: "draw.modal.unassignAriaLabel" }, { name: spotModalPlayer.name })} onClick={handleUnassignFromModal}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ) : (
              <div className={styles.draw__modalListWrapper}>
                <p className={styles.draw__modalHint}>
                  <FormattedMessage id="draw.modal.hint" />
                </p>
                {assignableModalPlayers.length > 0 ? (
                  <ul className={[styles.draw__modalPlayerList, "custom_scroll"].join(" ")}>
                    {assignableModalPlayers.map((player) => (
                      <li key={player.id}>
                        <button type="button" className={[styles.draw__modalPlayerButton, player.isGoalkeeper ? styles["draw__modalPlayerButton--keeper"] : ""].join(" ")} onClick={() => handleAssignFromModal(player.id)}>
                          <span>
                            <i className={player.isGoalkeeper ? "fa-solid fa-mitten" : "fa-solid fa-shirt"}></i>
                          </span>
                          <strong>{player.name}</strong>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.draw__emptyModal}>
                    <FormattedMessage id="draw.modal.empty" />
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
