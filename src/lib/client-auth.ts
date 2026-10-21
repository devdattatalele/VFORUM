import { auth } from "@/lib/firebase"
import type { IdToken } from "@/lib/types"

// A current ID token for the signed-in user. Server actions take it as their
// first argument and verify it to learn who is calling.
export async function idToken(): Promise<IdToken> {
  const user = auth.currentUser
  if (!user) throw new Error("Sign in required.")
  return (await user.getIdToken()) as IdToken
}
