import { useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import styles from "./MePage.module.scss";
import { useAccount } from "../../features/account/AccountContext";
import { authStorage } from "../../lib/auth/authStorage";
import { logoutAccount } from "../../features/account/account.api";

const STATUS_LABEL_ID: Record<string, string> = {
  ACTIVE: "me.status.active",
  INACTIVE: "me.status.inactive",
  PENDING: "me.status.pending",
};

export function MePage() {
  // RequireAuth already guarantees `account` is loaded and valid before
  // this component renders, so there's no need to re-validate the session
  // here or handle a loading/missing-account state.
  const { account, logout } = useAccount();
  const navigate = useNavigate();
  const intl = useIntl();

  if (!account) {
    return null;
  }

  const handleLogout = () => {
    // Read the refresh token before clearing it locally.
    const refreshToken = authStorage.getRefreshToken();

    // Local logout is immediate and unconditional: clear the session and
    // navigate away without waiting for the network. The user is leaving
    // this screen either way, so there's nothing to block on.
    logout();
    navigate("/login");

    // Invalidating the token server-side is best-effort cleanup, not
    // something the user needs to know about: they've already been logged
    // out locally, and if this call fails the token just sits unused until
    // it expires on its own (or gets rejected if anyone tries to reuse it).
    if (refreshToken) {
      logoutAccount(refreshToken).catch(() => {});
    }
  };

  const createdAt = intl.formatDate(new Date(account.createdAt), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusLabelId = STATUS_LABEL_ID[account.status];

  return (
    <section className={styles.me}>
      <div className={styles.me__container}>
        <header>
          <p className={styles.me__eyebrow}>
            <FormattedMessage id="me.eyebrow" />
          </p>
          <h1 className={styles.me__title}>
            {account.name} {account.lastname}
          </h1>
        </header>

        <dl className={styles.me__details}>
          <div className={styles.me__row}>
            <dt>
              <FormattedMessage id="me.labels.email" />
            </dt>
            <dd>{account.email}</dd>
          </div>

          <div className={styles.me__row}>
            <dt>
              <FormattedMessage id="me.labels.phone" />
            </dt>
            <dd>{account.phone || ""}</dd>
          </div>

          <div className={styles.me__row}>
            <dt>
              <FormattedMessage id="me.labels.status" />
            </dt>
            <dd>{statusLabelId ? intl.formatMessage({ id: statusLabelId }) : account.status}</dd>
          </div>

          <div className={styles.me__row}>
            <dt>
              <FormattedMessage id="me.labels.memberSince" />
            </dt>
            <dd>{createdAt}</dd>
          </div>
        </dl>

        <button type="button" className={styles.me__logout} onClick={handleLogout}>
          <FormattedMessage id="me.logout" />
        </button>
      </div>
    </section>
  );
}
