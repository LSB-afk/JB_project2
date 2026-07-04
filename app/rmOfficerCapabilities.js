/* RM 업무 기능 저장소(Capability Repository) — AI 업무지원에서 직접 활용되는 금융/리스크/계약/준법
   업무 기능을 카테고리별로 확인하는 신규 화면. 데이터는 기존 rmOfficerAgents/rmOfficerSkills/서비스
   레지스트리에서 도출한다(창작 최소화). 상태는 구현현황과 정직하게 일치시킨다:
   "사용 가능" = 결정론적 실제 로직이 항상 동작(모의 데이터 여부와 무관) · "mock" = LLM/도메인 분석을
   더미 템플릿으로 시뮬레이션 · "검토 중" = 일부만 구현(자동화 미완) · "live" = 실제 외부 프로세스 호출 시도. */

const RMO_CAPABILITY_CATEGORIES = [
  "관리 및 운영 기능",
  "주의 신호 분류",
  "정책자금 초안 검토",
  "상환 일정 분석",
  "리마인드 자동화",
  "외부 데이터 연결",
  "보고서 생성",
  "담당자 승인 절차",
  "감사 기록",
  "통합 리포트 생성",
];

const RMO_CAPABILITY_STATUS_LABELS = {
  available: "사용 가능",
  review: "검토 중",
  mock: "mock",
  live: "live",
};

