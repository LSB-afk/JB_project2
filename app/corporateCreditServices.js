/* 기업여신 service/query layer.
   모든 조회는 ccrTable(table, CCR_ROLE_KEY)로 role scope를 강제한다. */

function ccrActiveCase(row) {
  return CCR_ACTIVE_CASE_STATUSES.includes(row.status);
}

function ccrUserName(id) {
  const user = ccrTable("corporate_credit_users", CCR_ROLE_KEY).find((item) => item.id === id);
  return user ? user.name : (id || "-");
}

function ccrAgentDisplayName(id) {
  const agent = corporateCreditAgents.find((item) => item.id === id);
  return agent ? agent.displayName : (id || "-");
}

function getCorporateCreditSidebarCounts() {
  const t = (name) => ccrTable(name, CCR_ROLE_KEY);
  const cases = t("corporate_credit_cases");
  const active = cases.filter(ccrActiveCase);
  const byDomain = (domain) => active.filter((c) => c.domain === domain).length;
  const tasks = t("corporate_credit_tasks");
  const signals = t("corporate_credit_risk_signals");
  const runs = t("corporate_credit_agent_runs");
  const agents = t("corporate_credit_harness_agents");
  return {
    board: active.length,
    intake: active.filter((c) => ["received", "intakeScreening", "docsCollecting"].includes(c.status)).length,
    docReview: t("corporate_credit_documents").filter((x) => ["missing", "needsReview"].includes(x.status) || x.reviewRequired).length,
    approvalQueue: t("corporate_credit_approvals").filter((x) => x.status === "pending").length,
    auditLogs: t("corporate_credit_audit_logs").filter((x) => x.reviewRequired).length,
    cases: cases.length,
    workingCapital: byDomain("workingCapital"),
    facilityLoan: byDomain("facilityLoan"),
    guaranteeBacked: byDomain("guaranteeBackedLoan"),
    collateral: byDomain("movableCollateralLoan"),
    tradeFinance: byDomain("tradeFinance"),
    policyEsg: byDomain("policyEsgLoan"),
    pfStructured: byDomain("pfStructuredFinance"),
    renewals: byDomain("renewalModification"),
    earlyWarning: byDomain("earlyWarningNpl") + signals.filter((x) => x.signalType === "EARLY_WARNING_SIGNAL").length,
    nplMonitoring: active.filter((c) => c.domain === "earlyWarningNpl" && ["high", "critical"].includes(c.riskLevel)).length,
    collateralMaturity: t("corporate_credit_collateral_checks").filter((x) => x.status !== "verified").length + t("corporate_credit_guarantee_checks").filter((x) => x.status !== "verified").length,
    covenantChecks: tasks.filter((x) => /covenant|약정|만기/.test(x.title)).length + byDomain("postMonitoring"),
    aiAnalysis: t("corporate_credit_agent_runs").filter((x) => ["queued", "running", "needsReview"].includes(x.status)).length,
    memoDrafts: t("corporate_credit_credit_memos").filter((x) => ["draft", "pendingApproval"].includes(x.status)).length,
    agentHarness: runs.filter((x) => ["queued", "running", "needsReview", "pendingApproval"].includes(x.status)).length + agents.filter((x) => ["needsReview", "escalated"].includes(x.status)).length,
    dataConnectors: t("corporate_credit_external_connectors").filter((x) => ["degraded", "down"].includes(x.health) || x.status === "manualRequired").length,
    roles: t("corporate_credit_role_assignments").filter((x) => x.status === "needsReview" || x.reviewRequired).length,
    inspections: t("corporate_credit_inspection_schedules").filter((x) => ["upcoming", "overdue"].includes(x.status)).length,
  };
}

function getCorporateCreditSidebarCountsAsync() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try { resolve(getCorporateCreditSidebarCounts()); } catch (error) { reject(error); }
    }, 120);
  });
}

function ccrSearchBlockedReason(query) {
  const q = String(query || "");
  if (/\d{3}-?\d{2}-?\d{5}/.test(q)) return "사업자등록번호 형식은 검색할 수 없습니다.";
  if (/01[016789][-\s]?\d{3,4}[-\s]?\d{4}/.test(q)) return "전화번호 형식은 검색할 수 없습니다.";
  if (/\d{11,}/.test(q)) return "계좌번호 또는 민감 숫자열로 추정되어 검색할 수 없습니다.";
  return null;
}

