// Server-only Firebase Admin singleton. Never import this from client code —
// it reads a privileged service-account credential and bypasses Firestore
// security rules entirely. Only server modules (src/lib/services, src/lib/server)
// import from here; the "server-only" import makes a client import a build error.
import "server-only"
import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

function loadAdminCredential() {
  // Vercel (and any environment where shipping a key file isn't practical)
  // sets the credential as an inline JSON string.
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (serviceAccountJson) {
    return cert(JSON.parse(serviceAccountJson))
  }

  // Local development reads the credential from a file path instead.
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  if (serviceAccountPath) {
    return cert(serviceAccountPath)
  }

  throw new Error(
    "Firebase Admin credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON " +
      "(inline service-account JSON, e.g. on Vercel) or FIREBASE_SERVICE_ACCOUNT_PATH " +
      "(path to a service-account JSON file, for local development). Neither may be " +
      "prefixed with NEXT_PUBLIC_ — this credential must never reach the browser."
  )
}

function getAdminApp(): App {
  const existingApps = getApps()
  if (existingApps.length > 0) {
    return existingApps[0]
  }

  // Local development and tests run against the Firebase emulators
  // (`npm run dev:local`, `npm run test:int`), which need no credential.
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return initializeApp({
      projectId: process.env.GCLOUD_PROJECT ?? "demo-vforum",
    })
  }

  return initializeApp({
    credential: loadAdminCredential(),
  })
}

const app = getAdminApp()
export const adminDb: Firestore = getFirestore(app)
export const adminAuth: Auth = getAuth(app)
