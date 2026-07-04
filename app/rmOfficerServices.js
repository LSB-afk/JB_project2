/* RM service/query layer.
   모든 조회는 rmoTable(table, RMO_ROLE_KEY)로 role scope를 강제한다.
   count는 scope 쿼리 기반(하드코딩 금지). 에이전트 실행은 시뮬레이션 + 실행/핸드오프 기록. */

function rmoNow() { return new Date().toISOString().slice(0, 10); }

function rmoActiveCase(row) {
  return RMO_ACTIVE_CASE_STATUSES.includes(row.status);
}

function rmoStageOf(row) {
  return row.stage || RMO_STAGE_BY_STATUS[row.status] || "todo";
}

function rmoUserName(id) {
  const user = rmoTable("rm_officer_users", RMO_ROLE_KEY).find((item) => item.id === id);
  return user ? user.name : (id || "-");
}

function getRmOfficerSidebarCounts() {
  const t = (name) => rmoTable(name, RMO_ROLE_KEY);
  const cases = t("rm_officer_cases");
  const active = cases.filter(rmoActiveCase);
  const stageCount = (stage) => cases.filter((c) => rmoStageOf(c) === stage).length;
  const byType = (type) => active.filter((c) => c.caseType === type).length;
  const assignments = t("rm_officer_agent_assignments");
  const runs = t("rm_officer_agent_runs");
  const deliverables = t("rm_officer_deliverables");
  return {
    board: active.length,
    todo: stageCount("todo"),
    doing: stageCount("doing"),
    done: stageCount("done"),
    consultQueue: t("rm_officer_consult_queue").filter((x) => ["pending", "inProgress"].includes(x.status)).length,
    approvals: t("rm_officer_approvals").filter((x) => x.status === "pending").length,
    policyChecklists: t("rm_officer_policy_checklists").filter((x) => x.status === "open" || x.reviewRequired).length,
    deliverables: deliverables.filter((x) => x.kind === "integrated").length,
    cases: cases.length,
    disaster: byType("disasterRisk"),
    repayment: byType("repaymentCare"),
    dailyFinance: byType("dailyFinance"),
    policyStartup: byType("policyStartup"),
    agentQueue: assignments.filter((x) => ["pendingApproval", "running"].includes(x.status)).length,
    agentHarness: runs.filter((x) => ["queued", "running", "needsReview"].includes(x.status)).length + assignments.filter((x) => x.status === "running").length,
    capabilities: (typeof RMO_CAPABILITIES !== "undefined" ? RMO_CAPABILITIES.length : 0),
    dataConnectors: t("rm_officer_external_connectors").filter((x) => ["degraded", "down"].includes(x.health) || x.status === "manualRequired").length,
    roles: t("rm_officer_role_assignments").filter((x) => x.status === "needsReview" || x.reviewRequired).length,
    auditLogs: t("rm_officer_audit_logs").filter((x) => x.reviewRequired).length,
  };
}

function getRmOfficerSidebarCountsAsync() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try { resolve(getRmOfficerSidebarCounts()); } catch (error) { reject(error); }
    }, 120);
  });
}

function rmoSearchBlockedReason(query) {
  const q = String(query || "");
  if (/\d{6}-?[1-4]\d{6}/.test(q)) return "주민등록번호 형식은 검색할 수 없습니다.";
  if (/01[016789][-\s]?\d{3,4}[-\s]?\d{4}/.test(q)) return "전화번호 형식은 검색할 수 없습니다.";
  if (/\d{11,}/.test(q)) return "계좌번호 또는 민감 숫자열로 추정되어 검색할 수 없습니다.";
  return null;
}

