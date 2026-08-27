import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure logic by default; storage tests opt into jsdom per-file with a
    // `@vitest-environment jsdom` docblock, since they need localStorage.
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