function searchCorporateCreditRecords(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q || ccrSearchBlockedReason(q)) return [];
  const hit = (value) => String(value || "").toLowerCase().includes(q);
  const out = [];
  ccrTable("corporate_credit_cases", CCR_ROLE_KEY).forEach((c) => {
    const domain = CCR_DOMAINS[c.domain] || {};
    if (hit(c.caseNo) || hit(c.companyAlias) || hit(c.borrowerRefId) || hit(c.industry)
      || hit(c.productType) || hit(domain.label) || hit(ccrUserName(c.assignedRmId)) || (c.tags || []).some(hit)) {
      out.push({ kind: "case", view: "cases", id: c.id, label: `${c.caseNo} · ${c.companyAlias}`, sub: `${domain.label || c.domain} · ${CCR_STATUS_LABELS[c.status] || c.status}` });
    }
  });
  ccrTable("corporate_credit_risk_signals", CCR_ROLE_KEY).forEach((x) => {
    if (hit(x.title) || hit(x.signalType) || hit(x.evidence)) out.push({ kind: "signal", view: "early-warning", id: x.id, label: `${x.id} · ${x.title}`, sub: `리스크 신호 · ${CCR_RISK_LABELS[x.severity] || x.severity}` });
  });
  ccrTable("corporate_credit_credit_memos", CCR_ROLE_KEY).forEach((x) => {
    if (hit(x.title) || hit(x.summary)) out.push({ kind: "memo", view: "memo-drafts", id: x.id, label: `${x.id} · ${x.title}`, sub: `여신메모 · ${CCR_STATUS_LABELS[x.status] || x.status}` });
  });
  ccrTable("corporate_credit_collateral_checks", CCR_ROLE_KEY).forEach((x) => {
    if (hit(x.collateralType) || hit(x.id)) out.push({ kind: "collateral", view: "collateral", id: x.id, label: `${x.id} · ${x.collateralType}`, sub: "담보 확인" });
  });
  ccrTable("corporate_credit_guarantee_checks", CCR_ROLE_KEY).forEach((x) => {
    if (hit(x.provider) || hit(x.id)) out.push({ kind: "guarantee", view: "guarantee-backed", id: x.id, label: `${x.id} · ${x.provider}`, sub: "보증 확인" });
  });
  return out.slice(0, 16);
}

function searchCorporateCreditRecordsAsync(query) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const blocked = ccrSearchBlockedReason(query);
        if (blocked) { resolve({ blocked }); return; }
        resolve({ results: searchCorporateCreditRecords(query) });
      } catch (error) { reject(error); }
    }, 150);
  });
}

function ccrRunHook(hookName, payload) {
  if (typeof harnessRunHooks !== "function") return { ok: true, violations: [] };
  return harnessRunHooks("corporate-credit", hookName, payload);
}

function ccrWriteAudit(row) {
  const audit = ccrScopedRow(row);
  ccrRunHook("onAuditWrite", { audit });
  return ccrInsert("corporate_credit_audit_logs", audit);
}

