# Contributing to Kora Roster

Thanks for your interest in the project! This is currently a solo/portfolio project, so the process is intentionally lightweight.

## Setup

See the [README](./README.md) for local setup, environment variables and available scripts.

## Workflow

1. Create a branch from `main` (e.g. `feat/short-description` or `fix/short-description`).
2. Make your changes, keeping commits focused and descriptive.
3. Run `npm run lint` before opening a PR.
4. Open a pull request describing what changed and why.

## Code style

- TypeScript, functional components and hooks.
- Linting via Oxlint (`.oxlintrc.json`) — please fix warnings before submitting.
- New user-facing strings must be added to every locale under `src/i18n/` (`en-US`, `es-419`, `pt-BR`).

## Reporting issues

Open a GitHub issue with steps to reproduce, expected vs. actual behavior, and screenshots if relevant.
