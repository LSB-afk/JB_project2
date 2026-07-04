/* RM 하네스 — agent harness view/sample execution + context markup. */

function rmoInventoryToneChip(label, tone) {
  return `<span class="rmo-tone-chip rmo-tone-${escapeHtml(tone || "info")}">${escapeHtml(label || "-")}</span>`;
}

function rmoAgentVisualMeta(agent) {
  const status = agent.status === "needsReview" ? { label: "검토 필요", tone: "danger" } : { label: "활성", tone: "safe" };
  const highControl = ["governance", "compliance", "fraud", "approval"].some((key) => String(agent.domain || "").includes(key) || String(agent.id || "").includes(key));
  const risk = highControl ? { label: "높음 · 필수 통제", tone: "danger", review: "사람 검토 필수" } : { label: "낮음 · 내부 전용", tone: "safe", review: "담당자 확인" };
  return { status, risk };
}

function rmoSkillVisualMeta(skill) {
  const text = `${skill.key} ${skill.label}`.toLowerCase();
  if (text.includes("guardrail") || text.includes("fraud") || text.includes("approval")) return { label: "높음 · 필수 통제", tone: "danger", review: "사람 검토 필수" };
  if (text.includes("policy") || text.includes("finance") || text.includes("repayment") || text.includes("cashflow")) return { label: "중간 · RM 검토", tone: "warn", review: "담당자 확인 필요" };
  return { label: "낮음 · 내부 전용", tone: "safe", review: "내부 업무 참고" };
}

function rmoAgentInventoryCard(agent) {
  const meta = rmoAgentVisualMeta(agent);
  return `<article class="jbwc-card jbwc-agent-card rmo-inventory-card">
    <header>
      <strong>${escapeHtml(agent.name)}</strong>
      <span>${rmoInventoryToneChip(meta.status.label, meta.status.tone)}${rmoInventoryToneChip(agent.domain, "domain")}</span>
    </header>
    <p class="jbwc-meta">${escapeHtml(agent.description)}</p>
    <div class="rmo-inventory-lines">
      <p><span>소속</span><strong>${escapeHtml(agent.org || "-")}</strong></p>
      <p><span>사용 데이터</span><strong>케이스 요약 · 위험 신호 · SLA · 선행 산출물</strong></p>
      <p><span>생성 산출물</span><strong>${escapeHtml((rmOfficerAgents.find((a) => a.id === agent.id) || {}).deliverableFile || "agent-result.md")}</strong></p>
    </div>
    <footer>${rmoInventoryToneChip(meta.risk.label, meta.risk.tone)}${rmoInventoryToneChip(meta.risk.review, "review")}</footer>
  </article>`;
}

function rmoSkillInventoryCard(skill) {
  const meta = rmoSkillVisualMeta(skill);
  return `<article class="jbwc-card rmo-inventory-card rmo-skill-inventory-card">
    <header>
      <strong>${escapeHtml(skill.label)}</strong>
      <span>${rmoInventoryToneChip(skill.key, "domain")}</span>
    </header>
    <p class="jbwc-meta">입력 ${escapeHtml(skill.inputs.join(" · "))} → 출력 ${escapeHtml(skill.outputs.join(" · "))}</p>
    <div class="rmo-inventory-lines">
      <p><span>연결 대상</span><strong>${escapeHtml(rmOfficerAgents.filter((a) => String(a.description || "").includes(skill.label)).map((a) => a.displayName).slice(0, 2).join(" · ") || "RM 오케스트레이터")}</strong></p>
      <p><span>검토 기준</span><strong>${escapeHtml(meta.review)}</strong></p>
    </div>
    <footer>${rmoInventoryToneChip(meta.label, meta.tone)}${rmoInventoryToneChip("업무 기능", "info")}</footer>
  </article>`;
}

