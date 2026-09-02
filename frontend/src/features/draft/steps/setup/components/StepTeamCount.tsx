import { FormattedMessage, useIntl } from "react-intl";
import { MIN_TEAMS, MAX_TEAMS, TEAM_COUNT_OPTIONS } from "../../../draft.constants";
import styles from "../setup.module.scss";

interface StepTeamCountProps {
  teamCount: number;
  onChange: (count: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepTeamCount({ teamCount, onChange, onNext, onBack }: StepTeamCountProps) {
  const intl = useIntl();
  const decrement = () => onChange(Math.max(MIN_TEAMS, teamCount - 1));
  const increment = () => onChange(Math.min(MAX_TEAMS, teamCount + 1));

  return (
    <section className={styles.setup__step}>
      <p className={styles.setup__eyebrow}>
        <FormattedMessage id="setup.step.progress" values={{ step: 1, total: 3 }} />
      </p>
      <h1 className={styles.setup__title}>
        <FormattedMessage id="setup.teamCount.title" />
      </h1>
      <p className={styles.setup__description}>
        <FormattedMessage id="setup.teamCount.description1" />
      </p>

      <div className={styles.setup__chips}>
        {TEAM_COUNT_OPTIONS.map((option) => (
          <button key={option} type="button" className={[styles.setup__chip, option === teamCount ? styles["setup__chip--active"] : ""].join(" ")} onClick={() => onChange(option)}>
            <span className={styles.setup__shirts}>
              {Array.from({ length: option }).map((_, i) => (
                <i key={i} className="fa-solid fa-shirt"></i>
              ))}
            </span>
            <span className={styles.setup__number}>{option}</span>
          </button>
        ))}
      </div>

      <p className={styles.setup__description}>
        <FormattedMessage id="setup.teamCount.description2" />
      </p>

      <div className={styles.setup__stepperCard}>
        <button type="button" className={styles.setup__button} onClick={decrement} disabled={teamCount <= MIN_TEAMS} aria-label={intl.formatMessage({ id: "setup.teamCount.decrementAriaLabel" })}>
          <i className="fa-solid fa-minus"></i>
        </button>
        <span className={styles.setup__divider} aria-hidden="true" />
        <span className={styles.setup__value}>{teamCount}</span>
        <span className={styles.setup__divider} aria-hidden="true" />
        <button type="button" className={styles.setup__button} onClick={increment} disabled={teamCount >= MAX_TEAMS} aria-label={intl.formatMessage({ id: "setup.teamCount.incrementAriaLabel" })}>
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>

      <p className={styles.setup__helper}>
        <FormattedMessage id="setup.teamCount.helperMin" values={{ count: MIN_TEAMS }} /> <span aria-hidden="true">•</span> <FormattedMessage id="setup.teamCount.helperMax" values={{ count: MAX_TEAMS }} />
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
