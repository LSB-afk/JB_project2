/* 전세사기 보호 담당자 역할 하네스 — 전용 agent registry.
   메인 agents 배열/계열사 registry를 alias하지 않고 전세보호 업무 기준으로 독립 정의한다.
   모든 AI output은 "내부 운영 참고용 · 담당자 검토 필요" 표시를 전제로 한다. */

const JPO_COMMON_BLOCKED_ACTIONS = [
  "전세사기 여부 확정 판단 금지",
  "피해자 결정 가능 여부 확정 금지",
  "보증보험 가입 가능 확정 금지",
  "법률 자문 확정 금지",
  "대출 승인/거절/금리/한도 판단 금지",
  "실제 신청 제출/대행 금지",
  "실제 고객 개인정보 원문 저장/출력 금지",
  "고객 대상 자동 발송 금지",
  "high/critical risk 자동 종결 금지",
];

function jpoAgent(config) {
  return {
    id: config.id,
    agentKey: config.agentKey,
    name: config.name,
    displayName: config.displayName || config.name,
    description: config.description,
    domain: config.domain,
    responsibilities: config.responsibilities,
    triggerExamples: config.triggerExamples,
    inputSchema: config.inputSchema || ["caseId", "taskType", "riskSignals", "riskLevel", "description"],
    outputSchema: config.outputSchema || ["recommendedStatus", "summary", "checklist", "requiresHumanReview", "handoffs"],
    allowedActions: config.allowedActions,
    blockedActions: JPO_COMMON_BLOCKED_ACTIONS.concat(config.blockedActions || []),
    dbReads: config.dbReads,
    dbWrites: config.dbWrites,
    handoffRules: config.handoffRules,
    guardrails: (config.guardrails || []).concat(["모든 출력은 내부 운영 참고용", "담당자 검토 필요 표시 유지"]),
    metrics: config.metrics,
    status: config.status || "active",
    queue: config.queue || 0,
  };
}

