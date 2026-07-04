/* FDS/보이스피싱 담당자 역할 콘솔 — core (config + agent registry + rules/hooks).
   도메인: 이상거래 탐지·보이스피싱 의심 대응. 케이스: 고위험 이체/고령 고객 이상거래.
   금지: 자동 종결, 실제 지급정지·차단 실행, 실제 금융거래 실행 — 종결은 항상 사람이 한다. */

const FDR_ROLE_KEY = "fds-response";
const FDR_WORKSPACE_ID = "fds-response";
const FDR_DISPLAY_NAME = "FDS/보이스피싱 담당자";
const FDR_PORTAL_TITLE = "FDS·보이스피싱 대응 포털";
const FDR_ROUTE_BASE = "/roles/fds-response";

const FDR_BOARD_COLUMNS = [
  ["received", "신규 경보"],
  ["analyzing", "신호 분석"],
  ["humanReview", "담당자 검토 필요"],
  ["contacting", "고객 확인 중"],
  ["decision", "차단·보류 결정 대기"],
  ["closedByHuman", "종결(사람)"],
];
const FDR_ACTIVE_STATUSES = ["received", "analyzing", "humanReview", "contacting", "decision"];

const FDR_ALERT_TYPES = {
  highTransfer: { label: "고액 이체 이상징후", team: "FDS대응팀" },
  elderRisk: { label: "고령 고객 이상거래", team: "FDS대응팀", requiresHumanReview: true },
  remoteApp: { label: "원격제어 앱 의심", team: "FDS대응팀", minRisk: "high" },
  loanScam: { label: "대출빙자 사기 의심", team: "피싱대응팀" },
  newDeviceBurst: { label: "신규 기기 다회 이체", team: "FDS대응팀", minRisk: "high" },
  dormantSpike: { label: "휴면 후 고액 거래", team: "FDS대응팀" },
};

const FDR_SIGNAL_TYPES = {
  HIGH_AMOUNT_TRANSFER: "고액 이체",
  ELDERLY_CUSTOMER: "고령·취약 고객",
  NEW_DEVICE_ACCESS: "신규 기기 접속",
  REMOTE_APP_SUSPECT: "원격제어 앱 의심",
  UNUSUAL_HOUR: "심야·이상 시간대",
  REPEATED_TRANSFERS: "반복 이체 패턴",
  CALLBACK_REFUSED: "고객 연락 회피",
  KNOWN_SCAM_PATTERN: "알려진 사기 패턴 유사",
};

const FDR_VIEWS = {
  board: "경보 대응 보드",
  cases: "경보 케이스",
  "cases-new": "신규 이상거래/피싱 의심 건 접수",
  "block-review": "차단·보류 검토함",
  escalations: "에스컬레이션",
  "anomaly-signals": "이상거래 신호",
  "elder-guard": "고령·취약 고객 조기경보",
  "pattern-summary": "거래 패턴 요약",
  "rule-status": "탐지룰 상태",
  "contact-scripts": "고객 확인 스크립트",
  "payment-hold-guide": "지급정지 절차 안내",
  "follow-up": "사후 확인",
  "ai-analysis": "AI 분석 요청",
  "agent-harness": "운영 에이전트 하네스",
  "audit-logs": "감사 기록",
};
const FDR_ROUTE_BY_VIEW = Object.fromEntries(
  Object.keys(FDR_VIEWS).map((view) => [view, view === "cases-new" ? `${FDR_ROUTE_BASE}/cases/new` : `${FDR_ROUTE_BASE}/${view}`]),
);
const FDR_VIEW_BY_ROUTE = Object.fromEntries(Object.entries(FDR_ROUTE_BY_VIEW).map(([view, route]) => [route, view]));

