/* 기업여신 view helper/state. */

let ccrState = {
  view: "board",
  detail: null,
  lastRun: null,
  counts: null,
  countsLoading: false,
  countsError: false,
  countsAt: null,
  lists: {},
  search: { q: "", loading: false, error: false, blocked: null, results: null },
  modelRun: { status: "idle", message: "" },
  roleEntered: false,
};

let ccrCaseWizard = ccrDefaultCaseWizard();

function ccrDefaultCaseWizard() {
  return {
    domain: "workingCapital",
    productType: CCR_DOMAINS.workingCapital.productTypes[0],
    title: "신규 운전자금 운영 검토",
    description: "",
    borrowerRefId: "익명기업-DEMO",
    companyAlias: "익명 제조업 신규",
    industry: "manufacturing",
    region: "전북 전주",
    requestedAmountBand: "1억~5억",
    assignedRmId: "USR-CCR-RM-01",
    priority: "normal",
    riskLevel: "medium",
    dueAt: "",
    financialBaseMonth: "2026-05",
    docsReceived: true,
    collateralExists: false,
    guaranteeExists: false,
    requiresHumanReview: true,
    sourceChannel: "opsPortal",
    tags: "",
  };
}

function ccrModeActive() {
  return typeof activeView !== "undefined" && activeView === "corporate-credit-harness";
}

function ccrHashForView(view, caseId) {
  if (caseId) return `#${CCR_ROUTE_BASE}/cases/${encodeURIComponent(caseId)}`;
  return `#${CCR_ROUTE_BY_VIEW[view] || `${CCR_ROUTE_BASE}/board`}`;
}

