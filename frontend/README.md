# Kora Roster — frontend

React + TypeScript + Vite app. For setup, environment variables, available scripts and project structure, see the [root README](../README.md).

## Notes for contributors

- Linting is handled by [Oxlint](https://oxc.rs/) (`npm run lint`). Config lives in `.oxlintrc.json`.
- Translations live under `src/i18n/` — add new keys to all locales (`en-US`, `es-419`, `pt-BR`) when introducing user-facing text.
- Auth/API calls are centralized in `src/lib/auth/` — avoid calling `kora-api` directly from components.
