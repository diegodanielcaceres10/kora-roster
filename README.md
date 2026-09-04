# Kora Roster

Kora Roster is the free entry point of **Kora**, an ecosystem for amateur football (and, later, other sports). Add your players, draw balanced teams, name them, and share the result as an image — no sign-up required to try it.

It's the first product of a larger plan that will grow into court rentals and tournament organization, all backed by a shared API (`kora-api`).

## Features

- **Quick friendly draft** — paste a list of names and get two teams instantly.
- **Guided draft wizard** — configure team count, players per team, and goalkeeper assignment, then draw.
- **Export** — turn the resulting teams into a shareable image.
- **Accounts** — optional login (email/password or Google) to save rosters, backed by `kora-api`.
- **i18n** — available in English, Spanish (LatAm) and Brazilian Portuguese.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/) for routing
- [react-intl](https://formatjs.io/docs/react-intl/) for internationalization
- [html-to-image](https://github.com/bubkoo/html-to-image) for exporting the draw as an image
- [Oxlint](https://oxc.rs/) for linting
- Backend: [kora-api](https://github.com/diegodanielcaceres10/kora-api) (JWT auth), deployed on Render

## Getting started

### Prerequisites

- Node.js 20+
- npm
- (optional) Docker, if you'd rather not install Node locally

### Local setup

```bash
cd frontend
cp .env.example .env   # then fill in the values, see below
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### With Docker

```bash
docker compose up
```

The app runs at `http://localhost:4002` (mapped to the container's Vite dev server).

### Environment variables

Set these in `frontend/.env` (see `frontend/.env.example`):

| Variable                | Description                                                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_ENV`              | `development` \| `production`. Used for environment-specific behavior.                                                                       |
| `VITE_ALLOW_API`        | `true`/`false`. Toggles features that depend on `kora-api` (accounts, saved rosters). Useful to run the app fully offline/without a backend. |
| `VITE_API_URL`          | Base URL of `kora-api` (e.g. `http://localhost:3003`).                                                                                       |
| `VITE_GOOGLE_CLIENT_ID` | OAuth client ID for "Sign in with Google". Leave empty to hide that option.                                                                  |

### Available scripts

| Script          | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the Vite dev server with HMR.  |
| `npm run build` | Type-check and build for production. |

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.
