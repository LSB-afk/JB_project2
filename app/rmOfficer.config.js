/* RM(관계관리 담당자) 역할 하네스 — 전용 route/nav/taxonomy/lifecycle config.
   다른 role/affiliate 하네스 business config를 alias하지 않는다.
   원칙: AI는 여신 상담 "우선순위 근거/체크리스트/안내문 초안/승인 라우팅 후보"만 만들고
   실제 승인·금리·한도·신용평가·정책자금 대상 확정은 담당 RM이 판단한다.
   설계 SSOT: RM 콘솔 3장면(업무보드 · 케이스 상세/승인 큐 · 통합 MD 뷰어) — 키보드 퍼스트. */

const RMO_ROLE_KEY = "rm-officer";
const RMO_WORKSPACE_ID = "rm-officer";
const RMO_DISPLAY_NAME = "RM";
const RMO_PORTAL_TITLE = "RM 업무지원 포털";
const RMO_ROUTE_BASE = "/roles/rm-officer";
const RMO_DB_VERSION = 1;

/* 상담/케이스 유형 taxonomy — RM이 급한 순으로 모아보는 업무 축 */
const RMO_CASE_TYPES = {
  disasterRisk: {
    label: "재해·리스크 대응",
    team: "지역RM팀",
    examples: ["양식장 재해위험", "자연재해 피해 사업장", "고수온·풍랑 경보 권역"],
  },
  repaymentCare: {
    label: "상환부담 관리",
    team: "여신관리팀",
    examples: ["소득 공백기 상환집중", "복직 전 급여 정상화", "다중채무 상환일 겹침"],
  },
  dailyFinance: {
    label: "생활금융 지원",
    team: "리테일RM팀",
    examples: ["생활비 공백", "소액대출 리마인드", "학자금·장학금 공백"],
  },
  policyStartup: {
    label: "정책·창업 금융",
    team: "정책금융팀",
    examples: ["소상공인 정책자금", "창업·자영업 여신 상담", "지역 협약대출 안내"],
  },
};

/* 케이스 진행 3단계(진행 전/중/후) — 보드 카운트 헤더·필터의 기준 축 */
const RMO_STAGES = ["todo", "doing", "done"];
const RMO_STAGE_LABELS = { todo: "처리해야할 작업 전", doing: "처리해야할 작업 중", done: "처리해야할 작업 후" };
const RMO_STAGE_SHORT = { todo: "작업 전", doing: "작업 중", done: "작업 완료" };

const RMO_STATUS_LABELS = {
  intake: "작업 전",
  assigned: "에이전트 배정",
  analyzing: "분석 중",
  humanReview: "담당자 검토",
  escalated: "에스컬레이션",
  completed: "작업 완료",
  closed: "종료",
  low: "낮음",
  normal: "보통",
  high: "높음",
  urgent: "긴급",
  medium: "보통",
  critical: "심각",
  queued: "대기열",
  pendingApproval: "승인 대기",
  running: "실행 중",
  needsReview: "검토 필요",
  skipped: "보류",
  active: "활성",
  healthy: "정상",
  degraded: "성능 저하",
  down: "중단",
  sample: "샘플 기준",
  manualRequired: "담당자 확인 필요",
  connected: "데이터 연결",
  pending: "대기",
  approved: "승인됨",
  overdue: "기한 초과",
  upcoming: "예정",
  open: "미처리",
  draft: "초안",
};

/* status → stage 매핑 (카운트/필터가 참조하는 단일 진실원) */
const RMO_STAGE_BY_STATUS = {
  intake: "todo",
  assigned: "todo",
  analyzing: "doing",
  humanReview: "doing",
  escalated: "doing",
  completed: "done",
  closed: "done",
};

const RMO_PRIORITY_LABELS = { low: "낮음", normal: "보통", high: "높음", urgent: "긴급" };
const RMO_RISK_LABELS = { low: "낮음", medium: "보통", high: "높음", critical: "심각" };

const RMO_ACTIVE_CASE_STATUSES = ["intake", "assigned", "analyzing", "humanReview", "escalated"];

const RMO_VIEWS = {
  board: "업무보드",
  "consult-queue": "여신 상담 큐",
  approvals: "승인 라우팅",
  "policy-checklists": "정책금융 체크리스트",
  deliverables: "통합 리포트",
  cases: "전체 케이스",
  "cases-new": "신규 여신 상담 건 접수",
  disaster: "재해·리스크 대응",
  repayment: "상환부담 관리",
  "daily-finance": "생활금융 지원",
  "policy-startup": "정책·창업 금융",
  "agent-queue": "AI 실행 큐",
  "agent-harness": "에이전트 하네스",
  "data-connectors": "데이터 연결 상태",
  roles: "담당자/권한",
  "audit-logs": "감사 기록",
};

