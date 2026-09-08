import { forwardRef } from "react";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import type { DraftConfig } from "../../../draft.types";
import styles from "./ExportImagePreview.module.scss";
import koraRosterLogo from "../../../../../assets/logo/kora-roster-logo.webp";
import qrKoraRoster from "../../../../../assets/qrs/qr_kora_roster.png";
import qrPortfolio from "../../../../../assets/qrs/qr_portfolio.png";

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
        <small>
          <i className="fa-regular fa-calendar"></i>
          <FormattedMessage
            id="common.currentDate"
            defaultMessage="{date}"
            values={{
              date: <FormattedDate value={new Date()} year="numeric" month="long" day="2-digit" />,
            }}
          />
        </small>
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
                    <strong className={[`custom-bib-${team.color}`].join(" ")}>{index + 1}</strong>
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
          <span>
            <FormattedMessage id="image.credit" />
            <strong>Kora</strong>
          </span>
          <div className={styles.image__qr}>
            <img src={qrKoraRoster} alt="QR Code for Kora Roster Web" />
          </div>
        </div>
        <div className={styles.image__author}>
          <span>
            <FormattedMessage id="image.author" />
          </span>
          <div className={styles.image__qr}>
            <img src={qrPortfolio} alt="QR Code for Diego Daniel Caceres Portfolio" />
          </div>
        </div>
      </div>
    </div>
  );
});