const jeonseProtectionAgents = [
  jpoAgent({
    id: "jpo-orchestrator",
    agentKey: "jeonse-triage-orchestrator",
    name: "Jeonse Triage Orchestrator",
    displayName: "전세보호 분류 오케스트레이터",
    domain: "orchestration",
    description: "전세보호 운영 건을 업무 유형·위험 신호·SLA 기준으로 분류하고 전용 에이전트로 라우팅한다.",
    responsibilities: ["업무 유형 분류", "위험 신호 해석", "초기 상태 산정", "핸드오프 생성", "사람 검토 플래그"],
    triggerExamples: ["신규 전세보호 건 접수", "경매 개시 문의", "보증보험 검토 요청"],
    allowedActions: ["운영 분류", "에이전트 라우팅", "감사 로그 생성", "모의 큐 등록"],
    blockedActions: ["고객 대상 조치 직접 실행"],
    dbReads: ["jeonse_cases", "jeonse_tasks", "external_connectors"],
    dbWrites: ["jeonse_tasks", "audit_logs", "ai_analysis_requests", "agent_runs", "agent_handoffs"],
    handoffRules: ["위험 신호 키워드별 전용 에이전트", "high/critical은 사람 에스컬레이션", "고객 문안은 승인 대기"],
    guardrails: ["분류 확신이 낮으면 inReview로 보수적 배정"],
    metrics: ["routingAccuracy", "handoffLatency", "humanReviewRate"],
  }),
  jpoAgent({
    id: "jpo-price",
    agentKey: "price-ratio-market-signal-agent",
    name: "Price Ratio & Market Signal Agent",
    displayName: "전세가율·시세 신호 에이전트",
    domain: "priceRatio",
    description: "전세가율 구간, 주변 시세 대비 보증금 수준, 시세 하락 신호를 점검 항목으로 정리한다.",
    responsibilities: ["전세가율 구간 산정", "시세 비교 체크리스트", "고위험 구간 플래그"],
    triggerExamples: ["전세가율 과다 의심", "보증금이 시세보다 높은 것 같음"],
    allowedActions: ["전세가율 구간 표시", "시세 점검 체크리스트 작성"],
    blockedActions: ["시세 확정 감정 금지"],
    dbReads: ["jeonse_cases", "jeonse_price_ratio_checks", "external_connectors"],
    dbWrites: ["jeonse_price_ratio_checks", "jeonse_tasks", "audit_logs"],
    handoffRules: ["권리관계 신호 동반 시 Registry Rights Agent", "보증 요건 확인은 Guarantee & HUG Agent"],
    guardrails: ["구간(band) 표기만 사용, 확정 가격 판단 금지"],
    metrics: ["highRatioOpen", "checkLeadTime"],
    queue: 5,
  }),
  jpoAgent({
    id: "jpo-registry",
    agentKey: "registry-rights-agent",
    name: "Registry Rights Agent",
    displayName: "권리관계·등기 점검 에이전트",
    domain: "registryRights",
    description: "근저당·압류·가압류·신탁등기·소유권 이전 등 권리관계 위험 신호를 점검 큐로 정리한다.",
    responsibilities: ["등기 이슈 분류", "외부자료 대기 표시", "권리관계 체크리스트"],
    triggerExamples: ["근저당 의심", "신탁등기 확인 요청"],
    allowedActions: ["이슈 유형 분류", "점검 태스크 생성"],
    blockedActions: ["권리관계 법적 효력 확정 금지"],
    dbReads: ["jeonse_registry_checks", "jeonse_cases"],
    dbWrites: ["jeonse_registry_checks", "jeonse_tasks", "audit_logs"],
    handoffRules: ["경매 개시 신호는 Auction/Public Sale Support Agent", "법률 쟁점은 Legal/Psychological Referral Agent"],
    guardrails: ["등기 원문 저장 금지 — 이슈 유형과 참조 ID만"],
    metrics: ["openRegistryIssues", "externalDataWaits"],
    queue: 4,
  }),
  jpoAgent({
    id: "jpo-guarantee",
    agentKey: "guarantee-hug-support-agent",
    name: "Guarantee & HUG Support Agent",
    displayName: "보증보험·HUG 연계 에이전트",
    domain: "guaranteeHug",
    description: "보증보험 가입요건·HUG 전세피해지원 프로그램 검토 항목을 정리하고 담당자 검토로 넘긴다.",
    responsibilities: ["가입요건 체크리스트", "지원 프로그램 후보 정리", "검토 대기 등록"],
    triggerExamples: ["보증보험 가입 가능 여부 검토", "HUG 지원 프로그램 안내 요청"],
    allowedActions: ["요건 체크리스트 작성", "프로그램 후보 나열"],
    blockedActions: ["가입 가능/불가 확정 금지"],
    dbReads: ["jeonse_guarantee_reviews", "jeonse_cases", "external_connectors"],
    dbWrites: ["jeonse_guarantee_reviews", "jeonse_tasks", "audit_logs", "approvals"],
    handoffRules: ["모든 결과는 담당자 검토 필요", "피해자 결정 연계 시 Victim Decision Checklist Agent"],
    guardrails: ["프로그램은 '안내 후보'로만 표현 — 최신 기준 담당자 확인 필요"],
    metrics: ["reviewsPending", "programCandidates"],
    status: "needsReview",
    queue: 3,
  }),
  jpoAgent({
    id: "jpo-auction",
    agentKey: "auction-public-sale-support-agent",
    name: "Auction/Public Sale Support Agent",
    displayName: "경공매·피해지원 에이전트",
    domain: "auctionSupport",
    description: "경매·공매 진행 신호를 감지하고 우선매수·퇴거 유예 등 지원 안내 후보를 정리한다.",
    responsibilities: ["경공매 신호 분류", "지원 안내 후보 정리", "고위험 에스컬레이션"],
    triggerExamples: ["경매 개시 문의", "낙찰 이후 퇴거 걱정"],
    allowedActions: ["지원 절차 후보 정리", "에스컬레이션 기록"],
    blockedActions: ["우선매수권 행사 대행 금지"],
    dbReads: ["jeonse_referrals", "jeonse_cases", "jeonse_alerts"],
    dbWrites: ["jeonse_referrals", "jeonse_alerts", "audit_logs", "agent_handoffs"],
    handoffRules: ["피해자 결정 요건 확인은 Victim Decision Agent", "법률상담 필요 시 Referral Agent"],
    guardrails: ["경공매 케이스는 requiresHumanReview 고정"],
    metrics: ["auctionPending", "escalations"],
    status: "escalated",
    queue: 2,
  }),
  jpoAgent({
    id: "jpo-victim",
    agentKey: "victim-decision-checklist-agent",
    name: "Victim Decision Checklist Agent",
    displayName: "피해자 결정 체크리스트 에이전트",
    domain: "victimDecision",
    description: "전세사기피해자 결정 신청에 필요한 요건·서류 체크리스트를 정리한다. 신청 대행이 아니라 준비 보조다.",
    responsibilities: ["요건 체크리스트", "누락 서류 표시", "담당자 검토 대기 등록"],
    triggerExamples: ["피해자 결정 신청 준비", "특별법 요건 확인 요청"],
    allowedActions: ["체크리스트 작성", "검토 대기 등록"],
    blockedActions: ["결정 가능 여부 확정 금지", "신청서 제출 대행 금지"],
    dbReads: ["jeonse_victim_support_reviews", "jeonse_cases"],
    dbWrites: ["jeonse_victim_support_reviews", "jeonse_tasks", "audit_logs", "approvals"],
    handoffRules: ["모든 산출물은 담당자 검토 필요", "금융지원 문의는 Guarantee & HUG Agent"],
    guardrails: ["국토부 지원관리시스템 흐름은 참고용 — 실제 신청처럼 보이면 안 됨"],
    metrics: ["checklistOpen", "humanReviewRate"],
    status: "needsReview",
    queue: 3,
  }),
  jpoAgent({
    id: "jpo-referral",
    agentKey: "legal-psychological-referral-agent",
    name: "Legal/Psychological Referral Agent",
    displayName: "법률·심리 지원 연계 에이전트",
    domain: "supportReferrals",
    description: "법률상담·심리치료·긴급주거 등 외부 지원기관 연계 후보를 정리한다.",
    responsibilities: ["연계 후보 정리", "연계 대기 큐 관리"],
    triggerExamples: ["법률상담 연결 요청", "심리·주거 지원 문의"],
    allowedActions: ["기관 안내 후보 정리", "연계 대기 등록"],
    blockedActions: ["법률 자문 제공 금지"],
    dbReads: ["jeonse_referrals", "jeonse_cases"],
    dbWrites: ["jeonse_referrals", "jeonse_tasks", "audit_logs"],
    handoffRules: ["법률 쟁점 결과는 담당자 검토", "고객 안내 문구는 Tenant Communication Agent"],
    guardrails: ["'신청 대행'이 아니라 '안내 후보'로만 표현"],
    metrics: ["referralPending", "linkAcceptRate"],
    queue: 3,
  }),
  jpoAgent({
    id: "jpo-comms",
    agentKey: "tenant-communication-draft-agent",
    name: "Tenant Communication Draft Agent",
    displayName: "임차인 안내 문안 에이전트",
    domain: "communication",
    description: "임차인 대상 안내문·콜백 스크립트·문자 초안을 작성한다. 발송은 반드시 승인 대기.",
    responsibilities: ["안내 문안 초안", "콜백 스크립트 초안", "승인 대기 등록"],
    triggerExamples: ["임차인 안내 문자 초안", "콜백 스크립트 요청"],
    allowedActions: ["문안 초안 작성", "승인 요청 생성"],
    blockedActions: ["자동 발송 금지"],
    dbReads: ["jeonse_cases", "ai_recommendations"],
    dbWrites: ["ai_recommendations", "approvals", "audit_logs"],
    handoffRules: ["모든 문안은 approval pending", "개인정보 포함 여부는 Privacy & Evidence Redaction Agent 점검"],
    guardrails: ["문안에 실명/주소 원문/전화번호 삽입 금지 — 익명 Ref만"],
    metrics: ["draftsPendingApproval", "revisionRate"],
    queue: 2,
  }),
  jpoAgent({
    id: "jpo-privacy",
    agentKey: "privacy-evidence-redaction-agent",
    name: "Privacy & Evidence Redaction Agent",
    displayName: "개인정보·증빙 마스킹 에이전트",
    domain: "privacy",
    description: "화면/로그/문안의 개인정보 노출 위험을 점검하고 마스킹·익명 Ref 원칙 위반을 플래그한다.",
    responsibilities: ["마스킹 점검", "외부반출 점검", "접근권한 검토 플래그"],
    triggerExamples: ["증빙 외부 공유 요청", "주소 원문 포함 의심"],
    allowedActions: ["마스킹 점검 리포트", "reviewRequired 기록"],
    blockedActions: ["개인정보 원문 복원 금지"],
    dbReads: ["privacy_permission_checks", "audit_logs"],
    dbWrites: ["privacy_permission_checks", "audit_logs"],
    handoffRules: ["위반 의심은 Audit & Approval Agent"],
    guardrails: ["익명화된 Ref(TENANT-REF-* 등)만 허용"],
    metrics: ["openPrivacyChecks", "violationsFlagged"],
    queue: 1,
  }),
  jpoAgent({
    id: "jpo-audit",
    agentKey: "audit-approval-agent",
    name: "Audit & Approval Agent",
    displayName: "감사·승인 통제 에이전트",
    domain: "governance",
    description: "위험등급 변경·고객 안내·기관 연계의 승인 흐름과 감사 기록 무결성을 관리한다.",
    responsibilities: ["승인 큐 정리", "감사 기록 검토 플래그", "에스컬레이션 추적"],
    triggerExamples: ["위험 점수 변경 승인", "안내문 발송 승인"],
    allowedActions: ["승인 대기 등록", "감사 메모 생성"],
    blockedActions: ["자체 승인 금지 — 승인 주체는 항상 사람"],
    dbReads: ["approvals", "audit_logs", "agent_runs"],
    dbWrites: ["approvals", "audit_logs"],
    handoffRules: ["미승인 안내문 발송 시도는 차단 플래그"],
    guardrails: ["감사 기록 삭제/수정 금지 — append-only"],
    metrics: ["pendingApprovals", "auditReviewRate"],
    queue: 2,
  }),
];