const RMO_CAPABILITIES = [
  { id: "priority-scoring", name: "우선순위 근거 산정", summary: "상담 유형·위험 신호·SLA를 계산해 급한 순 정렬 근거를 만듭니다.", category: "관리 및 운영 기능", agentIds: ["rmo-triage"], data: ["상담 접수 정보", "SLA 기한", "위험도 입력"], output: "priority-brief.md", status: "available", serviceRef: "computeRmOfficerPriority" },
  { id: "sidebar-counts", name: "케이스 현황 집계", summary: "역할 scope 쿼리로 사이드바·보드의 케이스 카운트를 실시간 집계합니다.", category: "관리 및 운영 기능", agentIds: [], data: ["rm_officer_cases 전체 테이블"], output: "사이드바 카운트 배지", status: "available", serviceRef: "getRmOfficerSidebarCounts" },
  { id: "disaster-signal", name: "재해·이상거래 신호 분류", summary: "기상특보·거래내역(샘플)을 검토해 재해·이상거래 위험 신호를 분류합니다.", category: "주의 신호 분류", agentIds: ["rmo-marine-risk", "rmo-fraud-txn-pattern"], data: ["기상특보(공개·샘플)", "최근 거래내역(샘플)"], output: "위험 신호 항목", status: "mock", serviceRef: "rmoBuildAgentDeliverable" },
  { id: "repayment-risk-signal", name: "상환 위험 신호 종합", summary: "여러 분석 결과를 모아 상환 여력 위험 신호를 종합 판단합니다(신용등급 산출 아님).", category: "주의 신호 분류", agentIds: ["rmo-dsr-guard", "rmo-biz-repayment-risk", "rmo-agri-repayment-risk"], data: ["상환 일정 전체", "선행 분석 결과"], output: "위험 신호 요약", status: "mock", serviceRef: "rmoBuildAgentDeliverable" },
  { id: "policy-checklist", name: "정책자금 자격 체크리스트", summary: "소상공인·창업 정책자금과 협약대출 자격 확인 항목을 정리합니다(대상 확정 아님).", category: "정책자금 초안 검토", agentIds: ["rmo-policy-finance"], data: ["정책자금 요건 안내(공개)", "사업 개요(샘플)"], output: "policy-finance.md", status: "mock", serviceRef: "rmoBuildAgentDeliverable" },
  { id: "tech-credit-review", name: "기술신용 근거 검토", summary: "기술신용평가 근거 자료의 최신성·형식 요건을 확인합니다(평가 확정 아님).", category: "정책자금 초안 검토", agentIds: ["rmo-tech-credit"], data: ["기술신용평가 근거 요약(샘플)", "특허/인증 현황(샘플)"], output: "tech-credit-review.md", status: "mock", serviceRef: "rmoBuildAgentDeliverable" },
  { id: "repayment-gap-analysis", name: "상환 여력·입금 공백 분석", summary: "상환일과 입출금 흐름(샘플)을 비교해 상환 여력 공백 구간을 분석합니다.", category: "상환 일정 분석", agentIds: ["rmo-credit-care", "rmo-salary-flow", "rmo-biz-cashflow-gap", "rmo-agri-cashflow-gap"], data: ["상환 일정", "입출금 흐름(샘플)"], output: "credit-care.md 등 개별 산출물", status: "mock", serviceRef: "rmoBuildAgentDeliverable" },
  { id: "reminder-draft", name: "상환일 리마인드 문안 초안", summary: "고객에게 보낼 상환일 안내 문안을 쉬운 문장으로 작성합니다(자동 발송은 미구현).", category: "리마인드 자동화", agentIds: ["rmo-comms"], data: ["케이스 요약", "선행 분석 결과"], output: "customer-guidance.md", status: "review", serviceRef: "rmoBuildAgentDeliverable" },
  { id: "external-connectors", name: "외부 공개 데이터 연결 상태", summary: "기상특보·정책자금 안내 등 공개/샘플 데이터 연결 상태를 표시합니다.", category: "외부 데이터 연결", agentIds: [], data: ["기상특보(공개)", "정책자금 요건(공개)"], output: "데이터 연결 상태 배지", status: "mock", serviceRef: "rm_officer_external_connectors" },
  { id: "ollama-runtime", name: "로컬 모델(Ollama) 실행 연동", summary: "설정된 로컬 모델로 실제 연결을 시도하고, 서버가 없으면 안전하게 대체 처리합니다.", category: "외부 데이터 연결", agentIds: [], data: ["케이스 요약", "가드레일 정책"], output: "로컬 모델 응답 로그", status: "live", serviceRef: "runAgentModelRequest" },
  { id: "individual-report", name: "개별 산출물 보고서 생성", summary: "에이전트 실행 결과로 상황분석·근거표·판단·다음 조치가 담긴 개별 md를 만듭니다.", category: "보고서 생성", agentIds: ["rmo-action"], data: ["에이전트 실행 결과"], output: "개별 에이전트 .md", status: "available", serviceRef: "rmoBuildAgentDeliverable" },
  { id: "final-review-report", name: "최종 검토 보고서 작성", summary: "선행 분석을 모두 종합해 담당자용 최종 검토 보고서를 작성합니다.", category: "보고서 생성", agentIds: ["rmo-biz-report", "rmo-fraud-report", "rmo-agri-report"], data: ["선행 분석 결과 전체"], output: "-final-report.md / questionnaire.md", status: "mock", serviceRef: "rmoBuildAgentDeliverable" },
  { id: "approval-routing", name: "승인 라우팅", summary: "사람 승인이 필요한 항목을 승인권자 큐로 라우팅합니다(자체 승인 없음).", category: "담당자 승인 절차", agentIds: ["rmo-approval-router"], data: ["산출물", "케이스 위험도"], output: "승인 큐 항목", status: "available", serviceRef: "rmoDecideApproval" },
  { id: "guardrail-check", name: "준법 가드레일 검증", summary: "단정 표현·PII·high/critical 자동 완료 시도를 코드로 차단하고 사람 검토를 강제합니다.", category: "담당자 승인 절차", agentIds: ["rmo-compliance"], data: ["에이전트 실행 결과", "위험도"], output: "차단 사유/검토 필요 표시", status: "available", serviceRef: "rmoEvaluateAgentOutput" },
  { id: "audit-logging", name: "감사 로그 기록", summary: "케이스 생성부터 승인까지 모든 운영 이벤트를 append-only로 기록합니다.", category: "감사 기록", agentIds: [], data: ["모든 케이스/에이전트 실행 이벤트"], output: "rm_officer_audit_logs 항목", status: "available", serviceRef: "rmoWriteAudit" },
  { id: "integrated-report", name: "케이스 통합 리포트 생성", summary: "케이스의 개별 산출물을 모두 모아 옵시디언식 링크가 포함된 통합본을 만듭니다.", category: "통합 리포트 생성", agentIds: [], data: ["케이스의 개별 산출물 전체"], output: "통합본.md", status: "available", serviceRef: "rmoBuildIntegratedDeliverable" },
];

function rmoCapabilityAgentNames(cap) {
  return (cap.agentIds || []).map(rmoAgentDisplayName);
}

function rmoCapabilityStatusClass(status) {
  return `rmo-cap-status-${status}`;
}

let rmoCapabilityFilter = "all";

