/* JB우리캐피탈 전용 agent/harness registry.
   메인 agents 배열을 alias하지 않고 캐피탈 운영 도메인 기준으로 독립 정의한다. */

const JBWC_COMMON_BLOCKED_ACTIONS = [
  "실제 대출 승인/거절 금지",
  "실제 금리/한도 산정 금지",
  "실제 신용평가 금지",
  "실제 개인정보 원문 조회/저장/전송 금지",
  "실제 계좌/결제/자동이체 변경 금지",
  "실제 전자약정 체결 금지",
  "FDS 고위험 케이스 자동 종결 금지",
  "법률/규정 확정 판단 금지",
];

function jbwcAgent(config) {
  const domainConfig = JBWC_DOMAIN_TAXONOMY[config.domain] || { products: [], label: config.domain };
  return {
    id: config.id,
    agentKey: config.agentKey,
    name: config.name,
    displayName: config.displayName || config.name,
    description: config.description,
    domain: config.domain,
    productTypes: config.productTypes || domainConfig.products,
    responsibilities: config.responsibilities,
    triggerExamples: config.triggerExamples,
    inputSchema: config.inputSchema || ["caseId", "domain", "productType", "riskLevel", "description"],
    outputSchema: config.outputSchema || ["recommendedStatus", "summary", "nextTasks", "requiresHumanReview", "handoffs"],
    allowedActions: config.allowedActions,
    blockedActions: JBWC_COMMON_BLOCKED_ACTIONS.concat(config.blockedActions || []),
    dbReads: config.dbReads,
    dbWrites: config.dbWrites,
    handoffRules: config.handoffRules,
    guardrails: config.guardrails,
    metrics: config.metrics,
    status: config.status || "active",
    queue: config.queue || 0,
  };
}

