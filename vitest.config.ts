import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // @testing-library/react needs a global afterEach to auto-clean the DOM
    // between tests. Test files still import describe/it/expect explicitly.
    globals: true,
    maxWorkers: 2,
    environment: "jsdom",
    setupFiles: ["tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
