/* FDS/보이스피싱 담당자 콘솔 — app (views + sidebar takeover + router).
   presentation은 공통 CSS 토큰(jbwc-*, jpo-board)만 재사용하고 business는 fdr 전용이다. */

let fdrState = { view: "board", detail: null, counts: null, countsLoading: false, countsError: false, countsAt: null, lastRun: null, search: { q: "", results: null } };

function fdrModeActive() {
  return typeof activeView !== "undefined" && activeView === "fds-response-harness";
}
function fdrStatusPill(status) {
  const danger = ["humanReview", "decision", "pending", "rejected", "escalated", "degraded", "tuning"];
  const ok = ["closedByHuman", "completed", "approved", "healthy", "active", "verified", "falsePositive", "guided"];
  const cls = danger.includes(status) ? "status-escalated" : ok.includes(status) ? "status-approved" : "status-pending";
  return `<span class="status-pill ${cls}" data-status="${escapeHtml(status || "-")}">${escapeHtml(FDR_STATUS_LABELS[status] || status || "-")}</span>`;
}
function fdrRiskPill(risk) {
  const cls = ["high", "critical"].includes(risk) ? "status-escalated" : risk === "medium" ? "status-pending" : "status-approved";
  return `<span class="status-pill ${cls}">${escapeHtml(FDR_RISK_LABELS[risk] || risk || "-")}</span>`;
}
function fdrPanel(title, body) {
  return `<section class="workspace-panel jbwc-panel"><p class="eyebrow">${escapeHtml(title)}</p>${body}</section>`;
}
function fdrMockNote() {
  return `<p class="jbwc-mock-note">※ 내부 운영 참고용 모의 데이터 — 자동 종결·지급정지 실행·사기 확정 판단은 하지 않으며 종결은 항상 담당자가 합니다.</p>`;
}
function fdrList(cols, rows, rowHtml) {
  if (!rows.length) return `<div class="jbwc-empty">표시할 데이터가 없습니다. <button class="secondary-button" type="button" data-fdr-reset-db>데모 데이터 다시 채우기</button></div>`;
  return `<ul class="jbwc-list"><li class="jbwc-row jbwc-row-head">${cols.map((c) => `<span>${escapeHtml(c)}</span>`).join("")}</li>${rows.map(rowHtml).join("")}</ul>`;
}
function fdrUserName(id) {
  const user = fdrTable("users", FDR_ROLE_KEY).find((item) => item.id === id);
  return user ? user.name : (id || "-");
}
function fdrAgentName(id) {
  const agent = fdrConsoleAgents.find((item) => item.id === id);
  return agent ? agent.displayName : (id || "-");
}
function fdrHeaderBar() {
  const at = fdrState.countsAt ? new Date(fdrState.countsAt).toTimeString().slice(0, 8) : "-";
  return `<nav class="jbwc-breadcrumb" aria-label="FDS 대응 포털 위치">
    <button class="secondary-button" type="button" data-fdr-back>← 전체로 돌아가기</button>
    <span>역할 &gt; <strong>FDS·보이스피싱 대응 포털</strong> &gt; ${escapeHtml(FDR_VIEWS[fdrState.view] || "")}</span>
    <span class="jbwc-updated">데이터 기준 ${escapeHtml(at)} <button class="secondary-button jbwc-refresh" type="button" data-fdr-refresh>새로고침</button></span>
  </nav>`;
}
function fdrDetailPanel() {
  if (!fdrState.detail) return "";
  const row = fdrTable("fdr_cases", FDR_ROLE_KEY).find((item) => item.id === fdrState.detail.id);
  if (!row) return `<section class="workspace-panel jbwc-detail-panel"><header><div><p class="eyebrow">DB 상세 · fds-response scope</p><h3>상세 데이터를 찾을 수 없습니다</h3></div><button class="secondary-button" type="button" data-fdr-clear-detail>닫기</button></header></section>`;
  const fields = Object.entries(row).filter(([key]) => !["roleKey", "workspaceId"].includes(key))
    .map(([key, value]) => `<div><span>${escapeHtml(key)}</span><strong>${escapeHtml(Array.isArray(value) ? value.join(", ") : String(value ?? "-"))}</strong></div>`).join("");
  const signals = fdrTable("fdr_signals", FDR_ROLE_KEY).filter((x) => x.caseId === row.id);
  const closeButton = row.status !== "closedByHuman"
    ? `<button class="secondary-button" type="button" data-fdr-close-case="${escapeHtml(row.id)}">사람 종결 처리</button>` : "";
  return `<section class="workspace-panel jbwc-detail-panel" aria-label="경보 케이스 상세">
    <header><div><p class="eyebrow">DB 상세 · fds-response scope</p><h3>${escapeHtml(row.caseNo)} · ${escapeHtml(row.title)}</h3></div>
    <div>${closeButton} <button class="secondary-button" type="button" data-fdr-clear-detail>닫기</button></div></header>
    <div class="jbwc-detail-grid">${fields}</div>
    ${signals.length ? `<p class="jbwc-guard">위험 신호: ${signals.map((x) => escapeHtml(x.title)).join(" · ")}</p>` : ""}
    <p class="jbwc-guard">익명 CUST-FD Ref만 표시 — 계좌/전화 원문 없음. 종결(closedByHuman)은 사람만 가능.</p></section>`;
}

