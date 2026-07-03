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
  await page.addInitScript(() => window.localStorage.removeItem("jb-finance-support-state-v4"));
  await page.addInitScript(() => window.localStorage.removeItem("jbwc-ops-db-v2"));
  await page.addInitScript(() => window.localStorage.removeItem("jbwc-ops-db-v3"));
  await page.addInitScript(() => window.localStorage.removeItem("jpo-ops-db-v2"));
});

test("home and dashboard render without console errors", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/index.html");
  await expect(page.locator("#page-content").getByRole("heading", { name: "JB 금융안전 업무지원 포털" })).toBeVisible();
  await expect(page.locator("#page-content")).not.toBeEmpty();
  await expect(page.locator("#context-panel")).not.toBeEmpty();
  await expect(page.getByText("오늘 우선 처리 기준")).toBeVisible();
  await expect(page.getByText("운영 비용 해석")).toBeVisible();
  await expect(page.getByText("지역별 주의 수준")).toBeVisible();
  await expect(page.getByText("완료된 사용자 가치")).toBeVisible();
  await expect(page.locator("#page-content")).toContainText("서버 첫 화면");
  await expect(page.getByText("2026-07-01 최신 반영")).toBeVisible();
  await expect(page.getByText("신규 제안 14개 Agent와 27개 Skill")).toBeVisible();
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
      expect(layout.firstChildTop).toBeLessThanOrEqual(viewport.width <= 390 ? viewport.height * 2 : 40);
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
  expect(panelBox.y - (headerBox.y + headerBox.height)).toBeLessThanOrEqual(32);
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
    expect(card.top).toBeLessThan(560);
  }

  await saveShot(page, "goals-compact.png");
});

test("dashboard columns pack panels without grid row gaps", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/index.html#dashboard");

  await expect(page.getByText("운영 비용 해석")).toBeVisible();
  await expect(page.getByText("최근 감사 로그")).toBeVisible();

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

  await saveShot(page, "dashboard-packed.png");
});

