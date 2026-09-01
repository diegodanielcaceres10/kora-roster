import type { CSSProperties } from "react";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App";
import { AccountProvider } from "./features/account/AccountContext";
import { LocaleProvider } from "./i18n/LocaleContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./styles/global.scss";

// Maps sonner's CSS variables to the app's own design tokens (see
// styles/tokens/_colors.scss) instead of sonner's built-in palette.
const toastStyle = {
  "--normal-bg": "var(--kora-pitch)",
  "--normal-text": "var(--kora-chalk)",
  "--normal-border": "rgba(244, 246, 239, 0.16)",

  "--success-bg": "var(--kora-pitch)",
  "--success-text": "var(--kora-chalk)",
  "--success-border": "var(--kora-success)",

  "--error-bg": "var(--kora-pitch)",
  "--error-text": "var(--kora-chalk)",
  "--error-border": "var(--kora-error)",

  "--warning-bg": "var(--kora-pitch)",
  "--warning-text": "var(--kora-chalk)",
  "--warning-border": "var(--kora-warning)",

  "--info-bg": "var(--kora-pitch)",
  "--info-text": "var(--kora-chalk)",
  "--info-border": "var(--kora-bib-sky)",
} as CSSProperties;

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename="/kora-roster/">
    <LocaleProvider>
      <AccountProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
        <Toaster richColors position="top-right" style={toastStyle} />
      </AccountProvider>
    </LocaleProvider>
  </BrowserRouter>,
);