/* Skills — agent가 수행하는 재사용 가능한 업무 단위 (ECC 계층) */
const jeonseProtectionSkills = [
  { key: "pre-contract-risk-check", label: "계약 전 위험 점검", agentIds: ["jpo-orchestrator", "jpo-price"], inputs: ["riskSignals", "depositAmountBand"], outputs: ["checklist", "riskBand"] },
  { key: "price-ratio-check", label: "전세가율·시세 구간 점검", agentIds: ["jpo-price"], inputs: ["depositAmountBand", "propertyRefId"], outputs: ["ratioBand", "checklist"] },
  { key: "registry-rights-review", label: "권리관계·등기 이슈 분류", agentIds: ["jpo-registry"], inputs: ["propertyRefId", "riskSignals"], outputs: ["issueType", "nextTasks"] },
  { key: "guarantee-eligibility-checklist", label: "보증 가입요건 체크리스트", agentIds: ["jpo-guarantee"], inputs: ["contractRefId", "depositAmountBand"], outputs: ["checklist", "supportProgramCandidates"] },
  { key: "victim-support-checklist", label: "피해자 결정 신청 준비 체크리스트", agentIds: ["jpo-victim"], inputs: ["caseId"], outputs: ["checklist", "requiredDocuments"] },
  { key: "tenant-message-draft", label: "임차인 안내 문안 초안", agentIds: ["jpo-comms"], inputs: ["caseId", "context"], outputs: ["draftText", "approvalRequest"] },
  { key: "privacy-redaction", label: "개인정보·증빙 마스킹 점검", agentIds: ["jpo-privacy"], inputs: ["text", "attachmentsRef"], outputs: ["violations", "reviewFlag"] },
  { key: "approval-packet-builder", label: "검토 패킷 구성(익명 Ref)", agentIds: ["jpo-audit"], inputs: ["caseId"], outputs: ["reviewPacket"] },
  { key: "audit-log-writer", label: "감사 로그 기록", agentIds: ["jpo-audit", "jpo-orchestrator"], inputs: ["action", "targetId"], outputs: ["auditId"] },
];