function rmoHarnessView() {
  const agents = rmoTable("rm_officer_harness_agents", RMO_ROLE_KEY);
  const runs = rmoTable("rm_officer_agent_runs", RMO_ROLE_KEY).slice(0, 10);
  const handoffs = rmoTable("rm_officer_agent_handoffs", RMO_ROLE_KEY).slice(0, 8);
  const modelSettings = typeof agentModelSettingsSummary === "function" ? agentModelSettingsSummary() : null;
  const modelStatus = modelSettings ? `${modelSettings.label} · ${modelSettings.model}` : "모의 실행";
  const detectedModels = modelSettings && modelSettings.health && modelSettings.health.models ? modelSettings.health.models : [];
  const running = rmoState.modelRun && rmoState.modelRun.status === "running";
  const sampleCards = rmOfficerSampleRequests.map((s) => `<article class="jbwc-card">
    <header><strong>${escapeHtml(s.text)}</strong><span class="source-badge">${escapeHtml(s.key)}</span></header>
    <div class="settings-button-row">
      <button class="secondary-button" type="button" data-rmo-sample="${escapeHtml(s.key)}" ${running ? "disabled" : ""}>모의 실행</button>
      <button class="primary-button" type="button" data-rmo-ollama-sample="${escapeHtml(s.key)}" ${running ? "disabled" : ""}>로컬 모델 실행</button>
    </div>
  </article>`).join("");
  return rmoPanel(`${rmOfficerHarness.name} — loop routing`,
    `<p class="jbwc-routing">요청 → <strong>RM Case Triage Orchestrator</strong> → 상담 도메인 agent(스킬/데이터) → Action/Comms → Compliance Guardrail Evaluator → Human Review → Audit/State.</p>
    <p class="jbwc-guard">정책: ${rmOfficerHarness.policy.map((item) => escapeHtml(item)).join(" · ")}</p>
    <p class="jbwc-meta">현재 모델 설정: ${escapeHtml(modelStatus)} · 설정 화면에서 변경</p>
    ${detectedModels.length ? `<p class="jbwc-meta">Ollama 감지 모델: ${detectedModels.map((model) => escapeHtml(model.name)).join(" · ")}</p>` : ""}`)
    + rmoPanel("샘플 요청 실행", `
      <div class="jbwc-grid">${sampleCards}</div>
      ${rmoState.modelRun && rmoState.modelRun.message ? `<div class="jbwc-lastrun"><p><strong>로컬 모델 상태</strong> ${escapeHtml(rmoState.modelRun.status)}</p><p>${escapeHtml(rmoState.modelRun.message)}</p></div>` : ""}
      ${rmoState.lastRun ? `<div class="jbwc-lastrun"><p><strong>라우팅 결과</strong> → ${escapeHtml(rmoState.lastRun.agent)} ${rmoRiskPill(rmoState.lastRun.risk)}</p><p>${escapeHtml(rmoState.lastRun.result)}</p><p class="jbwc-mock-note">내부 업무 참고용 · 담당자 검토 필요</p></div>` : ""}`)
    + rmoPanel(`에이전트 (${agents.length})`, `<div class="jbwc-grid rmo-inventory-grid">${agents.map(rmoAgentInventoryCard).join("")}</div>`)
    + rmoPanel(`업무 기능 (Skills · ${rmOfficerSkills.length})`, `<div class="jbwc-grid rmo-inventory-grid">${rmOfficerSkills.map(rmoSkillInventoryCard).join("")}</div>`)
    + rmoPanel(`최근 실행 (${runs.length})`, rmoTableView(["실행", "에이전트", "입력→결과", "상태"], runs, (r) => `<li class="jbwc-row" data-rmo-open-case="${escapeHtml(r.caseId)}"><span class="jbwc-row-id">${escapeHtml(r.createdAt)}<br>${escapeHtml(r.id)}</span><span>${escapeHtml(rmoAgentDisplayName(r.agentId))}</span><span>${escapeHtml(r.inputSummary)}<br><span class="jbwc-row-note">${escapeHtml(r.outputSummary)}</span></span><span>${rmoStatusPill(r.status)} ${rmoRiskPill(r.riskLevel)}</span></li>`))
    + rmoPanel(`핸드오프 (${handoffs.length})`, rmoTableView(["핸드오프", "경로", "사유", "상태"], handoffs, (h) => `<li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(h.id)}</span><span>${escapeHtml(rmoAgentDisplayName(h.fromAgentId))} → ${escapeHtml(rmoAgentDisplayName(h.toAgentId))}</span><span>${escapeHtml(h.reason)}</span><span>${rmoStatusPill(h.status)}</span></li>`))
    + rmoMockNote();
}

