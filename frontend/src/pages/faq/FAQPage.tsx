import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import styles from "./FAQPage.module.scss";

const FAQ_ITEMS = [
  { id: "free", questionId: "faq.items.free.question", answerId: "faq.items.free.answer" },
  { id: "edit", questionId: "faq.items.edit.question", answerId: "faq.items.edit.answer" },
  { id: "maxPlayers", questionId: "faq.items.maxPlayers.question", answerId: "faq.items.maxPlayers.answer" },
  { id: "share", questionId: "faq.items.share.question", answerId: "faq.items.share.answer" },
  { id: "choose", questionId: "faq.items.choose.question", answerId: "faq.items.choose.answer" },
  { id: "account", questionId: "faq.items.account.question", answerId: "faq.items.account.answer" },
];

export function FAQPage() {
  const intl = useIntl();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={styles.faq}>
      <div className={styles.faq__container}>
        <header>
          <p className={styles.faq__eyebrow}>
            <FormattedMessage id="faq.eyebrow" />
          </p>
          <h1 className={styles.faq__title}>
            <FormattedMessage id="faq.title" />
          </h1>
        </header>

        <div className={styles.faq__grid}>
          {FAQ_ITEMS.map(({ id, questionId, answerId }, i) => {
            const isOpen = openIndex === i;
            const answerElementId = `faq-answer-${i}`;
            const question = intl.formatMessage({ id: questionId });

            return (
              <div key={id} className={[styles.faq__item, isOpen ? styles["faq__item--open"] : ""].join(" ")}>
                <button type="button" className={styles.faq__question} aria-expanded={isOpen} aria-controls={answerElementId} onClick={() => setOpenIndex(isOpen ? null : i)}>
                  <span>{question}</span>
                  <i className={["fa-solid fa-angle-down", styles.faq__chevron, isOpen ? styles["faq__chevron--open"] : ""].join(" ")}></i>
                </button>

                <div id={answerElementId} className={[styles.faq__answerWrapper, isOpen ? styles["faq__answerWrapper--open"] : ""].join(" ")}>
                  <div className={styles.faq__answerInner}>
                    <p className={styles.faq__answer}>
                      <FormattedMessage id={answerId} />
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