function ccrRouteFromHash(hash) {
  const raw = String(hash || "").replace(/^#/, "");
  if (!raw.startsWith(CCR_ROUTE_BASE)) return null;
  const rest = raw.slice(CCR_ROUTE_BASE.length).replace(/^\//, "");
  if (!rest) return { view: "board" };
  if (rest === "cases/new") return { view: "cases-new" };
  const caseMatch = rest.match(/^cases\/([^/]+)$/);
  if (caseMatch) return { view: "cases", caseId: decodeURIComponent(caseMatch[1]) };
  const found = Object.entries(CCR_ROUTE_BY_VIEW).find(([, route]) => route === `${CCR_ROUTE_BASE}/${rest}`);
  return { view: found ? found[0] : "board" };
}

function ccrGo(view, detail) {
  ccrState.view = view;
  ccrState.detail = detail || null;
  const next = detail && detail.kind === "case" ? ccrHashForView("cases", detail.id) : ccrHashForView(view);
  if (window.location.hash !== next) window.location.hash = next;
  else if (typeof render === "function") render();
}

function ccrDomainLabel(domain) {
  return (CCR_DOMAINS[domain] || {}).label || domain || "-";
}

function ccrStatusPill(status) {
  const danger = ["escalated", "critical", "high", "overdue", "down"];
  const ok = ["completed", "closed", "active", "healthy", "connected"];
  const cls = danger.includes(status) ? "status-escalated" : ok.includes(status) ? "status-approved" : "status-pending";
  return `<span class="status-pill ${cls}">${escapeHtml(CCR_STATUS_LABELS[status] || status || "-")}</span>`;
}

function ccrRiskPill(risk) {
  return `<span class="status-pill ${["high", "critical"].includes(risk) ? "status-escalated" : risk === "low" ? "status-approved" : "status-pending"}">${escapeHtml(CCR_RISK_LABELS[risk] || risk || "-")}</span>`;
}

function ccrPanel(title, bodyHtml, metaHtml = "") {
  return `<section class="workspace-panel jbwc-panel"><p class="eyebrow">${escapeHtml(title)}</p>${metaHtml}${bodyHtml}</section>`;
}

function ccrMockNote() {
  return `<p class="jbwc-mock-note">※ 내부 운영 참고용 모의 데이터 — 실제 승인·거절·금리·한도·신용평가·금융거래 실행 없음 · 담당자 검토 필요</p>`;
}

function ccrHeaderBar() {
  const at = ccrState.countsAt ? new Date(ccrState.countsAt).toTimeString().slice(0, 8) : "-";
  return `<nav class="jbwc-breadcrumb" aria-label="기업여신 업무지원 포털 위치">
    <button class="secondary-button" type="button" data-ccr-back>← 전체로 돌아가기</button>
    <span>역할 &gt; <strong>기업여신 업무지원 포털</strong> &gt; ${escapeHtml(CCR_VIEWS[ccrState.view] || "")}</span>
    <span class="jbwc-updated"><span class="status-pill status-pending">샘플 기준</span> 데이터 기준 ${escapeHtml(at)} <button class="secondary-button jbwc-refresh" type="button" data-ccr-refresh>새로고침</button></span>
  </nav>`;
}

function ccrListKey(cols, rows) {
  return "ccr_" + cols.join("_").replace(/\W+/g, "_") + "_" + (rows[0]?.id || "empty");
}

function ccrListState(key) {
  ccrState.lists[key] = ccrState.lists[key] || { q: "", sort: "default", page: 1 };
  return ccrState.lists[key];
}

function ccrTableView(cols, rows, rowHtml, options = {}) {
  const key = options.key || ccrListKey(cols, rows);
  const state = ccrListState(key);
  const pageSize = options.pageSize || 8;
  const q = state.q.trim().toLowerCase();
  const searchable = (row) => Object.values(row).map((v) => v == null ? "" : String(v)).join(" ").toLowerCase();
  const filtered = q ? rows.filter((row) => searchable(row).includes(q)) : rows.slice();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  state.page = Math.min(Math.max(1, state.page), totalPages);
  const paged = filtered.slice((state.page - 1) * pageSize, state.page * pageSize);
  const controls = `<div class="jbwc-list-controls">
    <input type="search" data-ccr-list-filter="${escapeHtml(key)}" value="${escapeHtml(state.q)}" placeholder="현재 목록 필터" />
    <span>${escapeHtml(String(filtered.length))}/${escapeHtml(String(rows.length))}건 · ${escapeHtml(String(state.page))}/${escapeHtml(String(totalPages))}쪽</span>
    <button class="secondary-button" type="button" data-ccr-list-page="${escapeHtml(key)}" data-page-delta="-1" ${state.page <= 1 ? "disabled" : ""}>이전</button>
    <button class="secondary-button" type="button" data-ccr-list-page="${escapeHtml(key)}" data-page-delta="1" ${state.page >= totalPages ? "disabled" : ""}>다음</button>
  </div>`;
  if (!rows.length) return `${controls}<div class="jbwc-empty">표시할 데이터가 없습니다. <button class="secondary-button" type="button" data-ccr-reset-db>데모 데이터 다시 채우기</button></div>`;
  if (!paged.length) return `${controls}<div class="jbwc-empty">필터 조건에 맞는 데이터가 없습니다.</div>`;
  return `${controls}<ul class="jbwc-list"><li class="jbwc-row jbwc-row-head">${cols.map((c) => `<span>${escapeHtml(c)}</span>`).join("")}</li>${paged.map(rowHtml).join("")}</ul>`;
}

function ccrDetailPanel() {
  const detail = ccrState.detail;
  if (!detail) return "";
  const source = {
    case: "corporate_credit_cases",
    signal: "corporate_credit_risk_signals",
    memo: "corporate_credit_credit_memos",
    run: "corporate_credit_agent_runs",
    collateral: "corporate_credit_collateral_checks",
    guarantee: "corporate_credit_guarantee_checks",
  }[detail.kind] || "corporate_credit_cases";
  const row = ccrTable(source, CCR_ROLE_KEY).find((item) => item.id === detail.id || item.caseNo === detail.id);
  if (!row) return `<section class="workspace-panel jbwc-detail-panel"><header><h3>상세 데이터를 찾을 수 없습니다</h3><button class="secondary-button" type="button" data-ccr-clear-detail>닫기</button></header></section>`;
  if (detail.kind === "case") return ccrCaseDetailMarkup(row);
  const fields = Object.entries(row).filter(([key]) => !["roleKey", "workspaceId"].includes(key)).map(([key, value]) => `<div><span>${escapeHtml(CCR_FIELD_LABELS[key] || key)}</span><strong>${escapeHtml(Array.isArray(value) ? value.join(", ") : String(value ?? "-"))}</strong></div>`).join("");
  return `<section class="workspace-panel jbwc-detail-panel"><header><div><p class="eyebrow">기업여신 DB 상세</p><h3>${escapeHtml(row.title || row.id)}</h3></div><button class="secondary-button" type="button" data-ccr-clear-detail>닫기</button></header><div class="jbwc-detail-grid">${fields}</div>${ccrMockNote()}</section>`;
}

function ccrCaseDetailMarkup(row) {
  const signals = ccrTable("corporate_credit_risk_signals", CCR_ROLE_KEY).filter((x) => x.caseId === row.id);
  const memos = ccrTable("corporate_credit_credit_memos", CCR_ROLE_KEY).filter((x) => x.caseId === row.id);
  const audits = ccrTable("corporate_credit_audit_logs", CCR_ROLE_KEY).filter((x) => x.caseId === row.id).slice(0, 4);
  const evidence = ccrTable("corporate_credit_evidence_items", CCR_ROLE_KEY).filter((x) => x.caseId === row.id).slice(0, 4);
  return `<section class="workspace-panel jbwc-detail-panel" aria-label="기업여신 상세 패널">
    <header>
      <div><p class="eyebrow">상세 정보</p><h3>${escapeHtml(row.caseNo)} · ${escapeHtml(row.companyAlias)}</h3></div>
      <div>${ccrStatusPill(row.status)} ${ccrRiskPill(row.riskLevel)} <button class="secondary-button" type="button" data-ccr-clear-detail>닫기</button></div>
    </header>
    <div class="jbwc-detail-grid">
      <div><span>익명 기업</span><strong>${escapeHtml(row.borrowerRefId)}</strong></div>
      <div><span>업종/지역</span><strong>${escapeHtml(row.industry)} · ${escapeHtml(row.region)}</strong></div>
      <div><span>여신 유형</span><strong>${escapeHtml(ccrDomainLabel(row.domain))} · ${escapeHtml(row.productType)}</strong></div>
      <div><span>담당</span><strong>${escapeHtml(ccrUserName(row.assignedRmId))} · ${escapeHtml(row.assignedTeam)}</strong></div>
      <div><span>재무자료</span><strong>${escapeHtml(row.financialBaseMonth)} · ${escapeHtml(CCR_STATUS_LABELS[row.dataMode] || row.dataMode)}</strong></div>
      <div><span>서류/외부확인</span><strong>${escapeHtml(row.docsStatus)} · ${escapeHtml(row.externalStatus)}</strong></div>
    </div>
    <div class="jbwc-grid">
      <article class="jbwc-card"><header><strong>분석 결과</strong><span class="nav-count">${signals.length}</span></header>${signals.map((s) => `<p class="jbwc-meta">${ccrRiskPill(s.severity)} ${escapeHtml(s.title)}</p>`).join("") || '<p class="jbwc-meta">생성된 리스크 신호 없음</p>'}</article>
      <article class="jbwc-card"><header><strong>담당 AI 업무지원</strong><span class="nav-count">${memos.length}</span></header>${memos.map((m) => `<p class="jbwc-meta">${escapeHtml(m.title)} · ${escapeHtml(CCR_STATUS_LABELS[m.status] || m.status)}</p>`).join("") || '<p class="jbwc-meta">여신메모 초안 없음</p>'}</article>
      <article class="jbwc-card"><header><strong>근거 피드</strong><span class="nav-count">${evidence.length}</span></header>${evidence.map((e) => `<p class="jbwc-meta">${escapeHtml(e.title)} · ${escapeHtml(e.summary)}</p>`).join("") || '<p class="jbwc-meta">근거 없음</p>'}</article>
      <article class="jbwc-card"><header><strong>감사 로그</strong><span class="nav-count">${audits.length}</span></header>${audits.map((a) => `<p class="jbwc-meta">${escapeHtml(a.action)} · ${escapeHtml(a.createdAt)}</p>`).join("") || '<p class="jbwc-meta">감사 기록 없음</p>'}</article>
    </div>
    <p class="jbwc-guard">승인·거절·금리·한도·신용평가 확정 표현은 금지됩니다. high/critical은 자동 완료할 수 없습니다.</p>
  </section>`;
}