function searchRmOfficerRecords(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q || rmoSearchBlockedReason(q)) return [];
  const hit = (value) => String(value || "").toLowerCase().includes(q);
  const out = [];
  rmoTable("rm_officer_cases", RMO_ROLE_KEY).forEach((c) => {
    const type = RMO_CASE_TYPES[c.caseType] || {};
    if (hit(c.caseNo) || hit(c.customerAlias) || hit(c.customerRefId) || hit(c.region) || hit(c.bank)
      || hit(c.theme) || hit(type.label) || hit(rmoUserName(c.assignedRmId)) || (c.tags || []).some(hit)) {
      out.push({ kind: "case", view: "cases", id: c.id, label: `${c.caseNo} · ${c.customerAlias}`, sub: `${type.label || c.caseType} · ${RMO_STATUS_LABELS[c.status] || c.status}` });
    }
  });
  rmoTable("rm_officer_deliverables", RMO_ROLE_KEY).forEach((d) => {
    if (hit(d.title) || hit(d.fileName) || hit(d.summary)) out.push({ kind: "deliverable", view: "deliverables", id: d.id, label: `${d.fileName} · ${d.title}`, sub: `${d.kind === "integrated" ? "통합본" : "개별 산출물"}` });
  });
  rmoTable("rm_officer_consult_queue", RMO_ROLE_KEY).forEach((x) => {
    if (hit(x.topic) || hit(x.id)) out.push({ kind: "consult", view: "consult-queue", id: x.id, label: `${x.id} · ${x.topic}`, sub: `상담 큐 · ${RMO_STATUS_LABELS[x.status] || x.status}` });
  });
  return out.slice(0, 16);
}

function searchRmOfficerRecordsAsync(query) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const blocked = rmoSearchBlockedReason(query);
        if (blocked) { resolve({ blocked }); return; }
        resolve({ results: searchRmOfficerRecords(query) });
      } catch (error) { reject(error); }
    }, 150);
  });
}

function rmoRunHook(hookName, payload) {
  if (typeof harnessRunHooks !== "function") return { ok: true, violations: [] };
  return harnessRunHooks("rm-officer", hookName, payload);
}

function rmoWriteAudit(row) {
  const audit = rmoScopedRow(row);
  rmoRunHook("onAuditWrite", { audit });
  return rmoInsert("rm_officer_audit_logs", audit);
}

