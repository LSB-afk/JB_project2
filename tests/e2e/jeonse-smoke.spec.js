/* 전세사기 보호 업무지원 포털(v2) — Smoke Test. 단독 실행: npm run test:smoke
   16단계 사용자 플로우 + runHarnessSelfTest + 보안 훅 차단 네거티브. */

const { expect, test } = require("@playwright/test");

const JPO_DB_KEY = "jpo-ops-db-v2";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem("jb-finance-support-state-v4"));
  await page.addInitScript(() => window.localStorage.removeItem("jbwc-ops-db-v3"));
  await page.addInitScript(() => window.localStorage.removeItem("jpo-ops-db-v2"));
  await page.addInitScript(() => window.localStorage.removeItem("ccl-ops-db-v1"));
  await page.addInitScript(() => window.localStorage.removeItem("fdr-ops-db-v1"));
});

test("스모크: 진입→보드→검색→접수(고위험)→기록→승인 대기→새로고침 완주", async ({ page }) => {
  // 1~2. 접속 + 역할 클릭
  await page.goto("/index.html");
  await page.locator('[data-rail-toggle="role"]').click();
  await page.locator('[data-role-filter="전세보호 담당자"]').click();
  // 3. 전용 sidebar title
  await expect(page.locator(".sidebar-brand")).toContainText("전세사기 보호 업무지원 포털");
  // 4. 보드 count — scope query 기준
  await page.waitForFunction(() => {
    const counts = typeof getJeonseProtectionSidebarCounts === "function" && getJeonseProtectionSidebarCounts();
    return counts && counts.board >= 5 && counts.urgentAuction >= 1;
  });
  await expect(page.locator(".jpo-board")).toContainText("담당자 검토 필요");
  // 5~6. 익명 ref 검색 → 클릭
  await page.locator("#sidebar-search").fill("CUST-JS-0005");
  await page.locator("#jpo-search-results .jbwc-search-hit").first().click();
  await expect(page.locator(".jbwc-detail-panel")).toContainText("전세위험-0005");
  // 7~10. 위저드 → high risk(보증금 반환 지연) → triage preview → 저장
  await page.locator("#new-case-button").click();
  await expect(page.locator("#jpo-new-case-form")).toBeVisible();
  await page.locator("#jpo-case-intakeType").selectOption("depositDelay");
  await page.locator('select[name="lawdCode"]').selectOption("30170");
  await page.locator('input[name="depositAmount"]').fill("150000000");
  await page.locator("[data-jpo-preview-refresh]").click();
  await expect(page.locator("#jpo-new-case-form")).toContainText("임대인/보증사고 이력 확인 필요");
  await expect(page.locator("#jpo-new-case-form .jbwc-preview-grid")).toContainText("예");
  await page.locator('#jpo-new-case-form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/roles\/jeonse-protection\/cases\/JEONSE-\d+/);
  const newCaseId = decodeURIComponent(page.url().split("/").pop());
  await expect(page.locator(".jbwc-detail-panel")).toContainText(newCaseId.replace("JEONSE-", "전세위험-"));
  // 11~12. case/snapshot/signal/audit/analysis/approval + 자동 종결 금지
  const created = await page.evaluate(([key, id]) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    const item = db.jeonse_cases.find((c) => c.id === id);
    return {
      status: item.status,
      requiresHumanReview: item.requiresHumanReview,
      snapshot: db.jeonse_price_snapshots.some((x) => x.caseId === item.id),
      signal: db.jeonse_risk_signals.some((x) => x.caseId === item.id && x.signalType === "LANDLORD_RISK_MANUAL_REQUIRED"),
      audit: db.jeonse_audit_logs.some((x) => x.action === "CASE_CREATED" && x.targetId === item.id),
      analysis: db.ai_analysis_requests.some((x) => x.caseId === item.id),
      approval: db.approvals.some((x) => x.caseId === item.id && x.status === "pending"),
      runStatuses: db.jeonse_agent_runs.filter((x) => x.caseId === item.id).map((x) => x.status),
    };
  }, [JPO_DB_KEY, newCaseId]);
  expect(created.status).toBe("humanReview");
  expect(created.requiresHumanReview).toBe(true);
  expect(created.snapshot && created.signal && created.audit && created.analysis && created.approval).toBe(true);
  for (const status of created.runStatuses) expect(["completed", "closed"]).not.toContain(status);
  // 13~15. 상담 요약 → 안내문 approval pending + run/handoff 기록
  await page.goto("/index.html#/roles/jeonse-protection/agent-harness");
  await page.getByRole("button", { name: /상담 내용을 요약하고/ }).click();
  await expect(page.locator("#page-content")).toContainText("발송 승인 대기");
  const harness = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    return {
      commsRun: db.jeonse_agent_runs.find((r) => r.agentId === "jpo-comms"),
      handoff: db.agent_handoffs.find((h) => h.fromAgentId === "jpo-comms"),
      approval: db.approvals.find((a) => a.approvalType === "고객 안내문 발송 승인" && a.status === "pending"),
    };
  }, JPO_DB_KEY);
  expect(harness.commsRun.status).toBe("pendingApproval");
  expect(harness.handoff).toBeTruthy();
  expect(harness.approval).toBeTruthy();
  // 16. 새로고침 route 유지
  await page.reload();
  await expect(page.locator(".sidebar-brand")).toContainText("전세사기 보호 업무지원 포털");
  await expect(page.locator("#page-content")).toContainText("전세사기 보호 업무지원 하네스 — 전용 라우팅");
});

