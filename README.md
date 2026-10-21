# VFORUM

Q&A forum and events board for VIT (Vidyalankar Institute of Technology, Mumbai), built by Devdatta Talele on the [VOSS Labs](https://github.com/voss-labs) project model.

Students ask once and the answer stays findable for every batch after. Clubs post events. Sign-in is restricted to `@vit.edu.in`.

Live: https://vforum-devdattataleles-projects.vercel.app

## Stack

| Layer     | Choice                                                    |
| --------- | --------------------------------------------------------- |
| Framework | Next.js 15 App Router, React 18                           |
| Language  | TypeScript (strict)                                       |
| Styling   | Tailwind CSS 3, shadcn, lucide-react                      |
| Data      | Firestore through the Admin SDK (rules are default-deny)  |
| Auth      | Firebase Auth, `@vit.edu.in` only, httpOnly session cookie |
| AI        | Genkit + Gemini for tag suggestions                       |
| Quality   | ESLint, Prettier, Vitest                                  |
| Deploy    | Vercel, CI on GitHub Actions                              |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in, see docs/local-dev.md
npm run dev
```

Open http://localhost:9002. `GET /api/health` returns `{"ok":true}` when the Admin credential works. Put your own address in `ADMIN_EMAILS` to get the admin panel at `/admin`.

## Scripts

| Script                 | What it does                                   |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Dev server with Turbopack on port 9002         |
| `npm run build`        | Production build                               |
| `npm run check`        | Typecheck, lint, format check, and tests       |
| `npm run fix`          | Autofix lint and formatting                    |
| `npm test`             | Vitest                                         |
| `npm run genkit:dev`   | Genkit dev UI for the AI flows                 |

## Documentation

- [docs/local-dev.md](docs/local-dev.md) — Firebase project, environment, running locally
- [docs/deployment.md](docs/deployment.md) — Vercel environment and release checks
- [docs/voss-auth.md](docs/voss-auth.md) — signing in with VOSS (phase 2)
- [research/plan.md](research/plan.md) — what is built, what is next, in order
- [research/future.md](research/future.md) — deferred ideas and their triggers
- [CONTRIBUTING.md](CONTRIBUTING.md) — how to contribute

## License

MIT. See [LICENSE](LICENSE).
