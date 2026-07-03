/* 전세사기 보호 하네스 — service/query 레이어 (v2).
   모든 query는 jpoTable(table, JPO_ROLE_KEY)로 role scope 고정.
   생성/실행/승인/감사 지점은 harness hook을 경유한다(보안 기본값). */

function jpoActiveCase(row) {
  return JPO_ACTIVE_CASE_STATUSES.includes(row.status);
}

function getJeonseProtectionSidebarCounts() {
  const t = (name) => jpoTable(name, JPO_ROLE_KEY);
  const cases = t("jeonse_cases");
  const active = cases.filter(jpoActiveCase);
  const snapshots = t("jeonse_price_snapshots");
  const signals = t("jeonse_risk_signals");
  const referrals = t("jeonse_support_referrals");
  const runsNeedingReview = t("jeonse_agent_runs").filter((x) => ["queued", "running", "needsReview", "pendingApproval"].includes(x.status)).length;
  const agentsNeedingReview = t("harness_agents").filter((x) => ["needsReview", "escalated"].includes(x.status)).length;
  const openSignal = (type) => signals.filter((x) => x.signalType === type).length;
  const docPending = (item) => (item.docChecklist || []).some(([, state]) => ["누락", "확인 필요"].includes(state));

  return {
    board: active.length,
    cases: cases.length,
    priceEnrich: active.filter((x) => x.status === "enriching" || x.sourceMode === "fallback").length,
    registryCheck: t("jeonse_registry_checks").filter((x) => x.manualRequired || x.status === "unknown").length,
    guaranteeCheck: t("jeonse_guarantee_checks").filter((x) => x.manualRequired || x.status === "unknown").length,
    victimApplication: referrals.filter((x) => x.referralType === "victimApplication" && ["open", "pending"].includes(x.status)).length,
    urgentAuction: active.filter((x) => x.auctionNoticed).length,
    priceRisk: openSignal("JEONSE_RATIO_HIGH") + openSignal("DEPOSIT_OVER_OFFICIAL_PRICE"),
    rentComparables: snapshots.filter((x) => Number(x.comparableRentCount) > 0).length,
    saleComparables: snapshots.filter((x) => Number(x.comparableTradeCount) > 0).length,
    officialPrice: snapshots.filter((x) => Number(x.officialPriceEst) > 0).length,
    buildingCheck: openSignal("ILLEGAL_BUILDING_MANUAL_REQUIRED")
      + t("jeonse_registry_checks").filter((x) => String(x.checkType).includes("건축물") && x.status !== "verified").length,
    landlordRisk: openSignal("LANDLORD_RISK_MANUAL_REQUIRED"),
    intakeConsult: active.filter((x) => ["etcConsult", "legalConsult", "guaranteeInquiry", "depositDelay"].includes(x.intakeType)).length,
    victimGuide: active.filter((x) => ["victimApplication", "auctionNotice", "depositDelay"].includes(x.intakeType)).length,
    docChecklist: cases.filter(docPending).length,
    legalReferral: referrals.filter((x) => x.referralType === "legal" && ["open", "pending"].includes(x.status)).length,
    financeHousingReferral: referrals.filter((x) => x.referralType === "financeHousing" && ["open", "pending"].includes(x.status)).length,
    careReferral: referrals.filter((x) => x.referralType === "care" && ["open", "pending"].includes(x.status)).length,
    aiAnalysis: t("ai_analysis_requests").filter((x) => ["queued", "running"].includes(x.status)).length,
    aiConsultSummary: t("ai_recommendations").filter((x) => x.kind === "consultSummary" && ["proposed", "pendingApproval", "active"].includes(x.status)).length,
    agentHarness: runsNeedingReview + agentsNeedingReview,
    dataConnectors: t("external_connectors").filter((x) => ["degraded", "down", "manualRequired"].includes(x.health) || ["error", "manualRequired"].includes(x.status)).length,
    roles: t("role_assignments").filter((x) => ["active", "needsReview"].includes(x.status) || x.reviewRequired === true).length,
    auditLogs: t("jeonse_audit_logs").filter((x) => x.reviewRequired === true).length,
    inspections: t("inspection_schedules").filter((x) => ["upcoming", "overdue"].includes(x.status)).length,
    approvals: t("approvals").filter((x) => x.status === "pending").length,
  };
}

