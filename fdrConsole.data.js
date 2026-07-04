/* FDS/보이스피싱 담당자 콘솔 — data (scope 강제 mock repository + seed + services).
   실제 계좌/전화/식별정보 원문 없음 — 익명 CUST-FD-*와 신호 요약만 저장한다. */

const FDR_DB_KEY = "fdr-ops-db-v1";

function fdrSeedData() {
  const R = FDR_ROLE_KEY, W = FDR_WORKSPACE_ID;
  const today = new Date();
  const plus = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };
  const scope = (row) => ({ roleKey: R, workspaceId: W, ...row });

  const users = [
    ["USR-FDR-OPS-01", "FDS대응 문OO", "responder", "FDS대응팀"],
    ["USR-FDR-OPS-02", "FDS대응 정OO", "responder", "FDS대응팀"],
    ["USR-FDR-PHI-01", "피싱대응 한OO", "responder", "피싱대응팀"],
    ["USR-FDR-SUP-01", "FDS감독 유OO", "supervisor", "금융소비자보호팀"],
  ].map(([id, name, role, team]) => ({ id, name, role, team, status: "active", roleKeys: [R] }));

  const caseSpecs = [
    ["FDSC-0001", "elderRisk", "고령 고객 심야 고액 이체 경보", "CUST-FD-0001", "모바일 이체", "humanReview", "critical", true],
    ["FDSC-0002", "newDeviceBurst", "신규 기기 다회 이체 경보", "CUST-FD-0002", "모바일 이체", "analyzing", "high", true],
    ["FDSC-0003", "remoteApp", "원격제어 앱 설치 의심 경보", "CUST-FD-0003", "스마트뱅킹", "contacting", "high", true],
    ["FDSC-0004", "loanScam", "대출빙자 사기 의심 상담 신고", "CUST-FD-0004", "콜센터", "received", "medium", false],
    ["FDSC-0005", "highTransfer", "고액 이체 경보 — 오탐 확인", "CUST-FD-0005", "창구", "closedByHuman", "low", false],
    ["FDSC-0006", "dormantSpike", "휴면 후 고액 거래 경보", "CUST-FD-0006", "인터넷뱅킹", "decision", "medium", true],
  ];
  const fdr_cases = caseSpecs.map(([id, alertType, title, customerRefId, channel, status, riskLevel, requiresHumanReview], index) => scope({
    id, caseNo: id, alertType, title, customerRefId, channel,
    status, riskLevel, requiresHumanReview,
    elderFlag: alertType === "elderRisk",
    amountBand: index === 0 ? "3천만 이상" : index < 3 ? "1천만~3천만" : "1천만 미만",
    assignedTeam: (FDR_ALERT_TYPES[alertType] || {}).team || "FDS대응팀",
    assignedToId: users[index % 3].id,
    closedById: status === "closedByHuman" ? "USR-FDR-SUP-01" : null,
    dueAt: plus(index % 3), createdAt: plus(-index), updatedAt: plus(0), tags: [alertType],
  }));

  return {
    version: 1,
    seededAt: new Date().toISOString(),
    users,
    fdr_cases: fdr_cases.concat([
      { roleKey: "corporate-credit", workspaceId: "corporate-credit", id: "FDSC-OTHER-0001", caseNo: "FDSC-OTHER-0001", alertType: "highTransfer", title: "타 역할 스코프 격리 검증용", customerRefId: "CUST-FD-9999", channel: "-", status: "received", riskLevel: "critical", requiresHumanReview: true, elderFlag: false, amountBand: "-", assignedTeam: "-", assignedToId: users[0].id, closedById: null, dueAt: plus(0), createdAt: plus(0), updatedAt: plus(0), tags: ["exclude"] },
    ]),
    fdr_signals: [
      scope({ id: "FDR-SIG-0001", caseId: "FDSC-0001", signalType: "HIGH_AMOUNT_TRANSFER", title: FDR_SIGNAL_TYPES.HIGH_AMOUNT_TRANSFER, severity: "critical", evidence: "평소 이체 구간 대비 큰 폭 상회", status: "open", createdAt: plus(0) }),
      scope({ id: "FDR-SIG-0002", caseId: "FDSC-0001", signalType: "ELDERLY_CUSTOMER", title: FDR_SIGNAL_TYPES.ELDERLY_CUSTOMER, severity: "high", evidence: "고령·취약 고객 세그먼트 — 우선 보호", status: "open", createdAt: plus(0) }),
      scope({ id: "FDR-SIG-0003", caseId: "FDSC-0001", signalType: "UNUSUAL_HOUR", title: FDR_SIGNAL_TYPES.UNUSUAL_HOUR, severity: "medium", evidence: "심야 시간대 거래", status: "open", createdAt: plus(0) }),
      scope({ id: "FDR-SIG-0004", caseId: "FDSC-0002", signalType: "NEW_DEVICE_ACCESS", title: FDR_SIGNAL_TYPES.NEW_DEVICE_ACCESS, severity: "high", evidence: "미등록 기기 최초 접속 후 연속 이체", status: "open", createdAt: plus(-1) }),
      scope({ id: "FDR-SIG-0005", caseId: "FDSC-0002", signalType: "REPEATED_TRANSFERS", title: FDR_SIGNAL_TYPES.REPEATED_TRANSFERS, severity: "medium", evidence: "짧은 간격 반복 이체 패턴", status: "open", createdAt: plus(-1) }),
      scope({ id: "FDR-SIG-0006", caseId: "FDSC-0003", signalType: "REMOTE_APP_SUSPECT", title: FDR_SIGNAL_TYPES.REMOTE_APP_SUSPECT, severity: "high", evidence: "원격제어 앱 시그니처 유사 — 확인 필요", status: "open", createdAt: plus(-1) }),
      scope({ id: "FDR-SIG-0007", caseId: "FDSC-0003", signalType: "CALLBACK_REFUSED", title: FDR_SIGNAL_TYPES.CALLBACK_REFUSED, severity: "medium", evidence: "1차 콜백 미응답", status: "open", createdAt: plus(0) }),
      scope({ id: "FDR-SIG-0008", caseId: "FDSC-0004", signalType: "KNOWN_SCAM_PATTERN", title: FDR_SIGNAL_TYPES.KNOWN_SCAM_PATTERN, severity: "medium", evidence: "대출빙자 스크립트와 유사 — 확정 아님", status: "open", createdAt: plus(0) }),
      scope({ id: "FDR-SIG-0009", caseId: "FDSC-0006", signalType: "HIGH_AMOUNT_TRANSFER", title: FDR_SIGNAL_TYPES.HIGH_AMOUNT_TRANSFER, severity: "medium", evidence: "휴면 해제 직후 고액 거래", status: "open", createdAt: plus(0) }),
    ],
    fdr_block_reviews: [
      scope({ id: "FDR-BLK-0001", caseId: "FDSC-0003", recommendation: "임시 보류 권고", rationale: "원격제어 의심 + 콜백 미응답 — 고객 확인 전 보류 검토", status: "pending", decidedById: null, createdAt: plus(0) }),
      scope({ id: "FDR-BLK-0002", caseId: "FDSC-0006", recommendation: "추가 확인 후 결정", rationale: "휴면 후 고액 — 본인 확인 결과 대기", status: "pending", decidedById: null, createdAt: plus(0) }),
    ],
    fdr_rules: [
      scope({ id: "FDR-RUL-0001", name: "고액 이체 임계 룰", coverage: "이체 채널 전체", health: "healthy", note: "정상 동작", updatedAt: plus(-3) }),
      scope({ id: "FDR-RUL-0002", name: "신규 기기 연속 이체 룰", coverage: "모바일", health: "healthy", note: "정상 동작", updatedAt: plus(-2) }),
      scope({ id: "FDR-RUL-0003", name: "원격제어 앱 탐지 룰", coverage: "스마트뱅킹", health: "degraded", note: "시그니처 갱신 필요 — 담당자 확인", updatedAt: plus(-1) }),
      scope({ id: "FDR-RUL-0004", name: "고령 고객 보호 룰", coverage: "전 채널", health: "tuning", note: "임계값 튜닝 검토 중", updatedAt: plus(0) }),
    ],
    fdr_followups: [
      scope({ id: "FDR-FUP-0001", caseId: "FDSC-0005", title: "오탐 종결 사후 확인", note: "고객 안내·룰 피드백 기록", status: "open", dueAt: plus(1) }),
      scope({ id: "FDR-FUP-0002", caseId: "FDSC-0005", title: "탐지룰 피드백 반영 확인", note: "임계 구간 조정 제안 검토", status: "open", dueAt: plus(2) }),
    ],
    approvals: [
      scope({ id: "APR-FDR-0001", caseId: "FDSC-0001", approvalType: "고객 확인 스크립트 사용 승인", status: "pending", requestedById: "fdr-contact", approverId: "USR-FDR-SUP-01", requestedAt: plus(0) }),
      scope({ id: "APR-FDR-0002", caseId: "FDSC-0003", approvalType: "차단·보류 결정 요청", status: "pending", requestedById: "fdr-block", approverId: "USR-FDR-SUP-01", requestedAt: plus(0) }),
    ],
    fdr_audit_logs: [
      scope({ id: "AUD-FDR-0001", caseId: "FDSC-0001", actorId: "fdr-intake", action: "ALERT_RECEIVED", targetType: "fdr_case", targetId: "FDSC-0001", riskLevel: "critical", reviewRequired: true, createdAt: plus(0) }),
      scope({ id: "AUD-FDR-0002", caseId: "FDSC-0001", actorId: "fdr-elder", action: "ELDER_PRIORITY_FLAGGED", targetType: "signal", targetId: "FDR-SIG-0002", riskLevel: "high", reviewRequired: true, createdAt: plus(0) }),
      scope({ id: "AUD-FDR-0003", caseId: "FDSC-0003", actorId: "fdr-block", action: "HOLD_RECOMMENDED", targetType: "block_review", targetId: "FDR-BLK-0001", riskLevel: "high", reviewRequired: true, createdAt: plus(0) }),
      scope({ id: "AUD-FDR-0004", caseId: "FDSC-0005", actorId: "USR-FDR-SUP-01", action: "CASE_CLOSED_BY_HUMAN", targetType: "fdr_case", targetId: "FDSC-0005", riskLevel: "low", reviewRequired: false, createdAt: plus(-1) }),
      scope({ id: "AUD-FDR-0005", caseId: "FDSC-0004", actorId: "fdr-signal", action: "SIGNAL_SUMMARIZED", targetType: "signal", targetId: "FDR-SIG-0008", riskLevel: "medium", reviewRequired: false, createdAt: plus(0) }),
    ],
    ai_analysis_requests: [
      scope({ id: "AIR-FDR-0001", caseId: "FDSC-0002", requestType: "이체 패턴 요약", status: "running", requestedById: "USR-FDR-OPS-01", createdAt: plus(0) }),
      scope({ id: "AIR-FDR-0002", caseId: "FDSC-0006", requestType: "휴면 거래 신호 재확인", status: "queued", requestedById: "USR-FDR-OPS-02", createdAt: plus(0) }),
    ],
    ai_recommendations: [
      scope({ id: "REC-FDR-0001", kind: "contactScript", caseId: "FDSC-0001", agentId: "fdr-contact", title: "송금 전 확인 질문 스크립트(승인 대기)", status: "pendingApproval", confidence: "high", createdAt: plus(0) }),
      scope({ id: "REC-FDR-0002", kind: "contactScript", caseId: "FDSC-0003", agentId: "fdr-contact", title: "원격제어 앱 확인 콜백 스크립트", status: "proposed", confidence: "medium", createdAt: plus(0) }),
    ],
    harness_agents: [],
    fdr_agent_runs: [
      scope({ id: "FDR-RUN-0001", agentId: "fdr-signal", caseId: "FDSC-0001", inputSummary: "심야 고액 이체 신호 요약", outputSummary: "신호 3건 — 사람 검토 필수", status: "needsReview", riskLevel: "critical", requiresHumanReview: true, createdAt: plus(0) }),
      scope({ id: "FDR-RUN-0002", agentId: "fdr-contact", caseId: "FDSC-0001", inputSummary: "고객 확인 스크립트 초안", outputSummary: "스크립트 초안 — 발신 승인 대기", status: "pendingApproval", riskLevel: "high", requiresHumanReview: true, createdAt: plus(0) }),
      scope({ id: "FDR-RUN-0003", agentId: "fdr-pattern", caseId: "FDSC-0002", inputSummary: "거래 패턴 요약", outputSummary: "반복 이체 구간 요약 — 참고용", status: "completed", riskLevel: "medium", requiresHumanReview: false, createdAt: plus(-1) }),
    ],
    agent_handoffs: [
      scope({ id: "HND-FDR-0001", fromAgentId: "fdr-intake", toAgentId: "fdr-elder", caseId: "FDSC-0001", reason: "고령 고객 우선 보호", status: "escalated", createdAt: plus(0) }),
      scope({ id: "HND-FDR-0002", fromAgentId: "fdr-signal", toAgentId: "fdr-block", caseId: "FDSC-0003", reason: "차단·보류 검토", status: "open", createdAt: plus(0) }),
    ],
  };
}

