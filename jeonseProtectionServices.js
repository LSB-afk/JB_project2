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
    capabilityRepository: (jeonseFraudProtectionHarness.skills || []).length,
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
      out.push({ kind: "case", view: "cases", id: c.id, label: `${jpoCaseNoLabel(c.caseNo)} · ${c.addressMasked}`, sub: `${(JPO_HOUSING_TYPES[c.housingType] || {}).label || c.housingType} · ${JPO_STATUS_LABELS[c.status] || c.status}` });
    }
  });
  jpoTable("jeonse_risk_signals", JPO_ROLE_KEY).forEach((x) => {
    if (hit(x.title) || hit(x.signalType) || hit(x.id)) out.push({ kind: "signal", view: "price-risk", id: x.id, label: `${x.id} · ${x.title}`, sub: `위험 신호 · ${JPO_RISK_LABELS[x.severity] || x.severity}` });
  });
  jpoTable("jeonse_price_snapshots", JPO_ROLE_KEY).forEach((x) => {
    if (hit(x.id) || hit(x.lawdCode) || hit(x.source)) out.push({ kind: "snapshot", view: "price-enrich", id: x.id, label: `${jpoSnapshotLabel(x.id)} · ${x.lawdCode}`, sub: `시세 비교 기록 · ${JPO_STATUS_LABELS[x.sourceMode] || x.sourceMode}` });
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

function jpoCaseDeliverables(caseId) {
  return jpoTable("jeonse_deliverables", JPO_ROLE_KEY)
    .filter((item) => item.caseId === caseId)
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

function jpoParseQueueNodeId(nodeId) {
  const parts = String(nodeId || "").split("__");
  if (parts.length < 4 || parts[0] !== "JPO_NODE") return null;
  return { caseId: parts[1], kind: parts[2], agentId: parts.slice(3).join("__") };
}

function jpoDeliverableFileName(row, agentId, kind = "agentMd") {
  const suffix = {
    "jpo-intake": "routing",
    "jpo-price": "price-risk",
    "jpo-registry": "registry-checklist",
    "jpo-guarantee": "guarantee-check",
    "jpo-auction": "auction-action",
    "jpo-victim": "victim-docs",
    "jpo-legal": "legal-referral",
    "jpo-comms": "consult-summary",
    "jpo-dataquality": "source-quality",
    "jpo-supervisor": "review-gate",
    "jpo-report": "case-brief",
  }[agentId] || "agent-note";
  return `${row.caseNo || row.id}-${kind === "caseReport" ? "case-brief" : suffix}.md`;
}

function jpoBuildAgentDeliverableBody(row, agentId, run) {
  const info = typeof jpoAgentNodeInfo === "function" ? jpoAgentNodeInfo(agentId, row) : { role: agentId, data: "케이스 데이터", output: "내부 참고 산출물" };
  const signals = typeof jpoCaseSignals === "function" ? jpoCaseSignals(row.id, 4) : [];
  const chips = typeof jpoCaseDataChips === "function" ? jpoCaseDataChips(row).slice(0, 6) : [];
  return [
    `# ${row.caseNo} ${jpoAgentDisplayName(agentId)} 산출물`,
    "",
    "## Summary",
    `- 역할: ${info.role}`,
    `- 케이스: ${jpoCaseSituationLine(row)}`,
    `- 실행 결과: ${run.outputSummary}`,
    "",
    "## Evidence",
    ...(signals.length ? signals.map((signal) => `- ${signal.title}: ${signal.evidence || "근거 확인 필요"}`) : ["- 등록된 위험 신호 없음"]),
    ...(chips.length ? chips.map((chip) => `- 근거 데이터: ${chip}`) : []),
    "",
    "## Next Action",
    `- ${jpoCaseNextAction(row)}`,
    "- 고객 공유, 피해자 결정, 법률 판단, 보증 가능성 확정은 담당자 승인 전 금지",
    "",
    "## Human Approval",
    `- 검토 필요: ${run.requiresHumanReview ? "예" : "담당자 확인 후 진행"}`,
  ].join("\n");
}

function jpoBuildCaseReportBody(row) {
  const deliverables = jpoCaseDeliverables(row.id).filter((item) => item.kind === "agentMd");
  const audits = jpoTable("jeonse_audit_logs", JPO_ROLE_KEY).filter((audit) => audit.caseId === row.id).slice(0, 6);
  return [
    `# ${row.caseNo} 전세보호 통합 브리프`,
    "",
    "## Case Summary",
    `- ${jpoCaseSituationLine(row)}`,
    `- 위험도: ${JPO_RISK_LABELS[row.riskLevel] || row.riskLevel}`,
    `- 현재 상태: ${jpoStatusLabel(row.status)}`,
    "",
    "## Agent Deliverables",
    ...(deliverables.length ? deliverables.map((item) => `- ${item.fileName}: ${item.title} (${jpoStatusLabel(item.status)})`) : ["- 생성된 에이전트 산출물 없음"]),
    "",
    "## Audit Trail",
    ...(audits.length ? audits.map((audit) => `- ${audit.createdAt || "-"} ${audit.action} by ${audit.actorId}`) : ["- 감사 기록 없음"]),
    "",
    "## Guardrail",
    "- 이 브리프는 내부 운영 참고용이며 전세사기 여부, 법률 자문, 보증 가입, 피해자 결정, 고객 발송을 확정하지 않습니다.",
  ].join("\n");
}

function jpoInsertDeliverable(row) {
  const deliverable = jpoScopedRow(row);
  jpoInsert("jeonse_deliverables", deliverable);
  jpoWriteAudit({
    id: jpoNextId("AUD-JPO", "jeonse_audit_logs"),
    caseId: deliverable.caseId,
    actorId: deliverable.agentId || "jpo-report",
    action: "JPO_DELIVERABLE_CREATED",
    targetType: "jeonse_deliverable",
    targetId: deliverable.id,
    riskLevel: deliverable.riskLevel || "medium",
    reviewRequired: Boolean(deliverable.requiresHumanReview),
    note: deliverable.fileName,
    createdAt: deliverable.createdAt,
  });
  return deliverable;
}

function jpoEnsureApprovalForCase(row, approvalType, requestedById) {
  const existing = jpoTable("approvals", JPO_ROLE_KEY).find((item) => (
    item.caseId === row.id && item.approvalType === approvalType && item.status === "pending"
  ));
  if (existing) return existing;
  return jpoInsert("approvals", jpoScopedRow({
    id: jpoNextId("APR-JPO", "approvals"),
    caseId: row.id,
    approvalType,
    status: "pending",
    requestedById,
    approverId: jpoActorForTeam("내부통제팀", "USR-JPO-AUD-01"),
    requestedAt: new Date().toISOString().slice(0, 10),
  }));
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
    uploadedFiles: (form.uploadedFiles || []).map((file) => file.fileName || file.name).filter(Boolean),
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

  (form.uploadedFiles || []).forEach((file) => {
    jpoInsert("jeonse_evidence_files", jpoScopedRow({
      id: jpoNextId("JPO-FILE", "jeonse_evidence_files"),
      caseId: id,
      fileName: file.fileName || file.name || "evidence-file",
      fileType: file.fileType || file.type || "application/octet-stream",
      fileSize: Number(file.fileSize || file.size || 0),
      status: "metadataOnly",
      analysisSummary: file.analysisSummary || "업로드 파일 메타데이터 수집 — 원문 저장 없이 에이전트 확인 후보로 사용",
      usedByAgents: triage.handoffs.map((handoff) => handoff.toAgentId).filter(Boolean),
      uploadedAt: now,
    }));
  });
  if ((form.uploadedFiles || []).length) {
    jpoWriteAudit({
      id: jpoNextId("AUD-JPO", "jeonse_audit_logs"),
      caseId: id,
      actorId: assignedToId,
      action: "JPO_FILE_METADATA_CAPTURED",
      targetType: "jeonse_evidence_file",
      targetId: id,
      riskLevel: "medium",
      reviewRequired: true,
      note: `${form.uploadedFiles.length}개 파일 메타데이터`,
      createdAt: now,
    });
  }

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
    caseId: run.caseId || null,
    actorId: run.agentId,
    action: "AGENT_RUN_CREATED",
    targetType: "agent_run",
    targetId: row.id,
    riskLevel: row.riskLevel,
    reviewRequired: Boolean(run.requiresHumanEscalation) || ["needsReview", "pendingApproval"].includes(row.status),
    createdAt: today,
  });
  return row;
}

function runJeonseProtectionQueueNode(caseId, nodeId) {
  const parsed = jpoParseQueueNodeId(nodeId);
  const targetCaseId = parsed?.caseId || caseId;
  const row = jpoTable("jeonse_cases", JPO_ROLE_KEY).find((item) => item.id === targetCaseId || item.caseNo === targetCaseId);
  if (!row) return null;
  const today = new Date().toISOString().slice(0, 10);
  const agentId = parsed?.agentId || "jpo-intake";

  if (parsed?.kind === "approval" || agentId === "jpo-report") {
    const deliverable = jpoInsertDeliverable({
      id: jpoNextId("JPO-MD", "jeonse_deliverables"),
      caseId: row.id,
      agentId: "jpo-report",
      kind: "caseReport",
      title: "통합 케이스 브리프·액션 플랜·증적 로그",
      fileName: jpoDeliverableFileName(row, "jpo-report", "caseReport"),
      status: row.requiresHumanReview || ["high", "critical"].includes(row.riskLevel) ? "pendingApproval" : "needsReview",
      riskLevel: row.riskLevel,
      requiresHumanReview: true,
      body: jpoBuildCaseReportBody(row),
      createdAt: today,
    });
    const approval = jpoEnsureApprovalForCase(row, "통합 브리프/고객 안내 전 담당자 승인", "jpo-report");
    return { case: row, deliverable, approval };
  }

  const info = typeof jpoAgentNodeInfo === "function" ? jpoAgentNodeInfo(agentId, row) : { role: agentId, output: "내부 참고 산출물" };
  const requiresHumanReview = row.requiresHumanReview || ["high", "critical"].includes(row.riskLevel)
    || ["jpo-comms", "jpo-supervisor", "jpo-victim", "jpo-legal", "jpo-auction"].includes(agentId);
  const status = agentId === "jpo-comms" ? "pendingApproval" : requiresHumanReview ? "needsReview" : "completed";
  const handoffs = [];
  if (agentId === "jpo-auction" || ["high", "critical"].includes(row.riskLevel)) {
    handoffs.push({ toAgentId: "jpo-supervisor", reason: "고위험/긴급 케이스 — 사람 승인 게이트" });
  }
  if (agentId === "jpo-comms") {
    handoffs.push({ toAgentId: "jpo-supervisor", reason: "고객 안내문 발송 승인 필요" });
  }
  const run = recordJeonseProtectionAgentRun({
    agentId,
    caseId: row.id,
    inputSummary: `${row.caseNo} · ${info.data || info.role}`,
    outputSummary: `${info.output || "내부 참고 산출물"} 생성 · ${requiresHumanReview ? "담당자 검토 필요" : "검토 후보 정리"}`,
    status,
    riskLevel: row.riskLevel,
    requiresHumanReview,
    requiresHumanEscalation: ["high", "critical"].includes(row.riskLevel) || agentId === "jpo-auction",
    handoffs,
  });
  const deliverable = jpoInsertDeliverable({
    id: jpoNextId("JPO-MD", "jeonse_deliverables"),
    caseId: row.id,
    agentId,
    kind: "agentMd",
    title: `${jpoAgentDisplayName(agentId)} · ${info.output || "내부 참고 산출물"}`,
    fileName: jpoDeliverableFileName(row, agentId),
    status,
    riskLevel: row.riskLevel,
    requiresHumanReview,
    body: jpoBuildAgentDeliverableBody(row, agentId, run),
    createdAt: today,
  });
  if (status === "pendingApproval" || requiresHumanReview) {
    jpoEnsureApprovalForCase(row, agentId === "jpo-comms" ? "고객 안내문 발송 승인" : jpoApprovalTypeForIntake(row.intakeType), agentId);
  }
  return { case: row, run, deliverable };
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
  const row = jpoTable("jeonse_cases", JPO_ROLE_KEY).find((item) => item.id === sample.caseId);
  if (row) {
    jpoInsertDeliverable({
      id: jpoNextId("JPO-MD", "jeonse_deliverables"),
      caseId: row.id,
      agentId,
      kind: "agentMd",
      title: `${agent ? agent.displayName : agentId} 샘플 실행 산출물`,
      fileName: jpoDeliverableFileName(row, agentId),
      status: run.status,
      riskLevel,
      requiresHumanReview: run.requiresHumanReview,
      body: jpoBuildAgentDeliverableBody(row, agentId, run),
      createdAt: run.createdAt,
    });
  }
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

/* ================= 루프 엔지니어링 계층 =================
   Automation(감지만) · Skill(위험 점검 규칙) · Agent(생성) · Evaluator(검증, 분리)
   State(jpoState.loop) · Human Inbox(humanReview 큐). 자동 종결/자동 승인 없음. */

function jpoWriteEvidence(row) {
  return jpoInsert("jeonse_evidence", jpoScopedRow({
    id: jpoNextId("EVD", "jeonse_evidence"),
    createdAt: new Date().toISOString().slice(0, 10),
    ...row,
  }));
}

const JPO_EVALUATOR_VERDICT_LABELS = {
  pass: "검증 통과",
  humanReviewRequired: "담당자 확인 필요",
  forbiddenExpression: "금지 표현 수정 필요",
  insufficientEvidence: "근거 부족",
  piiBlocked: "개인정보 노출 차단",
};

/* 검증 전담 — 생성 함수(recordJeonseProtectionAgentRun 등)와 분리된 별도 함수 */
function runJeonseLoopEvaluator(caseId, context = {}) {
  const row = caseId ? jpoTable("jeonse_cases", JPO_ROLE_KEY).find((item) => item.id === caseId) : null;
  const evidence = caseId ? jpoTable("jeonse_evidence", JPO_ROLE_KEY).filter((item) => item.caseId === caseId) : [];
  const signals = caseId ? jpoTable("jeonse_risk_signals", JPO_ROLE_KEY).filter((item) => item.caseId === caseId) : [];
  const textPool = [context.outputSummary, context.inputSummary, ...signals.map((item) => item.title)].filter(Boolean).join(" ");
  const notes = [];
  let verdict = "pass";
  const raise = (next, note) => {
    const order = ["pass", "humanReviewRequired", "insufficientEvidence", "forbiddenExpression", "piiBlocked"];
    if (order.indexOf(next) > order.indexOf(verdict)) verdict = next;
    if (note) notes.push(note);
  };
  const pii = typeof harnessGuardCheckPII === "function" ? harnessGuardCheckPII(textPool) : null;
  if (pii) raise("piiBlocked", pii);
  const forbidden = typeof harnessGuardCheckAssertions === "function" ? harnessGuardCheckAssertions(textPool, JPO_FORBIDDEN_ASSERTIONS) : null;
  if (forbidden) raise("forbiddenExpression", forbidden);
  if (caseId && evidence.length < 2) raise("insufficientEvidence", `근거 기록 ${evidence.length}건 — 최소 2건 필요`);
  const sourceMode = context.sourceMode || (row && row.sourceMode);
  if (["fallback", "snapshot", "manualRequired"].includes(sourceMode)) {
    raise("humanReviewRequired", `데이터 연계 상태 '${JPO_SOURCE_MODES[sourceMode] || sourceMode}' — 담당자 확인 필요`);
  }
  const riskLevel = context.riskLevel || (row && row.riskLevel) || "low";
  if (["high", "critical"].includes(riskLevel) && ["completed", "closed"].includes(context.status || "")) {
    raise("humanReviewRequired", "high/critical 자동 완료 차단 — 종결은 담당자만");
  }
  if (["high", "critical"].includes(riskLevel)) raise("humanReviewRequired", "고위험 건 — 담당자 검토 필수");

  const verdictLabel = JPO_EVALUATOR_VERDICT_LABELS[verdict];
  const today = new Date().toISOString().slice(0, 10);
  const evaluatorRun = jpoInsert("jeonse_agent_runs", jpoScopedRow({
    id: jpoNextId("JEONSE-RUN", "jeonse_agent_runs"),
    agentId: "jpo-evaluator",
    caseId: caseId || null,
    inputSummary: `검증 대상: ${context.targetLabel || (row ? jpoCaseNoLabel(row.caseNo) : "실행 결과")}`,
    outputSummary: `${verdictLabel}${notes.length ? " — " + notes[0] : ""}`,
    status: verdict === "pass" ? "completed" : "needsReview",
    riskLevel: verdict === "pass" ? "low" : "medium",
    requiresHumanReview: verdict !== "pass",
    createdAt: today,
  }));
  jpoWriteAudit({
    id: jpoNextId("AUD-JPO", "jeonse_audit_logs"),
    caseId: caseId || null,
    actorId: "jpo-evaluator",
    action: "EVALUATOR_CHECKED",
    targetType: context.targetType || "case",
    targetId: context.targetId || caseId || evaluatorRun.id,
    riskLevel: verdict === "pass" ? "low" : "medium",
    reviewRequired: verdict !== "pass",
    note: verdictLabel,
    createdAt: today,
  });
  if (caseId) {
    jpoWriteEvidence({ caseId, kind: "evaluator", title: `루프 검증 결과: ${verdictLabel}`, detail: notes.join(" / ") || "이상 없음", refId: evaluatorRun.id, source: "루프 검증 에이전트" });
  }
  jpoState.loop.evaluatorStatus = verdictLabel;
  return { verdict, verdictLabel, notes, runId: evaluatorRun.id, requiresHumanReview: verdict !== "pass" };
}

/* 생성 흐름 래핑 — 원본은 생성만, 검증·근거·감사 확장은 여기서 */
const jpoEnrichBase = enrichJeonseCase;
enrichJeonseCase = async function (caseId) {
  const result = await jpoEnrichBase(caseId);
  const today = new Date().toISOString().slice(0, 10);
  jpoWriteEvidence({
    caseId,
    kind: "price",
    title: `시세 데이터 보강 — ${JPO_SOURCE_MODES[result.market.sourceMode] || result.market.sourceMode}`,
    detail: `인근 거래 기준가(매매 ${jpoWon(result.market.saleMedian)} · 전세 ${jpoWon(result.market.jeonseMedian)})`,
    refId: (jpoTable("jeonse_price_snapshots", JPO_ROLE_KEY).find((item) => item.caseId === caseId) || {}).id || null,
    source: JPO_SOURCE_MODE_HINTS[result.market.sourceMode] || "공공데이터 연계",
  });
  jpoWriteAudit({
    id: jpoNextId("AUD-JPO", "jeonse_audit_logs"),
    caseId,
    actorId: "jpo-price",
    action: "DATA_ENRICHED",
    targetType: "case",
    targetId: caseId,
    riskLevel: result.assessment.riskLevel,
    reviewRequired: result.assessment.requiresHumanReview,
    createdAt: today,
  });
  result.evaluator = runJeonseLoopEvaluator(caseId, { sourceMode: result.market.sourceMode, riskLevel: result.assessment.riskLevel, targetType: "enrichment", targetId: caseId });
  jpoState.loop.dataConnectionStatus = JPO_SOURCE_MODES[result.market.sourceMode] || result.market.sourceMode;
  jpoState.loop.lastUpdated = new Date().toISOString();
  return result;
};

const jpoCreateCaseBase = createJeonseProtectionCase;
createJeonseProtectionCase = function (form) {
  const result = jpoCreateCaseBase(form);
  if (!result || result.blocked || !result.case) return result;
  const caseRow = result.case;
  const today = new Date().toISOString().slice(0, 10);
  jpoWriteAudit({
    id: jpoNextId("AUD-JPO", "jeonse_audit_logs"), caseId: caseRow.id, actorId: "jpo-intake",
    action: "RISK_SIGNAL_CREATED", targetType: "case", targetId: caseRow.id,
    riskLevel: caseRow.riskLevel, reviewRequired: caseRow.requiresHumanReview,
    note: `위험 신호 ${(result.assessment ? result.assessment.signals.length : 0)}건 산출`, createdAt: today,
  });
  const createdReferral = jpoTable("jeonse_support_referrals", JPO_ROLE_KEY).find((item) => item.caseId === caseRow.id);
  if (createdReferral) {
    jpoWriteAudit({
      id: jpoNextId("AUD-JPO", "jeonse_audit_logs"), caseId: caseRow.id, actorId: "jpo-victim",
      action: "SUPPORT_REFERRAL_CREATED", targetType: "referral", targetId: createdReferral.id,
      riskLevel: caseRow.riskLevel, reviewRequired: false, createdAt: today,
    });
  }
  jpoWriteEvidence({
    caseId: caseRow.id, kind: "dataSource",
    title: `접수 시 데이터 연계 상태 — ${JPO_SOURCE_MODES[caseRow.sourceMode] || caseRow.sourceMode}`,
    detail: JPO_SOURCE_MODE_HINTS[caseRow.sourceMode] || "-",
    refId: (jpoTable("jeonse_price_snapshots", JPO_ROLE_KEY).find((item) => item.caseId === caseRow.id) || {}).id || null, source: "접수 위저드",
  });
  if (result.assessment && result.assessment.signals.length) {
    jpoWriteEvidence({
      caseId: caseRow.id, kind: "price",
      title: `핵심 위험 신호 ${result.assessment.signals.length}건`,
      detail: result.assessment.signals.slice(0, 3).map((signal) => signal.title).join(" · "),
      refId: null, source: "전세 위험 점검 규칙(Skill)",
    });
  }
  result.evaluator = runJeonseLoopEvaluator(caseRow.id, { sourceMode: caseRow.sourceMode, riskLevel: caseRow.riskLevel, targetType: "case", targetId: caseRow.id });
  return result;
};

const jpoRunSampleBase = runJeonseProtectionSampleRequest;
runJeonseProtectionSampleRequest = function (key) {
  const result = jpoRunSampleBase(key);
  if (!result || !result.run) return result;
  result.evaluator = runJeonseLoopEvaluator(result.run.caseId, {
    outputSummary: result.run.outputSummary,
    inputSummary: result.run.inputSummary,
    status: result.run.status,
    riskLevel: result.run.riskLevel,
    targetType: "agentRun",
    targetId: result.run.id,
    targetLabel: result.run.id,
  });
  jpoState.loop.agentRunStatus = JPO_STATUS_LABELS[result.run.status] || result.run.status;
  return result;
};

/* 케이스 선택(상세 페이지 열기) 감사 — §9 CASE_SELECTED */
function jpoRecordCaseSelected(caseId) {
  jpoState.loop.selectedCaseId = caseId;
  jpoWriteAudit({
    id: jpoNextId("AUD-JPO", "jeonse_audit_logs"), caseId, actorId: "USR-JPO-OPS-01",
    action: "CASE_SELECTED", targetType: "case", targetId: caseId,
    riskLevel: "low", reviewRequired: false, createdAt: new Date().toISOString().slice(0, 10),
  });
}

/* 상태 전이 — alias 수용 + STATUS_CHANGED 감사. 자동 종결 금지: guidanceDone은 사람만 */
function jpoChangeCaseStatus(caseId, nextStatusAlias, actorId) {
  const status = JPO_STATUS_CANONICAL[nextStatusAlias] || nextStatusAlias;
  if (!JPO_BOARD_COLUMNS.some(([key]) => key === status)) return { blocked: true, violations: [`알 수 없는 상태: ${nextStatusAlias}`] };
  const db = jpoRepository.snapshot();
  const row = (db.jeonse_cases || []).find((item) => item.id === caseId && item.roleKey === JPO_ROLE_KEY);
  if (!row) return null;
  if (status === "guidanceDone" && !String(actorId || "").startsWith("USR-")) {
    return { blocked: true, violations: ["지원 안내 완료 처리는 담당자만 가능"] };
  }
  const prev = row.status;
  row.status = status;
  row.updatedAt = new Date().toISOString().slice(0, 10);
  jpoSaveDb();
  jpoWriteAudit({
    id: jpoNextId("AUD-JPO", "jeonse_audit_logs"), caseId, actorId: actorId || "USR-JPO-OPS-01",
    action: "STATUS_CHANGED", targetType: "case", targetId: caseId,
    riskLevel: row.riskLevel, reviewRequired: ["humanReview"].includes(status),
    note: `${JPO_STATUS_LABELS[prev] || prev} → ${JPO_STATUS_LABELS[status] || status}`,
    createdAt: row.updatedAt,
  });
  return { case: row };
}

/* Automation 준비 — 감지 전용(read-only). 자동 종결/자동 승인 없음. */
function jpoDetectAutomationQueue() {
  const today = Date.now();
  const cases = jpoTable("jeonse_cases", JPO_ROLE_KEY).filter((row) => JPO_ACTIVE_CASE_STATUSES.includes(row.status));
  const days = (text) => {
    const time = new Date(text || "").getTime();
    return Number.isNaN(time) ? null : Math.ceil((time - today) / 86400000);
  };
  const staleDays = (text) => {
    const time = new Date(text || "").getTime();
    return Number.isNaN(time) ? null : Math.floor((today - time) / 86400000);
  };
  const evaluatorFailed = jpoTable("jeonse_agent_runs", JPO_ROLE_KEY)
    .filter((run) => run.agentId === "jpo-evaluator" && run.status === "needsReview");
  return {
    generatedAt: new Date().toISOString(),
    dailyTriage: cases.filter((row) => row.status === "received"),
    staleCases: cases.filter((row) => (staleDays(row.updatedAt) ?? 0) >= 7),
    slaDue: cases.filter((row) => { const d = days(row.dueAt); return d != null && d <= 1; }),
    dataRefresh: cases.filter((row) => row.sourceMode === "fallback" || row.status === "enriching"),
    evaluatorFailed,
  };
}

function jpoRefreshLoopState(counts) {
  jpoState.loop.pendingHumanReviewCount = counts ? counts.board && jpoTable("jeonse_cases", JPO_ROLE_KEY).filter((row) => row.status === "humanReview").length : jpoState.loop.pendingHumanReviewCount;
  jpoState.loop.currentRoute = window.location.hash;
  jpoState.loop.lastUpdated = new Date().toISOString();
}
