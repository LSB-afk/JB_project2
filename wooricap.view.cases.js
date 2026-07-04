/* JB우리캐피탈 운영 포털 — 케이스 목록/도메인/운영 현황 view 모음.
   모든 조회는 jbwcTable(table, JBWC_AFFILIATE_ID)로 계열사 스코프를 강제한다. */

function jbwcCaseListMarkup(rows) {
  return jbwcTableView(["운영 건", "도메인/상품", "담당", "상태"], rows, (c) => `
    <li class="jbwc-row" data-jbwc-open-case="${escapeHtml(c.id)}">
      <span class="jbwc-row-id">${escapeHtml(c.caseNo)}<br><span class="jbwc-row-note">${escapeHtml(c.title)}</span></span>
      <span>${escapeHtml(jbwcDomainLabel(c.domain))} · ${escapeHtml(c.productType)}</span>
      <span>${escapeHtml(jbwcUserName(c.assignedToId))}<br><span class="jbwc-row-note">SLA ${escapeHtml(c.dueAt || "-")}</span></span>
      <span>${jbwcStatusPill(c.status)} ${jbwcRiskPill(c.riskLevel)}</span>
    </li>`);
}

function jbwcDomainCases(domain, title) {
  const rows = jbwcTable("ops_cases", JBWC_AFFILIATE_ID).filter((c) => c.domain === domain);
  return jbwcPanel(`${title} (${rows.length})`, jbwcCaseListMarkup(rows)) + jbwcMockNote();
}

