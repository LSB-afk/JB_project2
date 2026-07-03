/* JB우리캐피탈 전용 운영 포털 — 제품 수준 검증 스위트.
   범위: route persistence, affiliate scoping 격리, 금지 메뉴/alias,
   도메인별 케이스 생성 기록, 하네스 실행/핸드오프 규칙, 반응형 스크린샷 스모크. */

const { expect, test } = require("@playwright/test");
const fs = require("node:fs");

const screenshotDirs = ["test-results/screenshots", "tests/results/screenshots"];

async function saveShot(page, name) {
  for (const dir of screenshotDirs) {
    fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: `${dir}/${name}`, fullPage: true });
  }
}

const JBWC_DB_KEY = "jbwc-ops-db-v3";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem("jb-localguard-os-state-v2"));
  await page.addInitScript(() => window.localStorage.removeItem("jb-finance-support-state-v4"));
  await page.addInitScript(() => window.localStorage.removeItem("jbwc-ops-db-v2"));
  await page.addInitScript(() => window.localStorage.removeItem("jbwc-ops-db-v3"));
  await page.addInitScript(() => window.localStorage.removeItem("jpo-ops-db-v2"));
});

async function createCaseViaWizard(page, { domain, productType, title, riskLevel }) {
  await page.goto("/index.html#/jb-woori-capital/cases/new");
  await expect(page.locator("#jbwc-new-case-form")).toBeVisible();
  await page.locator("#jbwc-case-domain").selectOption(domain);
  await expect(page.locator("#jbwc-new-case-form")).toBeVisible();
  if (productType) await page.locator("#jbwc-case-productType").selectOption(productType);
  await page.locator('#jbwc-new-case-form input[name="title"]').fill(title);
  if (riskLevel) await page.locator('#jbwc-new-case-form select[name="riskLevel"]').selectOption(riskLevel);
  await page.locator('#jbwc-new-case-form button[type="submit"]').click();
  await expect(page.locator(".jbwc-detail-panel")).toContainText(title);
  return page.evaluate(([key, caseTitle]) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    const created = db.ops_cases.find((item) => item.title === caseTitle);
    return {
      created,
      tasks: db.ops_tasks.filter((item) => item.caseId === created?.id),
      audits: db.audit_logs.filter((item) => item.targetId === created?.id),
      runs: db.agent_runs.filter((item) => item.caseId === created?.id),
      approvals: db.approvals.filter((item) => item.caseId === created?.id),
      consumerReviews: db.consumer_protection_reviews.filter((item) => item.caseId === created?.id),
      vehicleTasks: db.vehicle_lifecycle_tasks.filter((item) => item.caseId === created?.id),
      documents: db.document_cases.filter((item) => item.caseId === created?.id),
      fdsAlerts: db.fds_alerts.filter((item) => item.caseId === created?.id),
    };
  }, [JBWC_DB_KEY, title]);
}

test("JBWC route가 새로고침 후에도 유지된다 (route persistence)", async ({ page }) => {
  const routes = [
    ["/jb-woori-capital/board", "JB우리캐피탈 운영센터"],
    ["/jb-woori-capital/approvals", "승인 대기"],
    ["/jb-woori-capital/fds", "FDS/보이스피싱 경보"],
    ["/jb-woori-capital/agent-harness", "JB우리캐피탈 운영 에이전트 하네스"],
    ["/jb-woori-capital/consumer-protection", "금융소비자보호 점검"],
    ["/jb-woori-capital/vehicle-lifecycle", "차량관리 태스크"],
  ];
  for (const [route, marker] of routes) {
    await page.goto(`/index.html#${route}`);
    await expect(page.locator("#page-content")).toContainText(marker);
    await page.reload();
    await expect(page.locator("#page-content")).toContainText(marker);
    await expect(page.locator(".sidebar-brand")).toContainText("JB우리캐피탈 운영지원 포털");
    await expect(page.locator(".jbwc-breadcrumb")).toContainText("JB우리캐피탈 운영 포털");
    expect(page.url()).toContain(route);
  }

  await page.goto("/index.html#/jb-woori-capital/cases/new");
  await expect(page.locator("#jbwc-new-case-form")).toBeVisible();
  await page.reload();
  await expect(page.locator("#jbwc-new-case-form")).toBeVisible();

  await page.goto("/index.html#/jb-woori-capital/cases/CASE-JBWC-0002");
  await expect(page.locator(".jbwc-detail-panel")).toContainText("CASE-JBWC-0002");
  await page.reload();
  await expect(page.locator(".jbwc-detail-panel")).toContainText("CASE-JBWC-0002");
});