const jbWooriCapitalAgents = [
  jbwcAgent({
    id: "jbwc-orchestrator",
    agentKey: "jb-triage-orchestrator",
    name: "JB Triage Orchestrator",
    displayName: "JB 분류 오케스트레이터",
    domain: "orchestration",
    productTypes: ["전체 운영 건"],
    description: "JB우리캐피탈 운영 건을 도메인·위험도·필요 서류·SLA 기준으로 분류하고 전용 agent로 라우팅한다.",
    responsibilities: ["도메인 분류", "초기 상태 산정", "SLA 계산", "handoff 생성", "human review 플래그"],
    triggerExamples: ["신규 운영 건 접수", "고위험 FDS 민원", "서류 누락 케이스"],
    allowedActions: ["운영 분류", "agent routing", "audit log 생성", "mock queue 등록"],
    blockedActions: ["고객 대상 조치 직접 실행"],
    dbReads: ["ops_cases", "users", "external_connectors"],
    dbWrites: ["ops_tasks", "audit_logs", "ai_analysis_requests", "agent_runs", "agent_handoffs"],
    handoffRules: ["domain별 전용 agent", "critical/high는 담당자 검토", "SLA 임박은 Ops Metrics & QA"],
    guardrails: ["분류 신뢰도 낮으면 assigned 대신 inOperationalReview", "모든 출력은 내부 운영 참고용"],
    metrics: ["routingAccuracy", "handoffLatency", "humanReviewRate"],
  }),
  jbwcAgent({
    id: "jbwc-personal",
    agentKey: "personal-finance-ops-agent",
    name: "Personal Finance Ops Agent",
    displayName: "개인금융 운영 에이전트",
    domain: "personalFinance",
    description: "개인신용대출·대환대출·자동차담보대출·내구재할부 운영 케이스를 담당한다.",
    responsibilities: ["개인금융 상태 점검", "서류 누락 체크", "운영 안내 초안"],
    triggerExamples: ["대환대출 서류 보완", "개인신용대출 진행 상태"],
    allowedActions: ["mock 상태 조회", "체크리스트 작성", "문서 agent handoff"],
    dbReads: ["ops_cases", "document_cases", "approvals"],
    dbWrites: ["ops_tasks", "ai_recommendations", "audit_logs"],
    handoffRules: ["누락서류 발견 시 Document & E-Contract Agent", "권리구제 키워드는 Consumer Protection Agent"],
    guardrails: ["심사 가능/불가 표현 금지", "금리·한도 수치 생성 금지"],
    metrics: ["pendingDocuments", "slaCompliance"],
    queue: 8,
  }),
  jbwcAgent({
    id: "jbwc-auto",
    agentKey: "auto-finance-ops-agent",
    name: "Auto Finance Ops Agent",
    displayName: "자동차금융 운영 에이전트",
    domain: "autoFinance",
    description: "중고차대출·자동차리스·장기렌터카 운영과 차량/계약 참조 케이스를 담당한다.",
    responsibilities: ["자동차금융 운영 큐", "리스/렌트 반환 흐름", "차량관리 agent 연계"],
    triggerExamples: ["자동차리스 반환 일정", "중고차대출 계약 문의"],
    allowedActions: ["운영 단계 표시", "차량 태스크 생성", "문서 체크리스트"],
    dbReads: ["ops_cases", "vehicle_lifecycle_tasks", "document_cases"],
    dbWrites: ["ops_tasks", "vehicle_lifecycle_tasks", "audit_logs"],
    handoffRules: ["vehicleRefId가 있으면 Vehicle Lifecycle Agent", "전자약정 누락은 Document Agent"],
    guardrails: ["실제 계약 변경/해지 실행 금지"],
    metrics: ["vehicleTaskOpen", "returnTaskSla"],
    queue: 7,
  }),
  jbwcAgent({
    id: "jbwc-mortgage",
    agentKey: "mortgage-secured-loan-agent",
    name: "Mortgage & Secured Loan Agent",
    displayName: "담보금융 운영 에이전트",
    domain: "mortgageSecured",
    description: "주택담보대출·담보성 운영 케이스의 서류/담보 운영 상태를 관리한다.",
    responsibilities: ["담보 관련 서류 점검", "운영 체크리스트", "외부 데이터 대기 표시"],
    triggerExamples: ["주택담보대출 등기 서류 상태", "담보성 운영 케이스 자료 대기"],
    allowedActions: ["문서 상태 요약", "운영 task 생성"],
    dbReads: ["ops_cases", "document_cases", "external_connectors"],
    dbWrites: ["document_cases", "ops_tasks", "audit_logs"],
    handoffRules: ["자료 누락은 Document Agent", "규정/약관 이슈는 Compliance Agent"],
    guardrails: ["LTV/DSR 산정 금지", "담보가치 판단 금지"],
    metrics: ["waitingExternalData", "documentCompleteness"],
    queue: 3,
  }),
  jbwcAgent({
    id: "jbwc-enterprise",
    agentKey: "enterprise-finance-agent",
    name: "Enterprise Finance Agent",
    displayName: "기업금융 운영 에이전트",
    domain: "enterpriseFinance",
    description: "PF·Mezzanine·신기술금융·PEF·M&A 인수금융·구조화금융 운영 파이프라인을 관리한다.",
    responsibilities: ["기업금융 자료 수집", "딜 운영 상태", "내부 검토 플래그"],
    triggerExamples: ["PF대출 자료 수집 현황", "구조화금융 승인 대기"],
    allowedActions: ["자료 완결률 집계", "승인 대기 등록", "리스크 플래그"],
    dbReads: ["ops_cases", "approvals", "audit_logs"],
    dbWrites: ["approvals", "ops_tasks", "ai_recommendations"],
    handoffRules: ["risk high/critical은 승인함", "약관/내부통제는 Compliance Agent"],
    guardrails: ["투자 판단·신용등급 판단 금지"],
    metrics: ["pipelineWaiting", "approvalPending"],
    queue: 4,
  }),
  jbwcAgent({
    id: "jbwc-care",
    agentKey: "customer-management-agent",
    name: "Customer Management Agent",
    displayName: "고객관리 운영 에이전트",
    domain: "customerManagement",
    description: "내 금융관리, 대출관리, 결제일 변경, 중도상환, 자동이체, 가상계좌, 계약 변경 운영을 담당한다.",
    responsibilities: ["고객관리 요청 라우팅", "계약/결제 운영 큐", "민원 전환 감지"],
    triggerExamples: ["결제일 변경", "중도상환 문의", "계약승계 요청"],
    allowedActions: ["운영 큐 등록", "안내 초안 작성"],
    dbReads: ["ops_cases", "customer_support_cases"],
    dbWrites: ["customer_support_cases", "ops_tasks", "audit_logs"],
    handoffRules: ["불만/민원 키워드는 Complaint Agent", "권리구제 키워드는 Consumer Protection Agent"],
    guardrails: ["실제 계좌/결제/자동이체 변경 금지"],
    metrics: ["requestQueue", "repeatContactRate"],
    queue: 6,
  }),
  jbwcAgent({
    id: "jbwc-doc",
    agentKey: "document-econtract-agent",
    name: "Document & E-Contract Agent",
    displayName: "문서·전자약정 에이전트",
    domain: "documentContract",
    description: "온라인 서류등록·전자약정·누락서류·문서 검토 운영 상태를 관리한다.",
    responsibilities: ["문서 케이스 생성", "누락서류 확인", "전자약정 상태 표시"],
    triggerExamples: ["전자약정 미완료", "누락서류 확인"],
    allowedActions: ["문서 상태 mock 갱신", "보완 요청 초안"],
    dbReads: ["document_cases", "ops_cases"],
    dbWrites: ["document_cases", "ops_tasks", "audit_logs"],
    handoffRules: ["원본 진위 의심은 담당자 검토", "소비자보호 설명 이슈는 Consumer Protection Agent"],
    guardrails: ["실제 전자약정 체결 금지", "문서 원본 진위 확정 금지"],
    metrics: ["pendingDocuments", "needsReviewDocuments"],
    status: "needsReview",
    queue: 5,
  }),
  jbwcAgent({
    id: "jbwc-vehicle",
    agentKey: "vehicle-lifecycle-agent",
    name: "Vehicle Lifecycle Agent",
    displayName: "차량관리 에이전트",
    domain: "vehicleLifecycle",
    description: "정비이력·추가 운전자·리콜·과태료/범칙금·차량 반환/인수·자동차 매각정보 태스크를 관리한다.",
    responsibilities: ["차량 태스크", "리콜/과태료 큐", "반환/인수 일정"],
    triggerExamples: ["차량 반환 점검", "리콜 안내", "과태료 처리"],
    allowedActions: ["차량 task 생성", "상태 표시"],
    dbReads: ["vehicle_lifecycle_tasks", "ops_cases"],
    dbWrites: ["vehicle_lifecycle_tasks", "ops_tasks", "audit_logs"],
    handoffRules: ["금융상품 조건은 Auto Finance Agent", "민원화되면 Complaint Agent"],
    guardrails: ["실차 처분/매각 실행 금지"],
    metrics: ["openVehicleTasks", "overdueVehicleTasks"],
    queue: 4,
  }),
  jbwcAgent({
    id: "jbwc-protect",
    agentKey: "consumer-protection-agent",
    name: "Consumer Protection Agent",
    displayName: "소비자보호 에이전트",
    domain: "consumerProtection",
    description: "청약철회권·금리인하요구권·위법계약해지권·자료열람요구권·전자민원 검토를 담당한다.",
    responsibilities: ["소비자 권리 분류", "human review 플래그", "권리구제 체크리스트"],
    triggerExamples: ["금리인하요구권 문의", "청약철회 요청", "위법계약해지권"],
    allowedActions: ["권리 유형 분류", "검토 체크리스트 작성"],
    dbReads: ["consumer_protection_reviews", "customer_support_cases", "ops_cases"],
    dbWrites: ["consumer_protection_reviews", "approvals", "audit_logs"],
    handoffRules: ["모든 최종 안내는 담당자 승인", "민원 동반 시 Complaint Agent"],
    guardrails: ["권리 인정/거부 확정 금지", "항상 담당자 검토 필요 표시"],
    metrics: ["reviewOpen", "humanReviewRate"],
    status: "needsReview",
    queue: 4,
  }),
  jbwcAgent({
    id: "jbwc-fds",
    agentKey: "fds-voice-phishing-response-agent",
    name: "FDS & Voice Phishing Response Agent",
    displayName: "FDS·보이스피싱 대응 에이전트",
    domain: "fdsVoicePhishing",
    description: "FDS, 보이스피싱, 피싱사기, 비대면 금융사고, 이상거래 징후를 분류하고 사람 에스컬레이션을 생성한다.",
    responsibilities: ["FDS alert 생성", "고위험 분류", "human escalation"],
    triggerExamples: ["보이스피싱 의심", "이상거래 징후", "비대면 금융사고"],
    allowedActions: ["경보 분류", "에스컬레이션 기록"],
    dbReads: ["fds_alerts", "ops_cases", "customer_support_cases"],
    dbWrites: ["fds_alerts", "agent_handoffs", "audit_logs", "approvals"],
    handoffRules: ["voicePhishingAlert/suspiciousTransaction은 즉시 escalated", "critical은 자동 완료 금지"],
    guardrails: ["자동 차단/지급정지/종결 금지", "사람 검토 필수"],
    metrics: ["criticalAlerts", "escalationLatency"],
    status: "escalated",
    queue: 3,
  }),
  jbwcAgent({
    id: "jbwc-complaint",
    agentKey: "complaint-contact-center-agent",
    name: "Complaint & Contact Center Agent",
    displayName: "민원·고객센터 에이전트",
    domain: "complaintContactCenter",
    description: "1:1 문의·FAQ·상담전화·영업점 안내·고객제안·민원처리 케이스를 관리한다.",
    responsibilities: ["문의 분류", "민원 처리 상태", "고객센터 큐"],
    triggerExamples: ["1:1 문의", "상담전화 요청", "민원처리"],
    allowedActions: ["문의 큐 등록", "담당팀 추천"],
    dbReads: ["customer_support_cases", "ops_cases"],
    dbWrites: ["customer_support_cases", "ops_tasks", "audit_logs"],
    handoffRules: ["민원/권리구제/금리인하/청약철회/위법계약 키워드는 Consumer Protection Agent"],
    guardrails: ["고객 직접 발송 금지", "최종 답변은 담당자 승인"],
    metrics: ["openComplaints", "firstResponseSla"],
    queue: 6,
  }),
  jbwcAgent({
    id: "jbwc-compliance",
    agentKey: "compliance-internal-control-agent",
    name: "Compliance & Internal Control Agent",
    displayName: "내부통제 에이전트",
    domain: "complianceInternalControl",
    description: "개인정보보호, 개인신용정보보호, 채권추심절차, 위탁제휴업체, 약관/정책, 내부통제 점검을 담당한다.",
    responsibilities: ["정책 점검", "권한 검토", "내부통제 audit"],
    triggerExamples: ["개인정보보호 점검", "채권추심절차 검토", "위탁제휴업체 점검"],
    allowedActions: ["점검 리포트 초안", "reviewRequired 기록"],
    dbReads: ["privacy_permission_checks", "role_assignments", "audit_logs"],
    dbWrites: ["privacy_permission_checks", "audit_logs", "approvals"],
    handoffRules: ["권한 변경은 approval/reviewRequired", "정책 확정은 담당자"],
    guardrails: ["법규 확정 해석 금지", "개인정보 원문 출력 금지"],
    metrics: ["openPolicyChecks", "reviewRequiredRoles"],
    queue: 2,
  }),
  jbwcAgent({
    id: "jbwc-metrics",
    agentKey: "ops-metrics-qa-agent",
    name: "Ops Metrics & QA Agent",
    displayName: "운영 지표·QA 에이전트",
    domain: "metrics",
    productTypes: ["KPI", "SLA", "QA"],
    description: "SLA 임박, 자동화 처리율, human review 비율, handoff 품질을 집계한다.",
    responsibilities: ["KPI 집계", "SLA 임박 기록", "QA 리포트"],
    triggerExamples: ["SLA 임박 케이스", "자동화 처리율 집계"],
    allowedActions: ["mock KPI 집계", "QA 메모 생성"],
    dbReads: ["kpi_snapshots", "ops_tasks", "agent_runs"],
    dbWrites: ["kpi_snapshots", "audit_logs"],
    handoffRules: ["SLA 임박은 담당 agent와 Orchestrator에 기록"],
    guardrails: ["실제 운영 성과로 표현 금지"],
    metrics: ["automationRate", "humanReviewRatio", "slaNearDue"],
    queue: 0,
  }),
];

