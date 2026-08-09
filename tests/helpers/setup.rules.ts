// setupFiles entry for the `rules` Vitest project (see vitest.config.ts).
// Runs the emulator/project-id guard before anything else in this project's
// test files loads.
import { assertEmulator } from './assertEmulator';

assertEmulator();
