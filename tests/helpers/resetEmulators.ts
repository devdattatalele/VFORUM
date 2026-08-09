// Per-test wipe of both emulators via their REST clear endpoints, so a test
// never sees state left over from a previous test. Wired into
// tests/helpers/setup.integration.ts's beforeEach.
//
// The `rules` project doesn't use this - it resets via
// RulesTestEnvironment.clearFirestore(), the more idiomatic reset for that
// library, which needs no REST call of its own.
//
// Deliberately does NOT import @/lib/firebase-admin: this must work purely
// over HTTP so it carries no dependency on the Admin SDK singleton's own
// init order (see tests/helpers/assertEmulator.ts for why that order
// matters).

async function clearFirestore(projectId: string): Promise<void> {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  const url = `http://${host}/emulator/v1/projects/${projectId}/databases/(default)/documents`;
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(
      `resetEmulators: Firestore clear failed (${response.status}): ${await response.text()}`
    );
  }
}

async function clearAuth(projectId: string): Promise<void> {
  const host = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const url = `http://${host}/emulator/v1/projects/${projectId}/accounts`;
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(
      `resetEmulators: Auth clear failed (${response.status}): ${await response.text()}`
    );
  }
}

export async function resetEmulators(): Promise<void> {
  const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || '';
  await Promise.all([clearFirestore(projectId), clearAuth(projectId)]);
}