const fdrNavigation = [
  { section: "오늘 처리할 일", items: [
    { id: "board", icon: "layout-dashboard", label: "경보 대응 보드", description: "lifecycle 보드", countKey: "board" },
    { id: "cases", icon: "file-text", label: "경보 케이스", description: "필터·조회", countKey: "cases" },
    { id: "block-review", icon: "lock", label: "차단·보류 검토함", description: "사람 결정 대기", countKey: "blockReview" },
    { id: "escalations", icon: "bell", label: "에스컬레이션", description: "고위험 추적", countKey: "escalations" },
  ]},
  { section: "탐지 점검", items: [
    { id: "anomaly-signals", icon: "alert", label: "이상거래 신호", description: "신호 큐", countKey: "anomalySignals" },
    { id: "elder-guard", icon: "shield", label: "고령·취약 고객 조기경보", description: "우선 보호", countKey: "elderGuard" },
    { id: "pattern-summary", icon: "activity", label: "거래 패턴 요약", description: "요약 지표", countKey: "patternSummary" },
    { id: "rule-status", icon: "database", label: "탐지룰 상태", description: "룰 헬스", countKey: "ruleStatus" },
  ]},
  { section: "고객 대응", items: [
    { id: "contact-scripts", icon: "users", label: "고객 확인 스크립트", description: "승인 대기", countKey: "contactScripts" },
    { id: "payment-hold-guide", icon: "file-text", label: "지급정지 절차 안내", description: "안내 후보", countKey: "paymentHoldGuide" },
    { id: "follow-up", icon: "refresh-cw", label: "사후 확인", description: "종결 후 점검", countKey: "followUp" },
  ]},
  { section: "AI·자동화 관리", items: [
    { id: "ai-analysis", icon: "activity", label: "AI 분석 요청", description: "대기/실행", countKey: "aiAnalysis" },
    { id: "agent-harness", icon: "bot", label: "운영 에이전트 하네스", description: "표면 5·내부 8", countKey: "agentHarness" },
    { id: "audit-logs", icon: "history", label: "감사 기록", description: "검토 필요", countKey: "auditLogs" },
  ]},
];

const FDR_STATUS_LABELS = {
  received: "신규 경보", analyzing: "신호 분석", humanReview: "담당자 검토 필요", contacting: "고객 확인 중",
  decision: "차단·보류 결정 대기", closedByHuman: "종결(사람)", open: "미처리", pending: "대기",
  queued: "대기열", running: "실행중", needsReview: "검토 필요", pendingApproval: "승인 대기",
  completed: "완료", approved: "승인됨", rejected: "반려", escalated: "에스컬레이션",
  healthy: "정상", degraded: "성능 저하", tuning: "튜닝 필요", active: "활성", proposed: "제안됨",
  guided: "안내 완료", verified: "확인 완료", falsePositive: "오탐 확인",
};
const FDR_RISK_LABELS = { low: "낮음", medium: "보통", high: "높음", critical: "심각" };
const FDR_SURFACE_AGENT_IDS = ["fdr-intake", "fdr-signal", "fdr-elder", "fdr-contact", "fdr-block"];

const FDR_COMMON_BLOCKED_ACTIONS = [
  "경보 자동 종결 금지 — 종결은 항상 사람",
  "실제 지급정지·계좌 차단 실행 금지",
  "실제 금융거래 실행 금지",
  "사기 여부 확정 판단 금지",
  "실제 개인정보 원문 저장/출력 금지",
  "고객 대상 자동 발송·자동 전화 금지",
  "high/critical 자동 완료 금지",
];

function fdrAgent(config) {
  return {
    id: config.id, agentKey: config.agentKey, name: config.name,
    displayName: config.displayName || config.name, description: config.description,
    domain: config.domain, responsibilities: config.responsibilities, triggerExamples: config.triggerExamples,
    inputSchema: config.inputSchema || ["caseId", "alertType", "signals", "riskLevel"],
    outputSchema: config.outputSchema || ["summary", "recommendation", "requiresHumanReview", "handoffs"],
    allowedActions: config.allowedActions,
    blockedActions: FDR_COMMON_BLOCKED_ACTIONS.concat(config.blockedActions || []),
    dbReads: config.dbReads, dbWrites: config.dbWrites, handoffRules: config.handoffRules,
    guardrails: (config.guardrails || []).concat(["모든 출력은 내부 운영 참고용", "담당자 검토 필요 표시 유지"]),
    metrics: config.metrics, status: config.status || "active", queue: config.queue || 0,
  };
}

