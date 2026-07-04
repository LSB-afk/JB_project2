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
    "capability-repository": jpoCapabilityRepositoryView,
  },
  jpoCaseViewRenderers,
);

let jpoKeyboardBound = false;

function jpoOpsPage() {
  let body = "";
  try {
    const renderer = jpoViewRenderers[jpoState.view] || jpoViewRenderers.board;
    body = renderer();
  } catch (error) {
    body = `<div class="jbwc-error">데이터를 불러오지 못했습니다. <button class="secondary-button" type="button" data-jpo-reset-db>데모 데이터 초기화</button></div>`;
  }
  return `<div class="jbwc-shell jpo-shell">${jpoHeaderBar()}${jpoDetailPanel()}${body}</div>`;
}

function jpoContextRows(rows) {
  return rows.map(([label, value]) => `<div class="property-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "-")}</strong></div>`).join("");
}

function jpoContextList(title, rows) {
  const items = (rows || []).map(([head, sub]) => `<li><strong>${escapeHtml(head || "-")}</strong><span>${escapeHtml(sub || "-")}</span></li>`).join("");
  return `<section class="jpo-context-section"><h4>${escapeHtml(title)}</h4><ul>${items || "<li><span>표시할 항목 없음</span></li>"}</ul></section>`;
}

function jpoContextShell(title, rows, chips = [], sections = [], guard = "") {
  const chipMarkup = chips.map((chip) => `<span class="jpo-data-chip">${escapeHtml(chip || "-")}</span>`).join("");
  return `<div class="case-properties jpo-context-panel">
    <div class="jpo-context-title-card"><span>현재 선택 요약</span><strong>${escapeHtml(title || "전세보호 업무 요약")}</strong></div>
    ${jpoContextRows(rows || [])}
    ${chipMarkup ? `<div class="jpo-context-chiprow">${chipMarkup}</div>` : ""}
    ${(sections || []).join("")}
    <p class="jbwc-guard">${escapeHtml(guard || "내부 운영 참고용입니다. 전세사기 여부·법률·보증·피해자 결정은 담당자 검토 없이 확정하지 않습니다.")}</p>
  </div>`;
}

function jpoFindCase(caseId) {
  return jpoTable("jeonse_cases", JPO_ROLE_KEY).find((item) => item.id === caseId || item.caseNo === caseId) || null;
}

function jpoAgentInfo(agentId) {
  return jeonseProtectionAgents.find((agent) => agent.id === agentId) || null;
}

