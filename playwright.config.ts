import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:4300",
    launchOptions: { executablePath: process.env.CHROMIUM_PATH ?? undefined },
  },
  webServer: {
    command: "node scripts/serve-out.mjs 4300",
    url: "http://localhost:4300",
    reuseExistingServer: true,
  },
});
