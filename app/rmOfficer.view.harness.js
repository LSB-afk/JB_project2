/* RM 하네스 — agent harness view/sample execution + context markup. */

function rmoHarnessView() {
  const agents = rmoTable("rm_officer_harness_agents", RMO_ROLE_KEY);
  const runs = rmoTable("rm_officer_agent_runs", RMO_ROLE_KEY).slice(0, 10);
  const handoffs = rmoTable("rm_officer_agent_handoffs", RMO_ROLE_KEY).slice(0, 8);
  const modelSettings = typeof agentModelSettingsSummary === "function" ? agentModelSettingsSummary() : null;
  const modelStatus = modelSettings ? `${modelSettings.label} · ${modelSettings.model}` : "모의 실행";
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
    <p class="jbwc-meta">현재 모델 설정: ${escapeHtml(modelStatus)} · 설정 화면에서 변경</p>`)
    + rmoPanel("샘플 요청 실행", `
      <div class="jbwc-grid">${sampleCards}</div>
      ${rmoState.modelRun && rmoState.modelRun.message ? `<div class="jbwc-lastrun"><p><strong>로컬 모델 상태</strong> ${escapeHtml(rmoState.modelRun.status)}</p><p>${escapeHtml(rmoState.modelRun.message)}</p></div>` : ""}
      ${rmoState.lastRun ? `<div class="jbwc-lastrun"><p><strong>라우팅 결과</strong> → ${escapeHtml(rmoState.lastRun.agent)} ${rmoRiskPill(rmoState.lastRun.risk)}</p><p>${escapeHtml(rmoState.lastRun.result)}</p><p class="jbwc-mock-note">내부 업무 참고용 · 담당자 검토 필요</p></div>` : ""}`)
    + rmoPanel(`에이전트 (${agents.length})`, `<div class="jbwc-grid">${agents.map((a) => `<article class="jbwc-card jbwc-agent-card"><header><strong>${escapeHtml(a.name)}</strong>${rmoStatusPill(a.status)}</header><p class="jbwc-meta">${escapeHtml(a.description)}</p><p class="jbwc-meta">소속 ${escapeHtml(a.org || "-")} · 도메인 ${escapeHtml(a.domain)}</p></article>`).join("")}</div>`)
    + rmoPanel(`업무 기능 (Skills · ${rmOfficerSkills.length})`, `<div class="jbwc-grid">${rmOfficerSkills.map((s) => `<article class="jbwc-card"><header><strong>${escapeHtml(s.label)}</strong><span class="status-pill status-new">${escapeHtml(s.key)}</span></header><p class="jbwc-meta">입력 ${escapeHtml(s.inputs.join("·"))} → 출력 ${escapeHtml(s.outputs.join("·"))}</p></article>`).join("")}</div>`)
    + rmoPanel(`최근 실행 (${runs.length})`, rmoTableView(["실행", "에이전트", "입력→결과", "상태"], runs, (r) => `<li class="jbwc-row" data-rmo-open-case="${escapeHtml(r.caseId)}"><span class="jbwc-row-id">${escapeHtml(r.createdAt)}<br>${escapeHtml(r.id)}</span><span>${escapeHtml(rmoAgentDisplayName(r.agentId))}</span><span>${escapeHtml(r.inputSummary)}<br><span class="jbwc-row-note">${escapeHtml(r.outputSummary)}</span></span><span>${rmoStatusPill(r.status)} ${rmoRiskPill(r.riskLevel)}</span></li>`))
    + rmoPanel(`핸드오프 (${handoffs.length})`, rmoTableView(["핸드오프", "경로", "사유", "상태"], handoffs, (h) => `<li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(h.id)}</span><span>${escapeHtml(rmoAgentDisplayName(h.fromAgentId))} → ${escapeHtml(rmoAgentDisplayName(h.toAgentId))}</span><span>${escapeHtml(h.reason)}</span><span>${rmoStatusPill(h.status)}</span></li>`))
    + rmoMockNote();
}

function rmOfficerHarnessContextMarkup() {
  const counts = rmoState.counts || getRmOfficerSidebarCounts();
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
