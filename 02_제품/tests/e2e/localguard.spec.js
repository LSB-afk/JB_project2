const { expect, test } = require("@playwright/test");
const fs = require("node:fs");

const screenshotDirs = ["test-results/screenshots", "tests/results/screenshots"];

async function saveShot(page, name) {
  for (const dir of screenshotDirs) {
    fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: `${dir}/${name}`, fullPage: true });
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem("jb-localguard-os-state-v2"));
});

test("home and dashboard render without console errors", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/index.html");
  await expect(page.getByRole("heading", { name: "JB LocalGuard OS" })).toBeVisible();
  await expect(page.locator("#page-content")).not.toBeEmpty();
  await expect(page.locator("#context-panel")).not.toBeEmpty();
  await expect(page.getByText("오늘 우선 처리 기준")).toBeVisible();
  await expect(page.getByText("운영 비용 해석")).toBeVisible();
  await expect(page.getByText("지역별 위험도")).toBeVisible();
  await expect(page.getByText("완료된 사용자 가치")).toBeVisible();
  await expect(page.getByText("데이터 출처와 저장 상태")).toBeVisible();
  await expect(page.getByText("샘플·실제·오류 상태")).toBeVisible();
  await expect(page.locator('[data-state="sample"]')).toContainText("Sample");
  await expect(page.locator('[data-state="error"]')).toContainText("미연결");
  await expect(page.locator('[data-state="stale"]')).toContainText("샘플 스냅샷");
  await expect(page.getByText("이번 세션에서 아직 저장 없음")).toBeVisible();

  await saveShot(page, "home.png");
  await saveShot(page, "dashboard.png");
  await saveShot(page, "home-desktop.png");
  await saveShot(page, "dashboard-desktop.png");
  expect(errors).toEqual([]);
});

test("core routes render reachable grouped screens", async ({ page }) => {
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

  for (const route of routes) {
    await page.goto(`/index.html#${route}`);
    await expect(page.locator("#page-content")).not.toBeEmpty();
    await expect(page.locator(".org-rail")).toBeVisible();
  }
});

test("density routes keep top-aligned layout without horizontal overflow", async ({ page }) => {
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
  const viewports = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 390, height: 844 },
  ];
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(`/index.html#${route}`);
      await expect(page.locator("#page-content")).not.toBeEmpty();
      const layout = await page.evaluate(() => {
        const pageContent = document.querySelector(".page-content");
        const body = document.body;
        const documentElement = document.documentElement;
        const firstChild = pageContent?.firstElementChild?.getBoundingClientRect();
        return {
          horizontalOverflow: Math.max(body.scrollWidth, documentElement.scrollWidth) - window.innerWidth,
          firstChildTop: firstChild ? Math.round(firstChild.top) : null,
        };
      });
      expect(layout.horizontalOverflow).toBeLessThanOrEqual(1);
      expect(layout.firstChildTop).not.toBeNull();
      expect(layout.firstChildTop).toBeLessThanOrEqual(viewport.width <= 390 ? 32 : 40);
    }
  }

  expect(errors).toEqual([]);
});

test("goals page keeps cards compact and top aligned", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/index.html#goals");

  const header = page.locator(".workspace-header");
  const panel = page.locator(".workspace-panel").first();
  await expect(page.getByRole("heading", { name: "운영 목표" })).toBeVisible();
  await expect(panel.getByText("목표 달성률")).toBeVisible();
  await expect(panel.getByText("분류 시간 단축")).toBeVisible();

  const headerBox = await header.boundingBox();
  const panelBox = await panel.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(panelBox).not.toBeNull();
  expect(panelBox.y - (headerBox.y + headerBox.height)).toBeLessThanOrEqual(20);
  expect(panelBox.height).toBeLessThanOrEqual(380);

  const goalCards = await page.locator(".view-goals .work-item").evaluateAll((items) =>
    items.map((item) => {
      const rect = item.getBoundingClientRect();
      return { top: rect.top, height: rect.height };
    }),
  );
  expect(goalCards.length).toBe(5);
  for (const card of goalCards) {
    expect(card.height).toBeLessThanOrEqual(118);
    expect(card.top).toBeLessThan(430);
  }

  await saveShot(page, "goals-compact.png");
});

test("dashboard columns pack panels without grid row gaps", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/index.html#dashboard");

  await expect(page.getByText("월별 비용 추이")).toBeVisible();
  await expect(page.getByText("최근 처리 이력")).toBeVisible();

  const columnGaps = await page.locator(".dashboard-column").evaluateAll((columns) =>
    columns.map((column) => {
      const children = [...column.children]
        .map((child) => child.getBoundingClientRect())
        .filter((rect) => rect.width > 0 && rect.height > 0)
        .sort((a, b) => a.top - b.top);

      return children.slice(1).map((rect, index) => Math.round(rect.top - children[index].bottom));
    }),
  );

  expect(columnGaps.length).toBe(2);
  for (const gaps of columnGaps) {
    expect(gaps.length).toBeGreaterThan(0);
    for (const gap of gaps) {
      expect(gap).toBeLessThanOrEqual(18);
    }
  }

  const leftFlowGap = await page.evaluate(() => {
    const ranking = document.querySelector(".ranking-panel")?.getBoundingClientRect();
    const activityPanel = document.querySelector(".activity-panel")?.getBoundingClientRect();
    return ranking && activityPanel ? Math.round(activityPanel.top - ranking.bottom) : null;
  });
  expect(leftFlowGap).not.toBeNull();
  expect(leftFlowGap).toBeLessThanOrEqual(18);

  await saveShot(page, "dashboard-packed.png");
});