const jeonseFraudProtectionHarness = {
  id: "jeonseFraudProtectionHarness",
  name: "전세사기 보호 업무지원 하네스",
  roleKey: JPO_ROLE_KEY,
  workspaceId: JPO_WORKSPACE_ID,
  displayName: JPO_DISPLAY_NAME,
  purpose: "계약 전 위험 신호·피해자 지원·담당자 검토를 전세보호 전용 에이전트와 사람이 함께 처리하는 역할 하네스",
  policy: [
    "전세사기 여부·피해자 결정·보증 가입 가능성·법률 판단 확정 금지",
    "실제 신청 제출/대행 금지 — 공식 시스템 안내 후보만 제시",
    "실제 고객 개인정보 원문 저장/출력 금지 — 익명 Ref만 사용",
    "고객 대상 발송은 반드시 담당자 승인(approval pending) 후",
    "high/critical 위험 자동 종결 금지 — 사람 에스컬레이션 필수",
    "모든 AI output은 내부 운영 참고용 · 담당자 검토 필요",
    "법령·지원요건은 변동 가능 — 최신 기준 담당자 확인 필요 표시",
  ],
  agents: jeonseProtectionAgents,
  skills: jeonseProtectionSkills,
};

const jeonseProtectionRoutingRules = {
  preContractRisk: "jpo-price",
  priceRatio: "jpo-price",
  registryRights: "jpo-registry",
  guaranteeHug: "jpo-guarantee",
  auctionSupport: "jpo-auction",
  victimDecision: "jpo-victim",
  legalReferral: "jpo-referral",
  careReferral: "jpo-referral",
  vulnerableTenant: "jpo-referral",
  urgentAlert: "jpo-auction",
};