function fdrBoardCard(item) {
  const topSignals = fdrTable("fdr_signals", FDR_ROLE_KEY).filter((x) => x.caseId === item.id).slice(0, 3);
  return `<article class="jpo-card jbwc-card" data-fdr-open-case="${escapeHtml(item.id)}" role="button" tabindex="0">
    <header><strong>${escapeHtml(item.caseNo)}</strong>${fdrRiskPill(item.riskLevel)}</header>
    <p class="jbwc-meta">${escapeHtml(item.customerRefId)}${item.elderFlag ? " · 고령·취약" : ""}</p>
    <p class="jbwc-meta">${escapeHtml((FDR_ALERT_TYPES[item.alertType] || {}).label || item.alertType)} · ${escapeHtml(item.channel)}</p>
    <p class="jbwc-meta">금액대 ${escapeHtml(item.amountBand)}</p>
    ${topSignals.length ? `<p class="jbwc-guard">${topSignals.map((x) => escapeHtml(x.title)).join(" · ")}</p>` : ""}
    <p class="jbwc-meta">${escapeHtml(fdrUserName(item.assignedToId))} · SLA ${escapeHtml(item.dueAt || "-")}</p>
  </article>`;
}
function fdrCaseRows(rows) {
  return fdrList(["케이스", "유형/채널", "담당/SLA", "상태"], rows, (c) => `
    <li class="jbwc-row" data-fdr-open-case="${escapeHtml(c.id)}">
      <span class="jbwc-row-id">${escapeHtml(c.caseNo)}<br><span class="jbwc-row-note">${escapeHtml(c.title)}</span></span>
      <span>${escapeHtml((FDR_ALERT_TYPES[c.alertType] || {}).label || c.alertType)} · ${escapeHtml(c.channel)}</span>
      <span>${escapeHtml(fdrUserName(c.assignedToId))} · ${escapeHtml(c.dueAt || "-")}</span>
      <span>${fdrStatusPill(c.status)} ${fdrRiskPill(c.riskLevel)}</span></li>`);
}

