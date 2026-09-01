import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.js"],
    exclude: ["node_modules/**", "dist/**", "e2e/**", ".wrangler/**"],
    coverage: {
      provider: "v8",
      reporter: ["text-summary"],
      include: ["shared/**", "functions/**", "src/components/organism/Batches/batchDateUtils.js"],
      exclude: ["**/*.test.js"],
    },
  },
});
