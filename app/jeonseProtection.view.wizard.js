/* 전세사기 보호 하네스 — 신규 전세 위험/피해 의심 건 접수 위저드 (v2).
   Step4에서 공공데이터 adapter를 호출해 저장 전 위험 신호를 미리 계산한다. */

function jpoWizardOptions(options, selected) {
  return options.map(([value, label]) => `<option value="${escapeHtml(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
}

function jpoCollectCaseWizard(form) {
  const fd = new FormData(form);
  return {
    intakeType: String(fd.get("intakeType") || "preContract"),
    housingType: String(fd.get("housingType") || "rowHouse"),
    contractType: String(fd.get("contractType") || "jeonse"),
    lawdCode: String(fd.get("lawdCode") || JPO_REGION_PRESETS[0].lawdCode),
    addressMasked: String(fd.get("addressMasked") || ""),
    buildingName: String(fd.get("buildingName") || ""),
    areaSize: String(fd.get("areaSize") || ""),
    floor: String(fd.get("floor") || ""),
    builtYear: String(fd.get("builtYear") || ""),
    contractStartDate: String(fd.get("contractStartDate") || ""),
    contractEndDate: String(fd.get("contractEndDate") || ""),
    depositAmount: String(fd.get("depositAmount") || "0"),
    monthlyRentAmount: String(fd.get("monthlyRentAmount") || "0"),
    customerRefId: String(fd.get("customerRefId") || ""),
    registryStatus: String(fd.get("registryStatus") || "unknown"),
    guaranteeStatus: String(fd.get("guaranteeStatus") || "unknown"),
    buildingCheckStatus: String(fd.get("buildingCheckStatus") || "unknown"),
    seniorLienEntered: Boolean(fd.get("seniorLienEntered")),
    auctionNoticed: Boolean(fd.get("auctionNoticed")),
    auctionDeadline: String(fd.get("auctionDeadline") || ""),
    docsReady: Boolean(fd.get("docsReady")),
    priority: String(fd.get("priority") || "normal"),
    dueAt: String(fd.get("dueAt") || ""),
    sourceChannel: String(fd.get("sourceChannel") || "opsPortal"),
    tags: String(fd.get("tags") || ""),
    enrichedMarket: jpoCaseWizard.enrichedMarket,
    enrichStatus: jpoCaseWizard.enrichStatus,
  };
}

function jpoWizardPreviewMarkup(preview) {
  const { market, assessment } = preview;
  const signalList = assessment.signals.length
    ? assessment.signals.map((signal) => `<li class="jbwc-row"><span>${jpoRiskPill(signal.severity)} ${escapeHtml(signal.title)}</span><span class="jbwc-row-note">${escapeHtml(signal.evidence || "")}</span></li>`).join("")
    : '<li class="jbwc-row"><span>표시할 위험 신호 없음 — 담당자 확인 항목만 유지</span></li>';
  return `
    <div class="jbwc-preview-grid">
      <div><span>데이터 연계 상태</span><strong>${escapeHtml(JPO_SOURCE_MODES[market.sourceMode] || market.sourceMode)}</strong></div>
      <div><span>유사 매매 실거래 수</span><strong>${escapeHtml(String(market.comparableTradeCount ?? 0))}건</strong></div>
      <div><span>유사 전월세 실거래 수</span><strong>${escapeHtml(String(market.comparableRentCount ?? 0))}건</strong></div>
      <div><span>인근 전세 거래 기준가</span><strong>${escapeHtml(jpoWon(market.jeonseMedian))}</strong></div>
      <div><span>보증금/추정 매매가</span><strong>${assessment.jeonseRatio != null ? escapeHtml(String(Math.round(assessment.jeonseRatio * 100))) + "%" : "산출 불가"}</strong></div>
      <div><span>보증금/추정 공시가격</span><strong>${assessment.officialPriceEst ? escapeHtml(String(Math.round((Number(jpoCaseWizard.depositAmount) / assessment.officialPriceEst) * 100))) + "%" : "산출 불가"}</strong></div>
      <div><span>위험도 · riskLevel</span><strong>${escapeHtml(JPO_RISK_LABELS[assessment.riskLevel] || assessment.riskLevel)}</strong></div>
      <div><span>데이터 신뢰도</span><strong>${escapeHtml({ high: "높음", medium: "보통", low: "낮음 — 담당자 확인 필요" }[assessment.confidence] || assessment.confidence)}</strong></div>
      <div><span>담당자 검토 필요</span><strong>${assessment.requiresHumanReview ? "예" : "아니요"}</strong></div>
      <div><span>추천 에이전트</span><strong>${escapeHtml(jpoAgentDisplayName(preview.recommendedAgent))}</strong></div>
      <div><span>초기 상태</span><strong>${escapeHtml(jpoStatusLabel(preview.initialStatus))}</strong></div>
      <div><span>추천 다음 작업</span><strong>${escapeHtml(assessment.nextActions.slice(0, 2).join(" / ") || "-")}</strong></div>
    </div>
    <ul class="jbwc-list">${signalList}</ul>
    ${market.sourceMode !== "live_api" ? `<p class="jbwc-guard" data-live-note="off">실시간 API 미연결 · 저장 기준 사용 — 위험도를 낮게 확정하지 않고 담당자 확인 필요로 처리합니다.</p>` : `<p class="jbwc-guard" data-live-note="on">실시간 API 기준으로 계산되었습니다.</p>`}`;
}

function jpoCaseCreationView() {
  const intakeOptions = Object.entries(JPO_INTAKE_TYPES).map(([value, cfg]) => [value, cfg.label]);
  const housingOptions = Object.entries(JPO_HOUSING_TYPES).map(([value, cfg]) => [value, cfg.label]);
  const contractOptions = Object.entries(JPO_CONTRACT_TYPES);
  const regionOptions = JPO_REGION_PRESETS.map((preset) => [preset.lawdCode, `${preset.label} (${preset.lawdCode})`]);
  const preview = previewJeonseProtectionTriage(jpoCaseWizard);
  const priorityOptions = Object.entries(JPO_PRIORITY_LABELS)
    .map(([value, label]) => `<option value="${value}" ${jpoCaseWizard.priority === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  const triState = (name, current) => ["verified", "unknown"].map((value) => `<option value="${value}" ${current === value ? "selected" : ""}>${value === "verified" ? "확인 완료" : "확인 필요"}</option>`).join("");
  return jpoPanel("신규 전세 위험/피해 의심 건 접수", `
    <form id="jpo-new-case-form" class="jbwc-wizard">
      <section class="jbwc-step">
        <h3>1단계. 유형 선택</h3>
        <label>접수 유형
          <select id="jpo-case-intakeType" name="intakeType" data-jpo-wizard-field>${jpoWizardOptions(intakeOptions, jpoCaseWizard.intakeType)}</select>
        </label>
        <p class="jbwc-guard">담당팀 기본값: <span data-jpo-team-hint>${escapeHtml((JPO_INTAKE_TYPES[jpoCaseWizard.intakeType] || {}).team || "위험분석팀")}</span></p>
      </section>
      <section class="jbwc-step">
        <h3>2단계. 주택 정보</h3>
        <div class="jbwc-form-grid">
          <label>주택 유형<select name="housingType" data-jpo-wizard-field>${jpoWizardOptions(housingOptions, jpoCaseWizard.housingType)}</select></label>
          <label>시/도·시/군/구·법정동<select name="lawdCode" data-jpo-wizard-field>${jpoWizardOptions(regionOptions, jpoCaseWizard.lawdCode)}</select></label>
          <label>주소 일부(마스킹)<input name="addressMasked" value="${escapeHtml(jpoCaseWizard.addressMasked)}" placeholder="예: 서울 강서구 화곡동 ***" /></label>
          <label>단지/건물명<input name="buildingName" value="${escapeHtml(jpoCaseWizard.buildingName)}" placeholder="예: ○○빌라 (실명·상세주소 입력 금지)" /></label>
          <label>전용면적(㎡)<input name="areaSize" inputmode="numeric" value="${escapeHtml(jpoCaseWizard.areaSize)}" /></label>
          <label>층<input name="floor" inputmode="numeric" value="${escapeHtml(jpoCaseWizard.floor)}" /></label>
          <label>준공연도<input name="builtYear" inputmode="numeric" value="${escapeHtml(jpoCaseWizard.builtYear)}" /></label>
          <label>계약 예정일/만기일<input name="contractEndDate" type="date" value="${escapeHtml(jpoCaseWizard.contractEndDate)}" data-jpo-wizard-field /></label>
        </div>
      </section>
      <section class="jbwc-step">
        <h3>3단계. 계약 정보</h3>
        <div class="jbwc-form-grid">
          <label>보증금(원)<input name="depositAmount" inputmode="numeric" value="${escapeHtml(jpoCaseWizard.depositAmount)}" data-jpo-wizard-field /></label>
          <label>월세(원)<input name="monthlyRentAmount" inputmode="numeric" value="${escapeHtml(jpoCaseWizard.monthlyRentAmount)}" /></label>
          <label>임대차 유형<select name="contractType">${jpoWizardOptions(contractOptions, jpoCaseWizard.contractType)}</select></label>
          <label>계약 시작일<input name="contractStartDate" type="date" value="${escapeHtml(jpoCaseWizard.contractStartDate)}" /></label>
          <label>익명 고객 ID<input name="customerRefId" value="${escapeHtml(jpoCaseWizard.customerRefId)}" placeholder="CUST-JS-0000" /></label>
          <label>보증보험 가입 여부<select name="guaranteeStatus" data-jpo-wizard-field>
            <option value="enrolled" ${jpoCaseWizard.guaranteeStatus === "enrolled" ? "selected" : ""}>가입 확인</option>
            <option value="none" ${jpoCaseWizard.guaranteeStatus === "none" ? "selected" : ""}>미가입</option>
            <option value="unknown" ${jpoCaseWizard.guaranteeStatus === "unknown" ? "selected" : ""}>확인 필요</option>
          </select></label>
          <label>등기부 확인 여부<select name="registryStatus" data-jpo-wizard-field>${triState("registryStatus", jpoCaseWizard.registryStatus)}</select></label>
          <label>건축물 확인 여부<select name="buildingCheckStatus" data-jpo-wizard-field>${triState("buildingCheckStatus", jpoCaseWizard.buildingCheckStatus)}</select></label>
          <label class="jbwc-check"><input type="checkbox" name="seniorLienEntered" ${jpoCaseWizard.seniorLienEntered ? "checked" : ""} /> 선순위 권리 입력됨</label>
          <label class="jbwc-check"><input type="checkbox" name="auctionNoticed" data-jpo-wizard-field ${jpoCaseWizard.auctionNoticed ? "checked" : ""} /> 경·공매 통지 받음</label>
          <label>경·공매 기한<input name="auctionDeadline" type="date" value="${escapeHtml(jpoCaseWizard.auctionDeadline)}" data-jpo-wizard-field /></label>
          <label class="jbwc-check"><input type="checkbox" name="docsReady" ${jpoCaseWizard.docsReady ? "checked" : ""} /> 제출서류 보유</label>
          <label>우선순위<select name="priority">${priorityOptions}</select></label>
          <label>처리 기한<input name="dueAt" type="date" value="${escapeHtml(jpoCaseWizard.dueAt)}" /></label>
          <label class="jbwc-wide">태그<input name="tags" value="${escapeHtml(jpoCaseWizard.tags)}" placeholder="쉼표로 구분" /></label>
        </div>
      </section>
      <section class="jbwc-step jbwc-preview">
        <h3>4단계. API 데이터 보강 미리보기</h3>
        <footer>
          <button class="secondary-button" type="button" data-jpo-enrich-preview>${jpoCaseWizard.enrichStatus === "loading" ? "실거래 조회 중..." : "API 데이터 보강 실행"}</button>
          <button class="secondary-button" type="button" data-jpo-preview-refresh>미리보기 갱신</button>
        </footer>
        <div data-jpo-preview-body>${jpoWizardPreviewMarkup(preview)}</div>
      </section>
      <section class="jbwc-step">
        <h3>5단계. 저장</h3>
        <p class="jbwc-guard">jeonse_cases · jeonse_price_snapshots · jeonse_risk_signals · 권리/보증 체크 · jeonse_audit_logs(CASE_CREATED) · jeonse_agent_runs에 모의 기록을 저장합니다.</p>
        <footer><button class="primary-button" type="submit">전세 위험/피해 의심 건 접수</button></footer>
      </section>
    </form>`) + jpoMockNote();
}

function jpoUpdateWizardPreviewInPlace(wizard) {
  // 폼 DOM을 유지한 채 미리보기만 갱신 — 전체 re-render는 진행 중인 클릭/포커스를 삼킨다.
  const body = wizard.querySelector("[data-jpo-preview-body]");
  if (body) body.innerHTML = jpoWizardPreviewMarkup(previewJeonseProtectionTriage(jpoCaseWizard));
  const teamHint = wizard.querySelector("[data-jpo-team-hint]");
  if (teamHint) teamHint.textContent = (JPO_INTAKE_TYPES[jpoCaseWizard.intakeType] || {}).team || "위험분석팀";
  const enrichButton = wizard.querySelector("[data-jpo-enrich-preview]");
  if (enrichButton) enrichButton.textContent = jpoCaseWizard.enrichStatus === "loading" ? "실거래 조회 중..." : "API 데이터 보강 실행";
}

function jpoBindCaseWizardForm() {
  const wizard = document.getElementById("jpo-new-case-form");
  if (!wizard) return;
  wizard.querySelectorAll("[data-jpo-wizard-field]").forEach((field) => {
    field.addEventListener("change", () => {
      jpoCaseWizard = { ...jpoCaseWizard, ...jpoCollectCaseWizard(wizard) };
      if (["housingType", "lawdCode"].includes(field.name)) {
        jpoCaseWizard.enrichedMarket = null; // 지역/유형 변경 시 보강 결과 무효화
        jpoCaseWizard.enrichStatus = "idle";
      }
      jpoUpdateWizardPreviewInPlace(wizard);
    });
  });
  const refresh = wizard.querySelector("[data-jpo-preview-refresh]");
  if (refresh) {
    refresh.addEventListener("click", () => {
      jpoCaseWizard = { ...jpoCaseWizard, ...jpoCollectCaseWizard(wizard) };
      jpoUpdateWizardPreviewInPlace(wizard);
    });
  }
  const enrich = wizard.querySelector("[data-jpo-enrich-preview]");
  if (enrich) {
    enrich.addEventListener("click", () => {
      jpoCaseWizard = { ...jpoCaseWizard, ...jpoCollectCaseWizard(wizard), enrichStatus: "loading" };
      jpoUpdateWizardPreviewInPlace(wizard);
      fetchJeonseMarketData({ housingType: jpoCaseWizard.housingType, lawdCode: jpoCaseWizard.lawdCode, dealYm: "202605" })
        .then((market) => {
          jpoCaseWizard.enrichedMarket = market;
          jpoCaseWizard.enrichStatus = market.sourceMode;
        })
        .catch(() => { jpoCaseWizard.enrichStatus = "fallback"; })
        .then(() => jpoUpdateWizardPreviewInPlace(wizard));
    });
  }
  wizard.addEventListener("submit", (event) => {
    event.preventDefault();
    jpoCaseWizard = { ...jpoCaseWizard, ...jpoCollectCaseWizard(wizard) };
    if (!Number(jpoCaseWizard.depositAmount)) {
      if (typeof notify === "function") notify("보증금을 입력해 주세요.");
      return;
    }
    const created = createJeonseProtectionCase(jpoCaseWizard);
    if (created && created.blocked) {
      if (typeof notify === "function") notify(`접수 차단(보안 훅): ${created.violations.join(" / ")}`);
      jpoInvalidateCounts();
      render();
      return;
    }
    jpoInvalidateCounts();
    jpoCaseWizard = jpoDefaultCaseWizard();
    if (typeof notify === "function") notify(`${jpoCaseNoLabel(created.case.caseNo)} 접수 완료 — 시세 비교·위험 신호·감사 기록 저장 (모의)`);
    jpoGo("cases", { kind: "case", id: created.case.id });
  });
}