/* Skills — manifest 표준 계층용 업무 단위 (역할 하네스와 구조만 공유, 내용 독립) */
const jbWooriCapitalSkills = [
  { key: "ops-triage", label: "운영 건 분류·라우팅", agentIds: ["jbwc-orchestrator"], inputs: ["domain", "riskLevel"], outputs: ["recommendedAgent", "initialStatus"] },
  { key: "document-status-check", label: "문서·전자약정 상태 점검", agentIds: ["jbwc-doc"], inputs: ["caseId"], outputs: ["pendingDocuments"] },
  { key: "vehicle-task-runner", label: "차량 태스크 생성·추적", agentIds: ["jbwc-vehicle", "jbwc-auto"], inputs: ["vehicleRefId"], outputs: ["taskId"] },
  { key: "fds-escalation", label: "FDS 고위험 에스컬레이션", agentIds: ["jbwc-fds"], inputs: ["alertType", "severity"], outputs: ["escalation", "approvalRequest"] },
  { key: "consumer-right-review", label: "소비자 권리 검토 플로우", agentIds: ["jbwc-protect"], inputs: ["reviewType"], outputs: ["checklist", "reviewFlag"] },
  { key: "ops-audit-writer", label: "운영 감사 기록", agentIds: ["jbwc-compliance"], inputs: ["action", "targetId"], outputs: ["auditId"] },
];

