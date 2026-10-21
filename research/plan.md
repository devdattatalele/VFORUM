# VFORUM — Plan

VFORUM is the Q&A forum and events board for VIT (Vidyalankar Institute of Technology, Mumbai), built by Devdatta Talele. It follows the VOSS Labs project model (https://github.com/voss-labs): MIT, public, one `npm run check`, plan-driven, contributor-first.

The wedge: campus tech knowledge that stays findable. A question asked in a WhatsApp group is answered once and lost; a question asked on VFORUM is answered once and found by every batch after.

## Where it stands (2026-10-21)

Working in production:

- Email/password sign-in restricted to `@vit.edu.in`, verification mail on sign-up
- Questions with tags and a community (GDG, ACM, IEEE, cult club, General Tech Talks), view and reply counts
- Threaded comments with edit and sort (newest, oldest, top, controversial)
- Up and down votes on questions and comments
- Events with poster, club, date and RSVP link; creation gated to moderators and admins
- Search over questions, events and communities (substring filter over the latest 50)
- AI tag suggestions (Genkit + Gemini)
- Admin panel: look up a user, change their role
- Light and dark theme, mobile layout

Added on the `voss-model` branch (phase 0 and most of phase 1):

- Markdown with highlighted code in questions and answers
- Accepted answers, Solved badges, All / Unanswered / Solved filters
- Notifications for answers, replies and accepted answers
- Public profiles at `/u/<uid>`
- Moderation: reports, a moderation queue, pin, lock, in-place comment deletion, audit log

## Tech stack

Current:

- Next.js 15 App Router (React 18): Server Components, Server Actions, route handlers
- TypeScript strict, ESLint + Prettier, Vitest
- Firebase: Firestore (server side only, Admin SDK, rules default-deny) and Firebase Auth
- Genkit + Gemini for tag suggestions
- Tailwind 3 + shadcn, lucide-react
- Vercel deploy, GitHub Actions CI
- npm

Target, the VOSS stack (phase 3):

- Next.js 16, React 19, Tailwind 4, shadcn base-nova
- Postgres on Neon + Drizzle ORM, hand-reviewed SQL migrations applied by CI
- Better Auth as an OIDC relying party of VOSS (accounts.vosslabs.org); no passwords

## Phases

### Phase 0 — Adopt the VOSS project model (done)

- MIT license, README with stack and scripts tables, CONTRIBUTING, issue and PR templates
- CI runs lint, typecheck, format check, tests and build; `npm run check` locally
- Dead code removed, typecheck clean and enforced at build, Next config deprecations fixed
- Security: every server action that needs its caller verifies a Firebase ID token and derives the actor on the server. The browser no longer chooses its uid, author or role. Zod validates every input. `ADMIN_EMAILS` bootstraps admins
- Firestore reads return plain JSON through `serialize()`; `/api/health` for deploy checks
- Local development without credentials: `npm run dev:local` runs the Firebase emulators with seeded demo data and a persona switcher; `npm run test:int` runs the permission matrix against them in CI

### Phase 1 — A forum people come back to

Done: accepted answers, Markdown with code highlighting, notifications, public profiles, moderation (reports, queue, pin, lock, delete, audit log), Unanswered and Solved filters.

Remaining, one PR per item, each with its own issue:

1. Pagination on the question list; stop loading the whole collection once it reaches a few hundred questions
2. Tag pages `/tags` and `/tags/[tag]` with counts; tag autocomplete when asking
3. Allowed email domains configured in the environment, not hardcoded, so the project can run for other colleges
4. Require a verified mailbox before posting (today it is only required for `ADMIN_EMAILS`)

### Phase 2 — Sign in with VOSS

- Register VFORUM as a client in voss-labs/vauth `clients.config.ts` through a reviewed PR (see `docs/voss-auth.md`)
- Implement OIDC authorization code + PKCE against accounts.vosslabs.org
- Two ways to keep Firebase during the transition: mint a Firebase custom token for the VOSS subject after the callback and keep Firestore and ID-token verification unchanged, or replace Firebase Auth with Better Auth, which needs phase 3's Postgres for its tables. Decide when the client is registered
- Remove email/password once every active account has signed in through VOSS

### Phase 3 — The VOSS stack

- Move data to Postgres on Neon with Drizzle, SQL migrations, `dev:setup` with Docker or PGlite and demo data
- Upgrade to Next 16, React 19, Tailwind 4, shadcn base-nova
- Export Firestore, import into Postgres, cut over behind a flag
- At this point VFORUM can move under the voss-labs organization as a sister project of vboard

## Product boundaries

- Events overlap with vboard (events and communities for VIT with one-tap registration). VFORUM keeps its events board until vboard ships registrations; then events link to vboard and VFORUM concentrates on Q&A. Decide at phase 2
- VFORUM never stores roll numbers, departments or anything a student record would hold

## Design / UX

Clean, minimal, shadcn-native. Neutral palette, Inter body type, restrained colour. Reference points: Stack Overflow for the question and answer layout, Linear for typography rhythm, vboard for tonal consistency across VOSS products. Key surfaces: question list, question page with answers, ask form, community page, events, search, profile, admin.

## Identity & RBAC

- Firebase Auth verifies the mailbox; `@vit.edu.in` is enforced on sign-in in the browser and again in `requireUser()` on the server
- Every server action that needs its caller takes a Firebase ID token first and calls `requireProfile()`, which verifies it and loads `users/{uid}`; nothing identity-related is read from action arguments. Tokens over cookies: no cookie lifecycle to keep in sync with Firebase's own session, and no CSRF surface
- Roles `user`, `moderator`, `admin` on `users/{uid}`; `ADMIN_EMAILS` grants admin regardless of the stored role, like vboard's `SUPER_ADMIN_EMAILS`
- Permission rules:

```
ask / answer / vote                 = any signed-in user
edit or delete a question or answer = its author, or moderate_forums
create event                        = create_events (moderator, admin)
change roles, list users            = manage_users (admin)
```

## Data model (Firestore)

- `users/{uid}`: uid, email, displayName, photoURL, role, permissions, createdAt, updatedAt
- `users/{uid}/notifications/{id}`: type (answer, comment, reply, accepted), questionId, questionTitle, commentId, actor {uid, displayName, photoURL}, read, createdAt
- `questions/{id}`: title, content (Markdown), tags[], communityId, author {uid, displayName, photoURL}, upvotes, downvotes, views, replyCount, acceptedAnswerId, pinned, locked, createdAt, updatedAt, lastActivityAt
- `questions/{id}/comments/{id}`: questionId, parentId, content (Markdown), author, upvotes, downvotes, deleted, createdAt, updatedAt
- `votes/questions/{questionId}/{uid}` and `votes/comments/{commentId}/{uid}`: voteType, updatedAt
- `events/{id}`: title, description, posterImageUrl, clubName, communityId, dateTime, rsvpLink, rsvpCount, author, createdAt
- `reports/{questionId}_{commentId|question}_{uid}`: questionId, commentId, questionTitle, excerpt, targetAuthor, reason, details, reporter, status (open, dismissed, removed), createdAt
- `audit_log/{id}`: actorUid, actorEmail, action, target, details, createdAt
- Older documents embed the whole author profile; reads strip it to uid, name and photo
- Composite indexes in `firestore.indexes.json`; rules in `firestore.rules` (default-deny). Every query uses single-field indexes or the two composites already deployed, so this branch needs no index deploy
