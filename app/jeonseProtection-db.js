/* 전세사기 보호 하네스 — 전용 mock DB/repository (v2).
   실명·주민번호·전화·계좌·주소 원문·임대인 신용정보는 어떤 필드에도 저장하지 않는다.
   식별자는 익명 Ref(CUST-JS-*)와 마스킹 주소("서울 강서구 화곡동 ***")만 사용한다. */

const JPO_DB_KEY = "jpo-ops-db-v2";
const JPO_SEED_EXAMPLE_IDS = ["JEONSE-0001", "JEONSE-0002", "JEONSE-0003", "JEONSE-0004", "JEONSE-0005", "JEONSE-0006"];

function jpoSeedData() {
  const R = JPO_ROLE_KEY;
  const W = JPO_WORKSPACE_ID;
  const today = new Date();
  const iso = (date) => date.toISOString().slice(0, 10);
  const plus = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return iso(d); };
  const scope = (row) => ({ roleKey: R, workspaceId: W, ...row });

  const users = [
    ["USR-JPO-RISK-01", "위험분석 김OO", "analyst", "위험분석팀"],
    ["USR-JPO-RISK-02", "위험분석 이OO", "analyst", "위험분석팀"],
    ["USR-JPO-SUP-01", "피해지원 최OO", "support", "피해지원팀"],
    ["USR-JPO-SUP-02", "피해지원 한OO", "support", "피해지원팀"],
    ["USR-JPO-GRT-01", "보증연계 정OO", "review", "보증연계팀"],
    ["USR-JPO-AUD-01", "감독검토 배OO", "supervisor", "내부통제팀"],
  ].map(([id, name, role, team]) => ({ id, name, role, team, status: "active", roleKeys: [R] }));

  /* §12 필수 seed 6건 — 케이스 lifecycle 보드 컬럼에 분산 배치 */
  const jeonse_cases = [
    scope({
      id: "JEONSE-0001", caseNo: "JEONSE-0001", customerRefId: "CUST-JS-0001",
      intakeType: "preContract", housingType: "rowHouse", contractType: "jeonse",
      addressMasked: "서울 강서구 화곡동 ***", lawdCode: "11500", buildingName: "화곡 ○○빌라",
      areaSize: 42, floor: 3, builtYear: 2016,
      depositAmount: 260000000, monthlyRentAmount: 0,
      contractStartDate: "", contractEndDate: plus(21),
      status: "riskReview", priority: "high", riskLevel: "high", requiresHumanReview: true,
      registryStatus: "unknown", guaranteeStatus: "unknown", buildingCheckStatus: "unknown",
      seniorLienEntered: false, auctionNoticed: false, auctionDeadline: "", docsReady: true,
      docChecklist: [["임대차계약서(초안)", "보유"], ["등기부등본", "확인 필요"]],
      sourceMode: "snapshot", sourceChannel: "branch", tags: ["전세가율", "다세대"],
      assignedTeam: "위험분석팀", assignedToId: "USR-JPO-RISK-01",
      dueAt: plus(2), createdAt: plus(-1), updatedAt: plus(0),
    }),
    scope({
      id: "JEONSE-0002", caseNo: "JEONSE-0002", customerRefId: "CUST-JS-0002",
      intakeType: "guaranteeInquiry", housingType: "officetel", contractType: "semiJeonse",
      addressMasked: "서울 관악구 신림동 ***", lawdCode: "11620", buildingName: "신림 ○○오피스텔",
      areaSize: 23, floor: 8, builtYear: 2019,
      depositAmount: 160000000, monthlyRentAmount: 200000,
      contractStartDate: plus(-200), contractEndDate: plus(160),
      status: "humanReview", priority: "normal", riskLevel: "medium", requiresHumanReview: true,
      registryStatus: "verified", guaranteeStatus: "unknown", buildingCheckStatus: "verified",
      seniorLienEntered: true, auctionNoticed: false, auctionDeadline: "", docsReady: true,
      docChecklist: [["임대차계약서", "보유"], ["보증보험 증권", "확인 필요"]],
      sourceMode: "snapshot", sourceChannel: "contactCenter", tags: ["보증보험", "오피스텔"],
      assignedTeam: "보증연계팀", assignedToId: "USR-JPO-GRT-01",
      dueAt: plus(3), createdAt: plus(-2), updatedAt: plus(0),
    }),
    scope({
      id: "JEONSE-0003", caseNo: "JEONSE-0003", customerRefId: "CUST-JS-0003",
      intakeType: "preContract", housingType: "apartment", contractType: "jeonse",
      addressMasked: "서울 구로구 개봉동 ***", lawdCode: "11530", buildingName: "개봉 ○○아파트",
      areaSize: 59, floor: 12, builtYear: 2008,
      depositAmount: 460000000, monthlyRentAmount: 0,
      contractStartDate: "", contractEndDate: plus(45),
      status: "enriching", priority: "normal", riskLevel: "medium", requiresHumanReview: false,
      registryStatus: "verified", guaranteeStatus: "enrolled", buildingCheckStatus: "verified",
      seniorLienEntered: true, auctionNoticed: false, auctionDeadline: "", docsReady: true,
      docChecklist: [["임대차계약서(초안)", "보유"]],
      sourceMode: "snapshot", sourceChannel: "opsPortal", tags: ["유사거래", "아파트"],
      assignedTeam: "위험분석팀", assignedToId: "USR-JPO-RISK-02",
      dueAt: plus(4), createdAt: plus(0), updatedAt: plus(0),
    }),
    scope({
      id: "JEONSE-0004", caseNo: "JEONSE-0004", customerRefId: "CUST-JS-0004",
      intakeType: "auctionNotice", housingType: "multiHousehold", contractType: "jeonse",
      addressMasked: "인천 미추홀구 주안동 ***", lawdCode: "28177", buildingName: "주안 ○○주택",
      areaSize: 38, floor: 2, builtYear: 2004,
      depositAmount: 120000000, monthlyRentAmount: 0,
      contractStartDate: plus(-560), contractEndDate: plus(-20),
      status: "humanReview", priority: "urgent", riskLevel: "critical", requiresHumanReview: true,
      registryStatus: "unknown", guaranteeStatus: "none", buildingCheckStatus: "unknown",
      seniorLienEntered: false, auctionNoticed: true, auctionDeadline: plus(9), docsReady: false,
      docChecklist: [["경매 통지서", "보유"], ["임대차계약서", "보유"], ["배당요구 서류", "누락"]],
      sourceMode: "fallback", sourceChannel: "contactCenter", tags: ["경공매", "다가구"],
      assignedTeam: "피해지원팀", assignedToId: "USR-JPO-SUP-01",
      dueAt: plus(1), createdAt: plus(-3), updatedAt: plus(0),
    }),
    scope({
      id: "JEONSE-0005", caseNo: "JEONSE-0005", customerRefId: "CUST-JS-0005",
      intakeType: "depositDelay", housingType: "rowHouse", contractType: "jeonse",
      addressMasked: "대전 서구 둔산동 ***", lawdCode: "30170", buildingName: "둔산 ○○빌",
      areaSize: 46, floor: 4, builtYear: 2012,
      depositAmount: 145000000, monthlyRentAmount: 0,
      contractStartDate: plus(-740), contractEndDate: plus(-30),
      status: "externalLinked", priority: "high", riskLevel: "high", requiresHumanReview: true,
      registryStatus: "verified", guaranteeStatus: "none", buildingCheckStatus: "verified",
      seniorLienEntered: true, auctionNoticed: false, auctionDeadline: "", docsReady: true,
      docChecklist: [["임대차계약서", "보유"], ["내용증명 발송본", "누락"], ["등기부등본", "보유"]],
      sourceMode: "snapshot", sourceChannel: "branch", tags: ["반환지연", "피해지원"],
      assignedTeam: "피해지원팀", assignedToId: "USR-JPO-SUP-02",
      dueAt: plus(2), createdAt: plus(-6), updatedAt: plus(-1),
    }),
    scope({
      id: "JEONSE-0006", caseNo: "JEONSE-0006", customerRefId: "CUST-JS-0006",
      intakeType: "urgentPreContract", housingType: "apartment", contractType: "jeonse",
      addressMasked: "부산 수영구 광안동 ***", lawdCode: "26350", buildingName: "광안 ○○아파트",
      areaSize: 74, floor: 15, builtYear: 2015,
      depositAmount: 340000000, monthlyRentAmount: 0,
      contractStartDate: "", contractEndDate: plus(10),
      status: "received", priority: "urgent", riskLevel: "medium", requiresHumanReview: false,
      registryStatus: "unknown", guaranteeStatus: "unknown", buildingCheckStatus: "verified",
      seniorLienEntered: false, auctionNoticed: false, auctionDeadline: "", docsReady: false,
      docChecklist: [["임대차계약서(초안)", "확인 필요"]],
      sourceMode: "snapshot", sourceChannel: "contactCenter", tags: ["계약 전", "긴급"],
      assignedTeam: "위험분석팀", assignedToId: "USR-JPO-RISK-01",
      dueAt: plus(1), createdAt: plus(0), updatedAt: plus(0),
    }),
    // 타 역할 스코프 격리 검증용 seed — 전세보호 count/search/list 어디에도 노출 금지
    { roleKey: "fds-officer", workspaceId: "fds", id: "JEONSE-OTHER-0001", caseNo: "JEONSE-OTHER-0001", customerRefId: "CUST-OTHER-0001", intakeType: "preContract", housingType: "apartment", contractType: "jeonse", addressMasked: "타 역할 스코프 검증용 ***", lawdCode: "11500", buildingName: "격리 검증", areaSize: 0, floor: 0, builtYear: 2000, depositAmount: 1, monthlyRentAmount: 0, contractStartDate: "", contractEndDate: "", status: "received", priority: "urgent", riskLevel: "critical", requiresHumanReview: true, registryStatus: "unknown", guaranteeStatus: "unknown", buildingCheckStatus: "unknown", seniorLienEntered: false, auctionNoticed: false, auctionDeadline: "", docsReady: false, docChecklist: [], sourceMode: "fallback", sourceChannel: "test", tags: ["exclude"], assignedTeam: "타 역할", assignedToId: "USR-JPO-RISK-01", dueAt: plus(0), createdAt: plus(0), updatedAt: plus(0) },
  ];

  const snapshotRow = (id, caseId, housingType, lawdCode, override = {}) => {
    const market = jpoMarketSnapshotSync(housingType, lawdCode);
    return scope({
      id, caseId, source: market.source, sourceMode: market.sourceMode,
      lawdCode, dealYm: "202605",
      saleMedian: market.saleMedian, jeonseMedian: market.jeonseMedian, rentMedian: market.jeonseMedian,
      jeonseRatio: market.saleMedian > 0 ? Number(((jeonse_cases.find((c) => c.id === caseId) || {}).depositAmount / market.saleMedian).toFixed(2)) : null,
      comparableCount: market.comparableTradeCount + market.comparableRentCount,
      comparableTradeCount: market.comparableTradeCount, comparableRentCount: market.comparableRentCount,
      officialPriceEst: jpoEstimateOfficialPrice(market.saleMedian),
      fetchedAt: plus(0),
      ...override,
    });
  };

  return {
    version: 3,
    seededAt: new Date().toISOString(),
    role_workspaces: [
      { id: W, roleKey: R, displayName: JPO_DISPLAY_NAME, harnessId: "jeonseFraudProtectionHarness", status: "active" },
    ],
    users,
    jeonse_cases,
    jeonse_price_snapshots: [
      snapshotRow("JEONSE-SNAP-0001", "JEONSE-0001", "rowHouse", "11500"),
      snapshotRow("JEONSE-SNAP-0002", "JEONSE-0002", "officetel", "11620"),
      snapshotRow("JEONSE-SNAP-0003", "JEONSE-0003", "apartment", "11530"),
      // §12: external API fallback 1개 — 호출 실패 시나리오 기록
      snapshotRow("JEONSE-SNAP-0004", "JEONSE-0004", "multiHousehold", "28177", {
        sourceMode: "fallback", source: "실거래 API 호출 실패 — 담당자 확인 필요",
        saleMedian: 0, jeonseMedian: 0, rentMedian: 0, jeonseRatio: null,
        comparableCount: 0, comparableTradeCount: 0, comparableRentCount: 0, officialPriceEst: 0,
      }),
      snapshotRow("JEONSE-SNAP-0005", "JEONSE-0005", "rowHouse", "30170"),
      snapshotRow("JEONSE-SNAP-0006", "JEONSE-0006", "apartment", "26350"),
    ],
    jeonse_risk_signals: [
      scope({ id: "JEONSE-SIG-0001", caseId: "JEONSE-0001", signalType: "JEONSE_RATIO_HIGH", severity: "high", title: JPO_SIGNAL_TYPES.JEONSE_RATIO_HIGH, evidence: "보증금 2.6억 / 인근 다세대 매매 기준가 2.85억 (91%)", requiresHumanReview: true, createdAt: plus(-1) }),
      scope({ id: "JEONSE-SIG-0002", caseId: "JEONSE-0001", signalType: "REGISTRY_RIGHTS_UNKNOWN", severity: "medium", title: JPO_SIGNAL_TYPES.REGISTRY_RIGHTS_UNKNOWN, evidence: "선순위 근저당 확인 전", requiresHumanReview: true, createdAt: plus(-1) }),
      scope({ id: "JEONSE-SIG-0003", caseId: "JEONSE-0002", signalType: "GUARANTEE_STATUS_UNKNOWN", severity: "medium", title: JPO_SIGNAL_TYPES.GUARANTEE_STATUS_UNKNOWN, evidence: "보증보험 가입 여부 미확인", requiresHumanReview: true, createdAt: plus(-2) }),
      scope({ id: "JEONSE-SIG-0004", caseId: "JEONSE-0003", signalType: "ABOVE_NEIGHBORHOOD_MEDIAN", severity: "medium", title: JPO_SIGNAL_TYPES.ABOVE_NEIGHBORHOOD_MEDIAN, evidence: "보증금 4.6억 / 인근 전세 거래 기준가 3.8억 (121%)", requiresHumanReview: false, createdAt: plus(0) }),
      scope({ id: "JEONSE-SIG-0005", caseId: "JEONSE-0004", signalType: "AUCTION_OR_FORECLOSURE_DEADLINE", severity: "critical", title: JPO_SIGNAL_TYPES.AUCTION_OR_FORECLOSURE_DEADLINE, evidence: `경매 기일 D-9 (${plus(9)})`, requiresHumanReview: true, createdAt: plus(-3) }),
      scope({ id: "JEONSE-SIG-0006", caseId: "JEONSE-0004", signalType: "LOW_COMPARABLE_COUNT", severity: "low", title: JPO_SIGNAL_TYPES.LOW_COMPARABLE_COUNT, evidence: "실거래 API 미연결 — 표본 0건", requiresHumanReview: true, createdAt: plus(-3) }),
      scope({ id: "JEONSE-SIG-0007", caseId: "JEONSE-0005", signalType: "LANDLORD_RISK_MANUAL_REQUIRED", severity: "high", title: JPO_SIGNAL_TYPES.LANDLORD_RISK_MANUAL_REQUIRED, evidence: "보증금 반환 지연 — 임대인/보증사고 이력 외부기관 확인 필요", requiresHumanReview: true, createdAt: plus(-5) }),
      scope({ id: "JEONSE-SIG-0008", caseId: "JEONSE-0006", signalType: "CONTRACT_DATE_URGENT", severity: "medium", title: JPO_SIGNAL_TYPES.CONTRACT_DATE_URGENT, evidence: "계약 예정 D-10", requiresHumanReview: false, createdAt: plus(0) }),
      scope({ id: "JEONSE-SIG-0009", caseId: "JEONSE-0001", signalType: "ILLEGAL_BUILDING_MANUAL_REQUIRED", severity: "medium", title: JPO_SIGNAL_TYPES.ILLEGAL_BUILDING_MANUAL_REQUIRED, evidence: "다세대 — 건축물대장/위반건축물 수동 확인 필요", requiresHumanReview: true, createdAt: plus(-1) }),
    ],
    jeonse_registry_checks: [
      scope({ id: "JEONSE-REG-0001", caseId: "JEONSE-0001", checkType: "선순위 근저당 확인", status: "unknown", evidenceSummary: "등기부 열람 결과 요약 대기(원문 저장 금지)", manualRequired: true, dueAt: plus(2) }),
      scope({ id: "JEONSE-REG-0002", caseId: "JEONSE-0004", checkType: "압류/가압류 확인", status: "unknown", evidenceSummary: "경매 개시 결정 — 권리분석 수동 확인 필요", manualRequired: true, dueAt: plus(1) }),
      scope({ id: "JEONSE-REG-0003", caseId: "JEONSE-0001", checkType: "건축물대장/위반건축물", status: "unknown", evidenceSummary: "위반건축물 여부 확인 필요", manualRequired: true, dueAt: plus(3) }),
      scope({ id: "JEONSE-REG-0004", caseId: "JEONSE-0003", checkType: "선순위 근저당 확인", status: "verified", evidenceSummary: "선순위 없음(요약)", manualRequired: false, dueAt: plus(0) }),
    ],
    jeonse_guarantee_checks: [
      scope({ id: "JEONSE-HUG-0001", caseId: "JEONSE-0002", provider: "HUG", status: "unknown", evidenceSummary: "가입요건 항목 확인 필요 — 가입 가능 여부 확정 금지", manualRequired: true, checkedAt: "" }),
      scope({ id: "JEONSE-HUG-0002", caseId: "JEONSE-0005", provider: "HUG", status: "none", evidenceSummary: "미가입 — 피해지원 프로그램 안내 후보 검토", manualRequired: true, checkedAt: plus(-4) }),
      scope({ id: "JEONSE-HUG-0003", caseId: "JEONSE-0003", provider: "SGI", status: "enrolled", evidenceSummary: "가입 확인(요약)", manualRequired: false, checkedAt: plus(-1) }),
    ],
    jeonse_support_referrals: [
      scope({ id: "JEONSE-REF-0001", caseId: "JEONSE-0005", referralType: "legal", targetAgency: "법률구조 상담(안내 후보)", status: "linked", notes: "임대인 반환 지연 관련 상담 연계", createdAt: plus(-4) }),
      scope({ id: "JEONSE-REF-0002", caseId: "JEONSE-0005", referralType: "financeHousing", targetAgency: "금융·주거지원 프로그램(안내 후보)", status: "pending", notes: "최신 기준 담당자 확인 필요", createdAt: plus(-2) }),
      scope({ id: "JEONSE-REF-0003", caseId: "JEONSE-0005", referralType: "care", targetAgency: "심리상담 센터(안내 후보)", status: "pending", notes: "", createdAt: plus(-2) }),
      scope({ id: "JEONSE-REF-0004", caseId: "JEONSE-0005", referralType: "victimApplication", targetAgency: "전세사기피해자 지원관리시스템(참고)", status: "open", notes: "결정 신청 준비 보조 — 신청 대행 아님", createdAt: plus(-1) }),
      scope({ id: "JEONSE-REF-0005", caseId: "JEONSE-0004", referralType: "victimApplication", targetAgency: "전세사기피해자 지원관리시스템(참고)", status: "open", notes: "경매 병행 — 요건 확인 필요", createdAt: plus(0) }),
    ],
    approvals: [
      scope({ id: "APR-JPO-0001", caseId: "JEONSE-0006", approvalType: "고객 안내문 발송 승인", status: "pending", requestedById: "jpo-comms", approverId: "USR-JPO-AUD-01", requestedAt: plus(0) }),
      scope({ id: "APR-JPO-0002", caseId: "JEONSE-0005", approvalType: "피해자 신청 검토 승인", status: "pending", requestedById: "USR-JPO-SUP-02", approverId: "USR-JPO-AUD-01", requestedAt: plus(-1) }),
      scope({ id: "APR-JPO-0003", caseId: "JEONSE-0001", approvalType: "위험등급 변경 승인", status: "approved", requestedById: "USR-JPO-RISK-01", approverId: "USR-JPO-AUD-01", requestedAt: plus(-1) }),
    ],
    jeonse_evidence: [
      scope({ id: "EVD-0001", caseId: "JEONSE-0001", kind: "price", title: "인근 거래 기준가 대비 보증금 91%", detail: "국토부 실거래(저장 기준) — 시세 비교 기록 참조", refId: "JEONSE-SNAP-0001", source: "국토부 연립다세대 매매/전월세", createdAt: plus(0) }),
      scope({ id: "EVD-0002", caseId: "JEONSE-0001", kind: "registry", title: "등기부 선순위 확인 필요 항목", detail: "선순위 근저당·압류·신탁 여부 수동 확인 전", refId: null, source: "등기부 체크리스트(수동)", createdAt: plus(0) }),
      scope({ id: "EVD-0003", caseId: "JEONSE-0002", kind: "guarantee", title: "HUG 보증 확인 필요 항목", detail: "가입 가능 여부는 확정하지 않음 — 확인 필요 항목만 기록", refId: null, source: "HUG 수동 확인", createdAt: plus(-1) }),
      scope({ id: "EVD-0004", caseId: "JEONSE-0004", kind: "dataSource", title: "실거래 API 확인 필요 — 대체 기준 사용", detail: "커넥터 중단으로 대체 기준 사용, 위험도 하향 금지", refId: "CON-0004", source: "데이터 연계 상태", createdAt: plus(0) }),
      scope({ id: "EVD-0005", caseId: "JEONSE-0003", kind: "comparable", title: "유사 전월세 거래 표본 확인", detail: "인근 거래 기준가 산출 표본 — 시세 비교 기록 참조", refId: "JEONSE-SNAP-0003", source: "국토부 아파트 전월세", createdAt: plus(-1) }),
      scope({ id: "EVD-0006", caseId: "JEONSE-0005", kind: "referral", title: "법률지원 연계 근거", detail: "보증금 반환 지연 — 임대인/보증사고 이력 외부기관 확인 필요", refId: null, source: "피해지원 연계", createdAt: plus(-1) }),
    ],
    jeonse_audit_logs: [
      scope({ id: "AUD-EVAL-0001", caseId: "JEONSE-0002", actorId: "jpo-evaluator", action: "EVALUATOR_CHECKED", targetType: "case", targetId: "JEONSE-0002", riskLevel: "medium", reviewRequired: true, note: "보증 확인 필요 — 담당자 확인 필요", createdAt: plus(0) }),
      scope({ id: "AUD-JPO-0001", caseId: "JEONSE-0006", actorId: "USR-JPO-RISK-01", action: "CASE_CREATED", targetType: "jeonse_case", targetId: "JEONSE-0006", riskLevel: "medium", reviewRequired: false, createdAt: plus(0) }),
      scope({ id: "AUD-JPO-0002", caseId: "JEONSE-0003", actorId: "jpo-price", action: "DATA_FETCHED", targetType: "price_snapshot", targetId: "JEONSE-SNAP-0003", riskLevel: "low", reviewRequired: false, createdAt: plus(0) }),
      scope({ id: "AUD-JPO-0003", caseId: "JEONSE-0001", actorId: "jpo-price", action: "RISK_UPDATED", targetType: "risk_signal", targetId: "JEONSE-SIG-0001", riskLevel: "high", reviewRequired: true, createdAt: plus(-1) }),
      scope({ id: "AUD-JPO-0004", caseId: "JEONSE-0004", actorId: "jpo-auction", action: "HUMAN_REVIEW_REQUIRED", targetType: "jeonse_case", targetId: "JEONSE-0004", riskLevel: "critical", reviewRequired: true, createdAt: plus(-3) }),
      scope({ id: "AUD-JPO-0005", caseId: "JEONSE-0004", actorId: "jpo-dataquality", action: "DATA_FETCH_FAILED", targetType: "price_snapshot", targetId: "JEONSE-SNAP-0004", riskLevel: "medium", reviewRequired: true, createdAt: plus(-3) }),
      scope({ id: "AUD-JPO-0006", caseId: "JEONSE-0005", actorId: "USR-JPO-SUP-02", action: "SUPPORT_REFERRAL_LINKED", targetType: "referral", targetId: "JEONSE-REF-0001", riskLevel: "medium", reviewRequired: true, createdAt: plus(-4) }),
      scope({ id: "AUD-JPO-0007", caseId: "JEONSE-0006", actorId: "jpo-comms", action: "TENANT_SUMMARY_DRAFTED", targetType: "approval", targetId: "APR-JPO-0001", riskLevel: "medium", reviewRequired: true, createdAt: plus(0) }),
      scope({ id: "AUD-JPO-0008", caseId: "JEONSE-0002", actorId: "jpo-guarantee", action: "GUARANTEE_CHECK_OPENED", targetType: "guarantee_check", targetId: "JEONSE-HUG-0001", riskLevel: "medium", reviewRequired: true, createdAt: plus(-2) }),
    ],
    ai_analysis_requests: [
      scope({ id: "AIR-JPO-0001", caseId: "JEONSE-0003", requestType: "유사 전월세 비교 분석", status: "running", requestedById: "USR-JPO-RISK-02", createdAt: plus(0) }),
      scope({ id: "AIR-JPO-0002", caseId: "JEONSE-0001", requestType: "전세가율 신호 재계산", status: "queued", requestedById: "USR-JPO-RISK-01", createdAt: plus(0) }),
    ],
    ai_recommendations: [
      scope({ id: "REC-JPO-0001", kind: "consultSummary", caseId: "JEONSE-0006", agentId: "jpo-comms", title: "계약 전 긴급 점검 상담 요약(승인 대기)", status: "pendingApproval", confidence: "medium", createdAt: plus(0) }),
      scope({ id: "REC-JPO-0002", kind: "consultSummary", caseId: "JEONSE-0005", agentId: "jpo-comms", title: "반환 지연 상담 요약 — 지원기관 안내 후보 포함", status: "proposed", confidence: "high", createdAt: plus(-2) }),
      scope({ id: "REC-JPO-0003", kind: "riskNote", caseId: "JEONSE-0001", agentId: "jpo-price", title: "전세가율 재검토 체크리스트", status: "active", confidence: "high", createdAt: plus(-1) }),
    ],
    harness_agents: [],
    jeonse_agent_runs: [
      scope({ id: "JEONSE-RUN-0001", agentId: "jpo-price", caseId: "JEONSE-0001", inputSummary: "화곡동 다세대 시세 보강", outputSummary: "전세가율 91% — 위험 신호 검토 필요", status: "needsReview", riskLevel: "high", requiresHumanReview: true, createdAt: plus(-1) }),
      scope({ id: "JEONSE-RUN-0002", agentId: "jpo-auction", caseId: "JEONSE-0004", inputSummary: "경매 기일 감시", outputSummary: "D-9 임박 — 사람 에스컬레이션", status: "needsReview", riskLevel: "critical", requiresHumanReview: true, createdAt: plus(-3) }),
      scope({ id: "JEONSE-RUN-0003", agentId: "jpo-comms", caseId: "JEONSE-0006", inputSummary: "상담 요약·안내 초안", outputSummary: "발송 승인 대기 등록", status: "pendingApproval", riskLevel: "medium", requiresHumanReview: true, createdAt: plus(0) }),
      scope({ id: "JEONSE-RUN-0004", agentId: "jpo-dataquality", caseId: "JEONSE-0004", inputSummary: "sourceMode 점검", outputSummary: "fallback — 데이터 부족으로 담당자 확인 필요", status: "completed", riskLevel: "medium", requiresHumanReview: true, createdAt: plus(-3) }),
    ],
    agent_handoffs: [
      scope({ id: "HND-JPO-0001", fromAgentId: "jpo-intake", toAgentId: "jpo-price", caseId: "JEONSE-0001", reason: "시세 데이터 보강", status: "open", createdAt: plus(-1) }),
      scope({ id: "HND-JPO-0002", fromAgentId: "jpo-auction", toAgentId: "jpo-supervisor", caseId: "JEONSE-0004", reason: "경·공매 임박 — 사람 검토 필수", status: "escalated", createdAt: plus(-3) }),
      scope({ id: "HND-JPO-0003", fromAgentId: "jpo-comms", toAgentId: "jpo-supervisor", caseId: "JEONSE-0006", reason: "안내문 발송 승인 추적", status: "open", createdAt: plus(0) }),
    ],
    external_connectors: [
      scope({ id: "CON-JPO-0001", name: JPO_DATASET_LABELS.seoulRent, category: "seoul", status: "active", lastSyncAt: plus(0), health: "healthy", externalRef: "data.seoul.go.kr", sourceMode: "snapshot" }),
      scope({ id: "CON-JPO-0002", name: JPO_DATASET_LABELS.aptTrade, category: "molit", status: "active", lastSyncAt: plus(0), health: "healthy", externalRef: "data.go.kr", sourceMode: "snapshot" }),
      scope({ id: "CON-JPO-0003", name: JPO_DATASET_LABELS.rhTrade, category: "molit", status: "active", lastSyncAt: plus(-1), health: "degraded", externalRef: "data.go.kr", sourceMode: "snapshot" }),
      scope({ id: "CON-JPO-0004", name: JPO_DATASET_LABELS.shRent, category: "molit", status: "error", lastSyncAt: plus(-3), health: "down", externalRef: "data.go.kr", sourceMode: "fallback" }),
      scope({ id: "CON-JPO-0005", name: "HUG 보증사고/지원 확인(수동)", category: "hug", status: "manualRequired", lastSyncAt: "", health: "manualRequired", externalRef: "khug.or.kr", sourceMode: "manualRequired" }),
      scope({ id: "CON-JPO-0006", name: "등기부 열람(수동)", category: "registry", status: "manualRequired", lastSyncAt: "", health: "manualRequired", externalRef: "iros.go.kr", sourceMode: "manualRequired" }),
    ],
    role_assignments: users.map((user, index) => scope({
      id: `ROL-JPO-${String(index + 1).padStart(4, "0")}`,
      userId: user.id,
      role: user.role,
      permissionScope: user.team,
      status: index % 4 === 0 ? "needsReview" : "active",
      reviewRequired: index % 4 === 0,
    })),
    inspection_schedules: [
      scope({ id: "INS-JPO-0001", inspectionType: "개인정보·마스킹 정기점검", status: "upcoming", dueAt: plus(4), ownerId: "USR-JPO-AUD-01" }),
      scope({ id: "INS-JPO-0002", inspectionType: "실거래 커넥터 상태 점검", status: "overdue", dueAt: plus(-2), ownerId: "USR-JPO-RISK-02" }),
      scope({ id: "INS-JPO-0003", inspectionType: "경·공매 기한 감시 점검", status: "upcoming", dueAt: plus(3), ownerId: "USR-JPO-SUP-01" }),
    ],
  };
}

