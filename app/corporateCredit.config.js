/* 기업여신 담당자 역할 하네스 — 전용 route/nav/taxonomy/lifecycle config.
   다른 role/affiliate 하네스 business config를 alias하지 않는다.
   원칙: AI는 여신 검토 "신호/체크리스트/메모 초안"만 만들고 승인·금리·한도·신용평가는 사람이 판단한다. */

const CCR_ROLE_KEY = "corporate-credit";
const CCR_WORKSPACE_ID = "corporate-credit";
const CCR_DISPLAY_NAME = "기업여신 담당자";
const CCR_PORTAL_TITLE = "기업여신 업무지원 포털";
const CCR_ROUTE_BASE = "/roles/corporate-credit";
const CCR_DB_VERSION = 1;

const CCR_DOMAINS = {
  workingCapital: {
    label: "운전자금",
    team: "기업여신 RM팀",
    productTypes: ["원재료/재고 운영자금", "단기 운전자금", "한도성 여신", "매출채권 회전 운영자금"],
  },
  facilityLoan: {
    label: "시설자금",
    team: "기업금융 심사지원팀",
    productTypes: ["설비구입", "공장/사업장 확장", "장기 시설투자", "생산라인 증설"],
  },
  guaranteeBackedLoan: {
    label: "보증서 담보",
    team: "보증연계팀",
    productTypes: ["신용보증기금", "기술보증기금", "지역신용보증재단", "협약보증"],
  },
  movableCollateralLoan: {
    label: "동산·매출채권 담보",
    team: "담보관리팀",
    productTypes: ["유형자산 담보", "재고자산 담보", "매출채권 담보", "농축산물 담보"],
  },
  tradeFinance: {
    label: "외환·무역금융",
    team: "외환·무역금융팀",
    productTypes: ["수입업무", "수출업무", "무역금융", "외화지급보증", "공공구매론/네트워크론"],
  },
  policyEsgLoan: {
    label: "정책·ESG 금융",
    team: "정책금융팀",
    productTypes: ["정책자금", "친환경/ESG 금융", "RE100/녹색성장", "협약 대출"],
  },
  pfStructuredFinance: {
    label: "PF·구조화 금융",
    team: "투자금융 심사지원팀",
    productTypes: ["PF", "구조화금융", "M&A 인수금융", "Mezzanine", "PEF/신기술금융 검토"],
  },
  renewalModification: {
    label: "만기연장·조건변경",
    team: "사후관리팀",
    productTypes: ["만기연장", "조건변경", "증액/감액 검토", "약정조건 변경"],
  },
  postMonitoring: {
    label: "사후관리",
    team: "사후관리팀",
    productTypes: ["covenant 점검", "담보/보증 만기", "재무자료 갱신", "자금용도 사후점검"],
  },
  earlyWarningNpl: {
    label: "조기경보/EWS",
    team: "리스크관리팀",
    productTypes: ["연체 징후", "부실징후", "NPL 모니터링", "고위험 사후관리"],
  },
};

const CCR_STATUS_LABELS = {
  received: "접수됨",
  intakeScreening: "사전요건 점검",
  docsCollecting: "서류 보완 요청",
  financialDataReview: "재무자료 점검",
  collateralGuaranteeReview: "담보·보증 확인",
  creditMemoDrafting: "여신메모 초안",
  riskSignalReview: "리스크 신호 검토",
  rmReview: "담당 RM 검토",
  approverReview: "승인권자 검토 대기",
  waitingExternalGuarantee: "보증기관/외부확인 대기",
  postMonitoring: "사후관리",
  onHold: "보류/추가자료",
  completed: "담당자 처리 완료",
  escalated: "리스크 에스컬레이션",
  closed: "종료",
  low: "낮음",
  normal: "보통",
  high: "높음",
  urgent: "긴급",
  critical: "심각",
  open: "미처리",
  pending: "대기",
  pendingApproval: "승인 대기",
  queued: "대기열",
  running: "실행 중",
  needsReview: "검토 필요",
  active: "활성",
  healthy: "정상",
  degraded: "성능 저하",
  down: "중단",
  sample: "샘플 기준",
  manualRequired: "담당자 확인 필요",
  connected: "공개 데이터 연결",
};