test("JBWC 모든 조회는 affiliateId 스코프를 강제하고 타 계열사 seed를 제외한다", async ({ page }) => {
  await page.goto("/index.html#/jb-woori-capital/cases");
  await page.waitForFunction(() => typeof getJbWooriCapitalSidebarCounts === "function");

  const scope = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    const other = db.ops_cases.filter((c) => c.affiliateId !== "jb-woori-capital");
    let scopeError = null;
    try { jbwcTable("ops_cases"); } catch (error) { scopeError = error.message; }
    return {
      rawCases: db.ops_cases.length,
      otherCases: other.length,
      otherIds: other.map((c) => c.id),
      scopedCases: jbwcTable("ops_cases", JBWC_AFFILIATE_ID).length,
      scopedIds: jbwcTable("ops_cases", JBWC_AFFILIATE_ID).map((c) => c.id),
      countsCases: getJbWooriCapitalSidebarCounts().cases,
      searchHits: searchJbWooriCapitalRecords("타 계열사 검증").length,
      searchHitsById: searchJbWooriCapitalRecords("CASE-OTHER").length,
      scopeError,
    };
  }, JBWC_DB_KEY);

  expect(scope.otherCases).toBeGreaterThan(0);
  expect(scope.scopedCases).toBe(scope.rawCases - scope.otherCases);
  for (const id of scope.otherIds) expect(scope.scopedIds).not.toContain(id);
  expect(scope.searchHits).toBe(0);
  expect(scope.searchHitsById).toBe(0);
  expect(scope.scopeError).toContain("affiliateId scope is required");

  await expect(page.locator("#page-content")).not.toContainText("CASE-OTHER-0001");

  await page.locator("#sidebar-search").fill("타 계열사 검증");
  await expect(page.locator("#jbwc-search-results")).toContainText("결과 없음");
});

test("JBWC 사이드바 카운트는 문서화된 스코프 쿼리와 일치한다", async ({ page }) => {
  await page.goto("/index.html#/jb-woori-capital/board");
  await page.waitForFunction(() => typeof getJbWooriCapitalSidebarCounts === "function");

  const mapping = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    const mine = (table) => (db[table] || []).filter((row) => row.affiliateId === "jb-woori-capital");
    const counts = getJbWooriCapitalSidebarCounts();
    return {
      counts,
      expected: {
        approvals: mine("approvals").filter((x) => x.status === "pending").length,
        auditLogs: mine("audit_logs").filter((x) => x.reviewRequired === true).length,
        documents: mine("document_cases").filter((x) => ["pending", "needsReview"].includes(x.status)).length,
        fds: mine("fds_alerts").filter((x) => ["open", "investigating", "escalated"].includes(x.status)).length,
        consumerProtection: mine("consumer_protection_reviews").filter((x) => ["open", "needsReview"].includes(x.status)).length,
        vehicleLifecycle: mine("vehicle_lifecycle_tasks").filter((x) => ["open", "inProgress", "overdue"].includes(x.status)).length,
      },
    };
  }, JBWC_DB_KEY);

  for (const [key, value] of Object.entries(mapping.expected)) {
    expect(mapping.counts[key], `count key: ${key}`).toBe(value);
  }
});

test("JBWC 금지 메뉴/금지 alias가 존재하지 않는다", async ({ page }) => {
  await page.goto("/index.html#/jb-woori-capital/board");
  await expect(page.locator("#nav-list")).toContainText("업무 보드");
  await expect(page.locator("#nav-list")).not.toContainText("전세 안심 점검");

  const alias = await page.evaluate(() => ({
    dashboardConfigAlias: typeof jbWooriCapitalDashboardConfig,
    mainAgentIds: agents.map((agent) => agent.id),
    jbwcAgentIds: jbWooriCapitalOpsHarness.agents.map((agent) => agent.id),
    harnessAffiliate: jbWooriCapitalOpsHarness.affiliateId,
  }));
  expect(alias.dashboardConfigAlias).toBe("undefined");
  expect(alias.harnessAffiliate).toBe("jb-woori-capital");
  expect(alias.jbwcAgentIds.length).toBe(13);
  expect(alias.jbwcAgentIds.every((id) => id.startsWith("jbwc-"))).toBe(true);
  expect(alias.mainAgentIds.some((id) => alias.jbwcAgentIds.includes(id))).toBe(false);
});