let fdrDbCache = null;
function fdrLoadDb() {
  if (fdrDbCache) return fdrDbCache;
  try {
    const raw = window.localStorage.getItem(FDR_DB_KEY);
    if (raw) { const parsed = JSON.parse(raw); if (parsed && parsed.version === 1) { fdrDbCache = parsed; fdrSyncAgents(fdrDbCache); fdrSaveDb(); return fdrDbCache; } }
  } catch (error) { /* 재시드 */ }
  fdrDbCache = fdrSeedData(); fdrSyncAgents(fdrDbCache); fdrSaveDb();
  return fdrDbCache;
}
function fdrSaveDb() { try { window.localStorage.setItem(FDR_DB_KEY, JSON.stringify(fdrDbCache)); } catch (error) { /* 유지 */ } }
function fdrResetDb() { fdrDbCache = fdrSeedData(); fdrSyncAgents(fdrDbCache); fdrSaveDb(); }
function fdrSyncAgents(db) {
  db.harness_agents = fdrConsoleAgents.map((agent) => ({ id: agent.id, roleKey: FDR_ROLE_KEY, workspaceId: FDR_WORKSPACE_ID, name: agent.displayName, domain: agent.domain, status: agent.status, description: agent.description }));
}
function fdrTable(table, roleKey) {
  if (!roleKey) throw new Error("role scope is required");
  const db = fdrLoadDb();
  const rows = db[table] || [];
  if (table === "users") return rows.filter((row) => !row.roleKeys || row.roleKeys.includes(roleKey));
  return rows.filter((row) => row.roleKey === roleKey);
}
function fdrInsert(table, row) { const db = fdrLoadDb(); db[table] = db[table] || []; db[table].unshift(row); fdrSaveDb(); return row; }
function fdrNextId(prefix, table) {
  const db = fdrLoadDb();
  const count = (db[table] || []).filter((row) => String(row.id || "").startsWith(prefix)).length + 1;
  return `${prefix}-${String(count).padStart(4, "0")}`;
}
const fdrRepository = { table: fdrTable, insert: fdrInsert, nextId: fdrNextId, reset: fdrResetDb, snapshot: fdrLoadDb };

