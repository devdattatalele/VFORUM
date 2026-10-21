import { defineConfig } from "vitest/config"
import path from "node:path"

// Runs inside `firebase emulators:exec` (npm run test:int), against the seeded
// Auth and Firestore emulators. Never against a real project.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "src/test/server-only.ts"),
    },
  },
  test: {
    include: ["src/**/*.int.test.ts"],
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
})