function createRmOfficerCase(form) {
  const now = rmoNow();
  const payload = { ...form, roleKey: RMO_ROLE_KEY };
  const guard = rmoRunHook("beforeCaseCreate", payload);
  if (!guard.ok) {
    rmoWriteAudit({
      id: rmoNextId("RMO-AUD", "rm_officer_audit_logs"),
      actorId: form.assignedRmId || "USR-RMO-01",
      action: "RMO_HOOK_BLOCKED_CASE_CREATE",
      targetType: "hook",
      targetId: "beforeCaseCreate",
      riskLevel: "medium",
      reviewRequired: true,
      note: guard.violations.join(" / "),
      createdAt: now,
    });
    return { blocked: true, violations: guard.violations };
  }
  const preview = previewRmOfficerPriority(form);
  const id = rmoNextId("RMO-CASE", "rm_officer_cases");
  const sequence = rmoTable("rm_officer_cases", RMO_ROLE_KEY).length + 1;
  const type = RMO_CASE_TYPES[form.caseType] ? form.caseType : "repaymentCare";
  const row = rmoInsert("rm_officer_cases", rmoScopedRow({
    id,
    caseNo: form.caseNo || `JBG-${String(300 + sequence)}`,
    customerRefId: form.customerRefId || `RMO-CUST-${String(sequence).padStart(4, "0")}`,
    customerAlias: form.customerAlias || "익명 고객",
    bank: form.bank || "전북은행",
    region: form.region || "전북 전주시",
    caseType: type,
    theme: form.theme || form.title || `${RMO_CASE_TYPES[type].label} 상담`,
    title: form.theme || form.title || `${RMO_CASE_TYPES[type].label} 상담`,
    situation: form.situation || "",
    stage: preview.initialStatus === "escalated" ? "doing" : "todo",
    status: preview.initialStatus,
    riskLevel: preview.riskLevel,
    priority: preview.priority,
    priorityScore: preview.priorityScore,
    priorityReason: preview.priorityReason,
    prioritySources: preview.prioritySources,
    requestedAmountBand: form.requestedAmountBand || "3천만원 이하",
    assignedRmId: form.assignedRmId || "USR-RMO-01",
    assignedTeam: preview.recommendedTeam,
    dueAt: form.dueAt || now,
    requiresHumanReview: preview.requiresHumanReview,
    escalationRequired: preview.escalationRequired,
    agentPlan: preview.agentPlan,
    createdAt: now,
    updatedAt: now,
    tags: [RMO_CASE_TYPES[type].label, form.bank || "전북은행"],
  }));

  const wm = rmoWorkMapAgentsForCaseType(type);
  function insertWorkMapNode(agentId, order, kind, status) {
    const agent = rmOfficerAgents.find((a) => a.id === agentId) || rmOfficerAgents[0];
    const tpl = rmoDeliverableTemplate(agentId);
    const fields = rmoNodeFieldsFor(agentId);
    rmoInsert("rm_officer_agent_assignments", rmoScopedRow({
      id: rmoNextId("RMO-ASG", "rm_officer_agent_assignments"),
      caseId: row.id,
      agentId,
      order,
      kind,
      status,
      expectedOutput: agent.deliverableFile,
      outputMdPath: agent.deliverableFile,
      estimatedMinutes: agent.estimatedMinutes,
      reason: agent.description,
      role: fields.role,
      inputData: fields.inputData,
      tools: fields.tools,
      riskLevel: fields.riskLevel || row.riskLevel,
      requiresApproval: true,
      expectedValue: tpl.expectedValue,
      dataChips: (tpl.sources || []).map((s) => s.label),
      progress: 0,
      createdAt: now,
    }));
  }
  wm.branches.forEach((agentId, order) => insertWorkMapNode(agentId, order, "branch", "pendingApproval"));
  insertWorkMapNode(wm.report, wm.branches.length, "report", "notStarted");

  /* 총괄(orchestrator) 노드는 자동 완료 — 우선순위 근거 산정 결과를 priority-brief.md로 즉시 남긴다 */
  const orchestratorDoc = rmoBuildAgentDeliverable(row, "rmo-triage");
  orchestratorDoc.id = rmoNextId("RMO-DLV", "rm_officer_deliverables");
  rmoInsert("rm_officer_deliverables", rmoScopedRow(orchestratorDoc));

  rmoInsert("rm_officer_evidence_items", rmoScopedRow({
    id: rmoNextId("RMO-EVD", "rm_officer_evidence_items"),
    caseId: row.id,
    evidenceType: "intake",
    title: "신규 여신 상담 접수 근거",
    summary: "익명 Ref 기준 접수 — 원문 민감정보 없음",
    sourceMode: "sample",
    createdAt: now,
    reviewRequired: true,
  }));
  rmoWriteAudit({ id: rmoNextId("RMO-AUD", "rm_officer_audit_logs"), caseId: row.id, actorId: row.assignedRmId, action: "CASE_CREATED", targetType: "rm_officer_case", targetId: row.id, riskLevel: row.riskLevel, reviewRequired: row.requiresHumanReview, createdAt: now });
  const run = recordRmOfficerAgentRun({
    agentId: "rmo-triage",
    caseId: row.id,
    inputSummary: `${row.caseNo} ${RMO_CASE_TYPES[type].label} 우선순위 산정`,
    outputSummary: `${RMO_PRIORITY_LABELS[row.priority]}(${row.priorityScore}) · ${row.priorityReason}`,
    status: row.requiresHumanReview ? "needsReview" : "completed",
    riskLevel: row.riskLevel,
  });
  if (preview.escalationRequired) {
    rmoInsert("rm_officer_agent_handoffs", rmoScopedRow({
      id: rmoNextId("RMO-HND", "rm_officer_agent_handoffs"),
      fromAgentId: "rmo-triage",
      toAgentId: "rmo-compliance",
      caseId: row.id,
      reason: "high/critical — 준법 검증 후 승인 라우팅",
      status: "escalated",
      createdAt: now,
    }));
  }
  return { case: row, preview, run };
}

