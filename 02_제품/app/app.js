// Static verification compatibility: 로컬가드 AI · AI 에이전트 모델 · 스킬 저장소 · 사용자 입력 데이터
const navigation = [
  {
    section: "오늘 처리할 일",
    items: [
      { id: "dashboard", icon: "layout-dashboard", label: "업무 보드", description: "오늘 확인", countKey: "dashboard" },
      { id: "approvals", icon: "check-square", label: "검토·승인함", description: "담당자 확인", countKey: "approvals" },
      { id: "activity", icon: "history", label: "감사 기록", description: "처리 이력", countKey: "activity" },
      { id: "settings", icon: "settings", label: "개인정보·권한 정책", description: "보호 기준", countKey: "settings" },
      { id: "plugins", icon: "database", label: "외부 데이터 연결", description: "코어/법령", countKey: "plugins" },
      { id: "cases", icon: "file-text", label: "전체 관리 건 조회", description: "상세 조회", countKey: "cases" },
    ],
  },
  {
    section: "AI·자동화 관리",
    items: [
      { id: "runs", icon: "activity", label: "AI 분석 요청", description: "검토 로그", countKey: "runs" },
      { id: "agents", icon: "bot", label: "AI 업무지원", description: "14개 제안", countKey: "agents" },
      { id: "skills", icon: "puzzle", label: "업무 기능", description: "27개 제안", countKey: "skills" },
      { id: "orgchart", icon: "network", label: "담당자/권한", description: "RM/감독자", countKey: "orgchart" },
      { id: "routines", icon: "refresh-cw", label: "정기 점검", description: "스케줄", countKey: "routines" },
    ],
  },
  {
    section: "고객지원 업무",
    items: [
      { id: "jeonse", icon: "shield", label: "전세 안심 점검", description: "확인 필요", countKey: "jeonse" },
      { id: "inbox", icon: "bell", label: "긴급 알림", description: "처리 필요", countKey: "inbox" },
      { id: "goals", icon: "target", label: "운영 목표", description: "SLA/품질", countKey: "goals" },
      { id: "budget", icon: "wallet", label: "비용 관리", description: "예산", countKey: "budget" },
    ],
  },
];

const NAV_ORDER_STORAGE_KEY = "jb-localguard-nav-order-v1";

const evidence = [
  {
    id: "jb-ai-mou",
    type: "JB Official",
    title: "JB금융그룹-네이버클라우드 AI 업무협약",
    source: "JB금융그룹",
    url: "https://www.jbfg.com/ko/prcenter/press/detail/17.do",
    implication:
      "기업대출 상담, 심사, 사후관리에서 상담 기록과 문서 데이터를 구조화하고 승인 검토 근거를 생성하는 방향과 연결된다.",
  },
  {
    id: "jb-network",
    type: "JB Official",
    title: "JB금융그룹 계열사와 지역 금융 접점",
    source: "JB금융그룹",
    url: "https://www.jbfg.com/ko/about/network.do",
    implication:
      "전북은행, 광주은행, JB우리캐피탈을 중심으로 지역 고객과 금융 사후관리 접점이 있다.",
  },
  {
    id: "smallbiz-burden",
    type: "News",
    title: "소상공인 금융비용 부담과 연체율 상승",
    source: "쿠키뉴스",
    url: "https://www.kukinews.com/article/view/kuk202602170018",
    implication:
      "금융비용과 내수 침체가 동시에 부담으로 나타나 상환 위험 분류가 필요하다.",
  },
  {
    id: "rate-shock",
    type: "News",
    title: "자영업자 대출 잔액과 금리 민감도",
    source: "연합뉴스",
    url: "https://www.yna.co.kr/view/AKR20260328043600002",
    implication:
      "금리 상승과 다중채무 부담이 지역 사업자 상환 위험으로 전이될 수 있다.",
  },
  {
    id: "fraud-ai",
    type: "Policy",
    title: "보이스피싱 AI 플랫폼과 고도화된 사기 위험",
    source: "금융위원회",
    url: "https://www.fsc.go.kr/no010101/86063",
    implication:
      "딥페이크와 음성변조 등 AI 악용 사기에 대해 이상거래 유의 신호 확인 기능이 외부 경보를 연결해야 한다.",
  },
  {
    id: "digital-gap",
    type: "News",
    title: "고령층 디지털 금융 역량 격차",
    source: "브라보마이라이프",
    url: "https://bravo.etoday.co.kr/view/atc_view/19103",
    implication:
      "고객 직접 자동화보다 RM 승인형 안내와 쉬운 콜백 스크립트가 적합하다.",
  },
  {
    id: "hug-safe-jeonse",
    type: "Official",
    title: "HUG 안심전세 서비스",
    source: "주택도시보증공사",
    url: "https://www.khug.or.kr/jeonse/web/s01/s010102.jsp",
    implication:
      "시세, 전세가율, 임대인 정보, 셀프테스트, 보증가입 가능성 확인을 전세 위험 검토 근거로 연결한다.",
  },
  {
    id: "molit-jeonse-policy",
    type: "Policy",
    title: "전세사기 예방과 보증 기준 정책",
    source: "국토교통부",
    url: "https://www.molit.go.kr/USR/NEWS/m_71/dtl.jsp?id=95087856",
    implication:
      "전세가율, 권리관계, 특약, 보증보험 확인 항목을 고객 안내 체크리스트에 반영한다.",
  },
];

const skillRack = [
  ["case-os-core", "orchestration", "관리 건 생성, 상태 전이, 담당 AI 업무지원 배정", "internal only", "low"],
  ["evidence-harvest", "research", "기사, 공식 발표, 상담 노트에서 위험 근거 수집", "internal only", "low"],
  ["source-ranker", "research", "공식성, 최신성, 금융 관련성을 점수화", "internal only", "low"],
  ["pain-classifier", "reasoning", "상환, 금리, 사기, 정책금융, 디지털 장벽 분류", "internal only", "low"],
  ["cashflow-stress", "finance", "매출 둔화, 금리 부담, 상환 압박 검토", "RM review", "medium"],
  ["rate-relief", "finance", "금리 충격과 대환 검토 필요성 검토", "RM review", "medium"],
  ["policy-match", "finance", "정책금융, 대환, 필요 서류 후보 매칭", "RM review", "medium"],
  ["document-checklist", "operations", "상담 전 필요한 서류와 확인 질문 생성", "RM review", "low"],
  ["fraud-shield", "risk", "보이스피싱, 딥페이크, 이상 콜백 위험 차단", "blocks external action", "high"],
  ["do-not-contact-rule", "risk", "고위험 사기 관리 건의 외부 고객 접촉 금지", "mandatory", "high"],
  ["notification-brief", "communication", "RM 메모와 고객 콜백 스크립트 작성", "approval required", "medium"],
  ["compliance-guard", "compliance", "과장 표현, 개인정보, 준법 리스크 검토", "mandatory", "high"],
  ["approval-gate", "control", "외부 행동 전 담당자 최종 확인 요구", "mandatory", "high"],
  ["audit-ledger", "control", "근거, 검토, 행동, 승인 내역 기록", "mandatory", "low"],
  ["portfolio-signal", "analytics", "지점/계열사별 위험 클러스터 집계", "internal only", "low"],
  ["jeonse-price-ratio", "jeonse-risk", "매매 추정가 대비 전세보증금 비율과 과다 전세가율 위험 산정", "RM review", "high"],
  ["local-market-compare", "jeonse-risk", "주변 시세 대비 보증금 과다 여부 비교", "RM review", "medium"],
  ["registry-rights-scan", "legal-risk", "근저당, 압류, 가압류, 신탁등기 등 권리관계 위험 추출", "human/legal review", "high"],
  ["ownership-transfer-delta", "legal-risk", "단기간 소유권 이전, 매매가 급변, 임대인 변경 신호 탐지", "human/legal review", "high"],
  ["guarantee-feasibility", "guarantee", "보증보험 가입 불가 가능성, 보증 한도, 선순위 채권 확인 필요성 분류", "RM review", "high"],
  ["tenant-asset-exposure", "asset-risk", "총자산 대비 보증금 비중과 계약 실패 시 손실 주의 수준 산정", "advisor review", "medium"],
  ["housing-cost-burden", "asset-risk", "월 소득 대비 주거비와 전세대출 상환 부담 분석", "advisor review", "medium"],
  ["pre-contract-checklist", "contract", "계약 전 확인 서류, 임대인·중개사 확인 항목 생성", "approval required", "medium"],
  ["special-clause-drafter", "contract", "근저당 말소, 보증보험, 잔금 조건 관련 특약 문구 초안 제안", "legal review", "high"],
  ["bank-linkage-brief", "banking", "전세대출 상담, 보증보험 안내, 유의 매물 안내, 계약 전 확인 가이드 연결", "RM approval", "medium"],
].map(([slug, type, purpose, approval, risk]) => ({
  slug,
  type,
  purpose,
  approval,
  risk,
  enabled: true,
}));

const agents = [
  {
    id: "orchestrator",
    name: "업무지원 조율 기능",
    type: "orchestrator",
    status: "running",
    reportsTo: "Human RM Lead",
    budget: 180000,
    spent: 42000,
    heartbeat: "38s",
    queue: 4,
    currentCase: "전주 중앙로 카페",
    skills: ["case-os-core", "approval-gate", "audit-ledger"],
    role: "지시 해석, AI 업무지원 배정, 승인 레벨 산정",
  },
  {
    id: "pain-radar",
    name: "Pain Radar Agent",
    type: "research",
    status: "running",
    reportsTo: "업무지원 조율 기능",
    budget: 90000,
    spent: 31000,
    heartbeat: "1m",
    queue: 6,
    currentCase: "포트폴리오 스캔",
    skills: ["evidence-harvest", "source-ranker", "pain-classifier"],
    role: "기사, 공식자료, 상담 메모에서 위험 신호 탐지",
  },
  {
    id: "cashflow",
    name: "Cashflow Triage Agent",
    type: "finance",
    status: "pending_approval",
    reportsTo: "업무지원 조율 기능",
    budget: 120000,
    spent: 58000,
    heartbeat: "2m",
    queue: 3,
    currentCase: "전주 중앙로 카페",
    skills: ["cashflow-stress", "rate-relief"],
    role: "상환 부담, 금리 민감도, 조기 연체 위험 검토",
  },
  {
    id: "policy",
    name: "Policy Match Agent",
    type: "finance",
    status: "idle",
    reportsTo: "업무지원 조율 기능",
    budget: 85000,
    spent: 18000,
    heartbeat: "5m",
    queue: 2,
    currentCase: "광주 송정 도소매",
    skills: ["policy-match", "document-checklist"],
    role: "정책금융 후보와 제출 서류 체크리스트 생성",
  },
  {
    id: "fraud",
    name: "Fraud Shield Agent",
    type: "risk",
    status: "running",
    reportsTo: "Compliance Guard",
    budget: 110000,
    spent: 64000,
    heartbeat: "42s",
    queue: 1,
    currentCase: "군산 부품 제조업",
    skills: ["fraud-shield", "do-not-contact-rule"],
    role: "고위험 사기 징후 탐지, 고객 영향 조치 보류",
  },
  {
    id: "rm-copilot",
    name: "RM Copilot Agent",
    type: "communication",
    status: "idle",
    reportsTo: "Human RM Lead",
    budget: 95000,
    spent: 26000,
    heartbeat: "4m",
    queue: 5,
    currentCase: "콜백 초안",
    skills: ["notification-brief", "tone-control"],
    role: "RM 메모, 통화 스크립트, 후속 태스크 초안 생성",
  },
  {
    id: "compliance",
    name: "Compliance Guard Agent",
    type: "compliance",
    status: "running",
    reportsTo: "Human Compliance Lead",
    budget: 140000,
    spent: 52000,
    heartbeat: "1m",
    queue: 2,
    currentCase: "승인 대기열",
    skills: ["compliance-guard", "privacy-redaction", "claim-limiter"],
    role: "금지 표현, 개인정보, 최종 확인 혜택 표현 검토",
  },
  {
    id: "analytics",
    name: "Analytics Agent",
    type: "analytics",
    status: "idle",
    reportsTo: "업무지원 조율 기능",
    budget: 70000,
    spent: 16000,
    heartbeat: "8m",
    queue: 0,
    currentCase: "포트폴리오 대시보드",
    skills: ["portfolio-signal", "trend-summary", "case-metrics"],
    role: "지점별 관리 건 묶음, 대기열 상태, 예산 흐름 집계",
  },
  {
    id: "jeonse-lead",
    name: "Jeonse Shield Lead",
    type: "housing-risk",
    status: "running",
    reportsTo: "업무지원 조율 기능",
    budget: 160000,
    spent: 39000,
    heartbeat: "35s",
    queue: 3,
    currentCase: "서울 신축빌라 전세 예정",
    skills: ["case-os-core", "jeonse-price-ratio", "approval-gate", "audit-ledger"],
    role: "전세 관련 위험 신호 관리 건을 생성하고 가격, 권리, 자산, 계약, 은행 상담 연결 지원 기능을 배정",
  },
  {
    id: "deposit-ratio",
    name: "Deposit Ratio Agent",
    type: "housing-risk",
    status: "running",
    reportsTo: "Jeonse Shield Lead",
    budget: 85000,
    spent: 21000,
    heartbeat: "54s",
    queue: 2,
    currentCase: "전세가율 과다 검토",
    skills: ["jeonse-price-ratio", "local-market-compare"],
    role: "전세가율 과다, 주변 시세 대비 보증금 과다, 매매가 추정 불확실성 검토",
  },
  {
    id: "registry-rights",
    name: "Registry Rights Agent",
    type: "legal-risk",
    status: "pending_approval",
    reportsTo: "Jeonse Shield Lead",
    budget: 105000,
    spent: 33000,
    heartbeat: "1m",
    queue: 2,
    currentCase: "등기부 권리관계 확인",
    skills: ["registry-rights-scan", "ownership-transfer-delta"],
    role: "근저당, 압류, 신탁등기, 단기 소유권 이전 등 권리관계 위험을 분류",
  },
  {
    id: "tenant-asset",
    name: "Tenant Asset Risk Agent",
    type: "asset-risk",
    status: "idle",
    reportsTo: "Jeonse Shield Lead",
    budget: 75000,
    spent: 16000,
    heartbeat: "5m",
    queue: 1,
    currentCase: "고객 자산 노출 분석",
    skills: ["tenant-asset-exposure", "housing-cost-burden"],
    role: "총자산 대비 보증금, 월 소득 대비 주거비, 전세대출 상환 가능성, 손실 주의 수준를 산정",
  },
  {
    id: "contract-check",
    name: "Contract Checklist Agent",
    type: "contract",
    status: "idle",
    reportsTo: "Compliance Guard Agent",
    budget: 78000,
    spent: 19000,
    heartbeat: "4m",
    queue: 2,
    currentCase: "계약 전 체크리스트",
    skills: ["pre-contract-checklist", "special-clause-drafter", "compliance-guard"],
    role: "확인 서류, 임대인·중개사 확인, 특약 문구, 보증보험 전 확인사항을 초안화",
  },
  {
    id: "bank-linkage",
    name: "Bank Linkage Agent",
    type: "banking",
    status: "idle",
    reportsTo: "Human RM Lead",
    budget: 68000,
    spent: 12000,
    heartbeat: "7m",
    queue: 1,
    currentCase: "전세대출 상담 연결",
    skills: ["bank-linkage-brief", "guarantee-feasibility", "notification-brief"],
    role: "전세대출 상담, 보증보험 안내, 유의 매물 안내, 계약 전 확인 가이드로 은행 접점을 연결",
  },
];

const agentTeamGroups = [
  {
    id: "command",
    title: "운영 지휘·감사",
    description: "관리 건 생성, AI 업무지원 배정, 상태 추적, 운영 지표 집계를 담당합니다.",
    icon: "network",
    owner: "RM 최종 승인자",
    agentIds: ["orchestrator", "analytics"],
  },
  {
    id: "risk-finance",
    title: "위험·금융 검토",
    description: "기사, 상담 메모, 금융 부담 신호를 읽고 위험 원인과 정책금융 후보를 분류합니다.",
    icon: "activity",
    owner: "업무지원 조율 기능",
    agentIds: ["pain-radar", "cashflow", "policy"],
  },
  {
    id: "jeonse",
    title: "전세 보호 전문 라인",
    description: "전세가율, 주변 시세, 권리관계, 임차인 자산노출을 전세사기 관점에서 점검합니다.",
    icon: "shield",
    owner: "전세 보호 리드 AI 업무지원",
    agentIds: ["jeonse-lead", "deposit-ratio", "registry-rights", "tenant-asset"],
  },
  {
    id: "control",
    title: "준법·차단·계약 통제",
    description: "사기 징후, 개인정보, 금지 표현, 계약 특약 문구를 담당자 최종 확인 전 단계에서 통제합니다.",
    icon: "lock",
    owner: "준법 최종 승인자",
    agentIds: ["fraud", "compliance", "contract-check"],
  },
  {
    id: "customer-bank",
    title: "고객 안내·은행 연계",
    description: "RM 안내문, 통화 스크립트, 전세대출 상담, 보증보험 안내를 고객 접점으로 연결합니다.",
    icon: "link",
    owner: "RM 최종 승인자",
    agentIds: ["rm-copilot", "bank-linkage"],
  },
];

const agentReadinessGaps = [
  {
    title: "실데이터 연결",
    level: "최우선",
    icon: "database",
    detail: "등기부, HUG 보증 가능성, KB/국토부 실거래·시세, 은행 상담/심사 시스템 어댑터가 아직 데모 데이터입니다.",
  },
  {
    title: "내부 검토용 점수 산식",
    level: "최우선",
    icon: "gauge",
    detail: "전세가율, 권리관계, 소득 대비 부담, 보증보험 요건 확인 필요을 하나의 설명 가능한 점수로 합치는 기준표가 필요합니다.",
  },
  {
    title: "실행 실패 복구",
    level: "높음",
    icon: "repeat",
    detail: "AI 업무지원 실패, 외부 API 지연, 승인 SLA 초과 시 재시도·우회·상위 보고 규칙이 더 구체화되어야 합니다.",
  },
  {
    title: "권한과 보안",
    level: "높음",
    icon: "lock",
    detail: "RM, 준법, 지점 관리자별 접근권한, 개인정보 마스킹, 감사 로그 위변조 방지 정책을 실제 권한 모델로 연결해야 합니다.",
  },
  {
    title: "문서 자동 생성",
    level: "중간",
    icon: "clipboard",
    detail: "계약 전 체크리스트, 특약 문구, 고객 안내문이 화면 카드에 머무르지 않고 문서·알림·상담 이력으로 생성되어야 합니다.",
  },
  {
    title: "모델 품질 검증",
    level: "중간",
    icon: "check-square",
    detail: "오탐·미탐 테스트셋, 근거 출처 신뢰도 평가, 담당자 최종 확인 전/후 결과 비교 지표가 추가되면 심사용 완성도가 올라갑니다.",
  },
];

const initialCases = [
  {
    id: "jeonju-cafe",
    code: "JBG-104",
    customerName: "전주 중앙로 카페",
    affiliate: "전북은행",
    segment: "개인사업자",
    region: "전북 전주",
    industry: "카페",
    riskScore: 88,
    status: "Approval Pending",
    priority: "urgent",
    zeroHuman: "초안 작성 + 편집 후 발송",
    sla: "2h",
    owner: "Cashflow Triage Agent",
    stage: "pending_approval",
    due: "오늘 16:00",
    exposure: "운전자금 1.8억 · 카드매출 둔화",
    primaryPain: "금리 부담 + 매출 둔화",
    nextAction: "RM 콜백 초안과 상환 부담 점검",
    approvalTitle: "상환 부담 확인 콜백 + 정책금융 검토 안내",
    pains: ["cashflow-stress", "rate-shock", "policy-match"],
    rootCauses: ["금융비용 부담", "내수 침체", "디지털 신청 장벽"],
    evidenceIds: ["jb-ai-mou", "smallbiz-burden", "rate-shock", "digital-gap"],
    gates: [
      ["금융조건 최종 확인 표현 금지", "passed"],
      ["개인정보 마스킹", "passed"],
      ["RM 승인 후 고객 콜백", "pending"],
    ],
    agents: ["pain-radar", "cashflow", "policy", "rm-copilot", "compliance"],
    transcript: [
      "위험 신호 탐지 AI 업무지원: 소상공인 금융비용 부담과 상담 메모가 같은 방향입니다.",
      "상환 위험 분류 AI 업무지원: 상환 부담 점검 우선순위가 높습니다.",
      "준법 검토 AI 업무지원: 혜택 최종 확인 표현을 검토 가능성 중심으로 낮췄습니다.",
    ],
    audit: [
      ["09:14", "Case opened from RM note and small-business risk feed."],
      ["09:18", "Evidence Harvest attached 4 sources."],
      ["09:22", "Approval request created for RM callback draft."],
    ],
  },
  {
    id: "gwangju-wholesale",
    code: "JBG-118",
    customerName: "광주 송정 도소매",
    affiliate: "광주은행",
    segment: "개인사업자",
    region: "광주 광산구",
    industry: "도소매",
    riskScore: 72,
    status: "New",
    priority: "high",
    zeroHuman: "초안 작성 + 검토 후 승인",
    sla: "1d",
    owner: "Policy Match Agent",
    stage: "todo",
    due: "내일 10:00",
    exposure: "대환 상담 후보 · 서류 미비",
    primaryPain: "정책금융 탐색 비용",
    nextAction: "대환 가능성 검토와 서류 체크리스트",
    approvalTitle: "정책금융 상담 전 필요 서류 안내",
    pains: ["policy-match", "documentation", "digital-barrier"],
    rootCauses: ["지원제도 탐색 비용", "서류 누락", "디지털 신청 장벽"],
    evidenceIds: ["jb-network", "jb-ai-mou", "smallbiz-burden", "digital-gap"],
    gates: [
      ["지원 가능성 최종 확인 표현 금지", "pending"],
      ["필요 서류 안내만 허용", "passed"],
      ["RM 승인 후 안내", "pending"],
    ],
    agents: ["pain-radar", "policy", "rm-copilot"],
    transcript: [
      "정책금융 후보 검토 AI 업무지원: 사업자등록, 매출 증빙, 기존 대출 조건 확인이 필요합니다.",
      "RM 코파일럿 AI 업무지원: 고객 안내 문구를 최종 확인형이 아닌 검토형으로 작성했습니다.",
    ],
    audit: [["10:02", "Policy match case created from branch request."]],
  },
  {
    id: "gunsan-manufacturing",
    code: "JBG-127",
    customerName: "군산 부품 제조업",
    affiliate: "JB우리캐피탈",
    segment: "법인사업자",
    region: "전북 군산",
    industry: "제조",
    riskScore: 94,
    status: "Escalated",
    priority: "critical",
    zeroHuman: "정보 제공만",
    sla: "30m",
    owner: "Fraud Shield Agent",
    stage: "blocked",
    due: "즉시",
    exposure: "리스 계약 · 의심 콜백 URL",
    primaryPain: "보이스피싱 의심 콜백",
    nextAction: "고객 안내 보류 및 보안팀 상위 검토",
    approvalTitle: "보안팀 상위 보고 메모",
    pains: ["fraud", "callback-risk", "do-not-contact"],
    rootCauses: ["긴급 송금 요청", "외부 URL", "음성변조 의심"],
    evidenceIds: ["jb-network", "fraud-ai", "jb-ai-mou"],
    gates: [
      ["고객 대상 자동 발송 금지", "blocked"],
      ["보안팀 내부 상위 검토만 허용", "passed"],
      ["개인정보 마스킹", "passed"],
    ],
    agents: ["fraud", "compliance", "orchestrator"],
    transcript: [
      "이상거래 탐지·차단 AI 업무지원: 긴급 송금 요청과 콜백 URL이 결합되어 고위험입니다.",
      "업무지원 조율 기능: 고객 접촉은 담당자 확인 전 보류하고 내부 상위 검토로 연결합니다.",
    ],
    audit: [
      ["11:20", "Suspicious callback report converted to high-risk fraud case."],
      ["11:23", "Fraud Shield blocked customer-facing action."],
    ],
  },
  {
    id: "iksan-restaurant",
    code: "JBG-133",
    customerName: "익산 음식점",
    affiliate: "전북은행",
    segment: "개인사업자",
    region: "전북 익산",
    industry: "음식점",
    riskScore: 67,
    status: "Agent Running",
    priority: "medium",
    zeroHuman: "초안 작성 + 검토 후 승인",
    sla: "1d",
    owner: "Pain Radar Agent",
    stage: "in_progress",
    due: "내일 15:00",
    exposure: "매출 계절성 · 카드매출 변동",
    primaryPain: "매출 변동성",
    nextAction: "위험 원인 분류 후 RM 브리핑",
    approvalTitle: "RM 브리핑 노트",
    pains: ["cashflow-stress", "seasonality"],
    rootCauses: ["매출 계절성", "원재료비 변동"],
    evidenceIds: ["smallbiz-burden", "jb-network"],
    gates: [
      ["내부 브리핑만 허용", "passed"],
      ["고객 안내 전 RM 승인", "pending"],
    ],
    agents: ["pain-radar", "cashflow", "analytics"],
    transcript: [
      "위험 신호 탐지 AI 업무지원: 매출 변동과 원재료비 이슈를 분리해 확인 중입니다.",
    ],
    audit: [["13:08", "Case assigned to Pain Radar Agent."]],
  },
  {
    id: "seoul-jeonse-villa",
    code: "JBG-201",
    customerName: "서울 신축빌라 전세 예정",
    affiliate: "전북은행",
    segment: "청년 전세대출 고객",
    region: "서울 강서구",
    industry: "주거 · 전세계약",
    riskScore: 91,
    status: "Approval Pending",
    priority: "critical",
    zeroHuman: "분석 보조 + 담당자 최종 확인",
    sla: "오늘 18:00",
    owner: "Jeonse Shield Lead",
    stage: "pending_approval",
    due: "오늘 18:00",
    exposure: "전세보증금 2.35억 · 총자산 대비 78%",
    primaryPain: "전세가율 과다 + 권리관계 확인 필요",
    nextAction: "유의 매물 안내, 보증보험 확인, 전세대출 상담 연결",
    approvalTitle: "전세 위험 신호 검토 리포트 + 계약 전 확인 체크리스트",
    pains: ["jeonse-fraud", "price-ratio", "registry-risk", "guarantee-feasibility"],
    rootCauses: ["전세가율 과다", "주변 시세 대비 보증금 높음", "근저당 확인 필요", "보증보험 요건 확인 필요"],
    evidenceIds: ["hug-safe-jeonse", "molit-jeonse-policy", "jb-network"],
    gates: [
      ["법률 검토 최종 확인 표현 금지", "pending"],
      ["등기부/보증보험 원문 확인 필요", "pending"],
      ["은행 상담 연결 전 고객 동의", "passed"],
      ["특약 문구는 초안으로만 제공", "passed"],
    ],
    agents: ["jeonse-lead", "deposit-ratio", "registry-rights", "tenant-asset", "contract-check", "bank-linkage", "compliance"],
    transcript: [
      "전세가율 분석 AI 업무지원: 전세보증금이 주변 시세 대비 높아 전세가율 과다 후보입니다.",
      "등기 권리 분석 AI 업무지원: 등기부 원문에서 근저당, 신탁등기, 소유권 이전 이력 확인이 필요합니다.",
      "임차인 자산위험 AI 업무지원: 보증금이 고객 총자산의 대부분을 차지해 손실 민감도가 높습니다.",
      "은행 상담 연결 지원 기능: 전세대출 상담과 보증보험 요건 확인 안내를 담당자 승인 대기로 올렸습니다.",
    ],
    audit: [
      ["14:02", "Jeonse Shield case opened from pre-contract customer 상담."],
      ["14:04", "Deposit Ratio and Registry Rights Agents assigned."],
      ["14:08", "Approval request created for safe-contract guide and bank 상담 연결."],
    ],
  },
];

const routines = [
  ["평일 08:30", "지역 소상공인 위험 신호 스캔", "Pain Radar Agent", "enabled"],
  ["매일 10:00", "승인 대기 관리 건 SLA 점검", "업무지원 조율 기능", "enabled"],
  ["매일 14:00", "보이스피싱 경보 동기화", "Fraud Shield Agent", "enabled"],
  ["매일 15:00", "전세 유의 매물/상담 관리 건 점검", "Jeonse Shield Lead", "enabled"],
  ["금요일 17:00", "지점별 관리 건 묶음 리포트", "Analytics Agent", "paused"],
];

const goals = [
  ["Triage time", "RM이 원인과 후속 확인 항목을 파악하는 시간을 50% 단축", 64],
  ["Evidence traceability", "AI 업무지원 검토 100%에 근거 링크 또는 내부 이벤트 연결", 91],
  ["Approval safety", "고객 대상 행동 100% 담당자 승인 절차 점검 완료", 100],
  ["Followup care", "사후관리 누락 0건 · 후속 태스크 자동 등록 (고위험 사기 외부 발송도 승인 전 보류)", 100],
  ["Jeonse safe-contract", "전세 위험 관리 건 100%에 권리관계/보증보험/은행 연계 체크리스트 연결", 86],
];

const jeonseFeatures = [
  {
    id: "price-ratio",
    title: "전세가율 탐지",
    description: "매매 추정가 대비 전세보증금 비율과 주변 시세 대비 보증금 과다 여부를 묶어 전세가율 내부 검토용 점수를 만든다.",
    skills: ["jeonse-price-ratio", "local-market-compare"],
  },
  {
    id: "registry-risk",
    title: "권리관계 위험",
    description: "근저당, 압류, 가압류, 신탁등기, 단기 소유권 이전 신호를 등기부 기준으로 추출하고 보증보험 가입 가능성을 분류한다.",
    skills: ["registry-rights-scan", "ownership-transfer-delta", "guarantee-feasibility"],
  },
  {
    id: "asset-risk",
    title: "자산 리스크",
    description: "고객 총자산 대비 보증금 비중, 월 소득 대비 주거비 부담, 전세대출 상환 가능성과 계약 실패 시 손실 민감도를 분석한다.",
    skills: ["tenant-asset-exposure", "housing-cost-burden"],
  },
  {
    id: "contract-checklist",
    title: "계약 체크리스트",
    description: "계약 전 확인 서류, 임대인·중개사 확인 항목, 특약 문구 초안, 보증보험 가입 전 확인사항을 승인 대기 카드로 만든다.",
    skills: ["pre-contract-checklist", "special-clause-drafter", "compliance-guard"],
  },
  {
    id: "bank-linkage",
    title: "은행 연계",
    description: "전세대출 상담 연결, 보증보험 안내, 유의 매물 안내, 계약 전 확인 가이드를 RM 승인 후 고객에게 안내한다.",
    skills: ["bank-linkage-brief", "notification-brief", "approval-gate"],
  },
];

const appStorageKey = "jb-finance-support-state-v4";
const storageSchemaVersion = 4;

