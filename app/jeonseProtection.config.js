/* 전세사기 보호 담당자 역할 하네스 — 전용 route/nav/유형/위험신호/라벨 config (v2).
   MoveValue의 부동산 데이터 아이디어를 "가격 데이터 엔진"으로만 흡수하고,
   화면/보드/메뉴/케이스 생명주기는 전세사기 보호 업무 전용으로 정의한다.
   원칙: 전세사기 여부·법률·보증·피해자 결정을 확정하지 않는다 — "위험 신호/확인 필요/담당자 검토 필요"로만 표현. */

const JPO_ROLE_KEY = "jeonse-protection";
const JPO_ROLE_OFFICER_KEY = "jeonse-protection-officer"; // 담당자 계정 스코프 표기용
const JPO_WORKSPACE_ID = "jeonse-protection";
const JPO_DISPLAY_NAME = "전세사기 보호 담당자";
const JPO_PORTAL_TITLE = "전세사기 보호 업무지원 포털";
const JPO_ROUTE_BASE = "/roles/jeonse-protection";

/* 접수 유형 8종 — 위저드 Step 1 */
const JPO_INTAKE_TYPES = {
  preContract: { label: "계약 전 위험 점검", team: "위험분석팀" },
  urgentPreContract: { label: "계약 직전 긴급 점검", team: "위험분석팀", urgent: true },
  depositDelay: { label: "보증금 반환 지연", team: "피해지원팀", minRisk: "high" },
  auctionNotice: { label: "경·공매 통지", team: "피해지원팀", minRisk: "high", urgent: true },
  victimApplication: { label: "피해자 결정 신청 준비", team: "피해지원팀", requiresHumanReview: true },
  legalConsult: { label: "법률지원 상담", team: "피해지원팀", requiresHumanReview: true },
  guaranteeInquiry: { label: "HUG/보증보험 문의", team: "보증연계팀", requiresHumanReview: true },
  etcConsult: { label: "기타 전세피해 상담", team: "피해지원팀" },
};

/* 주택 유형 — 공공데이터 dataset 매핑의 기준 */
const JPO_HOUSING_TYPES = {
  apartment: { label: "아파트", trade: "aptTrade", rent: "aptRent" },
  rowHouse: { label: "연립다세대", trade: "rhTrade", rent: "rhRent" },
  multiHousehold: { label: "다가구(단독 포함)", trade: "shTrade", rent: "shRent" },
  officetel: { label: "오피스텔", trade: null, rent: "officetelRent" },
};

const JPO_CONTRACT_TYPES = { jeonse: "전세", monthly: "월세", semiJeonse: "반전세" };

/* 위험 신호 10종 — 확정 판정이 아니라 "신호"만 표현 */
const JPO_SIGNAL_TYPES = {
  JEONSE_RATIO_HIGH: "전세가율 높음",
  DEPOSIT_OVER_OFFICIAL_PRICE: "공시가격(추정) 대비 보증금 과다",
  ABOVE_NEIGHBORHOOD_MEDIAN: "인근 전세 거래 기준가 대비 과다",
  LOW_COMPARABLE_COUNT: "유사 거래 표본 부족",
  REGISTRY_RIGHTS_UNKNOWN: "등기부 선순위 권리 확인 필요",
  GUARANTEE_STATUS_UNKNOWN: "보증보험 가능성 확인 필요",
  AUCTION_OR_FORECLOSURE_DEADLINE: "경·공매 일정 임박",
  LANDLORD_RISK_MANUAL_REQUIRED: "임대인/보증사고 이력 확인 필요",
  ILLEGAL_BUILDING_MANUAL_REQUIRED: "건축물·위반건축물 확인 필요",
  CONTRACT_DATE_URGENT: "계약(만기) 일정 임박",
};