function recordRmOfficerAgentRun(input) {
  const now = rmoNow();
  const payload = { ...input, roleKey: RMO_ROLE_KEY };
  const guard = rmoRunHook("beforeAgentRun", payload);
  const evaluation = rmoEvaluateAgentOutput(payload);
  const run = rmoInsert("rm_officer_agent_runs", rmoScopedRow({
    id: rmoNextId("RMO-RUN", "rm_officer_agent_runs"),
    agentId: input.agentId || "rmo-triage",
    caseId: input.caseId,
    inputSummary: input.inputSummary || "RM 샘플 요청",
    outputSummary: input.outputSummary || "내부 업무 참고용 결과 생성",
    status: !guard.ok || !evaluation.ok ? "needsReview" : (input.status || "completed"),
    riskLevel: input.riskLevel || "medium",
    requiresHumanReview: evaluation.requiresHumanReview || input.requiresHumanReview === true,
    violations: (guard.violations || []).concat(evaluation.issues || []),
    runtime: input.runtime || "mock",
    model: input.model || "",
    runtimeStatus: input.runtimeStatus || (input.runtime === "ollama" ? "ok" : "mock"),
    validatedOutput: input.validatedOutput || "",
    errorSummary: input.errorSummary || "",
    createdAt: now,
  }));
  if (!guard.ok || !evaluation.ok) {
    rmoWriteAudit({ id: rmoNextId("RMO-AUD", "rm_officer_audit_logs"), caseId: input.caseId, actorId: input.agentId || "rmo-triage", action: "RMO_HOOK_VIOLATION_AGENT_RUN", targetType: "rm_officer_agent_run", targetId: run.id, riskLevel: run.riskLevel, reviewRequired: true, note: run.violations.join(" / "), createdAt: now });
  } else {
    rmoWriteAudit({ id: rmoNextId("RMO-AUD", "rm_officer_audit_logs"), caseId: input.caseId, actorId: input.agentId || "rmo-triage", action: "AGENT_RUN_RECORDED", targetType: "rm_officer_agent_run", targetId: run.id, riskLevel: run.riskLevel, reviewRequired: run.requiresHumanReview, createdAt: now });
  }
  return run;
}

/* 키보드 Enter 승인 — 선택된 업무 계층도 노드(branch/report)를 (모의) 실행하고 개별 md 산출물을 만든다.
   report 노드는 모든 branch 노드가 완료된 뒤에만 실행 가능(선행 완료 게이팅). report 실행 시 통합본을
   만들고, high/critical은 자동 완료하지 않고 report 노드를 needsApproval(보라)로 남겨 담당자 검토로 라우팅한다. */
