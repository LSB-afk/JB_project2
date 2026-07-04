/* 기업여신 담당자 하네스 — 전용 mock DB/repository.
   실제 기업명·사업자번호·대표자·계좌·세무 원문을 저장하지 않는다. */

const CCR_DB_KEY = "ccr-ops-db-v1";

function ccrSeedData() {
  const today = new Date();
  const iso = (date) => date.toISOString().slice(0, 10);
  const plus = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return iso(d); };
  const scope = (row) => ({ roleKey: CCR_ROLE_KEY, workspaceId: CCR_WORKSPACE_ID, ...row });
  const users = [
    ["USR-CCR-RM-01", "기업여신 RM 김OO", "rm", "기업여신 RM팀"],
    ["USR-CCR-RM-02", "기업여신 RM 이OO", "rm", "기업여신 RM팀"],
    ["USR-CCR-REV-01", "심사지원 박OO", "reviewer", "기업금융 심사지원팀"],
    ["USR-CCR-COL-01", "담보관리 정OO", "collateral", "담보관리팀"],
    ["USR-CCR-RISK-01", "리스크관리 최OO", "risk", "리스크관리팀"],
    ["USR-CCR-APR-01", "승인권자 한OO", "approver", "승인권자"],
  ].map(([id, name, role, team]) => ({ id, name, role, team, status: "active", roleKeys: [CCR_ROLE_KEY] }));

  const domainKeys = Object.keys(CCR_DOMAINS);
  const industries = ["manufacturing", "wholesaleRetail", "construction", "services", "transport"];
  const statuses = ["received", "docsCollecting", "financialDataReview", "collateralGuaranteeReview", "creditMemoDrafting", "approverReview", "postMonitoring", "escalated", "onHold"];
  const aliases = ["익명 제조업 A", "익명 도소매업 B", "익명 건설업 C", "익명 서비스업 D", "익명 운수업 E"];
  const corporate_credit_cases = Array.from({ length: 30 }, (_, index) => {
    const domainKey = domainKeys[index % domainKeys.length];
    const domain = CCR_DOMAINS[domainKey];
    const riskLevel = domainKey === "pfStructuredFinance" ? "critical" : domainKey === "earlyWarningNpl" || index % 7 === 0 ? "high" : index % 3 === 0 ? "medium" : "low";
    const collateralExists = ["facilityLoan", "movableCollateralLoan", "pfStructuredFinance"].includes(domainKey) || index % 5 === 0;
    const guaranteeExists = domainKey === "guaranteeBackedLoan" || index % 6 === 0;
    return scope({
      id: `CCR-CASE-${String(index + 1).padStart(4, "0")}`,
      caseNo: `기업여신-${String(index + 1).padStart(4, "0")}`,
      borrowerRefId: `익명기업-${String(index + 1).padStart(4, "0")}`,
      companyAlias: aliases[index % aliases.length],
      industry: industries[index % industries.length],
      region: ["전북 전주", "전북 익산", "전북 군산", "전북 완주", "전북 정읍"][index % 5],
      domain: domainKey,
      productType: domain.productTypes[index % domain.productTypes.length],
      requestedAmountBand: ["1억 이하", "1억~5억", "5억~20억", "20억 이상"][index % 4],
      title: `${domain.label} 운영 검토 ${index + 1}`,
      description: `${domain.label} 관련 심사 패키지와 담당자 검토 항목을 정리하는 모의 운영 건`,
      status: statuses[index % statuses.length],
      priority: riskLevel === "critical" ? "urgent" : riskLevel === "high" ? "high" : "normal",
      riskLevel,
      assignedRmId: users[index % 2].id,
      assignedTeam: domain.team,
      dueAt: plus((index % 9) + 1),
      financialBaseMonth: index % 4 === 0 ? "2026-03" : "2026-05",
      docsStatus: index % 4 === 0 ? "missing" : "received",
      collateralExists,
      guaranteeExists,
      collateralStatus: collateralExists ? "manualRequired" : "notApplicable",
      guaranteeStatus: guaranteeExists ? "manualRequired" : "notApplicable",
      externalStatus: guaranteeExists ? "pending" : "sample",
      dataMode: "sample",
      requiresHumanReview: ["high", "critical"].includes(riskLevel),
      escalationRequired: ["high", "critical"].includes(riskLevel),
      createdAt: plus(-index),
      updatedAt: plus(-(index % 4)),
      sourceChannel: ["branch", "rmDesk", "opsPortal"][index % 3],
      tags: [CCR_DOMAINS[domainKey].label, riskLevel === "critical" ? "승인권자 검토" : "담당자 확인"],
    });
  });
  corporate_credit_cases.push({ roleKey: "other-role", workspaceId: "other", id: "CCR-OTHER-0001", caseNo: "기업여신-격리검증", title: "타 역할 데이터", status: "received", riskLevel: "critical" });

  const caseRows = corporate_credit_cases.filter((row) => row.roleKey === CCR_ROLE_KEY);
  const byIndex = (i) => caseRows[i % caseRows.length];
  const corporate_credit_tasks = caseRows.slice(0, 24).map((c, index) => scope({
    id: `CCR-TASK-${String(index + 1).padStart(4, "0")}`,
    caseId: c.id,
    title: index % 3 === 0 ? "재무자료 보완 요청" : index % 3 === 1 ? "담보·보증 확인" : "여신메모 초안 검토",
    status: index % 5 === 0 ? "overdue" : "open",
    dueAt: c.dueAt,
    ownerId: c.assignedRmId,
  }));
  const corporate_credit_documents = caseRows.slice(0, 18).map((c, index) => scope({ id: `CCR-DOC-${String(index + 1).padStart(4, "0")}`, caseId: c.id, documentType: ["재무자료 요약", "자금용도 증빙", "담보 확인 요약"][index % 3], status: c.docsStatus === "missing" ? "missing" : "received", reviewRequired: c.docsStatus === "missing", createdAt: c.createdAt }));
  const corporate_credit_financial_snapshots = caseRows.slice(0, 20).map((c, index) => scope({ id: `CCR-FIN-${String(index + 1).padStart(4, "0")}`, caseId: c.id, baseMonth: c.financialBaseMonth, revenueTrend: c.industry === "construction" ? "변동성 높음" : index % 3 === 0 ? "둔화" : "보합", cashflowSignal: index % 4 === 0 ? "주의" : "보통", dataMode: "sample", reviewRequired: index % 4 === 0, createdAt: c.createdAt }));
  const corporate_credit_collateral_checks = caseRows.filter((c) => c.collateralExists).map((c, index) => scope({ id: `CCR-COL-${String(index + 1).padStart(4, "0")}`, caseId: c.id, collateralType: c.domain === "movableCollateralLoan" ? c.productType : "담보 확인 요약", status: "manualRequired", maturityAt: plus(index + 10), reviewRequired: true }));
  const corporate_credit_guarantee_checks = caseRows.filter((c) => c.guaranteeExists).map((c, index) => scope({ id: `CCR-GRT-${String(index + 1).padStart(4, "0")}`, caseId: c.id, provider: ["신용보증기금", "기술보증기금", "지역신용보증재단"][index % 3], status: "pending", externalStatus: "waitingExternalGuarantee", reviewRequired: true }));
  const corporate_credit_risk_signals = [
    scope({ id: "CCR-SIG-0001", caseId: byIndex(0).id, signalType: "MISSING_CREDIT_PACKAGE", title: "심사 패키지 보완 필요", severity: "medium", evidence: "재무자료 기준월 보완 필요", createdAt: plus(0), requiresHumanReview: true }),
    scope({ id: "CCR-SIG-0002", caseId: byIndex(6).id, signalType: "STRUCTURED_FINANCE_ESCALATION", title: "PF·구조화 금융 승인권자 검토 필요", severity: "critical", evidence: "구조화/PF 업무 유형", createdAt: plus(-1), requiresHumanReview: true }),
    scope({ id: "CCR-SIG-0003", caseId: byIndex(9).id, signalType: "EARLY_WARNING_SIGNAL", title: "조기경보/EWS 검토 필요", severity: "high", evidence: "연체 징후 업무 유형", createdAt: plus(-2), requiresHumanReview: true }),
    scope({ id: "CCR-SIG-0004", caseId: byIndex(3).id, signalType: "COLLATERAL_GUARANTEE_MANUAL_CHECK", title: "담보·보증 확인 필요", severity: "high", evidence: "담보/보증 외부 확인 대기", createdAt: plus(-1), requiresHumanReview: true }),
    scope({ id: "CCR-SIG-0005", caseId: byIndex(14).id, signalType: "STALE_FINANCIAL_DATA", title: "재무자료 기준월 확인 필요", severity: "medium", evidence: "최근 재무자료 갱신 필요", createdAt: plus(-3), requiresHumanReview: true }),
  ];
  const corporate_credit_credit_memos = caseRows.slice(0, 8).map((c, index) => scope({ id: `CCR-MEMO-${String(index + 1).padStart(4, "0")}`, caseId: c.id, title: `${c.caseNo} 여신메모 초안`, status: index % 2 === 0 ? "pendingApproval" : "draft", summary: "내부 운영 참고용 초안 — 승인/금리/한도 판단 없음", createdByAgentId: "ccr-memo", createdAt: plus(-index), reviewRequired: true }));
  const corporate_credit_approvals = caseRows.slice(0, 5).map((c, index) => scope({ id: `CCR-APR-${String(index + 1).padStart(4, "0")}`, caseId: c.id, approvalType: index % 2 === 0 ? "여신메모 공유 전 검토" : "승인권자 검토 대기", status: "pending", requestedById: c.assignedRmId, approverId: "USR-CCR-APR-01", requestedAt: plus(-index) }));
  const corporate_credit_evidence_items = caseRows.slice(0, 12).map((c, index) => scope({ id: `CCR-EVD-${String(index + 1).padStart(4, "0")}`, caseId: c.id, evidenceType: ["intake", "document", "financial", "collateral", "guarantee", "memo"][index % 6], title: "운영 근거 요약", summary: "민감 원문 없는 담당자 입력/샘플 기준 근거", sourceMode: "sample", createdAt: plus(-index), reviewRequired: index % 3 === 0 }));
  const corporate_credit_audit_logs = caseRows.slice(0, 12).map((c, index) => scope({ id: `CCR-AUD-${String(index + 1).padStart(4, "0")}`, caseId: c.id, actorId: index % 2 ? "ccr-triage" : c.assignedRmId, action: ["CASE_CREATED", "DATA_ENRICHED", "RISK_SIGNAL_CREATED", "CREDIT_MEMO_DRAFTED", "EVALUATOR_CHECKED", "HUMAN_REVIEW_REQUIRED"][index % 6], targetType: "corporate_credit_case", targetId: c.id, riskLevel: c.riskLevel, reviewRequired: ["high", "critical"].includes(c.riskLevel), createdAt: plus(-index) }));
  const corporate_credit_agent_runs = caseRows.slice(0, 8).map((c, index) => scope({ id: `CCR-RUN-${String(index + 1).padStart(4, "0")}`, agentId: ["ccr-triage", "ccr-financial-quality", "ccr-collateral", "ccr-memo", "ccr-compliance"][index % 5], caseId: c.id, inputSummary: `${c.caseNo} ${CCR_DOMAINS[c.domain].label} 검토`, outputSummary: "내부 운영 참고용 체크리스트와 다음 액션 생성", status: index % 3 === 0 ? "needsReview" : "completed", riskLevel: c.riskLevel, requiresHumanReview: c.requiresHumanReview, createdAt: plus(-index) }));
  const corporate_credit_agent_handoffs = [
    scope({ id: "CCR-HND-0001", fromAgentId: "ccr-triage", toAgentId: "ccr-financial-quality", caseId: byIndex(0).id, reason: "재무자료 기준월 확인", status: "open", createdAt: plus(0) }),
    scope({ id: "CCR-HND-0002", fromAgentId: "ccr-pf", toAgentId: "ccr-compliance", caseId: byIndex(6).id, reason: "PF·구조화 고위험 검토", status: "escalated", createdAt: plus(-1) }),
    scope({ id: "CCR-HND-0003", fromAgentId: "ccr-memo", toAgentId: "ccr-compliance", caseId: byIndex(3).id, reason: "여신메모 초안 가드레일 검증", status: "open", createdAt: plus(-2) }),
  ];
  const corporate_credit_external_connectors = [
    scope({ id: "CCR-CON-0001", name: "기업여신 샘플 재무자료", category: "financial", status: "active", health: "healthy", dataMode: "sample", lastSyncAt: plus(0) }),
    scope({ id: "CCR-CON-0002", name: "보증기관 확인(수동)", category: "guarantee", status: "manualRequired", health: "degraded", dataMode: "manualRequired", lastSyncAt: "" }),
    scope({ id: "CCR-CON-0003", name: "담보 확인(수동)", category: "collateral", status: "manualRequired", health: "degraded", dataMode: "manualRequired", lastSyncAt: "" }),
    scope({ id: "CCR-CON-0004", name: "외환·무역금융 서식", category: "tradeFinance", status: "active", health: "healthy", dataMode: "sample", lastSyncAt: plus(-1) }),
    scope({ id: "CCR-CON-0005", name: "정책·ESG 금융 기준", category: "policyEsg", status: "active", health: "healthy", dataMode: "sample", lastSyncAt: plus(-2) }),
  ];
  return {
    version: CCR_DB_VERSION,
    seededAt: new Date().toISOString(),
    role_workspaces: [{ id: CCR_WORKSPACE_ID, roleKey: CCR_ROLE_KEY, displayName: CCR_DISPLAY_NAME, harnessId: "corporateCreditOfficerHarness", status: "active" }],
    corporate_credit_users: users,
    corporate_credit_cases,
    corporate_credit_tasks,
    corporate_credit_documents,
    corporate_credit_financial_snapshots,
    corporate_credit_collateral_checks,
    corporate_credit_guarantee_checks,
    corporate_credit_risk_signals,
    corporate_credit_credit_memos,
    corporate_credit_approvals,
    corporate_credit_evidence_items,
    corporate_credit_audit_logs,
    corporate_credit_agent_runs,
    corporate_credit_agent_handoffs,
    corporate_credit_external_connectors,
    corporate_credit_role_assignments: users.map((u, index) => scope({ id: `CCR-ROLE-${String(index + 1).padStart(4, "0")}`, userId: u.id, role: u.role, permissionScope: u.team, status: index === 5 ? "needsReview" : "active", reviewRequired: index === 5 })),
    corporate_credit_inspection_schedules: [
      scope({ id: "CCR-INS-0001", inspectionType: "여신메모 금지표현 점검", status: "upcoming", dueAt: plus(3), ownerId: "USR-CCR-APR-01" }),
      scope({ id: "CCR-INS-0002", inspectionType: "담보·보증 수동확인 점검", status: "overdue", dueAt: plus(-1), ownerId: "USR-CCR-COL-01" }),
      scope({ id: "CCR-INS-0003", inspectionType: "조기경보 큐 점검", status: "upcoming", dueAt: plus(5), ownerId: "USR-CCR-RISK-01" }),
    ],
  };
}

