# Local development

## Without credentials (recommended)

You need Node 20 or newer and Java 11 or newer, because the Firestore emulator is a Java program. On macOS: `brew install openjdk@21`, then follow the PATH hint Homebrew prints. On Windows or Linux, any JDK from https://adoptium.net works.

```bash
npm install
npm run dev:local
```

That one command:

1. starts the Firebase Auth and Firestore emulators for the `demo-vforum` project,
2. wipes them and loads demo data (`scripts/seed-dev.ts`): four accounts, nine questions with threaded answers and votes, two open reports and four events,
3. runs the app at http://localhost:9002, with the emulator UI at http://localhost:4000.

Open http://localhost:9002/auth and pick a persona under **Development sign-in**:

| Persona        | Role      | Use it to                                          |
| -------------- | --------- | -------------------------------------------------- |
| Admin          | admin     | change roles at `/admin`                           |
| Moderator      | moderator | create events, edit or remove anyone's posts       |
| Student        | user      | ask, answer, vote                                  |
| Second student | user      | answer the first student, test ownership rules     |

The switcher only replaces typing a password. Roles resolve from Firestore exactly as in production. You can also sign up with any `@vit.edu.in` address; the verification link is printed in the emulator log.

Nothing here can touch a real Firebase project. `demo-` projects cannot reach real resources, the seed script wipes nothing but the emulators, and `next build` refuses to build when `NEXT_PUBLIC_FIREBASE_EMULATORS` is set.

Data lives only while `dev:local` runs and is reseeded on every start. `npm run dev:seed` reseeds it while the emulators are up.

## Checks

```bash
npm run check      # typecheck, lint, format check, unit tests
npm run fix        # autofix lint and formatting
npm run test:int   # permission matrix against the emulators (needs Java)
```

`npm run test:int` signs in each persona and calls the real server actions: who may post, edit, delete, vote, change roles and create events. CI runs it on every pull request.

## Against your own Firebase project

Only needed to debug something the emulators do not reproduce.

1. Open https://console.firebase.google.com and create a project.
2. Build > Authentication > Sign-in method: enable Email/Password.
3. Build > Firestore Database: create a database.
4. Project settings > General > Your apps > Web app: copy the config values.
5. Project settings > Service accounts > Generate new private key. Save it as `serviceAccountKey.json` in the repo root. It is gitignored. Never commit it or paste it anywhere.
6. Deploy the rules and indexes: `npx firebase-tools deploy --only firestore`. The rules are default-deny; only the Admin SDK reads and writes.

```bash
cp .env.example .env.local   # fill in the web config and FIREBASE_SERVICE_ACCOUNT_PATH
npm run dev
```

| Variable                        | Value                                                              |
| ------------------------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_FIREBASE_*`        | The web app config from step 4                                     |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | `./serviceAccountKey.json`                                         |
| `ADMIN_EMAILS`                  | Your own verified `@vit.edu.in` address, for the admin panel       |
| `GOOGLE_GENAI_API_KEY`          | Optional, for AI tag suggestions                                   |

`GET /api/health` returns `{"ok":true}` when the Admin credential works; otherwise it returns the real error.

## Demo content on a real project

For a presentation, `npm run seed:live` adds the same questions, answers, votes, events and reports to a real project:

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json npm run seed:live
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json npm run seed:live -- --remove
```

It wipes nothing and creates no sign-in accounts: the personas exist only as authors, so present with your own account. It refuses to run twice. `--remove` deletes everything the personas posted, including answers other people left on their questions; the audit log stays.