const CCR_PRIORITY_LABELS = { low: "낮음", normal: "보통", high: "높음", urgent: "긴급" };
const CCR_RISK_LABELS = { low: "낮음", medium: "보통", high: "높음", critical: "심각" };

const CCR_ACTIVE_CASE_STATUSES = [
  "received",
  "intakeScreening",
  "docsCollecting",
  "financialDataReview",
  "collateralGuaranteeReview",
  "creditMemoDrafting",
  "riskSignalReview",
  "rmReview",
  "approverReview",
  "waitingExternalGuarantee",
  "postMonitoring",
  "onHold",
  "escalated",
];

const CCR_BOARD_COLUMNS = [
  ["received", "접수됨"],
  ["docsCollecting", "서류 보완"],
  ["financialDataReview", "재무자료 점검"],
  ["collateralGuaranteeReview", "담보·보증 확인"],
  ["creditMemoDrafting", "여신메모 초안"],
  ["approverReview", "승인권자 검토"],
  ["escalated", "리스크 에스컬레이션"],
];

const CCR_VIEWS = {
  board: "여신 업무 보드",
  intake: "신규/보완 접수",
  "doc-review": "심사 패키지 점검",
  approvals: "승인권자 검토 대기",
  "audit-logs": "리스크/감사 기록",
  cases: "전체 기업여신 케이스",
  "cases-new": "신규 기업여신 운영 건 접수",
  "working-capital": "운전자금",
  "facility-loan": "시설자금",
  "guarantee-backed": "보증서 담보",
  collateral: "동산·매출채권 담보",
  "trade-finance": "외환·무역금융",
  "policy-esg": "정책·ESG 금융",
  "pf-structured": "PF·구조화 금융",
  renewals: "만기연장·조건변경",
  "early-warning": "조기경보/EWS",
  "npl-monitoring": "연체·NPL 모니터링",
  "collateral-maturity": "담보·보증 만기 점검",
  "covenant-checks": "약정조건/Covenant 점검",
  "ai-analysis": "AI 분석 요청",
  "memo-drafts": "여신메모 초안",
  "agent-harness": "운영 에이전트 하네스",
  "data-connectors": "데이터 연결 상태",
  roles: "담당자/권한",
  inspections: "정기 점검",
};

