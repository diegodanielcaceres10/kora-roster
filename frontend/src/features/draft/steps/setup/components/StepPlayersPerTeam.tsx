import { FormattedMessage, useIntl } from "react-intl";
import { MIN_PLAYERS_PER_TEAM, MAX_PLAYERS_PER_TEAM, PLAYERS_PER_TEAM_OPTIONS } from "../../../draft.constants";
import styles from "../setup.module.scss";

interface StepPlayersPerTeamProps {
  teamCount: number;
  playersPerTeam: number;
  onChange: (count: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPlayersPerTeam({ teamCount, playersPerTeam, onChange, onNext, onBack }: StepPlayersPerTeamProps) {
  const intl = useIntl();
  const decrement = () => onChange(Math.max(MIN_PLAYERS_PER_TEAM, playersPerTeam - 1));
  const increment = () => onChange(Math.min(MAX_PLAYERS_PER_TEAM, playersPerTeam + 1));

  const totalPlayers = teamCount * playersPerTeam;

  return (
    <section className={styles.setup__step}>
      <p className={styles.setup__eyebrow}>
        <FormattedMessage id="setup.step.progress" values={{ step: 2, total: 3 }} />
      </p>
      <h1 className={styles.setup__title}>
        <FormattedMessage id="setup.playersPerTeam.title" />
      </h1>
      <p className={styles.setup__description}>
        <FormattedMessage id="setup.teamCount.description1" />
      </p>

      <div className={styles.setup__options}>
        {PLAYERS_PER_TEAM_OPTIONS.map((option) => (
          <button key={option} type="button" className={[styles.setup__option, option === playersPerTeam ? styles["setup__option--active"] : ""].join(" ")} onClick={() => onChange(option)}>
            {option}
          </button>
        ))}
      </div>

      <p className={styles.setup__description}>
        <FormattedMessage id="setup.teamCount.description2" />
      </p>

      <div className={styles.setup__stepperCard}>
        <button type="button" className={styles.setup__button} onClick={decrement} disabled={playersPerTeam <= MIN_PLAYERS_PER_TEAM} aria-label={intl.formatMessage({ id: "setup.playersPerTeam.decrementAriaLabel" })}>
          <i className="fa-solid fa-minus"></i>
        </button>
        <span className={styles.setup__divider} aria-hidden="true" />
        <span className={styles.setup__value}>{playersPerTeam}</span>
        <span className={styles.setup__divider} aria-hidden="true" />
        <button type="button" className={styles.setup__button} onClick={increment} disabled={playersPerTeam >= MAX_PLAYERS_PER_TEAM} aria-label={intl.formatMessage({ id: "setup.playersPerTeam.incrementAriaLabel" })}>
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>

      <p className={styles.setup__note}>
        <i className="fa-solid fa-circle-info"></i>
        <FormattedMessage
          id="setup.playersPerTeam.note"
          values={{
            teamCount,
            totalPlayers,
            b: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
          }}
        />
      </p>

      <div className={styles.setup__actions}>
        <button type="button" className={styles.setup__secondaryButton} onClick={onBack}>
          <i className="fa-solid fa-arrow-left"></i>
          <FormattedMessage id="setup.actions.back" />
        </button>
        <button type="button" className={styles.setup__primaryButton} onClick={onNext}>
          <FormattedMessage id="setup.actions.next" />
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </section>
  );
}
