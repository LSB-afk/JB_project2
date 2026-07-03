/* 전세사기 보호 담당자 역할 하네스 — 운영 에이전트 하네스 view/샘플 실행 바인딩.
   샘플 실행은 모의(mock)이며 외부 호출 없이 agent_runs/agent_handoffs/audit_logs(및 필요 시 approvals)에만 기록한다. */

function jpoHarnessView() {
  const agents = jpoTable("harness_agents", JPO_ROLE_KEY);
  const runs = jpoTable("agent_runs", JPO_ROLE_KEY).slice(0, 10);
  const handoffs = jpoTable("agent_handoffs", JPO_ROLE_KEY).slice(0, 8);
  const registry = Object.fromEntries(jeonseFraudProtectionHarness.agents.map((agent) => [agent.id, agent]));
  const skills = jeonseFraudProtectionHarness.skills || [];
  return jpoPanel(`${jeonseFraudProtectionHarness.name} — 전용 라우팅`,
    `<p class="jbwc-routing">요청 → <strong>전세보호 분류 오케스트레이터</strong> → 위험 신호별 전용 에이전트.
      피해자 결정·법률·경공매·보증 가능성 관련 결과는 자동 완료하지 않습니다.</p>
     <p class="jbwc-guard">정책: ${jeonseFraudProtectionHarness.policy.map((item) => escapeHtml(item)).join(" · ")}</p>`)
    + jpoPanel("샘플 요청 실행 (모의 — 외부 호출 없음, agent_runs/agent_handoffs 기록)",
      `<div class="jbwc-samples">${jeonseProtectionSampleRequests.map((sample) => `<button class="secondary-button" type="button" data-jpo-sample="${escapeHtml(sample.key)}">${escapeHtml(sample.text)}</button>`).join("")}</div>
      ${jpoState.lastRun ? `<div class="jbwc-lastrun">
        <p><strong>오케스트레이터 분류</strong> → ${escapeHtml(jpoState.lastRun.agent)} ${jpoRiskPill(jpoState.lastRun.risk)} <span class="status-pill status-new">SLA ${escapeHtml(jpoState.lastRun.sla)}</span></p>
        <p>${escapeHtml(jpoState.lastRun.result)}</p>
        <p class="jbwc-mock-note">※ 내부 운영 참고용 모의 응답 — 실제 판단·발송 아님${jpoState.lastRun.human ? " · 사람 검토 대기" : ""}${jpoState.lastRun.approvalPending ? " · 발송 승인 대기" : ""}</p>
      </div>` : ""}`)
    + jpoPanel("운영 명령 (Commands)", `
      <div class="jbwc-samples">${jeonseProtectionCommands.map((cmd) => `<button class="secondary-button" type="button" data-jpo-command="${escapeHtml(cmd.key)}" title="${escapeHtml(cmd.description)}">${escapeHtml(cmd.key)} · ${escapeHtml(cmd.label)}</button>`).join("")}</div>
      ${jpoState.selfTest ? `<div class="jbwc-lastrun">
        <p><strong>하네스 자체 검증</strong> ${jpoState.selfTest.pass ? '<span class="status-pill status-approved">통과</span>' : '<span class="status-pill status-escalated">실패</span>'} <span class="jbwc-row-note">${escapeHtml(jpoState.selfTest.at || "")}</span></p>
        ${jpoState.selfTest.results.map((r) => `<p>${r.ok ? "✅" : "❌"} ${escapeHtml(r.name)}${r.issues && r.issues.length ? ` — ${escapeHtml(r.issues.join(" / "))}` : ""}</p>`).join("")}
      </div>` : ""}`)
    + jpoPanel(`에이전트 (${agents.length})`, `<div class="jbwc-grid">${agents.map((agent) => {
      const reg = registry[agent.id] || {};
      return `<article class="jbwc-card jbwc-agent-card"><header><strong>${escapeHtml(agent.name)}</strong>${jpoStatusPill(agent.status)}</header>
        <p class="jbwc-meta">${escapeHtml(agent.description)}</p>
        <p class="jbwc-meta">도메인 ${escapeHtml(agent.domain)} · 금지 ${escapeHtml((reg.blockedActions || [])[0] || "확정 판단 금지")}</p></article>`;
    }).join("")}</div>`)
    + jpoPanel(`업무 기능 단위 (Skills · ${skills.length})`, `<div class="jbwc-grid">${skills.map((skill) => `
      <article class="jbwc-card"><header><strong>${escapeHtml(skill.label)}</strong><span class="status-pill status-new">${escapeHtml(skill.key)}</span></header>
      <p class="jbwc-meta">담당 에이전트: ${escapeHtml(skill.agentIds.map((id) => (registry[id] || {}).displayName || id).join(", "))}</p>
      <p class="jbwc-meta">입력 ${escapeHtml(skill.inputs.join("·"))} → 출력 ${escapeHtml(skill.outputs.join("·"))}</p></article>`).join("")}</div>`)
    + jpoPanel(`최근 실행 (agent_runs · ${runs.length})`, jpoTableView(["실행", "에이전트", "입력→결과", "상태"], runs, (run) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(run.createdAt)}<br>${escapeHtml(run.id)}</span>
        <span>${escapeHtml((registry[run.agentId] || {}).displayName || run.agentId)}</span>
        <span>${escapeHtml(run.inputSummary)}<br><span class="jbwc-row-note">${escapeHtml(run.outputSummary)}</span></span>
        <span>${jpoStatusPill(run.status)} ${run.requiresHumanEscalation ? '<span class="status-pill status-escalated">사람 검토</span>' : ""}</span></li>`))
    + jpoPanel(`핸드오프 (agent_handoffs · ${handoffs.length})`, jpoTableView(["핸드오프", "경로", "사유", "상태"], handoffs, (handoff) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(handoff.id)}</span>
        <span>${escapeHtml((registry[handoff.fromAgentId] || {}).displayName || handoff.fromAgentId)} → ${escapeHtml((registry[handoff.toAgentId] || {}).displayName || handoff.toAgentId)}</span>
        <span>${escapeHtml(handoff.reason)}</span><span>${jpoStatusPill(handoff.status)}</span></li>`)) + jpoMockNote();
}

function jpoBindHarnessSamples() {
  document.querySelectorAll("[data-jpo-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      const result = runJeonseProtectionSampleRequest(button.dataset.jpoSample);
      if (!result) return;
      jpoState.lastRun = {
        agent: result.agent ? result.agent.displayName : result.triage.recommendedAgent,
        risk: result.triage.riskOverride,
        sla: result.triage.slaDueAt,
        result: result.run.outputSummary,
        human: result.triage.requiresHumanReview,
        approvalPending: result.run.status === "pendingApproval",
      };
      jpoState.detail = { kind: "agentRun", id: result.run.id };
      jpoInvalidateCounts();
      if (typeof notify === "function") notify(`오케스트레이터 → ${jpoState.lastRun.agent} 라우팅 완료 (모의)`);
      render();
    });
  });
}
