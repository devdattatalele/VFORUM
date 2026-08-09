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
    ],
  },
});