function rmoContextRows(rows) {
  return rows.map(([label, value]) => `<div class="property-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "-")}</strong></div>`).join("");
}

function rmoContextList(title, rows) {
  return `<section class="rmo-context-section"><h4>${escapeHtml(title)}</h4><ul>${rows.map(([head, sub]) => `<li><strong>${escapeHtml(head || "-")}</strong><span>${escapeHtml(sub || "-")}</span></li>`).join("") || "<li><span>표시할 항목 없음</span></li>"}</ul></section>`;
}

function rmoContextShell(title, rows, chips, sections, guard) {
  const chipMarkup = (chips || []).map((chip) => typeof chip === "string" ? `<span class="rmo-data-chip">${escapeHtml(chip)}</span>` : chip).join("");
  return `<div class="case-properties rmo-context-case">
    <div class="rmo-context-title-card"><span>현재 선택 요약</span><strong>${escapeHtml(title)}</strong></div>
    ${rmoContextRows(rows || [])}
    ${chipMarkup ? `<div class="rmo-context-chiprow">${chipMarkup}</div>` : ""}
    ${(sections || []).join("")}
    <p class="jbwc-guard">${escapeHtml(guard || "내부 업무 참고용입니다. 실제 승인·거절·금리·한도·신용평가 확정은 담당자 검토가 필요합니다.")}</p>
  </div>`;
}

function rmoCaseContextMarkup(row) {
  const assignments = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY).filter((a) => a.caseId === row.id).sort((a, b) => (a.order || 0) - (b.order || 0));
  const deliverables = rmoTable("rm_officer_deliverables", RMO_ROLE_KEY).filter((d) => d.caseId === row.id).slice(0, 4);
  const evidence = rmoTable("rm_officer_evidence_items", RMO_ROLE_KEY).filter((e) => e.caseId === row.id).slice(0, 3);
  const audits = rmoTable("rm_officer_audit_logs", RMO_ROLE_KEY).filter((a) => a.caseId === row.id).slice(0, 3);
  const sources = (row.prioritySources || []).map((s) => s.label);
  return rmoContextShell(`${row.caseNo} · ${row.theme}`, [
    ["고객/지역", [row.customerAlias, row.customerAge ? `${row.customerAge}세` : "", row.region, row.bank].filter(Boolean).join(" · ")],
    ["상담 유형", rmoCaseTypeLabel(row.caseType)],
    ["현재 상태", `${RMO_STAGE_SHORT[rmoStageOf(row)] || row.stage} · ${RMO_STATUS_LABELS[row.status] || row.status}`],
    ["접수일/첨부", `${row.receivedAt || row.createdAt || "-"} · ${row.uploadedFileName || "첨부 없음"}`],
    ["현재 상황", row.situation],
    ["위험 신호", row.priorityReason],
    ["처리 목표", row.goal || "담당 RM 검토용 산출물과 승인 경로를 준비한다."],
    ["다음 액션", rmoNextActionText(row)],
  ], sources, [
    rmoContextList("필요 에이전트", assignments.map((a) => [rmoAgentDisplayName(a.agentId), `${rmoNodeStatusLabel(a.status)} · ${a.outputMdPath || a.expectedOutput || "-"}`])),
    rmoContextList("생성 산출물", deliverables.map((d) => [d.fileName, `${rmoDeliverableDocType(d)} · ${d.summary || "-"}`])),
    rmoContextList("근거/감사", evidence.map((e) => [e.title, e.summary]).concat(audits.map((a) => [a.action, a.createdAt]))),
  ]);
}

