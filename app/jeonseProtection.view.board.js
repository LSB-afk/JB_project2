/* 전세사기 보호 하네스 — 위험 접수 보드 (lifecycle 칸반). */

function jpoBoardCard(item) {
  const topSignals = jpoTable("jeonse_risk_signals", JPO_ROLE_KEY)
    .filter((signal) => signal.caseId === item.id)
    .slice(0, 3);
  const contractDays = (() => {
    if (!item.contractEndDate) return null;
    const target = new Date(item.contractEndDate);
    if (Number.isNaN(target.getTime())) return null;
    return Math.ceil((target.getTime() - Date.now()) / 86400000);
  })();
  const contractLine = contractDays == null
    ? "계약일 미정"
    : contractDays >= 0 ? `계약 예정 D-${contractDays}` : `만기 경과 D+${Math.abs(contractDays)}`;
  return `<article class="jpo-card jbwc-card" data-jpo-open-case="${escapeHtml(item.id)}" role="button" tabindex="0">
    <header><strong>${escapeHtml(jpoCaseNoLabel(item.caseNo))}</strong>${jpoRiskPill(item.riskLevel)}</header>
    <p class="jbwc-meta">${escapeHtml(jpoCustomerLabel(item.customerRefId))} · ${escapeHtml(jpoHousingTypeLabel(item.housingType))}</p>
    <p class="jbwc-meta">${escapeHtml(item.addressMasked)}</p>
    <p class="jbwc-meta">보증금 ${escapeHtml(jpoWon(item.depositAmount))} · ${escapeHtml(contractLine)}</p>
    ${topSignals.length ? `<p class="jbwc-guard">${topSignals.map((signal) => escapeHtml(signal.title)).join(" · ")}</p>` : ""}
    ${item.requiresHumanReview ? `<p class="jbwc-guard">담당자 검토 필요</p>` : ""}
    <p class="jbwc-meta">${escapeHtml(jpoUserName(item.assignedToId))} · SLA ${escapeHtml(item.dueAt || "-")} ${jpoSourceModePill(item.sourceMode)}</p>
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
  ].map(([label, value]) => `<article class="jbwc-kpi"><p class="jbwc-kpi-value">${escapeHtml(String(value == null ? "…" : value))}</p><p class="jbwc-kpi-label">${escapeHtml(label)}</p><p class="jbwc-kpi-note">전세보호 업무 기준 집계</p></article>`).join("");
  return `<section class="jbwc-hero jpo-hero-slim">
      <p class="eyebrow">역할 전용 업무 하네스 · 시세·권리·보증·피해지원</p>
      <h2>전세사기 보호 업무지원 포털</h2>
      <p>AI는 위험 "신호"와 확인 항목만 제안하고, 전세사기 여부·법률·보증·피해자 결정은 항상 담당자가 판단합니다.</p>
      <div class="jbwc-kpis">${strip}</div>
    </section>
    ${jpoPanel(`위험 접수 보드 (활성 ${cases.filter(jpoActiveCase).length}건)`, `<div class="jpo-board">${columns}</div>`)}
    ${jpoOfficialRefNote()}
    ${jpoMockNote()}`;
}