test("properties detail panel scrolls expanded case sections", async ({ page }) => {
  for (const viewport of [
    { width: 1920, height: 1080 },
    { width: 450, height: 1044 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/index.html#cases");
    const auditToggle = page.locator('[data-panel-key="case-audit"] .panel-toggle');
    if ((await auditToggle.count()) === 1 && (await auditToggle.isVisible())) {
      await auditToggle.click();
    }

    const scrollState = await page.evaluate(() => {
      const contextPanel = document.querySelector("#context-panel");
      const summaryPanel = document.querySelector('[data-panel-key="case-summary"]');
      const auditPanel = document.querySelector('[data-panel-key="case-audit"]');
      if (!contextPanel || !summaryPanel || !auditPanel) return null;
      contextPanel.scrollTop = 0;
      const before = contextPanel.scrollTop;
      contextPanel.scrollTop = 9999;
      const after = contextPanel.scrollTop;
      return {
        before,
        after,
        contextClientHeight: contextPanel.clientHeight,
        contextScrollHeight: contextPanel.scrollHeight,
        hasSummaryPanel: Boolean(summaryPanel),
        hasAuditPanel: Boolean(auditPanel),
      };
    });

    expect(scrollState).not.toBeNull();
    expect(scrollState.contextScrollHeight).toBeGreaterThanOrEqual(scrollState.contextClientHeight);
    if (scrollState.contextScrollHeight > scrollState.contextClientHeight) {
      expect(scrollState.after).toBeGreaterThan(scrollState.before);
    }
    expect(scrollState.hasSummaryPanel).toBe(true);
    expect(scrollState.hasAuditPanel).toBe(true);
  }
});

test("scenario flow runs a selected case and reaches approval state", async ({ page }) => {
  await page.goto("/index.html#cases");
  await page.locator('button[data-case-id="iksan-wholesale"]').first().click();
  await saveShot(page, "scenario-flow-1.png");

  await page.locator('[data-collapse-key="case-approval"]').click();
  await page.locator("#run-agents").click();
  await expect(page.locator("#context-panel")).toContainText("승인 대기", { timeout: 5_000 });
  await expect(page.locator("#context-panel")).toContainText("생성 산출물", { timeout: 5_000 });
  await saveShot(page, "scenario-flow-2.png");
});

test("approval queue can approve a pending action", async ({ page }) => {
  await page.goto("/index.html#approvals");
  await page.locator("button[data-approve-case]:not([disabled])").first().click();
  await expect(page.locator("#context-panel")).toContainText("검토 완료");
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
  await expect(page.locator("#new-case-form")).toBeVisible();

  await page.locator("#new-case-form").getByRole("button", { name: "관리 건 접수", exact: true }).click();
  await expect(page.getByText("고객/관리 건 이름과 지역을 입력해 주세요.")).toBeVisible();

  await page.locator('select[name="riskType"]').selectOption("jeonse");
  await page.locator('input[name="customerName"]').fill("부산 신혼부부 전세 예정");
  await page.locator('input[name="region"]').fill("부산 해운대구");
  await page.locator('textarea[name="exposure"]').fill("전세보증금 2.1억, 등기부 근저당 확인 필요");
  await page.locator("#new-case-form").getByRole("button", { name: "관리 건 접수", exact: true }).click();

  await expect(page.locator("#context-panel")).toContainText("부산 신혼부부 전세 예정");
  await expect(page.locator("#context-panel")).toContainText("신규 접수 정보");
});

test("jeonse diagnosis produces result, save, and follow-up actions", async ({ page }) => {
  await page.goto("/index.html#jeonse");
  await page.locator('input[name="deposit"]').fill("210000000");
  await page.locator('input[name="market"]').fill("240000000");
  await page.locator('input[name="assets"]').fill("260000000");
  await page.locator('input[name="income"]').fill("3200000");
  await page.locator('select[name="rights"]').selectOption("근저당 있음");
  await page.locator("#jeonse-diagnosis-form").getByRole("button", { name: "사전 점검 실행" }).click();

  await expect(page.getByText(/사전 점검 결과 · 주의 수준/)).toBeVisible();
  await expect(page.locator("#context-panel")).toContainText("분석 결과");
  await page.locator("#save-case-result").click();
  await expect(page.getByText("결과를 저장했습니다.")).toBeVisible();
  await page.locator("#create-follow-up").click();
  await expect(page.getByRole("status")).toContainText("은행 상담 연결 요청과 보증보험 확인 태스크를 생성했습니다.");
  await saveShot(page, "scenario-flow-3.png");
});

test("golden path demo modes expose scored judgement and next action", async ({ page }) => {
  const demos = [
    ["sme", "GP-1 소상공인 자금압박", "승인 큐에서 RM 승인", "상환 부담"],
    ["phishing", "GP-2 보이스피싱 차단", "승인 큐에서 차단 승인", "외부 URL·콜백 위험"],
    ["jeonse", "GP-3 전세 보호", "전세 사전 점검 화면 유지", "전세가율"],
  ];

  for (const [mode, title, action, signal] of demos) {
    await page.goto(`/index.html?demo=${mode}`);
    await expect(page.getByLabel("데모 코치마크")).toContainText(title);
    await expect(page.getByRole("button", { name: new RegExp(action) })).toBeVisible();
    await expect(page.locator(".score-breakdown")).toContainText(signal);
    await expect(page.locator(".source-chip").first()).toBeVisible();
    await expect(page.locator("#context-panel")).toContainText("수정 요청 시 대안");
    await saveShot(page, `golden-${mode}-start.png`);
  }
});

test("hero strategy: slogan, demo CTAs, live/roadmap badges, group expansion node", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator("#page-content")).toContainText("손은 놓고, 눈만");
  await expect(page.locator("#page-content")).toContainText("에이전트가 일하고, 담당자는 승인만");
  const chipContent = await page.evaluate(() => (
    getComputedStyle(document.querySelector("#page-content .workspace-header"), "::before").content
  ));
  expect(chipContent).toContain("손은 놓고, 눈만");
  await expect(page.locator(".hero-demo-actions")).toContainText("GP-1 여신(소상공인·SME) 데모 시작");
  await expect(page.locator(".hero-demo-actions")).toContainText("GP-2 보이스피싱 차단 데모 시작");
  await expect(page.locator(".hero-demo-actions")).toContainText("확장 로드맵");
  await expect(page.locator(".expansion-panel")).toContainText("전북은행 · Hero 실동작");
  await expect(page.locator(".expansion-panel")).toContainText("JB우리캐피탈 · 그룹 확장성 증명");
  await expect(page.locator(".expansion-panel")).not.toContainText("광주은행");
  await expect(page.locator("#metric-grid")).toContainText("전세 안심 점검 · 로드맵");
  await saveShot(page, "hero-strategy-home.png");

  await page.goto("/index.html#agents");
  await expect(page.locator("#page-content .exec-badge").filter({ hasText: "실동작" }).first()).toBeVisible();
  await expect(page.locator("#page-content .exec-badge").filter({ hasText: "확장 예정" }).first()).toBeVisible();
  const badgeCounts = await page.evaluate(() => ({
    live: agents.filter((agent) => liveAgentIds.has(agent.id)).length,
    roadmap: agents.filter((agent) => !liveAgentIds.has(agent.id)).length,
  }));
  expect(badgeCounts.live).toBe(5);
  expect(badgeCounts.roadmap).toBe(9);

  await page.goto("/index.html#orgchart");
  await expect(page.locator(".org-legend")).toContainText("실동작 5");
  await expect(page.locator(".org-legend")).toContainText("확장 예정 9");
  await expect(page.locator(".org-branch-grid")).toContainText("전세 보호 라인 · 확장 로드맵");
  await expect(page.locator(".org-branch-grid")).toContainText("사기 차단과 준법 · Hero 실동작");
  await saveShot(page, "hero-strategy-orgchart.png");

  await page.goto("/index.html#jeonse");
  await expect(page.locator("#page-content")).toContainText("확장 로드맵");

  await page.goto("/index.html");
  await page.locator(".expansion-link").click();
  await expect(page.getByRole("heading", { name: "JB우리캐피탈 운영센터" })).toBeVisible();
  await expect(page.locator(".sidebar-brand")).toContainText("JB우리캐피탈 운영지원 포털");
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
  await page.locator("#run-agents").click();
  await expect(page.locator("#context-panel")).toContainText("생성 산출물", { timeout: 5_000 });
  await page.locator("#save-case-result").click();
  await page.locator('[data-view="skills"]').click();

  await expect(page.getByText("점수 × 조치 유형 라우팅")).toBeVisible();
  await expect(page.getByRole("table", { name: "승인 레벨 매트릭스" })).toContainText("L4");

  const schemaVersion = await page.evaluate(() => {
    const payload = window.localStorage.getItem("jb-finance-support-state-v4");
    return payload ? JSON.parse(payload).schemaVersion : null;
  });
  expect(schemaVersion).toBe(4);
  await saveShot(page, "golden-approval-matrix.png");
});