function approveRmOfficerAssignment(assignmentId) {
  const now = rmoNow();
  const asg = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY).find((a) => a.id === assignmentId);
  if (!asg) return { error: "배정을 찾을 수 없습니다." };
  if (["completed", "needsApproval"].includes(asg.status)) return { alreadyDone: true, assignment: asg };
  const caseRow = rmoTable("rm_officer_cases", RMO_ROLE_KEY).find((c) => c.id === asg.caseId);
  if (!caseRow) return { error: "케이스를 찾을 수 없습니다." };

  if (asg.kind === "report") {
    const incompleteBranches = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY)
      .filter((a) => a.caseId === caseRow.id && a.kind !== "report" && a.status !== "completed");
    if (incompleteBranches.length) return { error: "선행 분석 노드를 먼저 완료해야 합니다." };
  } else if (asg.status !== "pendingApproval") {
    return { error: "아직 실행할 수 없는 노드입니다." };
  }

  const built = rmoBuildAgentDeliverable(caseRow, asg.agentId);
  built.id = rmoNextId("RMO-DLV", "rm_officer_deliverables");
  rmoInsert("rm_officer_deliverables", rmoScopedRow(built));

  const run = recordRmOfficerAgentRun({
    agentId: asg.agentId,
    caseId: caseRow.id,
    inputSummary: `${caseRow.caseNo} ${rmoAgentDisplayName(asg.agentId)} 실행`,
    outputSummary: built.summary,
    status: "completed",
    riskLevel: caseRow.riskLevel,
  });
  rmoWriteAudit({ id: rmoNextId("RMO-AUD", "rm_officer_audit_logs"), caseId: caseRow.id, actorId: asg.agentId, action: "DELIVERABLE_CREATED", targetType: "rm_officer_deliverable", targetId: built.id, riskLevel: caseRow.riskLevel, reviewRequired: true, createdAt: now });

  let stage = caseRow.stage;
  let status = caseRow.status;
  if (rmoStageOf(caseRow) === "todo") { stage = "doing"; status = "analyzing"; }

  let integrated = null;
  if (asg.kind === "report") {
    const agentDeliverables = rmoTable("rm_officer_deliverables", RMO_ROLE_KEY).filter((d) => d.caseId === caseRow.id && d.kind === "agent");
    integrated = rmoBuildIntegratedDeliverable(caseRow, agentDeliverables);
    integrated.id = rmoNextId("RMO-DLV", "rm_officer_deliverables");
    rmoInsert("rm_officer_deliverables", rmoScopedRow(integrated));
    /* high/critical은 자동 종결 금지 → report 노드를 사람 승인 필요(보라) 상태로 남기고 승인 라우팅 */
    if (["high", "critical"].includes(caseRow.riskLevel)) {
      status = "humanReview"; stage = "doing";
      rmoUpdate("rm_officer_agent_assignments", asg.id, { status: "needsApproval", progress: 100 });
      rmoInsert("rm_officer_approvals", rmoScopedRow({ id: rmoNextId("RMO-APR", "rm_officer_approvals"), caseId: caseRow.id, approvalType: "고위험 통합 리포트 검토 승인", status: "pending", requestedById: caseRow.assignedRmId, approverId: "USR-RMO-APR-01", requestedAt: now }));
      rmoInsert("rm_officer_agent_handoffs", rmoScopedRow({ id: rmoNextId("RMO-HND", "rm_officer_agent_handoffs"), fromAgentId: "rmo-compliance", toAgentId: "rmo-approval-router", caseId: caseRow.id, reason: "high/critical 통합 리포트 — 승인 라우팅", status: "escalated", createdAt: now }));
    } else {
      status = "completed"; stage = "done";
      rmoUpdate("rm_officer_agent_assignments", asg.id, { status: "completed", progress: 100 });
    }
    rmoWriteAudit({ id: rmoNextId("RMO-AUD", "rm_officer_audit_logs"), caseId: caseRow.id, actorId: "rmo-triage", action: "INTEGRATED_REPORT_CREATED", targetType: "rm_officer_deliverable", targetId: integrated.id, riskLevel: caseRow.riskLevel, reviewRequired: status === "humanReview", createdAt: now });
  } else {
    rmoUpdate("rm_officer_agent_assignments", asg.id, { status: "completed", progress: 100 });
    /* 모든 branch가 완료되면 report 노드를 notStarted(회색)에서 실행 가능(파랑)으로 전환한다 */
    const branchSiblings = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY).filter((a) => a.caseId === caseRow.id && a.kind !== "report");
    const allBranchesDone = branchSiblings.every((a) => a.id === asg.id || a.status === "completed");
    if (allBranchesDone) {
      const reportNode = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY).find((a) => a.caseId === caseRow.id && a.kind === "report");
      if (reportNode && reportNode.status === "notStarted") rmoUpdate("rm_officer_agent_assignments", reportNode.id, { status: "pendingApproval" });
    }
  }
  rmoUpdate("rm_officer_cases", caseRow.id, { stage, status, updatedAt: now });

  return {
    assignment: rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY).find((a) => a.id === asg.id),
    deliverable: built,
    run,
    integrated,
    case: rmoTable("rm_officer_cases", RMO_ROLE_KEY).find((c) => c.id === caseRow.id),
  };
}

/* 키보드 R — 완료/반려 노드를 재실행한다. 이전 산출물(개별 md, report면 통합본까지)을 정리한 뒤
   pendingApproval로 되돌려 approveRmOfficerAssignment를 다시 태운다. */
function rmoRerunWorkMapNode(assignmentId) {
  const asg = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY).find((a) => a.id === assignmentId);
  if (!asg) return { error: "노드를 찾을 수 없습니다." };
  if (!["completed", "rejected", "needsApproval"].includes(asg.status)) return { error: "재실행할 수 없는 상태입니다." };
  const db = rmoLoadDb();
  db.rm_officer_deliverables = (db.rm_officer_deliverables || []).filter((d) => {
    if (d.caseId !== asg.caseId) return true;
    if (asg.kind === "report" && d.kind === "integrated") return false;
    if (d.agentId === asg.agentId && d.kind === "agent") return false;
    return true;
  });
  rmoSaveDb();
  rmoUpdate("rm_officer_agent_assignments", asg.id, { status: "pendingApproval", progress: 0 });
  return approveRmOfficerAssignment(assignmentId);
}

/* 키보드 A — 케이스 통합 보고서 최종 승인(직원 최종 승인). report 노드가 완료/승인대기 상태여야 하며,
   high/critical로 승인 라우팅된 케이스는 대기 중인 approval을 함께 승인 처리한다. */
