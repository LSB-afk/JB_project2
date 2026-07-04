/* RM view helper/state — 공통 CSS 토큰(jbwc-, jpo-)만 재사용하고 business 로직은 rmOfficer 전용.
   키보드 퍼스트: 숫자키=케이스 선택, 방향키=에이전트 이동, Enter=승인/실행. 현재 선택 상태를 항상 표시. */

let rmoState = {
  view: "board",
  detail: null,
  counts: null,
  countsLoading: false,
  countsError: false,
  countsAt: null,
  lists: {},
  search: { q: "", loading: false, error: false, blocked: null, results: null },
  boardFilter: "todo",
  boardOrder: [],
  /* 업무 계층도(Agent Work Map) 키보드 상태 — ↑↓로 노드 이동, Space로 다음 스텝, D로 상세 펼치기 */
  workMapFocusIndex: 0,
  workMapNodeOrder: [],
  workMapExpandedNodeId: null,
  pendingScrollTarget: null,
  infoCaseId: null,
  keyOverlay: null,
  contextItem: null,
  mdTab: "통합본",
  mdViewMode: "summary",
  modal: null,
  lastRun: null,
  modelRun: { status: "idle", message: "" },
  keyboardBound: false,
  roleEntered: false,
};

let rmoCaseWizard = rmoDefaultCaseWizard();

function rmoDefaultCaseWizard() {
  return {
    caseType: "policyStartup",
    caseNo: "",
    customerAlias: "익명 고객",
    bank: "전북은행",
    region: "전북 전주시",
    theme: "정책·창업 금융 상담",
    situation: "",
    riskLevel: "medium",
    requestedAmountBand: "3천만원 이하",
    assignedRmId: "USR-RMO-04",
    receivedAt: "",
    dueAt: "",
    uploadedFileName: "",
    uploadedFileSummary: "",
    requiresHumanReview: false,
  };
}

function rmoModeActive() {
  return typeof activeView !== "undefined" && activeView === "rm-officer-harness";
}

function rmoHashForView(view, caseId) {
  if (caseId) return `#${RMO_ROUTE_BASE}/cases/${encodeURIComponent(caseId)}`;
  return `#${RMO_ROUTE_BY_VIEW[view] || `${RMO_ROUTE_BASE}/board`}`;
}

