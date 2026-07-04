/* ============================================================
   RM 역할 하네스 — route/view/sidebar/action 연결부 + 키보드 퍼스트 핸들러.
   business config/registry/service는 rmOfficer* 전용 파일에서만 가져온다.
   ============================================================ */

const rmoViewRenderers = Object.assign(
  {
    board: rmoBoardView,
    "cases-new": rmoCaseCreationView,
    "agent-harness": rmoHarnessView,
  },
  rmoCaseViewRenderers,
);

function rmOfficerHarnessPage() {
  let body = "";
  try {
    const renderer = rmoViewRenderers[rmoState.view] || rmoViewRenderers.board;
    body = renderer();
  } catch (error) {
    body = `<div class="jbwc-error">RM 데이터를 불러오지 못했습니다. <button class="secondary-button" type="button" data-rmo-reset-db>데모 데이터 초기화</button></div>`;
  }
  return `<div class="jbwc-shell rmo-shell">${rmoHeaderBar()}${rmoDetailPanel()}${body}${rmoDocumentModalMarkup()}</div>`;
}

function rmoActivateFromHash() {
  const route = rmoRouteFromHash(window.location.hash);
  if (!route) return false;
  let changed = false;
  if (!rmoModeActive()) {
    activeView = "rm-officer-harness";
    activeDetailType = defaultDetailForView(activeView);
    changed = true;
  }
  if (route.view && RMO_VIEWS[route.view] && rmoState.view !== route.view) {
    rmoState.view = route.view;
    changed = true;
  }
  if (route.caseId) {
    const nextDetail = { kind: "case", id: route.caseId };
    if (JSON.stringify(rmoState.detail) !== JSON.stringify(nextDetail)) {
      rmoState.detail = nextDetail;
      rmoState.selectedAssignmentIndex = 0;
      changed = true;
    }
  }
  return changed;
}

function rmoDoApprove(assignmentId) {
  const result = approveRmOfficerAssignment(assignmentId);
  if (result.error) { if (typeof notify === "function") notify(result.error); return; }
  if (result.alreadyDone) { if (typeof notify === "function") notify("이미 실행 완료된 에이전트입니다."); return; }
  rmoInvalidateCounts();
  rmoState.selectedAssignmentIndex = 0;
  if (result.integrated) { rmoState.mdTab = "통합본"; if (typeof notify === "function") notify(`${result.deliverable.fileName} 생성 · 통합 리포트 완성 — 담당자 검토`); }
  else if (typeof notify === "function") notify(`${result.deliverable.fileName} 생성 완료 — 다음 에이전트 승인(Enter)`);
  render();
}

function rmoHandleKeydown(event) {
  if (!rmoModeActive()) return;
  const target = event.target;
  if (target && (/(INPUT|TEXTAREA|SELECT)/).test(target.tagName || "") || (target && target.isContentEditable)) return;
  if (rmoState.modal && rmoState.modal.fileName) {
    if (event.key === "Escape") { rmoState.modal = null; render(); event.preventDefault(); }
    return;
  }
  if (/^[1-9]$/.test(event.key) && rmoState.view === "board") {
    const id = rmoState.boardOrder[Number(event.key) - 1];
    if (id) { rmoGo("board", { kind: "case", id }); event.preventDefault(); }
    return;
  }
  const caseSelected = rmoState.detail && rmoState.detail.kind === "case";
  if (!caseSelected) return;
  if (["ArrowDown", "ArrowRight", "j"].includes(event.key)) {
    rmoState.selectedAssignmentIndex = Math.min(rmoState.selectedAssignmentIndex + 1, Math.max(0, rmoState.assignmentOrder.length - 1));
    render(); event.preventDefault();
  } else if (["ArrowUp", "ArrowLeft", "k"].includes(event.key)) {
    rmoState.selectedAssignmentIndex = Math.max(rmoState.selectedAssignmentIndex - 1, 0);
    render(); event.preventDefault();
  } else if (event.key === "Enter") {
    const id = rmoState.assignmentOrder[rmoState.selectedAssignmentIndex];
    if (id) { rmoDoApprove(id); event.preventDefault(); }
  } else if (event.key === "Escape") {
    rmoState.detail = null;
    if (window.location.hash !== rmoHashForView("board")) window.location.hash = rmoHashForView("board");
    else render();
    event.preventDefault();
  }
}

