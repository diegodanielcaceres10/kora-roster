import { useNavigate } from "react-router-dom";
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
          Sorteá los equipos
          <br />
          <span className={styles.welcome__highlight}>en 10 segundos</span>
        </h1>

        <p className={styles.welcome__description}>
          Juntá a tu gente, armamos los equipos
          <br />y a jugar. Así de simple.
        </p>

        <div className={styles.welcome__actions}>
          <button type="button" className={styles.welcome__primaryButton} onClick={onStart}>
            <i className="fa-solid fa-user-group"></i>
            Armar equipos ahora
          </button>
          <button type="button" className={styles.welcome__secondaryButton} onClick={() => navigate("/tutorial")}>
            <i className="fa-solid fa-circle-info"></i>
            Cómo funciona
          </button>
        </div>
      </div>
      <div className={styles.welcome__content}>
        <div className={styles.welcome__illustration} aria-hidden="true">
          <img src={koraBibs} alt="" />
        </div>

        <ul className={styles.welcome__stats}>
          <li>
            <i className="fa-solid fa-gift"></i>100% gratis
          </li>
          <li>
            <i className="fa-solid fa-bolt"></i>Rápido y fácil
          </li>
          <li>
            <i className="fa-solid fa-share-nodes"></i>Listo para compartir
          </li>
        </ul>
      </div>
    </section>
  );
}