function jpoContextCaseMarkup(row) {
  const runs = jpoTable("jeonse_agent_runs", JPO_ROLE_KEY).filter((run) => run.caseId === row.id).slice(0, 3);
  const deliverables = typeof jpoCaseDeliverables === "function" ? jpoCaseDeliverables(row.id).slice(0, 3) : [];
  const audits = jpoTable("jeonse_audit_logs", JPO_ROLE_KEY).filter((audit) => audit.caseId === row.id).slice(0, 3);
  const signals = jpoCaseSignals(row.id, 3);
  return jpoContextShell(`${row.caseNo} · ${row.addressMasked}`, [
    ["임차인/물건", `${row.customerRefId} · ${jpoHousingTypeLabel(row.housingType)} · ${row.buildingName || row.addressMasked}`],
    ["계약/보증금", `${jpoWon(row.depositAmount)} · ${row.contractEndDate || "계약일 미정"} · ${jpoIntakeTypeLabel(row.intakeType)}`],
    ["현재 상태", `${jpoStatusLabel(row.status)} · ${JPO_RISK_LABELS[row.riskLevel] || row.riskLevel} 위험 · ${row.auctionNoticed ? "경·공매 긴급" : "일반 처리"}`],
    ["시세/데이터", `${JPO_SOURCE_MODES[row.sourceMode] || row.sourceMode} · ${jpoCaseDataChips(row).join(" · ")}`],
    ["권리/보증 확인", `등기 ${jpoStatusLabel(row.registryStatus)} · 보증 ${jpoStatusLabel(row.guaranteeStatus)} · 건축물 ${jpoStatusLabel(row.buildingCheckStatus)}`],
    ["상황", jpoCaseSituationLine(row)],
    ["위험 신호", signals.map((signal) => signal.title).join(" · ") || "등록된 위험 신호 없음"],
    ["처리 목표", "위험 신호와 확인 후보를 분리하고 고객 공유 전 담당자 승인 게이트로 묶습니다."],
    ["다음 액션", jpoCaseNextAction(row)],
  ], [JPO_RISK_LABELS[row.riskLevel] || row.riskLevel, jpoStatusLabel(row.status), JPO_SOURCE_MODES[row.sourceMode] || row.sourceMode], [
    jpoContextList("에이전트 실행 큐", jpoCaseAgentIds(row, false).map((agentId) => [jpoAgentDisplayName(agentId), `${row.requiresHumanReview || ["jpo-auction", "jpo-victim", "jpo-comms", "jpo-supervisor"].includes(agentId) ? "담당자 검토 필요" : "검토 후보"} · ${agentId}`])),
    jpoContextList("생성 산출물", deliverables.map((item) => [item.fileName, `${jpoStatusLabel(item.status)} · ${item.title || "내부 운영 참고"}`])),
    jpoContextList("근거/감사", signals.map((signal) => [signal.title, signal.evidence]).concat(audits.map((audit) => [jpoAuditActionLabel(audit.action), audit.createdAt]))),
    jpoContextList("업로드 파일", jpoTable("jeonse_evidence_files", JPO_ROLE_KEY).filter((file) => file.caseId === row.id).slice(0, 3).map((file) => [file.fileName, file.analysisSummary || "메타데이터만 저장"])),
  ]);
}

function jpoContextCapabilityMarkup(capability) {
  if (!capability) return "";
  const risk = capability.risk || jpoCapabilityRisk(capability);
  const humanLabel = capability.humanLabel || jpoCapabilityHumanLabel(capability);
  const connectedCases = jpoTable("jeonse_cases", JPO_ROLE_KEY)
    .filter((row) => jpoCaseAgentIds(row, false).some((agentId) => (capability.agents || []).includes(agentId)))
    .slice(0, 5);
  return jpoContextShell(`${capability.name} 기술 상세`, [
    ["기능명", capability.name],
    ["기능 목적", capability.summary],
    ["입력값", capability.data || capability.inputs || "-"],
    ["출력값", capability.output || capability.outputs || "-"],
    ["연결 에이전트", (capability.agents || []).map(jpoAgentDisplayName).join(" · ") || "-"],
    ["사용 도메인", capability.domain],
    ["위험도", risk],
    ["담당자 확인", humanLabel],
    ["사용 시나리오", `${capability.domain} 화면에서 케이스 입력값을 읽고 ${capability.output || "검토 산출물"}을 생성합니다.`],
    ["감사 기록 연결", /감사|승인|피해|법률|보증|경·공매/.test(`${capability.name} ${capability.domain}`) ? "직접 연결" : "에이전트 실행/산출물 이벤트로 간접 연결"],
  ], [capability.category, jpoStatusLabel(capability.status), `위험도 ${risk}`, humanLabel], [
    jpoContextList("적용 케이스", connectedCases.map((row) => [row.caseNo, `${jpoCaseSituationLine(row)} · ${jpoCaseNextAction(row)}`])),
    jpoContextList("생성 산출물 예시", [[capability.output || "-", capability.summary], ["검토 게이트", humanLabel]]),
  ]);
}

