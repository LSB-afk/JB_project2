/* 기업여신 담당자 콘솔 — data (scope 강제 mock repository + seed + services).
   실제 사업자/개인 식별정보 원문 없음 — 익명 BIZ-REF-*와 구간(band) 지표만 저장한다. */

const CCL_DB_KEY = "ccl-ops-db-v1";

function cclSeedData() {
  const R = CCL_ROLE_KEY, W = CCL_WORKSPACE_ID;
  const today = new Date();
  const plus = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };
  const scope = (row) => ({ roleKey: R, workspaceId: W, ...row });

  const users = [
    ["USR-CCL-SME-01", "소상공인여신 김OO", "reviewer", "소상공인여신팀"],
    ["USR-CCL-SME-02", "소상공인여신 이OO", "reviewer", "소상공인여신팀"],
    ["USR-CCL-CORP-01", "기업여신 박OO", "reviewer", "기업여신팀"],
    ["USR-CCL-SUP-01", "여신감독 배OO", "supervisor", "여신관리팀"],
  ].map(([id, name, role, team]) => ({ id, name, role, team, status: "active", roleKeys: [R] }));

  const caseSpecs = [
    ["CCL-0001", "smeWorking", "전주 카페 운영자 운전자금 검토", "BIZ-REF-0001", "전북 전주 · 카페", "5천만~1억", "aiReview", "high", true, "부담 확인 필요"],
    ["CCL-0002", "smeFacility", "군산 부품 제조 시설자금 검토", "BIZ-REF-0002", "전북 군산 · 부품 제조", "1억~3억", "humanReview", "high", true, "부담 확인 필요"],
    ["CCL-0003", "refinance", "익산 음식점 대환 검토", "BIZ-REF-0003", "전북 익산 · 음식점", "5천만 미만", "collecting", "medium", false, "보통"],
    ["CCL-0004", "policyFund", "완주 소매점 정책금융 연계 검토", "BIZ-REF-0004", "전북 완주 · 소매", "5천만 미만", "humanReview", "medium", true, "보통"],
    ["CCL-0005", "corpGeneral", "김제 유통법인 일반대출 검토", "BIZ-REF-0005", "전북 김제 · 유통", "3억 이상", "memoDraft", "medium", true, "보통"],
    ["CCL-0006", "smeWorking", "부안 숙박업 운전자금 검토", "BIZ-REF-0006", "전북 부안 · 숙박", "5천만~1억", "received", "low", false, "여유"],
  ];
  const ccl_cases = caseSpecs.map(([id, loanType, title, bizRefId, segment, amountBand, status, riskLevel, requiresHumanReview, repaymentBand], index) => scope({
    id, caseNo: id, loanType, title, bizRefId, segment, amountBand,
    status, riskLevel, requiresHumanReview, repaymentBand,
    docsStatus: index % 2 === 0 ? "missing" : "ready",
    assignedTeam: (CCL_LOAN_TYPES[loanType] || {}).team || "기업여신팀",
    assignedToId: users[index % 3].id,
    dueAt: plus((index % 4)), createdAt: plus(-index), updatedAt: plus(0),
    tags: [loanType],
  }));

  return {
    version: 1,
    seededAt: new Date().toISOString(),
    users,
    ccl_cases: ccl_cases.concat([
      { roleKey: "fds-response", workspaceId: "fds-response", id: "CCL-OTHER-0001", caseNo: "CCL-OTHER-0001", loanType: "smeWorking", title: "타 역할 스코프 격리 검증용", bizRefId: "BIZ-REF-9999", segment: "격리", amountBand: "-", status: "received", riskLevel: "critical", requiresHumanReview: true, repaymentBand: "-", docsStatus: "missing", assignedTeam: "-", assignedToId: users[0].id, dueAt: plus(0), createdAt: plus(0), updatedAt: plus(0), tags: ["exclude"] },
    ]),
    ccl_review_notes: [
      scope({ id: "CCL-NOTE-0001", caseId: "CCL-0001", kind: "financial", title: "월매출 하락 추세(구간)", summary: "최근 3개월 매출 구간 하락 — 원인 확인 필요", status: "open", createdAt: plus(0) }),
      scope({ id: "CCL-NOTE-0002", caseId: "CCL-0002", kind: "financial", title: "원가율 상승(구간)", summary: "원자재 단가 상승 반영 — 확인 필요", status: "open", createdAt: plus(-1) }),
      scope({ id: "CCL-NOTE-0003", caseId: "CCL-0001", kind: "repayment", title: "상환 부담 구간: 확인 필요", summary: "월 상환액/추정 현금흐름 구간 비교 — 담당자 확인 필요", status: "open", createdAt: plus(0) }),
      scope({ id: "CCL-NOTE-0004", caseId: "CCL-0005", kind: "repayment", title: "상환 부담 구간: 보통", summary: "구간 지표 기준 특이 신호 없음", status: "open", createdAt: plus(-1) }),
      scope({ id: "CCL-NOTE-0005", caseId: "CCL-0004", kind: "policy", title: "정책금융 후보 2건(안내 후보)", summary: "지역 소상공인 지원 프로그램 후보 — 요건은 담당자 확인", status: "open", createdAt: plus(0) }),
      scope({ id: "CCL-NOTE-0006", caseId: "CCL-0001", kind: "policy", title: "보증 연계 후보(안내 후보)", summary: "보증 프로그램 후보 — 가능 여부 확정 금지", status: "open", createdAt: plus(0) }),
      scope({ id: "CCL-NOTE-0007", caseId: "CCL-0002", kind: "earlyWarning", title: "연체 조기경보 신호", summary: "단기 연체 이력 신호 — 사람 검토 필수", status: "open", severity: "high", createdAt: plus(-1) }),
    ],
    ccl_doc_checks: [
      scope({ id: "CCL-DOC-0001", caseId: "CCL-0001", docName: "부가세 과세표준증명", status: "missing", note: "보완 요청 초안 승인 대기", dueAt: plus(1) }),
      scope({ id: "CCL-DOC-0002", caseId: "CCL-0003", docName: "임대차계약서", status: "missing", note: "고객 회신 대기", dueAt: plus(2) }),
      scope({ id: "CCL-DOC-0003", caseId: "CCL-0002", docName: "재무제표(최근 2기)", status: "ready", note: "", dueAt: plus(0) }),
      scope({ id: "CCL-DOC-0004", caseId: "CCL-0005", docName: "법인등기부(요약)", status: "ready", note: "원문 저장 금지 — 요약만", dueAt: plus(0) }),
    ],
    ccl_memo_drafts: [
      scope({ id: "CCL-MEMO-0001", caseId: "CCL-0005", title: "김제 유통법인 품의 초안 v1", status: "pendingApproval", summary: "검토 요약·근거·확인 필요 항목 포함(결재는 사람)", createdAt: plus(0) }),
    ],
    approvals: [
      scope({ id: "APR-CCL-0001", caseId: "CCL-0005", approvalType: "품의 초안 검재 요청", status: "pending", requestedById: "ccl-memo", approverId: "USR-CCL-SUP-01", requestedAt: plus(0) }),
      scope({ id: "APR-CCL-0002", caseId: "CCL-0001", approvalType: "고객 회신 발송 승인", status: "pending", requestedById: "ccl-reply", approverId: "USR-CCL-SUP-01", requestedAt: plus(0) }),
    ],
    ccl_audit_logs: [
      scope({ id: "AUD-CCL-0001", caseId: "CCL-0001", actorId: "USR-CCL-SME-01", action: "CASE_CREATED", targetType: "ccl_case", targetId: "CCL-0001", riskLevel: "high", reviewRequired: true, createdAt: plus(0) }),
      scope({ id: "AUD-CCL-0002", caseId: "CCL-0002", actorId: "ccl-repayment", action: "EARLY_WARNING_FLAGGED", targetType: "review_note", targetId: "CCL-NOTE-0007", riskLevel: "high", reviewRequired: true, createdAt: plus(-1) }),
      scope({ id: "AUD-CCL-0003", caseId: "CCL-0005", actorId: "ccl-memo", action: "MEMO_DRAFTED", targetType: "memo_draft", targetId: "CCL-MEMO-0001", riskLevel: "medium", reviewRequired: true, createdAt: plus(0) }),
      scope({ id: "AUD-CCL-0004", caseId: "CCL-0003", actorId: "ccl-doc", action: "DOC_MISSING_FLAGGED", targetType: "doc_check", targetId: "CCL-DOC-0002", riskLevel: "low", reviewRequired: false, createdAt: plus(-1) }),
    ],
    ccl_consult_logs: [
      scope({ id: "CCL-CON-0001", caseId: "CCL-0001", channel: "branch", summary: "매출 하락 원인·자금 용도 상담(요약)", createdAt: plus(0) }),
      scope({ id: "CCL-CON-0002", caseId: "CCL-0003", channel: "contactCenter", summary: "대환 조건 문의 — 확정 답변 금지, 검토 절차 안내", createdAt: plus(-1) }),
      scope({ id: "CCL-CON-0003", caseId: "CCL-0004", channel: "branch", summary: "정책금융 후보 상담(안내 후보)", createdAt: plus(-2) }),
    ],
    ai_analysis_requests: [
      scope({ id: "AIR-CCL-0001", caseId: "CCL-0001", requestType: "재무자료 요약", status: "running", requestedById: "USR-CCL-SME-01", createdAt: plus(0) }),
      scope({ id: "AIR-CCL-0002", caseId: "CCL-0002", requestType: "조기경보 신호 재확인", status: "queued", requestedById: "USR-CCL-CORP-01", createdAt: plus(0) }),
    ],
    ai_recommendations: [
      scope({ id: "REC-CCL-0001", kind: "replyDraft", caseId: "CCL-0001", agentId: "ccl-reply", title: "서류 보완 요청 회신 초안(승인 대기)", status: "pendingApproval", confidence: "high", createdAt: plus(0) }),
      scope({ id: "REC-CCL-0002", kind: "replyDraft", caseId: "CCL-0003", agentId: "ccl-reply", title: "대환 검토 절차 안내 초안", status: "proposed", confidence: "medium", createdAt: plus(-1) }),
    ],
    harness_agents: [],
    ccl_agent_runs: [
      scope({ id: "CCL-RUN-0001", agentId: "ccl-financial", caseId: "CCL-0001", inputSummary: "재무자료 요약", outputSummary: "매출 구간 하락 — 담당자 확인 필요", status: "needsReview", riskLevel: "high", requiresHumanReview: true, createdAt: plus(0) }),
      scope({ id: "CCL-RUN-0002", agentId: "ccl-doc", caseId: "CCL-0003", inputSummary: "서류 누락 확인", outputSummary: "임대차계약서 누락 — 보완 초안", status: "completed", riskLevel: "low", requiresHumanReview: false, createdAt: plus(-1) }),
      scope({ id: "CCL-RUN-0003", agentId: "ccl-memo", caseId: "CCL-0005", inputSummary: "품의 초안 작성", outputSummary: "초안 v1 — 결재 대기(사람)", status: "pendingApproval", riskLevel: "medium", requiresHumanReview: true, createdAt: plus(0) }),
    ],
    agent_handoffs: [
      scope({ id: "HND-CCL-0001", fromAgentId: "ccl-intake", toAgentId: "ccl-financial", caseId: "CCL-0001", reason: "재무자료 요약", status: "open", createdAt: plus(0) }),
      scope({ id: "HND-CCL-0002", fromAgentId: "ccl-repayment", toAgentId: "ccl-supervisor", caseId: "CCL-0002", reason: "조기경보 high — 사람 검토", status: "escalated", createdAt: plus(-1) }),
    ],
  };
}