function getJeonseProtectionSidebarCountsAsync() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try { resolve(getJeonseProtectionSidebarCounts()); } catch (error) { reject(error); }
    }, 120);
  });
}

/* 개인정보 원문 검색 차단 */
function jpoSearchBlockedReason(query) {
  const q = String(query || "");
  if (/\d{6}-?[1-4]\d{6}/.test(q)) return "주민등록번호 형식은 검색할 수 없습니다.";
  if (/01[016789][-\s]?\d{3,4}[-\s]?\d{4}/.test(q)) return "전화번호 형식은 검색할 수 없습니다.";
  if (/\d{11,}/.test(q)) return "계좌번호로 추정되는 숫자열은 검색할 수 없습니다.";
  return null;
}

function searchJeonseProtectionRecords(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];
  if (jpoSearchBlockedReason(q)) return [];
  const users = jpoTable("users", JPO_ROLE_KEY);
  const userName = (id) => (users.find((u) => u.id === id) || {}).name || "";
  const hit = (value) => String(value || "").toLowerCase().includes(q);
  const out = [];

  jpoTable("jeonse_cases", JPO_ROLE_KEY).forEach((c) => {
    if (hit(c.caseNo) || hit(c.customerRefId) || hit(c.addressMasked) || hit(c.buildingName)
      || hit(c.lawdCode) || hit(c.housingType) || hit((JPO_HOUSING_TYPES[c.housingType] || {}).label)
      || (c.tags || []).some(hit) || hit(userName(c.assignedToId))) {
      out.push({ kind: "case", view: "cases", id: c.id, label: `${c.caseNo} · ${c.addressMasked}`, sub: `${(JPO_HOUSING_TYPES[c.housingType] || {}).label || c.housingType} · ${JPO_STATUS_LABELS[c.status] || c.status}` });
    }
  });
  jpoTable("jeonse_risk_signals", JPO_ROLE_KEY).forEach((x) => {
    if (hit(x.title) || hit(x.signalType) || hit(x.id)) out.push({ kind: "signal", view: "price-risk", id: x.id, label: `${x.id} · ${x.title}`, sub: `위험 신호 · ${JPO_RISK_LABELS[x.severity] || x.severity}` });
  });
  jpoTable("jeonse_price_snapshots", JPO_ROLE_KEY).forEach((x) => {
    if (hit(x.id) || hit(x.lawdCode) || hit(x.source)) out.push({ kind: "snapshot", view: "price-enrich", id: x.id, label: `${x.id} · ${x.lawdCode}`, sub: `시세 스냅샷 · ${JPO_STATUS_LABELS[x.sourceMode] || x.sourceMode}` });
  });
  jpoTable("jeonse_registry_checks", JPO_ROLE_KEY).forEach((x) => {
    if (hit(x.checkType) || hit(x.id)) out.push({ kind: "registry", view: "registry-check", id: x.id, label: `${x.id} · ${x.checkType}`, sub: `권리관계 · ${JPO_STATUS_LABELS[x.status] || x.status}` });
  });
  jpoTable("jeonse_guarantee_checks", JPO_ROLE_KEY).forEach((x) => {
    if (hit(x.provider) || hit(x.id)) out.push({ kind: "guarantee", view: "guarantee-check", id: x.id, label: `${x.id} · ${x.provider}`, sub: `보증 확인 · ${JPO_STATUS_LABELS[x.status] || x.status}` });
  });
  jpoTable("jeonse_support_referrals", JPO_ROLE_KEY).forEach((x) => {
    if (hit(x.referralType) || hit(x.targetAgency) || hit(x.status) || hit(x.id)) out.push({ kind: "referral", view: "support-referral", id: x.id, label: `${x.id} · ${x.targetAgency}`, sub: `지원 연계 · ${JPO_STATUS_LABELS[x.status] || x.status}` });
  });
  return out.slice(0, 16);
}

function searchJeonseProtectionRecordsAsync(query) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const blocked = jpoSearchBlockedReason(query);
        if (blocked) { resolve({ blocked }); return; }
        resolve({ results: searchJeonseProtectionRecords(query) });
      } catch (error) { reject(error); }
    }, 150);
  });
}

/* ---------- hook shim / 감사 헬퍼 ---------- */
function jpoRunHook(hookName, payload) {
  if (typeof harnessRunHooks !== "function") return { ok: true, violations: [] };
  return harnessRunHooks("jeonse-protection", hookName, payload);
}

