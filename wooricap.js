/* ============================================================
   JB우리캐피탈 운영지원 포털 — 라우팅/화면 연결부
   - view 렌더러: wooricap.view.board.js / wooricap.view.cases.js /
     wooricap.view.wizard.js / wooricap.view.harness.js
   - 공용 헬퍼: wooricap.helpers.js · 사이드바: wooricap.sidebar.js
   - business config/registry/service는 별도 전용 파일에서만 가져온다.
   - 실제 거래·심사·PII 없음. localStorage mock DB는 affiliateId 스코프 강제.
   ============================================================ */

const jbwcViewRenderers = Object.assign(
  {
    board: jbwcDashboardView,
    "cases-new": jbwcCaseCreationView,
    "agent-harness": jbwcHarnessView,
  },
  jbwcCaseViewRenderers,
);

function jbwcOpsPage() {
  let body = "";
  try {
    const renderer = jbwcViewRenderers[jbwcState.view] || jbwcViewRenderers.board;
    body = renderer();
  } catch (error) {
    body = `<div class="jbwc-error">데이터를 불러오지 못했습니다. <button class="secondary-button" type="button" data-jbwc-reset-db>데모 데이터 초기화</button></div>`;
  }
  return `<div class="jbwc-shell">${jbwcHeaderBar()}${jbwcDetailPanel()}${body}</div>`;
}

function jbwcContextMarkup() {
  const counts = jbwcState.counts || getJbWooriCapitalSidebarCounts();
  return `<div class="case-properties">
    <div class="property-row"><span>전용 하네스</span><strong>${escapeHtml(jbWooriCapitalOpsHarness.id)}</strong></div>
    <div class="property-row"><span>데이터 범위(affiliateId)</span><strong>${escapeHtml(JBWC_AFFILIATE_ID)}</strong></div>
    <div class="property-row"><span>운영 건</span><strong>${escapeHtml(counts.cases)}</strong></div>
    <div class="property-row"><span>FDS/보이스피싱</span><strong>${escapeHtml(counts.fds)}</strong></div>
    <div class="property-row"><span>사람 검토</span><strong>고위험·소비자보호 필수</strong></div>
    <p class="jbwc-guard">실제 대출 승인/거절, 금리/한도 산정, 신용평가, 개인정보 원문 저장/출력, 금융거래 실행은 금지됩니다.</p>
  </div>`;
}

function jbwcGo(view, detail) {
  jbwcState.view = view;
  jbwcState.detail = detail || null;
  const next = detail && detail.kind === "case" ? jbwcHashForView("cases", detail.id) : jbwcHashForView(view);
  if (window.location.hash !== next) window.location.hash = next;
  else if (typeof render === "function") render();
}

function jbwcActivateFromHash() {
  const route = jbwcRouteFromHash(window.location.hash);
  if (!route) return false;
  let changed = false;
  const previousView = jbwcState.view;
  if (!jbwcModeActive()) {
    railFilter = "JB우리캐피탈";
    activeView = "jb-woori-capital-dashboard";
    activeDetailType = defaultDetailForView(activeView);
    changed = true;
  }
  if (route.view && JBWC_VIEWS[route.view] && jbwcState.view !== route.view) {
    jbwcState.view = route.view;
    changed = true;
  }
  if (route.caseId) {
    const nextDetail = { kind: "case", id: route.caseId };
    if (JSON.stringify(jbwcState.detail) !== JSON.stringify(nextDetail)) {
      jbwcState.detail = nextDetail;
      changed = true;
    }
  } else if (route.view && route.view !== previousView && jbwcState.detail) {
    jbwcState.detail = null;
    changed = true;
  }
  return changed;
}

function bindJbwcActions() {
  if (jbwcActivateFromHash()) {
    render();
    return;
  }

  if (jbwcModeActive()) {
    document.querySelectorAll("[data-affiliate]").forEach((entry) => {
      entry.classList.toggle("is-active", entry.dataset.affiliate === "JB우리캐피탈");
    });
    jbwcTakeoverSidebar();
    jbwcEnsureCounts();
  } else {
    jbwcRestoreSidebar();
  }

  document.querySelectorAll("[data-jbwc-view]").forEach((button) => {
    button.addEventListener("click", () => jbwcGo(button.dataset.jbwcView));
  });
  jbwcBindHarnessSamples();
  document.querySelectorAll("[data-jbwc-reset-db]").forEach((button) => {
    button.addEventListener("click", () => {
      jbwcResetDb();
      jbwcInvalidateCounts();
      if (typeof notify === "function") notify("JB우리캐피탈 데모 데이터를 다시 채웠습니다.");
      render();
    });
  });
  document.querySelectorAll("[data-jbwc-refresh]").forEach((button) => {
    button.addEventListener("click", () => { jbwcInvalidateCounts(); render(); });
  });
  document.querySelectorAll("[data-jbwc-open-case]").forEach((row) => {
    row.addEventListener("click", () => {
      const found = jbwcTable("ops_cases", JBWC_AFFILIATE_ID).find((item) => item.id === row.dataset.jbwcOpenCase);
      if (found) {
        if (typeof notify === "function") notify(`${found.caseNo} · ${found.title} — ${jbwcStatusLabel(found.status)} · 담당 ${jbwcUserName(found.assignedToId)} (모의)`);
        jbwcGo("cases", { kind: "case", id: found.id });
      }
    });
  });
  document.querySelectorAll("[data-jbwc-open-support]").forEach((row) => {
    row.addEventListener("click", () => { jbwcState.detail = { kind: "support", id: row.dataset.jbwcOpenSupport }; render(); });
  });
  document.querySelectorAll("[data-jbwc-clear-detail]").forEach((button) => {
    button.addEventListener("click", () => { jbwcState.detail = null; render(); });
  });
  document.querySelectorAll("[data-jbwc-list-filter]").forEach((input) => {
    input.addEventListener("change", () => {
      const state = jbwcListState(input.dataset.jbwcListFilter);
      state.q = input.value;
      state.page = 1;
      render();
    });
  });
  document.querySelectorAll("[data-jbwc-list-sort]").forEach((select) => {
    select.addEventListener("change", () => {
      const state = jbwcListState(select.dataset.jbwcListSort);
      state.sort = select.value;
      state.page = 1;
      render();
    });
  });
  document.querySelectorAll("[data-jbwc-list-page]").forEach((button) => {
    button.addEventListener("click", () => {
      const state = jbwcListState(button.dataset.jbwcListPage);
      state.page += Number(button.dataset.pageDelta || 0);
      render();
    });
  });

  jbwcBindCaseWizardForm();

  const back = document.querySelector("[data-jbwc-back]");
  if (back) {
    back.addEventListener("click", () => {
      railFilter = "all";
      document.querySelectorAll("[data-affiliate]").forEach((entry) => {
        entry.classList.toggle("is-active", entry.dataset.affiliate === "all");
      });
      activeView = "dashboard";
      activeDetailType = defaultDetailForView("dashboard");
      jbwcState.view = "board";
      jbwcState.detail = null;
      if (window.location.hash !== "#dashboard") window.location.hash = "#dashboard";
      if (typeof notify === "function") notify("전체 화면으로 복귀했습니다.");
      render();
    });
  }
}

(function () {
  const prevBind = typeof bindModuleActions === "function" ? bindModuleActions : null;
  window.bindModuleActions = function () {
    if (prevBind) prevBind();
    bindJbwcActions();
  };
})();
