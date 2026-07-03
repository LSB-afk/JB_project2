/* 전세사기 보호 업무지원 포털(v2) — 제품 수준 검증 스위트.
   범위: 역할 진입/전용 메뉴, generic 샘플 부재, lifecycle 보드, route persistence,
   role scope 격리·count parity, PII 차단, 접수(스냅샷·신호·감사), fallback 표시,
   고위험 자동 종결 금지, 하네스/승인, 자체 검증 루프, 반응형. */

const { expect, test } = require("@playwright/test");
const fs = require("node:fs");

const screenshotDirs = ["test-results/screenshots", "tests/results/screenshots"];

async function saveShot(page, name) {
  for (const dir of screenshotDirs) {
    fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: `${dir}/${name}`, fullPage: true });
  }
}

const JPO_DB_KEY = "jpo-ops-db-v2";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem("jb-finance-support-state-v4"));
  await page.addInitScript(() => window.localStorage.removeItem("jbwc-ops-db-v3"));
  await page.addInitScript(() => window.localStorage.removeItem("jpo-ops-db-v1"));
  await page.addInitScript(() => window.localStorage.removeItem("jpo-ops-db-v2"));
});

test("역할 진입: 전용 사이드바/메뉴이며 generic·무관 샘플이 보이지 않는다", async ({ page }) => {
  await page.goto("/index.html");
  await page.locator('[data-rail-toggle="role"]').click();
  await page.locator('[data-role-filter="전세보호 담당자"]').click();

  await expect(page.locator("#page-content").getByRole("heading", { name: "전세사기 보호 업무지원 포털" })).toBeVisible();
  await expect(page.locator(".sidebar-brand")).toContainText("전세사기 보호 업무지원 포털");
  await expect(page.locator(".sidebar-brand")).toContainText("시세·권리·보증·피해지원 검토를 돕는 AI 업무지원");
  await expect(page.locator("#new-case-button")).toContainText("전세 위험/피해 의심 건 접수");
  await expect(page.locator("#sidebar-search")).toHaveAttribute("placeholder", /사건번호, 익명 고객 ID, 주소 일부/);
  expect(page.url()).toContain("/roles/jeonse-protection");

  for (const label of ["위험 접수 보드", "전세 위험 케이스", "시세 데이터 보강", "권리관계 확인", "보증·HUG 확인", "피해지원 신청 검토", "긴급 경·공매 대응", "전세가율/시세 점검", "유사 전월세 거래", "피해자 결정 신청 안내", "법률지원 연계", "데이터 연결 상태"]) {
    await expect(page.locator("#nav-list")).toContainText(label);
  }
  for (const forbidden of ["전체 관리 건 조회", "업무 기능", "전세 안심 점검", "전체 전세보호 건 조회"]) {
    await expect(page.locator("#nav-list")).not.toContainText(forbidden);
  }
  for (const forbidden of ["도소매", "제조업", "카페", "기업여신"]) {
    await expect(page.locator("#page-content")).not.toContainText(forbidden);
    await expect(page.locator("#nav-list")).not.toContainText(forbidden);
  }

  await page.locator("[data-jpo-back]").click();
  await expect(page.locator(".sidebar-brand")).toContainText("JB 금융안전 업무지원 포털");
});

test("위험 접수 보드가 lifecycle 컬럼과 카드 필수 정보를 표시한다", async ({ page }) => {
  await page.goto("/index.html#/roles/jeonse-protection/board");
  for (const column of ["신규 접수", "데이터 보강 중", "위험 신호 검토", "담당자 검토 필요", "외부기관 연계", "지원 안내 완료", "보류/추가자료 요청"]) {
    await expect(page.locator(".jpo-board")).toContainText(column);
  }
  const card = page.locator('[data-board-column="humanReview"] .jpo-card', { hasText: "JEONSE-0004" });
  await expect(card).toContainText("CUST-JS-0004");
  await expect(card).toContainText("다가구");
  await expect(card).toContainText("인천 미추홀구 주안동 ***");
  await expect(card).toContainText("보증금 1.2억");
  await expect(card).toContainText("경·공매 일정 임박");
  await expect(card.locator('[data-source-mode="fallback"]')).toBeVisible();
  await expect(page.locator('[data-board-column="received"]')).toContainText("JEONSE-0006");
  await expect(page.locator('[data-board-column="externalLinked"]')).toContainText("JEONSE-0005");
  await saveShot(page, "jpo2-board-desktop.png");
});

