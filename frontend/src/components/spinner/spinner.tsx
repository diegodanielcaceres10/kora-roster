import styles from "./spinner.module.scss";

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

export function Spinner({ size = "md", label, className }: SpinnerProps) {
  const ring = <span className={[styles.spinner, styles[`spinner--${size}`], className].filter(Boolean).join(" ")} aria-hidden="true" />;
  if (!label) return ring;
  return (
    <div className={styles.spinner__wrapper} role="status">
      {ring}
      <span className={styles.spinner__label}>{label}</span>
    </div>
  );
}