function createCorporateCreditCase(form) {
  const now = new Date().toISOString().slice(0, 10);
  const payload = { ...form, roleKey: CCR_ROLE_KEY };
  const guard = ccrRunHook("beforeCaseCreate", payload);
  if (!guard.ok) {
    ccrWriteAudit({
      id: ccrNextId("CCR-AUD", "corporate_credit_audit_logs"),
      actorId: form.assignedRmId || "USR-CCR-RM-01",
      action: "CCR_HOOK_BLOCKED_CASE_CREATE",
      targetType: "hook",
      targetId: "beforeCaseCreate",
      riskLevel: "medium",
      reviewRequired: true,
      note: guard.violations.join(" / "),
      createdAt: now,
    });
    return { blocked: true, violations: guard.violations };
  }
  const triage = previewCorporateCreditTriage(form);
  const id = ccrNextId("CCR-CASE", "corporate_credit_cases");
  const sequence = ccrTable("corporate_credit_cases", CCR_ROLE_KEY).length + 1;
  const domain = CCR_DOMAINS[form.domain] || CCR_DOMAINS.workingCapital;
  const row = ccrInsert("corporate_credit_cases", ccrScopedRow({
    id,
    caseNo: `기업여신-${String(sequence).padStart(4, "0")}`,
    borrowerRefId: form.borrowerRefId || `익명기업-${String(sequence).padStart(4, "0")}`,
    companyAlias: form.companyAlias || "익명 기업 신규",
    industry: form.industry || "manufacturing",
    region: form.region || "전북",
    domain: form.domain || "workingCapital",
    productType: form.productType || domain.productTypes[0],
    requestedAmountBand: form.requestedAmountBand || "1억~5억",
    title: form.title || `${domain.label} 운영 검토`,
    description: form.description || "",
    status: triage.initialStatus,
    priority: form.priority || "normal",
    riskLevel: triage.riskLevel,
    assignedRmId: form.assignedRmId || "USR-CCR-RM-01",
    assignedTeam: triage.recommendedTeam,
    dueAt: form.dueAt || now,
    financialBaseMonth: form.financialBaseMonth || "2026-05",
    docsStatus: form.docsReceived === false ? "missing" : "received",
    collateralExists: Boolean(form.collateralExists),
    guaranteeExists: Boolean(form.guaranteeExists),
    collateralStatus: form.collateralExists ? "manualRequired" : "notApplicable",
    guaranteeStatus: form.guaranteeExists ? "manualRequired" : "notApplicable",
    externalStatus: form.guaranteeExists ? "pending" : "sample",
    dataMode: "sample",
    requiresHumanReview: triage.requiresHumanReview,
    escalationRequired: triage.escalationRequired,
    createdAt: now,
    updatedAt: now,
    sourceChannel: form.sourceChannel || "opsPortal",
    tags: String(form.tags || "").split(",").map((x) => x.trim()).filter(Boolean),
  }));
  ccrInsert("corporate_credit_tasks", ccrScopedRow({
    id: ccrNextId("CCR-TASK", "corporate_credit_tasks"),
    caseId: row.id,
    title: triage.missingDocuments.length ? "심사 패키지 보완 요청" : "재무자료 기준월 확인",
    status: "open",
    dueAt: row.dueAt,
    ownerId: row.assignedRmId,
  }));
  triage.signals.forEach((signal) => ccrInsert("corporate_credit_risk_signals", ccrScopedRow({
    id: ccrNextId("CCR-SIG", "corporate_credit_risk_signals"),
    caseId: row.id,
    ...signal,
    requiresHumanReview: triage.requiresHumanReview,
    createdAt: now,
  })));
  ccrCreateEvidence(row.id, "intake", "신규 기업여신 운영 건 접수 — 익명 기업 기준", "sample");
  ccrWriteAudit({ id: ccrNextId("CCR-AUD", "corporate_credit_audit_logs"), caseId: row.id, actorId: row.assignedRmId, action: "CASE_CREATED", targetType: "corporate_credit_case", targetId: row.id, riskLevel: row.riskLevel, reviewRequired: row.requiresHumanReview, createdAt: now });
  const run = recordCorporateCreditAgentRun({
    agentId: triage.recommendedAgent,
    caseId: row.id,
    inputSummary: `${row.caseNo} ${domain.label} 접수 분류`,
    outputSummary: `${CCR_STATUS_LABELS[row.status]} · ${triage.nextTasks.slice(0, 2).join(" / ")}`,
    status: triage.requiresHumanReview ? "needsReview" : "completed",
    riskLevel: row.riskLevel,
  });
  if (triage.escalationRequired) {
    ccrInsert("corporate_credit_agent_handoffs", ccrScopedRow({
      id: ccrNextId("CCR-HND", "corporate_credit_agent_handoffs"),
      fromAgentId: triage.recommendedAgent,
      toAgentId: "ccr-compliance",
      caseId: row.id,
      reason: "high/critical 또는 구조화 리스크 — 사람 검토 필수",
      status: "escalated",
      createdAt: now,
    }));
  }
  return { case: row, triage, run };
}