test("route가 새로고침 후에도 유지된다 (v2 메뉴)", async ({ page }) => {
  const routes = [
    ["/roles/jeonse-protection/board", "위험 접수 보드"],
    ["/roles/jeonse-protection/price-risk", "전세가율/시세 위험 신호"],
    ["/roles/jeonse-protection/guarantee-check", "보증·HUG 확인"],
    ["/roles/jeonse-protection/urgent-auction", "긴급 경·공매 대응"],
    ["/roles/jeonse-protection/victim-application", "피해지원 신청 검토"],
    ["/roles/jeonse-protection/data-connectors", "데이터 연결 상태"],
  ];
  for (const [route, marker] of routes) {
    await page.goto(`/index.html#${route}`);
    await expect(page.locator("#page-content")).toContainText(marker);
    await page.reload();
    await expect(page.locator("#page-content")).toContainText(marker);
    await expect(page.locator(".jbwc-breadcrumb")).toContainText("전세사기 보호 업무지원 포털");
    expect(page.url()).toContain(route);
  }
  await page.goto("/index.html#/roles/jeonse-protection/cases/JEONSE-0002");
  await expect(page.locator(".jbwc-detail-panel")).toContainText("JEONSE-0002");
  await page.reload();
  await expect(page.locator(".jbwc-detail-panel")).toContainText("JEONSE-0002");
});

test("모든 count는 role scope query에서 오고 타 역할 seed는 노출되지 않는다", async ({ page }) => {
  await page.goto("/index.html#/roles/jeonse-protection/cases");
  await page.waitForFunction(() => typeof getJeonseProtectionSidebarCounts === "function");
  const scope = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    const other = db.jeonse_cases.filter((c) => c.roleKey !== "jeonse-protection");
    let scopeError = null;
    try { jpoTable("jeonse_cases"); } catch (error) { scopeError = error.message; }
    const counts = getJeonseProtectionSidebarCounts();
    const mine = (table) => (db[table] || []).filter((row) => row.roleKey === "jeonse-protection");
    return {
      otherIds: other.map((c) => c.id),
      scopedIds: jpoTable("jeonse_cases", JPO_ROLE_KEY).map((c) => c.id),
      scopeError,
      counts,
      expected: {
        urgentAuction: mine("jeonse_cases").filter((c) => c.auctionNoticed && ["received", "enriching", "riskReview", "humanReview", "externalLinked", "onHold"].includes(c.status)).length,
        registryCheck: mine("jeonse_registry_checks").filter((x) => x.manualRequired || x.status === "unknown").length,
        guaranteeCheck: mine("jeonse_guarantee_checks").filter((x) => x.manualRequired || x.status === "unknown").length,
        victimApplication: mine("jeonse_support_referrals").filter((x) => x.referralType === "victimApplication" && ["open", "pending"].includes(x.status)).length,
        legalReferral: mine("jeonse_support_referrals").filter((x) => x.referralType === "legal" && ["open", "pending"].includes(x.status)).length,
        auditLogs: mine("jeonse_audit_logs").filter((x) => x.reviewRequired === true).length,
        dataConnectors: mine("external_connectors").filter((x) => ["degraded", "down", "manualRequired"].includes(x.health) || ["error", "manualRequired"].includes(x.status)).length,
      },
    };
  }, JPO_DB_KEY);
  expect(scope.otherIds.length).toBeGreaterThan(0);
  for (const id of scope.otherIds) expect(scope.scopedIds).not.toContain(id);
  expect(scope.scopeError).toContain("role scope is required");
  for (const [key, value] of Object.entries(scope.expected)) {
    expect(scope.counts[key], `count key: ${key}`).toBe(value);
  }
  await expect(page.locator("#page-content")).not.toContainText("JEONSE-OTHER-0001");

  await page.locator("#sidebar-search").fill("화곡동");
  await expect(page.locator("#jpo-search-results .jbwc-search-hit").first()).toContainText("JEONSE-0001");
  await page.locator("#jpo-search-results .jbwc-search-hit").first().click();
  await expect(page.locator(".jbwc-detail-panel")).toContainText("JEONSE-0001");
  await expect(page).toHaveURL(/\/roles\/jeonse-protection\/cases\/JEONSE-0001/);
});

