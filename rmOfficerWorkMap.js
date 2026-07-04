/* RM 케이스 업무 계층도(Agent Work Map) — 케이스를 처리하기 위한 업무 분해 구조.
   Case → Case Orchestrator(총괄, 자동 완료) → 분석 브랜치 노드(승인 필요) → 최종 보고서 노드(승인 필요)
   → Human Approval(직원 최종 승인). 노드 상태는 rm_officer_agent_assignments의 kind/status로 구동되며
   "AI가 알아서 다 한다"가 아니라 각 단계의 근거·산출물을 직원이 확인 후 승인하는 구조를 보여준다. */

/* 상태 6종 — 실행 상태가 살아있는 도식(색상은 CSS 클래스로 매핑) */
const RMO_NODE_STATUSES = ["notStarted", "ready", "running", "completed", "rejected", "needsApproval"];

const RMO_NODE_STATUS_LABELS = {
  notStarted: "실행 전",
  ready: "실행 가능",
  running: "실행 중",
  completed: "완료",
  rejected: "반려 · 근거 부족",
  needsApproval: "사람 승인 필요",
};

const RMO_NODE_STATUS_COLOR = {
  notStarted: "gray",
  ready: "blue",
  running: "yellow",
  completed: "green",
  rejected: "red",
  needsApproval: "purple",
};

/* assignment.status(레거시 값 포함) → work map 6색 상태로 정규화 */
function rmoNodeStatus(rawStatus) {
  if (rawStatus === "pendingApproval") return "ready";
  if (RMO_NODE_STATUSES.includes(rawStatus)) return rawStatus;
  return "notStarted";
}

function rmoNodeStatusColorClass(rawStatus) {
  return `rmo-node-${RMO_NODE_STATUS_COLOR[rmoNodeStatus(rawStatus)]}`;
}

function rmoNodeStatusLabel(rawStatus) {
  return RMO_NODE_STATUS_LABELS[rmoNodeStatus(rawStatus)] || rawStatus || "-";
}

/* 에이전트별 "이 노드가 왜 필요한지" 설명 필드 — role(이 케이스에서 하는 일)/inputData/tools.
   케이스 유형마다 전용 에이전트만 배정되므로 agentId 1개 = 케이스 맥락 1개로 충분하다. */