const jeonseProtectionSampleRequests = [
  { key: "ratio-check", text: "계약 전인데 전세가율이 과도한지 점검해줘", taskType: "priceRatio", riskSignals: ["ratioHigh"], caseId: "JEONSE-CASE-0001" },
  { key: "registry-check", text: "등기부에 근저당이 잡혀 있는 것 같아, 권리관계를 점검해줘", taskType: "registryRights", riskSignals: ["lienSuspect"], caseId: "JEONSE-CASE-0005" },
  { key: "hug-review", text: "HUG 보증보험 가입요건 검토 항목을 정리해줘", taskType: "guaranteeHug", riskSignals: ["guaranteeUncertain"], caseId: "JEONSE-CASE-0007" },
  { key: "auction-alarm", text: "임차 주택에 경매가 개시됐다는 문의가 접수됐어", taskType: "auctionSupport", riskSignals: ["auctionRisk"], riskLevel: "high", caseId: "JEONSE-CASE-0009" },
  { key: "victim-checklist", text: "피해자 결정 신청에 필요한 체크리스트를 만들어줘", taskType: "victimDecision", riskSignals: ["landlordMultiHome"], caseId: "JEONSE-CASE-0011" },
  { key: "tenant-notice", text: "임차인에게 보낼 안내 문자 초안을 만들어줘", taskType: "careReferral", commsDraft: true, riskSignals: [], caseId: "JEONSE-CASE-0013" },
];