/* 카드: 기능명/한 줄 설명/사용 도메인(카테고리)/연결 에이전트/사용 데이터/생성 산출물/상태 */
function rmoCapabilityCard(cap) {
  const agentNames = rmoCapabilityAgentNames(cap);
  const agentsText = agentNames.length ? agentNames.join(", ") : "서비스 레이어(에이전트 비경유)";
  return `<article class="rmo-cap-card" data-rmo-cap-id="${escapeHtml(cap.id)}">
    <header class="rmo-cap-card-head">
      <p class="rmo-cap-category">${escapeHtml(cap.category)}</p>
      <span class="status-pill rmo-cap-status ${rmoCapabilityStatusClass(cap.status)}">${escapeHtml(RMO_CAPABILITY_STATUS_LABELS[cap.status] || cap.status)}</span>
    </header>
    <h4 class="rmo-cap-name">${escapeHtml(cap.name)}</h4>
    <p class="rmo-cap-summary">${escapeHtml(cap.summary)}</p>
    <div class="rmo-cap-field"><span>연결 에이전트</span><p>${escapeHtml(agentsText)}</p></div>
    <div class="rmo-cap-field"><span>사용하는 데이터</span><div class="rmo-data-chips">${cap.data.map((d) => `<span class="rmo-data-chip">${escapeHtml(d)}</span>`).join("")}</div></div>
    <div class="rmo-cap-field"><span>생성 산출물</span><p>${escapeHtml(cap.output)}</p></div>
  </article>`;
}

function rmoCapabilityFilterBar() {
  const options = [["all", "전체"]].concat(RMO_CAPABILITY_CATEGORIES.map((c) => [c, c]));
  return `<div class="rmo-filter-row rmo-cap-filter-row" role="tablist" aria-label="업무 기능 카테고리 필터">${options.map(([value, label]) => `<button type="button" class="rmo-filter ${rmoCapabilityFilter === value ? "is-active" : ""}" role="tab" aria-selected="${rmoCapabilityFilter === value ? "true" : "false"}" data-rmo-cap-filter="${escapeHtml(value)}">${escapeHtml(label)}</button>`).join("")}</div>`;
}

/* 하단 기능 목록 테이블 — 기능명/카테고리/연결 에이전트/상태를 한 줄로 스캔 가능하게 */
function rmoCapabilityTable(rows) {
  const body = rows.map((cap) => `<li class="jbwc-row">
      <span class="jbwc-row-id">${escapeHtml(cap.name)}<br><span class="jbwc-row-note">${escapeHtml(cap.output)}</span></span>
      <span>${escapeHtml(cap.category)}</span>
      <span>${escapeHtml(rmoCapabilityAgentNames(cap).join(", ") || "서비스 레이어")}</span>
      <span class="status-pill rmo-cap-status ${rmoCapabilityStatusClass(cap.status)}">${escapeHtml(RMO_CAPABILITY_STATUS_LABELS[cap.status] || cap.status)}</span>
    </li>`).join("");
  return `<ul class="jbwc-list"><li class="jbwc-row jbwc-row-head"><span>기능명</span><span>카테고리</span><span>연결 에이전트</span><span>상태</span></li>${body || '<li class="jbwc-row"><span>표시할 기능이 없습니다.</span></li>'}</ul>`;
}

/* 업무 기능 저장소 화면 — hero + 카테고리 필터 + 카드 그리드 + 하단 테이블 */
function rmoCapabilityRepositoryView() {
  const filtered = rmoCapabilityFilter === "all" ? RMO_CAPABILITIES : RMO_CAPABILITIES.filter((c) => c.category === rmoCapabilityFilter);
  const hero = `<section class="jbwc-hero rmo-banner rmo-cap-hero">
    <div>
      <p class="eyebrow">역할 전용 하네스 · 업무 기능 저장소</p>
      <h2>업무 기능 저장소</h2>
      <p>AI 업무지원에서 직접 활용되는 금융, 리스크, 계약, 준법 업무 기능을 확인합니다.</p>
    </div>
  </section>`;
  return `${hero}
    ${rmoCapabilityFilterBar()}
    <section class="workspace-panel jbwc-panel"><p class="eyebrow">기능 카드 (${filtered.length}/${RMO_CAPABILITIES.length})</p><div class="rmo-cap-grid">${filtered.map(rmoCapabilityCard).join("") || '<div class="jbwc-empty">해당 카테고리에 등록된 기능이 없습니다.</div>'}</div></section>
    ${rmoPanel(`기능 목록 (${filtered.length})`, rmoCapabilityTable(filtered))}
    ${rmoMockNote()}`;
}
