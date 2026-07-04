/* 전세사기 보호 담당자 역할 하네스 — 운영 에이전트 하네스 view/샘플 실행 바인딩.
   샘플 실행은 모의(mock)이며 외부 호출 없이 agent_runs/agent_handoffs/audit_logs(및 필요 시 approvals)에만 기록한다. */

const JPO_CAPABILITY_CATALOG = [
  { name: "접수 분류·라우팅", category: "관리 및 운영 기능", summary: "접수 유형을 lifecycle 상태와 전용 에이전트 실행 순서로 분리합니다.", domain: "신규 접수", agents: ["jpo-intake"], data: "접수 유형, 보증금, 주택 유형, 기한", output: "case-routing.md, handoff 기록", status: "available" },
  { name: "전세가율/시세 위험 점검", category: "주의 신호 분류", summary: "실거래 스냅샷과 유사 거래 표본으로 보증금 과다 신호를 산출합니다.", domain: "시세 데이터 보강", agents: ["jpo-price"], data: "법정동, 면적, 매매/전월세 중앙값", output: "price-risk.md, riskSignals", status: "mock" },
  { name: "권리관계 체크리스트", category: "권리·등기 확인", summary: "선순위 권리, 압류, 신탁, 위반건축물 확인 항목을 담당자 검토용으로 묶습니다.", domain: "권리관계 확인", agents: ["jpo-registry"], data: "등기부 확인 상태, 건축물 확인 상태", output: "registry-checklist.md", status: "available" },
  { name: "보증·HUG 확인 항목", category: "보증 확인", summary: "보증 가능성을 확정하지 않고 공식 기준 확인 후보와 누락 항목을 정리합니다.", domain: "보증·HUG 확인", agents: ["jpo-guarantee"], data: "보증 상태, 주택 유형, 위험 신호", output: "guarantee-check.md", status: "review" },
  { name: "경·공매 기한 감시", category: "긴급 대응", summary: "경·공매 통지와 기한 임박 신호를 supervisor 승인 흐름으로 연결합니다.", domain: "긴급 경·공매 대응", agents: ["jpo-auction", "jpo-supervisor"], data: "통지 여부, 기한, 고위험 신호", output: "auction-action.md", status: "available" },
  { name: "피해지원 신청 서류 점검", category: "피해자 지원", summary: "피해자 결정 신청을 대행하지 않고 요건·제출서류 누락만 분리합니다.", domain: "피해지원 신청 검토", agents: ["jpo-victim"], data: "docChecklist, 상담 유형, 지원 연계 기록", output: "victim-docs.md", status: "available" },
  { name: "법률·주거·심리 연계 후보", category: "지원 연계", summary: "기관 안내 후보를 정리하되 법률 판단이나 실제 신청 실행은 하지 않습니다.", domain: "지원 연계", agents: ["jpo-legal"], data: "상담 유형, 지원 필요 항목, 공식 안내", output: "referral-options.md", status: "available" },
  { name: "상담 요약·안내 초안", category: "산출물 템플릿", summary: "고객 공유 전 반드시 승인 대기 상태로 묶이는 상담 요약과 안내 초안을 만듭니다.", domain: "AI 상담 요약", agents: ["jpo-comms"], data: "상담 맥락, 케이스 상태, 승인 기록", output: "consult-summary.md, approvalRequest", status: "review" },
  { name: "데이터 품질·증적 리포트", category: "외부 데이터 연결", summary: "live_api, snapshot, fallback, manualRequired 상태를 화면과 감사 기록에 명시합니다.", domain: "데이터 연결 상태", agents: ["jpo-dataquality"], data: "sourceMode, 표본 수, 커넥터 상태", output: "source-quality.md", status: "mock" },
  { name: "승인·감사 게이트", category: "담당자 승인 절차", summary: "고위험, 고객 안내, 피해지원 관련 산출물을 사람 승인 흐름에 묶습니다.", domain: "감사 기록", agents: ["jpo-supervisor"], data: "approvals, audit_logs, agent_runs", output: "review-gate.md, evidence-log.md", status: "available" },
];

function jpoCapabilityStatusPill(status) {
  const map = {
    available: ["사용 가능", "jpo-cap-status-available"],
    review: ["검토 중", "jpo-cap-status-review"],
    mock: ["mock", "jpo-cap-status-mock"],
    live: ["live", "jpo-cap-status-live"],
  };
  const [label, cls] = map[status] || [status || "-", "jpo-cap-status-mock"];
  return `<span class="status-pill jpo-cap-status ${cls}">${escapeHtml(label)}</span>`;
}

