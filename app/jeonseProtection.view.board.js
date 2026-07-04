/* 전세사기 보호 하네스 — 위험 접수 보드 (lifecycle 칸반). */

function jpoBoardCard(item) {
  const topSignals = jpoCaseSignals(item.id, 3);
  const contractLine = item.contractEndDate ? `계약/만기 ${item.contractEndDate}` : "계약일 미정";
  const agents = jpoCaseAgentIds(item, false).slice(0, 4);
  const dataChips = jpoCaseDataChips(item).slice(0, 4);
  return `<article class="jpo-card jbwc-card" data-jpo-open-case="${escapeHtml(item.id)}" role="button" tabindex="0">
    <header class="jpo-card-head">
      <div><strong>${escapeHtml(item.caseNo)}</strong><span>${escapeHtml(jpoCasePriorityLabel(item))}</span></div>
      ${jpoRiskPill(item.riskLevel)}
    </header>
    <div class="jpo-card-block jpo-card-summary">
      <p class="jpo-case-line">${escapeHtml(item.customerRefId)} · ${escapeHtml(jpoHousingTypeLabel(item.housingType))}</p>
      <p class="jpo-case-line">${escapeHtml(item.addressMasked)}</p>
      <p class="jpo-case-line"><strong>보증금 ${escapeHtml(jpoWon(item.depositAmount))}</strong> · ${escapeHtml(contractLine)}</p>
    </div>
    <div class="jpo-card-block">
      <p class="jpo-case-subhead">상황</p>
      <p class="jpo-case-text">${escapeHtml(jpoIntakeTypeLabel(item.intakeType))} · ${escapeHtml(jpoStatusLabel(item.status))}</p>
    </div>
    <div class="jpo-card-block">
      <p class="jpo-case-subhead">우선순위 근거</p>
      <p class="jpo-case-reason">${escapeHtml(jpoCasePriorityReason(item, topSignals))}</p>
    </div>
    <div class="jpo-card-block">
      <p class="jpo-case-subhead">필요 에이전트</p>
      <div class="jpo-agent-chips">${agents.map(jpoAgentChip).join("")}</div>
    </div>
    <div class="jpo-card-block">
      <p class="jpo-case-subhead">근거 데이터</p>
      <div class="jpo-data-chips">${dataChips.map(jpoDataChip).join("")}</div>
      ${topSignals.length ? `<p class="jbwc-guard">${topSignals.map((signal) => escapeHtml(signal.title)).join(" · ")}</p>` : ""}
    </div>
    <div class="jpo-card-block">
      <p class="jpo-case-subhead">다음 액션</p>
      <p class="jpo-case-next">${escapeHtml(jpoCaseNextAction(item))}</p>
    </div>
    <footer class="jpo-card-foot">
      <span>담당 ${escapeHtml(jpoUserName(item.assignedToId))}</span>
      <span>SLA ${escapeHtml(item.dueAt || "-")}</span>
      ${jpoSourceModePill(item.sourceMode)}
    </footer>
  </article>`;
}

function jpoDashboardView() {
  const cases = jpoTable("jeonse_cases", JPO_ROLE_KEY);
  const counts = jpoState.counts || {};
  const columns = JPO_BOARD_COLUMNS.map(([status, label]) => {
    const items = cases.filter((item) => item.status === status);
    return `<section class="jpo-board-column" data-board-column="${escapeHtml(status)}">
      <header class="jpo-board-head"><strong>${escapeHtml(label)}</strong><span class="nav-count">${items.length}</span></header>
      <div class="jpo-board-cards">${items.map(jpoBoardCard).join("") || '<div class="jbwc-empty">해당 단계 케이스 없음</div>'}</div>
    </section>`;
  }).join("");
  const strip = [
    ["긴급 경·공매", counts.urgentAuction],
    ["담당자 검토 필요", cases.filter((c) => c.status === "humanReview").length],
    ["데이터 보강 필요", counts.priceEnrich],
    ["승인 대기", counts.approvals],
  ].map(([label, value]) => `<article class="jbwc-kpi"><p class="jbwc-kpi-value">${escapeHtml(String(value == null ? "…" : value))}</p><p class="jbwc-kpi-label">${escapeHtml(label)}</p><p class="jbwc-kpi-note">role scope 집계</p></article>`).join("");
  return `<section class="jbwc-hero jpo-hero-slim">
      <p class="eyebrow">역할 전용 업무 하네스 · 시세·권리·보증·피해지원</p>
      <h2>전세사기 보호 업무지원 포털</h2>
      <p>AI는 위험 "신호"와 확인 항목만 제안하고, 전세사기 여부·법률·보증·피해자 결정은 항상 담당자가 판단합니다.</p>
      <p class="jpo-keyboard-hint">숫자키로 케이스 확인 · 방향키로 카드 이동 · Enter로 상세/승인 흐름 확인</p>
      <div class="jbwc-kpis">${strip}</div>
    </section>
    ${jpoPanel(`위험 접수 보드 (활성 ${cases.filter(jpoActiveCase).length}건)`, `<div class="jpo-board">${columns}</div>`)}
    ${jpoOfficialRefNote()}
    ${jpoMockNote()}`;
}
