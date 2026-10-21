# Local development

VFORUM needs a Firebase project today. Phase 1 of `research/plan.md` replaces this with the emulator suite so a fresh clone runs with no credentials.

## 1. Firebase project

1. Open https://console.firebase.google.com and create a project (or use an existing one).
2. Build > Authentication > Sign-in method: enable Email/Password.
3. Build > Firestore Database: create a database.
4. Project settings > General > Your apps > Web app: copy the config values.
5. Project settings > Service accounts > Generate new private key. Save the file as `serviceAccountKey.json` in the repo root. It is gitignored. Never commit it or paste it into chat.
6. Deploy the rules and indexes: `npx firebase-tools deploy --only firestore`. The rules are default-deny; only the Admin SDK reads and writes.

## 2. Environment

```bash
cp .env.example .env.local
```

| Variable                                      | Value                                                            |
| --------------------------------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_*`                      | The web app config from step 4                                   |
| `FIREBASE_SERVICE_ACCOUNT_PATH`               | `./serviceAccountKey.json`                                       |
| `ADMIN_EMAILS`                                | Your own `@vit.edu.in` address, to get the admin panel at `/admin` |
| `GOOGLE_GENAI_API_KEY`                        | Optional, for AI tag suggestions                                 |

## 3. Run

```bash
npm install
npm run dev
```

Open http://localhost:9002. `GET /api/health` returns `{"ok":true}` when the Admin credential works; otherwise it returns the real error. Sign up with any `@vit.edu.in` address. The verification mail is sent but not required to post.

## Checks

```bash
npm run check   # typecheck, lint, format check, tests
npm run fix     # autofix lint and formatting
npm test        # Vitest only
```
