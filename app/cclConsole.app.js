/* 기업여신 담당자 콘솔 — app (views + sidebar takeover + router).
   presentation은 공통 CSS 토큰(jbwc-*, jpo-board)만 재사용하고 business는 ccl 전용이다. */

let cclState = { view: "board", detail: null, counts: null, countsLoading: false, countsError: false, countsAt: null, lastRun: null, search: { q: "", results: null, loading: false } };

function cclModeActive() {
  return typeof activeView !== "undefined" && activeView === "corporate-credit-harness";
}
function cclStatusPill(status) {
  const danger = ["humanReview", "missing", "rejected", "escalated"];
  const ok = ["doneHold", "ready", "verified", "completed", "approved", "active"];
  const cls = danger.includes(status) ? "status-escalated" : ok.includes(status) ? "status-approved" : "status-pending";
  return `<span class="status-pill ${cls}" data-status="${escapeHtml(status || "-")}">${escapeHtml(CCL_STATUS_LABELS[status] || status || "-")}</span>`;
}
function cclRiskPill(risk) {
  const cls = ["high", "critical"].includes(risk) ? "status-escalated" : risk === "medium" ? "status-pending" : "status-approved";
  return `<span class="status-pill ${cls}">${escapeHtml(CCL_RISK_LABELS[risk] || risk || "-")}</span>`;
}
function cclPanel(title, body) {
  return `<section class="workspace-panel jbwc-panel"><p class="eyebrow">${escapeHtml(title)}</p>${body}</section>`;
}
function cclMockNote() {
  return `<p class="jbwc-mock-note">※ 내부 운영 참고용 모의 데이터 — 승인/거절·금리/한도·신용등급은 산출하지 않으며 결정은 항상 담당자가 합니다.</p>`;
}
function cclList(cols, rows, rowHtml) {
  if (!rows.length) return `<div class="jbwc-empty">표시할 데이터가 없습니다. <button class="secondary-button" type="button" data-ccl-reset-db>데모 데이터 다시 채우기</button></div>`;
  return `<ul class="jbwc-list"><li class="jbwc-row jbwc-row-head">${cols.map((c) => `<span>${escapeHtml(c)}</span>`).join("")}</li>${rows.map(rowHtml).join("")}</ul>`;
}
function cclUserName(id) {
  const user = cclTable("users", CCL_ROLE_KEY).find((item) => item.id === id);
  return user ? user.name : (id || "-");
}
function cclAgentName(id) {
  const agent = cclConsoleAgents.find((item) => item.id === id);
  return agent ? agent.displayName : (id || "-");
}
function cclHeaderBar() {
  const at = cclState.countsAt ? new Date(cclState.countsAt).toTimeString().slice(0, 8) : "-";
  return `<nav class="jbwc-breadcrumb" aria-label="기업여신 심사지원 포털 위치">
    <button class="secondary-button" type="button" data-ccl-back>← 전체로 돌아가기</button>
    <span>역할 &gt; <strong>기업여신 심사지원 포털</strong> &gt; ${escapeHtml(CCL_VIEWS[cclState.view] || "")}</span>
    <span class="jbwc-updated">데이터 기준 ${escapeHtml(at)} <button class="secondary-button jbwc-refresh" type="button" data-ccl-refresh>새로고침</button></span>
  </nav>`;
}
function cclDetailPanel() {
  if (!cclState.detail) return "";
  const row = cclTable("ccl_cases", CCL_ROLE_KEY).find((item) => item.id === cclState.detail.id);
  if (!row) return `<section class="workspace-panel jbwc-detail-panel"><header><div><p class="eyebrow">DB 상세 · corporate-credit scope</p><h3>상세 데이터를 찾을 수 없습니다</h3></div><button class="secondary-button" type="button" data-ccl-clear-detail>닫기</button></header></section>`;
  const fields = Object.entries(row).filter(([key]) => !["roleKey", "workspaceId"].includes(key))
    .map(([key, value]) => `<div><span>${escapeHtml(key)}</span><strong>${escapeHtml(Array.isArray(value) ? value.join(", ") : String(value ?? "-"))}</strong></div>`).join("");
  return `<section class="workspace-panel jbwc-detail-panel" aria-label="여신 케이스 상세">
    <header><div><p class="eyebrow">DB 상세 · corporate-credit scope</p><h3>${escapeHtml(row.caseNo)} · ${escapeHtml(row.title)}</h3></div>
    <button class="secondary-button" type="button" data-ccl-clear-detail>닫기</button></header>
    <div class="jbwc-detail-grid">${fields}</div>
    <p class="jbwc-guard">익명 BIZ-REF와 구간(band) 지표만 표시 — 식별정보 원문·확정 심사 결과 없음.</p></section>`;
}

