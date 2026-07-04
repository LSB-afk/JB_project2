/* ============================================================
   RM 역할 하네스 — route/view/sidebar/action 연결부 + 키보드 퍼스트 핸들러.
   business config/registry/service는 rmOfficer* 전용 파일에서만 가져온다.
   ============================================================ */

const rmoViewRenderers = Object.assign(
  {
    board: rmoBoardView,
    "cases-new": rmoCaseCreationView,
    "agent-harness": rmoHarnessView,
    capabilities: rmoCapabilityRepositoryView,
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
      rmoState.workMapFocusIndex = -1;
      rmoState.workMapExpandedNodeId = null;
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
  rmoState.workMapExpandedNodeId = null;
  if (result.integrated) { rmoState.mdTab = "통합본"; if (typeof notify === "function") notify(`${result.deliverable.fileName} 생성 · 통합 리포트 완성 — 직원 최종 승인(A) 대기`); }
  else if (typeof notify === "function") notify(`${result.deliverable.fileName} 생성 완료 — 다음 에이전트 승인(Enter)`);
  render();
}

function rmoDoRerun(assignmentId) {
  const result = rmoRerunWorkMapNode(assignmentId);
  if (result.error) { if (typeof notify === "function") notify(result.error); return; }
  rmoInvalidateCounts();
  rmoState.workMapExpandedNodeId = null;
  if (typeof notify === "function") notify(`${result.deliverable ? result.deliverable.fileName : ""} 재실행 완료`.trim());
  render();
}

function rmoDoApproveCase() {
  const caseId = rmoState.detail && rmoState.detail.kind === "case" ? rmoState.detail.id : null;
  if (!caseId) return;
  const result = rmoApproveCaseReport(caseId, "USR-RMO-APR-01");
  if (result.error) { if (typeof notify === "function") notify(result.error); return; }
  if (result.alreadyDone) { if (typeof notify === "function") notify("이미 직원 최종 승인이 완료된 케이스입니다."); return; }
  rmoInvalidateCounts();
  if (typeof notify === "function") notify("직원 최종 승인 완료 — 케이스가 종료 처리되었습니다.");
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
  /* ←→ 케이스 이동 — 케이스가 선택된 상태에서 업무보드 순서를 따라 이전/다음 케이스로 */
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    if (caseSelected && rmoState.view === "board" && rmoState.boardOrder.length) {
      const idx = rmoState.boardOrder.indexOf(rmoState.detail.id);
      const nextIdx = event.key === "ArrowRight" ? Math.min(idx + 1, rmoState.boardOrder.length - 1) : Math.max(idx - 1, 0);
      const nextId = rmoState.boardOrder[nextIdx];
      if (nextId && nextId !== rmoState.detail.id) rmoGo("board", { kind: "case", id: nextId });
      event.preventDefault();
    }
    return;
  }
  if (!caseSelected) return;
  /* ↑↓ 업무 계층도 노드 이동 · Space 상세 보기 · Enter 실행 승인 · R 재실행 · A 통합 보고서 승인 */
  if (event.key === "ArrowDown") {
    rmoState.workMapFocusIndex = Math.min(rmoState.workMapFocusIndex + 1, Math.max(0, rmoState.workMapNodeOrder.length - 1));
    rmoState.workMapExpandedNodeId = null;
    render(); event.preventDefault();
  } else if (event.key === "ArrowUp") {
    rmoState.workMapFocusIndex = Math.max(rmoState.workMapFocusIndex - 1, 0);
    rmoState.workMapExpandedNodeId = null;
    render(); event.preventDefault();
  } else if (event.key === " " || event.key === "Spacebar") {
    const id = rmoState.workMapNodeOrder[rmoState.workMapFocusIndex];
    if (id) rmoState.workMapExpandedNodeId = rmoState.workMapExpandedNodeId === id ? null : id;
    render(); event.preventDefault();
  } else if (event.key === "Enter") {
    const id = rmoState.workMapNodeOrder[rmoState.workMapFocusIndex];
    if (id) { rmoDoApprove(id); event.preventDefault(); }
  } else if (event.key === "r" || event.key === "R") {
    const id = rmoState.workMapNodeOrder[rmoState.workMapFocusIndex];
    if (id) { rmoDoRerun(id); event.preventDefault(); }
  } else if (event.key === "a" || event.key === "A") {
    rmoDoApproveCase(); event.preventDefault();
  } else if (event.key === "Escape") {
    rmoState.detail = null;
    rmoState.workMapExpandedNodeId = null;
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
  document.querySelectorAll("[data-rmo-cap-filter]").forEach((button) => {
    button.addEventListener("click", () => { rmoCapabilityFilter = button.dataset.rmoCapFilter; render(); });
  });
  document.querySelectorAll("[data-rmo-approve]").forEach((button) => {
    button.addEventListener("click", (event) => { event.stopPropagation(); rmoDoApprove(button.dataset.rmoApprove); });
  });
  document.querySelectorAll("[data-rmo-rerun]").forEach((button) => {
    button.addEventListener("click", (event) => { event.stopPropagation(); rmoDoRerun(button.dataset.rmoRerun); });
  });
  document.querySelectorAll("[data-rmo-approve-case]").forEach((button) => {
    button.addEventListener("click", (event) => { event.stopPropagation(); rmoDoApproveCase(); });
  });
  document.querySelectorAll("[data-rmo-node]").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      const idx = rmoState.workMapNodeOrder.indexOf(card.dataset.rmoNode);
      if (idx >= 0) { rmoState.workMapFocusIndex = idx; rmoState.workMapExpandedNodeId = null; render(); }
    });
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
