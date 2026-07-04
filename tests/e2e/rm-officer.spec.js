/* RM 업무지원 포털 — 전용 e2e. scope 격리 / 보안 훅 차단(PII 접수·자동 종결) /
   승인 결정 / 통합 MD 뷰어 탭 / 민감정보 검색 차단. 페르소나 이름은 단언하지 않는다. */

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
  await expect(page.locator('input[type="file"][name="supportingFile"]')).toBeVisible();

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

test("전라도 실감 페르소나 3건을 구체 케이스로 seed한다", async ({ page }) => {
  await page.goto("/index.html#/roles/rm-officer/cases/RMO-CASE-0001");
  await expect(page.locator(".rmo-sub-head")).toContainText("문서희 45세");
  await expect(page.locator(".rmo-sub-head")).toContainText("사료·산소공급 장비 지출");
  await expect(page.locator(".rmo-goal-line")).toContainText("수산 정책자금");

  await page.goto("/index.html#/roles/rm-officer/cases/RMO-CASE-0002");
  await expect(page.locator(".rmo-sub-head")).toContainText("강하준 34세");
  await expect(page.locator(".rmo-sub-head")).toContainText("자동이체 실패 예고");
  await expect(page.locator(".rmo-goal-line")).toContainText("복귀 전환기 현금흐름");

  await page.goto("/index.html#/roles/rm-officer/cases/RMO-CASE-0003");
  await expect(page.locator(".rmo-sub-head")).toContainText("임세빈 22세");
  await expect(page.locator(".rmo-sub-head")).toContainText("국가장학금");
  await expect(page.locator(".rmo-goal-line")).toContainText("고금리 대체대출");
});

/* ---- 케이스 에이전트 승인 큐(Agent Queue) 고도화 시나리오 ----
   RMO-CASE-0007=오**(기업여신·기술신용, 반려 데모) / 0008=윤**(보이스피싱, 승인대기 데모) /
   0009=송**(농수산 사후관리) / 0004=JBG-208(진행중, 실행중 데모) / 0001=JBG-204(재해위험). */
test("승인 큐 렌더 + 상태 색상 6종 + SUB 섹션 존재", async ({ page }) => {
  await page.goto("/index.html#/roles/rm-officer/cases/RMO-CASE-0007");

  // SUB 시각적 구분(요구3) — 좌측 레일 라벨 + 배경 밴드
  await expect(page.locator(".rmo-sub-band")).toContainText("SUB");
  await expect(page.locator(".rmo-sub-region")).toBeVisible();

  // 케이스 요약 — 고객/도메인/계열사/처리 목표
  await expect(page.locator(".rmo-sub-head")).toContainText("오**");
  await expect(page.locator(".rmo-sub-head")).toContainText("JB우리캐피탈");
  await expect(page.locator(".rmo-goal-line")).toContainText("처리 목표");

  // 승인 큐 — 브랜치 5 + 리포트 1 = 6 카드, 계층도 데이터 계약을 큐 카드로 표현
  await expect(page.locator("#page-content")).toContainText("에이전트 승인 큐");
  await expect(page.locator("#page-content")).toContainText("에이전트 업무 계층도 데이터를 승인 큐 카드로 표시합니다.");
  await expect(page.locator(".rmo-node-card")).toHaveCount(6);

  // 노드 11필드 라벨 노출 — agentId/role/reason/expectedOutput 등
  await expect(page.locator(".rmo-workmap")).toContainText("역할");
  await expect(page.locator(".rmo-workmap")).toContainText("이 에이전트를 사용하는 이유");
  await expect(page.locator(".rmo-workmap")).toContainText("예상 산출물");

  // 상태 색상 — 이 케이스에서 회색(리포트 실행전)/파랑(실행가능)/빨강(반려) 동시 노출
  await expect(page.locator(".rmo-node-blue").first()).toBeVisible();
  await expect(page.locator(".rmo-node-red")).toContainText("반려");
  await expect(page.locator(".rmo-node-gray")).toBeVisible();

  // 노랑(실행 중) — JBG-208 진행중 데모
  await page.goto("/index.html#/roles/rm-officer/cases/RMO-CASE-0004");
  await expect(page.locator(".rmo-node-yellow")).toBeVisible();
  await expect(page.locator(".rmo-node-yellow")).toContainText("조금만 기다려주세요");

  // 보라(사람 승인 필요) — 윤** 케이스, 분석 4건 전원 완료 + 리포트 승인 대기
  await page.goto("/index.html#/roles/rm-officer/cases/RMO-CASE-0008");
  await expect(page.locator(".rmo-node-green").first()).toBeVisible();
  await expect(page.locator(".rmo-node-purple")).toContainText("사람 승인 필요");
  await expect(page.locator(".rmo-approval-gate")).toContainText("A를 눌러 직원 최종 승인");
  await expect(page.locator(".rmo-report-step-divider")).toContainText("통합 리포트 검토");
  await page.locator(".rmo-node-purple").click();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-rmo-md-viewer]")).toBeInViewport();
  await expect(page.locator(".rmo-md-tabs")).toContainText("통합본");
});

