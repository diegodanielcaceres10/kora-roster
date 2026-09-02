import { useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import styles from "./welcome.module.scss";
import koraRosterLogo from "../../../../assets/logo/kora-roster-logo.png";
import koraBibs from "../../../../assets/illustrations/kora-bibs.png";

interface StepWelcomeProps {
  onStart: () => void;
}

export function StepWelcome({ onStart }: StepWelcomeProps) {
  const navigate = useNavigate();

  return (
    <section className={styles.welcome}>
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

        <div className={styles.welcome__actions}>
          <button type="button" className={styles.welcome__primaryButton} onClick={onStart}>
            <i className="fa-solid fa-user-group"></i>
            <FormattedMessage id="welcome.actions.primary" />
          </button>
          <button type="button" className={styles.welcome__secondaryButton} onClick={() => navigate("/tutorial")}>
            <i className="fa-solid fa-circle-info"></i>
            <FormattedMessage id="welcome.actions.secondary" />
          </button>
        </div>
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
        <div className={styles.welcome__illustration} aria-hidden="true">
          <img src={koraBibs} alt="" />
        </div>
      </div>
    </section>
  );
}