test("saved jeonse diagnosis updates dashboard service cycle", async ({ page }) => {
  await page.goto("/index.html#jeonse");
  await page.locator('input[name="deposit"]').fill("210000000");
  await page.locator('input[name="market"]').fill("240000000");
  await page.locator('input[name="assets"]').fill("260000000");
  await page.locator('input[name="income"]').fill("3200000");
  await page.locator('select[name="rights"]').selectOption("근저당 있음");
  await page.locator("#jeonse-diagnosis-form").getByRole("button", { name: "사전 점검 실행" }).click();

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
  await page.getByRole("button", { name: "목록", exact: true }).click();
  await expect(page.getByText("검색 조건에 맞는 관리 건이 없습니다")).toBeVisible();
  await saveShot(page, "error-state.png");
});

test("mobile viewport keeps core navigation usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html");
  await expect(page.locator("#page-content").getByRole("heading", { name: "JB 금융안전 업무지원 포털" })).toBeVisible();
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

test("live flag toggles RUNTIME_CONFIG and stays off by default", async ({ page }) => {
  await page.goto("/index.html?demo=jeonse&live=1");
  const live = await page.evaluate(() => window.RUNTIME_CONFIG && window.RUNTIME_CONFIG.liveApi);
  expect(live).toBe(true);

  await page.goto("/index.html?demo=jeonse");
  const off = await page.evaluate(() => window.RUNTIME_CONFIG && window.RUNTIME_CONFIG.liveApi);
  expect(off).toBe(false);
  await expect(page.locator(".live-data-note")).toHaveCount(0);
});

