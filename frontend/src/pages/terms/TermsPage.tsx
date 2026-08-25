import styles from "./TermsPage.module.scss";

export function TermsPage() {
  return (
    <section className={styles.terms}>
      <div className={styles.terms__container}>
        <header>
          <p className={styles.terms__eyebrow}>Legal</p>
          <h1 className={styles.terms__title}>Términos y Condiciones</h1>
          <p className={styles.terms__updated}>Última actualización: 24 de agosto de 2026</p>
        </header>

        <div className={styles.terms__body}>
          <p>
            Estos Términos y Condiciones regulan el uso de Kora (la "Plataforma"), una aplicación pensada para organizar sorteos y armar equipos de fútbol amateur. Al crear una cuenta o usar la
            Plataforma, aceptás estos términos en su totalidad. Si no estás de acuerdo, no deberías usar Kora.
          </p>

          <h2>1. Qué es Kora</h2>
          <p>
            Kora te permite cargar listas de jugadores, definir la cantidad de equipos, sortear o armar alineaciones y exportar el resultado. Es una herramienta de organización, no un servicio de
            competición oficial ni una plataforma de apuestas.
          </p>

          <h2>2. Registro y cuenta</h2>
          <p>
            Para usar algunas funciones necesitás crear una cuenta con datos reales (nombre, apellido, email). Sos responsable de mantener la confidencialidad de tu contraseña y de toda actividad
            que ocurra bajo tu cuenta. Avisanos si sospechás un uso no autorizado.
          </p>

          <h2>3. Uso aceptable</h2>
          <p>
            No podés usar Kora para cargar contenido ofensivo, ilegal o que infrinja derechos de terceros, intentar acceder sin autorización a otras cuentas, ni interferir con el funcionamiento
            normal de la Plataforma.
          </p>

          <h2>4. Propiedad intelectual</h2>
          <p>
            El diseño, el código y la marca Kora son propiedad de sus desarrolladores. Los datos que cargás (nombres de jugadores, configuraciones de equipos) siguen siendo tuyos; nos das permiso
            para almacenarlos y procesarlos únicamente para brindarte el servicio.
          </p>

          <h2>5. Disponibilidad del servicio</h2>
          <p>
            Hacemos lo posible por mantener Kora disponible y funcionando correctamente, pero puede haber interrupciones por mantenimiento, actualizaciones o causas fuera de nuestro control. No
            garantizamos disponibilidad ininterrumpida.
          </p>

          <h2>6. Limitación de responsabilidad</h2>
          <p>
            Kora se ofrece "tal cual". En la medida permitida por la ley, no somos responsables por daños indirectos derivados del uso de la Plataforma, incluyendo pérdida de datos o
            configuraciones de sorteos.
          </p>

          <h2>7. Cambios en estos términos</h2>
          <p>
            Podemos actualizar estos Términos en el futuro. Si el cambio es relevante, te avisaremos por email o mediante un aviso en la Plataforma antes de que entre en vigencia.
          </p>

          <h2>8. Contacto</h2>
          <p>Si tenés dudas sobre estos Términos, escribinos a través de los canales de contacto indicados en la sección "Sobre Kora".</p>
        </div>
      </div>
    </section>
  );
}
