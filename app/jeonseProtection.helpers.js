/* 전세사기 보호 하네스 — 공용 상태/렌더 헬퍼 (v2).
   presentation은 공통 CSS 토큰(jbwc-* 클래스)을 재사용하고,
   상태·데이터 접근은 전부 JPO 전용(config/db/services)만 사용한다. */

let jpoState = {
  view: "board",
  lastRun: null,
  detail: null,
  lists: {},
  counts: null,
  countsLoading: false,
  countsError: false,
  countsAt: null,
  selfTest: null,
  roleEntered: false,
  enrich: { status: "idle", caseId: null, message: "" },
  search: { q: "", loading: false, error: false, blocked: null, results: null },
};

let jpoCaseWizard = jpoDefaultCaseWizard();

function jpoDefaultCaseWizard() {
  return {
    intakeType: "preContract",
    housingType: "rowHouse",
    contractType: "jeonse",
    lawdCode: JPO_REGION_PRESETS[0].lawdCode,
    addressMasked: "",
    buildingName: "",
    areaSize: "",
    floor: "",
    builtYear: "",
    contractStartDate: "",
    contractEndDate: "",
    depositAmount: "230000000",
    monthlyRentAmount: "0",
    customerRefId: "CUST-JS-DEMO",
    registryStatus: "unknown",
    guaranteeStatus: "unknown",
    buildingCheckStatus: "unknown",
    seniorLienEntered: false,
    auctionNoticed: false,
    auctionDeadline: "",
    docsReady: false,
    priority: "normal",
    dueAt: "",
    sourceChannel: "opsPortal",
    tags: "",
    enrichedMarket: null,
    enrichStatus: "idle",
  };
}

function jpoModeActive() {
  return typeof activeView !== "undefined" && activeView === "jeonse-protection-harness";
}

function jpoIntakeTypeLabel(intakeType) {
  return (JPO_INTAKE_TYPES[intakeType] || {}).label || intakeType || "-";
}

function jpoHousingTypeLabel(housingType) {
  return (JPO_HOUSING_TYPES[housingType] || {}).label || housingType || "-";
}

function jpoStatusLabel(status) {
  return JPO_STATUS_LABELS[status] || status || "-";
}

function jpoWon(amount) {
  const value = Number(amount || 0);
  if (!value) return "-";
  if (value >= 100000000) {
    const eok = value / 100000000;
    return `${eok % 1 === 0 ? eok : eok.toFixed(1)}억`;
  }
  return `${Math.round(value / 10000).toLocaleString("ko-KR")}만원`;
}

function jpoRiskPill(risk) {
  const map = {
    low: ["낮음", "status-approved"],
    medium: ["보통", "status-pending"],
    high: ["높음", "status-escalated"],
    critical: ["심각", "status-escalated"],
    urgent: ["긴급", "status-escalated"],
    normal: ["보통", "status-pending"],
  };
  const [label, cls] = map[risk] || [risk || "-", "status-new"];
  return `<span class="status-pill ${cls}">${escapeHtml(label)}</span>`;
}

function jpoStatusPill(status) {
  const pending = [
    "received", "enriching", "riskReview", "onHold", "unknown", "manualRequired",
    "open", "inProgress", "pending", "queued", "running", "needsReview",
    "pendingApproval", "investigating", "upcoming", "degraded", "notified", "snapshot",
  ];
  const danger = ["humanReview", "overdue", "down", "error", "rejected", "critical", "fallback"];
  const ok = ["externalLinked", "guidanceDone", "verified", "linked", "guided", "completed", "closed", "resolved", "active", "healthy", "approved", "enrolled", "live_api"];
  const cls = danger.includes(status) ? "status-escalated"
    : ok.includes(status) ? "status-approved"
      : pending.includes(status) ? "status-pending" : "status-new";
  return `<span class="status-pill ${cls}" data-status="${escapeHtml(status || "-")}">${escapeHtml(jpoStatusLabel(status))}</span>`;
}

function jpoSourceModePill(sourceMode) {
  const cls = sourceMode === "live_api" ? "status-approved"
    : sourceMode === "snapshot" ? "status-pending"
      : "status-escalated";
  return `<span class="status-pill ${cls}" data-source-mode="${escapeHtml(sourceMode || "-")}">${escapeHtml(JPO_SOURCE_MODES[sourceMode] || sourceMode || "-")}</span>`;
}

