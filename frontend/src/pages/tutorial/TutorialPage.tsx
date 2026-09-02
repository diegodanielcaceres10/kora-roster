import { FormattedMessage } from "react-intl";
import styles from "./TutorialPage.module.scss";

const HOW_IT_WORKS_ITEMS = [
  {
    id: "setup",
    icon: "fa-solid fa-sliders",
    titleId: "tutorial.items.setup.title",
    descriptionId: "tutorial.items.setup.description",
  },
  {
    id: "players",
    icon: "fa-solid fa-clipboard-list",
    titleId: "tutorial.items.players.title",
    descriptionId: "tutorial.items.players.description",
  },
  {
    id: "share",
    icon: "fa-solid fa-wand-magic-sparkles",
    titleId: "tutorial.items.share.title",
    descriptionId: "tutorial.items.share.description",
  },
];

export function TutorialPage() {
  return (
    <section className={styles.tutorial}>
      <div className={styles.tutorial__container}>
        <header>
          <p className={styles.tutorial__eyebrow}>
            <FormattedMessage id="header.nav.tutorial" />
          </p>
          <h1 className={styles.tutorial__title}>
            <FormattedMessage id="tutorial.title" />
          </h1>
        </header>

        <div className={styles.tutorial__grid}>
          {HOW_IT_WORKS_ITEMS.map(({ id, icon, titleId, descriptionId }, i) => (
            <article key={id} className={styles.tutorial__item}>
              <span className={styles.tutorial__number}>{(i + 1).toString().padStart(2, "0")}</span>
              <i className={[icon, styles.tutorial__icon].join(" ")}></i>
              <h2 className={styles.tutorial__itemTitle}>
                <FormattedMessage id={titleId} />
              </h2>
              <p className={styles.tutorial__itemDesc}>
                <FormattedMessage id={descriptionId} />
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