test("←→ 케이스 이동 · ↑↓/Space/D/Enter 노드 플로우 · 패널 리사이즈 · Esc 복귀", async ({ page }) => {
  await page.goto("/index.html#/roles/rm-officer/board");
  const widthBefore = await page.evaluate(() => Number(getComputedStyle(document.documentElement).getPropertyValue("--properties-width").replace("px", "")));
  const resizeBox = await page.locator("#properties-resizer").boundingBox();
  expect(resizeBox).not.toBeNull();
  await page.mouse.move(resizeBox.x + resizeBox.width / 2, resizeBox.y + 120);
  await page.mouse.down();
  await page.mouse.move(resizeBox.x - 120, resizeBox.y + 120);
  await page.mouse.up();
  const widthAfter = await page.evaluate(() => Number(getComputedStyle(document.documentElement).getPropertyValue("--properties-width").replace("px", "")));
  expect(widthAfter).toBeGreaterThan(widthBefore);

  await page.locator(".rmo-count-header").click(); // 포커스만 이동시키기 위한 클릭(입력 요소 아님)
  await page.keyboard.press("1");
  await expect(page.locator(".rmo-sub-head")).toBeVisible();
  const firstCaseId = await page.evaluate(() => rmoState.detail.id);

  // ←→ 케이스 이동(마우스 클릭으로 케이스를 고른 뒤 방향키 이동), 기존 숫자키 선택과 공존
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(150);
  const secondCaseId = await page.evaluate(() => rmoState.detail.id);
  expect(secondCaseId).not.toBe(firstCaseId);
  await expect(page.locator(`[data-rmo-open-case="${secondCaseId}"]`)).toBeInViewport();
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(150);
  const backToFirst = await page.evaluate(() => rmoState.detail.id);
  expect(backToFirst).toBe(firstCaseId);
  await expect(page.locator(`[data-rmo-open-case="${firstCaseId}"]`)).toBeInViewport();

  // 여러 칸 이동해도 페이지가 갑자기 하단으로 튀지 않고, 보드 rail 안에서 카드 슬라이드만 발생해야 함
  const railBefore = await page.locator(".rmo-case-rail").evaluate((el) => el.scrollLeft);
  const pageYBeforeSlide = await page.evaluate(() => window.scrollY);
  for (let i = 0; i < 5; i += 1) await page.keyboard.press("ArrowRight");
  await page.waitForFunction((before) => {
    const rail = document.querySelector(".rmo-case-rail");
    return rail && rail.scrollLeft > before + 20;
  }, railBefore);
  const slideMotion = await page.evaluate(() => ({
    railLeft: document.querySelector(".rmo-case-rail").scrollLeft,
    pageY: window.scrollY,
  }));
  expect(slideMotion.railLeft).toBeGreaterThan(railBefore);
  expect(Math.abs(slideMotion.pageY - pageYBeforeSlide)).toBeLessThan(120);

  await page.keyboard.press("1");
  await page.waitForTimeout(150);
  await expect(page.locator(`[data-rmo-open-case="${firstCaseId}"]`)).toBeInViewport();

  // ↑↓ 노드 이동 — 현재 선택 상태가 항상 시각적으로 명확해야 함(rmo-node-focused)
  const focusBefore = await page.evaluate(() => rmoState.workMapFocusIndex);
  await page.keyboard.press("ArrowDown");
  const focusAfter = await page.evaluate(() => rmoState.workMapFocusIndex);
  expect(focusAfter).toBe(focusBefore + 1);
  await expect(page.locator(".rmo-node-focused")).toHaveCount(1);

  // Space — 다음 스텝 이동, D — 노드 상세 펼치기(세부 보기: 사용 데이터/도구/산출물 경로)
  await page.keyboard.press(" ");
  const focusAfterSpace = await page.evaluate(() => rmoState.workMapFocusIndex);
  expect(focusAfterSpace).toBe(focusAfter + 1);
  await expect(page.locator(".rmo-key-overlay")).toContainText("다음 스텝");
  await page.keyboard.press("D");
  await expect(page.locator(".rmo-node-detail")).toBeVisible();
  await expect(page.locator(".rmo-node-detail")).toContainText("사용 데이터");
  await expect(page.locator(".rmo-node-detail")).toContainText("도구/스킬");
  await page.keyboard.press("ArrowUp");
  await expect(page.locator(".rmo-node-focused")).toContainText("실행 가능");

  // Enter — 포커스된 노드 실행 승인, 딤드 로딩 후 개별 md 생성
  const beforeDeliverables = await page.evaluate((id) => {
    const db = JSON.parse(window.localStorage.getItem("rmo-ops-db-v2"));
    return db.rm_officer_deliverables.filter((d) => d.caseId === id).length;
  }, firstCaseId);
  await page.keyboard.press("Enter");
  await expect(page.locator(".rmo-run-overlay")).toContainText("조금만 기다려주세요");
  await page.waitForFunction(
    ({ id, before }) => {
      const db = JSON.parse(window.localStorage.getItem("rmo-ops-db-v2"));
      return db.rm_officer_deliverables.filter((d) => d.caseId === id).length > before;
    },
    { id: firstCaseId, before: beforeDeliverables },
    { timeout: 3000 },
  );
  await expect(page.locator(".rmo-node-focused")).toBeInViewport();
  const afterDeliverables = await page.evaluate((id) => {
    const db = JSON.parse(window.localStorage.getItem("rmo-ops-db-v2"));
    return db.rm_officer_deliverables.filter((d) => d.caseId === id).length;
  }, firstCaseId);
  expect(afterDeliverables).toBeGreaterThan(beforeDeliverables);

  // Esc — 케이스 보드로 복귀
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150);
  await expect(page).toHaveURL(/\/roles\/rm-officer\/board/);
  const detailAfterEsc = await page.evaluate(() => rmoState.detail);
  expect(detailAfterEsc).toBeNull();
});