function jpoMockNote() {
  return `<p class="jbwc-mock-note">※ 내부 운영 참고용 모의(mock) 데이터 — 위험 "신호"만 표시하며 전세사기 여부·법률·보증·피해자 결정을 확정하지 않습니다 · 담당자 검토 필요</p>`;
}

function jpoPanel(title, bodyHtml, metaHtml = "") {
  return `<section class="workspace-panel jbwc-panel">
    <p class="eyebrow">${escapeHtml(title)}</p>${metaHtml}${bodyHtml}</section>`;
}

function jpoCaseSignals(caseId, limit = Infinity) {
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return jpoTable("jeonse_risk_signals", JPO_ROLE_KEY)
    .filter((signal) => signal.caseId === caseId)
    .sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9))
    .slice(0, limit);
}

function jpoCaseSnapshots(caseId) {
  return jpoTable("jeonse_price_snapshots", JPO_ROLE_KEY).filter((snapshot) => snapshot.caseId === caseId);
}

function jpoCaseLatestSnapshot(caseId) {
  return jpoCaseSnapshots(caseId)
    .slice()
    .sort((a, b) => String(b.fetchedAt || "").localeCompare(String(a.fetchedAt || "")))[0] || null;
}

function jpoCaseHasPendingDocs(row) {
  return (row.docChecklist || []).some(([, state]) => ["누락", "확인 필요"].includes(state));
}

function jpoCasePriorityLabel(row) {
  if (row.auctionNoticed || row.riskLevel === "critical") return "긴급 대응";
  if (row.status === "humanReview" || row.requiresHumanReview) return "담당자 검토";
  if (row.sourceMode === "fallback" || row.status === "enriching") return "데이터 보강";
  if (row.status === "received") return "신규 확인";
  return "위험 신호 검토";
}

function jpoCasePriorityReason(row, signals = jpoCaseSignals(row.id, 2)) {
  if (signals.length) {
    const titles = signals.map((signal) => signal.title).join(" · ");
    return `위험 신호 ${signals.length}건 우선 확인: ${titles}`;
  }
  if (row.sourceMode === "fallback") return "실거래 API 미연결 상태라 담당자 확인이 필요합니다.";
  if (row.requiresHumanReview) return "하네스 정책상 사람 검토가 필요한 업무 유형입니다.";
  return "접수 정보와 공공데이터 증적을 함께 확인해야 합니다.";
}

function jpoCaseSituationLine(row) {
  const contractLine = row.contractEndDate ? `계약/만기 ${row.contractEndDate}` : "계약일 미정";
  return `${jpoIntakeTypeLabel(row.intakeType)} · ${jpoHousingTypeLabel(row.housingType)} · 보증금 ${jpoWon(row.depositAmount)} · ${contractLine}`;
}

function jpoCaseNextAction(row) {
  if (row.auctionNoticed || row.intakeType === "auctionNotice") return "경·공매 대응 후보를 열고 감독자 검토와 피해지원 연계를 확인하세요.";
  if (row.sourceMode === "fallback" || row.status === "enriching") return "시세 데이터 보강을 실행하고 fallback 근거를 담당자 확인으로 남기세요.";
  if (row.registryStatus !== "verified") return "등기부 선순위·압류·신탁 체크리스트를 먼저 확인하세요.";
  if (row.guaranteeStatus !== "verified") return "보증·HUG 확인 항목을 검토하고 확정 표현 없이 안내 후보로 정리하세요.";
  if (jpoCaseHasPendingDocs(row)) return "피해지원 신청 서류 체크리스트의 누락 항목을 확인하세요.";
  if (row.requiresHumanReview || row.status === "humanReview") return "에이전트 산출물과 감사 기록을 확인한 뒤 사람 승인/반려를 남기세요.";
  return "위험 신호, 근거 데이터, 다음 안내 후보를 순서대로 검토하세요.";
}

