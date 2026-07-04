/* JB우리캐피탈 운영 포털 — 신규 운영 건 접수 위저드 view/바인딩.
   저장은 createJbWooriCapitalOpsCase(서비스 레이어)만 사용한다. */

function jbwcCaseWizardOptions(name, options, selected) {
  return options.map(([value, label]) => `<option value="${escapeHtml(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
}

function jbwcCollectCaseWizard(form) {
  const fd = new FormData(form);
  return {
    domain: String(fd.get("domain") || "personalFinance"),
    productType: String(fd.get("productType") || ""),
    title: String(fd.get("title") || ""),
    description: String(fd.get("description") || ""),
    customerRefId: String(fd.get("customerRefId") || ""),
    contractRefId: String(fd.get("contractRefId") || ""),
    vehicleRefId: String(fd.get("vehicleRefId") || ""),
    assignedTeam: String(fd.get("assignedTeam") || ""),
    assignedToId: String(fd.get("assignedToId") || ""),
    priority: String(fd.get("priority") || "normal"),
    riskLevel: String(fd.get("riskLevel") || "medium"),
    dueAt: String(fd.get("dueAt") || ""),
    sourceChannel: String(fd.get("sourceChannel") || "opsPortal"),
    requiresHumanReview: Boolean(fd.get("requiresHumanReview")),
    attachmentsExist: Boolean(fd.get("attachmentsExist")),
    tags: String(fd.get("tags") || ""),
  };
}

function jbwcCaseCreationView() {
  const domains = Object.entries(JBWC_DOMAIN_TAXONOMY).map(([value, cfg]) => [value, cfg.label]);
  const domainConfig = JBWC_DOMAIN_TAXONOMY[jbwcCaseWizard.domain] || JBWC_DOMAIN_TAXONOMY.personalFinance;
  const products = domainConfig.products.map((item) => [item, item]);
  if (!products.some(([value]) => value === jbwcCaseWizard.productType)) {
    jbwcCaseWizard.productType = products[0]?.[0] || "";
  }
  const users = jbwcTable("users", JBWC_AFFILIATE_ID);
  const teams = [...new Set(Object.values(JBWC_DOMAIN_TAXONOMY).map((cfg) => cfg.team).concat(users.map((u) => u.team)))].filter(Boolean);
  const preview = previewJbWooriCapitalTriage(jbwcCaseWizard);
  const priorityOptions = Object.entries(JBWC_PRIORITY_LABELS)
    .map(([value, label]) => `<option value="${value}" ${jbwcCaseWizard.priority === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  const riskOptions = Object.entries(JBWC_RISK_LABELS)
    .map(([value, label]) => `<option value="${value}" ${jbwcCaseWizard.riskLevel === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  return jbwcPanel("신규 JB우리캐피탈 운영 건 접수", `
    <form id="jbwc-new-case-form" class="jbwc-wizard">
      <section class="jbwc-step">
        <h3>1단계. 업무 도메인 선택</h3>
        <label>업무 도메인
          <select id="jbwc-case-domain" name="domain" data-jbwc-wizard-field>${jbwcCaseWizardOptions("domain", domains, jbwcCaseWizard.domain)}</select>
        </label>
      </section>
      <section class="jbwc-step">
        <h3>2단계. 상품/업무 유형 선택</h3>
        <label>상품/업무 유형
          <select id="jbwc-case-productType" name="productType" data-jbwc-wizard-field>${jbwcCaseWizardOptions("productType", products, jbwcCaseWizard.productType)}</select>
        </label>
      </section>
      <section class="jbwc-step">
        <h3>3단계. 케이스 정보 입력</h3>
        <div class="jbwc-form-grid">
          <label class="jbwc-wide">제목<input name="title" value="${escapeHtml(jbwcCaseWizard.title)}" placeholder="운영 건 제목" required /></label>
          <label class="jbwc-wide">설명<textarea name="description" rows="3" placeholder="내부 운영 설명">${escapeHtml(jbwcCaseWizard.description)}</textarea></label>
          <label>고객 참조 ID<input name="customerRefId" value="${escapeHtml(jbwcCaseWizard.customerRefId)}" placeholder="CUST-JBWC-0000" /></label>
          <label>계약 참조 ID<input name="contractRefId" value="${escapeHtml(jbwcCaseWizard.contractRefId)}" placeholder="CONTRACT-JBWC-0000" /></label>
          <label>차량 참조 ID<input name="vehicleRefId" value="${escapeHtml(jbwcCaseWizard.vehicleRefId)}" placeholder="VEH-JBWC-0000" /></label>
          <label>담당팀<select name="assignedTeam">${teams.map((team) => `<option value="${escapeHtml(team)}" ${jbwcCaseWizard.assignedTeam === team ? "selected" : ""}>${escapeHtml(team)}</option>`).join("")}</select></label>
          <label>담당자<select name="assignedToId"><option value="">담당팀 기본 배정</option>${users.map((u) => `<option value="${escapeHtml(u.id)}" ${jbwcCaseWizard.assignedToId === u.id ? "selected" : ""}>${escapeHtml(u.name)} · ${escapeHtml(u.team)}</option>`).join("")}</select></label>
          <label>우선순위<select name="priority">${priorityOptions}</select></label>
          <label>위험도<select name="riskLevel">${riskOptions}</select></label>
          <label>처리 기한<input name="dueAt" type="date" value="${escapeHtml(jbwcCaseWizard.dueAt)}" /></label>
          <label>접수 채널<input name="sourceChannel" value="${escapeHtml(jbwcCaseWizard.sourceChannel)}" /></label>
          <label class="jbwc-check"><input type="checkbox" name="requiresHumanReview" ${jbwcCaseWizard.requiresHumanReview ? "checked" : ""} /> 사람 검토 필요</label>
          <label class="jbwc-check"><input type="checkbox" name="attachmentsExist" ${jbwcCaseWizard.attachmentsExist ? "checked" : ""} /> 관련 문서 있음</label>
          <label class="jbwc-wide">태그<input name="tags" value="${escapeHtml(jbwcCaseWizard.tags)}" placeholder="쉼표로 구분" /></label>
        </div>
      </section>
      <section class="jbwc-step jbwc-preview">
        <h3>4단계. JB 분류 오케스트레이터 미리보기</h3>
        <div class="jbwc-preview-grid">
          <div><span>추천 에이전트 · recommendedAgent</span><strong>${escapeHtml(jbwcAgentDisplayName(preview.recommendedAgent))}</strong></div>
          <div><span>추천 담당팀 · recommendedTeam</span><strong>${escapeHtml(preview.recommendedTeam)}</strong></div>
          <div><span>초기 상태 · initialStatus</span><strong>${escapeHtml(jbwcStatusLabel(preview.initialStatus))}</strong></div>
          <div><span>위험도 보정 · riskOverride</span><strong>${escapeHtml(JBWC_RISK_LABELS[preview.riskOverride] || preview.riskOverride)}</strong></div>
          <div><span>SLA 기한 · slaDueAt</span><strong>${escapeHtml(preview.slaDueAt)}</strong></div>
          <div><span>사람 검토 필요 · requiresHumanReview</span><strong>${preview.requiresHumanReview ? "예" : "아니요"}</strong></div>
          <div><span>에스컬레이션 필요 · escalationRequired</span><strong>${preview.escalationRequired ? "예" : "아니요"}</strong></div>
          <div><span>핸드오프 · handoffs</span><strong>${escapeHtml(preview.handoffs.map((item) => jbwcAgentDisplayName(item.toAgentId)).join(", ") || "-")}</strong></div>
        </div>
        <p class="jbwc-guard">체크리스트: ${escapeHtml(preview.checklist.join(" · "))}</p>
      </section>
      <section class="jbwc-step">
        <h3>5단계. 저장</h3>
        <p class="jbwc-guard">ops_cases, ops_tasks, audit_logs, ai_analysis_requests/agent_runs와 도메인별 상세 테이블에 모의 운영 기록을 저장합니다.</p>
        <footer><button class="secondary-button" type="button" data-jbwc-preview-refresh>미리보기 갱신</button><button class="primary-button" type="submit">JB우리캐피탈 운영 건 접수</button></footer>
      </section>
    </form>`) + jbwcMockNote();
}

function jbwcBindCaseWizardForm() {
  const wizard = document.getElementById("jbwc-new-case-form");
  if (!wizard) return;
  wizard.querySelectorAll("[data-jbwc-wizard-field]").forEach((field) => {
    field.addEventListener("change", () => {
      jbwcCaseWizard = { ...jbwcCaseWizard, ...jbwcCollectCaseWizard(wizard) };
      if (field.name === "domain") {
        const cfg = JBWC_DOMAIN_TAXONOMY[jbwcCaseWizard.domain] || JBWC_DOMAIN_TAXONOMY.personalFinance;
        jbwcCaseWizard.productType = cfg.products[0];
        jbwcCaseWizard.assignedTeam = cfg.team;
      }
      render();
    });
  });
  const refresh = wizard.querySelector("[data-jbwc-preview-refresh]");
  if (refresh) {
    refresh.addEventListener("click", () => {
      jbwcCaseWizard = { ...jbwcCaseWizard, ...jbwcCollectCaseWizard(wizard) };
      render();
    });
  }
  wizard.addEventListener("submit", (event) => {
    event.preventDefault();
    jbwcCaseWizard = { ...jbwcCaseWizard, ...jbwcCollectCaseWizard(wizard) };
    if (!jbwcCaseWizard.title.trim()) {
      if (typeof notify === "function") notify("운영 건 제목을 입력해 주세요.");
      return;
    }
    const created = createJbWooriCapitalOpsCase(jbwcCaseWizard);
    jbwcInvalidateCounts();
    jbwcCaseWizard = jbwcDefaultCaseWizard();
    if (typeof notify === "function") notify(`${created.case.caseNo} 운영 건 접수 완료 — 감사 기록·에이전트 큐 저장 (모의)`);
    jbwcGo("cases", { kind: "case", id: created.case.id });
  });
}
