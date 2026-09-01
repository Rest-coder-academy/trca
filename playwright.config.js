import { defineConfig } from "@playwright/test";

// E2E smoke against the FULL app (built frontend + Pages Functions + a local D1),
// served by `wrangler pages dev`. Runs as a smoke — the deterministic unit +
// integration suites are the required gate.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "list" : "line",
  use: { baseURL: "http://127.0.0.1:8788", trace: "on-first-retry" },
  webServer: {
    command: "npm run build && npx wrangler@4 pages dev dist --port 8788 --ip 127.0.0.1",
    url: "http://127.0.0.1:8788",
    timeout: 180000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
