/* 전세사기 보호 담당자 역할 하네스 — 목록/현황 view 모음.
   모든 조회는 jpoTable(table, JPO_ROLE_KEY)로 role scope를 강제한다. */

function jpoCaseListMarkup(rows) {
  return jpoTableView(["전세보호 건", "업무 유형", "담당", "상태"], rows, (c) => `
    <li class="jbwc-row" data-jpo-open-case="${escapeHtml(c.id)}">
      <span class="jbwc-row-id">${escapeHtml(c.caseNo)}<br><span class="jbwc-row-note">${escapeHtml(c.title)}</span></span>
      <span>${escapeHtml(jpoTaskTypeLabel(c.taskType))} · ${escapeHtml(c.depositAmountBand || "-")}</span>
      <span>${escapeHtml(jpoUserName(c.assignedToId))}<br><span class="jbwc-row-note">SLA ${escapeHtml(c.dueAt || "-")}</span></span>
      <span>${jpoStatusPill(c.status)} ${jpoRiskPill(c.riskLevel)}${c.vulnerableTenant ? ' <span class="status-pill status-pending">취약고객</span>' : ""}</span>
    </li>`);
}

function jpoCasesByTaskTypes(taskTypes, title) {
  const rows = jpoTable("jeonse_cases", JPO_ROLE_KEY).filter((c) => taskTypes.includes(c.taskType));
  return jpoPanel(`${title} (${rows.length})`, jpoCaseListMarkup(rows));
}

