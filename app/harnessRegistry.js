/* Harness Registry — 각 하네스를 표준 manifest로 등록한다.
   이 파일은 두 하네스의 구성요소를 "참조"만 하며, business 로직을 서로 공유시키지 않는다.
   main/default/safety harness alias는 존재하지 않는다 — 하네스는 여기 등록된 것이 전부다. */

registerHarness({
  id: "jeonse-protection",
  kind: "role",
  scopeKey: "roleKey",
  scopeValue: JPO_ROLE_KEY,
  displayName: JPO_DISPLAY_NAME,
  routeBase: JPO_ROUTE_BASE,
  sidebarConfig: jpoNavigation,
  countService: getJeonseProtectionSidebarCounts,
  searchService: searchJeonseProtectionRecords,
  caseCreationFlow: { view: "cases-new", wizardFormId: "jpo-new-case-form", create: createJeonseProtectionCase },
  agents: jeonseProtectionAgents,
  skills: jeonseProtectionSkills,
  commands: jeonseProtectionCommands,
  hooks: jeonseProtectionHooks,
  rules: jeonseProtectionRules,
  guardrails: jeonseFraudProtectionHarness.policy,
  verification: {
    enforceHooks: true,
    requiredHooks: ["beforeCaseCreate", "beforeAgentRun", "beforeCustomerMessage"],
    requiredAgents: 11,
    requiredCommands: 7,
    scopeProbe() {
      try { jpoTable("jeonse_cases"); return "scope 미지정 조회가 허용됨"; }
      catch (error) { return String(error.message).includes("role scope is required") ? null : `예외 계약 불일치: ${error.message}`; }
    },
    piiScan() {
      const raw = window.localStorage.getItem(JPO_DB_KEY) || "";
      return harnessGuardCheckPII(raw);
    },
    forbiddenResurface() {
      const issues = [];
      if (typeof jeonseProtectionDashboardConfig !== "undefined") issues.push("label-only jeonse-protection-dashboard 재유입");
      if (typeof consumerProtectionDashboardPage !== "undefined") issues.push("삭제된 소비자보호 역할 재유입");
      if (typeof complianceDashboardPage !== "undefined") issues.push("삭제된 준법감시 역할 재유입");
      if (document.querySelector('[data-affiliate="광주은행"]')) issues.push("광주은행 레일 재유입");
      return issues.length ? issues.join(" / ") : null;
    },
  },
});

registerHarness({
  id: "jb-woori-capital",
  kind: "affiliate",
  scopeKey: "affiliateId",
  scopeValue: JBWC_AFFILIATE_ID,
  displayName: "JB우리캐피탈",
  routeBase: "/jb-woori-capital",
  sidebarConfig: jbwcNavigation,
  countService: getJbWooriCapitalSidebarCounts,
  searchService: searchJbWooriCapitalRecords,
  caseCreationFlow: { view: "cases-new", wizardFormId: "jbwc-new-case-form", create: createJbWooriCapitalOpsCase },
  agents: jbWooriCapitalAgents,
  skills: jbWooriCapitalSkills,
  commands: [],
  hooks: {},
  rules: { id: "jbWooriCapitalPolicy", ruleStatements: jbWooriCapitalOpsHarness.policy },
  guardrails: jbWooriCapitalOpsHarness.policy,
  verification: {
    enforceHooks: false, // hook 연결은 다음 단계 TODO — manifest 구조만 우선 통일
    requiredHooks: [],
    requiredAgents: 13,
    requiredCommands: 0,
    scopeProbe() {
      try { jbwcTable("ops_cases"); return "scope 미지정 조회가 허용됨"; }
      catch (error) { return String(error.message).includes("affiliateId scope is required") ? null : `예외 계약 불일치: ${error.message}`; }
    },
    piiScan() {
      const raw = window.localStorage.getItem(JBWC_DB_KEY) || "";
      return harnessGuardCheckPII(raw);
    },
    forbiddenResurface() {
      return document.querySelector('[data-affiliate="광주은행"]') ? "광주은행 레일 재유입" : null;
    },
  },
});

registerHarness({
  id: "corporate-credit",
  kind: "role",
  scopeKey: "roleKey",
  scopeValue: CCL_ROLE_KEY,
  displayName: CCL_DISPLAY_NAME,
  routeBase: CCL_ROUTE_BASE,
  sidebarConfig: cclNavigation,
  countService: getCorporateCreditSidebarCounts,
  searchService: searchCorporateCreditRecords,
  caseCreationFlow: { view: "cases-new", wizardFormId: "ccl-new-case-form", create: createCorporateCreditCase },
  agents: cclConsoleAgents,
  skills: cclConsoleSkills,
  commands: [],
  hooks: cclConsoleHooks,
  rules: cclConsoleRules,
  guardrails: cclConsoleHarness.policy,
  verification: {
    enforceHooks: true,
    requiredHooks: ["beforeCaseCreate", "beforeAgentRun", "beforeCustomerMessage"],
    requiredAgents: 8,
    requiredCommands: 0,
    scopeProbe() {
      try { cclTable("ccl_cases"); return "scope 미지정 조회가 허용됨"; }
      catch (error) { return String(error.message).includes("role scope is required") ? null : `예외 계약 불일치: ${error.message}`; }
    },
    piiScan() {
      const raw = window.localStorage.getItem(CCL_DB_KEY) || "";
      return harnessGuardCheckPII(raw);
    },
    forbiddenResurface() {
      // label-only 대시보드가 라우팅에 다시 연결되면 실패시킨다
      return window.location.hash === "#corporate-credit-dashboard" ? "label-only corporate-credit-dashboard 재유입" : null;
    },
  },
});

registerHarness({
  id: "fds-response",
  kind: "role",
  scopeKey: "roleKey",
  scopeValue: FDR_ROLE_KEY,
  displayName: FDR_DISPLAY_NAME,
  routeBase: FDR_ROUTE_BASE,
  sidebarConfig: fdrNavigation,
  countService: getFdsResponseSidebarCounts,
  searchService: searchFdsResponseRecords,
  caseCreationFlow: { view: "cases-new", wizardFormId: "fdr-new-case-form", create: createFdsResponseCase },
  agents: fdrConsoleAgents,
  skills: fdrConsoleSkills,
  commands: [],
  hooks: fdrConsoleHooks,
  rules: fdrConsoleRules,
  guardrails: fdrConsoleHarness.policy,
  verification: {
    enforceHooks: true,
    requiredHooks: ["beforeCaseCreate", "beforeAgentRun", "beforeCustomerMessage"],
    requiredAgents: 8,
    requiredCommands: 0,
    scopeProbe() {
      try { fdrTable("fdr_cases"); return "scope 미지정 조회가 허용됨"; }
      catch (error) { return String(error.message).includes("role scope is required") ? null : `예외 계약 불일치: ${error.message}`; }
    },
    piiScan() {
      const raw = window.localStorage.getItem(FDR_DB_KEY) || "";
      return harnessGuardCheckPII(raw);
    },
    forbiddenResurface() {
      return window.location.hash === "#fds-dashboard" ? "label-only fds-dashboard 재유입" : null;
    },
  },
});
