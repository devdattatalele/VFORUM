import path from 'node:path';
import { defineConfig } from 'vitest/config';

// `resolve.alias` lives at the root (not inside a project) because inline
// projects inherit root-level Vite options by default - defining it once
// here means the `rules` and `integration` projects Phase 2 adds won't need
// to repeat it.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // Root-only option (Vitest's ProjectConfig type explicitly excludes
    // fileParallelism from inline `projects[]` entries - it isn't a
    // per-project setting). Both `rules` and `integration` need their files
    // to run sequentially against the one shared emulator instance; `unit`
    // doesn't need it, but it's harmless there too since each npm script
    // runs `vitest run --project <name>`, so only one project's files are
    // ever active in a given invocation.
    fileParallelism: false,
    // Phase 1 only defines `unit`: pure-logic tests (src/lib/utils/*) with
    // no Firebase module anywhere in their import graph, so they need no
    // emulator, no credentials, and no setup/env files.
    //
    // Phase 2 adds two more entries here, without reshaping this file:
    //   - `rules`: Firestore security-rule tests against the emulator.
    //   - `integration`: service-layer tests against the emulator.
    projects: [
      {
        // Inherit root-level options (e.g. resolve.alias) explicitly -
        // inline projects don't inherit them by default.
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'rules',
          include: ['tests/rules/**/*.test.ts'],
          environment: 'node',
          setupFiles: ['tests/helpers/setup.rules.ts'],
        },
      },
      {
        // Repeats the root '@' alias explicitly alongside the new
        // next/headers one, rather than trusting extends:true to deep-merge
        // a project-level `resolve.alias` with the root one - Phase 1's own
        // note above documents extends:true being required at all for
        // inheritance to happen; whether a project-level alias object then
        // merges with or replaces the root's is undocumented behaviour this
        // file shouldn't depend on either way, so both keys are listed here
        // explicitly.
        extends: true,
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src'),
            // Route handlers and server-only helpers under src/ `await
            // cookies()` from next/headers; outside the real Next.js
            // request runtime there is nothing to back that call, so this
            // project substitutes an in-memory cookie jar with the same
            // shape (see tests/helpers/next-headers-mock.ts).
            'next/headers': path.resolve(__dirname, './tests/helpers/next-headers-mock.ts'),
          },
        },
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          environment: 'node',
          setupFiles: ['tests/helpers/setup.integration.ts'],
          env: {
            FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
            FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
            GCLOUD_PROJECT: 'demo-vforum',
            // Empty (not unset) so firebase-admin.ts's `||` checks are
            // falsy and it takes the emulator branch instead of trying to
            // load a real credential - see src/lib/firebase-admin.ts's
            // getAdminApp(). tests/helpers/assertEmulator.ts additionally
            // deletes these from process.env as a second line of defense
            // against a maintainer's real dev credential leaking in from
            // their shell.
            FIREBASE_SERVICE_ACCOUNT_JSON: '',
            FIREBASE_SERVICE_ACCOUNT_PATH: '',
            GOOGLE_APPLICATION_CREDENTIALS: '',
          },
        },
      },
    ],
  },
});
