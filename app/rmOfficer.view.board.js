/* RM 하네스 — 업무보드(Figma 화면 A) + 케이스 SUB(승인 큐) + 통합 MD 뷰어(화면 B).
   키보드 퍼스트: 숫자키로 케이스 선택, 방향키로 에이전트 이동, Enter로 승인·실행. */

function rmoAgentChip(agentId) {
  const agent = rmOfficerAgents.find((a) => a.id === agentId);
  if (!agent) return "";
  return `<span class="rmo-agent-chip" title="${escapeHtml(agent.description)}">${escapeHtml(agent.displayName)}</span>`;
}

/* 케이스 카드 — 요구 2: 소제목 + 얇은 구분선으로 영역을 분리한다(문장 나열 금지).
   번호/고객요약/도메인/계열사 → 상황 → 위험 신호 → 필요 에이전트 → 근거 데이터 → 다음 액션 → 상태. */
function rmoBoardCard(item, index) {
  const selected = rmoState.detail && rmoState.detail.kind === "case" && rmoState.detail.id === item.id;
  const agents = (item.agentPlan || []).map(rmoAgentChip).join("");
  const riskSignalChips = (item.prioritySources || []).slice(0, 3).map((s) => `<span class="rmo-data-chip">${escapeHtml(s.label)}</span>`).join("") || `<span class="jbwc-row-note">연결된 신호 없음</span>`;
  const customerLine = [item.customerAlias, item.customerAge ? `${item.customerAge}세` : ""].filter(Boolean).join(" ");
  const domainLine = [rmoCaseTypeLabel(item.caseType), item.affiliate].filter(Boolean).join(" · ");
  const nextAction = rmoNextActionText(item);
  return `<article class="rmo-case-card ${selected ? "is-selected" : ""}" data-rmo-open-case="${escapeHtml(item.id)}" data-rmo-board-index="${escapeHtml(String(index))}" role="button" tabindex="0" aria-pressed="${selected ? "true" : "false"}">
    <header class="rmo-case-card-head">
      <span class="rmo-case-key" aria-hidden="true">${escapeHtml(String(index + 1))}</span>
      ${rmoStagePill(rmoStageOf(item))}
      ${rmoPriorityPill(item.priority)}
    </header>
    <div class="rmo-case-block rmo-case-block-summary">
      <p class="rmo-case-summary-line"><strong>${escapeHtml(item.caseNo)}</strong> · ${escapeHtml(customerLine)} · ${escapeHtml(item.region)} · ${escapeHtml(item.bank)}</p>
      <h4 class="rmo-case-title">${escapeHtml(item.theme)}</h4>
      <p class="rmo-case-domain-line">${escapeHtml(domainLine)}</p>
    </div>
    <div class="rmo-case-block">
      <p class="rmo-case-subhead">상황</p>
      <p class="rmo-case-situation">${escapeHtml(item.situation)}</p>
    </div>
    <div class="rmo-case-block">
      <p class="rmo-case-subhead">위험 신호</p>
      <p class="rmo-case-reason"><span aria-hidden="true">▎</span>${escapeHtml(item.priorityReason)}</p>
    </div>
    <div class="rmo-case-block">
      <p class="rmo-case-subhead">필요 에이전트</p>
      <div class="rmo-agent-chips">${agents}</div>
    </div>
    <div class="rmo-case-block">
      <p class="rmo-case-subhead">근거 데이터</p>
      <div class="rmo-data-chips">${riskSignalChips}</div>
    </div>
    <div class="rmo-case-block">
      <p class="rmo-case-subhead">다음 액션</p>
      <p class="rmo-case-next-action">${escapeHtml(nextAction)}</p>
    </div>
    <footer class="rmo-case-card-foot">${rmoStagePill(rmoStageOf(item))}<span class="rmo-case-foot-hint">←→ 카드 슬라이드</span></footer>
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
      <h2>RM담당자님 업무 급한 순으로 모아왔어요</h2>
      <p>우선순위는 단순 점수가 아니라 근거 문장과 데이터 출처로 설명됩니다. 급한 순서로 정렬했어요.</p>
    </div>
    <p class="rmo-keyboard-hint" aria-hidden="false">숫자키 Case 선택 · ←→ 케이스 이동 · ↑↓ 에이전트 이동 · Space 다음 스텝 · Enter 실행</p>
  </section>`;
  const subBody = rmoState.detail && rmoState.detail.kind === "case" ? rmoCaseSubSection(rmoState.detail.id) : `<section class="workspace-panel jbwc-panel rmo-sub-empty"><p class="eyebrow">케이스 상세(SUB)</p><div class="jbwc-empty">위 목록에서 케이스를 선택(숫자키/클릭)하면 에이전트 승인 큐와 통합 리포트가 열립니다.</div></section>`;
  /* 요구3 — 업무보드(위)와 SUB(케이스 상세, 아래) 사이 시각적 구분: 좌측 레일 라벨 + 배경 밴드 */
  const sub = `<div class="rmo-sub-band" aria-hidden="true"><span class="rmo-sub-rail-label">SUB</span><span class="rmo-sub-rail-text">케이스 상세 · 에이전트 승인 큐</span></div><div class="rmo-sub-region">${subBody}</div>`;
  return `${banner}
    ${rmoCountHeader(allCases)}
    ${rmoBoardFilters()}
    <section class="workspace-panel jbwc-panel"><p class="eyebrow">업무보드 (${sorted.length}건 · 급한 순)</p><div class="rmo-case-rail" data-rmo-case-rail>${cards}</div></section>
    <div class="rmo-board-sub-divider" aria-hidden="true"></div>
    ${sub}
    ${rmoMockNote()}`;
}

