/* 전세사기 보호 하네스 — 위험 스코어링 서비스.
   전세사기 여부를 확정 판정하지 않고 "위험 신호 점수"만 만든다.
   unknown/미확인은 낮게 확정하지 않고 최소 medium + 담당자 확인 필요로 표현한다. */

const JPO_SEVERITY_ORDER = ["low", "medium", "high", "critical"];

function jpoMaxSeverity(a, b) {
  return JPO_SEVERITY_ORDER.indexOf(b) > JPO_SEVERITY_ORDER.indexOf(a) ? b : a;
}

function jpoDaysUntil(dateText) {
  if (!dateText) return null;
  const target = new Date(dateText);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target.getTime() - Date.now()) / 86400000);
}

/* 입력: 보증금/월세/주택유형/법정동/계약년월 + market(중앙값·표본·sourceMode)
        + 등기/보증 수동 체크 상태 + 경·공매 일정 + 계약일 */
function computeJeonseRiskAssessment(input) {
  const market = input.market || { sourceMode: "fallback", saleMedian: 0, jeonseMedian: 0, comparableTradeCount: 0, comparableRentCount: 0 };
  const deposit = Number(input.depositAmount || 0);
  const signals = [];
  let riskLevel = "low";
  const nextActions = [];
  const addSignal = (signalType, severity, evidence, requiresHumanReview = false) => {
    signals.push({
      signalType,
      severity,
      title: JPO_SIGNAL_TYPES[signalType] || signalType,
      evidence,
      requiresHumanReview,
    });
    riskLevel = jpoMaxSeverity(riskLevel, severity);
  };

  const jeonseRatio = market.saleMedian > 0 ? deposit / market.saleMedian : null;
  const officialPriceEst = jpoEstimateOfficialPrice(market.saleMedian);

  if (jeonseRatio != null) {
    if (jeonseRatio >= 0.9) addSignal("JEONSE_RATIO_HIGH", "high", `보증금/추정 매매가 ${(jeonseRatio * 100).toFixed(0)}% (기준 90%↑)`, true);
    else if (jeonseRatio >= 0.8) addSignal("JEONSE_RATIO_HIGH", "medium", `보증금/추정 매매가 ${(jeonseRatio * 100).toFixed(0)}% (기준 80%↑)`);
  }
  if (officialPriceEst > 0 && deposit >= officialPriceEst) {
    const ratio = deposit / officialPriceEst;
    addSignal("DEPOSIT_OVER_OFFICIAL_PRICE", ratio >= 1.2 ? "high" : "medium",
      `보증금이 추정 공시가격(${Math.round(officialPriceEst / 10000)}만원)의 ${(ratio * 100).toFixed(0)}%`, ratio >= 1.2);
  }
  if (market.jeonseMedian > 0 && deposit >= market.jeonseMedian * 1.2) {
    const ratio = deposit / market.jeonseMedian;
    addSignal("ABOVE_NEIGHBORHOOD_MEDIAN", ratio >= 1.4 ? "high" : "medium",
      `인근 전세 거래 기준가(${Math.round(market.jeonseMedian / 10000)}만원) 대비 ${(ratio * 100).toFixed(0)}%`);
  }
  const comparableTotal = Number(market.comparableTradeCount || 0) + Number(market.comparableRentCount || 0);
  if (comparableTotal < 5) {
    addSignal("LOW_COMPARABLE_COUNT", "low", `유사 거래 표본 ${comparableTotal}건 — 판단 유보`, true);
    nextActions.push("표본 부족 — 인근 법정동 추가 조회 또는 담당자 확인");
  }
  if (input.registryStatus !== "verified") {
    addSignal("REGISTRY_RIGHTS_UNKNOWN", "medium", "등기부 선순위·압류·신탁 확인 전", true);
    riskLevel = jpoMaxSeverity(riskLevel, "medium");
    nextActions.push("등기부 체크리스트 확인(수동)");
  }
  if (input.guaranteeStatus === "unknown" || !input.guaranteeStatus) {
    addSignal("GUARANTEE_STATUS_UNKNOWN", "medium", "보증보험 가입/가능성 미확인", true);
    riskLevel = jpoMaxSeverity(riskLevel, "medium");
    nextActions.push("보증·HUG 확인 필요 항목 점검(가입 가능 여부 확정 금지)");
  }
  if (input.auctionNoticed) {
    const days = jpoDaysUntil(input.auctionDeadline);
    const severity = days != null && days <= 14 ? "critical" : "high";
    addSignal("AUCTION_OR_FORECLOSURE_DEADLINE", severity,
      days != null ? `경·공매 기한 D-${Math.max(days, 0)}` : "경·공매 통지 접수", true);
    riskLevel = jpoMaxSeverity(riskLevel, "high");
    nextActions.push("긴급 경·공매 대응 큐 확인 및 외부기관 연계 검토");
  }
  if (input.intakeType === "depositDelay") {
    addSignal("LANDLORD_RISK_MANUAL_REQUIRED", "high", "보증금 반환 지연 — 임대인/보증사고 이력 외부기관 확인 필요", true);
    riskLevel = jpoMaxSeverity(riskLevel, "high");
  }
  if (["rowHouse", "multiHousehold"].includes(input.housingType) && input.buildingCheckStatus !== "verified") {
    addSignal("ILLEGAL_BUILDING_MANUAL_REQUIRED", "medium", "건축물대장·위반건축물 여부 수동 확인 필요", true);
  }
  const contractDays = jpoDaysUntil(input.contractEndDate || input.contractDate);
  if (contractDays != null && contractDays >= 0 && contractDays <= 14) {
    addSignal("CONTRACT_DATE_URGENT", contractDays <= 7 ? "high" : "medium", `계약/만기 D-${contractDays}`, contractDays <= 7);
  }

  let confidence = market.sourceMode === "live_api" ? "high" : market.sourceMode === "snapshot" ? "medium" : "low";
  if (market.sourceMode === "fallback") {
    riskLevel = jpoMaxSeverity(riskLevel, "medium");
    nextActions.unshift("실거래 API 미연결 — 데이터 부족으로 담당자 확인 필요");
  }
  if (comparableTotal < 5) confidence = confidence === "high" ? "medium" : "low";

  const intake = JPO_INTAKE_TYPES[input.intakeType] || {};
  if (intake.minRisk) riskLevel = jpoMaxSeverity(riskLevel, intake.minRisk);
  const requiresHumanReview = ["high", "critical"].includes(riskLevel)
    || Boolean(intake.requiresHumanReview)
    || signals.some((signal) => signal.requiresHumanReview);
  if (["victimApplication", "legalConsult", "guaranteeInquiry"].includes(input.intakeType)) {
    nextActions.push("피해자 결정/법률/보증 관련 판단은 담당자 확인 필요(확정 금지)");
  }

  return {
    signals,
    riskLevel,
    confidence,
    requiresHumanReview,
    sourceMode: market.sourceMode,
    jeonseRatio,
    officialPriceEst,
    nextActions: [...new Set(nextActions)],
  };
}
