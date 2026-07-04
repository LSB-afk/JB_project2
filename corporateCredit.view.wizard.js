/* 기업여신 하네스 — 신규 운영 건 접수 wizard. */

function ccrOptions(options, selected) {
  return options.map(([value, label]) => `<option value="${escapeHtml(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
}

function ccrCollectWizard(form) {
  const fd = new FormData(form);
  return {
    domain: String(fd.get("domain") || "workingCapital"),
    productType: String(fd.get("productType") || ""),
    title: String(fd.get("title") || ""),
    description: String(fd.get("description") || ""),
    borrowerRefId: String(fd.get("borrowerRefId") || ""),
    companyAlias: String(fd.get("companyAlias") || ""),
    industry: String(fd.get("industry") || "manufacturing"),
    region: String(fd.get("region") || ""),
    requestedAmountBand: String(fd.get("requestedAmountBand") || "1억~5억"),
    assignedRmId: String(fd.get("assignedRmId") || "USR-CCR-RM-01"),
    priority: String(fd.get("priority") || "normal"),
    riskLevel: String(fd.get("riskLevel") || "medium"),
    dueAt: String(fd.get("dueAt") || ""),
    financialBaseMonth: String(fd.get("financialBaseMonth") || "2026-05"),
    docsReceived: Boolean(fd.get("docsReceived")),
    collateralExists: Boolean(fd.get("collateralExists")),
    guaranteeExists: Boolean(fd.get("guaranteeExists")),
    requiresHumanReview: Boolean(fd.get("requiresHumanReview")),
    sourceChannel: String(fd.get("sourceChannel") || "opsPortal"),
    tags: String(fd.get("tags") || ""),
  };
}

function ccrWizardPreviewMarkup(preview) {
  return `<div class="jbwc-preview-grid">
    <div><span>추천 에이전트</span><strong>${escapeHtml(ccrAgentDisplayName(preview.recommendedAgent))}</strong></div>
    <div><span>추천 담당팀</span><strong>${escapeHtml(preview.recommendedTeam)}</strong></div>
    <div><span>초기 상태</span><strong>${escapeHtml(CCR_STATUS_LABELS[preview.initialStatus] || preview.initialStatus)}</strong></div>
    <div><span>위험도</span><strong>${escapeHtml(CCR_RISK_LABELS[preview.riskLevel] || preview.riskLevel)}</strong></div>
    <div><span>담당자 검토</span><strong>${preview.requiresHumanReview ? "필요" : "일반 큐"}</strong></div>
    <div><span>에스컬레이션</span><strong>${preview.escalationRequired ? "필요" : "없음"}</strong></div>
  </div>
  <ul class="jbwc-list">${preview.signals.map((s) => `<li class="jbwc-row"><span>${ccrRiskPill(s.severity)} ${escapeHtml(s.title)}</span><span class="jbwc-row-note">${escapeHtml(s.evidence)}</span></li>`).join("") || '<li class="jbwc-row"><span>신규 리스크 신호 없음</span></li>'}</ul>
  <p class="jbwc-guard">미리보기는 내부 운영 참고용입니다. 승인·거절·금리·한도·신용평가 판단은 생성하지 않습니다.</p>`;
}

function ccrCaseCreationView() {
  const domainOptions = Object.entries(CCR_DOMAINS).map(([value, cfg]) => [value, cfg.label]);
  const currentDomain = CCR_DOMAINS[ccrCaseWizard.domain] || CCR_DOMAINS.workingCapital;
  const productOptions = currentDomain.productTypes.map((value) => [value, value]);
  const users = ccrTable("corporate_credit_users", CCR_ROLE_KEY).map((u) => [u.id, `${u.name} · ${u.team}`]);
  const preview = previewCorporateCreditTriage(ccrCaseWizard);
  return ccrPanel("신규 기업여신 운영 건 접수", `
    <form id="ccr-new-case-form" class="jbwc-wizard">
      <section class="jbwc-step"><h3>1단계. 업무 유형 선택</h3>
        <label>업무 도메인<select name="domain" data-ccr-wizard-field>${ccrOptions(domainOptions, ccrCaseWizard.domain)}</select></label>
      </section>
      <section class="jbwc-step"><h3>2단계. 상품/업무 세부 유형</h3>
        <label>상품/업무 유형<select name="productType" data-ccr-wizard-field>${ccrOptions(productOptions, ccrCaseWizard.productType)}</select></label>
      </section>
      <section class="jbwc-step"><h3>3단계. 케이스 정보</h3>
        <div class="jbwc-form-grid">
          <label>제목<input name="title" value="${escapeHtml(ccrCaseWizard.title)}" /></label>
          <label>익명 기업 ID<input name="borrowerRefId" value="${escapeHtml(ccrCaseWizard.borrowerRefId)}" /></label>
          <label>익명 기업명<input name="companyAlias" value="${escapeHtml(ccrCaseWizard.companyAlias)}" /></label>
          <label>업종<select name="industry">${ccrOptions(Object.entries(CCR_FINANCIAL_BENCHMARKS).map(([k, v]) => [k, v.label]), ccrCaseWizard.industry)}</select></label>
          <label>지역<input name="region" value="${escapeHtml(ccrCaseWizard.region)}" /></label>
          <label>요청 금액대<select name="requestedAmountBand">${ccrOptions([["1억 이하", "1억 이하"], ["1억~5억", "1억~5억"], ["5억~20억", "5억~20억"], ["20억 이상", "20억 이상"]], ccrCaseWizard.requestedAmountBand)}</select></label>
          <label>담당자<select name="assignedRmId">${ccrOptions(users, ccrCaseWizard.assignedRmId)}</select></label>
          <label>우선순위<select name="priority">${ccrOptions(Object.entries(CCR_PRIORITY_LABELS), ccrCaseWizard.priority)}</select></label>
          <label>위험도<select name="riskLevel">${ccrOptions(Object.entries(CCR_RISK_LABELS), ccrCaseWizard.riskLevel)}</select></label>
          <label>SLA due date<input type="date" name="dueAt" value="${escapeHtml(ccrCaseWizard.dueAt)}" /></label>
          <label>재무자료 기준월<input type="month" name="financialBaseMonth" value="${escapeHtml(ccrCaseWizard.financialBaseMonth)}" data-ccr-wizard-field /></label>
          <label class="jbwc-check"><input type="checkbox" name="docsReceived" ${ccrCaseWizard.docsReceived ? "checked" : ""} data-ccr-wizard-field /> 주요 서류 수령</label>
          <label class="jbwc-check"><input type="checkbox" name="collateralExists" ${ccrCaseWizard.collateralExists ? "checked" : ""} data-ccr-wizard-field /> 담보 있음</label>
          <label class="jbwc-check"><input type="checkbox" name="guaranteeExists" ${ccrCaseWizard.guaranteeExists ? "checked" : ""} data-ccr-wizard-field /> 보증 있음</label>
          <label class="jbwc-check"><input type="checkbox" name="requiresHumanReview" ${ccrCaseWizard.requiresHumanReview ? "checked" : ""} /> human review 필요</label>
          <label class="jbwc-wide">설명<textarea name="description">${escapeHtml(ccrCaseWizard.description)}</textarea></label>
          <label class="jbwc-wide">태그<input name="tags" value="${escapeHtml(ccrCaseWizard.tags)}" placeholder="쉼표로 구분" /></label>
        </div>
      </section>
      <section class="jbwc-step jbwc-preview"><h3>4단계. Corporate Credit Triage Orchestrator 미리보기</h3><div data-ccr-preview-body>${ccrWizardPreviewMarkup(preview)}</div></section>
      <section class="jbwc-step"><h3>5단계. 저장</h3><p class="jbwc-guard">corporate_credit_cases · tasks · evidence · audit_logs · agent_runs · handoffs를 role scope로 저장합니다.</p><footer><button class="primary-button" type="submit">기업여신 운영 건 접수</button></footer></section>
    </form>`) + ccrMockNote();
}

function ccrRefreshWizardPreview(form) {
  ccrCaseWizard = { ...ccrCaseWizard, ...ccrCollectWizard(form) };
  const domain = CCR_DOMAINS[ccrCaseWizard.domain] || CCR_DOMAINS.workingCapital;
  if (!domain.productTypes.includes(ccrCaseWizard.productType)) ccrCaseWizard.productType = domain.productTypes[0];
  if (typeof render === "function") render();
}

function ccrBindCaseWizardForm() {
  const form = document.getElementById("ccr-new-case-form");
  if (!form) return;
  form.querySelectorAll("[data-ccr-wizard-field]").forEach((field) => {
    field.addEventListener("change", () => ccrRefreshWizardPreview(form));
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ccrCaseWizard = { ...ccrCaseWizard, ...ccrCollectWizard(form) };
    const created = createCorporateCreditCase(ccrCaseWizard);
    if (created.blocked) {
      if (typeof notify === "function") notify(`접수 차단: ${created.violations.join(" / ")}`);
      return;
    }
    ccrInvalidateCounts();
    ccrCaseWizard = ccrDefaultCaseWizard();
    if (typeof notify === "function") notify(`${created.case.caseNo} 접수 완료 — audit/agent run 기록`);
    ccrGo("cases", { kind: "case", id: created.case.id });
  });
}