function recordCorporateCreditAgentRun(input) {
  const now = new Date().toISOString().slice(0, 10);
  const payload = { ...input, roleKey: CCR_ROLE_KEY };
  const guard = ccrRunHook("beforeAgentRun", payload);
  const evaluation = ccrEvaluateAgentOutput(payload);
  const run = ccrInsert("corporate_credit_agent_runs", ccrScopedRow({
    id: ccrNextId("CCR-RUN", "corporate_credit_agent_runs"),
    agentId: input.agentId || "ccr-triage",
    caseId: input.caseId,
    inputSummary: input.inputSummary || "기업여신 샘플 요청",
    outputSummary: input.outputSummary || "내부 운영 참고용 결과 생성",
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
  ccrWriteAudit({
    id: ccrNextId("CCR-AUD", "corporate_credit_audit_logs"),
    caseId: input.caseId,
    actorId: input.agentId || "ccr-triage",
    action: "AGENT_RUN_RECORDED",
    targetType: "corporate_credit_agent_run",
    targetId: run.id,
    riskLevel: run.riskLevel,
    reviewRequired: run.requiresHumanReview,
    createdAt: now,
  });
  return run;
}

function ccrSafeModelCaseSummary(caseRow) {
  if (!caseRow) return {};
  return {
    caseNo: caseRow.caseNo,
    borrowerRefId: caseRow.borrowerRefId,
    companyAlias: caseRow.companyAlias,
    industry: caseRow.industry,
    region: caseRow.region,
    domain: caseRow.domain,
    productType: caseRow.productType,
    requestedAmountBand: caseRow.requestedAmountBand,
    status: caseRow.status,
    riskLevel: caseRow.riskLevel,
    docsStatus: caseRow.docsStatus,
    collateralExists: caseRow.collateralExists,
    guaranteeExists: caseRow.guaranteeExists,
    financialBaseMonth: caseRow.financialBaseMonth,
    dataMode: caseRow.dataMode,
  };
}

function ccrModelOutputSummary(modelResult) {
  const parsed = modelResult && modelResult.parsed ? modelResult.parsed : {};
  const summary = parsed.summary || modelResult.output || "로컬 모델 응답이 비어 있습니다.";
  const nextActions = Array.isArray(parsed.nextActions) ? parsed.nextActions.slice(0, 2).join(" / ") : "";
  const riskNotes = Array.isArray(parsed.riskNotes) ? parsed.riskNotes.slice(0, 2).join(" / ") : "";
  return [
    `Ollama ${modelResult.model}`,
    "내부 운영 참고용",
    summary,
    nextActions ? `다음 조치: ${nextActions}` : "",
    riskNotes ? `리스크 메모: ${riskNotes}` : "",
  ].filter(Boolean).join(" · ").slice(0, 900);
}

async function runCorporateCreditOllamaSampleRequest(key) {
  if (typeof runAgentModelRequest !== "function") {
    throw new Error("에이전트 모델 설정 모듈이 로드되지 않았습니다.");
  }
  const sample = corporateCreditSampleRequests.find((item) => item.key === key) || corporateCreditSampleRequests[0];
  const caseRow = ccrTable("corporate_credit_cases", CCR_ROLE_KEY).find((item) => item.caseNo === sample.caseId) || ccrTable("corporate_credit_cases", CCR_ROLE_KEY)[0];
  const triage = previewCorporateCreditTriage({
    domain: sample.domain || (caseRow && caseRow.domain) || "workingCapital",
    docsReceived: caseRow ? caseRow.docsStatus !== "missing" : true,
    collateralExists: caseRow ? caseRow.collateralExists : false,
    guaranteeExists: caseRow ? caseRow.guaranteeExists : false,
    financialBaseMonth: caseRow ? caseRow.financialBaseMonth : "2026-05",
    riskLevel: sample.riskLevel || (caseRow && caseRow.riskLevel) || "medium",
  });
  const agentId = sample.memo ? "ccr-memo" : triage.recommendedAgent;
  const agent = corporateCreditAgents.find((item) => item.id === agentId);
  const modelResult = await runAgentModelRequest({
    harnessId: "corporate-credit",
    roleKey: CCR_ROLE_KEY,
    agentId,
    agentKey: agent && agent.agentKey,
    input: {
      request: sample.text,
      case: ccrSafeModelCaseSummary(caseRow),
      triage,
      guardrails: CCR_FORBIDDEN_OUTPUTS,
      outputPolicy: "내부 운영 참고용. 실제 승인/거절, 금리/한도, 신용평가 판단 금지. 담당자 검토 필요.",
    },
  });
  const outputSummary = ccrModelOutputSummary(modelResult);
  const run = recordCorporateCreditAgentRun({
    agentId,
    caseId: caseRow && caseRow.id,
    inputSummary: `[Ollama] ${sample.text}`,
    outputSummary,
    status: "needsReview",
    riskLevel: triage.riskLevel,
    requiresHumanReview: true,
    runtime: "ollama",
    model: modelResult.model,
    runtimeStatus: modelResult.evaluation && modelResult.evaluation.ok ? "ok" : "needsReview",
    validatedOutput: modelResult.parsed ? JSON.stringify(modelResult.parsed) : "",
  });
  if (caseRow) {
    ccrCreateEvidence(caseRow.id, "ollama", `${modelResult.model} 로컬 모델 응답 저장`, "localModel");
  }
  if (sample.memo && caseRow) {
    ccrInsert("corporate_credit_credit_memos", ccrScopedRow({
      id: ccrNextId("CCR-MEMO", "corporate_credit_credit_memos"),
      caseId: caseRow.id,
      title: `${caseRow.caseNo} 로컬 모델 여신메모 초안`,
      status: "pendingApproval",
      summary: outputSummary,
      createdByAgentId: agentId,
      createdAt: new Date().toISOString().slice(0, 10),
      reviewRequired: true,
    }));
  }
  return { sample, caseRow, triage, run, agent, modelResult };
}

function runCorporateCreditSampleRequest(key) {
  const sample = corporateCreditSampleRequests.find((item) => item.key === key) || corporateCreditSampleRequests[0];
  const caseRow = ccrTable("corporate_credit_cases", CCR_ROLE_KEY).find((item) => item.caseNo === sample.caseId) || ccrTable("corporate_credit_cases", CCR_ROLE_KEY)[0];
  const triage = previewCorporateCreditTriage({
    domain: sample.domain || (caseRow && caseRow.domain) || "workingCapital",
    docsReceived: caseRow ? caseRow.docsStatus !== "missing" : true,
    collateralExists: caseRow ? caseRow.collateralExists : false,
    guaranteeExists: caseRow ? caseRow.guaranteeExists : false,
    financialBaseMonth: caseRow ? caseRow.financialBaseMonth : "2026-05",
    riskLevel: sample.riskLevel || (caseRow && caseRow.riskLevel) || "medium",
  });
  const run = recordCorporateCreditAgentRun({
    agentId: sample.memo ? "ccr-memo" : triage.recommendedAgent,
    caseId: caseRow && caseRow.id,
    inputSummary: sample.text,
    outputSummary: sample.memo ? "여신메모 초안 생성 · approval pending · 금리/한도/승인 판단 없음" : `${CCR_STATUS_LABELS[triage.initialStatus]} · ${triage.nextTasks.join(" / ")}`,
    status: triage.requiresHumanReview || sample.memo ? "needsReview" : "completed",
    riskLevel: triage.riskLevel,
    requiresHumanReview: triage.requiresHumanReview || sample.memo,
  });
  if (sample.memo && caseRow) {
    ccrInsert("corporate_credit_credit_memos", ccrScopedRow({
      id: ccrNextId("CCR-MEMO", "corporate_credit_credit_memos"),
      caseId: caseRow.id,
      title: `${caseRow.caseNo} 여신메모 초안`,
      status: "pendingApproval",
      summary: "내부 운영 참고용 초안 — 실제 승인·금리·한도 판단 없음",
      createdByAgentId: "ccr-memo",
      createdAt: new Date().toISOString().slice(0, 10),
      reviewRequired: true,
    }));
  }
  return { sample, caseRow, triage, run, agent: corporateCreditAgents.find((agent) => agent.id === run.agentId) };
}
