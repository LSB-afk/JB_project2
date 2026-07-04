/* 기업여신 하네스 — agent harness view/sample execution. */

function ccrHarnessView() {
  const agents = ccrTable("corporate_credit_harness_agents", CCR_ROLE_KEY);
  const runs = ccrTable("corporate_credit_agent_runs", CCR_ROLE_KEY).slice(0, 10);
  const handoffs = ccrTable("corporate_credit_agent_handoffs", CCR_ROLE_KEY).slice(0, 8);
  const modelSettings = typeof agentModelSettingsSummary === "function" ? agentModelSettingsSummary() : null;
  const modelStatus = modelSettings ? `${modelSettings.label} · ${modelSettings.model}` : "모의 실행";
  const running = ccrState.modelRun && ccrState.modelRun.status === "running";
  const sampleCards = corporateCreditSampleRequests.map((s) => `<article class="jbwc-card">
    <header><strong>${escapeHtml(s.text)}</strong><span class="source-badge">${escapeHtml(s.key)}</span></header>
    <div class="settings-button-row">
      <button class="secondary-button" type="button" data-ccr-sample="${escapeHtml(s.key)}" ${running ? "disabled" : ""}>모의 실행</button>
      <button class="primary-button" type="button" data-ccr-ollama-sample="${escapeHtml(s.key)}" ${running ? "disabled" : ""}>로컬 모델 실행</button>
    </div>
  </article>`).join("");
  return ccrPanel(`${corporateCreditOfficerHarness.name} — loop routing`,
    `<p class="jbwc-routing">요청 → <strong>Corporate Credit Triage Orchestrator</strong> → 도메인 agent → Evidence/Evaluator → Human Review → Audit/State.</p>
    <p class="jbwc-guard">정책: ${corporateCreditOfficerHarness.policy.map((item) => escapeHtml(item)).join(" · ")}</p>
    <p class="jbwc-meta">현재 모델 설정: ${escapeHtml(modelStatus)} · 설정 화면에서 변경</p>`)
    + ccrPanel("샘플 요청 실행", `
      <div class="jbwc-grid">${sampleCards}</div>
      ${ccrState.modelRun && ccrState.modelRun.message ? `<div class="jbwc-lastrun"><p><strong>로컬 모델 상태</strong> ${escapeHtml(ccrState.modelRun.status)}</p><p>${escapeHtml(ccrState.modelRun.message)}</p></div>` : ""}
      ${ccrState.lastRun ? `<div class="jbwc-lastrun"><p><strong>라우팅 결과</strong> → ${escapeHtml(ccrState.lastRun.agent)} ${ccrRiskPill(ccrState.lastRun.risk)}</p><p>${escapeHtml(ccrState.lastRun.result)}</p><p class="jbwc-mock-note">내부 운영 참고용 · 사람 검토 필요</p></div>` : ""}`)
    + ccrPanel(`에이전트 (${agents.length})`, `<div class="jbwc-grid">${agents.map((a) => `<article class="jbwc-card jbwc-agent-card"><header><strong>${escapeHtml(a.name)}</strong>${ccrStatusPill(a.status)}</header><p class="jbwc-meta">${escapeHtml(a.description)}</p><p class="jbwc-meta">도메인 ${escapeHtml(a.domain)}</p></article>`).join("")}</div>`)
    + ccrPanel(`업무 기능 (Skills · ${corporateCreditSkills.length})`, `<div class="jbwc-grid">${corporateCreditSkills.map((s) => `<article class="jbwc-card"><header><strong>${escapeHtml(s.label)}</strong><span class="status-pill status-new">${escapeHtml(s.key)}</span></header><p class="jbwc-meta">입력 ${escapeHtml(s.inputs.join("·"))} → 출력 ${escapeHtml(s.outputs.join("·"))}</p></article>`).join("")}</div>`)
    + ccrPanel(`최근 실행 (${runs.length})`, ccrTableView(["실행", "에이전트", "입력→결과", "상태"], runs, (r) => `<li class="jbwc-row" data-ccr-open-detail="run:${escapeHtml(r.id)}"><span class="jbwc-row-id">${escapeHtml(r.createdAt)}<br>${escapeHtml(r.id)}</span><span>${escapeHtml(ccrAgentDisplayName(r.agentId))}</span><span>${escapeHtml(r.inputSummary)}<br><span class="jbwc-row-note">${escapeHtml(r.outputSummary)}</span></span><span>${ccrStatusPill(r.status)} ${ccrRiskPill(r.riskLevel)}</span></li>`))
    + ccrPanel(`핸드오프 (${handoffs.length})`, ccrTableView(["핸드오프", "경로", "사유", "상태"], handoffs, (h) => `<li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(h.id)}</span><span>${escapeHtml(ccrAgentDisplayName(h.fromAgentId))} → ${escapeHtml(ccrAgentDisplayName(h.toAgentId))}</span><span>${escapeHtml(h.reason)}</span><span>${ccrStatusPill(h.status)}</span></li>`))
    + ccrMockNote();
}

function ccrBindHarnessSamples() {
  document.querySelectorAll("[data-ccr-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      const result = runCorporateCreditSampleRequest(button.dataset.ccrSample);
      ccrState.modelRun = { status: "mock", message: "모의 실행 결과를 agent_runs/audit_logs에 저장했습니다." };
      ccrState.lastRun = {
        agent: result.agent ? result.agent.displayName : result.triage.recommendedAgent,
        risk: result.run.riskLevel,
        result: result.run.outputSummary,
      };
      ccrState.detail = { kind: "run", id: result.run.id };
      ccrInvalidateCounts();
      if (typeof notify === "function") notify(`기업여신 오케스트레이터 → ${ccrState.lastRun.agent} 라우팅 완료`);
      render();
    });
  });
  document.querySelectorAll("[data-ccr-ollama-sample]").forEach((button) => {
    button.addEventListener("click", async () => {
      ccrState.modelRun = { status: "running", message: "Ollama 로컬 모델 실행 중입니다." };
      render();
      try {
        const result = await runCorporateCreditOllamaSampleRequest(button.dataset.ccrOllamaSample);
        ccrState.modelRun = { status: "ok", message: `${result.modelResult.model} 응답을 agent_runs/evidence/audit에 저장했습니다.` };
        ccrState.lastRun = {
          agent: result.agent ? result.agent.displayName : result.triage.recommendedAgent,
          risk: result.run.riskLevel,
          result: result.run.outputSummary,
        };
        ccrState.detail = { kind: "run", id: result.run.id };
        ccrInvalidateCounts();
        if (typeof notify === "function") notify("Ollama 로컬 모델 실행 결과를 저장했습니다.");
      } catch (error) {
        const run = recordCorporateCreditAgentRun({
          agentId: "ccr-compliance",
          inputSummary: "Ollama 로컬 모델 실행 실패",
          outputSummary: `로컬 모델 연결 실패 · ${String(error.message || error)} · 설정 확인 필요`,
          status: "needsReview",
          riskLevel: "medium",
          requiresHumanReview: true,
          runtime: "ollama",
          runtimeStatus: "error",
          errorSummary: String(error.message || error),
        });
        ccrState.modelRun = { status: "error", message: String(error.message || error) };
        ccrState.lastRun = {
          agent: ccrAgentDisplayName(run.agentId),
          risk: run.riskLevel,
          result: run.outputSummary,
        };
        ccrState.detail = { kind: "run", id: run.id };
        ccrInvalidateCounts();
        if (typeof notify === "function") notify("Ollama 실행 실패 기록을 남겼습니다.");
      } finally {
        render();
      }
    });
  });
}