test("PII 원문 검색은 차단되고 저장소에 PII 패턴이 없다", async ({ page }) => {
  await page.goto("/index.html#/roles/jeonse-protection/board");
  await page.locator("#sidebar-search").fill("901231-1234567");
  await expect(page.locator("#jpo-search-results")).toContainText("개인정보 원문 검색 차단");
  const piiScan = await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key) || "";
    return {
      jumin: /\d{6}-[1-4]\d{6}/.test(raw),
      phone: /01[016789]-\d{3,4}-\d{4}/.test(raw),
      maskedOnly: raw.includes("***") && raw.includes("CUST-JS-"),
    };
  }, JPO_DB_KEY);
  expect(piiScan.jumin).toBe(false);
  expect(piiScan.phone).toBe(false);
  expect(piiScan.maskedOnly).toBe(true);
});

test("경·공매 접수: 스냅샷·위험 신호·체크·감사·승인 기록과 high 이상 human review", async ({ page }) => {
  await page.goto("/index.html#/roles/jeonse-protection/cases/new");
  await expect(page.locator("#jpo-new-case-form")).toBeVisible();
  await page.locator("#jpo-case-intakeType").selectOption("auctionNotice");
  await page.locator('select[name="housingType"]').selectOption("multiHousehold");
  await page.locator('select[name="lawdCode"]').selectOption("28177");
  await page.locator('input[name="depositAmount"]').fill("120000000");
  await page.locator('input[name="auctionNoticed"]').check();
  const deadline = await page.evaluate(() => { const d = new Date(); d.setDate(d.getDate() + 9); return d.toISOString().slice(0, 10); });
  await page.locator('input[name="auctionDeadline"]').fill(deadline);
  await page.locator("[data-jpo-preview-refresh]").click();
  await expect(page.locator("#jpo-new-case-form")).toContainText("경·공매 일정 임박");
  await expect(page.locator("#jpo-new-case-form")).toContainText("담당자 검토 필요 · requiresHumanReview");
  await page.locator('#jpo-new-case-form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/roles\/jeonse-protection\/cases\/JEONSE-\d+/);
  const newCaseId = decodeURIComponent(page.url().split("/").pop());
  await expect(page.locator(".jbwc-detail-panel")).toContainText(newCaseId);

  const created = await page.evaluate(([key, id]) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    const item = db.jeonse_cases.find((c) => c.id === id);
    return {
      status: item.status,
      riskLevel: item.riskLevel,
      requiresHumanReview: item.requiresHumanReview,
      snapshots: db.jeonse_price_snapshots.filter((x) => x.caseId === item.id).length,
      signals: db.jeonse_risk_signals.filter((x) => x.caseId === item.id).map((x) => x.signalType),
      registry: db.jeonse_registry_checks.filter((x) => x.caseId === item.id).length,
      auditCreated: db.jeonse_audit_logs.some((x) => x.action === "CASE_CREATED" && x.targetId === item.id),
      analysis: db.ai_analysis_requests.filter((x) => x.caseId === item.id).length,
      approvals: db.approvals.filter((x) => x.caseId === item.id && x.status === "pending").length,
      runStatuses: db.jeonse_agent_runs.filter((x) => x.caseId === item.id).map((x) => x.status),
    };
  }, [JPO_DB_KEY, newCaseId]);
  expect(created.status).toBe("humanReview");
  expect(["high", "critical"]).toContain(created.riskLevel);
  expect(created.requiresHumanReview).toBe(true);
  expect(created.snapshots).toBe(1);
  expect(created.signals).toContain("AUCTION_OR_FORECLOSURE_DEADLINE");
  expect(created.registry).toBeGreaterThanOrEqual(1);
  expect(created.auditCreated).toBe(true);
  expect(created.analysis).toBe(1);
  expect(created.approvals).toBeGreaterThanOrEqual(1);
  for (const status of created.runStatuses) expect(["completed", "closed"]).not.toContain(status);

  await page.goto("/index.html#/roles/jeonse-protection/urgent-auction");
  await expect(page.locator("#page-content")).toContainText(newCaseId);
});

test("API 키 없는 기본 모드: 스냅샷/fallback 표시가 화면에 노출된다", async ({ page }) => {
  await page.goto("/index.html#/roles/jeonse-protection/price-enrich");
  await expect(page.locator(".jbwc-breadcrumb")).toContainText("샘플/스냅샷 기준");
  await expect(page.locator("#page-content")).toContainText("실거래 API 미연결");
  await expect(page.locator('#page-content [data-source-mode="snapshot"]').first()).toBeVisible();
  await expect(page.locator('#page-content [data-source-mode="fallback"]').first()).toBeVisible();

  await page.locator("[data-jpo-enrich-latest]").click();
  await expect(page.locator("[data-enrich-status]")).toContainText("보강 완료", { timeout: 8_000 });
  const enriched = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    return { latestSnapshot: db.jeonse_price_snapshots[0], audit: db.jeonse_audit_logs.find((a) => ["DATA_FETCHED", "DATA_FETCH_FAILED"].includes(a.action)) };
  }, JPO_DB_KEY);
  expect(["snapshot", "fallback"]).toContain(enriched.latestSnapshot.sourceMode);
  expect(enriched.audit).toBeTruthy();
});

