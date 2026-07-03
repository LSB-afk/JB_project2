/* ============================================================
   전세사기 보호 담당자 역할 하네스 — 라우팅/화면 연결부
   - view 렌더러: jeonseProtection.view.board/cases/wizard/harness.js
   - 공용 헬퍼: jeonseProtection.helpers.js · 사이드바: jeonseProtection.sidebar.js
   - business config/registry/service는 별도 전용 파일에서만 가져온다.
   - 실제 개인정보·법률 판단·신청 대행 없음. mock DB는 role scope 강제.
   ============================================================ */

const jpoViewRenderers = Object.assign(
  {
    board: jpoDashboardView,
    "cases-new": jpoCaseCreationView,
    "agent-harness": jpoHarnessView,
  },
  jpoCaseViewRenderers,
);

function jpoOpsPage() {
  let body = "";
  try {
    const renderer = jpoViewRenderers[jpoState.view] || jpoViewRenderers.board;
    body = renderer();
  } catch (error) {
    body = `<div class="jbwc-error">데이터를 불러오지 못했습니다. <button class="secondary-button" type="button" data-jpo-reset-db>데모 데이터 초기화</button></div>`;
  }
  return `<div class="jbwc-shell jpo-shell">${jpoHeaderBar()}${jpoState.view === "case-full" ? "" : jpoDetailPanel()}${body}</div>`;
}

function jpoContextMarkup() {
  const counts = jpoState.counts || getJeonseProtectionSidebarCounts();
  return `<div class="case-properties">
    <div class="property-row"><span>전용 하네스</span><strong>${escapeHtml(jeonseFraudProtectionHarness.id)}</strong></div>
    <div class="property-row"><span>데이터 범위(roleKey)</span><strong>${escapeHtml(JPO_ROLE_KEY)}</strong></div>
    <div class="property-row"><span>전세보호 건</span><strong>${escapeHtml(counts.cases)}</strong></div>
    <div class="property-row"><span>긴급 경·공매</span><strong>${escapeHtml(counts.urgentAuction)}</strong></div>
    <div class="property-row"><span>데이터 연계</span><strong>${(typeof isLive === "function" && isLive()) ? "실거래 API 모드" : "샘플/스냅샷 기준"}</strong></div>
    <div class="property-row"><span>사람 검토</span><strong>피해자 결정·법률·보증·안내문 필수</strong></div>
    <p class="jbwc-guard">전세사기 여부·피해자 결정·보증 가입·법률 자문에 대한 확정 판단, 신청 대행, 개인정보 원문 저장/출력은 금지됩니다.</p>
  </div>`;
}

function jpoGo(view, detail) {
  jpoState.view = view;
  jpoState.detail = detail || null;
  const next = view === "case-full" && detail && detail.id
    ? jpoHashForView("case-full", detail.id)
    : detail && detail.kind === "case" ? jpoHashForView("cases", detail.id) : jpoHashForView(view);
  if (window.location.hash !== next) window.location.hash = next;
  else if (typeof render === "function") render();
}

function jpoActivateFromHash() {
  const route = jpoRouteFromHash(window.location.hash);
  if (!route) return false;
  let changed = false;
  const previousView = jpoState.view;
  if (!jpoModeActive()) {
    activeView = "jeonse-protection-harness";
    activeDetailType = defaultDetailForView(activeView);
    changed = true;
  }
  if (route.view && JPO_VIEWS[route.view] && jpoState.view !== route.view) {
    jpoState.view = route.view;
    changed = true;
  }
  if (route.caseId) {
    const nextDetail = { kind: "case", id: route.caseId };
    if (JSON.stringify(jpoState.detail) !== JSON.stringify(nextDetail)) {
      jpoState.detail = nextDetail;
      changed = true;
    }
  } else if (route.view && route.view !== previousView && jpoState.detail) {
    jpoState.detail = null;
    changed = true;
  }
  return changed;
}

