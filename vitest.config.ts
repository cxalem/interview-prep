import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["challenges/**/*.test.ts"],
    testTimeout: 10000,
  },
});
