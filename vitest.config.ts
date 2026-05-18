import { defineConfig } from "vitest/config";
import react from "@astrojs/react";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    include: ["**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        ".astro/**",
        "astro.config.mjs",
        "**/*.d.ts",
        "tests/setup.ts",
        "tests/utils/**",
      ],
    },
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