function jpoScopedRow(row) {
  return { roleKey: JPO_ROLE_KEY, workspaceId: JPO_WORKSPACE_ID, ...row };
}

function jpoWriteAudit(row) {
  const audit = jpoScopedRow(row);
  jpoRunHook("onAuditWrite", { audit });
  return jpoInsert("jeonse_audit_logs", audit);
}

function jpoActorForTeam(team, fallback) {
  const found = jpoTable("users", JPO_ROLE_KEY).find((user) => user.team === team && user.status === "active");
  return found ? found.id : fallback || "USR-JPO-RISK-01";
}

/* ---------- triage 미리보기 (동기: 스냅샷 기준) ---------- */
function previewJeonseProtectionTriage(form) {
  const market = form.enrichedMarket || jpoMarketSnapshotSync(form.housingType, form.lawdCode);
  const assessment = computeJeonseRiskAssessment({ ...form, market });
  const intake = JPO_INTAKE_TYPES[form.intakeType] || JPO_INTAKE_TYPES.preContract;
  const recommendedAgent = jeonseProtectionRoutingRules[form.intakeType] || "jpo-intake";
  const initialStatus = assessment.requiresHumanReview
    ? "humanReview"
    : market.sourceMode === "fallback" ? "enriching" : "riskReview";
  const handoffs = [{ toAgentId: recommendedAgent, reason: `${intake.label} 라우팅` }];
  if (market.sourceMode !== "live_api") handoffs.push({ toAgentId: "jpo-dataquality", reason: "데이터 품질/증적 점검" });
  if (["high", "critical"].includes(assessment.riskLevel)) handoffs.push({ toAgentId: "jpo-supervisor", reason: "고위험 — 사람 검토 추적" });
  return {
    market,
    assessment,
    intake,
    recommendedAgent,
    recommendedTeam: intake.team,
    initialStatus,
    handoffs,
    // 하네스 lastRun/명령 표시용 호환 필드
    riskOverride: assessment.riskLevel,
    slaDueAt: form.dueAt || new Date().toISOString().slice(0, 10),
    requiresHumanReview: assessment.requiresHumanReview,
    escalationRequired: ["high", "critical"].includes(assessment.riskLevel),
  };
}

/* ---------- 시세 데이터 보강 (비동기, live=1이면 실API) ---------- */
async function enrichJeonseCase(caseId) {
  const item = jpoTable("jeonse_cases", JPO_ROLE_KEY).find((row) => row.id === caseId);
  if (!item) return null;
  const market = await fetchJeonseMarketData({ housingType: item.housingType, lawdCode: item.lawdCode, dealYm: "202605" });
  const assessment = computeJeonseRiskAssessment({ ...item, market });
  const now = new Date().toISOString().slice(0, 10);
  jpoInsert("jeonse_price_snapshots", jpoScopedRow({
    id: jpoNextId("JEONSE-SNAP", "jeonse_price_snapshots"),
    caseId,
    source: market.source,
    sourceMode: market.sourceMode,
    lawdCode: item.lawdCode,
    dealYm: "202605",
    saleMedian: market.saleMedian,
    jeonseMedian: market.jeonseMedian,
    rentMedian: market.jeonseMedian,
    jeonseRatio: assessment.jeonseRatio != null ? Number(assessment.jeonseRatio.toFixed(2)) : null,
    comparableCount: Number(market.comparableTradeCount || 0) + Number(market.comparableRentCount || 0),
    comparableTradeCount: market.comparableTradeCount,
    comparableRentCount: market.comparableRentCount,
    officialPriceEst: assessment.officialPriceEst,
    fetchedAt: now,
  }));
  assessment.signals.forEach((signal) => {
    jpoInsert("jeonse_risk_signals", jpoScopedRow({
      id: jpoNextId("JEONSE-SIG", "jeonse_risk_signals"),
      caseId,
      ...signal,
      createdAt: now,
    }));
  });
  const db = jpoRepository.snapshot();
  const target = db.jeonse_cases.find((row) => row.id === caseId);
  target.riskLevel = assessment.riskLevel;
  target.requiresHumanReview = assessment.requiresHumanReview;
  target.sourceMode = market.sourceMode;
  if (["received", "enriching"].includes(target.status)) {
    target.status = assessment.requiresHumanReview ? "humanReview" : "riskReview";
  }
  target.updatedAt = now;
  jpoSaveDb();
  jpoWriteAudit({
    id: jpoNextId("AUD-JPO", "jeonse_audit_logs"),
    caseId,
    actorId: "jpo-price",
    action: market.sourceMode === "fallback" ? "DATA_FETCH_FAILED" : "DATA_FETCHED",
    targetType: "price_snapshot",
    targetId: caseId,
    riskLevel: assessment.riskLevel,
    reviewRequired: market.sourceMode === "fallback",
    createdAt: now,
  });
  jpoWriteAudit({
    id: jpoNextId("AUD-JPO", "jeonse_audit_logs"),
    caseId,
    actorId: "jpo-price",
    action: "RISK_UPDATED",
    targetType: "jeonse_case",
    targetId: caseId,
    riskLevel: assessment.riskLevel,
    reviewRequired: assessment.requiresHumanReview,
    createdAt: now,
  });
  return { market, assessment };
}