function rmoFirstCaseFor(typeKey) {
  return rmoSortByUrgency(rmoTable("rm_officer_cases", RMO_ROLE_KEY).filter((c) => c.caseType === typeKey))[0] || null;
}

function rmoViewContextModel() {
  const caseRows = rmoTable("rm_officer_cases", RMO_ROLE_KEY);
  const findCase = (id) => caseRows.find((c) => c.id === id);
  const selectedContext = rmoState.contextItem || {};
  const pickContextRow = (kind, rows, fallback) => {
    if (selectedContext.kind === kind) {
      const row = rows.find((item) => item.id === selectedContext.id);
      if (row) return row;
    }
    return fallback || rows[0] || null;
  };
  const caseContextViews = new Set(["board", "cases"]);
  const currentCase = caseContextViews.has(rmoState.view) ? (rmoState.infoCaseId || (rmoState.detail && rmoState.detail.kind === "case" ? rmoState.detail.id : null)) : null;
  if (currentCase) return { kind: "case", row: findCase(currentCase) };
  if (rmoState.view === "cases") {
    const c = pickContextRow("case", rmoSortByUrgency(caseRows), rmoSortByUrgency(caseRows)[0]);
    if (c) return { kind: "case", row: c };
  }

  if (rmoState.view === "consult-queue") {
    const consultRows = rmoTable("rm_officer_consult_queue", RMO_ROLE_KEY);
    const row = pickContextRow("consult", consultRows, consultRows.find((x) => ["pending", "inProgress"].includes(x.status)));
    const c = row ? findCase(row.caseId) : null;
    return { kind: "generic", title: "여신 상담 큐 요약", rows: [
      ["상담 ID", row && row.id], ["채널", row && row.channel], ["관련 케이스", c ? `${c.caseNo} · ${c.theme}` : row && row.caseId],
      ["고객 요약", c ? `${c.customerAlias} · ${c.region} · ${c.bank}` : "-"],
      ["상담 목적", row && row.topic], ["현재 상태", row && (RMO_STATUS_LABELS[row.status] || row.status)],
      ["다음 액션", c ? rmoNextActionText(c) : "상담 메모를 확인하고 관련 케이스 에이전트 큐로 이동"],
    ], chips: row ? [row.channel, row.topic, row.status] : [], sections: c ? [rmoContextList("연결 케이스", [[c.theme, c.situation]]), rmoContextList("생성 산출물", rmoDeliverablesForCase(c.id).slice(0, 3).map((d) => [d.fileName, d.summary]))] : [] };
  }
  if (rmoState.view === "approvals") {
    const approvalRows = rmoTable("rm_officer_approvals", RMO_ROLE_KEY);
    const row = pickContextRow("approval", approvalRows, approvalRows.find((x) => x.status === "pending"));
    const c = row ? findCase(row.caseId) : null;
    return { kind: "generic", title: "승인 라우팅 요약", rows: [
      ["승인 항목", row && row.id], ["유형", row && row.approvalType], ["관련 케이스", c ? `${c.caseNo} · ${c.theme}` : row && row.caseId],
      ["요청자/승인권자", row ? `${rmoUserName(row.requestedById)} → ${rmoUserName(row.approverId)}` : "-"],
      ["승인 필요 사유", c ? c.priorityReason : "사람 승인 필요"],
      ["현재 상태", row && (RMO_STATUS_LABELS[row.status] || row.status)], ["다음 액션", "담당자 검토 후 승인 또는 반려"],
    ], chips: row ? [row.status, "사람 승인 필요"] : [], sections: c ? [rmoContextList("관련 감사 로그", rmoAuditsForCase(c.id).map((a) => [a.action, a.createdAt]))] : [] };
  }
  if (rmoState.view === "policy-checklists") {
    const policyRows = rmoTable("rm_officer_policy_checklists", RMO_ROLE_KEY);
    const row = pickContextRow("policy", policyRows, policyRows.find((x) => x.status === "open"));
    return { kind: "generic", title: "정책금융 체크리스트 요약", rows: [
      ["항목", row && row.item], ["프로그램", row && row.program], ["관련 케이스", row && row.caseId],
      ["검토 필요", row && row.reviewRequired ? "필요" : "일반 확인"], ["확인 근거", row && (row.reason || "공개 요건 비교")],
      ["다음 액션", row && (row.nextAction || "서류 후보와 공개 요건을 비교해 담당자 확인 질문 생성")],
    ], chips: row ? [row.program, row.reviewRequired ? "확인 필요" : "일반"] : [] };
  }
  if (rmoState.view === "deliverables") {
    const deliverableRows = rmoTable("rm_officer_deliverables", RMO_ROLE_KEY);
    const row = pickContextRow("deliverable", deliverableRows);
    return { kind: "generic", title: "산출물 요약", rows: [
      ["파일명", row && row.fileName], ["산출물 유형", row && rmoDeliverableDocType(row)], ["관련 케이스", row && row.caseId],
      ["생성 에이전트", row && rmoAgentDisplayName(row.agentId)], ["핵심 요약", row && row.summary],
      ["직원 액션", row && row.kind === "integrated" ? "열람 · 승인 여부 검토" : "열람 · 재실행 필요 여부 확인"],
    ], chips: row ? [rmoDeliverableDocType(row), rmoAgentDisplayName(row.agentId)] : [] };
  }
  if (["disaster", "repayment", "daily-finance", "policy-startup"].includes(rmoState.view)) {
    const typeMap = { disaster: "disasterRisk", repayment: "repaymentCare", "daily-finance": "dailyFinance", "policy-startup": "policyStartup" };
    const c = rmoFirstCaseFor(typeMap[rmoState.view]);
    if (c) return { kind: "case", row: c };
  }
  if (rmoState.view === "agent-queue") {
    const assignmentRows = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY);
    const row = pickContextRow("assignment", assignmentRows, assignmentRows.find((x) => ["pendingApproval", "running"].includes(x.status)));
    const agent = row ? rmOfficerAgents.find((a) => a.id === row.agentId) : null;
    const c = row ? findCase(row.caseId) : null;
    const audits = c ? rmoAuditsForCase(c.id) : [];
    return { kind: "generic", title: "에이전트 실행 큐 요약", rows: [
      ["배정 ID", row && row.id], ["연결 케이스", c ? `${c.caseNo} · ${c.theme}` : row && row.caseId],
      ["고객/상담/도메인", c ? `${c.customerAlias} · ${rmoCaseTypeLabel(c.caseType)} · ${c.bank}` : "-"],
      ["에이전트", row && rmoAgentDisplayName(row.agentId)], ["소속/도메인", agent ? `${agent.org} · ${agent.domain}` : "-"],
      ["사용 데이터", row && (row.inputData || []).join(" · ")], ["예상 산출물", row && (row.outputMdPath || row.expectedOutput)],
      ["현재 상태", row && rmoNodeStatusLabel(row.status)], ["다음 액션", row && rmoNodeStatus(row.status) === "ready" ? "Enter로 승인·실행" : "상태 확인"],
      ["담당자 승인", row && row.requiresApproval ? "필요" : "내부 실행"],
    ], chips: row ? [rmoNodeStatusLabel(row.status), row.requiresApproval ? "사람 승인 필요" : "내부 실행"] : [], sections: [
      c ? rmoContextList("케이스 내용", [[c.situation, c.priorityReason], ["처리 목표", c.goal || "담당자 검토용 산출물 준비"]]) : "",
      rmoContextList("관련 감사 로그", audits.map((a) => [a.action, a.createdAt])),
    ] };
  }
  if (rmoState.view === "agent-harness") {
    const agent = rmoTable("rm_officer_harness_agents", RMO_ROLE_KEY)[0];
    return { kind: "generic", title: "에이전트 하네스 요약", rows: [
      ["에이전트", agent && agent.name], ["역할", agent && agent.description], ["소속", agent && agent.org],
      ["사용 데이터", "케이스 요약 · 위험 신호 · SLA · 선행 산출물"], ["연결 스킬", "우선순위 근거 산정 · 승인 라우팅 · 감사 기록"],
      ["생성 산출물", "agent_run · handoff · 개별/통합 md"], ["검토 필요 여부", "high/critical 및 외부 행동은 사람 검토 필수"],
    ], chips: agent ? [agent.domain, agent.status, "하네스 실행"] : [] };
  }
  if (rmoState.view === "capabilities") {
    const capRows = rmoCapabilityFilter && rmoCapabilityFilter !== "all" ? RMO_CAPABILITIES.filter((c) => c.category === rmoCapabilityFilter) : RMO_CAPABILITIES;
    const cap = pickContextRow("capability", capRows, capRows[0]);
    const risk = cap ? rmoCapabilityRisk(cap) : null;
    const connectedCases = cap ? caseRows.filter((c) => (c.agentPlan || []).some((agentId) => (cap.agentIds || []).includes(agentId))).slice(0, 5) : [];
    return { kind: "generic", title: cap ? `${cap.name} 기술 상세` : "업무 기능 기술 요약", rows: [
      ["기능명", cap && cap.name], ["기능 목적", cap && cap.summary], ["입력값", cap && cap.data.join(" · ")], ["출력값", cap && cap.output],
      ["연결 에이전트", cap && rmoCapabilityAgentNames(cap).join(" · ") || "서비스 레이어"], ["사용 도메인", cap && cap.category],
      ["위험도", risk && risk.label], ["담당자 확인", risk && risk.review],
      ["사용 시나리오", cap && `${cap.category} 화면에서 선택 항목의 입력값을 읽고 ${cap.output} 산출물을 만듭니다.`],
      ["감사 기록 연결", cap && (cap.id.includes("audit") || cap.category.includes("감사") ? "직접 연결" : "에이전트 실행/산출물 이벤트로 간접 연결")],
    ], chips: cap ? [cap.category, RMO_CAPABILITY_STATUS_LABELS[cap.status] || cap.status, risk.label] : [], sections: [
      rmoContextList("적용 케이스", connectedCases.map((c) => [c.caseNo, `${c.theme} · ${rmoNextActionText(c)}`])),
      rmoContextList("생성 산출물 예시", cap ? [[cap.output, cap.summary], [cap.serviceRef || "service", "구현/서비스 참조"]] : []),
    ] };
  }
  if (rmoState.view === "data-connectors") {
    const connectorRows = rmoTable("rm_officer_external_connectors", RMO_ROLE_KEY);
    const row = pickContextRow("connector", connectorRows, connectorRows.find((x) => x.health !== "healthy"));
    const affectedCases = row ? caseRows.filter((c) => String(c.caseType || "").toLowerCase().includes(String(row.category || "").toLowerCase()) || (c.prioritySources || []).some((s) => String(s.label || "").includes((row.name || "").split("·")[0]))).slice(0, 5) : [];
    const relatedCaps = row ? RMO_CAPABILITIES.filter((cap) => cap.data.some((d) => String(d).includes(row.category) || String(row.name).includes(String(d).split("(")[0])) || (row.agentIds || []).some((id) => (cap.agentIds || []).includes(id))).slice(0, 5) : [];
    return { kind: "generic", title: "데이터 연결 요약", rows: [
      ["커넥터 ID", row && row.id], ["데이터 출처", row && row.name], ["공개/샘플/내부", row && (RMO_STATUS_LABELS[row.dataMode] || row.dataMode)],
      ["분류", row && row.category], ["상태", row && `${RMO_STATUS_LABELS[row.health] || row.health} · ${RMO_STATUS_LABELS[row.dataMode] || row.dataMode}`],
      ["최근 동기화", row && (row.lastSyncAt || "담당자 확인 필요")], ["실패 이유", row && (row.failureReason || "없음")],
      ["다음 액션", row && (row.nextAction || (row.health === "healthy" ? "정상 연결 상태 유지" : "수동 확인 후 샘플 데이터 갱신"))],
      ["담당자 확인", row && (row.dataMode === "manualRequired" || row.health !== "healthy" ? "필요" : "일반 모니터링")],
    ], chips: row ? [row.category, row.health, row.dataMode] : [], sections: row ? [
      rmoContextList("연결 에이전트", (row.agentIds || []).map((id) => [rmoAgentDisplayName(id), "이 커넥터를 입력 데이터로 사용"])),
      rmoContextList("영향받는 케이스", affectedCases.map((c) => [c.caseNo, `${c.theme} · ${rmoNextActionText(c)}`])),
      rmoContextList("사용되는 업무 기능", relatedCaps.map((cap) => [cap.name, cap.output])),
    ] : [] };
  }
  if (rmoState.view === "roles") {
    const userRows = rmoTable("rm_officer_users", RMO_ROLE_KEY);
    const user = pickContextRow("user", userRows);
    const roles = rmoTable("rm_officer_role_assignments", RMO_ROLE_KEY);
    const role = user ? roles.find((r) => r.userId === user.id) : null;
    const assignedCases = user ? caseRows.filter((c) => c.assignedRmId === user.id).slice(0, 4) : [];
    return { kind: "generic", title: "담당자/권한 요약", rows: [
      ["담당자", user && user.name], ["팀", user && user.team], ["역할", user && user.role],
      ["권한 범위", role && role.permissionScope], ["승인권자 여부", user && user.role === "approver" ? "승인권자" : "일반 담당자"],
      ["민감정보/금융확정", "원문 저장·금리·한도·신용평가 확정 금지"], ["다음 액션", "권한 배정과 승인권자 상태 점검"],
    ], chips: user ? [user.status, user.team, user.role] : [], sections: [rmoContextList("최근 처리 케이스", assignedCases.map((c) => [c.caseNo, c.theme]))] };
  }
  if (rmoState.view === "audit-logs") {
    const auditRows = rmoTable("rm_officer_audit_logs", RMO_ROLE_KEY);
    const row = pickContextRow("audit", auditRows);
    const c = row ? findCase(row.caseId) : null;
    return { kind: "generic", title: "감사 기록 요약", rows: [
      ["기록 ID", row && row.id], ["행위", row && row.action], ["대상", row && `${row.targetType} ${row.targetId || ""}`],
      ["관련 케이스", c ? `${c.caseNo} · ${c.theme}` : row && row.caseId],
      ["위험도", row && (RMO_RISK_LABELS[row.riskLevel] || row.riskLevel)], ["검토 필요", row && row.reviewRequired ? "필요" : "기록 완료"],
    ], chips: row ? [row.action, row.riskLevel] : [], sections: [
      row ? `<section class="rmo-context-section rmo-context-document"><h4>감사 문서</h4><div class="rmo-md-body">${rmoRenderMarkdownSections(rmoAuditDocumentBody(row, c))}</div></section>` : "",
    ] };
  }
  return null;
}