function jpoCaseAgentIds(row, includeIntake = false) {
  const ids = [];
  const push = (id) => { if (id && !ids.includes(id)) ids.push(id); };
  const signals = jpoCaseSignals(row.id);
  const hasSignal = (...types) => signals.some((signal) => types.includes(signal.signalType));
  if (includeIntake) push("jpo-intake");
  push(jeonseProtectionRoutingRules[row.intakeType] || "jpo-intake");
  if (
    row.sourceMode !== "live_api"
    || ["enriching", "riskReview"].includes(row.status)
    || hasSignal("JEONSE_RATIO_HIGH", "DEPOSIT_OVER_OFFICIAL_PRICE", "ABOVE_NEIGHBORHOOD_MEDIAN", "LOW_COMPARABLE_COUNT")
  ) push("jpo-price");
  if (
    row.registryStatus !== "verified"
    || hasSignal("REGISTRY_RIGHTS_UNKNOWN", "ILLEGAL_BUILDING_MANUAL_REQUIRED")
  ) push("jpo-registry");
  if (
    row.guaranteeStatus !== "verified"
    || row.intakeType === "guaranteeInquiry"
    || hasSignal("GUARANTEE_STATUS_UNKNOWN")
  ) push("jpo-guarantee");
  if (row.auctionNoticed || row.intakeType === "auctionNotice" || hasSignal("AUCTION_OR_FORECLOSURE_DEADLINE")) push("jpo-auction");
  if (["victimApplication", "depositDelay", "auctionNotice"].includes(row.intakeType) || jpoCaseHasPendingDocs(row)) push("jpo-victim");
  if (["legalConsult", "depositDelay", "auctionNotice"].includes(row.intakeType)) push("jpo-legal");
  if (row.sourceMode !== "live_api" || hasSignal("LOW_COMPARABLE_COUNT")) push("jpo-dataquality");
  if (["high", "critical"].includes(row.riskLevel) || row.status === "humanReview" || row.requiresHumanReview) push("jpo-supervisor");
  if (["humanReview", "externalLinked", "guidanceDone"].includes(row.status)) push("jpo-comms");
  return ids;
}

function jpoAgentChip(agentId) {
  return `<span class="jpo-agent-chip">${escapeHtml(jpoAgentDisplayName(agentId))}</span>`;
}

function jpoDataChip(label) {
  return `<span class="jpo-data-chip">${escapeHtml(label)}</span>`;
}

function jpoCaseDataChips(row) {
  const latest = jpoCaseLatestSnapshot(row.id);
  const registryLabel = row.registryStatus === "verified" ? "권리관계 확인 완료" : "권리관계 확인 필요";
  const guaranteeLabel = row.guaranteeStatus === "verified" ? "보증 확인 완료" : "보증·HUG 확인 필요";
  const chips = [
    JPO_SOURCE_MODES[row.sourceMode] || row.sourceMode || "데이터 상태 확인 필요",
    latest ? `유사거래 ${latest.comparableCount || 0}건` : "시세 스냅샷 확인 전",
    registryLabel,
    guaranteeLabel,
  ];
  if (jpoCaseHasPendingDocs(row)) chips.push("제출서류 누락 확인");
  if (row.auctionDeadline) chips.push(`경·공매 기한 ${row.auctionDeadline}`);
  return chips;
}

function jpoWorkNodeStatus(status) {
  const map = {
    waiting: ["대기", "jpo-node-gray"],
    ready: ["실행 가능", "jpo-node-blue"],
    running: ["실행 중", "jpo-node-yellow"],
    done: ["완료", "jpo-node-green"],
    review: ["재검토 필요", "jpo-node-red"],
    approval: ["사람 승인 필요", "jpo-node-purple"],
  };
  const [label, className] = map[status] || map.waiting;
  return { label, className };
}

function jpoCaseAgentStatus(agentId, row) {
  const runs = jpoTable("jeonse_agent_runs", JPO_ROLE_KEY)
    .filter((run) => run.caseId === row.id && run.agentId === agentId);
  const latestRun = runs[0] || null;
  const agent = jpoTable("harness_agents", JPO_ROLE_KEY).find((item) => item.id === agentId) || {};
  if (latestRun && ["queued", "running"].includes(latestRun.status)) return "running";
  if (latestRun && latestRun.status === "pendingApproval") return "approval";
  if (latestRun && latestRun.status === "needsReview") return "review";
  if (latestRun && latestRun.requiresHumanEscalation) return "approval";
  if (latestRun && ["completed", "closed", "approved"].includes(latestRun.status)) return "done";
  if (agentId === "jpo-intake") return "done";
  if (agent.status === "escalated") return "review";
  if (agent.status === "needsReview") return "approval";
  if (agentId === "jpo-supervisor" && ["high", "critical"].includes(row.riskLevel)) return "approval";
  return "ready";
}