function jpoCapabilityRisk(capability) {
  if (/경·공매|피해|법률|승인|감사|보증/.test(`${capability.name} ${capability.category} ${capability.domain}`)) return "높음";
  if (/시세|권리|데이터/.test(`${capability.name} ${capability.category} ${capability.domain}`)) return "중간";
  return "낮음";
}

function jpoCapabilityHumanLabel(capability) {
  return /상담|안내|피해|법률|보증|경·공매|승인/.test(`${capability.name} ${capability.category} ${capability.domain}`)
    ? "사람 검토 필요"
    : "담당자 검토 후보";
}

function jpoRiskBadgeLabel(label) {
  const cls = label === "높음" ? "jpo-risk-high" : label === "중간" ? "jpo-risk-mid" : "jpo-risk-low";
  return `<span class="jpo-domain-badge ${cls}">위험도 ${escapeHtml(label)}</span>`;
}

function jpoCapabilityCard(capability) {
  const risk = capability.risk || jpoCapabilityRisk(capability);
  const humanLabel = capability.humanLabel || jpoCapabilityHumanLabel(capability);
  const selected = jpoState.contextSubject?.kind === "capability" && jpoState.contextSubject.id === capability.name;
  return `<article class="jpo-cap-card ${selected ? "is-selected" : ""}" data-jpo-capability="${escapeHtml(capability.name)}" role="button" tabindex="0" aria-pressed="${selected ? "true" : "false"}">
    <header class="jpo-cap-card-head">
      <div><p class="jpo-cap-category">${escapeHtml(capability.category)}</p><h4>${escapeHtml(capability.name)}</h4></div>
      <div class="jpo-card-badges">${jpoCapabilityStatusPill(capability.status)}${jpoRiskBadgeLabel(risk)}</div>
    </header>
    <p class="jpo-cap-summary">${escapeHtml(capability.summary)}</p>
    <div class="jpo-card-badges"><span class="jpo-domain-badge jpo-domain-blue">도메인 ${escapeHtml(capability.domain)}</span><span class="jpo-domain-badge jpo-domain-purple">${escapeHtml(humanLabel)}</span></div>
    <div class="jpo-cap-field"><span>입력 → 출력</span><p>${escapeHtml(capability.data)} → ${escapeHtml(capability.output)}</p></div>
    <div class="jpo-cap-field"><span>연결 에이전트</span><div class="jpo-agent-chips">${capability.agents.map(jpoAgentChip).join("")}</div></div>
    <footer class="jpo-cap-footer"><span>사람 검토: ${escapeHtml(humanLabel.includes("필요") ? "필요" : "후보")}</span><span>${escapeHtml(capability.status)}</span></footer>
  </article>`;
}

function jpoCapabilityRepositoryView() {
  const categories = [...new Set(JPO_CAPABILITY_CATALOG.map((capability) => capability.category))];
  const filters = categories.map((category) => `<span class="jpo-filter-chip">${escapeHtml(category)}</span>`).join("");
  const rows = JPO_CAPABILITY_CATALOG.map((capability) => `<li class="jbwc-row jpo-cap-row">
    <span><strong>${escapeHtml(capability.name)}</strong><br><em>${escapeHtml(capability.category)}</em></span>
    <span>${capability.agents.map((id) => escapeHtml(jpoAgentDisplayName(id))).join(", ")}</span>
    <span>${escapeHtml(capability.data)}</span>
    <span>${escapeHtml(capability.output)}<br>${jpoCapabilityStatusPill(capability.status)}</span>
  </li>`).join("");
  return `<section class="jbwc-hero jpo-hero-slim jpo-cap-hero">
      <p class="eyebrow">전세보호 역할 전용 하네스 · 기능 저장소</p>
      <h2>업무 기능 저장소 · 기술 카탈로그</h2>
      <p>AI 업무지원에서 직접 활용되는 시세, 권리, 보증, 피해지원, 감사 업무 기능 기술을 확인합니다.</p>
      <p class="jpo-keyboard-hint">케이스 처리에 쓰이는 기능·에이전트·데이터·산출물을 업무 단위로 분리했습니다.</p>
    </section>
    ${jpoPanel("기능 카테고리 필터", `<div class="jpo-filter-row">${filters}</div>`)}
    ${jpoPanel(`업무 기능 기술 (${JPO_CAPABILITY_CATALOG.length})`, `<div class="jpo-cap-grid">${JPO_CAPABILITY_CATALOG.map(jpoCapabilityCard).join("")}</div>`)}
    ${jpoPanel("업무 기능 기술 목록", `<ul class="jbwc-list jpo-cap-table">
      <li class="jbwc-row jbwc-row-head"><span>기능</span><span>에이전트</span><span>사용 데이터</span><span>산출물/상태</span></li>
      ${rows}
    </ul>`)}
    ${jpoMockNote()}`;
}

