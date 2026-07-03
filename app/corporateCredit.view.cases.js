/* 기업여신 하네스 — menu/list views. */

function ccrCaseListMarkup(rows) {
  return ccrTableView(["케이스", "도메인/상품", "담당/SLA", "상태"], rows, (c) => `
    <li class="jbwc-row" data-ccr-open-case="${escapeHtml(c.id)}">
      <span class="jbwc-row-id">${escapeHtml(c.caseNo)}<br><span class="jbwc-row-note">${escapeHtml(c.companyAlias)} · ${escapeHtml(c.borrowerRefId)}</span></span>
      <span>${escapeHtml(ccrDomainLabel(c.domain))}<br><span class="jbwc-row-note">${escapeHtml(c.productType)} · ${escapeHtml(c.requestedAmountBand)}</span></span>
      <span>${escapeHtml(ccrUserName(c.assignedRmId))}<br><span class="jbwc-row-note">SLA ${escapeHtml(c.dueAt || "-")}</span></span>
      <span>${ccrStatusPill(c.status)} ${ccrRiskPill(c.riskLevel)}</span>
    </li>`);
}

function ccrRiskSignalMarkup(rows) {
  return ccrTableView(["신호", "근거", "관련 건", "심각도"], rows, (x) => `
    <li class="jbwc-row" data-ccr-open-detail="signal:${escapeHtml(x.id)}">
      <span class="jbwc-row-id">${escapeHtml(x.id)}<br><span class="jbwc-row-note">${escapeHtml(x.signalType)}</span></span>
      <span>${escapeHtml(x.title)}<br><span class="jbwc-row-note">${escapeHtml(x.evidence || "-")}</span></span>
      <span>${escapeHtml(x.caseId || "-")}</span>
      <span>${ccrRiskPill(x.severity)} ${x.requiresHumanReview ? '<span class="status-pill status-pending">담당자 검토</span>' : ""}</span>
    </li>`);
}

function ccrDomainCases(domainKey, title) {
  const rows = ccrTable("corporate_credit_cases", CCR_ROLE_KEY).filter((c) => c.domain === domainKey);
  return ccrPanel(`${title} (${rows.length})`, ccrCaseListMarkup(rows)) + ccrMockNote();
}

