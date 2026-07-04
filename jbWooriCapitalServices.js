/* JB우리캐피탈 전용 service/query layer.
   공통 저장소 함수는 사용하지만 모든 business query는 affiliateId를 고정한다. */

function jbwcActiveCase(row) {
  return JBWC_ACTIVE_CASE_STATUSES.includes(row.status);
}

function getJbWooriCapitalSidebarCounts() {
  const t = (name) => jbwcTable(name, JBWC_AFFILIATE_ID);
  const today = new Date().toISOString().slice(0, 10);
  const cases = t("ops_cases");
  const supportUrgent = t("customer_support_cases").filter((x) => x.priority === "urgent" && x.status !== "resolved").length;
  const fdsUrgent = t("fds_alerts").filter((x) => ["high", "critical"].includes(x.severity) && x.status !== "resolved").length;
  const runsNeedingReview = t("agent_runs").filter((x) => ["queued", "running", "needsReview"].includes(x.status)).length;
  const agentsNeedingReview = t("harness_agents").filter((x) => ["needsReview", "escalated"].includes(x.status)).length;

  return {
    board: t("ops_tasks").filter((x) => ["open", "inProgress", "overdue"].includes(x.status) || x.dueAt === today).length,
    approvals: t("approvals").filter((x) => x.status === "pending").length,
    auditLogs: t("audit_logs").filter((x) => x.reviewRequired === true).length,
    privacyPermissions: t("privacy_permission_checks").filter((x) => ["open", "needsReview"].includes(x.status)).length,
    integrations: t("external_connectors").filter((x) => ["degraded", "down"].includes(x.health) || ["pending", "error"].includes(x.status)).length,
    cases: cases.filter(jbwcActiveCase).length,
    personalFinance: cases.filter((c) => c.domain === "personalFinance" && jbwcActiveCase(c)).length,
    autoFinance: cases.filter((c) => c.domain === "autoFinance" && jbwcActiveCase(c)).length,
    mortgageSecured: cases.filter((c) => c.domain === "mortgageSecured" && jbwcActiveCase(c)).length,
    enterpriseFinance: cases.filter((c) => c.domain === "enterpriseFinance" && jbwcActiveCase(c)).length,
    customerManagement: cases.filter((c) => c.domain === "customerManagement" && jbwcActiveCase(c)).length,
    documents: t("document_cases").filter((x) => ["pending", "needsReview"].includes(x.status)).length,
    vehicleLifecycle: t("vehicle_lifecycle_tasks").filter((x) => ["open", "inProgress", "overdue"].includes(x.status)).length,
    consumerProtection: t("consumer_protection_reviews").filter((x) => ["open", "needsReview"].includes(x.status)).length,
    fds: t("fds_alerts").filter((x) => ["open", "investigating", "escalated"].includes(x.status)).length,
    urgentAlerts: fdsUrgent + supportUrgent,
    complaints: t("customer_support_cases").filter((x) => ["open", "inProgress", "needsReview"].includes(x.status)).length,
    aiAnalysis: t("ai_analysis_requests").filter((x) => ["queued", "running"].includes(x.status)).length,
    aiAssist: t("ai_recommendations").filter((x) => ["active", "proposed"].includes(x.status)).length,
    agentHarness: runsNeedingReview + agentsNeedingReview,
    capabilities: t("business_capabilities").filter((x) => ["enabled", "proposed"].includes(x.status)).length,
    roles: t("role_assignments").filter((x) => ["active", "needsReview"].includes(x.status) || x.reviewRequired === true).length,
    inspections: t("inspection_schedules").filter((x) => ["upcoming", "overdue"].includes(x.status)).length,
  };
}

function getJbWooriCapitalSidebarCountsAsync() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try { resolve(getJbWooriCapitalSidebarCounts()); } catch (error) { reject(error); }
    }, 120);
  });
}