const fdrConsoleAgents = [
  fdrAgent({ id: "fdr-intake", agentKey: "fds-intake-triage-agent", name: "FDS Intake Triage Agent", displayName: "경보 접수 분류 에이전트", domain: "orchestration",
    description: "경보를 유형·심각도·고객 취약성 기준으로 분류하고 전용 에이전트로 라우팅한다.",
    responsibilities: ["경보 분류", "초기 상태 산정", "핸드오프"], triggerExamples: ["신규 경보 접수"],
    allowedActions: ["분류", "라우팅", "감사 기록"], dbReads: ["fdr_cases"], dbWrites: ["fdr_cases", "fdr_audit_logs", "fdr_agent_runs", "agent_handoffs"],
    handoffRules: ["신호 요약은 Anomaly Signal", "고령 고객은 Elder Guard", "고위험은 Supervisor"], metrics: ["routingAccuracy"] }),
  fdrAgent({ id: "fdr-signal", agentKey: "anomaly-signal-summary-agent", name: "Anomaly Signal Summary Agent", displayName: "이상거래 신호 요약 에이전트", domain: "anomalySignals",
    description: "거래 신호를 사람이 읽을 수 있는 위험 요약으로 정리한다. 사기 여부는 확정하지 않는다.",
    responsibilities: ["신호 요약", "위험 근거 정리"], triggerExamples: ["이상 신호 요약"],
    allowedActions: ["요약 작성"], dbReads: ["fdr_cases", "fdr_signals"], dbWrites: ["fdr_signals", "fdr_audit_logs"],
    handoffRules: ["차단 검토는 Hold & Block Review"], metrics: ["signalsOpen"], queue: 5 }),
  fdrAgent({ id: "fdr-elder", agentKey: "elder-customer-guard-agent", name: "Elder Customer Guard Agent", displayName: "고령 고객 보호 에이전트", domain: "elderGuard",
    description: "고령·취약 고객 케이스를 조기경보로 승격하고 보호 우선 체크리스트를 만든다.",
    responsibilities: ["취약 고객 플래그", "보호 체크리스트"], triggerExamples: ["고령 고객 고액 이체"],
    allowedActions: ["조기경보 표시"], dbReads: ["fdr_cases"], dbWrites: ["fdr_signals", "fdr_audit_logs"],
    handoffRules: ["연락 스크립트는 Contact Script Draft"], metrics: ["elderFlags"], status: "escalated", queue: 3 }),
  fdrAgent({ id: "fdr-pattern", agentKey: "transaction-pattern-agent", name: "Transaction Pattern Agent", displayName: "거래 패턴 요약 에이전트", domain: "patternSummary",
    description: "기간·채널·금액대 패턴을 구간 요약으로 정리한다.",
    responsibilities: ["패턴 요약"], triggerExamples: ["패턴 요약 요청"],
    allowedActions: ["구간 요약"], dbReads: ["fdr_cases", "fdr_signals"], dbWrites: ["fdr_signals", "fdr_audit_logs"],
    handoffRules: ["룰 개선 힌트는 룰 상태에 기록"], metrics: ["patternsSummarized"], queue: 2 }),
  fdrAgent({ id: "fdr-contact", agentKey: "contact-script-draft-agent", name: "Contact Script Draft Agent", displayName: "고객 확인 스크립트 에이전트", domain: "contactScripts",
    description: "송금 전 확인 질문·콜백 스크립트 초안을 만든다. 사용(발신)은 반드시 승인 대기.",
    responsibilities: ["확인 질문 초안", "승인 대기 등록"], triggerExamples: ["고객 확인 스크립트 요청"],
    allowedActions: ["초안 작성", "승인 요청"], blockedActions: ["자동 발신 금지"],
    dbReads: ["fdr_cases"], dbWrites: ["ai_recommendations", "approvals", "fdr_audit_logs"],
    handoffRules: ["모든 스크립트는 approval pending"], metrics: ["scriptsPendingApproval"], queue: 3 }),
  fdrAgent({ id: "fdr-block", agentKey: "hold-block-review-agent", name: "Hold & Block Review Agent", displayName: "차단·보류 검토 에이전트", domain: "blockReview",
    description: "차단/보류 권고와 근거를 정리해 사람 결정 대기로 넘긴다. 실집행은 하지 않는다.",
    responsibilities: ["차단/보류 권고", "결정 대기 등록"], triggerExamples: ["차단 검토 요청"],
    allowedActions: ["권고 작성", "결정 대기 등록"], blockedActions: ["차단/보류 실행 금지"],
    dbReads: ["fdr_cases", "fdr_signals"], dbWrites: ["fdr_block_reviews", "approvals", "fdr_audit_logs"],
    handoffRules: ["결정은 담당자 — Supervisor 추적"], metrics: ["decisionsPending"], status: "needsReview", queue: 4 }),
  fdrAgent({ id: "fdr-report", agentKey: "external-report-guide-agent", name: "External Report Guide Agent", displayName: "외부 신고 안내 에이전트", domain: "paymentHoldGuide",
    description: "지급정지·신고 절차(112/1332 등)를 '안내 후보'로 정리한다. 신고 대행이 아니다.",
    responsibilities: ["절차 안내 후보"], triggerExamples: ["지급정지 절차 문의"],
    allowedActions: ["안내 후보 정리"], blockedActions: ["신고 대행 금지"],
    dbReads: ["fdr_cases"], dbWrites: ["fdr_audit_logs"],
    handoffRules: ["안내 문구는 승인 대기"], metrics: ["guidesPrepared"], queue: 1 }),
  fdrAgent({ id: "fdr-supervisor", agentKey: "fds-supervisor-review-agent", name: "FDS Supervisor Review Agent", displayName: "FDS 감독 검토 에이전트", domain: "governance",
    description: "고위험 경보·결정 대기·감사 기록을 추적한다. 종결·승인 주체는 항상 사람이다.",
    responsibilities: ["검토 큐", "종결 추적"], triggerExamples: ["고위험 경보 검토"],
    allowedActions: ["검토 대기 등록"], blockedActions: ["자체 종결 금지"],
    dbReads: ["approvals", "fdr_audit_logs"], dbWrites: ["approvals", "fdr_audit_logs"],
    handoffRules: ["자동 종결 시도 차단 플래그"], metrics: ["pendingDecisions"], queue: 2 }),
];

