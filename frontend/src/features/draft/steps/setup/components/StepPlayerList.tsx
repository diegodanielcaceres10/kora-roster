import { useState, type FormEvent } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import type { Player } from "../../../draft.types";
import styles from "../setup.module.scss";
import { parsePastedNames, type ParsedPlayerName } from "../../../utils/parsePastedNames";

interface StepPlayerListProps {
  players: Player[];
  totalNeeded: number;
  teamCount: number;
  onAdd: (name: string) => void;
  onAddMany: (names: ParsedPlayerName[]) => void;
  onRemove: (id: string) => void;
  onRemoveAll: () => void;
  onToggleGoalkeeper: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPlayerList({ players, totalNeeded, teamCount, onAdd, onAddMany, onRemove, onRemoveAll, onToggleGoalkeeper, onNext, onBack }: StepPlayerListProps) {
  const intl = useIntl();
  const [name, setName] = useState("");
  const [isPasteMode, setIsPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const overflowCount = Math.max(0, players.length - totalNeeded);
  const isComplete = totalNeeded > 0 && players.length === totalNeeded;
  const goalkeeperCount = players.filter((p) => p.isGoalkeeper).length;
  const goalkeeperCapReached = goalkeeperCount >= teamCount;
  const canAdd = totalNeeded === 0 || players.length < totalNeeded;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !canAdd) return;
    onAdd(name);
    setName("");
  };

  const handlePasteSubmit = (event: FormEvent) => {
    event.preventDefault();
    const entries = parsePastedNames(pasteText);
    if (entries.length === 0) return;
    onAddMany(entries);
    setPasteText("");
    setIsPasteMode(false);
  };

  return (
    <section className={[styles.setup__step, styles["setup__step--narrow"]].join(" ")}>
      <p className={styles.setup__eyebrow}>
        <FormattedMessage id="setup.step.progress" values={{ step: 3, total: 3 }} />
      </p>
      <h1 className={styles.setup__title}>
        <FormattedMessage id="setup.playerList.title" />
      </h1>
      <p className={styles.setup__description}>
        <FormattedMessage id="setup.playerList.description" values={{ teamCount, goalkeeperCount }} />
      </p>

      {!isPasteMode && (
        <>
          <form className={styles.setup__form} onSubmit={handleSubmit}>
            <input
              name="player"
              type="text"
              placeholder={intl.formatMessage({
                id: canAdd ? "setup.playerList.namePlaceholder" : "setup.playerList.namePlaceholderComplete",
              })}
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={!canAdd}
            />
            <button type="submit" className={styles.setup__add} disabled={!canAdd}>
              <FormattedMessage id="setup.playerList.addButton" />
            </button>
          </form>

          <button type="button" className={styles.setup__pasteToggle} onClick={() => setIsPasteMode(true)} disabled={!canAdd}>
            <i className="fa-solid fa-paste"></i>
            <FormattedMessage id="setup.playerList.pasteToggle" />
          </button>
        </>
      )}

      {isPasteMode && (
        <form className={styles.setup__pasteForm} onSubmit={handlePasteSubmit}>
          <textarea className={styles.setup__textarea} placeholder={intl.formatMessage({ id: "setup.playerList.pastePlaceholder" })} value={pasteText} onChange={(event) => setPasteText(event.target.value)} rows={5} autoFocus />
          <div className={styles.setup__pasteActions}>
            <button
              type="button"
              className={styles.setup__pasteCancel}
              onClick={() => {
                setIsPasteMode(false);
                setPasteText("");
              }}
            >
              <FormattedMessage id="setup.playerList.pasteCancel" />
            </button>
            <button type="submit" className={styles.setup__add}>
              <FormattedMessage id="setup.playerList.pasteSubmit" />
            </button>
          </div>
        </form>
      )}

      <p className={[styles.setup__counter, isComplete ? styles["setup__counter--complete"] : "", overflowCount > 0 ? styles["setup__counter--overflow"] : ""].join(" ")}>
        <FormattedMessage id="setup.playerList.counter" values={{ count: players.length, total: totalNeeded }} />
      </p>

      {overflowCount > 0 && (
        <p className={styles.setup__alert}>
          <i className="fa-solid fa-triangle-exclamation"></i>
          <FormattedMessage id="setup.playerList.overflowAlert" values={{ count: overflowCount }} />
        </p>
      )}

      <ul className={[styles.setup__list, "custom_scroll"].join(" ")}>
        {players.map((player) => (
          <li key={player.id} className={styles.setup__player}>
            <span className={styles.setup__name}>{player.name}</span>
            <button type="button" className={[styles.setup__goalkeeper, player.isGoalkeeper ? styles["setup__goalkeeper--active"] : ""].join(" ")} onClick={() => onToggleGoalkeeper(player.id)} disabled={!player.isGoalkeeper && goalkeeperCapReached} aria-pressed={player.isGoalkeeper} title={!player.isGoalkeeper && goalkeeperCapReached ? intl.formatMessage({ id: "setup.playerList.goalkeeperMaxTitle" }, { count: teamCount }) : intl.formatMessage({ id: "setup.playerList.goalkeeperToggleTitle" })}>
              <i className={"fa-solid fa-mitten"}></i>
            </button>
            <button type="button" className={styles.setup__remove} onClick={() => onRemove(player.id)} aria-label={intl.formatMessage({ id: "setup.playerList.removeAriaLabel" }, { name: player.name })}>
              ×
            </button>
          </li>
        ))}
        {players.length > 1 && (
          <button type="button" className={styles.setup__clean} onClick={onRemoveAll}>
            <i className="fa-solid fa-trash"></i>
            <FormattedMessage id="setup.playerList.clearList" />
          </button>
        )}
      </ul>

      <div className={styles.setup__actions}>
        <button type="button" className={styles.setup__secondaryButton} onClick={onBack}>
          <i className="fa-solid fa-arrow-left"></i>
          <FormattedMessage id="setup.actions.back" />
        </button>
        <button type="button" className={styles.setup__primaryButton} onClick={onNext} disabled={!isComplete}>
          <FormattedMessage id="setup.actions.next" />
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </section>
  );
}
