/* RM 하네스 — menu/list views + 고객 정보 상세 패널. */

function rmoCaseListMarkup(rows) {
  const sorted = rmoSortByUrgency(rows);
  return rmoTableView(["케이스", "유형/은행", "담당/SLA", "상태"], sorted, (c) => `
    <li class="jbwc-row" data-rmo-open-case="${escapeHtml(c.id)}">
      <span class="jbwc-row-id">${escapeHtml(c.caseNo)}<br><span class="jbwc-row-note">${escapeHtml(c.customerAlias)} · ${escapeHtml(c.region)}</span></span>
      <span>${escapeHtml(rmoCaseTypeLabel(c.caseType))}<br><span class="jbwc-row-note">${escapeHtml(c.bank)} · ${escapeHtml(c.requestedAmountBand || "-")}</span></span>
      <span>${escapeHtml(rmoUserName(c.assignedRmId))}<br><span class="jbwc-row-note">SLA ${escapeHtml(c.dueAt || "-")}</span></span>
      <span>${rmoStagePill(rmoStageOf(c))} ${rmoRiskPill(c.riskLevel)}</span>
    </li>`);
}

function rmoDomainCases(typeKey, title) {
  const rows = rmoTable("rm_officer_cases", RMO_ROLE_KEY).filter((c) => c.caseType === typeKey);
  return rmoPanel(`${title} (${rows.length})`, rmoCaseListMarkup(rows)) + rmoMockNote();
}

/* 고객 정보 상세 패널(SUB 헤더의 '고객 정보' 버튼) — 익명 Ref 기준, 민감 원문 없음 */
function rmoDetailPanel() {
  if (!rmoState.infoCaseId) return "";
  const row = rmoTable("rm_officer_cases", RMO_ROLE_KEY).find((c) => c.id === rmoState.infoCaseId);
  if (!row) return "";
  return rmoCaseDetailMarkup(row);
}

function rmoCaseDetailMarkup(row) {
  const sources = (row.prioritySources || []).map((s) => `<span class="rmo-data-chip">${escapeHtml(s.label)}</span>`).join("");
  const evidence = rmoTable("rm_officer_evidence_items", RMO_ROLE_KEY).filter((x) => x.caseId === row.id).slice(0, 4);
  const audits = rmoTable("rm_officer_audit_logs", RMO_ROLE_KEY).filter((x) => x.caseId === row.id).slice(0, 4);
  return `<section class="workspace-panel jbwc-detail-panel" aria-label="RM 고객 정보 패널">
    <header>
      <div><p class="eyebrow">고객 정보(익명 Ref)</p><h3>${escapeHtml(row.caseNo)} · ${escapeHtml(row.customerAlias)}</h3></div>
      <div>${rmoStagePill(rmoStageOf(row))} ${rmoRiskPill(row.riskLevel)} <button class="secondary-button" type="button" data-rmo-clear-detail>닫기</button></div>
    </header>
    <div class="jbwc-detail-grid">
      <div><span>익명 고객 ID</span><strong>${escapeHtml(row.customerRefId)}</strong></div>
      <div><span>관리 은행/지역</span><strong>${escapeHtml(row.bank)} · ${escapeHtml(row.region)}</strong></div>
      <div><span>상담 유형</span><strong>${escapeHtml(rmoCaseTypeLabel(row.caseType))}</strong></div>
      <div><span>담당/팀</span><strong>${escapeHtml(rmoUserName(row.assignedRmId))} · ${escapeHtml(row.assignedTeam)}</strong></div>
      <div><span>요청 금액대</span><strong>${escapeHtml(row.requestedAmountBand || "-")}</strong></div>
      <div><span>우선순위</span><strong>${escapeHtml(RMO_PRIORITY_LABELS[row.priority] || row.priority)} (${escapeHtml(String(row.priorityScore))})</strong></div>
    </div>
    <p class="rmo-case-reason"><span aria-hidden="true">▎</span>우선순위 근거: ${escapeHtml(row.priorityReason)}</p>
    <div class="rmo-data-chips">${sources || '<span class="jbwc-row-note">연결된 출처 없음</span>'}</div>
    <div class="jbwc-grid">
      <article class="jbwc-card"><header><strong>근거 피드</strong><span class="nav-count">${evidence.length}</span></header>${evidence.map((e) => `<p class="jbwc-meta">${escapeHtml(e.title)} · ${escapeHtml(e.summary)}</p>`).join("") || '<p class="jbwc-meta">근거 없음</p>'}</article>
      <article class="jbwc-card"><header><strong>감사 로그</strong><span class="nav-count">${audits.length}</span></header>${audits.map((a) => `<p class="jbwc-meta">${escapeHtml(a.action)} · ${escapeHtml(a.createdAt)}</p>`).join("") || '<p class="jbwc-meta">감사 기록 없음</p>'}</article>
    </div>
    <p class="jbwc-guard">주민/전화/계좌 등 실제 개인정보는 저장·표시하지 않습니다. 모든 판단은 담당 RM 검토가 필요합니다.</p>
  </section>`;
}