function cclBoardCard(item) {
  return `<article class="jpo-card jbwc-card" data-ccl-open-case="${escapeHtml(item.id)}" role="button" tabindex="0">
    <header><strong>${escapeHtml(item.caseNo)}</strong>${cclRiskPill(item.riskLevel)}</header>
    <p class="jbwc-meta">${escapeHtml(item.bizRefId)} · ${escapeHtml(item.segment)}</p>
    <p class="jbwc-meta">${escapeHtml((CCL_LOAN_TYPES[item.loanType] || {}).label || item.loanType)} · ${escapeHtml(item.amountBand)}</p>
    <p class="jbwc-guard">서류 ${escapeHtml(CCL_STATUS_LABELS[item.docsStatus] || item.docsStatus)} · 상환 ${escapeHtml(item.repaymentBand)}</p>
    <p class="jbwc-meta">${escapeHtml(cclUserName(item.assignedToId))} · SLA ${escapeHtml(item.dueAt || "-")}</p>
  </article>`;
}

function cclCaseRows(rows) {
  return cclList(["케이스", "상품/금액대", "담당/SLA", "상태"], rows, (c) => `
    <li class="jbwc-row" data-ccl-open-case="${escapeHtml(c.id)}">
      <span class="jbwc-row-id">${escapeHtml(c.caseNo)}<br><span class="jbwc-row-note">${escapeHtml(c.title)}</span></span>
      <span>${escapeHtml((CCL_LOAN_TYPES[c.loanType] || {}).label || c.loanType)} · ${escapeHtml(c.amountBand)}</span>
      <span>${escapeHtml(cclUserName(c.assignedToId))} · ${escapeHtml(c.dueAt || "-")}</span>
      <span>${cclStatusPill(c.status)} ${cclRiskPill(c.riskLevel)}</span></li>`);
}

function cclNoteRows(kind, guard) {
  const rows = cclTable("ccl_review_notes", CCL_ROLE_KEY).filter((x) => x.kind === kind);
  return cclList(["항목", "요약", "관련 건", "상태"], rows, (x) => `
    <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
      <span>${escapeHtml(x.title)}<br><span class="jbwc-row-note">${escapeHtml(x.summary)}</span></span>
      <span>${escapeHtml(x.caseId || "-")}</span>
      <span>${cclStatusPill(x.status)}${x.severity ? " " + cclRiskPill(x.severity) : ""}</span></li>`)
    + `<p class="jbwc-guard">${escapeHtml(guard)}</p>`;
}

