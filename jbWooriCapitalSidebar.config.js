/* JB우리캐피탈 전용 route/sidebar/taxonomy config.
   Presentation shell은 공통 앱을 쓰지만 업무 메뉴·도메인·상품 분류는 메인 하네스와 분리한다. */

const JBWC_ROUTE_BASE = "/jb-woori-capital";

const JBWC_REQUIRED_ROUTES = [
  "/jb-woori-capital",
  "/jb-woori-capital/board",
  "/jb-woori-capital/cases",
  "/jb-woori-capital/cases/new",
  "/jb-woori-capital/cases/:caseId",
  "/jb-woori-capital/approvals",
  "/jb-woori-capital/audit-logs",
  "/jb-woori-capital/privacy-permissions",
  "/jb-woori-capital/integrations",
  "/jb-woori-capital/personal-finance",
  "/jb-woori-capital/auto-finance",
  "/jb-woori-capital/mortgage-secured",
  "/jb-woori-capital/enterprise-finance",
  "/jb-woori-capital/customer-management",
  "/jb-woori-capital/documents",
  "/jb-woori-capital/vehicle-lifecycle",
  "/jb-woori-capital/consumer-protection",
  "/jb-woori-capital/fds",
  "/jb-woori-capital/complaints",
  "/jb-woori-capital/agent-harness",
  "/jb-woori-capital/ai-analysis",
  "/jb-woori-capital/ai-assist",
  "/jb-woori-capital/inspections",
];

const JBWC_CASE_STATUSES = [
  "received",
  "triaged",
  "assigned",
  "waitingDocuments",
  "inOperationalReview",
  "pendingApproval",
  "pendingCustomerProtectionReview",
  "pendingFdsEscalation",
  "waitingExternalData",
  "waitingVehicleTask",
  "completed",
  "closed",
  "rejected",
  "escalated",
];

const JBWC_ACTIVE_CASE_STATUSES = [
  "received",
  "triaged",
  "assigned",
  "waitingDocuments",
  "inOperationalReview",
  "pendingApproval",
  "pendingCustomerProtectionReview",
  "pendingFdsEscalation",
  "waitingExternalData",
  "waitingVehicleTask",
  "escalated",
];

const JBWC_DOMAIN_TAXONOMY = {
  personalFinance: {
    label: "개인금융",
    routeView: "personal-finance",
    team: "개인금융팀",
    products: ["자동차담보대출", "개인신용대출", "대환대출", "내구재할부"],
  },
  autoFinance: {
    label: "자동차금융",
    routeView: "auto-finance",
    team: "자동차금융팀",
    products: ["중고차대출", "자동차리스", "장기렌터카"],
  },
  mortgageSecured: {
    label: "부동산/담보 금융",
    routeView: "mortgage-secured",
    team: "담보금융팀",
    products: ["주택담보대출", "담보성 운영 케이스"],
  },
  enterpriseFinance: {
    label: "기업금융",
    routeView: "enterprise-finance",
    team: "기업금융팀",
    products: ["일반대출", "PF대출", "Mezzanine", "신기술금융", "PEF", "M&A 인수금융", "구조화금융"],
  },
  customerManagement: {
    label: "내 금융관리",
    routeView: "customer-management",
    team: "고객관리팀",
    products: ["대출관리", "결제일 변경", "중도상환", "자동이체 변경", "가상계좌", "서류발급", "계약연장", "계약승계", "계약해지"],
  },
  documentContract: {
    label: "전자약정·서류",
    routeView: "documents",
    team: "문서팀",
    products: ["온라인 서류등록", "전자약정", "누락서류 확인", "문서 검토", "서류발급"],
  },
  vehicleLifecycle: {
    label: "차량관리",
    routeView: "vehicle-lifecycle",
    team: "차량관리팀",
    products: ["정비이력", "추가 운전자", "리콜", "과태료/범칙금", "차량 반환", "차량 인수", "자동차 매각정보"],
  },
  consumerProtection: {
    label: "금융소비자보호",
    routeView: "consumer-protection",
    team: "고객보호팀",
    products: ["청약철회권", "금리인하요구권", "위법계약해지권", "자료열람요구권", "전자민원", "상품공시 검토"],
  },
  fdsVoicePhishing: {
    label: "FDS/보이스피싱",
    routeView: "fds",
    team: "FDS팀",
    products: ["보이스피싱 의심", "피싱사기 예방", "비대면 금융사고", "이상거래 징후", "고위험 고객 연락 필요"],
  },
  complaintContactCenter: {
    label: "민원/고객센터",
    routeView: "complaints",
    team: "고객센터팀",
    products: ["1:1 문의", "FAQ 문의", "상담전화 요청", "영업점 안내", "고객제안", "민원처리"],
  },
  complianceInternalControl: {
    label: "내부통제",
    routeView: "privacy-permissions",
    team: "내부통제팀",
    products: ["개인정보보호", "개인신용정보보호", "채권추심절차", "위탁제휴업체 점검", "약관/정책 검토", "내부통제 점검"],
  },
};