const rmoCaseViewRenderers = {
  "consult-queue"() {
    const rows = rmoTable("rm_officer_consult_queue", RMO_ROLE_KEY);
    return rmoPanel(`여신 상담 큐 (${rows.filter((x) => ["pending", "inProgress"].includes(x.status)).length} 대기)`, rmoTableView(["상담", "채널/주제", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-rmo-open-case="${escapeHtml(x.caseId)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span><span>${escapeHtml(x.channel)}<br><span class="jbwc-row-note">${escapeHtml(x.topic)}</span></span><span>${escapeHtml(x.caseId)}</span><span>${rmoStatusPill(x.status)}</span></li>`)) + rmoMockNote();
  },
  approvals() {
    const rows = rmoTable("rm_officer_approvals", RMO_ROLE_KEY);
    return rmoPanel(`승인 라우팅 (${rows.filter((x) => x.status === "pending").length} 대기)`, rmoTableView(["요청", "유형", "관련 건", "결정"], rows, (a) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(a.id)}</span><span>${escapeHtml(a.approvalType)}</span><span>${escapeHtml(a.caseId)} · ${escapeHtml(rmoUserName(a.approverId))}</span><span>${a.status === "pending" ? `<button class="primary-button" type="button" data-rmo-approve-item="${escapeHtml(a.id)}" data-rmo-decision="approve">승인</button> <button class="secondary-button" type="button" data-rmo-approve-item="${escapeHtml(a.id)}" data-rmo-decision="reject">반려</button>` : rmoStatusPill(a.status)}</span></li>`))
      + `<p class="jbwc-guard">AI는 승인 라우팅 큐만 만들 수 있고 실제 승인/거절 결정은 담당자/승인권자가 합니다.</p>` + rmoMockNote();
  },
  "policy-checklists"() {
    const rows = rmoTable("rm_officer_policy_checklists", RMO_ROLE_KEY);
    return rmoPanel(`정책금융 체크리스트 (${rows.length})`, rmoTableView(["항목", "프로그램", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-rmo-open-case="${escapeHtml(x.caseId)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span><span>${escapeHtml(x.item)}<br><span class="jbwc-row-note">${escapeHtml(x.program)}</span></span><span>${escapeHtml(x.caseId)}</span><span>${rmoStatusPill(x.status)} ${x.reviewRequired ? '<span class="status-pill status-pending">확인 필요</span>' : ""}</span></li>`))
      + `<p class="jbwc-guard">정책자금 대상 여부는 확정하지 않습니다. 자격 확인 항목만 정리합니다.</p>` + rmoMockNote();
  },
  deliverables() {
    const rows = rmoTable("rm_officer_deliverables", RMO_ROLE_KEY);
    return rmoPanel(`통합 리포트 · 산출물 (${rows.length})`, rmoTableView(["파일", "구분", "관련 건", "요약"], rows, (d) => `
      <li class="jbwc-row" data-rmo-open-md="${escapeHtml(d.fileName)}" data-rmo-md-case="${escapeHtml(d.caseId)}"><span class="jbwc-row-id">${escapeHtml(d.fileName)}</span><span>${d.kind === "integrated" ? '<span class="status-pill status-new">통합본</span>' : '<span class="status-pill status-pending">개별</span>'}</span><span>${escapeHtml(d.caseId)}</span><span>${escapeHtml(d.summary)}</span></li>`))
      + `<p class="jbwc-guard">모든 산출물은 내부 업무 참고용입니다. 통합본 안에서 개별 md로 이동할 수 있습니다.</p>` + rmoMockNote();
  },
  cases() {
    const rows = rmoTable("rm_officer_cases", RMO_ROLE_KEY);
    return rmoPanel(`전체 케이스 (${rows.length})`, rmoCaseListMarkup(rows)) + rmoMockNote();
  },
  disaster() { return rmoDomainCases("disasterRisk", "재해·리스크 대응"); },
  repayment() { return rmoDomainCases("repaymentCare", "상환부담 관리"); },
  "daily-finance"() { return rmoDomainCases("dailyFinance", "생활금융 지원"); },
  "policy-startup"() { return rmoDomainCases("policyStartup", "정책·창업 금융"); },
  "agent-queue"() {
    const rows = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY);
    return rmoPanel(`AI 실행 큐 (${rows.filter((x) => ["pendingApproval", "running"].includes(x.status)).length} 대기)`, rmoTableView(["배정", "에이전트", "관련 건", "상태"], rows, (a) => `
      <li class="jbwc-row" data-rmo-open-case="${escapeHtml(a.caseId)}"><span class="jbwc-row-id">${escapeHtml(a.id)}</span><span>${escapeHtml(rmoAgentDisplayName(a.agentId))}<br><span class="jbwc-row-note">${escapeHtml(a.expectedOutput)} · ${escapeHtml(String(a.estimatedMinutes))}분</span></span><span>${escapeHtml(a.caseId)}</span><span>${rmoStatusPill(a.status)}</span></li>`)) + rmoMockNote();
  },
  "data-connectors"() {
    const rows = rmoTable("rm_officer_external_connectors", RMO_ROLE_KEY);
    return rmoPanel(`데이터 연결 상태 (${rows.length})`, rmoTableView(["커넥터", "분류", "최근 동기화", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span><span>${escapeHtml(x.name)}</span><span>${escapeHtml(x.category)} · ${escapeHtml(x.lastSyncAt || "-")}</span><span>${rmoStatusPill(x.health)} ${rmoStatusPill(x.dataMode)}</span></li>`)) + rmoMockNote();
  },
  roles() {
    const users = rmoTable("rm_officer_users", RMO_ROLE_KEY);
    const roles = rmoTable("rm_officer_role_assignments", RMO_ROLE_KEY);
    return rmoPanel(`담당자 (${users.length})`, rmoTableView(["담당자", "팀", "역할", "상태"], users, (u) => `<li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(u.id)}</span><span>${escapeHtml(u.name)}</span><span>${escapeHtml(u.team)} · ${escapeHtml(u.role)}</span><span>${rmoStatusPill(u.status)}</span></li>`))
      + rmoPanel(`권한 배정 (${roles.length})`, rmoTableView(["배정", "역할", "범위", "상태"], roles, (r) => `<li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(r.id)}</span><span>${escapeHtml(rmoUserName(r.userId))}</span><span>${escapeHtml(r.permissionScope)}</span><span>${rmoStatusPill(r.status)}</span></li>`)) + rmoMockNote();
  },
  "audit-logs"() {
    const rows = rmoTable("rm_officer_audit_logs", RMO_ROLE_KEY);
    return rmoPanel(`감사 기록 (${rows.length})`, rmoTableView(["기록", "행위", "대상", "상태"], rows, (a) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(a.createdAt)}<br>${escapeHtml(a.id)}</span><span>${escapeHtml(a.action)}<br><span class="jbwc-row-note">${escapeHtml(rmoUserName(a.actorId))}</span></span><span>${escapeHtml(a.targetType)} ${escapeHtml(a.targetId || "")}</span><span>${a.reviewRequired ? '<span class="status-pill status-escalated">검토 필요</span>' : '<span class="status-pill status-approved">기록됨</span>'} ${rmoRiskPill(a.riskLevel)}</span></li>`)) + rmoMockNote();
  },
};