const RMO_WORKMAP_NODE_FIELDS = {
  "rmo-triage": { role: "상담 유형·위험 신호·SLA를 검토해 케이스 우선순위 근거를 산정하고 필요한 분석 노드를 배정", inputData: ["상담 접수 정보", "SLA 기한", "위험도 입력"], tools: ["우선순위 근거 산정"] },
  /* 기존 4개 케이스 유형 브랜치 에이전트 */
  "rmo-marine-risk": { role: "고수온·풍랑 경보 권역과 사업장 위치를 매칭해 재해 노출과 대응 시급성을 판단", inputData: ["기상특보(공개)", "사업장 권역 정보", "기존 상담 메모"], tools: ["경보-권역 매칭", "노출도 산정"] },
  "rmo-credit-care": { role: "상환일과 최근 입출금 흐름(샘플)을 검토해 상환 여력 공백 구간을 분석", inputData: ["상환 일정", "최근 입출금 흐름(샘플)", "기존 상담 메모"], tools: ["상환 여력 신호 산정", "리마인드 시나리오 생성"] },
  "rmo-salary-flow": { role: "급여 입금 주기와 변동성을 검토해 소득 정상화 시점을 추정", inputData: ["급여 입금 주기(샘플)", "휴직/복직 일정"], tools: ["소득 흐름 추정"] },
  "rmo-dsr-guard": { role: "월 상환 항목을 모아 상환 집중 구간과 겹침 위험을 점검", inputData: ["상환 일정 전체", "카드론/대출 목록(샘플)"], tools: ["상환 집중도 점검"] },
  "rmo-youth-finance": { role: "학사일정과 장학금 입금 예상 구간을 검토해 생활비 공백을 추정", inputData: ["학사일정(공개)", "장학금 지급 일정(공개)", "소액대출 상환일"], tools: ["일정 공백 탐지"] },
  "rmo-policy-finance": { role: "소상공인 정책자금·협약대출 자격 요건을 검토(대상 확정 아님)", inputData: ["정책자금 요건 안내(공개)", "사업 개요(샘플)"], tools: ["자격 요건 체크리스트"] },
  "rmo-action": { role: "위 분석 결과를 모아 담당 RM이 바로 실행할 다음 조치 태스크를 정리", inputData: ["선행 분석 결과 전체"], tools: ["조치 태스크 생성"] },
  "rmo-comms": { role: "고객에게 전달할 안내 문안 초안을 쉬운 문장으로 작성(발송은 승인 후)", inputData: ["케이스 요약", "선행 분석 결과"], tools: ["안내 문안 초안 생성"] },

  /* 오** 39세 · JB우리캐피탈 · 기업여신·기술신용 */
  "rmo-biz-cashflow-gap": { role: "최근 3개월 매출 입금 주기와 공백 구간을 분석해 자금 압박 시점을 파악", inputData: ["매출 입금내역(샘플)", "카드매출 집계(샘플)", "기존 상담 메모"], tools: ["입금주기 분석", "공백구간 탐지"], riskLevel: "medium" },
  "rmo-biz-material-cost": { role: "원자재 매입단가 변동과 마진 압박 정도를 검토", inputData: ["매입 거래내역(샘플)", "업종 원자재 지수(공개·샘플)"], tools: ["원가율 추정", "업종 벤치마크 비교"], riskLevel: "medium" },
  "rmo-biz-lease-review": { role: "장비 리스 계약 조건과 상환 스케줄 정합성을 확인", inputData: ["장비 리스 계약 요약(샘플)", "리스 상환 스케줄"], tools: ["계약조건 체크리스트"], riskLevel: "medium" },
  "rmo-tech-credit": { role: "기술신용평가 근거 자료의 최신성과 형식 충족 여부를 확인(평가 확정 아님)", inputData: ["기술신용평가 근거 요약(샘플)", "특허/인증 현황(샘플)"], tools: ["요건 체크리스트"], riskLevel: "medium" },
  "rmo-biz-repayment-risk": { role: "매출 공백·원자재 비용·리스 부담을 종합해 상환 여력 위험 신호를 정리", inputData: ["위 4개 분석 결과 요약"], tools: ["위험 신호 종합"], riskLevel: "medium" },
  "rmo-biz-report": { role: "위 5개 분석을 종합해 여신 담당자용 검토 보고서를 작성", inputData: ["전체 분석 결과"], tools: ["보고서 종합"] },

  /* 윤** 76세 · 전북은행 · 보이스피싱 대응 */
  "rmo-fraud-txn-pattern": { role: "최근 거래 패턴에서 통상 대비 이상 송금·인출 신호를 탐지", inputData: ["최근 거래내역(샘플)", "기존 이상거래 플래그"], tools: ["이상거래 패턴 매칭"], riskLevel: "high" },
  "rmo-fraud-elderly-pattern": { role: "고령 고객 대상 보이스피싱 전형 패턴과의 유사도를 검토", inputData: ["고령자 사기 유형 DB(샘플)", "최근 상담 이력"], tools: ["패턴 유사도 비교"], riskLevel: "high" },
  "rmo-fraud-consult-notes": { role: "최근 창구·콜센터 상담 메모에서 사기 의심 정황을 재확인", inputData: ["상담 메모(샘플)"], tools: ["키워드 스캔"], riskLevel: "high" },
  "rmo-fraud-hold-need": { role: "현재 거래의 송금 보류 필요성과 근거를 정리(보류 결정은 담당자)", inputData: ["거래 이상징후 결과", "고령 위험 패턴 결과"], tools: ["보류 필요성 판단 신호"], riskLevel: "high" },
  "rmo-fraud-report": { role: "현장에서 고객에게 확인할 질문지를 작성해 보이스피싱 여부 재확인을 돕는다", inputData: ["전체 분석 결과"], tools: ["확인 질문지 생성"] },

  /* 송** 50세 · 전북은행 · 농수산 여신 사후관리 */
  "rmo-agri-cashflow-gap": { role: "최근 출하 대금 입금 주기와 공백 구간을 분석", inputData: ["출하대금 입금내역(샘플)"], tools: ["입금주기 분석"], riskLevel: "medium" },
  "rmo-agri-material-cost": { role: "비료·사료 등 농자재 지출 증가 추세를 검토", inputData: ["농자재 매입내역(샘플)"], tools: ["지출추세 분석"], riskLevel: "medium" },
  "rmo-agri-facility-cost": { role: "하우스·축사 등 시설 보수 비용 부담을 확인", inputData: ["시설 보수 견적(샘플)"], tools: ["비용 항목 체크"], riskLevel: "medium" },
  "rmo-agri-seasonal-data": { role: "작목별 계절성과 지역 기상 데이터를 참고해 매출 변동 요인을 확인", inputData: ["계절성 지수(샘플)", "지역 기상 데이터(공개)"], tools: ["계절성 비교"], riskLevel: "medium" },
  "rmo-agri-repayment-risk": { role: "위 지출·계절 요인을 종합해 상환 위험 신호를 정리", inputData: ["위 분석 결과 요약"], tools: ["위험 신호 종합"], riskLevel: "medium" },
  "rmo-agri-report": { role: "사후관리 조치(재검토 일정·상환유예 검토 등) 보고서를 작성", inputData: ["전체 분석 결과"], tools: ["보고서 종합"] },
};