const jbwcCaseViewRenderers = {
  cases() {
    return jbwcPanel(`전체 운영 건 (${jbwcTable("ops_cases", JBWC_AFFILIATE_ID).length})`, jbwcCaseListMarkup(jbwcTable("ops_cases", JBWC_AFFILIATE_ID))) + jbwcMockNote();
  },
  approvals() {
    const rows = jbwcTable("approvals", JBWC_AFFILIATE_ID).filter((item) => item.status === "pending");
    return jbwcPanel(`승인 대기 (${rows.length})`, jbwcTableView(["승인 건", "유형", "요청/승인자", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.approvalType)}<br><span class="jbwc-row-note">${escapeHtml(x.caseId || "-")}</span></span>
        <span>${escapeHtml(jbwcUserName(x.requestedById))} → ${escapeHtml(jbwcUserName(x.approverId))}</span>
        <span>${jbwcStatusPill(x.status)}</span></li>`)) + jbwcMockNote();
  },
  "audit-logs"() {
    const rows = jbwcTable("audit_logs", JBWC_AFFILIATE_ID);
    return jbwcPanel(`감사 기록 (${rows.length} · 검토 필요 ${rows.filter((x) => x.reviewRequired).length})`,
      jbwcTableView(["기록", "행위", "대상", "상태"], rows, (x) => `
        <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.createdAt)}<br>${escapeHtml(x.id)}</span>
          <span>${escapeHtml(x.action)}<br><span class="jbwc-row-note">${escapeHtml(jbwcUserName(x.actorId))}</span></span>
          <span>${escapeHtml(x.targetType)} ${escapeHtml(x.targetId)}</span>
          <span>${x.reviewRequired ? '<span class="status-pill status-escalated">검토 필요</span>' : '<span class="status-pill status-approved">기록됨</span>'} ${jbwcRiskPill(x.riskLevel)}</span></li>`)) + jbwcMockNote();
  },
  "privacy-permissions"() {
    const checks = jbwcTable("privacy_permission_checks", JBWC_AFFILIATE_ID);
    const roles = jbwcTable("role_assignments", JBWC_AFFILIATE_ID);
    return jbwcPanel(`개인정보·권한 정책 점검 (${checks.length})`, jbwcTableView(["점검", "영역", "담당/기한", "상태"], checks, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.policyArea)}</span>
        <span>${escapeHtml(jbwcUserName(x.ownerId))} · 기한 ${escapeHtml(x.dueAt || "-")}</span>
        <span>${jbwcStatusPill(x.status)} ${jbwcRiskPill(x.riskLevel)}</span></li>`))
      + jbwcPanel(`권한 배정 (${roles.length})`, jbwcTableView(["배정", "역할", "범위", "상태"], roles, (x) => `
        <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
          <span>${escapeHtml(jbwcUserName(x.userId))} — ${escapeHtml(x.role)}</span>
          <span>${escapeHtml(x.permissionScope)}</span>
          <span>${jbwcStatusPill(x.status)} ${x.reviewRequired ? '<span class="status-pill status-pending">검토 필요</span>' : ""}</span></li>`)) + jbwcMockNote();
  },
  integrations() {
    const rows = jbwcTable("external_connectors", JBWC_AFFILIATE_ID);
    return jbwcPanel(`외부 데이터 연결 상태 (${rows.length})`, jbwcTableView(["커넥터", "분류", "최근 동기화", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.name)}</span>
        <span>${escapeHtml(x.category)} · ${escapeHtml(x.lastSyncAt || "-")}</span>
        <span>${jbwcStatusPill(x.health)} ${jbwcStatusPill(x.status)}</span></li>`)) + jbwcMockNote();
  },
  "ai-analysis"() {
    const rows = jbwcTable("ai_analysis_requests", JBWC_AFFILIATE_ID);
    return jbwcPanel(`AI 분석 요청 (${rows.length})`, jbwcTableView(["요청", "유형", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.requestType)}</span><span>${escapeHtml(x.caseId || "-")} · ${escapeHtml(jbwcUserName(x.requestedById))}</span>
        <span>${jbwcStatusPill(x.status)}</span></li>`)) + jbwcMockNote();
  },
  "ai-assist"() {
    const rows = jbwcTable("ai_recommendations", JBWC_AFFILIATE_ID);
    return jbwcPanel(`AI 업무지원 제안 (${rows.length})`, jbwcTableView(["제안", "에이전트", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.title)}<br><span class="jbwc-row-note">확신도 ${escapeHtml(x.confidence)}</span></span>
        <span>${escapeHtml(jbwcAgentDisplayName(x.agentId))} · ${escapeHtml(x.caseId || "-")}</span>
        <span>${jbwcStatusPill(x.status)}</span></li>`))
      + `<p class="jbwc-guard">AI 제안은 담당자가 확인·승인하기 전까지 실행되지 않습니다.</p>` + jbwcMockNote();
  },
  capabilities() {
    const rows = jbwcTable("business_capabilities", JBWC_AFFILIATE_ID);
    return jbwcPanel(`업무 기능 (${rows.length})`, jbwcTableView(["기능", "도메인", "제안 에이전트", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.name)}</span><span>${escapeHtml(jbwcDomainLabel(x.domain))} · ${escapeHtml(jbwcAgentDisplayName(x.proposedByAgentId) || "-")}</span>
        <span>${jbwcStatusPill(x.status)}</span></li>`)) + jbwcMockNote();
  },
  roles() {
    const users = jbwcTable("users", JBWC_AFFILIATE_ID);
    const rows = jbwcTable("role_assignments", JBWC_AFFILIATE_ID);
    return jbwcPanel(`담당자 (${users.length})`, jbwcTableView(["담당자", "팀", "역할", "상태"], users, (u) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(u.id)}</span>
        <span>${escapeHtml(u.name)}</span><span>${escapeHtml(u.team)} · ${escapeHtml(u.role)}</span><span>${jbwcStatusPill(u.status)}</span></li>`))
      + jbwcPanel(`권한 배정 (${rows.length})`, jbwcTableView(["배정", "역할", "범위", "상태"], rows, (x) => `
        <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
          <span>${escapeHtml(jbwcUserName(x.userId))} — ${escapeHtml(x.role)}</span><span>${escapeHtml(x.permissionScope)}</span>
          <span>${jbwcStatusPill(x.status)} ${x.reviewRequired ? '<span class="status-pill status-pending">검토 필요</span>' : ""}</span></li>`)) + jbwcMockNote();
  },
  inspections() {
    const rows = jbwcTable("inspection_schedules", JBWC_AFFILIATE_ID);
    return jbwcPanel(`정기 점검 (${rows.length})`, jbwcTableView(["점검", "유형", "담당/기한", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span><span>${escapeHtml(x.inspectionType)}</span>
        <span>${escapeHtml(jbwcUserName(x.ownerId))} · 기한 ${escapeHtml(x.dueAt || "-")}</span><span>${jbwcStatusPill(x.status)}</span></li>`)) + jbwcMockNote();
  },
  "consumer-protection"() {
    const rows = jbwcTable("consumer_protection_reviews", JBWC_AFFILIATE_ID);
    return jbwcPanel(`금융소비자보호 점검 (${rows.length})`, jbwcTableView(["점검", "유형", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span><span>${escapeHtml(x.reviewType)}</span>
        <span>${escapeHtml(x.caseId || "-")}</span><span>${jbwcStatusPill(x.status)} ${x.requiresHumanReview ? '<span class="status-pill status-pending">담당자 검토 필요</span>' : ""}</span></li>`))
      + `<p class="jbwc-guard">소비자보호·권리구제 관련 안내는 항상 담당자 확인이 필요합니다.</p>` + jbwcMockNote();
  },
  alerts() {
    const fds = jbwcTable("fds_alerts", JBWC_AFFILIATE_ID).filter((x) => ["high", "critical"].includes(x.severity) && x.status !== "resolved");
    const urgent = jbwcTable("customer_support_cases", JBWC_AFFILIATE_ID).filter((x) => x.priority === "urgent" && x.status !== "resolved");
    return jbwcPanel(`고위험 FDS 경보 (${fds.length})`, jbwcTableView(["경보", "유형", "관련 건", "상태"], fds, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span><span>${escapeHtml(x.alertType)}</span><span>${escapeHtml(x.caseId || "-")}</span>
        <span>${jbwcStatusPill(x.status)} ${x.requiresHumanEscalation ? '<span class="status-pill status-escalated">사람 검토 필수</span>' : ""}</span></li>`))
      + jbwcPanel(`긴급 민원 (${urgent.length})`, jbwcTableView(["민원", "분류", "담당", "상태"], urgent, (x) => `
        <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.caseNo)}</span><span>${escapeHtml(x.category)}</span>
          <span>${escapeHtml(jbwcUserName(x.assignedToId))}</span><span>${jbwcStatusPill(x.status)} ${jbwcRiskPill(x.riskLevel)}</span></li>`))
      + `<p class="jbwc-guard">고위험 경보는 자동 종결이 금지되며, 반드시 사람 판단을 거칩니다.</p>` + jbwcMockNote();
  },
  "personal-finance"() { return jbwcDomainCases("personalFinance", "개인금융 운영"); },
  "auto-finance"() { return jbwcDomainCases("autoFinance", "자동차금융 운영"); },
  "mortgage-secured"() { return jbwcDomainCases("mortgageSecured", "부동산/담보 금융"); },
  "enterprise-finance"() { return jbwcDomainCases("enterpriseFinance", "기업금융 운영"); },
  "customer-management"() { return jbwcDomainCases("customerManagement", "내 금융관리"); },
  documents() {
    const rows = jbwcTable("document_cases", JBWC_AFFILIATE_ID);
    return jbwcPanel(`전자약정·서류 (${rows.length})`, jbwcTableView(["문서", "유형", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span><span>${escapeHtml(x.documentType)}</span>
        <span>${escapeHtml(x.caseId || "-")} · 접수 ${escapeHtml(x.receivedAt || "-")}</span><span>${jbwcStatusPill(x.status)}</span></li>`)) + jbwcMockNote();
  },
  "vehicle-lifecycle"() {
    const rows = jbwcTable("vehicle_lifecycle_tasks", JBWC_AFFILIATE_ID);
    return jbwcPanel(`차량관리 태스크 (${rows.length})`, jbwcTableView(["태스크", "유형", "차량", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span><span>${escapeHtml(x.taskType)}</span>
        <span>${escapeHtml(x.vehicleRefId)} · 기한 ${escapeHtml(x.dueAt || "-")}</span><span>${jbwcStatusPill(x.status)}</span></li>`)) + jbwcMockNote();
  },
  fds() {
    const rows = jbwcTable("fds_alerts", JBWC_AFFILIATE_ID);
    return jbwcPanel(`FDS/보이스피싱 경보 (${rows.length})`, jbwcTableView(["경보", "유형", "심각도", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span><span>${escapeHtml(x.alertType)}</span>
        <span>${jbwcRiskPill(x.severity)}</span><span>${jbwcStatusPill(x.status)} ${x.requiresHumanEscalation ? '<span class="status-pill status-escalated">사람 검토 필수</span>' : ""}</span></li>`))
      + `<p class="jbwc-guard">고위험(high/critical) 경보 자동 종결 금지 — 사람 에스컬레이션 필수 정책이 적용됩니다.</p>` + jbwcMockNote();
  },
  complaints() {
    const rows = jbwcTable("customer_support_cases", JBWC_AFFILIATE_ID);
    return jbwcPanel(`민원/고객센터 (${rows.length})`, jbwcTableView(["민원", "분류", "담당", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jbwc-open-support="${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.caseNo)}</span>
        <span>${escapeHtml(x.category)}</span><span>${escapeHtml(jbwcUserName(x.assignedToId))}</span>
        <span>${jbwcStatusPill(x.status)} ${jbwcRiskPill(x.riskLevel)}</span></li>`)) + jbwcMockNote();
  },
};