function fdrActiveCase(row) { return FDR_ACTIVE_STATUSES.includes(row.status); }

function getFdsResponseSidebarCounts() {
  const t = (name) => fdrTable(name, FDR_ROLE_KEY);
  const cases = t("fdr_cases");
  const active = cases.filter(fdrActiveCase);
  const signals = t("fdr_signals").filter((x) => x.status === "open");
  return {
    board: active.length,
    cases: cases.length,
    blockReview: t("fdr_block_reviews").filter((x) => x.status === "pending").length,
    escalations: t("agent_handoffs").filter((x) => x.status === "escalated").length
      + active.filter((x) => ["high", "critical"].includes(x.riskLevel)).length,
    anomalySignals: signals.length,
    elderGuard: active.filter((x) => x.elderFlag).length + signals.filter((x) => x.signalType === "ELDERLY_CUSTOMER").length,
    patternSummary: signals.filter((x) => ["REPEATED_TRANSFERS", "HIGH_AMOUNT_TRANSFER", "UNUSUAL_HOUR"].includes(x.signalType)).length,
    ruleStatus: t("fdr_rules").filter((x) => x.health !== "healthy").length,
    contactScripts: t("ai_recommendations").filter((x) => x.kind === "contactScript" && ["proposed", "pendingApproval"].includes(x.status)).length,
    paymentHoldGuide: active.filter((x) => ["remoteApp", "loanScam", "elderRisk"].includes(x.alertType)).length,
    followUp: t("fdr_followups").filter((x) => x.status === "open").length,
    aiAnalysis: t("ai_analysis_requests").filter((x) => ["queued", "running"].includes(x.status)).length,
    agentHarness: t("fdr_agent_runs").filter((x) => ["queued", "running", "needsReview", "pendingApproval"].includes(x.status)).length
      + t("harness_agents").filter((x) => ["needsReview", "escalated"].includes(x.status)).length,
    auditLogs: t("fdr_audit_logs").filter((x) => x.reviewRequired === true).length,
    approvals: t("approvals").filter((x) => x.status === "pending").length,
  };
}
function getFdsResponseSidebarCountsAsync() {
  return new Promise((resolve, reject) => setTimeout(() => { try { resolve(getFdsResponseSidebarCounts()); } catch (error) { reject(error); } }, 120));
}