let cclDbCache = null;
function cclLoadDb() {
  if (cclDbCache) return cclDbCache;
  try {
    const raw = window.localStorage.getItem(CCL_DB_KEY);
    if (raw) { const parsed = JSON.parse(raw); if (parsed && parsed.version === 1) { cclDbCache = parsed; cclSyncAgents(cclDbCache); cclSaveDb(); return cclDbCache; } }
  } catch (error) { /* 재시드 */ }
  cclDbCache = cclSeedData(); cclSyncAgents(cclDbCache); cclSaveDb();
  return cclDbCache;
}
function cclSaveDb() { try { window.localStorage.setItem(CCL_DB_KEY, JSON.stringify(cclDbCache)); } catch (error) { /* 유지 */ } }
function cclResetDb() { cclDbCache = cclSeedData(); cclSyncAgents(cclDbCache); cclSaveDb(); }
function cclSyncAgents(db) {
  db.harness_agents = cclConsoleAgents.map((agent) => ({ id: agent.id, roleKey: CCL_ROLE_KEY, workspaceId: CCL_WORKSPACE_ID, name: agent.displayName, domain: agent.domain, status: agent.status, description: agent.description }));
}
function cclTable(table, roleKey) {
  if (!roleKey) throw new Error("role scope is required");
  const db = cclLoadDb();
  const rows = db[table] || [];
  if (table === "users") return rows.filter((row) => !row.roleKeys || row.roleKeys.includes(roleKey));
  return rows.filter((row) => row.roleKey === roleKey);
}
function cclInsert(table, row) { const db = cclLoadDb(); db[table] = db[table] || []; db[table].unshift(row); cclSaveDb(); return row; }
function cclNextId(prefix, table) {
  const db = cclLoadDb();
  const count = (db[table] || []).filter((row) => String(row.id || "").startsWith(prefix)).length + 1;
  return `${prefix}-${String(count).padStart(4, "0")}`;
}
const cclRepository = { table: cclTable, insert: cclInsert, nextId: cclNextId, reset: cclResetDb, snapshot: cclLoadDb };

