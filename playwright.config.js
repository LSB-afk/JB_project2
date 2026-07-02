const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./02_제품/tests/e2e",
  outputDir: "./test-results/playwright",
  timeout: 30_000,
  expect: {
    timeout: 8_000,
  },
  use: {
    baseURL: "http://127.0.0.1:8000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "python3 -m http.server 8000 --directory 02_제품/app",
    url: "http://127.0.0.1:8000/index.html",
    reuseExistingServer: !process.env.CI,
    timeout: 10_000,
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
});