function jpoAgentNodeInfo(agentId, row) {
  const base = {
    role: "전세보호 업무 보조",
    reason: "케이스 처리에 필요한 전용 업무 단위입니다.",
    data: "케이스, 위험 신호, 감사 기록",
    output: "내부 운영 참고용 산출물",
    action: "검토",
  };
  const map = {
    "jpo-intake": {
      role: "Case Orchestrator",
      reason: "접수 유형을 lifecycle 상태와 전용 에이전트 실행 순서로 분류합니다.",
      data: "접수 유형, 주택 유형, 보증금, 기한, 위험 신호",
      output: "초기 상태, 라우팅, handoff",
      action: "분류 확인",
    },
    "jpo-price": {
      role: "시세·유사거래 근거 산출",
      reason: "보증금이 주변 전세/매매 기준에서 과도한지 먼저 확인해야 합니다.",
      data: "실거래 스냅샷, 법정동, 면적, 보증금",
      output: "price-risk.md, 유사거래 비교, 전세가율 신호",
      action: "시세 보강",
    },
    "jpo-registry": {
      role: "권리관계 체크리스트",
      reason: "선순위 권리·압류·신탁·위반건축물 확인이 위험 판단의 핵심 근거입니다.",
      data: "등기부 확인 상태, 건축물 확인 상태, 수동 확인 항목",
      output: "registry-checklist.md, 수동 확인 항목",
      action: "권리 확인",
    },
    "jpo-guarantee": {
      role: "보증·HUG 확인 후보",
      reason: "보증 가능성은 확정하지 않고 확인 필요 항목과 공식 기준 후보만 정리해야 합니다.",
      data: "보증 상태, 주택 유형, 보증금, 위험 신호",
      output: "guarantee-check.md, HUG 확인 체크리스트",
      action: "보증 검토",
    },
    "jpo-auction": {
      role: "경·공매 기한 감시",
      reason: "기한 임박 건은 자동 종결 없이 사람 에스컬레이션으로 묶어야 합니다.",
      data: "경·공매 통지 여부, 기한, 상담 상태",
      output: "auction-action.md, 긴급 대응 후보",
      action: "기한 대응",
    },
    "jpo-victim": {
      role: "피해지원 신청 서류 정리",
      reason: "피해자 결정 신청은 대행하지 않고 요건·서류 누락을 담당자 검토용으로 정리합니다.",
      data: "제출서류 체크리스트, 접수 유형, 상담 메모",
      output: "victim-docs.md, 누락 서류 목록",
      action: "서류 확인",
    },
    "jpo-legal": {
      role: "법률지원 연계 후보",
      reason: "법률 판단은 확정하지 않고 연계 후보와 상담 필요 항목만 분리합니다.",
      data: "상담 유형, 위험 신호, 지원 연계 기록",
      output: "legal-referral.md, 기관 안내 후보",
      action: "연계 검토",
    },
    "jpo-comms": {
      role: "상담 요약·안내 초안",
      reason: "고객 공유 문안은 반드시 승인 대기 상태로 만들고 자동 발송하지 않습니다.",
      data: "상담 요약, 케이스 상태, 승인 기록",
      output: "consult-summary.md, 안내 초안",
      action: "초안 검토",
    },
    "jpo-dataquality": {
      role: "데이터 품질·증적 확인",
      reason: "snapshot/fallback/manualRequired 상태를 명확히 표시해 과확신을 막습니다.",
      data: "sourceMode, 표본 수, 커넥터 상태, 감사 로그",
      output: "source-quality.md, 데이터 품질 근거",
      action: "증적 확인",
    },
    "jpo-supervisor": {
      role: "사람 승인 게이트 추적",
      reason: "고위험·피해지원·고객 안내는 최종적으로 담당자 또는 감독자 승인 대상입니다.",
      data: "승인 대기, 감사 기록, 에이전트 실행 로그",
      output: "review-gate.md, 승인/반려 대기열",
      action: "승인 검토",
    },
  };
  return { ...base, ...(map[agentId] || {}), caseLine: jpoCaseSituationLine(row) };
}