let ccrDbCache = null;

function ccrLoadDb() {
  if (ccrDbCache) return ccrDbCache;
  try {
    const raw = window.localStorage.getItem(CCR_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === CCR_DB_VERSION) {
        ccrDbCache = parsed;
        ccrSyncHarnessAgents(ccrDbCache);
        ccrSaveDb();
        return ccrDbCache;
      }
    }
  } catch (error) { /* re-seed */ }
  ccrDbCache = ccrSeedData();
  ccrSyncHarnessAgents(ccrDbCache);
  ccrSaveDb();
  return ccrDbCache;
}

function ccrSaveDb() {
  try { window.localStorage.setItem(CCR_DB_KEY, JSON.stringify(ccrDbCache)); } catch (error) { /* memory only */ }
}

function ccrResetDb() {
  ccrDbCache = ccrSeedData();
  ccrSyncHarnessAgents(ccrDbCache);
  ccrSaveDb();
}

function ccrSyncHarnessAgents(db) {
  db.corporate_credit_harness_agents = corporateCreditOfficerHarness.agents.map((agent) => ({
    id: agent.id,
    roleKey: CCR_ROLE_KEY,
    workspaceId: CCR_WORKSPACE_ID,
    name: agent.displayName || agent.name,
    domain: agent.domain,
    status: agent.status,
    description: agent.description,
  }));
}

function ccrTable(table, roleKey) {
  if (!roleKey) throw new Error("role scope is required");
  const db = ccrLoadDb();
  const rows = db[table] || [];
  if (table === "role_workspaces") return rows.slice();
  if (table === "corporate_credit_users") return rows.filter((row) => !row.roleKeys || row.roleKeys.includes(roleKey));
  return rows.filter((row) => row.roleKey === roleKey);
}

function ccrScopedRow(row) {
  return { roleKey: CCR_ROLE_KEY, workspaceId: CCR_WORKSPACE_ID, ...row };
}

function ccrInsert(table, row) {
  const db = ccrLoadDb();
  db[table] = db[table] || [];
  db[table].unshift(row);
  ccrSaveDb();
  return row;
}

function ccrNextId(prefix, table) {
  const db = ccrLoadDb();
  const count = (db[table] || []).filter((row) => String(row.id || "").startsWith(prefix)).length + 1;
  return `${prefix}-${String(count).padStart(4, "0")}`;
}

const ccrRepository = {
  table: ccrTable,
  insert: ccrInsert,
  nextId: ccrNextId,
  reset: ccrResetDb,
  snapshot: ccrLoadDb,
};