test("scenario flow runs a selected case and reaches approval state", async ({ page }) => {
  await page.goto("/index.html#cases");
  await page.locator('button.case-row[data-case-id="gwangju-wholesale"]').click();
  await saveShot(page, "scenario-flow-1.png");

  await page.locator('[data-collapse-key="case-approval"]').click();
  await page.locator("#run-agents").click();
  await expect(page.locator("#context-panel")).toContainText("실행 중");
  await expect(page.locator("#context-panel")).toContainText("승인 대기", { timeout: 5_000 });
  await expect(page.locator("#context-panel")).toContainText("생성 산출물", { timeout: 5_000 });
  await saveShot(page, "scenario-flow-2.png");
});

test("approval queue can approve a pending action", async ({ page }) => {
  await page.goto("/index.html#approvals");
  await page.locator("button[data-approve-case]:not([disabled])").first().click();
  await expect(page.getByText("승인 완료")).toBeVisible();
});

test("jeonse protection workflow is visible", async ({ page }) => {
  await page.goto("/index.html#jeonse");
  const features = page.locator(".feature-grid");
  await expect(features.getByText("전세가율 탐지", { exact: true })).toBeVisible();
  await expect(features.getByText("권리관계 위험", { exact: true })).toBeVisible();
  await expect(features.getByText("은행 연계", { exact: true })).toBeVisible();
  await expect(page.locator("#jeonse-diagnosis-form")).toBeVisible();
});

test("new case form validates input and registers user data", async ({ page }) => {
  await page.goto("/index.html");
  await page.locator("#new-case-button").click();
  await expect(page.getByRole("dialog", { name: "금융 위험 케이스 등록" })).toBeVisible();

  await page.locator("#new-case-form").getByRole("button", { name: "케이스 등록", exact: true }).click();
  await expect(page.getByText("고객명과 지역은 필수입니다.")).toBeVisible();

  await page.locator('select[name="riskType"]').selectOption("jeonse");
  await page.locator('input[name="customerName"]').fill("부산 신혼부부 전세 예정");
  await page.locator('input[name="region"]').fill("부산 해운대구");
  await page.locator('textarea[name="exposure"]').fill("전세보증금 2.1억, 등기부 근저당 확인 필요");
  await page.locator("#new-case-form").getByRole("button", { name: "케이스 등록", exact: true }).click();

  await expect(page.locator("#context-panel")).toContainText("부산 신혼부부 전세 예정");
  await expect(page.locator("#context-panel")).toContainText("사용자 입력 데이터");
});

test("jeonse diagnosis produces result, save, and follow-up actions", async ({ page }) => {
  await page.goto("/index.html#jeonse");
  await page.locator('input[name="deposit"]').fill("210000000");
  await page.locator('input[name="market"]').fill("240000000");
  await page.locator('input[name="assets"]').fill("260000000");
  await page.locator('input[name="income"]').fill("3200000");
  await page.locator('select[name="rights"]').selectOption("근저당 있음");
  await page.locator("#jeonse-diagnosis-form").getByRole("button", { name: "진단 실행" }).click();

  await expect(page.getByText("진단 결과 · 위험도")).toBeVisible();
  await expect(page.locator("#context-panel")).toContainText("분석 결과");
  await page.locator("#save-case-result").click();
  await expect(page.getByText("결과를 저장했습니다.")).toBeVisible();
  await page.locator("#create-follow-up").click();
  await expect(page.getByRole("status")).toContainText("은행 상담 연결 요청과 보증보험 확인 태스크를 생성했습니다.");
  await saveShot(page, "scenario-flow-3.png");
});

test("golden path demo modes expose scored judgement and next action", async ({ page }) => {
  const demos = [
    ["jeonse", "GP-1 전세 보호", "전세 진단 화면 유지", "전세가율"],
    ["phishing", "GP-2 보이스피싱 차단", "승인 큐에서 차단 승인", "외부 URL·콜백 위험"],
    ["sme", "GP-3 소상공인 자금압박", "승인 큐에서 RM 승인", "상환 스트레스"],
  ];

  for (const [mode, title, action, signal] of demos) {
    await page.goto(`/index.html?demo=${mode}`);
    await expect(page.getByLabel("데모 코치마크")).toContainText(title);
    await expect(page.getByRole("button", { name: new RegExp(action) })).toBeVisible();
    await expect(page.locator(".score-breakdown")).toContainText(signal);
    await expect(page.locator(".source-chip").first()).toBeVisible();
    await expect(page.locator("#context-panel")).toContainText("반려 시 대안");
    await saveShot(page, `golden-${mode}-start.png`);
  }
});