test("R 재실행 + A 케이스 최종 승인 · md 본문 실내용(근거 표·판단·다음 조치)", async ({ page }) => {
  await page.goto("/index.html#/roles/rm-officer/cases/RMO-CASE-0008");

  // A(케이스 통합보고서 승인) — 클릭으로도 동일 동작(마우스/키보드 모두 지원)
  await expect(page.locator("[data-rmo-approve-case]")).toBeEnabled();
  await page.locator("[data-rmo-approve-case]").click();
  const caseAfterApprove = await page.evaluate(() => {
    const db = JSON.parse(window.localStorage.getItem("rmo-ops-db-v2"));
    return db.rm_officer_cases.find((c) => c.id === "RMO-CASE-0008");
  });
  expect(caseAfterApprove.status).toBe("completed");
  await expect(page.locator("[data-rmo-approve-case]")).toBeDisabled();

  // R(재실행) — 완료 노드를 다시 실행해 새 산출물을 만든다
  const rerunBtn = page.locator("[data-rmo-rerun]").first();
  const rerunAssignmentId = await rerunBtn.getAttribute("data-rmo-rerun");
  const beforeCount = await page.evaluate((id) => {
    const db = JSON.parse(window.localStorage.getItem("rmo-ops-db-v2"));
    const asg = db.rm_officer_agent_assignments.find((a) => a.id === id);
    return db.rm_officer_deliverables.filter((d) => d.caseId === asg.caseId && d.agentId === asg.agentId).length;
  }, rerunAssignmentId);
  await rerunBtn.click();
  await page.waitForTimeout(150);
  const afterCount = await page.evaluate((id) => {
    const db = JSON.parse(window.localStorage.getItem("rmo-ops-db-v2"));
    const asg = db.rm_officer_agent_assignments.find((a) => a.id === id);
    return db.rm_officer_deliverables.filter((d) => d.caseId === asg.caseId && d.agentId === asg.agentId).length;
  }, rerunAssignmentId);
  expect(afterCount).toBe(beforeCount); // 이전 산출물을 정리하고 1건으로 재생성(중복 탭 방지)
  expect(afterCount).toBeGreaterThan(0);

  // md 본문 실내용 — Summary/상황 분석/근거 표(4~6행)/판단 및 권고/다음 조치 태스크/한계 및 주의
  await page.goto("/index.html#/roles/rm-officer/deliverables");
  await page.locator("[data-rmo-open-md]").first().click();
  await expect(page.locator(".rmo-modal")).toBeVisible();
  await expect(page.locator(".rmo-modal")).toContainText("Summary");
  await expect(page.locator(".rmo-modal")).toContainText("상황 분석");
  await expect(page.locator(".rmo-modal")).toContainText("판단 및 권고");
  await expect(page.locator(".rmo-modal")).toContainText("다음 조치 태스크");
  await expect(page.locator(".rmo-modal")).toContainText("한계 및 주의");
  const evidenceRowCount = await page.locator(".rmo-modal .rmo-md-table tbody tr").count();
  expect(evidenceRowCount).toBeGreaterThanOrEqual(3);
});

