// Structural guard against ever touching the production Firebase project
// (`v-threads`, which holds real student data) from a test run. Called from
// both tests/helpers/setup.rules.ts and tests/helpers/setup.integration.ts
// as the very first thing that runs in those files - before any other
// import in this file's module graph resolves - because
// src/lib/firebase-admin.ts initializes its Admin SDK singleton at module
// scope (see that file's getAdminApp()). By the time a test file's own
// imports run, it is too late to change which credential branch that
// singleton took.
//
// Three independent locks, all of which must hold:
//   1. FIRESTORE_EMULATOR_HOST must be set - this alone pins the Firestore
//      transport to localhost regardless of credentials.
//   2. The resolved project id must start with "demo-" - Firebase treats
//      that prefix as emulator-only, so it is a second, independent way for
//      "v-threads" (which fails this by name) to get caught even if an
//      emulator host somehow leaked through.
//   3. Any lingering real-credential env vars are deleted (not thrown on),
//      so a maintainer with a real key exported for `npm run dev` isn't
//      blocked from running tests.
export function assertEmulator(): string {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error(
      'assertEmulator: FIRESTORE_EMULATOR_HOST is not set. Emulator-backed tests must be run ' +
        'via `firebase emulators:exec` (see the test:rules / test:integration npm scripts) - ' +
        'refusing to start in case this process is about to talk to a real Firestore project.'
    );
  }

  const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || '';
  if (!projectId.startsWith('demo-')) {
    throw new Error(
      `assertEmulator: resolved Firebase project id "${projectId}" does not start with ` +
        '"demo-". Emulator-backed tests must run against a demo-* project id - refusing to ' +
        'run against what looks like it could be a real project (e.g. "v-threads").'
    );
  }

  const credentialEnvVars = [
    'FIREBASE_SERVICE_ACCOUNT_JSON',
    'FIREBASE_SERVICE_ACCOUNT_PATH',
    'GOOGLE_APPLICATION_CREDENTIALS',
  ] as const;

  for (const key of credentialEnvVars) {
    if (process.env[key]) {
      console.warn(
        `assertEmulator: deleting process.env.${key} for this test run so ` +
          'src/lib/firebase-admin.ts cannot pick up a real credential and skips straight to ' +
          'the emulator branch.'
      );
      delete process.env[key];
    }
  }

  return projectId;
}
