#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium } = require("@playwright/test");

const ROOT = path.resolve(__dirname, "..");
const phase = process.argv[2] || "before";
const routes = [
  "dashboard",
  "inbox",
  "cases",
  "approvals",
  "runs",
  "jeonse",
  "goals",
  "agents",
  "orgchart",
  "skills",
  "routines",
  "activity",
  "budget",
  "settings",
];
const outputRoot = path.join(ROOT, "test-results", "density");
const phaseDir = path.join(outputRoot, phase);
const screenshotDir = path.join(phaseDir, "screenshots");

fs.mkdirSync(screenshotDir, { recursive: true });

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch (_error) {
      await wait(250);
    }
  }
  return false;
}

function startServer() {
  const child = spawn("python3", ["-m", "http.server", "4173", "--directory", "app"], {
    cwd: ROOT,
    stdio: "ignore",
  });
  return child;
}

function escapeMd(value) {
  return String(value).replace(/\|/g, "\\|");
}

function writeSummary(results) {
  const lines = [
    `# UI Density Measurement - ${phase}`,
    "",
    "| Route | Scroll height | Client height | Child sum | Layout spacing | Excess gap | Bottom waste | Visible items | Console errors |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...results.map((item) =>
      [
        `#${escapeMd(item.route)}`,
        item.scrollHeight,
        item.clientHeight,
        item.childHeightSum,
        item.layoutSpacingPx,
        item.excessGapPx,
        item.bottomWastePx,
        item.visibleItems,
        item.consoleErrors,
      ].join(" | "),
    ),
    "",
    "Measurement definition:",
    "- `layoutSpacingPx` = `.page-content.scrollHeight - direct child height sum`.",
    "- `excessGapPx` = gaps above the 16px baseline plus bottom waste below the last visible child.",
    "- `visibleItems` counts cards, rows, run cards, agent cards, skill cards, evidence, audit, and table-like rows visible in the 1920x1080 viewport.",
  ];
  fs.writeFileSync(path.join(phaseDir, "summary.md"), `${lines.join("\n")}\n`);
}

function writeDiff(results) {
  const beforePath = path.join(outputRoot, "before", "metrics.json");
  if (phase !== "after" || !fs.existsSync(beforePath)) return;
  const before = JSON.parse(fs.readFileSync(beforePath, "utf8"));
  const beforeByRoute = new Map(before.map((item) => [item.route, item]));
  const lines = [
    "# UI Density Before/After Diff",
    "",
    "| Route | Scroll before -> after | Scroll saved px | Layout spacing before -> after | Excess gap before -> after | Visible items before -> after |",
    "| --- | ---: | ---: | ---: | ---: | --- |",
  ];
  for (const item of results) {
    const old = beforeByRoute.get(item.route);
    if (!old) continue;
    const scrollSaved = old.scrollHeight - item.scrollHeight;
    lines.push(
      [
        `#${escapeMd(item.route)}`,
        `${old.scrollHeight} -> ${item.scrollHeight}`,
        scrollSaved,
        `${old.layoutSpacingPx} -> ${item.layoutSpacingPx}`,
        `${old.excessGapPx} -> ${item.excessGapPx}`,
        `${old.visibleItems} -> ${item.visibleItems}`,
      ].join(" | "),
    );
  }
  fs.writeFileSync(path.join(outputRoot, "density-diff.md"), `${lines.join("\n")}\n`);
}

async function measureRoute(page, route) {
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto(`http://127.0.0.1:4173/index.html#${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(200);

  const metrics = await page.evaluate(() => {
    const pageContent = document.querySelector(".page-content");
    if (!pageContent) return null;
    const contentRect = pageContent.getBoundingClientRect();
    const children = [...pageContent.children]
      .filter((child) => {
        const rect = child.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .map((child) => {
        const rect = child.getBoundingClientRect();
        return {
          selector: child.className || child.tagName.toLowerCase(),
          top: Math.round(rect.top - contentRect.top + pageContent.scrollTop),
          bottom: Math.round(rect.bottom - contentRect.top + pageContent.scrollTop),
          height: Math.round(rect.height),
        };
      })
      .sort((a, b) => a.top - b.top);

    let excessGapPx = 0;
    for (let index = 1; index < children.length; index += 1) {
      const gap = Math.max(0, children[index].top - children[index - 1].bottom);
      excessGapPx += Math.max(0, gap - 16);
    }
    const childHeightSum = children.reduce((sum, child) => sum + child.height, 0);
    const lastBottom = children.length ? children[children.length - 1].bottom : 0;
    const bottomWastePx = Math.max(0, Math.round(pageContent.scrollHeight - lastBottom));
    const visibleItems = document
      .querySelectorAll(
        ".case-card, .case-row, .run-card, .work-item, .agent-card, .skill-card, .activity-item, .evidence-card, .audit-item, .gate-row, .matrix-row, .data-state-card, .cost-kpi, .region-row, .ranking-row",
      );
    const visibleCount = [...visibleItems].filter((node) => {
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
    }).length;

    return {
      scrollHeight: Math.round(pageContent.scrollHeight),
      clientHeight: Math.round(pageContent.clientHeight),
      childHeightSum,
      layoutSpacingPx: Math.max(0, Math.round(pageContent.scrollHeight - childHeightSum)),
      excessGapPx: Math.round(excessGapPx + bottomWastePx),
      bottomWastePx,
      visibleItems: visibleCount,
      childBoxes: children,
    };
  });

  await page.screenshot({ path: path.join(screenshotDir, `${route}.png`), fullPage: true });
  return { route, ...metrics, consoleErrors: consoleErrors.length };
}

(async () => {
  const server = startServer();
  try {
    const ready = await waitForServer("http://127.0.0.1:4173/index.html");
    if (!ready) throw new Error("density server did not start on 4173");

    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const results = [];
    for (const route of routes) {
      results.push(await measureRoute(page, route));
    }
    await browser.close();

    fs.writeFileSync(path.join(phaseDir, "metrics.json"), `${JSON.stringify(results, null, 2)}\n`);
    writeSummary(results);
    writeDiff(results);
    console.log(`density measurement ${phase}: ${results.length} routes`);
  } finally {
    server.kill("SIGTERM");
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
