/* ============================================================
   JB우리캐피탈 운영 포털 — 공용 상태/렌더 헬퍼
   - view 파일(wooricap.view.*.js)과 연결부(wooricap.js)가 함께 사용한다.
   - business config/registry/service는 전용 파일에서만 가져온다.
   - 실제 거래·심사·PII 없음. localStorage mock DB는 affiliateId 스코프 강제.
   ============================================================ */

let jbwcState = {
  view: "board",
  lastRun: null,
  detail: null,
  lists: {},
  counts: null,
  countsLoading: false,
  countsError: false,
  countsAt: null,
  search: { q: "", loading: false, error: false, results: null },
};

let jbwcCaseWizard = jbwcDefaultCaseWizard();

function jbwcDefaultCaseWizard() {
  const domain = "personalFinance";
  return {
    domain,
    productType: JBWC_DOMAIN_TAXONOMY[domain].products[0],
    title: "",
    description: "",
    customerRefId: "CUST-JBWC-DEMO",
    contractRefId: "CONTRACT-JBWC-DEMO",
    vehicleRefId: "",
    assignedTeam: JBWC_DOMAIN_TAXONOMY[domain].team,
    assignedToId: "",
    priority: "normal",
    riskLevel: "medium",
    dueAt: "",
    sourceChannel: "opsPortal",
    requiresHumanReview: false,
    attachmentsExist: false,
    tags: "",
  };
}

function jbwcModeActive() {
  return typeof activeView !== "undefined" && activeView === "jb-woori-capital-dashboard";
}

function jbwcDomainLabel(domain) {
  const extra = { orchestration: "오케스트레이션", metrics: "운영 지표" };
  return (JBWC_DOMAIN_TAXONOMY[domain] || {}).label || extra[domain] || domain || "-";
}

function jbwcStatusLabel(status) {
  return JBWC_STATUS_LABELS[status] || status || "-";
}