const cclViewRenderers = {
  board() {
    const cases = cclTable("ccl_cases", CCL_ROLE_KEY);
    const columns = CCL_BOARD_COLUMNS.map(([status, label]) => {
      const items = cases.filter((item) => item.status === status);
      return `<section class="jpo-board-column" data-board-column="${escapeHtml(status)}">
        <header class="jpo-board-head"><strong>${escapeHtml(label)}</strong><span class="nav-count">${items.length}</span></header>
        <div class="jpo-board-cards">${items.map(cclBoardCard).join("") || '<div class="jbwc-empty">없음</div>'}</div></section>`;
    }).join("");
    return `<section class="jbwc-hero jpo-hero-slim">
        <p class="eyebrow">역할 전용 콘솔 · 기업여신·소상공인 대출 검토</p>
        <h2>기업여신 심사지원 포털</h2>
        <p>AI는 재무 요약·상환 체크·서류 확인·품의 초안까지만 만들고, 승인·거절·금리·한도는 항상 담당자가 결정합니다.</p>
      </section>
      ${cclPanel(`여신 검토 보드 (활성 ${cases.filter(cclActiveCase).length}건)`, `<div class="jpo-board" style="grid-template-columns: repeat(6, minmax(210px, 1fr));">${columns}</div>`)}
      ${cclMockNote()}`;
  },
  cases() { return cclPanel(`여신 케이스 (${cclTable("ccl_cases", CCL_ROLE_KEY).length})`, cclCaseRows(cclTable("ccl_cases", CCL_ROLE_KEY))) + cclMockNote(); },
  "cases-new"() {
    const options = Object.entries(CCL_LOAN_TYPES).map(([value, cfg]) => `<option value="${value}">${escapeHtml(cfg.label)}</option>`).join("");
    return cclPanel("신규 여신 검토 건 접수", `
      <form id="ccl-new-case-form" class="jbwc-wizard">
        <section class="jbwc-step"><h3>1단계. 상품/유형</h3>
          <label>여신 유형<select name="loanType">${options}</select></label></section>
        <section class="jbwc-step"><h3>2단계. 사업자 정보(익명)</h3>
          <div class="jbwc-form-grid">
            <label>제목<input name="title" placeholder="예: 전주 카페 운영자 운전자금 검토" /></label>
            <label>익명 사업자 Ref<input name="bizRefId" placeholder="BIZ-REF-0000" /></label>
            <label>지역·업종<input name="segment" placeholder="예: 전북 전주 · 카페 (실명 입력 금지)" /></label>
            <label>요청 금액대<select name="amountBand"><option>5천만 미만</option><option>5천만~1억</option><option>1억~3억</option><option>3억 이상</option></select></label>
            <label>위험도<select name="riskLevel"><option value="low">낮음</option><option value="medium" selected>보통</option><option value="high">높음</option></select></label>
            <label>서류 상태<select name="docsStatus"><option value="missing">누락 있음</option><option value="ready">구비</option></select></label>
            <label>처리 기한<input name="dueAt" type="date" /></label>
          </div></section>
        <section class="jbwc-step"><h3>3단계. 저장</h3>
          <p class="jbwc-guard">ccl_cases·서류 체크·감사 기록·에이전트 실행이 저장되며, 사람 검토 필요 건은 승인 대기로 등록됩니다.</p>
          <footer><button class="primary-button" type="submit">여신 검토 건 접수</button></footer></section>
      </form>`) + cclMockNote();
  },
  "doc-check"() {
    const rows = cclTable("ccl_doc_checks", CCL_ROLE_KEY);
    return cclPanel(`서류 누락 확인 (누락 ${rows.filter((x) => x.status === "missing").length})`, cclList(["서류", "메모", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.docName)}<br><span class="jbwc-row-note">${escapeHtml(x.note || "-")}</span></span>
        <span>${escapeHtml(x.caseId)} · 기한 ${escapeHtml(x.dueAt || "-")}</span>
        <span>${cclStatusPill(x.status)}</span></li>`)) + cclMockNote();
  },
  "approval-drafts"() {
    const drafts = cclTable("ccl_memo_drafts", CCL_ROLE_KEY);
    const approvals = cclTable("approvals", CCL_ROLE_KEY).filter((x) => x.status === "pending");
    return cclPanel(`품의 초안 (${drafts.length})`, cclList(["초안", "요약", "관련 건", "상태"], drafts, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.title)}<br><span class="jbwc-row-note">${escapeHtml(x.summary)}</span></span>
        <span>${escapeHtml(x.caseId)}</span><span>${cclStatusPill(x.status)}</span></li>`))
      + cclPanel(`승인 대기 (${approvals.length})`, cclList(["승인 건", "유형", "요청→승인자", "상태"], approvals, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.approvalType)}<br><span class="jbwc-row-note">${escapeHtml(x.caseId || "-")}</span></span>
        <span>${escapeHtml(cclAgentName(x.requestedById) || x.requestedById)} → ${escapeHtml(cclUserName(x.approverId))}</span>
        <span>${cclStatusPill(x.status)} <button class="secondary-button" type="button" data-ccl-approve="${escapeHtml(x.id)}">승인</button></span></li>`))
      + `<p class="jbwc-guard">결재·승인 주체는 항상 사람입니다 — AI는 초안과 근거만 구성합니다.</p>` + cclMockNote();
  },
  "financial-summary"() { return cclPanel("재무자료 요약", cclNoteRows("financial", "재무 지표는 구간(band) 요약만 — 건전성 확정 평가 금지.")) + cclMockNote(); },
  "repayment-check"() { return cclPanel("상환능력 체크", cclNoteRows("repayment", "상환 가능/불가를 확정하지 않습니다 — 부담 구간과 확인 항목만 표시.")) + cclMockNote(); },
  "policy-match"() { return cclPanel("정책금융 후보", cclNoteRows("policy", "정책금융·보증은 '안내 후보' — 지원 가능 여부는 담당자·기관 확인 필요.")) + cclMockNote(); },
  "early-warning"() { return cclPanel("조기경보", cclNoteRows("earlyWarning", "조기경보 신호는 자동 조치로 이어지지 않으며 사람 검토가 필수입니다.")) + cclMockNote(); },
  "consult-log"() {
    const rows = cclTable("ccl_consult_logs", CCL_ROLE_KEY);
    return cclPanel(`상담 이력 (${rows.length})`, cclList(["상담", "요약", "관련 건", "채널"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.summary)}</span><span>${escapeHtml(x.caseId)}</span>
        <span>${escapeHtml(x.channel)} · ${escapeHtml(x.createdAt)}</span></li>`)) + cclMockNote();
  },
  "reply-drafts"() {
    const rows = cclTable("ai_recommendations", CCL_ROLE_KEY).filter((x) => x.kind === "replyDraft");
    return cclPanel(`고객 회신 초안 (${rows.length})`, cclList(["초안", "에이전트", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.title)}</span>
        <span>${escapeHtml(cclAgentName(x.agentId))} · ${escapeHtml(x.caseId)}</span>
        <span>${cclStatusPill(x.status)}</span></li>`))
      + `<p class="jbwc-guard">고객 발송은 승인 대기(pendingApproval) 없이는 진행되지 않습니다.</p>` + cclMockNote();
  },
  "ai-analysis"() {
    const rows = cclTable("ai_analysis_requests", CCL_ROLE_KEY);
    return cclPanel(`AI 분석 요청 (${rows.length})`, cclList(["요청", "유형", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.requestType)}</span><span>${escapeHtml(x.caseId)}</span>
        <span>${cclStatusPill(x.status)}</span></li>`)) + cclMockNote();
  },
  "agent-harness"() {
    const agents = cclTable("harness_agents", CCL_ROLE_KEY);
    const surface = agents.filter((agent) => CCL_SURFACE_AGENT_IDS.includes(agent.id));
    const internal = agents.filter((agent) => !CCL_SURFACE_AGENT_IDS.includes(agent.id));
    const runs = cclTable("ccl_agent_runs", CCL_ROLE_KEY).slice(0, 8);
    const card = (agent) => `<article class="jbwc-card jbwc-agent-card"><header><strong>${escapeHtml(agent.name)}</strong>${cclStatusPill(agent.status)}</header>
      <p class="jbwc-meta">${escapeHtml(agent.description)}</p></article>`;
    return cclPanel(`${cclConsoleHarness.name} — 전용 라우팅`, `<p class="jbwc-guard">정책: ${cclConsoleHarness.policy.map(escapeHtml).join(" · ")}</p>`)
      + cclPanel("샘플 요청 실행 (모의)", `<div class="jbwc-samples">${cclSampleRequests.map((sample) => `<button class="secondary-button" type="button" data-ccl-sample="${escapeHtml(sample.key)}">${escapeHtml(sample.text)}</button>`).join("")}</div>
        ${cclState.lastRun ? `<div class="jbwc-lastrun"><p><strong>실행 결과</strong> <span class="status-pill ${cclState.lastRun.live ? "status-approved" : "status-new"}">${cclState.lastRun.live ? "실행·LLM" : "모의"}</span> → ${escapeHtml(cclState.lastRun.agent)} ${cclStatusPill(cclState.lastRun.status)}</p><p>${escapeHtml(cclState.lastRun.result)}${cclState.lastRun.pending ? ` <span class="jbwc-meta">(로컬 모델 생성 중...)</span>` : ""}</p><p class="jbwc-mock-note">※ 내부 운영 참고용${cclState.lastRun.human ? " · 사람 검토 대기" : ""}${cclState.lastRun.approvalPending ? " · 승인 대기" : ""}</p></div>` : ""}`)
      + cclPanel(`표면 에이전트 (${surface.length})`, `<div class="jbwc-grid">${surface.map(card).join("")}</div>`)
      + cclPanel(`내부 전문 조직 (${internal.length})`, `<details><summary class="jbwc-meta">내부 에이전트 펼치기</summary><div class="jbwc-grid">${internal.map(card).join("")}</div></details>`)
      + cclPanel(`최근 실행 (${runs.length})`, cclList(["실행", "에이전트", "입력→결과", "상태"], runs, (run) => `
        <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(run.createdAt)}<br>${escapeHtml(run.id)}</span>
          <span>${escapeHtml(cclAgentName(run.agentId))}</span>
          <span>${escapeHtml(run.inputSummary)}<br><span class="jbwc-row-note">${escapeHtml(run.outputSummary)}</span></span>
          <span>${cclStatusPill(run.status)}</span></li>`)) + cclMockNote();
  },
  "audit-logs"() {
    const rows = cclTable("ccl_audit_logs", CCL_ROLE_KEY);
    return cclPanel(`감사 기록 (${rows.length} · 검토 필요 ${rows.filter((x) => x.reviewRequired).length})`, cclList(["기록", "행위", "대상", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.createdAt)}<br>${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.action)}</span><span>${escapeHtml(x.targetType)} ${escapeHtml(x.targetId)}</span>
        <span>${x.reviewRequired ? '<span class="status-pill status-escalated">검토 필요</span>' : '<span class="status-pill status-approved">기록됨</span>'}</span></li>`)) + cclMockNote();
  },
};

function cclOpsPage() {
  let body = "";
  try { body = (cclViewRenderers[cclState.view] || cclViewRenderers.board)(); }
  catch (error) { body = `<div class="jbwc-error">데이터를 불러오지 못했습니다. <button class="secondary-button" type="button" data-ccl-reset-db>데모 데이터 초기화</button></div>`; }
  return `<div class="jbwc-shell">${cclHeaderBar()}${cclDetailPanel()}${body}</div>`;
}
function cclContextMarkup() {
  const counts = cclState.counts || getCorporateCreditSidebarCounts();
  return `<div class="case-properties">
    <div class="property-row"><span>전용 하네스</span><strong>${escapeHtml(cclConsoleHarness.id)}</strong></div>
    <div class="property-row"><span>데이터 범위(roleKey)</span><strong>${escapeHtml(CCL_ROLE_KEY)}</strong></div>
    <div class="property-row"><span>여신 케이스</span><strong>${escapeHtml(counts.cases)}</strong></div>
    <div class="property-row"><span>승인 대기</span><strong>${escapeHtml(counts.approvals)}</strong></div>
    <p class="jbwc-guard">승인/거절·금리/한도·신용등급 확정 금지 — 결정은 항상 담당자.</p></div>`;
}

const cclSidebarOriginal = { brand: null, cta: null, search: null, captured: false };
function cclCaptureSidebar() {
  if (cclSidebarOriginal.captured) return;
  const brand = document.querySelector(".sidebar-brand");
  const cta = document.getElementById("new-case-button");
  const search = document.getElementById("sidebar-search");
  if (!brand || !cta || !search) return;
  cclSidebarOriginal.brand = brand.innerHTML;
  cclSidebarOriginal.cta = cta;
  cclSidebarOriginal.search = search;
  cclSidebarOriginal.captured = true;
}
function cclTakeoverSidebar() {
  if (typeof jbwcRestoreSidebar === "function") jbwcRestoreSidebar();
  if (typeof jpoRestoreSidebar === "function") jpoRestoreSidebar();
  if (typeof fdrRestoreSidebar === "function") fdrRestoreSidebar();
  cclCaptureSidebar();
  const brand = document.querySelector(".sidebar-brand");
  if (brand && !brand.dataset.cclMode) {
    brand.dataset.cclMode = "1";
    brand.innerHTML = `<p class="eyebrow">역할 전용 콘솔</p><h1>기업여신 심사지원 포털</h1><span>재무·상환·서류·품의 검토를 돕는 AI 업무지원</span>`;
  }
  const curCta = document.getElementById("new-case-button");
  if (curCta && !curCta.dataset.cclMode) {
    const mine = curCta.cloneNode(true);
    mine.dataset.cclMode = "1";
    mine.innerHTML = `<span aria-hidden="true">＋</span> 여신 검토 건 접수`;
    mine.addEventListener("click", () => cclGo("cases-new"));
    curCta.replaceWith(mine);
    cclSidebarOriginal.cta = curCta;
  }
  const curSearch = document.getElementById("sidebar-search");
  if (curSearch && !curSearch.dataset.cclMode) {
    const mine = curSearch.cloneNode(false);
    mine.dataset.cclMode = "1";
    mine.placeholder = "사건번호, 사업자 Ref, 업종, 상품, 담당자...";
    let timer = null;
    mine.addEventListener("input", (event) => {
      const q = event.target.value;
      clearTimeout(timer);
      timer = setTimeout(() => {
        cclState.search = { q, results: searchCorporateCreditRecords(q), loading: false };
        cclRenderSearchResults();
      }, 200);
    });
    curSearch.replaceWith(mine);
    cclSidebarOriginal.search = curSearch;
  }
  cclRenderNav();
  cclRenderSearchResults();
}
function cclRestoreSidebar() {
  const brand = document.querySelector(".sidebar-brand");
  if (brand && brand.dataset.cclMode) { delete brand.dataset.cclMode; if (cclSidebarOriginal.brand != null) brand.innerHTML = cclSidebarOriginal.brand; }
  const curCta = document.getElementById("new-case-button");
  if (curCta && curCta.dataset.cclMode && cclSidebarOriginal.cta) curCta.replaceWith(cclSidebarOriginal.cta);
  const curSearch = document.getElementById("sidebar-search");
  if (curSearch && curSearch.dataset.cclMode && cclSidebarOriginal.search) curSearch.replaceWith(cclSidebarOriginal.search);
  const box = document.getElementById("ccl-search-results");
  if (box) box.remove();
}
function cclRenderNav() {
  const navList = document.getElementById("nav-list");
  if (!navList) return;
  const counts = cclState.counts;
  const badge = (key) => counts ? `<span class="nav-count">${escapeHtml(counts[key] ?? 0)}</span>` : `<span class="nav-count jbwc-badge-skel" aria-label="불러오는 중"></span>`;
  navList.innerHTML = cclNavigation.map((group) => `
    <div class="nav-section"><div class="nav-section-title">${escapeHtml(group.section)}</div>
    ${group.items.map((item) => `
      <button class="nav-button ${cclState.view === item.id ? "is-active" : ""}" type="button" data-ccl-view="${escapeHtml(item.id)}">
        <span class="nav-button-main"><span class="nav-icon" aria-hidden="true">${iconSvg(item.icon)}</span>
        <span class="nav-text"><span class="nav-label">${escapeHtml(item.label)}</span><span class="nav-hint">${escapeHtml(item.description)}</span></span></span>
        ${badge(item.countKey)}</button>`).join("")}</div>`).join("");
  navList.querySelectorAll("[data-ccl-view]").forEach((button) => button.addEventListener("click", () => cclGo(button.dataset.cclView)));
}
function cclRenderSearchResults() {
  let box = document.getElementById("ccl-search-results");
  const anchor = document.querySelector(".sidebar-search");
  if (!anchor) return;
  if (!cclModeActive()) { if (box) box.remove(); return; }
  if (!box) { box = document.createElement("div"); box.id = "ccl-search-results"; anchor.insertAdjacentElement("afterend", box); }
  const s = cclState.search;
  if (!s.q || !s.q.trim()) { box.innerHTML = ""; return; }
  if (!s.results || !s.results.length) { box.innerHTML = `<div class="jbwc-search-state">'${escapeHtml(s.q)}' 결과 없음 (여신 role scope만 검색)</div>`; return; }
  box.innerHTML = s.results.map((r) => `<button type="button" class="jbwc-search-hit" data-ccl-goto="${escapeHtml(r.view)}" data-ccl-id="${escapeHtml(r.id)}"><strong>${escapeHtml(r.label)}</strong><span>${escapeHtml(r.sub)}</span></button>`).join("");
  box.querySelectorAll("[data-ccl-goto]").forEach((el) => el.addEventListener("click", () => {
    cclState.search = { q: "", results: null, loading: false };
    cclGo(el.dataset.cclGoto, { id: el.dataset.cclId });
  }));
}
function cclInvalidateCounts() { cclState.counts = null; cclState.countsAt = null; }
function cclEnsureCounts() {
  if (cclState.counts || cclState.countsLoading) return;
  cclState.countsLoading = true;
  getCorporateCreditSidebarCountsAsync()
    .then((counts) => { cclState.counts = counts; cclState.countsAt = Date.now(); })
    .catch(() => { cclState.countsError = true; })
    .then(() => { cclState.countsLoading = false; if (cclModeActive() && typeof render === "function") render(); });
}
function cclGo(view, detail) {
  cclState.view = view;
  cclState.detail = detail || null;
  const next = detail && detail.id ? cclHashForView("cases", detail.id) : cclHashForView(view);
  if (window.location.hash !== next) window.location.hash = next;
  else if (typeof render === "function") render();
}
function cclActivateFromHash() {
  const route = cclRouteFromHash(window.location.hash);
  if (!route) return false;
  let changed = false;
  if (!cclModeActive()) { activeView = "corporate-credit-harness"; activeDetailType = defaultDetailForView(activeView); changed = true; }
  if (route.view && CCL_VIEWS[route.view] && cclState.view !== route.view) { cclState.view = route.view; changed = true; }
  if (route.caseId) {
    const nextDetail = { id: route.caseId };
    if (JSON.stringify(cclState.detail) !== JSON.stringify(nextDetail)) { cclState.detail = nextDetail; changed = true; }
  } else if (route.view && cclState.detail) { cclState.detail = null; changed = true; }
  return changed;
}
// ?live=1 라이브 에이전트 전용 — CCL-0001 재무 요약 프롬프트(익명 구간지표만, PII 원문 없음).
function cclFinancialPrompt(caseId) {
  const c = cclTable("ccl_cases", CCL_ROLE_KEY).find((row) => row.id === caseId) || {};
  const notes = cclTable("ccl_review_notes", CCL_ROLE_KEY).filter((n) => n.caseId === caseId && n.kind === "financial");
  const docs = cclTable("ccl_doc_checks", CCL_ROLE_KEY).filter((d) => d.caseId === caseId);
  return [
    "당신은 지역은행 기업여신 담당자를 돕는 내부 보조 AI입니다.",
    "아래 익명 구간지표만 근거로 재무 검토 요약을 한국어 3문장으로 작성하세요.",
    "규칙: 개인정보·실명·전화·계좌번호 언급 금지. 대출 승인/거절·금리·한도·신용등급을 단정하지 말 것. 마지막 문장은 '담당자 검토 필요'로 끝낼 것.",
    `업종/지역 구간: ${c.segment || "-"}`,
    `여신 유형: ${(CCL_LOAN_TYPES[c.loanType] || {}).label || c.loanType || "-"}`,
    `신청 금액 구간: ${c.amountBand || "-"}`,
    `상환 부담 구간: ${c.repaymentBand || "-"}`,
    `서류 상태: ${c.docsStatus || "-"} · 위험 구간: ${c.riskLevel || "-"}`,
    `재무 검토 노트: ${notes.map((n) => `${n.title} — ${n.summary}`).join(" / ") || "없음"}`,
    `서류 점검: ${docs.map((d) => `${d.docName}(${d.status})`).join(", ") || "없음"}`,
  ].join("\n");
}

// 모의 run을 실제 로컬 LLM 출력으로 승격한다. 실 output도 PII·단정 guardrail을 통과해야 하며,
// 위반·실패 시 모의 문자열로 fallback하고 사람 검토로 전환한다. 감사 로그로 승격/폴백 사실을 남긴다.
async function cclUpgradeFinancialRun(result) {
  const run = result.run; // recordCorporateCreditAgentRun가 반환한, DB에 저장된 그 row 참조
  const mock = run.outputSummary;
  cclState.lastRun.live = true;
  cclState.lastRun.pending = true;
  render();
  let llmText = null;
  try { llmText = await llmGenerate(cclFinancialPrompt(result.sample.caseId)); } catch (error) { llmText = null; }
  const violation = llmText
    ? (harnessGuardCheckPII(llmText) || harnessGuardCheckAssertions(llmText, CCL_FORBIDDEN_ASSERTIONS))
    : null;
  const finalText = llmPickText(mock, llmText, violation);
  const usedLive = finalText !== mock;
  run.outputSummary = finalText;
  if (violation) run.status = "needsReview";
  cclSaveDb();
  cclWriteAudit({
    id: cclNextId("AUD-CCL", "ccl_audit_logs"), caseId: run.caseId || null, actorId: run.agentId,
    action: usedLive ? "CCL_AGENT_LIVE_OUTPUT" : "CCL_AGENT_LIVE_FALLBACK", targetType: "agent_run", targetId: run.id,
    riskLevel: run.riskLevel, reviewRequired: true, note: violation || "", createdAt: new Date().toISOString().slice(0, 10),
  });
  cclState.lastRun = { ...cclState.lastRun, pending: false, live: usedLive, result: finalText, status: run.status };
  if (violation && typeof notify === "function") notify("실 output guardrail 플래그 — 사람 검토로 전환");
  cclInvalidateCounts();
  render();
}

function bindCclActions() {
  if (cclActivateFromHash()) { render(); return; }
  if (cclModeActive()) {
    document.querySelectorAll("[data-role-filter]").forEach((entry) => entry.classList.toggle("is-active", entry.dataset.roleFilter === "기업여신 담당자"));
    cclTakeoverSidebar();
    cclEnsureCounts();
  } else {
    document.querySelectorAll('[data-role-filter="기업여신 담당자"]').forEach((entry) => entry.classList.remove("is-active"));
    cclRestoreSidebar();
  }
  document.querySelectorAll("[data-ccl-open-case]").forEach((el) => el.addEventListener("click", () => cclGo("cases", { id: el.dataset.cclOpenCase })));
  document.querySelectorAll("[data-ccl-clear-detail]").forEach((el) => el.addEventListener("click", () => { cclState.detail = null; render(); }));
  document.querySelectorAll("[data-ccl-refresh]").forEach((el) => el.addEventListener("click", () => { cclInvalidateCounts(); render(); }));
  document.querySelectorAll("[data-ccl-reset-db]").forEach((el) => el.addEventListener("click", () => { cclResetDb(); cclInvalidateCounts(); if (typeof notify === "function") notify("여신 데모 데이터를 다시 채웠습니다."); render(); }));
  document.querySelectorAll("[data-ccl-sample]").forEach((el) => el.addEventListener("click", () => {
    const result = runCorporateCreditSample(el.dataset.cclSample);
    if (!result) return;
    cclState.lastRun = result.blocked
      ? { agent: "차단됨", status: "rejected", result: result.violations.join(" / "), human: true }
      : { agent: cclAgentName(result.run.agentId), status: result.run.status, result: result.run.outputSummary, human: result.run.requiresHumanReview, approvalPending: result.run.status === "pendingApproval" };
    cclInvalidateCounts();
    render();
    // 라이브 에이전트 opt-in(?live=1): ccl-financial 경로만 실제 로컬 LLM으로 출력을 생성한다.
    // 비활성(기본)·오프라인·실패 시 위 모의 결과가 그대로 유지된다(오프라인 데모 무회귀).
    if (!result.blocked && result.sample.agentId === "ccl-financial" && typeof llmAgentsEnabled === "function" && llmAgentsEnabled()) {
      cclUpgradeFinancialRun(result);
    }
  }));
  document.querySelectorAll("[data-ccl-approve]").forEach((el) => el.addEventListener("click", (event) => {
    event.stopPropagation();
    const result = cclDecideApproval(el.dataset.cclApprove, "approve");
    if (result && result.blocked) { if (typeof notify === "function") notify(`승인 차단: ${result.violations.join(" / ")}`); return; }
    if (result && typeof notify === "function") notify(`${result.approval.approvalType} 승인 완료 (사람 결정)`);
    cclInvalidateCounts();
    render();
  }));
  const wizard = document.getElementById("ccl-new-case-form");
  if (wizard) {
    wizard.addEventListener("submit", (event) => {
      event.preventDefault();
      const fd = new FormData(wizard);
      const created = createCorporateCreditCase({
        loanType: String(fd.get("loanType")), title: String(fd.get("title") || ""),
        bizRefId: String(fd.get("bizRefId") || ""), segment: String(fd.get("segment") || ""),
        amountBand: String(fd.get("amountBand") || ""), riskLevel: String(fd.get("riskLevel") || "medium"),
        docsStatus: String(fd.get("docsStatus") || "missing"), dueAt: String(fd.get("dueAt") || ""),
      });
      if (created && created.blocked) { if (typeof notify === "function") notify(`접수 차단(보안 훅): ${created.violations.join(" / ")}`); return; }
      cclInvalidateCounts();
      if (typeof notify === "function") notify(`${created.case.caseNo} 접수 완료 (모의)`);
      cclGo("cases", { id: created.case.id });
    });
  }
  const back = document.querySelector("[data-ccl-back]");
  if (back) back.addEventListener("click", () => {
    document.querySelectorAll("[data-role-filter]").forEach((entry) => entry.classList.remove("is-active"));
    activeView = "dashboard";
    activeDetailType = defaultDetailForView("dashboard");
    cclState.view = "board"; cclState.detail = null;
    if (window.location.hash !== "#dashboard") window.location.hash = "#dashboard";
    render();
  });
}
(function () {
  const prevBind = typeof bindModuleActions === "function" ? bindModuleActions : null;
  window.bindModuleActions = function () { if (prevBind) prevBind(); bindCclActions(); };
})();
