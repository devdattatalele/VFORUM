# Signing in with VOSS

Phase 2 of `research/plan.md`. VOSS (https://accounts.vosslabs.org, repo voss-labs/vauth) is the identity provider for VOSS products: it verifies the `@vit.edu.in` mailbox with a one-time code and returns a stable subject, email and name over OpenID Connect. vforum would stop handling passwords entirely.

Follow https://github.com/voss-labs/vauth/blob/main/INTEGRATING.md. The parts specific to vforum:

## Client registration

Products are registered in `clients.config.ts` of voss-labs/vauth through a reviewed pull request. The entry for vforum:

```ts
{
  name: "vforum",
  description: "Q&A forum and events board for VIT students.",
  redirectUris: [
    "https://vforum-devdattataleles-projects.vercel.app/api/auth/oauth2/callback/voss",
    "http://localhost:9002/api/auth/oauth2/callback/voss",
  ],
  scopes: ["openid", "profile", "email"],
  firstParty: false,
},
```

Redirect URIs match exactly, including scheme and port; the dev server runs on 9002. `firstParty` stays `false` until vforum is owned by VOSS. A maintainer runs `npm run clients` after the merge and hands over `VOSS_CLIENT_ID` and `VOSS_CLIENT_SECRET` privately; the secret is shown once.

## Keeping Firebase during the transition

VOSS answers who the person is. vforum's data stays in Firestore, so the cheapest integration is: after the OIDC callback, mint a Firebase custom token for the VOSS subject with the Admin SDK, sign the browser in with it, and keep ID-token verification and `requireProfile()` unchanged. The alternative, Better Auth with its own tables, needs the Postgres move in phase 3.

Either way, vforum keeps answering the second question itself: role, permissions and ownership live in `users/{uid}` and nowhere else.
