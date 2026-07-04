/* RM 하네스 — 업무보드(Figma 화면 A) + 케이스 SUB(승인 큐) + 통합 MD 뷰어(화면 B).
   키보드 퍼스트: 숫자키로 케이스 선택, 방향키로 에이전트 이동, Enter로 승인·실행. */

function rmoAgentChip(agentId) {
  const agent = rmOfficerAgents.find((a) => a.id === agentId);
  if (!agent) return "";
  return `<span class="rmo-agent-chip" title="${escapeHtml(agent.description)}">${escapeHtml(agent.displayName)}</span>`;
}

function rmoBoardCard(item, index) {
  const selected = rmoState.detail && rmoState.detail.kind === "case" && rmoState.detail.id === item.id;
  const agents = (item.agentPlan || []).map(rmoAgentChip).join("");
  return `<article class="rmo-case-card ${selected ? "is-selected" : ""}" data-rmo-open-case="${escapeHtml(item.id)}" role="button" tabindex="0" aria-pressed="${selected ? "true" : "false"}">
    <header class="rmo-case-card-head">
      <span class="rmo-case-key" aria-hidden="true">${escapeHtml(String(index + 1))}</span>
      ${rmoStagePill(rmoStageOf(item))}
      ${rmoPriorityPill(item.priority)}
    </header>
    <p class="rmo-case-meta">${escapeHtml(item.customerAlias)} · ${escapeHtml(item.caseNo)} · ${escapeHtml(item.region)} · ${escapeHtml(item.bank)}</p>
    <h4 class="rmo-case-title">${escapeHtml(item.theme)}</h4>
    <p class="rmo-case-situation">${escapeHtml(item.situation)}</p>
    <p class="rmo-case-reason"><span aria-hidden="true">▎</span>우선순위 근거: ${escapeHtml(item.priorityReason)}</p>
    <div class="rmo-agent-chips">${agents}</div>
  </article>`;
}

function rmoCountHeader(allCases) {
  const stageCount = (s) => allCases.filter((c) => rmoStageOf(c) === s).length;
  const cells = [
    ["todo", stageCount("todo")],
    ["doing", stageCount("doing")],
    ["done", stageCount("done")],
  ].map(([stage, value]) => `<div class="rmo-count-cell rmo-count-${stage}"><span class="rmo-count-value">${escapeHtml(String(value))}</span><span class="rmo-count-label">${escapeHtml(RMO_STAGE_LABELS[stage])}</span></div>`).join("");
  return `<div class="rmo-count-header" aria-label="진행 단계별 케이스 수">${cells}</div>`;
}

function rmoBoardFilters() {
  const options = [["all", "전체"], ["todo", "처리해야할 작업 전"], ["doing", "처리해야할 작업 중"], ["done", "처리해야할 작업 후"]];
  return `<div class="rmo-filter-row" role="tablist" aria-label="진행 단계 필터">${options.map(([value, label]) => `<button type="button" class="rmo-filter ${rmoState.boardFilter === value ? "is-active" : ""}" role="tab" aria-selected="${rmoState.boardFilter === value ? "true" : "false"}" data-rmo-filter="${value}">${escapeHtml(label)}</button>`).join("")}</div>`;
}

function rmoBoardView() {
  const allCases = rmoTable("rm_officer_cases", RMO_ROLE_KEY);
  const filter = rmoState.boardFilter;
  const filtered = filter === "all" ? allCases : allCases.filter((c) => rmoStageOf(c) === filter);
  const sorted = rmoSortByUrgency(filtered);
  rmoState.boardOrder = sorted.map((c) => c.id);
  const cards = sorted.map((item, index) => rmoBoardCard(item, index)).join("") || `<div class="jbwc-empty">해당 단계 케이스가 없습니다.</div>`;
  const banner = `<section class="jbwc-hero rmo-banner">
    <div>
      <p class="eyebrow">역할 전용 하네스 · RM 업무보드</p>
      <h2>RM님 업무 급한 순으로 모아왔어요</h2>
      <p>우선순위는 단순 점수가 아니라 근거 문장과 데이터 출처로 설명됩니다. 급한 순서로 정렬했어요.</p>
    </div>
    <p class="rmo-keyboard-hint" aria-hidden="false">키보드 숫자를 눌러 Case를 확인하세요 · 방향키로 에이전트 이동 · Enter로 승인·실행</p>
  </section>`;
  const sub = rmoState.detail && rmoState.detail.kind === "case" ? rmoCaseSubSection(rmoState.detail.id) : `<section class="workspace-panel jbwc-panel rmo-sub-empty"><p class="eyebrow">케이스 상세(SUB)</p><div class="jbwc-empty">위 목록에서 케이스를 선택(숫자키/클릭)하면 에이전트 승인 큐와 통합 리포트가 열립니다.</div></section>`;
  return `${banner}
    ${rmoCountHeader(allCases)}
    ${rmoBoardFilters()}
    <section class="workspace-panel jbwc-panel"><p class="eyebrow">업무보드 (${sorted.length}건 · 급한 순)</p><div class="rmo-case-rail">${cards}</div></section>
    ${sub}
    ${rmoMockNote()}`;
}

