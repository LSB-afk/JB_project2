/* RM 하네스 — 신규 여신 상담 건 접수 wizard. */

function rmoOptions(options, selected) {
  return options.map(([value, label]) => `<option value="${escapeHtml(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
}

function rmoCollectWizard(form) {
  const fd = new FormData(form);
  const supportingFile = fd.get("supportingFile");
  const uploadedFileName = supportingFile && supportingFile.name ? supportingFile.name : String(fd.get("uploadedFileName") || "");
  return {
    caseType: String(fd.get("caseType") || "policyStartup"),
    caseNo: String(fd.get("caseNo") || ""),
    customerAlias: String(fd.get("customerAlias") || "익명 고객"),
    bank: String(fd.get("bank") || "전북은행"),
    region: String(fd.get("region") || ""),
    theme: String(fd.get("theme") || ""),
    situation: String(fd.get("situation") || ""),
    riskLevel: String(fd.get("riskLevel") || "medium"),
    requestedAmountBand: String(fd.get("requestedAmountBand") || "3천만원 이하"),
    assignedRmId: String(fd.get("assignedRmId") || "USR-RMO-04"),
    receivedAt: String(fd.get("receivedAt") || ""),
    dueAt: String(fd.get("dueAt") || ""),
    uploadedFileName,
    uploadedFileSummary: uploadedFileName ? `${uploadedFileName} 첨부 · 에이전트 분석 입력 후보` : String(fd.get("uploadedFileSummary") || ""),
    requiresHumanReview: Boolean(fd.get("requiresHumanReview")),
  };
}

function rmoWizardPreviewMarkup(preview) {
  const plan = (preview.agentPlan || []).map((id) => escapeHtml(rmoAgentDisplayName(id))).join(" → ");
  return `<div class="jbwc-preview-grid">
    <div><span>우선순위</span><strong>${escapeHtml(RMO_PRIORITY_LABELS[preview.priority] || preview.priority)} (${escapeHtml(String(preview.priorityScore))})</strong></div>
    <div><span>추천 담당팀</span><strong>${escapeHtml(preview.recommendedTeam)}</strong></div>
    <div><span>초기 상태</span><strong>${escapeHtml(RMO_STATUS_LABELS[preview.initialStatus] || preview.initialStatus)}</strong></div>
    <div><span>위험도</span><strong>${escapeHtml(RMO_RISK_LABELS[preview.riskLevel] || preview.riskLevel)}</strong></div>
    <div><span>담당자 검토</span><strong>${preview.requiresHumanReview ? "필요" : "일반 큐"}</strong></div>
    <div><span>에스컬레이션</span><strong>${preview.escalationRequired ? "필요" : "없음"}</strong></div>
    <div><span>접수일</span><strong>${escapeHtml(rmoCaseWizard.receivedAt || "접수 시점 기준")}</strong></div>
    <div><span>첨부 파일</span><strong>${escapeHtml(rmoCaseWizard.uploadedFileName || "없음")}</strong></div>
  </div>
  <p class="rmo-case-reason"><span aria-hidden="true">▎</span>우선순위 근거: ${escapeHtml(preview.priorityReason)}</p>
  <p class="jbwc-meta">에이전트 배정 플랜: ${plan || "-"}</p>
  <ul class="jbwc-list">${preview.signals.map((s) => `<li class="jbwc-row"><span>${rmoRiskPill(s.severity)} ${escapeHtml(s.title)}</span><span class="jbwc-row-note">${escapeHtml(s.evidence)}</span></li>`).join("") || '<li class="jbwc-row"><span>신규 우선순위 신호 없음</span></li>'}</ul>
  <p class="jbwc-guard">미리보기는 내부 업무 참고용입니다. 승인·거절·금리·한도·신용평가·정책자금 대상 확정은 생성하지 않습니다.</p>`;
}

function rmoCaseCreationView() {
  const typeOptions = Object.entries(RMO_CASE_TYPES).map(([value, cfg]) => [value, cfg.label]);
  const users = rmoTable("rm_officer_users", RMO_ROLE_KEY).map((u) => [u.id, `${u.name} · ${u.team}`]);
  const preview = previewRmOfficerPriority(rmoCaseWizard);
  return rmoPanel("신규 여신 상담 건 접수", `
    <form id="rmo-new-case-form" class="jbwc-wizard">
      <section class="jbwc-step"><h3>1단계. 상담 유형 선택</h3>
        <label>상담 유형<select name="caseType" data-rmo-wizard-field>${rmoOptions(typeOptions, rmoCaseWizard.caseType)}</select></label>
      </section>
      <section class="jbwc-step"><h3>2단계. 케이스 정보(익명 Ref)</h3>
        <div class="jbwc-form-grid">
          <label>케이스 번호<input name="caseNo" value="${escapeHtml(rmoCaseWizard.caseNo)}" placeholder="예: JBG-3xx (미입력 시 자동 생성)" /></label>
          <label>익명 고객명<input name="customerAlias" value="${escapeHtml(rmoCaseWizard.customerAlias)}" /></label>
          <label>관리 은행<select name="bank">${rmoOptions([["전북은행", "전북은행"], ["광주은행", "광주은행"], ["JB금융그룹", "JB금융그룹"]], rmoCaseWizard.bank)}</select></label>
          <label>지역<input name="region" value="${escapeHtml(rmoCaseWizard.region)}" /></label>
          <label>제목/주제<input name="theme" value="${escapeHtml(rmoCaseWizard.theme)}" /></label>
          <label>요청 금액대<select name="requestedAmountBand">${rmoOptions([["5백만원 이하", "5백만원 이하"], ["3천만원 이하", "3천만원 이하"], ["3천만원~5천만원", "3천만원~5천만원"], ["5천만원~1억", "5천만원~1억"], ["1억~3억", "1억~3억"]], rmoCaseWizard.requestedAmountBand)}</select></label>
          <label>담당자<select name="assignedRmId">${rmoOptions(users, rmoCaseWizard.assignedRmId)}</select></label>
          <label>위험도<select name="riskLevel" data-rmo-wizard-field>${rmoOptions(Object.entries(RMO_RISK_LABELS), rmoCaseWizard.riskLevel)}</select></label>
          <label>접수일<input type="date" name="receivedAt" value="${escapeHtml(rmoCaseWizard.receivedAt)}" data-rmo-wizard-field /></label>
          <label>SLA due date<input type="date" name="dueAt" value="${escapeHtml(rmoCaseWizard.dueAt)}" data-rmo-wizard-field /></label>
          <label class="jbwc-wide">첨부 파일 업로드<input type="file" name="supportingFile" accept=".pdf,.png,.jpg,.jpeg,.txt,.md,.csv,.xlsx,.docx" /></label>
          <input type="hidden" name="uploadedFileName" value="${escapeHtml(rmoCaseWizard.uploadedFileName)}" />
          <input type="hidden" name="uploadedFileSummary" value="${escapeHtml(rmoCaseWizard.uploadedFileSummary)}" />
          <label class="jbwc-check"><input type="checkbox" name="requiresHumanReview" ${rmoCaseWizard.requiresHumanReview ? "checked" : ""} data-rmo-wizard-field /> 담당자 검토 필요</label>
          <label class="jbwc-wide">상황 요약<textarea name="situation">${escapeHtml(rmoCaseWizard.situation)}</textarea></label>
        </div>
      </section>
      <section class="jbwc-step jbwc-preview"><h3>3단계. RM 우선순위 오케스트레이터 미리보기</h3><div data-rmo-preview-body>${rmoWizardPreviewMarkup(preview)}</div></section>
      <section class="jbwc-step"><h3>4단계. 저장</h3><p class="jbwc-guard">rm_officer_cases · agent_assignments · evidence · audit_logs · agent_runs를 role scope로 저장합니다.</p><footer><button class="primary-button" type="submit">여신 상담 건 접수</button></footer></section>
    </form>`) + rmoMockNote();
}

function rmoRefreshWizardPreview(form) {
  rmoCaseWizard = { ...rmoCaseWizard, ...rmoCollectWizard(form) };
  if (typeof render === "function") render();
}

function rmoBindCaseWizardForm() {
  const form = document.getElementById("rmo-new-case-form");
  if (!form) return;
  form.querySelectorAll("[data-rmo-wizard-field]").forEach((field) => {
    field.addEventListener("change", () => rmoRefreshWizardPreview(form));
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    rmoCaseWizard = { ...rmoCaseWizard, ...rmoCollectWizard(form) };
    const created = createRmOfficerCase(rmoCaseWizard);
    if (created.blocked) {
      if (typeof notify === "function") notify(`접수 차단(보안 훅): ${created.violations.join(" / ")}`);
      return;
    }
    rmoInvalidateCounts();
    rmoCaseWizard = rmoDefaultCaseWizard();
    if (typeof notify === "function") notify(`${created.case.caseNo} 접수 완료 — 우선순위 근거·에이전트 배정 기록`);
    rmoGo("board", { kind: "case", id: created.case.id });
  });
}