/* 케이스 SUB [상단] — 케이스 요약: 고객/사업자·도메인·계열사·현재 위험 신호·처리 목표 */
function rmoCaseSubSection(caseId) {
  const caseRow = rmoTable("rm_officer_cases", RMO_ROLE_KEY).find((c) => c.id === caseId);
  if (!caseRow) return `<section class="workspace-panel jbwc-panel"><div class="jbwc-empty">케이스를 찾을 수 없습니다.</div></section>`;
  const stageChips = RMO_STAGES.map((s) => `<span class="rmo-stage-chip ${rmoStageOf(caseRow) === s ? "is-active" : ""}">${escapeHtml(RMO_STAGE_SHORT[s])}</span>`).join("");
  const riskSignalChips = (caseRow.prioritySources || []).map((s) => `<span class="rmo-data-chip">${escapeHtml(s.label)}</span>`).join("") || `<span class="jbwc-row-note">연결된 위험 신호 없음</span>`;
  const customerLine = [caseRow.customerAlias, caseRow.customerAge ? `${caseRow.customerAge}세` : "", caseRow.affiliate ? `· ${caseRow.affiliate}` : ""].filter(Boolean).join(" ");
  const caseIndex = Math.max(0, rmoState.boardOrder.indexOf(caseRow.id)) + 1;
  const header = `<section class="workspace-panel jbwc-panel rmo-sub-head">
    <header class="rmo-sub-detail-head">
      <div class="rmo-sub-meta-line">
        <span>Case ${escapeHtml(String(caseIndex || 1))}</span>
        <span>${escapeHtml(caseRow.createdAt)}</span>
        ${rmoRiskPill(caseRow.riskLevel)}
        ${rmoPriorityPill(caseRow.priority)}
      </div>
      <div class="rmo-sub-title-row">
        <div>
          <h3>${escapeHtml(caseRow.theme)}</h3>
          <p class="jbwc-meta">${escapeHtml(customerLine)} · ${escapeHtml(caseRow.region)} · ${escapeHtml(caseRow.bank)} · ${escapeHtml(rmoCaseTypeLabel(caseRow.caseType))} · 담당 ${escapeHtml(rmoUserName(caseRow.assignedRmId))}</p>
        </div>
        <button class="secondary-button" type="button" data-rmo-open-detail="case:${escapeHtml(caseRow.id)}">고객 정보</button>
      </div>
      <p class="rmo-situation">${escapeHtml(caseRow.situation)}</p>
      <div class="rmo-sub-insight-grid">
        <section><span>처리 목표</span><p class="rmo-goal-line"><strong>처리 목표</strong> ${escapeHtml(caseRow.goal || "담당 RM이 검토 가능한 업무 산출물과 승인 경로를 준비한다.")}</p></section>
        <section><span>위험 신호</span><p class="rmo-case-reason"><span aria-hidden="true">▎</span>${escapeHtml(caseRow.priorityReason)}</p></section>
      </div>
      <div class="rmo-sub-actions-row">
        <div class="rmo-data-chips">${riskSignalChips}</div>
        <div class="rmo-stage-chips" role="group" aria-label="작업 상태">${stageChips}</div>
      </div>
    </header>
  </section>`;
  return `<section class="rmo-sub-workspace">
    <aside class="rmo-sub-left-rail" aria-hidden="true">
      <span class="rmo-sub-marker">SUB</span>
      <span class="rmo-sub-marker rmo-sub-marker-md">md</span>
    </aside>
    <div class="rmo-sub-main">
      ${header}
      ${rmoWorkMapSection(caseRow)}
      ${rmoReportTransitionDivider(caseRow)}
      ${rmoDeliverableViewerSection(caseRow)}
      ${rmoApprovalGateSection(caseRow)}
    </div>
  </section>`;
}

