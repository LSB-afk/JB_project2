/* 기업여신 담당자 역할 콘솔 — core (config + agent registry + rules/hooks).
   역할=콘솔, 도메인=케이스: 이 콘솔의 도메인은 기업여신·소상공인 대출 검토다.
   금지: 실제 대출 승인/거절, 금리/한도 산정, 신용등급 확정 — AI는 요약·체크·초안만 만들고 담당자가 결정한다. */

const CCL_ROLE_KEY = "corporate-credit";
const CCL_WORKSPACE_ID = "corporate-credit";
const CCL_DISPLAY_NAME = "기업여신 담당자";
const CCL_PORTAL_TITLE = "기업여신 심사지원 포털";
const CCL_ROUTE_BASE = "/roles/corporate-credit";

const CCL_BOARD_COLUMNS = [
  ["received", "신규 접수"],
  ["collecting", "자료 수집"],
  ["aiReview", "AI 검토"],
  ["humanReview", "담당자 검토 필요"],
  ["memoDraft", "품의 진행"],
  ["doneHold", "완료·보류"],
];
const CCL_ACTIVE_STATUSES = ["received", "collecting", "aiReview", "humanReview", "memoDraft"];

const CCL_LOAN_TYPES = {
  smeWorking: { label: "소상공인 운전자금", team: "소상공인여신팀" },
  smeFacility: { label: "소상공인 시설자금", team: "소상공인여신팀" },
  corpGeneral: { label: "기업 일반대출", team: "기업여신팀" },
  refinance: { label: "대환 검토", team: "기업여신팀" },
  policyFund: { label: "정책금융 연계 검토", team: "소상공인여신팀", requiresHumanReview: true },
};

const CCL_VIEWS = {
  board: "여신 검토 보드",
  cases: "여신 케이스",
  "cases-new": "신규 여신 검토 건 접수",
  "doc-check": "서류 누락 확인",
  "approval-drafts": "승인 품의함",
  "financial-summary": "재무자료 요약",
  "repayment-check": "상환능력 체크",
  "policy-match": "정책금융 후보",
  "early-warning": "조기경보",
  "consult-log": "상담 이력",
  "reply-drafts": "고객 회신 초안",
  "ai-analysis": "AI 분석 요청",
  "agent-harness": "운영 에이전트 하네스",
  "audit-logs": "감사 기록",
};

const CCL_ROUTE_BY_VIEW = Object.fromEntries(
  Object.keys(CCL_VIEWS).map((view) => [view, view === "cases-new" ? `${CCL_ROUTE_BASE}/cases/new` : `${CCL_ROUTE_BASE}/${view}`]),
);
const CCL_VIEW_BY_ROUTE = Object.fromEntries(Object.entries(CCL_ROUTE_BY_VIEW).map(([view, route]) => [route, view]));

const cclNavigation = [
  { section: "오늘 처리할 일", items: [
    { id: "board", icon: "layout-dashboard", label: "여신 검토 보드", description: "lifecycle 보드", countKey: "board" },
    { id: "cases", icon: "file-text", label: "여신 케이스", description: "필터·조회", countKey: "cases" },
    { id: "doc-check", icon: "check-square", label: "서류 누락 확인", description: "보완 요청", countKey: "docCheck" },
    { id: "approval-drafts", icon: "history", label: "승인 품의함", description: "품의 초안·결재", countKey: "approvalDrafts" },
  ]},
  { section: "여신 점검", items: [
    { id: "financial-summary", icon: "activity", label: "재무자료 요약", description: "매출·비용 요약", countKey: "financialSummary" },
    { id: "repayment-check", icon: "wallet", label: "상환능력 체크", description: "부담 지표", countKey: "repaymentCheck" },
    { id: "policy-match", icon: "target", label: "정책금융 후보", description: "안내 후보", countKey: "policyMatch" },
    { id: "early-warning", icon: "alert", label: "조기경보", description: "연체·급변 신호", countKey: "earlyWarning" },
  ]},
  { section: "고객 대응", items: [
    { id: "consult-log", icon: "users", label: "상담 이력", description: "요약·기록", countKey: "consultLog" },
    { id: "reply-drafts", icon: "bot", label: "고객 회신 초안", description: "승인 대기", countKey: "replyDrafts" },
  ]},
  { section: "AI·자동화 관리", items: [
    { id: "ai-analysis", icon: "activity", label: "AI 분석 요청", description: "대기/실행", countKey: "aiAnalysis" },
    { id: "agent-harness", icon: "bot", label: "운영 에이전트 하네스", description: "표면 5·내부 8", countKey: "agentHarness" },
    { id: "audit-logs", icon: "history", label: "감사 기록", description: "검토 필요", countKey: "auditLogs" },
  ]},
];