function jpoApprovalTypeForIntake(intakeType) {
  if (intakeType === "victimApplication") return "피해자 신청 검토 승인";
  if (intakeType === "guaranteeInquiry") return "보증 확인 검토 승인";
  if (["auctionNotice", "depositDelay"].includes(intakeType)) return "긴급 대응 검토 승인";
  if (intakeType === "legalConsult") return "법률 연계 검토 승인";
  return "담당자 검토";
}

/* ---------- 신규 접수 저장 ---------- */
function createJeonseProtectionCase(form) {
  const now = new Date().toISOString().slice(0, 10);
  const guard = jpoRunHook("beforeCaseCreate", form);
  if (!guard.ok) {
    jpoWriteAudit({
      id: jpoNextId("AUD-JPO", "jeonse_audit_logs"),
      actorId: form.assignedToId || "USR-JPO-RISK-01",
      action: "JPO_HOOK_BLOCKED_CASE_CREATE",
      targetType: "hook",
      targetId: "beforeCaseCreate",
      riskLevel: "medium",
      reviewRequired: true,
      note: guard.violations.join(" / "),
      createdAt: now,
    });
    return { blocked: true, violations: guard.violations };
  }

  const triage = previewJeonseProtectionTriage(form);
  const { market, assessment } = triage;
  const id = jpoNextId("JEONSE", "jeonse_cases");
  const assignedToId = form.assignedToId || jpoActorForTeam(triage.recommendedTeam, "USR-JPO-RISK-01");
  const refSeq = String(Math.floor(1000 + Math.random() * 9000));
  const jeonseCase = jpoScopedRow({
    id,
    caseNo: id,
    customerRefId: form.customerRefId || `CUST-JS-${refSeq}`,
    intakeType: form.intakeType,
    housingType: form.housingType,
    contractType: form.contractType || "jeonse",
    addressMasked: form.addressMasked || `${market.region || "지역 미상"} ***`,
    lawdCode: form.lawdCode,
    buildingName: form.buildingName || "",
    areaSize: Number(form.areaSize || 0),
    floor: Number(form.floor || 0),
    builtYear: Number(form.builtYear || 0),
    depositAmount: Number(form.depositAmount || 0),
    monthlyRentAmount: Number(form.monthlyRentAmount || 0),
    contractStartDate: form.contractStartDate || "",
    contractEndDate: form.contractEndDate || "",
    status: triage.initialStatus,
    priority: form.priority || ((JPO_INTAKE_TYPES[form.intakeType] || {}).urgent ? "urgent" : "normal"),
    riskLevel: assessment.riskLevel,
    requiresHumanReview: assessment.requiresHumanReview,
    registryStatus: form.registryStatus || "unknown",
    guaranteeStatus: form.guaranteeStatus || "unknown",
    buildingCheckStatus: form.buildingCheckStatus || "unknown",
    seniorLienEntered: Boolean(form.seniorLienEntered),
    auctionNoticed: Boolean(form.auctionNoticed),
    auctionDeadline: form.auctionDeadline || "",
    docsReady: Boolean(form.docsReady),
    docChecklist: form.docsReady ? [["임대차계약서", "보유"]] : [["임대차계약서", "확인 필요"]],
    sourceMode: market.sourceMode,
    sourceChannel: form.sourceChannel || "opsPortal",
    tags: Array.isArray(form.tags) ? form.tags : String(form.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    assignedTeam: form.assignedTeam || triage.recommendedTeam,
    assignedToId,
    dueAt: form.dueAt || now,
    createdAt: now,
    updatedAt: now,
  });

  jpoInsert("jeonse_cases", jeonseCase);
  jpoRunHook("afterCaseCreate", { caseRow: jeonseCase });

  jpoInsert("jeonse_price_snapshots", jpoScopedRow({
    id: jpoNextId("JEONSE-SNAP", "jeonse_price_snapshots"),
    caseId: id,
    source: market.source,
    sourceMode: market.sourceMode,
    lawdCode: jeonseCase.lawdCode,
    dealYm: "202605",
    saleMedian: market.saleMedian,
    jeonseMedian: market.jeonseMedian,
    rentMedian: market.jeonseMedian,
    jeonseRatio: assessment.jeonseRatio != null ? Number(assessment.jeonseRatio.toFixed(2)) : null,
    comparableCount: Number(market.comparableTradeCount || 0) + Number(market.comparableRentCount || 0),
    comparableTradeCount: market.comparableTradeCount,
    comparableRentCount: market.comparableRentCount,
    officialPriceEst: assessment.officialPriceEst,
    fetchedAt: now,
  }));
  assessment.signals.forEach((signal) => {
    jpoInsert("jeonse_risk_signals", jpoScopedRow({
      id: jpoNextId("JEONSE-SIG", "jeonse_risk_signals"),
      caseId: id,
      ...signal,
      createdAt: now,
    }));
  });
  if (jeonseCase.registryStatus !== "verified") {
    jpoInsert("jeonse_registry_checks", jpoScopedRow({
      id: jpoNextId("JEONSE-REG", "jeonse_registry_checks"),
      caseId: id,
      checkType: "선순위·압류·신탁 확인",
      status: "unknown",
      evidenceSummary: "등기부 요약 확인 필요(원문 저장 금지)",
      manualRequired: true,
      dueAt: jeonseCase.dueAt,
    }));
  }
  if (["rowHouse", "multiHousehold"].includes(jeonseCase.housingType) && jeonseCase.buildingCheckStatus !== "verified") {
    jpoInsert("jeonse_registry_checks", jpoScopedRow({
      id: jpoNextId("JEONSE-REG", "jeonse_registry_checks"),
      caseId: id,
      checkType: "건축물대장/위반건축물 확인",
      status: "unknown",
      evidenceSummary: "위반건축물 여부 수동 확인 필요",
      manualRequired: true,
      dueAt: jeonseCase.dueAt,
    }));
  }
  if (jeonseCase.guaranteeStatus === "unknown" || form.intakeType === "guaranteeInquiry") {
    jpoInsert("jeonse_guarantee_checks", jpoScopedRow({
      id: jpoNextId("JEONSE-HUG", "jeonse_guarantee_checks"),
      caseId: id,
      provider: "HUG",
      status: "unknown",
      evidenceSummary: "가입요건 확인 필요 — 가입 가능 여부 확정 금지",
      manualRequired: true,
      checkedAt: "",
    }));
  }
  if (["victimApplication", "legalConsult", "auctionNotice", "depositDelay"].includes(form.intakeType)) {
    const referralType = form.intakeType === "legalConsult" ? "legal" : "victimApplication";
    jpoInsert("jeonse_support_referrals", jpoScopedRow({
      id: jpoNextId("JEONSE-REF", "jeonse_support_referrals"),
      caseId: id,
      referralType,
      targetAgency: referralType === "legal" ? "법률구조 상담(안내 후보)" : "전세사기피해자 지원관리시스템(참고)",
      status: "open",
      notes: "안내 후보 — 최신 기준 담당자 확인 필요",
      createdAt: now,
    }));
  }
  jpoWriteAudit({
    id: jpoNextId("AUD-JPO", "jeonse_audit_logs"),
    caseId: id,
    actorId: assignedToId,
    action: "CASE_CREATED",
    targetType: "jeonse_case",
    targetId: id,
    riskLevel: jeonseCase.riskLevel,
    reviewRequired: jeonseCase.requiresHumanReview,
    createdAt: now,
  });
  jpoWriteAudit({
    id: jpoNextId("AUD-JPO", "jeonse_audit_logs"),
    caseId: id,
    actorId: "jpo-price",
    action: market.sourceMode === "fallback" ? "DATA_FETCH_FAILED" : "DATA_FETCHED",
    targetType: "price_snapshot",
    targetId: id,
    riskLevel: assessment.riskLevel,
    reviewRequired: market.sourceMode === "fallback",
    createdAt: now,
  });
  jpoInsert("ai_analysis_requests", jpoScopedRow({
    id: jpoNextId("AIR-JPO", "ai_analysis_requests"),
    caseId: id,
    requestType: "전세 위험 triage 분석",
    status: "queued",
    requestedById: assignedToId,
    createdAt: now,
  }));
  recordJeonseProtectionAgentRun({
    agentId: triage.recommendedAgent,
    caseId: id,
    inputSummary: `${triage.intake.label} · ${jeonseCase.addressMasked}`,
    outputSummary: `위험도 ${JPO_RISK_LABELS[assessment.riskLevel] || assessment.riskLevel} · ${assessment.signals.length}개 신호 · ${JPO_SOURCE_MODES[market.sourceMode]}`,
    status: assessment.requiresHumanReview ? "needsReview" : "queued",
    riskLevel: assessment.riskLevel,
    requiresHumanReview: assessment.requiresHumanReview,
    requiresHumanEscalation: ["high", "critical"].includes(assessment.riskLevel),
    handoffs: triage.handoffs,
  });
  if (jeonseCase.requiresHumanReview || ["high", "critical"].includes(jeonseCase.riskLevel)) {
    jpoInsert("approvals", jpoScopedRow({
      id: jpoNextId("APR-JPO", "approvals"),
      caseId: id,
      approvalType: jpoApprovalTypeForIntake(form.intakeType),
      status: "pending",
      requestedById: assignedToId,
      approverId: jpoActorForTeam("내부통제팀", "USR-JPO-AUD-01"),
      requestedAt: now,
    }));
  }
  return { case: jeonseCase, triage, assessment };
}

/* ---------- 에이전트 실행 기록 ---------- */
function recordJeonseProtectionAgentRun(run) {
  const today = new Date().toISOString().slice(0, 10);
  const beforeGuard = jpoRunHook("beforeAgentRun", {
    agentId: run.agentId,
    riskLevel: run.riskLevel || "low",
    status: run.status || "completed",
    inputSummary: run.inputSummary,
  });
  if (!beforeGuard.ok) {
    run = { ...run, status: "needsReview" };
  }
  const row = jpoScopedRow({
    id: jpoNextId("JEONSE-RUN", "jeonse_agent_runs"),
    agentId: run.agentId,
    caseId: run.caseId || null,
    inputSummary: run.inputSummary,
    outputSummary: run.outputSummary,
    status: run.status || "completed",
    riskLevel: run.riskLevel || "low",
    requiresHumanReview: Boolean(run.requiresHumanReview),
    requiresHumanEscalation: Boolean(run.requiresHumanEscalation),
    createdAt: today,
  });
  jpoInsert("jeonse_agent_runs", row);
  const afterGuard = jpoRunHook("afterAgentRun", { run: row });
  if (!beforeGuard.ok || !afterGuard.ok) {
    jpoWriteAudit({
      id: jpoNextId("AUD-JPO", "jeonse_audit_logs"),
      actorId: run.agentId,
      action: "JPO_HOOK_VIOLATION_AGENT_RUN",
      targetType: "agent_run",
      targetId: row.id,
      riskLevel: "medium",
      reviewRequired: true,
      note: beforeGuard.violations.concat(afterGuard.violations).join(" / "),
      createdAt: today,
    });
  }
  (run.handoffs || []).forEach((handoff) => {
    jpoInsert("agent_handoffs", jpoScopedRow({
      id: jpoNextId("HND-JPO", "agent_handoffs"),
      fromAgentId: run.agentId,
      toAgentId: handoff.toAgentId,
      caseId: run.caseId || null,
      reason: handoff.reason,
      status: run.requiresHumanEscalation ? "escalated" : "open",
      createdAt: today,
    }));
  });
  jpoWriteAudit({
    id: jpoNextId("AUD-JPO", "jeonse_audit_logs"),
    actorId: run.agentId,
    action: "JPO_AGENT_RUN",
    targetType: "agent_run",
    targetId: row.id,
    riskLevel: row.riskLevel,
    reviewRequired: Boolean(run.requiresHumanEscalation) || ["needsReview", "pendingApproval"].includes(row.status),
    createdAt: today,
  });
  return row;
}

/* ---------- 승인 결정 (사람) ---------- */
function jpoDecideApproval(approvalId, decision, decidedBy) {
  const db = jpoRepository.snapshot();
  const approval = (db.approvals || []).find((row) => row.id === approvalId && row.roleKey === JPO_ROLE_KEY);
  if (!approval || approval.status !== "pending") return null;
  const actor = decidedBy || jpoActorForTeam("내부통제팀", "USR-JPO-AUD-01");
  const guard = jpoRunHook("afterApprovalDecision", { approval, decidedBy: actor, decision });
  if (!guard.ok) return { blocked: true, violations: guard.violations };
  approval.status = decision === "reject" ? "rejected" : "approved";
  approval.decidedById = actor;
  approval.decidedAt = new Date().toISOString().slice(0, 10);
  jpoSaveDb();
  jpoWriteAudit({
    id: jpoNextId("AUD-JPO", "jeonse_audit_logs"),
    caseId: approval.caseId || null,
    actorId: actor,
    action: "JPO_APPROVAL_DECIDED",
    targetType: "approval",
    targetId: approval.id,
    riskLevel: "low",
    reviewRequired: false,
    note: `${approval.approvalType} — ${approval.status}`,
    createdAt: approval.decidedAt,
  });
  return { approval };
}

/* ---------- 하네스 샘플 실행 ---------- */
function runJeonseProtectionSampleRequest(key) {
  const sample = jeonseProtectionSampleRequests.find((item) => item.key === key);
  if (!sample) return null;
  const baseCase = jpoTable("jeonse_cases", JPO_ROLE_KEY).find((c) => c.id === sample.caseId) || {};
  const form = {
    intakeType: sample.intakeType,
    housingType: baseCase.housingType || "rowHouse",
    lawdCode: baseCase.lawdCode || "11500",
    depositAmount: baseCase.depositAmount || 200000000,
    registryStatus: sample.registryUnknown ? "unknown" : baseCase.registryStatus || "verified",
    guaranteeStatus: baseCase.guaranteeStatus || "unknown",
    auctionNoticed: sample.intakeType === "auctionNotice",
    auctionDeadline: baseCase.auctionDeadline || "",
    contractEndDate: baseCase.contractEndDate || "",
  };
  const triage = previewJeonseProtectionTriage(form);
  const agentId = sample.commsDraft ? "jpo-comms" : triage.recommendedAgent;
  const agent = jeonseProtectionAgents.find((item) => item.id === agentId);
  const riskLevel = sample.riskLevel || triage.assessment.riskLevel;

  if (sample.commsDraft) {
    const draftText = `[초안] ${sample.text} — 임차인(CUST-JS Ref) 대상 안내 후보, 공유는 담당자 승인 후 진행됩니다.`;
    const msgGuard = jpoRunHook("beforeCustomerMessage", { draftText, customerFacing: true, approvalStatus: "pending" });
    if (!msgGuard.ok) return { sample, triage, agent, blocked: true, violations: msgGuard.violations };
  }
  const run = recordJeonseProtectionAgentRun({
    agentId,
    caseId: sample.caseId,
    inputSummary: sample.text,
    outputSummary: `${agent ? agent.displayName : agentId} · ${JPO_STATUS_LABELS[triage.initialStatus] || triage.initialStatus} · 내부 운영 참고용 · 담당자 검토 필요`,
    status: sample.commsDraft ? "pendingApproval" : triage.assessment.requiresHumanReview ? "needsReview" : "completed",
    riskLevel,
    requiresHumanReview: triage.assessment.requiresHumanReview || Boolean(sample.commsDraft),
    requiresHumanEscalation: ["high", "critical"].includes(riskLevel),
    handoffs: triage.handoffs,
  });
  if (sample.commsDraft) {
    jpoInsert("approvals", jpoScopedRow({
      id: jpoNextId("APR-JPO", "approvals"),
      caseId: sample.caseId || null,
      approvalType: "고객 안내문 발송 승인",
      status: "pending",
      requestedById: "jpo-comms",
      approverId: jpoActorForTeam("내부통제팀", "USR-JPO-AUD-01"),
      requestedAt: new Date().toISOString().slice(0, 10),
    }));
  }
  return { sample, triage, agent, run };
}
