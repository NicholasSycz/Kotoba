import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure logic; a test needing a DOM opts in with a `@vitest-environment` docblock.
    environment: "node",
    include: ["**/*.test.ts"],
  },
  resolve: {
    // Mirrors the `@/*` path alias from tsconfig.json.
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