const fdrViewRenderers = {
  board() {
    const cases = fdrTable("fdr_cases", FDR_ROLE_KEY);
    const columns = FDR_BOARD_COLUMNS.map(([status, label]) => {
      const items = cases.filter((item) => item.status === status);
      return `<section class="jpo-board-column" data-board-column="${escapeHtml(status)}">
        <header class="jpo-board-head"><strong>${escapeHtml(label)}</strong><span class="nav-count">${items.length}</span></header>
        <div class="jpo-board-cards">${items.map(fdrBoardCard).join("") || '<div class="jbwc-empty">없음</div>'}</div></section>`;
    }).join("");
    return `<section class="jbwc-hero jpo-hero-slim">
        <p class="eyebrow">역할 전용 콘솔 · 이상거래 탐지·보이스피싱 의심 대응</p>
        <h2>FDS·보이스피싱 대응 포털</h2>
        <p>AI는 위험 신호 요약·고객 확인 스크립트·차단/보류 권고까지만 — 차단 실행과 종결은 항상 담당자가 합니다.</p>
      </section>
      ${fdrPanel(`경보 대응 보드 (활성 ${cases.filter(fdrActiveCase).length}건)`, `<div class="jpo-board" style="grid-template-columns: repeat(6, minmax(210px, 1fr));">${columns}</div>`)}
      ${fdrMockNote()}`;
  },
  cases() { return fdrPanel(`경보 케이스 (${fdrTable("fdr_cases", FDR_ROLE_KEY).length})`, fdrCaseRows(fdrTable("fdr_cases", FDR_ROLE_KEY))) + fdrMockNote(); },
  "cases-new"() {
    const options = Object.entries(FDR_ALERT_TYPES).map(([value, cfg]) => `<option value="${value}">${escapeHtml(cfg.label)}</option>`).join("");
    return fdrPanel("신규 이상거래/피싱 의심 건 접수", `
      <form id="fdr-new-case-form" class="jbwc-wizard">
        <section class="jbwc-step"><h3>1단계. 경보 유형</h3>
          <label>유형<select name="alertType">${options}</select></label></section>
        <section class="jbwc-step"><h3>2단계. 경보 정보(익명)</h3>
          <div class="jbwc-form-grid">
            <label>제목<input name="title" placeholder="예: 고령 고객 심야 고액 이체 경보" /></label>
            <label>익명 고객 Ref<input name="customerRefId" placeholder="CUST-FD-0000 (전화/계좌 원문 금지)" /></label>
            <label>채널<select name="channel"><option>모바일 이체</option><option>인터넷뱅킹</option><option>창구</option><option>콜센터</option></select></label>
            <label>금액대<select name="amountBand"><option>1천만 미만</option><option>1천만~3천만</option><option>3천만 이상</option></select></label>
            <label>위험도<select name="riskLevel"><option value="low">낮음</option><option value="medium" selected>보통</option><option value="high">높음</option><option value="critical">심각</option></select></label>
            <label class="jbwc-check"><input type="checkbox" name="elderFlag" /> 고령·취약 고객</label>
            <label>처리 기한<input name="dueAt" type="date" /></label>
          </div></section>
        <section class="jbwc-step"><h3>3단계. 저장</h3>
          <p class="jbwc-guard">경보·신호·감사 기록·에이전트 실행이 저장되며, 고위험/고령 건은 담당자 검토 필요로 등록됩니다.</p>
          <footer><button class="primary-button" type="submit">경보 접수</button></footer></section>
      </form>`) + fdrMockNote();
  },
  "block-review"() {
    const rows = fdrTable("fdr_block_reviews", FDR_ROLE_KEY);
    return fdrPanel(`차단·보류 검토함 (${rows.filter((x) => x.status === "pending").length})`, fdrList(["권고", "근거", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.recommendation)}<br><span class="jbwc-row-note">${escapeHtml(x.rationale)}</span></span>
        <span>${escapeHtml(x.caseId)}</span><span>${fdrStatusPill(x.status)}</span></li>`))
      + `<p class="jbwc-guard">AI는 권고와 근거만 만듭니다 — 차단/보류 실행 결정은 담당자·관련 절차를 따릅니다.</p>` + fdrMockNote();
  },
  escalations() {
    const rows = fdrTable("agent_handoffs", FDR_ROLE_KEY).filter((x) => x.status === "escalated");
    return fdrPanel(`에스컬레이션 (${rows.length})`, fdrList(["핸드오프", "사유", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(fdrAgentName(x.fromAgentId))} → ${escapeHtml(fdrAgentName(x.toAgentId))}<br><span class="jbwc-row-note">${escapeHtml(x.reason)}</span></span>
        <span>${escapeHtml(x.caseId || "-")}</span><span>${fdrStatusPill(x.status)}</span></li>`)) + fdrMockNote();
  },
  "anomaly-signals"() {
    const rows = fdrTable("fdr_signals", FDR_ROLE_KEY);
    return fdrPanel(`이상거래 신호 (${rows.length})`, fdrList(["신호", "근거", "관련 건", "심각도"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.title)}<br><span class="jbwc-row-note">${escapeHtml(x.evidence)}</span></span>
        <span>${escapeHtml(x.caseId)}</span><span>${fdrRiskPill(x.severity)}</span></li>`))
      + `<p class="jbwc-guard">신호는 사기 확정이 아닙니다 — 고객 확인·담당자 검토로 이어집니다.</p>` + fdrMockNote();
  },
  "elder-guard"() {
    const cases = fdrTable("fdr_cases", FDR_ROLE_KEY).filter((x) => x.elderFlag);
    return fdrPanel(`고령·취약 고객 조기경보 (${cases.length})`, fdrCaseRows(cases))
      + `<p class="jbwc-guard">고령·취약 고객 건은 우선 검토 — 송금 전 확인 스크립트는 승인 후 사용.</p>` + fdrMockNote();
  },
  "pattern-summary"() {
    const rows = fdrTable("fdr_signals", FDR_ROLE_KEY).filter((x) => ["REPEATED_TRANSFERS", "HIGH_AMOUNT_TRANSFER", "UNUSUAL_HOUR"].includes(x.signalType));
    return fdrPanel(`거래 패턴 요약 (${rows.length})`, fdrList(["패턴", "근거", "관련 건", "심각도"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.title)}<br><span class="jbwc-row-note">${escapeHtml(x.evidence)}</span></span>
        <span>${escapeHtml(x.caseId)}</span><span>${fdrRiskPill(x.severity)}</span></li>`)) + fdrMockNote();
  },
  "rule-status"() {
    const rows = fdrTable("fdr_rules", FDR_ROLE_KEY);
    return fdrPanel(`탐지룰 상태 (${rows.length})`, fdrList(["룰", "적용 범위", "메모", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.name)}</span><span>${escapeHtml(x.coverage)}<br><span class="jbwc-row-note">${escapeHtml(x.note)}</span></span>
        <span>${fdrStatusPill(x.health)}</span></li>`)) + fdrMockNote();
  },
  "contact-scripts"() {
    const rows = fdrTable("ai_recommendations", FDR_ROLE_KEY).filter((x) => x.kind === "contactScript");
    return fdrPanel(`고객 확인 스크립트 (${rows.length})`, fdrList(["스크립트", "에이전트", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.title)}</span>
        <span>${escapeHtml(fdrAgentName(x.agentId))} · ${escapeHtml(x.caseId)}</span>
        <span>${fdrStatusPill(x.status)}</span></li>`))
      + `<p class="jbwc-guard">스크립트 사용(발신)은 승인 대기 없이 진행되지 않습니다 — 자동 전화 금지.</p>` + fdrMockNote();
  },
  "payment-hold-guide"() {
    const cases = fdrTable("fdr_cases", FDR_ROLE_KEY).filter((x) => ["remoteApp", "loanScam", "elderRisk"].includes(x.alertType) && fdrActiveCase(x));
    return fdrPanel("지급정지 절차 안내 (안내 후보)", `
      <ul class="jbwc-list">
        <li class="jbwc-row"><span>1. 고객 본인 확인 후 피해 의심 정황 청취(스크립트 승인본 사용)</span></li>
        <li class="jbwc-row"><span>2. 긴급 시 경찰(112)·금융감독원(1332) 신고 절차 안내 — 신고 대행 아님</span></li>
        <li class="jbwc-row"><span>3. 지급정지 요청 절차·필요 서류 안내(실행은 관련 절차와 담당 부서)</span></li>
        <li class="jbwc-row"><span>4. 이후 경과를 사후 확인 큐에 기록</span></li>
      </ul>
      <p class="jbwc-guard">본 화면은 절차 '안내 후보'입니다 — 시스템이 지급정지를 실행하지 않습니다.</p>`)
      + fdrPanel(`안내 대상 후보 (${cases.length})`, fdrCaseRows(cases)) + fdrMockNote();
  },
  "follow-up"() {
    const rows = fdrTable("fdr_followups", FDR_ROLE_KEY);
    return fdrPanel(`사후 확인 (${rows.length})`, fdrList(["항목", "메모", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.title)}<br><span class="jbwc-row-note">${escapeHtml(x.note)}</span></span>
        <span>${escapeHtml(x.caseId)} · 기한 ${escapeHtml(x.dueAt || "-")}</span>
        <span>${fdrStatusPill(x.status)}</span></li>`)) + fdrMockNote();
  },
  "ai-analysis"() {
    const rows = fdrTable("ai_analysis_requests", FDR_ROLE_KEY);
    return fdrPanel(`AI 분석 요청 (${rows.length})`, fdrList(["요청", "유형", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.requestType)}</span><span>${escapeHtml(x.caseId)}</span>
        <span>${fdrStatusPill(x.status)}</span></li>`)) + fdrMockNote();
  },
  "agent-harness"() {
    const agents = fdrTable("harness_agents", FDR_ROLE_KEY);
    const surface = agents.filter((agent) => FDR_SURFACE_AGENT_IDS.includes(agent.id));
    const internal = agents.filter((agent) => !FDR_SURFACE_AGENT_IDS.includes(agent.id));
    const runs = fdrTable("fdr_agent_runs", FDR_ROLE_KEY).slice(0, 8);
    const card = (agent) => `<article class="jbwc-card jbwc-agent-card"><header><strong>${escapeHtml(agent.name)}</strong>${fdrStatusPill(agent.status)}</header>
      <p class="jbwc-meta">${escapeHtml(agent.description)}</p></article>`;
    return fdrPanel(`${fdrConsoleHarness.name} — 전용 라우팅`, `<p class="jbwc-guard">정책: ${fdrConsoleHarness.policy.map(escapeHtml).join(" · ")}</p>`)
      + fdrPanel("샘플 요청 실행 (모의)", `<div class="jbwc-samples">${fdrSampleRequests.map((sample) => `<button class="secondary-button" type="button" data-fdr-sample="${escapeHtml(sample.key)}">${escapeHtml(sample.text)}</button>`).join("")}</div>
        ${fdrState.lastRun ? `<div class="jbwc-lastrun"><p><strong>실행 결과</strong> → ${escapeHtml(fdrState.lastRun.agent)} ${fdrStatusPill(fdrState.lastRun.status)}</p><p>${escapeHtml(fdrState.lastRun.result)}</p><p class="jbwc-mock-note">※ 내부 운영 참고용${fdrState.lastRun.human ? " · 사람 검토 대기" : ""}${fdrState.lastRun.approvalPending ? " · 승인 대기" : ""}</p></div>` : ""}`)
      + fdrPanel(`표면 에이전트 (${surface.length})`, `<div class="jbwc-grid">${surface.map(card).join("")}</div>`)
      + fdrPanel(`내부 전문 조직 (${internal.length})`, `<details><summary class="jbwc-meta">내부 에이전트 펼치기</summary><div class="jbwc-grid">${internal.map(card).join("")}</div></details>`)
      + fdrPanel(`최근 실행 (${runs.length})`, fdrList(["실행", "에이전트", "입력→결과", "상태"], runs, (run) => `
        <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(run.createdAt)}<br>${escapeHtml(run.id)}</span>
          <span>${escapeHtml(fdrAgentName(run.agentId))}</span>
          <span>${escapeHtml(run.inputSummary)}<br><span class="jbwc-row-note">${escapeHtml(run.outputSummary)}</span></span>
          <span>${fdrStatusPill(run.status)}</span></li>`)) + fdrMockNote();
  },
  "audit-logs"() {
    const rows = fdrTable("fdr_audit_logs", FDR_ROLE_KEY);
    return fdrPanel(`감사 기록 (${rows.length} · 검토 필요 ${rows.filter((x) => x.reviewRequired).length})`, fdrList(["기록", "행위", "대상", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.createdAt)}<br>${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.action)}</span><span>${escapeHtml(x.targetType)} ${escapeHtml(x.targetId)}</span>
        <span>${x.reviewRequired ? '<span class="status-pill status-escalated">검토 필요</span>' : '<span class="status-pill status-approved">기록됨</span>'}</span></li>`)) + fdrMockNote();
  },
};

function fdrOpsPage() {
  let body = "";
  try { body = (fdrViewRenderers[fdrState.view] || fdrViewRenderers.board)(); }
  catch (error) { body = `<div class="jbwc-error">데이터를 불러오지 못했습니다. <button class="secondary-button" type="button" data-fdr-reset-db>데모 데이터 초기화</button></div>`; }
  return `<div class="jbwc-shell">${fdrHeaderBar()}${fdrDetailPanel()}${body}</div>`;
}
function fdrContextMarkup() {
  const counts = fdrState.counts || getFdsResponseSidebarCounts();
  return `<div class="case-properties">
    <div class="property-row"><span>전용 하네스</span><strong>${escapeHtml(fdrConsoleHarness.id)}</strong></div>
    <div class="property-row"><span>데이터 범위(roleKey)</span><strong>${escapeHtml(FDR_ROLE_KEY)}</strong></div>
    <div class="property-row"><span>경보 케이스</span><strong>${escapeHtml(counts.cases)}</strong></div>
    <div class="property-row"><span>결정 대기</span><strong>${escapeHtml(counts.blockReview)}</strong></div>
    <p class="jbwc-guard">자동 종결·차단 실행·사기 확정 금지 — 종결은 항상 담당자.</p></div>`;
}

const fdrSidebarOriginal = { brand: null, cta: null, search: null, captured: false };
function fdrCaptureSidebar() {
  if (fdrSidebarOriginal.captured) return;
  const brand = document.querySelector(".sidebar-brand");
  const cta = document.getElementById("new-case-button");
  const search = document.getElementById("sidebar-search");
  if (!brand || !cta || !search) return;
  fdrSidebarOriginal.brand = brand.innerHTML;
  fdrSidebarOriginal.cta = cta;
  fdrSidebarOriginal.search = search;
  fdrSidebarOriginal.captured = true;
}
function fdrTakeoverSidebar() {
  if (typeof jbwcRestoreSidebar === "function") jbwcRestoreSidebar();
  if (typeof jpoRestoreSidebar === "function") jpoRestoreSidebar();
  if (typeof cclRestoreSidebar === "function") cclRestoreSidebar();
  fdrCaptureSidebar();
  const brand = document.querySelector(".sidebar-brand");
  if (brand && !brand.dataset.fdrMode) {
    brand.dataset.fdrMode = "1";
    brand.innerHTML = `<p class="eyebrow">역할 전용 콘솔</p><h1>FDS·보이스피싱 대응 포털</h1><span>신호 요약·고객 확인·사람 결정을 돕는 AI 업무지원</span>`;
  }
  const curCta = document.getElementById("new-case-button");
  if (curCta && !curCta.dataset.fdrMode) {
    const mine = curCta.cloneNode(true);
    mine.dataset.fdrMode = "1";
    mine.innerHTML = `<span aria-hidden="true">＋</span> 이상거래/피싱 의심 건 접수`;
    mine.addEventListener("click", () => fdrGo("cases-new"));
    curCta.replaceWith(mine);
    fdrSidebarOriginal.cta = curCta;
  }
  const curSearch = document.getElementById("sidebar-search");
  if (curSearch && !curSearch.dataset.fdrMode) {
    const mine = curSearch.cloneNode(false);
    mine.dataset.fdrMode = "1";
    mine.placeholder = "사건번호, 익명 고객 Ref, 경보 유형, 채널, 담당자...";
    let timer = null;
    mine.addEventListener("input", (event) => {
      const q = event.target.value;
      clearTimeout(timer);
      timer = setTimeout(() => {
        fdrState.search = { q, results: searchFdsResponseRecords(q) };
        fdrRenderSearchResults();
      }, 200);
    });
    curSearch.replaceWith(mine);
    fdrSidebarOriginal.search = curSearch;
  }
  fdrRenderNav();
  fdrRenderSearchResults();
}
function fdrRestoreSidebar() {
  const brand = document.querySelector(".sidebar-brand");
  if (brand && brand.dataset.fdrMode) { delete brand.dataset.fdrMode; if (fdrSidebarOriginal.brand != null) brand.innerHTML = fdrSidebarOriginal.brand; }
  const curCta = document.getElementById("new-case-button");
  if (curCta && curCta.dataset.fdrMode && fdrSidebarOriginal.cta) curCta.replaceWith(fdrSidebarOriginal.cta);
  const curSearch = document.getElementById("sidebar-search");
  if (curSearch && curSearch.dataset.fdrMode && fdrSidebarOriginal.search) curSearch.replaceWith(fdrSidebarOriginal.search);
  const box = document.getElementById("fdr-search-results");
  if (box) box.remove();
}
function fdrRenderNav() {
  const navList = document.getElementById("nav-list");
  if (!navList) return;
  const counts = fdrState.counts;
  const badge = (key) => counts ? `<span class="nav-count">${escapeHtml(counts[key] ?? 0)}</span>` : `<span class="nav-count jbwc-badge-skel" aria-label="불러오는 중"></span>`;
  navList.innerHTML = fdrNavigation.map((group) => `
    <div class="nav-section"><div class="nav-section-title">${escapeHtml(group.section)}</div>
    ${group.items.map((item) => `
      <button class="nav-button ${fdrState.view === item.id ? "is-active" : ""}" type="button" data-fdr-view="${escapeHtml(item.id)}">
        <span class="nav-button-main"><span class="nav-icon" aria-hidden="true">${iconSvg(item.icon)}</span>
        <span class="nav-text"><span class="nav-label">${escapeHtml(item.label)}</span><span class="nav-hint">${escapeHtml(item.description)}</span></span></span>
        ${badge(item.countKey)}</button>`).join("")}</div>`).join("");
  navList.querySelectorAll("[data-fdr-view]").forEach((button) => button.addEventListener("click", () => fdrGo(button.dataset.fdrView)));
}
function fdrRenderSearchResults() {
  let box = document.getElementById("fdr-search-results");
  const anchor = document.querySelector(".sidebar-search");
  if (!anchor) return;
  if (!fdrModeActive()) { if (box) box.remove(); return; }
  if (!box) { box = document.createElement("div"); box.id = "fdr-search-results"; anchor.insertAdjacentElement("afterend", box); }
  const s = fdrState.search;
  if (!s.q || !s.q.trim()) { box.innerHTML = ""; return; }
  if (!s.results || !s.results.length) { box.innerHTML = `<div class="jbwc-search-state">'${escapeHtml(s.q)}' 결과 없음 (FDS role scope만 검색)</div>`; return; }
  box.innerHTML = s.results.map((r) => `<button type="button" class="jbwc-search-hit" data-fdr-goto="${escapeHtml(r.view)}" data-fdr-id="${escapeHtml(r.id)}"><strong>${escapeHtml(r.label)}</strong><span>${escapeHtml(r.sub)}</span></button>`).join("");
  box.querySelectorAll("[data-fdr-goto]").forEach((el) => el.addEventListener("click", () => {
    fdrState.search = { q: "", results: null };
    fdrGo(el.dataset.fdrGoto, { id: el.dataset.fdrId });
  }));
}
function fdrInvalidateCounts() { fdrState.counts = null; fdrState.countsAt = null; }
function fdrEnsureCounts() {
  if (fdrState.counts || fdrState.countsLoading) return;
  fdrState.countsLoading = true;
  getFdsResponseSidebarCountsAsync()
    .then((counts) => { fdrState.counts = counts; fdrState.countsAt = Date.now(); })
    .catch(() => { fdrState.countsError = true; })
    .then(() => { fdrState.countsLoading = false; if (fdrModeActive() && typeof render === "function") render(); });
}
function fdrGo(view, detail) {
  fdrState.view = view;
  fdrState.detail = detail || null;
  const next = detail && detail.id ? fdrHashForView("cases", detail.id) : fdrHashForView(view);
  if (window.location.hash !== next) window.location.hash = next;
  else if (typeof render === "function") render();
}
function fdrActivateFromHash() {
  const route = fdrRouteFromHash(window.location.hash);
  if (!route) return false;
  let changed = false;
  if (!fdrModeActive()) { activeView = "fds-response-harness"; activeDetailType = defaultDetailForView(activeView); changed = true; }
  if (route.view && FDR_VIEWS[route.view] && fdrState.view !== route.view) { fdrState.view = route.view; changed = true; }
  if (route.caseId) {
    const nextDetail = { id: route.caseId };
    if (JSON.stringify(fdrState.detail) !== JSON.stringify(nextDetail)) { fdrState.detail = nextDetail; changed = true; }
  } else if (route.view && fdrState.detail) { fdrState.detail = null; changed = true; }
  return changed;
}
function bindFdrActions() {
  if (fdrActivateFromHash()) { render(); return; }
  if (fdrModeActive()) {
    document.querySelectorAll("[data-role-filter]").forEach((entry) => entry.classList.toggle("is-active", entry.dataset.roleFilter === "보이스피싱/FDS 담당자"));
    fdrTakeoverSidebar();
    fdrEnsureCounts();
  } else {
    document.querySelectorAll('[data-role-filter="보이스피싱/FDS 담당자"]').forEach((entry) => entry.classList.remove("is-active"));
    fdrRestoreSidebar();
  }
  document.querySelectorAll("[data-fdr-open-case]").forEach((el) => el.addEventListener("click", () => fdrGo("cases", { id: el.dataset.fdrOpenCase })));
  document.querySelectorAll("[data-fdr-clear-detail]").forEach((el) => el.addEventListener("click", () => { fdrState.detail = null; render(); }));
  document.querySelectorAll("[data-fdr-refresh]").forEach((el) => el.addEventListener("click", () => { fdrInvalidateCounts(); render(); }));
  document.querySelectorAll("[data-fdr-reset-db]").forEach((el) => el.addEventListener("click", () => { fdrResetDb(); fdrInvalidateCounts(); if (typeof notify === "function") notify("FDS 데모 데이터를 다시 채웠습니다."); render(); }));
  document.querySelectorAll("[data-fdr-close-case]").forEach((el) => el.addEventListener("click", (event) => {
    event.stopPropagation();
    const result = fdrCloseCaseByHuman(el.dataset.fdrCloseCase, "USR-FDR-SUP-01");
    if (result && result.blocked) { if (typeof notify === "function") notify(`종결 차단: ${result.violations.join(" / ")}`); return; }
    if (result && typeof notify === "function") notify(`${result.case.caseNo} 사람 종결 처리 완료`);
    fdrInvalidateCounts();
    render();
  }));
  document.querySelectorAll("[data-fdr-sample]").forEach((el) => el.addEventListener("click", () => {
    const result = runFdsResponseSample(el.dataset.fdrSample);
    if (!result) return;
    fdrState.lastRun = result.blocked
      ? { agent: "차단됨", status: "rejected", result: result.violations.join(" / "), human: true }
      : { agent: fdrAgentName(result.run.agentId), status: result.run.status, result: result.run.outputSummary, human: result.run.requiresHumanReview, approvalPending: result.run.status === "pendingApproval" };
    fdrInvalidateCounts();
    render();
  }));
  const wizard = document.getElementById("fdr-new-case-form");
  if (wizard) {
    wizard.addEventListener("submit", (event) => {
      event.preventDefault();
      const fd = new FormData(wizard);
      const created = createFdsResponseCase({
        alertType: String(fd.get("alertType")), title: String(fd.get("title") || ""),
        customerRefId: String(fd.get("customerRefId") || ""), channel: String(fd.get("channel") || ""),
        amountBand: String(fd.get("amountBand") || ""), riskLevel: String(fd.get("riskLevel") || "medium"),
        elderFlag: Boolean(fd.get("elderFlag")), dueAt: String(fd.get("dueAt") || ""),
      });
      if (created && created.blocked) { if (typeof notify === "function") notify(`접수 차단(보안 훅): ${created.violations.join(" / ")}`); return; }
      fdrInvalidateCounts();
      if (typeof notify === "function") notify(`${created.case.caseNo} 경보 접수 완료 (모의)`);
      fdrGo("cases", { id: created.case.id });
    });
  }
  const back = document.querySelector("[data-fdr-back]");
  if (back) back.addEventListener("click", () => {
    document.querySelectorAll("[data-role-filter]").forEach((entry) => entry.classList.remove("is-active"));
    activeView = "dashboard";
    activeDetailType = defaultDetailForView("dashboard");
    fdrState.view = "board"; fdrState.detail = null;
    if (window.location.hash !== "#dashboard") window.location.hash = "#dashboard";
    render();
  });
}
(function () {
  const prevBind = typeof bindModuleActions === "function" ? bindModuleActions : null;
  window.bindModuleActions = function () { if (prevBind) prevBind(); bindFdrActions(); };
})();
