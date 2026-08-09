// Server-only Firebase Admin singleton. Never import this from client code —
// it reads a privileged service-account credential and bypasses Firestore
// security rules entirely. Only 'use server' modules under src/lib/services
// should import from here.
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function loadAdminCredential() {
  // Vercel (and any environment where shipping a key file isn't practical)
  // sets the credential as an inline JSON string.
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    return cert(JSON.parse(serviceAccountJson));
  }

  // Local development reads the credential from a file path instead.
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    return cert(serviceAccountPath);
  }

  throw new Error(
    'Firebase Admin credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON ' +
      '(inline service-account JSON, e.g. on Vercel) or FIREBASE_SERVICE_ACCOUNT_PATH ' +
      '(path to a service-account JSON file, for local development). Neither may be ' +
      'prefixed with NEXT_PUBLIC_ — this credential must never reach the browser.'
  );
}

function getAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  // Emulator mode: when either emulator host is set, skip credential loading
  // entirely and connect without one. This is verified-necessary rather than
  // a nicety - cert() parses the PEM eagerly and throws
  // `DECODER routines::unsupported` on a synthetic test key, so there is no
  // way to satisfy the production credential path in a test. Side benefit:
  // this also lets a contributor without production Firebase credentials
  // run the app locally against emulators.
  if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID;
    return initializeApp({ projectId });
  }

  return initializeApp({
    credential: loadAdminCredential(),
  });
}

export const adminDb: Firestore = getFirestore(getAdminApp());
