/* RM demo intake service.
   커닝 페이퍼형 입력을 실제 RM DB 흐름에 넣어
   입력 수신 -> 트리거 감지 -> 케이스 생성 -> 에이전트 서브 케이스 배정을 보여준다. */

const RMO_DEMO_AI_INPUT = {
  source: "모바일 상담 메모 + 거래 이상징후 샘플",
  raw: "고령 고객이 보수업체 직원을 사칭한 연락을 받고 원격앱 설치와 즉시 송금을 요청받았다고 상담. 평소 대비 큰 금액의 이체 예약과 콜백 거절 메모가 함께 감지됨.",
  caseType: "fraudResponse",
  customerAlias: "정**",
  customerAge: 74,
  region: "전남 나주시",
  bank: "전북은행",
  theme: "AI 인풋 기반 고령 고객 보이스피싱 대응",
  triggerLabels: [
    "고령 고객",
    "원격앱 설치 요청",
    "보수업체 사칭 가능성",
    "평소 대비 큰 금액 이체 예약",
    "콜백 거절 메모",
  ],
  goal: "상담 메모와 거래 이상신호를 근거로 송금 보류 필요성, 고객 확인 질문, 담당자 콜백 태스크를 분리해 즉시 실행 가능한 서브 케이스로 배정한다.",
};

function rmoDemoCaseNo() {
  const count = rmoTable("rm_officer_cases", RMO_ROLE_KEY)
    .filter((row) => String(row.caseNo || "").startsWith("JBG-AI-")).length + 1;
  return `JBG-AI-${String(count).padStart(3, "0")}`;
}

function rmoDemoInputStages(caseRow, assignments) {
  const branchCount = assignments.filter((a) => a.kind !== "report").length;
  const report = assignments.find((a) => a.kind === "report");
  return [
    { key: "input", label: "AI 인풋 수신", detail: RMO_DEMO_AI_INPUT.source, status: "done" },
    { key: "trigger", label: "트리거 감지", detail: RMO_DEMO_AI_INPUT.triggerLabels.join(" · "), status: "done" },
    { key: "case", label: "케이스 생성", detail: `${caseRow.caseNo} · ${caseRow.theme}`, status: "done" },
    { key: "split", label: "서브 케이스 분해", detail: `${branchCount}개 분석 노드 + ${report ? "통합 보고서 노드" : "보고서 노드 대기"}`, status: "done" },
    { key: "ready", label: "실행 큐 대기", detail: "Enter로 첫 서브 에이전트를 승인·실행할 수 있습니다.", status: "ready" },
  ];
}

function rmoWriteDemoEvidence(caseRow, assignments, now) {
  const assignmentSummary = assignments
    .map((a) => `${rmoAgentDisplayName(a.agentId)}(${a.kind === "report" ? "통합 보고서" : "분석"})`)
    .join(" -> ");
  const evidenceRows = [
    {
      evidenceType: "demoInput",
      title: "AI 인풋 원문(마스킹)",
      summary: RMO_DEMO_AI_INPUT.raw,
      sourceMode: "sample",
      reviewRequired: true,
    },
    {
      evidenceType: "trigger",
      title: "트리거 감지 결과",
      summary: RMO_DEMO_AI_INPUT.triggerLabels.join(" · "),
      sourceMode: "sample",
      reviewRequired: true,
    },
    {
      evidenceType: "orchestration",
      title: "에이전트 서브 케이스 배정 결과",
      summary: assignmentSummary,
      sourceMode: "internal",
      reviewRequired: true,
    },
  ];
  evidenceRows.forEach((row) => {
    rmoInsert("rm_officer_evidence_items", rmoScopedRow({
      id: rmoNextId("RMO-EVD", "rm_officer_evidence_items"),
      caseId: caseRow.id,
      createdAt: now,
      ...row,
    }));
  });
}

function rmoWriteDemoAudit(caseRow, assignments, now) {
  const branchIds = assignments.filter((a) => a.kind !== "report").map((a) => a.id).join(", ");
  [
    ["DEMO_AI_INPUT_RECEIVED", "demo-input", RMO_DEMO_AI_INPUT.source],
    ["DEMO_TRIGGER_EXTRACTED", "trigger", RMO_DEMO_AI_INPUT.triggerLabels.join(" / ")],
    ["DEMO_SUBCASE_ASSIGNED", "rm_officer_agent_assignment", branchIds],
  ].forEach(([action, targetType, note]) => {
    rmoWriteAudit({
      id: rmoNextId("RMO-AUD", "rm_officer_audit_logs"),
      caseId: caseRow.id,
      actorId: "rmo-triage",
      action,
      targetType,
      targetId: caseRow.id,
      riskLevel: caseRow.riskLevel,
      reviewRequired: true,
      note,
      createdAt: now,
    });
  });
}

function createRmOfficerDemoAiInputCase() {
  const now = rmoNow();
  const created = createRmOfficerCase({
    caseNo: rmoDemoCaseNo(),
    customerAlias: RMO_DEMO_AI_INPUT.customerAlias,
    customerAge: RMO_DEMO_AI_INPUT.customerAge,
    bank: RMO_DEMO_AI_INPUT.bank,
    region: RMO_DEMO_AI_INPUT.region,
    caseType: RMO_DEMO_AI_INPUT.caseType,
    theme: RMO_DEMO_AI_INPUT.theme,
    title: RMO_DEMO_AI_INPUT.theme,
    situation: RMO_DEMO_AI_INPUT.raw,
    goal: RMO_DEMO_AI_INPUT.goal,
    riskLevel: "high",
    requestedAmountBand: "-",
    assignedRmId: "USR-RMO-01",
    receivedAt: now,
    dueAt: now,
    uploadedFileName: "demo-ai-intake.json",
    uploadedFileSummary: "상담 메모, 거래 이상징후, 콜백 기록을 마스킹한 데모 인풋",
  });
  if (!created || created.blocked || !created.case) return created;
  const caseRow = created.case;
  rmoUpdate("rm_officer_cases", caseRow.id, {
    customerAge: RMO_DEMO_AI_INPUT.customerAge,
    goal: RMO_DEMO_AI_INPUT.goal,
    demoInput: true,
    demoInputSource: RMO_DEMO_AI_INPUT.source,
    demoInputRaw: RMO_DEMO_AI_INPUT.raw,
    demoTriggers: RMO_DEMO_AI_INPUT.triggerLabels,
    updatedAt: now,
  });
  const updatedCase = rmoTable("rm_officer_cases", RMO_ROLE_KEY).find((row) => row.id === caseRow.id) || caseRow;
  const assignments = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY)
    .filter((a) => a.caseId === updatedCase.id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  rmoWriteDemoEvidence(updatedCase, assignments, now);
  rmoWriteDemoAudit(updatedCase, assignments, now);
  return {
    ...created,
    case: updatedCase,
    assignments,
    demoInput: RMO_DEMO_AI_INPUT,
    stages: rmoDemoInputStages(updatedCase, assignments),
  };
}
