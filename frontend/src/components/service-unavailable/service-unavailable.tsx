import styles from "./service-unavailable.module.scss";

interface ServiceUnavailableProps {
  message?: string;
}

export function ServiceUnavailable({ message = "El servicio de cuentas no está disponible en este momento. Probá de nuevo más tarde." }: ServiceUnavailableProps) {
  return (
    <div className={styles.serviceUnavailable} role="alert">
      <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <p>{message}</p>
    </div>
  );
}