/* 케이스 SUB — 헤더 카드 + 상태 칩 + 에이전트 승인 큐 + (완료 시)통합 MD 뷰어 */
function rmoCaseSubSection(caseId) {
  const caseRow = rmoTable("rm_officer_cases", RMO_ROLE_KEY).find((c) => c.id === caseId);
  if (!caseRow) return `<section class="workspace-panel jbwc-panel"><div class="jbwc-empty">케이스를 찾을 수 없습니다.</div></section>`;
  const stageChips = RMO_STAGES.map((s) => `<span class="rmo-stage-chip ${rmoStageOf(caseRow) === s ? "is-active" : ""}">${escapeHtml(RMO_STAGE_SHORT[s])}</span>`).join("");
  const header = `<section class="workspace-panel jbwc-panel rmo-sub-head">
    <header class="rmo-sub-head-row">
      <div>
        <p class="eyebrow">Case · ${escapeHtml(caseRow.createdAt)} · ${escapeHtml(RMO_RISK_LABELS[caseRow.riskLevel] || caseRow.riskLevel)} 위험</p>
        <h3>${escapeHtml(caseRow.caseNo)} · ${escapeHtml(caseRow.theme)}</h3>
        <p class="jbwc-meta">${escapeHtml(caseRow.customerAlias)} · ${escapeHtml(caseRow.region)} · ${escapeHtml(caseRow.bank)} · 담당 ${escapeHtml(rmoUserName(caseRow.assignedRmId))}</p>
        <p class="rmo-situation">${escapeHtml(caseRow.situation)}</p>
        <p class="rmo-case-reason"><span aria-hidden="true">▎</span>${escapeHtml(caseRow.priorityReason)}</p>
      </div>
      <div class="rmo-sub-head-side">
        ${rmoRiskPill(caseRow.riskLevel)} ${rmoPriorityPill(caseRow.priority)}
        <button class="secondary-button" type="button" data-rmo-open-detail="case:${escapeHtml(caseRow.id)}">고객 정보</button>
        <div class="rmo-stage-chips">${stageChips}</div>
      </div>
    </header>
  </section>`;
  return header + rmoAgentQueueSection(caseRow) + rmoDeliverableViewerSection(caseRow);
}

/* 에이전트 승인 큐 — 각 카드: 에이전트·소속·산출물.md·소요·이유·기대값·데이터칩 + Enter 승인 */
function rmoAgentQueueSection(caseRow) {
  const assignments = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY)
    .filter((a) => a.caseId === caseRow.id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const pending = assignments.filter((a) => a.status === "pendingApproval");
  rmoState.assignmentOrder = pending.map((a) => a.id);
  if (rmoState.selectedAssignmentIndex >= pending.length) rmoState.selectedAssignmentIndex = Math.max(0, pending.length - 1);
  const selectedPending = pending[rmoState.selectedAssignmentIndex] || null;
  const cards = assignments.map((a) => {
    const agent = rmOfficerAgents.find((x) => x.id === a.agentId) || {};
    const isSelected = a.status === "pendingApproval" && selectedPending && a.id === selectedPending.id;
    const running = a.status === "running";
    const done = a.status === "completed";
    const chips = (a.dataChips || []).map((chip) => `<span class="rmo-data-chip">${escapeHtml(chip)}</span>`).join("");
    return `<article class="rmo-agent-queue-card ${isSelected ? "is-selected" : ""} ${done ? "is-done" : ""} ${running ? "is-running" : ""}" data-rmo-assignment="${escapeHtml(a.id)}">
      <header class="rmo-aq-head">
        <div><strong>${escapeHtml(agent.displayName || a.agentId)}</strong><span class="rmo-aq-org">${escapeHtml(agent.org || "-")}</span></div>
        <div class="rmo-aq-meta">${escapeHtml(a.expectedOutput)} · 소요 ${escapeHtml(String(a.estimatedMinutes))}분 ${rmoStatusPill(a.status)}</div>
      </header>
      <p class="jbwc-meta">이 에이전트를 사용하는 이유: ${escapeHtml(a.reason)}</p>
      <p class="jbwc-meta">예상 기대값: ${escapeHtml(a.expectedValue)}</p>
      <div class="rmo-data-chips">${chips}</div>
      ${running ? `<div class="rmo-run-overlay" role="status"><span class="rmo-run-spin" aria-hidden="true">⟳</span> 조금만 기다려주세요<span class="rmo-progress-indeterminate" aria-hidden="true"></span></div>` : ""}
      ${done ? `<p class="rmo-aq-done">✔ 산출물 생성 완료 — 아래 통합 리포트에서 확인</p>` : ""}
      ${isSelected ? `<footer class="rmo-aq-foot"><span class="rmo-enter-hint">Enter를 눌러 승인해주세요</span><button class="primary-button" type="button" data-rmo-approve="${escapeHtml(a.id)}">승인·실행</button></footer>` : (a.status === "pendingApproval" ? `<footer class="rmo-aq-foot"><button class="secondary-button" type="button" data-rmo-approve="${escapeHtml(a.id)}">승인·실행</button></footer>` : "")}
    </article>`;
  }).join("");
  const hint = pending.length
    ? `<p class="jbwc-meta">현재 선택: <strong>${escapeHtml(selectedPending ? rmoAgentDisplayName(selectedPending.agentId) : "-")}</strong> · 승인하지 않을 에이전트는 그대로 두어도 됩니다.</p>`
    : `<p class="jbwc-meta">대기 중인 승인 큐가 없습니다. 실행 결과는 통합 리포트에서 확인하세요.</p>`;
  return rmoPanel(`에이전트 승인 큐 (${assignments.length})`, `${hint}<div class="rmo-agent-queue">${cards}</div>`);
}