const JBWC_VIEWS = {
  board: "업무 보드",
  approvals: "검토·승인함",
  "audit-logs": "감사 기록",
  "privacy-permissions": "개인정보·권한 정책",
  integrations: "외부 데이터 연결",
  cases: "전체 운영 건 조회",
  "cases-new": "신규 운영 건 접수",
  "ai-analysis": "AI 분석 요청",
  "ai-assist": "AI 업무지원",
  capabilities: "업무 기능",
  roles: "담당자/권한",
  inspections: "정기 점검",
  "consumer-protection": "금융소비자보호 점검",
  alerts: "긴급 알림",
  "personal-finance": "개인금융 운영",
  "auto-finance": "자동차금융 운영",
  "mortgage-secured": "부동산/담보 금융",
  "enterprise-finance": "기업금융 운영",
  "customer-management": "내 금융관리",
  documents: "전자약정·서류",
  "vehicle-lifecycle": "차량관리",
  fds: "FDS/보이스피싱",
  complaints: "민원/고객센터",
  "agent-harness": "운영 에이전트 하네스",
};

const JBWC_ROUTE_BY_VIEW = {
  board: `${JBWC_ROUTE_BASE}/board`,
  approvals: `${JBWC_ROUTE_BASE}/approvals`,
  "audit-logs": `${JBWC_ROUTE_BASE}/audit-logs`,
  "privacy-permissions": `${JBWC_ROUTE_BASE}/privacy-permissions`,
  integrations: `${JBWC_ROUTE_BASE}/integrations`,
  cases: `${JBWC_ROUTE_BASE}/cases`,
  "cases-new": `${JBWC_ROUTE_BASE}/cases/new`,
  "ai-analysis": `${JBWC_ROUTE_BASE}/ai-analysis`,
  "ai-assist": `${JBWC_ROUTE_BASE}/ai-assist`,
  capabilities: `${JBWC_ROUTE_BASE}/capabilities`,
  roles: `${JBWC_ROUTE_BASE}/roles`,
  inspections: `${JBWC_ROUTE_BASE}/inspections`,
  "personal-finance": `${JBWC_ROUTE_BASE}/personal-finance`,
  "auto-finance": `${JBWC_ROUTE_BASE}/auto-finance`,
  "mortgage-secured": `${JBWC_ROUTE_BASE}/mortgage-secured`,
  "enterprise-finance": `${JBWC_ROUTE_BASE}/enterprise-finance`,
  "customer-management": `${JBWC_ROUTE_BASE}/customer-management`,
  documents: `${JBWC_ROUTE_BASE}/documents`,
  "vehicle-lifecycle": `${JBWC_ROUTE_BASE}/vehicle-lifecycle`,
  "consumer-protection": `${JBWC_ROUTE_BASE}/consumer-protection`,
  fds: `${JBWC_ROUTE_BASE}/fds`,
  alerts: `${JBWC_ROUTE_BASE}/alerts`,
  complaints: `${JBWC_ROUTE_BASE}/complaints`,
  "agent-harness": `${JBWC_ROUTE_BASE}/agent-harness`,
};

const JBWC_VIEW_BY_ROUTE = Object.fromEntries(Object.entries(JBWC_ROUTE_BY_VIEW).map(([view, route]) => [route, view]));

