const { expect, test } = require("@playwright/test");

const CCR_DB_KEY = "ccr-ops-db-v1";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem("jb-finance-support-state-v4"));
  await page.addInitScript(() => window.localStorage.removeItem("jpo-ops-db-v2"));
  await page.addInitScript(() => window.localStorage.removeItem("ccr-ops-db-v1"));
});

test("기업여신 하네스: 진입, 검색, 신규 접수, agent run, 새로고침 route 유지", async ({ page }) => {
  await page.goto("/index.html");
  await page.locator('[data-rail-toggle="role"]').click();
  await page.locator('[data-role-filter="기업여신 담당자"]').click();

  await expect(page).toHaveURL(/\/roles\/corporate-credit\/board/);
  await expect(page.locator(".sidebar-brand")).toContainText("기업여신 업무지원 포털");
  await expect(page.locator("#page-content")).toContainText("기업여신 업무지원 포털");
  await expect(page.locator("#page-content")).toContainText("여신 업무 보드");
  await expect(page.locator("#page-content")).not.toContainText("전세 안심 점검");

  await page.waitForFunction(() => {
    const counts = typeof getCorporateCreditSidebarCounts === "function" && getCorporateCreditSidebarCounts();
    return counts && counts.board >= 20 && counts.approvalQueue >= 3;
  });

  await page.locator("#sidebar-search").fill("익명 제조업");
  await page.locator("#ccr-search-results .jbwc-search-hit").first().click();
  await expect(page.locator(".jbwc-detail-panel")).toContainText("익명 제조업");

  await page.locator("#new-case-button").click();
  await expect(page.locator("#ccr-new-case-form")).toBeVisible();
  await page.locator('select[name="domain"]').selectOption("pfStructuredFinance");
  await page.locator('input[name="title"]').fill("PF 구조화 운영 검토");
  await page.locator('input[name="companyAlias"]').fill("익명 건설업 신규");
  await page.locator('select[name="riskLevel"]').selectOption("critical");
  await expect(page.locator("#ccr-new-case-form")).toContainText("PF·구조화 금융 승인권자 검토 필요");
  await page.locator('#ccr-new-case-form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/roles\/corporate-credit\/cases\/CCR-CASE-\d+/);

  const created = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    const item = db.corporate_credit_cases[0];
    return {
      caseNo: item.caseNo,
      status: item.status,
      riskLevel: item.riskLevel,
      roleKey: item.roleKey,
      audit: db.corporate_credit_audit_logs.some((x) => x.action === "CASE_CREATED" && x.targetId === item.id),
      run: db.corporate_credit_agent_runs.some((x) => x.caseId === item.id),
      handoff: db.corporate_credit_agent_handoffs.some((x) => x.caseId === item.id && x.status === "escalated"),
    };
  }, CCR_DB_KEY);
  expect(created.roleKey).toBe("corporate-credit");
  expect(created.status).toBe("escalated");
  expect(created.riskLevel).toBe("critical");
  expect(created.audit && created.run && created.handoff).toBe(true);

  await page.goto("/index.html#/roles/corporate-credit/agent-harness");
  await page.getByRole("button", { name: "RM 검토용 여신메모 초안을 만들고 준법 검증을 거쳐줘" }).click();
  await expect(page.locator("#page-content")).toContainText("approval pending");
  const runCount = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)).corporate_credit_agent_runs.length, CCR_DB_KEY);
  expect(runCount).toBeGreaterThan(8);

  await page.reload();
  await expect(page).toHaveURL(/\/roles\/corporate-credit\/agent-harness/);
  await expect(page.locator(".sidebar-brand")).toContainText("기업여신 업무지원 포털");
  await expect(page.locator("#page-content")).toContainText("기업여신 업무지원 하네스");
});