function jpoCaseWorkNode(agentId, row, kind = "agent") {
  const status = jpoWorkNodeStatus(jpoCaseAgentStatus(agentId, row));
  const info = jpoAgentNodeInfo(agentId, row);
  return `<article class="jpo-node-card ${status.className}" data-jpo-node-kind="${escapeHtml(kind)}">
    <header class="jpo-node-head">
      <div><strong>${escapeHtml(jpoAgentDisplayName(agentId))}</strong><span>${escapeHtml(info.role)}</span></div>
      <span class="status-pill jpo-node-status-pill">${escapeHtml(status.label)}</span>
    </header>
    <p>${escapeHtml(info.reason)}</p>
    <div class="jpo-node-detail">
      <div><span>사용 데이터</span><strong>${escapeHtml(info.data)}</strong></div>
      <div><span>예상 산출물</span><strong>${escapeHtml(info.output)}</strong></div>
    </div>
    <footer><span>${escapeHtml(info.action)}</span><span>담당자 검토 필요</span></footer>
  </article>`;
}

function jpoCaseWorkMap(row) {
  const branchAgents = jpoCaseAgentIds(row, false).filter((agentId) => agentId !== "jpo-intake");
  const approvalStatus = jpoWorkNodeStatus(row.status === "guidanceDone" ? "done" : "approval");
  return `<section class="jpo-workmap" aria-label="전세보호 케이스 에이전트 업무 계층도">
    <div class="jpo-workmap-case">
      <p class="eyebrow">Case</p>
      <h4>${escapeHtml(row.caseNo)} · ${escapeHtml(jpoCasePriorityLabel(row))}</h4>
      <p>${escapeHtml(jpoCaseSituationLine(row))}</p>
    </div>
    <div class="jpo-node-connector" aria-hidden="true"></div>
    ${jpoCaseWorkNode("jpo-intake", row, "orchestrator")}
    <div class="jpo-node-connector" aria-hidden="true"></div>
    <div class="jpo-node-branches">${branchAgents.map((agentId) => jpoCaseWorkNode(agentId, row)).join("")}</div>
    <div class="jpo-node-connector" aria-hidden="true"></div>
    <article class="jpo-node-card ${approvalStatus.className}" data-jpo-node-kind="approval">
      <header class="jpo-node-head">
        <div><strong>산출물 MD · 담당자 승인</strong><span>사람 검토 게이트</span></div>
        <span class="status-pill jpo-node-status-pill">${escapeHtml(approvalStatus.label)}</span>
      </header>
      <p>각 에이전트 산출물은 내부 참고용으로만 묶이며, 법률·보증·피해자 결정·고객 안내는 담당자 승인 후에만 진행됩니다.</p>
      <div class="jpo-node-detail">
        <div><span>통합 산출물</span><strong>case-brief.md · action-plan.md · evidence-log.md</strong></div>
        <div><span>승인 액션</span><strong>열람 · 승인 · 반려 · 재실행</strong></div>
      </div>
      <footer><span>자동 종결 금지</span><span>감사 기록 유지</span></footer>
    </article>
  </section>`;
}

function jpoCaseActionButtons(row) {
  const ids = ["price-enrich", "registry-check", "guarantee-check"];
  if (row.auctionNoticed || row.intakeType === "auctionNotice") ids.push("urgent-auction");
  if (["victimApplication", "depositDelay", "auctionNotice"].includes(row.intakeType) || jpoCaseHasPendingDocs(row)) ids.push("victim-application");
  ids.push("agent-harness", "audit-logs");
  return ids.map((id) => `<button class="secondary-button" type="button" data-jpo-view="${escapeHtml(id)}">${escapeHtml(JPO_VIEWS[id])}</button>`).join("");
}

function jpoEvidenceBox(title, bodyHtml) {
  return `<article class="jpo-evidence-box"><p class="jpo-evidence-title">${escapeHtml(title)}</p>${bodyHtml}</article>`;
}