const jbwcNavigation = [
  { section: "오늘 처리할 일", items: [
    { id: "board", icon: "layout-dashboard", label: "업무 보드", description: "오늘 확인", countKey: "board" },
    { id: "approvals", icon: "check-square", label: "검토·승인함", description: "담당자 확인", countKey: "approvals" },
    { id: "audit-logs", icon: "history", label: "감사 기록", description: "검토 필요", countKey: "auditLogs" },
    { id: "privacy-permissions", icon: "settings", label: "개인정보·권한 정책", description: "보호 기준", countKey: "privacyPermissions" },
    { id: "integrations", icon: "database", label: "외부 데이터 연결", description: "상태 점검", countKey: "integrations" },
    { id: "cases", icon: "file-text", label: "전체 운영 건 조회", description: "상세 조회", countKey: "cases" },
  ]},
  { section: "케이스·상품 운영", items: [
    { id: "personal-finance", icon: "users", label: "개인금융 운영", description: "신용·대환·할부", countKey: "personalFinance" },
    { id: "auto-finance", icon: "activity", label: "자동차금융 운영", description: "리스·렌트·중고차", countKey: "autoFinance" },
    { id: "mortgage-secured", icon: "wallet", label: "부동산/담보 금융", description: "주담대·담보", countKey: "mortgageSecured" },
    { id: "enterprise-finance", icon: "target", label: "기업금융 운영", description: "PF·구조화", countKey: "enterpriseFinance" },
    { id: "customer-management", icon: "refresh-cw", label: "내 금융관리", description: "결제·상환·계약", countKey: "customerManagement" },
    { id: "documents", icon: "file-text", label: "전자약정·서류", description: "접수·검토", countKey: "documents" },
    { id: "vehicle-lifecycle", icon: "database", label: "차량관리", description: "반환·리콜", countKey: "vehicleLifecycle" },
  ]},
  { section: "고객보호·리스크", items: [
    { id: "consumer-protection", icon: "shield", label: "금융소비자보호 점검", description: "권리·검수", countKey: "consumerProtection" },
    { id: "fds", icon: "alert", label: "FDS/보이스피싱", description: "경보 대응", countKey: "fds" },
    { id: "alerts", icon: "bell", label: "긴급 알림", description: "처리 필요", countKey: "urgentAlerts" },
    { id: "complaints", icon: "file-text", label: "민원/고객센터", description: "상담·민원", countKey: "complaints" },
  ]},
  { section: "AI·자동화 관리", items: [
    { id: "ai-analysis", icon: "activity", label: "AI 분석 요청", description: "대기/실행", countKey: "aiAnalysis" },
    { id: "ai-assist", icon: "bot", label: "AI 업무지원", description: "제안 검토", countKey: "aiAssist" },
    { id: "agent-harness", icon: "bot", label: "운영 에이전트 하네스", description: "13개 에이전트", countKey: "agentHarness" },
    { id: "capabilities", icon: "puzzle", label: "업무 기능", description: "기능 제안", countKey: "capabilities" },
    { id: "roles", icon: "network", label: "담당자/권한", description: "권한 검토", countKey: "roles" },
    { id: "inspections", icon: "refresh-cw", label: "정기 점검", description: "스케줄", countKey: "inspections" },
  ]},
];

/* 상태·필드·정렬 한국어 라벨. status/field key 자체는 DB 계약이므로 영문 키를 유지하고
   화면 표기만 한국어로 통일한다. */
const JBWC_STATUS_LABELS = {
  received: "접수",
  triaged: "분류 완료",
  assigned: "배정됨",
  waitingDocuments: "서류 대기",
  inOperationalReview: "운영 검토중",
  pendingApproval: "승인 대기",
  pendingCustomerProtectionReview: "소비자보호 검토 대기",
  pendingFdsEscalation: "FDS 에스컬레이션 대기",
  waitingExternalData: "외부자료 대기",
  waitingVehicleTask: "차량태스크 대기",
  completed: "완료",
  closed: "종결",
  rejected: "반려",
  escalated: "에스컬레이션",
  open: "미처리",
  inProgress: "진행중",
  pending: "대기",
  queued: "대기열",
  running: "실행중",
  needsReview: "검토 필요",
  upcoming: "예정",
  degraded: "성능 저하",
  overdue: "기한 초과",
  down: "중단",
  error: "오류",
  resolved: "해결됨",
  active: "활성",
  enabled: "사용중",
  healthy: "정상",
  critical: "심각",
  proposed: "제안됨",
  investigating: "조사중",
};

