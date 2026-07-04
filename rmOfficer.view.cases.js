/* RM 하네스 — menu/list views + 고객 정보 상세 패널. */

function rmoCaseListMarkup(rows) {
  const sorted = rmoSortByUrgency(rows);
  return rmoTableView(["케이스", "유형/은행", "담당/SLA", "상태"], sorted, (c) => `
    <li class="jbwc-row" data-rmo-open-case="${escapeHtml(c.id)}">
      <span class="jbwc-row-id">${escapeHtml(c.caseNo)}<br><span class="jbwc-row-note">${escapeHtml(c.customerAlias)} · ${escapeHtml(c.region)}</span></span>
      <span>${escapeHtml(rmoCaseTypeLabel(c.caseType))}<br><span class="jbwc-row-note">${escapeHtml(c.bank)} · ${escapeHtml(c.requestedAmountBand || "-")}</span></span>
      <span>${escapeHtml(rmoUserName(c.assignedRmId))}<br><span class="jbwc-row-note">SLA ${escapeHtml(c.dueAt || "-")}</span></span>
      <span>${rmoStagePill(rmoStageOf(c))} ${rmoRiskPill(c.riskLevel)}</span>
    </li>`);
}

function rmoCaseById(caseId) {
  return rmoTable("rm_officer_cases", RMO_ROLE_KEY).find((c) => c.id === caseId) || null;
}

function rmoCaseDisplay(row) {
  return row ? `${row.caseNo} · ${row.theme}` : "-";
}

function rmoSelectedRow(kind, rows) {
  const current = rmoState.contextItem && rmoState.contextItem.kind === kind ? rmoState.contextItem.id : "";
  return rows.find((row) => row.id === current) || rows[0] || null;
}

function rmoSelectableRowAttrs(kind, id, selectedId, extraClass = "") {
  const selected = id && id === selectedId;
  return `class="jbwc-row rmo-selectable-row ${selected ? "is-selected" : ""} ${escapeHtml(extraClass)}" data-rmo-select-context="${escapeHtml(kind)}:${escapeHtml(id || "")}"`;
}

function rmoSelectableCardAttrs(kind, id, selectedId, extraClass = "") {
  const selected = id && id === selectedId;
  return `class="rmo-selectable-card ${selected ? "is-selected" : ""} ${escapeHtml(extraClass)}" data-rmo-select-context="${escapeHtml(kind)}:${escapeHtml(id || "")}"`;
}

function rmoInfoRows(rows) {
  return `<div class="rmo-selection-rows">${rows.map(([label, value]) => `
    <div class="property-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "-")}</strong></div>`).join("")}</div>`;
}

function rmoInfoList(title, rows) {
  return `<section class="rmo-mini-list">
    <h4>${escapeHtml(title)}</h4>
    <ul>${rows.map(([head, sub]) => `<li><strong>${escapeHtml(head || "-")}</strong><span>${escapeHtml(sub || "-")}</span></li>`).join("") || "<li><span>표시할 항목 없음</span></li>"}</ul>
  </section>`;
}

function rmoSelectionPanel(title, subtitle, rows, chips = [], sections = [], actions = "") {
  const chipHtml = chips.filter(Boolean).map((chip) => `<span class="rmo-data-chip">${escapeHtml(chip)}</span>`).join("");
  return `<aside class="rmo-selection-panel">
    <header class="rmo-selection-head">
      <span>현재 선택 요약</span>
      <h3>${escapeHtml(title || "-")}</h3>
      ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
    </header>
    ${rmoInfoRows(rows)}
    ${chipHtml ? `<div class="rmo-context-chiprow">${chipHtml}</div>` : ""}
    ${sections.join("")}
    ${actions ? `<div class="settings-button-row rmo-selection-actions">${actions}</div>` : ""}
    <p class="jbwc-guard">AI는 검토 후보와 문서 초안만 만들며 실제 승인·거절·금리·한도·신용평가·정책자금 대상 확정은 담당자가 수행합니다.</p>
  </aside>`;
}

function rmoWorkspaceSplit(title, listHtml, detailHtml, bottomHtml = "", className = "") {
  return rmoPanel(title, `<div class="rmo-workspace-split ${escapeHtml(className)}">
    <div class="rmo-list-pane">${listHtml}</div>
    ${detailHtml}
  </div>${bottomHtml}`);
}

function rmoSupportCards(cards) {
  return `<section class="rmo-support-grid">${cards.map((card) => `<article class="rmo-support-card rmo-support-${escapeHtml(card.tone || "info")}">
    <header><strong>${escapeHtml(card.title)}</strong>${card.count != null ? `<span class="nav-count">${escapeHtml(String(card.count))}</span>` : ""}</header>
    ${card.body}
  </article>`).join("")}</section>`;
}

function rmoMetricCards(metrics) {
  return `<div class="rmo-metric-strip">${metrics.map((m) => `<div class="rmo-metric-card rmo-metric-${escapeHtml(m.tone || "info")}"><span>${escapeHtml(m.label)}</span><strong>${escapeHtml(String(m.value))}</strong><em>${escapeHtml(m.note || "")}</em></div>`).join("")}</div>`;
}

function rmoSimpleList(items) {
  return `<ul class="rmo-compact-list">${items.map(([head, sub]) => `<li><strong>${escapeHtml(head || "-")}</strong><span>${escapeHtml(sub || "-")}</span></li>`).join("") || "<li><span>표시할 항목 없음</span></li>"}</ul>`;
}

function rmoAuditDocumentBody(audit, caseRow) {
  if (!audit) return "# 감사 문서\n\n- 선택된 감사 기록이 없습니다.";
  const relatedDocs = caseRow ? rmoDeliverableRowsForCase(caseRow).slice(0, 4) : [];
  return `# 감사 기록 문서 · ${audit.id}

## 생성 시각
- ${audit.createdAt || "-"}

## 사용 데이터
- 대상: ${audit.targetType || "-"} ${audit.targetId || ""}
- 관련 케이스: ${caseRow ? `${caseRow.caseNo} · ${caseRow.theme}` : (audit.caseId || "-")}
- 위험도: ${RMO_RISK_LABELS[audit.riskLevel] || audit.riskLevel || "-"}

## 실행 에이전트
- 행위자: ${rmoUserName(audit.actorId)}
- 행위: ${audit.action}

## 판단 근거
- ${caseRow ? caseRow.priorityReason : "감사 대상 이벤트의 처리 이력을 기준으로 기록합니다."}

## 결과 요약
- ${audit.reviewRequired ? "담당자 검토가 필요한 감사 이벤트입니다." : "기록 완료 상태로 보존되는 감사 이벤트입니다."}

## 담당자 확인 내역
- 다음 액션: ${audit.reviewRequired ? "담당자 검토 후 승인/반려 또는 재실행 여부 확인" : "기록 유지"}

## 변경 이력
${relatedDocs.map(([file, summary]) => `- ${file}: ${summary}`).join("\n") || "- 연결 산출물 없음"}
`;
}

function rmoAuditDocumentPanel(audit, caseRow) {
  if (!audit) return "";
  return `<section class="rmo-audit-document">
    <div class="rmo-audit-document-label">문서 미리보기</div>
    <div class="rmo-md-body">${rmoRenderMarkdownSections(rmoAuditDocumentBody(audit, caseRow))}</div>
  </section>`;
}