/* 오케스트레이터 라우팅 — 위험 신호/키워드 → 전용 에이전트, special rule 포함 */
function routeJeonseProtectionCase(input) {
  const text = `${input.title || ""} ${input.description || ""} ${(input.riskSignals || []).map((key) => JPO_RISK_SIGNALS[key] || key).join(" ")}`.toLowerCase();
  const taskType = input.taskType || "preContractRisk";
  const taxonomy = JPO_TASK_TAXONOMY[taskType] || JPO_TASK_TAXONOMY.preContractRisk;
  const signals = new Set(input.riskSignals || []);
  const handoffs = [];
  const checklist = ["익명 Ref(임차인/계약/물건) 확인", "담당팀 배정", "감사 로그 기록"];
  const requiredDocuments = [];
  const externalReferenceLinks = [];
  const supportProgramCandidates = [];
  let agentId = jeonseProtectionRoutingRules[taskType] || "jpo-orchestrator";
  let initialStatus = taxonomy.initialStatus || "inReview";
  let riskLevel = input.riskLevel || "medium";
  let requiresHumanReview = Boolean(input.requiresHumanReview) || Boolean(taxonomy.requiresHumanReview);
  let escalationRequired = Boolean(taxonomy.escalationRequired);

  const pushHandoff = (toAgentId, reason) => {
    if (!handoffs.some((item) => item.toAgentId === toAgentId)) handoffs.push({ toAgentId, reason });
  };

  if (signals.has("ratioHigh") || signals.has("depositOverMarket") || /전세가율|시세|보증금 과다/.test(text)) {
    pushHandoff("jpo-price", "전세가율·시세 신호 점검");
    requiredDocuments.push("전세가율 구간 산정표(구간값)");
  }
  if (signals.has("lienSuspect") || signals.has("trustRegistry") || /근저당|압류|가압류|신탁|소유권 이전|등기/.test(text)) {
    pushHandoff("jpo-registry", "권리관계·등기 이슈 점검");
    requiredDocuments.push("등기 이슈 유형 분류(원문 저장 금지)");
    if (initialStatus === "inReview") initialStatus = "waitingExternalData";
  }
  if (signals.has("guaranteeUncertain") || /보증보험|hug|허그|전세피해지원센터|보증/.test(text)) {
    pushHandoff("jpo-guarantee", "보증보험·HUG 요건 검토");
    requiresHumanReview = true;
    supportProgramCandidates.push("HUG 전세피해지원 프로그램(안내 후보)");
    externalReferenceLinks.push("HUG 전세피해지원센터 (khug.or.kr)");
  }
  if (signals.has("auctionRisk") || /경매|공매|우선매수|낙찰|퇴거/.test(text)) {
    pushHandoff("jpo-auction", "경공매 진행 신호 — 지원 안내 후보 정리");
    requiresHumanReview = true;
    riskLevel = riskLevel === "critical" ? "critical" : "high";
    supportProgramCandidates.push("우선매수·퇴거 유예 지원(안내 후보)");
  }
  if (/피해자 결정|특별법|신청서류|결정 신청/.test(text) || taskType === "victimDecision") {
    pushHandoff("jpo-victim", "피해자 결정 요건 체크리스트");
    requiresHumanReview = true;
    externalReferenceLinks.push("국토교통부 전세사기피해자 지원관리시스템 (molit.go.kr)");
    externalReferenceLinks.push("전세사기피해자 지원 및 주거안정에 관한 특별법 (law.go.kr)");
    requiredDocuments.push("피해자 결정 신청 서류 체크리스트(준비 보조)");
  }
  if (/법률상담|법률|심리치료|심리상담|긴급주거|지원센터/.test(text) || ["legalReferral", "careReferral"].includes(taskType)) {
    pushHandoff("jpo-referral", "법률·심리·주거 지원 연계 후보");
    if (/법률/.test(text) || taskType === "legalReferral") requiresHumanReview = true;
    supportProgramCandidates.push("법률상담·심리·긴급주거 연계(안내 후보)");
  }
  if (input.commsDraft || /안내문|콜백|문자|고객 안내/.test(text)) {
    pushHandoff("jpo-comms", "임차인 안내 문안 초안 — 발송 전 승인 필수");
    initialStatus = "pendingApproval";
    requiresHumanReview = true;
  }
  if (/개인정보|주소 원문|증빙|외부반출|마스킹/.test(text)) {
    pushHandoff("jpo-privacy", "개인정보·증빙 마스킹 점검");
    requiresHumanReview = true;
  }
  if (signals.has("vulnerableTenant") || taskType === "vulnerableTenant") {
    requiresHumanReview = true;
    checklist.push("취약 임차인 우선 검토 플래그");
  }
  if (["high", "critical"].includes(riskLevel) || taskType === "urgentAlert") {
    requiresHumanReview = true;
    escalationRequired = true;
    if (!["pendingApproval", "pendingVictimReview", "pendingGuaranteeReview"].includes(initialStatus)) initialStatus = "escalated";
    pushHandoff("jpo-audit", "고위험 — 사람 에스컬레이션·승인 추적");
  }
  if (requiresHumanReview) pushHandoff("jpo-audit", "담당자 검토·승인 흐름 기록");
  if (input.dueAt) checklist.push("SLA 기한 확인");
  externalReferenceLinks.push("금융위원회 전세사기 피해자 금융지원 프로그램 (fsc.go.kr)");

  return {
    recommendedAgent: agentId,
    recommendedTeam: taxonomy.team || "전세보호팀",
    initialStatus,
    riskOverride: riskLevel,
    slaDueAt: input.dueAt || new Date().toISOString().slice(0, 10),
    checklist,
    requiredDocuments,
    externalReferenceLinks: [...new Set(externalReferenceLinks)],
    supportProgramCandidates: [...new Set(supportProgramCandidates)],
    requiresHumanReview,
    escalationRequired,
    nextTasks: checklist.map((item) => `${item} · ${taxonomy.label}`),
    handoffs,
  };
}
