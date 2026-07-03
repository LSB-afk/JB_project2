/* ============================================================
   기업여신 담당자 역할 하네스 — route/view/sidebar/action 연결부.
   business config/registry/service는 corporateCredit* 전용 파일에서만 가져온다.
   ============================================================ */

const ccrViewRenderers = Object.assign(
  {
    board: ccrDashboardView,
    "cases-new": ccrCaseCreationView,
    "agent-harness": ccrHarnessView,
  },
  ccrCaseViewRenderers,
);

function corporateCreditHarnessPage() {
  let body = "";
  try {
    const renderer = ccrViewRenderers[ccrState.view] || ccrViewRenderers.board;
    body = renderer();
  } catch (error) {
    body = `<div class="jbwc-error">기업여신 데이터를 불러오지 못했습니다. <button class="secondary-button" type="button" data-ccr-reset-db>데모 데이터 초기화</button></div>`;
  }
  return `<div class="jbwc-shell ccr-shell">${ccrHeaderBar()}${ccrDetailPanel()}${body}</div>`;
}

function corporateCreditHarnessContextMarkup() {
  const counts = ccrState.counts || getCorporateCreditSidebarCounts();
  return `<div class="case-properties">
    <div class="property-row"><span>전용 하네스</span><strong>${escapeHtml(corporateCreditOfficerHarness.id)}</strong></div>
    <div class="property-row"><span>데이터 범위(roleKey)</span><strong>${escapeHtml(CCR_ROLE_KEY)}</strong></div>
    <div class="property-row"><span>기업여신 건</span><strong>${escapeHtml(counts.cases)}</strong></div>
    <div class="property-row"><span>승인권자 검토</span><strong>${escapeHtml(counts.approvalQueue)}</strong></div>
    <div class="property-row"><span>조기경보/EWS</span><strong>${escapeHtml(counts.earlyWarning)}</strong></div>
    <div class="property-row"><span>사람 검토</span><strong>승인·금리·한도·신용평가 필수</strong></div>
    <p class="jbwc-guard">실제 대출 승인/거절, 금리/한도 산정, 신용평가, 금융거래 실행, 민감정보 원문 저장/출력은 금지됩니다.</p>
  </div>`;
}

function ccrActivateFromHash() {
  const route = ccrRouteFromHash(window.location.hash);
  if (!route) return false;
  let changed = false;
  if (!ccrModeActive()) {
    activeView = "corporate-credit-harness";
    activeDetailType = defaultDetailForView(activeView);
    changed = true;
  }
  if (route.view && CCR_VIEWS[route.view] && ccrState.view !== route.view) {
    ccrState.view = route.view;
    changed = true;
  }
  if (route.caseId) {
    const nextDetail = { kind: "case", id: route.caseId };
    if (JSON.stringify(ccrState.detail) !== JSON.stringify(nextDetail)) {
      ccrState.detail = nextDetail;
      changed = true;
    }
  }
  return changed;
}

function bindCorporateCreditActions() {
  if (ccrActivateFromHash()) {
    render();
    return;
  }
  if (ccrModeActive()) {
    document.querySelectorAll("[data-role-filter]").forEach((entry) => {
      entry.classList.toggle("is-active", entry.dataset.roleFilter === "기업여신 담당자");
    });
    ccrTakeoverSidebar();
    ccrEnsureCounts();
    if (!ccrState.roleEntered) {
      ccrState.roleEntered = true;
      if (typeof harnessRunHooks === "function") harnessRunHooks("corporate-credit", "onRoleEnter", {});
    }
  } else {
    ccrState.roleEntered = false;
    document.querySelectorAll('[data-role-filter="기업여신 담당자"]').forEach((entry) => entry.classList.remove("is-active"));
    ccrRestoreSidebar();
  }

  document.querySelectorAll("[data-ccr-view]").forEach((button) => {
    button.addEventListener("click", () => ccrGo(button.dataset.ccrView));
  });
  document.querySelectorAll("[data-ccr-open-case]").forEach((row) => {
    row.addEventListener("click", () => ccrGo("cases", { kind: "case", id: row.dataset.ccrOpenCase }));
  });
  document.querySelectorAll("[data-ccr-open-detail]").forEach((row) => {
    row.addEventListener("click", () => {
      const [kind, id] = String(row.dataset.ccrOpenDetail || "").split(":");
      ccrState.detail = { kind, id };
      render();
    });
  });
  document.querySelectorAll("[data-ccr-clear-detail]").forEach((button) => {
    button.addEventListener("click", () => { ccrState.detail = null; render(); });
  });
  document.querySelectorAll("[data-ccr-reset-db]").forEach((button) => {
    button.addEventListener("click", () => {
      ccrResetDb();
      ccrInvalidateCounts();
      if (typeof notify === "function") notify("기업여신 데모 데이터를 다시 채웠습니다.");
      render();
    });
  });
  document.querySelectorAll("[data-ccr-refresh]").forEach((button) => {
    button.addEventListener("click", () => { ccrInvalidateCounts(); render(); });
  });
  document.querySelectorAll("[data-ccr-list-filter]").forEach((input) => {
    input.addEventListener("change", () => {
      const state = ccrListState(input.dataset.ccrListFilter);
      state.q = input.value;
      state.page = 1;
      render();
    });
  });
  document.querySelectorAll("[data-ccr-list-page]").forEach((button) => {
    button.addEventListener("click", () => {
      const state = ccrListState(button.dataset.ccrListPage);
      state.page += Number(button.dataset.pageDelta || 0);
      render();
    });
  });
  const back = document.querySelector("[data-ccr-back]");
  if (back) {
    back.addEventListener("click", () => {
      activeView = "dashboard";
      activeDetailType = defaultDetailForView("dashboard");
      ccrState.view = "board";
      ccrState.detail = null;
      if (window.location.hash !== "#dashboard") window.location.hash = "#dashboard";
      if (typeof notify === "function") notify("전체 화면으로 복귀했습니다.");
      render();
    });
  }
  ccrBindCaseWizardForm();
  ccrBindHarnessSamples();
}

(function () {
  const prevBind = typeof bindModuleActions === "function" ? bindModuleActions : null;
  window.bindModuleActions = function () {
    if (prevBind) prevBind();
    bindCorporateCreditActions();
  };
})();
