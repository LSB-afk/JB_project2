/* 전세사기 보호 담당자 역할 하네스 — 전용 service/query 레이어.
   모든 business query는 jpoTable(table, JPO_ROLE_KEY)로 role scope를 고정한다.
   개인정보 원문(실명·주민번호·전화·계좌·주소 원문)은 저장/검색/출력 대상이 아니다. */

function jpoActiveCase(row) {
  return JPO_ACTIVE_CASE_STATUSES.includes(row.status);
}

function getJeonseProtectionSidebarCounts() {
  const t = (name) => jpoTable(name, JPO_ROLE_KEY);
  const today = new Date().toISOString().slice(0, 10);
  const referrals = t("jeonse_referrals");
  const assessments = t("jeonse_risk_assessments");
  const runsNeedingReview = t("agent_runs").filter((x) => ["queued", "running", "needsReview", "pendingApproval"].includes(x.status)).length;
  const agentsNeedingReview = t("harness_agents").filter((x) => ["needsReview", "escalated"].includes(x.status)).length;

  return {
    board: t("jeonse_tasks").filter((x) => ["open", "inProgress", "overdue"].includes(x.status) || x.dueAt === today).length,
    approvals: t("approvals").filter((x) => x.status === "pending").length,
    auditLogs: t("audit_logs").filter((x) => x.reviewRequired === true).length,
    privacyPermissions: t("privacy_permission_checks").filter((x) => ["open", "needsReview"].includes(x.status)).length,
    integrations: t("external_connectors").filter((x) => ["degraded", "down"].includes(x.health) || ["pending", "error"].includes(x.status)).length,
    cases: t("jeonse_cases").filter(jpoActiveCase).length,
    preContractRisk: assessments.filter((x) => x.kind === "preContract" && ["open", "inReview"].includes(x.status)).length,
    priceRatio: t("jeonse_price_ratio_checks").filter((x) => ["medium", "high", "critical"].includes(x.riskLevel) && !["completed", "closed"].includes(x.status)).length,
    registryRights: t("jeonse_registry_checks").filter((x) => ["open", "inReview", "waitingExternalData"].includes(x.status)).length,
    guaranteeHug: t("jeonse_guarantee_reviews").filter((x) => ["open", "needsReview"].includes(x.status)).length,
    auctionSupport: referrals.filter((x) => x.category === "auction" && ["pending", "open"].includes(x.status)).length,
    supportReferrals: referrals.filter((x) => ["legal", "care"].includes(x.category) && ["pending", "open"].includes(x.status)).length,
    victimDecision: t("jeonse_victim_support_reviews").filter((x) => ["open", "needsReview"].includes(x.status)).length,
    urgentAlerts: t("jeonse_alerts").filter((x) => ["high", "critical"].includes(x.severity) && x.status !== "resolved").length,
    vulnerableTenants: assessments.filter((x) => x.kind === "vulnerableTenant" && ["open", "inReview"].includes(x.status)).length,
    aiAnalysis: t("ai_analysis_requests").filter((x) => ["queued", "running"].includes(x.status)).length,
    aiAssist: t("ai_recommendations").filter((x) => ["active", "proposed"].includes(x.status)).length,
    agentHarness: runsNeedingReview + agentsNeedingReview,
    capabilities: t("business_capabilities").filter((x) => ["enabled", "proposed"].includes(x.status)).length,
    roles: t("role_assignments").filter((x) => ["active", "needsReview"].includes(x.status) || x.reviewRequired === true).length,
    inspections: t("inspection_schedules").filter((x) => ["upcoming", "overdue"].includes(x.status)).length,
  };
}

function getJeonseProtectionSidebarCountsAsync() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try { resolve(getJeonseProtectionSidebarCounts()); } catch (error) { reject(error); }
    }, 120);
  });
}

