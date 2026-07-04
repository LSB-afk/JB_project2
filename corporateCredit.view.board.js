/* 기업여신 하네스 — lifecycle board/dashboard. */

function ccrBoardCard(item) {
  const signals = ccrTable("corporate_credit_risk_signals", CCR_ROLE_KEY).filter((x) => x.caseId === item.id).slice(0, 2);
  return `<article class="jpo-card jbwc-card" data-ccr-open-case="${escapeHtml(item.id)}" role="button" tabindex="0">
    <header><strong>${escapeHtml(item.caseNo)}</strong>${ccrRiskPill(item.riskLevel)}</header>
    <p class="jbwc-meta">${escapeHtml(item.companyAlias)} · ${escapeHtml(item.industry)} · ${escapeHtml(item.region)}</p>
    <p class="jbwc-meta">${escapeHtml(ccrDomainLabel(item.domain))} · ${escapeHtml(item.productType)}</p>
    <p class="jbwc-meta">요청 금액대 ${escapeHtml(item.requestedAmountBand)} · SLA ${escapeHtml(item.dueAt || "-")}</p>
    ${signals.length ? `<p class="jbwc-guard">${signals.map((s) => escapeHtml(s.title)).join(" · ")}</p>` : ""}
    <p class="jbwc-meta">${escapeHtml(ccrUserName(item.assignedRmId))} · ${ccrStatusPill(item.status)}</p>
  </article>`;
}

function ccrDashboardView() {
  const cases = ccrTable("corporate_credit_cases", CCR_ROLE_KEY);
  const active = cases.filter(ccrActiveCase);
  const counts = ccrState.counts || {};
  const kpis = [
    ["금일 신규 운영 건", active.filter((c) => c.createdAt === new Date().toISOString().slice(0, 10)).length],
    ["처리 대기 건", active.length],
    ["승인권자 검토 대기", counts.approvalQueue],
    ["담보·보증 확인 필요", counts.collateralMaturity],
    ["조기경보/EWS", counts.earlyWarning],
    ["여신메모 초안", counts.memoDrafts],
    ["SLA 임박", active.filter((c) => new Date(c.dueAt) - new Date() < 1000 * 60 * 60 * 24 * 3).length],
    ["human review 비율", `${Math.round((active.filter((c) => c.requiresHumanReview).length / Math.max(1, active.length)) * 100)}%`],
  ].map(([label, value]) => `<article class="jbwc-kpi"><p class="jbwc-kpi-value">${escapeHtml(String(value == null ? "…" : value))}</p><p class="jbwc-kpi-label">${escapeHtml(label)}</p><p class="jbwc-kpi-note">기업여신 role scope</p></article>`).join("");
  const cols = CCR_BOARD_COLUMNS.map(([status, label]) => {
    const items = active.filter((item) => item.status === status);
    return `<section class="jpo-board-column"><header class="jpo-board-head"><strong>${escapeHtml(label)}</strong><span class="nav-count">${items.length}</span></header><div class="jpo-board-cards">${items.map(ccrBoardCard).join("") || '<div class="jbwc-empty">해당 단계 케이스 없음</div>'}</div></section>`;
  }).join("");
  const domainCards = Object.entries(CCR_DOMAINS).map(([key, cfg]) => {
    const view = CCR_DOMAIN_VIEW[key] || "cases";
    const count = active.filter((c) => c.domain === key).length;
    return `<button class="jbwc-card jbwc-domain-card" type="button" data-ccr-view="${escapeHtml(view)}"><header><strong>${escapeHtml(cfg.label)}</strong><span class="nav-count">${count}</span></header><p class="jbwc-meta">${escapeHtml(cfg.productTypes.slice(0, 3).join(" · "))}</p></button>`;
  }).join("");
  return `<section class="jbwc-hero jpo-hero-slim">
      <p class="eyebrow">역할 전용 하네스 · 기업여신 루프</p>
      <h2>기업여신 업무지원 포털</h2>
      <p>접수 → 분류 → 자료 보강 → 리스크 신호 → 여신메모 초안 → 가드레일 검증 → 담당자/승인권자 검토 → 감사 기록으로 흐릅니다.</p>
      <div class="jbwc-kpis">${kpis}</div>
    </section>
    ${ccrPanel(`여신 업무 보드 (활성 ${active.length}건)`, `<div class="jpo-board">${cols}</div>`)}
    ${ccrPanel("도메인 카드", `<div class="jbwc-grid">${domainCards}</div>`)}
    ${ccrMockNote()}`;
}