function rmoPropertyPanelTitle() {
  const model = rmoViewContextModel();
  if (model && model.kind === "case" && model.row) return `${model.row.caseNo} · ${model.row.theme}`;
  if (model && model.title) return model.title;
  return RMO_VIEWS[rmoState.view] || "RM 업무지원 포털";
}

function rmOfficerHarnessContextMarkup() {
  const counts = rmoState.counts || getRmOfficerSidebarCounts();
  const model = rmoViewContextModel();
  if (model && model.kind === "case" && model.row) return rmoCaseContextMarkup(model.row);
  if (model && model.kind === "generic") return rmoContextShell(model.title, model.rows, model.chips, model.sections);
  const selectedCaseId = rmoState.infoCaseId || (rmoState.detail && rmoState.detail.kind === "case" ? rmoState.detail.id : null);
  const row = selectedCaseId ? rmoTable("rm_officer_cases", RMO_ROLE_KEY).find((c) => c.id === selectedCaseId) : null;
  if (row) {
    return rmoCaseContextMarkup(row);
  }
  return `<div class="case-properties">
    <div class="property-row"><span>전용 하네스</span><strong>${escapeHtml(rmOfficerHarness.id)}</strong></div>
    <div class="property-row"><span>데이터 범위(roleKey)</span><strong>${escapeHtml(RMO_ROLE_KEY)}</strong></div>
    <div class="property-row"><span>처리 전/중/후</span><strong>${escapeHtml(counts.todo)} / ${escapeHtml(counts.doing)} / ${escapeHtml(counts.done)}</strong></div>
    <div class="property-row"><span>승인 라우팅 대기</span><strong>${escapeHtml(counts.approvals)}</strong></div>
    <div class="property-row"><span>통합 리포트</span><strong>${escapeHtml(counts.deliverables)}</strong></div>
    <div class="property-row"><span>사람 검토</span><strong>승인·금리·한도·신용평가·정책자금 대상 필수</strong></div>
    <p class="jbwc-guard">실제 대출 승인/거절, 금리/한도 산정, 신용평가, 정책자금 대상 확정, 민감정보 원문 저장/출력은 금지됩니다.</p>
  </div>`;
}