function rmoRouteFromHash(hash) {
  const raw = String(hash || "").replace(/^#/, "");
  if (!raw.startsWith(RMO_ROUTE_BASE)) return null;
  const rest = raw.slice(RMO_ROUTE_BASE.length).replace(/^\//, "");
  if (!rest) return { view: "board" };
  if (rest === "cases/new") return { view: "cases-new" };
  const caseMatch = rest.match(/^cases\/([^/]+)$/);
  if (caseMatch) return { view: "board", caseId: decodeURIComponent(caseMatch[1]) };
  const found = Object.entries(RMO_ROUTE_BY_VIEW).find(([, route]) => route === `${RMO_ROUTE_BASE}/${rest}`);
  return { view: found ? found[0] : "board" };
}

function rmoGo(view, detail) {
  rmoState.view = view;
  rmoState.detail = detail || null;
  if (detail && detail.kind === "case") { rmoState.workMapFocusIndex = -1; rmoState.workMapExpandedNodeId = null; }
  const next = detail && detail.kind === "case" ? rmoHashForView("cases", detail.id) : rmoHashForView(view);
  if (window.location.hash !== next) window.location.hash = next;
  else if (typeof render === "function") render();
}

function rmoCaseTypeLabel(type) {
  return (RMO_CASE_TYPES[type] || {}).label || type || "-";
}

/* 케이스 카드 "다음 액션" — 현재 상태에서 담당자가 다음으로 눌러야 할 것을 한 문장으로 도출한다. */
function rmoNextActionText(caseRow) {
  if (caseRow.status === "completed") return "완료 — 추가 조치 없음";
  const assignments = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY).filter((a) => a.caseId === caseRow.id).sort((a, b) => (a.order || 0) - (b.order || 0));
  const report = assignments.find((a) => a.kind === "report");
  if (report && rmoNodeStatus(report.status) === "needsApproval") return "직원 최종 승인 대기(A)";
  const running = assignments.find((a) => rmoNodeStatus(a.status) === "running");
  if (running) return `${rmoAgentDisplayName(running.agentId)} 실행 중`;
  const ready = assignments.find((a) => rmoNodeStatus(a.status) === "ready");
  if (ready) return `${rmoAgentDisplayName(ready.agentId)} 승인 대기(Enter)`;
  if (report && rmoNodeStatus(report.status) === "completed") return "통합 리포트 확인";
  return "분석 대기";
}

/* 산출물 유형 분류 — 통합본·개별본·검토본(최종 보고서 노드)·실행계획(rmo-action) 4종, 구현현황 기준 */
function rmoDeliverableDocType(d) {
  if (d.kind === "integrated") return "통합본";
  if (d.agentId === "rmo-action") return "실행계획";
  if (["rmo-biz-report", "rmo-fraud-report", "rmo-agri-report"].includes(d.agentId)) return "검토본";
  return "개별본";
}

function rmoDeliverableDocTypeClass(d) {
  const type = rmoDeliverableDocType(d);
  if (type === "통합본") return "status-new";
  if (type === "검토본") return "status-pending";
  if (type === "실행계획") return "status-approved";
  return "status-escalated";
}

function rmoStagePill(stage) {
  const cls = stage === "done" ? "status-approved" : stage === "doing" ? "status-pending" : "status-new";
  return `<span class="status-pill ${cls}">${escapeHtml(RMO_STAGE_SHORT[stage] || stage || "-")}</span>`;
}

function rmoStatusPill(status) {
  const danger = ["escalated", "critical", "high", "overdue", "down", "needsReview"];
  const ok = ["completed", "closed", "active", "healthy", "connected", "approved"];
  const cls = danger.includes(status) ? "status-escalated" : ok.includes(status) ? "status-approved" : "status-pending";
  return `<span class="status-pill ${cls}">${escapeHtml(RMO_STATUS_LABELS[status] || status || "-")}</span>`;
}

function rmoRiskPill(risk) {
  return `<span class="status-pill ${["high", "critical"].includes(risk) ? "status-escalated" : risk === "low" ? "status-approved" : "status-pending"}">${escapeHtml(RMO_RISK_LABELS[risk] || risk || "-")}</span>`;
}

function rmoPriorityPill(priority) {
  return `<span class="status-pill ${["urgent", "high"].includes(priority) ? "status-escalated" : priority === "low" ? "status-approved" : "status-pending"}">${escapeHtml(RMO_PRIORITY_LABELS[priority] || priority || "-")}</span>`;
}

function rmoPanel(title, bodyHtml, metaHtml = "") {
  return `<section class="workspace-panel jbwc-panel"><p class="eyebrow">${escapeHtml(title)}</p>${metaHtml}${bodyHtml}</section>`;
}

function rmoMockNote() {
  return `<p class="jbwc-mock-note">※ 내부 업무 참고용 모의 데이터 — 실제 승인·거절·금리·한도·신용평가·정책자금 대상 확정·금융거래 실행 없음 · 담당자 검토 필요</p>`;
}

function rmoHeaderBar() {
  const at = rmoState.countsAt ? new Date(rmoState.countsAt).toTimeString().slice(0, 8) : "-";
  return `<nav class="jbwc-breadcrumb" aria-label="RM 업무지원 포털 위치">
    <button class="secondary-button" type="button" data-rmo-back>← 전체로 돌아가기</button>
    <span>역할 &gt; <strong>RM 업무지원 포털</strong> &gt; ${escapeHtml(RMO_VIEWS[rmoState.view] || "")}</span>
    <span class="jbwc-updated"><span class="status-pill status-pending">샘플 기준</span> 데이터 기준 ${escapeHtml(at)} <button class="secondary-button jbwc-refresh" type="button" data-rmo-refresh>새로고침</button></span>
  </nav>`;
}

function rmoListKey(cols, rows) {
  return "rmo_" + cols.join("_").replace(/\W+/g, "_") + "_" + (rows[0]?.id || "empty");
}

function rmoListState(key) {
  rmoState.lists[key] = rmoState.lists[key] || { q: "", sort: "default", page: 1 };
  return rmoState.lists[key];
}

function rmoTableView(cols, rows, rowHtml, options = {}) {
  const key = options.key || rmoListKey(cols, rows);
  const state = rmoListState(key);
  const pageSize = options.pageSize || 8;
  const q = state.q.trim().toLowerCase();
  const searchable = (row) => Object.values(row).map((v) => v == null ? "" : String(v)).join(" ").toLowerCase();
  const filtered = q ? rows.filter((row) => searchable(row).includes(q)) : rows.slice();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  state.page = Math.min(Math.max(1, state.page), totalPages);
  const paged = filtered.slice((state.page - 1) * pageSize, state.page * pageSize);
  const controls = `<div class="jbwc-list-controls">
    <input type="search" data-rmo-list-filter="${escapeHtml(key)}" value="${escapeHtml(state.q)}" placeholder="현재 목록 필터" />
    <span>${escapeHtml(String(filtered.length))}/${escapeHtml(String(rows.length))}건 · ${escapeHtml(String(state.page))}/${escapeHtml(String(totalPages))}쪽</span>
    <button class="secondary-button" type="button" data-rmo-list-page="${escapeHtml(key)}" data-page-delta="-1" ${state.page <= 1 ? "disabled" : ""}>이전</button>
    <button class="secondary-button" type="button" data-rmo-list-page="${escapeHtml(key)}" data-page-delta="1" ${state.page >= totalPages ? "disabled" : ""}>다음</button>
  </div>`;
  if (!rows.length) return `${controls}<div class="jbwc-empty">표시할 데이터가 없습니다. <button class="secondary-button" type="button" data-rmo-reset-db>데모 데이터 다시 채우기</button></div>`;
  if (!paged.length) return `${controls}<div class="jbwc-empty">필터 조건에 맞는 데이터가 없습니다.</div>`;
  return `${controls}<ul class="jbwc-list"><li class="jbwc-row jbwc-row-head">${cols.map((c) => `<span>${escapeHtml(c)}</span>`).join("")}</li>${paged.map(rowHtml).join("")}</ul>`;
}

/* 통합/개별 md 링크 내 [[파일명]] → 클릭 이동 버튼(옵시디언식) */
function rmoLinkify(text) {
  return escapeHtml(text).replace(/\[\[([^\]]+)\]\]/g, (match, fileName) => `<button type="button" class="rmo-md-link" data-rmo-open-md="${escapeHtml(fileName)}">${escapeHtml(fileName)}</button>`);
}