const fdrConsoleSkills = [
  { key: "alert-triage", label: "경보 분류·라우팅", agentIds: ["fdr-intake"], inputs: ["alertType", "riskLevel"], outputs: ["status", "handoffs"] },
  { key: "signal-brief", label: "위험 신호 요약", agentIds: ["fdr-signal"], inputs: ["caseId"], outputs: ["summary"] },
  { key: "elder-priority", label: "고령·취약 우선 보호", agentIds: ["fdr-elder"], inputs: ["caseId"], outputs: ["priorityFlag", "checklist"] },
  { key: "contact-script", label: "송금 전 확인 스크립트(승인 대기)", agentIds: ["fdr-contact"], inputs: ["caseId"], outputs: ["script", "approvalRequest"] },
  { key: "hold-block-recommend", label: "차단/보류 권고", agentIds: ["fdr-block"], inputs: ["caseId"], outputs: ["recommendation"] },
  { key: "report-guide", label: "지급정지·신고 절차 안내 후보", agentIds: ["fdr-report"], inputs: ["caseId"], outputs: ["guideCandidates"] },
];

const fdrConsoleHarness = {
  id: "fdrConsoleHarness",
  name: "FDS·보이스피싱 대응 하네스",
  roleKey: FDR_ROLE_KEY,
  workspaceId: FDR_WORKSPACE_ID,
  displayName: FDR_DISPLAY_NAME,
  purpose: "이상거래·피싱 의심 경보를 신호 요약→고객 확인→사람 결정으로 처리하는 역할 콘솔",
  policy: [
    "경보 자동 종결 금지 — 종결(closedByHuman)은 항상 사람",
    "실제 지급정지·차단·금융거래 실행 금지 — 권고와 근거만",
    "사기 여부 확정 판단 금지 — 위험 신호로만 표현",
    "고객 확인 스크립트·안내 문구는 승인 대기 후 사용",
    "고령·취약 고객은 조기경보로 우선 검토",
    "모든 AI output은 내부 운영 참고용 · 담당자 검토 필요",
  ],
  agents: fdrConsoleAgents,
  skills: fdrConsoleSkills,
};