const ccrCaseViewRenderers = {
  intake() {
    const rows = ccrTable("corporate_credit_cases", CCR_ROLE_KEY).filter((c) => ["received", "intakeScreening", "docsCollecting"].includes(c.status));
    return ccrPanel(`신규/보완 접수 (${rows.length})`, ccrCaseListMarkup(rows)) + ccrMockNote();
  },
  "doc-review"() {
    const docs = ccrTable("corporate_credit_documents", CCR_ROLE_KEY);
    return ccrPanel(`심사 패키지 점검 (${docs.length})`, ccrTableView(["서류", "유형", "관련 건", "상태"], docs, (d) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(d.id)}</span><span>${escapeHtml(d.documentType)}</span><span>${escapeHtml(d.caseId)}</span><span>${ccrStatusPill(d.status)} ${d.reviewRequired ? '<span class="status-pill status-pending">보완</span>' : ""}</span></li>`)) + ccrMockNote();
  },
  approvals() {
    const rows = ccrTable("corporate_credit_approvals", CCR_ROLE_KEY);
    return ccrPanel(`승인권자 검토 대기 (${rows.filter((x) => x.status === "pending").length})`, ccrTableView(["요청", "유형", "관련 건", "상태"], rows, (a) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(a.id)}</span><span>${escapeHtml(a.approvalType)}</span><span>${escapeHtml(a.caseId)} · ${escapeHtml(ccrUserName(a.approverId))}</span><span>${ccrStatusPill(a.status)}</span></li>`))
      + `<p class="jbwc-guard">AI는 승인권자 검토 큐를 만들 수 있지만 실제 승인/거절은 처리하지 않습니다.</p>` + ccrMockNote();
  },
  "audit-logs"() {
    const rows = ccrTable("corporate_credit_audit_logs", CCR_ROLE_KEY);
    return ccrPanel(`리스크/감사 기록 (${rows.length})`, ccrTableView(["기록", "행위", "대상", "상태"], rows, (a) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(a.createdAt)}<br>${escapeHtml(a.id)}</span><span>${escapeHtml(a.action)}<br><span class="jbwc-row-note">${escapeHtml(ccrUserName(a.actorId))}</span></span><span>${escapeHtml(a.targetType)} ${escapeHtml(a.targetId)}</span><span>${a.reviewRequired ? '<span class="status-pill status-escalated">검토 필요</span>' : '<span class="status-pill status-approved">기록됨</span>'} ${ccrRiskPill(a.riskLevel)}</span></li>`)) + ccrMockNote();
  },
  cases() {
    const rows = ccrTable("corporate_credit_cases", CCR_ROLE_KEY);
    return ccrPanel(`전체 기업여신 케이스 (${rows.length})`, ccrCaseListMarkup(rows)) + ccrMockNote();
  },
  "working-capital"() { return ccrDomainCases("workingCapital", "운전자금"); },
  "facility-loan"() { return ccrDomainCases("facilityLoan", "시설자금"); },
  "guarantee-backed"() { return ccrDomainCases("guaranteeBackedLoan", "보증서 담보"); },
  collateral() { return ccrDomainCases("movableCollateralLoan", "동산·매출채권 담보"); },
  "trade-finance"() { return ccrDomainCases("tradeFinance", "외환·무역금융"); },
  "policy-esg"() { return ccrDomainCases("policyEsgLoan", "정책·ESG 금융"); },
  "pf-structured"() { return ccrDomainCases("pfStructuredFinance", "PF·구조화 금융"); },
  renewals() { return ccrDomainCases("renewalModification", "만기연장·조건변경"); },
  "early-warning"() {
    const rows = ccrTable("corporate_credit_risk_signals", CCR_ROLE_KEY).filter((x) => ["EARLY_WARNING_SIGNAL", "STRUCTURED_FINANCE_ESCALATION"].includes(x.signalType) || ["high", "critical"].includes(x.severity));
    return ccrPanel(`조기경보/EWS (${rows.length})`, ccrRiskSignalMarkup(rows)) + ccrMockNote();
  },
  "npl-monitoring"() {
    const rows = ccrTable("corporate_credit_cases", CCR_ROLE_KEY).filter((c) => c.domain === "earlyWarningNpl" || ["high", "critical"].includes(c.riskLevel));
    return ccrPanel(`연체·NPL 모니터링 (${rows.length})`, ccrCaseListMarkup(rows)) + ccrMockNote();
  },
  "collateral-maturity"() {
    const rows = ccrTable("corporate_credit_collateral_checks", CCR_ROLE_KEY);
    const guarantees = ccrTable("corporate_credit_guarantee_checks", CCR_ROLE_KEY);
    return ccrPanel(`담보·보증 만기 점검 (${rows.length + guarantees.length})`, ccrTableView(["점검", "유형/기관", "관련 건", "상태"], rows.concat(guarantees), (x) => `
      <li class="jbwc-row" data-ccr-open-detail="${x.provider ? "guarantee" : "collateral"}:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span><span>${escapeHtml(x.collateralType || x.provider)}</span><span>${escapeHtml(x.caseId || "-")}</span><span>${ccrStatusPill(x.status)}</span></li>`)) + ccrMockNote();
  },
  "covenant-checks"() {
    const rows = ccrTable("corporate_credit_tasks", CCR_ROLE_KEY).filter((t) => /만기|약정|covenant|사후/.test(t.title));
    return ccrPanel(`약정조건/Covenant 점검 (${rows.length})`, ccrTableView(["태스크", "내용", "담당/기한", "상태"], rows, (t) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(t.id)}</span><span>${escapeHtml(t.title)}</span><span>${escapeHtml(ccrUserName(t.ownerId))} · ${escapeHtml(t.dueAt || "-")}</span><span>${ccrStatusPill(t.status)}</span></li>`)) + ccrMockNote();
  },
  "ai-analysis"() {
    const rows = ccrTable("corporate_credit_agent_runs", CCR_ROLE_KEY);
    return ccrPanel(`AI 분석 요청 (${rows.length})`, ccrTableView(["실행", "에이전트", "입력→결과", "상태"], rows, (r) => `
      <li class="jbwc-row" data-ccr-open-detail="run:${escapeHtml(r.id)}"><span class="jbwc-row-id">${escapeHtml(r.createdAt)}<br>${escapeHtml(r.id)}</span><span>${escapeHtml(ccrAgentDisplayName(r.agentId))}</span><span>${escapeHtml(r.inputSummary)}<br><span class="jbwc-row-note">${escapeHtml(r.outputSummary)}</span></span><span>${ccrStatusPill(r.status)} ${ccrRiskPill(r.riskLevel)}</span></li>`)) + ccrMockNote();
  },
  "memo-drafts"() {
    const rows = ccrTable("corporate_credit_credit_memos", CCR_ROLE_KEY);
    return ccrPanel(`여신메모 초안 (${rows.length})`, ccrTableView(["메모", "요약", "관련 건", "상태"], rows, (m) => `
      <li class="jbwc-row" data-ccr-open-detail="memo:${escapeHtml(m.id)}"><span class="jbwc-row-id">${escapeHtml(m.id)}</span><span>${escapeHtml(m.title)}<br><span class="jbwc-row-note">${escapeHtml(m.summary)}</span></span><span>${escapeHtml(m.caseId)}</span><span>${ccrStatusPill(m.status)}</span></li>`))
      + `<p class="jbwc-guard">여신메모는 내부 검토 초안입니다. 승인·거절·금리·한도·신용평가 표현은 가드레일로 차단됩니다.</p>` + ccrMockNote();
  },
  "data-connectors"() {
    const rows = ccrTable("corporate_credit_external_connectors", CCR_ROLE_KEY);
    return ccrPanel(`데이터 연결 상태 (${rows.length})`, ccrTableView(["커넥터", "분류", "최근 동기화", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span><span>${escapeHtml(x.name)}</span><span>${escapeHtml(x.category)} · ${escapeHtml(x.lastSyncAt || "-")}</span><span>${ccrStatusPill(x.health)} ${ccrStatusPill(x.dataMode)}</span></li>`)) + ccrMockNote();
  },
  roles() {
    const users = ccrTable("corporate_credit_users", CCR_ROLE_KEY);
    const roles = ccrTable("corporate_credit_role_assignments", CCR_ROLE_KEY);
    return ccrPanel(`담당자 (${users.length})`, ccrTableView(["담당자", "팀", "역할", "상태"], users, (u) => `<li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(u.id)}</span><span>${escapeHtml(u.name)}</span><span>${escapeHtml(u.team)} · ${escapeHtml(u.role)}</span><span>${ccrStatusPill(u.status)}</span></li>`))
      + ccrPanel(`권한 배정 (${roles.length})`, ccrTableView(["배정", "역할", "범위", "상태"], roles, (r) => `<li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(r.id)}</span><span>${escapeHtml(ccrUserName(r.userId))}</span><span>${escapeHtml(r.permissionScope)}</span><span>${ccrStatusPill(r.status)}</span></li>`)) + ccrMockNote();
  },
  inspections() {
    const rows = ccrTable("corporate_credit_inspection_schedules", CCR_ROLE_KEY);
    return ccrPanel(`정기 점검 (${rows.length})`, ccrTableView(["점검", "유형", "담당/기한", "상태"], rows, (x) => `<li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span><span>${escapeHtml(x.inspectionType)}</span><span>${escapeHtml(ccrUserName(x.ownerId))} · ${escapeHtml(x.dueAt)}</span><span>${ccrStatusPill(x.status)}</span></li>`)) + ccrMockNote();
  },
};