/* 통합 MD 뷰어(화면 B) — 탭[통합본 | 개별.md] + 본문 + 접이식[에이전트/스킬 표 · 출처] */
function rmoDeliverableViewerSection(caseRow) {
  const deliverables = rmoTable("rm_officer_deliverables", RMO_ROLE_KEY).filter((d) => d.caseId === caseRow.id);
  if (!deliverables.length) return "";
  const integrated = deliverables.find((d) => d.kind === "integrated");
  const agentDocs = deliverables.filter((d) => d.kind === "agent");
  const tabs = [];
  if (integrated) tabs.push({ key: "통합본", doc: integrated });
  agentDocs.forEach((d) => tabs.push({ key: d.fileName, doc: d }));
  let activeKey = rmoState.mdTab;
  if (!tabs.some((t) => t.key === activeKey)) activeKey = tabs[0].key;
  const active = tabs.find((t) => t.key === activeKey).doc;
  const tabBar = tabs.map((t) => `<button type="button" class="jbwc-tab ${t.key === activeKey ? "is-active" : ""}" data-rmo-md-tab="${escapeHtml(t.key)}">${escapeHtml(t.key)}</button>`).join("");
  let extra = "";
  if (integrated && active.kind === "integrated") {
    const rows = (integrated.contributionRows || []).map((r) => `<li class="jbwc-row"><span>${escapeHtml(r.agent)}</span><span>${escapeHtml(r.fileName)}</span><span>${escapeHtml(r.data)}</span><span>${escapeHtml(r.date)}</span><span>${escapeHtml(String(r.contribution))}%</span></li>`).join("");
    const sources = (integrated.sources || []).map((s) => `<li class="jbwc-row"><span>${escapeHtml(s.label)}</span><span class="jbwc-row-note">${escapeHtml(s.ref)}</span></li>`).join("");
    extra = `<details class="rmo-md-fold"><summary>사용 에이전트/스킬 표 (${(integrated.contributionRows || []).length})</summary><ul class="jbwc-list"><li class="jbwc-row jbwc-row-head"><span>에이전트</span><span>산출물.md</span><span>사용 데이터</span><span>날짜</span><span>관여율</span></li>${rows}</ul></details>
    <details class="rmo-md-fold"><summary>사용 출처 (${(integrated.sources || []).length})</summary><ul class="jbwc-list">${sources}</ul></details>`;
  }
  return rmoPanel("통합 리포트 뷰어",
    `<div class="jbwc-tabs rmo-md-tabs" role="tablist">${tabBar}</div>
    <div class="rmo-md-body jbwc-tabbody">${rmoRenderMarkdown(active.body)}</div>
    <div class="settings-button-row"><button class="secondary-button" type="button" data-rmo-open-md="${escapeHtml(active.fileName)}">문서 모달로 크게 보기</button></div>
    ${extra}`);
}

/* 문서 모달(화면 C) — 보드 딤 + md 플로팅 모달(메타 → 제목 → Summary → 근거 표) */
function rmoDocumentModalMarkup() {
  if (!rmoState.modal || !rmoState.modal.fileName) return "";
  const doc = rmoTable("rm_officer_deliverables", RMO_ROLE_KEY).find((d) => d.fileName === rmoState.modal.fileName && (!rmoState.modal.caseId || d.caseId === rmoState.modal.caseId))
    || rmoTable("rm_officer_deliverables", RMO_ROLE_KEY).find((d) => d.fileName === rmoState.modal.fileName);
  if (!doc) return "";
  return `<div class="jbwc-modal-backdrop rmo-modal-backdrop" data-rmo-close-modal>
    <div class="jbwc-modal rmo-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(doc.fileName)}">
      <header class="rmo-modal-head"><strong>${escapeHtml(doc.fileName)}</strong><button class="secondary-button" type="button" data-rmo-close-modal>닫기 (Esc)</button></header>
      <div class="rmo-md-body">${rmoRenderMarkdown(doc.body)}</div>
      <p class="jbwc-mock-note">내부 업무 참고용 · 통합본 안에서 개별 md로 이동 가능</p>
    </div>
  </div>`;
}
