import { forwardRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import type { DraftConfig } from "../../../draft.types";
import styles from "./image.module.scss";
import koraRosterLogo from "../../../../../assets/logo/kora-roster-logo.webp";
import koraBibs from "../../../../../assets/illustrations/kora-bibs.webp";

interface ImageProps {
  config: DraftConfig;
  variant?: "preview" | "export";
}

export const Image = forwardRef<HTMLDivElement, ImageProps>(function Image({ config, variant = "preview" }, ref) {
  const intl = useIntl();

  return (
    <div ref={ref} className={[styles.image, variant === "export" ? styles["image--export"] : ""].join(" ").trim()}>
      <div className={styles.image__header}>
        <img src={koraRosterLogo} alt="Kora" className={styles.image__logo} />
      </div>

      <div className={styles.image__teams}>
        {config.teams.map((team) => {
          const players = config.players.filter((player) => player.teamId === team.id).sort((a, b) => (a.spotIndex ?? Number.MAX_SAFE_INTEGER) - (b.spotIndex ?? Number.MAX_SAFE_INTEGER));

          return (
            <div key={team.id} className={styles.image__team}>
              <div className={[styles.image__teamHeader, `custom-bib-${team.color}`].join(" ")}>
                <i className="fa-solid fa-shirt"></i>
                {team.name}
              </div>
              <ul className={styles.image__roster}>
                {players.map((player, index) => (
                  <li key={player.id} className={styles.image__player}>
                    <strong>{index + 1}</strong>
                    <span>{player.name}</span>
                    {player.isGoalkeeper && (
                      <span className={styles.image__goalkeeperBadge} aria-label={intl.formatMessage({ id: "image.goalkeeperAriaLabel" })}>
                        <i className="fa-solid fa-mitten"></i>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className={styles.image__footer}>
        <div className={styles.image__credit}>
          <img src={koraRosterLogo} alt="" />
          <span>
            <FormattedMessage id="image.credit" />
          </span>
        </div>
        <img src={koraBibs} alt="" className={styles.image__bibs} />
      </div>
    </div>
  );
});
