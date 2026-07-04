/* JB우리캐피탈 운영 포털 — 운영 에이전트 하네스 view/샘플 실행 바인딩.
   샘플 실행은 모의(mock)이며 외부 호출 없이 agent_runs/agent_handoffs/audit_logs에만 기록한다. */

function jbwcHarnessView() {
  const agents = jbwcTable("harness_agents", JBWC_AFFILIATE_ID);
  const runs = jbwcTable("agent_runs", JBWC_AFFILIATE_ID).slice(0, 10);
  const handoffs = jbwcTable("agent_handoffs", JBWC_AFFILIATE_ID).slice(0, 8);
  const registry = Object.fromEntries(jbWooriCapitalOpsHarness.agents.map((agent) => [agent.id, agent]));
  return jbwcPanel(`${jbWooriCapitalOpsHarness.name} — 전용 라우팅`,
    `<p class="jbwc-routing">요청 → <strong>JB 분류 오케스트레이터</strong> → 도메인 전용 에이전트. FDS 고위험(high/critical)과 소비자보호/법규 케이스는 자동 완료하지 않습니다.</p>
     <p class="jbwc-guard">정책: ${jbWooriCapitalOpsHarness.policy.map((item) => escapeHtml(item)).join(" · ")}</p>`)
    + jbwcPanel("샘플 요청 실행 (모의 — 외부 호출 없음, agent_runs/agent_handoffs 기록)",
      `<div class="jbwc-samples">${jbWooriCapitalSampleRequests.map((sample) => `<button class="secondary-button" type="button" data-jbwc-sample="${escapeHtml(sample.key)}">${escapeHtml(sample.text)}</button>`).join("")}</div>
      ${jbwcState.lastRun ? `<div class="jbwc-lastrun">
        <p><strong>오케스트레이터 분류</strong> → ${escapeHtml(jbwcState.lastRun.agent)} ${jbwcRiskPill(jbwcState.lastRun.risk)} <span class="status-pill status-new">SLA ${escapeHtml(jbwcState.lastRun.sla)}</span></p>
        <p>${escapeHtml(jbwcState.lastRun.result)}</p>
        <p class="jbwc-mock-note">※ 내부 운영 참고용 모의 응답 — 실제 거래·판단 아님${jbwcState.lastRun.human ? " · 사람 검토 대기" : ""}</p>
      </div>` : ""}`)
    + jbwcPanel(`에이전트 (${agents.length})`, `<div class="jbwc-grid">${agents.map((agent) => {
      const reg = registry[agent.id] || {};
      return `<article class="jbwc-card jbwc-agent-card"><header><strong>${escapeHtml(agent.name)}</strong>${jbwcStatusPill(agent.status)}</header>
        <p class="jbwc-meta">${escapeHtml(agent.description)}</p>
        <p class="jbwc-meta">도메인 ${escapeHtml(jbwcDomainLabel(agent.domain))} · 금지 ${escapeHtml((reg.blockedActions || [])[0] || "실제 실행 금지")}</p></article>`;
    }).join("")}</div>`)
    + jbwcPanel(`최근 실행 (agent_runs · ${runs.length})`, jbwcTableView(["실행", "에이전트", "입력→결과", "상태"], runs, (run) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(run.createdAt)}<br>${escapeHtml(run.id)}</span>
        <span>${escapeHtml((registry[run.agentId] || {}).displayName || run.agentId)}</span>
        <span>${escapeHtml(run.inputSummary)}<br><span class="jbwc-row-note">${escapeHtml(run.outputSummary)}</span></span>
        <span>${jbwcStatusPill(run.status)} ${run.requiresHumanEscalation ? '<span class="status-pill status-escalated">사람 검토</span>' : ""}</span></li>`))
    + jbwcPanel(`핸드오프 (agent_handoffs · ${handoffs.length})`, jbwcTableView(["핸드오프", "경로", "사유", "상태"], handoffs, (handoff) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(handoff.id)}</span>
        <span>${escapeHtml((registry[handoff.fromAgentId] || {}).displayName || handoff.fromAgentId)} → ${escapeHtml((registry[handoff.toAgentId] || {}).displayName || handoff.toAgentId)}</span>
        <span>${escapeHtml(handoff.reason)}</span><span>${jbwcStatusPill(handoff.status)}</span></li>`)) + jbwcMockNote();
}

function jbwcBindHarnessSamples() {
  document.querySelectorAll("[data-jbwc-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      const result = runJbWooriCapitalSampleRequest(button.dataset.jbwcSample);
      if (!result) return;
      jbwcState.lastRun = {
        agent: result.agent ? result.agent.displayName : result.triage.recommendedAgent,
        risk: result.triage.riskOverride,
        sla: result.triage.slaDueAt,
        result: result.run.outputSummary,
        human: result.triage.requiresHumanReview,
      };
      jbwcState.detail = { kind: "agentRun", id: result.run.id };
      jbwcInvalidateCounts();
      if (typeof notify === "function") notify(`오케스트레이터 → ${jbwcState.lastRun.agent} 라우팅 완료 (모의)`);
      render();
    });
  });
}
