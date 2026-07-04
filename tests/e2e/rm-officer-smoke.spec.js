/* RM 업무지원 포털 — Smoke Test. 단독 실행: npx playwright test tests/e2e/rm-officer-smoke.spec.js
   진입→업무보드(급한 순)→진행률 로딩→키보드 선택→에이전트 승인(개별 md)→
   신규 접수→새로고침 route 유지 + runHarnessSelfTest. 페르소나 이름은 단언하지 않는다(안정 라벨만). */

const { expect, test } = require("@playwright/test");

const RMO_DB_KEY = "rmo-ops-db-v2";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem("jb-finance-support-state-v4"));
  await page.addInitScript(() => window.localStorage.removeItem("jpo-ops-db-v2"));
  await page.addInitScript(() => window.localStorage.removeItem("ccr-ops-db-v1"));
  await page.addInitScript(() => {
    window.localStorage.removeItem("rmo-ops-db-v1");
    window.localStorage.removeItem("rmo-ops-db-v2");
  });
  await page.addInitScript(() => window.localStorage.removeItem("jb-agent-model-settings-v1"));
});

test("스모크: 진입→보드→키보드 선택→승인(개별 MD)→신규 접수→새로고침 완주", async ({ page }) => {
  // 1~2. 접속 + 역할 클릭
  await page.goto("/index.html");
  await page.locator('[data-rail-toggle="role"]').click();
  await page.locator('[data-role-filter="RM"]').click();

  // 3. 전용 sidebar title + 라우트
  await expect(page).toHaveURL(/\/roles\/rm-officer\/board/);
  await expect(page.locator(".sidebar-brand")).toContainText("RM 업무지원 포털");
  await expect(page.locator("#page-content")).toContainText("RM담당자님 업무 급한 순으로 모아왔어요");
  await expect(page.locator("#page-content")).toContainText("양식장 재해위험 대응");
  await expect(page.locator(".rmo-count-header")).toContainText("처리해야할 작업 전");
  await expect(page.locator("#page-content")).not.toContainText("전세 안심 점검");

  // 4. 보드 count — scope query 기준 (하드코딩 아님)
  await page.waitForFunction(() => {
    const counts = typeof getRmOfficerSidebarCounts === "function" && getRmOfficerSidebarCounts();
    return counts && counts.board >= 5 && counts.todo >= 3 && counts.done >= 1;
  });

  // 5. 진행률 로딩 — 진행중 케이스 실행 오버레이는 문구 + 진행률 + 스피너를 함께 표시
  await page.goto("/index.html#/roles/rm-officer/cases/RMO-CASE-0004");
  await expect(page.locator(".rmo-run-overlay")).toContainText("조금만 기다려주세요");

  // 6. 검색(익명 케이스 번호) → 이동
  await page.goto("/index.html#/roles/rm-officer/board");
  await page.locator("#sidebar-search").fill("JBG-204");
  await page.locator("#rmo-search-results .jbwc-search-hit").first().click();
  await expect(page).toHaveURL(/\/roles\/rm-officer\/cases\/RMO-CASE-0001/);
  await expect(page.locator(".rmo-sub-head")).toContainText("양식장 재해위험 대응");

  // 7. 키보드 퍼스트 — 숫자키로 케이스 선택
  await page.goto("/index.html#/roles/rm-officer/board");
  await page.locator(".rmo-count-header").click();
  await page.keyboard.press("1");
  await expect(page.locator(".rmo-sub-head")).toBeVisible();
  await expect(page.locator("#page-content")).toContainText("에이전트 승인 큐");
  await expect(page.locator("#page-content")).toContainText("Enter를 눌러 승인해주세요");

  // 8. 승인 큐 승인 → 개별 md 생성 (high위험 자동완료 금지)
  for (let i = 0; i < 3; i += 1) {
    const btn = page.locator("[data-rmo-approve]").first();
    if (await btn.count()) await btn.click();
  }
  await expect(page.locator(".rmo-md-tabs")).toContainText(".md");
  await expect(page.locator("#page-content")).toContainText("통합 리포트 뷰어");

  const approved = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    const c = db.rm_officer_cases.find((x) => x.caseNo === "JBG-204");
    return {
      agentDocs: db.rm_officer_deliverables.filter((d) => d.caseId === c.id && d.kind === "agent").length,
      status: c.status,
      runs: db.rm_officer_agent_runs.filter((r) => r.caseId === c.id).length,
    };
  }, RMO_DB_KEY);
  expect(approved.agentDocs).toBeGreaterThanOrEqual(1);
  expect(approved.runs).toBeGreaterThanOrEqual(1);
  expect(["completed", "closed"]).not.toContain(approved.status);

  // 9. md 본문 또는 링크 모달 확인
  await expect(page.locator(".rmo-md-body")).toContainText("Summary");
  const mdLink = page.locator(".rmo-md-body .rmo-md-link").first();
  if (await mdLink.count()) {
    await mdLink.click();
    await expect(page.locator(".rmo-modal")).toBeVisible();
    await expect(page.locator(".rmo-modal")).toContainText("Summary");
    await page.locator(".rmo-modal [data-rmo-close-modal]").first().click();
  }

  // 10. 자체 검증 루프 — RM 하네스만 6개 검증 통과
  const selfTest = await page.evaluate(() => runHarnessSelfTest("rm-officer"));
  expect(selfTest.pass, JSON.stringify(selfTest.results.filter((r) => !r.ok), null, 2)).toBe(true);
  expect(selfTest.results.length).toBe(6);

  // 11. 신규 여신 상담 건 접수(고위험) → 에이전트 배정 + 감사 기록
  await page.locator("#new-case-button").click();
  await expect(page.locator("#rmo-new-case-form")).toBeVisible();
  await page.locator('select[name="caseType"]').selectOption("disasterRisk");
  await page.locator('input[name="theme"]').fill("스모크 신규 재해 상담");
  await page.locator('select[name="riskLevel"]').selectOption("high");
  await expect(page.locator("#rmo-new-case-form")).toContainText("재해위험 노출");
  await page.locator('#rmo-new-case-form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/roles\/rm-officer\/cases\/RMO-CASE-\d+/);

  const created = await page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key));
    const item = db.rm_officer_cases[0];
    return {
      roleKey: item.roleKey,
      assignments: db.rm_officer_agent_assignments.filter((a) => a.caseId === item.id).length,
      audit: db.rm_officer_audit_logs.some((a) => a.action === "CASE_CREATED" && a.targetId === item.id),
      triageRun: db.rm_officer_agent_runs.some((r) => r.caseId === item.id && r.agentId === "rmo-triage"),
    };
  }, RMO_DB_KEY);
  expect(created.roleKey).toBe("rm-officer");
  expect(created.assignments).toBeGreaterThanOrEqual(3);
  expect(created.audit && created.triageRun).toBe(true);

  // 12. 새로고침 route/브랜드/하네스 유지
  await page.goto("/index.html#/roles/rm-officer/agent-harness");
  await page.reload();
  await expect(page).toHaveURL(/\/roles\/rm-officer\/agent-harness/);
  await expect(page.locator(".sidebar-brand")).toContainText("RM 업무지원 포털");
  await expect(page.locator("#page-content")).toContainText("RM 업무지원 하네스 — loop routing");
});