const CCL_STATUS_LABELS = {
  received: "신규 접수", collecting: "자료 수집", aiReview: "AI 검토", humanReview: "담당자 검토 필요",
  memoDraft: "품의 진행", doneHold: "완료·보류", open: "미처리", pending: "대기", queued: "대기열",
  running: "실행중", needsReview: "검토 필요", pendingApproval: "승인 대기", completed: "완료",
  approved: "승인됨", rejected: "반려", missing: "누락", ready: "구비", verified: "확인 완료",
  unknown: "확인 필요", active: "활성", proposed: "제안됨", escalated: "에스컬레이션",
};
const CCL_RISK_LABELS = { low: "낮음", medium: "보통", high: "높음", critical: "심각" };

const CCL_SURFACE_AGENT_IDS = ["ccl-intake", "ccl-financial", "ccl-repayment", "ccl-doc", "ccl-memo"];

const CCL_COMMON_BLOCKED_ACTIONS = [
  "실제 대출 승인/거절 확정 금지",
  "금리/한도 산정 금지",
  "신용등급·심사 결과 확정 금지",
  "실제 금융거래 실행 금지",
  "실제 개인·기업 식별정보 원문 저장/출력 금지",
  "고객 대상 자동 발송 금지",
  "high/critical 자동 종결 금지",
];

function cclAgent(config) {
  return {
    id: config.id, agentKey: config.agentKey, name: config.name,
    displayName: config.displayName || config.name, description: config.description,
    domain: config.domain, responsibilities: config.responsibilities, triggerExamples: config.triggerExamples,
    inputSchema: config.inputSchema || ["caseId", "loanType", "amountBand", "docsStatus"],
    outputSchema: config.outputSchema || ["summary", "checklist", "requiresHumanReview", "handoffs"],
    allowedActions: config.allowedActions,
    blockedActions: CCL_COMMON_BLOCKED_ACTIONS.concat(config.blockedActions || []),
    dbReads: config.dbReads, dbWrites: config.dbWrites, handoffRules: config.handoffRules,
    guardrails: (config.guardrails || []).concat(["모든 출력은 내부 운영 참고용", "담당자 검토 필요 표시 유지"]),
    metrics: config.metrics, status: config.status || "active", queue: config.queue || 0,
  };
}