/* 데이터 연계 상태 */
const JPO_SOURCE_MODES = {
  live_api: "실시간 API 기준",
  snapshot: "저장 기준",
  fallback: "대체 기준 사용",
  manualRequired: "담당자 확인 필요",
};
/* 담당자용 부가 설명 — 내부 key는 유지하고 표시 언어만 업무 언어로 */
const JPO_SOURCE_MODE_HINTS = {
  live_api: "실거래 API 조회 결과",
  snapshot: "실시간 API 미연결 · 저장된 시세 기준 사용",
  fallback: "실거래 API 확인 필요 · 대체 기준 사용",
  manualRequired: "외부기관 확인 필요",
};

/* 케이스 lifecycle 확장 상태명(alias) → canonical 매핑 layer */
const JPO_STATUS_CANONICAL = {
  enrichingData: "enriching",
  reviewingRiskSignals: "riskReview",
  requiresHumanReview: "humanReview",
  waitingExternalConfirmation: "externalLinked",
  supportReferralInProgress: "externalLinked",
  guidanceCompleted: "guidanceDone",
  waitingAdditionalDocuments: "onHold",
  closed: "guidanceDone",
};

/* 케이스 lifecycle — 보드 컬럼과 1:1 */
const JPO_BOARD_COLUMNS = [
  ["received", "신규 접수"],
  ["enriching", "데이터 보강 중"],
  ["riskReview", "위험 신호 검토"],
  ["humanReview", "담당자 검토 필요"],
  ["externalLinked", "외부기관 연계"],
  ["guidanceDone", "지원 안내 완료"],
  ["onHold", "보류/추가자료 요청"],
];
const JPO_ACTIVE_CASE_STATUSES = ["received", "enriching", "riskReview", "humanReview", "externalLinked", "onHold"];

const JPO_VIEWS = {
  board: "위험 접수 보드",
  cases: "전세 위험 케이스",
  "cases-new": "신규 전세 위험/피해 의심 건 접수",
  "price-enrich": "시세 데이터 보강",
  "registry-check": "권리관계 확인",
  "guarantee-check": "보증·HUG 확인",
  "victim-application": "피해지원 신청 검토",
  "urgent-auction": "긴급 경·공매 대응",
  "price-risk": "전세가율/시세 점검",
  "rent-comparables": "유사 전월세 거래",
  "sale-comparables": "매매 실거래 비교",
  "official-price": "공시가격/추정가 비교",
  "building-check": "건축물·위반건축물 확인",
  "landlord-risk": "임대인/보증사고 확인 필요",
  "intake-consult": "피해 의심 상담",
  "victim-guide": "전세사기피해자 결정 신청 안내",
  "doc-checklist": "제출서류 체크리스트",
  "legal-referral": "법률지원 연계",
  "finance-housing-referral": "금융·주거지원 연계",
  "care-referral": "센터 연계",
  "support-referral": "피해자 상담/지원 연계",
  "ai-analysis": "AI 위험 분석 요청",
  "ai-consult-summary": "AI 상담 요약",
  "agent-harness": "운영 에이전트 하네스",
  "data-connectors": "데이터 연결 상태",
  roles: "담당자/권한",
  "audit-logs": "감사 기록",
  inspections: "정기 점검",
  "case-full": "케이스 상세",
};

const JPO_ROUTE_BY_VIEW = Object.fromEntries(
  Object.keys(JPO_VIEWS).map((view) => [view, view === "cases-new" ? `${JPO_ROUTE_BASE}/cases/new` : `${JPO_ROUTE_BASE}/${view}`]),
);
const JPO_VIEW_BY_ROUTE = Object.fromEntries(Object.entries(JPO_ROUTE_BY_VIEW).map(([view, route]) => [route, view]));