function searchFdsResponseRecords(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q || (typeof jpoSearchBlockedReason === "function" && jpoSearchBlockedReason(q))) return [];
  const hit = (value) => String(value || "").toLowerCase().includes(q);
  const out = [];
  fdrTable("fdr_cases", FDR_ROLE_KEY).forEach((c) => {
    if (hit(c.caseNo) || hit(c.title) || hit(c.customerRefId) || hit(c.channel) || hit((FDR_ALERT_TYPES[c.alertType] || {}).label)) {
      out.push({ kind: "case", view: "cases", id: c.id, label: `${c.caseNo} · ${c.title}`, sub: `${(FDR_ALERT_TYPES[c.alertType] || {}).label || c.alertType} · ${FDR_STATUS_LABELS[c.status] || c.status}` });
    }
  });
  fdrTable("fdr_signals", FDR_ROLE_KEY).forEach((x) => {
    if (hit(x.title) || hit(x.signalType) || hit(x.id)) out.push({ kind: "signal", view: "anomaly-signals", id: x.id, label: `${x.id} · ${x.title}`, sub: `신호 · ${FDR_RISK_LABELS[x.severity] || x.severity}` });
  });
  return out.slice(0, 12);
}

function fdrRunHook(hookName, payload) {
  if (typeof harnessRunHooks !== "function") return { ok: true, violations: [] };
  return harnessRunHooks("fds-response", hookName, payload);
}
function fdrScoped(row) { return { roleKey: FDR_ROLE_KEY, workspaceId: FDR_WORKSPACE_ID, ...row }; }
function fdrWriteAudit(row) { const audit = fdrScoped(row); fdrRunHook("onAuditWrite", { audit }); return fdrInsert("fdr_audit_logs", audit); }