/* 노드 상세 카드 — 11필드(agentId/agentName/role/reason/inputData/tools/expectedOutput/status/
   riskLevel/requiresApproval/outputMdPath)를 모두 노출하고, D로 펼치는 추가 상세를 포함한다. */
function rmoWorkMapNodeCard(node, options) {
  const agent = rmOfficerAgents.find((item) => item.id === node.agentId) || {};
  const colorClass = rmoNodeStatusColorClass(node.status);
  const isFocused = options.focused;
  const isExpanded = rmoState.workMapExpandedNodeId === node.id;
  const canExecute = rmoNodeStatus(node.status) === "ready";
  const canRerun = ["completed", "rejected"].includes(rmoNodeStatus(node.status)) && node.kind !== "orchestrator";
  const nodeKeyAttr = node.kind === "orchestrator" ? "" : ` data-rmo-assignment="${escapeHtml(node.id)}"`;
  const output = node.outputMdPath || node.expectedOutput || agent.deliverableFile || "-";
  const minutes = node.estimatedMinutes || agent.estimatedMinutes || 3;
  const dataChips = (node.dataChips && node.dataChips.length ? node.dataChips : node.inputData || []).slice(0, 5);
  const detail = isExpanded ? `<div class="rmo-node-detail">
      <div><span>사용 데이터</span><div class="rmo-data-chips">${(node.inputData || []).map((d) => `<span class="rmo-data-chip">${escapeHtml(d)}</span>`).join("") || "-"}</div></div>
      <div><span>도구/스킬</span><div class="rmo-data-chips">${(node.tools || []).map((t) => `<span class="rmo-agent-chip">${escapeHtml(t)}</span>`).join("") || "-"}</div></div>
      <div><span>산출물 경로</span><strong>${escapeHtml(node.outputMdPath || node.expectedOutput || "-")}</strong></div>
      <div><span>승인 필요 여부</span><strong>${node.requiresApproval ? "필요" : "불필요"}</strong></div>
    </div>` : "";
  return `<article class="rmo-node-card rmo-agent-queue-card ${colorClass} ${isFocused ? "rmo-node-focused" : ""}" data-rmo-node="${escapeHtml(node.id)}" data-rmo-node-kind="${escapeHtml(node.kind)}"${nodeKeyAttr} role="button" tabindex="0">
    <header class="rmo-aq-head">
      <div class="rmo-aq-agent-title"><strong>${escapeHtml(node.agentName || rmoAgentDisplayName(node.agentId))}</strong><span class="rmo-aq-org">${escapeHtml(agent.org || node.agentId)}</span></div>
      <div class="rmo-aq-output"><span>예상 산출물</span><strong>${escapeHtml(output)}</strong></div>
      <div class="rmo-aq-duration">소요 시간 : ${escapeHtml(String(minutes))}분</div>
    </header>
    <div class="rmo-aq-status-row">${rmoRiskPill(node.riskLevel)}<span class="status-pill rmo-node-status-pill">${escapeHtml(rmoNodeStatusLabel(node.status))}</span></div>
    <div class="rmo-aq-body">
      <p><strong>담당 역할</strong> ${escapeHtml(node.role || "-")}</p>
      <p><strong>이 에이전트를 사용하는 이유</strong> ${escapeHtml(node.reason || "-")}</p>
      <p><strong>예상 기대값</strong> ${escapeHtml(node.expectedValue || agent.description || "-")}</p>
      <div class="rmo-data-chips">${dataChips.map((label) => `<span class="rmo-data-chip">${escapeHtml(label)}</span>`).join("") || '<span class="jbwc-row-note">연결 데이터 없음</span>'}</div>
    </div>
    ${rmoNodeStatus(node.status) === "running" ? `<div class="rmo-run-overlay" role="status"><span>조금만 기다려주세요</span><span class="rmo-run-spin" aria-hidden="true">⟳</span></div>` : ""}
    ${rmoNodeStatus(node.status) === "completed" ? `<p class="rmo-aq-done">✔ 산출물 생성 완료</p>` : ""}
    ${detail}
    <footer class="rmo-aq-foot">
      ${isFocused && canExecute ? `<span class="rmo-enter-hint">Enter를 눌러 승인해주세요</span>` : ""}
      ${canExecute ? `<button class="${isFocused ? "primary-button" : "secondary-button"}" type="button" data-rmo-approve="${escapeHtml(node.id)}">승인·실행</button>` : ""}
      ${canRerun ? `<button class="secondary-button" type="button" data-rmo-rerun="${escapeHtml(node.id)}">재실행(R)</button>` : ""}
    </footer>
  </article>`;
}