function jpoCaseDetailPanel(row) {
  const signals = jpoCaseSignals(row.id, 4);
  const latest = jpoCaseLatestSnapshot(row.id);
  const approvals = jpoTable("approvals", JPO_ROLE_KEY).filter((item) => item.caseId === row.id);
  const runs = jpoTable("jeonse_agent_runs", JPO_ROLE_KEY).filter((run) => run.caseId === row.id).slice(0, 4);
  const audits = jpoTable("jeonse_audit_logs", JPO_ROLE_KEY).filter((audit) => audit.caseId === row.id).slice(0, 4);
  return `<section class="workspace-panel jbwc-detail-panel jpo-case-detail" aria-label="전세보호 케이스 업무 상세">
    <header>
      <div><p class="eyebrow">케이스 상세 · 에이전트 업무 계층도</p><h3>${escapeHtml(row.caseNo)} · ${escapeHtml(row.title || row.addressMasked)}</h3></div>
      <button class="secondary-button" type="button" data-jpo-clear-detail>닫기</button>
    </header>
    <div class="jpo-detail-summary">
      <div>
        <span>상황</span>
        <strong>${escapeHtml(jpoCaseSituationLine(row))}</strong>
        <p>${escapeHtml(row.addressMasked)} · ${escapeHtml(row.customerRefId)} · 담당 ${escapeHtml(jpoUserName(row.assignedToId))}</p>
      </div>
      <div>
        <span>우선순위 근거</span>
        <strong>${escapeHtml(jpoCasePriorityReason(row, signals))}</strong>
        <p>${jpoRiskPill(row.riskLevel)} ${jpoStatusPill(row.status)} ${jpoSourceModePill(row.sourceMode)}</p>
      </div>
      <div>
        <span>필요 에이전트</span>
        <div class="jpo-agent-chips">${jpoCaseAgentIds(row, false).map(jpoAgentChip).join("")}</div>
      </div>
      <div>
        <span>다음 액션</span>
        <strong>${escapeHtml(jpoCaseNextAction(row))}</strong>
        <div class="jpo-detail-actions">${jpoCaseActionButtons(row)}</div>
      </div>
    </div>
    ${jpoCaseWorkMap(row)}
    <div class="jpo-evidence-grid">
      ${jpoEvidenceBox("위험 신호", signals.length ? `<ul>${signals.map((signal) => `<li><strong>${escapeHtml(signal.title)}</strong><span>${escapeHtml(signal.evidence || "근거 확인 필요")}</span></li>`).join("")}</ul>` : `<p>등록된 위험 신호 없음</p>`)}
      ${jpoEvidenceBox("근거 데이터", `<div class="jpo-data-chips">${jpoCaseDataChips(row).map(jpoDataChip).join("")}</div>${latest ? `<p>최근 시세 기준 ${escapeHtml(latest.dealYm || "-")} · 전세가율 ${escapeHtml(String(latest.jeonseRatio ?? "-"))}% · 신뢰도 ${escapeHtml(String(latest.confidence ?? "-"))}</p>` : "<p>시세 데이터 보강 전입니다.</p>"}`)}
      ${jpoEvidenceBox("실행/승인", `<p>에이전트 실행 ${runs.length}건 · 승인 기록 ${approvals.length}건</p>${approvals.length ? `<ul>${approvals.slice(0, 3).map((approval) => `<li><strong>${escapeHtml(approval.approvalType)}</strong><span>${escapeHtml(jpoStatusLabel(approval.status))}</span></li>`).join("")}</ul>` : "<p>승인 대기 기록 없음</p>"}`)}
      ${jpoEvidenceBox("감사 기록", audits.length ? `<ul>${audits.map((audit) => `<li><strong>${escapeHtml(audit.action)}</strong><span>${escapeHtml(audit.createdAt || "-")} · ${escapeHtml(jpoUserName(audit.actorId))}</span></li>`).join("")}</ul>` : "<p>감사 기록 없음</p>")}
    </div>
    <p class="jbwc-guard">실명·주민번호·전화·계좌·주소 원문 없이 익명 Ref(CUST-JS-*)와 마스킹 주소만 표시합니다. 모든 산출물은 내부 운영 참고용이며 담당자 검토가 필요합니다.</p>
  </section>`;
}

function jpoDetailSource(kind) {
  return {
    case: "jeonse_cases",
    snapshot: "jeonse_price_snapshots",
    signal: "jeonse_risk_signals",
    registry: "jeonse_registry_checks",
    guarantee: "jeonse_guarantee_checks",
    referral: "jeonse_support_referrals",
    approval: "approvals",
    agentRun: "jeonse_agent_runs",
    handoff: "agent_handoffs",
    recommendation: "ai_recommendations",
    connector: "external_connectors",
  }[kind] || null;
}

