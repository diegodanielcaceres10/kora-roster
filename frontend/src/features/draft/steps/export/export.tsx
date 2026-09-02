import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { FormattedMessage, useIntl } from "react-intl";
import type { DraftConfig } from "../../draft.types";
import { Image } from "./components/image";
import styles from "./export.module.scss";

interface StepExportProps {
  config: DraftConfig;
  onBack: () => void;
  onReset: () => void;
}

export function StepExport({ config, onBack, onReset }: StepExportProps) {
  const intl = useIntl();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clipboardMessage, setClipboardMessage] = useState<string | null>(null);

  const shareTitle = intl.formatMessage({ id: "export.share.title" });
  const shareText = intl.formatMessage({ id: "export.share.text" });

  const createResultImage = async () => {
    if (!cardRef.current) return null;

    return toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#063326",
    });
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement("a");
    link.download = "kora-equipos.png";
    link.href = dataUrl;
    link.click();
  };

  const createResultFile = async () => {
    const dataUrl = await createResultImage();
    if (!dataUrl) return null;

    const blob = await (await fetch(dataUrl)).blob();
    return new File([blob], "kora-equipos.png", { type: "image/png" });
  };

  const handleDownload = async () => {
    setIsExporting(true);
    setError(null);
    setClipboardMessage(null);

    try {
      const dataUrl = await createResultImage();
      if (!dataUrl) return;
      downloadImage(dataUrl);
    } catch {
      setError(intl.formatMessage({ id: "export.error.image" }));
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareWhatsApp = async () => {
    setIsExporting(true);
    setError(null);
    setClipboardMessage(null);

    try {
      const file = await createResultFile();
      if (!file) return;

      const shareData = {
        title: shareTitle,
        text: shareText,
        files: [file],
      };

      if (!navigator.canShare?.(shareData)) {
        setError(intl.formatMessage({ id: "export.error.shareUnsupported" }));
        return;
      }

      await navigator.share(shareData);
    } catch {
      setError(intl.formatMessage({ id: "export.error.shareWhatsapp" }));
    } finally {
      setIsExporting(false);
    }
  };

  const createPlainTextResult = () =>
    config.teams
      .map((team) => {
        const players = config.players
          .filter((player) => player.teamId === team.id)
          .sort((a, b) => (a.spotIndex ?? Number.MAX_SAFE_INTEGER) - (b.spotIndex ?? Number.MAX_SAFE_INTEGER))
          .map((player, index) => {
            const goalkeeperLabel = player.isGoalkeeper ? intl.formatMessage({ id: "export.goalkeeperLabel" }) : "";
            return `${index + 1}. ${player.name}${goalkeeperLabel}`;
          });

        return `${team.name}\n${players.join("\n")}`;
      })
      .join("\n\n");

  const handleCopyPlainText = async () => {
    setError(null);
    setClipboardMessage(null);

    try {
      await navigator.clipboard.writeText(createPlainTextResult());
      setClipboardMessage(intl.formatMessage({ id: "export.clipboardSuccess" }));
    } catch {
      setError(intl.formatMessage({ id: "export.error.copy" }));
    }
  };

  return (
    <section className={styles.export}>
      <div className={styles.export__content}>
        <div className={styles.export__preview}>
          <Image ref={cardRef} config={config} />
        </div>

        {error && <p className={styles.export__error}>{error}</p>}
        {clipboardMessage && <p className={styles.export__clipboardMessage}>{clipboardMessage}</p>}

        <section className={styles.export__share}>
          <p className={styles.export__shareTitle}>
            <FormattedMessage id="export.shareSection.title" />
          </p>
          <div className={styles.export__shareActions}>
            <button type="button" className={[styles.export__shareButton, styles["export__shareButton--whatsapp"]].join(" ")} onClick={handleShareWhatsApp} disabled={isExporting}>
              <span>
                <i className="fa-brands fa-whatsapp"></i>
              </span>
              <FormattedMessage id="export.shareButton.whatsapp" />
            </button>
            <button type="button" className={styles.export__shareButton} onClick={handleCopyPlainText}>
              <span>
                <i className="fa-solid fa-clipboard-list"></i>
              </span>
              <FormattedMessage id="export.shareButton.copyText" />
            </button>
            <button type="button" className={styles.export__shareButton} onClick={handleDownload} disabled={isExporting}>
              <span>
                <i className="fa-solid fa-download"></i>
              </span>
              <FormattedMessage id="export.shareButton.download" />
            </button>
          </div>
        </section>

        <div className={styles.export__actions}>
          <button type="button" className={styles.export__secondaryButton} onClick={onBack}>
            <i className="fa-solid fa-arrow-left"></i>
            <FormattedMessage id="export.actions.back" />
          </button>
          <button type="button" className={styles.export__primaryButton} onClick={onReset}>
            <FormattedMessage id="export.actions.newDraw" />
          </button>
        </div>
      </div>
    </section>
  );
}