const jpoNavigation = [
  { section: "오늘 처리할 일", items: [
    { id: "board", icon: "layout-dashboard", label: "위험 접수 보드", description: "lifecycle 보드", countKey: "board" },
    { id: "cases", icon: "file-text", label: "전세 위험 케이스", description: "필터·정렬 조회", countKey: "cases" },
    { id: "price-enrich", icon: "database", label: "시세 데이터 보강", description: "실거래 연계", countKey: "priceEnrich" },
    { id: "registry-check", icon: "file-text", label: "권리관계 확인", description: "선순위·압류·신탁", countKey: "registryCheck" },
    { id: "guarantee-check", icon: "wallet", label: "보증·HUG 확인", description: "확인 필요 항목", countKey: "guaranteeCheck" },
    { id: "victim-application", icon: "check-square", label: "피해지원 신청 검토", description: "서류·요건", countKey: "victimApplication" },
    { id: "urgent-auction", icon: "bell", label: "긴급 경·공매 대응", description: "기한 임박", countKey: "urgentAuction" },
  ]},
  { section: "전세 위험 점검", items: [
    { id: "price-risk", icon: "activity", label: "전세가율/시세 점검", description: "구간·비율", countKey: "priceRisk" },
    { id: "rent-comparables", icon: "refresh-cw", label: "유사 전월세 거래", description: "인근 거래 기준가 비교", countKey: "rentComparables" },
    { id: "sale-comparables", icon: "target", label: "매매 실거래 비교", description: "추정 매매가", countKey: "saleComparables" },
    { id: "official-price", icon: "wallet", label: "공시가격/추정가 비교", description: "보증금 대비", countKey: "officialPrice" },
    { id: "building-check", icon: "shield", label: "건축물·위반건축물 확인", description: "수동 확인", countKey: "buildingCheck" },
    { id: "landlord-risk", icon: "alert", label: "임대인/보증사고 확인 필요", description: "외부기관 확인", countKey: "landlordRisk" },
  ]},
  { section: "피해자 지원 업무", items: [
    { id: "intake-consult", icon: "users", label: "피해 의심 상담", description: "상담 큐", countKey: "intakeConsult" },
    { id: "victim-guide", icon: "file-text", label: "전세사기피해자 결정 신청 안내", description: "안내 후보", countKey: "victimGuide" },
    { id: "doc-checklist", icon: "check-square", label: "제출서류 체크리스트", description: "보유·누락", countKey: "docChecklist" },
    { id: "legal-referral", icon: "network", label: "법률지원 연계", description: "기관 안내", countKey: "legalReferral" },
    { id: "finance-housing-referral", icon: "wallet", label: "금융·주거지원 연계", description: "기관 안내", countKey: "financeHousingReferral" },
    { id: "care-referral", icon: "shield", label: "센터 연계", description: "심리상담·기관 안내", countKey: "careReferral" },
  ]},
  { section: "AI·자동화 관리", items: [
    { id: "ai-analysis", icon: "activity", label: "AI 위험 분석 요청", description: "대기/실행", countKey: "aiAnalysis" },
    { id: "ai-consult-summary", icon: "bot", label: "AI 상담 요약", description: "승인 대기 포함", countKey: "aiConsultSummary" },
    { id: "agent-harness", icon: "bot", label: "운영 에이전트 하네스", description: "표면 6·내부 10", countKey: "agentHarness" },
    { id: "data-connectors", icon: "database", label: "데이터 연결 상태", description: "Seoul·MOLIT·HUG", countKey: "dataConnectors" },
    { id: "audit-logs", icon: "history", label: "감사 기록", description: "검토 필요", countKey: "auditLogs" },
  ]},
];

/* 상태·필드 한국어 라벨 (key는 DB 계약, 표기만 한국어) */
const JPO_STATUS_LABELS = {
  received: "신규 접수",
  enriching: "데이터 보강 중",
  riskReview: "위험 신호 검토",
  humanReview: "담당자 검토 필요",
  externalLinked: "외부기관 연계",
  guidanceDone: "지원 안내 완료",
  onHold: "보류/추가자료 요청",
  unknown: "확인 필요",
  verified: "확인 완료",
  manualRequired: "수동 확인 필요",
  open: "미처리",
  inProgress: "진행중",
  pending: "대기",
  queued: "대기열",
  running: "실행중",
  needsReview: "검토 필요",
  pendingApproval: "승인 대기",
  investigating: "조사중",
  linked: "연계됨",
  guided: "안내 완료",
  notified: "통지 접수",
  upcoming: "예정",
  overdue: "기한 초과",
  degraded: "성능 저하",
  down: "중단",
  error: "오류",
  resolved: "해결됨",
  active: "활성",
  healthy: "정상",
  completed: "완료",
  closed: "종결",
  rejected: "반려",
  approved: "승인됨",
  proposed: "제안됨",
  critical: "심각",
  live_api: "실거래 API",
  snapshot: "저장 기준",
  fallback: "미연결(확인 필요)",
};