const jbWooriCapitalOpsHarness = {
  id: "jbWooriCapitalOpsHarness",
  name: "JB우리캐피탈 운영 에이전트 하네스",
  affiliateId: "jb-woori-capital",
  displayName: "JB우리캐피탈",
  purpose: "캐피탈/여신/자동차금융/고객보호 운영 건을 도메인 전용 agent와 사람이 함께 처리하는 내부 운영 하네스",
  policy: [
    "실제 대출 승인/거절·금리/한도 산정·신용평가 금지",
    "실제 개인정보 원문 조회/저장/전송 금지",
    "실제 계좌/결제/자동이체 변경 및 전자약정 체결 금지",
    "FDS·보이스피싱 high/critical 자동 종결 금지 — 사람 에스컬레이션 필수",
    "소비자보호·법규·권리구제 답변은 담당자 검토 필요",
    "모든 AI output은 내부 운영 참고용",
  ],
  agents: jbWooriCapitalAgents,
  skills: jbWooriCapitalSkills,
};

const jbWooriCapitalRoutingRules = {
  personalFinance: "jbwc-personal",
  autoFinance: "jbwc-auto",
  mortgageSecured: "jbwc-mortgage",
  enterpriseFinance: "jbwc-enterprise",
  customerManagement: "jbwc-care",
  documentContract: "jbwc-doc",
  vehicleLifecycle: "jbwc-vehicle",
  consumerProtection: "jbwc-protect",
  fdsVoicePhishing: "jbwc-fds",
  complaintContactCenter: "jbwc-complaint",
  complianceInternalControl: "jbwc-compliance",
};