function rmoApproveCaseReport(caseId, decidedBy) {
  const now = rmoNow();
  const caseRow = rmoTable("rm_officer_cases", RMO_ROLE_KEY).find((c) => c.id === caseId);
  if (!caseRow) return { error: "케이스를 찾을 수 없습니다." };
  const reportNode = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY).find((a) => a.caseId === caseId && a.kind === "report");
  if (!reportNode || !["needsApproval", "completed"].includes(reportNode.status)) {
    return { error: "아직 승인할 통합 보고서가 없습니다. 먼저 분석 노드를 모두 완료하세요." };
  }
  if (caseRow.status === "completed") return { alreadyDone: true, case: caseRow };
  const actor = decidedBy || "USR-RMO-APR-01";
  const pendingApproval = rmoTable("rm_officer_approvals", RMO_ROLE_KEY).find((a) => a.caseId === caseId && a.status === "pending");
  if (pendingApproval) rmoDecideApproval(pendingApproval.id, "approve", actor);
  rmoUpdate("rm_officer_agent_assignments", reportNode.id, { status: "completed", progress: 100 });
  rmoUpdate("rm_officer_cases", caseId, { status: "completed", stage: "done", updatedAt: now });
  rmoWriteAudit({ id: rmoNextId("RMO-AUD", "rm_officer_audit_logs"), caseId, actorId: actor, action: "CASE_REPORT_APPROVED", targetType: "rm_officer_case", targetId: caseId, riskLevel: caseRow.riskLevel, reviewRequired: false, createdAt: now });
  return {
    case: rmoTable("rm_officer_cases", RMO_ROLE_KEY).find((c) => c.id === caseId),
    report: rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY).find((a) => a.id === reportNode.id),
  };
}

function rmoDecideApproval(approvalId, decision, decidedBy) {
  const now = rmoNow();
  const approval = rmoTable("rm_officer_approvals", RMO_ROLE_KEY).find((a) => a.id === approvalId);
  if (!approval) return { error: "승인 항목을 찾을 수 없습니다." };
  const actor = decidedBy || "USR-RMO-APR-01";
  const guard = rmoRunHook("afterApprovalDecision", { approvalId, decision, decidedBy: actor });
  const status = decision === "approve" ? "approved" : "rejected";
  rmoUpdate("rm_officer_approvals", approvalId, { status, decidedAt: now, decidedBy: actor });
  rmoWriteAudit({ id: rmoNextId("RMO-AUD", "rm_officer_audit_logs"), caseId: approval.caseId, actorId: actor, action: "APPROVAL_DECIDED", targetType: "rm_officer_approval", targetId: approvalId, riskLevel: "medium", reviewRequired: false, note: `${status}${guard.ok ? "" : " · " + guard.violations.join(" / ")}`, createdAt: now });
  return { approval: rmoTable("rm_officer_approvals", RMO_ROLE_KEY).find((a) => a.id === approvalId), guard };
}

/* ---- Ollama 로컬 모델 (선택) — 실패 시 graceful degrade + needsReview 기록 ---- */
function rmoSafeModelCaseSummary(caseRow) {
  if (!caseRow) return {};
  return {
    caseNo: caseRow.caseNo,
    customerRefId: caseRow.customerRefId,
    bank: caseRow.bank,
    region: caseRow.region,
    caseType: caseRow.caseType,
    theme: caseRow.theme,
    situation: caseRow.situation,
    stage: caseRow.stage,
    status: caseRow.status,
    riskLevel: caseRow.riskLevel,
    priorityReason: caseRow.priorityReason,
  };
}

function rmoModelOutputSummary(modelResult) {
  const parsed = modelResult && modelResult.parsed ? modelResult.parsed : {};
  const summary = parsed.summary || modelResult.output || "로컬 모델 응답이 비어 있습니다.";
  const nextActions = Array.isArray(parsed.nextActions) ? parsed.nextActions.slice(0, 2).join(" / ") : "";
  const riskNotes = Array.isArray(parsed.riskNotes) ? parsed.riskNotes.slice(0, 2).join(" / ") : "";
  return [
    `Ollama ${modelResult.model}`,
    "내부 업무 참고용",
    summary,
    nextActions ? `다음 조치: ${nextActions}` : "",
    riskNotes ? `리스크 메모: ${riskNotes}` : "",
  ].filter(Boolean).join(" · ").slice(0, 900);
}

