// setupFiles entry for the `integration` Vitest project (see
// vitest.config.ts).
import { beforeEach } from 'vitest';
import { assertEmulator } from './assertEmulator';
import { resetEmulators } from './resetEmulators';
import { __resetCookieJar } from './next-headers-mock';

// assertEmulator() must run before any src/ module is evaluated:
// src/lib/firebase-admin.ts initializes its Admin SDK singleton at module
// scope, so its credential branch is locked in the moment that module is
// first imported. ES module imports are hoisted and evaluated before this
// statement runs regardless of where it sits in the file, but neither of
// this setup file's own imports above (resetEmulators, next-headers-mock)
// touches src/lib/firebase-admin - only the actual test files do, and
// Vitest fully finishes running this setup file before it ever imports a
// test file, so this call is guaranteed to land first.
assertEmulator();

beforeEach(async () => {
  __resetCookieJar();
  await resetEmulators();
});