const cclConsoleAgents = [
  cclAgent({ id: "ccl-intake", agentKey: "credit-intake-triage-agent", name: "Credit Intake Triage Agent", displayName: "여신 접수 분류 에이전트", domain: "orchestration",
    description: "여신 검토 건을 상품·금액대·서류 상태 기준으로 분류하고 전용 에이전트로 라우팅한다.",
    responsibilities: ["접수 분류", "초기 상태 산정", "핸드오프"], triggerExamples: ["신규 여신 검토 접수"],
    allowedActions: ["분류", "라우팅", "감사 기록"], dbReads: ["ccl_cases"], dbWrites: ["ccl_cases", "ccl_audit_logs", "ccl_agent_runs", "agent_handoffs"],
    handoffRules: ["재무자료는 Financial Summary", "서류는 Document Checklist", "고위험은 Supervisor"], metrics: ["routingAccuracy"] }),
  cclAgent({ id: "ccl-financial", agentKey: "financial-summary-agent", name: "Financial Summary Agent", displayName: "재무자료 요약 에이전트", domain: "financialSummary",
    description: "매출·비용·현금흐름 자료를 요약 지표(구간값)로 정리한다. 수치 확정 판단은 하지 않는다.",
    responsibilities: ["재무 요약", "이상 항목 표시"], triggerExamples: ["재무자료 요약 요청"],
    allowedActions: ["요약 작성", "확인 필요 표시"], blockedActions: ["재무 건전성 확정 평가 금지"],
    dbReads: ["ccl_cases", "ccl_review_notes"], dbWrites: ["ccl_review_notes", "ccl_audit_logs"],
    handoffRules: ["상환 지표는 Repayment Capacity"], metrics: ["summariesOpen"], queue: 4 }),
  cclAgent({ id: "ccl-repayment", agentKey: "repayment-capacity-agent", name: "Repayment Capacity Agent", displayName: "상환능력 체크 에이전트", domain: "repaymentCheck",
    description: "상환 부담 지표(구간)를 계산하고 확인 필요 항목을 체크리스트로 만든다. 한도·금리는 산정하지 않는다.",
    responsibilities: ["부담 지표 구간화", "체크리스트"], triggerExamples: ["상환능력 점검"],
    allowedActions: ["지표 구간 표시"], blockedActions: ["상환 가능/불가 확정 금지"],
    dbReads: ["ccl_cases", "ccl_review_notes"], dbWrites: ["ccl_review_notes", "ccl_audit_logs"],
    handoffRules: ["부담 과다 신호는 Supervisor"], metrics: ["checksOpen"], queue: 3 }),
  cclAgent({ id: "ccl-doc", agentKey: "document-checklist-agent", name: "Document Checklist Agent", displayName: "서류 체크리스트 에이전트", domain: "docCheck",
    description: "필요 서류의 구비/누락을 추적하고 보완 요청 초안을 만든다.",
    responsibilities: ["서류 체크", "보완 요청 초안"], triggerExamples: ["서류 누락 확인"],
    allowedActions: ["체크리스트 갱신", "보완 초안"], dbReads: ["ccl_doc_checks", "ccl_cases"],
    dbWrites: ["ccl_doc_checks", "ccl_audit_logs"], handoffRules: ["회신 문안은 Customer Reply Draft"],
    metrics: ["missingDocs"], status: "needsReview", queue: 5 }),
  cclAgent({ id: "ccl-policy", agentKey: "policy-fund-match-agent", name: "Policy Fund Match Agent", displayName: "정책금융 후보 에이전트", domain: "policyMatch",
    description: "정책금융·보증 프로그램 후보를 '안내 후보'로 정리한다. 지원 가능 여부는 확정하지 않는다.",
    responsibilities: ["후보 정리"], triggerExamples: ["정책금융 후보 요청"],
    allowedActions: ["후보 나열"], blockedActions: ["지원 가능 확정 금지"],
    dbReads: ["ccl_review_notes", "ccl_cases"], dbWrites: ["ccl_review_notes", "ccl_audit_logs"],
    handoffRules: ["요건 판단은 담당자"], metrics: ["candidates"], queue: 2 }),
  cclAgent({ id: "ccl-memo", agentKey: "approval-memo-draft-agent", name: "Approval Memo Draft Agent", displayName: "승인 품의 초안 에이전트", domain: "approvalDrafts",
    description: "검토 결과를 품의 초안으로 구성한다. 결재·승인 주체는 항상 사람이다.",
    responsibilities: ["품의 초안", "근거 정리"], triggerExamples: ["품의 초안 작성"],
    allowedActions: ["초안 작성", "승인 요청 등록"], blockedActions: ["자체 결재 금지"],
    dbReads: ["ccl_cases", "ccl_review_notes"], dbWrites: ["ccl_memo_drafts", "approvals", "ccl_audit_logs"],
    handoffRules: ["초안은 항상 승인 대기"], metrics: ["draftsPending"], queue: 3 }),
  cclAgent({ id: "ccl-reply", agentKey: "customer-reply-draft-agent", name: "Customer Reply Draft Agent", displayName: "고객 회신 초안 에이전트", domain: "replyDrafts",
    description: "상담 요약과 고객 회신 초안을 만든다. 발송은 반드시 승인 대기.",
    responsibilities: ["회신 초안", "승인 대기 등록"], triggerExamples: ["보완 안내 회신 초안"],
    allowedActions: ["초안 작성"], blockedActions: ["자동 발송 금지"],
    dbReads: ["ccl_cases"], dbWrites: ["ai_recommendations", "approvals", "ccl_audit_logs"],
    handoffRules: ["모든 회신은 approval pending"], metrics: ["draftsPendingApproval"], queue: 2 }),
  cclAgent({ id: "ccl-supervisor", agentKey: "credit-supervisor-review-agent", name: "Credit Supervisor Review Agent", displayName: "여신 감독 검토 에이전트", domain: "governance",
    description: "고위험 건·승인 큐·감사 기록을 추적한다. 승인 주체는 항상 사람이다.",
    responsibilities: ["검토 큐", "감사 추적"], triggerExamples: ["고위험 검토"],
    allowedActions: ["검토 대기 등록"], blockedActions: ["자체 승인 금지"],
    dbReads: ["approvals", "ccl_audit_logs"], dbWrites: ["approvals", "ccl_audit_logs"],
    handoffRules: ["미승인 발송 시도 차단 플래그"], metrics: ["pendingApprovals"], queue: 1 }),
];