function cclActiveCase(row) { return CCL_ACTIVE_STATUSES.includes(row.status); }

function getCorporateCreditSidebarCounts() {
  const t = (name) => cclTable(name, CCL_ROLE_KEY);
  const notes = t("ccl_review_notes");
  const active = t("ccl_cases").filter(cclActiveCase);
  return {
    board: active.length,
    cases: t("ccl_cases").length,
    docCheck: t("ccl_doc_checks").filter((x) => x.status === "missing").length,
    approvalDrafts: t("ccl_memo_drafts").filter((x) => x.status === "pendingApproval").length + t("approvals").filter((x) => x.status === "pending").length,
    financialSummary: notes.filter((x) => x.kind === "financial" && x.status === "open").length,
    repaymentCheck: notes.filter((x) => x.kind === "repayment" && x.status === "open").length,
    policyMatch: notes.filter((x) => x.kind === "policy" && x.status === "open").length,
    earlyWarning: notes.filter((x) => x.kind === "earlyWarning" && x.status === "open").length,
    consultLog: t("ccl_consult_logs").length,
    replyDrafts: t("ai_recommendations").filter((x) => x.kind === "replyDraft" && ["proposed", "pendingApproval"].includes(x.status)).length,
    aiAnalysis: t("ai_analysis_requests").filter((x) => ["queued", "running"].includes(x.status)).length,
    agentHarness: t("ccl_agent_runs").filter((x) => ["queued", "running", "needsReview", "pendingApproval"].includes(x.status)).length
      + t("harness_agents").filter((x) => ["needsReview", "escalated"].includes(x.status)).length,
    auditLogs: t("ccl_audit_logs").filter((x) => x.reviewRequired === true).length,
    approvals: t("approvals").filter((x) => x.status === "pending").length,
  };
}
function getCorporateCreditSidebarCountsAsync() {
  return new Promise((resolve, reject) => setTimeout(() => { try { resolve(getCorporateCreditSidebarCounts()); } catch (error) { reject(error); } }, 120));
}

