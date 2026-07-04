/* 전세사기 보호 하네스 — 위험 접수 보드 (lifecycle 칸반). */

function jpoBoardCard(item, keyIndex = "") {
  const topSignals = jpoCaseSignals(item.id, 3);
  const contractLine = item.contractEndDate ? `계약/만기 ${item.contractEndDate}` : "계약일 미정";
  const agents = jpoCaseAgentIds(item, false).slice(0, 4);
  const dataChips = jpoCaseDataChips(item).slice(0, 4);
  const selected = item.id === jpoState.selectedCaseId;
  return `<article class="jpo-card jbwc-card ${selected ? "is-selected" : ""}" data-jpo-board-case="${escapeHtml(item.id)}" role="button" tabindex="0" aria-pressed="${selected ? "true" : "false"}">
    <header class="jpo-card-head">
      <div><strong>${keyIndex ? `<kbd>${escapeHtml(String(keyIndex))}</kbd> ` : ""}${escapeHtml(item.caseNo)}</strong><span>${escapeHtml(jpoCasePriorityLabel(item))}</span></div>
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

function jpoSelectedCaseSubSection(row) {
  if (!row) {
    return `<section class="jpo-sub-workspace" aria-label="선택된 케이스 실행 큐">
      <header class="jpo-sub-divider"><div><p class="eyebrow">SUB · 선택된 케이스 실행 큐</p><h3>우선순위 케이스를 선택하세요</h3></div></header>
      <div class="jbwc-empty">숫자키 또는 카드 클릭으로 케이스를 선택하면 에이전트 실행 큐, 산출물, 승인/감사 기록이 이 영역에 표시됩니다.</div>
    </section>`;
  }
  const signals = jpoCaseSignals(row.id, 3);
  const runs = jpoTable("jeonse_agent_runs", JPO_ROLE_KEY).filter((run) => run.caseId === row.id).slice(0, 4);
  const deliverables = typeof jpoCaseDeliverables === "function" ? jpoCaseDeliverables(row.id).slice(0, 4) : [];
  const audits = jpoTable("jeonse_audit_logs", JPO_ROLE_KEY).filter((audit) => audit.caseId === row.id).slice(0, 4);
  const files = jpoTable("jeonse_evidence_files", JPO_ROLE_KEY).filter((file) => file.caseId === row.id).slice(0, 3);
  const metaLine = `${row.caseNo} · ${row.createdAt || "-"} · ${JPO_RISK_LABELS[row.riskLevel] || row.riskLevel} 위험 · ${row.auctionNoticed || row.priority === "urgent" ? "긴급" : JPO_PRIORITY_LABELS[row.priority] || row.priority}`;
  return `<section class="jpo-sub-workspace" aria-label="선택된 케이스 실행 큐" data-jpo-sub-case="${escapeHtml(row.id)}">
    <header class="jpo-sub-divider">
      <div>
        <p class="eyebrow">SUB · 선택된 케이스의 실행 큐/에이전트 승인/산출물 생성</p>
        <h3>${escapeHtml(row.title || `${jpoIntakeTypeLabel(row.intakeType)} · ${row.addressMasked}`)}</h3>
        <p>${escapeHtml(metaLine)}</p>
      </div>
      <div class="jpo-sub-actions">
        ${jpoRiskPill(row.riskLevel)} ${jpoStatusPill(row.status)}
        <button class="secondary-button" type="button" data-jpo-open-case="${escapeHtml(row.id)}">상세 화면</button>
      </div>
    </header>
    <div class="jpo-sub-grid">
      <article class="jpo-sub-summary">
        <span>고객/지역/은행/도메인/담당자</span>
        <strong>${escapeHtml(row.customerRefId)} · ${escapeHtml(row.addressMasked)} · 전북은행 · 전세보호 · ${escapeHtml(jpoUserName(row.assignedToId))}</strong>
        <p>${escapeHtml(jpoCaseSituationLine(row))}</p>
      </article>
      <article class="jpo-sub-summary">
        <span>처리 목표</span>
        <strong>위험 신호와 확인 근거를 분리하고 고객 공유 전 승인 대기 산출물로 묶습니다.</strong>
        <p>${escapeHtml(jpoCaseNextAction(row))}</p>
      </article>
      <article class="jpo-sub-summary">
        <span>위험 신호</span>
        <strong>${escapeHtml(signals.map((signal) => signal.title).join(" · ") || "등록된 위험 신호 없음")}</strong>
        <div class="jpo-data-chips">${jpoCaseDataChips(row).map(jpoDataChip).join("")}</div>
      </article>
      <article class="jpo-sub-summary">
        <span>작업 상태</span>
        <div class="jpo-status-segments">
          ${["received", "enriching", "riskReview", "humanReview", "externalLinked", "guidanceDone"].map((status) => `<span class="${row.status === status ? "is-active" : ""}">${escapeHtml(jpoStatusLabel(status))}</span>`).join("")}
        </div>
      </article>
    </div>
    <div class="jpo-queue-toolbar">
      <div>
        <strong>에이전트 실행 큐</strong>
        <span>Enter 실행 · Space 다음 스텝 · ↑↓ 큐 이동</span>
      </div>
      <div class="jpo-agent-chips">${jpoCaseAgentIds(row, false).map(jpoAgentChip).join("")}</div>
    </div>
    ${jpoCaseWorkMap(row)}
    <div class="jpo-sub-grid jpo-sub-lower">
      <article class="jpo-sub-summary">
        <span>생성 산출물</span>
        ${deliverables.length ? `<ul>${deliverables.map((item) => `<li><strong>${escapeHtml(item.fileName)}</strong><p>${escapeHtml(item.title)} · ${escapeHtml(jpoStatusLabel(item.status))}</p></li>`).join("")}</ul>` : "<p>아직 생성된 산출물이 없습니다. 실행 큐에서 에이전트를 실행하세요.</p>"}
      </article>
      <article class="jpo-sub-summary">
        <span>최근 실행/승인</span>
        ${runs.length ? `<ul>${runs.map((run) => `<li><strong>${escapeHtml(jpoAgentDisplayName(run.agentId))}</strong><p>${escapeHtml(run.outputSummary)} · ${escapeHtml(jpoStatusLabel(run.status))}</p></li>`).join("")}</ul>` : "<p>아직 실행 기록이 없습니다.</p>"}
      </article>
      <article class="jpo-sub-summary">
        <span>업로드/근거 파일</span>
        ${files.length ? `<ul>${files.map((file) => `<li><strong>${escapeHtml(file.fileName)}</strong><p>${escapeHtml(file.analysisSummary || "메타데이터만 저장")}</p></li>`).join("")}</ul>` : "<p>등록된 파일 메타데이터 없음</p>"}
      </article>
      <article class="jpo-sub-summary">
        <span>감사 로그</span>
        ${audits.length ? `<ul>${audits.map((audit) => `<li><strong>${escapeHtml(audit.action)}</strong><p>${escapeHtml(audit.createdAt || "-")} · ${escapeHtml(jpoUserName(audit.actorId))}</p></li>`).join("")}</ul>` : "<p>감사 기록 없음</p>"}
      </article>
    </div>
  </section>`;
}

function jpoDashboardView() {
  const cases = jpoTable("jeonse_cases", JPO_ROLE_KEY);
  const counts = jpoState.counts || {};
  const priorityCases = jpoBoardPriorityCases(cases.filter(jpoActiveCase));
  jpoState.boardOrder = priorityCases.map((item) => item.id);
  if (!jpoState.selectedCaseId || !priorityCases.some((item) => item.id === jpoState.selectedCaseId)) {
    jpoState.selectedCaseId = priorityCases[0]?.id || null;
    jpoState.workMapFocusIndex = 0;
  }
  const rank = Object.fromEntries(priorityCases.map((item, index) => [item.id, index + 1]));
  const selectedCase = jpoSelectedBoardCase();
  const columns = JPO_BOARD_COLUMNS.map(([status, label]) => {
    const items = jpoBoardPriorityCases(cases.filter((item) => item.status === status));
    return `<section class="jpo-board-column" data-board-column="${escapeHtml(status)}">
      <header class="jpo-board-head"><strong>${escapeHtml(label)}</strong><span class="nav-count">${items.length}</span></header>
      <div class="jpo-board-cards">${items.map((item) => jpoBoardCard(item, rank[item.id])).join("") || '<div class="jbwc-empty">해당 단계 케이스 없음</div>'}</div>
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
      <div class="jbwc-kpis">${strip}</div>
    </section>
    ${jpoPanel(`케이스 선택/우선순위 업무보드 (활성 ${cases.filter(jpoActiveCase).length}건)`, `<div class="jpo-board-layer-head"><strong>위쪽: 케이스 선택/우선순위</strong><span>상태·위험·SLA 기준으로 정렬됩니다.</span></div><div class="jpo-board">${columns}</div>`)}
    ${jpoSelectedCaseSubSection(selectedCase)}
    <div class="jpo-command-strip"><span>키 안내</span><strong>1-9 케이스 선택</strong><strong>← → 케이스 이동</strong><strong>↑ ↓ 큐 이동</strong><strong>Enter 실행</strong><strong>Space 다음</strong></div>
    ${jpoKeyOverlayMarkup()}
    ${jpoOfficialRefNote()}
    ${jpoMockNote()}`;
}
