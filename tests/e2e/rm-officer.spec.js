/* RM 업무지원 포털 — 전용 e2e. scope 격리 / 보안 훅 차단(PII 접수·자동 종결) /
   승인 결정 / 통합 MD 뷰어 탭 / 민감정보 검색 차단. 페르소나 이름은 단언하지 않는다. */

const { expect, test } = require("@playwright/test");

const RMO_DB_KEY = "rmo-ops-db-v1";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem("jb-finance-support-state-v4"));
  await page.addInitScript(() => window.localStorage.removeItem("jpo-ops-db-v2"));
  await page.addInitScript(() => window.localStorage.removeItem("ccr-ops-db-v1"));
  await page.addInitScript(() => window.localStorage.removeItem("rmo-ops-db-v1"));
});

test("scope 격리 + 통합 MD 뷰어 탭 + 민감정보 검색 차단", async ({ page }) => {
  await page.goto("/index.html#/roles/rm-officer/board");
  await expect(page.locator(".sidebar-brand")).toContainText("RM 업무지원 포털");

  // scope 강제: 미지정 조회 예외 + 타 역할 seed 격리
  const scope = await page.evaluate(() => {
    let threw = false;
    try { rmoTable("rm_officer_cases"); } catch (error) { threw = String(error.message).includes("role scope is required"); }
    const rows = rmoTable("rm_officer_cases", "rm-officer");
    return { threw, leakedOtherRole: rows.some((r) => r.roleKey !== "rm-officer"), count: rows.length };
  });
  expect(scope.threw).toBe(true);
  expect(scope.leakedOtherRole).toBe(false);
  expect(scope.count).toBeGreaterThanOrEqual(6);

  // 통합 MD 뷰어 — 완료 데모 케이스(JBG-198 → RMO-CASE-0005)는 통합본 + 개별 탭 노출
  await page.goto("/index.html#/roles/rm-officer/cases/RMO-CASE-0005");
  await expect(page.locator(".rmo-md-tabs")).toContainText("통합본");
  await expect(page.locator(".rmo-md-body")).toContainText("사용 에이전트/스킬");
  // 개별 에이전트 md 탭으로 전환
  const agentTab = page.locator(".rmo-md-tabs .jbwc-tab").nth(1);
  await agentTab.click();
  await expect(page.locator(".rmo-md-body")).toContainText("Summary");

  // 통합 리포트 메뉴 → 문서 모달(화면 C)
  await page.goto("/index.html#/roles/rm-officer/deliverables");
  await page.locator("[data-rmo-open-md]").first().click();
  await expect(page.locator(".rmo-modal")).toBeVisible();
  await expect(page.locator(".rmo-modal .rmo-md-meta")).toBeVisible();

  // 민감정보 원문 검색 차단
  await page.goto("/index.html#/roles/rm-officer/board");
  await page.locator("#sidebar-search").fill("010-9876-5432");
  await expect(page.locator("#rmo-search-results")).toContainText("민감정보 원문 검색 차단");
});

test("보안 훅 차단(PII 접수/자동 종결) + 승인 결정", async ({ page }) => {
  await page.goto("/index.html#/roles/rm-officer/cases/new");

  // 네거티브 1: PII 포함 접수 차단
  await page.locator('input[name="theme"]').fill("연락처 010-9876-5432 포함");
  await page.locator('textarea[name="situation"]').fill("전화번호 010-9876-5432 기재");
  await page.locator('#rmo-new-case-form button[type="submit"]').click();
  await expect(page.getByRole("status")).toContainText("접수 차단(보안 훅)");
  const blocked = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    return {
      leaked: db.rm_officer_cases.some((c) => String(c.situation || "").includes("010-9876")),
      audit: db.rm_officer_audit_logs.some((a) => a.action === "RMO_HOOK_BLOCKED_CASE_CREATE"),
    };
  }, RMO_DB_KEY);
  expect(blocked.leaked).toBe(false);
  expect(blocked.audit).toBe(true);

  // 네거티브 2: high 위험 run 자동 완료 시도 → needsReview 강등 + 위반 감사
  const demoted = await page.evaluate((key) => {
    const row = recordRmOfficerAgentRun({
      agentId: "rmo-credit-care",
      inputSummary: "자동 종결 시도 검증",
      outputSummary: "완료 처리 시도",
      status: "completed",
      riskLevel: "high",
    });
    const db = JSON.parse(window.localStorage.getItem(key));
    return { status: row.status, audit: db.rm_officer_audit_logs.some((a) => a.action === "RMO_HOOK_VIOLATION_AGENT_RUN" && a.targetId === row.id) };
  }, RMO_DB_KEY);
  expect(demoted.status).toBe("needsReview");
  expect(demoted.audit).toBe(true);

  // 승인 결정 — pending 감소 (afterApprovalDecision, decidedBy 필수)
  await page.goto("/index.html#/roles/rm-officer/approvals");
  const pendingBefore = await page.evaluate(() => getRmOfficerSidebarCounts().approvals);
  await page.evaluate(() => {
    const pending = rmoTable("rm_officer_approvals", "rm-officer").find((a) => a.status === "pending");
    return rmoDecideApproval(pending.id, "approve", "USR-RMO-APR-01");
  });
  const pendingAfter = await page.evaluate(() => getRmOfficerSidebarCounts().approvals);
  expect(pendingAfter).toBe(pendingBefore - 1);
});
