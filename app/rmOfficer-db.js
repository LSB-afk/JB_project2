/* RM 역할 하네스 — 전용 mock DB/repository.
   scope(roleKey) 강제: scope 미지정 조회 시 예외를 던진다.
   실제 고객 주민/전화/계좌 원문은 저장하지 않는다(가상 인물명·익명 Ref만).
   seed: RM 콘솔 Figma 3케이스 + 히어로(전주 카페) 승격 + 완료 데모 케이스 + 타 scope 격리 seed. */

const RMO_DB_KEY = "rmo-ops-db-v1";

function rmoSeedData() {
  const today = new Date();
  const iso = (date) => date.toISOString().slice(0, 10);
  const plus = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return iso(d); };
  const now = iso(today);
  const scope = (row) => ({ roleKey: RMO_ROLE_KEY, workspaceId: RMO_WORKSPACE_ID, ...row });

  const users = [
    ["USR-RMO-01", "RM 담당 김OO", "rm", "지역RM팀"],
    ["USR-RMO-02", "RM 담당 이OO", "rm", "여신관리팀"],
    ["USR-RMO-03", "RM 담당 박OO", "rm", "리테일RM팀"],
    ["USR-RMO-04", "정책금융 담당 최OO", "policy", "정책금융팀"],
    ["USR-RMO-APR-01", "승인권자 한OO", "approver", "승인권자"],
  ].map(([id, name, role, team]) => ({ id, name, role, team, status: "active", roleKeys: [RMO_ROLE_KEY] }));

  /* [조건부 정합차] 페르소나 필드(이름·지역·은행)를 한 곳에 모아 한 줄로 교체 가능하게 유지한다.
     Case JBG-206은 Figma 표기(강하준·광주 북구·전북은행)를 따른다. 볼트 canon
     (조동준·광주 광산구·광주은행)으로 팀 확정 시 아래 rmoPersonas 한 줄만 교체하면 된다.
     verify_static needle에는 페르소나 이름을 넣지 않는다(제목·버튼·에이전트명 등 안정 라벨만). */
  const rmoPersonas = {
    "JBG-204": { customerAlias: "문서희", region: "전남 완도군", bank: "광주은행" },
    "JBG-206": { customerAlias: "강하준", region: "광주 북구", bank: "전북은행" },
    "JBG-207": { customerAlias: "임세빈", region: "전북 전주시", bank: "전북은행" },
    "JBG-208": { customerAlias: "한도영", region: "전북 전주시", bank: "전북은행" },
    "JBG-198": { customerAlias: "오세라", region: "전북 군산시", bank: "전북은행" },
    "JBG-202": { customerAlias: "배주안", region: "전남 여수시", bank: "광주은행" },
  };

  /* 핵심 케이스 정의 (Figma 3 + 히어로 + 완료 데모 + 진행중 데모) — 페르소나는 rmoPersonas에서 병합 */
  const caseDefs = [
    { caseNo: "JBG-204", caseType: "disasterRisk", theme: "양식장 재해위험 대응",
      situation: "고수온 예보와 태풍 접근으로 전복 폐사 위험이 커지며 사료비·운전자금 부담이 동시에 올라온 완도 양식장 케이스.",
      stage: "todo", status: "intake", riskLevel: "high", requestedAmountBand: "1억~3억", dueAt: plus(1), assignedRmId: "USR-RMO-01" },
    { caseNo: "JBG-206", caseType: "repaymentCare", theme: "육아휴직 복귀기 상환부담 관리",
      situation: "육아휴직 복귀 직후 급여가 정상화되기 전 카드론과 직장인 대출 상환일이 겹친 광주 직장인 케이스.",
      stage: "todo", status: "intake", riskLevel: "medium", requestedAmountBand: "3천만원 이하", dueAt: plus(3), assignedRmId: "USR-RMO-02" },
    { caseNo: "JBG-207", caseType: "dailyFinance", theme: "생활비 공백 대응",
      situation: "국가장학금 입금 전 생활비 공백이 생긴 전북 대학생이 소액 대출과 아르바이트 급여 사이에서 흔들리는 케이스.",
      stage: "todo", status: "intake", riskLevel: "medium", requestedAmountBand: "5백만원 이하", dueAt: plus(4), assignedRmId: "USR-RMO-03" },
    { caseNo: "JBG-208", caseType: "policyStartup", theme: "전주 중앙로 카페 여신 상담",
      situation: "전주 중앙로에서 카페를 운영하는 소상공인이 재료비 인상과 초기 시설투자 상환으로 정책자금·협약대출 안내를 요청한 히어로 케이스.",
      stage: "doing", status: "analyzing", riskLevel: "medium", requestedAmountBand: "5천만원~1억", dueAt: plus(2), assignedRmId: "USR-RMO-04", running: "rmo-policy-finance" },
    { caseNo: "JBG-198", caseType: "repaymentCare", theme: "자영업 상환일 집중 관리",
      situation: "성수기 매출 변동으로 상환일이 특정 월에 몰린 군산 자영업자의 상환일 분산 검토가 끝난 완료 데모 케이스.",
      stage: "done", status: "completed", riskLevel: "medium", requestedAmountBand: "3천만원~5천만원", dueAt: plus(-1), assignedRmId: "USR-RMO-02", completed: true },
    { caseNo: "JBG-202", caseType: "disasterRisk", theme: "수산 가공장 재해 대응",
      situation: "풍랑 경보로 원재료 입고가 지연되며 운전자금 상환일이 임박한 여수 수산 가공장 케이스로 담당자 검토 대기 중.",
      stage: "doing", status: "humanReview", riskLevel: "high", requestedAmountBand: "5천만원~1억", dueAt: plus(2), assignedRmId: "USR-RMO-01" },
  ];

  const rm_officer_cases = caseDefs.map((def, index) => {
    const persona = rmoPersonas[def.caseNo] || {};
    const priority = computeRmOfficerPriority(def);
    return scope({
      id: `RMO-CASE-${String(index + 1).padStart(4, "0")}`,
      caseNo: def.caseNo,
      customerRefId: `RMO-CUST-${String(index + 1).padStart(4, "0")}`,
      customerAlias: persona.customerAlias,
      bank: persona.bank,
      region: persona.region,
      caseType: def.caseType,
      theme: def.theme,
      title: def.theme,
      situation: def.situation,
      stage: def.stage,
      status: def.status,
      riskLevel: def.riskLevel,
      priority: priority.priority,
      priorityScore: priority.priorityScore,
      priorityReason: priority.priorityReason,
      prioritySources: priority.prioritySources,
      requestedAmountBand: def.requestedAmountBand,
      assignedRmId: def.assignedRmId,
      assignedTeam: RMO_CASE_TYPES[def.caseType].team,
      dueAt: def.dueAt,
      requiresHumanReview: priority.requiresHumanReview,
      escalationRequired: priority.escalationRequired,
      agentPlan: rmOfficerAgentPlans[def.caseType],
      createdAt: plus(-index),
      updatedAt: now,
      tags: [RMO_CASE_TYPES[def.caseType].label, persona.bank],
    });
  });

  /* 타 scope 격리 검증 seed — 조회 시 노출되면 안 됨 */
  rm_officer_cases.push({ roleKey: "other-role", workspaceId: "other", id: "RMO-OTHER-0001", caseNo: "RMO-격리검증", customerAlias: "타역할", theme: "타 역할 데이터", stage: "todo", status: "intake", riskLevel: "critical" });

  const caseRows = rm_officer_cases.filter((row) => row.roleKey === RMO_ROLE_KEY);
  const caseByNo = (no) => caseRows.find((c) => c.caseNo === no);

  /* 에이전트 배정 큐(승인 큐) — 각 케이스의 agentPlan을 카드로 */
  const rm_officer_agent_assignments = [];
  let asgSeq = 1;
  caseRows.forEach((c) => {
    const def = caseDefs.find((d) => d.caseNo === c.caseNo) || {};
    const plan = c.agentPlan || [];
    plan.forEach((agentId, order) => {
      const agent = rmOfficerAgents.find((a) => a.id === agentId) || rmOfficerAgents[0];
      const tpl = rmoDeliverableTemplate(agentId);
      let status = "pendingApproval";
      let progress = 0;
      if (c.status === "completed") status = "completed";
      else if (def.running === agentId) { status = "running"; progress = 0; }
      else if (c.status === "humanReview" && order === 0) status = "completed";
      rm_officer_agent_assignments.push(scope({
        id: `RMO-ASG-${String(asgSeq++).padStart(4, "0")}`,
        caseId: c.id,
        agentId,
        order,
        status,
        expectedOutput: agent.deliverableFile,
        estimatedMinutes: agent.estimatedMinutes,
        reason: agent.description,
        expectedValue: tpl.expectedValue,
        dataChips: (tpl.sources || []).map((s) => s.label),
        progress,
        createdAt: c.createdAt,
      }));
    });
  });

  /* 완료 데모 케이스 + 진행중 케이스의 산출물(개별 md + 통합본) */
  const rm_officer_deliverables = [];
  let delSeq = 1;
  function pushDeliverables(caseRow, agentIds, withIntegrated) {
    const built = agentIds.map((agentId) => {
      const d = rmoBuildAgentDeliverable(caseRow, agentId);
      d.id = `RMO-DLV-${String(delSeq++).padStart(4, "0")}`;
      rm_officer_deliverables.push(scope(d));
      return d;
    });
    if (withIntegrated) {
      const integrated = rmoBuildIntegratedDeliverable(caseRow, built);
      integrated.id = `RMO-DLV-${String(delSeq++).padStart(4, "0")}`;
      rm_officer_deliverables.push(scope(integrated));
    }
  }
  const completedCase = caseByNo("JBG-198");
  if (completedCase) pushDeliverables(completedCase, completedCase.agentPlan, true);
  const humanReviewCase = caseByNo("JBG-202");
  if (humanReviewCase) pushDeliverables(humanReviewCase, [humanReviewCase.agentPlan[0]], false);

  const rm_officer_tasks = caseRows.slice(0, 5).map((c, index) => scope({
    id: `RMO-TASK-${String(index + 1).padStart(4, "0")}`,
    caseId: c.id,
    title: c.caseType === "disasterRisk" ? "재해 대응 상환유예 검토" : c.caseType === "policyStartup" ? "정책자금 안내 준비" : "상환일 조정 후보 검토",
    status: index % 4 === 0 ? "overdue" : "open",
    dueAt: c.dueAt,
    ownerId: c.assignedRmId,
  }));

  const rm_officer_consult_queue = [
    scope({ id: "RMO-CQ-0001", caseId: caseByNo("JBG-204").id, channel: "지점 방문", topic: "재해 운전자금 상담", status: "pending", requestedAt: now, ownerId: "USR-RMO-01" }),
    scope({ id: "RMO-CQ-0002", caseId: caseByNo("JBG-206").id, channel: "전화 상담", topic: "상환일 조정 상담", status: "pending", requestedAt: plus(-1), ownerId: "USR-RMO-02" }),
    scope({ id: "RMO-CQ-0003", caseId: caseByNo("JBG-208").id, channel: "지점 방문", topic: "정책자금 상담", status: "inProgress", requestedAt: plus(-1), ownerId: "USR-RMO-04" }),
    scope({ id: "RMO-CQ-0004", caseId: caseByNo("JBG-207").id, channel: "모바일", topic: "생활비 소액대출 상담", status: "pending", requestedAt: now, ownerId: "USR-RMO-03" }),
  ];

  const rm_officer_policy_checklists = [
    scope({ id: "RMO-POL-0001", caseId: caseByNo("JBG-208").id, program: "소상공인 정책자금", item: "매출 규모·업력 요건 확인", status: "open", reviewRequired: true, createdAt: now }),
    scope({ id: "RMO-POL-0002", caseId: caseByNo("JBG-208").id, program: "지역 협약대출", item: "이차보전 대상 여부 확인", status: "open", reviewRequired: true, createdAt: now }),
    scope({ id: "RMO-POL-0003", caseId: caseByNo("JBG-204").id, program: "재해 정책자금", item: "재해 피해 확인 서류 안내", status: "open", reviewRequired: true, createdAt: now }),
  ];

  const rm_officer_agent_runs = [];
  let runSeq = 1;
  function pushRun(agentId, caseRow, outputSummary, status, riskLevel) {
    rm_officer_agent_runs.push(scope({
      id: `RMO-RUN-${String(runSeq++).padStart(4, "0")}`,
      agentId,
      caseId: caseRow.id,
      inputSummary: `${caseRow.caseNo} ${RMO_CASE_TYPES[caseRow.caseType].label} 검토`,
      outputSummary,
      status,
      riskLevel: riskLevel || caseRow.riskLevel,
      requiresHumanReview: ["high", "critical"].includes(riskLevel || caseRow.riskLevel),
      runtime: "mock",
      model: "",
      runtimeStatus: "mock",
      validatedOutput: "",
      errorSummary: "",
      createdAt: plus(-(runSeq % 3)),
    }));
  }
  if (completedCase) completedCase.agentPlan.forEach((agentId) => pushRun(agentId, completedCase, "내부 업무 참고용 산출물 생성 · 통합본 연결", "completed", "medium"));
  if (humanReviewCase) pushRun(humanReviewCase.agentPlan[0], humanReviewCase, "재해 노출 요약 생성 · 담당자 검토 필요", "needsReview", "high");
  pushRun("rmo-triage", caseByNo("JBG-204"), "우선순위 근거 산정 · 급한 순 1위", "completed", "high");

  const rm_officer_agent_handoffs = [
    scope({ id: "RMO-HND-0001", fromAgentId: "rmo-triage", toAgentId: "rmo-marine-risk", caseId: caseByNo("JBG-204").id, reason: "재해 권역 매칭 필요", status: "open", createdAt: now }),
    scope({ id: "RMO-HND-0002", fromAgentId: "rmo-marine-risk", toAgentId: "rmo-compliance", caseId: caseByNo("JBG-202").id, reason: "high 위험 — 준법 검증 후 승인 라우팅", status: "escalated", createdAt: plus(-1) }),
    scope({ id: "RMO-HND-0003", fromAgentId: "rmo-comms", toAgentId: "rmo-approval-router", caseId: caseByNo("JBG-208").id, reason: "고객 안내문 발송 승인 필요", status: "open", createdAt: now }),
  ];

  const rm_officer_approvals = [
    scope({ id: "RMO-APR-0001", caseId: caseByNo("JBG-202").id, approvalType: "상환유예 검토 승인 요청", status: "pending", requestedById: "USR-RMO-01", approverId: "USR-RMO-APR-01", requestedAt: now }),
    scope({ id: "RMO-APR-0002", caseId: caseByNo("JBG-208").id, approvalType: "고객 안내문 발송 승인", status: "pending", requestedById: "USR-RMO-04", approverId: "USR-RMO-APR-01", requestedAt: now }),
    scope({ id: "RMO-APR-0003", caseId: caseByNo("JBG-198").id, approvalType: "상환일 조정 안내 승인", status: "approved", requestedById: "USR-RMO-02", approverId: "USR-RMO-APR-01", requestedAt: plus(-2), decidedAt: plus(-1), decidedBy: "USR-RMO-APR-01" }),
  ];

  const rm_officer_evidence_items = caseRows.slice(0, 5).map((c, index) => scope({
    id: `RMO-EVD-${String(index + 1).padStart(4, "0")}`,
    caseId: c.id,
    evidenceType: ["intake", "priority", "marine", "repayment", "policy"][index % 5],
    title: "운영 근거 요약",
    summary: "민감 원문 없는 담당자 입력/샘플 기준 근거",
    sourceMode: "sample",
    createdAt: c.createdAt,
    reviewRequired: index % 2 === 0,
  }));

  const rm_officer_audit_logs = caseRows.slice(0, 6).map((c, index) => scope({
    id: `RMO-AUD-${String(index + 1).padStart(4, "0")}`,
    caseId: c.id,
    actorId: index % 2 ? "rmo-triage" : c.assignedRmId,
    action: ["CASE_CREATED", "PRIORITY_SCORED", "AGENT_RUN_RECORDED", "DELIVERABLE_CREATED", "APPROVAL_ROUTED", "HUMAN_REVIEW_REQUIRED"][index % 6],
    targetType: "rm_officer_case",
    targetId: c.id,
    riskLevel: c.riskLevel,
    reviewRequired: ["high", "critical"].includes(c.riskLevel),
    createdAt: c.createdAt,
  }));

  const rm_officer_external_connectors = [
    scope({ id: "RMO-CON-0001", name: "기상특보·고수온 예보(공개)", category: "marine", status: "active", health: "healthy", dataMode: "sample", lastSyncAt: now }),
    scope({ id: "RMO-CON-0002", name: "상환일정·급여주기(샘플)", category: "repayment", status: "active", health: "healthy", dataMode: "sample", lastSyncAt: plus(-1) }),
    scope({ id: "RMO-CON-0003", name: "정책자금 요건 안내(공개)", category: "policy", status: "active", health: "healthy", dataMode: "sample", lastSyncAt: plus(-2) }),
    scope({ id: "RMO-CON-0004", name: "학사일정·장학금 구간(샘플)", category: "dailyFinance", status: "manualRequired", health: "degraded", dataMode: "manualRequired", lastSyncAt: "" }),
  ];

  const rm_officer_role_assignments = users.map((u, index) => scope({
    id: `RMO-ROLE-${String(index + 1).padStart(4, "0")}`,
    userId: u.id,
    role: u.role,
    permissionScope: u.team,
    status: index === 4 ? "needsReview" : "active",
    reviewRequired: index === 4,
  }));

  return {
    version: RMO_DB_VERSION,
    seededAt: new Date().toISOString(),
    role_workspaces: [{ id: RMO_WORKSPACE_ID, roleKey: RMO_ROLE_KEY, displayName: RMO_DISPLAY_NAME, harnessId: "rmOfficerHarness", status: "active" }],
    rm_officer_users: users,
    rm_officer_cases,
    rm_officer_agent_assignments,
    rm_officer_deliverables,
    rm_officer_tasks,
    rm_officer_consult_queue,
    rm_officer_policy_checklists,
    rm_officer_agent_runs,
    rm_officer_agent_handoffs,
    rm_officer_approvals,
    rm_officer_evidence_items,
    rm_officer_audit_logs,
    rm_officer_external_connectors,
    rm_officer_role_assignments,
  };
}

