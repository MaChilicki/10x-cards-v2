import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Ładowanie zmiennych środowiskowych z .env.test
dotenv.config({ path: ".env.test" });

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["json", { outputFile: "test-results/e2e-results.json" }]],
  use: {
    // Tylko przeglądarka Chrome zgodnie z wytycznymi
    ...devices["Desktop Chrome"],
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  webServer: {
    command: "npm run dev:e2e",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  outputDir: "test-results/",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
