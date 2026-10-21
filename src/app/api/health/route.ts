import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Deploy sanity check: proves the Firebase Admin credential is configured and
// can reach Firestore. Every 'use server' action depends on exactly this path.
export async function GET() {
  try {
    const { adminDb } = await import("@/lib/firebase-admin")
    await adminDb.collection("questions").limit(1).get()
    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