function rmoAssignmentsForCase(caseId) {
  return rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY)
    .filter((a) => a.caseId === caseId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

function rmoDeliverablesForCase(caseId) {
  return rmoTable("rm_officer_deliverables", RMO_ROLE_KEY).filter((d) => d.caseId === caseId);
}

function rmoAuditsForCase(caseId) {
  return rmoTable("rm_officer_audit_logs", RMO_ROLE_KEY).filter((a) => a.caseId === caseId).slice(0, 5);
}

function rmoEvidenceForCase(caseId) {
  return rmoTable("rm_officer_evidence_items", RMO_ROLE_KEY).filter((e) => e.caseId === caseId).slice(0, 5);
}

function rmoAgentRowsForCase(caseRow) {
  return rmoAssignmentsForCase(caseRow.id).slice(0, 6).map((a) => [
    rmoAgentDisplayName(a.agentId),
    `${rmoNodeStatusLabel(a.status)} · ${a.outputMdPath || a.expectedOutput || "-"}`
  ]);
}

function rmoDeliverableRowsForCase(caseRow) {
  return rmoDeliverablesForCase(caseRow.id).slice(0, 6).map((d) => [
    d.fileName,
    `${rmoDeliverableDocType(d)} · ${d.summary || "-"}`
  ]);
}

function rmoCaseSelectionPanel(caseRow) {
  if (!caseRow) return rmoSelectionPanel("선택된 케이스 없음", "", [], [], []);
  const evidence = rmoEvidenceForCase(caseRow.id);
  const audits = rmoAuditsForCase(caseRow.id);
  return rmoSelectionPanel(rmoCaseDisplay(caseRow), caseRow.situation, [
    ["고객/지역/은행", [caseRow.customerAlias, caseRow.region, caseRow.bank].filter(Boolean).join(" · ")],
    ["도메인", rmoCaseTypeLabel(caseRow.caseType)],
    ["담당/SLA", `${rmoUserName(caseRow.assignedRmId)} · SLA ${caseRow.dueAt || "-"}`],
    ["상태/위험도", `${RMO_STAGE_SHORT[rmoStageOf(caseRow)] || "-"} · ${RMO_RISK_LABELS[caseRow.riskLevel] || caseRow.riskLevel}`],
    ["핵심 위험 신호", caseRow.priorityReason],
    ["다음 액션", rmoNextActionText(caseRow)],
  ], (caseRow.prioritySources || []).map((s) => s.label), [
    rmoInfoList("필요 에이전트", rmoAgentRowsForCase(caseRow)),
    rmoInfoList("생성된 산출물", rmoDeliverableRowsForCase(caseRow)),
    rmoInfoList("근거/감사", evidence.map((e) => [e.title, e.summary]).concat(audits.map((a) => [a.action, a.createdAt]))),
  ], `<button class="primary-button" type="button" data-rmo-open-case="${escapeHtml(caseRow.id)}">업무보드에서 실행</button><button class="secondary-button" type="button" data-rmo-open-detail="case:${escapeHtml(caseRow.id)}">고객 정보</button>`);
}

function rmoCaseStatsCards(rows) {
  const riskHigh = rows.filter((c) => ["high", "critical"].includes(c.riskLevel)).length;
  const todo = rows.filter((c) => rmoStageOf(c) === "todo").length;
  const doing = rows.filter((c) => rmoStageOf(c) === "doing").length;
  const done = rows.filter((c) => rmoStageOf(c) === "done").length;
  const byType = Object.entries(RMO_CASE_TYPES).map(([key, meta]) => [meta.label, `${rows.filter((c) => c.caseType === key).length}건`]).filter(([, count]) => !count.startsWith("0"));
  return rmoSupportCards([
    { title: "위험도 분포", count: rows.length, tone: "danger", body: rmoMetricCards([
      { label: "높음 이상", value: riskHigh, note: "담당자 검토 우선", tone: "danger" },
      { label: "보통/낮음", value: rows.length - riskHigh, note: "일반 큐", tone: "info" },
    ]) },
    { title: "처리 상태", count: rows.length, tone: "info", body: rmoMetricCards([
      { label: "작업 전", value: todo, tone: "info" },
      { label: "작업 중", value: doing, tone: "warn" },
      { label: "완료", value: done, tone: "safe" },
    ]) },
    { title: "도메인 분포", count: byType.length, tone: "safe", body: rmoSimpleList(byType) },
  ]);
}

function rmoDomainSupportPanels(typeKey, rows) {
  const agents = Array.from(new Set(rows.flatMap((c) => c.agentPlan || []))).slice(0, 5);
  const audits = rmoTable("rm_officer_audit_logs", RMO_ROLE_KEY).filter((a) => rows.some((c) => c.id === a.caseId)).slice(0, 4);
  const nextRows = rows.slice(0, 4).map((c) => `<li><strong>${escapeHtml(c.caseNo)} · ${escapeHtml(c.theme)}</strong><span>${escapeHtml(rmoNextActionText(c))}</span></li>`).join("");
  const agentRows = agents.map((id) => `<li><strong>${escapeHtml(rmoAgentDisplayName(id))}</strong><span>${escapeHtml((rmOfficerAgents.find((a) => a.id === id) || {}).description || "선택 케이스 분석에 연결")}</span></li>`).join("");
  const auditRows = audits.map((a) => `<li><strong>${escapeHtml(a.action)}</strong><span>${escapeHtml(a.createdAt)} · ${escapeHtml(a.targetId || a.caseId || "-")}</span></li>`).join("");
  return `<section class="rmo-domain-support-grid" aria-label="업무 보조 요약">
    <article class="rmo-domain-support-card"><header><strong>추천 다음 액션</strong><span class="nav-count">${rows.length}</span></header><ul>${nextRows || "<li><span>대기 중인 항목 없음</span></li>"}</ul></article>
    <article class="rmo-domain-support-card"><header><strong>관련 에이전트</strong><span class="nav-count">${agents.length}</span></header><ul>${agentRows || "<li><span>연결 에이전트 없음</span></li>"}</ul></article>
    <article class="rmo-domain-support-card"><header><strong>최근 감사 기록</strong><span class="nav-count">${audits.length}</span></header><ul>${auditRows || "<li><span>아직 감사 기록 없음</span></li>"}</ul></article>
  </section>`;
}

function rmoDomainCases(typeKey, title) {
  const rows = rmoTable("rm_officer_cases", RMO_ROLE_KEY).filter((c) => c.caseType === typeKey);
  return rmoPanel(`${title} (${rows.length})`, rmoCaseListMarkup(rows) + rmoDomainSupportPanels(typeKey, rows)) + rmoMockNote();
}

function rmoAgentQueueSupportPanels(rows) {
  const cases = rmoTable("rm_officer_cases", RMO_ROLE_KEY);
  const caseMap = new Map(cases.map((c) => [c.id, c]));
  const deliverables = rmoTable("rm_officer_deliverables", RMO_ROLE_KEY);
  const count = (statuses) => rows.filter((a) => statuses.includes(a.status)).length;
  const metrics = [
    ["승인 대기", count(["pendingApproval", "needsApproval"]), "warn"],
    ["실행 중", count(["running"]), "info"],
    ["완료", count(["completed"]), "safe"],
    ["재검토", count(["rejected", "needsReview"]), "danger"],
  ].map(([label, value, tone]) => `<div class="rmo-queue-metric rmo-queue-metric-${tone}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`).join("");
  const activeRows = rows
    .filter((a) => ["pendingApproval", "running", "notStarted", "needsApproval"].includes(a.status))
    .slice(0, 8);
  const activeCards = activeRows.map((a) => {
    const c = caseMap.get(a.caseId) || {};
    const output = a.outputMdPath || a.expectedOutput || "-";
    return `<article class="rmo-queue-task-card" data-rmo-open-case="${escapeHtml(a.caseId)}">
      <header><strong>${escapeHtml(rmoAgentDisplayName(a.agentId))}</strong>${rmoStatusPill(a.status)}</header>
      <p>${escapeHtml(c.caseNo || a.caseId)} · ${escapeHtml(c.theme || "관련 케이스")}</p>
      <div class="rmo-queue-task-meta"><span>${escapeHtml(output)}</span><span>${escapeHtml(String(a.estimatedMinutes || 3))}분</span></div>
      <div class="rmo-data-chips">${(a.dataChips || a.inputData || []).slice(0, 3).map((x) => `<span class="rmo-data-chip">${escapeHtml(x)}</span>`).join("") || '<span class="jbwc-row-note">연결 데이터 대기</span>'}</div>
    </article>`;
  }).join("");
  const grouped = cases
    .map((c) => ({ caseRow: c, assignments: rows.filter((a) => a.caseId === c.id) }))
    .filter((item) => item.assignments.length)
    .sort((a, b) => b.assignments.filter((x) => ["pendingApproval", "running", "needsApproval"].includes(x.status)).length - a.assignments.filter((x) => ["pendingApproval", "running", "needsApproval"].includes(x.status)).length)
    .slice(0, 6);
  const groupedCards = grouped.map(({ caseRow, assignments }) => {
    const pending = assignments.filter((a) => ["pendingApproval", "running", "needsApproval"].includes(a.status)).length;
    const done = assignments.filter((a) => a.status === "completed").length;
    return `<article class="rmo-queue-case-card" data-rmo-open-case="${escapeHtml(caseRow.id)}">
      <header><strong>${escapeHtml(caseRow.caseNo)} · ${escapeHtml(caseRow.theme)}</strong>${rmoRiskPill(caseRow.riskLevel)}</header>
      <p>${escapeHtml(caseRow.situation)}</p>
      <footer><span>대기/진행 ${escapeHtml(String(pending))}</span><span>완료 ${escapeHtml(String(done))}</span><span>${escapeHtml(rmoNextActionText(caseRow))}</span></footer>
    </article>`;
  }).join("");
  const recentDocs = deliverables.slice(0, 5).map((d) => `<li><strong>${escapeHtml(d.fileName)}</strong><span>${escapeHtml(d.caseId)} · ${escapeHtml(d.summary || "-")}</span></li>`).join("");
  return `<section class="rmo-queue-fill-grid" aria-label="AI 실행 큐 보조 요약">
    <article class="workspace-panel jbwc-panel rmo-queue-wide-panel">
      <p class="eyebrow">실행 상태 요약</p>
      <div class="rmo-queue-metric-grid">${metrics}</div>
      <div class="rmo-queue-task-grid">${activeCards || '<div class="jbwc-empty">실행 대기 항목이 없습니다.</div>'}</div>
    </article>
    <article class="workspace-panel jbwc-panel rmo-queue-wide-panel">
      <p class="eyebrow">케이스별 실행 묶음</p>
      <div class="rmo-queue-case-grid">${groupedCards || '<div class="jbwc-empty">연결 케이스가 없습니다.</div>'}</div>
    </article>
    <article class="workspace-panel jbwc-panel rmo-queue-wide-panel rmo-queue-doc-panel">
      <p class="eyebrow">최근 생성 산출물</p>
      <ul>${recentDocs || "<li><span>아직 생성된 산출물이 없습니다.</span></li>"}</ul>
    </article>
  </section>`;
}

/* 고객 정보 상세 패널(SUB 헤더의 '고객 정보' 버튼) — 익명 Ref 기준, 민감 원문 없음 */
function rmoDetailPanel() {
  if (!rmoState.infoCaseId) return "";
  const row = rmoTable("rm_officer_cases", RMO_ROLE_KEY).find((c) => c.id === rmoState.infoCaseId);
  if (!row) return "";
  return rmoCaseDetailMarkup(row);
}

function rmoCaseDetailMarkup(row) {
  const sources = (row.prioritySources || []).map((s) => `<span class="rmo-data-chip">${escapeHtml(s.label)}</span>`).join("");
  const evidence = rmoTable("rm_officer_evidence_items", RMO_ROLE_KEY).filter((x) => x.caseId === row.id).slice(0, 4);
  const audits = rmoTable("rm_officer_audit_logs", RMO_ROLE_KEY).filter((x) => x.caseId === row.id).slice(0, 4);
  const assignments = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY).filter((x) => x.caseId === row.id).sort((a, b) => (a.order || 0) - (b.order || 0));
  const deliverables = rmoTable("rm_officer_deliverables", RMO_ROLE_KEY).filter((x) => x.caseId === row.id).slice(0, 5);
  const agentPlan = assignments.map((a) => `<li><strong>${escapeHtml(rmoAgentDisplayName(a.agentId))}</strong><span>${escapeHtml(rmoNodeStatusLabel(a.status))} · ${escapeHtml(a.outputMdPath || a.expectedOutput || "-")}</span></li>`).join("");
  const docs = deliverables.map((d) => `<li><strong>${escapeHtml(d.fileName)}</strong><span>${escapeHtml(rmoDeliverableDocType(d))} · ${escapeHtml(d.summary || "-")}</span></li>`).join("");
  return `<section class="workspace-panel jbwc-detail-panel rmo-case-detail-panel" aria-label="RM 고객 정보 패널">
    <header>
      <div><p class="eyebrow">상세 정보 · 고객 정보(익명 Ref)</p><h3>${escapeHtml(row.caseNo)} · ${escapeHtml(row.theme)}</h3></div>
      <div>${rmoStagePill(rmoStageOf(row))} ${rmoRiskPill(row.riskLevel)} <button class="secondary-button" type="button" data-rmo-clear-detail>닫기</button></div>
    </header>
    <div class="jbwc-detail-grid">
      <div><span>익명 고객 ID</span><strong>${escapeHtml(row.customerRefId)}</strong></div>
      <div><span>고객 요약</span><strong>${escapeHtml([row.customerAlias, row.customerAge ? `${row.customerAge}세` : "", row.affiliate].filter(Boolean).join(" · "))}</strong></div>
      <div><span>관리 은행/지역</span><strong>${escapeHtml(row.bank)} · ${escapeHtml(row.region)}</strong></div>
      <div><span>상담 유형</span><strong>${escapeHtml(rmoCaseTypeLabel(row.caseType))}</strong></div>
      <div><span>담당/팀</span><strong>${escapeHtml(rmoUserName(row.assignedRmId))} · ${escapeHtml(row.assignedTeam)}</strong></div>
      <div><span>요청 금액대</span><strong>${escapeHtml(row.requestedAmountBand || "-")}</strong></div>
      <div><span>접수일</span><strong>${escapeHtml(row.receivedAt || row.createdAt || "-")}</strong></div>
      <div><span>첨부 파일</span><strong>${escapeHtml(row.uploadedFileName || "없음")}</strong></div>
      <div><span>우선순위</span><strong>${escapeHtml(RMO_PRIORITY_LABELS[row.priority] || row.priority)} (${escapeHtml(String(row.priorityScore))})</strong></div>
    </div>
    <div class="rmo-detail-story">
      <section><span>현재 상황</span><p>${escapeHtml(row.situation)}</p></section>
      <section><span>위험 신호</span><p><span aria-hidden="true">▎</span>${escapeHtml(row.priorityReason)}</p></section>
      <section><span>처리 목표</span><p>${escapeHtml(row.goal || "-")}</p></section>
      <section><span>다음 액션</span><p>${escapeHtml(rmoNextActionText(row))}</p></section>
    </div>
    <div class="rmo-data-chips">${sources || '<span class="jbwc-row-note">연결된 출처 없음</span>'}</div>
    <div class="rmo-detail-lists">
      <article><header><strong>필요 에이전트</strong><span class="nav-count">${assignments.length}</span></header><ul>${agentPlan || "<li><span>배정 없음</span></li>"}</ul></article>
      <article><header><strong>생성 산출물</strong><span class="nav-count">${deliverables.length}</span></header><ul>${docs || "<li><span>아직 생성된 문서 없음</span></li>"}</ul></article>
      <article><header><strong>근거 피드</strong><span class="nav-count">${evidence.length}</span></header><ul>${evidence.map((e) => `<li><strong>${escapeHtml(e.title)}</strong><span>${escapeHtml(e.summary)}</span></li>`).join("") || "<li><span>근거 없음</span></li>"}</ul></article>
      <article><header><strong>감사 로그</strong><span class="nav-count">${audits.length}</span></header><ul>${audits.map((a) => `<li><strong>${escapeHtml(a.action)}</strong><span>${escapeHtml(a.createdAt)}</span></li>`).join("") || "<li><span>감사 기록 없음</span></li>"}</ul></article>
    </div>
    <p class="jbwc-guard">주민/전화/계좌 등 실제 개인정보는 저장·표시하지 않습니다. 모든 판단은 담당 RM 검토가 필요합니다.</p>
  </section>`;
}

