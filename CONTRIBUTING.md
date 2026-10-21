# Contributing to VFORUM

VFORUM follows the VOSS Labs project model. Contributions are welcome from all Vidyalankar students.

## Setup

1. Fork the repo and clone your fork
2. `npm install`
3. Install Java 11 or newer (the Firestore emulator needs it), see [docs/local-dev.md](docs/local-dev.md)
4. `npm run dev:local`, then pick a persona at http://localhost:9002/auth

## Making changes

1. Create a branch from `master`: `git checkout -b your-branch-name`
2. Make your changes
3. Run checks before committing:

```bash
npm run check
npm run test:int   # when you touch src/lib/services or src/lib/server
```

4. Push and open a pull request against `master`

## Guidelines

- Read `research/plan.md` first. Features not in the plan go in `research/future.md`.
- Keep files under 400 lines; split when they grow.
- Validate with Zod at every server boundary.
- Never read identity (uid, email, role, author) from a server-action argument. Take an `IdToken` first and use `requireProfile(idToken)`.
- Import with the `@/` alias, never relative paths.
- No emojis in code, commits, or docs.
