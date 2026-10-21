import { configDefaults, defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    include: ["src/**/*.test.ts"],
    // Integration tests need the emulators: `npm run test:int`.
    exclude: [...configDefaults.exclude, "src/**/*.int.test.ts"],
  },
})