// 라이브 데모 opt-in seam. 기본 OFF = 현행 결정론적 동작(오프라인·verify_static 안전).
// ?live=1 → 전세 실거래가 실 호출 + 로컬모델 판단 텍스트. ?model=0 로 모델만 끔.
const RUNTIME_CONFIG = (() => {
  const p = new URLSearchParams(window.location.search);
  const live = p.get("live") === "1";
  return {
    liveApi: live,
    localModel: live && p.get("model") !== "0",
    apiProxyBase: "http://127.0.0.1:8020",
    ollamaBase: "http://127.0.0.1:11434",
  };
})();
window.RUNTIME_CONFIG = RUNTIME_CONFIG;
function isLive() { return RUNTIME_CONFIG.liveApi === true; }
const monthlyCostTrend = [
  ["3월", 218000],
  ["4월", 246000],
  ["5월", 292000],
  ["6월", 318000],
];
const costByWorkType = [
  ["위험 점검", 0.42],
  ["근거 수집", 0.24],
  ["승인·감사", 0.19],
  ["고객 안내", 0.15],
];
const sourceTagLabels = {
  public: "공공데이터",
  simulation: "시뮬레이션",
  estimate: "추정",
};
const approvalLevelMatrix = [
  { level: "L0", score: "0-39", customerNotice: "내부 기록만", contract: "내부 기록만", fraud: "모니터링", reason: "위험 낮음" },
  { level: "L1", score: "40-59", customerNotice: "RM 검토 후 승인", contract: "RM 확인", fraud: "보안 확인", reason: "단순 안내 가능" },
  { level: "L2", score: "60-79", customerNotice: "RM 편집 후 발송", contract: "체크리스트 확인", fraud: "고객 접촉 보류", reason: "고객 영향 있음" },
  { level: "L3", score: "80-89", customerNotice: "RM+준법 승인", contract: "법률/보증 원문 확인", fraud: "보안팀 승인", reason: "금융·계약 리스크 높음" },
  { level: "L4", score: "90-100", customerNotice: "승인 전 발송 보류", contract: "사람 결정 전 차단", fraud: "차단 검토 요청", reason: "치명 리스크" },
];
const demoProfiles = {
  jeonse: {
    caseId: "seoul-jeonse-villa",
    view: "jeonse",
    title: "GP-1 전세 보호",
    currentStep: 2,
    steps: ["관리 건 접수", "전세가율·권리관계 사전 점검", "내부 검토용 점수+근거", "특약 초안", "RM 승인", "감사 기록", "고객 안내 결과"],
    value: "보증금 손실 위험을 계약 전 확인하고, RM이 안전 계약 안내와 은행 상담을 승인할 수 있습니다.",
    action: "전세 사전 점검 화면 유지",
  },
  phishing: {
    caseId: "gunsan-manufacturing",
    view: "inbox",
    title: "GP-2 보이스피싱 차단",
    currentStep: 3,
    steps: ["알림 수신", "관리 건 전환", "사기 신호 분석", "차단 검토 요청", "담당자 최종 확인/수정 요청", "차단 결과", "감사 기록"],
    value: "고객 대상 외부 발송을 차단하고 보안팀 검토 근거를 남깁니다.",
    action: "승인 큐에서 차단 승인",
  },
  sme: {
    caseId: "jeonju-cafe",
    view: "approvals",
    title: "GP-3 소상공인 자금압박",
    currentStep: 3,
    steps: ["매출 둔화 신호", "위험 분류", "정책금융 체크리스트", "준법 검토", "RM 승인", "안내 발송 이력"],
    value: "RM이 정책금융 후보와 필요 서류를 빠르게 확인하고 상담 이력으로 남길 수 있습니다.",
    action: "승인 큐에서 RM 승인",
  },
};

let cases = JSON.parse(JSON.stringify(initialCases));
let selectedCaseId = "jeonju-cafe";
let selectedAgentId = null;
let selectedSkillId = null;
let selectedFeatureId = null;
let selectedEvidenceId = null;
let activeDetailType = "case";
let activeView = "dashboard";
let boardMode = "kanban";
let caseSearchQuery = "";
let approvalTab = "pending";
let lastDispatchResult = null;
let draggedCaseId = null;
let railFilter = "all";
let selectedRailRole = "";
let caseSequence = 201;
let runSequence = 1;
let propertiesOpen = true;
let collapsedPanelKeys = new Set(["case-agents", "case-approval", "case-evidence", "case-audit"]);
let modalState = null;
let modalError = "";
let toastMessage = "";
let toastTimer = null;
let scenarioResults = [];
let lastSavedAt = null;
let demoModeState = null;
let auditIntegrityResult = "";
let draggedNavId = null;
let draggedNavSection = null;
let navDragMoved = false;
let suppressNavClickUntil = 0;
let pointerNavDrag = null;
let agentRuns = [
  {
    id: "run-001",
    caseId: "seoul-jeonse-villa",
    caseCode: "JBG-201",
    agentName: "Jeonse Shield Lead",
    startedAt: "14:04",
    status: "approval_pending",
    command: "전세가율, 권리관계, 자산 노출, 보증보험 요건 확인 필요을 종합 사전 점검해줘.",
    log: [
      ["14:04", "Run started. Mounted skills: jeonse-price-ratio, registry-rights-scan, tenant-asset-exposure."],
      ["14:06", "Deposit Ratio Agent: 주변 시세 대비 보증금이 높아 전세가율 과다 후보로 분류."],
      ["14:08", "Approval Gate: 계약 전 확인 가이드 초안을 승인 큐에 등록."],
    ],
  },
];
let activity = [
  ["14:08", "Jeonse Shield Lead", "created approval", "JBG-201"],
  ["14:04", "Registry Rights Agent", "requested source document", "JBG-201"],
  ["13:12", "Cashflow Triage Agent", "created approval", "JBG-104"],
  ["13:08", "Pain Radar Agent", "checked out", "JBG-133"],
  ["11:23", "Fraud Shield Agent", "blocked outbound action", "JBG-127"],
  ["10:02", "Policy Match Agent", "created document checklist", "JBG-118"],
];

loadPersistedState();

const statusLabels = {
  New: "접수됨",
  "Agent Running": "검토 준비 중",
  "Approval Pending": "담당자 승인 대기",
  Approved: "검토 완료",
  Escalated: "상위 검토 필요",
  Rejected: "수정 요청",
  running: "AI 분석 중",
  pending_approval: "담당자 승인 대기",
  escalated: "상위 검토 필요",
  completed: "완료",
  rejected: "수정 요청",
  idle: "검토 대기",
  enabled: "사용 중",
  paused: "일시정지",
  passed: "점검 완료",
  pending: "검토 대기",
  blocked: "승인 전 보류",
  active: "활성",
  high: "높음",
  medium: "중간",
  low: "낮음",
  urgent: "우선 검토",
  critical: "즉시 검토",
};

const agentNameLabels = {
  "업무지원 조율 기능": "업무지원 조율 기능",
  "Pain Radar Agent": "주의 신호 조기확인 기능",
  "Cashflow Triage Agent": "상환 부담 검토 기능",
  "Policy Match Agent": "정책금융 후보 검토 기능",
  "Fraud Shield Agent": "이상거래 유의 신호 확인 기능",
  "RM Copilot Agent": "RM 상담 지원 기능",
  "Compliance Guard Agent": "준법 표현 검토 기능",
  "Analytics Agent": "관리 현황 분석 기능",
  "Jeonse Shield Lead": "전세위험 관리 리드",
  "Deposit Ratio Agent": "전세가율 확인 기능",
  "Registry Rights Agent": "등기상 유의 신호 확인 기능",
  "Tenant Asset Risk Agent": "임차인 자산노출 검토 기능",
  "Contract Checklist Agent": "계약 전 확인 기능",
  "Bank Linkage Agent": "은행 상담 연결 지원 기능",
  "Human RM Lead": "RM 최종 승인자",
  "Human Compliance Lead": "준법 최종 승인자",
  "Compliance Guard": "준법 검토 AI 업무지원",
  "Approval Gate": "담당자 승인 절차",
  "Human RM": "RM 담당자",
  "Human reviewer": "검토 담당자",
};

const skillLabels = {
  "case-os-core": "관리 건 운영 기능",
  "evidence-harvest": "근거 수집",
  "source-ranker": "출처 신뢰도 평가",
  "pain-classifier": "주의 신호 분류",
  "cashflow-stress": "상환 부담 검토",
  "rate-relief": "금리 완화 검토",
  "policy-match": "정책금융 후보 검토",
  "document-checklist": "서류 체크리스트",
  "fraud-shield": "사기 유의 신호 확인",
  "do-not-contact-rule": "승인 전 고객 접촉 보류",
  "notification-brief": "안내문 초안",
  "compliance-guard": "준법 검토",
  "approval-gate": "담당자 승인 절차",
  "audit-ledger": "감사 기록",
  "portfolio-signal": "포트폴리오 신호",
  "trend-summary": "추세 요약",
  "case-metrics": "관리 건 지표",
  "tone-control": "톤 조정",
  "privacy-redaction": "개인정보 마스킹",
  "claim-limiter": "최종 확인 표현 제한",
  "risk-banding": "주의 수준 분류",
  "eligibility-explain": "요건 설명",
  "escalation-memo": "상위 보고 메모",
  "next-best-action": "후속 확인 항목 제안",
  "jeonse-price-ratio": "전세가율 확인",
  "local-market-compare": "주변 시세 비교",
  "registry-rights-scan": "등기상 유의 신호 확인",
  "ownership-transfer-delta": "소유권 이전 이력 확인",
  "guarantee-feasibility": "보증보험 요건 확인 필요",
  "tenant-asset-exposure": "임차인 자산노출",
  "housing-cost-burden": "주거비 부담 분석",
  "pre-contract-checklist": "계약 전 체크리스트",
  "special-clause-drafter": "특약 검토용 문구 초안",
  "bank-linkage-brief": "은행 연계 안내",
};

const tagLabels = {
  "cashflow-stress": "상환 부담",
  "rate-shock": "금리 충격",
  "policy-match": "정책금융",
  documentation: "서류 준비",
  "digital-barrier": "디지털 신청 장벽",
  fraud: "사기 유의 신호",
  "callback-risk": "의심 콜백 확인",
  "do-not-contact": "승인 전 접촉 보류",
  seasonality: "계절성",
  "jeonse-fraud": "전세 관련 위험 신호",
  "price-ratio": "전세가율",
  "registry-risk": "권리관계",
  "guarantee-feasibility": "보증보험 요건 확인",
  triage: "초기 분류",
};

const typeLabels = {
  orchestration: "운영 조율",
  research: "근거 탐색",
  reasoning: "검토",
  finance: "금융",
  operations: "운영",
  risk: "주의 신호 관리",
  communication: "고객 안내",
  compliance: "준법",
  control: "통제",
  analytics: "분석",
  "jeonse-risk": "전세 유의 신호",
  "legal-risk": "권리/법무 확인 항목",
  guarantee: "보증",
  "asset-risk": "자산노출 검토",
  contract: "계약",
  banking: "은행 연계",
  "housing-risk": "주거 유의 신호",
  orchestrator: "업무 조율",
};

const approvalLabels = {
  "internal only": "내부 전용",
  "RM review": "RM 검토",
  "blocks external action": "고객 영향 조치 보류",
  mandatory: "필수 통제",
  "approval required": "담당자 확인 필요",
  "human/legal review": "담당자/법무 검토 필요",
  "advisor review": "상담자 검토",
  "legal review": "법무/준법 검토 필요",
  "RM approval": "RM 확인 필요",
};

const sourceTypeLabels = {
  "JB Official": "JB 공식자료",
  News: "기사",
  Policy: "정책자료",
  Official: "공식자료",
};

