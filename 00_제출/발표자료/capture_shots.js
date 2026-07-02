// Capture fresh high-res screenshots of the latest JB LocalGuard OS app for the deck.
// Usage: node capture_shots.js   (app server must be running on :8000)
const { chromium } = require("@playwright/test");
const path = require("path");

const VIEWS = [
  "dashboard", "cases", "approvals", "runs", "jeonse",
  "agents", "orgchart", "skills", "plugins", "budget",
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  await page.goto("http://localhost:8000/index.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const outDir = path.join(__dirname, "shots");
  for (const view of VIEWS) {
    const sel = `[data-view="${view}"]`;
    const btn = await page.$(sel);
    if (!btn) { console.log(`SKIP ${view} (no nav button)`); continue; }
    await btn.click();
    await page.waitForTimeout(550);
    await page.screenshot({ path: path.join(outDir, `${view}.png`) });
    console.log(`shot ${view}.png`);
  }
  await browser.close();
})();