function createFdsResponseCase(form) {
  const now = new Date().toISOString().slice(0, 10);
  const guard = fdrRunHook("beforeCaseCreate", form);
  if (!guard.ok) {
    fdrWriteAudit({ id: fdrNextId("AUD-FDR", "fdr_audit_logs"), actorId: "USR-FDR-OPS-01", action: "FDR_HOOK_BLOCKED_CASE_CREATE", targetType: "hook", targetId: "beforeCaseCreate", riskLevel: "medium", reviewRequired: true, note: guard.violations.join(" / "), createdAt: now });
    return { blocked: true, violations: guard.violations };
  }
  const alert = FDR_ALERT_TYPES[form.alertType] || FDR_ALERT_TYPES.highTransfer;
  let riskLevel = form.riskLevel || "medium";
  if (alert.minRisk === "high" && ["low", "medium"].includes(riskLevel)) riskLevel = "high";
  const elderFlag = form.alertType === "elderRisk" || Boolean(form.elderFlag);
  if (elderFlag && riskLevel === "low") riskLevel = "medium";
  const requiresHumanReview = Boolean(alert.requiresHumanReview) || elderFlag || ["high", "critical"].includes(riskLevel);
  const id = fdrNextId("FDSC", "fdr_cases");
  const row = fdrScoped({
    id, caseNo: id, alertType: form.alertType, title: form.title || `${alert.label} 경보`,
    customerRefId: form.customerRefId || `CUST-FD-${Math.floor(1000 + Math.random() * 9000)}`,
    channel: form.channel || "모바일 이체", status: requiresHumanReview ? "humanReview" : "analyzing",
    riskLevel, requiresHumanReview, elderFlag,
    amountBand: form.amountBand || "확인 필요", assignedTeam: alert.team, assignedToId: "USR-FDR-OPS-01",
    closedById: null, dueAt: form.dueAt || now, createdAt: now, updatedAt: now, tags: [form.alertType],
  });
  fdrInsert("fdr_cases", row);
  fdrRunHook("afterCaseCreate", { caseRow: row });
  fdrInsert("fdr_signals", fdrScoped({ id: fdrNextId("FDR-SIG", "fdr_signals"), caseId: id, signalType: elderFlag ? "ELDERLY_CUSTOMER" : "HIGH_AMOUNT_TRANSFER", title: FDR_SIGNAL_TYPES[elderFlag ? "ELDERLY_CUSTOMER" : "HIGH_AMOUNT_TRANSFER"], severity: riskLevel, evidence: "접수 시 초기 신호 — 담당자 확인 필요", status: "open", createdAt: now }));
  fdrWriteAudit({ id: fdrNextId("AUD-FDR", "fdr_audit_logs"), caseId: id, actorId: row.assignedToId, action: "ALERT_RECEIVED", targetType: "fdr_case", targetId: id, riskLevel, reviewRequired: requiresHumanReview, createdAt: now });
  recordFdsResponseAgentRun({
    agentId: "fdr-intake", caseId: id,
    inputSummary: `${alert.label} · ${row.channel}`,
    outputSummary: `분류 완료 — ${FDR_STATUS_LABELS[row.status]}`,
    status: requiresHumanReview ? "needsReview" : "queued",
    riskLevel, requiresHumanReview,
    handoffs: [{ toAgentId: "fdr-signal", reason: "신호 요약" }]
      .concat(elderFlag ? [{ toAgentId: "fdr-elder", reason: "고령 고객 우선 보호" }] : [])
      .concat(requiresHumanReview ? [{ toAgentId: "fdr-supervisor", reason: "사람 검토 추적" }] : []),
  });
  if (requiresHumanReview) {
    fdrInsert("approvals", fdrScoped({ id: fdrNextId("APR-FDR", "approvals"), caseId: id, approvalType: "담당자 검토", status: "pending", requestedById: row.assignedToId, approverId: "USR-FDR-SUP-01", requestedAt: now }));
  }
  return { case: row };
}