function jpoContextAgentRunMarkup(run) {
  if (!run) return "";
  const row = jpoFindCase(run.caseId);
  const agent = jpoAgentInfo(run.agentId);
  const audits = row ? jpoTable("jeonse_audit_logs", JPO_ROLE_KEY).filter((audit) => audit.caseId === row.id).slice(0, 4) : [];
  return jpoContextShell(`${jpoAgentDisplayName(run.agentId)} 실행 요약`, [
    ["실행 ID", run.id],
    ["연결 케이스", row ? `${row.caseNo} · ${row.addressMasked}` : run.caseId],
    ["고객/상담/도메인", row ? `${row.customerRefId} · ${jpoIntakeTypeLabel(row.intakeType)} · 전세보호` : "-"],
    ["에이전트 역할", agent ? agent.description : jpoAgentDisplayName(run.agentId)],
    ["사용 데이터", agent ? (agent.dbReads || []).join(" · ") : run.inputSummary],
    ["예상 산출물", agent ? (agent.dbWrites || []).join(" · ") : "agent_run · audit"],
    ["현재 상태", `${jpoStatusLabel(run.status)} · ${JPO_RISK_LABELS[run.riskLevel] || run.riskLevel || "-"}`],
    ["다음 액션", run.requiresHumanReview || run.requiresHumanEscalation ? "담당자 검토 후 승인/반려" : "상태 확인"],
    ["담당자 승인", run.requiresHumanReview || run.requiresHumanEscalation ? "필요" : "검토 후보"],
  ], [jpoStatusLabel(run.status), jpoAgentDisplayName(run.agentId), run.requiresHumanReview ? "담당자 검토 필요" : "검토 후보"], [
    row ? jpoContextList("케이스 내용", [[jpoCaseSituationLine(row), jpoCasePriorityReason(row, jpoCaseSignals(row.id, 3))], ["처리 목표", jpoCaseNextAction(row)]]) : "",
    jpoContextList("관련 감사 로그", audits.map((audit) => [jpoAuditActionLabel(audit.action), audit.createdAt])),
  ]);
}

function jpoContextConnectorMarkup(connector) {
  if (!connector) return "";
  const cases = jpoTable("jeonse_cases", JPO_ROLE_KEY);
  const affectedCases = cases.filter((row) => (
    row.sourceMode === connector.sourceMode
    || (connector.category === "hug" && ["unknown", "none"].includes(row.guaranteeStatus))
    || (connector.category === "registry" && row.registryStatus === "unknown")
    || (connector.health !== "healthy" && ["fallback", "snapshot"].includes(row.sourceMode))
  )).slice(0, 5);
  const agents = jeonseProtectionAgents
    .filter((agent) => (agent.dbReads || []).includes("external_connectors") || String(agent.domain || "").toLowerCase().includes(String(connector.category || "").toLowerCase()))
    .slice(0, 5);
  const capabilities = typeof JPO_CAPABILITY_CATALOG !== "undefined"
    ? JPO_CAPABILITY_CATALOG.filter((capability) => {
      const text = `${capability.name} ${capability.domain} ${capability.data} ${capability.summary}`;
      return text.includes(connector.category) || /데이터|시세|권리|보증|증적/.test(text);
    }).slice(0, 5)
    : [];
  const impact = connector.health === "healthy"
    ? "정상 연결 상태 유지"
    : connector.sourceMode === "manualRequired"
      ? "수동 확인 전까지 자동 확정 표현 금지"
      : "데이터 부족 표시와 담당자 확인 필요";
  return jpoContextShell("데이터 연결 요약", [
    ["커넥터 ID", connector.id],
    ["데이터 출처", `${connector.name} · ${connector.externalRef || "-"}`],
    ["공개/샘플/수동", JPO_SOURCE_MODES[connector.sourceMode] || connector.sourceMode],
    ["분류", connector.category],
    ["상태", `${jpoStatusLabel(connector.health)} · ${jpoStatusLabel(connector.status)}`],
    ["최근 동기화", connector.lastSyncAt || "담당자 확인 필요"],
    ["실패 이유", connector.health === "healthy" ? "없음" : `${jpoStatusLabel(connector.health)} 상태 — ${impact}`],
    ["업무 영향", impact],
    ["다음 조치", connector.health === "healthy" ? "정상 연결 상태 유지" : "수동 확인 후 스냅샷/샘플 데이터 갱신"],
    ["담당자 확인", connector.health === "healthy" ? "일반 모니터링" : "필요"],
  ], [connector.category, jpoStatusLabel(connector.health), JPO_SOURCE_MODES[connector.sourceMode] || connector.sourceMode], [
    jpoContextList("연결 에이전트", agents.map((agent) => [agent.displayName, `${agent.domain} · 이 데이터 상태를 입력으로 사용`])),
    jpoContextList("영향 케이스", affectedCases.map((row) => [row.caseNo, `${jpoCaseSituationLine(row)} · ${jpoCaseNextAction(row)}`])),
    jpoContextList("사용되는 업무 기능", capabilities.map((capability) => [capability.name, capability.output])),
  ]);
}