function jbwcRiskPill(risk) {
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

function jbwcStatusPill(status) {
  const pending = [
    "received", "triaged", "assigned", "waitingDocuments", "inOperationalReview",
    "pendingApproval", "pendingCustomerProtectionReview", "waitingExternalData",
    "waitingVehicleTask", "open", "inProgress", "pending", "queued", "running",
    "needsReview", "upcoming", "degraded",
  ];
  const danger = ["pendingFdsEscalation", "escalated", "overdue", "down", "error", "rejected", "critical"];
  const ok = ["completed", "closed", "resolved", "active", "enabled", "healthy"];
  const cls = danger.includes(status) ? "status-escalated"
    : ok.includes(status) ? "status-approved"
      : pending.includes(status) ? "status-pending" : "status-new";
  return `<span class="status-pill ${cls}" data-status="${escapeHtml(status || "-")}">${escapeHtml(jbwcStatusLabel(status))}</span>`;
}

function jbwcMockNote() {
  return `<p class="jbwc-mock-note">※ 내부 운영 참고용 모의(mock) 데이터 — 실제 거래·심사·고객 안내 아님</p>`;
}

function jbwcPanel(title, bodyHtml, metaHtml = "") {
  return `<section class="workspace-panel jbwc-panel">
    <p class="eyebrow">${escapeHtml(title)}</p>${metaHtml}${bodyHtml}</section>`;
}

function jbwcDetailSource(kind) {
  return {
    case: "ops_cases",
    capability: "business_capabilities",
    document: "document_cases",
    fds: "fds_alerts",
    vehicle: "vehicle_lifecycle_tasks",
    agentRun: "agent_runs",
    handoff: "agent_handoffs",
    support: "customer_support_cases",
  }[kind] || null;
}

function jbwcDetailTitle(kind, row) {
  if (!row) return "상세";
  if (kind === "case") return `${row.caseNo} · ${row.title}`;
  if (kind === "capability") return row.name;
  if (kind === "document") return `${row.id} · ${row.documentType}`;
  if (kind === "fds") return `${row.id} · ${row.alertType}`;
  if (kind === "vehicle") return `${row.id} · ${row.vehicleRefId}`;
  if (kind === "agentRun") return `${row.id} · ${row.agentId}`;
  if (kind === "handoff") return `${row.id} · ${row.fromAgentId} → ${row.toAgentId}`;
  if (kind === "support") return `${row.caseNo} · ${row.category}`;
  return row.id || "상세";
}

function jbwcFieldLabel(key) {
  const label = JBWC_FIELD_LABELS[key];
  return label ? `${label} · ${key}` : key;
}

function jbwcDetailPanel() {
  if (!jbwcState.detail) return "";
  const table = jbwcDetailSource(jbwcState.detail.kind);
  if (!table) return "";
  const row = jbwcTable(table, JBWC_AFFILIATE_ID).find((item) => (
    item.id === jbwcState.detail.id || item.caseNo === jbwcState.detail.id
  ));
  if (!row) {
    return `<section class="workspace-panel jbwc-detail-panel" aria-label="JB우리캐피탈 운영 상세">
      <header>
        <div><p class="eyebrow">DB 상세 · JB우리캐피탈 스코프</p><h3>상세 데이터를 찾을 수 없습니다</h3></div>
        <button class="secondary-button" type="button" data-jbwc-clear-detail>닫기</button>
      </header>
      <div class="jbwc-empty">요청한 기록(${escapeHtml(jbwcState.detail.id || "-")})이 현재 데모 DB에 없습니다.
        데모 데이터가 초기화되었거나 잘못된 링크일 수 있습니다.
        <button class="secondary-button" type="button" data-jbwc-reset-db>데모 데이터 다시 채우기</button></div>
    </section>`;
  }
  const fields = Object.entries(row)
    .filter(([key]) => key !== "affiliateId")
    .map(([key, value]) => {
      const normalized = Array.isArray(value) ? value.join(", ") : value == null ? "-" : String(value);
      return `<div><span>${escapeHtml(jbwcFieldLabel(key))}</span><strong>${escapeHtml(normalized)}</strong></div>`;
    })
    .join("");
  return `<section class="workspace-panel jbwc-detail-panel" aria-label="JB우리캐피탈 운영 상세">
    <header>
      <div><p class="eyebrow">DB 상세 · JB우리캐피탈 스코프</p><h3>${escapeHtml(jbwcDetailTitle(jbwcState.detail.kind, row))}</h3></div>
      <button class="secondary-button" type="button" data-jbwc-clear-detail>닫기</button>
    </header>
    <div class="jbwc-detail-grid">${fields}</div>
    <p class="jbwc-guard">실제 고객 개인정보/신용정보 원문 없이 익명 참조 ID와 운영 상태만 표시합니다.</p>
  </section>`;
}

function jbwcListKey(cols, rows) {
  return cols.join("_").replace(/\W+/g, "_") + "_" + (rows[0]?.id || "empty");
}

function jbwcListState(key) {
  jbwcState.lists[key] = jbwcState.lists[key] || { q: "", sort: "default", page: 1 };
  return jbwcState.lists[key];
}

function jbwcComparable(value) {
  return value == null ? "" : String(value).toLowerCase();
}

function jbwcTableView(cols, rows, rowHtml, options = {}) {
  const key = options.key || jbwcListKey(cols, rows);
  const state = jbwcListState(key);
  const pageSize = options.pageSize || 8;
  const searchable = (row) => Object.values(row).map((v) => v == null ? "" : String(v)).join(" ").toLowerCase();
  const q = state.q.trim().toLowerCase();
  const filtered = q ? rows.filter((row) => searchable(row).includes(q)) : rows.slice();
  const sortKey = state.sort;
  const sorted = sortKey === "default" ? filtered : filtered.sort((a, b) => jbwcComparable(a[sortKey]).localeCompare(jbwcComparable(b[sortKey]), "ko"));
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  state.page = Math.min(Math.max(1, state.page), totalPages);
  const paged = sorted.slice((state.page - 1) * pageSize, state.page * pageSize);
  const sortOptions = ["default", "status", "riskLevel", "priority", "dueAt", "createdAt"].map((value) => (
    `<option value="${value}" ${state.sort === value ? "selected" : ""}>${escapeHtml(JBWC_SORT_LABELS[value] || value)}</option>`
  )).join("");
  const controls = `<div class="jbwc-list-controls" data-jbwc-list="${escapeHtml(key)}">
    <input type="search" data-jbwc-list-filter="${escapeHtml(key)}" value="${escapeHtml(state.q)}" placeholder="현재 목록 필터" />
    <select data-jbwc-list-sort="${escapeHtml(key)}" aria-label="목록 정렬">${sortOptions}</select>
    <span>${escapeHtml(String(sorted.length))}/${escapeHtml(String(rows.length))}건 · ${escapeHtml(String(state.page))}/${escapeHtml(String(totalPages))}쪽</span>
    <button class="secondary-button" type="button" data-jbwc-list-page="${escapeHtml(key)}" data-page-delta="-1" ${state.page <= 1 ? "disabled" : ""}>이전</button>
    <button class="secondary-button" type="button" data-jbwc-list-page="${escapeHtml(key)}" data-page-delta="1" ${state.page >= totalPages ? "disabled" : ""}>다음</button>
  </div>`;
  if (!rows.length) return `${controls}<div class="jbwc-empty">표시할 데이터가 없습니다. <button class="secondary-button" type="button" data-jbwc-reset-db>데모 데이터 다시 채우기</button></div>`;
  if (!paged.length) return `${controls}<div class="jbwc-empty">필터 조건에 맞는 데이터가 없습니다.</div>`;
  return `${controls}<ul class="jbwc-list">
    <li class="jbwc-row jbwc-row-head">${cols.map((c) => `<span>${escapeHtml(c)}</span>`).join("")}</li>
    ${paged.map(rowHtml).join("")}
  </ul>`;
}

function jbwcHeaderBar() {
  const at = jbwcState.countsAt ? new Date(jbwcState.countsAt).toTimeString().slice(0, 8) : "-";
  const dataState = jbwcState.countsError
    ? `<span class="jbwc-badge-warn">데이터 갱신 실패</span>`
    : `데이터 기준 ${escapeHtml(at)}`;
  return `<nav class="jbwc-breadcrumb" aria-label="JB우리캐피탈 운영 포털 위치">
    <button class="secondary-button" type="button" data-jbwc-back>← 전체로 돌아가기</button>
    <span>계열사 &gt; <strong>JB우리캐피탈 운영 포털</strong> &gt; ${escapeHtml(JBWC_VIEWS[jbwcState.view] || "")}</span>
    <span class="jbwc-updated">${dataState} <button class="secondary-button jbwc-refresh" type="button" data-jbwc-refresh>새로고침</button></span>
  </nav>`;
}

function jbwcUserName(id) {
  const user = jbwcTable("users", JBWC_AFFILIATE_ID).find((item) => item.id === id);
  return user ? user.name : (id || "-");
}

function jbwcAgentDisplayName(agentId) {
  const agent = jbWooriCapitalAgents.find((item) => item.id === agentId);
  return agent ? agent.displayName : (agentId || "-");
}