function searchJbWooriCapitalRecords(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];
  const users = jbwcTable("users", JBWC_AFFILIATE_ID);
  const userName = (id) => (users.find((u) => u.id === id) || {}).name || "";
  const hit = (value) => String(value || "").toLowerCase().includes(q);
  const out = [];

  jbwcTable("ops_cases", JBWC_AFFILIATE_ID).forEach((c) => {
    if (hit(c.caseNo) || hit(c.title) || hit(c.domain) || hit(c.productType) || hit(c.customerRefId) || hit(c.contractRefId) || hit(c.vehicleRefId) || hit(userName(c.assignedToId))) {
      out.push({ kind: "case", view: "cases", id: c.id, label: `${c.caseNo} · ${c.title}`, sub: `${c.domain} · ${c.productType} · ${c.status}` });
    }
  });
  jbwcTable("business_capabilities", JBWC_AFFILIATE_ID).forEach((x) => {
    if (hit(x.name) || hit(x.domain)) out.push({ kind: "capability", view: "capabilities", id: x.id, label: x.name, sub: `업무 기능 · ${x.status}` });
  });
  jbwcTable("document_cases", JBWC_AFFILIATE_ID).forEach((x) => {
    if (hit(x.documentType) || hit(x.id)) out.push({ kind: "document", view: "documents", id: x.id, label: `${x.id} · ${x.documentType}`, sub: `서류 · ${x.status}` });
  });
  jbwcTable("fds_alerts", JBWC_AFFILIATE_ID).forEach((x) => {
    if (hit(x.alertType) || hit(x.id)) out.push({ kind: "fds", view: "fds", id: x.id, label: `${x.id} · ${x.alertType}`, sub: `FDS · ${x.severity}` });
  });
  jbwcTable("vehicle_lifecycle_tasks", JBWC_AFFILIATE_ID).forEach((x) => {
    if (hit(x.vehicleRefId) || hit(x.taskType) || hit(x.id)) out.push({ kind: "vehicle", view: "vehicle-lifecycle", id: x.id, label: `${x.id} · ${x.taskType}`, sub: `차량 ${x.vehicleRefId}` });
  });
  jbwcTable("customer_support_cases", JBWC_AFFILIATE_ID).forEach((x) => {
    if (hit(x.caseNo) || hit(x.category)) out.push({ kind: "support", view: "complaints", id: x.id, label: `${x.caseNo} · ${x.category}`, sub: `고객센터 · ${x.status}` });
  });
  return out.slice(0, 16);
}

function searchJbWooriCapitalRecordsAsync(query) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try { resolve(searchJbWooriCapitalRecords(query)); } catch (error) { reject(error); }
    }, 150);
  });
}

function previewJbWooriCapitalTriage(form) {
  return routeJbWooriCapitalCase({
    domain: form.domain,
    productType: form.productType,
    title: form.title,
    description: form.description,
    riskLevel: form.riskLevel,
    priority: form.priority,
    dueAt: form.dueAt,
    vehicleRefId: form.vehicleRefId,
    attachmentsExist: form.attachmentsExist,
    requiresHumanReview: form.requiresHumanReview,
  });
}

function jbwcActorForTeam(team, fallback) {
  const found = jbwcTable("users", JBWC_AFFILIATE_ID).find((user) => user.team === team && user.status === "active");
  return found ? found.id : fallback || "USR-JBWC-OPS-01";
}