/* 개인정보 원문 검색 차단 — 주민번호/전화번호/계좌형 숫자열 패턴은 검색 자체를 거부한다. */
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
    if (hit(c.caseNo) || hit(c.title) || hit(c.taskType) || hit(c.contractRefId) || hit(c.tenantRefId)
      || hit(c.propertyRefId) || hit(c.landlordRefId) || hit(c.addressRefId)
      || (c.tags || []).some(hit) || hit(userName(c.assignedToId))) {
      out.push({ kind: "case", view: "cases", id: c.id, label: `${c.caseNo} · ${c.title}`, sub: `${JPO_TASK_TAXONOMY[c.taskType]?.label || c.taskType} · ${JPO_STATUS_LABELS[c.status] || c.status}` });
    }
  });
  jpoTable("jeonse_tasks", JPO_ROLE_KEY).forEach((x) => {
    if (hit(x.title) || hit(x.id)) out.push({ kind: "task", view: "board", id: x.id, label: `${x.id} · ${x.title}`, sub: `태스크 · ${JPO_STATUS_LABELS[x.status] || x.status}` });
  });
  jpoTable("jeonse_guarantee_reviews", JPO_ROLE_KEY).forEach((x) => {
    if (hit(x.reviewType) || hit(x.id) || hit(x.guaranteeProgram)) out.push({ kind: "guarantee", view: "guarantee-hug", id: x.id, label: `${x.id} · ${x.reviewType}`, sub: `보증 검토 · ${JPO_STATUS_LABELS[x.status] || x.status}` });
  });
  jpoTable("jeonse_registry_checks", JPO_ROLE_KEY).forEach((x) => {
    if (hit(x.issueType) || hit(x.id)) out.push({ kind: "registry", view: "registry-rights", id: x.id, label: `${x.id} · ${x.issueType}`, sub: `등기 점검 · ${JPO_STATUS_LABELS[x.status] || x.status}` });
  });
  jpoTable("jeonse_price_ratio_checks", JPO_ROLE_KEY).forEach((x) => {
    if (hit(x.checkType) || hit(x.ratioBand) || hit(x.id)) out.push({ kind: "price", view: "price-ratio", id: x.id, label: `${x.id} · ${x.checkType}`, sub: `전세가율 ${x.ratioBand}` });
  });
  jpoTable("jeonse_victim_support_reviews", JPO_ROLE_KEY).forEach((x) => {
    if (hit(x.reviewType) || hit(x.id)) out.push({ kind: "victim", view: "victim-decision", id: x.id, label: `${x.id} · ${x.reviewType}`, sub: `피해자 결정 보조 · ${JPO_STATUS_LABELS[x.status] || x.status}` });
  });
  jpoTable("jeonse_referrals", JPO_ROLE_KEY).forEach((x) => {
    if (hit(x.referralType) || hit(x.supportProgram) || hit(x.category) || hit(x.id)) out.push({ kind: "referral", view: x.category === "auction" ? "auction-support" : "support-referrals", id: x.id, label: `${x.id} · ${x.referralType}`, sub: `${x.supportProgram || "연계"} · ${JPO_STATUS_LABELS[x.status] || x.status}` });
  });
  jpoTable("jeonse_alerts", JPO_ROLE_KEY).forEach((x) => {
    if (hit(x.alertType) || hit(x.id)) out.push({ kind: "alert", view: "alerts", id: x.id, label: `${x.id} · ${x.alertType}`, sub: `긴급 알림 · ${JPO_RISK_LABELS[x.severity] || x.severity}` });
  });
  jpoTable("ai_recommendations", JPO_ROLE_KEY).forEach((x) => {
    if (hit(x.title)) out.push({ kind: "recommendation", view: "ai-assist", id: x.id, label: x.title, sub: `AI 제안 · ${JPO_STATUS_LABELS[x.status] || x.status}` });
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

function previewJeonseProtectionTriage(form) {
  return routeJeonseProtectionCase({
    taskType: form.taskType,
    title: form.title,
    description: form.description,
    riskSignals: form.riskSignals,
    riskLevel: form.riskLevel,
    priority: form.priority,
    dueAt: form.dueAt,
    requiresHumanReview: form.requiresHumanReview,
    commsDraft: form.commsDraft,
  });
}

function jpoRunHook(hookName, payload) {
  if (typeof harnessRunHooks !== "function") return { ok: true, violations: [] };
  return harnessRunHooks("jeonse-protection", hookName, payload);
}

function jpoWriteAudit(row) {
  const audit = jpoScopedRow(row);
  jpoRunHook("onAuditWrite", { audit });
  return jpoInsert("audit_logs", audit);
}

function jpoActorForTeam(team, fallback) {
  const found = jpoTable("users", JPO_ROLE_KEY).find((user) => user.team === team && user.status === "active");
  return found ? found.id : fallback || "USR-JPO-RISK-01";
}

function jpoScopedRow(row) {
  return { roleKey: JPO_ROLE_KEY, workspaceId: JPO_WORKSPACE_ID, ...row };
}

function jpoApprovalTypeForTriage(taskType, triage) {
  if ((triage.handoffs || []).some((h) => h.toAgentId === "jpo-comms")) return "고객 안내문 발송 승인";
  if (taskType === "victimDecision") return "피해자 결정 검토 승인";
  if (taskType === "guaranteeHug") return "보증 연계 검토 승인";
  if (taskType === "auctionSupport") return "경공매 지원 안내 승인";
  if (["legalReferral", "careReferral"].includes(taskType)) return "지원기관 연계 승인";
  return "담당자 검토";
}

function createJeonseProtectionCase(form) {
  const now = new Date().toISOString().slice(0, 10);
  const guard = jpoRunHook("beforeCaseCreate", form);
  if (!guard.ok) {
    jpoWriteAudit({
      id: jpoNextId("AUD-JPO", "audit_logs"),
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
  const id = jpoNextId("JEONSE-CASE", "jeonse_cases");
  const taxonomy = JPO_TASK_TAXONOMY[form.taskType] || JPO_TASK_TAXONOMY.preContractRisk;
  const assignedToId = form.assignedToId || jpoActorForTeam(form.assignedTeam || taxonomy.team, "USR-JPO-RISK-01");
  const refSeq = String(Math.floor(1000 + Math.random() * 9000));
  const jeonseCase = jpoScopedRow({
    id,
    caseNo: id,
    taskType: form.taskType,
    title: form.title,
    description: form.description || "",
    status: triage.initialStatus,
    priority: form.priority || "normal",
    riskLevel: triage.riskOverride || form.riskLevel || "medium",
    riskSignals: form.riskSignals || [],
    assignedTeam: form.assignedTeam || triage.recommendedTeam,
    assignedToId,
    tenantRefId: form.tenantRefId || `TENANT-REF-${refSeq}`,
    contractRefId: form.contractRefId || `CONTRACT-REF-${refSeq}`,
    propertyRefId: form.propertyRefId || `PROPERTY-REF-${refSeq}`,
    landlordRefId: form.landlordRefId || `LANDLORD-REF-${refSeq}`,
    addressRefId: form.addressRefId || `ADDRESS-REF-${refSeq}`,
    depositAmountBand: form.depositAmountBand || "확인 필요",
    leaseStartDate: form.leaseStartDate || "",
    leaseEndDate: form.leaseEndDate || "",
    sourceChannel: form.sourceChannel || "opsPortal",
    tags: Array.isArray(form.tags) ? form.tags : String(form.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    requiresHumanReview: triage.requiresHumanReview,
    attachmentsExist: Boolean(form.attachmentsExist),
    vulnerableTenant: (form.riskSignals || []).includes("vulnerableTenant") || form.taskType === "vulnerableTenant",
    dueAt: triage.slaDueAt,
    createdAt: now,
    updatedAt: now,
  });

  jpoInsert("jeonse_cases", jeonseCase);
  jpoRunHook("afterCaseCreate", { caseRow: jeonseCase });
  triage.nextTasks.forEach((title) => {
    jpoInsert("jeonse_tasks", jpoScopedRow({
      id: jpoNextId("JEONSE-TASK", "jeonse_tasks"),
      caseId: id,
      title,
      status: "open",
      dueAt: jeonseCase.dueAt,
      ownerId: assignedToId,
    }));
  });
  jpoWriteAudit({
    id: jpoNextId("AUD-JPO", "audit_logs"),
    actorId: assignedToId,
    action: "JPO_CASE_CREATED",
    targetType: "jeonse_case",
    targetId: id,
    riskLevel: jeonseCase.riskLevel,
    reviewRequired: jeonseCase.requiresHumanReview,
    createdAt: now,
  });
  jpoInsert("ai_analysis_requests", jpoScopedRow({
    id: jpoNextId("AIR-JPO", "ai_analysis_requests"),
    caseId: id,
    requestType: "전세보호 분류 오케스트레이터 접수 분석",
    status: "queued",
    requestedById: assignedToId,
    createdAt: now,
  }));
  recordJeonseProtectionAgentRun({
    agentId: triage.recommendedAgent,
    caseId: id,
    inputSummary: `${taxonomy.label} · ${jeonseCase.title}`,
    outputSummary: `초기상태 ${JPO_STATUS_LABELS[triage.initialStatus] || triage.initialStatus}, 담당 ${triage.recommendedTeam}, 사람검토 ${triage.requiresHumanReview ? "필요" : "선택"}`,
    status: triage.requiresHumanReview ? "needsReview" : "queued",
    riskLevel: jeonseCase.riskLevel,
    requiresHumanEscalation: triage.escalationRequired,
    handoffs: triage.handoffs,
  });

  const derived = taxonomy.derived;
  if (derived === "jeonse_risk_assessments") {
    jpoInsert("jeonse_risk_assessments", jpoScopedRow({
      id: jpoNextId("JEONSE-RISK", "jeonse_risk_assessments"),
      caseId: id,
      kind: taxonomy.assessmentKind || "preContract",
      ratioBand: (form.riskSignals || []).includes("ratioHigh") ? "90% 이상 의심" : "확인 필요",
      status: "open",
      riskLevel: jeonseCase.riskLevel,
      checklist: triage.checklist,
    }));
  }
  if (derived === "jeonse_price_ratio_checks") {
    jpoInsert("jeonse_price_ratio_checks", jpoScopedRow({
      id: jpoNextId("JEONSE-PRICE", "jeonse_price_ratio_checks"),
      caseId: id,
      checkType: taxonomy.label,
      ratioBand: (form.riskSignals || []).includes("ratioHigh") ? "90% 이상 의심" : "확인 필요",
      status: "open",
      riskLevel: jeonseCase.riskLevel,
    }));
  }
  if (derived === "jeonse_registry_checks") {
    const issueType = (form.riskSignals || []).includes("trustRegistry") ? "신탁등기 의심"
      : (form.riskSignals || []).includes("lienSuspect") ? "근저당/압류 의심" : "권리관계 확인";
    jpoInsert("jeonse_registry_checks", jpoScopedRow({
      id: jpoNextId("JEONSE-REG", "jeonse_registry_checks"),
      caseId: id,
      issueType,
      status: "open",
      riskLevel: jeonseCase.riskLevel,
    }));
  }
  if (derived === "jeonse_guarantee_reviews") {
    jpoInsert("jeonse_guarantee_reviews", jpoScopedRow({
      id: jpoNextId("JEONSE-HUG", "jeonse_guarantee_reviews"),
      caseId: id,
      reviewType: taxonomy.label,
      guaranteeProgram: triage.supportProgramCandidates[0] || "확인 필요",
      status: "open",
      requiresHumanReview: true,
    }));
  }
  if (derived === "jeonse_victim_support_reviews") {
    jpoInsert("jeonse_victim_support_reviews", jpoScopedRow({
      id: jpoNextId("JEONSE-VICTIM", "jeonse_victim_support_reviews"),
      caseId: id,
      reviewType: taxonomy.label,
      status: "open",
      requiresHumanReview: true,
      checklist: triage.requiredDocuments.concat(triage.checklist),
    }));
  }
  if (derived === "jeonse_referrals") {
    jpoInsert("jeonse_referrals", jpoScopedRow({
      id: jpoNextId("JEONSE-REF", "jeonse_referrals"),
      caseId: id,
      category: taxonomy.referralCategory || "care",
      referralType: taxonomy.label,
      supportProgram: triage.supportProgramCandidates[0] || "안내 후보 정리 필요",
      status: "pending",
      requiresHumanReview: triage.requiresHumanReview,
    }));
  }
  if (derived === "jeonse_alerts" || triage.escalationRequired) {
    jpoInsert("jeonse_alerts", jpoScopedRow({
      id: jpoNextId("JEONSE-ALERT", "jeonse_alerts"),
      caseId: id,
      alertType: taxonomy.label,
      severity: jeonseCase.riskLevel === "critical" ? "critical" : "high",
      status: "open",
      requiresHumanEscalation: true,
    }));
  }
  if (jeonseCase.requiresHumanReview || ["high", "critical"].includes(jeonseCase.riskLevel)) {
    jpoInsert("approvals", jpoScopedRow({
      id: jpoNextId("APR-JPO", "approvals"),
      caseId: id,
      approvalType: jpoApprovalTypeForTriage(form.taskType, triage),
      status: "pending",
      requestedById: assignedToId,
      approverId: jpoActorForTeam("내부통제팀", "USR-JPO-AUD-01"),
      requestedAt: now,
    }));
  }
  return { case: jeonseCase, triage };
}

function recordJeonseProtectionAgentRun(run) {
  const today = new Date().toISOString().slice(0, 10);
  const beforeGuard = jpoRunHook("beforeAgentRun", {
    agentId: run.agentId,
    riskLevel: run.riskLevel || "low",
    status: run.status || "completed",
    inputSummary: run.inputSummary,
  });
  if (!beforeGuard.ok) {
    // 자동 종결 시도 등은 실패시키지 않고 안전 상태로 강등 + 감사 기록 (defense-in-depth)
    run = { ...run, status: "needsReview" };
  }
  const row = jpoScopedRow({
    id: jpoNextId("JEONSE-RUN", "agent_runs"),
    agentId: run.agentId,
    caseId: run.caseId || null,
    inputSummary: run.inputSummary,
    outputSummary: run.outputSummary,
    status: run.status || "completed",
    riskLevel: run.riskLevel || "low",
    requiresHumanEscalation: Boolean(run.requiresHumanEscalation),
    createdAt: today,
  });
  jpoInsert("agent_runs", row);
  const afterGuard = jpoRunHook("afterAgentRun", { run: row });
  if (!beforeGuard.ok || !afterGuard.ok) {
    jpoWriteAudit({
      id: jpoNextId("AUD-JPO", "audit_logs"),
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
    id: jpoNextId("AUD-JPO", "audit_logs"),
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

function runJeonseProtectionSampleRequest(key) {
  const sample = jeonseProtectionSampleRequests.find((item) => item.key === key);
  if (!sample) return null;
  const triage = previewJeonseProtectionTriage({
    taskType: sample.taskType,
    title: sample.text,
    description: sample.text,
    riskSignals: sample.riskSignals || [],
    riskLevel: sample.riskLevel || "medium",
    priority: sample.riskLevel === "high" ? "urgent" : "normal",
    commsDraft: Boolean(sample.commsDraft),
    requiresHumanReview: false,
  });
  const agent = jeonseProtectionAgents.find((item) => item.id === (sample.commsDraft ? "jpo-comms" : triage.recommendedAgent));
  const run = recordJeonseProtectionAgentRun({
    agentId: agent ? agent.id : triage.recommendedAgent,
    caseId: sample.caseId,
    inputSummary: sample.text,
    outputSummary: `${agent ? agent.displayName : triage.recommendedAgent} · ${JPO_STATUS_LABELS[triage.initialStatus] || triage.initialStatus} · 내부 운영 참고용 · 담당자 검토 필요`,
    status: sample.commsDraft ? "pendingApproval" : triage.requiresHumanReview ? "needsReview" : "completed",
    riskLevel: triage.riskOverride,
    requiresHumanEscalation: triage.escalationRequired,
    handoffs: triage.handoffs,
  });
  if (sample.commsDraft) {
    const draftText = `[초안] ${sample.text} — 임차인(TENANT-REF) 대상 안내 후보, 발송은 담당자 승인 후 진행됩니다.`;
    const msgGuard = jpoRunHook("beforeCustomerMessage", {
      draftText,
      customerFacing: true,
      approvalStatus: "pending",
    });
    if (!msgGuard.ok) {
      return { sample, triage, agent, run, blocked: true, violations: msgGuard.violations };
    }
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
    id: jpoNextId("AUD-JPO", "audit_logs"),
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

function getJeonseProtectionDashboardKpis() {
  const counts = getJeonseProtectionSidebarCounts();
  const cases = jpoTable("jeonse_cases", JPO_ROLE_KEY);
  const runs = jpoTable("agent_runs", JPO_ROLE_KEY);
  const humanReviewCases = cases.filter((item) => item.requiresHumanReview).length;
  const today = new Date().toISOString().slice(0, 10);
  return [
    ["금일 신규 전세보호 건", cases.filter((item) => item.createdAt === today).length, "오늘 접수"],
    ["처리 대기 건", counts.cases, "진행중 상태 기준"],
    ["승인 대기 건", counts.approvals, "안내·연계 승인 대기"],
    ["긴급 위험 경보", counts.urgentAlerts, "자동 종결 금지"],
    ["피해자 결정 검토", counts.victimDecision, "사람 검토 필수"],
    ["보증·HUG 검토", counts.guaranteeHug, "가입요건 확인"],
    ["취약고객 보호", counts.vulnerableTenants, "우선 검토"],
    ["사람 검토 비율", `${Math.round((humanReviewCases / Math.max(1, cases.length)) * 100)}%`, "케이스 기준"],
    ["자동화 처리율", `${Math.round((runs.filter((run) => run.status === "completed").length / Math.max(1, runs.length)) * 100)}%`, "모의 실행 기준"],
  ];
}