const jbWooriCapitalSampleRequests = [
  { key: "lease-return", text: "자동차리스 계약 반환 절차 문의가 들어왔어", domain: "autoFinance", productType: "자동차리스", caseId: "CASE-JBWC-0001", vehicleRefId: "VEH-REF-7301" },
  { key: "refi-docs", text: "대환대출 신청 고객의 서류가 누락됐는지 확인해줘", domain: "documentContract", productType: "누락서류 확인", caseId: "CASE-JBWC-0002" },
  { key: "phishing", text: "보이스피싱 의심 민원이 접수됐어", domain: "fdsVoicePhishing", productType: "보이스피싱 의심", caseId: "CASE-JBWC-0004", riskLevel: "high" },
  { key: "rate-cut", text: "금리인하요구권 문의를 소비자보호 기준으로 분류해줘", domain: "consumerProtection", productType: "금리인하요구권", caseId: "CASE-JBWC-0008" },
  { key: "prepay", text: "중도상환 문의를 고객관리 업무로 라우팅해줘", domain: "customerManagement", productType: "중도상환", caseId: "CASE-JBWC-0012" },
];

function routeJbWooriCapitalCase(input) {
  const text = `${input.title || ""} ${input.description || ""} ${input.productType || ""}`.toLowerCase();
  const domain = input.domain || "customerManagement";
  const agentId = jbWooriCapitalRoutingRules[domain] || "jbwc-orchestrator";
  const handoffs = [];
  const checklist = ["익명 참조 ID 확인", "담당팀 배정", "감사 로그 기록"];
  const requiredDocuments = [];
  let initialStatus = "triaged";
  let riskLevel = input.riskLevel || "medium";
  let requiresHumanReview = Boolean(input.requiresHumanReview);
  let escalationRequired = false;

  if (["documentContract", "mortgageSecured"].includes(domain) || input.attachmentsExist) {
    requiredDocuments.push("운영 문서 상태 확인", "전자약정/서류 원본 담당자 검토");
    if (domain === "documentContract") initialStatus = "waitingDocuments";
    handoffs.push({ toAgentId: "jbwc-doc", reason: "문서/전자약정 상태 확인" });
  }
  if (domain === "vehicleLifecycle" || input.vehicleRefId) {
    initialStatus = "waitingVehicleTask";
    handoffs.push({ toAgentId: "jbwc-vehicle", reason: "차량/계약 참조 태스크" });
    checklist.push("차량 참조 ID 확인");
  }
  if (domain === "consumerProtection" || /민원|권리구제|금리인하|청약철회|위법계약|자료열람/.test(text)) {
    requiresHumanReview = true;
    initialStatus = "pendingCustomerProtectionReview";
    handoffs.push({ toAgentId: "jbwc-protect", reason: "소비자 권리/법규 검토" });
  }
  if (domain === "fdsVoicePhishing" || /보이스피싱|피싱|이상거래|suspicious|voicephishing/.test(text)) {
    requiresHumanReview = true;
    escalationRequired = true;
    riskLevel = riskLevel === "critical" ? "critical" : "high";
    initialStatus = "pendingFdsEscalation";
    handoffs.push({ toAgentId: "jbwc-fds", reason: "FDS/보이스피싱 고위험 에스컬레이션" });
  }
  if (domain === "complianceInternalControl" || /권한|개인정보|개인신용정보|추심|약관|정책/.test(text)) {
    requiresHumanReview = true;
    handoffs.push({ toAgentId: "jbwc-compliance", reason: "내부통제/정책 검토" });
  }
  if (["high", "critical"].includes(riskLevel)) {
    requiresHumanReview = true;
    if (!["pendingFdsEscalation", "pendingCustomerProtectionReview"].includes(initialStatus)) initialStatus = "pendingApproval";
  }
  if (input.dueAt) checklist.push("SLA 기한 확인");
  if (input.priority === "urgent") handoffs.push({ toAgentId: "jbwc-metrics", reason: "SLA 임박 운영 품질 기록" });

  return {
    recommendedAgent: agentId,
    recommendedTeam: (JBWC_DOMAIN_TAXONOMY[domain] || {}).team || "운영팀",
    initialStatus,
    riskOverride: riskLevel,
    slaDueAt: input.dueAt || new Date().toISOString().slice(0, 10),
    checklist,
    requiredDocuments,
    requiresHumanReview,
    escalationRequired,
    nextTasks: checklist.map((item) => `${item} · ${JBWC_DOMAIN_TAXONOMY[domain]?.label || domain}`),
    handoffs,
  };
}