function jpoDetailTitle(kind, row) {
  if (!row) return "상세";
  if (kind === "case") return `${row.caseNo} · ${row.addressMasked}`;
  if (kind === "snapshot") return `${row.id} · 시세 스냅샷(${row.lawdCode})`;
  if (kind === "signal") return `${row.id} · ${row.title}`;
  if (kind === "registry") return `${row.id} · ${row.checkType}`;
  if (kind === "guarantee") return `${row.id} · ${row.provider}`;
  if (kind === "referral") return `${row.id} · ${row.targetAgency}`;
  if (kind === "approval") return `${row.id} · ${row.approvalType}`;
  if (kind === "agentRun") return `${row.id} · ${row.agentId}`;
  if (kind === "handoff") return `${row.id} · ${row.fromAgentId} → ${row.toAgentId}`;
  if (kind === "connector") return `${row.id} · ${row.name}`;
  if (kind === "recommendation") return row.title;
  return row.id || "상세";
}

function jpoFieldLabel(key) {
  const label = JPO_FIELD_LABELS[key];
  return label ? `${label} · ${key}` : key;
}

function jpoDetailPanel() {
  if (!jpoState.detail) return "";
  const table = jpoDetailSource(jpoState.detail.kind);
  if (!table) return "";
  const row = jpoTable(table, JPO_ROLE_KEY).find((item) => (
    item.id === jpoState.detail.id || item.caseNo === jpoState.detail.id
  ));
  if (!row) {
    return `<section class="workspace-panel jbwc-detail-panel" aria-label="전세보호 운영 상세">
      <header>
        <div><p class="eyebrow">DB 상세 · 전세보호 role scope</p><h3>상세 데이터를 찾을 수 없습니다</h3></div>
        <button class="secondary-button" type="button" data-jpo-clear-detail>닫기</button>
      </header>
      <div class="jbwc-empty">요청한 기록(${escapeHtml(jpoState.detail.id || "-")})이 현재 데모 DB에 없습니다.
        <button class="secondary-button" type="button" data-jpo-reset-db>데모 데이터 다시 채우기</button></div>
    </section>`;
  }
  if (jpoState.detail.kind === "case") return jpoCaseDetailPanel(row);
  const fields = Object.entries(row)
    .filter(([key]) => !["roleKey", "workspaceId"].includes(key))
    .map(([key, value]) => {
      const normalized = Array.isArray(value)
        ? value.map((item) => (Array.isArray(item) ? item.join(": ") : String(item))).join(", ")
        : value == null ? "-" : String(value);
      return `<div><span>${escapeHtml(jpoFieldLabel(key))}</span><strong>${escapeHtml(normalized)}</strong></div>`;
    })
    .join("");
  return `<section class="workspace-panel jbwc-detail-panel" aria-label="전세보호 운영 상세">
    <header>
      <div><p class="eyebrow">DB 상세 · 전세보호 role scope</p><h3>${escapeHtml(jpoDetailTitle(jpoState.detail.kind, row))}</h3></div>
      <button class="secondary-button" type="button" data-jpo-clear-detail>닫기</button>
    </header>
    <div class="jbwc-detail-grid">${fields}</div>
    <p class="jbwc-guard">실명·주민번호·전화·계좌·주소 원문 없이 익명 Ref(CUST-JS-*)와 마스킹 주소만 표시합니다.</p>
  </section>`;
}

function jpoListKey(cols, rows) {
  return "jpo_" + cols.join("_").replace(/\W+/g, "_") + "_" + (rows[0]?.id || "empty");
}

function jpoListState(key) {
  jpoState.lists[key] = jpoState.lists[key] || { q: "", sort: "default", page: 1 };
  return jpoState.lists[key];
}

function jpoComparable(value) {
  return value == null ? "" : String(value).toLowerCase();
}