test("live mode without proxy falls back to simulation and still completes diagnosis", async ({ page }) => {
  await page.goto("/index.html?live=1#jeonse");
  await expect(page.locator("#jeonse-diagnosis-form")).toBeVisible();
  await expect(page.locator('[data-live-market="fallback"]')).toContainText("공공 API 미연결", { timeout: 8_000 });
  await expect(page.locator('input[name="market"]')).toHaveAttribute("data-market-source", "simulation");

  await page.locator('input[name="deposit"]').fill("210000000");
  await page.locator('input[name="market"]').fill("240000000");
  await page.locator('input[name="assets"]').fill("260000000");
  await page.locator('input[name="income"]').fill("3200000");
  await page.locator('select[name="rights"]').selectOption("근저당 있음");
  await page.locator("#jeonse-diagnosis-form").getByRole("button", { name: "사전 점검 실행" }).click();
  await expect(page.getByText(/사전 점검 결과 · 주의 수준/)).toBeVisible();
  const audit = await page.evaluate(() => {
    const item = cases.find((entry) => entry.pains.includes("jeonse-fraud"));
    return item.audit[item.audit.length - 1][1];
  });
  expect(audit).toContain("시세 출처: 시뮬레이션 입력");
});

test("settings can reset local demo state", async ({ page }) => {
  await page.goto("/index.html#settings");
  await expect(page.getByRole("button", { name: "데모 상태 초기화" })).toBeVisible();
  await page.locator("#reset-demo-state").click();
  await expect(page.getByRole("status")).toContainText("데모 상태를 초기화합니다.");
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("#page-content")).not.toBeEmpty();
});

