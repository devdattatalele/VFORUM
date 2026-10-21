# vforum

Q&A forum and events board for VIT (Vidyalankar Institute of Technology, Mumbai), built by Devdatta Talele on the [VOSS Labs](https://github.com/voss-labs) project model.

Students ask once and the answer stays findable for every batch after. Clubs post events. Sign-in is restricted to `@vit.edu.in`.

Live: https://vforum-devdattataleles-projects.vercel.app

## What it does

- **Q&A with code.** Questions and answers are Markdown with syntax-highlighted code blocks. Threaded replies, votes, and search.
- **Accepted answers.** The asker marks the answer that worked; it leads the thread and the question shows Solved. Filter the forum by unanswered or solved.
- **Notifications.** A bell tells you when someone answers your question, replies to you or accepts your answer.
- **Profiles.** Every member has a page with their questions, answers, accepted answers and upvotes.
- **Moderation.** Students report spam or abuse; moderators work a queue, pin and lock questions, and remove content. Every privileged action lands in an audit log.
- **Events.** Clubs post upcoming events with RSVP links.
- **Analytics.** Admins see answer rates, time to first answer, activity per week, top tags and top contributors.

## Stack

| Layer     | Choice                                                                         |
| --------- | ------------------------------------------------------------------------------ |
| Framework | Next.js 15 App Router, React 18                                                |
| Language  | TypeScript (strict)                                                            |
| Design    | VOSS design language: Geist, ink and paper, VOSS orange (`docs/UI_UX_SPEC.md`) |
| Styling   | Tailwind CSS 3, shadcn, lucide-react                                           |
| Data      | Firestore through the Admin SDK (rules are default-deny)                       |
| Auth      | Firebase Auth, `@vit.edu.in` only, ID token verified on every server action    |
| AI        | Genkit + Gemini for tag suggestions                                            |
| Quality   | ESLint, Prettier, Vitest                                                       |
| Deploy    | Vercel, CI on GitHub Actions                                                   |

## Getting started

No Firebase project or credentials needed. You need Node 20+ and Java 11+ for the Firestore emulator.

```bash
npm install
npm run dev:local
```

`dev:local` starts the Firebase emulators, seeds demo data and runs the app at http://localhost:9002. Open `/auth` and pick a persona: Admin, Moderator or Student. See [docs/local-dev.md](docs/local-dev.md).

## Scripts

| Script               | What it does                                   |
| -------------------- | ---------------------------------------------- |
| `npm run dev:local`  | Emulators, demo data and the dev server        |
| `npm run dev:seed`   | Wipe and reseed the running emulators          |
| `npm run dev`        | Dev server against the project in `.env.local` |
| `npm run build`      | Production build                               |
| `npm run check`      | Typecheck, lint, format check, and tests       |
| `npm run fix`        | Autofix lint and formatting                    |
| `npm test`           | Unit tests (Vitest)                            |
| `npm run test:int`   | Permission matrix against the emulators        |
| `npm run genkit:dev` | Genkit dev UI for the AI flows                 |

## Documentation

- [docs/local-dev.md](docs/local-dev.md) — Firebase project, environment, running locally
- [docs/deployment.md](docs/deployment.md) — Vercel environment and release checks
- [docs/voss-auth.md](docs/voss-auth.md) — signing in with VOSS (phase 2)
- [research/plan.md](research/plan.md) — what is built, what is next, in order
- [research/future.md](research/future.md) — deferred ideas and their triggers
- [CONTRIBUTING.md](CONTRIBUTING.md) — how to contribute

## License

MIT. See [LICENSE](LICENSE).