function jpoTableView(cols, rows, rowHtml, options = {}) {
  const key = options.key || jpoListKey(cols, rows);
  const state = jpoListState(key);
  const pageSize = options.pageSize || 8;
  const searchable = (row) => Object.values(row).map((v) => v == null ? "" : String(v)).join(" ").toLowerCase();
  const q = state.q.trim().toLowerCase();
  const filtered = q ? rows.filter((row) => searchable(row).includes(q)) : rows.slice();
  const sortKey = state.sort;
  const sorted = sortKey === "default" ? filtered : filtered.sort((a, b) => jpoComparable(a[sortKey]).localeCompare(jpoComparable(b[sortKey]), "ko"));
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  state.page = Math.min(Math.max(1, state.page), totalPages);
  const paged = sorted.slice((state.page - 1) * pageSize, state.page * pageSize);
  const sortOptions = ["default", "status", "riskLevel", "priority", "dueAt", "createdAt"].map((value) => (
    `<option value="${value}" ${state.sort === value ? "selected" : ""}>${escapeHtml(JPO_SORT_LABELS[value] || value)}</option>`
  )).join("");
  const controls = `<div class="jbwc-list-controls" data-jpo-list="${escapeHtml(key)}">
    <input type="search" data-jpo-list-filter="${escapeHtml(key)}" value="${escapeHtml(state.q)}" placeholder="현재 목록 필터" />
    <select data-jpo-list-sort="${escapeHtml(key)}" aria-label="목록 정렬">${sortOptions}</select>
    <span>${escapeHtml(String(sorted.length))}/${escapeHtml(String(rows.length))}건 · ${escapeHtml(String(state.page))}/${escapeHtml(String(totalPages))}쪽</span>
    <button class="secondary-button" type="button" data-jpo-list-page="${escapeHtml(key)}" data-page-delta="-1" ${state.page <= 1 ? "disabled" : ""}>이전</button>
    <button class="secondary-button" type="button" data-jpo-list-page="${escapeHtml(key)}" data-page-delta="1" ${state.page >= totalPages ? "disabled" : ""}>다음</button>
  </div>`;
  if (!rows.length) return `${controls}<div class="jbwc-empty">표시할 데이터가 없습니다. <button class="secondary-button" type="button" data-jpo-reset-db>데모 데이터 다시 채우기</button></div>`;
  if (!paged.length) return `${controls}<div class="jbwc-empty">필터 조건에 맞는 데이터가 없습니다.</div>`;
  return `${controls}<ul class="jbwc-list">
    <li class="jbwc-row jbwc-row-head">${cols.map((c) => `<span>${escapeHtml(c)}</span>`).join("")}</li>
    ${paged.map(rowHtml).join("")}
  </ul>`;
}

function jpoHeaderBar() {
  const at = jpoState.countsAt ? new Date(jpoState.countsAt).toTimeString().slice(0, 8) : "-";
  const dataState = jpoState.countsError
    ? `<span class="jbwc-badge-warn">데이터 갱신 실패</span>`
    : `데이터 기준 ${escapeHtml(at)}`;
  const liveState = (typeof isLive === "function" && isLive())
    ? `<span class="status-pill status-approved">실거래 API 모드</span>`
    : `<span class="status-pill status-pending">샘플/스냅샷 기준</span>`;
  return `<nav class="jbwc-breadcrumb" aria-label="전세사기 보호 업무지원 포털 위치">
    <button class="secondary-button" type="button" data-jpo-back>← 전체로 돌아가기</button>
    <span>역할 &gt; <strong>전세사기 보호 업무지원 포털</strong> &gt; ${escapeHtml(JPO_VIEWS[jpoState.view] || "")}</span>
    <span class="jbwc-updated">${liveState} ${dataState} <button class="secondary-button jbwc-refresh" type="button" data-jpo-refresh>새로고침</button></span>
  </nav>`;
}

function jpoUserName(id) {
  const user = jpoTable("users", JPO_ROLE_KEY).find((item) => item.id === id);
  return user ? user.name : (id || "-");
}

function jpoAgentDisplayName(agentId) {
  const agent = jeonseProtectionAgents.find((item) => item.id === agentId);
  return agent ? agent.displayName : (agentId || "-");
}

function jpoOfficialRefNote() {
  const refs = JPO_OFFICIAL_REFERENCES.map((ref) => `${ref.label} (${ref.site})`).join(" · ");
  return `<p class="jbwc-guard">공식 근거(안내 후보): ${escapeHtml(refs)} — 법령·지원요건은 변동 가능, 최신 기준 담당자 확인 필요.</p>`;
}