test("JB우리캐피탈 dedicated portal uses scoped DB data, search, case creation, and harness records", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/index.html");
  await page.locator('[data-rail-toggle="affiliate"]').click();
  await page.locator('[data-affiliate="JB우리캐피탈"]').click();

  await expect(page.getByRole("heading", { name: "JB우리캐피탈 운영센터" })).toBeVisible();
  await expect(page.locator(".sidebar-brand")).toContainText("JB우리캐피탈 운영지원 포털");
  await expect(page.locator(".sidebar-brand")).toContainText("자동차금융·개인금융·고객보호 업무를 돕는 AI 운영지원");
  await expect(page.locator("#new-case-button")).toContainText("신규 운영 건 접수");
  await expect(page.locator("#sidebar-search")).toHaveAttribute("placeholder", /고객 ID, 관리 건, 상품, 담당자/);
  await expect(page.locator("#nav-list")).toContainText("금융소비자보호 점검");
  await expect(page.locator("#nav-list")).toContainText("부동산/담보 금융");
  await expect(page.locator("#nav-list")).toContainText("내 금융관리");
  await expect(page.locator("#nav-list")).toContainText("민원/고객센터");
  await expect(page.locator("#nav-list")).not.toContainText("전세 안심 점검");

  await page.waitForFunction(() => {
    return typeof getJbWooriCapitalSidebarCounts === "function"
      && getJbWooriCapitalSidebarCounts().cases >= 30
      && getJbWooriCapitalSidebarCounts().approvals >= 3;
  });
  const counts = await page.evaluate(() => getJbWooriCapitalSidebarCounts());
  expect(counts.cases).toBeGreaterThanOrEqual(30);
  expect(counts.approvals).toBeGreaterThanOrEqual(3);
  expect(counts.fds).toBeGreaterThanOrEqual(3);
  expect(counts.documents).toBeGreaterThanOrEqual(4);
  expect(counts.mortgageSecured).toBeGreaterThanOrEqual(2);
  const registrySize = await page.evaluate(() => jbWooriCapitalOpsHarness.agents.length);
  expect(registrySize).toBe(13);

  await page.locator("#sidebar-search").fill("CASE-JBWC-0002");
  await expect(page.locator("#jbwc-search-results")).toContainText("CASE-JBWC-0002");
  await page.locator("#jbwc-search-results .jbwc-search-hit").first().click();
  await expect(page.locator(".jbwc-detail-panel")).toContainText("CASE-JBWC-0002");
  await expect(page.locator(".jbwc-detail-panel")).toContainText("CUST-JBWC");
  await expect(page).toHaveURL(/\/jb-woori-capital\/cases\/CASE-JBWC-0002/);

  await page.locator("#new-case-button").click();
  await expect(page.locator("#page-content")).toContainText("신규 JB우리캐피탈 운영 건 접수");
  await expect(page.locator("#jbwc-new-case-form")).toBeVisible();
  await expect(page).toHaveURL(/\/jb-woori-capital\/cases\/new/);
  await page.locator('#jbwc-case-domain').selectOption("fdsVoicePhishing");
  await page.locator('#jbwc-case-productType').selectOption("보이스피싱 의심");
  await page.locator('#jbwc-new-case-form input[name="title"]').fill("Playwright 신규 운영 건");
  await page.locator('#jbwc-new-case-form textarea[name="description"]').fill("익명 mock 운영 건 생성 검증");
  await page.locator('#jbwc-new-case-form input[name="customerRefId"]').fill("CUST-JBWC-E2E");
  await page.locator('#jbwc-new-case-form input[name="contractRefId"]').fill("CONTRACT-JBWC-E2E");
  await page.locator('#jbwc-new-case-form select[name="riskLevel"]').selectOption("high");
  await page.locator('#jbwc-new-case-form input[name="requiresHumanReview"]').check();
  await page.locator('#jbwc-new-case-form button[type="submit"]').click();
  await expect(page.locator(".jbwc-detail-panel")).toContainText("Playwright 신규 운영 건");
  await expect(page).toHaveURL(/\/jb-woori-capital\/cases\/CASE-JBWC-/);
  const createdState = await page.evaluate(() => {
    const db = JSON.parse(window.localStorage.getItem("jbwc-ops-db-v3"));
    const created = db.ops_cases.find((item) => item.title === "Playwright 신규 운영 건");
    return {
      caseCreated: Boolean(created),
      taskCreated: db.ops_tasks.some((item) => item.caseId === created?.id),
      auditCreated: db.audit_logs.some((item) => item.targetId === created?.id && item.action === "JBWC_CASE_CREATED"),
      fdsCreated: db.fds_alerts.some((item) => item.caseId === created?.id && item.requiresHumanEscalation === true),
      approvalCreated: db.approvals.some((item) => item.caseId === created?.id && item.status === "pending"),
      analysisQueued: db.ai_analysis_requests.some((item) => item.caseId === created?.id && item.status === "queued"),
      runLogged: db.agent_runs.some((item) => item.caseId === created?.id),
    };
  });
  expect(createdState).toEqual({
    caseCreated: true,
    taskCreated: true,
    auditCreated: true,
    fdsCreated: true,
    approvalCreated: true,
    analysisQueued: true,
    runLogged: true,
  });
  const createdCounts = await page.evaluate(() => getJbWooriCapitalSidebarCounts());
  expect(createdCounts.cases).toBeGreaterThan(counts.cases);
  expect(createdCounts.aiAnalysis).toBeGreaterThan(counts.aiAnalysis);

  await page.getByRole("button", { name: /운영 에이전트 하네스/ }).click();
  await expect(page.locator("#page-content")).toContainText("JB우리캐피탈 운영 에이전트 하네스");
  await page.getByRole("button", { name: /보이스피싱 의심 민원이 접수됐어/ }).click();
  await expect(page.locator(".jbwc-detail-panel")).toContainText("requiresHumanEscalation");
  await expect(page.locator(".jbwc-detail-panel")).toContainText("true");
  await expect(page.locator("#page-content")).toContainText("사람 검토 대기");
  const harnessState = await page.evaluate(() => {
    const db = JSON.parse(window.localStorage.getItem("jbwc-ops-db-v3"));
    return {
      highRun: db.agent_runs.some((run) => run.agentId === "jbwc-fds" && run.requiresHumanEscalation === true),
      highHandoff: db.agent_handoffs.some((handoff) => handoff.toAgentId === "jbwc-fds" && handoff.status === "escalated"),
    };
  });
  expect(harnessState.highRun).toBe(true);
  expect(harnessState.highHandoff).toBe(true);

  await page.reload();
  await expect(page.locator(".sidebar-brand")).toContainText("JB우리캐피탈 운영지원 포털");
  await expect(page.locator("#page-content")).toContainText("JB우리캐피탈 운영 에이전트 하네스");
  await expect(page.locator("#nav-list")).toContainText("운영 에이전트 하네스");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html#/jb-woori-capital/board");
  await expect(page.getByRole("heading", { name: "JB우리캐피탈 운영센터" })).toBeVisible();
  const horizontalOverflow = await page.evaluate(() => Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - window.innerWidth);
  expect(horizontalOverflow).toBeLessThanOrEqual(1);

  expect(errors).toEqual([]);
});
