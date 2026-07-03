/* 전세사기 보호 담당자 역할 하네스 — 신규 전세보호 건 접수 위저드.
   저장은 createJeonseProtectionCase(서비스 레이어)만 사용한다. */

function jpoWizardOptions(options, selected) {
  return options.map(([value, label]) => `<option value="${escapeHtml(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
}

function jpoCollectCaseWizard(form) {
  const fd = new FormData(form);
  return {
    taskType: String(fd.get("taskType") || "preContractRisk"),
    title: String(fd.get("title") || ""),
    description: String(fd.get("description") || ""),
    tenantRefId: String(fd.get("tenantRefId") || ""),
    contractRefId: String(fd.get("contractRefId") || ""),
    propertyRefId: String(fd.get("propertyRefId") || ""),
    landlordRefId: String(fd.get("landlordRefId") || ""),
    addressRefId: String(fd.get("addressRefId") || ""),
    depositAmountBand: String(fd.get("depositAmountBand") || "확인 필요"),
    leaseStartDate: String(fd.get("leaseStartDate") || ""),
    leaseEndDate: String(fd.get("leaseEndDate") || ""),
    assignedTeam: String(fd.get("assignedTeam") || ""),
    assignedToId: String(fd.get("assignedToId") || ""),
    priority: String(fd.get("priority") || "normal"),
    riskLevel: String(fd.get("riskLevel") || "medium"),
    dueAt: String(fd.get("dueAt") || ""),
    sourceChannel: String(fd.get("sourceChannel") || "opsPortal"),
    requiresHumanReview: Boolean(fd.get("requiresHumanReview")),
    attachmentsExist: Boolean(fd.get("attachmentsExist")),
    tags: String(fd.get("tags") || ""),
    riskSignals: fd.getAll("riskSignals").map(String),
  };
}

function jpoCaseCreationView() {
  const taskTypes = Object.entries(JPO_TASK_TAXONOMY).map(([value, cfg]) => [value, cfg.label]);
  const taxonomy = JPO_TASK_TAXONOMY[jpoCaseWizard.taskType] || JPO_TASK_TAXONOMY.preContractRisk;
  const users = jpoTable("users", JPO_ROLE_KEY);
  const teams = [...new Set(Object.values(JPO_TASK_TAXONOMY).map((cfg) => cfg.team).concat(users.map((u) => u.team)))].filter(Boolean);
  const preview = previewJeonseProtectionTriage(jpoCaseWizard);
  const bands = ["1억 미만", "1억~2억", "2억~3억", "3억 이상", "확인 필요"];
  const priorityOptions = Object.entries(JPO_PRIORITY_LABELS)
    .map(([value, label]) => `<option value="${value}" ${jpoCaseWizard.priority === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  const riskOptions = Object.entries(JPO_RISK_LABELS)
    .map(([value, label]) => `<option value="${value}" ${jpoCaseWizard.riskLevel === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  const signalChecks = Object.entries(JPO_RISK_SIGNALS).map(([key, label]) => `
    <label class="jbwc-check"><input type="checkbox" name="riskSignals" value="${escapeHtml(key)}" data-jpo-wizard-signal ${jpoCaseWizard.riskSignals.includes(key) ? "checked" : ""} /> ${escapeHtml(label)}</label>`).join("");
  return jpoPanel("신규 전세보호 운영 건 접수", `
    <form id="jpo-new-case-form" class="jbwc-wizard">
      <section class="jbwc-step">
        <h3>1단계. 업무 유형 선택</h3>
        <label>업무 유형
          <select id="jpo-case-taskType" name="taskType" data-jpo-wizard-field>${jpoWizardOptions(taskTypes, jpoCaseWizard.taskType)}</select>
        </label>
        <p class="jbwc-guard">담당팀 기본값: ${escapeHtml(taxonomy.team)}${taxonomy.requiresHumanReview ? " · 이 유형은 사람 검토가 필수입니다" : ""}</p>
      </section>
      <section class="jbwc-step">
        <h3>2단계. 케이스 정보 입력</h3>
        <div class="jbwc-form-grid">
          <label class="jbwc-wide">제목<input name="title" value="${escapeHtml(jpoCaseWizard.title)}" placeholder="전세보호 운영 건 제목" required /></label>
          <label class="jbwc-wide">설명<textarea name="description" rows="3" placeholder="내부 운영 설명 (개인정보 원문 입력 금지)">${escapeHtml(jpoCaseWizard.description)}</textarea></label>
          <label>임차인 참조 ID<input name="tenantRefId" value="${escapeHtml(jpoCaseWizard.tenantRefId)}" placeholder="TENANT-REF-0000" /></label>
          <label>계약 참조 ID<input name="contractRefId" value="${escapeHtml(jpoCaseWizard.contractRefId)}" placeholder="CONTRACT-REF-0000" /></label>
          <label>물건 참조 ID<input name="propertyRefId" value="${escapeHtml(jpoCaseWizard.propertyRefId)}" placeholder="PROPERTY-REF-0000" /></label>
          <label>임대인 참조 ID<input name="landlordRefId" value="${escapeHtml(jpoCaseWizard.landlordRefId)}" placeholder="LANDLORD-REF-0000" /></label>
          <label>주소 참조 ID<input name="addressRefId" value="${escapeHtml(jpoCaseWizard.addressRefId)}" placeholder="ADDRESS-REF-0000" /></label>
          <label>보증금 구간<select name="depositAmountBand">${bands.map((band) => `<option value="${escapeHtml(band)}" ${jpoCaseWizard.depositAmountBand === band ? "selected" : ""}>${escapeHtml(band)}</option>`).join("")}</select></label>
          <label>임대차 시작일<input name="leaseStartDate" type="date" value="${escapeHtml(jpoCaseWizard.leaseStartDate)}" /></label>
          <label>임대차 종료일<input name="leaseEndDate" type="date" value="${escapeHtml(jpoCaseWizard.leaseEndDate)}" /></label>
          <label>담당팀<select name="assignedTeam">${teams.map((team) => `<option value="${escapeHtml(team)}" ${jpoCaseWizard.assignedTeam === team ? "selected" : ""}>${escapeHtml(team)}</option>`).join("")}</select></label>
          <label>담당자<select name="assignedToId"><option value="">담당팀 기본 배정</option>${users.map((u) => `<option value="${escapeHtml(u.id)}" ${jpoCaseWizard.assignedToId === u.id ? "selected" : ""}>${escapeHtml(u.name)} · ${escapeHtml(u.team)}</option>`).join("")}</select></label>
          <label>우선순위<select name="priority">${priorityOptions}</select></label>
          <label>위험도<select name="riskLevel">${riskOptions}</select></label>
          <label>처리 기한<input name="dueAt" type="date" value="${escapeHtml(jpoCaseWizard.dueAt)}" /></label>
          <label>접수 채널<input name="sourceChannel" value="${escapeHtml(jpoCaseWizard.sourceChannel)}" /></label>
          <label class="jbwc-check"><input type="checkbox" name="requiresHumanReview" ${jpoCaseWizard.requiresHumanReview ? "checked" : ""} /> 사람 검토 필요</label>
          <label class="jbwc-check"><input type="checkbox" name="attachmentsExist" ${jpoCaseWizard.attachmentsExist ? "checked" : ""} /> 관련 문서 있음</label>
          <label class="jbwc-wide">태그<input name="tags" value="${escapeHtml(jpoCaseWizard.tags)}" placeholder="쉼표로 구분" /></label>
        </div>
      </section>
      <section class="jbwc-step">
        <h3>3단계. 위험 신호 입력</h3>
        <div class="jbwc-form-grid">${signalChecks}</div>
      </section>
      <section class="jbwc-step jbwc-preview">
        <h3>4단계. AI 전세보호 오케스트레이터 미리보기</h3>
        <div class="jbwc-preview-grid">
          <div><span>추천 에이전트 · recommendedAgent</span><strong>${escapeHtml(jpoAgentDisplayName(preview.recommendedAgent))}</strong></div>
          <div><span>추천 담당팀 · recommendedTeam</span><strong>${escapeHtml(preview.recommendedTeam)}</strong></div>
          <div><span>초기 상태 · initialStatus</span><strong>${escapeHtml(jpoStatusLabel(preview.initialStatus))}</strong></div>
          <div><span>위험도 보정 · riskOverride</span><strong>${escapeHtml(JPO_RISK_LABELS[preview.riskOverride] || preview.riskOverride)}</strong></div>
          <div><span>SLA 기한 · slaDueAt</span><strong>${escapeHtml(preview.slaDueAt)}</strong></div>
          <div><span>사람 검토 필요 · requiresHumanReview</span><strong>${preview.requiresHumanReview ? "예" : "아니요"}</strong></div>
          <div><span>에스컬레이션 필요 · escalationRequired</span><strong>${preview.escalationRequired ? "예" : "아니요"}</strong></div>
          <div><span>핸드오프 · handoffs</span><strong>${escapeHtml(preview.handoffs.map((item) => jpoAgentDisplayName(item.toAgentId)).join(", ") || "-")}</strong></div>
          <div><span>필요 서류 · requiredDocuments</span><strong>${escapeHtml(preview.requiredDocuments.join(", ") || "-")}</strong></div>
          <div><span>지원 프로그램 후보 · supportProgramCandidates</span><strong>${escapeHtml(preview.supportProgramCandidates.join(", ") || "-")}</strong></div>
          <div class="jbwc-wide"><span>외부 참고 링크 · externalReferenceLinks</span><strong>${escapeHtml(preview.externalReferenceLinks.join(" · ") || "-")}</strong></div>
        </div>
        <p class="jbwc-guard">체크리스트: ${escapeHtml(preview.checklist.join(" · "))}</p>
        <p class="jbwc-guard">외부 링크·지원기관 안내는 "신청 대행"이 아니라 "안내 후보"입니다 — 최신 기준 담당자 확인 필요.</p>
      </section>
      <section class="jbwc-step">
        <h3>5단계. 저장</h3>
        <p class="jbwc-guard">jeonse_cases, jeonse_tasks, audit_logs, ai_analysis_requests/agent_runs와 업무 유형별 상세 테이블에 모의 운영 기록을 저장합니다.</p>
        <footer><button class="secondary-button" type="button" data-jpo-preview-refresh>미리보기 갱신</button><button class="primary-button" type="submit">전세보호 운영 건 접수</button></footer>
      </section>
    </form>`) + jpoMockNote();
}

function jpoBindCaseWizardForm() {
  const wizard = document.getElementById("jpo-new-case-form");
  if (!wizard) return;
  wizard.querySelectorAll("[data-jpo-wizard-field]").forEach((field) => {
    field.addEventListener("change", () => {
      jpoCaseWizard = { ...jpoCaseWizard, ...jpoCollectCaseWizard(wizard) };
      if (field.name === "taskType") {
        const cfg = JPO_TASK_TAXONOMY[jpoCaseWizard.taskType] || JPO_TASK_TAXONOMY.preContractRisk;
        jpoCaseWizard.assignedTeam = cfg.team;
      }
      render();
    });
  });
  wizard.querySelectorAll("[data-jpo-wizard-signal]").forEach((box) => {
    box.addEventListener("change", () => {
      jpoCaseWizard = { ...jpoCaseWizard, ...jpoCollectCaseWizard(wizard) };
      render();
    });
  });
  const refresh = wizard.querySelector("[data-jpo-preview-refresh]");
  if (refresh) {
    refresh.addEventListener("click", () => {
      jpoCaseWizard = { ...jpoCaseWizard, ...jpoCollectCaseWizard(wizard) };
      render();
    });
  }
  wizard.addEventListener("submit", (event) => {
    event.preventDefault();
    jpoCaseWizard = { ...jpoCaseWizard, ...jpoCollectCaseWizard(wizard) };
    if (!jpoCaseWizard.title.trim()) {
      if (typeof notify === "function") notify("전세보호 운영 건 제목을 입력해 주세요.");
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
    if (typeof notify === "function") notify(`${created.case.caseNo} 전세보호 건 접수 완료 — 감사 기록·에이전트 큐 저장 (모의)`);
    jpoGo("cases", { kind: "case", id: created.case.id });
  });
}