async function runRmOfficerOllamaSampleRequest(key) {
  if (typeof runAgentModelRequest !== "function") {
    throw new Error("에이전트 모델 설정 모듈이 로드되지 않았습니다.");
  }
  const sample = rmOfficerSampleRequests.find((item) => item.key === key) || rmOfficerSampleRequests[0];
  const caseRow = rmoTable("rm_officer_cases", RMO_ROLE_KEY).find((item) => item.caseNo === sample.caseNo) || rmoTable("rm_officer_cases", RMO_ROLE_KEY)[0];
  const preview = previewRmOfficerPriority({
    caseType: sample.caseType || (caseRow && caseRow.caseType) || "repaymentCare",
    riskLevel: sample.riskLevel || (caseRow && caseRow.riskLevel) || "medium",
    dueAt: caseRow ? caseRow.dueAt : "",
  });
  const agentId = sample.comms ? "rmo-comms" : preview.agentPlan[0];
  const agent = rmOfficerAgents.find((item) => item.id === agentId);
  const modelResult = await runAgentModelRequest({
    harnessId: "rm-officer",
    roleKey: RMO_ROLE_KEY,
    agentId,
    agentKey: agent && agent.agentKey,
    input: {
      request: sample.text,
      case: rmoSafeModelCaseSummary(caseRow),
      priority: preview,
      guardrails: RMO_FORBIDDEN_OUTPUTS,
      outputPolicy: "내부 업무 참고용. 실제 승인/거절, 금리/한도, 신용평가, 정책자금 대상 확정 금지. 담당자 검토 필요.",
    },
  });
  const outputSummary = rmoModelOutputSummary(modelResult);
  const run = recordRmOfficerAgentRun({
    agentId,
    caseId: caseRow && caseRow.id,
    inputSummary: `[Ollama] ${sample.text}`,
    outputSummary,
    status: "needsReview",
    riskLevel: preview.riskLevel,
    requiresHumanReview: true,
    runtime: "ollama",
    model: modelResult.model,
    runtimeStatus: modelResult.evaluation && modelResult.evaluation.ok ? "ok" : "needsReview",
    validatedOutput: modelResult.parsed ? JSON.stringify(modelResult.parsed) : "",
  });
  return { sample, caseRow, preview, run, agent, modelResult };
}

function runRmOfficerSampleRequest(key) {
  const sample = rmOfficerSampleRequests.find((item) => item.key === key) || rmOfficerSampleRequests[0];
  const caseRow = rmoTable("rm_officer_cases", RMO_ROLE_KEY).find((item) => item.caseNo === sample.caseNo) || rmoTable("rm_officer_cases", RMO_ROLE_KEY)[0];
  const preview = previewRmOfficerPriority({
    caseType: sample.caseType || (caseRow && caseRow.caseType) || "repaymentCare",
    riskLevel: sample.riskLevel || (caseRow && caseRow.riskLevel) || "medium",
    dueAt: caseRow ? caseRow.dueAt : "",
  });
  const agentId = sample.comms ? "rmo-comms" : preview.agentPlan[0];
  const run = recordRmOfficerAgentRun({
    agentId,
    caseId: caseRow && caseRow.id,
    inputSummary: sample.text,
    outputSummary: sample.comms ? "고객 안내문 초안 생성 · 발송 승인 대기 · 확정 표현 없음" : `${RMO_PRIORITY_LABELS[preview.priority]} 우선순위 · ${preview.nextActions.join(" / ")}`,
    status: preview.requiresHumanReview || sample.comms ? "needsReview" : "completed",
    riskLevel: preview.riskLevel,
    requiresHumanReview: preview.requiresHumanReview || sample.comms,
  });
  if (sample.comms && caseRow) {
    rmoInsert("rm_officer_approvals", rmoScopedRow({
      id: rmoNextId("RMO-APR", "rm_officer_approvals"),
      caseId: caseRow.id,
      approvalType: "고객 안내문 발송 승인",
      status: "pending",
      requestedById: caseRow.assignedRmId,
      approverId: "USR-RMO-APR-01",
      requestedAt: rmoNow(),
    }));
  }
  return { sample, caseRow, preview, run, agent: rmOfficerAgents.find((agent) => agent.id === run.agentId) };
}