let jpoDbCache = null;

function jpoLoadDb() {
  if (jpoDbCache) return jpoDbCache;
  try {
    const raw = window.localStorage.getItem(JPO_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 3) {
        jpoDbCache = parsed;
        jpoSyncHarnessAgents(jpoDbCache);
        jpoSaveDb();
        return jpoDbCache;
      }
    }
  } catch (error) { /* 손상 시 재시드 */ }
  jpoDbCache = jpoSeedData();
  jpoSyncHarnessAgents(jpoDbCache);
  jpoSaveDb();
  return jpoDbCache;
}

function jpoSaveDb() {
  try { window.localStorage.setItem(JPO_DB_KEY, JSON.stringify(jpoDbCache)); } catch (error) { /* 메모리 유지 */ }
}

function jpoResetDb() {
  jpoDbCache = jpoSeedData();
  jpoSyncHarnessAgents(jpoDbCache);
  jpoSaveDb();
}

function jpoSyncHarnessAgents(db) {
  if (typeof jeonseFraudProtectionHarness === "undefined") return;
  db.harness_agents = jeonseFraudProtectionHarness.agents.map((agent) => ({
    id: agent.id,
    roleKey: JPO_ROLE_KEY,
    workspaceId: JPO_WORKSPACE_ID,
    name: agent.displayName || agent.name,
    domain: agent.domain,
    status: agent.status,
    description: agent.description,
  }));
}

function jpoTable(table, roleKey) {
  if (!roleKey) throw new Error("role scope is required");
  const db = jpoLoadDb();
  const rows = db[table] || [];
  if (table === "role_workspaces") return rows.slice();
  if (table === "users") return rows.filter((row) => !row.roleKeys || row.roleKeys.includes(roleKey));
  return rows.filter((row) => row.roleKey === roleKey);
}

function jpoInsert(table, row) {
  const db = jpoLoadDb();
  db[table] = db[table] || [];
  db[table].unshift(row);
  jpoSaveDb();
  return row;
}

function jpoNextId(prefix, table) {
  const db = jpoLoadDb();
  const count = (db[table] || []).filter((row) => String(row.id || "").startsWith(prefix)).length + 1;
  return `${prefix}-${String(count).padStart(4, "0")}`;
}

/* Repository interface — 운영 DB 전환 시 이 5개 진입점만 교체.
   계약: table(name, roleKey)은 scope 필수(미지정 시 예외), insert는 roleKey/workspaceId 채워진 row만. */
const jpoRepository = {
  table: jpoTable,
  insert: jpoInsert,
  nextId: jpoNextId,
  reset: jpoResetDb,
  snapshot: jpoLoadDb,
};
