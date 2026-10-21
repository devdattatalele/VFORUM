# Changelog

## Unreleased

- Adopted the VOSS Labs project model: MIT license, CONTRIBUTING, issue and PR templates, CI (lint, typecheck, format check, tests, build), Prettier, ESLint, Vitest, `npm run check` / `npm run fix`, `research/plan.md` and `research/future.md`.
- Server actions verify a Firebase ID token and derive the caller on the server; Zod validates every input. Ownership and roles are enforced server side, privileged actions are written to `audit_log`, and `ADMIN_EMAILS` bootstraps admins. Internal helpers are no longer exported as callable actions; user lookups and the user list require `manage_users`; author emails are no longer sent to visitors.
- Firestore Timestamps are serialized before leaving server actions (fixed "Could not load questions").
- `GET /api/health` checks the Admin credential on a deployment; `FIREBASE_SERVICE_ACCOUNT_JSON` documented.
- Removed duplicate auth pages, unused mock data, Firebase Studio config and the admin template script. Typecheck is clean and enforced at build.

## 2025

- Email/password sign-in restricted to `@vit.edu.in` replaced Google sign-in.
- Roles (user, moderator, admin) and the admin panel; events gated to moderators.
- Threaded comments with sorting, votes on questions and comments, search, Genkit tag suggestions, light and dark theme.