const rmoNavigation = [
  { section: "오늘 처리할 일", items: [
    { id: "board", icon: "layout-dashboard", label: "업무보드", description: "급한 순 케이스", countKey: "board" },
    { id: "consult-queue", icon: "file-text", label: "여신 상담 큐", description: "상담 대기", countKey: "consultQueue" },
    { id: "approvals", icon: "network", label: "승인 라우팅", description: "승인권자 검토", countKey: "approvals" },
    { id: "policy-checklists", icon: "check-square", label: "정책금융 체크리스트", description: "자격 확인", countKey: "policyChecklists" },
    { id: "deliverables", icon: "bot", label: "통합 리포트", description: "통합/개별 MD", countKey: "deliverables" },
    { id: "cases", icon: "database", label: "전체 케이스", description: "필터·정렬", countKey: "cases" },
  ]},
  { section: "상담 유형", items: [
    { id: "disaster", icon: "shield", label: "재해·리스크 대응", description: "재해 권역", countKey: "disaster" },
    { id: "repayment", icon: "wallet", label: "상환부담 관리", description: "상환 집중", countKey: "repayment" },
    { id: "daily-finance", icon: "activity", label: "생활금융 지원", description: "생활 공백", countKey: "dailyFinance" },
    { id: "policy-startup", icon: "target", label: "정책·창업 금융", description: "정책·협약", countKey: "policyStartup" },
  ]},
  { section: "AI·자동화 관리", items: [
    { id: "agent-queue", icon: "bot", label: "AI 실행 큐", description: "승인 대기 실행", countKey: "agentQueue" },
    { id: "agent-harness", icon: "bot", label: "에이전트 하네스", description: "라우팅·실행", countKey: "agentHarness" },
    { id: "data-connectors", icon: "database", label: "데이터 연결 상태", description: "공개/샘플", countKey: "dataConnectors" },
    { id: "roles", icon: "network", label: "담당자/권한", description: "RM/승인권자", countKey: "roles" },
    { id: "audit-logs", icon: "history", label: "감사 기록", description: "처리 이력", countKey: "auditLogs" },
  ]},
];

const RMO_ROUTE_BY_VIEW = Object.fromEntries(
  Object.keys(RMO_VIEWS).map((view) => [view, view === "cases-new" ? `${RMO_ROUTE_BASE}/cases/new` : `${RMO_ROUTE_BASE}/${view}`]),
);

const RMO_CASETYPE_VIEW = {
  disasterRisk: "disaster",
  repaymentCare: "repayment",
  dailyFinance: "daily-finance",
  policyStartup: "policy-startup",
};

const RMO_FIELD_LABELS = {
  id: "ID",
  caseNo: "케이스 번호",
  customerRefId: "익명 고객 ID",
  customerAlias: "고객",
  bank: "관리 은행",
  region: "지역",
  caseType: "상담 유형",
  theme: "주제",
  title: "제목",
  situation: "상황",
  stage: "진행 단계",
  status: "상태",
  priority: "우선순위",
  priorityScore: "우선순위 점수",
  priorityReason: "우선순위 근거",
  riskLevel: "위험도",
  assignedRmId: "담당 RM",
  assignedTeam: "담당팀",
  dueAt: "SLA 기한",
  requiresHumanReview: "담당자 검토 필요",
  escalationRequired: "에스컬레이션 필요",
  requestedAmountBand: "요청 금액대",
  agentId: "에이전트",
  expectedOutput: "예상 산출물",
  estimatedMinutes: "예상 소요(분)",
  reason: "사용 이유",
  expectedValue: "예상 기대값",
  progress: "진행률",
  kind: "구분",
  fileName: "파일명",
  contribution: "관여율",
  summary: "요약",
  runtime: "실행 방식",
  model: "모델",
  runtimeStatus: "런타임 상태",
  validatedOutput: "검증 출력",
  errorSummary: "오류 요약",
  createdAt: "생성일",
  updatedAt: "수정일",
};

const RMO_FORBIDDEN_OUTPUTS = [
  "실제 대출 승인/거절 금지",
  "실제 금리/한도 산정 금지",
  "실제 신용등급/신용평가 산출 금지",
  "실제 정책자금 대상 확정 금지",
  "실제 상환유예/조건변경 승인 금지",
  "실제 고객 개인정보(주민/전화/계좌) 원문 저장/출력 금지",
  "실제 금융거래 실행 금지",
  "high/critical 자동 종결 금지",
];
