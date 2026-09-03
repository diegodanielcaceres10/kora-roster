import { useState, useMemo, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import styles from "./welcome.module.scss";
import koraRosterLogo from "../../../../assets/logo/kora-roster-logo.png";
import koraRosterWelcome from "../../../../assets/illustrations/kora-welcome.png";
import { parsePastedNames, type ParsedPlayerName } from "../../utils/parsePastedNames";

const QUICK_TEAM_COUNT = 2;
const MIN_PLAYERS_QUICK = 6;
const MAX_PLAYERS_PER_TEAM_QUICK = 11;
const MAX_PLAYERS_QUICK = MAX_PLAYERS_PER_TEAM_QUICK * QUICK_TEAM_COUNT; // 22

type QuickValidation = { status: "empty" } | { status: "valid" } | { status: "error"; messageId: string; values?: Record<string, number> };

function getQuickValidation(count: number): QuickValidation {
  if (count === 0) return { status: "empty" };
  if (count < MIN_PLAYERS_QUICK) {
    return { status: "error", messageId: "welcome.quick.error.min", values: { min: MIN_PLAYERS_QUICK } };
  }
  if (count > MAX_PLAYERS_QUICK) {
    return { status: "error", messageId: "welcome.quick.error.max", values: { max: MAX_PLAYERS_QUICK } };
  }
  if (count % 2 !== 0) {
    return { status: "error", messageId: "welcome.quick.error.odd" };
  }
  return { status: "valid" };
}

interface StepWelcomeProps {
  onStart: () => void;
  onQuickFriendly: (names: ParsedPlayerName[]) => void;
}

export function StepWelcome({ onStart, onQuickFriendly }: StepWelcomeProps) {
  const navigate = useNavigate();
  const intl = useIntl();
  const [isQuickMode, setIsQuickMode] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const names = useMemo(() => parsePastedNames(pasteText), [pasteText]);
  const validation = useMemo(() => getQuickValidation(names.length), [names.length]);

  const handleQuickSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (validation.status !== "valid") return;
    onQuickFriendly(names);
  };

  return (
    <section className={styles.welcome}>
      <img className={styles.welcome__background} src={koraRosterWelcome} alt="Kora Roster Background" />
      <div className={styles.welcome__content}>
        <div className={styles.welcome__logo}>
          <img src={koraRosterLogo} alt="" />
        </div>
        <h1 className={styles.welcome__title}>
          <FormattedMessage id="welcome.title.line1" />
          <br />
          <span className={styles.welcome__highlight}>
            <FormattedMessage id="welcome.title.highlight" />
          </span>
        </h1>

        <p className={styles.welcome__description}>
          <FormattedMessage id="welcome.description.line1" />
          <br />
          <FormattedMessage id="welcome.description.line2" />
        </p>

        {!isQuickMode && (
          <div className={styles.welcome__actions}>
            <button type="button" className={styles.welcome__primaryButton} onClick={() => setIsQuickMode((prev) => !prev)} aria-expanded={isQuickMode}>
              <i className="fa-solid fa-bolt"></i>
              <FormattedMessage id="welcome.actions.quickFriendly" />
            </button>
            <button type="button" className={styles.welcome__quickButton} onClick={onStart}>
              <i className="fa-solid fa-user-group"></i>
              <FormattedMessage id="welcome.actions.primary" />
            </button>
            <button type="button" className={styles.welcome__secondaryButton} onClick={() => navigate("/tutorial")}>
              <i className="fa-solid fa-circle-info"></i>
              <FormattedMessage id="welcome.actions.secondary" />
            </button>
          </div>
        )}

        <ul className={styles.welcome__stats}>
          <li>
            <i className="fa-solid fa-gift"></i>
            <FormattedMessage id="welcome.stats.free" />
          </li>
          <li>
            <i className="fa-solid fa-bolt"></i>
            <FormattedMessage id="welcome.stats.fast" />
          </li>
          <li>
            <i className="fa-solid fa-share-nodes"></i>
            <FormattedMessage id="welcome.stats.shareable" />
          </li>
        </ul>
      </div>
      <div className={styles.welcome__content}>
        {isQuickMode && (
          <form className={styles.welcome__quickPanel} onSubmit={handleQuickSubmit}>
            <p className={styles.welcome__quickHint}>
              <FormattedMessage id="welcome.quick.hint" />
            </p>
            <textarea className={[styles.welcome__quickTextarea, "custom_scroll"].join(" ")} value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder={intl.formatMessage({ id: "welcome.quick.placeholder" })} rows={6} autoFocus />
            <div className={styles.welcome__quickFooter}>
              <span className={validation.status === "error" ? `${styles.welcome__quickCount} ${styles["welcome__quickCount--error"]}` : styles.welcome__quickCount}>
                {validation.status === "error" ? (
                  <FormattedMessage id={validation.messageId} values={validation.values} />
                ) : (
                  <>
                    {names.length} <FormattedMessage id="welcome.quick.playersDetected" />
                  </>
                )}
              </span>
              <div className={styles.welcome__quickActions}>
                <button type="button" onClick={() => setIsQuickMode(false)}>
                  <FormattedMessage id="welcome.quick.cancel" />
                </button>
                <button type="submit" disabled={validation.status !== "valid"}>
                  <FormattedMessage id="welcome.quick.submit" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