const JPO_FIELD_LABELS = {
  id: "ID",
  caseNo: "사건번호",
  intakeType: "접수 유형",
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
  customerRefId: "익명 고객 ID",
  addressMasked: "주소(마스킹)",
  lawdCode: "법정동 코드",
  buildingName: "단지/건물명",
  housingType: "주택 유형",
  contractType: "임대차 유형",
  depositAmount: "보증금",
  monthlyRentAmount: "월세",
  areaSize: "전용면적(㎡)",
  floor: "층",
  builtYear: "준공연도",
  contractStartDate: "계약 시작일",
  contractEndDate: "계약 만기/예정일",
  riskSignals: "위험 신호",
  sourceMode: "데이터 연계 상태",
  sourceChannel: "접수 채널",
  tags: "태그",
  requiresHumanReview: "사람 검토 필요",
  requiresHumanEscalation: "사람 에스컬레이션 필수",
  reviewRequired: "검토 필요 여부",
  manualRequired: "수동 확인 필요",
  docsReady: "제출서류 보유",
  docChecklist: "제출서류 체크리스트",
  guaranteeStatus: "보증보험 상태",
  registryStatus: "등기부 확인 상태",
  seniorLienEntered: "선순위 권리 입력",
  auctionNoticed: "경·공매 통지",
  auctionDeadline: "경·공매 기한",
  dueAt: "처리 기한",
  createdAt: "생성일",
  updatedAt: "수정일",
  fetchedAt: "조회 시각",
  checkedAt: "확인 시각",
  caseId: "관련 케이스",
  source: "출처",
  dealYm: "기준년월",
  saleMedian: "인근 매매 거래 기준가",
  jeonseMedian: "인근 전세 거래 기준가",
  rentMedian: "인근 월세보증금 기준가",
  jeonseRatio: "전세가율",
  officialPriceEst: "추정 공시가격",
  comparableCount: "비교 거래 수",
  comparableTradeCount: "유사 매매 수",
  comparableRentCount: "유사 전월세 수",
  confidence: "데이터 신뢰도",
  signalType: "신호 코드",
  evidence: "근거",
  checkType: "점검 유형",
  evidenceSummary: "근거 요약",
  provider: "보증 기관",
  referralType: "연계 유형",
  targetAgency: "연계 기관",
  notes: "메모",
  approvalType: "승인 유형",
  inspectionType: "점검 유형",
  requestType: "요청 유형",
  permissionScope: "권한 범위",
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
  action: "행위",
  targetType: "대상 유형",
  targetId: "대상 ID",
  requestedById: "요청자 ID",
  approverId: "승인자 ID",
  roleKey: "역할 스코프",
  workspaceId: "워크스페이스",
  kind: "종류",
  externalRef: "외부 참고",
  lastSyncAt: "최근 동기화",
};

const JPO_SORT_LABELS = {
  default: "기본 정렬",
  status: "상태순",
  riskLevel: "위험도순",
  priority: "우선순위순",
  dueAt: "기한순",
  createdAt: "생성일순",
};

const JPO_PRIORITY_LABELS = { low: "낮음", normal: "보통", high: "높음", urgent: "긴급" };
const JPO_RISK_LABELS = { low: "낮음", medium: "보통", high: "높음", critical: "심각" };