function searchCorporateCreditRecords(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q || (typeof jpoSearchBlockedReason === "function" && jpoSearchBlockedReason(q))) return [];
  const hit = (value) => String(value || "").toLowerCase().includes(q);
  const out = [];
  cclTable("ccl_cases", CCL_ROLE_KEY).forEach((c) => {
    if (hit(c.caseNo) || hit(c.title) || hit(c.bizRefId) || hit(c.segment) || hit((CCL_LOAN_TYPES[c.loanType] || {}).label)) {
      out.push({ kind: "case", view: "cases", id: c.id, label: `${c.caseNo} · ${c.title}`, sub: `${(CCL_LOAN_TYPES[c.loanType] || {}).label || c.loanType} · ${CCL_STATUS_LABELS[c.status] || c.status}` });
    }
  });
  cclTable("ccl_doc_checks", CCL_ROLE_KEY).forEach((x) => {
    if (hit(x.docName) || hit(x.id)) out.push({ kind: "doc", view: "doc-check", id: x.id, label: `${x.id} · ${x.docName}`, sub: `서류 · ${CCL_STATUS_LABELS[x.status] || x.status}` });
  });
  return out.slice(0, 12);
}

function cclRunHook(hookName, payload) {
  if (typeof harnessRunHooks !== "function") return { ok: true, violations: [] };
  return harnessRunHooks("corporate-credit", hookName, payload);
}
function cclScoped(row) { return { roleKey: CCL_ROLE_KEY, workspaceId: CCL_WORKSPACE_ID, ...row }; }
function cclWriteAudit(row) { const audit = cclScoped(row); cclRunHook("onAuditWrite", { audit }); return cclInsert("ccl_audit_logs", audit); }