/* 케이스 SUB [중단] — 에이전트 업무 계층도(Agent Work Map): 총괄 → 분석 브랜치 → 최종 보고서.
   패널 제목에 기존 "에이전트 승인 큐" 표현을 함께 담아 계약을 유지한다. */
function rmoWorkMapSection(caseRow) {
  const tree = rmoBuildWorkMapTree(caseRow);
  const queueNodes = [...tree.branches, ...(tree.report ? [tree.report] : [])];
  rmoState.workMapNodeOrder = queueNodes.map((n) => n.id);
  if (rmoState.workMapFocusIndex < 0 || rmoState.workMapFocusIndex >= queueNodes.length) rmoState.workMapFocusIndex = rmoDefaultWorkMapFocusIndex(queueNodes);
  const focusedId = queueNodes[rmoState.workMapFocusIndex] ? queueNodes[rmoState.workMapFocusIndex].id : null;
  const queueCards = queueNodes.map((n) => rmoWorkMapNodeCard(n, { focused: n.id === focusedId })).join("");
  const focusedName = queueNodes[rmoState.workMapFocusIndex] ? (queueNodes[rmoState.workMapFocusIndex].agentName || rmoAgentDisplayName(queueNodes[rmoState.workMapFocusIndex].agentId)) : "-";
  const hint = `<p class="jbwc-meta rmo-workmap-contract-note">에이전트 업무 계층도 데이터를 승인 큐 카드로 표시합니다. 현재 선택: <strong>${escapeHtml(focusedName)}</strong> · ↑↓ 에이전트 이동 · Space 다음 스텝 · D 상세 · Enter 승인·실행.</p>`;
  return rmoPanel(`에이전트 승인 큐 (${queueNodes.length})`, `${hint}
    <div class="rmo-workmap">
      ${queueCards}
    </div>`);
}