function recordFdsResponseAgentRun(run) {
  const today = new Date().toISOString().slice(0, 10);
  const before = fdrRunHook("beforeAgentRun", { agentId: run.agentId, riskLevel: run.riskLevel || "low", status: run.status || "completed", inputSummary: run.inputSummary, decidedBy: run.decidedBy });
  if (!before.ok) run = { ...run, status: "needsReview" };
  const row = fdrScoped({
    id: fdrNextId("FDR-RUN", "fdr_agent_runs"), agentId: run.agentId, caseId: run.caseId || null,
    inputSummary: run.inputSummary, outputSummary: run.outputSummary,
    status: run.status || "completed", riskLevel: run.riskLevel || "low",
    requiresHumanReview: Boolean(run.requiresHumanReview), createdAt: today,
  });
  fdrInsert("fdr_agent_runs", row);
  fdrRunHook("afterAgentRun", { run: row });
  (run.handoffs || []).forEach((handoff) => {
    fdrInsert("agent_handoffs", fdrScoped({ id: fdrNextId("HND-FDR", "agent_handoffs"), fromAgentId: run.agentId, toAgentId: handoff.toAgentId, caseId: run.caseId || null, reason: handoff.reason, status: ["high", "critical"].includes(row.riskLevel) ? "escalated" : "open", createdAt: today }));
  });
  fdrWriteAudit({ id: fdrNextId("AUD-FDR", "fdr_audit_logs"), caseId: run.caseId || null, actorId: run.agentId, action: "FDR_AGENT_RUN", targetType: "agent_run", targetId: row.id, riskLevel: row.riskLevel, reviewRequired: ["needsReview", "pendingApproval"].includes(row.status), createdAt: today });
  return row;
}

