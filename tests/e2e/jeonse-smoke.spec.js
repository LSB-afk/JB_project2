/* 전세사기 보호 담당자 하네스 — Smoke Test (ECC식 자체 검증 루프).
   단독 실행: npm run test:smoke
   16단계 사용자 플로우 + runHarnessSelfTest + 보안 훅 차단 네거티브를 한 파일에서 검증한다. */

const { expect, test } = require("@playwright/test");

const JPO_DB_KEY = "jpo-ops-db-v1";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem("jb-finance-support-state-v4"));
  await page.addInitScript(() => window.localStorage.removeItem("jbwc-ops-db-v3"));
  await page.addInitScript(() => window.localStorage.removeItem("jpo-ops-db-v1"));
});

test("스모크: 진입→검색→접수→기록→승인 대기→새로고침까지 16단계 완주", async ({ page }) => {
  // 1. 앱 접속
  await page.goto("/index.html");
  // 2. 역할 레일에서 전세보호 담당자 클릭
  await page.locator('[data-rail-toggle="role"]').click();
  await page.locator('[data-role-filter="전세보호 담당자"]').click();
  // 3. 전용 sidebar title 확인
  await expect(page.locator(".sidebar-brand")).toContainText("전세사기 보호 업무지원 하네스");
  // 4. 업무 보드 count 확인 (하드코딩이 아니라 scope query 결과)
  await page.waitForFunction(() => {
    const counts = typeof getJeonseProtectionSidebarCounts === "function" && getJeonseProtectionSidebarCounts();
    return counts && counts.cases >= 15 && counts.urgentAlerts >= 2;
  });
  // 5~6. 익명 ref 검색 → 결과 클릭
  await page.locator("#sidebar-search").fill("TENANT-REF-0009");
  await page.locator("#jpo-search-results .jbwc-search-hit").first().click();
  await expect(page.locator(".jbwc-detail-panel")).toContainText("JEONSE-CASE-0009");
  // 7~10. 신규 접수 위저드 → high risk 케이스 → AI triage preview 확인 → 저장
  await page.locator("#new-case-button").click();
  await expect(page.locator("#jpo-new-case-form")).toBeVisible();
  await page.locator("#jpo-case-taskType").selectOption("auctionSupport");
  await page.locator('#jpo-new-case-form input[name="title"]').fill("스모크 high risk 경공매 대응");
  await page.locator('#jpo-new-case-form select[name="riskLevel"]').selectOption("high");
  await page.locator('#jpo-new-case-form input[name="riskSignals"][value="auctionRisk"]').check();
  await expect(page.locator("#jpo-new-case-form")).toContainText("에스컬레이션 필요 · escalationRequired");
  await expect(page.locator("#jpo-new-case-form .jbwc-preview-grid")).toContainText("예");
  await page.locator('#jpo-new-case-form button[type="submit"]').click();
  await expect(page.locator(".jbwc-detail-panel")).toContainText("스모크 high risk 경공매 대응");
  // 11~12. case/task/audit/ai_analysis/approval 생성 + high risk 자동 종결 안 됨
  const created = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    const item = db.jeonse_cases.find((c) => c.title === "스모크 high risk 경공매 대응");
    return {
      status: item.status,
      tasks: db.jeonse_tasks.filter((t) => t.caseId === item.id).length,
      audits: db.audit_logs.filter((a) => a.targetId === item.id).length,
      analysis: db.ai_analysis_requests.filter((a) => a.caseId === item.id).length,
      approvals: db.approvals.filter((a) => a.caseId === item.id && a.status === "pending").length,
      runStatuses: db.agent_runs.filter((r) => r.caseId === item.id).map((r) => r.status),
    };
  }, JPO_DB_KEY);
  expect(created.tasks).toBeGreaterThan(0);
  expect(created.audits).toBeGreaterThan(0);
  expect(created.analysis).toBe(1);
  expect(created.approvals).toBeGreaterThan(0);
  expect(created.status).toBe("escalated");
  for (const status of created.runStatuses) expect(["completed", "closed"]).not.toContain(status);
  // 13. 고객 안내문 approval pending
  await page.goto("/index.html#/roles/jeonse-protection/agent-harness");
  await page.getByRole("button", { name: /안내 문자 초안을 만들어줘/ }).click();
  await expect(page.locator("#page-content")).toContainText("발송 승인 대기");
  // 14~15. agent run / handoff 기록
  const harness = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    return {
      commsRun: db.agent_runs.find((r) => r.agentId === "jpo-comms"),
      commsHandoff: db.agent_handoffs.find((h) => h.fromAgentId === "jpo-comms"),
      noticeApproval: db.approvals.find((a) => a.approvalType === "고객 안내문 발송 승인" && a.status === "pending"),
    };
  }, JPO_DB_KEY);
  expect(harness.commsRun.status).toBe("pendingApproval");
  expect(harness.commsHandoff).toBeTruthy();
  expect(harness.noticeApproval).toBeTruthy();
  // 16. 새로고침 후 route 유지
  await page.reload();
  await expect(page.locator(".sidebar-brand")).toContainText("전세사기 보호 업무지원 하네스");
  await expect(page.locator("#page-content")).toContainText("전세사기 보호 업무지원 하네스 — 전용 라우팅");
});

