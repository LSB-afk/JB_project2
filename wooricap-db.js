/* JB우리캐피탈 전용 mock DB/repository.
   실제 고객 개인정보·신용정보·대출 실행·금융거래와 연결하지 않는 localStorage seed 저장소. */

const JBWC_AFFILIATE_ID = "jb-woori-capital";
const JBWC_DISPLAY_NAME = "JB우리캐피탈";
const JBWC_DB_KEY = "jbwc-ops-db-v3";
const JBWC_SEED_EXAMPLE_IDS = [
  "CASE-JBWC-0001",
  "CASE-JBWC-0002",
  "CASE-JBWC-0003",
  "DOC-JBWC-0001",
  "FDS-JBWC-0001",
  "VEH-JBWC-0001",
  "RUN-JBWC-0001",
];

function jbwcSeedData() {
  const A = JBWC_AFFILIATE_ID;
  const today = new Date();
  const iso = (date) => date.toISOString().slice(0, 10);
  const plus = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return iso(d); };

  const users = [
    ["USR-JBWC-OPS-01", "운영 김OO", "ops", "캐피탈 운영팀"],
    ["USR-JBWC-AUTO-01", "자동차금융 이OO", "ops", "자동차금융팀"],
    ["USR-JBWC-PER-01", "개인금융 박OO", "ops", "개인금융팀"],
    ["USR-JBWC-MTG-01", "담보금융 정OO", "review", "담보금융팀"],
    ["USR-JBWC-ENT-01", "기업금융 최OO", "review", "기업금융팀"],
    ["USR-JBWC-CUST-01", "고객관리 한OO", "ops", "고객관리팀"],
    ["USR-JBWC-DOC-01", "문서 심OO", "ops", "문서팀"],
    ["USR-JBWC-VEH-01", "차량관리 오OO", "ops", "차량관리팀"],
    ["USR-JBWC-PROT-01", "고객보호 윤OO", "compliance", "고객보호팀"],
    ["USR-JBWC-FDS-01", "FDS 문OO", "risk", "FDS팀"],
    ["USR-JBWC-CALL-01", "고객센터 장OO", "support", "고객센터팀"],
    ["USR-JBWC-COMP-01", "내부통제 배OO", "compliance", "내부통제팀"],
  ].map(([id, name, role, team]) => ({ id, name, role, team, status: "active", affiliateIds: [A] }));

  const ownerByDomain = {
    personalFinance: "USR-JBWC-PER-01",
    autoFinance: "USR-JBWC-AUTO-01",
    mortgageSecured: "USR-JBWC-MTG-01",
    enterpriseFinance: "USR-JBWC-ENT-01",
    customerManagement: "USR-JBWC-CUST-01",
    documentContract: "USR-JBWC-DOC-01",
    vehicleLifecycle: "USR-JBWC-VEH-01",
    consumerProtection: "USR-JBWC-PROT-01",
    fdsVoicePhishing: "USR-JBWC-FDS-01",
    complaintContactCenter: "USR-JBWC-CALL-01",
    complianceInternalControl: "USR-JBWC-COMP-01",
  };

  const caseSpecs = [
    ["personalFinance", "자동차담보대출", "자동차담보대출 운영 서류 확인", "received", "normal", "medium"],
    ["personalFinance", "개인신용대출", "개인신용대출 고객 안내 검토", "assigned", "normal", "medium"],
    ["personalFinance", "대환대출", "대환대출 누락서류 보완", "waitingDocuments", "high", "medium"],
    ["autoFinance", "중고차대출", "중고차대출 계약 운영 점검", "triaged", "normal", "low"],
    ["autoFinance", "자동차리스", "자동차리스 반환 일정 관리", "waitingVehicleTask", "normal", "low"],
    ["autoFinance", "장기렌터카", "장기렌터카 계약승계 운영 건", "inOperationalReview", "high", "medium"],
    ["mortgageSecured", "주택담보대출", "주택담보대출 등기 서류 대기", "waitingDocuments", "high", "medium"],
    ["mortgageSecured", "담보성 운영 케이스", "담보성 운영 외부자료 대기", "waitingExternalData", "normal", "medium"],
    ["enterpriseFinance", "일반대출", "기업 일반대출 자료 수집", "inOperationalReview", "normal", "medium"],
    ["enterpriseFinance", "PF대출", "PF대출 승인 전 운영 점검", "pendingApproval", "high", "high"],
    ["enterpriseFinance", "Mezzanine", "Mezzanine 딜 자료 보완", "assigned", "normal", "medium"],
    ["enterpriseFinance", "구조화금융", "구조화금융 내부통제 검토", "pendingApproval", "urgent", "high"],
    ["customerManagement", "대출관리", "대출관리 상태 확인", "assigned", "normal", "low"],
    ["customerManagement", "결제일 변경", "결제일 변경 요청 처리", "triaged", "low", "low"],
    ["customerManagement", "중도상환", "중도상환 문의 운영", "inOperationalReview", "normal", "low"],
    ["documentContract", "온라인 서류등록", "온라인 서류등록 상태 확인", "waitingDocuments", "normal", "medium"],
    ["documentContract", "전자약정", "전자약정 미완료 점검", "waitingDocuments", "high", "medium"],
    ["documentContract", "누락서류 확인", "누락서류 보완 안내 검토", "waitingDocuments", "high", "medium"],
    ["vehicleLifecycle", "정비이력", "리스 차량 정비이력 확인", "waitingVehicleTask", "normal", "low"],
    ["vehicleLifecycle", "리콜", "리콜 안내 대상 운영 점검", "waitingVehicleTask", "high", "medium"],
    ["vehicleLifecycle", "과태료/범칙금", "과태료 정산 운영 건", "inOperationalReview", "normal", "medium"],
    ["consumerProtection", "청약철회권", "청약철회권 문의 검토", "pendingCustomerProtectionReview", "high", "medium"],
    ["consumerProtection", "금리인하요구권", "금리인하요구권 접수 검토", "pendingCustomerProtectionReview", "high", "medium"],
    ["consumerProtection", "자료열람요구권", "자료열람요구권 처리 검토", "pendingCustomerProtectionReview", "normal", "medium"],
    ["fdsVoicePhishing", "보이스피싱 의심", "보이스피싱 의심 민원 대응", "pendingFdsEscalation", "urgent", "high"],
    ["fdsVoicePhishing", "비대면 금융사고", "비대면 금융사고 이상징후", "pendingFdsEscalation", "urgent", "critical"],
    ["fdsVoicePhishing", "이상거래 징후", "다중 한도조회 이상징후", "escalated", "high", "high"],
    ["complaintContactCenter", "1:1 문의", "1:1 문의 처리 지연", "assigned", "normal", "low"],
    ["complaintContactCenter", "민원처리", "민원 처리 상태 검토", "inOperationalReview", "urgent", "high"],
    ["complaintContactCenter", "상담전화 요청", "상담전화 콜백 요청", "received", "normal", "low"],
    ["complianceInternalControl", "개인정보보호", "개인정보 접근권한 점검", "inOperationalReview", "high", "medium"],
    ["complianceInternalControl", "채권추심절차", "채권추심절차 정책 점검", "pendingApproval", "high", "high"],
  ];

  const ops_cases = caseSpecs.map(([domain, productType, title, status, priority, riskLevel], index) => {
    const n = String(index + 1).padStart(4, "0");
    const domainCfg = JBWC_DOMAIN_TAXONOMY[domain] || {};
    return {
      id: `CASE-JBWC-${n}`,
      affiliateId: A,
      caseNo: `CASE-JBWC-${n}`,
      domain,
      productType,
      title,
      description: `${domainCfg.label || domain} 내부 운영 mock 케이스`,
      status,
      priority,
      riskLevel,
      assignedTeam: domainCfg.team || "캐피탈 운영팀",
      assignedToId: ownerByDomain[domain],
      customerRefId: `CUST-JBWC-${String(2000 + index)}`,
      contractRefId: `CONTRACT-JBWC-${String(3000 + index)}`,
      vehicleRefId: ["autoFinance", "vehicleLifecycle"].includes(domain) ? `VEH-JBWC-${String(7000 + index)}` : "",
      sourceChannel: index % 3 === 0 ? "contactCenter" : index % 3 === 1 ? "opsPortal" : "batchMonitor",
      tags: [domain, productType],
      requiresHumanReview: ["consumerProtection", "fdsVoicePhishing", "complianceInternalControl"].includes(domain) || ["high", "critical"].includes(riskLevel),
      attachmentsExist: ["documentContract", "mortgageSecured", "enterpriseFinance"].includes(domain),
      dueAt: plus((index % 5) - 1),
      createdAt: plus(index < 4 ? 0 : -Math.min(index, 12)),
      updatedAt: plus(index % 4 === 0 ? 0 : -1),
    };
  });

  const activeCases = ops_cases.filter((c) => JBWC_ACTIVE_CASE_STATUSES.includes(c.status));
  const caseByDomain = (domain) => ops_cases.find((c) => c.domain === domain)?.id;
  const caseByProduct = (product) => ops_cases.find((c) => c.productType === product)?.id;

  return {
    version: 3,
    seededAt: new Date().toISOString(),
    affiliates: [
      { id: A, name: "jbwooricapital", displayName: JBWC_DISPLAY_NAME, type: "capital", status: "active" },
      { id: "jeonbuk-bank", name: "jeonbukbank", displayName: "전북은행", type: "bank", status: "active" },
    ],
    users,
    ops_cases: ops_cases.concat([
      { id: "CASE-OTHER-0001", affiliateId: "jeonbuk-bank", caseNo: "CASE-OTHER-0001", domain: "personalFinance", productType: "타 계열사 검증", title: "JB우리캐피탈 count 제외 검증용", status: "received", priority: "urgent", riskLevel: "critical", assignedTeam: "타 계열사", assignedToId: "USR-JBWC-OPS-01", customerRefId: "CUST-OTHER-0001", contractRefId: "CONTRACT-OTHER-0001", vehicleRefId: "", sourceChannel: "test", tags: ["exclude"], requiresHumanReview: true, attachmentsExist: false, dueAt: plus(0), createdAt: plus(0), updatedAt: plus(0) },
    ]),
    ops_tasks: activeCases.slice(0, 18).map((c, index) => ({
      id: `TASK-JBWC-${String(index + 1).padStart(4, "0")}`,
      affiliateId: A,
      caseId: c.id,
      title: `${c.productType} 운영 확인`,
      status: index % 4 === 0 ? "inProgress" : index % 5 === 0 ? "overdue" : "open",
      dueAt: c.dueAt,
      ownerId: c.assignedToId,
    })),
    approvals: [
      { id: "APR-JBWC-0001", affiliateId: A, caseId: caseByProduct("PF대출"), approvalType: "기업금융 운영 검토", status: "pending", requestedById: "USR-JBWC-ENT-01", approverId: "USR-JBWC-COMP-01", requestedAt: plus(0) },
      { id: "APR-JBWC-0002", affiliateId: A, caseId: caseByProduct("보이스피싱 의심"), approvalType: "FDS 사람 에스컬레이션", status: "pending", requestedById: "USR-JBWC-FDS-01", approverId: "USR-JBWC-COMP-01", requestedAt: plus(0) },
      { id: "APR-JBWC-0003", affiliateId: A, caseId: caseByProduct("채권추심절차"), approvalType: "내부통제 정책 검토", status: "pending", requestedById: "USR-JBWC-COMP-01", approverId: "USR-JBWC-PROT-01", requestedAt: plus(-1) },
    ],
    audit_logs: [
      { id: "AUD-JBWC-0001", affiliateId: A, actorId: "USR-JBWC-FDS-01", action: "FDS_ESCALATED", targetType: "case", targetId: caseByProduct("보이스피싱 의심"), riskLevel: "high", reviewRequired: true, createdAt: plus(0) },
      { id: "AUD-JBWC-0002", affiliateId: A, actorId: "USR-JBWC-PROT-01", action: "CONSUMER_REVIEW_OPENED", targetType: "case", targetId: caseByProduct("금리인하요구권"), riskLevel: "medium", reviewRequired: true, createdAt: plus(0) },
      { id: "AUD-JBWC-0003", affiliateId: A, actorId: "USR-JBWC-DOC-01", action: "DOCUMENT_PENDING", targetType: "document", targetId: "DOC-JBWC-0001", riskLevel: "medium", reviewRequired: true, createdAt: plus(-1) },
      { id: "AUD-JBWC-0004", affiliateId: A, actorId: "USR-JBWC-VEH-01", action: "VEHICLE_TASK_CREATED", targetType: "vehicle", targetId: "VEH-JBWC-0001", riskLevel: "low", reviewRequired: false, createdAt: plus(-1) },
      { id: "AUD-JBWC-0005", affiliateId: A, actorId: "USR-JBWC-COMP-01", action: "POLICY_CHECK_REVIEW_REQUIRED", targetType: "privacy", targetId: "PRV-JBWC-0001", riskLevel: "medium", reviewRequired: true, createdAt: plus(-2) },
    ],
    privacy_permission_checks: [
      { id: "PRV-JBWC-0001", affiliateId: A, policyArea: "개인정보 접근권한 최소화", status: "open", riskLevel: "medium", ownerId: "USR-JBWC-COMP-01", dueAt: plus(2) },
      { id: "PRV-JBWC-0002", affiliateId: A, policyArea: "개인신용정보 마스킹 점검", status: "needsReview", riskLevel: "high", ownerId: "USR-JBWC-COMP-01", dueAt: plus(1) },
      { id: "PRV-JBWC-0003", affiliateId: A, policyArea: "위탁제휴업체 접근권한", status: "open", riskLevel: "medium", ownerId: "USR-JBWC-COMP-01", dueAt: plus(7) },
    ],
    external_connectors: [
      { id: "CON-JBWC-0001", affiliateId: A, name: "차량정보 조회(모의)", category: "vehicle", status: "active", lastSyncAt: plus(0), health: "healthy" },
      { id: "CON-JBWC-0002", affiliateId: A, name: "전자약정 게이트웨이(모의)", category: "document", status: "pending", lastSyncAt: plus(-1), health: "degraded" },
      { id: "CON-JBWC-0003", affiliateId: A, name: "고객센터 문의 큐(모의)", category: "contactCenter", status: "active", lastSyncAt: plus(0), health: "healthy" },
      { id: "CON-JBWC-0004", affiliateId: A, name: "FDS 경보 피드(모의)", category: "risk", status: "active", lastSyncAt: plus(0), health: "degraded" },
      { id: "CON-JBWC-0005", affiliateId: A, name: "소비자보호 정책 피드(모의)", category: "consumerProtection", status: "error", lastSyncAt: plus(-2), health: "down" },
    ],
    ai_analysis_requests: [
      { id: "AIR-JBWC-0001", affiliateId: A, caseId: caseByProduct("대환대출"), requestType: "문서 누락 분석", status: "running", requestedById: "USR-JBWC-PER-01", createdAt: plus(0) },
      { id: "AIR-JBWC-0002", affiliateId: A, caseId: caseByProduct("PF대출"), requestType: "기업금융 자료 완결성", status: "queued", requestedById: "USR-JBWC-ENT-01", createdAt: plus(0) },
      { id: "AIR-JBWC-0003", affiliateId: A, caseId: caseByProduct("보이스피싱 의심"), requestType: "FDS 경보 분류", status: "running", requestedById: "USR-JBWC-FDS-01", createdAt: plus(0) },
    ],
    ai_recommendations: [
      { id: "REC-JBWC-0001", affiliateId: A, caseId: caseByProduct("대환대출"), agentId: "jbwc-doc", title: "누락서류 보완 요청 초안", status: "active", confidence: "medium", createdAt: plus(0) },
      { id: "REC-JBWC-0002", affiliateId: A, caseId: caseByProduct("자동차리스"), agentId: "jbwc-auto", title: "리스 반환 일정 체크리스트", status: "proposed", confidence: "high", createdAt: plus(0) },
      { id: "REC-JBWC-0003", affiliateId: A, caseId: caseByProduct("금리인하요구권"), agentId: "jbwc-protect", title: "소비자 권리 검토 플로우", status: "active", confidence: "high", createdAt: plus(-1) },
      { id: "REC-JBWC-0004", affiliateId: A, caseId: caseByProduct("비대면 금융사고"), agentId: "jbwc-fds", title: "사람 에스컬레이션 메모", status: "active", confidence: "high", createdAt: plus(0) },
      { id: "REC-JBWC-0005", affiliateId: A, caseId: caseByProduct("채권추심절차"), agentId: "jbwc-compliance", title: "추심절차 내부통제 체크", status: "proposed", confidence: "medium", createdAt: plus(-1) },
    ],
    business_capabilities: Object.entries(JBWC_DOMAIN_TAXONOMY).map(([domain, cfg], index) => ({
      id: `CAP-JBWC-${String(index + 1).padStart(4, "0")}`,
      affiliateId: A,
      name: `${cfg.label} 운영 체크`,
      domain,
      status: index % 3 === 0 ? "proposed" : "enabled",
      proposedByAgentId: jbWooriCapitalRoutingRules[domain] || "jbwc-orchestrator",
    })),
    role_assignments: users.map((user, index) => ({
      id: `ROL-JBWC-${String(index + 1).padStart(4, "0")}`,
      affiliateId: A,
      userId: user.id,
      role: user.role,
      permissionScope: user.team,
      status: index % 5 === 0 ? "needsReview" : "active",
      reviewRequired: index % 5 === 0,
    })),
    inspection_schedules: [
      { id: "INS-JBWC-0001", affiliateId: A, inspectionType: "개인정보 접근권한 정기점검", status: "upcoming", dueAt: plus(5), ownerId: "USR-JBWC-COMP-01" },
      { id: "INS-JBWC-0002", affiliateId: A, inspectionType: "전자약정 로그 점검", status: "overdue", dueAt: plus(-2), ownerId: "USR-JBWC-DOC-01" },
      { id: "INS-JBWC-0003", affiliateId: A, inspectionType: "FDS 대응 시뮬레이션", status: "upcoming", dueAt: plus(3), ownerId: "USR-JBWC-FDS-01" },
    ],
    customer_support_cases: [
      { id: "CSC-JBWC-0001", affiliateId: A, caseNo: "CSC-JBWC-0001", category: "민원처리", status: "open", priority: "urgent", riskLevel: "high", assignedToId: "USR-JBWC-CALL-01" },
      { id: "CSC-JBWC-0002", affiliateId: A, caseNo: "CSC-JBWC-0002", category: "1:1 문의", status: "open", priority: "normal", riskLevel: "low", assignedToId: "USR-JBWC-CALL-01" },
      { id: "CSC-JBWC-0003", affiliateId: A, caseNo: "CSC-JBWC-0003", category: "상담전화 요청", status: "inProgress", priority: "normal", riskLevel: "low", assignedToId: "USR-JBWC-CALL-01" },
      { id: "CSC-JBWC-0004", affiliateId: A, caseNo: "CSC-JBWC-0004", category: "고객제안", status: "needsReview", priority: "low", riskLevel: "low", assignedToId: "USR-JBWC-CALL-01" },
    ],
    consumer_protection_reviews: [
      { id: "CPR-JBWC-0001", affiliateId: A, caseId: caseByProduct("청약철회권"), reviewType: "청약철회권", status: "open", riskLevel: "medium", requiresHumanReview: true },
      { id: "CPR-JBWC-0002", affiliateId: A, caseId: caseByProduct("금리인하요구권"), reviewType: "금리인하요구권", status: "needsReview", riskLevel: "medium", requiresHumanReview: true },
      { id: "CPR-JBWC-0003", affiliateId: A, caseId: caseByProduct("자료열람요구권"), reviewType: "자료열람요구권", status: "open", riskLevel: "medium", requiresHumanReview: true },
    ],
    fds_alerts: [
      { id: "FDS-JBWC-0001", affiliateId: A, caseId: caseByProduct("보이스피싱 의심"), alertType: "보이스피싱 의심", severity: "high", status: "open", requiresHumanEscalation: true },
      { id: "FDS-JBWC-0002", affiliateId: A, caseId: caseByProduct("비대면 금융사고"), alertType: "비대면 금융사고", severity: "critical", status: "open", requiresHumanEscalation: true },
      { id: "FDS-JBWC-0003", affiliateId: A, caseId: caseByProduct("이상거래 징후"), alertType: "이상거래 징후", severity: "high", status: "investigating", requiresHumanEscalation: true },
    ],
    document_cases: [
      { id: "DOC-JBWC-0001", affiliateId: A, caseId: caseByProduct("대환대출"), documentType: "소득증빙", status: "pending", receivedAt: null, reviewedAt: null },
      { id: "DOC-JBWC-0002", affiliateId: A, caseId: caseByProduct("전자약정"), documentType: "전자약정", status: "needsReview", receivedAt: plus(-1), reviewedAt: null },
      { id: "DOC-JBWC-0003", affiliateId: A, caseId: caseByProduct("주택담보대출"), documentType: "담보 서류", status: "pending", receivedAt: null, reviewedAt: null },
      { id: "DOC-JBWC-0004", affiliateId: A, caseId: caseByProduct("PF대출"), documentType: "기업금융 자료", status: "needsReview", receivedAt: plus(-2), reviewedAt: null },
    ],
    vehicle_lifecycle_tasks: [
      { id: "VEH-JBWC-0001", affiliateId: A, caseId: caseByProduct("자동차리스"), vehicleRefId: "VEH-JBWC-7004", taskType: "차량 반환", status: "open", dueAt: plus(1) },
      { id: "VEH-JBWC-0002", affiliateId: A, caseId: caseByProduct("정비이력"), vehicleRefId: "VEH-JBWC-7018", taskType: "정비이력", status: "inProgress", dueAt: plus(2) },
      { id: "VEH-JBWC-0003", affiliateId: A, caseId: caseByProduct("리콜"), vehicleRefId: "VEH-JBWC-7019", taskType: "리콜", status: "open", dueAt: plus(0) },
      { id: "VEH-JBWC-0004", affiliateId: A, caseId: caseByProduct("과태료/범칙금"), vehicleRefId: "VEH-JBWC-7020", taskType: "과태료/범칙금", status: "overdue", dueAt: plus(-1) },
    ],
    harness_agents: [],
    agent_runs: [
      { id: "RUN-JBWC-0001", affiliateId: A, agentId: "jbwc-doc", caseId: caseByProduct("대환대출"), inputSummary: "대환대출 누락서류 점검", outputSummary: "소득증빙 대기", status: "needsReview", riskLevel: "medium", requiresHumanEscalation: false, createdAt: plus(0) },
      { id: "RUN-JBWC-0002", affiliateId: A, agentId: "jbwc-auto", caseId: caseByProduct("자동차리스"), inputSummary: "리스 반환 일정", outputSummary: "차량관리 핸드오프", status: "completed", riskLevel: "low", requiresHumanEscalation: false, createdAt: plus(0) },
      { id: "RUN-JBWC-0003", affiliateId: A, agentId: "jbwc-fds", caseId: caseByProduct("보이스피싱 의심"), inputSummary: "보이스피싱 의심 경보", outputSummary: "사람 에스컬레이션", status: "needsReview", riskLevel: "high", requiresHumanEscalation: true, createdAt: plus(0) },
      { id: "RUN-JBWC-0004", affiliateId: A, agentId: "jbwc-protect", caseId: caseByProduct("금리인하요구권"), inputSummary: "소비자 권리 분류", outputSummary: "담당자 검토 필요", status: "needsReview", riskLevel: "medium", requiresHumanEscalation: false, createdAt: plus(-1) },
      { id: "RUN-JBWC-0005", affiliateId: A, agentId: "jbwc-enterprise", caseId: caseByProduct("PF대출"), inputSummary: "PF 자료 완결성", outputSummary: "승인 대기", status: "running", riskLevel: "high", requiresHumanEscalation: false, createdAt: plus(0) },
      { id: "RUN-JBWC-0006", affiliateId: A, agentId: "jbwc-vehicle", caseId: caseByProduct("리콜"), inputSummary: "리콜 대상 태스크", outputSummary: "차량 태스크 미처리", status: "completed", riskLevel: "medium", requiresHumanEscalation: false, createdAt: plus(-1) },
      { id: "RUN-JBWC-0007", affiliateId: A, agentId: "jbwc-complaint", caseId: caseByProduct("민원처리"), inputSummary: "민원 처리 상태", outputSummary: "소비자보호 핸드오프", status: "needsReview", riskLevel: "high", requiresHumanEscalation: false, createdAt: plus(-1) },
      { id: "RUN-JBWC-0008", affiliateId: A, agentId: "jbwc-compliance", caseId: caseByProduct("채권추심절차"), inputSummary: "추심절차 점검", outputSummary: "승인 대기", status: "needsReview", riskLevel: "high", requiresHumanEscalation: false, createdAt: plus(-2) },
    ],
    agent_handoffs: [
      { id: "HND-JBWC-0001", affiliateId: A, fromAgentId: "jbwc-orchestrator", toAgentId: "jbwc-fds", caseId: caseByProduct("보이스피싱 의심"), reason: "보이스피싱 고위험 — 사람 검토 필수", status: "escalated", createdAt: plus(0) },
      { id: "HND-JBWC-0002", affiliateId: A, fromAgentId: "jbwc-auto", toAgentId: "jbwc-vehicle", caseId: caseByProduct("자동차리스"), reason: "차량 반환 태스크 연계", status: "open", createdAt: plus(0) },
      { id: "HND-JBWC-0003", affiliateId: A, fromAgentId: "jbwc-complaint", toAgentId: "jbwc-protect", caseId: caseByProduct("민원처리"), reason: "민원/권리구제 검토", status: "open", createdAt: plus(-1) },
    ],
    kpi_snapshots: [
      ["dailyNewCases", 7], ["pendingOps", activeCases.length], ["pendingApprovals", 3], ["pendingDocuments", 4], ["highRiskFds", 3],
      ["consumerProtectionReviews", 3], ["nearSla", 9], ["automationRate", 62], ["humanReviewRatio", 44], ["handoffOpen", 3],
    ].map(([metricKey, metricValue], index) => ({ id: `KPI-JBWC-${String(index + 1).padStart(4, "0")}`, affiliateId: A, snapshotDate: plus(0), metricKey, metricValue })),
  };
}

