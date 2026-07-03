/* 전세사기 보호 담당자 하네스 — Rules (정책) + Hook handlers.
   Rules = 하네스별 정책 파일. Hooks = 실행 지점에서 guardrail을 자동 검사하는 계층.
   보안은 후처리가 아니라 기본값: PII·scope 누락·자동 종결·단정 표현·승인 누락을 여기서 차단한다. */

/* 확정 단정 표현 패턴 — 소스에 금지 리터럴 자체를 남기지 않도록 \s* 분리형으로 작성 */
const JPO_FORBIDDEN_ASSERTIONS = [
  { label: "전세사기 여부 단정", re: /전세사기(입니다|로\s*확정|가\s*확실)/ },
  { label: "피해자 결정 단정", re: /피해자\s*결정[^\n]{0,8}(확정|됩니다|보장)/ },
  { label: "보증 가입 단정", re: /보증[^\n]{0,10}(가입|지원)\s*(가능|불가)\s*(확정|합니다)/ },
  { label: "법률 자문 단정", re: /법률적으로\s*(확실|보장|문제없)/ },
  { label: "신청 대행 표현", re: /(대신\s*신청|신청을?\s*대행)/ },
];

const jeonseProtectionRules = {
  id: "jeonseProtectionRules",
  harnessId: "jeonse-protection",
  /* 필수 rule 9종 — 화면·에이전트·훅·검증기가 공유하는 단일 정책 문장 */
  ruleStatements: [
    "전세사기 여부 확정 판단 금지",
    "피해자 결정 가능 여부 확정 금지",
    "보증 가능 여부 확정 금지",
    "법률 자문 확정 금지",
    "실제 신청 대행 금지",
    "실제 개인정보 원문 저장/출력 금지",
    "고객 대상 자동 발송 금지",
    "high/critical 자동 종결 금지",
    "모든 AI output은 내부 운영 참고용",
  ],
  forbiddenAssertions: JPO_FORBIDDEN_ASSERTIONS,
  requiredBlockedActions: JPO_COMMON_BLOCKED_ACTIONS,
  requiredNotices: ["내부 운영 참고용", "담당자 검토 필요", "최신 기준 담당자 확인 필요"],
};

/* ---------- Hook handlers ---------- */

function jpoHookScopeProbe() {
  try {
    jpoTable("jeonse_cases");
    return "jpoTable이 scope 없이 조회를 허용함 — repository 계약 위반";
  } catch (error) {
    return String(error.message || "").includes("role scope is required")
      ? null
      : `scope 예외 메시지 계약 불일치: ${error.message}`;
  }
}

const jeonseProtectionHooks = {
  onRoleEnter: [
    () => jpoHookScopeProbe(),
    () => (typeof getJeonseProtectionSidebarCounts === "function" ? null : "count service 미탑재"),
  ],
  beforeCaseCreate: [
    (payload) => harnessGuardCheckPII([payload.title, payload.description, payload.buildingName, payload.addressMasked, payload.customerRefId, payload.tags].filter(Boolean).join(" ")),
    (payload) => harnessGuardCheckAssertions([payload.title, payload.description, payload.buildingName, payload.addressMasked].filter(Boolean).join(" "), JPO_FORBIDDEN_ASSERTIONS),
  ],
  afterCaseCreate: [
    (payload) => harnessGuardCheckScope(payload.caseRow, "roleKey", JPO_ROLE_KEY),
    (payload) => harnessGuardCheckAutoClose(payload.caseRow && payload.caseRow.riskLevel, payload.caseRow && payload.caseRow.status),
  ],
  beforeAgentRun: [
    (payload) => harnessGuardCheckAutoClose(payload.riskLevel, payload.status),
    (payload) => harnessGuardCheckAssertions(payload.inputSummary, JPO_FORBIDDEN_ASSERTIONS),
  ],
  afterAgentRun: [
    (payload) => harnessGuardCheckScope(payload.run, "roleKey", JPO_ROLE_KEY),
    (payload) => harnessGuardCheckPII(`${payload.run && payload.run.inputSummary} ${payload.run && payload.run.outputSummary}`),
  ],
  beforeCustomerMessage: [
    (payload) => harnessGuardCheckPII(payload.draftText),
    (payload) => harnessGuardCheckAssertions(payload.draftText, JPO_FORBIDDEN_ASSERTIONS),
    (payload) => harnessGuardCheckApprovalRequired(payload),
  ],
  beforeExternalReferenceOpen: [
    (payload) => harnessGuardCheckPII(payload.serialized),
  ],
  afterApprovalDecision: [
    (payload) => harnessGuardCheckScope(payload.approval, "roleKey", JPO_ROLE_KEY),
    (payload) => (String(payload.decidedBy || "").startsWith("USR-") ? null : "승인 결정 주체가 사람 담당자가 아님"),
  ],
  onAuditWrite: [
    (payload) => harnessGuardCheckScope(payload.audit, "roleKey", JPO_ROLE_KEY),
  ],
};
