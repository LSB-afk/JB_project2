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
  caseTab: "overview",
  evidenceCheck: null,
  loop: { selectedCaseId: null, lastUpdated: null, dataConnectionStatus: null, agentRunStatus: null, evaluatorStatus: null, pendingHumanReviewCount: null },
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

/* ---- 담당자 업무 언어 표시 함수 — 내부 id는 저장/URL용으로 유지, 화면 표시만 변환 ---- */
function jpoCaseNoLabel(caseNo) {
  const text = String(caseNo || "");
  if (text.startsWith("JEONSE-")) return `전세위험-${text.slice("JEONSE-".length)}`;
  return text || "-";
}
function jpoCustomerLabel(ref) {
  const text = String(ref || "");
  if (text.startsWith("CUST-JS-")) return `익명 고객 ${text.slice("CUST-JS-".length)}`;
  return text || "-";
}
function jpoSnapshotLabel(id) {
  const text = String(id || "");
  if (text.startsWith("JEONSE-SNAP-")) return `시세 비교 기록 ${text.slice("JEONSE-SNAP-".length)}`;
  return text || "-";
}
function jpoRecordLabel(id) {
  const text = String(id || "");
  if (text.startsWith("JEONSE-SNAP-")) return jpoSnapshotLabel(text);
  if (text.startsWith("JEONSE-SIG-")) return `위험 신호 기록 ${text.slice("JEONSE-SIG-".length)}`;
  if (text.startsWith("JEONSE-")) return jpoCaseNoLabel(text);
  if (text.startsWith("CUST-JS-")) return jpoCustomerLabel(text);
  return text || "-";
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
  if (kind === "case") return `${jpoCaseNoLabel(row.caseNo)} · ${row.addressMasked}`;
  if (kind === "snapshot") return `${jpoSnapshotLabel(row.id)} (${row.lawdCode})`;
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
  if (jpoState.detail.kind === "case") return jpoCaseSummaryPanel(row);
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

/* ---- 케이스 6섹션 요약 패널: 기본 식별 → 분석 결과 → 담당 AI 업무지원 → 검토/승인 정책 → 근거 피드 → 감사 로그 ---- */
const JPO_AUDIT_ACTION_LABELS = {
  CASE_CREATED: "접수됨",
  CASE_SELECTED: "케이스 선택",
  DATA_FETCHED: "데이터 조회",
  DATA_ENRICHED: "데이터 보강 실행",
  DATA_FETCH_FAILED: "데이터 조회 실패 — 대체 기준 사용",
  RISK_SIGNAL_CREATED: "위험 신호 산출",
  RISK_UPDATED: "위험 신호 업데이트",
  AGENT_RUN_CREATED: "AI 실행 기록",
  EVALUATOR_CHECKED: "루프 검증 수행",
  HUMAN_REVIEW_REQUIRED: "담당자 검토 필요 기록",
  STATUS_CHANGED: "상태 변경",
  SUPPORT_REFERRAL_CREATED: "지원 연계 생성",
  JPO_APPROVAL_REQUESTED: "승인 요청",
  JPO_APPROVAL_DECIDED: "승인 결정(사람)",
  JPO_HOOK_BLOCKED_CASE_CREATE: "접수 차단(보안 훅)",
  JPO_HOOK_VIOLATION_AGENT_RUN: "자동 완료 차단(보안 훅)",
  JPO_REVIEW_PACKET_EXPORTED: "검토 패킷 내보내기",
};

function jpoPanelSection(title, bodyHtml) {
  return `<section class="jpo-panel-section"><h4>${escapeHtml(title)}</h4>${bodyHtml}</section>`;
}

function jpoCaseSummaryPanel(row) {
  const signals = jpoTable("jeonse_risk_signals", JPO_ROLE_KEY).filter((item) => item.caseId === row.id);
  const evidence = jpoTable("jeonse_evidence", JPO_ROLE_KEY).filter((item) => item.caseId === row.id).slice(0, 5);
  const audits = jpoTable("jeonse_audit_logs", JPO_ROLE_KEY)
    .filter((item) => item.caseId === row.id || item.targetId === row.id).slice(0, 6);
  const runsByAgent = {};
  jpoTable("jeonse_agent_runs", JPO_ROLE_KEY).forEach((run) => {
    if (run.caseId === row.id && !runsByAgent[run.agentId]) runsByAgent[run.agentId] = run;
  });
  const supportAgents = [
    ["jpo-price", "시세 비교 Agent"],
    ["jpo-registry", "권리관계 체크 Agent"],
    ["jpo-guarantee", "보증/HUG 체크 Agent"],
    ["jpo-victim", "피해지원 안내 Agent"],
    ["jpo-evaluator", "검증 Agent"],
  ];
  const reviewReasons = [];
  if (["high", "critical"].includes(row.riskLevel)) reviewReasons.push("고위험 건 — 담당자 검토 필수");
  signals.filter((item) => item.requiresHumanReview).slice(0, 2).forEach((item) => reviewReasons.push(item.title));
  if (["fallback", "snapshot"].includes(row.sourceMode)) reviewReasons.push(JPO_SOURCE_MODE_HINTS[row.sourceMode]);
  const identify = [
    ["사건번호", jpoCaseNoLabel(row.caseNo)],
    ["익명 고객 ID", jpoCustomerLabel(row.customerRefId)],
    ["주택 유형", jpoHousingTypeLabel(row.housingType)],
    ["주소 일부", row.addressMasked],
    ["보증금/월세", `${jpoWon(row.depositAmount)} / ${Number(row.monthlyRentAmount || 0) > 0 ? jpoWon(row.monthlyRentAmount) : "월세 없음"}`],
    ["계약 예정/만기일", row.contractEndDate || "미정"],
    ["담당자", jpoUserName(row.assignedToId)],
  ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value ?? "-"))}</strong></div>`).join("");
  return `<section class="workspace-panel jbwc-detail-panel jpo-case-panel" aria-label="전세 위험 케이스 상세 정보">
    <header>
      <div><p class="eyebrow">상세 정보</p>
        <h3>${escapeHtml(jpoCaseNoLabel(row.caseNo))} · ${escapeHtml(row.addressMasked)} ${escapeHtml(jpoHousingTypeLabel(row.housingType))}</h3>
        <p class="jbwc-meta">${jpoRiskPill(row.riskLevel)} ${jpoStatusPill(row.status)} ${jpoSourceModePill(row.sourceMode)}</p></div>
      <div class="jpo-panel-actions">
        <button class="primary-button" type="button" data-jpo-open-full="${escapeHtml(row.id)}">상세 페이지 열기</button>
        <button class="secondary-button" type="button" data-jpo-clear-detail>닫기</button>
      </div>
    </header>
    ${jpoPanelSection("1. 기본 식별", `<div class="jbwc-detail-grid">${identify}</div>`)}
    ${jpoPanelSection("2. 분석 결과", `
      <div class="jbwc-detail-grid">
        <div><span>위험도</span><strong>${escapeHtml(JPO_RISK_LABELS[row.riskLevel] || row.riskLevel)}</strong></div>
        <div><span>데이터 연계 상태</span><strong>${escapeHtml(JPO_SOURCE_MODES[row.sourceMode] || row.sourceMode)}</strong></div>
      </div>
      <p class="jbwc-meta">담당자 검토 필요 사유: ${escapeHtml(reviewReasons.join(" · ") || "일반 검토 절차")}</p>
      <ul class="jbwc-list">${signals.slice(0, 3).map((item) => `<li class="jbwc-row"><span>${jpoRiskPill(item.severity)} ${escapeHtml(item.title)}</span><span class="jbwc-row-note">${escapeHtml(item.evidence || "")}</span></li>`).join("") || '<li class="jbwc-row"><span>표시할 위험 신호 없음</span></li>'}</ul>
      <p class="jbwc-guard">위 결과는 위험 "신호"이며 전세사기 여부에 대한 확정 판정이 아닙니다.</p>`)}
    ${jpoPanelSection("3. 담당 AI 업무지원", `<ul class="jbwc-list">${supportAgents.map(([agentId, label]) => {
      const run = runsByAgent[agentId];
      return `<li class="jbwc-row"><span>${escapeHtml(label)}</span>
        <span>${run ? jpoStatusPill(run.status) : '<span class="status-pill status-new">대기</span>'}</span>
        <span class="jbwc-row-note">${escapeHtml(run ? run.outputSummary : "실행 이력 없음")}</span><span></span></li>`;
    }).join("")}</ul>`)}
    ${jpoPanelSection("4. 검토/승인 정책", `<ul class="jbwc-list">
      <li class="jbwc-row"><span>법률 판단에 대한 확정 금지</span></li>
      <li class="jbwc-row"><span>보증 가능 여부에 대한 확정 금지</span></li>
      <li class="jbwc-row"><span>피해자 결정 여부에 대한 확정 금지</span></li>
      <li class="jbwc-row"><span>high/critical 자동 종결 금지</span></li>
      <li class="jbwc-row"><span>담당자 검토 필수 · 모든 AI output은 내부 운영 참고용</span></li></ul>`)}
    ${jpoPanelSection("5. 근거 피드", `<ul class="jbwc-list">${evidence.map((item) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(item.createdAt)}</span>
        <span>${escapeHtml(item.title)}<br><span class="jbwc-row-note">${escapeHtml(item.detail || "")}</span></span>
        <span class="jbwc-row-note">${escapeHtml(item.source || "-")}</span><span></span></li>`).join("") || '<li class="jbwc-row"><span>근거 기록 없음 — 데이터 보강 실행 필요</span></li>'}</ul>`)}
    ${jpoPanelSection("6. 감사 로그", `<ul class="jbwc-list">${audits.map((item) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(item.createdAt)}</span>
        <span>${escapeHtml(JPO_AUDIT_ACTION_LABELS[item.action] || item.action)}</span>
        <span>${item.reviewRequired ? '<span class="status-pill status-escalated">검토 필요</span>' : '<span class="status-pill status-approved">기록됨</span>'}</span><span></span></li>`).join("") || '<li class="jbwc-row"><span>감사 기록 없음</span></li>'}</ul>`)}
    <p class="jbwc-guard">실명·주민번호·전화·계좌·주소 원문 없이 익명 표시명과 마스킹 주소만 표시합니다.</p>
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
    : `<span class="status-pill status-pending">실시간 API 미연결 · 저장 기준 사용</span>`;
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