function createJbWooriCapitalOpsCase(form) {
  const now = new Date().toISOString().slice(0, 10);
  const triage = previewJbWooriCapitalTriage(form);
  const id = jbwcNextId("CASE-JBWC", "ops_cases");
  const domainConfig = JBWC_DOMAIN_TAXONOMY[form.domain] || {};
  const assignedToId = form.assignedToId || jbwcActorForTeam(form.assignedTeam || domainConfig.team, "USR-JBWC-OPS-01");
  const opsCase = {
    id,
    affiliateId: JBWC_AFFILIATE_ID,
    caseNo: id,
    domain: form.domain,
    productType: form.productType,
    title: form.title,
    description: form.description || "",
    status: triage.initialStatus,
    priority: form.priority || "normal",
    riskLevel: triage.riskOverride || form.riskLevel || "medium",
    assignedTeam: form.assignedTeam || triage.recommendedTeam,
    assignedToId,
    customerRefId: form.customerRefId || `CUST-JBWC-${String(Math.floor(1000 + Math.random() * 9000))}`,
    contractRefId: form.contractRefId || "",
    vehicleRefId: form.vehicleRefId || "",
    sourceChannel: form.sourceChannel || "internal",
    tags: Array.isArray(form.tags) ? form.tags : String(form.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    requiresHumanReview: triage.requiresHumanReview,
    attachmentsExist: Boolean(form.attachmentsExist),
    dueAt: triage.slaDueAt,
    createdAt: now,
    updatedAt: now,
  };

  jbwcInsert("ops_cases", opsCase);
  triage.nextTasks.forEach((title) => {
    jbwcInsert("ops_tasks", {
      id: jbwcNextId("TASK-JBWC", "ops_tasks"),
      affiliateId: JBWC_AFFILIATE_ID,
      caseId: id,
      title,
      status: "open",
      dueAt: opsCase.dueAt,
      ownerId: assignedToId,
    });
  });
  jbwcInsert("audit_logs", {
    id: jbwcNextId("AUD-JBWC", "audit_logs"),
    affiliateId: JBWC_AFFILIATE_ID,
    actorId: assignedToId,
    action: "JBWC_CASE_CREATED",
    targetType: "ops_case",
    targetId: id,
    riskLevel: opsCase.riskLevel,
    reviewRequired: opsCase.requiresHumanReview,
    createdAt: now,
  });
  jbwcInsert("ai_analysis_requests", {
    id: jbwcNextId("AIR-JBWC", "ai_analysis_requests"),
    affiliateId: JBWC_AFFILIATE_ID,
    caseId: id,
    requestType: "JB 분류 오케스트레이터 접수 분석",
    status: "queued",
    requestedById: assignedToId,
    createdAt: now,
  });
  recordJbWooriCapitalAgentRun({
    agentId: triage.recommendedAgent,
    caseId: id,
    inputSummary: `${opsCase.domain} · ${opsCase.productType} · ${opsCase.title}`,
    outputSummary: `초기상태 ${JBWC_STATUS_LABELS[triage.initialStatus] || triage.initialStatus}, 담당 ${triage.recommendedTeam}, 사람검토 ${triage.requiresHumanReview ? "필요" : "선택"}`,
    status: triage.requiresHumanReview ? "needsReview" : "queued",
    riskLevel: opsCase.riskLevel,
    requiresHumanEscalation: triage.escalationRequired,
    handoffs: triage.handoffs,
  });

  if (["documentContract", "mortgageSecured"].includes(opsCase.domain) || opsCase.attachmentsExist) {
    jbwcInsert("document_cases", {
      id: jbwcNextId("DOC-JBWC", "document_cases"),
      affiliateId: JBWC_AFFILIATE_ID,
      caseId: id,
      documentType: form.productType || "문서 검토",
      status: "pending",
      receivedAt: opsCase.attachmentsExist ? now : null,
      reviewedAt: null,
    });
  }
  if (opsCase.domain === "fdsVoicePhishing") {
    jbwcInsert("fds_alerts", {
      id: jbwcNextId("FDS-JBWC", "fds_alerts"),
      affiliateId: JBWC_AFFILIATE_ID,
      caseId: id,
      alertType: form.productType || "이상거래 징후",
      severity: opsCase.riskLevel === "critical" ? "critical" : "high",
      status: "open",
      requiresHumanEscalation: true,
    });
  }
  if (opsCase.domain === "vehicleLifecycle" || opsCase.vehicleRefId) {
    jbwcInsert("vehicle_lifecycle_tasks", {
      id: jbwcNextId("VEH-JBWC", "vehicle_lifecycle_tasks"),
      affiliateId: JBWC_AFFILIATE_ID,
      caseId: id,
      vehicleRefId: opsCase.vehicleRefId || `VEH-JBWC-${String(Math.floor(1000 + Math.random() * 9000))}`,
      taskType: form.productType || "차량관리",
      status: "open",
      dueAt: opsCase.dueAt,
    });
  }
  if (opsCase.domain === "consumerProtection") {
    jbwcInsert("consumer_protection_reviews", {
      id: jbwcNextId("CPR-JBWC", "consumer_protection_reviews"),
      affiliateId: JBWC_AFFILIATE_ID,
      caseId: id,
      reviewType: form.productType || "소비자보호 검토",
      status: "open",
      riskLevel: opsCase.riskLevel,
      requiresHumanReview: true,
    });
  }
  if (opsCase.domain === "complaintContactCenter") {
    jbwcInsert("customer_support_cases", {
      id: jbwcNextId("CSC-JBWC", "customer_support_cases"),
      affiliateId: JBWC_AFFILIATE_ID,
      caseNo: `CSC-${id}`,
      category: form.productType || "민원처리",
      status: "open",
      priority: opsCase.priority,
      riskLevel: opsCase.riskLevel,
      assignedToId,
    });
  }
  if (opsCase.requiresHumanReview || ["high", "critical"].includes(opsCase.riskLevel)) {
    jbwcInsert("approvals", {
      id: jbwcNextId("APR-JBWC", "approvals"),
      affiliateId: JBWC_AFFILIATE_ID,
      caseId: id,
      approvalType: opsCase.domain === "fdsVoicePhishing" ? "FDS 사람 에스컬레이션" : "담당자 검토",
      status: "pending",
      requestedById: assignedToId,
      approverId: jbwcActorForTeam("내부통제팀", "USR-JBWC-COMP-01"),
      requestedAt: now,
    });
  }
  return { case: opsCase, triage };
}

function recordJbWooriCapitalAgentRun(run) {
  const today = new Date().toISOString().slice(0, 10);
  const row = {
    id: jbwcNextId("RUN-JBWC", "agent_runs"),
    affiliateId: JBWC_AFFILIATE_ID,
    agentId: run.agentId,
    caseId: run.caseId || null,
    inputSummary: run.inputSummary,
    outputSummary: run.outputSummary,
    status: run.status || "completed",
    riskLevel: run.riskLevel || "low",
    requiresHumanEscalation: Boolean(run.requiresHumanEscalation),
    createdAt: today,
  };
  jbwcInsert("agent_runs", row);
  (run.handoffs || []).forEach((handoff) => {
    jbwcInsert("agent_handoffs", {
      id: jbwcNextId("HND-JBWC", "agent_handoffs"),
      affiliateId: JBWC_AFFILIATE_ID,
      fromAgentId: run.agentId === "jbwc-orchestrator" ? "jbwc-orchestrator" : run.agentId,
      toAgentId: handoff.toAgentId,
      caseId: run.caseId || null,
      reason: handoff.reason,
      status: run.requiresHumanEscalation ? "escalated" : "open",
      createdAt: today,
    });
  });
  jbwcInsert("audit_logs", {
    id: jbwcNextId("AUD-JBWC", "audit_logs"),
    affiliateId: JBWC_AFFILIATE_ID,
    actorId: run.agentId,
    action: "JBWC_AGENT_RUN",
    targetType: "agent_run",
    targetId: row.id,
    riskLevel: row.riskLevel,
    reviewRequired: Boolean(run.requiresHumanEscalation) || row.status === "needsReview",
    createdAt: today,
  });
  return row;
}

function runJbWooriCapitalSampleRequest(key) {
  const sample = jbWooriCapitalSampleRequests.find((item) => item.key === key);
  if (!sample) return null;
  const triage = previewJbWooriCapitalTriage({
    domain: sample.domain,
    productType: sample.productType,
    title: sample.text,
    description: sample.text,
    riskLevel: sample.riskLevel || "medium",
    priority: sample.riskLevel === "high" ? "urgent" : "normal",
    vehicleRefId: sample.vehicleRefId,
    requiresHumanReview: false,
  });
  const agent = jbWooriCapitalAgents.find((item) => item.id === triage.recommendedAgent);
  const run = recordJbWooriCapitalAgentRun({
    agentId: triage.recommendedAgent,
    caseId: sample.caseId,
    inputSummary: sample.text,
    outputSummary: `${agent ? agent.displayName : triage.recommendedAgent} 라우팅 · ${JBWC_STATUS_LABELS[triage.initialStatus] || triage.initialStatus} · 내부 운영 참고용`,
    status: triage.requiresHumanReview ? "needsReview" : "completed",
    riskLevel: triage.riskOverride,
    requiresHumanEscalation: triage.escalationRequired,
    handoffs: triage.handoffs,
  });
  return { sample, triage, agent, run };
}

function getJbWooriCapitalDashboardKpis() {
  const counts = getJbWooriCapitalSidebarCounts();
  const tasks = jbwcTable("ops_tasks", JBWC_AFFILIATE_ID);
  const cases = jbwcTable("ops_cases", JBWC_AFFILIATE_ID);
  const runs = jbwcTable("agent_runs", JBWC_AFFILIATE_ID);
  const humanReviewCases = cases.filter((item) => item.requiresHumanReview).length;
  const today = new Date().toISOString().slice(0, 10);
  return [
    ["금일 신규 운영 건", cases.filter((item) => item.createdAt === today).length, "오늘 접수"],
    ["처리 대기 건", counts.cases, "진행중 상태 기준"],
    ["승인 대기 건", counts.approvals, "담당자 승인 대기"],
    ["문서/전자약정 대기", counts.documents, "대기·검토 필요"],
    ["고위험 FDS/보이스피싱", jbwcTable("fds_alerts", JBWC_AFFILIATE_ID).filter((x) => ["high", "critical"].includes(x.severity) && x.status !== "resolved").length, "자동 종결 금지"],
    ["소비자보호 검토", counts.consumerProtection, "사람 검토 필수"],
    ["SLA 임박", tasks.filter((item) => item.dueAt === today && item.status !== "completed").length, "오늘 기한"],
    ["자동화 처리율", `${Math.round((runs.filter((run) => run.status === "completed").length / Math.max(1, runs.length)) * 100)}%`, "모의 실행 기준"],
    ["사람 검토 비율", `${Math.round((humanReviewCases / Math.max(1, cases.length)) * 100)}%`, "케이스 기준"],
  ];
}
