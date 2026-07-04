/* Harness Verification — ECC의 Smoke Test/AgentShield 관점을 앱 내부 검증기로 구현.
   각 검증기는 { name, ok, issues[] }를 반환하고, runHarnessSelfTest가 하네스 단위로 집계한다.
   e2e와 /jeonse-run-smoke-test 명령이 이 검증기를 직접 호출한다. */

function verifyHarnessIntegrity(manifest) {
  const issues = [];
  HARNESS_MANIFEST_REQUIRED_KEYS.forEach((key) => {
    if (manifest[key] === undefined || manifest[key] === null) issues.push(`manifest.${key} 누락`);
  });
  if (typeof manifest.countService !== "function") issues.push("countService가 함수가 아님");
  if (typeof manifest.searchService !== "function") issues.push("searchService가 함수가 아님");
  if (!manifest.caseCreationFlow || typeof manifest.caseCreationFlow.create !== "function") issues.push("caseCreationFlow.create 누락 — generic form 재사용 의심");
  if (!String(manifest.routeBase || "").startsWith("/")) issues.push("routeBase 누락");
  if (!Array.isArray(manifest.sidebarConfig) || !manifest.sidebarConfig.length) issues.push("전용 sidebar config 아님");
  if (!Array.isArray(manifest.skills) || !manifest.skills.length) issues.push("skills 미정의");
  return { name: `${manifest.id}: manifest 무결성`, ok: issues.length === 0, issues };
}

function verifyRoleHarnessScope(manifest) {
  const issues = [];
  const probe = manifest.verification && manifest.verification.scopeProbe && manifest.verification.scopeProbe();
  if (probe) issues.push(probe);
  try {
    const counts = manifest.countService();
    if (!counts || typeof counts !== "object") issues.push("count service 반환값 이상");
  } catch (error) {
    issues.push(`count service 실행 실패: ${error.message}`);
  }
  return { name: `${manifest.id}: scope 강제`, ok: issues.length === 0, issues };
}

function verifyNoForbiddenRoleResurface(manifest) {
  const issues = [];
  const check = manifest.verification && manifest.verification.forbiddenResurface && manifest.verification.forbiddenResurface();
  if (check) issues.push(check);
  return { name: `${manifest.id}: 금지 alias/역할 재유입 없음`, ok: issues.length === 0, issues };
}

function verifyNoPIILeakage(manifest) {
  const issues = [];
  const dbScan = manifest.verification && manifest.verification.piiScan && manifest.verification.piiScan();
  if (dbScan) issues.push(`저장소: ${dbScan}`);
  const domScan = harnessGuardCheckPII(document.body ? document.body.innerText : "");
  if (domScan) issues.push(`화면: ${domScan}`);
  return { name: `${manifest.id}: PII 누출 없음`, ok: issues.length === 0, issues };
}

function verifyAgentRegistryCompleteness(manifest) {
  const issues = [];
  const required = (manifest.verification && manifest.verification.requiredAgents) || 0;
  if ((manifest.agents || []).length < required) issues.push(`agent ${manifest.agents.length}/${required}개`);
  const requiredFields = ["id", "agentKey", "displayName", "responsibilities", "allowedActions", "blockedActions", "dbReads", "dbWrites", "handoffRules", "guardrails", "metrics"];
  (manifest.agents || []).forEach((agent) => {
    requiredFields.forEach((field) => {
      if (agent[field] === undefined) issues.push(`${agent.id}.${field} 누락`);
    });
  });
  const mustBlock = (manifest.rules && manifest.rules.requiredBlockedActions) || [];
  (manifest.agents || []).forEach((agent) => {
    mustBlock.forEach((action) => {
      if (!(agent.blockedActions || []).includes(action)) issues.push(`${agent.id} blockedActions에 "${action}" 누락`);
    });
  });
  return { name: `${manifest.id}: agent registry 완결성`, ok: issues.length === 0, issues };
}

function verifyHookCoverage(manifest) {
  const issues = [];
  const verification = manifest.verification || {};
  if (verification.enforceHooks) {
    (verification.requiredHooks || []).forEach((hookName) => {
      const handlers = manifest.hooks && manifest.hooks[hookName];
      if (!Array.isArray(handlers) || !handlers.length) issues.push(`hook ${hookName} 미연결`);
    });
    const commands = manifest.commands || [];
    if (commands.length < (verification.requiredCommands || 0)) issues.push(`command ${commands.length}/${verification.requiredCommands}개`);
  }
  return { name: `${manifest.id}: hook/command 커버리지`, ok: issues.length === 0, issues };
}

function runHarnessSelfTest(harnessId) {
  const targets = harnessId ? [getHarness(harnessId)].filter(Boolean) : listHarnesses();
  const results = [];
  targets.forEach((manifest) => {
    results.push(
      verifyHarnessIntegrity(manifest),
      verifyRoleHarnessScope(manifest),
      verifyNoForbiddenRoleResurface(manifest),
      verifyNoPIILeakage(manifest),
      verifyAgentRegistryCompleteness(manifest),
      verifyHookCoverage(manifest),
    );
  });
  const summary = {
    pass: results.every((result) => result.ok),
    results,
    at: new Date().toISOString(),
  };
  window.__lastHarnessSelfTest = summary;
  return summary;
}
