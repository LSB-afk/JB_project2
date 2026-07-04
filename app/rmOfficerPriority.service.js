/* RM 우선순위/triage service — 단순 점수가 아니라 "근거 문장 + 출처"를 함께 산출한다.
   승인·금리·한도·정책자금 대상 확정이 아닌 급한 순 정렬 신호만 만든다. */

function rmoRiskRank(risk) {
  return { low: 1, medium: 2, high: 3, critical: 4 }[risk] || 1;
}

function rmoMaxRisk(a, b) {
  return rmoRiskRank(a) >= rmoRiskRank(b) ? a : b;
}

function rmoDaysUntil(dateStr) {
  if (!dateStr) return 99;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/* 케이스 입력으로 우선순위 근거를 계산한다.
   반환: { priorityScore, priority, priorityReason, prioritySources[], riskLevel,
           requiresHumanReview, escalationRequired, signals[] } */
function computeRmOfficerPriority(input) {
  const signals = [];
  const prioritySources = [];
  let score = 40;
  let riskLevel = input.riskLevel || "medium";
  const type = RMO_CASE_TYPES[input.caseType] ? input.caseType : "repaymentCare";
  const days = rmoDaysUntil(input.dueAt);

  if (type === "disasterRisk") {
    score += 30;
    riskLevel = rmoMaxRisk(riskLevel, "high");
    signals.push({ signalType: "DISASTER_EXPOSURE", title: "재해위험 노출 — 급한 대응 필요", severity: "high", evidence: "기상·고수온·풍랑 경보 권역과 사업장이 매칭됨(샘플/공개 데이터)" });
    prioritySources.push({ label: "기상특보·고수온 예보", ref: "sample:marine-alert" });
  }
  if (type === "repaymentCare") {
    score += 18;
    signals.push({ signalType: "REPAYMENT_CONCENTRATION", title: "월 상환 집중 구간", severity: "medium", evidence: "상환일 겹침·소득 공백 구간이 확인됨(샘플)" });
    prioritySources.push({ label: "상환일정·급여주기(샘플)", ref: "sample:repayment-flow" });
  }
  if (type === "dailyFinance") {
    score += 12;
    signals.push({ signalType: "LIVING_COST_GAP", title: "생활비 공백 구간", severity: "medium", evidence: "장학금 입금 전 소액 상환일이 겹침(샘플)" });
    prioritySources.push({ label: "학사일정·장학금 구간(샘플)", ref: "sample:academic-schedule" });
  }
  if (type === "policyStartup") {
    score += 14;
    signals.push({ signalType: "POLICY_ELIGIBILITY_CHECK", title: "정책금융 자격 확인 필요", severity: "medium", evidence: "소상공인/창업 정책자금 요건 확인 항목이 있음" });
    prioritySources.push({ label: "정책자금 요건(공개 안내)", ref: "sample:policy-guide" });
  }

  if (days <= 2) {
    score += 20;
    signals.push({ signalType: "SLA_IMMINENT", title: "SLA 임박", severity: "high", evidence: `처리 기한까지 ${days}일 남음` });
    prioritySources.push({ label: "SLA 기한", ref: "internal:due-date" });
  } else if (days <= 5) {
    score += 10;
    prioritySources.push({ label: "SLA 기한", ref: "internal:due-date" });
  }

  if (["high", "critical"].includes(riskLevel)) score += 15;
  score = Math.max(0, Math.min(100, score));

  const priority = score >= 80 ? "urgent" : score >= 60 ? "high" : score >= 40 ? "normal" : "low";
  const requiresHumanReview = input.requiresHumanReview === true || ["high", "critical"].includes(riskLevel) || type === "disasterRisk";
  const escalationRequired = ["high", "critical"].includes(riskLevel);

  const reasonParts = [];
  if (type === "disasterRisk") reasonParts.push("재해 경보 권역과 사업장이 겹쳐 즉시 대응이 필요");
  if (days <= 2) reasonParts.push(`SLA가 ${days}일 남아 시간 압박이 큼`);
  else if (days <= 5) reasonParts.push(`SLA가 ${days}일 남음`);
  if (type === "repaymentCare") reasonParts.push("상환일 집중·소득 공백으로 상환 여력 점검이 시급");
  if (type === "dailyFinance") reasonParts.push("생활비 공백 구간으로 고금리 대체대출 위험 노출");
  if (type === "policyStartup") reasonParts.push("정책자금 자격 확인으로 조달비용을 낮출 여지");
  if (["high", "critical"].includes(riskLevel)) reasonParts.push("위험도가 높아 담당자 검토가 필요");
  const priorityReason = (reasonParts.join(", ") || "표준 상담 큐 기준") + " (근거 데이터 연결됨)";

  return { priorityScore: score, priority, priorityReason, prioritySources, riskLevel, requiresHumanReview, escalationRequired, signals };
}

/* 접수/보드 정렬 프리뷰 — 배정 에이전트 플랜과 초기 상태까지 계산 */
function previewRmOfficerPriority(form) {
  const type = RMO_CASE_TYPES[form.caseType] ? form.caseType : "repaymentCare";
  const priority = computeRmOfficerPriority(form);
  const agentPlan = rmOfficerAgentPlans[type] || rmOfficerAgentPlans.repaymentCare;
  const initialStatus = priority.escalationRequired ? "escalated" : "intake";
  const recommendedTeam = RMO_CASE_TYPES[type].team;
  return {
    recommendedAgent: "rmo-triage",
    agentPlan,
    recommendedTeam,
    initialStatus,
    nextActions: [
      "에이전트 배정 큐 승인(Enter)으로 실행",
      "실행 결과 개별 MD 검토",
      "통합 리포트 확인 후 담당자 조치",
    ],
    ...priority,
  };
}

/* 케이스 목록을 우선순위 점수 내림차순 + SLA 오름차순으로 정렬한다(급한 순) */
function rmoSortByUrgency(rows) {
  return rows.slice().sort((a, b) => {
    const scoreDiff = (b.priorityScore || 0) - (a.priorityScore || 0);
    if (scoreDiff !== 0) return scoreDiff;
    return String(a.dueAt || "9999").localeCompare(String(b.dueAt || "9999"));
  });
}
