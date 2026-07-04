/* JB우리캐피탈 운영 포털 — 업무 보드(dashboard) view.
   그룹 확장성 증명 노드: 전북은행 Hero와 동일한 운영 패턴(접수→분류→에이전트→사람 승인→감사)을 재사용한다. */

function jbwcDashboardView() {
  const counts = jbwcState.counts || {};
  const kpis = getJbWooriCapitalDashboardKpis();
  const tasks = jbwcTable("ops_tasks", JBWC_AFFILIATE_ID)
    .filter((item) => ["open", "inProgress", "overdue"].includes(item.status) || item.dueAt === new Date().toISOString().slice(0, 10));
  const cases = jbwcTable("ops_cases", JBWC_AFFILIATE_ID).filter(jbwcActiveCase);
  const domainCountKey = {
    personalFinance: "personalFinance",
    autoFinance: "autoFinance",
    mortgageSecured: "mortgageSecured",
    enterpriseFinance: "enterpriseFinance",
    customerManagement: "customerManagement",
    documentContract: "documents",
    vehicleLifecycle: "vehicleLifecycle",
    consumerProtection: "consumerProtection",
    fdsVoicePhishing: "fds",
    complaintContactCenter: "complaints",
    complianceInternalControl: "privacyPermissions",
  };
  const domainCards = Object.entries(JBWC_DOMAIN_TAXONOMY).map(([domain, cfg]) => {
    const value = counts[domainCountKey[domain]];
    return `<button class="jbwc-card jbwc-domain-card" type="button" data-jbwc-view="${escapeHtml(cfg.routeView)}">
      <header><strong>${escapeHtml(cfg.label)}</strong><span class="status-pill status-new">${escapeHtml(value == null ? "…" : String(value))}</span></header>
      <p class="jbwc-meta">${escapeHtml(cfg.products.slice(0, 4).join(" · "))}</p>
      <p class="jbwc-guard">데이터 범위 affiliateId=${escapeHtml(JBWC_AFFILIATE_ID)}</p>
    </button>`;
  }).join("");
  return `<section class="jbwc-hero">
      <p class="eyebrow">계열사 전용 운영 하네스 · 그룹 확장성 증명</p>
      <h2>JB우리캐피탈 운영센터</h2>
      <p>캐피탈·여신·자동차금융·고객보호 업무를 메인 하네스와 분리해 처리하는 내부 운영 시스템입니다.
      전북은행 Hero와 동일한 운영 패턴(접수 → 분류 → 에이전트 → 사람 승인 → 감사 기록)을 계열사로 확장한 화면입니다.</p>
      <div class="jbwc-kpis">${kpis.map(([label, value, note]) => `
        <article class="jbwc-kpi"><p class="jbwc-kpi-value">${escapeHtml(value)}</p>
        <p class="jbwc-kpi-label">${escapeHtml(label)}</p><p class="jbwc-kpi-note">${escapeHtml(note)}</p></article>`).join("")}</div>
    </section>
    ${jbwcPanel("도메인 카드", `<div class="jbwc-grid">${domainCards}</div>`)}
    ${jbwcPanel(`오늘 처리할 태스크 (${tasks.length})`, jbwcTableView(["태스크", "관련 건", "담당", "상태"], tasks, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.title)}<br><span class="jbwc-row-note">${escapeHtml(x.caseId || "-")}</span></span>
        <span>${escapeHtml(jbwcUserName(x.ownerId))} · 기한 ${escapeHtml(x.dueAt || "-")}</span>
        <span>${jbwcStatusPill(x.status)}</span></li>`))}
    ${jbwcPanel(`진행 중 운영 건 (${cases.length})`, jbwcCaseListMarkup(cases))}
    ${jbwcMockNote()}`;
}
