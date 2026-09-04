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
    // wrangler is a devDependency (pinned in package.json) so `npm ci` caches
    // it — no `npx wrangler@4` runtime download that used to eat 60-120s of
    // the 180s webServer wait and made CI intermittently fail with
    // "Timed out waiting 180000ms from config.webServer". `wrangler` here
    // resolves to node_modules/.bin/wrangler through npm's script env.
    command: "npm run build && npm run e2e:serve",
    url: "http://127.0.0.1:8788",
    timeout: 240000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
