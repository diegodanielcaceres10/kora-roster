import styles from "./AboutPage.module.scss";
import authorLogo from "../../assets/diegodanielcaceres.png";

export function AboutPage() {
  return (
    <section className={styles.about}>
      <div className={styles.about__container}>
        <header>
          <p className={[styles.about__eyebrow, styles.about__eyebrow].join(" ")}>Sobre Kora</p>
          <h1 className={styles.about__title}>Una forma simple de resolver el sorteo antes de jugar</h1>
        </header>

        <p className={styles.about__description}>
          Kora nació para esos partidos donde nadie quiere perder diez minutos repartiendo jugadores. Elegís la cantidad de equipos, cargás la lista y dejás que la app haga el trabajo rápido, claro y
          sin vueltas.
        </p>

        <a className={styles.about__author} href="https://diegodanielcaceres10.github.io/nura/" target="_blank" rel="noreferrer" aria-label="Portfolio de Diego Daniel Caceres">
          <div className={styles.about__authorLogo}>
            <img src={authorLogo} alt="Diego Daniel Caceres" />
          </div>
          <i className="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    </section>
  );
}