function jpoContextAuditMarkup(audit) {
  if (!audit) return "";
  const row = jpoFindCase(audit.caseId);
  return jpoContextShell("감사 기록 요약", [
    ["기록 ID", audit.id],
    ["행위", jpoAuditActionLabel(audit.action)],
    ["대상", `${audit.targetType || "-"} ${audit.targetId || ""}`],
    ["관련 케이스", row ? `${row.caseNo} · ${row.addressMasked}` : audit.caseId],
    ["위험도", JPO_RISK_LABELS[audit.riskLevel] || audit.riskLevel],
    ["검토 필요", audit.reviewRequired ? "필요" : "기록 완료"],
    ["생성 시각", audit.createdAt || "-"],
  ], [jpoAuditActionLabel(audit.action), JPO_RISK_LABELS[audit.riskLevel] || audit.riskLevel, audit.reviewRequired ? "검토 필요" : "기록됨"], [
    audit ? `<section class="jpo-context-section jpo-context-document"><h4>감사 문서</h4><div class="jpo-md-body">${jpoRenderMarkdownSections(jpoAuditDocumentBody(audit, row))}</div></section>` : "",
  ]);
}

function jpoPickConnector() {
  const rows = jpoTable("external_connectors", JPO_ROLE_KEY);
  const selectedId = jpoState.detail?.kind === "connector" ? jpoState.detail.id
    : jpoState.contextSubject?.kind === "connector" ? jpoState.contextSubject.id : null;
  return rows.find((row) => row.id === selectedId)
    || rows.find((row) => row.health !== "healthy" || row.status === "manualRequired")
    || rows[0] || null;
}

function jpoPickAudit() {
  const rows = jpoTable("jeonse_audit_logs", JPO_ROLE_KEY);
  const selectedId = jpoState.detail?.kind === "audit" ? jpoState.detail.id
    : jpoState.contextSubject?.kind === "audit" ? jpoState.contextSubject.id : null;
  return rows.find((row) => row.id === selectedId)
    || rows.find((row) => row.reviewRequired)
    || rows[0] || null;
}