test("자체 검증 루프 + 보안 훅 차단(PII 접수/자동 종결/사람 승인)", async ({ page }) => {
  await page.goto("/index.html#/roles/jeonse-protection/agent-harness");
  await page.getByRole("button", { name: "/jeonse-run-smoke-test · 하네스 자체 검증 실행" }).click();
  await expect(page.locator("#page-content")).toContainText("하네스 자체 검증");
  const selfTest = await page.evaluate(() => runHarnessSelfTest());
  expect(selfTest.pass, JSON.stringify(selfTest.results.filter((r) => !r.ok), null, 2)).toBe(true);
  expect(selfTest.results.length).toBe(24); // 4개 하네스 × 6 검증

  // 네거티브 1: PII 포함 접수 차단
  await page.goto("/index.html#/roles/jeonse-protection/cases/new");
  await page.locator('input[name="buildingName"]').fill("연락처 010-9876-5432 기재");
  await page.locator('input[name="depositAmount"]').fill("100000000");
  await page.locator('#jpo-new-case-form button[type="submit"]').click();
  await expect(page.getByRole("status")).toContainText("접수 차단(보안 훅)");
  const blocked = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    return {
      leaked: db.jeonse_cases.some((c) => String(c.buildingName).includes("010-9876")),
      audit: db.jeonse_audit_logs.find((a) => a.action === "JPO_HOOK_BLOCKED_CASE_CREATE"),
    };
  }, JPO_DB_KEY);
  expect(blocked.leaked).toBe(false);
  expect(blocked.audit).toBeTruthy();

  // 네거티브 2: high 위험 run 자동 완료 시도 → needsReview 강등
  const demoted = await page.evaluate((key) => {
    const row = recordJeonseProtectionAgentRun({
      agentId: "jpo-price",
      inputSummary: "자동 종결 시도 검증",
      outputSummary: "완료 처리 시도",
      status: "completed",
      riskLevel: "high",
    });
    const db = JSON.parse(window.localStorage.getItem(key));
    return { status: row.status, audit: db.jeonse_audit_logs.find((a) => a.action === "JPO_HOOK_VIOLATION_AGENT_RUN" && a.targetId === row.id) };
  }, JPO_DB_KEY);
  expect(demoted.status).toBe("needsReview");
  expect(demoted.audit).toBeTruthy();

  // 사람 승인 (afterApprovalDecision)
  await page.goto("/index.html#/roles/jeonse-protection/data-connectors");
  const pendingBefore = await page.evaluate(() => getJeonseProtectionSidebarCounts().approvals);
  await page.evaluate(() => {
    const pending = jpoTable("approvals", JPO_ROLE_KEY).find((a) => a.status === "pending");
    return jpoDecideApproval(pending.id, "approve");
  });
  const pendingAfter = await page.evaluate(() => getJeonseProtectionSidebarCounts().approvals);
  expect(pendingAfter).toBe(pendingBefore - 1);
});
