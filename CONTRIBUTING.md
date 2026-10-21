# Contributing to VFORUM

VFORUM follows the VOSS Labs project model. Contributions are welcome from all Vidyalankar students.

## Setup

1. Fork the repo and clone your fork
2. `npm install`
3. Follow [docs/local-dev.md](docs/local-dev.md) to create `.env.local` (a Firebase project is needed today; an emulator-based `dev:setup` is phase 1 of the plan)
4. `npm run dev`, then open http://localhost:9002

## Making changes

1. Create a branch from `master`: `git checkout -b your-branch-name`
2. Make your changes
3. Run checks before committing:

```bash
npm run check
```

4. Push and open a pull request against `master`

## Guidelines

- Read `research/plan.md` first. Features not in the plan go in `research/future.md`.
- Keep files under 400 lines; split when they grow.
- Validate with Zod at every server boundary.
- Never read identity (uid, email, role, author) from a server-action argument. Use `requireProfile()`.
- Import with the `@/` alias, never relative paths.
- No emojis in code, commits, or docs.