function createCorporateCreditCase(form) {
  const now = new Date().toISOString().slice(0, 10);
  const guard = cclRunHook("beforeCaseCreate", form);
  if (!guard.ok) {
    cclWriteAudit({ id: cclNextId("AUD-CCL", "ccl_audit_logs"), actorId: "USR-CCL-SME-01", action: "CCL_HOOK_BLOCKED_CASE_CREATE", targetType: "hook", targetId: "beforeCaseCreate", riskLevel: "medium", reviewRequired: true, note: guard.violations.join(" / "), createdAt: now });
    return { blocked: true, violations: guard.violations };
  }
  const loan = CCL_LOAN_TYPES[form.loanType] || CCL_LOAN_TYPES.smeWorking;
  const requiresHumanReview = Boolean(loan.requiresHumanReview) || form.docsStatus === "missing" || ["high", "critical"].includes(form.riskLevel);
  const id = cclNextId("CCL", "ccl_cases");
  const row = cclScoped({
    id, caseNo: id, loanType: form.loanType, title: form.title || `${loan.label} 검토`,
    bizRefId: form.bizRefId || `BIZ-REF-${Math.floor(1000 + Math.random() * 9000)}`,
    segment: form.segment || "전북권", amountBand: form.amountBand || "확인 필요",
    status: requiresHumanReview ? "humanReview" : "aiReview",
    riskLevel: form.riskLevel || "medium", requiresHumanReview,
    repaymentBand: "확인 필요", docsStatus: form.docsStatus || "unknown",
    assignedTeam: loan.team, assignedToId: "USR-CCL-SME-01",
    dueAt: form.dueAt || now, createdAt: now, updatedAt: now, tags: [form.loanType],
  });
  cclInsert("ccl_cases", row);
  cclRunHook("afterCaseCreate", { caseRow: row });
  if (row.docsStatus !== "ready") {
    cclInsert("ccl_doc_checks", cclScoped({ id: cclNextId("CCL-DOC", "ccl_doc_checks"), caseId: id, docName: "기본 서류 세트", status: "missing", note: "체크리스트 생성", dueAt: row.dueAt }));
  }
  cclWriteAudit({ id: cclNextId("AUD-CCL", "ccl_audit_logs"), caseId: id, actorId: row.assignedToId, action: "CASE_CREATED", targetType: "ccl_case", targetId: id, riskLevel: row.riskLevel, reviewRequired: requiresHumanReview, createdAt: now });
  recordCorporateCreditAgentRun({
    agentId: "ccl-intake", caseId: id,
    inputSummary: `${loan.label} · ${row.segment}`,
    outputSummary: `분류 완료 — ${CCL_STATUS_LABELS[row.status]}`,
    status: requiresHumanReview ? "needsReview" : "queued",
    riskLevel: row.riskLevel, requiresHumanReview,
    handoffs: [{ toAgentId: "ccl-financial", reason: "재무자료 요약" }].concat(requiresHumanReview ? [{ toAgentId: "ccl-supervisor", reason: "사람 검토 추적" }] : []),
  });
  if (requiresHumanReview) {
    cclInsert("approvals", cclScoped({ id: cclNextId("APR-CCL", "approvals"), caseId: id, approvalType: "담당자 검토", status: "pending", requestedById: row.assignedToId, approverId: "USR-CCL-SUP-01", requestedAt: now }));
  }
  return { case: row };
}

function recordCorporateCreditAgentRun(run) {
  const today = new Date().toISOString().slice(0, 10);
  const before = cclRunHook("beforeAgentRun", { agentId: run.agentId, riskLevel: run.riskLevel || "low", status: run.status || "completed", inputSummary: run.inputSummary });
  if (!before.ok) run = { ...run, status: "needsReview" };
  const row = cclScoped({
    id: cclNextId("CCL-RUN", "ccl_agent_runs"), agentId: run.agentId, caseId: run.caseId || null,
    inputSummary: run.inputSummary, outputSummary: run.outputSummary,
    status: run.status || "completed", riskLevel: run.riskLevel || "low",
    requiresHumanReview: Boolean(run.requiresHumanReview), createdAt: today,
  });
  cclInsert("ccl_agent_runs", row);
  cclRunHook("afterAgentRun", { run: row });
  (run.handoffs || []).forEach((handoff) => {
    cclInsert("agent_handoffs", cclScoped({ id: cclNextId("HND-CCL", "agent_handoffs"), fromAgentId: run.agentId, toAgentId: handoff.toAgentId, caseId: run.caseId || null, reason: handoff.reason, status: ["high", "critical"].includes(row.riskLevel) ? "escalated" : "open", createdAt: today }));
  });
  cclWriteAudit({ id: cclNextId("AUD-CCL", "ccl_audit_logs"), caseId: run.caseId || null, actorId: run.agentId, action: "CCL_AGENT_RUN", targetType: "agent_run", targetId: row.id, riskLevel: row.riskLevel, reviewRequired: ["needsReview", "pendingApproval"].includes(row.status), createdAt: today });
  return row;
}