function fdrDecideApproval(approvalId, decision, decidedBy) {
  const db = fdrRepository.snapshot();
  const approval = (db.approvals || []).find((row) => row.id === approvalId && row.roleKey === FDR_ROLE_KEY);
  if (!approval || approval.status !== "pending") return null;
  const actor = decidedBy || "USR-FDR-SUP-01";
  const guard = fdrRunHook("afterApprovalDecision", { approval, decidedBy: actor, decision });
  if (!guard.ok) return { blocked: true, violations: guard.violations };
  approval.status = decision === "reject" ? "rejected" : "approved";
  approval.decidedById = actor;
  approval.decidedAt = new Date().toISOString().slice(0, 10);
  fdrSaveDb();
  fdrWriteAudit({ id: fdrNextId("AUD-FDR", "fdr_audit_logs"), caseId: approval.caseId || null, actorId: actor, action: "FDR_APPROVAL_DECIDED", targetType: "approval", targetId: approval.id, riskLevel: "low", reviewRequired: false, createdAt: approval.decidedAt });
  return { approval };
}

function fdrCloseCaseByHuman(caseId, decidedBy) {
  if (!String(decidedBy || "").startsWith("USR-")) return { blocked: true, violations: ["종결은 사람 담당자만 가능"] };
  const db = fdrRepository.snapshot();
  const row = (db.fdr_cases || []).find((item) => item.id === caseId && item.roleKey === FDR_ROLE_KEY);
  if (!row) return null;
  row.status = "closedByHuman";
  row.closedById = decidedBy;
  row.updatedAt = new Date().toISOString().slice(0, 10);
  fdrSaveDb();
  fdrWriteAudit({ id: fdrNextId("AUD-FDR", "fdr_audit_logs"), caseId, actorId: decidedBy, action: "CASE_CLOSED_BY_HUMAN", targetType: "fdr_case", targetId: caseId, riskLevel: row.riskLevel, reviewRequired: false, createdAt: row.updatedAt });
  return { case: row };
}

const fdrSampleRequests = [
  { key: "signal-brief", text: "고령 고객 심야 이체 신호를 요약해줘", agentId: "fdr-signal", caseId: "FDSC-0001", riskLevel: "critical", human: true },
  { key: "elder-priority", text: "고령 고객 보호 체크리스트를 만들어줘", agentId: "fdr-elder", caseId: "FDSC-0001", riskLevel: "high", human: true },
  { key: "contact-script", text: "송금 전 고객 확인 스크립트 초안을 만들어줘", agentId: "fdr-contact", caseId: "FDSC-0001", riskLevel: "high", human: true, commsDraft: true },
  { key: "hold-recommend", text: "원격제어 의심 건 차단/보류를 검토해줘", agentId: "fdr-block", caseId: "FDSC-0003", riskLevel: "high", human: true, approval: "차단·보류 결정 요청" },
  { key: "report-guide", text: "지급정지 절차 안내 후보를 정리해줘", agentId: "fdr-report", caseId: "FDSC-0004", riskLevel: "medium", human: true },
];

function runFdsResponseSample(key) {
  const sample = fdrSampleRequests.find((item) => item.key === key);
  if (!sample) return null;
  if (sample.commsDraft) {
    const draftText = `[초안] ${sample.text} — 고객(익명 Ref) 확인용, 발신은 담당자 승인 후.`;
    const guard = fdrRunHook("beforeCustomerMessage", { draftText, customerFacing: true, approvalStatus: "pending" });
    if (!guard.ok) return { sample, blocked: true, violations: guard.violations };
  }
  const run = recordFdsResponseAgentRun({
    agentId: sample.agentId, caseId: sample.caseId, inputSummary: sample.text,
    outputSummary: `${(fdrConsoleAgents.find((a) => a.id === sample.agentId) || {}).displayName} · 내부 운영 참고용 · 담당자 검토 필요`,
    status: sample.commsDraft || sample.approval ? "pendingApproval" : "needsReview",
    riskLevel: sample.riskLevel, requiresHumanReview: sample.human,
    handoffs: sample.human ? [{ toAgentId: "fdr-supervisor", reason: "사람 검토 추적" }] : [],
  });
  if (sample.commsDraft || sample.approval) {
    fdrInsert("approvals", fdrScoped({ id: fdrNextId("APR-FDR", "approvals"), caseId: sample.caseId, approvalType: sample.approval || "고객 확인 스크립트 사용 승인", status: "pending", requestedById: sample.agentId, approverId: "USR-FDR-SUP-01", requestedAt: new Date().toISOString().slice(0, 10) }));
  }
  return { sample, run };
}