/* ---- UI 고도화(전체 화면) 시나리오 — 업무 기능 저장소 신규 화면 · 산출물 목록 필드 분리 ·
   케이스 카드 소제목 구조 · 대비 교정 CSS 클래스 존재를 확인한다. ---- */
test("업무 기능 저장소 렌더 + 카테고리 필터 + 산출물 목록 필드 + 카드 소제목 구조 + 대비 교정", async ({ page }) => {
  // 업무 기능 저장소 — hero + 설명 + 카테고리 필터 + 카드 그리드 + 하단 테이블
  await page.goto("/index.html#/roles/rm-officer/capabilities");
  await expect(page.locator("#page-content")).toContainText("업무 기능 저장소");
  await expect(page.locator("#page-content")).toContainText("AI 업무지원에서 직접 활용되는 금융, 리스크, 계약, 준법 업무 기능을 확인합니다.");
  await expect(page.locator(".rmo-cap-filter-row [data-rmo-cap-filter]")).toHaveCount(11); // 전체 + 10개 카테고리
  const totalCards = await page.locator(".rmo-cap-card").count();
  expect(totalCards).toBeGreaterThanOrEqual(10);

  // 카드 필드 — 기능명/한 줄 설명/연결 에이전트/사용 데이터/생성 산출물/상태
  const firstCard = page.locator(".rmo-cap-card").first();
  await expect(firstCard.locator(".rmo-cap-name")).toBeVisible();
  await expect(firstCard.locator(".rmo-cap-summary")).toBeVisible();
  await expect(firstCard).toContainText("연결 에이전트");
  await expect(firstCard).toContainText("사용하는 데이터");
  await expect(firstCard).toContainText("생성 산출물");
  await expect(firstCard.locator(".rmo-cap-status")).toBeVisible();

  // 카테고리 필터 — 클릭 시 카드 수가 실제로 좁혀진다
  await page.locator('[data-rmo-cap-filter="감사 기록"]').click();
  const filteredCards = await page.locator(".rmo-cap-card").count();
  expect(filteredCards).toBeLessThan(totalCards);
  await expect(page.locator(".rmo-cap-card").first()).toContainText("감사 로그 기록");

  // mock 상태는 정직하게 mock으로 표기(창작 금지 원칙 확인)
  await page.locator('[data-rmo-cap-filter="all"]').click();
  await expect(page.locator(".rmo-cap-status-mock").first()).toBeVisible();
  await expect(page.locator(".rmo-cap-card .rmo-tone-chip").first()).toBeVisible();
  await expect(page.locator(".rmo-cap-risk").first()).toContainText("담당자");

  // 오른쪽 컨텍스트 패널 — 화면별 현재 항목 요약을 보여야 한다
  await page.goto("/index.html#/roles/rm-officer/consult-queue");
  await expect(page.locator(".properties-header")).toContainText("여신 상담 큐 요약");
  await expect(page.locator("#context-panel")).toContainText("상담 목적");

  // 에이전트/스킬 저장소 — 도메인/상태/위험도/검토 필요 배지가 시각적으로 구분되어야 한다
  await page.goto("/index.html#/roles/rm-officer/agent-harness");
  await expect(page.locator(".rmo-inventory-card").first()).toBeVisible();
  await expect(page.locator(".rmo-inventory-card .rmo-tone-chip").first()).toBeVisible();
  await expect(page.locator("#context-panel")).toContainText("에이전트 하네스 요약");

  // 산출물 목록 — 파일명/산출물 유형/관련 케이스/생성 에이전트/핵심 요약/직원 액션 필드 분리
  await page.goto("/index.html#/roles/rm-officer/deliverables");
  await expect(page.locator(".jbwc-row-head")).toContainText("파일명");
  await expect(page.locator(".jbwc-row-head")).toContainText("산출물 유형");
  await expect(page.locator(".jbwc-row-head")).toContainText("관련 케이스");
  await expect(page.locator(".jbwc-row-head")).toContainText("생성 에이전트");
  await expect(page.locator(".jbwc-row-head")).toContainText("핵심 요약");
  await expect(page.locator(".jbwc-row-head")).toContainText("직원 액션");
  await expect(page.locator(".rmo-deliverable-summary").first()).toBeVisible();

  // 케이스 카드 소제목 구조 — 상황/위험 신호/필요 에이전트/근거 데이터/다음 액션이 각각 별도 블록
  await page.goto("/index.html#/roles/rm-officer/board");
  const card = page.locator(".rmo-case-card").first();
  const subheads = await card.locator(".rmo-case-subhead").allTextContents();
  expect(subheads).toEqual(["상황", "위험 신호", "필요 에이전트", "근거 데이터", "다음 액션"]);
  await expect(card.locator(".rmo-case-next-action")).toBeVisible();

  // 대비 교정 — 키보드 안내 pill이 흰 반투명이 아니라 짙은 텍스트+불투명 배경을 갖는지 실측
  const hintColor = await page.locator(".rmo-keyboard-hint").evaluate((el) => {
    const cs = getComputedStyle(el);
    return { color: cs.color, background: cs.backgroundColor };
  });
  // rgba 흰색(반투명 포함)이 아니라 짙은 네이비 텍스트여야 한다
  expect(hintColor.color).not.toMatch(/rgba?\(255,\s*255,\s*255/);
  expect(hintColor.background).not.toMatch(/rgba?\(255,\s*255,\s*255,\s*0(\.\d+)?\)/);
});
