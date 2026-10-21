# VFORUM — Project Instructions

VFORUM is the Q&A forum and events board for VIT (Vidyalankar Institute of Technology, Mumbai), built by Devdatta Talele and run on the [VOSS Labs](https://github.com/voss-labs) project model.

The product wedge: campus tech knowledge that stays findable. A question answered in a WhatsApp group is lost by next week; a question answered on VFORUM is found by every batch after.

For the full plan, read `research/plan.md`. For deferred features, read `research/future.md`. Don't pollute the plan with future ideas.

CLAUDE.md is symlinked to this file — same content applies to all coding agents.

## Stack

- Next.js 15 App Router (React 18) — Server Components, Server Actions, route handlers
- TypeScript strict, ESLint (`eslint-config-next`) + Prettier (with the Tailwind plugin)
- Firebase: Firestore for data (server side only, through the Admin SDK) and Firebase Auth for sign-in, restricted to `@vit.edu.in`
- Genkit + Gemini for tag suggestions
- Tailwind 3 + shadcn, lucide-react
- Vitest for pure-logic unit tests
- Vercel for deploy, GitHub Actions for CI
- npm

## Commands

- `npm run dev` — dev server on port 9002
- `npm run check` — typecheck, lint, format check, tests (run before commit)
- `npm run fix` — autofix lint and formatting
- `npm test` — Vitest
- `npm run genkit:dev` — Genkit dev UI for the AI flows
- `npx shadcn@latest add <component>` — install a shadcn component on demand

## Layout

- `src/app/` — routes (App Router); `globals.css` holds the design tokens
- `src/components/` — app components; `src/components/ui/` — vendored shadcn primitives
- `src/lib/services/<domain>.ts` — `'use server'` actions, the only code that touches Firestore
- `src/lib/firebase-admin.ts` — server-only Admin SDK singleton; `src/lib/firebase.ts` — client Auth only
- `src/lib/auth-server.ts` — `requireUser()` / `requireProfile()`, the identity of the caller of a server action
- `src/lib/schemas.ts` — Zod schemas for every server-action input
- `src/lib/` — pure helpers (`*.test.ts` beside them)
- `src/ai/` — Genkit flows
- `docs/` — local development, deployment, VOSS sign-in notes; `research/` — plan, future work, investigations

## Conventions

- Validation: Zod at every server boundary
- Identity: never trust a uid, email, role or author object sent by the browser. Server actions get the actor from `requireProfile()` and nothing else
- Firestore: every read path returns through `serialize()`; server actions may only return plain JSON
- Imports: `@/` alias (mapped to `src/`), never relative
- Formatting: Prettier (2 spaces, double quotes, no semicolons)
- File size: 200–400 lines max per file; split when bigger
- No emojis in code, commits, or docs

## Identity & RBAC

- Firebase Auth verifies the mailbox. `@vit.edu.in` is enforced on sign-in in the browser and again in `requireUser()` on the server. Moving sign-in to VOSS (accounts.vosslabs.org) is phase 2 of the plan
- After sign-in the browser posts its ID token to `/api/session`; the server mints a 7-day httpOnly session cookie. Every mutating action verifies that cookie
- Three roles: `user`, `moderator`, `admin`, stored on `users/{uid}`. Addresses in `ADMIN_EMAILS` are admin regardless of the stored role; that is how the first admin is bootstrapped
- Capabilities live in `src/lib/utils/userUtils.ts`; check them with `hasPermission` / `canModerate`, never by comparing role strings in pages
- Firestore rules are default-deny; only the Admin SDK reads or writes
