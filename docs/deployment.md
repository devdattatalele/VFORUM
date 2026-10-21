# Deploying VFORUM to Vercel

Production is the Vercel project `vforum`, built from `master`. Preview deployments are built from pull requests and are behind Vercel Authentication.

## Environment variables

Set these in Vercel for Production and Preview. Environment changes only apply to new builds; redeploy after changing one.

| Variable                        | Value                                                                 |
| ------------------------------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_*`        | The Firebase web app config (six values)                              |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | The whole service-account JSON. Privileged; never with `NEXT_PUBLIC_` |
| `ADMIN_EMAILS`                  | Comma-separated admin addresses                                       |
| `GOOGLE_GENAI_API_KEY`          | Optional, for AI tag suggestions                                      |

## Release checks

1. `GET /api/health` on the deployment returns `{"ok":true}`. If it returns an error, the Admin credential is missing or wrong and every server action will fail.
2. Open `/qna`: questions load. Post a question, answer it, vote.
3. Firestore rules and indexes are deployed from the repo: `npx firebase-tools deploy --only firestore`. They are not applied by Vercel.

## Rollback

Vercel > Deployments > previous production deployment > Promote to Production. Firestore has no schema migrations today, so a code rollback is sufficient.