test("audit ledger verifies hash chain and exports json", async ({ page }) => {
  await page.goto("/index.html?demo=jeonse");
  await page.locator("#verify-audit-chain").click();
  await expect(page.locator("#audit-integrity-result")).toContainText("정상");

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#export-audit-json").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("audit-ledger.json");
  await expect(page.locator("#audit-log")).toContainText("GENESIS");
  await saveShot(page, "golden-audit-ledger.png");
});

test("approval matrix and storage schema are visible to reviewers", async ({ page }) => {
  await page.goto("/index.html?demo=sme");
  await page.locator("#save-case-result").click();
  await page.locator('[data-view="skills"]').click();

  await expect(page.getByText("점수 × 조치 유형 라우팅")).toBeVisible();
  await expect(page.getByRole("table", { name: "승인 레벨 매트릭스" })).toContainText("L4");

  const schemaVersion = await page.evaluate(() => {
    const payload = window.localStorage.getItem("jb-localguard-os-state-v2");
    return payload ? JSON.parse(payload).schemaVersion : null;
  });
  expect(schemaVersion).toBe(3);
  await saveShot(page, "golden-approval-matrix.png");
});

test("saved jeonse diagnosis updates dashboard service cycle", async ({ page }) => {
  await page.goto("/index.html#jeonse");
  await page.locator('input[name="deposit"]').fill("210000000");
  await page.locator('input[name="market"]').fill("240000000");
  await page.locator('input[name="assets"]').fill("260000000");
  await page.locator('input[name="income"]').fill("3200000");
  await page.locator('select[name="rights"]').selectOption("근저당 있음");
  await page.locator("#jeonse-diagnosis-form").getByRole("button", { name: "진단 실행" }).click();

  await page.locator("#save-case-result").click();
  await page.locator("#create-follow-up").click();
  await page.goto("/index.html#dashboard");

  await expect(page.getByText("완성형 사이클은 1건입니다.")).toBeVisible();
  await expect(page.getByText("저장된 분석 결과")).toBeVisible();
  await expect(page.getByText("최근 저장 시각")).toBeVisible();
  await expect(page.locator('[data-state="success"]')).toContainText("1건");
  await saveShot(page, "data-dashboard.png");
});

test("empty command shows an actionable error and properties panel toggles", async ({ page }) => {
  await page.goto("/index.html");
  await page.locator("#command-input").fill("");
  await page.locator("#dispatch-command").click();
  await expect(page.getByRole("status")).toContainText("운영 지시를 입력해주세요.");

  await page.locator("#properties-toggle").click();
  await expect(page.locator(".app-shell")).toHaveClass(/properties-collapsed/);
  await page.locator("#properties-toggle").click();
  await expect(page.locator(".app-shell")).not.toHaveClass(/properties-collapsed/);
});

test("case search empty state works", async ({ page }) => {
  await page.goto("/index.html#cases");
  await page.locator("#case-search").fill("존재하지않는검색어");
  await expect(page.getByText("검색 조건에 맞는 케이스 없음")).toBeVisible();
  await saveShot(page, "error-state.png");
});

test("mobile viewport keeps core navigation usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html");
  await expect(page.getByRole("heading", { name: "대시보드" })).toBeVisible();
  await expect(page.locator("#page-content")).not.toBeEmpty();
  await saveShot(page, "mobile-view.png");
  await saveShot(page, "home-mobile.png");
  await saveShot(page, "dashboard-mobile.png");
});

test("tablet viewport keeps dashboard interpretation panels readable", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto("/index.html");
  await expect(page.getByText("데이터 출처와 저장 상태")).toBeVisible();
  await expect(page.getByText("완료된 사용자 가치")).toBeVisible();
  await saveShot(page, "tablet-view.png");
});

test("settings can reset local demo state", async ({ page }) => {
  await page.goto("/index.html#settings");
  await expect(page.getByRole("button", { name: "데모 상태 초기화" })).toBeVisible();
  await page.locator("#reset-demo-state").click();
  await expect(page.getByRole("status")).toContainText("데모 상태를 초기화합니다.");
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("#page-content")).not.toBeEmpty();
});

test("live flag toggles RUNTIME_CONFIG", async ({ page }) => {
  await page.goto("/index.html?demo=jeonse&live=1");
  const live = await page.evaluate(() => window.RUNTIME_CONFIG && window.RUNTIME_CONFIG.liveApi);
  expect(live).toBe(true);

  await page.goto("/index.html?demo=jeonse");
  const off = await page.evaluate(() => window.RUNTIME_CONFIG && window.RUNTIME_CONFIG.liveApi);
  expect(off).toBe(false);
});
