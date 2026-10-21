import { initializeApp, getApps, getApp } from "firebase/app"
import { connectAuthEmulator, getAuth } from "firebase/auth"

// The browser only uses Firebase Auth. All data goes through server actions
// (src/lib/services), which use the Admin SDK.

// `npm run dev:local` sets this and runs everything against the emulators.
export const usingEmulators = process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "1"

const firebaseConfig = usingEmulators
  ? {
      apiKey: "demo-key",
      authDomain: "demo-vforum.firebaseapp.com",
      projectId: "demo-vforum",
      appId: "demo-app",
    }
  : // Placeholders keep `next build` working without a Firebase config; sign-in
    // then fails with Firebase's own error until the real values are set.
    {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "missing-api-key",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId:
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "missing-project-id",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "missing-app-id",
    }

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)

if (usingEmulators && !auth.emulatorConfig) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true })
}

export { app, auth }