function bindRmOfficerActions() {
  if (rmoActivateFromHash()) {
    render();
    return;
  }
  if (rmoModeActive()) {
    document.querySelectorAll("[data-role-filter]").forEach((entry) => {
      entry.classList.toggle("is-active", entry.dataset.roleFilter === "RM");
    });
    rmoTakeoverSidebar();
    rmoEnsureCounts();
    if (!rmoState.roleEntered) {
      rmoState.roleEntered = true;
      if (typeof harnessRunHooks === "function") harnessRunHooks("rm-officer", "onRoleEnter", {});
    }
  } else {
    rmoState.roleEntered = false;
    document.querySelectorAll('[data-role-filter="RM"]').forEach((entry) => entry.classList.remove("is-active"));
    rmoRestoreSidebar();
  }

  if (!rmoState.keyboardBound) {
    document.addEventListener("keydown", rmoHandleKeydown);
    rmoState.keyboardBound = true;
  }

  document.querySelectorAll("[data-rmo-view]").forEach((button) => {
    button.addEventListener("click", () => rmoGo(button.dataset.rmoView));
  });
  document.querySelectorAll("[data-rmo-open-case]").forEach((row) => {
    row.addEventListener("click", () => rmoGo("board", { kind: "case", id: row.dataset.rmoOpenCase }));
  });
  document.querySelectorAll("[data-rmo-open-detail]").forEach((row) => {
    row.addEventListener("click", (event) => {
      event.stopPropagation();
      const [kind, id] = String(row.dataset.rmoOpenDetail || "").split(":");
      if (kind === "case") { rmoState.infoCaseId = id; render(); }
    });
  });
  document.querySelectorAll("[data-rmo-clear-detail]").forEach((button) => {
    button.addEventListener("click", () => { rmoState.infoCaseId = null; render(); });
  });
  document.querySelectorAll("[data-rmo-filter]").forEach((button) => {
    button.addEventListener("click", () => { rmoState.boardFilter = button.dataset.rmoFilter; render(); });
  });
  document.querySelectorAll("[data-rmo-approve]").forEach((button) => {
    button.addEventListener("click", (event) => { event.stopPropagation(); rmoDoApprove(button.dataset.rmoApprove); });
  });
  document.querySelectorAll("[data-rmo-approve-item]").forEach((button) => {
    button.addEventListener("click", () => {
      const result = rmoDecideApproval(button.dataset.rmoApproveItem, button.dataset.rmoDecision, "USR-RMO-APR-01");
      if (result.error) { if (typeof notify === "function") notify(result.error); return; }
      rmoInvalidateCounts();
      if (typeof notify === "function") notify(`승인 항목 ${button.dataset.rmoDecision === "approve" ? "승인" : "반려"} 처리`);
      render();
    });
  });
  document.querySelectorAll("[data-rmo-md-tab]").forEach((button) => {
    button.addEventListener("click", () => { rmoState.mdTab = button.dataset.rmoMdTab; render(); });
  });
  document.querySelectorAll("[data-rmo-open-md]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      rmoState.modal = { fileName: button.dataset.rmoOpenMd, caseId: button.dataset.rmoMdCase || (rmoState.detail && rmoState.detail.id) };
      render();
    });
  });
  document.querySelectorAll("[data-rmo-close-modal]").forEach((el) => {
    el.addEventListener("click", (event) => { if (event.target === el) { rmoState.modal = null; render(); } });
  });
  document.querySelectorAll("[data-rmo-reset-db]").forEach((button) => {
    button.addEventListener("click", () => {
      rmoResetDb();
      rmoInvalidateCounts();
      if (typeof notify === "function") notify("RM 데모 데이터를 다시 채웠습니다.");
      render();
    });
  });
  document.querySelectorAll("[data-rmo-refresh]").forEach((button) => {
    button.addEventListener("click", () => { rmoInvalidateCounts(); render(); });
  });
  document.querySelectorAll("[data-rmo-list-filter]").forEach((input) => {
    input.addEventListener("change", () => { const state = rmoListState(input.dataset.rmoListFilter); state.q = input.value; state.page = 1; render(); });
  });
  document.querySelectorAll("[data-rmo-list-page]").forEach((button) => {
    button.addEventListener("click", () => { const state = rmoListState(button.dataset.rmoListPage); state.page += Number(button.dataset.pageDelta || 0); render(); });
  });
  const back = document.querySelector("[data-rmo-back]");
  if (back) {
    back.addEventListener("click", () => {
      activeView = "dashboard";
      activeDetailType = defaultDetailForView("dashboard");
      rmoState.view = "board";
      rmoState.detail = null;
      rmoState.infoCaseId = null;
      if (window.location.hash !== "#dashboard") window.location.hash = "#dashboard";
      if (typeof notify === "function") notify("전체 화면으로 복귀했습니다.");
      render();
    });
  }
  rmoBindCaseWizardForm();
  rmoBindHarnessSamples();
}

(function () {
  const prevBind = typeof bindModuleActions === "function" ? bindModuleActions : null;
  window.bindModuleActions = function () {
    if (prevBind) prevBind();
    bindRmOfficerActions();
  };
})();