function jpoContextMarkup() {
  const counts = jpoState.counts || getJeonseProtectionSidebarCounts();
  if (jpoState.detail?.kind === "case") {
    const row = jpoFindCase(jpoState.detail.id);
    if (row) return jpoContextCaseMarkup(row);
  }
  if (jpoState.detail?.kind === "agentRun") {
    const run = jpoTable("jeonse_agent_runs", JPO_ROLE_KEY).find((item) => item.id === jpoState.detail.id);
    if (run) return jpoContextAgentRunMarkup(run);
  }
  if (jpoState.detail?.kind === "connector") {
    const connector = jpoTable("external_connectors", JPO_ROLE_KEY).find((item) => item.id === jpoState.detail.id);
    if (connector) return jpoContextConnectorMarkup(connector);
  }
  if (jpoState.detail?.kind === "audit") {
    const audit = jpoTable("jeonse_audit_logs", JPO_ROLE_KEY).find((item) => item.id === jpoState.detail.id);
    if (audit) return jpoContextAuditMarkup(audit);
  }
  if (jpoState.contextSubject?.kind === "case") {
    const row = jpoFindCase(jpoState.contextSubject.id);
    if (row) return jpoContextCaseMarkup(row);
  }
  if (jpoState.contextSubject?.kind === "capability" && typeof JPO_CAPABILITY_CATALOG !== "undefined") {
    const capability = JPO_CAPABILITY_CATALOG.find((item) => item.name === jpoState.contextSubject.id);
    if (capability) return jpoContextCapabilityMarkup(capability);
  }
  if (jpoState.contextSubject?.kind === "connector") return jpoContextConnectorMarkup(jpoPickConnector());
  if (jpoState.contextSubject?.kind === "audit") return jpoContextAuditMarkup(jpoPickAudit());
  if (jpoState.view === "capability-repository" && typeof JPO_CAPABILITY_CATALOG !== "undefined") {
    return jpoContextCapabilityMarkup(JPO_CAPABILITY_CATALOG[0]);
  }
  if (jpoState.view === "data-connectors") return jpoContextConnectorMarkup(jpoPickConnector());
  if (jpoState.view === "audit-logs") return jpoContextAuditMarkup(jpoPickAudit());
  if (jpoState.view === "agent-harness") {
    const run = jpoTable("jeonse_agent_runs", JPO_ROLE_KEY).find((item) => ["queued", "running", "needsReview", "pendingApproval"].includes(item.status))
      || jpoTable("jeonse_agent_runs", JPO_ROLE_KEY)[0];
    if (run) return jpoContextAgentRunMarkup(run);
  }
  const selected = jpoSelectedBoardCase();
  if (selected) return jpoContextCaseMarkup(selected);
  return jpoContextShell("전세보호 하네스 요약", [
    ["전용 하네스", jeonseFraudProtectionHarness.id],
    ["데이터 범위(roleKey)", JPO_ROLE_KEY],
    ["전세보호 건", counts.cases],
    ["긴급 경·공매", counts.urgentAuction],
    ["데이터 연계", (typeof isLive === "function" && isLive()) ? "실거래 API 모드" : "샘플/스냅샷 기준"],
    ["사람 검토", "피해자 결정·법률·보증·안내문 필수"],
  ]);
}

function jpoPropertyPanelTitle() {
  if (jpoState.detail?.kind === "case") {
    const row = jpoFindCase(jpoState.detail.id);
    if (row) return `${row.caseNo} · ${row.addressMasked}`;
  }
  if (jpoState.detail?.kind === "connector") {
    const row = jpoTable("external_connectors", JPO_ROLE_KEY).find((item) => item.id === jpoState.detail.id);
    if (row) return `${row.name} 연결 요약`;
  }
  if (jpoState.detail?.kind === "audit") {
    const row = jpoTable("jeonse_audit_logs", JPO_ROLE_KEY).find((item) => item.id === jpoState.detail.id);
    if (row) return `${jpoAuditActionLabel(row.action)} 감사 기록`;
  }
  if (jpoState.contextSubject?.kind === "capability" && typeof JPO_CAPABILITY_CATALOG !== "undefined") {
    const capability = JPO_CAPABILITY_CATALOG.find((item) => item.name === jpoState.contextSubject.id);
    if (capability) return `${capability.name} 기술 상세`;
  }
  if (jpoState.view === "data-connectors") return "데이터 연결 요약";
  if (jpoState.view === "audit-logs") return "감사 기록 요약";
  if (jpoState.view === "capability-repository") return "업무 기능 기술 요약";
  const selected = jpoSelectedBoardCase();
  if (selected) return `${selected.caseNo} · ${selected.addressMasked}`;
  return JPO_VIEWS[jpoState.view] || "전세사기 보호 담당자 하네스";
}