const ccrNavigation = [
  { section: "오늘 처리할 일", items: [
    { id: "board", icon: "layout-dashboard", label: "여신 업무 보드", description: "lifecycle 보드", countKey: "board" },
    { id: "intake", icon: "file-text", label: "신규/보완 접수", description: "접수·보완", countKey: "intake" },
    { id: "doc-review", icon: "check-square", label: "심사 패키지 점검", description: "서류·재무", countKey: "docReview" },
    { id: "approvals", icon: "network", label: "승인권자 검토 대기", description: "사람 승인", countKey: "approvalQueue" },
    { id: "audit-logs", icon: "history", label: "리스크/감사 기록", description: "처리 이력", countKey: "auditLogs" },
    { id: "cases", icon: "database", label: "전체 기업여신 케이스", description: "필터·정렬", countKey: "cases" },
  ]},
  { section: "여신 검토", items: [
    { id: "working-capital", icon: "wallet", label: "운전자금", description: "운영자금", countKey: "workingCapital" },
    { id: "facility-loan", icon: "settings", label: "시설자금", description: "설비·사업장", countKey: "facilityLoan" },
    { id: "guarantee-backed", icon: "shield", label: "보증서 담보", description: "보증기관", countKey: "guaranteeBacked" },
    { id: "collateral", icon: "file-text", label: "동산·매출채권 담보", description: "담보 확인", countKey: "collateral" },
    { id: "trade-finance", icon: "refresh-cw", label: "외환·무역금융", description: "수출입", countKey: "tradeFinance" },
    { id: "policy-esg", icon: "target", label: "정책·ESG 금융", description: "협약·녹색", countKey: "policyEsg" },
    { id: "pf-structured", icon: "network", label: "PF·구조화 금융", description: "투자금융", countKey: "pfStructured" },
  ]},
  { section: "사후관리·리스크", items: [
    { id: "renewals", icon: "refresh-cw", label: "만기연장·조건변경", description: "약정 변경", countKey: "renewals" },
    { id: "early-warning", icon: "bell", label: "조기경보/EWS", description: "부실징후", countKey: "earlyWarning" },
    { id: "npl-monitoring", icon: "activity", label: "연체·NPL 모니터링", description: "고위험", countKey: "nplMonitoring" },
    { id: "collateral-maturity", icon: "wallet", label: "담보·보증 만기 점검", description: "기한 관리", countKey: "collateralMaturity" },
    { id: "covenant-checks", icon: "check-square", label: "약정조건/Covenant 점검", description: "사후 의무", countKey: "covenantChecks" },
  ]},
  { section: "AI·자동화 관리", items: [
    { id: "ai-analysis", icon: "activity", label: "AI 분석 요청", description: "대기/실행", countKey: "aiAnalysis" },
    { id: "memo-drafts", icon: "bot", label: "여신메모 초안", description: "승인 전", countKey: "memoDrafts" },
    { id: "agent-harness", icon: "bot", label: "운영 에이전트 하네스", description: "15개 agent", countKey: "agentHarness" },
    { id: "data-connectors", icon: "database", label: "데이터 연결 상태", description: "공개/샘플", countKey: "dataConnectors" },
    { id: "roles", icon: "network", label: "담당자/권한", description: "RM/승인권자", countKey: "roles" },
    { id: "inspections", icon: "refresh-cw", label: "정기 점검", description: "스케줄", countKey: "inspections" },
  ]},
];

const CCR_ROUTE_BY_VIEW = Object.fromEntries(
  Object.keys(CCR_VIEWS).map((view) => [view, view === "cases-new" ? `${CCR_ROUTE_BASE}/cases/new` : `${CCR_ROUTE_BASE}/${view}`]),
);

const CCR_DOMAIN_VIEW = {
  workingCapital: "working-capital",
  facilityLoan: "facility-loan",
  guaranteeBackedLoan: "guarantee-backed",
  movableCollateralLoan: "collateral",
  tradeFinance: "trade-finance",
  policyEsgLoan: "policy-esg",
  pfStructuredFinance: "pf-structured",
  renewalModification: "renewals",
  postMonitoring: "covenant-checks",
  earlyWarningNpl: "early-warning",
};

const CCR_FIELD_LABELS = {
  id: "ID",
  caseNo: "사건번호",
  borrowerRefId: "익명 기업 ID",
  companyAlias: "익명 기업",
  industry: "업종",
  region: "지역",
  domain: "업무 도메인",
  productType: "상품/업무 유형",
  requestedAmountBand: "요청 금액대",
  status: "상태",
  priority: "우선순위",
  riskLevel: "위험도",
  assignedRmId: "담당 RM",
  assignedTeam: "담당팀",
  dueAt: "SLA 기한",
  financialBaseMonth: "재무자료 기준월",
  docsStatus: "서류 상태",
  collateralStatus: "담보 상태",
  guaranteeStatus: "보증 상태",
  externalStatus: "외부 확인 상태",
  dataMode: "데이터 연결 상태",
  requiresHumanReview: "담당자 검토 필요",
  escalationRequired: "에스컬레이션 필요",
  createdAt: "생성일",
  updatedAt: "수정일",
};

const CCR_FORBIDDEN_OUTPUTS = [
  "실제 대출 승인/거절 금지",
  "실제 금리/한도 산정 금지",
  "실제 신용등급/신용평가 산출 금지",
  "실제 사업자등록번호/대표자/계좌/세무자료 원문 저장 금지",
  "실제 금융거래 실행 금지",
  "실제 보증 신청/외부기관 제출 금지",
  "법률/규정 확정 판단 금지",
  "high/critical 자동 종결 금지",
];