test("하네스 자체 검증 루프와 보안 훅 차단이 동작한다", async ({ page }) => {
  await page.goto("/index.html#/roles/jeonse-protection/agent-harness");
  await expect(page.locator("#page-content")).toContainText("운영 명령 (Commands)");

  // /jeonse-run-smoke-test 명령 → 두 하네스 manifest 자체 검증 통과
  await page.getByRole("button", { name: "/jeonse-run-smoke-test · 하네스 자체 검증 실행" }).click();
  await expect(page.locator("#page-content")).toContainText("하네스 자체 검증");
  const selfTest = await page.evaluate(() => runHarnessSelfTest());
  expect(selfTest.pass, JSON.stringify(selfTest.results.filter((r) => !r.ok), null, 2)).toBe(true);
  expect(selfTest.results.length).toBe(12); // 2개 하네스 × 6개 검증기

  // 네거티브 1: PII가 포함된 접수는 beforeCaseCreate 훅이 차단하고 감사에 남긴다
  await page.goto("/index.html#/roles/jeonse-protection/cases/new");
  await page.locator('#jpo-new-case-form input[name="title"]').fill("임차인 연락처 010-9876-5432 확인 요청");
  await page.locator('#jpo-new-case-form button[type="submit"]').click();
  await expect(page.getByRole("status")).toContainText("접수 차단(보안 훅)");
  const blocked = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    return {
      leaked: db.jeonse_cases.some((c) => String(c.title).includes("010-9876")),
      audit: db.audit_logs.find((a) => a.action === "JPO_HOOK_BLOCKED_CASE_CREATE"),
    };
  }, JPO_DB_KEY);
  expect(blocked.leaked).toBe(false);
  expect(blocked.audit).toBeTruthy();

  // 네거티브 2: high 위험 run을 completed로 기록하려는 시도는 needsReview로 강등된다
  const demoted = await page.evaluate((key) => {
    const row = recordJeonseProtectionAgentRun({
      agentId: "jpo-price",
      inputSummary: "자동 종결 시도 검증",
      outputSummary: "완료 처리 시도",
      status: "completed",
      riskLevel: "high",
    });
    const db = JSON.parse(window.localStorage.getItem(key));
    return {
      status: row.status,
      violationAudit: db.audit_logs.find((a) => a.action === "JPO_HOOK_VIOLATION_AGENT_RUN" && a.targetId === row.id),
    };
  }, JPO_DB_KEY);
  expect(demoted.status).toBe("needsReview");
  expect(demoted.violationAudit).toBeTruthy();

  // 승인함에서 사람 승인 → afterApprovalDecision 훅 경유
  await page.goto("/index.html#/roles/jeonse-protection/approvals");
  const pendingBefore = await page.evaluate(() => getJeonseProtectionSidebarCounts().approvals);
  await page.locator("[data-jpo-approve]").first().click();
  await expect(page.getByRole("status")).toContainText("승인 완료 (사람 결정)");
  const pendingAfter = await page.evaluate(() => getJeonseProtectionSidebarCounts().approvals);
  expect(pendingAfter).toBe(pendingBefore - 1);
});