test("소비자보호 케이스 생성 시 consumer_protection_reviews와 사람 검토가 기록된다", async ({ page }) => {
  const state = await createCaseViaWizard(page, {
    domain: "consumerProtection",
    productType: "금리인하요구권",
    title: "E2E 소비자보호 생성 검증",
  });
  expect(state.created.requiresHumanReview).toBe(true);
  expect(state.created.status).toBe("pendingCustomerProtectionReview");
  expect(state.consumerReviews.length).toBe(1);
  expect(state.consumerReviews[0].requiresHumanReview).toBe(true);
  expect(state.approvals.length).toBeGreaterThanOrEqual(1);
  expect(state.runs.length).toBeGreaterThanOrEqual(1);
  expect(state.audits.some((x) => x.action === "JBWC_CASE_CREATED")).toBe(true);
});

test("차량관리 케이스 생성 시 vehicle_lifecycle_tasks가 기록된다", async ({ page }) => {
  const state = await createCaseViaWizard(page, {
    domain: "vehicleLifecycle",
    productType: "리콜",
    title: "E2E 차량관리 생성 검증",
  });
  expect(state.created.status).toBe("waitingVehicleTask");
  expect(state.vehicleTasks.length).toBe(1);
  expect(state.vehicleTasks[0].status).toBe("open");
  expect(state.runs.length).toBeGreaterThanOrEqual(1);
});

test("전자약정·서류 케이스 생성 시 document_cases가 기록된다", async ({ page }) => {
  const state = await createCaseViaWizard(page, {
    domain: "documentContract",
    productType: "전자약정",
    title: "E2E 전자약정 생성 검증",
  });
  expect(state.created.status).toBe("waitingDocuments");
  expect(state.documents.length).toBe(1);
  expect(state.documents[0].status).toBe("pending");
  expect(state.runs.length).toBeGreaterThanOrEqual(1);
});

test("FDS 케이스 생성 시 fds_alerts와 에스컬레이션 승인이 기록된다", async ({ page }) => {
  const state = await createCaseViaWizard(page, {
    domain: "fdsVoicePhishing",
    productType: "보이스피싱 의심",
    title: "E2E FDS 생성 검증",
    riskLevel: "critical",
  });
  expect(state.created.status).toBe("pendingFdsEscalation");
  expect(state.created.requiresHumanReview).toBe(true);
  expect(state.fdsAlerts.length).toBe(1);
  expect(state.fdsAlerts[0].requiresHumanEscalation).toBe(true);
  expect(state.fdsAlerts[0].severity).toBe("critical");
  expect(state.approvals.some((x) => x.approvalType === "FDS 사람 에스컬레이션")).toBe(true);
  expect(state.runs[0].status).not.toBe("completed");
});

