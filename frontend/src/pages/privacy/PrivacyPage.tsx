import styles from "./PrivacyPage.module.scss";

export function PrivacyPage() {
  return (
    <section className={styles.privacy}>
      <div className={styles.privacy__container}>
        <header>
          <p className={styles.privacy__eyebrow}>Legal</p>
          <h1 className={styles.privacy__title}>Política de Privacidad</h1>
          <p className={styles.privacy__updated}>Última actualización: 24 de agosto de 2026</p>
        </header>

        <div className={styles.privacy__body}>
          <p>
            En Kora nos tomamos en serio la privacidad de tus datos. Esta política explica qué información recopilamos cuando usás la Plataforma, para qué la usamos y qué opciones tenés al
            respecto.
          </p>

          <h2>1. Qué datos recopilamos</h2>
          <p>
            Al registrarte guardamos tu nombre, apellido, email y, si lo cargás, tu teléfono. También guardamos los datos que ingresás para armar sorteos (nombres de jugadores, cantidad de
            equipos, configuraciones guardadas).
          </p>

          <h2>2. Para qué los usamos</h2>
          <p>
            Usamos tus datos para crear y mantener tu cuenta, permitirte iniciar sesión, brindarte soporte cuando lo necesitás, y para mejorar el funcionamiento de la Plataforma.
          </p>

          <h2>3. Comunicaciones de marketing</h2>
          <p>
            Solo te vamos a enviar novedades, tips o promociones de Kora por email si marcaste la casilla de aceptación de marketing al registrarte. Podés retirar tu consentimiento cuando quieras
            desde tu cuenta o haciendo clic en "darse de baja" en cualquiera de esos emails, sin que eso afecte tu acceso a la Plataforma.
          </p>

          <h2>4. Con quién compartimos tus datos</h2>
          <p>
            No vendemos tus datos a terceros. Solo los compartimos con proveedores necesarios para operar el servicio (por ejemplo, envío de emails transaccionales), bajo acuerdos de
            confidencialidad.
          </p>

          <h2>5. Cuánto tiempo los conservamos</h2>
          <p>Conservamos tus datos mientras tu cuenta esté activa. Si la eliminás, borramos o anonimizamos tu información en un plazo razonable, salvo que la ley nos obligue a conservar algo puntual.</p>

          <h2>6. Tus derechos</h2>
          <p>
            Podés pedirnos acceder, corregir o eliminar tus datos personales en cualquier momento. También podés solicitar que dejemos de procesarlos para fines de marketing sin perder acceso a tu
            cuenta.
          </p>

          <h2>7. Cambios en esta política</h2>
          <p>Si actualizamos esta política de forma relevante, te avisaremos por email o mediante un aviso en la Plataforma.</p>

          <h2>8. Contacto</h2>
          <p>Para cualquier consulta sobre tus datos personales, escribinos a través de los canales de contacto indicados en la sección "Sobre Kora".</p>
        </div>
      </div>
    </section>
  );
}