const actionLabels = {
  "created approval": "승인 요청 생성",
  "requested source document": "원문 자료 확인 요청",
  "checked out": "검토 착수",
  "blocked outbound action": "승인 전 발송 보류",
  "created document checklist": "서류 체크리스트 생성",
  "resumed routine": "루틴 재개",
  "paused routine": "루틴 일시정지",
  "escalated case": "상위 검토 요청",
  "approved action": "고객 안내 승인",
  "rejected draft": "초안 수정 요청",
  "dispatched command": "AI 분석 요청",
  "registered case": "관리 건 접수",
  "changed status": "상태 변경",
  "saved result": "검토 결과 저장",
  "created follow-up task": "후속 확인 항목 생성",
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function iconSvg(name) {
  const icons = {
    "layout-dashboard": '<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path>',
    "file-text": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M8 13h8"></path><path d="M8 17h6"></path>',
    "check-square": '<path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
    activity: '<path d="M22 12h-4l-3 8L9 4l-3 8H2"></path>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path>',
    bot: '<rect x="5" y="8" width="14" height="10" rx="2"></rect><path d="M12 8V4"></path><path d="M8 4h8"></path><circle cx="9" cy="13" r="1"></circle><circle cx="15" cy="13" r="1"></circle><path d="M9 18v2"></path><path d="M15 18v2"></path>',
    network: '<rect x="9" y="2" width="6" height="6" rx="1.5"></rect><rect x="3" y="16" width="6" height="6" rx="1.5"></rect><rect x="15" y="16" width="6" height="6" rx="1.5"></rect><path d="M12 8v4"></path><path d="M6 16l6-4 6 4"></path>',
    "refresh-cw": '<path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path><path d="M3 16h6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M15 8h6"></path>',
    target: '<circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1"></circle>',
    puzzle: '<path d="M14 7V5a3 3 0 1 0-6 0v2H5a2 2 0 0 0-2 2v3h2a3 3 0 1 1 0 6H3v1a2 2 0 0 0 2 2h6v-2a3 3 0 1 1 6 0v2h2a2 2 0 0 0 2-2v-5h-2a3 3 0 1 1 0-6h2V9a2 2 0 0 0-2-2z"></path>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 3v6h6"></path><path d="M12 7v5l3 2"></path>',
    wallet: '<path d="M20 7H5a2 2 0 0 1 0-4h13v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H5"></path><path d="M16 14h2"></path>',
    settings: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V22a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 18l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"></path>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"></ellipse><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"></path><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"></path>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"></path><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"></path>',
    gauge: '<path d="M21 13a9 9 0 1 0-18 0"></path><path d="M12 13l4-5"></path><path d="M5 19h14"></path>',
    clipboard: '<rect x="4" y="4" width="16" height="18" rx="2"></rect><path d="M9 2h6v4H9z"></path><path d="M8 12h8"></path><path d="M8 16h6"></path>',
    repeat: '<path d="m17 2 4 4-4 4"></path><path d="M3 11V9a3 3 0 0 1 3-3h15"></path><path d="m7 22-4-4 4-4"></path><path d="M21 13v2a3 3 0 0 1-3 3H3"></path>',
    "chevron-down": '<path d="m6 9 6 6 6-6"></path>',
    "chevron-right": '<path d="m9 18 6-6-6-6"></path>',
    "panel-close": '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M15 4v16"></path><path d="m10 9-3 3 3 3"></path>',
    "panel-open": '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M15 4v16"></path><path d="m7 9 3 3-3 3"></path>',
    alert: '<path d="M12 9v4"></path><path d="M12 17h.01"></path><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path>',
    x: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.9"></path><path d="M16 3.1a4 4 0 0 1 0 7.8"></path>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"></circle><path d="M12 12l9-9"></path><path d="M16 7l3 3"></path>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name] || icons.folder}</svg>`;
}

function displayFrom(map, value) {
  return map[value] || value;
}

function statusLabel(status) {
  return displayFrom(statusLabels, status);
}

function agentLabel(value) {
  return displayFrom(agentNameLabels, value && value.name ? value.name : value);
}

function skillLabel(slug) {
  return displayFrom(skillLabels, slug);
}

function tagLabel(value) {
  return displayFrom(tagLabels, value);
}

function typeLabel(value) {
  return displayFrom(typeLabels, value);
}

function approvalLabel(value) {
  return displayFrom(approvalLabels, value);
}

function sourceTypeLabel(value) {
  return displayFrom(sourceTypeLabels, value);
}

function actionLabel(value) {
  return displayFrom(actionLabels, value);
}

function activeDetailLabel(value) {
  return {
    case: "관리 건",
    agent: "AI 업무지원",
    skill: "업무 기능",
    feature: "기능",
    view: "화면",
  }[value] || value;
}

function localizeLine(text) {
  let value = String(text);
  const exact = {
    "Case opened from RM note and small-business risk feed.": "RM 메모와 소상공인 위험 피드에서 관리 건을 열었습니다.",
    "Evidence Harvest attached 4 sources.": "근거 수집 업무 기능이 4개 출처를 연결했습니다.",
    "Approval request created for RM callback draft.": "RM 콜백 초안에 대한 승인 요청을 생성했습니다.",
    "Policy match case created from branch request.": "영업점 요청에서 정책금융 후보 검토 관리 건을 생성했습니다.",
    "Suspicious callback report converted to high-risk fraud case.": "의심 콜백 제보를 고위험 사기 관리 건으로 전환했습니다.",
    "Fraud Shield blocked customer-facing action.": "이상거래 유의 신호 확인 기능이 고객 대상 행동을 보류했습니다.",
    "Case assigned to Pain Radar Agent.": "주의 신호 조기확인 기능에 관리 건을 배정했습니다.",
    "Jeonse Shield case opened from pre-contract customer 상담.": "계약 전 고객 상담에서 전세 안심 점검 관리 건을 열었습니다.",
    "Deposit Ratio and Registry Rights Agents assigned.": "전세가율 확인 기능과 등기상 유의 신호 확인 기능을 배정했습니다.",
    "Approval request created for safe-contract guide and bank 상담 연결.": "계약 전 확인 가이드와 은행 상담 연결 승인 요청을 생성했습니다.",
    "Run started. Mounted skills: jeonse-price-ratio, registry-rights-scan, tenant-asset-exposure.": "실행 시작: 전세가율 분석, 등기 권리 스캔, 임차인 자산노출 업무 기능을 장착했습니다.",
    "Approval Gate: Draft action is ready for human review.": "담당자 승인 절차: 조치 초안이 담당자 검토 단계에 들어갔습니다.",
    "Fraud Shield: Customer-facing action remains blocked. Internal escalation only.": "사기 차단: 고객 대상 행동은 계속 차단하고 내부 상위 검토만 허용합니다.",
    "Human RM approved the action. Run closed.": "RM 담당자가 조치를 승인했고 실행을 종료했습니다.",
    "Human reviewer rejected the draft. Run closed.": "검토 담당자가 초안을 수정 요청했고 실행을 종료했습니다.",
    "Triage time": "분류 시간 단축",
    "Evidence traceability": "근거 추적성",
    "Approval safety": "승인 안전성",
    "Followup care": "사후관리 완결성",
    "Jeonse safe-contract": "전세 안전계약",
  };
  if (exact[value]) return exact[value];
  Object.entries(agentNameLabels).forEach(([raw, label]) => {
    value = value.replaceAll(raw, label);
  });
  Object.entries(skillLabels).forEach(([raw, label]) => {
    value = value.replaceAll(raw, label);
  });
  return value
    .replaceAll("AgentRun", "AI 분석 요청")
    .replaceAll("Approval Gate", "담당자 승인 절차")
    .replaceAll("Evidence Harvest", "근거 수집")
    .replaceAll("Run started", "실행 시작")
    .replaceAll("Mounted skills", "장착 업무 기능")
    .replaceAll("case context", "관리 건 맥락")
    .replaceAll("customer-facing", "고객 대상")
    .replaceAll("Customer-facing", "고객 대상")
    .replaceAll("case", "관리 건")
    .replaceAll("Case", "관리 건")
    .replaceAll("Agent", "AI 업무지원")
    .replaceAll("Run", "실행")
    .replaceAll("queue", "대기열")
    .replaceAll("portfolio", "포트폴리오")
    .replaceAll("callback", "콜백")
    .replaceAll("pain signal", "위험 신호")
    .replaceAll("pain", "위험 원인")
    .replaceAll("briefing", "브리핑")
    .replaceAll("Internal escalation only", "내부 상위 검토만 허용")
    .replaceAll("Kanban status changed", "보드 상태 변경")
    .replaceAll("Kanban status move", "보드 상태 이동")
    .replaceAll("IN PROGRESS", "진행 중")
    .replaceAll("completed and approval policy evaluated", "완료 및 승인 정책 검토")
    .replaceAll("started:", "시작:");
}

function slugKey(...parts) {
  return parts.join("-").toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "");
}

function currentCase() {
  return cases.find((item) => item.id === selectedCaseId) || cases[0];
}

function currentAgent() {
  return agents.find((agent) => agent.id === selectedAgentId) || null;
}

function currentSkill() {
  return skillRack.find((skill) => skill.slug === selectedSkillId) || null;
}

function currentFeature() {
  return jeonseFeatures.find((feature) => feature.id === selectedFeatureId) || null;
}

function visibleCases() {
  if (railFilter === "all") return cases;
  return cases.filter((item) => item.affiliate === railFilter);
}

function casesByAgent(agentId) {
  const agent = agents.find((entry) => entry.id === agentId);
  if (!agent) return [];
  return cases.filter((item) => item.agents.includes(agentId) || item.owner === agent.name);
}

function agentsBySkill(slug) {
  return agents.filter((agent) => agent.skills.includes(slug));
}

function casesBySkill(slug) {
  const agentIds = agentsBySkill(slug).map((agent) => agent.id);
  return cases.filter((item) => item.agents.some((id) => agentIds.includes(id)));
}

function skillsByCase(item) {
  const mounted = new Set();
  item.agents.forEach((agentId) => {
    const agent = agents.find((entry) => entry.id === agentId);
    if (agent) agent.skills.forEach((slug) => mounted.add(slug));
  });
  return Array.from(mounted);
}

function caseAgents(item) {
  return item.agents.map((agentId) => agents.find((agent) => agent.id === agentId)).filter(Boolean);
}

function agentsByFeature(feature) {
  const related = new Set();
  feature.skills.forEach((slug) => {
    agentsBySkill(slug).forEach((agent) => related.add(agent.id));
  });
  return agents.filter((agent) => related.has(agent.id));
}

function casesByEvidence(entryId) {
  return cases.filter((item) => item.evidenceIds.includes(entryId));
}

function statusClass(status) {
  if (status === "Agent Running" || status === "running") return "status-running";
  if (status === "Approval Pending" || status === "pending_approval" || status === "pending") return "status-pending";
  if (status === "Approved" || status === "completed" || status === "passed") return "status-approved";
  if (status === "Escalated" || status === "Rejected" || status === "escalated" || status === "rejected" || status === "blocked") return "status-escalated";
  return "status-new";
}

function statusToColumn(status) {
  if (status === "Approved") return "done";
  if (status === "Approval Pending") return "review";
  if (status === "Agent Running") return "in_progress";
  if (status === "Escalated" || status === "Rejected") return "blocked";
  return "new";
}

function columnToStatus(column) {
  const statuses = {
    new: "New",
    in_progress: "Agent Running",
    review: "Approval Pending",
    blocked: "Escalated",
    done: "Approved",
  };
  return statuses[column] || "New";
}

function searchableCases() {
  const query = caseSearchQuery.trim().toLowerCase();
  return visibleCases().filter((item) => {
    if (!query) return true;
    return [
      item.code,
      item.customerName,
      item.affiliate,
      item.region,
      item.industry,
      item.primaryPain,
      item.owner,
      ...item.pains,
      ...item.rootCauses,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

function counts() {
  const scoped = visibleCases();
  return {
    dashboard: scoped.length,
    inbox: scoped.filter((item) => item.status === "Escalated" || item.status === "Approval Pending").length,
    cases: scoped.length,
    approvals: scoped.filter((item) => item.status === "Approval Pending").length,
    runs: agentRuns.filter((run) => run.status === "running").length || agentRuns.length,
    jeonse: scoped.filter((item) => item.pains.includes("jeonse-fraud")).length,
    agents: agents.length,
    orgchart: agents.length,
    skills: skillRack.length,
    plugins: (typeof pluginRegistry !== "undefined" ? pluginRegistry.length : 0),
    routines: routines.filter((item) => item[3] === "enabled").length,
    goals: goals.length,
    activity: activity.length,
    budget: agents.reduce((sum, agent) => sum + agent.spent, 0),
    settings: 3,
    "rm-dashboard": 8,
    "corporate-credit-dashboard": 8,
    "jeonse-protection-dashboard": 8,
    "consumer-protection-dashboard": 8,
    "fds-dashboard": 8,
    "compliance-dashboard": 8,
  };
}

function restoreNavigationOrder() {
  let storedOrder = null;
  try {
    storedOrder = JSON.parse(localStorage.getItem(NAV_ORDER_STORAGE_KEY) || "null");
  } catch (error) {
    storedOrder = null;
  }
  if (!storedOrder || typeof storedOrder !== "object") return;

  navigation.forEach((group) => {
    const savedIds = Array.isArray(storedOrder[group.section]) ? storedOrder[group.section] : [];
    if (!savedIds.length) return;
    const originalIndex = new Map(group.items.map((item, index) => [item.id, index]));
    const savedIndex = new Map(savedIds.map((id, index) => [id, index]));
    group.items.sort((a, b) => {
      const aSaved = savedIndex.has(a.id);
      const bSaved = savedIndex.has(b.id);
      if (aSaved && bSaved) return savedIndex.get(a.id) - savedIndex.get(b.id);
      if (aSaved) return -1;
      if (bSaved) return 1;
      return originalIndex.get(a.id) - originalIndex.get(b.id);
    });
  });
}

function saveNavigationOrder() {
  const order = Object.fromEntries(navigation.map((group) => [group.section, group.items.map((item) => item.id)]));
  try {
    localStorage.setItem(NAV_ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch (error) {
    // Storage can be unavailable in restricted browser contexts; dragging should still work in-session.
  }
}

function findNavigationItem(id) {
  for (let groupIndex = 0; groupIndex < navigation.length; groupIndex += 1) {
    const itemIndex = navigation[groupIndex].items.findIndex((item) => item.id === id);
    if (itemIndex >= 0) return { groupIndex, itemIndex };
  }
  return null;
}

function moveNavigationItem(sourceId, targetId, placement) {
  const source = findNavigationItem(sourceId);
  const target = findNavigationItem(targetId);
  if (!source || !target || sourceId === targetId || source.groupIndex !== target.groupIndex) return false;

  const items = navigation[source.groupIndex].items;
  const [moved] = items.splice(source.itemIndex, 1);
  const targetIndex = items.findIndex((item) => item.id === targetId);
  if (targetIndex < 0) {
    items.splice(source.itemIndex, 0, moved);
    return false;
  }

  items.splice(placement === "after" ? targetIndex + 1 : targetIndex, 0, moved);
  saveNavigationOrder();
  return true;
}

function navDropPlacement(button, clientY) {
  const rect = button.getBoundingClientRect();
  return clientY > rect.top + rect.height / 2 ? "after" : "before";
}

function clearNavigationDropState() {
  document.querySelectorAll(".nav-button.is-drop-before, .nav-button.is-drop-after, .nav-button.is-drop-blocked").forEach((button) => {
    button.classList.remove("is-drop-before", "is-drop-after", "is-drop-blocked");
  });
}

function resetNavigationDragState() {
  clearNavigationDropState();
  document.querySelectorAll(".nav-button.is-dragging").forEach((button) => button.classList.remove("is-dragging"));
  if (navDragMoved) suppressNavClickUntil = Date.now() + 250;
  draggedNavId = null;
  draggedNavSection = null;
  navDragMoved = false;
  pointerNavDrag = null;
}

function markNavigationDropTarget(button, placement) {
  clearNavigationDropState();
  if (!button || button.dataset.navSection !== draggedNavSection) {
    if (button) button.classList.add("is-drop-blocked");
    return;
  }
  button.classList.add(placement === "after" ? "is-drop-after" : "is-drop-before");
}

function navigationButtonFromPoint(clientX, clientY, sourceId) {
  return Array.from(document.querySelectorAll("#nav-list .nav-button[data-view]")).find((button) => {
    if (button.dataset.view === sourceId) return false;
    const rect = button.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  });
}

function beginNavigationPointerDrag(button, event) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  pointerNavDrag = {
    sourceId: button.dataset.view,
    section: button.dataset.navSection,
    sourceButton: button,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    targetId: null,
    placement: "before",
    moved: false,
  };
  try {
    button.setPointerCapture(event.pointerId);
  } catch (error) {
    // Pointer capture is a progressive enhancement; normal pointer events still work without it.
  }
}

function updateNavigationPointerDrag(event) {
  if (!pointerNavDrag) return;
  const distance = Math.hypot(event.clientX - pointerNavDrag.startX, event.clientY - pointerNavDrag.startY);
  if (!pointerNavDrag.moved && distance < 8) return;

  event.preventDefault();
  pointerNavDrag.moved = true;
  navDragMoved = true;
  draggedNavId = pointerNavDrag.sourceId;
  draggedNavSection = pointerNavDrag.section;
  pointerNavDrag.sourceButton.classList.add("is-dragging");

  const target = navigationButtonFromPoint(event.clientX, event.clientY, pointerNavDrag.sourceId);
  if (!target || target.dataset.view === pointerNavDrag.sourceId) {
    clearNavigationDropState();
    pointerNavDrag.targetId = null;
    return;
  }

  const placement = navDropPlacement(target, event.clientY);
  pointerNavDrag.targetId = target.dataset.view;
  pointerNavDrag.placement = placement;
  markNavigationDropTarget(target, placement);
}

function finishNavigationPointerDrag(event) {
  if (!pointerNavDrag) return;
  const drag = pointerNavDrag;
  if (drag.sourceButton.hasPointerCapture?.(drag.pointerId)) {
    try {
      drag.sourceButton.releasePointerCapture(drag.pointerId);
    } catch (error) {
      // Ignore release failures from browsers that already ended capture.
    }
  }
  const moved = drag.moved && drag.targetId ? moveNavigationItem(drag.sourceId, drag.targetId, drag.placement) : false;
  if (drag.moved) suppressNavClickUntil = Date.now() + 250;
  resetNavigationDragState();
  if (moved) renderNavigation();
}

function renderNavigation() {
  const currentCounts = counts();
  const navList = document.getElementById("nav-list");
  navList.innerHTML = navigation
    .map(
      (group) => `
        <div class="nav-section">
          <div class="nav-section-title">${escapeHtml(group.section)}</div>
          ${group.items
            .map(
              (item, index) => `
                <button class="nav-button ${activeView === item.id ? "is-active" : ""}" type="button" data-nav-draggable="true" data-view="${escapeHtml(item.id)}" data-nav-section="${escapeHtml(group.section)}" data-nav-index="${index}" title="${escapeHtml(`${group.section} · ${item.label} · ${item.description} · 같은 범주 안에서 드래그 정렬 가능`)}" aria-label="${escapeHtml(`${group.section} ${item.label}: ${item.description}. 같은 범주 안에서 드래그해서 순서를 바꿀 수 있습니다.`)}">
                  <span class="nav-button-main">
                    <span class="nav-icon" aria-hidden="true">${iconSvg(item.icon)}</span>
                    <span class="nav-text">
                      <span class="nav-label">${escapeHtml(item.label)}</span>
                      <span class="nav-hint">${escapeHtml(item.description)}</span>
                    </span>
                  </span>
                  <span class="nav-count">${escapeHtml(currentCounts[item.countKey])}</span>
                </button>
              `,
            )
            .join("")}
        </div>
      `,
    )
    .join("");

  const navButtons = navList.querySelectorAll("[data-view]");
  navButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      if (Date.now() < suppressNavClickUntil) {
        event.preventDefault();
        return;
      }
      activeView = button.dataset.view;
      activeDetailType = defaultDetailForView(activeView);
      selectDefaultCaseForView(activeView);
      render();
    });

    button.addEventListener("dragstart", (event) => {
      draggedNavId = button.dataset.view;
      draggedNavSection = button.dataset.navSection;
      navDragMoved = false;
      button.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", draggedNavId);
    });

    button.addEventListener("dragenter", (event) => {
      if (!draggedNavId || button.dataset.view === draggedNavId) return;
      const placement = navDropPlacement(button, event.clientY);
      markNavigationDropTarget(button, placement);
    });

    button.addEventListener("dragover", (event) => {
      if (!draggedNavId || button.dataset.view === draggedNavId) return;
      if (button.dataset.navSection !== draggedNavSection) {
        event.dataTransfer.dropEffect = "none";
        markNavigationDropTarget(button, "before");
        return;
      }
      event.preventDefault();
      navDragMoved = true;
      const placement = navDropPlacement(button, event.clientY);
      event.dataTransfer.dropEffect = "move";
      markNavigationDropTarget(button, placement);
    });

    button.addEventListener("drop", (event) => {
      if (!draggedNavId || button.dataset.view === draggedNavId) return;
      event.preventDefault();
      const placement = navDropPlacement(button, event.clientY);
      const moved = moveNavigationItem(draggedNavId, button.dataset.view, placement);
      suppressNavClickUntil = Date.now() + 250;
      resetNavigationDragState();
      if (moved) renderNavigation();
    });

    button.addEventListener("dragend", resetNavigationDragState);
    button.addEventListener("pointerdown", (event) => beginNavigationPointerDrag(button, event));
    button.addEventListener("pointermove", updateNavigationPointerDrag);
    button.addEventListener("pointerup", finishNavigationPointerDrag);
    button.addEventListener("pointercancel", resetNavigationDragState);
  });
}

function renderShellState() {
  const shell = document.querySelector(".app-shell");
  const toggle = document.getElementById("properties-toggle");
  if (shell) {
    shell.classList.toggle("properties-collapsed", !propertiesOpen);
  }
  if (!toggle) return;
  toggle.setAttribute("aria-expanded", String(propertiesOpen));
  toggle.innerHTML = `${iconSvg(propertiesOpen ? "panel-close" : "panel-open")}<span>${propertiesOpen ? "상세 패널 닫기" : "상세 패널 열기"}</span>`;
}

function defaultDetailForView(view) {
  if ((view === "agents" || view === "orgchart") && selectedAgentId) return "agent";
  if (view === "skills" && selectedSkillId) return "skill";
  if (view === "jeonse" && selectedFeatureId) return "feature";
  const summaryViews = [
    "agents",
    "orgchart",
    "skills",
    "routines",
    "goals",
    "activity",
    "budget",
    "settings",
    "rm-dashboard",
    "corporate-credit-dashboard",
    "jeonse-protection-dashboard",
    "consumer-protection-dashboard",
    "fds-dashboard",
    "compliance-dashboard",
  ];
  if (summaryViews.includes(view)) return "view";
  return "case";
}

function selectDefaultCaseForView(view) {
  const selected = currentCase();
  const matchers = {
    inbox: (item) => item.status === "Escalated" || item.status === "Approval Pending",
    approvals: (item) => item.status === "Approval Pending",
    runs: (item) => item.status === "Agent Running" || item.status === "Approval Pending",
    jeonse: (item) => item.pains.includes("jeonse-fraud"),
  };
  const matcher = matchers[view];
  if (!matcher || matcher(selected)) return;
  const next = visibleCases().find(matcher) || cases.find(matcher);
  if (next) selectedCaseId = next.id;
}

function renderMetrics() {
  const metricGrid = document.getElementById("metric-grid");
  if (!metricGrid) return;
  const data = buildDashboardData();
  const cards = [
    ["전세 안심 점검", `${data.jeonseRisk.filter((item) => item.riskScore >= 85).length}건`, "전세가율·권리관계·보증보험 요건을 우선 확인"],
    ["담당자 승인 대기", `${data.pending.length}건`, "고객 대상 행동 전 RM/준법 검토 필요"],
    ["고객 영향 조치 보류", `${data.blocked.length}건`, "사기·준법 리스크로 담당자 확인 전 발송 보류"],
    ["근거 연결률", `${data.evidenceRate}%`, "검토 근거가 연결된 관리 건 비율"],
  ];
  metricGrid.innerHTML = cards
    .map(
      ([label, value, detail]) => `
        <article class="metric-card">
          <div class="metric-icon" aria-hidden="true">${iconSvg(metricIcon(label))}</div>
          <strong>${escapeHtml(value)}</strong>
          <span>${escapeHtml(label)}</span>
          <p>${escapeHtml(detail)}</p>
        </article>
      `,
    )
    .join("");
}

function metricIcon(label) {
  return {
    "전세 안심 점검": "shield",
    "담당자 승인 대기": "check-square",
    "고객 영향 조치 보류": "lock",
    "근거 연결률": "database",
  }[label] || "layout-dashboard";
}

function renderBoard() {
  const caseBoard = document.getElementById("case-board");
  if (!caseBoard) return;
  const scoped = searchableCases();

  if (boardMode === "list") {
    caseBoard.className = "case-board case-list-board";
    const queued = scoped.slice().sort((a, b) => b.riskScore - a.riskScore);
    caseBoard.innerHTML = `
      <div class="case-list">
      ${queued.length ? groupedCaseList(queued) : '<div class="empty-state">검색 조건에 맞는 관리 건이 없습니다</div>'}
      </div>
    `;
    return;
  }

  caseBoard.className = "case-board hagent-kanban";
  const columns = [
    ["new", "접수됨"],
    ["in_progress", "검토 준비 중"],
    ["review", "담당자 승인 대기"],
    ["done", "검토 완료"],
    ["blocked", "보류"],
  ];

  caseBoard.innerHTML = columns
    .map(([key, label]) => {
      const items = scoped.filter((item) => statusToColumn(item.status) === key);
      return `
        <section class="board-column" data-drop-status="${escapeHtml(key)}">
          <h4><span>${label}</span><span>${items.length}</span></h4>
          ${
            items.length
              ? items.map(renderCaseCard).join("")
              : '<div class="empty-state">대기 중인 관리 건이 없습니다</div>'
          }
        </section>
      `;
    })
    .join("");
}

function groupedCaseList(items) {
  const groups = [
    ["approval", "담당자 승인 대기", (item) => item.status === "Approval Pending"],
    ["running", "AI 분석 요청 중", (item) => item.status === "Agent Running"],
    ["risk", "고위험 점검", (item) => item.riskScore >= 85 && item.status !== "Approval Pending"],
    ["new", "접수됨/분류", (item) => item.status === "New" && item.riskScore < 85],
    ["closed", "검토 완료/보류", (item) => ["Approved", "Escalated", "Rejected"].includes(item.status)],
  ];
  const seen = new Set();
  const markup = groups
    .map(([key, label, matcher]) => {
      const matched = items.filter((item) => !seen.has(item.id) && matcher(item));
      matched.forEach((item) => seen.add(item.id));
      if (!matched.length) return "";
      return `
        <section class="case-list-group" data-case-group="${escapeHtml(key)}">
          <div class="case-list-heading">
            <strong>${escapeHtml(label)}</strong>
            <span>${matched.length}</span>
          </div>
          <div class="case-list-rows">
            ${matched.map(renderCaseRow).join("")}
          </div>
        </section>
      `;
    })
    .join("");
  return markup || '<div class="empty-state">표시할 관리 건이 없습니다</div>';
}

function renderCaseRow(item) {
  return `
    <button class="case-row ${item.id === selectedCaseId ? "is-active" : ""}" type="button" data-case-id="${escapeHtml(item.id)}">
      <span class="case-row-code">${escapeHtml(item.code)}</span>
      <span class="case-row-main">
        <strong>${escapeHtml(item.customerName)}</strong>
        <small>${escapeHtml(item.region)} · ${escapeHtml(item.segment)} · ${escapeHtml(item.primaryPain)}</small>
      </span>
      <span class="case-row-owner">${escapeHtml(agentLabel(item.owner))}</span>
      <span class="status-pill ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span>
      <span class="risk-score">${item.riskScore}</span>
    </button>
  `;
}

function renderCaseCard(item) {
  return `
    <button class="case-card ${item.id === selectedCaseId ? "is-active" : ""}" type="button" draggable="true" data-draggable-case="${escapeHtml(item.id)}" data-case-id="${escapeHtml(item.id)}">
      <span class="mini-line">
        <span>${escapeHtml(item.code)}</span>
        <span>${escapeHtml(item.affiliate)}</span>
        <span>처리 기한 ${escapeHtml(item.sla)}</span>
      </span>
      <strong>${escapeHtml(item.customerName)}</strong>
      <span class="case-meta">
        <span>${escapeHtml(item.region)}</span>
        <span>${escapeHtml(item.segment)}</span>
      </span>
      <span class="status-pill ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span>
      <div class="risk-bar"><i style="width:${item.riskScore}%"></i></div>
      <div class="tag-row">${item.pains.map((pain) => `<span class="tag">${escapeHtml(tagLabel(pain))}</span>`).join("")}</div>
    </button>
  `;
}

function renderLiveRuns() {
  const liveRuns = document.getElementById("live-runs");
  const liveCount = document.getElementById("live-count");
  if (!liveRuns || !liveCount) return;
  const live = visibleCases().filter((item) => item.status === "Agent Running" || item.status === "Approval Pending");
  liveCount.textContent = live.length;
  liveRuns.innerHTML = live
    .map((item) => {
      const progress = item.status === "Approval Pending" ? 86 : 52;
      return `
        <article class="run-card is-clickable" data-case-id="${escapeHtml(item.id)}" role="button" tabindex="0">
          <div class="run-head">
            <strong><span class="pulse"></span>${escapeHtml(agentLabel(item.owner))}</strong>
            <span class="status-pill ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span>
          </div>
          <p>${escapeHtml(item.code)} · ${escapeHtml(item.customerName)}</p>
          <div class="progress-track"><i style="width:${progress}%"></i></div>
          <p>${escapeHtml(localizeLine(item.transcript[item.transcript.length - 1] || "실행 결과를 기다리는 중입니다."))}</p>
        </article>
      `;
    })
    .join("") || '<div class="empty-state">검토 중인 AI 업무지원이 없습니다</div>';
}

function renderWorkbench() {
  const pageContent = document.getElementById("page-content");
  if (!pageContent) return;

  const pages = {
    dashboard: dashboardPage,
    inbox: inboxPage,
    cases: casesPage,
    approvals: approvalsPage,
    runs: runsPage,
    jeonse: jeonsePage,
    goals: goalsPage,
    agents: agentsPage,
    orgchart: orgChartPage,
    skills: skillsPage,
    routines: routinesPage,
    activity: activityPage,
    budget: budgetPage,
    settings: settingsPage,
    plugins: pluginsPage,
    "rm-dashboard": rmDashboardPage,
    "corporate-credit-dashboard": corporateCreditDashboardPage,
    "jeonse-protection-dashboard": jeonseProtectionDashboardPage,
    "consumer-protection-dashboard": consumerProtectionDashboardPage,
    "fds-dashboard": fdsDashboardPage,
    "compliance-dashboard": complianceDashboardPage,
    "case-detail": () => caseDetailPage(currentCase()),
  };

  pageContent.className = `page-content view-${activeView}`;
  pageContent.innerHTML = `${demoCoachMarkup()}${(pages[activeView] || pages.dashboard)()}`;
  bindPageActions();
}

function bindPageActions() {
  const dispatchButton = document.getElementById("dispatch-command");
  if (dispatchButton) dispatchButton.addEventListener("click", dispatchCommand);
  document.querySelectorAll("[data-board-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      boardMode = button.dataset.boardMode;
      render();
    });
  });
  const caseSearch = document.getElementById("case-search");
  if (caseSearch) {
    caseSearch.addEventListener("input", (event) => {
      caseSearchQuery = event.target.value;
      renderBoard();
      bindSelectionTargets();
      bindDragTargets();
    });
  }
  document.querySelectorAll("[data-approval-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      approvalTab = button.dataset.approvalTab;
      render();
    });
  });
  document.querySelectorAll("[data-approve-case]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCaseId = button.dataset.approveCase;
      activeDetailType = "case";
      approveCase(currentCase());
    });
  });
  document.querySelectorAll("[data-reject-case]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCaseId = button.dataset.rejectCase;
      activeDetailType = "case";
      rejectCase(currentCase());
    });
  });
  document.querySelectorAll("[data-routine-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const routine = routines[Number(button.dataset.routineToggle)];
      if (!routine) return;
      routine[3] = routine[3] === "enabled" ? "paused" : "enabled";
      activity.unshift([timestamp(), routine[2], routine[3] === "enabled" ? "resumed routine" : "paused routine", routine[1]]);
      persistState();
      render();
    });
  });
  const jeonseForm = document.getElementById("jeonse-diagnosis-form");
  if (jeonseForm) {
    jeonseForm.addEventListener("submit", (event) => {
      event.preventDefault();
      runJeonseDiagnosis(jeonseForm);
    });
  }
  const resetDemoButton = document.getElementById("reset-demo-state");
  if (resetDemoButton) resetDemoButton.addEventListener("click", resetDemoState);
  document.querySelectorAll("[data-demo-action]").forEach((button) => {
    button.addEventListener("click", () => advanceDemoAction(button.dataset.demoAction));
  });
  bindDragTargets();
}

function demoCoachMarkup() {
  if (!demoModeState) return "";
  return `
    <section class="demo-coach workspace-panel" aria-label="데모 코치마크">
      <div>
        <p class="eyebrow">데모 코치마크 · ${escapeHtml(demoModeState.title)}</p>
        <h3>${escapeHtml(demoModeState.value)}</h3>
      </div>
      <ol class="demo-steps">
        ${demoModeState.steps
          .map((step, index) => `<li class="${index <= demoModeState.currentStep ? "is-done" : ""} ${index === demoModeState.currentStep ? "is-current" : ""}">${escapeHtml(step)}</li>`)
          .join("")}
      </ol>
      <button class="secondary-button" type="button" data-demo-action="${escapeHtml(demoModeState.type)}">
        <span aria-hidden="true">${iconSvg("target")}</span>
        ${escapeHtml(demoModeState.action)}
      </button>
    </section>
  `;
}

function advanceDemoAction(type) {
  if (type === "jeonse") {
    activeView = "jeonse";
  } else {
    activeView = "approvals";
    approvalTab = "pending";
  }
  activeDetailType = "case";
  propertiesOpen = true;
  render();
}

function heroMarkup() {
  return `
    <section class="jb-hero" aria-label="JB 금융안전 업무지원 hero">
      <div class="hero-copy">
        <span class="status-badge">JB금융그룹 Fin:AI Challenge · 자유주제</span>
        <h2>JB 금융안전 업무지원</h2>
        <p>지역 금융 위험 신호를 관리 건으로 모으고, AI 분석 요청부터 담당자 승인, 감사 기록까지 한 흐름으로 관리합니다.</p>
      </div>
      <div class="hero-mark" aria-hidden="true">
        <span class="mark-box"></span>
          <strong>JB 금융안전</strong>
      </div>
    </section>
  `;
}

function pageHeader(eyebrow, title, description) {
  return `
    <section class="workspace-header">
      <div>
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(description)}</p>
      </div>
    </section>
  `;
}

function panelMarkup(eyebrow, title, body, extraClass = "") {
  return `
    <section class="panel workspace-panel ${extraClass}">
      <div class="panel-head">
        <div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h3>${escapeHtml(title)}</h3>
        </div>
      </div>
      ${body}
    </section>
  `;
}

function commandMarkup() {
  return `
    <section class="command-panel workspace-panel" aria-label="orchestrator command">
      <div class="instruction-copy">
        <p class="eyebrow">운영 지시</p>
        <h3>한 줄로 바로 실행합니다.</h3>
        <p>관리 건 생성, AI 업무지원 배정, 승인 큐 등록, 감사 로그까지 같은 프로세스로 처리합니다.</p>
      </div>
      <div class="command-row">
        <textarea id="command-input" rows="3" aria-label="운영 지시 입력">전주 카페 관리 건의 금리 부담, 정책금융 후보, 고객 안내 초안을 승인 가능한 형태로 정리해줘.</textarea>
        <button id="dispatch-command" class="primary-button icon-command-button" type="button" title="지시 실행">
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </section>
  `;
}

function latestWorkSummaryView() {
  const roles = [
    ["기업여신", "AI 3개 · 업무 기능 5개", "서류·재무분석, 전결 라우팅, 자금용도 사후점검", "#corporate-credit-dashboard"],
    ["소비자 보호", "AI 4개 · 업무 기능 7개", "적합성·적정성, 부당권유, 민원, 취약고객 보호", "#consumer-protection-dashboard"],
    ["FDS/보이스피싱", "AI 3개 · 업무 기능 6개", "이상징후, 지급정지·해제, 탐지룰 운영", "#fds-dashboard"],
    ["준법감시", "AI 4개 · 업무 기능 9개", "책무구조도, 데이터 경계, 감사 무결성, 사고대응", "#compliance-dashboard"],
  ];
  return `
    <div class="latest-work">
      <div class="latest-work-head">
        <div>
          <span class="source-badge">2026-07-01 최신 반영</span>
          <strong>담당자별 AI 업무지원과 업무 기능 후보가 서버 첫 화면에 노출됩니다.</strong>
          <p>본선 리서치 딥프롬프트에서 정리한 신규 제안 14개 Agent와 27개 Skill을 검토 후보로 연결했습니다. 실제 고객 안내는 담당자 승인 후에만 진행됩니다.</p>
        </div>
        <div class="latest-work-metrics" aria-label="latest work metrics">
          <span><strong>14</strong> AI 업무지원</span>
          <span><strong>27</strong> 업무 기능</span>
          <span><strong>4</strong> 역할 대시보드</span>
        </div>
      </div>
      <div class="latest-role-grid">
        ${roles
          .map(
            ([label, count, description, href]) => `
              <a class="latest-role-card" href="${escapeHtml(href)}">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(count)}</strong>
                <p>${escapeHtml(description)}</p>
              </a>
            `,
          )
          .join("")}
      </div>
      <p class="insight-copy">승인 전에는 실제 연결된 업무 기능이 아니라 제안 근거와 검토 범위로만 표시됩니다. 고객 영향 조치는 담당자 승인 절차를 거쳐야 합니다.</p>
    </div>
  `;
}

function consolePrinciplesView() {
  const items = [
    ["담당자 최종 확인", "AI는 주의 신호 분류와 안내 초안까지만 만들고, 고객에게 연락하기 전에는 담당자 확인을 반드시 거칩니다.", "check-square"],
    ["개인정보 비반출", "성명, 연락처, 계좌, 신용정보는 기본 마스킹하며 외부 전송 전 비식별 처리와 점검을 거쳐야 합니다.", "lock"],
    ["감사 추적", "관리 건, AI 분석 요청, 승인, 보안 상태 변화는 담당자와 시각이 포함된 감사 기록으로 남깁니다.", "database"],
  ];
  return `
    <div class="principle-grid">
      ${items
        .map(
          ([title, detail, icon]) => `
            <article class="principle-card">
              <span aria-hidden="true">${iconSvg(icon)}</span>
              <strong>${escapeHtml(title)}</strong>
              <p>${escapeHtml(detail)}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function dashboardCaseBoardView() {
  return `
    <div class="case-toolbar console-case-toolbar">
      <label class="case-search">
        <span>검색</span>
        <input id="case-search" type="search" value="${escapeHtml(caseSearchQuery)}" placeholder="관리 건 번호, 고객명, 주의 신호, 담당 업무 검색" />
      </label>
      <div class="view-switch board-switch" aria-label="board mode">
        <button class="${boardMode === "kanban" ? "is-active" : ""}" type="button" data-board-mode="kanban">업무 보드</button>
        <button class="${boardMode === "list" ? "is-active" : ""}" type="button" data-board-mode="list">목록</button>
      </div>
    </div>
    <div id="case-board" class="case-board"></div>
  `;
}

function securityOpsSnapshotView() {
  const rows = [
    ["은행 코어", "정상", "상담/거래 위험 신호 수신"],
    ["법령·보증 기준", "정상", "전세·준법 검토 근거 참조"],
    ["고객 알림", "담당자 확인 필요", "담당자 확인 전 발송 보류"],
    ["외부 전송 전 점검", "보류", "식별정보 포함 가능성 1건 보류"],
  ];
  return `
    <div class="integration-grid">
      ${rows
        .map(
          ([name, state, detail]) => `
            <article class="integration-card integration-${state === "보류" ? "blocked" : state === "담당자 확인 필요" ? "guarded" : "connected"}">
              <span>${escapeHtml(state)}</span>
              <strong>${escapeHtml(name)}</strong>
              <p>${escapeHtml(detail)}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function dashboardPage() {
  return `
    ${pageHeader("JB금융그룹 업무포털", "JB 금융안전 업무지원 포털", "지역 고객의 위험 신호를 관리 건으로 모아 분석하고, 담당자 승인 후에만 고객 안내로 이어지도록 관리합니다.")}
    <section id="metric-grid" class="metric-grid" aria-label="metrics"></section>
    ${panelMarkup("업무 보드", "접수됨 → 검토 준비 중 → 담당자 승인 대기 → 검토 완료 / 보류", dashboardCaseBoardView(), "board-panel dashboard-board-panel")}
    ${panelMarkup("최신 작업 반영", "2026-07-01 서버 첫 화면 업데이트", latestWorkSummaryView(), "latest-work-panel panel-primary")}
    ${panelMarkup("운영 원칙", "AI 초안 · 담당자 승인 · 감사 기록", consolePrinciplesView(), "principle-panel panel-primary")}
    ${dispatchResultMarkup()}
    <section class="dashboard-grid">
      <div class="dashboard-column">
        ${commandMarkup()}
        ${panelMarkup("의사결정 요약", "오늘 우선 처리 기준", dashboardDecisionView(), "decision-panel panel-primary")}
        ${panelMarkup("실시간 실행", "실시간 실행", '<div id="live-runs" class="live-runs"></div><span id="live-count" class="count-pill ghost-count">0</span>', "live-panel")}
        ${panelMarkup("처리 흐름", "처리 흐름 상태", dashboardView(), "process-panel")}
        ${panelMarkup("우선순위", "주의 수준 순위", dashboardRankingView(), "ranking-panel")}
      </div>
      <div class="dashboard-column">
        ${panelMarkup("보안·연동", "개인정보·반출·시스템 연동 상태", securityOpsSnapshotView(), "security-snapshot-panel panel-secondary")}
        ${panelMarkup("활동 이력", "최근 감사 로그", activityView(), "activity-panel panel-secondary")}
        ${panelMarkup("주의 수준·지역 분포", "지역별 주의 수준", dashboardRegionView(), "region-panel")}
        ${panelMarkup("비용과 효과", "운영 비용 해석", dashboardCostView(), "cost-panel")}
        ${panelMarkup("서비스 사이클", "완료된 사용자 가치", scenarioCompletionView(), "scenario-panel")}
        ${panelMarkup("데이터 신뢰도", "샘플·실제·오류 상태", dataReliabilityView(), "data-reliability-panel panel-secondary")}
        ${panelMarkup("데이터 상태", "데이터 출처와 저장 상태", dataStatusView(), "data-panel panel-secondary")}
      </div>
    </section>
  `;
}

function rmDashboardPage() {
  const rmKpis = [
    ["오늘 우선 상담", "7건", "고위험 3건 · 보증/정책금융 후보 4건", "users"],
    ["승인 대기", "2건", "고객 안내 전 RM 확인 필요", "check-square"],
    ["서류 보완", "6건", "사업자·세무·임대차 자료 누락 탐지", "file-text"],
    ["후속관리", "4건", "EWS·연체·만기연장 알림", "activity"],
  ];
  const rmWork = [
    {
      title: "상담 전 AI 브리핑",
      caseId: "case-104",
      customer: "전주 중앙로 카페",
      detail: "매출 둔화, 금리 민감도, 정책금융 후보, 콜백 질문을 RM 검토용으로 요약합니다.",
      status: "오늘 16:00",
      skills: ["거래이력 요약", "상담 질문", "정책금융 후보"],
    },
    {
      title: "여신 서류 체크",
      caseId: "case-118",
      customer: "광주 송정 도소매",
      detail: "사업자등록, 부가세 자료, 임대차·세금계산서 누락 여부를 대조합니다.",
      status: "보완 요청",
      skills: ["서류 누락", "증빙 대조", "KYC"],
    },
    {
      title: "품의·심사 연결",
      caseId: "case-201",
      customer: "서울 신축빌라 전세 예정",
      detail: "RM 의견 초안, 근거 링크, 담당자 승인 절차를 묶어 심사/준법 검토로 넘깁니다.",
      status: "승인 대기",
      skills: ["품의 초안", "근거 패킷", "담당자 승인 절차"],
    },
    {
      title: "사후관리·EWS",
      caseId: "case-127",
      customer: "군산 부품 제조업",
      detail: "조기경보 신호, 자금용도 점검, 기록 보관 필요 항목을 RM 후속 태스크로 정리합니다.",
      status: "상위 검토",
      skills: ["EWS", "사후점검", "감사로그"],
    },
  ];
  const rmFlow = [
    ["01", "고객 신호 수집", "상담 메모, 거래 이력, 정책/보증 가능성을 한곳에 모읍니다."],
    ["02", "사전 브리핑", "AI가 확인할 항목과 질문 후보만 제안하고 RM이 검토합니다."],
    ["03", "서류·근거 대조", "누락 서류, 증빙 불일치, 신뢰도 낮은 근거를 표시합니다."],
    ["04", "품의·승인 연결", "고객 영향 행동은 승인 큐를 거쳐야만 다음 단계로 넘어갑니다."],
    ["05", "사후관리 기록", "콜메모, 후속 태스크, 감사 로그를 관리 건에 남깁니다."],
  ];
  const roleCases = [
    ["신규여신 상담", "필요서류와 자금용도를 정리하고 상담 전 질문지를 만듭니다."],
    ["만기연장·조건변경", "기존 조건, 갱신 리스크, 고객 안내 초안을 비교합니다."],
    ["정책금융·보증서 매칭", "지역신보·정책자금 후보와 누락 서류를 좁힙니다."],
    ["사후관리·연체 알림", "EWS, 연체, 자금용도 점검을 후속 조치로 전환합니다."],
  ];

  return `
    ${pageHeader("담당자 유형", "RM 역할 대시보드", "RM이 상담, 여신 서류, 품의 연결, 사후관리까지 한 화면에서 처리하도록 구성한 역할 전용 화면입니다.")}
    <section class="workspace-panel rm-hero">
      <div>
        <p class="eyebrow">RM 업무 사이클</p>
        <h3>AI는 확인할 항목을 제안하고, 고객 영향 행동은 RM이 승인합니다.</h3>
        <p>리서치 기준 RM 업무는 상담, 서류징구·대조, 신용평가 입력, 품의·심사 핸드오프, 실행 후 사후관리와 기록보관까지 이어집니다. 이 화면은 그 반복 업무를 관리 건 큐로 묶어 후속 확인 항목을 바로 보이게 합니다.</p>
      </div>
      <div class="rm-hero-actions">
        <span class="status-pill status-approved">개인정보 비반출</span>
        <span class="status-pill status-pending">담당자 최종 확인 우선</span>
        <span class="status-pill status-new">근거 기록</span>
      </div>
    </section>
    <section class="rm-kpi-grid" aria-label="RM KPI">
      ${rmKpis
        .map(
          ([label, value, description, icon]) => `
            <article class="rm-kpi-card">
              <span class="rm-kpi-icon" aria-hidden="true">${iconSvg(icon)}</span>
              <div>
                <p>${escapeHtml(label)}</p>
                <strong>${escapeHtml(value)}</strong>
                <span>${escapeHtml(description)}</span>
              </div>
            </article>
          `,
        )
        .join("")}
    </section>
    <section class="rm-layout-grid">
      ${panelMarkup(
        "오늘 처리",
        "RM 업무 큐",
        `<div class="rm-work-list">
          ${rmWork
            .map(
              (item) => `
                <button class="rm-work-card" type="button" data-case-id="${escapeHtml(item.caseId)}">
                  <div class="rm-work-head">
                    <span>${escapeHtml(item.title)}</span>
                    <span class="status-pill ${item.status === "상위 검토" ? "status-escalated" : item.status === "승인 대기" || item.status === "보완 요청" ? "status-pending" : "status-new"}">${escapeHtml(item.status)}</span>
                  </div>
                  <strong>${escapeHtml(item.customer)}</strong>
                  <p>${escapeHtml(item.detail)}</p>
                  <div class="tag-row">${item.skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("")}</div>
                </button>
              `,
            )
            .join("")}
        </div>`,
        "rm-work-panel",
      )}
      ${panelMarkup(
        "프로세스",
        "RM 업무 흐름",
        `<div class="rm-flow-list">
          ${rmFlow
            .map(
              ([step, title, description]) => `
                <article class="rm-flow-step">
                  <span>${escapeHtml(step)}</span>
                  <div>
                    <strong>${escapeHtml(title)}</strong>
                    <p>${escapeHtml(description)}</p>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>`,
        "rm-flow-panel",
      )}
    </section>
    <section class="rm-layout-grid rm-layout-bottom">
      ${panelMarkup(
        "관리 건 유형",
        "RM이 맡는 업무 범주",
        `<div class="rm-role-case-grid">
          ${roleCases
            .map(
              ([title, description]) => `
                <article class="rm-role-case">
                  <strong>${escapeHtml(title)}</strong>
                  <p>${escapeHtml(description)}</p>
                </article>
              `,
            )
            .join("")}
        </div>`,
        "rm-role-panel",
      )}
      ${panelMarkup(
        "통제 원칙",
        "RM 승인 전 자동 실행 금지",
        `<div class="rm-control-box">
          <div class="rm-control-main">
            <span aria-hidden="true">${iconSvg("lock")}</span>
            <div>
              <strong>고객 안내·조건 제시·거래 제한은 승인 큐를 점검 완료해야 합니다.</strong>
              <p>AI 산출물은 상담 브리핑, 서류 체크, 품의 초안, 사후관리 기록까지만 생성합니다. 최종 조건 제시와 고객 영향 행동은 RM 또는 지정 승인자가 처리합니다.</p>
            </div>
          </div>
          <div class="property-list">
            ${propertyRow("외부 전송 전 점검", "비식별 처리·마스킹 후 검증")}
            ${propertyRow("감사 기록", "Case → Evidence → Approval → Audit")}
            ${propertyRow("미검증 값", "추정/미검증 표기 유지")}
          </div>
        </div>`,
        "rm-control-panel panel-primary",
      )}
    </section>
  `;
}

function corporateCreditDashboardPage() {
  const creditKpis = [
    ["심사 패킷", "9건", "상담·서류·담보·품의 초안 묶음", "file-text"],
    ["서류 보완", "5건", "재무제표·납세·등기·견적 누락", "check-square"],
    ["본부 심사", "3건", "전결 초과·고위험·예외 승인 후보", "users"],
    ["사후점검", "4건", "자금용도·PF·리스/할부 통제", "activity"],
  ];
  const creditWork = [
    {
      title: "운전자금 신규여신 검토",
      caseId: "case-104",
      customer: "전주 중앙로 카페",
      detail: "매출 둔화, 비용 부담, 1회전 운전자금 적정 한도와 상환 가능성을 심사 패킷으로 정리합니다.",
      status: "심사 준비",
      skills: ["매출·현금흐름", "상환능력", "품의 초안"],
    },
    {
      title: "시설자금·기계류 할부 검토",
      caseId: "case-127",
      customer: "군산 부품 제조업",
      detail: "설비 견적, 담보·리스 물건, 회수 가능성, CREFIA 리스/할부 공시 참고 항목을 대조합니다.",
      status: "본부 심사",
      skills: ["시설자금", "담보가치", "리스·할부"],
    },
    {
      title: "보증서·정책금융 구조화",
      caseId: "case-118",
      customer: "광주 송정 도소매",
      detail: "지역신보·정책자금 후보, 보증 가능 금액, 제출 서류 누락 여부를 담당자 검토용으로 좁힙니다.",
      status: "보완 요청",
      skills: ["보증 매칭", "정책자금", "서류 체크"],
    },
    {
      title: "자금용도외 유용 사후점검",
      caseId: "case-133",
      customer: "익산 음식점",
      detail: "대출 실행 후 세금계산서, 송금 내역, 사용처 증빙을 대조해 이상 지출 신호를 표시합니다.",
      status: "점검 대기",
      skills: ["자금용도", "증빙 대조", "감사 기록"],
    },
  ];
  const creditFlow = [
    ["01", "상담·신청 접수", "운전자금/시설자금/리스·할부 목적과 차주 실체를 분리합니다."],
    ["02", "서류·공시 체크", "재무제표, 세무, 등기, 견적, CREFIA 공시/규정 참고 항목을 대조합니다."],
    ["03", "신용·상환 분석", "현금흐름, 이자보상, 부채비율, 담보·보증을 한 화면에서 점검합니다."],
    ["04", "전결·본부심사 라우팅", "전결 가능, 본부 심사, 여신위원회 후보를 규칙 기반으로 분기합니다."],
    ["05", "약정·실행 전 통제", "조건 제시와 실행은 승인 큐를 점검 완료한 항목만 다음 단계로 보냅니다."],
    ["06", "사후점검·감사기록", "자금용도, 연체/EWS, 담보 변동, 감사 로그를 관리 건에 남깁니다."],
  ];
  const roleCases = [
    ["운전자금", "매출 회전, 원재료·인건비 소요, 적정 한도와 상환 재원을 검토합니다."],
    ["시설자금", "설비·공장·사업장 투자 목적, 자기자본 투입, 장기 현금흐름을 확인합니다."],
    ["리스·할부금융", "기계류·차량·기타할부 공시 기준과 물건 회수 가능성을 대조합니다."],
    ["부동산PF/고위험", "PF 모범규준, 익스포저 한도, 본부 심사·위원회 상정 필요성을 표시합니다."],
    ["보증·정책금융", "신보·기보·지역신보·지자체 정책자금 후보와 누락 서류를 정리합니다."],
    ["사후관리", "자금용도외 유용, EWS, 만기연장, 감사 검증 대상 여부를 기록합니다."],
  ];

  return `
    ${pageHeader("담당자 유형", "기업여신 담당자 대시보드", "기업여신 담당자가 상담 접수부터 품의, 심사 라우팅, 실행 전 통제, 사후점검까지 처리하도록 구성한 역할 전용 화면입니다.")}
    <section class="workspace-panel rm-hero">
      <div>
        <p class="eyebrow">기업여신 업무 사이클</p>
        <h3>AI는 심사 가능한 패킷을 만들고, 조건 최종 확인은 사람이 승인합니다.</h3>
        <p>리서치 기준 기업여신은 자금용도 확인, 서류·재무·담보 분석, 전결권 분기, 약정/실행, 사후관리로 이어집니다. 이 화면은 CREFIA의 여신금융업권 법규·자율규제·상품공시 항목을 참고해 담당자가 무엇을 먼저 확인해야 하는지 보여줍니다.</p>
      </div>
      <div class="rm-hero-actions">
        <span class="status-pill status-approved">개인정보 비반출</span>
        <span class="status-pill status-pending">전결 라우팅</span>
        <span class="status-pill status-new">CREFIA 참고</span>
      </div>
    </section>
    <section class="rm-kpi-grid" aria-label="기업여신 KPI">
      ${creditKpis
        .map(
          ([label, value, description, icon]) => `
            <article class="rm-kpi-card">
              <span class="rm-kpi-icon" aria-hidden="true">${iconSvg(icon)}</span>
              <div>
                <p>${escapeHtml(label)}</p>
                <strong>${escapeHtml(value)}</strong>
                <span>${escapeHtml(description)}</span>
              </div>
            </article>
          `,
        )
        .join("")}
    </section>
    <section class="rm-layout-grid">
      ${panelMarkup(
        "오늘 처리",
        "기업여신 업무 큐",
        `<div class="rm-work-list">
          ${creditWork
            .map(
              (item) => `
                <button class="rm-work-card" type="button" data-case-id="${escapeHtml(item.caseId)}">
                  <div class="rm-work-head">
                    <span>${escapeHtml(item.title)}</span>
                    <span class="status-pill ${item.status === "본부 심사" ? "status-escalated" : item.status === "보완 요청" ? "status-pending" : "status-new"}">${escapeHtml(item.status)}</span>
                  </div>
                  <strong>${escapeHtml(item.customer)}</strong>
                  <p>${escapeHtml(item.detail)}</p>
                  <div class="tag-row">${item.skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("")}</div>
                </button>
              `,
            )
            .join("")}
        </div>`,
        "rm-work-panel",
      )}
      ${panelMarkup(
        "프로세스",
        "기업여신 처리 흐름",
        `<div class="rm-flow-list">
          ${creditFlow
            .map(
              ([step, title, description]) => `
                <article class="rm-flow-step">
                  <span>${escapeHtml(step)}</span>
                  <div>
                    <strong>${escapeHtml(title)}</strong>
                    <p>${escapeHtml(description)}</p>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>`,
        "rm-flow-panel",
      )}
    </section>
    <section class="rm-layout-grid rm-layout-bottom">
      ${panelMarkup(
        "관리 건 유형",
        "기업여신 담당 업무 범주",
        `<div class="rm-role-case-grid">
          ${roleCases
            .map(
              ([title, description]) => `
                <article class="rm-role-case">
                  <strong>${escapeHtml(title)}</strong>
                  <p>${escapeHtml(description)}</p>
                </article>
              `,
            )
            .join("")}
        </div>`,
        "rm-role-panel",
      )}
      ${panelMarkup(
        "통제 원칙",
        "기업여신 승인 전 자동 실행 금지",
        `<div class="rm-control-box">
          <div class="rm-control-main">
            <span aria-hidden="true">${iconSvg("lock")}</span>
            <div>
              <strong>한도·금리·약정·실행은 승인 큐를 점검 완료해야 합니다.</strong>
              <p>AI 산출물은 서류 대조, 심사 의견 초안, 전결 라우팅, 자금용도 점검까지 제안합니다. 차주에게 영향을 주는 조건 최종 확인과 실행은 기업여신 담당자 또는 여신심사역의 승인 뒤에만 진행됩니다.</p>
            </div>
          </div>
          <div class="property-list">
            ${propertyRow("업권 참고", "여신전문금융업법·감독규정·자율규제")}
            ${propertyRow("공시 참고", "리스/할부·신용대출·경영공시")}
            ${propertyRow("감사 기록", "상담 → 심사패킷 → 승인 → 실행전 통제")}
          </div>
        </div>`,
        "rm-control-panel panel-primary",
      )}
    </section>
  `;
}

function roleStatusPillClass(status) {
  if (/긴급|상위|차단|위반|지급정지|사고/.test(status)) return "status-escalated";
  if (/대기|검토|보완|소명|승인|재심|점검/.test(status)) return "status-pending";
  if (/완료|점검 완료|정상|활성/.test(status)) return "status-approved";
  return "status-new";
}

function roleDashboardPage(config) {
  return `
    ${pageHeader("담당자 유형", config.title, config.description)}
    <section class="workspace-panel rm-hero">
      <div>
        <p class="eyebrow">${escapeHtml(config.heroEyebrow)}</p>
        <h3>${escapeHtml(config.heroTitle)}</h3>
        <p>${escapeHtml(config.heroBody)}</p>
      </div>
      <div class="rm-hero-actions">
        ${config.badges.map((badge) => `<span class="status-pill ${escapeHtml(badge.className)}">${escapeHtml(badge.label)}</span>`).join("")}
      </div>
    </section>
    <section class="rm-kpi-grid" aria-label="${escapeHtml(config.title)} KPI">
      ${config.kpis
        .map(
          ([label, value, description, icon]) => `
            <article class="rm-kpi-card">
              <span class="rm-kpi-icon" aria-hidden="true">${iconSvg(icon)}</span>
              <div>
                <p>${escapeHtml(label)}</p>
                <strong>${escapeHtml(value)}</strong>
                <span>${escapeHtml(description)}</span>
              </div>
            </article>
          `,
        )
        .join("")}
    </section>
    <section class="rm-layout-grid">
      ${panelMarkup(
        "오늘 처리",
        config.workTitle,
        `<div class="rm-work-list">
          ${config.work
            .map(
              (item) => `
                <button class="rm-work-card" type="button" data-case-id="${escapeHtml(item.caseId)}">
                  <div class="rm-work-head">
                    <span>${escapeHtml(item.title)}</span>
                    <span class="status-pill ${roleStatusPillClass(item.status)}">${escapeHtml(item.status)}</span>
                  </div>
                  <strong>${escapeHtml(item.customer)}</strong>
                  <p>${escapeHtml(item.detail)}</p>
                  <div class="tag-row">${item.skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("")}</div>
                </button>
              `,
            )
            .join("")}
        </div>`,
        "rm-work-panel",
      )}
      ${panelMarkup(
        "프로세스",
        config.flowTitle,
        `<div class="rm-flow-list">
          ${config.flow
            .map(
              ([step, title, description]) => `
                <article class="rm-flow-step">
                  <span>${escapeHtml(step)}</span>
                  <div>
                    <strong>${escapeHtml(title)}</strong>
                    <p>${escapeHtml(description)}</p>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>`,
        "rm-flow-panel",
      )}
    </section>
    <section class="rm-layout-grid rm-layout-bottom">
      ${panelMarkup(
        "업무 범주",
        config.roleCaseTitle,
        `<div class="rm-role-case-grid">
          ${config.roleCases
            .map(
              ([title, description]) => `
                <article class="rm-role-case">
                  <strong>${escapeHtml(title)}</strong>
                  <p>${escapeHtml(description)}</p>
                </article>
              `,
            )
            .join("")}
        </div>`,
        "rm-role-panel",
      )}
      ${panelMarkup(
        "통제 원칙",
        config.controlTitle,
        `<div class="rm-control-box">
          <div class="rm-control-main">
            <span aria-hidden="true">${iconSvg(config.controlIcon)}</span>
            <div>
              <strong>${escapeHtml(config.controlLead)}</strong>
              <p>${escapeHtml(config.controlBody)}</p>
            </div>
          </div>
          <div class="property-list">
            ${config.controlRows.map(([label, value]) => propertyRow(label, value)).join("")}
          </div>
        </div>`,
        "rm-control-panel panel-primary",
      )}
    </section>
  `;
}

function roleDashboardContextMarkup(config) {
  return `
    ${compactPanel(
      config.context.roleEyebrow,
      config.context.roleTitle,
      `<div class="property-list">
        ${config.context.roleRows.map(([label, value]) => propertyRow(label, value)).join("")}
      </div>`,
    )}
    ${compactPanel(
      "오늘 우선순위",
      config.context.priorityTitle,
      `<div class="context-list">
        ${config.context.priorities.map(([title, description, metric]) => workItem(title, description, metric)).join("")}
      </div>`,
    )}
    ${compactPanel(
      "참고 기준",
      config.context.referenceTitle,
      `<div class="property-list">
        ${config.context.references.map(([label, value]) => propertyRow(label, value)).join("")}
      </div>`,
    )}
  `;
}

function jeonseProtectionDashboardConfig() {
  return {
    title: "전세보호 담당자 대시보드",
    description: "전세 계약 전 권리관계, 주변 시세, 보증 가능성, 피해지원 연결까지 확인하는 역할 전용 화면입니다.",
    heroEyebrow: "전세 보호 업무 사이클",
    heroTitle: "AI는 위험 신호를 묶고, 대출·계약 진행은 사람이 승인합니다.",
    heroBody: "국토교통부 전세사기피해자 지원관리시스템, HUG 전세피해지원센터, 전세사기피해자 지원 특별법 흐름을 참고해 등기·신탁·선순위채권·전세가율·보증보험 요건 확인 필요을 한 번에 점검합니다.",
    badges: [
      { label: "HUG/HF/SGI 확인", className: "status-new" },
      { label: "권리관계 검토", className: "status-pending" },
      { label: "피해지원 연결", className: "status-approved" },
    ],
    kpis: [
      ["고위험 계약", "4건", "전세가율·선순위채권·신탁 신호", "shield"],
      ["보증 확인", "3건", "보증보험 가입 가능성 재검토", "check-square"],
      ["권리 하자", "2건", "근저당·압류·신탁등기 확인 필요", "file-text"],
      ["지원 연결", "5건", "법률·주거·금융지원 안내 후보", "link"],
    ],
    workTitle: "전세보호 업무 큐",
    work: [
      {
        title: "전세가율·주변 시세 점검",
        caseId: "case-201",
        customer: "서울 신축빌라 전세 예정",
        detail: "보증금이 주변 실거래·매매가 대비 높은지 확인하고 HUG 담보인정비율 기준을 함께 표시합니다.",
        status: "검토 대기",
        skills: ["전세가율", "주변 시세", "보증금 과다"],
      },
      {
        title: "등기·신탁·선순위 권리 확인",
        caseId: "case-104",
        customer: "전주 중앙로 임차 상담",
        detail: "근저당, 압류, 신탁등기, 단기 소유권 이전 여부를 분리해 계약 전 확인 항목으로 정리합니다.",
        status: "상위 검토",
        skills: ["등기 권리", "신탁 확인", "선순위채권"],
      },
      {
        title: "보증보험 가입 가능성",
        caseId: "case-118",
        customer: "광주 오피스텔 임차인",
        detail: "임대인, 주택 유형, 보증금, 선순위채권, 보증기관 조건을 비교해 가입 가능성을 제안합니다.",
        status: "보완 요청",
        skills: ["HUG 확인", "HF/SGI 후보", "서류 누락"],
      },
      {
        title: "피해지원·법률상담 연결",
        caseId: "case-133",
        customer: "익산 전세계약 피해 상담",
        detail: "결정신청, 이의신청, 법률·심리·주거지원 연결 여부를 사람이 확인할 수 있게 묶습니다.",
        status: "승인 대기",
        skills: ["특별법", "지원신청", "상담 연결"],
      },
    ],
    flowTitle: "전세보호 처리 흐름",
    flow: [
      ["01", "상담·계약 정보 접수", "주소, 보증금, 계약 예정일, 임대인, 중개사 정보를 가상 데이터로 구조화합니다."],
      ["02", "시세·전세가율 확인", "주변 시세 대비 보증금 과다, 전세가율, 가격 급변 신호를 먼저 봅니다."],
      ["03", "등기·권리관계 확인", "근저당, 압류, 신탁등기, 선순위 권리, 단기 소유권 이전을 체크합니다."],
      ["04", "보증보험 요건 확인 필요 검토", "HUG/HF/SGI 가입 가능성과 보완 서류를 후보로 제시합니다."],
      ["05", "안전계약 담당자 승인 절차", "특약 문구와 계약 진행 안내는 담당자 승인 뒤에만 고객에게 나갑니다."],
      ["06", "피해지원·사후기록", "위험 계약은 지원기관 연결, 법률상담, 감사 로그로 남깁니다."],
    ],
    roleCaseTitle: "전세 위험 신호 범주",
    roleCases: [
      ["전세가율 과다", "보증금이 매매가 또는 주변 시세 대비 높을 때 우선 경고합니다."],
      ["권리관계 위험", "근저당·압류·가압류·신탁등기·선순위채권을 계약 전 확인합니다."],
      ["소유권 변동", "단기간 소유권 이전, 법인 임대인, 다주택 임대인 신호를 표시합니다."],
      ["보증보험 불가", "보증기관별 가입 제한 가능성과 보완 서류를 분리합니다."],
      ["임차인 자산 위험", "총자산 대비 보증금, 월소득 대비 주거비, 대출 상환 가능성을 봅니다."],
      ["피해지원 연결", "특별법 결정신청, 이의신청, 주거·금융·법률지원 흐름을 안내합니다."],
    ],
    controlTitle: "전세보호 승인 전 고객 안내 금지",
    controlIcon: "lock",
    controlLead: "계약 진행, 대출 상담, 보증 가능 안내는 사람이 최종 확인합니다.",
    controlBody: "AI는 위험 신호, 서류 누락, 특약 후보, 보증기관 후보를 제안합니다. 계약 안전성 최종 확인 표현이나 보증 가능 최종 확인 표현은 담당자 승인 없이는 고객에게 표시하지 않습니다.",
    controlRows: [
      ["법령 참고", "전세사기피해자 지원 및 주거안정 특별법"],
      ["기관 연결", "국토부·HUG·HF·SGI·법률지원"],
      ["감사 기록", "상담 → 위험점검 → 승인 → 고객안내"],
    ],
    context: {
      roleEyebrow: "전세보호 역할",
      roleTitle: "계약 전 위험을 먼저 줄이는 담당자",
      roleRows: [
        ["핵심 업무", "권리관계·전세가율·보증가능성·피해지원"],
        ["AI 역할", "등기/시세/보증 조건 후보와 체크리스트 제안"],
        ["사람 역할", "고객 안내·계약 진행·지원기관 연결 승인"],
      ],
      priorityTitle: "전세보호 담당자가 먼저 볼 항목",
      priorities: [
        ["고위험 계약", "전세가율 90% 이상 또는 선순위권리 존재", "4건"],
        ["보증 불확실", "보증기관 가입 조건과 누락 서류 재검토", "3건"],
        ["피해지원 후보", "결정신청·법률지원 연결 가능 관리 건", "5건"],
      ],
      referenceTitle: "외부 참고 기준",
      references: [
        ["정부 시스템", "전세사기피해자 지원관리시스템"],
        ["지원기관", "HUG 전세피해지원센터"],
        ["법령", "전세사기피해자 지원 및 주거안정 특별법"],
      ],
    },
  };
}

function consumerProtectionDashboardConfig() {
  return {
    title: "소비자 보호 담당자 대시보드",
    description: "적합성·적정성, 설명의무, 부당권유, 민원·분쟁, 취약고객 보호를 한 화면에서 처리하는 역할 전용 화면입니다.",
    heroEyebrow: "금융소비자 보호 업무 사이클",
    heroTitle: "AI는 위험 문구와 누락 설명을 찾아주고, 보호 조치는 사람이 최종 확인합니다.",
    heroBody: "금융소비자보호법상 적합성·적정성 원칙, 불완전판매 예방, 소비자보호 조직 독립성, 민원 대응 흐름을 반영해 고객에게 나가기 전 문구와 근거를 검토합니다.",
    badges: [
      { label: "적합성 점검", className: "status-new" },
      { label: "부당권유 차단", className: "status-escalated" },
      { label: "민원 SLA", className: "status-pending" },
    ],
    kpis: [
      ["고위험 권유", "6건", "최종 확인·과장·오인 표현 검토", "alert"],
      ["설명의무 보완", "4건", "위험·수수료·중도해지 설명 누락", "file-text"],
      ["민원 SLA", "3건", "답변 초안과 근거 보강 필요", "history"],
      ["취약고객", "5건", "고령·디지털 취약 고객 안내 강화", "users"],
    ],
    workTitle: "소비자보호 업무 큐",
    work: [
      {
        title: "적합성·적정성 재점검",
        caseId: "case-104",
        customer: "전주 중앙로 카페",
        detail: "상담 기록과 상품 특성을 대조해 부적합·부적정 가능성과 고객 확인 문구를 정리합니다.",
        status: "검토 대기",
        skills: ["적합성", "적정성", "고객속성"],
      },
      {
        title: "부당권유 문구 차단",
        caseId: "case-118",
        customer: "광주 송정 도소매",
        detail: "최종 확인 수익, 손실 축소, 대출 유도성 표현을 고객 안내 전 담당자 승인 절차로 올립니다.",
        status: "위반 후보",
        skills: ["표현 점검", "광고심의", "금지문구"],
      },
      {
        title: "민원 답변 근거 패킷",
        caseId: "case-133",
        customer: "익산 음식점",
        detail: "민원 요지, 상담 이력, 약관·설명서 근거, 보완 조치 후보를 답변 초안으로 묶습니다.",
        status: "보완 요청",
        skills: ["민원 분류", "근거 패킷", "답변 초안"],
      },
      {
        title: "취약고객 안내 강화",
        caseId: "case-201",
        customer: "서울 전세대출 고객",
        detail: "고령·사회초년생·디지털 취약 고객에게 필요한 추가 설명과 재확인 절차를 표시합니다.",
        status: "승인 대기",
        skills: ["취약고객", "쉬운 문구", "재확인"],
      },
    ],
    flowTitle: "소비자보호 처리 흐름",
    flow: [
      ["01", "고객 속성 확인", "투자성향, 상환능력, 취약고객 여부, 기존 상담 기록을 확인합니다."],
      ["02", "상품·권유 적합성 점검", "상품 위험과 고객 상황이 맞는지 부적합 후보를 표시합니다."],
      ["03", "설명·고지 누락 탐지", "위험, 수수료, 중도해지, 대체상품, 불이익 설명 누락을 찾습니다."],
      ["04", "부당권유 표현 차단", "최종 확인·과장·오인·불완전판매 유발 문구를 승인 전 차단합니다."],
      ["05", "민원·분쟁 답변", "근거, 녹취/메모, 조치 계획을 묶어 답변 초안을 만듭니다."],
      ["06", "개선 요구·교육", "반복 위반 유형은 영업점·상품·프로세스 개선으로 넘깁니다."],
    ],
    roleCaseTitle: "소비자보호 업무 범주",
    roleCases: [
      ["적합성·적정성", "고객 상황에 맞지 않는 상품 권유 가능성을 사전 점검합니다."],
      ["설명의무", "위험·비용·불이익·대안 설명 누락을 찾아 담당자에게 보완 요청합니다."],
      ["부당권유", "최종 확인 수익, 손실 축소, 대출 강요성 표현을 차단합니다."],
      ["민원·분쟁", "민원 요지, 근거 자료, 답변 초안, 후속 조치를 연결합니다."],
      ["취약고객 보호", "고령자, 사회초년생, 디지털 취약 고객에게 쉬운 안내와 재확인을 붙입니다."],
      ["내부 개선", "반복 민원과 위반 문구를 교육·정책·상품 개선 과제로 전환합니다."],
    ],
    controlTitle: "소비자 보호 승인 전 고객 발송 금지",
    controlIcon: "shield",
    controlLead: "고객 안내문, 민원 답변, 권유 문구는 보호 담당자 승인 뒤에만 나갑니다.",
    controlBody: "AI는 위험 문구와 설명 누락을 찾아 보완안을 제안합니다. 고객에게 권리·비용·혜택을 최종 확인하는 표현은 보호 담당자가 근거를 확인한 뒤 발송됩니다.",
    controlRows: [
      ["법령 참고", "금융소비자보호법·적합성/적정성 원칙"],
      ["통제 대상", "광고·권유·설명서·민원 답변"],
      ["감사 기록", "탐지 문구 → 보완 → 승인 → 고객 발송"],
    ],
    context: {
      roleEyebrow: "소비자보호 역할",
      roleTitle: "고객 오해와 불완전판매를 줄이는 담당자",
      roleRows: [
        ["핵심 업무", "적합성·설명의무·부당권유·민원·취약고객"],
        ["AI 역할", "위험 문구 탐지·근거 패킷·답변 초안 제안"],
        ["사람 역할", "고객 발송 승인·보상/개선 검토"],
      ],
      priorityTitle: "소비자보호 담당자가 먼저 볼 항목",
      priorities: [
        ["고위험 권유 문구", "최종 확인·과장·오인 가능 문구", "6건"],
        ["설명의무 누락", "위험·비용·해지 설명 보완", "4건"],
        ["민원 SLA", "답변 마감과 근거 보강 필요", "3건"],
      ],
      referenceTitle: "외부 참고 기준",
      references: [
        ["법령", "금융소비자보호법"],
        ["감독 방향", "불완전판매 예방·소비자보호 조직 강화"],
        ["내부 통제", "권유 문구·설명서·민원 답변 승인 로그"],
      ],
    },
  };
}

function fdsDashboardConfig() {
  return {
    title: "보이스피싱/FDS 담당자 대시보드",
    description: "실시간 이상거래 탐지, 보이스피싱 신호, 지급정지 후보, 오탐 소명을 한 화면에서 처리하는 역할 전용 화면입니다.",
    heroEyebrow: "FDS·보이스피싱 대응 사이클",
    heroTitle: "AI는 의심 신호를 묶고, 피해 방지 차단과 해제는 기록 기반으로 처리합니다.",
    heroBody: "금융권 공동 FDS 탐지룰, 신종 보이스피싱·대포통장 의심룰, 신고·피해구제 절차를 참고해 선제 차단 후보와 오탐 재심 큐를 분리합니다.",
    badges: [
      { label: "공동 탐지룰", className: "status-new" },
      { label: "긴급 차단", className: "status-escalated" },
      { label: "오탐 재심", className: "status-pending" },
    ],
    kpis: [
      ["실시간 경보", "12건", "기관사칭·앱설치·새벽이체 신호", "alert"],
      ["지급정지 후보", "4건", "피해 확산 방지 선차단 대상", "lock"],
      ["룰 업데이트", "6건", "공동룰·자체룰 개선 후보", "refresh-cw"],
      ["오탐 재심", "2건", "소명 자료와 해제 승인 대기", "check-square"],
    ],
    workTitle: "FDS 대응 업무 큐",
    work: [
      {
        title: "기관사칭 패턴 탐지",
        caseId: "case-133",
        customer: "익산 음식점",
        detail: "검찰·금감원 사칭, 원격제어 앱 설치, 신규 수취인 고액 이체를 묶어 긴급 경보로 올립니다.",
        status: "긴급 차단",
        skills: ["기관사칭", "원격앱", "고액이체"],
      },
      {
        title: "대포통장 의심계좌",
        caseId: "case-127",
        customer: "군산 부품 제조업",
        detail: "짧은 기간 다수 입금·분산 출금, 신규 계좌 급증, 타행 신고 이력을 대조합니다.",
        status: "지급정지 후보",
        skills: ["대포통장", "분산출금", "타행공조"],
      },
      {
        title: "새벽 이체·기기 변경 룰",
        caseId: "case-104",
        customer: "전주 중앙로 카페",
        detail: "기기 변경 직후 새벽 시간대 이체와 인증 실패 패턴을 자체룰 개선 후보로 기록합니다.",
        status: "룰 점검",
        skills: ["기기변경", "시간대 룰", "인증 실패"],
      },
      {
        title: "오탐 소명·해제 검토",
        caseId: "case-118",
        customer: "광주 송정 도소매",
        detail: "정상 거래 소명 자료, 통화 기록, 영업점 확인을 묶어 해제 승인 큐로 보냅니다.",
        status: "재심 대기",
        skills: ["오탐 소명", "해제 승인", "고객 안내"],
      },
    ],
    flowTitle: "FDS 처리 흐름",
    flow: [
      ["01", "거래·기기·상담 신호 수집", "거래 패턴, 신규 수취인, 기기 변경, 상담 메모를 실시간 이벤트로 받습니다."],
      ["02", "공동룰·자체룰 점수화", "금융권 공동 탐지룰과 회사별 룰을 함께 적용합니다."],
      ["03", "긴급 차단·지급정지 후보", "피해 확산 우려 거래는 선차단 후보로 올리고 해제는 승인 큐로 분리합니다."],
      ["04", "타행·기관 공조", "112, 1332, 지급정지 요청, 통합신고센터 연결 여부를 기록합니다."],
      ["05", "소명·해제 재심", "오탐 가능성은 근거 패킷과 담당자 최종 확인으로 해제합니다."],
      ["06", "룰 개선·감사", "탐지 결과, 오탐, 미탐, 피해구제 결과를 룰 개선 로그로 남깁니다."],
    ],
    roleCaseTitle: "FDS·보이스피싱 업무 범주",
    roleCases: [
      ["기관사칭", "검찰·금감원·은행 사칭과 원격제어 앱 설치 유도 신호를 탐지합니다."],
      ["대포통장", "입출금 패턴, 분산 출금, 신고 이력으로 의심 계좌를 분류합니다."],
      ["이상거래", "고액·새벽·신규수취인·기기변경·인증실패 조합을 봅니다."],
      ["지급정지", "피해 확산 가능성이 높을 때 차단 후보와 법적 절차를 분리합니다."],
      ["오탐 해제", "정상거래 소명, 영업점 확인, 해제 승인을 기록합니다."],
      ["룰 운영", "공동룰과 자체룰을 주기적으로 갱신하고 성능을 감시합니다."],
    ],
    controlTitle: "긴급 차단과 해제는 감사 로그 필수",
    controlIcon: "lock",
    controlLead: "피해 방지 선차단은 빠르게, 해제와 고객 영향 조치는 승인 기반으로 처리합니다.",
    controlBody: "AI는 의심 신호와 차단 후보를 제안합니다. 지급정지, 해제, 고객 통지는 담당자 승인과 근거 로그를 남긴 뒤 실행됩니다.",
    controlRows: [
      ["공동 기준", "금융권 FDS 공동 탐지룰·운영 가이드라인"],
      ["신고 연결", "112·1332·1566-1188·금융회사 지급정지"],
      ["감사 기록", "탐지 → 차단 후보 → 승인/해제 → 룰 개선"],
    ],
    context: {
      roleEyebrow: "FDS 역할",
      roleTitle: "피해 확산을 막고 오탐을 관리하는 담당자",
      roleRows: [
        ["핵심 업무", "보이스피싱·대포통장·이상거래·지급정지"],
        ["AI 역할", "신호 조합·공동룰 적용·오탐 후보 제안"],
        ["사람 역할", "지급정지·해제·고객 통지 승인"],
      ],
      priorityTitle: "FDS 담당자가 먼저 볼 항목",
      priorities: [
        ["긴급 차단 후보", "기관사칭·고액이체·원격앱 설치", "4건"],
        ["오탐 재심", "정상 거래 소명과 해제 승인", "2건"],
        ["룰 업데이트", "공동룰/자체룰 개선 후보", "6건"],
      ],
      referenceTitle: "외부 참고 기준",
      references: [
        ["공동룰", "금융권 FDS 공동 탐지룰"],
        ["피해구제", "경찰 112·금감원 1332·통합신고 1566-1188"],
        ["절차", "지급정지·채권소멸·피해환급 흐름"],
      ],
    },
  };
}

function complianceDashboardConfig() {
  return {
    title: "내부통제 준법감시 담당자 대시보드",
    description: "책무구조도, 담당자 승인 절차, 개인정보·가명처리, 감사 로그, 사고보고를 점검하는 역할 전용 화면입니다.",
    heroEyebrow: "내부통제·준법감시 사이클",
    heroTitle: "AI 운영의 책임 소재, 승인 근거, 개인정보 통제를 한 화면에서 확인합니다.",
    heroBody: "금융회사 지배구조법상 내부통제 강화, 책무구조도, 3선 방어 체계, 신용정보·개인정보 보호 요구를 반영해 AI가 제안한 업무가 통제선 안에서 처리되는지 검증합니다.",
    badges: [
      { label: "책무구조도", className: "status-new" },
      { label: "담당자 승인 절차", className: "status-pending" },
      { label: "감사 무결성", className: "status-approved" },
    ],
    kpis: [
      ["책무 점검", "8건", "업무·임원·부서 책임 매핑 확인", "network"],
      ["정책 위반", "3건", "가드레일·승인 누락·개인정보 위험", "alert"],
      ["감사 샘플", "11건", "해시 체인과 승인 근거 점검", "history"],
      ["보고 패킷", "2건", "사고보고·개선명령 후보", "file-text"],
    ],
    workTitle: "준법감시 업무 큐",
    work: [
      {
        title: "책무구조도 이행 점검",
        caseId: "case-127",
        customer: "군산 부품 제조업",
        detail: "AI 제안, 담당 승인, 본부 심사, 최종 책임자를 책무구조도 관점으로 연결합니다.",
        status: "점검 대기",
        skills: ["책무 매핑", "3선 방어", "승인권자"],
      },
      {
        title: "개인정보·가명처리 통제",
        caseId: "case-104",
        customer: "전주 중앙로 카페",
        detail: "외부 분석 환경으로 나간 비식별 데이터, 식별정보 원문 격리, 출력 재식별 가능성을 샘플링합니다.",
        status: "위반 후보",
        skills: ["개인정보 비반출", "가명처리", "출력필터"],
      },
      {
        title: "승인 로그 무결성 검증",
        caseId: "case-201",
        customer: "서울 신축빌라 전세 예정",
        detail: "승인자, 시간, 근거, 프롬프트/룰 버전, 해시 체인 누락 여부를 점검합니다.",
        status: "검증 대기",
        skills: ["해시체인", "승인근거", "룰버전"],
      },
      {
        title: "사고보고·비상정지 리허설",
        caseId: "case-133",
        customer: "익산 음식점",
        detail: "오탐 차단, 부당권유, 개인정보 노출 의심 상황에서 비상정지와 보고 양식을 생성합니다.",
        status: "상위 검토",
        skills: ["킬스위치", "사고보고", "개선명령"],
      },
    ],
    flowTitle: "준법감시 처리 흐름",
    flow: [
      ["01", "정책·책무 매핑", "업무, 역할, 승인권자, 책임자를 책무구조도에 연결합니다."],
      ["02", "가드레일 적용 확인", "부당권유, 최종 확인 표현, 개인정보, 외부반출, 승인 누락 규칙을 봅니다."],
      ["03", "담당자 승인 절차 점검", "고객 영향 조치가 담당자 최종 확인 없이 나가지 않았는지 확인합니다."],
      ["04", "감사 원장 검증", "입력, 산출, 승인자, 시간, 해시, 버전, 근거 링크를 샘플링합니다."],
      ["05", "예외·위반 조치", "재심, 수정 요청, 격상, 비상정지, 고객 통지 필요 여부를 정합니다."],
      ["06", "보고·개선", "사고보고, 개선명령, 교육, 정책 업데이트로 후속 조치를 남깁니다."],
    ],
    roleCaseTitle: "준법감시 업무 범주",
    roleCases: [
      ["책무구조도", "업무별 책임자와 내부통제 관리의무 이행 여부를 확인합니다."],
      ["담당자 승인 절차", "AI 제안이 고객 영향 조치로 자동 실행되지 않았는지 검증합니다."],
      ["개인정보 비반출", "원본 개인정보와 토큰/가명정보 분리, 외부반출 차단을 점검합니다."],
      ["가드레일", "최종 확인·과장·부당권유·불완전판매 유발 표현을 통제합니다."],
      ["감사 무결성", "해시 체인, 룰 버전, 승인자, 변경 이력을 샘플링합니다."],
      ["사고 대응", "킬스위치, 보고 양식, 고객 통지, 법적 보존을 준비합니다."],
    ],
    controlTitle: "AI 운영 통제선 밖 자동 실행 금지",
    controlIcon: "shield",
    controlLead: "책임자, 승인권자, 감사 근거가 없는 고객 영향 조치는 차단합니다.",
    controlBody: "AI는 정책 위반 가능성과 누락 로그를 제안합니다. 내부통제 담당자는 근거와 책임 소재를 확인해 승인, 수정 요청, 재심, 비상정지를 결정합니다.",
    controlRows: [
      ["법령 참고", "금융회사 지배구조법·신용정보법·개인정보보호법"],
      ["통제 구조", "1선 업무·2선 준법/리스크·3선 감사"],
      ["감사 기록", "정책 → 승인 → 실행 → 예외/보고 → 개선"],
    ],
    context: {
      roleEyebrow: "준법감시 역할",
      roleTitle: "AI 운영의 책임과 통제선을 지키는 담당자",
      roleRows: [
        ["핵심 업무", "책무구조도·승인게이트·개인정보·감사·사고보고"],
        ["AI 역할", "위반 후보·로그 누락·보고 패킷 제안"],
        ["사람 역할", "승인·수정 요청·재심·비상정지·개선명령"],
      ],
      priorityTitle: "준법감시 담당자가 먼저 볼 항목",
      priorities: [
        ["정책 위반 후보", "승인 누락·개인정보·부당권유 표현", "3건"],
        ["감사 샘플", "해시 체인과 근거 링크 확인", "11건"],
        ["책무 매핑", "담당·승인·책임자 연결", "8건"],
      ],
      referenceTitle: "외부 참고 기준",
      references: [
        ["법령", "금융회사 지배구조법"],
        ["내부통제", "책무구조도·3선 방어 체계"],
        ["정보보호", "신용정보법·개인정보보호법·가명처리"],
      ],
    },
  };
}

function jeonseProtectionDashboardPage() {
  return roleDashboardPage(jeonseProtectionDashboardConfig());
}

function consumerProtectionDashboardPage() {
  return roleDashboardPage(consumerProtectionDashboardConfig());
}

function fdsDashboardPage() {
  return roleDashboardPage(fdsDashboardConfig());
}

function complianceDashboardPage() {
  return roleDashboardPage(complianceDashboardConfig());
}

function jeonseProtectionDashboardContextMarkup() {
  return roleDashboardContextMarkup(jeonseProtectionDashboardConfig());
}

function consumerProtectionDashboardContextMarkup() {
  return roleDashboardContextMarkup(consumerProtectionDashboardConfig());
}

function fdsDashboardContextMarkup() {
  return roleDashboardContextMarkup(fdsDashboardConfig());
}

function complianceDashboardContextMarkup() {
  return roleDashboardContextMarkup(complianceDashboardConfig());
}

function inboxPage() {
  return `
    ${pageHeader("알림함", "알림함", "승인 대기, 상위 검토, 실패 알림만 모아 보는 화면입니다.")}
    ${panelMarkup("처리 필요", "처리 필요 알림", inboxView())}
  `;
}

function casesPage() {
  return `
    ${pageHeader("전체 관리 건 조회", "관리 건", "지역 금융 위험 관리 건을 목록으로 빠르게 읽고, 보드에서 상태를 이동합니다.")}
    ${panelMarkup(
      "관리 건 작업공간",
      "위험 관리 건 운영",
      `<div class="case-toolbar">
        <label class="case-search">
          <span>검색</span>
          <input id="case-search" type="search" value="${escapeHtml(caseSearchQuery)}" placeholder="고객, 지역, 위험 원인, AI 업무지원 검색" />
        </label>
        <div class="view-switch board-switch" aria-label="board mode">
          <button class="${boardMode === "list" ? "is-active" : ""}" type="button" data-board-mode="list">목록</button>
          <button class="${boardMode === "kanban" ? "is-active" : ""}" type="button" data-board-mode="kanban">보드</button>
        </div>
      </div><div id="case-board" class="case-board"></div>`,
      "board-panel",
    )}
  `;
}

function approvalsPage() {
  return `
    ${pageHeader("승인", "승인 큐", "고객 대상 행동, 법률/권리 리스크, 금융조건 표현을 담당자 최종 확인 전까지 차단합니다.")}
    ${panelMarkup(
      "승인 대기열",
      "승인 대기 항목",
      `<div class="view-tabs approval-tabs">
        ${["all", "pending", "approved", "rejected"].map((tab) => `<button class="${approvalTab === tab ? "is-active" : ""}" type="button" data-approval-tab="${tab}">${escapeHtml(approvalTabLabel(tab))}</button>`).join("")}
      </div>
      ${approvalsView()}`,
    )}
  `;
}

function runsPage() {
  return `
    ${pageHeader("실행 이력", "실시간 실행", "지시 실행과 수동 실행으로 생성된 AI 분석 요청 로그와 라이브 상태를 확인합니다.")}
    <section class="page-two-col">
      ${panelMarkup("실행 로그", "AI 분석 요청 로그", runsView())}
      ${panelMarkup("실시간 실행", "실시간 실행", '<div id="live-runs" class="live-runs run-page-list"></div><span id="live-count" class="count-pill ghost-count">0</span>')}
    </section>
  `;
}

function jeonsePage() {
  return `
    ${pageHeader("전세 안심 점검", "전세 관련 위험 신호 관리", "전세 관련 위험 신호, 고객 자산노출, 계약 전 체크리스트, 은행 서비스 연계를 전용 AI 업무지원 기능이 분담합니다.")}
    ${panelMarkup("전세 보호", "전세사기 대응 기능", jeonseView())}
  `;
}

function goalsPage() {
  return `
    ${pageHeader("운영 목표", "운영 목표", "AI 업무지원 운영의 성공 기준과 달성률을 추적합니다.")}
    ${panelMarkup("운영 목표", "목표 달성률", goalsView())}
  `;
}

function healthStat(label, value, kind) {
  return `<div class="health-stat health-${kind}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function agentHealthView() {
  const running = agents.filter((a) => a.status === "running").length;
  const pending = agents.filter((a) => a.status === "pending_approval").length;
  const idle = agents.filter((a) => a.status === "idle").length;
  const totalQueue = agents.reduce((s, a) => s + (a.queue || 0), 0);
  const spent = agents.reduce((s, a) => s + (a.spent || 0), 0);
  const budget = agents.reduce((s, a) => s + (a.budget || 0), 0);
  const donut = typeof svgDonut === "function" ? svgDonut(spent, budget, { label: "예산 사용률", sub: `${formatWon(spent)} / ${formatWon(budget)}` }) : "";
  return `
    <div class="agent-health">
      <div class="health-stats">
        ${healthStat("실행 중", `${running}개`, "running")}
        ${healthStat("승인 대기", `${pending}개`, "pending")}
        ${healthStat("유휴", `${idle}개`, "idle")}
        ${healthStat("대기 큐", `${totalQueue}건`, "queue")}
      </div>
      ${donut}
    </div>`;
}

function agentsPage() {
  return `
    ${pageHeader("AI 업무지원", "AI 업무지원 기능", "각 AI 업무지원의 상태, 역할, 연결된 업무 기능, 보고 체계를 확인합니다.")}
    ${panelMarkup("운영 현황", "AI 업무지원 헬스 요약", agentHealthView(), "agent-health-panel panel-primary")}
    ${panelMarkup("AI 업무지원 팀", "업무 범주별 AI 업무지원 팀", agentsView(), "agent-team-panel")}
    ${panelMarkup("보완 필요 사항", "현재 부족한 부분", agentReadinessView(), "agent-gap-panel panel-secondary")}
  `;
}

function orgChartPage() {
  return `
    ${pageHeader("조직도", "AI 업무지원 조직도", "AI 업무지원 기능이 어떤 담당자 또는 상위 업무에 연결되는지 조직도로 확인합니다.")}
    ${panelMarkup("AI 업무지원 조직", "AI 업무지원 조직도", orgChartView())}
  `;
}

function skillsPage() {
  return `
    ${pageHeader("업무 기능", "업무 기능 저장소", "AI 업무지원에게 장착되는 금융, 리스크, 계약, 준법 업무 기능 패키지를 확인합니다.")}
    ${panelMarkup("업무 기능 저장소", "장착 가능 업무 기능", skillsView())}
    ${panelMarkup("승인 정책", "점수 × 조치 유형 라우팅", approvalMatrixView(), "approval-matrix-panel panel-secondary")}
  `;
}

function routinesPage() {
  return `
    ${pageHeader("자동화", "정기 실행 루틴", "정기 실행되는 AI 업무지원 점검과 SLA 점검 루틴을 관리합니다.")}
    ${panelMarkup("루틴 일정", "정기 실행", routinesView())}
  `;
}

function activityPage() {
  return `
    ${pageHeader("활동 이력", "처리 이력", "AI 업무지원 착수, 승인 생성, 상위 검토, 승인/수정 요청 기록을 시간순으로 봅니다.")}
    ${panelMarkup("활동 장부", "처리 이력", activityView())}
  `;
}

function budgetPage() {
  return `
    ${pageHeader("비용", "비용과 효과", "AI 업무지원별 예산뿐 아니라 예상 비용, 절감 가능 비용, 비용 대비 효과를 함께 봅니다.")}
    ${panelMarkup("비용 요약", "월간 비용 검토", dashboardCostView(), "cost-panel")}
    ${panelMarkup("토큰 사용량", "일간·주간·월간 토큰 통계", tokenStatsView(), "token-panel")}
    ${panelMarkup("월별 추세", "비용 변화", dashboardTrendView(), "trend-panel")}
    ${panelMarkup("비용 사용률", "AI 업무지원별 사용률", budgetView())}
  `;
}

function settingsPage() {
  return `
    ${pageHeader("설정", "설정", "조직 프로필, 승인 정책, 외부 연동 어댑터를 관리합니다.")}
    ${panelMarkup("설정", "운영 설정", settingsView())}
  `;
}

function dashboardView() {
  const scoped = visibleCases();
  const flow = [
    ["백로그", scoped.filter((item) => item.status === "New").length, "신규 접수와 위험 원인 분류 대기"],
    ["진행 중", scoped.filter((item) => item.status === "Agent Running").length, "AI 분석 요청으로 근거와 초안 생성"],
    ["검토 중", scoped.filter((item) => item.status === "Approval Pending").length, "RM/준법 승인 대기"],
    ["차단됨", scoped.filter((item) => item.status === "Escalated" || item.status === "Rejected").length, "고객 영향 조치 보류 또는 수정 요청"],
    ["완료", scoped.filter((item) => item.status === "Approved").length, "승인 후 감사 로그 기록"],
  ];
  return `
    <div class="process-flow">
      ${flow
        .map(
          ([label, value, detail]) => `
            <article class="process-step">
              <strong>${escapeHtml(value)}</strong>
              <span>${escapeHtml(label)}</span>
              <p>${escapeHtml(detail)}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function dashboardDecisionView() {
  const data = buildDashboardData();
  const topCase = data.scoped.slice().sort((a, b) => b.riskScore - a.riskScore)[0];
  const jeonseCount = data.jeonseRisk.length;
  const pendingCount = data.pending.length;
  const blockedCount = data.blocked.length;
  const summary = topCase
    ? `${topCase.code} ${topCase.customerName}이 주의 수준 ${topCase.riskScore}점으로 최우선입니다. 승인 대기 ${pendingCount}건, 고객 영향 조치 보류 ${blockedCount}건을 먼저 정리해야 합니다.`
    : "현재 표시 범위에 관리 건가 없습니다.";
  return `
    <div class="decision-summary">
      <article>
        <span class="decision-icon">${iconSvg("target")}</span>
        <strong>오늘의 검토</strong>
        <p>${escapeHtml(summary)}</p>
      </article>
      <article>
        <span class="decision-icon">${iconSvg("shield")}</span>
        <strong>전세 보호</strong>
        <p>전세 위험 관리 건 ${jeonseCount}건은 전세가율, 권리관계, 보증보험 요건 확인 필요을 확인한 뒤 은행 상담으로 연결합니다.</p>
      </article>
      <article>
        <span class="decision-icon">${iconSvg("database")}</span>
        <strong>데이터 기준</strong>
        <p>현재 화면은 데모 데이터 ${data.demoData.length}건과 신규 접수 정보 ${data.userInput.length}건을 구분하며, 저장 결과는 로컬 저장소에 남깁니다.</p>
      </article>
    </div>
  `;
}

function scenarioCompletionView() {
  const data = buildDashboardData();
  const completeCases = data.scoped.filter((item) => item.analysisResult && item.resultSaved && item.nextTaskCreated);
  const latest = scenarioResults.slice(0, 3);
  return `
    <div class="scenario-cycle">
      <div class="cycle-kpis">
        ${costKpi("분석 생성", `${data.scoped.filter((item) => item.analysisResult).length}건`, "검토 결과가 만들어진 관리 건")}
        ${costKpi("검토 결과 저장", `${data.savedResults.length}건`, "사용자 가치가 기록된 관리 건")}
        ${costKpi("후속 작업", `${data.followUps.length}건`, "후속 확인 항목까지 이어진 관리 건")}
      </div>
      <p class="insight-copy">완료 기준은 분석 결과 생성, 검토 결과 저장, 후속 작업 생성 3단계입니다. 현재 완성형 사이클은 ${completeCases.length}건입니다.</p>
      <div class="scenario-result-list">
        ${
          latest.length
            ? latest.map((entry) => `
                <article>
                  <strong>${escapeHtml(entry.caseCode)} · ${escapeHtml(entry.title)}</strong>
                  <span>${escapeHtml(entry.time)}</span>
                  <p>${escapeHtml(entry.value)}</p>
                </article>
              `).join("")
            : '<div class="empty-state">저장된 시나리오 결과 없음. 전세 사전 점검 또는 관리 건 실행 후 검토 결과 저장을 누르세요.</div>'
        }
      </div>
    </div>
  `;
}

function dataStatusView() {
  const data = buildDashboardData();
  const sources = [
    ["데모 데이터", data.demoData.length, "제안서 시연용 기본 관리 건"],
    ["신규 접수 정보", data.userInput.length, "등록 폼으로 생성된 관리 건"],
    ["저장된 분석 결과", data.savedResults.length, "검토 결과 저장 버튼으로 기록된 관리 건"],
  ];
  return `
    <div class="data-status">
      <div class="data-source-grid">
        ${sources
          .map(([label, count, detail]) => `
            <article title="${escapeHtml(detail)}">
              <strong>${count}건</strong>
              <span>${escapeHtml(label)}</span>
              <p>${escapeHtml(detail)}</p>
            </article>
          `)
          .join("")}
      </div>
      <p class="insight-copy">최근 저장 시각: ${escapeHtml(lastSavedAt || "이번 세션에서 아직 저장 없음")} · 실제 API 연동 전까지는 데이터 출처를 화면에서 계속 구분합니다.</p>
    </div>
  `;
}

function dataReliabilityView() {
  const data = buildDashboardData();
  const running = data.scoped.filter((item) => item.status === "Agent Running").length;
  const cards = [
    {
      state: "sample",
      title: "샘플 데이터",
      value: `${data.demoData.length}건`,
      detail: "제안서 시연을 위해 준비된 기본 관리 건입니다.",
    },
    {
      state: "real",
      title: "사용자 입력",
      value: `${data.userInput.length}건`,
      detail: "화면에서 등록한 데이터입니다. 실제 은행 원장 연동은 아직 아닙니다.",
    },
    {
      state: "success",
      title: "분석 완료",
      value: `${data.savedResults.length}건`,
      detail: "검토 결과 저장과 후속 작업 생성까지 완료된 관리 건을 추적합니다.",
    },
    {
      state: "loading",
      title: "분석 중",
      value: `${running}건`,
      detail: running ? "AI 업무지원 기능이 근거 수집과 담당자 승인 절차를 확인 중입니다." : "현재 실행 중인 분석은 없습니다.",
    },
    {
      state: "empty",
      title: "빈 상태",
      value: scenarioResults.length ? "해소" : "대기",
      detail: scenarioResults.length ? "저장된 시나리오 결과가 있습니다." : "사전 점검 실행 후 검토 결과 저장을 누르면 완료 기록이 생성됩니다.",
    },
    {
      state: "error",
      title: "외부 API",
      value: "미연결",
      detail: "등기부, 보증보험, 은행 심사 API는 아직 데모 어댑터 상태입니다.",
    },
    {
      state: "stale",
      title: "갱신 기준",
      value: lastSavedAt || "샘플 스냅샷",
      detail: "실제 API 연동 전까지는 기준 시점과 출처를 반드시 함께 확인해야 합니다.",
    },
  ];

  return `
    <div class="data-reliability">
      <div class="data-state-grid" aria-label="데이터 신뢰도 상태">
        ${cards.map(dataStateCard).join("")}
      </div>
      <p class="insight-copy">현재 대시보드는 샘플 데이터와 신규 접수 정보를 함께 사용합니다. 실제 API 미연결 항목은 고객 안내나 자동 실행 근거로 사용하지 말고, 승인 전 추가 확인이 필요합니다.</p>
    </div>
  `;
}

function dataStateCard(card) {
  const labels = {
    loading: "Loading",
    success: "Success",
    empty: "Empty",
    error: "Error",
    sample: "Sample",
    real: "Real",
    stale: "Stale",
  };
  return `
    <article class="data-state-card" data-state="${escapeHtml(card.state)}">
      <span class="data-state-badge state-${escapeHtml(card.state)}">${escapeHtml(labels[card.state] || card.state)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <em>${escapeHtml(card.title)}</em>
      <p>${escapeHtml(card.detail)}</p>
    </article>
  `;
}

function dashboardCostView() {
  const data = buildDashboardData();
  const usedRate = data.budget ? Math.round((data.spent / data.budget) * 100) : 0;
  const expectedRate = data.budget ? Math.round((data.expected / data.budget) * 100) : 0;
  return `
    <div class="cost-summary">
      <div class="cost-head">
        ${svgDonut(data.spent, data.budget, { label: "예산 사용률", sub: `${formatWon(data.spent)} / ${formatWon(data.budget)}` })}
        <div class="cost-kpis">
          ${costKpi("현재 사용", formatWon(data.spent), `${usedRate}% 사용`)}
          ${costKpi("월말 예상", formatWon(data.expected), `${expectedRate}% 예상`)}
          ${costKpi("절감 가능 위험", formatWon(data.avoidableLoss), `비용 대비 ${data.roi}배 효과`)}
        </div>
      </div>
      <p class="insight-copy">${escapeHtml(generateCostInsight(data))}</p>
      <div class="cost-bars" aria-label="항목별 비용 비중">
        ${costByWorkType
          .map(([label, ratio]) => {
            const value = Math.round(data.expected * ratio);
            return `
              <div class="cost-bar-row">
                <span>${escapeHtml(label)}</span>
                <div class="progress-track"><i style="width:${Math.round(ratio * 100)}%"></i></div>
                <strong>${escapeHtml(formatWon(value))}</strong>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function generateCostInsight(data) {
  const [topLabel, topRatio] = costByWorkType.slice().sort((a, b) => b[1] - a[1])[0];
  const topPercent = Math.round(topRatio * 100);
  const priority = data.jeonseRisk.length
    ? "고위험 전세"
    : data.pending.length
      ? "승인 대기"
      : data.blocked.length
        ? "고객 영향 조치 보류"
        : "근거 미연결";
  const action = data.roi >= 3 ? "비용 대비 효과가 큰 관리 건" : "승인 SLA가 임박한 관리 건";
  return `이번 주 예상 비용 ${formatWon(data.expected)} 중 ${topLabel}이 ${topPercent}%를 차지합니다. ${priority} 관리 건부터 ${action} 기준으로 처리하면 예상 절감 가능액 ${formatWon(data.avoidableLoss)}을 우선 방어할 수 있습니다.`;
}

function costKpi(label, value, detail) {
  return `
    <article class="cost-kpi">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <p>${escapeHtml(detail)}</p>
    </article>
  `;
}

function dashboardTrendView() {
  const max = Math.max(...monthlyCostTrend.map(([, value]) => value));
  const latestTrend = monthlyCostTrend[monthlyCostTrend.length - 1];
  const series = monthlyCostTrend.map(([month, value]) => ({ x: month, y: value, label: formatWon(value) }));
  return `
    ${svgArea(series, { w: 340, h: 130, aria: "월별 비용 추이" })}
    <p class="insight-copy">${escapeHtml(latestTrend[0])} 비용은 ${formatWon(latestTrend[1])}이며, 전세 위험 점검과 승인 로그 생성 비중이 증가했습니다.</p>
  `;
}

function dashboardRegionView() {
  const regions = buildDashboardData().regions.sort((a, b) => b.average - a.average);
  if (!regions.length) return '<div class="empty-state">표시할 지역 데이터 없음</div>';
  const bars = rankingBars(regions.map((e) => ({
    label: e.region,
    sub: `${e.total}건 · 고위험 ${e.high} · 승인대기 ${e.pending}`,
    value: e.average,
  })));
  return `
    <div class="viz-label">주의 수준 점수 분포</div>
    ${riskHistogram(visibleCases())}
    <div class="viz-label">지역별 평균 주의 수준</div>
    ${bars}
  `;
}

function dashboardRankingView() {
  const ranked = visibleCases().slice().sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  if (!ranked.length) return '<div class="empty-state">표시할 우선순위 없음</div>';
  return rankingBars(ranked.map((item) => ({
    label: `${item.code} · ${item.customerName}`,
    sub: item.primaryPain,
    value: item.riskScore,
    caseId: item.id,
  })));
}

function dispatchResultMarkup() {
  if (!lastDispatchResult) return "";
  return `
    <section class="dispatch-result workspace-panel">
      <div>
        <p class="eyebrow">AI 분석 요청 생성</p>
        <h3>${escapeHtml(lastDispatchResult.caseCode)} · ${escapeHtml(lastDispatchResult.caseTitle)}</h3>
        <p>${escapeHtml(lastDispatchResult.summary)}</p>
      </div>
      <div class="dispatch-result-side">
        <span class="status-pill status-running">${escapeHtml(lastDispatchResult.runId)}</span>
        <span>${escapeHtml(lastDispatchResult.next)}</span>
      </div>
    </section>
  `;
}

function recentCasesView() {
  const rows = visibleCases()
    .slice()
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5)
    .map(renderCaseRow)
    .join("");
  return `<div class="case-list compact-case-list">${rows}</div>`;
}

function inboxView() {
  const targets = visibleCases().filter((item) => item.status === "Escalated" || item.status === "Approval Pending");
  if (!targets.length) return '<div class="empty-state">확인할 긴급 알림이 없습니다</div>';
  return `
    <div class="work-grid">
      ${targets
        .map(
          (item) => `
            <button class="work-item link-card ${item.id === selectedCaseId && activeDetailType === "case" ? "is-selected" : ""}" type="button" data-case-id="${escapeHtml(item.id)}">
              <div class="item-head">
                <strong>${escapeHtml(item.code)} · ${escapeHtml(item.customerName)}</strong>
                <span class="status-pill ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span>
              </div>
              <p>${escapeHtml(item.nextAction)}</p>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function casesView() {
  return `
    <div class="two-col">
      ${cases.map((item) => workItem(`${item.code} · ${item.customerName}`, `${item.primaryPain} · ${item.exposure}`, `${statusLabel(item.status)} · ${item.zeroHuman}`)).join("")}
    </div>
  `;
}

function approvalsView() {
  const approvals = visibleCases().filter((item) => {
    if (approvalTab === "all") return ["Approval Pending", "Approved", "Rejected", "Escalated"].includes(item.status);
    if (approvalTab === "pending") return item.status === "Approval Pending";
    if (approvalTab === "approved") return item.status === "Approved";
    if (approvalTab === "rejected") return item.status === "Rejected" || item.status === "Escalated";
    return true;
  });
  if (!approvals.length) return '<div class="empty-state">검토할 승인 요청이 없습니다</div>';
  return `
    <div class="approval-list">
      ${approvals
        .map(
          (item) => `
            <article class="work-item approval-item ${item.id === selectedCaseId && activeDetailType === "case" ? "is-selected" : ""}">
              <div class="item-head">
                <strong>${escapeHtml(item.approvalTitle)}</strong>
                <span class="status-pill status-pending">${escapeHtml(item.zeroHuman)}</span>
              </div>
              <p>${escapeHtml(item.code)} · ${escapeHtml(item.customerName)} · ${escapeHtml(item.nextAction)}</p>
              <div class="action-row approval-actions">
                <button class="secondary-button" type="button" data-approve-case="${escapeHtml(item.id)}" ${item.status === "Approval Pending" ? "" : "disabled"}>
                  <span aria-hidden="true">✓</span>
                  승인
                </button>
                <button class="danger-button" type="button" data-reject-case="${escapeHtml(item.id)}" ${item.status === "Approval Pending" ? "" : "disabled"}>
                  <span aria-hidden="true">×</span>
                  수정 요청
                </button>
                <button class="ghost-button" type="button" data-case-id="${escapeHtml(item.id)}">상세 보기</button>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function approvalMatrixView() {
  return `
    <div class="matrix-table" role="table" aria-label="승인 레벨 매트릭스">
      <div class="matrix-row matrix-head" role="row">
        <span>레벨</span><span>점수</span><span>고객 안내</span><span>계약/전세</span><span>사기 차단</span><span>검토 근거</span>
      </div>
      ${approvalLevelMatrix
        .map(
          (row) => `
            <div class="matrix-row" role="row">
              <strong>${escapeHtml(row.level)}</strong>
              <span>${escapeHtml(row.score)}</span>
              <span>${escapeHtml(row.customerNotice)}</span>
              <span>${escapeHtml(row.contract)}</span>
              <span>${escapeHtml(row.fraud)}</span>
              <span>${escapeHtml(row.reason)}</span>
            </div>
          `,
        )
        .join("")}
    </div>
    <p class="insight-copy">검토 카드는 신호별 기여 점수를 합산해 내부 검토용 점수를 만들고, 이 표의 점수 구간과 조치 유형으로 승인 레벨을 계산합니다.</p>
  `;
}

function approvalTabLabel(tab) {
  return {
    all: "전체",
    pending: "대기",
    approved: "승인",
    rejected: "차단/수정 요청",
  }[tab] || tab;
}

function runStatusLabel(status) {
  const labels = {
    running: "실행 중",
    approval_pending: "승인 대기",
    escalated: "상위 검토",
    completed: "완료",
    rejected: "수정 요청",
  };
  return labels[status] || status;
}

function runsView() {
  if (!agentRuns.length) return '<div class="empty-state">요청된 AI 분석이 없습니다</div>';
  return `
    <div class="run-log-list">
      ${agentRuns
        .map((run) => {
          const target = cases.find((item) => item.id === run.caseId);
          const label = runStatusLabel(run.status);
          return `
            <article class="run-card run-log-card ${run.status === "running" ? "is-live" : ""}">
              <div class="run-head">
                <strong>${run.status === "running" ? '<span class="pulse"></span>' : ""}${escapeHtml(run.id)} · ${escapeHtml(agentLabel(run.agentName))}</strong>
              <span class="status-pill ${statusClass(run.status)}">${escapeHtml(label)}</span>
              </div>
              <button class="link-button" type="button" data-case-id="${escapeHtml(run.caseId)}">
                ${escapeHtml(run.caseCode)} · ${escapeHtml(target ? target.customerName : "관리 건 없음")}
              </button>
              <p class="run-command">“${escapeHtml(run.command)}”</p>
              <div class="run-log">
                ${run.log
                  .map(
                    ([time, text]) => `
                      <div class="audit-item">
                        <span class="audit-time">${escapeHtml(time)}</span>
                        <p>${escapeHtml(localizeLine(text))}</p>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function jeonseView() {
  const jeonseCase = cases.find((item) => item.pains.includes("jeonse-fraud"));
  if (!jeonseCase) {
    return `
      <div class="empty-state">
        <p>전세 관련 위험 신호 관리 건이 없습니다. 관리 건을 등록한 뒤 다시 시도하세요.</p>
      </div>
    `;
  }
  return `
    <div class="jeonse-summary">
      <article class="work-item featured is-clickable ${jeonseCase.id === selectedCaseId && activeDetailType === "case" ? "is-selected" : ""}" data-case-id="${escapeHtml(jeonseCase.id)}" role="button" tabindex="0">
        <div class="item-head">
          <strong>${escapeHtml(jeonseCase.code)} · ${escapeHtml(jeonseCase.customerName)}</strong>
          <span class="status-pill ${statusClass(jeonseCase.status)}">${escapeHtml(statusLabel(jeonseCase.status))}</span>
        </div>
        <p>${escapeHtml(jeonseCase.primaryPain)} · ${escapeHtml(jeonseCase.exposure)}</p>
        <div class="tag-row">${jeonseCase.rootCauses.map((cause) => `<span class="tag">${escapeHtml(cause)}</span>`).join("")}</div>
      </article>
      <section class="diagnosis-panel">
        <div class="diagnosis-copy">
          <p class="eyebrow">실제 입력 흐름</p>
          <h3>전세 위험 사전 점검 실행</h3>
          <p>보증금, 주변 매매가, 고객 자산, 월소득, 권리관계 신호를 입력하면 전세가율·자산노출·주거비 부담을 계산해 승인 대기 리포트로 연결합니다.</p>
        </div>
        ${jeonseDiagnosisFormMarkup(jeonseCase)}
        ${jeonseDiagnosticResultMarkup(jeonseCase)}
      </section>
      <div class="feature-grid">
        ${jeonseFeatures
          .map((feature) => {
            const featureAgents = agentsByFeature(feature);
            return `
              <article class="work-item is-clickable ${feature.id === selectedFeatureId && activeDetailType === "feature" ? "is-selected" : ""}" data-feature-id="${escapeHtml(feature.id)}" role="button" tabindex="0">
                <div class="item-head">
                  <strong>${escapeHtml(feature.title)}</strong>
                  <span class="source-badge">${featureAgents.length}개 AI 업무지원 · ${feature.skills.length}개 업무 기능</span>
                </div>
                <p>${escapeHtml(feature.description)}</p>
                <div class="tag-row">${feature.skills.map((skill) => `<span class="tag">${escapeHtml(skillLabel(skill))}</span>`).join("")}</div>
              </article>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function jeonseDiagnosisFormMarkup(item) {
  const inputs = item.jeonseInputs || {
    deposit: 235000000,
    market: 260000000,
    assets: 300000000,
    income: 3600000,
    rights: "근저당 있음",
  };
  return `
    <form id="jeonse-diagnosis-form" class="diagnosis-form">
      <label>
        <span>전세보증금</span>
        <input name="deposit" inputmode="numeric" value="${escapeHtml(inputs.deposit)}" aria-label="전세보증금" />
      </label>
      <label>
        <span>주변 매매가</span>
        <input name="market" inputmode="numeric" value="${escapeHtml(inputs.market)}" aria-label="주변 매매가" />
      </label>
      <label>
        <span>고객 총자산</span>
        <input name="assets" inputmode="numeric" value="${escapeHtml(inputs.assets)}" aria-label="고객 총자산" />
      </label>
      <label>
        <span>월 소득</span>
        <input name="income" inputmode="numeric" value="${escapeHtml(inputs.income)}" aria-label="월 소득" />
      </label>
      <label>
        <span>권리관계 신호</span>
        <select name="rights" aria-label="권리관계 신호">
          ${["확인 필요", "근저당 있음", "신탁등기 의심", "특이사항 낮음"].map((option) => `<option value="${escapeHtml(option)}" ${inputs.rights === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
        </select>
      </label>
      <button class="primary-button" type="submit">
        <span aria-hidden="true">${iconSvg("activity")}</span>
        사전 점검 실행
      </button>
    </form>
  `;
}

function jeonseDiagnosticResultMarkup(item) {
  if (!item.jeonseInputs) {
    return `
      <div class="diagnosis-result empty-diagnosis">
        <strong>아직 계산된 사전 점검 없음</strong>
        <p>입력값으로 사전 점검을 실행하면 전세가율, 자산노출, 월 부담률, 후속 확인 항목이 표시됩니다.</p>
      </div>
    `;
  }
  const inputs = item.jeonseInputs;
  return `
    <div class="diagnosis-result">
      <div class="diagnosis-result-head">
        <strong>사전 점검 결과 · 주의 수준 ${item.riskScore}점</strong>
        <span class="status-pill ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span>
      </div>
      <div class="diagnosis-kpis">
        ${costKpi("전세가율", `${inputs.ratio}%`, inputs.ratio >= 80 ? "과다 후보" : "주의")}
        ${costKpi("자산노출", `${inputs.exposureRatio}%`, inputs.exposureRatio >= 70 ? "손실 민감도 높음" : "중간")}
        ${costKpi("월 부담률", `${inputs.housingBurden}%`, inputs.housingBurden >= 25 ? "상환 부담 확인" : "관리 가능")}
      </div>
      <p class="insight-copy">${escapeHtml(item.analysisResult ? item.analysisResult.recommendation : item.nextAction)}</p>
    </div>
  `;
}

function agentsView() {
  const agentById = Object.fromEntries(agents.map((agent) => [agent.id, agent]));
  return `
    <div class="agent-team-groups">
      ${agentTeamGroups
        .map((group) => {
          const groupAgents = group.agentIds.map((id) => agentById[id]).filter(Boolean);
          return `
            <section class="agent-team-group" aria-label="${escapeHtml(group.title)}">
              <div class="agent-team-group-head">
                <span class="agent-team-icon" aria-hidden="true">${iconSvg(group.icon)}</span>
                <div>
                  <p class="eyebrow">${escapeHtml(group.owner)} 담당</p>
                  <h4>${escapeHtml(group.title)}</h4>
                  <p>${escapeHtml(group.description)}</p>
                </div>
                <div class="agent-team-stats">
                  <span>${groupAgents.length}개 AI 업무지원</span>
                  <span>실행 ${groupAgents.filter((agent) => agent.status === "running").length}</span>
                  <span>대기열 ${groupAgents.reduce((sum, agent) => sum + agent.queue, 0)}</span>
                </div>
              </div>
              <div class="agent-team-grid">
                ${groupAgents.map(agentCardMarkup).join("")}
              </div>
            </section>
          `;
        })
        .join("")}
    </div>
  `;
}

function agentCardMarkup(agent) {
  return `
    <article class="agent-card is-clickable ${agent.id === selectedAgentId && activeDetailType === "agent" ? "is-selected" : ""}" data-agent-id="${escapeHtml(agent.id)}" role="button" tabindex="0">
      <div class="item-head">
        <strong>${escapeHtml(agentLabel(agent))}</strong>
        <span class="status-pill ${statusClass(agent.status)}">${escapeHtml(statusLabel(agent.status))}</span>
      </div>
      <p>${escapeHtml(localizeLine(agent.role))}</p>
      <div class="tag-row">${agent.skills.map((skill) => `<span class="tag">${escapeHtml(skillLabel(skill))}</span>`).join("")}</div>
      <p>보고 대상: ${escapeHtml(agentLabel(agent.reportsTo))} · 상태 확인 ${escapeHtml(agent.heartbeat)} · 대기열 ${agent.queue}</p>
    </article>
  `;
}

function agentReadinessView() {
  return `
    <div class="gap-grid">
      ${agentReadinessGaps
        .map(
          (gap) => `
            <article class="gap-card">
              <div class="gap-card-head">
                <span class="gap-icon" aria-hidden="true">${iconSvg(gap.icon)}</span>
                <div>
                  <strong>${escapeHtml(gap.title)}</strong>
                  <span>${escapeHtml(gap.level)}</span>
                </div>
              </div>
              <p>${escapeHtml(gap.detail)}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function orgChartView() {
  const agentById = Object.fromEntries(agents.map((agent) => [agent.id, agent]));
  const branches = [
    {
      title: "지역 위험 신호 탐지",
      subtitle: "기사·공식자료·상담 메모 기반 지역 금융 위험 신호",
      agents: ["pain-radar", "cashflow", "policy", "analytics"],
    },
    {
      title: "전세 보호 라인",
      subtitle: "전세가율·권리관계·고객 자산노출·은행 연계",
      agents: ["jeonse-lead", "deposit-ratio", "registry-rights", "tenant-asset", "bank-linkage"],
      featured: true,
    },
    {
      title: "승인과 고객 운영",
      subtitle: "RM 초안, 담당자 승인 절차, 고객 안내 전 통제",
      agents: ["rm-copilot"],
    },
    {
      title: "사기 차단과 준법",
      subtitle: "사기 차단, 준법 검토, 특약/계약 문구 통제",
      agents: ["fraud", "contract-check"],
    },
  ];

  return `
      <div class="org-diagram" role="img" aria-label="JB 금융안전 업무지원 조직도">
      <div class="org-tier org-human-tier">
        ${humanNode("RM 최종 승인자", "고객 안내와 RM 조치 최종 승인")}
        ${humanNode("준법 최종 승인자", "규제, 개인정보, 법률 표현 최종 검토")}
      </div>
      <div class="org-connector split-connector" aria-hidden="true"></div>
      <div class="org-tier org-command-tier">
        ${orgNode(agentById.orchestrator, "command")}
        ${orgNode(agentById.compliance, "command")}
      </div>
      <div class="org-connector branch-connector" aria-hidden="true"></div>
      <div class="org-branch-grid">
        ${branches.map((branch) => orgBranch(branch, agentById)).join("")}
      </div>
      <div class="org-legend">
        <span><i class="legend-dot running"></i>실행 중</span>
        <span><i class="legend-dot pending"></i>승인 대기</span>
        <span><i class="legend-dot idle"></i>대기</span>
      </div>
    </div>
  `;
}

function humanNode(title, description) {
  return `
    <article class="org-node human">
      <span class="node-kicker">담당자 최종 확인</span>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(description)}</p>
    </article>
  `;
}

function orgBranch(branch, agentById) {
  return `
    <section class="org-branch ${branch.featured ? "is-featured" : ""}">
      <div class="branch-head">
        <strong>${escapeHtml(branch.title)}</strong>
        <p>${escapeHtml(branch.subtitle)}</p>
      </div>
      <div class="branch-agents">
        ${branch.agents.map((id) => orgNode(agentById[id], id === "jeonse-lead" ? "line-lead" : "")).join("")}
      </div>
    </section>
  `;
}

function orgNode(agent, variant = "") {
  if (!agent) return "";
  const status = agent.status === "running" ? "status-running" : agent.status === "pending_approval" ? "status-pending" : "status-new";
  const selected = agent.id === selectedAgentId && activeDetailType === "agent" ? "is-selected" : "";
  return `
    <article class="org-node is-clickable ${variant} ${selected}" data-agent-id="${escapeHtml(agent.id)}" role="button" tabindex="0">
      <div class="node-topline">
        <span class="node-kicker">${escapeHtml(typeLabel(agent.type))}</span>
        <span class="status-pill ${status}">${escapeHtml(statusLabel(agent.status))}</span>
      </div>
      <strong>${escapeHtml(agentLabel(agent))}</strong>
      <p>${escapeHtml(localizeLine(agent.role))}</p>
      <div class="node-meta">
        <span>상태 확인 ${escapeHtml(agent.heartbeat)}</span>
        <span>대기열 ${agent.queue}</span>
        <span>업무 기능 ${agent.skills.length}개</span>
      </div>
    </article>
  `;
}

function skillsView() {
  return `
    <div class="skill-grid">
      ${skillRack
        .map(
          (skill) => `
            <article class="skill-card is-clickable ${skill.slug === selectedSkillId && activeDetailType === "skill" ? "is-selected" : ""}" data-skill-id="${escapeHtml(skill.slug)}" role="button" tabindex="0">
              <div class="item-head">
                <strong>${escapeHtml(skillLabel(skill.slug))}</strong>
                <span class="source-badge">${escapeHtml(typeLabel(skill.type))}</span>
              </div>
              <p>${escapeHtml(localizeLine(skill.purpose))}</p>
              <span class="risk-chip ${skill.risk === "high" ? "status-escalated" : skill.risk === "medium" ? "status-pending" : "status-approved"}">${escapeHtml(statusLabel(skill.risk))} · ${escapeHtml(approvalLabel(skill.approval))}</span>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function routinesView() {
  return `
    <div class="work-grid">
      ${routines
        .map(
          (routine, index) => `
            <article class="work-item">
              <div class="item-head">
                <strong>${escapeHtml(routine[1])}</strong>
                <span class="status-pill ${routine[3] === "enabled" ? "status-approved" : "status-new"}">${escapeHtml(statusLabel(routine[3]))}</span>
              </div>
              <p>${escapeHtml(routine[0])} · ${escapeHtml(agentLabel(routine[2]))}</p>
              <div class="action-row action-stack">
                <button class="ghost-button" type="button" data-routine-toggle="${index}">${routine[3] === "enabled" ? "일시정지" : "재개"}</button>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function goalsView() {
  return `
    <div class="work-grid">
      ${goals
        .map(
          (goal) => `
            <article class="work-item">
              <div class="item-head"><strong>${escapeHtml(localizeLine(goal[0]))}</strong><span>${goal[2]}%</span></div>
              <p>${escapeHtml(goal[1])}</p>
              <div class="progress-track"><i style="width:${goal[2]}%"></i></div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function activityView() {
  return `
    <div class="two-col">
      ${activity
        .map(
          ([time, agent, action, code]) => `
            <article class="activity-item">
              <span class="audit-time">${escapeHtml(time)}</span>
              <strong>${escapeHtml(agentLabel(agent))} · ${escapeHtml(actionLabel(action))}</strong>
              <p>대상 ${escapeHtml(code)}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function budgetView() {
  return `
    <div class="budget-grid">
      ${agents
        .map((agent) => {
          const percent = Math.round((agent.spent / agent.budget) * 100);
          return `
            <div class="budget-row">
              <strong>${escapeHtml(agentLabel(agent))}</strong>
              <div class="progress-track"><i style="width:${percent}%"></i></div>
              <span>${percent}%</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function settingsView() {
  return `
    <div class="work-grid">
      ${workItem("조직 프로필", "전북은행 · 광주은행 · JB우리캐피탈 데모 조직을 전환합니다.", "로컬 신뢰")}
      ${workItem("승인 정책", "L0-L4 자동화 레벨과 금지 자동 실행 항목을 관리합니다.", "필수 통제")}
      ${workItem("외부 연동", "뉴스, 공식자료, RM 상담 기록, 보안 경보 어댑터를 연결합니다.", "데모 연동")}
      <article class="work-item settings-action-card">
        <div class="item-head">
          <strong>데모 상태 초기화</strong>
          <span class="source-badge">로컬 저장소</span>
        </div>
        <p>브라우저에 저장된 사용자 입력, 실행 결과, 후속 작업 기록을 지우고 기본 데모 상태로 다시 시작합니다.</p>
        <button id="reset-demo-state" class="danger-button" type="button">
          <span aria-hidden="true">${iconSvg("repeat")}</span>
          데모 상태 초기화
        </button>
      </article>
    </div>
  `;
}

function workItem(title, description, meta) {
  return `
    <article class="work-item">
      <div class="item-head">
        <strong>${escapeHtml(title)}</strong>
        <span class="source-badge">${escapeHtml(localizeLine(meta))}</span>
      </div>
      <p>${escapeHtml(localizeLine(description))}</p>
    </article>
  `;
}

function renderProperties() {
  const contextPanel = document.getElementById("context-panel");
  if (!contextPanel) return;

  const contextPages = {
    agents: agentContextMarkup,
    orgchart: agentContextMarkup,
    skills: skillContextMarkup,
    routines: routineContextMarkup,
    goals: goalContextMarkup,
    activity: activityContextMarkup,
    budget: budgetContextMarkup,
    settings: settingsContextMarkup,
    "rm-dashboard": rmDashboardContextMarkup,
    "corporate-credit-dashboard": corporateCreditDashboardContextMarkup,
    "jeonse-protection-dashboard": jeonseProtectionDashboardContextMarkup,
    "consumer-protection-dashboard": consumerProtectionDashboardContextMarkup,
    "fds-dashboard": fdsDashboardContextMarkup,
    "compliance-dashboard": complianceDashboardContextMarkup,
  };

  let markup;
  if (activeDetailType === "agent" && currentAgent()) {
    markup = agentDetailMarkup();
  } else if (activeDetailType === "skill" && currentSkill()) {
    markup = skillDetailMarkup();
  } else if (activeDetailType === "feature" && currentFeature()) {
    markup = featureDetailMarkup();
  } else if (activeDetailType === "view" && contextPages[activeView]) {
    markup = contextPages[activeView]();
  } else {
    markup = caseContextMarkup();
  }

  contextPanel.innerHTML = `
    <div class="properties-header">
      <div>
        <p class="eyebrow">상세 정보</p>
        <h2>${escapeHtml(propertyPanelTitle())}</h2>
      </div>
      <span class="status-pill status-new">${escapeHtml(activeDetailLabel(activeDetailType))}</span>
    </div>
    ${markup}
  `;
}

function propertyPanelTitle() {
  if (activeDetailType === "agent" && currentAgent()) return agentLabel(currentAgent());
  if (activeDetailType === "skill" && currentSkill()) return skillLabel(currentSkill().slug);
  if (activeDetailType === "feature" && currentFeature()) return currentFeature().title;
  if (activeDetailType === "view" && activeView === "rm-dashboard") return "RM 역할 대시보드";
  if (activeDetailType === "view" && activeView === "corporate-credit-dashboard") return "기업여신 담당자 대시보드";
  if (activeDetailType === "view" && activeView === "jeonse-protection-dashboard") return "전세보호 담당자 대시보드";
  if (activeDetailType === "view" && activeView === "consumer-protection-dashboard") return "소비자 보호 담당자 대시보드";
  if (activeDetailType === "view" && activeView === "fds-dashboard") return "보이스피싱/FDS 담당자 대시보드";
  if (activeDetailType === "view" && activeView === "compliance-dashboard") return "내부통제 준법감시 담당자 대시보드";
  if (activeDetailType === "view") return "선택 화면 요약";
  const item = currentCase();
  return item ? `${item.code} · ${item.customerName}` : "속성";
}

function caseLinkButton(item) {
  return `
    <button class="work-item link-card" type="button" data-case-id="${escapeHtml(item.id)}">
      <div class="item-head">
        <strong>${escapeHtml(item.code)} · ${escapeHtml(item.customerName)}</strong>
        <span class="status-pill ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span>
      </div>
      <p>${escapeHtml(item.primaryPain)}</p>
    </button>
  `;
}

function agentLinkButton(agent) {
  const status = agent.status === "running" ? "status-running" : agent.status === "pending_approval" ? "status-pending" : "status-new";
  return `
    <button class="work-item link-card" type="button" data-agent-id="${escapeHtml(agent.id)}">
      <div class="item-head">
        <strong>${escapeHtml(agentLabel(agent))}</strong>
        <span class="status-pill ${status}">${escapeHtml(statusLabel(agent.status))}</span>
      </div>
      <p>${escapeHtml(localizeLine(agent.role))}</p>
    </button>
  `;
}

function skillTagButton(slug) {
  return `<button class="tag tag-button" type="button" data-skill-id="${escapeHtml(slug)}" title="${escapeHtml(slug)}">${escapeHtml(skillLabel(slug))}</button>`;
}

function detailGroup(title, description, body, iconName = "folder") {
  return `
    <section class="detail-group" aria-label="${escapeHtml(title)}">
      <div class="detail-group-head">
        <span class="detail-group-icon" aria-hidden="true">${iconSvg(iconName)}</span>
        <span>
          <strong>${escapeHtml(title)}</strong>
          ${description ? `<small>${escapeHtml(description)}</small>` : ""}
        </span>
      </div>
      <div class="detail-group-body">${body}</div>
    </section>
  `;
}

function categorizeAgent(agent) {
  if (["orchestrator", "compliance", "risk", "contract"].includes(agent.type)) return "관제·통제";
  if (["finance", "banking"].includes(agent.type)) return "금융·은행";
  if (["communication"].includes(agent.type)) return "고객 안내";
  return "탐지·분석";
}

function groupedAgentsMarkup(agentList) {
  const groups = ["관제·통제", "탐지·분석", "금융·은행", "고객 안내"]
    .map((title) => [title, agentList.filter((agent) => categorizeAgent(agent) === title)])
    .filter(([, entries]) => entries.length);
  if (!groups.length) return '<div class="empty-state">배정된 AI 업무지원 없음</div>';
  return groups
    .map(([title, entries]) =>
      detailGroup(
        title,
        `${entries.length}개 AI 업무지원`,
        `<div class="context-list">${entries.map(agentLinkButton).join("")}</div>`,
        title === "관제·통제" ? "key" : title === "금융·은행" ? "wallet" : title === "고객 안내" ? "users" : "activity",
      ),
    )
    .join("");
}

function collapsiblePanel(key, eyebrow, title, body, meta = "", extraClass = "") {
  const collapsed = collapsedPanelKeys.has(key);
  const bodyId = `panel-body-${slugKey(key)}`;
  return `
    <section class="panel collapsible-panel ${collapsed ? "is-collapsed" : ""} ${extraClass}" data-panel-key="${escapeHtml(key)}">
      <button class="panel-toggle" type="button" data-collapse-key="${escapeHtml(key)}" aria-expanded="${collapsed ? "false" : "true"}" aria-controls="${escapeHtml(bodyId)}">
        <span class="panel-toggle-title">
          <span class="eyebrow">${escapeHtml(eyebrow)}</span>
          <strong>${escapeHtml(title)}</strong>
        </span>
        ${meta ? `<span class="panel-toggle-meta">${escapeHtml(meta)}</span>` : ""}
        <span class="panel-toggle-icon" aria-hidden="true">${iconSvg(collapsed ? "chevron-right" : "chevron-down")}</span>
      </button>
      <div id="${escapeHtml(bodyId)}" class="panel-body" aria-hidden="${collapsed ? "true" : "false"}">${body}</div>
    </section>
  `;
}

function agentDetailMarkup() {
  const agent = currentAgent();
  const linked = casesByAgent(agent.id);
  const percent = Math.round((agent.spent / agent.budget) * 100);
  const statusPill = agent.status === "running" ? "status-running" : agent.status === "pending_approval" ? "status-pending" : "status-new";
  const firstCase = linked[0];
  return `
    ${collapsiblePanel(
      "agent-summary",
      "선택 AI 업무지원",
      agentLabel(agent),
      `<div class="case-properties">
        ${detailGroup(
          "역할과 보고",
          "이 AI 업무지원 기능이 맡은 업무와 보고 대상을 확인합니다.",
          `<div class="property-list">
            ${propertyRow("담당 업무", localizeLine(agent.role))}
            ${propertyRow("유형", typeLabel(agent.type))}
            ${propertyRow("보고 대상", agentLabel(agent.reportsTo))}
          </div>`,
          "network",
        )}
        ${detailGroup(
          "운영 상태",
          "현재 작업량과 예산 사용률을 확인합니다.",
          `<div class="property-list">
            ${propertyRow("상태 확인", agent.heartbeat)}
            ${propertyRow("대기열", agent.queue)}
            ${propertyRow("예산", `₩${agent.spent.toLocaleString()} / ₩${agent.budget.toLocaleString()} · ${percent}%`)}
            ${propertyRow("현재 업무", localizeLine(agent.currentCase))}
          </div>`,
          "activity",
        )}
        ${detailGroup("연결된 업무 기능", "이 AI 업무지원 기능이 실행할 수 있는 기능입니다.", `<div class="tag-row">${agent.skills.map(skillTagButton).join("")}</div>`, "puzzle")}
      </div>`,
      statusLabel(agent.status),
      "selected-case-panel",
    )}
    ${compactPanel(
      "담당 관리 건",
      "담당 관리 건",
      linked.length
        ? `<div class="context-list">${linked.map(caseLinkButton).join("")}</div>`
        : '<div class="empty-state">연결된 관리 건 없음</div>',
      `${linked.length}개`,
    )}
    ${compactPanel(
      "실행 작업",
      "실행 가능한 작업",
      `<div class="action-row action-stack">
        <button id="agent-run-case" class="primary-button" type="button" ${firstCase && firstCase.status !== "Agent Running" ? "" : "disabled"}>
          <span aria-hidden="true">▶</span>
          ${escapeHtml(firstCase ? `${firstCase.code} AI 분석 요청` : "분석 요청할 관리 건 없음")}
        </button>
        <button id="agent-open-cases" class="secondary-button" type="button" ${firstCase ? "" : "disabled"}>관리 건 화면으로 이동</button>
        <button id="back-to-case" class="ghost-button" type="button">선택 관리 건으로 돌아가기</button>
      </div>`,
    )}
  `;
}

function skillDetailMarkup() {
  const skill = currentSkill();
  const users = agentsBySkill(skill.slug);
  const linked = casesBySkill(skill.slug);
  const riskPill = skill.risk === "high" ? "status-escalated" : skill.risk === "medium" ? "status-pending" : "status-approved";
  return `
    ${collapsiblePanel(
      "skill-summary",
      "선택 업무 기능",
      skillLabel(skill.slug),
      `<div class="case-properties">
        ${detailGroup(
          "기능 정보",
          "업무 기능의 목적과 적용 범주입니다.",
          `<div class="property-list">
            ${propertyRow("유형", typeLabel(skill.type))}
            ${propertyRow("목적", localizeLine(skill.purpose))}
          </div>`,
          "puzzle",
        )}
        ${detailGroup(
          "통제 정책",
          "실행 전에 필요한 승인과 위험 수준입니다.",
          `<div class="property-list">
            ${propertyRow("주의 수준", statusLabel(skill.risk))}
            ${propertyRow("승인 정책", approvalLabel(skill.approval))}
            ${propertyRow("사용 여부", skill.enabled ? "사용 중" : "중지")}
          </div>`,
          "key",
        )}
      </div>`,
      statusLabel(skill.risk),
      "selected-case-panel",
    )}
    ${skillBodyPanel(skill)}
    ${compactPanel(
      "장착 AI 업무지원",
      "이 업무 기능을 사용하는 AI 업무지원",
      users.length
        ? `<div class="context-list">${users.map(agentLinkButton).join("")}</div>`
        : '<div class="empty-state">장착한 AI 업무지원 없음</div>',
      `${users.length}개`,
    )}
    ${compactPanel(
      "적용 관리 건",
      "이 업무 기능이 적용된 관리 건",
      linked.length
        ? `<div class="context-list">${linked.map(caseLinkButton).join("")}</div>`
        : '<div class="empty-state">적용된 관리 건 없음</div>',
      `${linked.length}개`,
    )}
    ${compactPanel("이동", "이동", '<div class="action-row action-stack"><button id="back-to-case" class="ghost-button" type="button">선택 관리 건으로 돌아가기</button></div>')}
  `;
}

function featureDetailMarkup() {
  const feature = currentFeature();
  const featureAgents = agentsByFeature(feature);
  const jeonseCase = cases.find((item) => item.pains.includes("jeonse-fraud"));
  return `
    ${collapsiblePanel(
      "feature-summary",
      "전세 보호 기능",
      feature.title,
      `<div class="case-properties">
        ${detailGroup("기능 설명", "사용자가 이 항목에서 확인할 업무입니다.", `<p>${escapeHtml(feature.description)}</p>`, "shield")}
        ${detailGroup("연결 업무 기능", "이 기능을 실행하는 세부 업무 기능입니다.", `<div class="tag-row">${feature.skills.map(skillTagButton).join("")}</div>`, "puzzle")}
      </div>`,
      "활성",
      "selected-case-panel",
    )}
    ${compactPanel(
      "연결 AI 업무지원",
      "이 기능을 수행하는 AI 업무지원",
      featureAgents.length
        ? `<div class="context-list">${featureAgents.map(agentLinkButton).join("")}</div>`
        : '<div class="empty-state">연결된 AI 업무지원 없음</div>',
      `${featureAgents.length}개`,
    )}
    ${compactPanel(
      "대상 관리 건",
      "적용 대상 관리 건",
      jeonseCase ? `<div class="context-list">${caseLinkButton(jeonseCase)}</div>` : '<div class="empty-state">전세 관리 건 없음</div>',
    )}
    ${compactPanel("이동", "이동", '<div class="action-row action-stack"><button id="back-to-case" class="ghost-button" type="button">선택 관리 건으로 돌아가기</button></div>')}
  `;
}

function caseContextMarkup() {
  const item = currentCase();
  const reviewDisabled = item.status !== "Approval Pending" ? "disabled" : "";
  const runDisabled = item.status === "Agent Running" ? "disabled" : "";
  const gateRows = item.gates
    .map(
      ([label, gateStatus]) => `
        <article class="gate-row">
          <div class="item-head">
            <strong>${escapeHtml(label)}</strong>
            <span class="status-pill ${gateStatus === "passed" ? "status-approved" : gateStatus === "blocked" ? "status-escalated" : "status-pending"}">${escapeHtml(statusLabel(gateStatus))}</span>
          </div>
        </article>
      `,
    )
    .join("");
  const caseSummaryBody = `
    <div id="case-properties" class="case-properties">
      ${detailGroup(
        "기본 식별",
        "어느 고객과 계열사 관리 건인지 확인합니다.",
        `<div class="property-list">
          ${propertyRow("관리 건 코드", item.code)}
          ${propertyRow("계열사", item.affiliate)}
          ${propertyRow("지역/업종", `${item.region} · ${item.industry}`)}
          ${propertyRow("데이터 출처", caseDataSource(item))}
        </div>`,
        "file-text",
      )}
      ${detailGroup(
        "위험 검토",
        "왜 우선 처리해야 하는지 확인합니다.",
        `<div class="property-list">
          ${propertyRow("주의 수준", `${item.riskScore}/100 · ${statusLabel(item.priority)}`)}
          ${propertyRow("노출 위험", item.exposure)}
        </div>
        <div class="tag-row">${item.rootCauses.map((cause) => `<span class="tag">${escapeHtml(cause)}</span>`).join("")}</div>`,
        "alert",
      )}
      ${detailGroup(
        "처리 책임",
        "누가 어떤 업무 기능로 처리하는지 확인합니다.",
        `<div class="property-list">
          ${propertyRow("자동화 수준", item.zeroHuman)}
          ${propertyRow("담당자", agentLabel(item.owner))}
          ${propertyRow("마감", item.due)}
        </div>
        <div class="tag-row">${skillsByCase(item).map(skillTagButton).join("")}</div>`,
        "users",
      )}
    </div>
  `;
  const approvalBody = `
    ${detailGroup("고객 전 통제", "고객 안내 전에 점검 완료해야 하는 조건입니다.", `<div id="approval-gates" class="approval-gates">${gateRows}</div>`, "check-square")}
    ${detailGroup(
      "처리 버튼",
      "AI 분석 요청, 고객 안내 승인, 수정 요청을 한곳에서 처리합니다.",
      `<div class="action-row">
        <button id="run-agents" class="primary-button" type="button" ${runDisabled}>
          <span aria-hidden="true">${iconSvg("activity")}</span>
          AI 분석 요청
        </button>
        <button id="approve-action" class="secondary-button" type="button" ${reviewDisabled}>
          <span aria-hidden="true">${iconSvg("check-square")}</span>
          고객 안내 승인
        </button>
        <button id="reject-action" class="danger-button" type="button" ${reviewDisabled}>
          <span aria-hidden="true">${iconSvg("alert")}</span>
          수정 요청
        </button>
      </div>`,
      "activity",
    )}
  `;

  return `
    <button class="open-detail-button" type="button" data-open-case-detail="${escapeHtml(item.id)}">
      <span aria-hidden="true">${iconSvg("layout-dashboard")}</span>
      관리 건 상세 페이지 열기
    </button>

    ${collapsiblePanel(
      "case-summary",
      "선택 관리 건",
      item.customerName,
      caseSummaryBody,
      `${statusLabel(item.status)} · 주의 수준 ${item.riskScore}`,
      "selected-case-panel",
    )}

    ${collapsiblePanel(
      "case-result",
      "분석 결과",
      "생성 산출물과 후속 확인 항목",
      analysisResultMarkup(item),
      item.status === "Agent Running" ? "처리 중" : item.analysisResult ? `${item.analysisResult.confidence}% 신뢰도` : "미생성",
    )}

    ${collapsiblePanel(
      "case-agents",
      "담당 AI 업무지원",
      "업무와 업무 기능",
      groupedAgentsMarkup(caseAgents(item)),
      `${caseAgents(item).length}개 배정`,
    )}

    ${collapsiblePanel(
      "case-approval",
      "승인 정책",
      "담당자 승인 절차",
      approvalBody,
      `${item.gates.length}개 통제`,
    )}

    ${collapsiblePanel("case-evidence", "근거", "근거 피드", '<div id="evidence-feed" class="evidence-feed"></div>', `${item.evidenceIds.length}개 출처`)}

    ${collapsiblePanel("case-audit", "감사 로그", "처리 기록", '<div id="audit-log" class="audit-log"></div>', `${item.audit.length}개 기록`)}
  `;
}

function analysisResultMarkup(item) {
  if (item.status === "Agent Running") {
    return `
      <div class="result-empty loading-result" aria-live="polite">
        <span class="loading-spinner" aria-hidden="true"></span>
        <strong>${escapeHtml(item.processingStep || "AI 업무지원 기능이 관리 건을 분석 중입니다.")}</strong>
        <p>근거 수집, 위험 분류, 담당자 승인 절차 검토가 끝나면 이 영역에 분석 결과와 생성 산출물이 표시됩니다.</p>
      </div>
    `;
  }
  if (!item.analysisResult) {
    return `
      <div class="result-empty">
        <span class="detail-group-icon" aria-hidden="true">${iconSvg("activity")}</span>
        <strong>아직 분석 결과가 없습니다.</strong>
        <p>AI 분석 요청 버튼이나 전세 사전 점검 폼을 사용하면 AI 업무지원 기능이 검토 결과, 생성 산출물, 후속 확인 항목을 이 영역에 기록합니다.</p>
      </div>
    `;
  }
  const result = item.analysisResult;
  const decision = result.decision || computeRiskDecision(item);
  return `
    <div class="analysis-result">
      <div class="result-summary">
        <span class="source-badge">${escapeHtml(result.source)} · ${escapeHtml(result.createdAt)}</span>
        <strong>${escapeHtml(result.summary)}</strong>
        <p><b>검토할 조치</b> · ${escapeHtml(result.recommendation)}</p>
        <p><b>검토 근거</b> · ${escapeHtml(result.reason)}</p>
        <p><b>수정 요청 시 대안</b> · ${escapeHtml(result.rejectionAlternative)}</p>
        <div class="source-chip-row">
          ${decision.signals.map((signal) => sourceChip(signal.sourceTag, signal.source)).join("")}
        </div>
      </div>
      <details class="score-breakdown" open>
        <summary>내부 검토용 점수 구성 · ${decision.score}점 · ${decision.level}</summary>
        <div class="score-signal-list">
          ${decision.signals
            .map(
              (signal) => `
                <article class="score-signal">
                  <div class="item-head">
                    <strong>${escapeHtml(signal.name)}</strong>
                    <span>${signal.contribution}점</span>
                  </div>
                  <p>${escapeHtml(signal.value)} · 가중치 ${Math.round(signal.weight * 100)}%</p>
                  <div class="progress-track"><i style="width:${Math.min(100, signal.contribution)}%"></i></div>
                  ${sourceChip(signal.sourceTag, signal.source)}
                </article>
              `,
            )
            .join("")}
        </div>
        <p class="insight-copy">라우팅: ${escapeHtml(decision.route)} · 조치 유형 ${escapeHtml(decision.actionType)} · ${escapeHtml(decision.matrixReason)}</p>
      </details>
      <div class="result-lists">
        ${detailGroup(
          "생성 산출물",
          "저장하면 관리 건 처리 기록에 남습니다.",
          `<div class="tag-row">${result.deliverables.map((entry) => `<span class="tag">${escapeHtml(entry)}</span>`).join("")}</div>`,
          "file-text",
        )}
        ${detailGroup(
          "체크리스트",
          "후속 확인 항목 전에 확인할 항목입니다.",
          `<ol class="check-list">${result.checklist.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ol>`,
          "check-square",
        )}
      </div>
      <div class="action-row result-actions">
        <button id="save-case-result" class="secondary-button" type="button" ${item.resultSaved ? "disabled" : ""}>
          <span aria-hidden="true">${iconSvg("database")}</span>
          ${item.resultSaved ? "저장 완료" : "검토 결과 저장"}
        </button>
        <button id="create-follow-up" class="primary-button" type="button" ${item.nextTaskCreated ? "disabled" : ""}>
          <span aria-hidden="true">${iconSvg("link")}</span>
          ${item.nextTaskCreated ? "작업 생성됨" : "후속 확인 항목 만들기"}
        </button>
      </div>
    </div>
  `;
}

function sourceChip(type, detail) {
  const label = sourceTagLabels[type] || type;
  return `<span class="source-chip source-${escapeHtml(type)}">[${escapeHtml(label)}] ${escapeHtml(detail)}</span>`;
}

function propertyRow(label, value) {
  return `<div class="property-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function compactPanel(eyebrow, title, body, meta = "") {
  return collapsiblePanel(slugKey(eyebrow, title), eyebrow, title, body, meta);
}

function agentContextMarkup() {
  const running = agents.filter((agent) => agent.status === "running").length;
  const pending = agents.filter((agent) => agent.status === "pending_approval").length;
  const queue = agents.reduce((sum, agent) => sum + agent.queue, 0);
  const topAgents = agents
    .filter((agent) => agent.status === "running" || agent.status === "pending_approval")
    .slice(0, 5)
    .map((agent) => workItem(agentLabel(agent), localizeLine(agent.role), `${statusLabel(agent.status)} · 대기열 ${agent.queue}`))
    .join("");

  return `
    ${compactPanel(
      "AI 업무지원 통제",
      "팀 운영 요약",
      `<div class="property-list">
        ${propertyRow("AI 업무지원", agents.length)}
        ${propertyRow("실행 중", running)}
        ${propertyRow("승인 대기", pending)}
        ${propertyRow("전체 대기열", queue)}
      </div>`,
    )}
    ${compactPanel("활성 AI 업무지원", "실행/승인 대기", `<div class="context-list">${topAgents}</div>`)}
  `;
}

function skillContextMarkup() {
  const categoryCounts = skillRack.reduce((acc, skill) => {
    acc[skill.type] = (acc[skill.type] || 0) + 1;
    return acc;
  }, {});
  const highRisk = skillRack.filter((skill) => skill.risk === "high").length;
  const categoryRows = Object.entries(categoryCounts)
    .map(([type, count]) => propertyRow(typeLabel(type), count))
    .join("");

  return `
    ${compactPanel(
      "업무 기능 저장소",
      "업무 기능 구성",
      `<div class="property-list">
        ${propertyRow("전체 업무 기능", skillRack.length)}
        ${propertyRow("고위험 업무 기능", highRisk)}
        ${propertyRow("필수 통제", skillRack.filter((skill) => skill.approval === "mandatory").length)}
      </div>`,
    )}
    ${compactPanel("유형", "유형별 분포", `<div class="property-list">${categoryRows}</div>`)}
  `;
}

function routineContextMarkup() {
  const enabled = routines.filter((routine) => routine[3] === "enabled").length;
  const rows = routines.map((routine) => workItem(localizeLine(routine[1]), `${routine[0]} · ${agentLabel(routine[2])}`, statusLabel(routine[3]))).join("");
  return `
    ${compactPanel("자동화", "정기 실행 상태", `<div class="property-list">${propertyRow("사용 중", enabled)}${propertyRow("일시정지", routines.length - enabled)}</div>`)}
    ${compactPanel("일정", "다음 루틴", `<div class="context-list">${rows}</div>`)}
  `;
}

function goalContextMarkup() {
  const average = Math.round(goals.reduce((sum, goal) => sum + goal[2], 0) / goals.length);
  const rows = goals.map((goal) => workItem(localizeLine(goal[0]), goal[1], `${goal[2]}%`)).join("");
  return `
    ${compactPanel("운영 목표", "목표 평균", `<div class="property-list">${propertyRow("목표 수", goals.length)}${propertyRow("평균", `${average}%`)}</div>`)}
    ${compactPanel("관리 지표", "관리 지표", `<div class="context-list">${rows}</div>`)}
  `;
}

function activityContextMarkup() {
  const latest = activity.slice(0, 5).map(([time, agent, action, code]) => workItem(`${time} · ${agentLabel(agent)}`, actionLabel(action), code)).join("");
  return compactPanel("활동 이력", "최근 처리 이력", `<div class="context-list">${latest}</div>`);
}

function budgetContextMarkup() {
  const spent = agents.reduce((sum, agent) => sum + agent.spent, 0);
  const budget = agents.reduce((sum, agent) => sum + agent.budget, 0);
  const heavyUsers = agents
    .slice()
    .sort((a, b) => b.spent / b.budget - a.spent / a.budget)
    .slice(0, 4)
    .map((agent) => workItem(agentLabel(agent), `사용 ₩${agent.spent.toLocaleString()} / 예산 ₩${agent.budget.toLocaleString()}`, `${Math.round((agent.spent / agent.budget) * 100)}%`))
    .join("");

  return `
    ${compactPanel("비용", "전체 예산", `<div class="property-list">${propertyRow("사용액", `₩${spent.toLocaleString()}`)}${propertyRow("예산", `₩${budget.toLocaleString()}`)}${propertyRow("사용률", `${Math.round((spent / budget) * 100)}%`)}</div>`)}
    ${compactPanel("사용률", "사용률 상위 AI 업무지원", `<div class="context-list">${heavyUsers}</div>`)}
  `;
}

function settingsContextMarkup() {
  return compactPanel(
    "설정",
    "운영 정책",
    `<div class="property-list">
      ${propertyRow("조직", "전북은행 · 광주은행 · JB우리캐피탈")}
      ${propertyRow("승인", "L0-L4 담당자 승인 절차")}
      ${propertyRow("외부 연동", "데모 어댑터")}
    </div>`,
  );
}

function rmDashboardContextMarkup() {
  return `
    ${compactPanel(
      "RM 역할",
      "상담부터 사후관리까지",
      `<div class="property-list">
        ${propertyRow("핵심 업무", "상담·서류·품의·심사 연결·사후관리")}
        ${propertyRow("AI 역할", "브리핑·누락 탐지·초안·근거 패킷")}
        ${propertyRow("사람 역할", "조건 제시·예외 검토·고객 영향 승인")}
      </div>`,
    )}
    ${compactPanel(
      "오늘 우선순위",
      "RM이 먼저 볼 항목",
      `<div class="context-list">
        ${workItem("고위험 상담 브리핑", "상환 압박·금리 민감도·정책금융 후보 확인", "3건")}
        ${workItem("서류 보완 요청", "사업자·세무·임대차 자료 누락 탐지", "6건")}
        ${workItem("승인 대기", "고객 안내 전 RM 승인 필요", "2건")}
      </div>`,
    )}
    ${compactPanel(
      "측정 항목",
      "파일럿에서 검증할 값",
      `<div class="property-list">
        ${propertyRow("관리 건/인", "내부 실측 필요")}
        ${propertyRow("절감 시간", "초안·대조·기록·재작업 분리")}
        ${propertyRow("승인 채택률", "초안 수정률과 수정 요청 사유 추적")}
      </div>`,
    )}
  `;
}

function corporateCreditDashboardContextMarkup() {
  return `
    ${compactPanel(
      "기업여신 역할",
      "심사 가능한 패킷 생성",
      `<div class="property-list">
        ${propertyRow("핵심 업무", "상담·자금용도·서류·재무·담보·전결")}
        ${propertyRow("AI 역할", "누락 탐지·상환 분석·라우팅 제안")}
        ${propertyRow("사람 역할", "한도·금리·조건·실행 승인")}
      </div>`,
    )}
    ${compactPanel(
      "오늘 우선순위",
      "기업여신 담당자가 먼저 볼 항목",
      `<div class="context-list">
        ${workItem("전결 초과 후보", "본부 심사/위원회 상정 여부 사전 분기", "3건")}
        ${workItem("서류 보완 요청", "재무제표·납세·등기·견적 증빙 누락", "5건")}
        ${workItem("자금용도 점검", "실행 후 증빙 대조와 유용 가능성 확인", "4건")}
      </div>`,
    )}
    ${compactPanel(
      "CREFIA 반영",
      "외부 참고 기준",
      `<div class="property-list">
        ${propertyRow("법규", "여신전문금융업법·감독규정")}
        ${propertyRow("자율규제", "기업여신 심사·사후관리, PF, 금리체계")}
        ${propertyRow("공시", "리스/할부·신용대출·경영공시")}
      </div>`,
    )}
  `;
}

function renderEvidence() {
  const item = currentCase();
  const evidenceFeed = document.getElementById("evidence-feed");
  if (!evidenceFeed) return;
  evidenceFeed.innerHTML = evidence
    .filter((entry) => item.evidenceIds.includes(entry.id))
    .map((entry) => {
      const selected = entry.id === selectedEvidenceId;
      const linkedCases = casesByEvidence(entry.id);
      const judgment = selected
        ? `
          <div class="evidence-judgment">
            <p class="eyebrow">이 근거가 연결된 검토</p>
            <p><strong>${escapeHtml(item.code)}</strong> · ${escapeHtml(item.approvalTitle)}</p>
            <p>후속 확인 항목: ${escapeHtml(item.nextAction)}</p>
            <p>사용 관리 건: ${linkedCases.map((linked) => escapeHtml(linked.code)).join(", ") || "없음"}</p>
          </div>
        `
        : "";
      return `
        <article class="evidence-card is-clickable ${selected ? "is-selected" : ""}" data-evidence-id="${escapeHtml(entry.id)}" role="button" tabindex="0">
          <span class="source-badge">${escapeHtml(sourceTypeLabel(entry.type))} · ${escapeHtml(entry.source)}</span>
          <a href="${escapeHtml(entry.url)}" target="_blank" rel="noreferrer">${escapeHtml(entry.title)}</a>
            <p>${escapeHtml(localizeLine(entry.implication))}</p>
          ${judgment}
        </article>
      `;
    })
    .join("");
}

function renderAudit() {
  const item = currentCase();
  const auditLog = document.getElementById("audit-log");
  if (!auditLog) return;
  if (!item) {
    auditLog.innerHTML = `<div class="empty-state"><p>선택된 관리 건가 없어 감사 로그를 표시할 수 없습니다.</p></div>`;
    return;
  }
  const records = auditChainRecords(item);
  auditLog.innerHTML = `
    <div class="audit-toolbar">
      <button id="verify-audit-chain" class="secondary-button" type="button">
        <span aria-hidden="true">${iconSvg("check-square")}</span>
        무결성 검증
      </button>
      <button id="export-audit-json" class="ghost-button" type="button">
        <span aria-hidden="true">${iconSvg("database")}</span>
        JSON 내보내기
      </button>
      <span id="audit-integrity-result" class="audit-integrity">${escapeHtml(auditIntegrityResult || "검증 대기")}</span>
    </div>
    ${records
      .slice()
      .reverse()
    .map(
      (record) => `
        <article class="audit-item">
          <span class="audit-time">#${record.seq} · ${escapeHtml(record.time)}</span>
          <p>${escapeHtml(record.actor)} · ${escapeHtml(localizeLine(record.action))}</p>
          <small>prev ${escapeHtml(record.previousHash)} → hash ${escapeHtml(record.hash)} · 근거 ${escapeHtml(record.evidenceId)}</small>
        </article>
      `,
    )
    .join("")}
  `;
}

function timestamp() {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function simpleHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function auditChainRecords(item) {
  if (!item) return [];
  let previousHash = "GENESIS";
  const evidenceIds = item.evidenceIds || [];
  return (item.audit || []).map((entry, index) => {
    const time = Array.isArray(entry) ? entry[0] : entry.time;
    const action = Array.isArray(entry) ? entry[1] : entry.action;
    const actor = Array.isArray(entry) ? inferAuditActor(action) : entry.actor;
    const evidenceId = Array.isArray(entry) ? evidenceIds[index % Math.max(1, evidenceIds.length)] || "internal-event" : entry.evidenceId;
    const payload = JSON.stringify({ seq: index + 1, time, actor, action, target: item.code, evidenceId, previousHash });
    const hash = simpleHash(payload);
    const record = { seq: index + 1, time, actor, action, target: item.code, evidenceId, previousHash, hash };
    previousHash = hash;
    return record;
  });
}

function inferAuditActor(text) {
  const value = String(text || "");
  if (/RM|담당자|reviewer|검토 담당자/.test(value)) return "사람";
  if (/사용자 입력|콘솔|보드|오케스트레이터|LocalGuard/.test(value)) return "오케스트레이터";
  return "AI 업무지원";
}

function verifyAuditChain(item) {
  const records = auditChainRecords(item);
  const ok = records.every((record, index) => index === 0 || record.previousHash === records[index - 1].hash);
  auditIntegrityResult = ok ? `정상 · ${records.length}개 레코드 무결성 검증 완료` : "오류 · 이전 해시 불일치";
  return { ok, records };
}

function exportAuditJson(item) {
  const payload = {
    schemaVersion: storageSchemaVersion,
    exportedAt: new Date().toISOString(),
    caseCode: item.code,
    caseTitle: item.customerName,
    integrity: verifyAuditChain(item),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${item.code}-audit-ledger.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function persistState() {
  try {
    lastSavedAt = timestamp();
    window.localStorage.setItem(
      appStorageKey,
      JSON.stringify({
        schemaVersion: storageSchemaVersion,
        cases,
        agentRuns,
        activity,
        scenarioResults,
        caseSequence,
        runSequence,
        lastSavedAt,
      }),
    );
  } catch (error) {
    console.warn("LocalGuard state could not be saved", error);
  }
}

function loadPersistedState() {
  try {
    const raw = window.localStorage.getItem(appStorageKey);
    if (!raw) return;
    const state = JSON.parse(raw);
    if (state.schemaVersion && state.schemaVersion > storageSchemaVersion) return;
    if (Array.isArray(state.cases) && state.cases.length) cases = state.cases;
    if (Array.isArray(state.agentRuns)) agentRuns = state.agentRuns;
    if (Array.isArray(state.activity)) activity = state.activity;
    if (Array.isArray(state.scenarioResults)) scenarioResults = state.scenarioResults;
    if (Number.isFinite(state.caseSequence)) caseSequence = state.caseSequence;
    if (Number.isFinite(state.runSequence)) runSequence = state.runSequence;
    if (state.lastSavedAt) lastSavedAt = state.lastSavedAt;
    if (!cases.some((item) => item.id === selectedCaseId) && cases[0]) selectedCaseId = cases[0].id;
  } catch (error) {
    console.warn("LocalGuard state could not be loaded", error);
  }
}

function notify(message) {
  toastMessage = message;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastMessage = "";
    renderToast();
  }, 2600);
  renderToast();
}

function formatWon(value) {
  return `₩${Math.round(value).toLocaleString("ko-KR")}`;
}

function safeNumber(value, fallback = 0) {
  const parsed = Number(String(value || "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function caseDataSource(item) {
  if (item.sourceLabel) return item.sourceLabel;
  return item.id && item.id.startsWith("manual-") ? "신규 접수 정보" : "데모 데이터";
}

function buildDashboardData() {
  const scoped = visibleCases();
  const highRisk = scoped.filter((item) => item.riskScore >= 85);
  const jeonseRisk = scoped.filter((item) => item.pains.includes("jeonse-fraud"));
  const blocked = scoped.filter((item) => item.status === "Escalated" || (item.gates || []).some((gate) => gate[1] === "blocked"));
  const pending = scoped.filter((item) => item.status === "Approval Pending");
  const userInput = scoped.filter((item) => caseDataSource(item) === "신규 접수 정보");
  const demoData = scoped.filter((item) => caseDataSource(item) === "데모 데이터");
  const savedResults = scoped.filter((item) => item.resultSaved);
  const followUps = scoped.filter((item) => item.nextTaskCreated);
  const evidenceLinked = scoped.filter((item) => item.evidenceIds && item.evidenceIds.length).length;
  const evidenceRate = scoped.length ? Math.round((evidenceLinked / scoped.length) * 100) : 0;
  const spent = agents.reduce((sum, agent) => sum + agent.spent, 0);
  const budget = agents.reduce((sum, agent) => sum + agent.budget, 0);
  const expected = Math.round(spent * 1.18);
  const avoidableLoss = scoped.reduce((sum, item) => {
    if (item.pains.includes("jeonse-fraud")) return sum + 2350000;
    if (item.status === "Escalated") return sum + 900000;
    if (item.riskScore >= 85) return sum + 620000;
    return sum + 180000;
  }, 0);
  const roi = spent ? Math.round(avoidableLoss / spent) : 0;
  const regions = Object.values(
    scoped.reduce((acc, item) => {
      const key = item.region.split(" ")[0];
      if (!acc[key]) acc[key] = { region: key, total: 0, high: 0, pending: 0, score: 0 };
      acc[key].total += 1;
      acc[key].high += item.riskScore >= 85 ? 1 : 0;
      acc[key].pending += item.status === "Approval Pending" ? 1 : 0;
      acc[key].score += item.riskScore;
      return acc;
    }, {}),
  ).map((entry) => ({ ...entry, average: Math.round(entry.score / entry.total) }));
  return {
    scoped,
    highRisk,
    jeonseRisk,
    blocked,
    pending,
    userInput,
    demoData,
    savedResults,
    followUps,
    evidenceRate,
    spent,
    budget,
    expected,
    avoidableLoss,
    roi,
    regions,
  };
}

function scoreSignal(name, value, weight, baseScore, sourceTag, source) {
  return {
    name,
    value,
    weight,
    contribution: Math.max(0, Math.round(baseScore * weight)),
    sourceTag,
    source,
  };
}

function actionTypeForCase(item) {
  if (item.pains.includes("fraud") || item.pains.includes("callback-risk")) return "fraud";
  if (item.pains.includes("jeonse-fraud")) return "contract";
  if (item.pains.includes("policy-match") || item.pains.includes("documentation")) return "customerNotice";
  return "internal";
}

function approvalLevelFor(score) {
  if (score >= 90) return approvalLevelMatrix[4];
  if (score >= 80) return approvalLevelMatrix[3];
  if (score >= 60) return approvalLevelMatrix[2];
  if (score >= 40) return approvalLevelMatrix[1];
  return approvalLevelMatrix[0];
}

function computeRiskDecision(item) {
  const baseScore = Math.max(0, Math.min(100, Number(item.riskScore) || 0));
  const actionType = actionTypeForCase(item);
  let signals;

  if (actionType === "contract") {
    const inputs = item.jeonseInputs || {};
    signals = [
      scoreSignal("전세가율", `${inputs.ratio || "추정"}%`, 0.34, baseScore, "estimate", "보증금/주변 매매가 산식"),
      scoreSignal("권리관계", item.rootCauses.find((cause) => /근저당|신탁|권리/.test(cause)) || "등기 원문 확인 필요", 0.24, baseScore, "public", "HUG·국토교통부 확인 항목"),
      scoreSignal("임차인 자산노출", `${inputs.exposureRatio || "추정"}%`, 0.18, baseScore, "estimate", "보증금/총자산 산식"),
      scoreSignal("보증보험 요건 확인 필요", item.gates.some((gate) => gate[1] === "pending") ? "가입 가능성 확인 전" : "확인 완료", 0.14, baseScore, "public", "HUG 안심전세 기준"),
      scoreSignal("은행 연계 필요", item.agents.includes("bank-linkage") ? "상담 연결 필요" : "내부 검토", 0.1, baseScore, "simulation", "데모 AI 업무지원 배정"),
    ];
  } else if (actionType === "fraud") {
    signals = [
      scoreSignal("외부 URL·콜백 위험", item.rootCauses.join(", "), 0.34, baseScore, "public", "금융위원회 보이스피싱 경보"),
      scoreSignal("고객 접촉 차단 필요", item.gates.some((gate) => gate[1] === "blocked") ? "자동 발송 금지" : "검토 필요", 0.28, baseScore, "simulation", "데모 차단 게이트"),
      scoreSignal("AI 악용 사기 신호", "음성변조·긴급 송금 요청", 0.22, baseScore, "public", "금융위원회 AI 사기 대응"),
      scoreSignal("준법 승인 필요", item.agents.includes("compliance") ? "준법 AI 업무지원 배정" : "미배정", 0.16, baseScore, "simulation", "AI 업무지원 배정 상태"),
    ];
  } else {
    signals = [
      scoreSignal("상환 부담", item.exposure, 0.32, baseScore, "simulation", "상담 메모 기반 데모 수치"),
      scoreSignal("정책금융 후보 검토 필요", item.pains.includes("policy-match") ? "후보 탐색 필요" : "낮음", 0.22, baseScore, "public", "JB 계열사 지역 금융 접점"),
      scoreSignal("서류·디지털 장벽", item.rootCauses.join(", "), 0.18, baseScore, "simulation", "데모 분류 결과"),
      scoreSignal("근거 연결성", `${item.evidenceIds.length}개 출처`, 0.16, baseScore, "public", "연결 근거 피드"),
      scoreSignal("고객 안내 영향", item.gates.some((gate) => gate[1] === "pending") ? "승인 필요" : "내부 처리", 0.12, baseScore, "estimate", "담당자 승인 절차 산식"),
    ];
  }

  const score = signals.reduce((sum, signal) => sum + signal.contribution, 0);
  const matrix = approvalLevelFor(score);
  const route = matrix[actionType] || matrix.customerNotice;
  return {
    score,
    level: matrix.level,
    route,
    matrixReason: matrix.reason,
    actionType,
    signals,
  };
}

function estimatedJeonseScore({ ratio, exposureRatio, housingBurden, rightsRisk }) {
  const raw =
    ratio * 0.5 +
    Math.min(100, exposureRatio) * 0.2 +
    Math.min(100, housingBurden * 2) * 0.12 +
    (rightsRisk ? 14 : 4) +
    8;
  return Math.min(99, Math.max(55, Math.round(raw)));
}

function createAnalysisResult(item, mode = "agent") {
  const isJeonse = item.pains.includes("jeonse-fraud");
  const blocked = item.status === "Escalated" || item.gates.some((gate) => gate[1] === "blocked");
  const decision = computeRiskDecision(item);
  const confidence = Math.min(96, Math.max(68, decision.score + (item.evidenceIds.length * 2) - (blocked ? 3 : 0)));
  const checklist = isJeonse
    ? [
        "등기부 원문에서 근저당, 압류, 신탁등기 여부를 확인",
        "보증보험 가입 가능성 확인 전 계약금 지급 보류",
        "특약 문구는 근저당 말소, 보증보험, 잔금 조건을 초안으로만 사용",
        "전세대출 상담 연결 전 고객 동의 기록",
      ]
    : blocked
      ? ["고객 대상 발송 차단", "보안팀 상위 검토", "콜백 URL과 통화 기록 보존", "RM 안내 전 준법 확인"]
      : ["매출·상환 부담 확인", "정책금융 후보 검토", "필요 서류 체크리스트 전달", "RM 콜백 초안 승인 요청"];
  return {
    mode,
    confidence,
    createdAt: timestamp(),
    source: caseDataSource(item),
    decision,
    summary: isJeonse
      ? `규칙 기반 점수 ${decision.score}점, ${decision.level} 라우팅으로 계약 전 담당자 검토가 필요합니다.`
      : blocked
        ? `규칙 기반 점수 ${decision.score}점, ${decision.level} 라우팅으로 승인 전 발송 보류이 필요합니다.`
        : `규칙 기반 점수 ${decision.score}점, ${decision.level} 라우팅으로 RM 확인 후 고객 안내가 가능합니다.`,
    recommendation: isJeonse
      ? "등기부·보증보험 원문 확인 후 계약 전 확인 체크리스트와 은행 상담 안내를 승인 큐에서 최종 확인하세요."
      : blocked
        ? "고객 접촉 없이 보안팀 보고 메모를 먼저 생성하고 차단 근거를 감사 로그에 남기세요."
        : "정책금융 후보와 필요 서류를 RM이 검토한 뒤 콜백 태스크로 연결하세요.",
    reason: `${decision.signals[0].name}와 ${decision.signals[1].name} 신호가 총점의 핵심 기여 항목입니다.`,
    rejectionAlternative: isJeonse
      ? "승인 수정 요청 시 고객 안내 대신 원문 등기부·보증보험 확인 요청 태스크만 남깁니다."
      : blocked
        ? "수정 요청 시에도 고객 발송은 유지 차단하고 보안팀 수동 검토로만 넘깁니다."
        : "수정 요청 시 고객 콜백 없이 서류 확인 요청과 내부 메모만 남깁니다.",
    deliverables: isJeonse
      ? ["위험 사전 점검 리포트", "계약 전 체크리스트", "특약 문구 초안", "은행 상담 연결 카드"]
      : blocked
        ? ["보안팀 보고 메모", "고객 발송 차단 기록", "준법 검토 메모"]
        : ["RM 콜백 초안", "정책금융 후보 요약", "서류 체크리스트", "상환 부담 요약"],
    checklist,
  };
}

function saveCaseResult(item) {
  if (!item || !item.analysisResult) return;
  item.resultSaved = true;
  item.resultSavedAt = timestamp();
  item.audit.push([timestamp(), "분석 결과와 생성 산출물을 관리 건 기록에 저장했습니다."]);
  activity.unshift([timestamp(), "업무지원 조율 기능", "saved result", item.code]);
  scenarioResults.unshift({
    time: timestamp(),
    caseCode: item.code,
    title: item.customerName,
    value: item.analysisResult.recommendation,
  });
  persistState();
  notify(`${item.code} 결과를 저장했습니다.`);
  render();
}

function createFollowUpTask(item) {
  if (!item || !item.analysisResult) return;
  item.nextTaskCreated = true;
  item.nextTaskAt = timestamp();
  const nextTask = item.pains.includes("jeonse-fraud")
    ? "은행 상담 연결 요청과 보증보험 확인 태스크를 생성했습니다."
    : item.status === "Escalated"
      ? "보안팀 상위 검토 태스크를 생성했습니다."
      : "RM 콜백 태스크와 서류 안내 태스크를 생성했습니다.";
  item.audit.push([timestamp(), nextTask]);
  activity.unshift([timestamp(), item.owner, "created follow-up task", item.code]);
  scenarioResults.unshift({
    time: timestamp(),
    caseCode: item.code,
    title: item.customerName,
    value: nextTask,
  });
  persistState();
  notify(nextTask);
  render();
}

function buildManualCase(form) {
  const formData = new FormData(form);
  const riskType = formData.get("riskType") || "smallbiz";
  const customerName = String(formData.get("customerName") || "").trim();
  const region = String(formData.get("region") || "").trim();
  const exposureInput = String(formData.get("exposure") || "").trim();
  if (!customerName || !region) {
    modalError = "고객/관리 건 이름과 지역을 입력해 주세요.";
    renderModal();
    return null;
  }

  caseSequence += 1;
  const code = `JBG-${caseSequence}`;
  const affiliate = String(formData.get("affiliate") || "전북은행");
  const base = {
    id: `manual-${caseSequence}`,
    code,
    customerName,
    affiliate,
    region,
    sourceLabel: "신규 접수 정보",
    status: "New",
    stage: "todo",
    due: "오늘 18:00",
    sla: "오늘",
    resultSaved: false,
    nextTaskCreated: false,
    transcript: [],
    audit: [[timestamp(), "사용자 입력 폼으로 관리 건을 등록했습니다."]],
  };

  if (riskType === "jeonse") {
    return {
      ...base,
      segment: "전세대출 고객",
      industry: "주거 · 전세계약",
      riskScore: 82,
      priority: "urgent",
      zeroHuman: "분석 + 사람 결정",
      owner: "Jeonse Shield Lead",
      exposure: exposureInput || "전세보증금 입력 필요 · 등기부 확인 필요",
      primaryPain: "전세 관련 위험 신호 사전 점검",
      nextAction: "전세 사전 점검 실행 후 보증보험·은행 상담 연결",
      approvalTitle: "전세 위험 사전 점검 리포트와 계약 전 확인 체크리스트",
      pains: ["jeonse-fraud", "price-ratio", "registry-risk", "guarantee-feasibility"],
      rootCauses: ["전세가율 확인 필요", "권리관계 원문 확인 필요", "보증보험 요건 확인 필요 확인"],
      evidenceIds: ["hug-safe-jeonse", "molit-jeonse-policy", "jb-network"],
      gates: [["등기부/보증보험 원문 확인", "pending"], ["고객 동의 후 은행 상담 연결", "pending"], ["특약 문구는 초안으로만 제공", "passed"]],
      agents: ["jeonse-lead", "deposit-ratio", "registry-rights", "tenant-asset", "contract-check", "bank-linkage", "compliance"],
    };
  }

  if (riskType === "fraud") {
    return {
      ...base,
      segment: "법인사업자",
      industry: "사기 의심",
      riskScore: 93,
      priority: "critical",
      zeroHuman: "정보 제공만",
      owner: "Fraud Shield Agent",
      exposure: exposureInput || "의심 콜백 URL · 긴급 송금 요청",
      primaryPain: "외부 접촉 차단 필요",
      nextAction: "고객 발송 차단과 보안팀 상위 검토",
      approvalTitle: "보안팀 상위 보고 메모",
      pains: ["fraud", "callback-risk", "do-not-contact"],
      rootCauses: ["외부 URL", "긴급 송금 요청", "통화 위변조 의심"],
      evidenceIds: ["fraud-ai", "jb-network"],
      gates: [["고객 대상 자동 발송 금지", "blocked"], ["보안팀 내부 상위 검토만 허용", "passed"]],
      agents: ["fraud", "compliance", "orchestrator"],
    };
  }

  return {
    ...base,
    segment: "개인사업자",
    industry: "상담 접수",
    riskScore: 70,
    priority: "high",
    zeroHuman: "초안 작성 + 검토 후 승인",
    owner: "Policy Match Agent",
    exposure: exposureInput || "정책금융 상담 후보 · 서류 확인 필요",
    primaryPain: "정책금융 탐색과 상환 부담",
    nextAction: "정책금융 후보와 서류 체크리스트 생성",
    approvalTitle: "정책금융 상담 전 필요 서류 안내",
    pains: ["policy-match", "documentation", "digital-barrier"],
    rootCauses: ["지원제도 탐색 비용", "서류 누락", "디지털 신청 장벽"],
    evidenceIds: ["jb-network", "smallbiz-burden", "digital-gap"],
    gates: [["지원 가능성 최종 확인 표현 금지", "pending"], ["필요 서류 안내만 허용", "passed"], ["RM 승인 후 안내", "pending"]],
    agents: ["pain-radar", "policy", "rm-copilot", "compliance"],
  };
}

function runJeonseDiagnosis(form) {
  const item = cases.find((entry) => entry.id === selectedCaseId && entry.pains.includes("jeonse-fraud")) || cases.find((entry) => entry.pains.includes("jeonse-fraud"));
  if (!item) return;
  const formData = new FormData(form);
  const deposit = safeNumber(formData.get("deposit"), 235000000);
  const market = Math.max(1, safeNumber(formData.get("market"), 260000000));
  const assets = Math.max(1, safeNumber(formData.get("assets"), 300000000));
  const income = Math.max(1, safeNumber(formData.get("income"), 3600000));
  const rights = String(formData.get("rights") || "확인 필요");
  const ratio = Math.round((deposit / market) * 100);
  const exposureRatio = Math.round((deposit / assets) * 100);
  const housingBurden = Math.round(((deposit * 0.045) / 12 / income) * 100);
  const rightsRisk = rights === "근저당 있음" || rights === "신탁등기 의심";
  const score = estimatedJeonseScore({ ratio, exposureRatio, housingBurden, rightsRisk });

  item.status = "Approval Pending";
  item.stage = "pending_approval";
  item.riskScore = score;
  item.priority = score >= 90 ? "critical" : score >= 80 ? "urgent" : "high";
  item.jeonseInputs = { deposit, market, assets, income, rights, ratio, exposureRatio, housingBurden };
  item.resultSaved = false;
  item.nextTaskCreated = false;
  item.exposure = `전세보증금 ${formatWon(deposit)} · 총자산 대비 ${exposureRatio}%`;
  item.primaryPain = `전세가율 ${ratio}% · ${rights}`;
  item.rootCauses = [
    `전세가율 ${ratio}%`,
    `보증금/자산 ${exposureRatio}%`,
    `주거비 부담 ${housingBurden}%`,
    rights,
  ];
  item.gates = [
    ["등기부/보증보험 원문 확인", rightsRisk ? "pending" : "passed"],
    ["고객 동의 후 은행 상담 연결", "pending"],
    ["특약 문구는 초안으로만 제공", "passed"],
  ];
  item.analysisResult = createAnalysisResult(item, "jeonse-diagnosis");
  item.audit.push([timestamp(), `전세 사전 점검 실행: 전세가율 ${ratio}%, 자산노출 ${exposureRatio}%, 주거비 부담 ${housingBurden}%.`]);
  activity.unshift([timestamp(), "Jeonse Shield Lead", "created approval", item.code]);
  selectedCaseId = item.id;
  activeDetailType = "case";
  persistState();
  notify("전세 위험 사전 점검 리포트를 생성했습니다.");
  render();
}

function openNewCaseModal() {
  modalState = "new-case";
  modalError = "";
  renderModal();
}

function closeModal() {
  modalState = null;
  modalError = "";
  renderModal();
}

function renderModal() {
  const root = document.getElementById("modal-root");
  if (!root) return;
  if (modalState !== "new-case") {
    root.innerHTML = "";
    return;
  }
  root.innerHTML = `
    <div class="modal-backdrop" role="presentation">
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="new-case-title">
        <div class="modal-head">
          <div>
            <p class="eyebrow">신규 접수 정보</p>
            <h2 id="new-case-title">위험 관리 건 접수</h2>
            <p>고객 상황을 입력하면 점검 유형에 맞는 AI 업무지원, 업무 기능, 담당자 승인 절차가 배정됩니다.</p>
          </div>
          <button id="modal-close" class="icon-only-button" type="button" aria-label="닫기">${iconSvg("x")}</button>
        </div>
        ${modalError ? `<p class="form-error">${escapeHtml(modalError)}</p>` : ""}
        <form id="new-case-form" class="case-form">
          <label>
            <span>점검 유형</span>
            <select name="riskType">
              <option value="jeonse">전세 관련 위험 신호</option>
              <option value="smallbiz">소상공인 금융 부담</option>
              <option value="fraud">의심 콜백 확인</option>
            </select>
          </label>
          <label>
            <span>고객/관리 건명</span>
            <input name="customerName" placeholder="예: 부산 신혼부부 전세 예정" />
          </label>
          <label>
            <span>계열사</span>
            <select name="affiliate">
              <option>전북은행</option>
              <option>광주은행</option>
              <option>JB우리캐피탈</option>
            </select>
          </label>
          <label>
            <span>지역</span>
            <input name="region" placeholder="예: 부산 해운대구" />
          </label>
          <label class="case-form-wide">
            <span>위험 내용 및 상담 메모</span>
            <textarea name="exposure" rows="3" placeholder="예: 전세보증금 2.1억, 등기부 근저당 확인 필요"></textarea>
          </label>
          <div class="modal-actions">
            <button id="modal-cancel" class="ghost-button" type="button">
              <span aria-hidden="true">${iconSvg("panel-close")}</span>
              취소
            </button>
            <button class="primary-button" type="submit">
              <span aria-hidden="true">${iconSvg("check-square")}</span>
              관리 건 접수
            </button>
          </div>
        </form>
      </section>
    </div>
  `;
  const form = document.getElementById("new-case-form");
  const closeButton = document.getElementById("modal-close");
  const cancelButton = document.getElementById("modal-cancel");
  if (closeButton) closeButton.addEventListener("click", closeModal);
  if (cancelButton) cancelButton.addEventListener("click", closeModal);
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fresh = buildManualCase(form);
      if (!fresh) return;
      cases.push(fresh);
      activity.unshift([timestamp(), "업무지원 조율 기능", "registered case", fresh.code]);
      selectedCaseId = fresh.id;
      activeView = fresh.pains.includes("jeonse-fraud") ? "jeonse" : "cases";
      activeDetailType = "case";
      modalState = null;
      modalError = "";
      persistState();
      notify(`${fresh.code} 관리 건을 등록했습니다.`);
      render();
    });
  }
}

function renderToast() {
  const root = document.getElementById("toast-root");
  if (!root) return;
  root.innerHTML = toastMessage
    ? `<div class="toast-message" role="status"><span aria-hidden="true">${iconSvg("check-square")}</span>${escapeHtml(toastMessage)}</div>`
    : "";
}

function startAgentRun(item, command) {
  runSequence += 1;
  const run = {
    id: `run-${String(runSequence).padStart(3, "0")}`,
    caseId: item.id,
    caseCode: item.code,
    agentName: item.owner,
    startedAt: timestamp(),
    status: "running",
    command,
    log: [[timestamp(), `${agentLabel(item.owner)}가 실행을 시작하고 관리 건 맥락과 장착 업무 기능을 불러왔습니다.`]],
  };
  agentRuns.unshift(run);

  item.status = "Agent Running";
  item.stage = "in_progress";
  item.processingStep = "AI 분석 요청 준비 중";
  item.audit.push([timestamp(), `AI 분석 요청 ${run.id} 시작: ${command}`]);
  activity.unshift([timestamp(), item.owner, "checked out", item.code]);
  persistState();

  window.setTimeout(() => {
    if (run.status !== "running") return;
    const target = cases.find((entry) => entry.id === run.caseId);
    if (target) target.processingStep = "근거 수집과 위험 신호 교차 확인 중";
    run.log.push([
      timestamp(),
      target && target.pains.includes("jeonse-fraud")
        ? "등기 권리 분석 AI 업무지원: 등기부 권리관계와 전세가율 신호를 교차 확인 중."
        : "근거 수집: 출처와 상담 메모를 관리 건 맥락에 연결 중.",
    ]);
    persistState();
    render();
  }, 700);

  window.setTimeout(() => {
    if (run.status !== "running") return;
    const target = cases.find((entry) => entry.id === run.caseId);
    if (!target) return;
    const escalate = target.id === "gunsan-manufacturing";
    run.status = escalate ? "escalated" : "approval_pending";
    run.log.push([
      timestamp(),
      escalate
        ? "사기 차단: 고객 대상 행동은 계속 차단하고 내부 상위 검토만 허용합니다."
        : "담당자 승인 절차: 조치 초안이 담당자 검토 단계에 들어갔습니다.",
    ]);
    if (target.status === "Agent Running") {
      target.status = escalate ? "Escalated" : "Approval Pending";
      target.stage = escalate ? "blocked" : "pending_approval";
      target.transcript.push(
        escalate
          ? "사기 차단: 고객 대상 행동은 계속 차단하고 내부 상위 검토만 허용합니다."
          : "담당자 승인 절차: 조치 초안이 담당자 검토 단계에 들어갔습니다.",
      );
      target.analysisResult = createAnalysisResult(target, "agent-run");
      delete target.processingStep;
      target.resultSaved = false;
      target.nextTaskCreated = false;
      target.audit.push([timestamp(), `AI 분석 요청 ${run.id} 완료 및 승인 정책을 검토했습니다.`]);
      activity.unshift([timestamp(), "Approval Gate", escalate ? "escalated case" : "created approval", target.code]);
    }
    persistState();
    render();
  }, 1600);

  return run;
}

function runAgents() {
  const item = currentCase();
  if (item.status === "Agent Running") return;
  startAgentRun(item, item.nextAction);
  render();
}

function closeRunsForCase(item, status, logText) {
  agentRuns
    .filter((run) => run.caseId === item.id && (run.status === "approval_pending" || run.status === "running"))
    .forEach((run) => {
      run.status = status;
      run.log.push([timestamp(), logText]);
    });
}

function approveCase(item) {
  if (!item || item.status !== "Approval Pending") return;
  item.status = "Approved";
  item.stage = "done";
  item.audit.push([timestamp(), "RM 담당자가 제안 조치를 승인했고 데모 후속 작업을 기록했습니다."]);
  activity.unshift([timestamp(), "Human RM", "approved action", item.code]);
  closeRunsForCase(item, "completed", "RM 담당자가 조치를 승인했고 실행을 종료했습니다.");
  persistState();
  render();
}

function rejectCase(item) {
  if (!item || item.status !== "Approval Pending") return;
  item.status = "Rejected";
  item.stage = "blocked";
  item.audit.push([timestamp(), "검토 담당자가 초안을 수정 요청하고 수정을 요청했습니다."]);
  activity.unshift([timestamp(), "Human reviewer", "rejected draft", item.code]);
  closeRunsForCase(item, "rejected", "검토 담당자가 초안을 수정 요청했고 실행을 종료했습니다.");
  persistState();
  render();
}

function approveAction() {
  approveCase(currentCase());
}

function rejectAction() {
  rejectCase(currentCase());
}

function dispatchCommand() {
  const item = currentCase();
  const commandInput = document.getElementById("command-input");
  const command = commandInput ? commandInput.value.trim() : "";
  if (!command) {
    notify("운영 지시를 입력해주세요.");
    return;
  }
  item.audit.push([timestamp(), `오케스트레이터 지시 수신: ${command}`]);
  activity.unshift([timestamp(), "업무지원 조율 기능", "dispatched command", item.code]);
  const run = startAgentRun(item, command);
  lastDispatchResult = {
    caseCode: item.code,
    caseTitle: item.customerName,
    runId: run.id,
    summary: "지시가 AI 분석 요청으로 변환되었고 담당 AI 업무지원에게 관리 건 맥락, 근거, 담당자 승인 절차가 전달되었습니다.",
    next: "완료된 초안은 승인 큐와 감사 로그에 자동 반영됩니다.",
  };
  activeView = "dashboard";
  activeDetailType = "case";
  persistState();
  render();
}

function resetDemoState() {
  window.localStorage.removeItem(appStorageKey);
  notify("데모 상태를 초기화합니다.");
  window.setTimeout(() => window.location.reload(), 300);
}

function applyDemoModeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("demo");
  if (!type || !demoProfiles[type]) return;
  const profile = demoProfiles[type];

  cases = JSON.parse(JSON.stringify(initialCases));
  agentRuns = [];
  activity = [["09:00", "업무지원 조율 기능", "dispatched command", profile.caseId]];
  scenarioResults = [];
  lastSavedAt = null;
  selectedCaseId = profile.caseId;
  activeView = profile.view;
  activeDetailType = "case";
  propertiesOpen = true;
  collapsedPanelKeys = new Set(["case-agents", "case-evidence"]);
  demoModeState = { type, ...profile };

  const item = currentCase();
  if (type === "jeonse") {
    const inputs = {
      deposit: 235000000,
      market: 260000000,
      assets: 300000000,
      income: 3600000,
      rights: "근저당 있음",
      ratio: 90,
      exposureRatio: 78,
      housingBurden: 24,
    };
    item.jeonseInputs = inputs;
    item.riskScore = estimatedJeonseScore({ ...inputs, rightsRisk: true });
    item.status = "Approval Pending";
    item.stage = "pending_approval";
    item.audit = [
      ["09:00", "데모 GP-1: 전세 안심 점검 관리 건을 시작 상태로 준비했습니다."],
      ["09:01", "전세가율·권리관계·자산노출 신호를 규칙 기반 검토 엔진에 입력했습니다."],
    ];
  } else if (type === "phishing") {
    item.status = "Approval Pending";
    item.stage = "pending_approval";
    item.riskScore = 96;
    item.audit = [
      ["09:00", "데모 GP-2: 보이스피싱 의심 알림을 관리 건으로 전환했습니다."],
      ["09:01", "차단 검토 요청을 생성하고 담당자 최종 확인 대기 상태로 올렸습니다."],
    ];
  } else if (type === "sme") {
    item.status = "Approval Pending";
    item.stage = "pending_approval";
    item.riskScore = 84;
    item.audit = [
      ["09:00", "데모 GP-3: 매출 둔화 신호를 소상공인 자금압박 관리 건으로 준비했습니다."],
      ["09:01", "정책금융 체크리스트와 준법 검토 결과를 승인 큐에 올렸습니다."],
    ];
  }
  item.resultSaved = false;
  item.nextTaskCreated = false;
  item.analysisResult = createAnalysisResult(item, `golden-path-${type}`);
  item.analysisResult.createdAt = "09:02";
}

function newCaseDemo() {
  caseSequence += 1;
  const code = `JBG-${caseSequence}`;
  const affiliate = railFilter === "all" ? "전북은행" : railFilter;
  const fresh = {
    id: `manual-${caseSequence}`,
    code,
    customerName: `신규 위험 상담 ${code}`,
    affiliate,
    segment: "개인사업자",
    region: "전북 전주",
    industry: "상담 접수",
    riskScore: 55,
    status: "New",
    priority: "medium",
    zeroHuman: "초안 작성 + 검토 후 승인",
    sla: "1d",
    owner: "업무지원 조율 기능",
    stage: "todo",
    due: "내일 18:00",
    exposure: "상담 접수 · 분류 대기",
    primaryPain: "분류 대기",
    nextAction: "위험 원인 분류와 담당 AI 업무지원 배정",
    approvalTitle: "초기 분류 결과 확인",
    pains: ["triage"],
    rootCauses: ["신규 접수"],
    evidenceIds: ["jb-network"],
    gates: [["RM 승인 후 고객 접촉", "pending"]],
    agents: ["orchestrator", "pain-radar"],
    transcript: [],
    audit: [[timestamp(), "콘솔의 신규 관리 건 버튼으로 관리 건을 등록했습니다."]],
  };
  cases.push(fresh);
  activity.unshift([timestamp(), "업무지원 조율 기능", "registered case", code]);
  selectedCaseId = fresh.id;
  activeView = "cases";
  activeDetailType = "case";
  persistState();
  render();
}

function selectCase(caseId) {
  selectedCaseId = caseId;
  selectedEvidenceId = null;
  activeDetailType = "case";
  render();
}

function selectAgent(agentId) {
  selectedAgentId = agentId;
  activeDetailType = "agent";
  render();
}

function selectSkill(slug) {
  selectedSkillId = slug;
  activeDetailType = "skill";
  render();
}

function selectFeature(featureId) {
  selectedFeatureId = featureId;
  activeDetailType = "feature";
  render();
}

function selectEvidence(entryId) {
  selectedEvidenceId = selectedEvidenceId === entryId ? null : entryId;
  render();
}

function moveCaseToColumn(caseId, column) {
  const item = cases.find((entry) => entry.id === caseId);
  if (!item) return;
  const nextStatus = columnToStatus(column);
  if (item.status === nextStatus) return;
  const previous = item.status;
  if (nextStatus === "Agent Running") {
    selectedCaseId = item.id;
    startAgentRun(item, `보드 상태 이동: ${statusLabel(previous)}에서 진행 중으로 변경. ${item.nextAction}`);
    lastDispatchResult = {
      caseCode: item.code,
      caseTitle: item.customerName,
      runId: agentRuns[0].id,
      summary: "보드 상태 이동으로 AI 분석 요청이 시작되었습니다.",
      next: "완료된 초안은 승인 큐로 이동합니다.",
    };
    render();
    return;
  }
  item.status = nextStatus;
  item.stage = column;
  item.audit.push([timestamp(), `보드 상태 변경: ${statusLabel(previous)}에서 ${statusLabel(nextStatus)}로 이동했습니다.`]);
  activity.unshift([timestamp(), "업무지원 조율 기능", "changed status", item.code]);
  selectedCaseId = item.id;
  activeDetailType = "case";
  // 보드 처리 훅: 승인 대기로 이동 시 산출물 생성 트리거 (04 board-hook)
  if (nextStatus === "Approval Pending" && typeof generateDeliverables === "function" && deliverableRegistry[item.id]) {
    generateDeliverables(item.id);
    item.audit.push([timestamp(), "보드 훅: 산출물 생성 및 담당자 승인 절차 활성화."]);
  }
  persistState();
  render();
}

function bindDragTargets() {
  document.querySelectorAll("[data-draggable-case]").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      draggedCaseId = card.dataset.draggableCase;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", draggedCaseId);
    });
  });
  document.querySelectorAll("[data-drop-status]").forEach((column) => {
    column.addEventListener("dragover", (event) => {
      event.preventDefault();
      column.classList.add("is-drag-over");
    });
    column.addEventListener("dragleave", () => {
      column.classList.remove("is-drag-over");
    });
    column.addEventListener("drop", (event) => {
      event.preventDefault();
      column.classList.remove("is-drag-over");
      const caseId = event.dataTransfer.getData("text/plain") || draggedCaseId;
      draggedCaseId = null;
      moveCaseToColumn(caseId, column.dataset.dropStatus);
    });
  });
}

function bindPress(element, handler) {
  element.addEventListener("click", handler);
  element.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (element.tagName === "BUTTON" || element.tagName === "A") return;
    event.preventDefault();
    handler();
  });
}

function bindSelectionTargets() {
  document.querySelectorAll("[data-case-id]").forEach((element) => {
    bindPress(element, () => selectCase(element.dataset.caseId));
  });
  document.querySelectorAll("[data-agent-id]").forEach((element) => {
    bindPress(element, () => selectAgent(element.dataset.agentId));
  });
  document.querySelectorAll("[data-skill-id]").forEach((element) => {
    bindPress(element, () => selectSkill(element.dataset.skillId));
  });
  document.querySelectorAll("[data-feature-id]").forEach((element) => {
    bindPress(element, () => selectFeature(element.dataset.featureId));
  });
  document.querySelectorAll("[data-evidence-id]").forEach((element) => {
    bindPress(element, () => selectEvidence(element.dataset.evidenceId));
  });
}

function bindActions() {
  document.getElementById("new-case-button").addEventListener("click", openNewCaseModal);
  const propertiesToggle = document.getElementById("properties-toggle");
  if (propertiesToggle) {
    propertiesToggle.addEventListener("click", () => {
      propertiesOpen = !propertiesOpen;
      renderShellState();
    });
  }
  document.getElementById("sidebar-search").addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    if (!query) return;
    const foundCase = cases.find((item) => `${item.customerName} ${item.code} ${item.affiliate}`.toLowerCase().includes(query));
    if (foundCase) {
      selectedCaseId = foundCase.id;
      activeDetailType = "case";
      render();
      return;
    }
    const foundAgent = agents.find((agent) => `${agent.name} ${agent.role}`.toLowerCase().includes(query));
    if (foundAgent) {
      selectedAgentId = foundAgent.id;
      activeDetailType = "agent";
      if (activeView !== "orgchart") activeView = "agents";
      render();
      return;
    }
    const foundSkill = skillRack.find((skill) => `${skill.slug} ${skill.type} ${skill.purpose}`.toLowerCase().includes(query));
    if (foundSkill) {
      selectedSkillId = foundSkill.slug;
      activeDetailType = "skill";
      activeView = "skills";
      render();
    }
  });

  const closeRailGroups = (exceptKey = "") => {
    document.querySelectorAll("[data-rail-group]").forEach((group) => {
      const key = group.dataset.railGroup;
      const isOpen = Boolean(exceptKey && key === exceptKey);
      group.classList.toggle("is-open", isOpen);
      const toggle = group.querySelector("[data-rail-toggle]");
      if (toggle) toggle.setAttribute("aria-expanded", String(isOpen));
    });
  };

  document.querySelectorAll("[data-rail-toggle]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const key = button.dataset.railToggle;
      const group = document.querySelector(`[data-rail-group="${key}"]`);
      const willOpen = !group?.classList.contains("is-open");
      closeRailGroups(willOpen ? key : "");
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-rail-group]")) closeRailGroups();
  });

  document.querySelectorAll("[data-affiliate]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const next = button.dataset.affiliate;
      railFilter = !next || next === "all" || railFilter === next ? "all" : next;
      document.querySelectorAll("[data-affiliate]").forEach((entry) => {
        const isAll = railFilter === "all" && entry.dataset.affiliate === "all";
        entry.classList.toggle("is-active", isAll || entry.dataset.affiliate === railFilter);
      });
      const scoped = visibleCases();
      if (!scoped.some((item) => item.id === selectedCaseId) && scoped.length) {
        selectedCaseId = scoped[0].id;
      }
      closeRailGroups();
      render();
    });
  });

  document.querySelectorAll("[data-role-filter]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      selectedRailRole = button.dataset.roleFilter || "";
      document.querySelectorAll("[data-role-filter]").forEach((entry) => {
        entry.classList.toggle("is-active", entry.dataset.roleFilter === selectedRailRole);
      });
      closeRailGroups();
      if (selectedRailRole === "RM") {
        activeView = "rm-dashboard";
        activeDetailType = defaultDetailForView(activeView);
        if (window.location.hash !== "#rm-dashboard") {
          window.location.hash = "rm-dashboard";
        }
        render();
        notify("RM 역할 대시보드로 이동했습니다.");
        return;
      }
      if (selectedRailRole === "기업여신 담당자") {
        activeView = "corporate-credit-dashboard";
        activeDetailType = defaultDetailForView(activeView);
        if (window.location.hash !== "#corporate-credit-dashboard") {
          window.location.hash = "corporate-credit-dashboard";
        }
        render();
        notify("기업여신 담당자 대시보드로 이동했습니다.");
        return;
      }
      if (selectedRailRole === "전세보호 담당자") {
        activeView = "jeonse-protection-dashboard";
        activeDetailType = defaultDetailForView(activeView);
        if (window.location.hash !== "#jeonse-protection-dashboard") {
          window.location.hash = "jeonse-protection-dashboard";
        }
        render();
        notify("전세보호 담당자 대시보드로 이동했습니다.");
        return;
      }
      if (selectedRailRole === "소비자 보호 담당자") {
        activeView = "consumer-protection-dashboard";
        activeDetailType = defaultDetailForView(activeView);
        if (window.location.hash !== "#consumer-protection-dashboard") {
          window.location.hash = "consumer-protection-dashboard";
        }
        render();
        notify("소비자 보호 담당자 대시보드로 이동했습니다.");
        return;
      }
      if (selectedRailRole === "보이스피싱/FDS 담당자") {
        activeView = "fds-dashboard";
        activeDetailType = defaultDetailForView(activeView);
        if (window.location.hash !== "#fds-dashboard") {
          window.location.hash = "fds-dashboard";
        }
        render();
        notify("보이스피싱/FDS 담당자 대시보드로 이동했습니다.");
        return;
      }
      if (selectedRailRole === "내부통제 준법감시 담당자") {
        activeView = "compliance-dashboard";
        activeDetailType = defaultDetailForView(activeView);
        if (window.location.hash !== "#compliance-dashboard") {
          window.location.hash = "compliance-dashboard";
        }
        render();
        notify("내부통제 준법감시 담당자 대시보드로 이동했습니다.");
        return;
      }
      notify(`${selectedRailRole} 유형을 선택했습니다.`);
    });
  });

  const railNotify = document.getElementById("rail-notify");
  if (railNotify) {
    railNotify.addEventListener("click", () => {
      activeView = "inbox";
      activeDetailType = defaultDetailForView(activeView);
      selectDefaultCaseForView(activeView);
      render();
    });
  }

  const railSettings = document.getElementById("rail-settings");
  if (railSettings) {
    railSettings.addEventListener("click", () => {
      activeView = "settings";
      activeDetailType = defaultDetailForView(activeView);
      selectDefaultCaseForView(activeView);
      render();
    });
  }
}

function bindContextActions() {
  document.querySelectorAll("[data-collapse-key]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.collapseKey;
      if (!key) return;
      if (collapsedPanelKeys.has(key)) {
        collapsedPanelKeys.delete(key);
      } else {
        collapsedPanelKeys.add(key);
      }
      renderProperties();
      renderEvidence();
      renderAudit();
      bindContextActions();
      bindSelectionTargets();
    });
  });

  const runButton = document.getElementById("run-agents");
  const approveButton = document.getElementById("approve-action");
  const rejectButton = document.getElementById("reject-action");
  if (runButton) runButton.addEventListener("click", runAgents);
  if (approveButton) approveButton.addEventListener("click", approveAction);
  if (rejectButton) rejectButton.addEventListener("click", rejectAction);
  const saveResultButton = document.getElementById("save-case-result");
  const followUpButton = document.getElementById("create-follow-up");
  if (saveResultButton) saveResultButton.addEventListener("click", () => saveCaseResult(currentCase()));
  if (followUpButton) followUpButton.addEventListener("click", () => createFollowUpTask(currentCase()));
  const verifyAuditButton = document.getElementById("verify-audit-chain");
  const exportAuditButton = document.getElementById("export-audit-json");
  if (verifyAuditButton) {
    verifyAuditButton.addEventListener("click", () => {
      const result = verifyAuditChain(currentCase());
      const target = document.getElementById("audit-integrity-result");
      if (target) target.textContent = result.ok ? `정상 · ${result.records.length}개 레코드 무결성 검증 완료` : "오류 · 이전 해시 불일치";
    });
  }
  if (exportAuditButton) exportAuditButton.addEventListener("click", () => exportAuditJson(currentCase()));

  const backButton = document.getElementById("back-to-case");
  if (backButton) {
    backButton.addEventListener("click", () => {
      activeDetailType = "case";
      render();
    });
  }

  const agentRunButton = document.getElementById("agent-run-case");
  if (agentRunButton) {
    agentRunButton.addEventListener("click", () => {
      const agent = currentAgent();
      if (!agent) return;
      const linked = casesByAgent(agent.id);
      const target = linked.find((item) => item.status !== "Agent Running");
      if (!target) return;
      selectedCaseId = target.id;
      startAgentRun(target, `${agentLabel(agent)} 단독 실행: ${target.nextAction}`);
      persistState();
      render();
    });
  }

  const agentCasesButton = document.getElementById("agent-open-cases");
  if (agentCasesButton) {
    agentCasesButton.addEventListener("click", () => {
      const agent = currentAgent();
      if (!agent) return;
      const linked = casesByAgent(agent.id);
      if (linked.length) selectedCaseId = linked[0].id;
      activeView = "cases";
      activeDetailType = "case";
      render();
    });
  }
}

function render() {
  renderShellState();
  renderNavigation();
  renderWorkbench();
  renderProperties();
  renderMetrics();
  renderBoard();
  renderLiveRuns();
  renderEvidence();
  renderAudit();
  bindContextActions();
  renderModal();
  renderToast();
  bindSelectionTargets();
  if (typeof renderDeliverableViewer === "function") renderDeliverableViewer();
  if (typeof bindModuleActions === "function") bindModuleActions();
}

function applyHashRoute() {
  const view = window.location.hash.replace("#", "");
  const known = navigation
    .flatMap((group) => group.items.map((item) => item.id))
    .concat(["rm-dashboard", "corporate-credit-dashboard", "jeonse-protection-dashboard", "consumer-protection-dashboard", "fds-dashboard", "compliance-dashboard"]);
  if (!known.includes(view)) return;
  activeView = view;
  activeDetailType = defaultDetailForView(view);
  selectDefaultCaseForView(view);
}

window.addEventListener("hashchange", () => {
  applyHashRoute();
  render();
});

restoreNavigationOrder();
bindActions();
applyHashRoute();
applyDemoModeFromUrl();
render();
