/* 기업여신 하네스 guardrail/hook rules. */

const corporateCreditRules = {
  id: "corporateCreditPolicy",
  forbiddenAssertions: [
    { label: "대출 승인 확정", re: /(승인\s*확정|대출\s*승인됨|승인\s*가능\s*확정)/ },
    { label: "대출 거절 확정", re: /(거절\s*확정|대출\s*불가\s*확정)/ },
    { label: "금리·한도 산정", re: /(금리\s*[0-9.]+%|한도\s*[0-9,]+(만원|억|원)|신용등급\s*[A-Z0-9+-]+)/ },
    { label: "신용평가 확정", re: /(신용평가\s*완료|신용등급\s*산출|부도율\s*확정)/ },
  ],
  ruleStatements: corporateCreditOfficerHarness.policy,
};

function ccrPayloadText(payload) {
  try { return JSON.stringify(payload || {}); } catch (error) { return String(payload || ""); }
}

const corporateCreditHooks = {
  beforeCaseCreate: [
    (payload) => harnessGuardCheckScope({ roleKey: payload.roleKey || CCR_ROLE_KEY }, "roleKey", CCR_ROLE_KEY),
    (payload) => harnessGuardCheckPII(ccrPayloadText(payload)),
  ],
  beforeAgentRun: [
    (payload) => harnessGuardCheckScope({ roleKey: payload.roleKey || CCR_ROLE_KEY }, "roleKey", CCR_ROLE_KEY),
    (payload) => harnessGuardCheckPII(ccrPayloadText(payload)),
    (payload) => harnessGuardCheckAutoClose(payload.riskLevel, payload.status),
  ],
  beforeMemoDraft: [
    (payload) => harnessGuardCheckPII(ccrPayloadText(payload)),
    (payload) => harnessGuardCheckAssertions(payload.outputSummary || payload.memo || "", corporateCreditRules.forbiddenAssertions),
  ],
  beforeCustomerMessage: [
    (payload) => harnessGuardCheckApprovalRequired(payload),
    (payload) => harnessGuardCheckAssertions(payload.text || "", corporateCreditRules.forbiddenAssertions),
  ],
  onAuditWrite: [
    (payload) => harnessGuardCheckScope(payload.audit || {}, "roleKey", CCR_ROLE_KEY),
  ],
};

function ccrEvaluateAgentOutput(payload) {
  const text = ccrPayloadText(payload);
  const issues = [
    harnessGuardCheckPII(text),
    harnessGuardCheckAssertions(text, corporateCreditRules.forbiddenAssertions),
    harnessGuardCheckAutoClose(payload && payload.riskLevel, payload && payload.status),
  ].filter(Boolean);
  return { ok: issues.length === 0, issues, requiresHumanReview: issues.length > 0 || ["high", "critical"].includes(payload && payload.riskLevel) };
}