/* 저장된 md 본문을 안전하게 렌더(제목/표/리스트/인용/메타). 자체 생성 콘텐츠만 대상. */
function rmoRenderMarkdown(md) {
  const raw = String(md || "");
  let content = raw;
  let metaHtml = "";
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fm) {
    const pairs = fm[1].split("\n").filter(Boolean).map((line) => {
      const idx = line.indexOf(":");
      return idx >= 0 ? [line.slice(0, idx).trim(), line.slice(idx + 1).trim()] : [line.trim(), ""];
    });
    metaHtml = `<div class="rmo-md-meta">${pairs.map(([k, v]) => `<span><b>${escapeHtml(k)}</b> ${escapeHtml(v)}</span>`).join("")}</div>`;
    content = raw.slice(fm[0].length);
  }
  const lines = content.split("\n");
  let html = "";
  let tableRows = [];
  const flushTable = () => {
    if (!tableRows.length) return;
    const header = tableRows[0];
    const body = tableRows.slice(2);
    html += `<table class="rmo-md-table"><thead><tr>${header.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    tableRows = [];
  };
  lines.forEach((line) => {
    const t = line.trim();
    if (t.startsWith("|")) { tableRows.push(t.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim())); return; }
    flushTable();
    if (!t || t === "---") return;
    if (t.startsWith("### ")) html += `<h4>${escapeHtml(t.slice(4))}</h4>`;
    else if (t.startsWith("## ")) html += `<h3>${escapeHtml(t.slice(3))}</h3>`;
    else if (t.startsWith("# ")) html += `<h2>${escapeHtml(t.slice(2))}</h2>`;
    else if (t.startsWith("> ")) html += `<blockquote>${rmoLinkify(t.slice(2))}</blockquote>`;
    else if (t.startsWith("- ")) html += `<div class="rmo-md-li">• ${rmoLinkify(t.slice(2))}</div>`;
    else html += `<p>${rmoLinkify(t)}</p>`;
  });
  flushTable();
  return metaHtml + html;
}

function rmoRenderMarkdownSections(md) {
  const raw = String(md || "");
  let content = raw;
  let metaHtml = "";
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fm) {
    metaHtml = rmoRenderMarkdown(fm[0]);
    content = raw.slice(fm[0].length);
  }
  const firstSectionIdx = content.search(/^##\s+/m);
  if (firstSectionIdx < 0) return metaHtml + rmoRenderMarkdown(content);
  const intro = content.slice(0, firstSectionIdx).trim();
  const sectionText = content.slice(firstSectionIdx).trim();
  const sections = sectionText.split(/\n(?=##\s+)/g).filter((part) => part.trim());
  const introHtml = intro ? `<section class="rmo-md-section-card rmo-md-section-intro">
    <span class="rmo-md-section-kicker">문서 개요</span>
    ${rmoRenderMarkdown(intro)}
  </section>` : "";
  const sectionHtml = sections.map((part, index) => {
    const title = (part.match(/^##\s+(.+)$/m) || [null, `본문 ${index + 1}`])[1];
    return `<section class="rmo-md-section-card">
      <span class="rmo-md-section-kicker">${escapeHtml(index === 0 ? "Summary" : "본문 섹션")}</span>
      <div class="rmo-md-section-title">${escapeHtml(title)}</div>
      <div class="rmo-md-section-content">${rmoRenderMarkdown(part)}</div>
    </section>`;
  }).join("");
  return metaHtml + `<div class="rmo-md-section-stack">${introHtml}${sectionHtml}</div>`;
}

function rmoInvalidateCounts() {
  rmoState.counts = null;
  rmoState.countsAt = null;
  rmoState.countsError = false;
}

function rmoEnsureCounts() {
  if (rmoState.counts || rmoState.countsLoading) return;
  rmoState.countsLoading = true;
  getRmOfficerSidebarCountsAsync()
    .then((counts) => { rmoState.counts = counts; rmoState.countsError = false; rmoState.countsAt = Date.now(); })
    .catch(() => { rmoState.countsError = true; })
    .then(() => {
      rmoState.countsLoading = false;
      if (rmoModeActive()) { if (typeof render === "function") render(); else rmoRenderNav(); }
    });
}
