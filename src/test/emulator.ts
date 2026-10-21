import { getAuth } from "firebase-admin/auth"
import { DEV_PASSWORD, DEV_PERSONAS } from "@/lib/dev-personas"
import "@/lib/firebase-admin"
import type { IdToken } from "@/lib/types"

if (
  !process.env.FIRESTORE_EMULATOR_HOST ||
  !process.env.FIREBASE_AUTH_EMULATOR_HOST
) {
  throw new Error(
    "Integration tests run only against the emulators: npm run test:int"
  )
}

const signInUrl = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key`

export async function tokenFor(
  email: string,
  password = DEV_PASSWORD
): Promise<IdToken> {
  const res = await fetch(signInUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  })
  const body = await res.json()
  if (!body.idToken)
    throw new Error(`Sign-in failed for ${email}: ${JSON.stringify(body)}`)
  return body.idToken as IdToken
}

export const persona = (uid: (typeof DEV_PERSONAS)[number]["uid"]) =>
  DEV_PERSONAS.find((p) => p.uid === uid)!

export async function createAccount(email: string, emailVerified = true) {
  const password = "integration-test"
  await getAuth().createUser({ email, password, emailVerified })
  return tokenFor(email, password)
}