const jpoCaseViewRenderers = {
  cases() {
    const rows = jpoTable("jeonse_cases", JPO_ROLE_KEY);
    return jpoPanel(`전체 전세보호 건 (${rows.length})`, jpoCaseListMarkup(rows)) + jpoMockNote();
  },
  approvals() {
    const rows = jpoTable("approvals", JPO_ROLE_KEY).filter((item) => item.status === "pending");
    return jpoPanel(`승인 대기 (${rows.length})`, jpoTableView(["승인 건", "유형", "요청/승인자", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-approval="${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.approvalType)}<br><span class="jbwc-row-note">${escapeHtml(x.caseId || "-")}</span></span>
        <span>${escapeHtml(jpoUserName(x.requestedById))} → ${escapeHtml(jpoUserName(x.approverId))}</span>
        <span>${jpoStatusPill(x.status)} <button class="secondary-button" type="button" data-jpo-approve="${escapeHtml(x.id)}">승인</button></span></li>`))
      + `<p class="jbwc-guard">고객 안내문·지원기관 연계·위험등급 변경은 담당자 승인 없이는 실행되지 않습니다.</p>` + jpoMockNote();
  },
  "audit-logs"() {
    const rows = jpoTable("audit_logs", JPO_ROLE_KEY);
    return jpoPanel(`감사 기록 (${rows.length} · 검토 필요 ${rows.filter((x) => x.reviewRequired).length})`,
      jpoTableView(["기록", "행위", "대상", "상태"], rows, (x) => `
        <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.createdAt)}<br>${escapeHtml(x.id)}</span>
          <span>${escapeHtml(x.action)}<br><span class="jbwc-row-note">${escapeHtml(jpoUserName(x.actorId))}</span></span>
          <span>${escapeHtml(x.targetType)} ${escapeHtml(x.targetId)}</span>
          <span>${x.reviewRequired ? '<span class="status-pill status-escalated">검토 필요</span>' : '<span class="status-pill status-approved">기록됨</span>'} ${jpoRiskPill(x.riskLevel)}</span></li>`)) + jpoMockNote();
  },
  "privacy-permissions"() {
    const checks = jpoTable("privacy_permission_checks", JPO_ROLE_KEY);
    return jpoPanel(`개인정보·권한 정책 점검 (${checks.length})`, jpoTableView(["점검", "영역", "담당/기한", "상태"], checks, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.policyArea)}</span>
        <span>${escapeHtml(jpoUserName(x.ownerId))} · 기한 ${escapeHtml(x.dueAt || "-")}</span>
        <span>${jpoStatusPill(x.status)} ${jpoRiskPill(x.riskLevel)}</span></li>`))
      + `<p class="jbwc-guard">실명·주민번호·상세주소 원문 저장 금지 — 익명화된 Ref(TENANT-REF-* 등)만 사용합니다.</p>` + jpoMockNote();
  },
  integrations() {
    const rows = jpoTable("external_connectors", JPO_ROLE_KEY);
    return jpoPanel(`외부 데이터 연결 상태 (${rows.length})`, jpoTableView(["커넥터", "분류", "최근 동기화", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.name)}<br><span class="jbwc-row-note">${escapeHtml(x.externalRef || "-")}</span></span>
        <span>${escapeHtml(x.category)} · ${escapeHtml(x.lastSyncAt || "-")}</span>
        <span>${jpoStatusPill(x.health)} ${jpoStatusPill(x.status)}</span></li>`))
      + jpoOfficialRefNote() + jpoMockNote();
  },
  "pre-contract-risk"() {
    const rows = jpoTable("jeonse_risk_assessments", JPO_ROLE_KEY).filter((x) => x.kind === "preContract");
    return jpoPanel(`계약 전 위험 점검 (${rows.length})`, jpoTableView(["점검", "전세가율 구간", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-detail="risk:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.ratioBand)}</span><span>${escapeHtml(x.caseId || "-")}</span>
        <span>${jpoStatusPill(x.status)} ${jpoRiskPill(x.riskLevel)}</span></li>`))
      + jpoCasesByTaskTypes(["preContractRisk"], "계약 전 위험 케이스") + jpoMockNote();
  },
  "price-ratio"() {
    const rows = jpoTable("jeonse_price_ratio_checks", JPO_ROLE_KEY);
    return jpoPanel(`전세가율·시세 점검 (${rows.length})`, jpoTableView(["점검", "전세가율 구간", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-detail="price:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.ratioBand)}<br><span class="jbwc-row-note">${escapeHtml(x.checkType)}</span></span>
        <span>${escapeHtml(x.caseId || "-")}</span>
        <span>${jpoStatusPill(x.status)} ${jpoRiskPill(x.riskLevel)}</span></li>`))
      + `<p class="jbwc-guard">전세가율은 구간(band)으로만 표시하며 확정 시세 판단을 하지 않습니다.</p>` + jpoMockNote();
  },
  "registry-rights"() {
    const rows = jpoTable("jeonse_registry_checks", JPO_ROLE_KEY);
    return jpoPanel(`권리관계·등기 점검 (${rows.length})`, jpoTableView(["점검", "이슈 유형", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-detail="registry:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.issueType)}</span><span>${escapeHtml(x.caseId || "-")}</span>
        <span>${jpoStatusPill(x.status)} ${jpoRiskPill(x.riskLevel)}</span></li>`))
      + `<p class="jbwc-guard">등기 원문은 저장하지 않고 이슈 유형과 참조 ID만 관리합니다.</p>` + jpoMockNote();
  },
  "guarantee-hug"() {
    const rows = jpoTable("jeonse_guarantee_reviews", JPO_ROLE_KEY);
    return jpoPanel(`보증보험·HUG 연계 검토 (${rows.length})`, jpoTableView(["검토", "프로그램(안내 후보)", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-detail="guarantee:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.reviewType)}<br><span class="jbwc-row-note">${escapeHtml(x.guaranteeProgram || "-")}</span></span>
        <span>${escapeHtml(x.caseId || "-")}</span>
        <span>${jpoStatusPill(x.status)} ${x.requiresHumanReview ? '<span class="status-pill status-pending">담당자 검토 필요</span>' : ""}</span></li>`))
      + `<p class="jbwc-guard">보증보험 가입 가능 여부는 확정하지 않습니다 — 요건 검토 항목과 안내 후보만 제시합니다. 최신 기준 담당자 확인 필요.</p>` + jpoMockNote();
  },
  "auction-support"() {
    const rows = jpoTable("jeonse_referrals", JPO_ROLE_KEY).filter((x) => x.category === "auction");
    return jpoPanel(`경공매·피해지원 큐 (${rows.length})`, jpoTableView(["지원 건", "안내 후보", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-detail="referral:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.referralType)}<br><span class="jbwc-row-note">${escapeHtml(x.supportProgram || "-")}</span></span>
        <span>${escapeHtml(x.caseId || "-")}</span>
        <span>${jpoStatusPill(x.status)} ${x.requiresHumanReview ? '<span class="status-pill status-pending">담당자 검토 필요</span>' : ""}</span></li>`))
      + `<p class="jbwc-guard">우선매수·퇴거 유예 등은 '신청 대행'이 아니라 '안내 후보'입니다. 고위험 경공매 건은 자동 종결이 금지됩니다.</p>` + jpoMockNote();
  },
  "support-referrals"() {
    const rows = jpoTable("jeonse_referrals", JPO_ROLE_KEY).filter((x) => ["legal", "care"].includes(x.category));
    return jpoPanel(`법률·심리·주거 지원 연계 (${rows.length})`, jpoTableView(["연계 건", "안내 후보", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-detail="referral:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.referralType)}<br><span class="jbwc-row-note">${escapeHtml(x.supportProgram || "-")}</span></span>
        <span>${escapeHtml(x.caseId || "-")}</span>
        <span>${jpoStatusPill(x.status)} ${x.requiresHumanReview ? '<span class="status-pill status-pending">담당자 검토 필요</span>' : ""}</span></li>`))
      + `<p class="jbwc-guard">법률 자문은 확정 제공하지 않으며, 연계 기관 안내 후보만 정리합니다.</p>` + jpoMockNote();
  },
  "victim-decision"() {
    const rows = jpoTable("jeonse_victim_support_reviews", JPO_ROLE_KEY);
    return jpoPanel(`피해자 결정 신청 보조 (${rows.length})`, jpoTableView(["검토", "체크리스트", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-detail="victim:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.reviewType)}<br><span class="jbwc-row-note">${escapeHtml((x.checklist || []).slice(0, 2).join(" · ") || "-")}</span></span>
        <span>${escapeHtml(x.caseId || "-")}</span>
        <span>${jpoStatusPill(x.status)} <span class="status-pill status-pending">담당자 검토 필요</span></span></li>`))
      + `<p class="jbwc-guard">국토부 지원관리시스템의 신청 흐름을 참고한 준비 보조 화면입니다. 실제 신청 대행이 아니며, 피해자 결정 가능 여부를 확정하지 않습니다.</p>`
      + jpoOfficialRefNote() + jpoMockNote();
  },
  alerts() {
    const rows = jpoTable("jeonse_alerts", JPO_ROLE_KEY).filter((x) => ["high", "critical"].includes(x.severity) && x.status !== "resolved");
    return jpoPanel(`긴급 위험 알림 (${rows.length})`, jpoTableView(["경보", "유형", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-detail="alert:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.alertType)}</span><span>${escapeHtml(x.caseId || "-")}</span>
        <span>${jpoRiskPill(x.severity)} ${jpoStatusPill(x.status)} ${x.requiresHumanEscalation ? '<span class="status-pill status-escalated">사람 검토 필수</span>' : ""}</span></li>`))
      + `<p class="jbwc-guard">high/critical 위험은 자동 종결이 금지되며 반드시 사람 에스컬레이션을 유지합니다.</p>` + jpoMockNote();
  },
  "vulnerable-tenants"() {
    const rows = jpoTable("jeonse_risk_assessments", JPO_ROLE_KEY).filter((x) => x.kind === "vulnerableTenant");
    return jpoPanel(`취약고객 보호 검토 (${rows.length})`, jpoTableView(["검토", "체크리스트", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-detail="risk:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml((x.checklist || []).join(" · ") || "-")}</span>
        <span>${escapeHtml(x.caseId || "-")}</span>
        <span>${jpoStatusPill(x.status)} ${jpoRiskPill(x.riskLevel)}</span></li>`))
      + jpoCasesByTaskTypes(["vulnerableTenant"], "취약고객 케이스") + jpoMockNote();
  },
  "ai-analysis"() {
    const rows = jpoTable("ai_analysis_requests", JPO_ROLE_KEY);
    return jpoPanel(`AI 분석 요청 (${rows.length})`, jpoTableView(["요청", "유형", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.requestType)}</span><span>${escapeHtml(x.caseId || "-")} · ${escapeHtml(jpoUserName(x.requestedById))}</span>
        <span>${jpoStatusPill(x.status)}</span></li>`)) + jpoMockNote();
  },
  "ai-assist"() {
    const rows = jpoTable("ai_recommendations", JPO_ROLE_KEY);
    return jpoPanel(`AI 업무지원 제안 (${rows.length})`, jpoTableView(["제안", "에이전트", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-detail="recommendation:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.title)}<br><span class="jbwc-row-note">확신도 ${escapeHtml(x.confidence)}</span></span>
        <span>${escapeHtml(jpoAgentDisplayName(x.agentId))} · ${escapeHtml(x.caseId || "-")}</span>
        <span>${jpoStatusPill(x.status)}</span></li>`))
      + `<p class="jbwc-guard">AI 제안은 담당자가 확인·승인하기 전까지 실행되지 않습니다.</p>` + jpoMockNote();
  },
  capabilities() {
    const rows = jpoTable("business_capabilities", JPO_ROLE_KEY);
    return jpoPanel(`업무 기능 (${rows.length})`, jpoTableView(["기능", "도메인", "제안 에이전트", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.name)}</span><span>${escapeHtml(x.domain)} · ${escapeHtml(jpoAgentDisplayName(x.proposedByAgentId))}</span>
        <span>${jpoStatusPill(x.status)}</span></li>`)) + jpoMockNote();
  },
  roles() {
    const users = jpoTable("users", JPO_ROLE_KEY);
    const rows = jpoTable("role_assignments", JPO_ROLE_KEY);
    return jpoPanel(`담당자 (${users.length})`, jpoTableView(["담당자", "팀", "역할", "상태"], users, (u) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(u.id)}</span>
        <span>${escapeHtml(u.name)}</span><span>${escapeHtml(u.team)} · ${escapeHtml(u.role)}</span><span>${jpoStatusPill(u.status)}</span></li>`))
      + jpoPanel(`권한 배정 (${rows.length})`, jpoTableView(["배정", "역할", "범위", "상태"], rows, (x) => `
        <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
          <span>${escapeHtml(jpoUserName(x.userId))} — ${escapeHtml(x.role)}</span><span>${escapeHtml(x.permissionScope)}</span>
          <span>${jpoStatusPill(x.status)} ${x.reviewRequired ? '<span class="status-pill status-pending">검토 필요</span>' : ""}</span></li>`)) + jpoMockNote();
  },
  inspections() {
    const rows = jpoTable("inspection_schedules", JPO_ROLE_KEY);
    return jpoPanel(`정기 점검 (${rows.length})`, jpoTableView(["점검", "유형", "담당/기한", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span><span>${escapeHtml(x.inspectionType)}</span>
        <span>${escapeHtml(jpoUserName(x.ownerId))} · 기한 ${escapeHtml(x.dueAt || "-")}</span><span>${jpoStatusPill(x.status)}</span></li>`)) + jpoMockNote();
  },
};
