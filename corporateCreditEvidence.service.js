/* 기업여신 근거/evidence helper — 원문 민감정보 없이 요약·출처 상태만 저장한다. */

function ccrEvidenceLabel(type) {
  return {
    intake: "접수 근거",
    document: "서류 확인",
    financial: "재무자료 기준",
    collateral: "담보 확인",
    guarantee: "보증 확인",
    memo: "여신메모 근거",
    evaluator: "가드레일 검증",
    connector: "데이터 연결 기록",
  }[type] || type || "근거";
}

function ccrCreateEvidence(caseId, type, summary, sourceMode) {
  return ccrInsert("corporate_credit_evidence_items", ccrScopedRow({
    id: ccrNextId("CCR-EVD", "corporate_credit_evidence_items"),
    caseId,
    evidenceType: type,
    title: ccrEvidenceLabel(type),
    summary,
    sourceMode: sourceMode || "sample",
    createdAt: new Date().toISOString().slice(0, 10),
    reviewRequired: sourceMode !== "connected",
  }));
}
