/* 기업여신 risk/triage service — 승인·금리·한도 산정이 아닌 운영 신호만 산출한다. */

function ccrRiskRank(risk) {
  return { low: 1, medium: 2, high: 3, critical: 4 }[risk] || 1;
}

function ccrMaxRisk(a, b) {
  return ccrRiskRank(a) >= ccrRiskRank(b) ? a : b;
}

function computeCorporateCreditRiskSignals(input) {
  const signals = [];
  let riskLevel = input.riskLevel || "medium";
  const docsMissing = input.docsReceived === false || input.docsStatus === "missing";
  const collateralNeedsCheck = input.collateralExists || ["guaranteeBackedLoan", "movableCollateralLoan"].includes(input.domain);
  const isStructured = input.domain === "pfStructuredFinance";
  const isEws = input.domain === "earlyWarningNpl";
  const staleFinancial = !input.financialBaseMonth || String(input.financialBaseMonth).replace("-", "") < "202604";

  if (docsMissing) {
    riskLevel = ccrMaxRisk(riskLevel, "medium");
    signals.push({ signalType: "MISSING_CREDIT_PACKAGE", title: "심사 패키지 보완 필요", severity: "medium", evidence: "필수 제출서류 또는 재무자료가 누락됨" });
  }
  if (staleFinancial) {
    riskLevel = ccrMaxRisk(riskLevel, "medium");
    signals.push({ signalType: "STALE_FINANCIAL_DATA", title: "재무자료 기준월 확인 필요", severity: "medium", evidence: "최근 재무자료 기준월이 없거나 오래됨" });
  }
  if (collateralNeedsCheck) {
    riskLevel = ccrMaxRisk(riskLevel, input.guaranteeExists ? "medium" : "high");
    signals.push({ signalType: "COLLATERAL_GUARANTEE_MANUAL_CHECK", title: "담보·보증 확인 필요", severity: input.guaranteeExists ? "medium" : "high", evidence: "담보/보증 조건은 외부·담당자 확인 필요" });
  }
  if (isStructured) {
    riskLevel = ccrMaxRisk(riskLevel, "critical");
    signals.push({ signalType: "STRUCTURED_FINANCE_ESCALATION", title: "PF·구조화 금융 승인권자 검토 필요", severity: "critical", evidence: "구조화/PF 케이스는 자동 완료 금지" });
  }
  if (isEws) {
    riskLevel = ccrMaxRisk(riskLevel, "high");
    signals.push({ signalType: "EARLY_WARNING_SIGNAL", title: "조기경보/EWS 검토 필요", severity: "high", evidence: "연체·부실징후 업무 유형" });
  }

  const requiresHumanReview = input.requiresHumanReview === true || ["high", "critical"].includes(riskLevel) || isStructured || isEws;
  const escalationRequired = ["high", "critical"].includes(riskLevel);
  return { riskLevel, signals, requiresHumanReview, escalationRequired };
}

function previewCorporateCreditTriage(form) {
  const domain = CCR_DOMAINS[form.domain] || CCR_DOMAINS.workingCapital;
  const risk = computeCorporateCreditRiskSignals(form);
  const routedAgentId = corporateCreditRoutingRules[form.domain] || "ccr-triage";
  const initialStatus = risk.escalationRequired
    ? "escalated"
    : form.docsReceived === false ? "docsCollecting"
      : (form.collateralExists || form.guaranteeExists) ? "collateralGuaranteeReview"
        : "financialDataReview";
  const requiredDocuments = ["사업자등록증 사본(원문 저장 금지)", "최근 재무자료 요약", "자금용도 증빙", "담당 RM 확인 메모"];
  if (form.collateralExists) requiredDocuments.push("담보 확인 요약");
  if (form.guaranteeExists) requiredDocuments.push("보증서 확인 요약");
  if (form.domain === "tradeFinance") requiredDocuments.push("외환·무역금융 관련 서식 확인");
  if (form.domain === "policyEsgLoan") requiredDocuments.push("정책·ESG 증빙 확인");
  return {
    recommendedAgent: routedAgentId,
    recommendedTeam: domain.team,
    initialStatus,
    requiredDocuments,
    missingDocuments: form.docsReceived === false ? requiredDocuments.slice(0, 2) : [],
    nextTasks: [
      "재무자료 기준월 확인",
      "담보·보증 수동 확인",
      "여신메모 초안 생성 전 준법 가드레일 검증",
    ],
    ...risk,
  };
}