let jbwcDbCache = null;

function jbwcLoadDb() {
  if (jbwcDbCache) return jbwcDbCache;
  try {
    const raw = window.localStorage.getItem(JBWC_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 3) {
        jbwcDbCache = parsed;
        jbwcSyncHarnessAgents(jbwcDbCache);
        jbwcSaveDb();
        return jbwcDbCache;
      }
    }
  } catch (error) { /* 손상 시 재시드 */ }
  jbwcDbCache = jbwcSeedData();
  jbwcSyncHarnessAgents(jbwcDbCache);
  jbwcSaveDb();
  return jbwcDbCache;
}

function jbwcSaveDb() {
  try { window.localStorage.setItem(JBWC_DB_KEY, JSON.stringify(jbwcDbCache)); } catch (error) { /* 메모리 유지 */ }
}

function jbwcResetDb() {
  jbwcDbCache = jbwcSeedData();
  jbwcSyncHarnessAgents(jbwcDbCache);
  jbwcSaveDb();
}

function jbwcSyncHarnessAgents(db) {
  if (typeof jbWooriCapitalOpsHarness === "undefined") return;
  db.harness_agents = jbWooriCapitalOpsHarness.agents.map((agent) => ({
    id: agent.id,
    affiliateId: JBWC_AFFILIATE_ID,
    name: agent.displayName || agent.name,
    domain: agent.domain,
    status: agent.status,
    description: agent.description,
  }));
}