let rmoDbCache = null;

function rmoLoadDb() {
  if (rmoDbCache) return rmoDbCache;
  try {
    const raw = window.localStorage.getItem(RMO_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === RMO_DB_VERSION) {
        rmoDbCache = parsed;
        rmoSyncHarnessAgents(rmoDbCache);
        rmoSaveDb();
        return rmoDbCache;
      }
    }
  } catch (error) { /* re-seed */ }
  rmoDbCache = rmoSeedData();
  rmoSyncHarnessAgents(rmoDbCache);
  rmoSaveDb();
  return rmoDbCache;
}

function rmoSaveDb() {
  try { window.localStorage.setItem(RMO_DB_KEY, JSON.stringify(rmoDbCache)); } catch (error) { /* memory only */ }
}

function rmoResetDb() {
  rmoDbCache = rmoSeedData();
  rmoSyncHarnessAgents(rmoDbCache);
  rmoSaveDb();
}

function rmoSyncHarnessAgents(db) {
  db.rm_officer_harness_agents = rmOfficerHarness.agents.map((agent) => ({
    id: agent.id,
    roleKey: RMO_ROLE_KEY,
    workspaceId: RMO_WORKSPACE_ID,
    name: agent.displayName || agent.name,
    org: agent.org,
    domain: agent.domain,
    status: agent.status,
    description: agent.description,
  }));
}