const JBWC_FIELD_LABELS = {
  id: "ID",
  caseNo: "케이스 번호",
  domain: "업무 도메인",
  productType: "상품/업무 유형",
  title: "제목",
  description: "설명",
  status: "상태",
  priority: "우선순위",
  riskLevel: "위험도",
  severity: "심각도",
  assignedTeam: "담당팀",
  assignedToId: "담당자 ID",
  ownerId: "담당자 ID",
  userId: "사용자 ID",
  actorId: "행위자 ID",
  customerRefId: "고객 참조 ID",
  contractRefId: "계약 참조 ID",
  vehicleRefId: "차량 참조 ID",
  sourceChannel: "접수 채널",
  tags: "태그",
  requiresHumanReview: "사람 검토 필요",
  requiresHumanEscalation: "사람 에스컬레이션 필수",
  reviewRequired: "검토 필요 여부",
  attachmentsExist: "관련 문서 존재",
  dueAt: "처리 기한",
  createdAt: "생성일",
  updatedAt: "수정일",
  requestedAt: "요청일",
  receivedAt: "접수일",
  reviewedAt: "검토일",
  lastSyncAt: "최근 동기화",
  caseId: "관련 케이스",
  documentType: "문서 유형",
  taskType: "태스크 유형",
  alertType: "경보 유형",
  reviewType: "검토 유형",
  approvalType: "승인 유형",
  inspectionType: "점검 유형",
  requestType: "요청 유형",
  policyArea: "정책 영역",
  permissionScope: "권한 범위",
  category: "분류",
  health: "연결 상태",
  name: "이름",
  team: "팀",
  role: "역할",
  agentId: "에이전트 ID",
  fromAgentId: "출발 에이전트",
  toAgentId: "도착 에이전트",
  reason: "사유",
  inputSummary: "입력 요약",
  outputSummary: "결과 요약",
  confidence: "확신도",
  action: "행위",
  targetType: "대상 유형",
  targetId: "대상 ID",
  requestedById: "요청자 ID",
  approverId: "승인자 ID",
  proposedByAgentId: "제안 에이전트",
  metricKey: "지표 키",
  metricValue: "지표 값",
  snapshotDate: "기준일",
};

const JBWC_SORT_LABELS = {
  default: "기본 정렬",
  status: "상태순",
  riskLevel: "위험도순",
  priority: "우선순위순",
  dueAt: "기한순",
  createdAt: "생성일순",
};

const JBWC_PRIORITY_LABELS = { low: "낮음", normal: "보통", high: "높음", urgent: "긴급" };
const JBWC_RISK_LABELS = { low: "낮음", medium: "보통", high: "높음", critical: "심각" };

function jbwcHashForView(view, caseId) {
  const route = JBWC_ROUTE_BY_VIEW[view] || JBWC_ROUTE_BASE;
  if (caseId) return `#${JBWC_ROUTE_BASE}/cases/${encodeURIComponent(caseId)}`;
  return `#${route}`;
}

function jbwcRouteFromHash(hash) {
  const raw = String(hash || "").replace(/^#/, "");
  if (raw === "jb-woori-capital-dashboard" || raw === JBWC_ROUTE_BASE) return { view: "board" };
  if (raw.startsWith("jbwc/")) return { view: raw.slice(5) };
  if (!raw.startsWith(JBWC_ROUTE_BASE)) return null;
  const route = raw || JBWC_ROUTE_BASE;
  if (route.startsWith(`${JBWC_ROUTE_BASE}/cases/`) && route !== `${JBWC_ROUTE_BASE}/cases/new`) {
    return { view: "cases", caseId: decodeURIComponent(route.slice(`${JBWC_ROUTE_BASE}/cases/`.length)) };
  }
  return { view: JBWC_VIEW_BY_ROUTE[route] || "board" };
}