test("하네스 샘플: 경공매 에스컬레이션·상담요약 승인 대기·고위험 자동 종결 금지", async ({ page }) => {
  await page.goto("/index.html#/roles/jeonse-protection/agent-harness");
  await expect(page.locator("#page-content")).toContainText("전세사기 보호 업무지원 하네스 — 전용 라우팅");

  await page.getByRole("button", { name: /경매 기일 통지가 왔어/ }).click();
  await expect(page.locator("#page-content")).toContainText("사람 검토 대기");
  await page.getByRole("button", { name: /상담 내용을 요약하고/ }).click();
  await expect(page.locator("#page-content")).toContainText("발송 승인 대기");

  const state = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    return {
      auctionRun: db.jeonse_agent_runs.find((r) => r.agentId === "jpo-auction" && r.requiresHumanEscalation),
      supervisorHandoff: db.agent_handoffs.find((h) => h.toAgentId === "jpo-supervisor" && h.status === "escalated"),
      commsRun: db.jeonse_agent_runs.find((r) => r.agentId === "jpo-comms"),
      noticeApproval: db.approvals.find((a) => a.approvalType === "고객 안내문 발송 승인" && a.status === "pending"),
      highOrCritical: db.jeonse_agent_runs.filter((r) => ["high", "critical"].includes(r.riskLevel)).map((r) => r.status),
    };
  }, JPO_DB_KEY);
  expect(state.auctionRun).toBeTruthy();
  expect(state.supervisorHandoff).toBeTruthy();
  expect(state.commsRun.status).toBe("pendingApproval");
  expect(state.noticeApproval).toBeTruthy();
  for (const status of state.highOrCritical) expect(["completed", "closed"]).not.toContain(status);

  const selfTest = await page.evaluate(() => runHarnessSelfTest());
  expect(selfTest.pass, JSON.stringify(selfTest.results.filter((r) => !r.ok), null, 2)).toBe(true);
});

test("빈 상태/미존재 상세/사이드바 3-모드 전환", async ({ page }) => {
  await page.goto("/index.html#/roles/jeonse-protection/cases");
  const filterInput = page.locator("[data-jpo-list-filter]").first();
  await filterInput.fill("존재하지않는필터검색어");
  await filterInput.press("Enter");
  await expect(page.locator(".jbwc-empty")).toContainText("필터 조건에 맞는 데이터가 없습니다.");
  await page.goto("/index.html#/roles/jeonse-protection/cases/JEONSE-9999");
  await expect(page.locator(".jbwc-detail-panel")).toContainText("상세 데이터를 찾을 수 없습니다");

  await page.goto("/index.html");
  await page.locator('[data-rail-toggle="affiliate"]').click();
  await page.locator('[data-affiliate="JB우리캐피탈"]').click();
  await expect(page.locator(".sidebar-brand")).toContainText("JB우리캐피탈 운영지원 포털");
  await page.locator('[data-rail-toggle="role"]').click();
  await page.locator('[data-role-filter="전세보호 담당자"]').click();
  await expect(page.locator(".sidebar-brand")).toContainText("전세사기 보호 업무지원 포털");
  await page.locator("[data-jpo-back]").click();
  await expect(page.locator(".sidebar-brand")).toContainText("JB 금융안전 업무지원 포털");
});

test("데스크톱/태블릿/모바일 스모크 (overflow 금지)", async ({ page }) => {
  const viewports = [
    ["desktop", { width: 1920, height: 1080 }],
    ["tablet", { width: 820, height: 1180 }],
    ["mobile", { width: 390, height: 844 }],
  ];
  const routes = [
    ["board", "/roles/jeonse-protection/board"],
    ["cases", "/roles/jeonse-protection/cases"],
    ["wizard", "/roles/jeonse-protection/cases/new"],
    ["connectors", "/roles/jeonse-protection/data-connectors"],
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
      await saveShot(page, `jpo2-${routeName}-${vpName}.png`);
    }
  }
});