const FDR_FORBIDDEN_ASSERTIONS = [
  { label: "사기 확정 단정", re: /(보이스피싱|사기)(입니다|로\s*확정|가\s*확실)/ },
  { label: "차단 실행 단정", re: /(차단|지급정지)[^\n]{0,6}(했습니다|실행\s*완료)/ },
];

const fdrConsoleRules = {
  id: "fdrConsoleRules",
  harnessId: "fds-response",
  ruleStatements: FDR_COMMON_BLOCKED_ACTIONS.concat(["모든 AI output은 내부 운영 참고용"]),
  forbiddenAssertions: FDR_FORBIDDEN_ASSERTIONS,
  requiredBlockedActions: FDR_COMMON_BLOCKED_ACTIONS,
  requiredNotices: ["내부 운영 참고용", "담당자 검토 필요"],
};

const fdrConsoleHooks = {
  onRoleEnter: [() => {
    try { fdrTable("fdr_cases"); return "fdrTable이 scope 없이 조회를 허용함"; }
    catch (error) { return String(error.message).includes("role scope is required") ? null : `예외 계약 불일치: ${error.message}`; }
  }],
  beforeCaseCreate: [
    (payload) => harnessGuardCheckPII([payload.title, payload.customerRefId, payload.channel, payload.tags].filter(Boolean).join(" ")),
    (payload) => harnessGuardCheckAssertions([payload.title].filter(Boolean).join(" "), FDR_FORBIDDEN_ASSERTIONS),
  ],
  afterCaseCreate: [(payload) => harnessGuardCheckScope(payload.caseRow, "roleKey", FDR_ROLE_KEY)],
  beforeAgentRun: [
    (payload) => harnessGuardCheckAutoClose(payload.riskLevel, payload.status),
    (payload) => (payload.status === "closedByHuman" && !String(payload.decidedBy || "").startsWith("USR-") ? "closedByHuman은 사람만 설정 가능" : null),
    (payload) => harnessGuardCheckAssertions(payload.inputSummary, FDR_FORBIDDEN_ASSERTIONS),
  ],
  afterAgentRun: [(payload) => harnessGuardCheckScope(payload.run, "roleKey", FDR_ROLE_KEY)],
  beforeCustomerMessage: [
    (payload) => harnessGuardCheckPII(payload.draftText),
    (payload) => harnessGuardCheckAssertions(payload.draftText, FDR_FORBIDDEN_ASSERTIONS),
    (payload) => harnessGuardCheckApprovalRequired(payload),
  ],
  afterApprovalDecision: [
    (payload) => harnessGuardCheckScope(payload.approval, "roleKey", FDR_ROLE_KEY),
    (payload) => (String(payload.decidedBy || "").startsWith("USR-") ? null : "승인 결정 주체가 사람 담당자가 아님"),
  ],
  onAuditWrite: [(payload) => harnessGuardCheckScope(payload.audit, "roleKey", FDR_ROLE_KEY)],
};

function fdrHashForView(view, caseId) {
  if (caseId) return `#${FDR_ROUTE_BASE}/cases/${encodeURIComponent(caseId)}`;
  return `#${FDR_ROUTE_BY_VIEW[view] || FDR_ROUTE_BASE}`;
}
function fdrRouteFromHash(hash) {
  const raw = String(hash || "").replace(/^#/, "");
  if (raw === FDR_ROUTE_BASE || raw === "fds-response-harness") return { view: "board" };
  if (!raw.startsWith(FDR_ROUTE_BASE)) return null;
  if (raw.startsWith(`${FDR_ROUTE_BASE}/cases/`) && raw !== `${FDR_ROUTE_BASE}/cases/new`) {
    return { view: "cases", caseId: decodeURIComponent(raw.slice(`${FDR_ROUTE_BASE}/cases/`.length)) };
  }
  return { view: FDR_VIEW_BY_ROUTE[raw] || "board" };
}