const cclConsoleSkills = [
  { key: "credit-intake-triage", label: "여신 접수 분류", agentIds: ["ccl-intake"], inputs: ["loanType", "amountBand"], outputs: ["status", "handoffs"] },
  { key: "financial-brief", label: "재무자료 요약 브리프", agentIds: ["ccl-financial"], inputs: ["caseId"], outputs: ["summary", "flags"] },
  { key: "repayment-band-check", label: "상환 부담 구간 체크", agentIds: ["ccl-repayment"], inputs: ["caseId"], outputs: ["burdenBand", "checklist"] },
  { key: "doc-gap-check", label: "서류 누락 확인", agentIds: ["ccl-doc"], inputs: ["caseId"], outputs: ["missingDocs"] },
  { key: "policy-candidates", label: "정책금융 후보 정리", agentIds: ["ccl-policy"], inputs: ["caseId"], outputs: ["candidates"] },
  { key: "approval-memo-draft", label: "승인 품의 초안", agentIds: ["ccl-memo"], inputs: ["caseId"], outputs: ["memoDraft", "approvalRequest"] },
];

const cclConsoleHarness = {
  id: "cclConsoleHarness",
  name: "기업여신 심사지원 하네스",
  roleKey: CCL_ROLE_KEY,
  workspaceId: CCL_WORKSPACE_ID,
  displayName: CCL_DISPLAY_NAME,
  purpose: "기업여신·소상공인 대출 검토를 요약·체크·초안 중심으로 보조하는 역할 콘솔 — 결정은 항상 담당자",
  policy: [
    "실제 대출 승인/거절·금리/한도 산정·신용등급 확정 금지",
    "재무·상환 지표는 구간(band)으로만 — 확정 평가 금지",
    "품의·고객 회신 초안은 항상 담당자 승인(approval pending)",
    "실제 식별정보 원문 저장/출력 금지 — 익명 BIZ-REF만",
    "high/critical 자동 종결 금지",
    "모든 AI output은 내부 운영 참고용 · 담당자 검토 필요",
  ],
  agents: cclConsoleAgents,
  skills: cclConsoleSkills,
};