function cclDecideApproval(approvalId, decision, decidedBy) {
  const db = cclRepository.snapshot();
  const approval = (db.approvals || []).find((row) => row.id === approvalId && row.roleKey === CCL_ROLE_KEY);
  if (!approval || approval.status !== "pending") return null;
  const actor = decidedBy || "USR-CCL-SUP-01";
  const guard = cclRunHook("afterApprovalDecision", { approval, decidedBy: actor, decision });
  if (!guard.ok) return { blocked: true, violations: guard.violations };
  approval.status = decision === "reject" ? "rejected" : "approved";
  approval.decidedById = actor;
  approval.decidedAt = new Date().toISOString().slice(0, 10);
  cclSaveDb();
  cclWriteAudit({ id: cclNextId("AUD-CCL", "ccl_audit_logs"), caseId: approval.caseId || null, actorId: actor, action: "CCL_APPROVAL_DECIDED", targetType: "approval", targetId: approval.id, riskLevel: "low", reviewRequired: false, createdAt: approval.decidedAt });
  return { approval };
}

const cclSampleRequests = [
  { key: "financial-brief", text: "전주 카페 재무자료를 요약해줘", agentId: "ccl-financial", caseId: "CCL-0001", riskLevel: "high", human: true },
  { key: "repayment-band", text: "군산 제조업체 상환 부담 구간을 점검해줘", agentId: "ccl-repayment", caseId: "CCL-0002", riskLevel: "high", human: true },
  { key: "doc-gap", text: "익산 음식점 누락 서류를 확인해줘", agentId: "ccl-doc", caseId: "CCL-0003", riskLevel: "low", human: false },
  { key: "memo-draft", text: "김제 유통법인 품의 초안을 만들어줘", agentId: "ccl-memo", caseId: "CCL-0005", riskLevel: "medium", human: true, approval: "품의 초안 검재 요청" },
  { key: "reply-draft", text: "서류 보완 안내 회신 초안을 만들어줘", agentId: "ccl-reply", caseId: "CCL-0001", riskLevel: "medium", human: true, commsDraft: true },
];

function runCorporateCreditSample(key) {
  const sample = cclSampleRequests.find((item) => item.key === key);
  if (!sample) return null;
  if (sample.commsDraft) {
    const draftText = `[초안] ${sample.text} — 고객(BIZ-REF) 회신 후보, 발송은 담당자 승인 후.`;
    const guard = cclRunHook("beforeCustomerMessage", { draftText, customerFacing: true, approvalStatus: "pending" });
    if (!guard.ok) return { sample, blocked: true, violations: guard.violations };
  }
  const run = recordCorporateCreditAgentRun({
    agentId: sample.agentId, caseId: sample.caseId, inputSummary: sample.text,
    outputSummary: `${(cclConsoleAgents.find((a) => a.id === sample.agentId) || {}).displayName} · 내부 운영 참고용 · 담당자 검토 필요`,
    status: sample.commsDraft || sample.approval ? "pendingApproval" : sample.human ? "needsReview" : "completed",
    riskLevel: sample.riskLevel, requiresHumanReview: sample.human,
    handoffs: sample.human ? [{ toAgentId: "ccl-supervisor", reason: "사람 검토 추적" }] : [],
  });
  if (sample.commsDraft || sample.approval) {
    cclInsert("approvals", cclScoped({ id: cclNextId("APR-CCL", "approvals"), caseId: sample.caseId, approvalType: sample.approval || "고객 회신 발송 승인", status: "pending", requestedById: sample.agentId, approverId: "USR-CCL-SUP-01", requestedAt: new Date().toISOString().slice(0, 10) }));
  }
  return { sample, run };
}