test("하네스 샘플 실행이 agent_runs/agent_handoffs를 기록하고 고위험 자동 종결을 금지한다", async ({ page }) => {
  await page.goto("/index.html#/jb-woori-capital/agent-harness");
  await expect(page.locator("#page-content")).toContainText("JB우리캐피탈 운영 에이전트 하네스");

  const before = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    return { runs: db.agent_runs.length, handoffs: db.agent_handoffs.length };
  }, JBWC_DB_KEY);

  await page.getByRole("button", { name: /자동차리스 계약 반환 절차 문의가 들어왔어/ }).click();
  await expect(page.locator("#page-content")).toContainText("오케스트레이터 분류");
  const afterLease = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    return {
      runs: db.agent_runs.length,
      handoffs: db.agent_handoffs.length,
      lastRun: db.agent_runs[0],
      lastHandoff: db.agent_handoffs[0],
    };
  }, JBWC_DB_KEY);
  expect(afterLease.runs).toBe(before.runs + 1);
  expect(afterLease.handoffs).toBe(before.handoffs + 1);
  expect(afterLease.lastHandoff.toAgentId).toBe("jbwc-vehicle");

  await page.getByRole("button", { name: /중도상환 문의를 고객관리 업무로 라우팅해줘/ }).click();
  await expect(page.locator("#page-content")).toContainText("오케스트레이터 분류");
  const afterPrepay = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    return { runs: db.agent_runs.length, handoffs: db.agent_handoffs.length, lastRun: db.agent_runs[0] };
  }, JBWC_DB_KEY);
  expect(afterPrepay.runs).toBe(afterLease.runs + 1);
  expect(afterPrepay.handoffs).toBe(afterLease.handoffs);
  expect(afterPrepay.lastRun.agentId).toBe("jbwc-care");
  expect(afterPrepay.lastRun.status).toBe("completed");

  await page.getByRole("button", { name: /보이스피싱 의심 민원이 접수됐어/ }).click();
  await expect(page.locator("#page-content")).toContainText("사람 검토 대기");
  const afterPhishing = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    return {
      lastRun: db.agent_runs[0],
      fdsHandoff: db.agent_handoffs.find((handoff) => handoff.toAgentId === "jbwc-fds" && handoff.fromAgentId === "jbwc-fds"),
      slaHandoff: db.agent_handoffs.find((handoff) => handoff.toAgentId === "jbwc-metrics"),
      highOrCriticalStatuses: db.agent_runs
        .filter((run) => ["high", "critical"].includes(run.riskLevel))
        .map((run) => run.status),
    };
  }, JBWC_DB_KEY);
  expect(afterPhishing.lastRun.agentId).toBe("jbwc-fds");
  expect(afterPhishing.lastRun.requiresHumanEscalation).toBe(true);
  expect(afterPhishing.lastRun.status).toBe("needsReview");
  expect(afterPhishing.fdsHandoff).toBeTruthy();
  expect(afterPhishing.fdsHandoff.status).toBe("escalated");
  expect(afterPhishing.slaHandoff).toBeTruthy();
  for (const status of afterPhishing.highOrCriticalStatuses) {
    expect(["completed", "closed"]).not.toContain(status);
  }
});

test("JBWC 화면 표기는 한국어로 통일되고 로딩/빈 상태가 일관된다", async ({ page }) => {
  await page.goto("/index.html#/jb-woori-capital/cases");
  await expect(page.locator("#page-content")).toContainText("서류 대기");
  await expect(page.locator("#page-content")).toContainText("기본 정렬");
  await expect(page.locator(".jbwc-updated")).toContainText("데이터 기준");

  await page.goto("/index.html#/jb-woori-capital/cases/new");
  await expect(page.locator("#page-content")).toContainText("1단계. 업무 도메인 선택");
  await expect(page.locator("#page-content")).toContainText("제목");
  await expect(page.locator("#page-content")).toContainText("우선순위");
  await expect(page.locator("#page-content")).toContainText("추천 에이전트");
  await expect(page.locator("#page-content")).toContainText("사람 검토 필요");

  await page.goto("/index.html#/jb-woori-capital/cases");
  const filterInput = page.locator("[data-jbwc-list-filter]").first();
  await filterInput.fill("존재하지않는필터검색어");
  await filterInput.press("Enter");
  await expect(page.locator(".jbwc-empty")).toContainText("필터 조건에 맞는 데이터가 없습니다.");

  await page.goto("/index.html#/jb-woori-capital/cases/CASE-JBWC-9999");
  await expect(page.locator(".jbwc-detail-panel")).toContainText("상세 데이터를 찾을 수 없습니다");
});

test("JBWC 데스크톱/태블릿/모바일 스크린샷 스모크 (overflow 금지)", async ({ page }) => {
  const viewports = [
    ["desktop", { width: 1920, height: 1080 }],
    ["tablet", { width: 820, height: 1180 }],
    ["mobile", { width: 390, height: 844 }],
  ];
  const routes = [
    ["board", "/jb-woori-capital/board"],
    ["cases", "/jb-woori-capital/cases"],
    ["wizard", "/jb-woori-capital/cases/new"],
    ["harness", "/jb-woori-capital/agent-harness"],
  ];
  for (const [vpName, viewport] of viewports) {
    await page.setViewportSize(viewport);
    for (const [routeName, route] of routes) {
      await page.goto(`/index.html#${route}`);
      await expect(page.locator("#page-content")).not.toBeEmpty();
      const overflow = await page.evaluate(() => (
        Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - window.innerWidth
      ));
      expect(overflow, `${routeName}@${vpName}`).toBeLessThanOrEqual(1);
      await saveShot(page, `jbwc-${routeName}-${vpName}.png`);
    }
  }
});
