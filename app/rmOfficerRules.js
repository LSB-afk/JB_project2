/* RM 하네스 guardrail/hook rules — 금지 조항·단정 표현 패턴·hook handler.
   실행 지점 가드: onRoleEnter/beforeCaseCreate/beforeAgentRun/beforeCustomerMessage/
   afterApprovalDecision/onAuditWrite. 위반은 차단 또는 안전 강등 + 감사 기록. */

const rmOfficerRules = {
  id: "rmOfficerPolicy",
  requiredBlockedActions: [
    "실제 대출 승인/거절 금지",
    "실제 금리/한도 산정 금지",
    "실제 정책자금 대상 확정 금지",
    "high/critical 자동 종결 금지",
  ],
  forbiddenAssertions: [
    { label: "대출 승인/거절 확정", re: /(승인\s*확정|대출\s*승인됨|대출\s*불가\s*확정|거절\s*확정)/ },
    { label: "금리·한도 산정", re: /(금리\s*[0-9.]+\s*%|한도\s*[0-9,]+\s*(만원|억|원)|신용등급\s*[A-Z0-9+-]+)/ },
    { label: "정책자금 대상 확정", re: /(정책자금\s*대상\s*확정|지원\s*대상\s*확정|선정\s*확정)/ },
    { label: "상환유예 승인 확정", re: /(상환유예\s*승인됨|상환유예\s*확정|조건변경\s*승인됨)/ },
  ],
  ruleStatements: rmOfficerHarness.policy,
};

function rmoPayloadText(payload) {
  try { return JSON.stringify(payload || {}); } catch (error) { return String(payload || ""); }
}

const rmOfficerHooks = {
  onRoleEnter: [
    () => null,
  ],
  beforeCaseCreate: [
    (payload) => harnessGuardCheckScope({ roleKey: payload.roleKey || RMO_ROLE_KEY }, "roleKey", RMO_ROLE_KEY),
    (payload) => harnessGuardCheckPII(rmoPayloadText(payload)),
  ],
  beforeAgentRun: [
    (payload) => harnessGuardCheckScope({ roleKey: payload.roleKey || RMO_ROLE_KEY }, "roleKey", RMO_ROLE_KEY),
    (payload) => harnessGuardCheckPII(rmoPayloadText(payload)),
    (payload) => harnessGuardCheckAutoClose(payload.riskLevel, payload.status),
  ],
  beforeCustomerMessage: [
    (payload) => harnessGuardCheckApprovalRequired(payload),
    (payload) => harnessGuardCheckPII(payload && payload.text || ""),
    (payload) => harnessGuardCheckAssertions(payload && payload.text || "", rmOfficerRules.forbiddenAssertions),
  ],
  afterApprovalDecision: [
    (payload) => (payload && payload.decidedBy ? null : "승인/반려 결정에 담당자(decidedBy) 표기 누락"),
  ],
  onAuditWrite: [
    (payload) => harnessGuardCheckScope(payload && payload.audit || {}, "roleKey", RMO_ROLE_KEY),
  ],
};

function rmoEvaluateAgentOutput(payload) {
  const text = rmoPayloadText(payload);
  const issues = [
    harnessGuardCheckPII(text),
    harnessGuardCheckAssertions(text, rmOfficerRules.forbiddenAssertions),
    harnessGuardCheckAutoClose(payload && payload.riskLevel, payload && payload.status),
  ].filter(Boolean);
  return { ok: issues.length === 0, issues, requiresHumanReview: issues.length > 0 || ["high", "critical"].includes(payload && payload.riskLevel) };
}