function jpoGo(view, detail) {
  jpoState.view = view;
  jpoState.detail = detail || null;
  if (!["capability-repository", "data-connectors", "audit-logs"].includes(view)) jpoState.contextSubject = null;
  const next = detail && detail.kind === "case" ? jpoHashForView("cases", detail.id) : jpoHashForView(view);
  if (window.location.hash !== next) window.location.hash = next;
  else if (typeof render === "function") render();
}

function jpoSelectBoardCase(caseId, sourceLabel = "케이스 선택") {
  const found = jpoTable("jeonse_cases", JPO_ROLE_KEY).find((item) => item.id === caseId || item.caseNo === caseId);
  if (!found) return;
  const changed = jpoState.selectedCaseId !== found.id;
  jpoState.selectedCaseId = found.id;
  if (changed) jpoState.workMapFocusIndex = 0;
  jpoState.view = "board";
  jpoState.detail = null;
  jpoState.contextSubject = { kind: "case", id: found.id };
  jpoShowKeyOverlay(sourceLabel, `${found.caseNo} 선택`);
  jpoSetPendingScroll(`[data-jpo-board-case="${found.id}"]`);
  const next = jpoHashForView("board");
  if (window.location.hash !== next) window.location.hash = next;
  else if (typeof render === "function") render();
}

function jpoMoveBoardSelection(delta) {
  const order = jpoState.boardOrder || [];
  if (!order.length) return;
  const current = Math.max(0, order.indexOf(jpoState.selectedCaseId));
  const nextIndex = Math.min(Math.max(current + delta, 0), order.length - 1);
  jpoSelectBoardCase(order[nextIndex], delta > 0 ? "→ 케이스 이동" : "← 케이스 이동");
}

function jpoMoveQueueFocus(delta, label = "큐 이동") {
  const row = jpoSelectedBoardCase();
  if (!row) return;
  const nodes = jpoQueueNodesForCase(row);
  if (!nodes.length) return;
  jpoState.workMapFocusIndex = Math.min(Math.max(Number(jpoState.workMapFocusIndex || 0) + delta, 0), nodes.length - 1);
  const node = nodes[jpoState.workMapFocusIndex];
  jpoShowKeyOverlay(label, `${jpoAgentDisplayName(node.agentId)} 선택`);
  jpoSetPendingScroll(`[data-jpo-node="${node.id}"]`);
  if (typeof render === "function") render();
}

function jpoExecuteQueueNode(nodeId) {
  const parsed = jpoParseQueueNodeId(nodeId);
  if (!parsed || jpoIsNodeRunning(nodeId)) return;
  jpoState.selectedCaseId = parsed.caseId;
  const row = jpoSelectedBoardCase();
  const index = row ? jpoQueueNodesForCase(row).findIndex((node) => node.id === nodeId) : -1;
  if (index >= 0) jpoState.workMapFocusIndex = index;
  jpoState.nodeRuntime = { nodeId, status: "running" };
  jpoShowKeyOverlay("Enter 실행", `${jpoAgentDisplayName(parsed.agentId)} 실행`);
  jpoSetPendingScroll(`[data-jpo-node="${nodeId}"]`);
  if (jpoNodeRuntimeTimer) window.clearTimeout(jpoNodeRuntimeTimer);
  if (typeof render === "function") render();
  jpoNodeRuntimeTimer = window.setTimeout(() => {
    const result = runJeonseProtectionQueueNode(parsed.caseId, nodeId);
    jpoState.nodeRuntime = null;
    jpoState.contextSubject = { kind: "case", id: parsed.caseId };
    jpoInvalidateCounts();
    if (result && typeof notify === "function") {
      const file = result.deliverable?.fileName || "실행 기록";
      notify(`${file} 생성 · 감사 기록 저장`);
    }
    if (typeof render === "function") render();
  }, 680);
}

function jpoExecuteFocusedQueueNode() {
  const row = jpoSelectedBoardCase();
  const node = row ? jpoFocusedNode(row) : null;
  if (node) jpoExecuteQueueNode(node.id);
}