function jpoHarnessView() {
  const agents = jpoTable("harness_agents", JPO_ROLE_KEY);
  const runs = jpoTable("jeonse_agent_runs", JPO_ROLE_KEY).slice(0, 10);
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
    + jpoPanel(`에이전트 저장소 (${agents.length})`, `<div class="jpo-cap-grid">${agents.map((agent) => {
      const reg = registry[agent.id] || {};
      const risk = ["jpo-auction", "jpo-supervisor", "jpo-comms", "jpo-victim", "jpo-legal"].includes(agent.id) ? "높음" : agent.id === "jpo-price" ? "중간" : "낮음";
      return `<article class="jpo-cap-card jpo-agent-repo-card">
        <header class="jpo-cap-card-head"><div><p class="jpo-cap-category">전세보호 에이전트</p><h4>${escapeHtml(agent.name)}</h4></div><div class="jpo-card-badges">${jpoStatusPill(agent.status)}${jpoRiskBadgeLabel(risk)}</div></header>
        <p class="jpo-cap-summary">${escapeHtml(agent.description)}</p>
        <div class="jpo-card-badges"><span class="jpo-domain-badge jpo-domain-blue">도메인 ${escapeHtml(agent.domain)}</span><span class="jpo-domain-badge jpo-domain-purple">사람 검토 ${["높음", "중간"].includes(risk) ? "필요" : "후보"}</span></div>
        <div class="jpo-cap-field"><span>입력 → 출력</span><p>${escapeHtml((reg.dbReads || ["case"]).slice(0, 3).join(" · "))} → ${escapeHtml((reg.dbWrites || ["audit"]).slice(0, 3).join(" · "))}</p></div>
        <div class="jpo-cap-field"><span>금지 액션</span><p>${escapeHtml((reg.blockedActions || ["확정 판단 금지"]).join(" · "))}</p></div>
      </article>`;
    }).join("")}</div>`)
    + jpoPanel(`업무 기능 단위 (Skills · ${skills.length})`, `<div class="jpo-cap-grid">${skills.map((skill) => {
      const linkedAgents = skill.agentIds.map((id) => (registry[id] || {}).displayName || id).join(", ");
      const risk = skill.agentIds.some((id) => ["jpo-auction", "jpo-supervisor", "jpo-comms", "jpo-victim", "jpo-legal"].includes(id)) ? "높음" : "중간";
      return `<article class="jpo-cap-card jpo-skill-repo-card">
        <header class="jpo-cap-card-head"><div><p class="jpo-cap-category">전세보호 스킬</p><h4>${escapeHtml(skill.label)}</h4></div><div class="jpo-card-badges"><span class="status-pill status-new">${escapeHtml(skill.key)}</span>${jpoRiskBadgeLabel(risk)}</div></header>
        <p class="jpo-cap-summary">케이스 처리에 쓰이는 입력/출력 단위입니다. 고객 공유 전에는 담당자 검토가 필요합니다.</p>
        <div class="jpo-cap-field"><span>입력 → 출력</span><p>${escapeHtml(skill.inputs.join(" · "))} → ${escapeHtml(skill.outputs.join(" · "))}</p></div>
        <div class="jpo-cap-field"><span>연결 대상</span><p>${escapeHtml(linkedAgents)}</p></div>
        <div class="jpo-card-badges"><span class="jpo-domain-badge jpo-domain-blue">도메인 전세보호</span><span class="jpo-domain-badge jpo-domain-purple">사람 검토 필요</span></div>
      </article>`;
    }).join("")}</div>`)
    + jpoPanel(`최근 실행 (jeonse_agent_runs · ${runs.length})`, jpoTableView(["실행", "에이전트", "입력→결과", "상태"], runs, (run) => `
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