function jbwcTable(table, affiliateId) {
  if (!affiliateId) throw new Error("affiliateId scope is required");
  const db = jbwcLoadDb();
  const rows = db[table] || [];
  if (table === "affiliates") return rows.slice();
  if (table === "users") return rows.filter((row) => !row.affiliateIds || row.affiliateIds.includes(affiliateId));
  return rows.filter((row) => row.affiliateId === affiliateId);
}

function jbwcInsert(table, row) {
  const db = jbwcLoadDb();
  db[table] = db[table] || [];
  db[table].unshift(row);
  jbwcSaveDb();
  return row;
}

function jbwcNextId(prefix, table) {
  const db = jbwcLoadDb();
  const count = (db[table] || []).filter((row) => String(row.id || "").startsWith(prefix)).length + 1;
  return `${prefix}-${String(count).padStart(4, "0")}`;
}

/* ------------------------------------------------------------
   Repository interface (운영 DB 전환 준비)
   - 서비스/화면 레이어는 아래 5개 진입점만 사용한다.
   - 서버 DB로 전환할 때는 이 객체의 구현만 REST/DB 클라이언트로 교체하면 된다.
   - 계약:
     * table(name, affiliateId): affiliateId 필수. 미지정 시 예외("affiliateId scope is required").
     * insert(name, row): row.affiliateId가 채워진 상태로만 호출한다.
     * nextId(prefix, name): 데모용 순번 ID. 서버 전환 시 DB 시퀀스/UUID로 대체.
     * reset(): 데모 seed 재적재. 운영 전환 시 제거 대상.
     * snapshot(): 현재 mock DB 원본(읽기 전용 용도). 운영 전환 시 제거 대상.
   - 금지: 실제 고객 개인정보/신용정보/대출 실행/금융거래 연결, 운영 credential 하드코딩.
   ------------------------------------------------------------ */
const jbwcRepository = {
  table: jbwcTable,
  insert: jbwcInsert,
  nextId: jbwcNextId,
  reset: jbwcResetDb,
  snapshot: jbwcLoadDb,
};