function rmoReportTransitionDivider(caseRow) {
  const assignments = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY).filter((a) => a.caseId === caseRow.id);
  const branches = assignments.filter((a) => a.kind !== "report");
  const reportNode = assignments.find((a) => a.kind === "report");
  const doneBranches = branches.filter((a) => rmoNodeStatus(a.status) === "completed").length;
  const integrated = rmoTable("rm_officer_deliverables", RMO_ROLE_KEY).find((d) => d.caseId === caseRow.id && d.kind === "integrated");
  const reportStatus = reportNode ? rmoNodeStatusLabel(reportNode.status) : "대기";
  const title = integrated ? "다음 단계 · 통합 리포트 검토" : "다음 단계 · MD 산출물 생성 대기";
  const desc = integrated
    ? "에이전트 실행 결과가 통합본으로 합쳐졌습니다. Enter로 통합 리포트 뷰어 위치를 확인하고, 최종 승인은 A로 분리합니다."
    : "위 에이전트 승인 큐에서 개별 분석을 완료하면 아래 통합 리포트 뷰어가 열립니다. 보고서 실행 노드는 선행 분석 완료 후 활성화됩니다.";
  return `<section class="rmo-report-step-divider" data-rmo-report-step>
    <div>
      <span class="rmo-step-kicker">AGENT OUTPUT → MD REPORT</span>
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(desc)}</p>
    </div>
    <dl>
      <div><dt>분석 완료</dt><dd>${escapeHtml(String(doneBranches))}/${escapeHtml(String(branches.length))}</dd></div>
      <div><dt>보고서 노드</dt><dd>${escapeHtml(reportStatus)}</dd></div>
      <div><dt>통합본</dt><dd>${integrated ? "준비됨" : "대기"}</dd></div>
    </dl>
  </section>`;
}

/* 케이스 SUB [하단 · 직원 최종 승인] — report 노드가 완료/승인대기 상태일 때만 A(승인) 버튼 활성화 */
function rmoApprovalGateSection(caseRow) {
  const reportNode = rmoTable("rm_officer_agent_assignments", RMO_ROLE_KEY).find((a) => a.caseId === caseRow.id && a.kind === "report");
  const status = reportNode ? rmoNodeStatus(reportNode.status) : "notStarted";
  const ready = status === "needsApproval" || (status === "completed" && caseRow.status !== "completed");
  const alreadyApproved = caseRow.status === "completed";
  const message = alreadyApproved
    ? "이 케이스는 직원 최종 승인이 완료되었습니다."
    : status === "needsApproval"
      ? "통합 보고서가 준비되었습니다. A를 눌러 직원 최종 승인을 진행하세요."
      : "통합 보고서가 아직 준비되지 않았습니다. 먼저 모든 분석 노드를 완료하세요.";
  return `<section class="workspace-panel jbwc-panel rmo-approval-gate">
    <p class="eyebrow">직원 최종 승인 (Human Approval)</p>
    <p class="jbwc-meta">${escapeHtml(message)}</p>
    <button class="primary-button" type="button" data-rmo-approve-case="${escapeHtml(caseRow.id)}" ${ready ? "" : "disabled"}>A 승인 · 케이스 완료 처리</button>
  </section>`;
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
  return `<div class="rmo-md-viewer-section" data-rmo-md-viewer>${rmoPanel("통합 리포트 뷰어",
    `<div class="jbwc-tabs rmo-md-tabs" role="tablist">${tabBar}</div>
    <div class="rmo-md-body jbwc-tabbody">${rmoRenderMarkdownSections(active.body)}</div>
    <div class="settings-button-row"><button class="secondary-button" type="button" data-rmo-open-md="${escapeHtml(active.fileName)}">문서 모달로 크게 보기</button></div>
    ${extra}`)}</div>`;
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