function rmoTable(table, roleKey) {
  if (!roleKey) throw new Error("role scope is required");
  const db = rmoLoadDb();
  const rows = db[table] || [];
  if (table === "role_workspaces") return rows.slice();
  if (table === "rm_officer_users") return rows.filter((row) => !row.roleKeys || row.roleKeys.includes(roleKey));
  return rows.filter((row) => row.roleKey === roleKey);
}

function rmoScopedRow(row) {
  return { roleKey: RMO_ROLE_KEY, workspaceId: RMO_WORKSPACE_ID, ...row };
}

function rmoInsert(table, row) {
  const db = rmoLoadDb();
  db[table] = db[table] || [];
  db[table].unshift(row);
  rmoSaveDb();
  return row;
}

function rmoUpdate(table, id, patch) {
  const db = rmoLoadDb();
  const rows = db[table] || [];
  const row = rows.find((item) => item.id === id);
  if (row) Object.assign(row, patch);
  rmoSaveDb();
  return row;
}

function rmoNextId(prefix, table) {
  const db = rmoLoadDb();
  const count = (db[table] || []).filter((row) => String(row.id || "").startsWith(prefix)).length + 1;
  return `${prefix}-${String(count).padStart(4, "0")}`;
}

const rmoRepository = {
  table: rmoTable,
  insert: rmoInsert,
  update: rmoUpdate,
  nextId: rmoNextId,
  reset: rmoResetDb,
  snapshot: rmoLoadDb,
};
