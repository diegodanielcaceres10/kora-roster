import { useIntl } from "react-intl";
import styles from "./service-unavailable.module.scss";

interface ServiceUnavailableProps {
  message?: string;
}

export function ServiceUnavailable({ message }: ServiceUnavailableProps) {
  const intl = useIntl();
  const resolvedMessage = message ?? intl.formatMessage({ id: "serviceUnavailable.message" });

  return (
    <div className={styles.serviceUnavailable} role="alert">
      <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <p>{resolvedMessage}</p>
    </div>
  );
}