/* seed 지역 프리셋 — 위저드 Step 2에서 시/도·시/군/구·법정동을 프리셋으로 입력 (실주소 원문 없음) */
const JPO_REGION_PRESETS = [
  { lawdCode: "11500", label: "서울 강서구 화곡동" },
  { lawdCode: "11620", label: "서울 관악구 신림동" },
  { lawdCode: "11530", label: "서울 구로구 개봉동" },
  { lawdCode: "28177", label: "인천 미추홀구 주안동" },
  { lawdCode: "30170", label: "대전 서구 둔산동" },
  { lawdCode: "26350", label: "부산 수영구 광안동" },
];

/* 공식 근거 — 안내 후보로만 사용, 화면에 "최신 기준 담당자 확인 필요" 병기 */
const JPO_OFFICIAL_REFERENCES = [
  { key: "molit", label: "국토교통부 전세사기피해자 지원관리시스템", site: "molit.go.kr", note: "피해자 결정 신청 흐름 참고" },
  { key: "hug", label: "HUG 전세피해지원센터 / 전세피해지원 프로그램", site: "khug.or.kr", note: "보증·피해지원 안내 후보" },
  { key: "law", label: "전세사기피해자 지원 및 주거안정에 관한 특별법", site: "law.go.kr", note: "요건·절차는 법령 원문 확인" },
  { key: "fsc", label: "금융위원회 전세사기 피해자 금융지원 프로그램", site: "fsc.go.kr", note: "금융지원 안내 후보" },
];

/* 표면 에이전트 — 화면에 상시 노출되는 6개. 나머지는 내부 전문 조직(접힘)으로 표시 */
const JPO_SURFACE_AGENT_IDS = ["jpo-intake", "jpo-price", "jpo-registry", "jpo-guarantee", "jpo-auction", "jpo-victim"];

function jpoHashForView(view, caseId) {
  if (view === "case-full" && caseId) return `#${JPO_ROUTE_BASE}/cases/${encodeURIComponent(caseId)}/full`;
  if (caseId) return `#${JPO_ROUTE_BASE}/cases/${encodeURIComponent(caseId)}`;
  const route = JPO_ROUTE_BY_VIEW[view] || JPO_ROUTE_BASE;
  return `#${route}`;
}

function jpoRouteFromHash(hash) {
  const raw = String(hash || "").replace(/^#/, "");
  if (raw === JPO_ROUTE_BASE || raw === "jeonse-protection-harness") return { view: "board" };
  if (!raw.startsWith(JPO_ROUTE_BASE)) return null;
  if (raw.startsWith(`${JPO_ROUTE_BASE}/cases/`) && raw !== `${JPO_ROUTE_BASE}/cases/new`) {
    const rest = raw.slice(`${JPO_ROUTE_BASE}/cases/`.length);
    if (rest.endsWith("/full")) {
      return { view: "case-full", caseId: decodeURIComponent(rest.slice(0, -"/full".length)) };
    }
    return { view: "cases", caseId: decodeURIComponent(rest) };
  }
  return { view: JPO_VIEW_BY_ROUTE[raw] || "board" };
}

/* Loop 자동화 준비 — 감지 규칙만 정의한다. 자동 종결/자동 승인은 금지(실행 없음). */
const JPO_AUTOMATION_RULES = [
  { key: "dailyTriage", label: "일일 분류 점검", description: "미배정/미분류 접수 건 감지", mode: "준비됨(수동 실행)" },
  { key: "staleCases", label: "장기 미처리 감지", description: "7일 이상 상태 변경 없는 건", mode: "준비됨(감지만)" },
  { key: "slaDue", label: "SLA 임박 감지", description: "처리 기한 D-1 이내 건", mode: "준비됨(감지만)" },
  { key: "dataRefresh", label: "시세 갱신 필요 감지", description: "대체 기준 사용 또는 보강 대기 건", mode: "준비됨(감지만)" },
  { key: "evaluatorFailed", label: "검증 실패 감지", description: "검증 Agent가 담당자 확인 필요로 표시한 건", mode: "준비됨(감지만)" },
];