function rmoNodeFieldsFor(agentId) {
  return RMO_WORKMAP_NODE_FIELDS[agentId] || { role: "케이스 분석을 수행", inputData: ["케이스 정보"], tools: ["분석"] };
}

/* 케이스 유형 → 브랜치/리포트 agentId 배정. 기존 4개 유형은 rmOfficerAgentPlans의 마지막 항목을
   리포트 노드로 취급(재구성 없이 재사용), 신규 3케이스는 전용 agentId 목록을 사용한다. */
const RMO_WORKMAP_CASE_AGENTS = {
  bizCreditReferral: { branches: ["rmo-biz-cashflow-gap", "rmo-biz-material-cost", "rmo-biz-lease-review", "rmo-tech-credit", "rmo-biz-repayment-risk"], report: "rmo-biz-report" },
  fraudResponse: { branches: ["rmo-fraud-txn-pattern", "rmo-fraud-elderly-pattern", "rmo-fraud-consult-notes", "rmo-fraud-hold-need"], report: "rmo-fraud-report" },
  agriPostMonitoring: { branches: ["rmo-agri-cashflow-gap", "rmo-agri-material-cost", "rmo-agri-facility-cost", "rmo-agri-seasonal-data", "rmo-agri-repayment-risk"], report: "rmo-agri-report" },
};

/* caseType으로 브랜치/리포트 agentId를 결정한다(신규 3종은 전용 목록, 기존 4종은 agentPlan 재사용). */
function rmoWorkMapAgentsForCaseType(caseType) {
  if (RMO_WORKMAP_CASE_AGENTS[caseType]) return RMO_WORKMAP_CASE_AGENTS[caseType];
  const plan = rmOfficerAgentPlans[caseType] || rmOfficerAgentPlans.repaymentCare;
  return { branches: plan.slice(0, -1), report: plan[plan.length - 1] };
}

/* rm_officer_agent_assignments 행에서 케이스의 업무 계층도를 조립한다.
   반환: { orchestrator, branches[], report, flattened[] } — flattened는 키보드 ↑↓ 순회 순서. */
function rmoBuildWorkMapTree(caseRow) {
  const assignments = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY)
    .filter((a) => a.caseId === caseRow.id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const branches = assignments.filter((a) => a.kind !== "report");
  const report = assignments.find((a) => a.kind === "report") || null;
  const triageRun = rmoTable("rm_officer_agent_runs", RMO_ROLE_KEY).find((r) => r.caseId === caseRow.id && r.agentId === "rmo-triage");
  const orchestrator = {
    id: `orchestrator:${caseRow.id}`,
    kind: "orchestrator",
    agentId: "rmo-triage",
    agentName: rmoAgentDisplayName("rmo-triage"),
    role: rmoNodeFieldsFor("rmo-triage").role,
    reason: (rmOfficerAgents.find((a) => a.id === "rmo-triage") || {}).description || "",
    inputData: rmoNodeFieldsFor("rmo-triage").inputData,
    tools: rmoNodeFieldsFor("rmo-triage").tools,
    expectedOutput: "priority-brief.md",
    outputMdPath: "priority-brief.md",
    status: "completed",
    riskLevel: caseRow.riskLevel,
    requiresApproval: false,
    caseId: caseRow.id,
    summary: triageRun ? triageRun.outputSummary : caseRow.priorityReason,
  };
  const flattened = [orchestrator, ...branches, ...(report ? [report] : [])];
  return { orchestrator, branches, report, flattened };
}

/* 키보드 ↑↓ 기본 포커스 — 실행 가능(ready) 상태의 첫 노드, 없으면 총괄 노드 */
function rmoDefaultWorkMapFocusIndex(flattened) {
  const idx = flattened.findIndex((n) => rmoNodeStatus(n.status) === "ready");
  return idx >= 0 ? idx : 0;
}