function jpoHandleKeyboard(event) {
  if (!jpoModeActive() || jpoState.view !== "board" || event.metaKey || event.ctrlKey || event.altKey) return;
  const target = event.target;
  if (target && (target.closest("input, textarea, select, button") || target.isContentEditable)) return;
  if (/^[1-9]$/.test(event.key)) {
    const id = (jpoState.boardOrder || [])[Number(event.key) - 1];
    if (id) {
      event.preventDefault();
      jpoSelectBoardCase(id, `${event.key} 선택`);
    }
    return;
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    jpoMoveBoardSelection(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    jpoMoveBoardSelection(1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    jpoMoveQueueFocus(-1, "↑ 큐 이동");
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    jpoMoveQueueFocus(1, "↓ 큐 이동");
  } else if (event.key === " ") {
    event.preventDefault();
    jpoMoveQueueFocus(1, "Space 다음");
  } else if (event.key === "Enter") {
    event.preventDefault();
    jpoExecuteFocusedQueueNode();
  }
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
    if (!jpoKeyboardBound) {
      jpoKeyboardBound = true;
      window.addEventListener("keydown", jpoHandleKeyboard);
    }
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
  document.querySelectorAll("[data-jpo-board-case]").forEach((card) => {
    card.addEventListener("click", () => jpoSelectBoardCase(card.dataset.jpoBoardCase, "카드 선택"));
  });
  document.querySelectorAll("[data-jpo-run-node]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      jpoExecuteQueueNode(button.dataset.jpoRunNode);
    });
  });
  document.querySelectorAll("[data-jpo-capability]").forEach((card) => {
    card.addEventListener("click", () => {
      jpoState.contextSubject = { kind: "capability", id: card.dataset.jpoCapability };
      jpoState.detail = null;
      render();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      card.click();
    });
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
        const title = found.title || `${jpoIntakeTypeLabel(found.intakeType)} · ${found.addressMasked}`;
        if (typeof notify === "function") notify(`${found.caseNo} · ${title} — ${jpoStatusLabel(found.status)} · 담당 ${jpoUserName(found.assignedToId)} (모의)`);
        jpoGo("cases", { kind: "case", id: found.id });
      }
    });
  });
  document.querySelectorAll("[data-jpo-open-detail]").forEach((row) => {
    row.addEventListener("click", () => {
      const [kind, id] = String(row.dataset.jpoOpenDetail || "").split(":");
      if (!kind || !id) return;
      jpoState.detail = { kind, id };
      jpoState.contextSubject = { kind, id };
      if (kind === "case") jpoState.selectedCaseId = id;
      render();
    });
    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      row.click();
    });
  });
  document.querySelectorAll("[data-jpo-open-approval]").forEach((row) => {
    row.addEventListener("click", () => { jpoState.detail = { kind: "approval", id: row.dataset.jpoOpenApproval }; render(); });
  });
  document.querySelectorAll("[data-jpo-clear-detail]").forEach((button) => {
    button.addEventListener("click", () => { jpoState.detail = null; render(); });
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
      jpoState.enrich = { status: "loading", caseId: target.id, message: `${target.caseNo} 실거래 조회 중...` };
      render();
      enrichJeonseCase(target.id)
        .then((result) => {
          jpoState.enrich = {
            status: result.market.sourceMode,
            caseId: target.id,
            message: `${target.caseNo} 보강 완료 — ${JPO_SOURCE_MODES[result.market.sourceMode]} · 위험도 ${JPO_RISK_LABELS[result.assessment.riskLevel] || result.assessment.riskLevel}`,
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
  if (jpoModeActive()) jpoFlushPendingScroll();
}

(function () {
  const prevBind = typeof bindModuleActions === "function" ? bindModuleActions : null;
  window.bindModuleActions = function () {
    if (prevBind) prevBind();
    bindJpoActions();
  };
})();