function rmoBindHarnessSamples() {
  document.querySelectorAll("[data-rmo-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      const result = runRmOfficerSampleRequest(button.dataset.rmoSample);
      rmoState.modelRun = { status: "mock", message: "모의 실행 결과를 agent_runs/audit_logs에 저장했습니다." };
      rmoState.lastRun = {
        agent: result.agent ? result.agent.displayName : "rmo-triage",
        risk: result.run.riskLevel,
        result: result.run.outputSummary,
      };
      rmoInvalidateCounts();
      if (typeof notify === "function") notify(`RM 오케스트레이터 → ${rmoState.lastRun.agent} 라우팅 완료`);
      render();
    });
  });
  document.querySelectorAll("[data-rmo-ollama-sample]").forEach((button) => {
    button.addEventListener("click", async () => {
      rmoState.modelRun = { status: "running", message: "Ollama 로컬 모델 실행 중입니다." };
      render();
      try {
        const result = await runRmOfficerOllamaSampleRequest(button.dataset.rmoOllamaSample);
        rmoState.modelRun = { status: "ok", message: `${result.modelResult.model} 응답을 agent_runs/audit에 저장했습니다.` };
        rmoState.lastRun = { agent: result.agent ? result.agent.displayName : "rmo-triage", risk: result.run.riskLevel, result: result.run.outputSummary };
        rmoInvalidateCounts();
        if (typeof notify === "function") notify("Ollama 로컬 모델 실행 결과를 저장했습니다.");
      } catch (error) {
        const run = recordRmOfficerAgentRun({
          agentId: "rmo-compliance",
          inputSummary: "Ollama 로컬 모델 실행 실패",
          outputSummary: `로컬 모델 연결 실패 · ${String(error.message || error)} · 설정 확인 필요`,
          status: "needsReview",
          riskLevel: "medium",
          requiresHumanReview: true,
          runtime: "ollama",
          runtimeStatus: "error",
          errorSummary: String(error.message || error),
        });
        rmoState.modelRun = { status: "error", message: String(error.message || error) };
        rmoState.lastRun = { agent: rmoAgentDisplayName(run.agentId), risk: run.riskLevel, result: run.outputSummary };
        rmoInvalidateCounts();
        if (typeof notify === "function") notify("Ollama 실행 실패 기록을 남겼습니다.");
      } finally {
        render();
      }
    });
  });
}