function bindJpoActions() {
  if (jpoActivateFromHash()) {
    render();
    return;
  }

  if (jpoModeActive()) {
    document.querySelectorAll("[data-role-filter]").forEach((entry) => {
      entry.classList.toggle("is-active", entry.dataset.roleFilter === "전세보호 담당자");
    });
    jpoTakeoverSidebar();
    jpoEnsureCounts();
    if (!jpoState.roleEntered) {
      jpoState.roleEntered = true;
      if (typeof harnessRunHooks === "function") {
        const enterGuard = harnessRunHooks("jeonse-protection", "onRoleEnter", {});
        if (!enterGuard.ok && typeof notify === "function") notify(`하네스 진입 점검 경고: ${enterGuard.violations.join(" / ")}`);
      }
    }
  } else {
    jpoState.roleEntered = false;
    document.querySelectorAll('[data-role-filter="전세보호 담당자"]').forEach((entry) => {
      entry.classList.remove("is-active");
    });
    jpoRestoreSidebar();
  }

  document.querySelectorAll("[data-jpo-view]").forEach((button) => {
    button.addEventListener("click", () => jpoGo(button.dataset.jpoView));
  });
  jpoBindHarnessSamples();
  document.querySelectorAll("[data-jpo-command]").forEach((button) => {
    button.addEventListener("click", () => {
      jpoRunCommand(button.dataset.jpoCommand);
      render();
    });
  });
  document.querySelectorAll("[data-jpo-approve]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const result = jpoDecideApproval(button.dataset.jpoApprove, "approve");
      if (result && result.blocked) {
        if (typeof notify === "function") notify(`승인 차단: ${result.violations.join(" / ")}`);
        return;
      }
      if (result && typeof notify === "function") notify(`${result.approval.approvalType} 승인 완료 (사람 결정)`);
      jpoInvalidateCounts();
      render();
    });
  });
  document.querySelectorAll("[data-jpo-reset-db]").forEach((button) => {
    button.addEventListener("click", () => {
      jpoResetDb();
      jpoInvalidateCounts();
      if (typeof notify === "function") notify("전세보호 데모 데이터를 다시 채웠습니다.");
      render();
    });
  });
  document.querySelectorAll("[data-jpo-refresh]").forEach((button) => {
    button.addEventListener("click", () => { jpoInvalidateCounts(); render(); });
  });
  document.querySelectorAll("[data-jpo-open-case]").forEach((row) => {
    row.addEventListener("click", () => {
      const found = jpoTable("jeonse_cases", JPO_ROLE_KEY).find((item) => item.id === row.dataset.jpoOpenCase);
      if (found) {
        if (typeof notify === "function") notify(`${jpoCaseNoLabel(found.caseNo)} · ${found.title} — ${jpoStatusLabel(found.status)} · 담당 ${jpoUserName(found.assignedToId)} (모의)`);
        // 좁은 화면에서는 패널 대신 상세 페이지로 이동
        if (window.matchMedia && window.matchMedia("(max-width: 1180px)").matches) {
          jpoRecordCaseSelected(found.id);
          jpoGo("case-full", { kind: "case", id: found.id });
          return;
        }
        jpoGo("cases", { kind: "case", id: found.id });
      }
    });
  });
  document.querySelectorAll("[data-jpo-open-detail]").forEach((row) => {
    row.addEventListener("click", () => {
      const [kind, id] = String(row.dataset.jpoOpenDetail || "").split(":");
      if (!kind || !id) return;
      jpoState.detail = { kind, id };
      render();
    });
  });
  document.querySelectorAll("[data-jpo-open-approval]").forEach((row) => {
    row.addEventListener("click", () => { jpoState.detail = { kind: "approval", id: row.dataset.jpoOpenApproval }; render(); });
  });
  document.querySelectorAll("[data-jpo-clear-detail]").forEach((button) => {
    button.addEventListener("click", () => { jpoState.detail = null; render(); });
  });
  document.querySelectorAll("[data-jpo-open-full]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const id = button.dataset.jpoOpenFull;
      jpoRecordCaseSelected(id);
      jpoState.caseTab = "overview";
      jpoGo("case-full", { kind: "case", id });
    });
  });
  document.querySelectorAll("[data-jpo-case-tab]").forEach((button) => {
    button.addEventListener("click", () => { jpoState.caseTab = button.dataset.jpoCaseTab; render(); });
  });
  document.querySelectorAll("[data-jpo-go-view]").forEach((button) => {
    button.addEventListener("click", () => jpoGo(button.dataset.jpoGoView));
  });
  document.querySelectorAll("[data-jpo-verify-evidence]").forEach((button) => {
    button.addEventListener("click", () => {
      const caseId = button.dataset.jpoVerifyEvidence;
      const evidence = jpoTable("jeonse_evidence", JPO_ROLE_KEY).filter((item) => item.caseId === caseId);
      const tables = ["jeonse_price_snapshots", "jeonse_risk_signals", "jeonse_registry_checks", "jeonse_guarantee_checks", "jeonse_support_referrals", "jeonse_agent_runs", "external_connectors", "jeonse_audit_logs"];
      let ok = 0, missing = 0, manual = 0;
      evidence.forEach((item) => {
        if (!item.refId) { manual += 1; return; }
        const exists = tables.some((table) => jpoTable(table, JPO_ROLE_KEY).some((rowItem) => rowItem.id === item.refId));
        if (exists) ok += 1; else missing += 1;
      });
      jpoState.evidenceCheck = {
        caseId,
        message: missing === 0
          ? `무결성 확인 완료 — 참조 ${ok}건 일치 · 수동 근거 ${manual}건`
          : `참조 불일치 ${missing}건 — 담당자 확인 필요 (일치 ${ok} · 수동 ${manual})`,
      };
      render();
    });
  });
  document.querySelectorAll("[data-jpo-list-filter]").forEach((input) => {
    input.addEventListener("change", () => {
      const state = jpoListState(input.dataset.jpoListFilter);
      state.q = input.value;
      state.page = 1;
      render();
    });
  });
  document.querySelectorAll("[data-jpo-list-sort]").forEach((select) => {
    select.addEventListener("change", () => {
      const state = jpoListState(select.dataset.jpoListSort);
      state.sort = select.value;
      state.page = 1;
      render();
    });
  });
  document.querySelectorAll("[data-jpo-list-page]").forEach((button) => {
    button.addEventListener("click", () => {
      const state = jpoListState(button.dataset.jpoListPage);
      state.page += Number(button.dataset.pageDelta || 0);
      render();
    });
  });

  jpoBindCaseWizardForm();

  document.querySelectorAll("[data-jpo-enrich-latest]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = jpoTable("jeonse_cases", JPO_ROLE_KEY).find((c) => c.status === "enriching" || c.sourceMode === "fallback")
        || jpoTable("jeonse_cases", JPO_ROLE_KEY)[0];
      if (!target) return;
      jpoState.enrich = { status: "loading", caseId: target.id, message: `${jpoCaseNoLabel(target.caseNo)} 실거래 조회 중...` };
      render();
      enrichJeonseCase(target.id)
        .then((result) => {
          jpoState.enrich = {
            status: result.market.sourceMode,
            caseId: target.id,
            message: `${jpoCaseNoLabel(target.caseNo)} 보강 완료 — ${JPO_SOURCE_MODES[result.market.sourceMode]} · 위험도 ${JPO_RISK_LABELS[result.assessment.riskLevel] || result.assessment.riskLevel}`,
          };
          jpoInvalidateCounts();
        })
        .catch(() => { jpoState.enrich = { status: "fallback", caseId: target.id, message: "보강 실패 — 담당자 확인 필요" }; })
        .then(() => render());
    });
  });

  const back = document.querySelector("[data-jpo-back]");
  if (back) {
    back.addEventListener("click", () => {
      document.querySelectorAll("[data-role-filter]").forEach((entry) => entry.classList.remove("is-active"));
      activeView = "dashboard";
      activeDetailType = defaultDetailForView("dashboard");
      jpoState.view = "board";
      jpoState.detail = null;
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
    bindJpoActions();
  };
})();
