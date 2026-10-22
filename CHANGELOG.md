# Changelog

## Unreleased

- Moderators and admins can edit events, including the poster image, from an Edit button on the event page; the form previews the poster. Editing someone else's event is audited.
- Redesigned in the VOSS Labs design language: Geist, ink-on-paper neutrals, the VOSS orange accent, flat bordered cards, top navigation like vboard and a sidebar workspace for moderators and admins. Renamed to vforum. One theme system (next-themes, follows the system) and one toast system (sonner).
- Admin analytics at `/admin`: questions, answer rate, solved rate, median time to first answer, members; weekly questions and answers, time-to-first-answer histogram, top tags, questions by community and top contributors.
- Members page lists everyone with inline role changes; the audit log has its own page.
- Settings only shows what works: display name (now saved for real), theme, privacy note and sign-out. The event page no longer shows a fake RSVP counter. About and Help describe only what exists.
- Communities index page; the forum list shows popular tags and communities beside the questions.
- Lint is clean and strict (`--max-warnings 0`); unused UI primitives and packages removed.
- Questions and answers render as Markdown with syntax-highlighted code; the ask form has a preview.
- Accepted answers: the asker marks one; it leads the thread and the question shows Solved. The forum list filters All / Unanswered / Solved.
- Notifications for answers, replies and accepted answers, with a bell in the header.
- Public profiles at `/u/<uid>`; author names link to them.
- Moderation: reports, a queue at `/moderation`, pin, lock, in-place comment deletion, and an audit log for admins.
- `npm run dev:local` runs the app against Firebase emulators with seeded personas and no credentials; `npm run test:int` runs the permission matrix against them in CI.
- Adopted the VOSS Labs project model: MIT license, CONTRIBUTING, issue and PR templates, CI (lint, typecheck, format check, tests, build), Prettier, ESLint, Vitest, `npm run check` / `npm run fix`, `research/plan.md` and `research/future.md`.
- Server actions verify a Firebase ID token and derive the caller on the server; Zod validates every input. Ownership and roles are enforced server side, privileged actions are written to `audit_log`, and `ADMIN_EMAILS` bootstraps admins. Internal helpers are no longer exported as callable actions; user lookups and the user list require `manage_users`; author emails are no longer sent to visitors.
- Firestore Timestamps are serialized before leaving server actions (fixed "Could not load questions").
- `GET /api/health` checks the Admin credential on a deployment; `FIREBASE_SERVICE_ACCOUNT_JSON` documented.
- Removed duplicate auth pages, unused mock data, Firebase Studio config and the admin template script. Typecheck is clean and enforced at build.

## 2025

- Email/password sign-in restricted to `@vit.edu.in` replaced Google sign-in.
- Roles (user, moderator, admin) and the admin panel; events gated to moderators.
- Threaded comments with sorting, votes on questions and comments, search, Genkit tag suggestions, light and dark theme.