const CCL_FORBIDDEN_ASSERTIONS = [
  { label: "대출 승인/거절 단정", re: /대출[^\n]{0,8}(승인|거절)\s*(합니다|입니다|확정)/ },
  { label: "금리/한도 단정", re: /(금리|한도)[^\n]{0,8}(산정\s*결과|확정)/ },
  { label: "신용등급 단정", re: /신용등급[^\n]{0,6}(확정|입니다)/ },
];

const cclConsoleRules = {
  id: "cclConsoleRules",
  harnessId: "corporate-credit",
  ruleStatements: CCL_COMMON_BLOCKED_ACTIONS.concat(["모든 AI output은 내부 운영 참고용"]),
  forbiddenAssertions: CCL_FORBIDDEN_ASSERTIONS,
  requiredBlockedActions: CCL_COMMON_BLOCKED_ACTIONS,
  requiredNotices: ["내부 운영 참고용", "담당자 검토 필요"],
};

const cclConsoleHooks = {
  onRoleEnter: [() => {
    try { cclTable("ccl_cases"); return "cclTable이 scope 없이 조회를 허용함"; }
    catch (error) { return String(error.message).includes("role scope is required") ? null : `예외 계약 불일치: ${error.message}`; }
  }],
  beforeCaseCreate: [
    (payload) => harnessGuardCheckPII([payload.title, payload.segment, payload.bizRefId, payload.tags].filter(Boolean).join(" ")),
    (payload) => harnessGuardCheckAssertions([payload.title, payload.segment].filter(Boolean).join(" "), CCL_FORBIDDEN_ASSERTIONS),
  ],
  afterCaseCreate: [(payload) => harnessGuardCheckScope(payload.caseRow, "roleKey", CCL_ROLE_KEY)],
  beforeAgentRun: [
    (payload) => harnessGuardCheckAutoClose(payload.riskLevel, payload.status),
    (payload) => harnessGuardCheckAssertions(payload.inputSummary, CCL_FORBIDDEN_ASSERTIONS),
  ],
  afterAgentRun: [(payload) => harnessGuardCheckScope(payload.run, "roleKey", CCL_ROLE_KEY)],
  beforeCustomerMessage: [
    (payload) => harnessGuardCheckPII(payload.draftText),
    (payload) => harnessGuardCheckAssertions(payload.draftText, CCL_FORBIDDEN_ASSERTIONS),
    (payload) => harnessGuardCheckApprovalRequired(payload),
  ],
  afterApprovalDecision: [
    (payload) => harnessGuardCheckScope(payload.approval, "roleKey", CCL_ROLE_KEY),
    (payload) => (String(payload.decidedBy || "").startsWith("USR-") ? null : "승인 결정 주체가 사람 담당자가 아님"),
  ],
  onAuditWrite: [(payload) => harnessGuardCheckScope(payload.audit, "roleKey", CCL_ROLE_KEY)],
};

function cclHashForView(view, caseId) {
  if (caseId) return `#${CCL_ROUTE_BASE}/cases/${encodeURIComponent(caseId)}`;
  return `#${CCL_ROUTE_BY_VIEW[view] || CCL_ROUTE_BASE}`;
}

function cclRouteFromHash(hash) {
  const raw = String(hash || "").replace(/^#/, "");
  if (raw === CCL_ROUTE_BASE || raw === "corporate-credit-harness") return { view: "board" };
  if (!raw.startsWith(CCL_ROUTE_BASE)) return null;
  if (raw.startsWith(`${CCL_ROUTE_BASE}/cases/`) && raw !== `${CCL_ROUTE_BASE}/cases/new`) {
    return { view: "cases", caseId: decodeURIComponent(raw.slice(`${CCL_ROUTE_BASE}/cases/`.length)) };
  }
  return { view: CCL_VIEW_BY_ROUTE[raw] || "board" };
}
