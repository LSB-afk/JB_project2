/* RM 콘솔 자연어 접수 팔레트 — Smoke. 단독 실행:
   npx playwright test tests/e2e/rmo-nl-intake-smoke.spec.js
   n으로 모달 열기 → 원문 입력 → Ctrl+Enter(오프라인 폴백) → 케이스 생성 +
   추가 필요 데이터 체크리스트 + localStorage 반영 + Esc 닫기. PAGEERROR 0. */

const { expect, test } = require("@playwright/test");

const RMO_DB_KEY = "rmo-ops-db-v2";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("rmo-ops-db-v1");
    window.localStorage.removeItem("rmo-ops-db-v2");
    window.localStorage.removeItem("jb-agent-model-settings-v1"); // 모델 미기동 → 결정적 폴백 경로
  });
});

test("자연어 접수: n으로 열기→오프라인 폴백 접수→케이스 생성·체크리스트·Esc", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/index.html");
  await page.locator('[data-rail-toggle="role"]').click();
  await page.locator('[data-role-filter="RM"]').click();
  await expect(page).toHaveURL(/\/roles\/rm-officer\/board/);
  await page.locator(".rmo-count-header").click(); // 입력 미포커스 상태로 만든다

  const countCases = () => page.evaluate((key) => {
    const db = JSON.parse(window.localStorage.getItem(key) || "{}");
    return (db.rm_officer_cases || []).length;
  }, RMO_DB_KEY);
  const before = await countCases();

  // n → 모달
  await page.keyboard.press("n");
  await expect(page.locator("#rmo-nli-overlay")).toBeVisible();
  await expect(page.locator("#rmo-nli-overlay")).toContainText("자연어 접수");

  // 원문 입력 → Ctrl+Enter(오프라인 폴백)
  await page.locator("#rmo-nli-input").fill("전주 완산구 김OO 사장님이 대환대출 문의, 매출 자료는 아직 없음");
  await page.keyboard.press("Control+Enter");

  // 생성된 케이스 ID + 추가 필요 데이터 체크리스트
  await expect(page.locator("#rmo-nli-result")).toContainText("생성된 케이스", { timeout: 8000 });
  await expect(page.locator("#rmo-nli-result")).toContainText("추가 필요 데이터");
  await expect(page.locator('#rmo-nli-result input[type="checkbox"]')).toHaveCount(1);

  // localStorage에 새 케이스 1건
  expect(await countCases()).toBe(before + 1);

  // Esc 닫기
  await page.keyboard.press("Escape");
  await expect(page.locator("#rmo-nli-overlay")).toHaveCount(0);

  expect(errors).toEqual([]);
});