const rmoCaseViewRenderers = {
  "consult-queue"() {
    const rows = rmoTable("rm_officer_consult_queue", RMO_ROLE_KEY);
    const selected = rmoSelectedRow("consult", rows);
    const selectedCase = selected ? rmoCaseById(selected.caseId) : null;
    const list = `<div class="rmo-list-intro"><strong>처리 우선 기준</strong><span>위험도 · SLA · 상담 채널 · 담당 RM 큐를 함께 봅니다.</span></div>` +
      rmoTableView(["상담", "채널/주제", "관련 건", "상태"], rows, (x) => {
        const c = rmoCaseById(x.caseId);
        return `<li ${rmoSelectableRowAttrs("consult", x.id, selected && selected.id)}>
          <span class="jbwc-row-id">${escapeHtml(x.id)}<br><span class="jbwc-row-note">${escapeHtml(x.requestedAt || "-")}</span></span>
          <span>${escapeHtml(x.channel)}<br><span class="jbwc-row-note">${escapeHtml(x.topic)}</span></span>
          <span>${escapeHtml(c ? c.caseNo : x.caseId)}<br><span class="jbwc-row-note">${escapeHtml(c ? `${c.customerAlias} · ${c.region}` : "-")}</span></span>
          <span>${rmoStatusPill(x.status)} ${c ? rmoRiskPill(c.riskLevel) : ""}</span>
        </li>`;
      }, { key: "rmo_consult_queue_dashboard", pageSize: 6 });
    const detail = rmoSelectionPanel(selected ? selected.id : "상담 없음", selectedCase ? selectedCase.situation : "", [
      ["채널", selected && selected.channel],
      ["상담 주제", selected && selected.topic],
      ["관련 케이스", selectedCase ? rmoCaseDisplay(selectedCase) : selected && selected.caseId],
      ["고객 요약", selectedCase ? `${selectedCase.customerAlias} · ${selectedCase.region} · ${selectedCase.bank}` : "-"],
      ["상담 목적", selected && selected.topic],
      ["현재 상태/SLA", selectedCase ? `${RMO_STATUS_LABELS[selected.status] || selected.status} · SLA ${selectedCase.dueAt || "-"}` : "-"],
      ["다음 액션", selectedCase ? `${rmoNextActionText(selectedCase)} → 상담 답변 초안 확인` : "-"],
    ], selectedCase ? [selected.channel, rmoCaseTypeLabel(selectedCase.caseType), selectedCase.riskLevel] : [], [
      selectedCase ? rmoInfoList("연결 에이전트", rmoAgentRowsForCase(selectedCase)) : "",
      selectedCase ? rmoInfoList("생성 가능 산출물", rmoDeliverableRowsForCase(selectedCase)) : "",
      rmoInfoList("최근 상담 기록", rows.slice(0, 4).map((x) => [x.id, `${x.channel} · ${x.topic} · ${RMO_STATUS_LABELS[x.status] || x.status}`])),
    ], selectedCase ? `<button class="primary-button" type="button" data-rmo-open-case="${escapeHtml(selectedCase.id)}">케이스 실행 큐 열기</button>` : "");
    const byChannel = ["지점 방문", "전화 상담", "모바일"].map((channel) => [channel, `${rows.filter((x) => x.channel === channel).length}건`]);
    const bottom = rmoSupportCards([
      { title: "상담 유형별 요약", count: rows.length, tone: "info", body: rmoSimpleList(byChannel) },
      { title: "연결 에이전트", count: selectedCase ? rmoAssignmentsForCase(selectedCase.id).length : 0, tone: "safe", body: selectedCase ? rmoSimpleList(rmoAgentRowsForCase(selectedCase).slice(0, 4)) : rmoSimpleList([]) },
      { title: "다음 액션", count: rows.filter((x) => x.status !== "completed").length, tone: "warn", body: rmoSimpleList(rows.slice(0, 4).map((x) => {
        const c = rmoCaseById(x.caseId);
        return [x.id, c ? rmoNextActionText(c) : "상담 메모 확인"];
      })) },
      { title: "최근 감사 기록", count: selectedCase ? rmoAuditsForCase(selectedCase.id).length : 0, tone: "info", body: selectedCase ? rmoSimpleList(rmoAuditsForCase(selectedCase.id).map((a) => [a.action, a.createdAt])) : rmoSimpleList([]) },
    ]);
    return rmoWorkspaceSplit(`여신 상담 큐 (${rows.filter((x) => ["pending", "inProgress"].includes(x.status)).length} 대기)`, list, detail, bottom) + rmoMockNote();
  },
  approvals() {
    const rows = rmoTable("rm_officer_approvals", RMO_ROLE_KEY);
    const selected = rmoSelectedRow("approval", rows);
    const selectedCase = selected ? rmoCaseById(selected.caseId) : null;
    const list = rmoTableView(["요청", "유형", "관련 건", "결정"], rows, (a) => {
      const c = rmoCaseById(a.caseId);
      return `<li ${rmoSelectableRowAttrs("approval", a.id, selected && selected.id)}>
        <span class="jbwc-row-id">${escapeHtml(a.id)}<br><span class="jbwc-row-note">${escapeHtml(a.requestedAt || "-")}</span></span>
        <span>${escapeHtml(a.approvalType)}<br><span class="jbwc-row-note">${escapeHtml(a.status === "pending" ? "사람 승인 필요" : "처리 이력")}</span></span>
        <span>${escapeHtml(c ? c.caseNo : a.caseId)}<br><span class="jbwc-row-note">${escapeHtml(rmoUserName(a.approverId))}</span></span>
        <span>${a.status === "pending" ? `<button class="primary-button" type="button" data-rmo-approve-item="${escapeHtml(a.id)}" data-rmo-decision="approve">승인</button> <button class="secondary-button" type="button" data-rmo-approve-item="${escapeHtml(a.id)}" data-rmo-decision="reject">반려</button>` : rmoStatusPill(a.status)}</span>
      </li>`;
    }, { key: "rmo_approval_workbench", pageSize: 6 });
    const detail = rmoSelectionPanel(selected ? selected.id : "승인 없음", selectedCase ? selectedCase.situation : "", [
      ["요청 유형", selected && selected.approvalType],
      ["관련 케이스", selectedCase ? rmoCaseDisplay(selectedCase) : selected && selected.caseId],
      ["요청자", selected && rmoUserName(selected.requestedById)],
      ["승인권자", selected && rmoUserName(selected.approverId)],
      ["승인 필요 사유", selectedCase ? selectedCase.priorityReason : "사람 승인 필요 항목"],
      ["승인 가능 범위", "산출물 열람, 고객 안내문 발송, 담당자 검토 진행만 가능"],
      ["금지 범위", "실제 승인·거절·금리·한도 확정 금지"],
    ], selected ? [selected.status, "사람 승인 필요", selected.approvalType] : [], [
      selectedCase ? rmoInfoList("AI가 제안한 처리", [[rmoNextActionText(selectedCase), "승인 후 해당 산출물 또는 안내문만 다음 단계로 이동"]]) : "",
      selectedCase ? rmoInfoList("사람 확인 항목", [["위험 신호", selectedCase.priorityReason], ["근거 데이터", (selectedCase.prioritySources || []).map((s) => s.label).join(" · ")]]) : "",
      selectedCase ? rmoInfoList("관련 감사 로그", rmoAuditsForCase(selectedCase.id).map((a) => [a.action, a.createdAt])) : "",
    ], selected && selected.status === "pending" ? `<button class="primary-button" type="button" data-rmo-approve-item="${escapeHtml(selected.id)}" data-rmo-decision="approve">승인</button><button class="secondary-button" type="button" data-rmo-approve-item="${escapeHtml(selected.id)}" data-rmo-decision="reject">반려</button><button class="secondary-button" type="button" data-rmo-open-case="${escapeHtml(selected.caseId)}">상세 열람</button>` : selectedCase ? `<button class="secondary-button" type="button" data-rmo-open-case="${escapeHtml(selectedCase.id)}">상세 열람</button>` : "");
    const bottom = rmoSupportCards([
      { title: "승인 대기 분포", count: rows.length, tone: "warn", body: rmoMetricCards([
        { label: "대기", value: rows.filter((x) => x.status === "pending").length, tone: "warn" },
        { label: "승인 완료", value: rows.filter((x) => x.status === "approved").length, tone: "safe" },
        { label: "반려/재실행", value: rows.filter((x) => x.status === "rejected").length, tone: "danger" },
      ]) },
      { title: "승인 정책", count: 3, tone: "info", body: rmoSimpleList([
        ["AI 역할", "승인 큐와 근거 정리까지만 수행"],
        ["사람 역할", "실제 승인·거절 및 고객 통지는 담당자/승인권자"],
        ["감사 기준", "요청자·승인권자·산출물·결정 시각 기록"],
      ]) },
      { title: "최근 승인/반려 이력", count: rows.filter((x) => x.status !== "pending").length, tone: "safe", body: rmoSimpleList(rows.filter((x) => x.status !== "pending").slice(0, 4).map((x) => [x.id, `${x.approvalType} · ${RMO_STATUS_LABELS[x.status] || x.status}`])) },
    ]);
    return rmoWorkspaceSplit(`승인 라우팅 (${rows.filter((x) => x.status === "pending").length} 대기)`, list, detail, bottom) + rmoMockNote();
  },
  "policy-checklists"() {
    const rows = rmoTable("rm_officer_policy_checklists", RMO_ROLE_KEY);
    const selected = rmoSelectedRow("policy", rows);
    const selectedCase = selected ? rmoCaseById(selected.caseId) : null;
    const list = rmoTableView(["항목", "프로그램", "관련 건", "상태"], rows, (x) => {
      const c = rmoCaseById(x.caseId);
      return `<li ${rmoSelectableRowAttrs("policy", x.id, selected && selected.id)}>
        <span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.item)}<br><span class="jbwc-row-note">${escapeHtml(x.reason || "검토 근거 확인")}</span></span>
        <span>${escapeHtml(x.program)}<br><span class="jbwc-row-note">${escapeHtml(c ? c.caseNo : x.caseId)}</span></span>
        <span>${rmoStatusPill(x.status)} ${x.reviewRequired ? '<span class="status-pill status-pending">확인 필요</span>' : ""}</span>
      </li>`;
    }, { key: "rmo_policy_checklist_workbench", pageSize: 10 });
    const detail = rmoSelectionPanel(selected ? selected.item : "체크리스트 없음", selectedCase ? selectedCase.situation : "", [
      ["항목 ID", selected && selected.id],
      ["프로그램", selected && selected.program],
      ["관련 케이스", selectedCase ? rmoCaseDisplay(selectedCase) : selected && selected.caseId],
      ["상태", selected && `${RMO_STATUS_LABELS[selected.status] || selected.status}${selected.reviewRequired ? " · 담당자 확인 필요" : ""}`],
      ["확인 근거", selected && (selected.reason || "공개 요건과 상담 입력값 비교")],
      ["담당자 액션", selected && (selected.nextAction || "필요 서류 후보를 확인하고 고객 안내 초안 열람")],
      ["연결 산출물", selected && (selected.output || "policy-finance.md")],
    ], selected ? [selected.program, selected.reviewRequired ? "확인 필요" : "일반 확인", "대상 확정 금지"] : [], [
      rmoInfoList("검토 기준", [
        ["공개 요건", selected ? selected.program : "-"],
        ["불확실 항목", selected && selected.reviewRequired ? "담당자 확인 필요" : "샘플 기준 검토"],
        ["확정 금지", "정책자금 대상 여부는 AI가 확정하지 않음"],
      ]),
      selectedCase ? rmoInfoList("연결 에이전트", rmoAgentRowsForCase(selectedCase)) : "",
    ], selectedCase ? `<button class="primary-button" type="button" data-rmo-open-case="${escapeHtml(selectedCase.id)}">관련 케이스 열기</button>` : "");
    const bottom = rmoSupportCards([
      { title: "필요 서류", count: 4, tone: "info", body: rmoSimpleList([
        ["사업자등록/업종", "정책자금 기본요건 확인"],
        ["매출/업력 자료", "매출 규모·업력 요건 비교"],
        ["재해 피해 확인", "공식 확인서 또는 상담 메모"],
        ["보증/담보 후보", "담당자 검토용 질문 생성"],
      ]) },
      { title: "불확실 항목", count: rows.filter((x) => x.reviewRequired).length, tone: "warn", body: rmoSimpleList(rows.filter((x) => x.reviewRequired).slice(0, 5).map((x) => [x.item, x.reason || x.program])) },
      { title: "생성 산출물", count: selectedCase ? rmoDeliverablesForCase(selectedCase.id).length : 0, tone: "safe", body: selectedCase ? rmoSimpleList(rmoDeliverableRowsForCase(selectedCase)) : rmoSimpleList([]) },
    ]);
    return rmoWorkspaceSplit(`정책금융 체크리스트 (${rows.length})`, list, detail, bottom) + rmoMockNote();
  },
  /* 산출물/통합 리포트 목록 — 요구 4: 파일명/산출물 유형/관련 케이스/생성 에이전트/핵심 요약(2줄 클램프)/
     직원 액션(열람·승인·반려·재실행)을 각각 별도 필드로 분리한다. 긴 설명은 열람(모달)에서만 전체 표시. */
  deliverables() {
    const rows = rmoTable("rm_officer_deliverables", RMO_ROLE_KEY);
    const cases = rmoTable("rm_officer_cases", RMO_ROLE_KEY);
    const assignments = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY);
    const selected = rmoSelectedRow("deliverable", rows);
    const selectedCase = selected ? rmoCaseById(selected.caseId) : null;
    const rowHtml = (d) => {
      const caseRow = cases.find((c) => c.id === d.caseId);
      const caseLabel = caseRow ? caseRow.caseNo : (d.caseId || "-");
      const asg = assignments.find((a) => a.caseId === d.caseId && a.agentId === d.agentId && d.kind === "agent");
      let actionHtml = `<button class="secondary-button" type="button" data-rmo-open-md="${escapeHtml(d.fileName)}" data-rmo-md-case="${escapeHtml(d.caseId)}">열람</button>`;
      if (d.kind === "integrated" && caseRow) {
        const reportNode = assignments.find((a) => a.caseId === d.caseId && a.kind === "report");
        const caseReady = caseRow.status !== "completed" && reportNode && ["needsApproval", "completed"].includes(rmoNodeStatus(reportNode.status));
        actionHtml += caseReady ? ` <button class="primary-button" type="button" data-rmo-approve-case="${escapeHtml(d.caseId)}">승인</button>` : (caseRow.status === "completed" ? ` <span class="status-pill status-approved">승인 완료</span>` : "");
      } else if (asg) {
        if (asg.status === "rejected") actionHtml += ` <span class="status-pill status-escalated">반려됨</span>`;
        if (["completed", "rejected", "needsApproval"].includes(asg.status)) actionHtml += ` <button class="secondary-button" type="button" data-rmo-rerun="${escapeHtml(asg.id)}">재실행</button>`;
      }
      return `<li ${rmoSelectableRowAttrs("deliverable", d.id, selected && selected.id)}>
        <span class="jbwc-row-id">${escapeHtml(d.fileName)}</span>
        <span><span class="status-pill ${rmoDeliverableDocTypeClass(d)}">${escapeHtml(rmoDeliverableDocType(d))}</span></span>
        <span>${escapeHtml(caseLabel)}</span>
        <span>${escapeHtml(rmoAgentDisplayName(d.agentId))}</span>
        <span class="rmo-cap-summary rmo-deliverable-summary">${escapeHtml(d.summary)}</span>
        <span class="rmo-deliverable-actions">${actionHtml}</span>
      </li>`;
    };
    const summary = rmoMetricCards([
      { label: "통합본", value: rows.filter((d) => rmoDeliverableDocType(d) === "통합본").length, tone: "info" },
      { label: "검토본", value: rows.filter((d) => rmoDeliverableDocType(d) === "검토본").length, tone: "warn" },
      { label: "개별본", value: rows.filter((d) => rmoDeliverableDocType(d) === "개별본").length, tone: "safe" },
      { label: "재실행 필요", value: assignments.filter((a) => ["rejected", "needsReview"].includes(a.status)).length, tone: "danger" },
    ]);
    const list = `${summary}${rmoTableView(["파일명", "산출물 유형", "관련 케이스", "생성 에이전트", "핵심 요약", "직원 액션"], rows, rowHtml, { key: "rmo_deliverable_workbench", pageSize: 8 })}`;
    const detail = rmoSelectionPanel(selected ? selected.fileName : "산출물 없음", selected ? selected.summary : "", [
      ["산출물 유형", selected && rmoDeliverableDocType(selected)],
      ["관련 케이스", selectedCase ? rmoCaseDisplay(selectedCase) : selected && selected.caseId],
      ["생성 에이전트", selected && rmoAgentDisplayName(selected.agentId)],
      ["직원 액션", selected && selected.kind === "integrated" ? "열람 · 승인 여부 검토" : "열람 · 재실행 필요 여부 확인"],
      ["생성일", selected && (selected.createdAt || selected.date || "-")],
      ["확인 포인트", selected && (selected.kind === "integrated" ? "개별 산출물 근거와 담당자 승인 여부" : "분석 근거와 재실행 필요 여부")],
    ], selected ? [rmoDeliverableDocType(selected), rmoAgentDisplayName(selected.agentId), "내부 참고"] : [], [
      selectedCase ? rmoInfoList("연결 케이스", [[selectedCase.theme, selectedCase.priorityReason], ["다음 액션", rmoNextActionText(selectedCase)]]) : "",
      selectedCase ? rmoInfoList("관련 산출물", rmoDeliverableRowsForCase(selectedCase)) : "",
    ], selected ? `<button class="primary-button" type="button" data-rmo-open-md="${escapeHtml(selected.fileName)}" data-rmo-md-case="${escapeHtml(selected.caseId)}">문서 열람</button>${selectedCase ? `<button class="secondary-button" type="button" data-rmo-open-case="${escapeHtml(selectedCase.id)}">케이스 열기</button>` : ""}` : "");
    const bottom = rmoSupportCards([
      { title: "상태 요약", count: rows.length, tone: "info", body: summary },
      { title: "최근 통합본", count: rows.filter((d) => d.kind === "integrated").length, tone: "safe", body: rmoSimpleList(rows.filter((d) => d.kind === "integrated").slice(0, 4).map((d) => [d.fileName, d.summary])) },
      { title: "직원 확인 포인트", count: 4, tone: "warn", body: rmoSimpleList([
        ["실제 승인 아님", "산출물 승인과 금융 승인 구분"],
        ["근거 연결", "개별 md와 통합본 출처 확인"],
        ["재실행", "반려 노드는 재실행 후 감사 로그 남김"],
        ["민감정보", "원문 저장/출력 금지"],
      ]) },
    ]);
    return rmoWorkspaceSplit(`통합 리포트 · 산출물 (${rows.length})`, list, detail, bottom)
      + `<p class="jbwc-guard">모든 산출물은 내부 업무 참고용입니다. 통합본 안에서 개별 md로 이동할 수 있습니다.</p>` + rmoMockNote();
  },
  cases() {
    const rows = rmoTable("rm_officer_cases", RMO_ROLE_KEY);
    const sorted = rmoSortByUrgency(rows);
    const selected = rmoSelectedRow("case", sorted);
    const cards = `<div class="rmo-case-explorer-grid">${sorted.map((c) => `<article ${rmoSelectableCardAttrs("case", c.id, selected && selected.id, "rmo-case-explorer-card")}>
      <header><strong>${escapeHtml(c.caseNo)} · ${escapeHtml(c.customerAlias)}</strong><span>${rmoStagePill(rmoStageOf(c))}${rmoRiskPill(c.riskLevel)}</span></header>
      <p class="rmo-case-explorer-title">${escapeHtml(c.theme)}</p>
      <p>${escapeHtml(c.situation)}</p>
      <div class="rmo-case-explorer-meta">
        <span>${escapeHtml(c.region)} · ${escapeHtml(c.bank)}</span>
        <span>${escapeHtml(rmoCaseTypeLabel(c.caseType))}</span>
        <span>${escapeHtml(rmoUserName(c.assignedRmId))} · SLA ${escapeHtml(c.dueAt || "-")}</span>
      </div>
      <footer><span>${escapeHtml(rmoNextActionText(c))}</span><button class="secondary-button" type="button" data-rmo-open-case="${escapeHtml(c.id)}">실행 큐</button></footer>
    </article>`).join("")}</div>`;
    const list = `<div class="rmo-list-intro"><strong>필터/정렬</strong><span>급한 순으로 정렬했습니다. 카드를 선택하면 오른쪽에서 업무 맥락을 확인합니다.</span></div>${cards}`;
    const bottom = rmoCaseStatsCards(rows) + rmoSupportCards([
      { title: "오늘 SLA 임박 케이스", count: sorted.filter((c) => ["urgent", "high"].includes(c.priority)).length, tone: "danger", body: rmoSimpleList(sorted.slice(0, 5).map((c) => [c.caseNo, `${c.theme} · ${rmoNextActionText(c)}`])) },
      { title: "담당자 확인 필요", count: sorted.filter((c) => c.requiresHumanReview).length, tone: "warn", body: rmoSimpleList(sorted.filter((c) => c.requiresHumanReview).slice(0, 5).map((c) => [c.caseNo, c.priorityReason])) },
    ]);
    return rmoWorkspaceSplit(`전체 케이스 (${rows.length})`, list, rmoCaseSelectionPanel(selected), bottom, "rmo-case-explorer-layout") + rmoMockNote();
  },
  disaster() { return rmoDomainCases("disasterRisk", "재해·리스크 대응"); },
  repayment() { return rmoDomainCases("repaymentCare", "상환부담 관리"); },
  "daily-finance"() { return rmoDomainCases("dailyFinance", "생활금융 지원"); },
  "policy-startup"() { return rmoDomainCases("policyStartup", "정책·창업 금융"); },
  "agent-queue"() {
    const rows = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY);
    const selectedId = rmoState.contextItem && rmoState.contextItem.kind === "assignment" ? rmoState.contextItem.id : "";
    return rmoPanel(`AI 실행 큐 (${rows.filter((x) => ["pendingApproval", "running"].includes(x.status)).length} 대기)`, rmoTableView(["배정", "에이전트", "관련 건", "상태"], rows, (a) => `
      <li ${rmoSelectableRowAttrs("assignment", a.id, selectedId)}>
        <span class="jbwc-row-id">${escapeHtml(a.id)}</span>
        <span>${escapeHtml(rmoAgentDisplayName(a.agentId))}<br><span class="jbwc-row-note">${escapeHtml(a.expectedOutput)} · ${escapeHtml(String(a.estimatedMinutes))}분</span></span>
        <span>${escapeHtml(a.caseId)}<br><button class="secondary-button rmo-inline-action" type="button" data-rmo-open-case="${escapeHtml(a.caseId)}">케이스 열기</button></span>
        <span>${rmoStatusPill(a.status)}</span>
      </li>`) + rmoAgentQueueSupportPanels(rows)) + rmoMockNote();
  },
  "data-connectors"() {
    const rows = rmoTable("rm_officer_external_connectors", RMO_ROLE_KEY);
    const selected = rmoSelectedRow("connector", rows);
    const affected = rmoTable("rm_officer_cases", RMO_ROLE_KEY)
      .filter((c) => !selected || String(c.caseType || "").toLowerCase().includes(String(selected.category || "").toLowerCase()) || (c.prioritySources || []).some((s) => String(s.label || "").includes((selected.name || "").split("·")[0])))
      .slice(0, 5);
    const list = rmoMetricCards([
      { label: "정상", value: rows.filter((x) => x.health === "healthy").length, tone: "safe" },
      { label: "성능 저하", value: rows.filter((x) => x.health === "degraded").length, tone: "warn" },
      { label: "담당자 확인", value: rows.filter((x) => x.dataMode === "manualRequired").length, tone: "danger" },
      { label: "샘플 기준", value: rows.filter((x) => x.dataMode === "sample").length, tone: "info" },
    ]) + rmoTableView(["커넥터", "분류", "최근 동기화", "상태"], rows, (x) => `
      <li ${rmoSelectableRowAttrs("connector", x.id, selected && selected.id)}>
        <span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.name)}<br><span class="jbwc-row-note">${escapeHtml(x.description || "업무 참조 데이터")}</span></span>
        <span>${escapeHtml(x.category)} · ${escapeHtml(x.lastSyncAt || "담당자 확인 필요")}</span>
        <span>${rmoStatusPill(x.health)} ${rmoStatusPill(x.dataMode)}</span>
      </li>`, { key: "rmo_data_connector_dashboard", pageSize: 8 });
    const detail = rmoSelectionPanel(selected ? selected.name : "커넥터 없음", selected ? (selected.description || "데이터 최신성과 상태를 확인합니다.") : "", [
      ["커넥터 ID", selected && selected.id],
      ["분류", selected && selected.category],
      ["상태", selected && `${RMO_STATUS_LABELS[selected.health] || selected.health} · ${RMO_STATUS_LABELS[selected.dataMode] || selected.dataMode}`],
      ["최근 동기화", selected && (selected.lastSyncAt || "동기화 없음")],
      ["동기화 실패 이유", selected && (selected.failureReason || (selected.health === "healthy" ? "없음" : "담당자 수동 확인 필요"))],
      ["연결 에이전트", selected && (selected.agentIds || []).map(rmoAgentDisplayName).join(" · ") || "RM 오케스트레이터"],
      ["다음 액션", selected && (selected.nextAction || (selected.health === "healthy" ? "정상 연결 상태 유지" : "수동 확인 후 샘플 데이터 갱신"))],
    ], selected ? [selected.category, selected.health, selected.dataMode] : [], [
      rmoInfoList("영향받는 케이스", affected.map((c) => [c.caseNo, `${c.theme} · ${rmoNextActionText(c)}`])),
      rmoInfoList("사용 데이터", selected && selected.fields ? selected.fields.map((x) => [x, "케이스 분석 입력값"]) : [["데이터 최신성", "업무 참고용 샘플/공개 데이터"]]),
    ]);
    const bottom = rmoSupportCards([
      { title: "데이터 헬스 체크", count: rows.length, tone: "info", body: rmoSimpleList(rows.slice(0, 6).map((x) => [x.name, `${RMO_STATUS_LABELS[x.health] || x.health} · ${x.lastSyncAt || "수동 확인"}`])) },
      { title: "연결 에이전트", count: rmOfficerAgents.length, tone: "safe", body: rmoSimpleList(rmOfficerAgents.slice(0, 6).map((a) => [a.displayName, a.domain])) },
      { title: "최근 감사 기록", count: rmoTable("rm_officer_audit_logs", RMO_ROLE_KEY).length, tone: "warn", body: rmoSimpleList(rmoTable("rm_officer_audit_logs", RMO_ROLE_KEY).slice(0, 5).map((a) => [a.action, a.createdAt])) },
    ]);
    return rmoWorkspaceSplit(`데이터 연결 상태 (${rows.length})`, list, detail, bottom) + rmoMockNote();
  },
  roles() {
    const users = rmoTable("rm_officer_users", RMO_ROLE_KEY);
    const roles = rmoTable("rm_officer_role_assignments", RMO_ROLE_KEY);
    const selected = rmoSelectedRow("user", users);
    const selectedRole = selected ? roles.find((r) => r.userId === selected.id) : null;
    const assignedCases = selected ? rmoTable("rm_officer_cases", RMO_ROLE_KEY).filter((c) => c.assignedRmId === selected.id).slice(0, 5) : [];
    const list = `<div class="rmo-role-board">
      <section>${rmoTableView(["담당자", "팀", "역할", "상태"], users, (u) => `<li ${rmoSelectableRowAttrs("user", u.id, selected && selected.id)}>
        <span class="jbwc-row-id">${escapeHtml(u.id)}</span><span>${escapeHtml(u.name)}</span><span>${escapeHtml(u.team)} · ${escapeHtml(u.role)}</span><span>${rmoStatusPill(u.status)}</span>
      </li>`, { key: "rmo_roles_users", pageSize: 6 })}</section>
      <section class="rmo-secondary-table">${rmoTableView(["배정", "역할", "범위", "상태"], roles, (r) => `<li class="jbwc-row">
        <span class="jbwc-row-id">${escapeHtml(r.id)}</span><span>${escapeHtml(rmoUserName(r.userId))}</span><span>${escapeHtml(r.permissionScope)}</span><span>${rmoStatusPill(r.status)}</span>
      </li>`, { key: "rmo_roles_assignments", pageSize: 6 })}</section>
    </div>`;
    const detail = rmoSelectionPanel(selected ? selected.name : "담당자 없음", selected ? `${selected.team} · ${selected.role}` : "", [
      ["담당자 ID", selected && selected.id],
      ["팀", selected && selected.team],
      ["역할", selected && selected.role],
      ["승인권자 여부", selected && selected.role === "approver" ? "승인권자" : "일반 RM/담당자"],
      ["권한 범위", selectedRole && selectedRole.permissionScope],
      ["민감정보 접근", "원문 저장/출력 금지 · 익명 Ref 기준"],
      ["금리/한도/신용평가", "산정·확정 권한 없음"],
      ["다음 액션", selectedRole && selectedRole.reviewRequired ? "권한 배정과 승인권자 상태 점검" : "배정 케이스와 승인 라우팅 상태 확인"],
    ], selected ? [selected.status, selected.team, selected.role] : [], [
      rmoInfoList("최근 처리 케이스", assignedCases.map((c) => [c.caseNo, `${c.theme} · ${rmoNextActionText(c)}`])),
      rmoInfoList("배정된 에이전트", Array.from(new Set(assignedCases.flatMap((c) => c.agentPlan || []))).slice(0, 6).map((id) => [rmoAgentDisplayName(id), "담당 케이스 실행 큐"])),
    ]);
    const matrixRows = users.map((u) => [u.name, `${u.team} · ${u.role === "approver" ? "승인권자 검토 가능" : "케이스 검토/산출물 열람"}`]);
    const bottom = rmoSupportCards([
      { title: "권한 매트릭스", count: users.length, tone: "info", body: rmoSimpleList(matrixRows) },
      { title: "승인 라우팅 규칙", count: 3, tone: "warn", body: rmoSimpleList([
        ["high/critical", "사람 승인 필요"],
        ["고객 안내문", "발송 전 승인 라우팅"],
        ["금리/한도/신용평가", "AI 확정 금지"],
      ]) },
      { title: "권한 변경 로그", count: roles.filter((r) => r.reviewRequired).length, tone: "safe", body: rmoSimpleList(roles.map((r) => [r.id, `${rmoUserName(r.userId)} · ${RMO_STATUS_LABELS[r.status] || r.status}`])) },
    ]);
    return rmoWorkspaceSplit(`담당자/권한 (${users.length})`, list, detail, bottom) + rmoMockNote();
  },
  "audit-logs"() {
    const rows = rmoTable("rm_officer_audit_logs", RMO_ROLE_KEY);
    const selected = rmoSelectedRow("audit", rows);
    const selectedCase = selected ? rmoCaseById(selected.caseId) : null;
    const list = rmoTableView(["기록", "행위", "대상", "상태"], rows, (a) => `
      <li ${rmoSelectableRowAttrs("audit", a.id, selected && selected.id)}>
        <span class="jbwc-row-id">${escapeHtml(a.createdAt)}<br>${escapeHtml(a.id)}</span>
        <span>${escapeHtml(a.action)}<br><span class="jbwc-row-note">${escapeHtml(rmoUserName(a.actorId))}</span></span>
        <span>${escapeHtml(a.targetType)} ${escapeHtml(a.targetId || "")}</span>
        <span>${a.reviewRequired ? '<span class="status-pill status-escalated">검토 필요</span>' : '<span class="status-pill status-approved">기록됨</span>'} ${rmoRiskPill(a.riskLevel)}</span>
      </li>`, { key: "rmo_audit_dashboard", pageSize: 10 });
    const detail = rmoSelectionPanel(selected ? selected.id : "감사 기록 없음", selected ? selected.action : "", [
      ["생성 시각", selected && selected.createdAt],
      ["행위", selected && selected.action],
      ["행위자", selected && rmoUserName(selected.actorId)],
      ["대상", selected && `${selected.targetType} ${selected.targetId || ""}`],
      ["관련 케이스", selectedCase ? rmoCaseDisplay(selectedCase) : selected && selected.caseId],
      ["검토 필요", selected && (selected.reviewRequired ? "필요" : "기록 완료")],
      ["다음 액션", selected && selected.reviewRequired ? "담당자 검토 후 감사 상태 확인" : "기록 유지"],
    ], selected ? [selected.action, selected.riskLevel, selected.reviewRequired ? "검토 필요" : "기록됨"] : [], [
      selectedCase ? rmoInfoList("케이스 맥락", [[selectedCase.theme, selectedCase.priorityReason], ["다음 액션", rmoNextActionText(selectedCase)]]) : "",
      selectedCase ? rmoInfoList("관련 산출물", rmoDeliverableRowsForCase(selectedCase)) : "",
      rmoAuditDocumentPanel(selected, selectedCase),
    ]);
    const bottom = rmoSupportCards([
      { title: "감사 상태", count: rows.length, tone: "info", body: rmoMetricCards([
        { label: "검토 필요", value: rows.filter((a) => a.reviewRequired).length, tone: "danger" },
        { label: "기록 완료", value: rows.filter((a) => !a.reviewRequired).length, tone: "safe" },
      ]) },
      { title: "최근 케이스별 로그", count: rows.length, tone: "safe", body: rmoSimpleList(rows.slice(0, 6).map((a) => [a.caseId || a.targetId, `${a.action} · ${a.createdAt}`])) },
    ]);
    return rmoWorkspaceSplit(`감사 기록 (${rows.length})`, list, detail, bottom) + rmoMockNote();
  },
};
