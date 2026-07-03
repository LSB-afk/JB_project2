/* 전세사기 보호 하네스 — 목록/현황 view 모음 (v2).
   모든 조회는 jpoTable(table, JPO_ROLE_KEY)로 role scope 강제. 빈 placeholder 화면 금지. */

function jpoCaseListMarkup(rows) {
  return jpoTableView(["케이스", "주택/보증금", "담당/SLA", "상태"], rows, (c) => `
    <li class="jbwc-row" data-jpo-open-case="${escapeHtml(c.id)}">
      <span class="jbwc-row-id">${escapeHtml(jpoCaseNoLabel(c.caseNo))}<br><span class="jbwc-row-note">${escapeHtml(jpoCustomerLabel(c.customerRefId))} · ${escapeHtml(c.addressMasked)}</span></span>
      <span>${escapeHtml(jpoHousingTypeLabel(c.housingType))} · ${escapeHtml(jpoWon(c.depositAmount))}<br><span class="jbwc-row-note">${escapeHtml(jpoIntakeTypeLabel(c.intakeType))}</span></span>
      <span>${escapeHtml(jpoUserName(c.assignedToId))}<br><span class="jbwc-row-note">SLA ${escapeHtml(c.dueAt || "-")} ${c.auctionNoticed ? "· 경공매" : ""}</span></span>
      <span>${jpoStatusPill(c.status)} ${jpoRiskPill(c.riskLevel)} ${jpoSourceModePill(c.sourceMode)}</span>
    </li>`);
}

function jpoSignalListMarkup(rows) {
  return jpoTableView(["신호", "근거", "관련 건", "심각도"], rows, (x) => `
    <li class="jbwc-row" data-jpo-open-detail="signal:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}<br><span class="jbwc-row-note">${escapeHtml(x.signalType)}</span></span>
      <span>${escapeHtml(x.title)}<br><span class="jbwc-row-note">${escapeHtml(x.evidence || "-")}</span></span>
      <span>${escapeHtml(jpoCaseNoLabel(x.caseId) || "-")}</span>
      <span>${jpoRiskPill(x.severity)} ${x.requiresHumanReview ? '<span class="status-pill status-pending">담당자 검토 필요</span>' : ""}</span></li>`);
}

function jpoSnapshotComparisonMarkup(rows, focus) {
  return jpoTableView(["시세 비교 기록", "인근 거래 기준가", "표본/전세가율", "데이터 연계 상태"], rows, (x) => `
    <li class="jbwc-row" data-jpo-open-detail="snapshot:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(jpoSnapshotLabel(x.id))}<br><span class="jbwc-row-note">${escapeHtml(jpoCaseNoLabel(x.caseId) || "-")} · ${escapeHtml(x.lawdCode)} · ${escapeHtml(x.dealYm)}</span></span>
      <span>${focus === "rent" ? `전세 ${escapeHtml(jpoWon(x.jeonseMedian))}` : focus === "official" ? `추정 공시 ${escapeHtml(jpoWon(x.officialPriceEst))}` : `매매 ${escapeHtml(jpoWon(x.saleMedian))}`}<br>
        <span class="jbwc-row-note">매매 ${escapeHtml(jpoWon(x.saleMedian))} · 전세 ${escapeHtml(jpoWon(x.jeonseMedian))}</span></span>
      <span>매매 ${escapeHtml(String(x.comparableTradeCount ?? 0))}건 · 전월세 ${escapeHtml(String(x.comparableRentCount ?? 0))}건<br>
        <span class="jbwc-row-note">전세가율 ${x.jeonseRatio != null ? escapeHtml(String(Math.round(x.jeonseRatio * 100))) + "%" : "산출 불가"}</span></span>
      <span>${jpoSourceModePill(x.sourceMode)}</span></li>`);
}

/* ---- 케이스 상세 페이지(탭 8) — /roles/jeonse-protection/cases/:caseId/full ---- */
const JPO_CASE_TABS = [
  ["overview", "개요"],
  ["signals", "위험 신호"],
  ["market", "시세·실거래"],
  ["registry", "권리관계"],
  ["guarantee", "보증·HUG"],
  ["support", "피해지원"],
  ["ai", "AI 분석"],
  ["evidence", "근거·감사"],
];

function jpoCaseFullView() {
  const caseId = jpoState.detail && jpoState.detail.id;
  const row = jpoTable("jeonse_cases", JPO_ROLE_KEY).find((item) => item.id === caseId || item.caseNo === caseId);
  if (!row) {
    return jpoPanel("케이스 상세", `<div class="jbwc-empty">요청한 케이스(${escapeHtml(caseId || "-")})를 찾을 수 없습니다.
      <button class="secondary-button" type="button" data-jpo-go-view="board">보드로 돌아가기</button></div>`);
  }
  const tab = JPO_CASE_TABS.some(([key]) => key === jpoState.caseTab) ? jpoState.caseTab : "overview";
  const tabBar = `<nav class="jpo-case-tabs" aria-label="케이스 상세 탭">${JPO_CASE_TABS.map(([key, label]) => `
    <button type="button" class="secondary-button ${tab === key ? "is-active" : ""}" data-jpo-case-tab="${key}">${escapeHtml(label)}</button>`).join("")}</nav>`;
  const head = `<section class="workspace-panel jbwc-panel jpo-case-head">
    <p class="eyebrow">케이스 상세 · 전세보호 업무 기준</p>
    <h2>${escapeHtml(jpoCaseNoLabel(row.caseNo))} · ${escapeHtml(row.addressMasked)} ${escapeHtml(jpoHousingTypeLabel(row.housingType))}</h2>
    <p class="jbwc-meta">${jpoRiskPill(row.riskLevel)} ${jpoStatusPill(row.status)} ${jpoSourceModePill(row.sourceMode)} · ${escapeHtml(jpoCustomerLabel(row.customerRefId))} · 담당 ${escapeHtml(jpoUserName(row.assignedToId))}</p>
    ${tabBar}</section>`;
  return head + jpoCaseTabBody(row, tab) + jpoMockNote();
}

function jpoCaseTabBody(row, tab) {
  const byCase = (table) => jpoTable(table, JPO_ROLE_KEY).filter((item) => item.caseId === row.id);
  if (tab === "overview") {
    const grid = [
      ["사건번호", jpoCaseNoLabel(row.caseNo)], ["익명 고객 ID", jpoCustomerLabel(row.customerRefId)],
      ["주택 유형", jpoHousingTypeLabel(row.housingType)], ["주소 일부", row.addressMasked],
      ["접수 유형", jpoIntakeTypeLabel(row.intakeType)], ["접수 채널", row.sourceChannel === "opsPortal" ? "업무포털" : (row.sourceChannel || "-")],
      ["상태", JPO_STATUS_LABELS[row.status] || row.status], ["담당자", jpoUserName(row.assignedToId)],
      ["처리 기한(SLA)", row.dueAt || "-"], ["보증금", jpoWon(row.depositAmount)],
      ["월세", Number(row.monthlyRentAmount || 0) > 0 ? jpoWon(row.monthlyRentAmount) : "없음"],
      ["계약 시작/만기", `${row.contractStartDate || "-"} ~ ${row.contractEndDate || "-"}`],
    ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value ?? "-"))}</strong></div>`).join("");
    return jpoPanel("개요", `<div class="jbwc-detail-grid">${grid}</div>`);
  }
  if (tab === "signals") {
    const rows = byCase("jeonse_risk_signals");
    return jpoPanel(`위험 신호 (${rows.length})`, jpoTableView(["신호", "근거", "필요 조치", "심각도"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.title)}</span>
        <span class="jbwc-row-note">${escapeHtml(x.evidence || "-")}</span>
        <span>${escapeHtml(x.requiredAction || "담당자 확인")}</span>
        <span>${jpoRiskPill(x.severity)} ${x.requiresHumanReview ? '<span class="status-pill status-pending">담당자 검토 필요</span>' : ""}</span></li>`)
      + `<p class="jbwc-guard">신호는 전세사기 여부에 대한 확정 판정이 아니며, 담당자 확인·외부기관 확인으로 이어집니다.</p>`);
  }
  if (tab === "market") {
    const rows = byCase("jeonse_price_snapshots");
    const latest = rows[0];
    const grid = latest ? [
      ["인근 매매 거래 기준가", jpoWon(latest.saleMedian)], ["인근 전세 거래 기준가", jpoWon(latest.jeonseMedian)],
      ["유사 매매 거래", `${latest.comparableTradeCount ?? 0}건`], ["유사 전월세 거래", `${latest.comparableRentCount ?? 0}건`],
      ["전세가율", latest.jeonseRatio != null ? `${Math.round(latest.jeonseRatio * 100)}%` : "산출 불가"],
      ["데이터 연계 상태", JPO_SOURCE_MODES[latest.sourceMode] || latest.sourceMode],
      ["기준 설명", JPO_SOURCE_MODE_HINTS[latest.sourceMode] || "-"], ["마지막 갱신", latest.createdAt || "-"],
    ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`).join("") : "";
    return jpoPanel("시세·실거래", latest ? `<div class="jbwc-detail-grid">${grid}</div>` : '<div class="jbwc-empty">시세 비교 기록 없음 — 데이터 보강을 실행해 주세요.</div>')
      + (rows.length ? jpoPanel(`시세 비교 기록 (${rows.length})`, jpoSnapshotComparisonMarkup(rows, "sale")) : "");
  }
  if (tab === "registry") {
    const rows = byCase("jeonse_registry_checks");
    return jpoPanel(`권리관계 확인 (${rows.length})`, jpoTableView(["확인 항목", "메모", "확인 방식", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.checkType)}</span>
        <span class="jbwc-row-note">${escapeHtml(x.note || "-")}</span>
        <span>${x.manualRequired ? "담당자 확인 필요(수동)" : "자동 참조"}</span>
        <span>${jpoStatusPill(x.status)}</span></li>`)
      + `<p class="jbwc-guard">선순위 근저당·압류·가압류·신탁은 등기부 원문 저장 없이 확인 필요 항목으로만 관리합니다.</p>`);
  }
  if (tab === "guarantee") {
    const rows = byCase("jeonse_guarantee_checks");
    return jpoPanel(`보증·HUG 확인 (${rows.length})`, jpoTableView(["보증기관", "메모", "확인 방식", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.provider)}</span>
        <span class="jbwc-row-note">${escapeHtml(x.note || "-")}</span>
        <span>${x.manualRequired ? "담당자 확인 필요(수동)" : "자동 참조"}</span>
        <span>${jpoStatusPill(x.status)}</span></li>`)
      + `<p class="jbwc-guard">보증보험 가입 가능 여부는 확정하지 않습니다 — 확인 필요 항목만 관리합니다.</p>`);
  }
  if (tab === "support") {
    const rows = byCase("jeonse_support_referrals");
    const docs = (row.docChecklist || []).map(([doc, state]) => `
      <li class="jbwc-row"><span>${escapeHtml(doc)}</span><span>${jpoStatusPill(state === "보유" ? "verified" : "unknown")} ${escapeHtml(state)}</span></li>`).join("");
    return jpoPanel(`피해지원 연계 (${rows.length})`, jpoTableView(["연계 유형", "대상 기관", "메모", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml({ victimApplication: "피해자 결정 신청", legal: "법률지원", financeHousing: "금융·주거지원", care: "센터 연계" }[x.referralType] || x.referralType)}</span>
        <span>${escapeHtml(x.targetAgency)}</span><span class="jbwc-row-note">${escapeHtml(x.note || "-")}</span>
        <span>${jpoStatusPill(x.status)}</span></li>`))
      + jpoPanel("제출서류 체크리스트", docs ? `<ul class="jbwc-list">${docs}</ul>` : '<div class="jbwc-empty">체크리스트 없음</div>')
      + `<p class="jbwc-guard">피해자 결정 여부는 확정하지 않으며, 신청 준비와 기관 연계만 지원합니다.</p>`;
  }
  if (tab === "ai") {
    const runs = byCase("jeonse_agent_runs");
    const evaluatorRuns = runs.filter((x) => x.agentId === "jpo-evaluator");
    return jpoPanel(`AI 실행 기록 (${runs.length})`, jpoTableView(["실행", "에이전트", "입력→결과", "상태"], runs, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.createdAt)}</span>
        <span>${escapeHtml(jpoAgentDisplayName(x.agentId))}</span>
        <span>${escapeHtml(x.inputSummary)}<br><span class="jbwc-row-note">${escapeHtml(x.outputSummary)}</span></span>
        <span>${jpoStatusPill(x.status)}</span></li>`))
      + jpoPanel(`검증 결과 (${evaluatorRuns.length})`, evaluatorRuns.length ? `<ul class="jbwc-list">${evaluatorRuns.map((x) => `
        <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.createdAt)}</span><span>${escapeHtml(x.outputSummary)}</span>
          <span>${jpoStatusPill(x.status)}</span><span></span></li>`).join("")}</ul>` : '<div class="jbwc-empty">검증 실행 이력 없음</div>')
      + `<p class="jbwc-guard">모든 AI output은 내부 운영 참고용이며 담당자 검토 필요 상태로만 존재합니다.</p>`;
  }
  // evidence 탭
  const evidence = byCase("jeonse_evidence");
  const audits = jpoTable("jeonse_audit_logs", JPO_ROLE_KEY).filter((item) => item.caseId === row.id || item.targetId === row.id);
  return jpoPanel(`근거 피드 (${evidence.length})`, jpoTableView(["근거", "내용", "참조 기록", "출처"], evidence, (x) => `
    <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.createdAt)}<br><span class="jbwc-row-note">${escapeHtml(x.id)}</span></span>
      <span>${escapeHtml(x.title)}<br><span class="jbwc-row-note">${escapeHtml(x.detail || "-")}</span></span>
      <span>${escapeHtml(x.refId ? jpoRecordLabel(x.refId) : "수동 근거")}</span>
      <span>${escapeHtml(x.source || "-")}</span></li>`)
    + `<footer><button class="secondary-button" type="button" data-jpo-verify-evidence="${escapeHtml(row.id)}">근거 무결성 확인</button>
      ${jpoState.evidenceCheck && jpoState.evidenceCheck.caseId === row.id ? `<span class="jbwc-meta" data-evidence-check>${escapeHtml(jpoState.evidenceCheck.message)}</span>` : ""}</footer>`)
    + jpoPanel(`감사 로그 (${audits.length})`, jpoTableView(["시각", "행위", "대상 기록", "상태"], audits, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.createdAt)}</span>
        <span>${escapeHtml(JPO_AUDIT_ACTION_LABELS[x.action] || x.action)}</span>
        <span class="jbwc-row-note">${escapeHtml(x.id)}</span>
        <span>${x.reviewRequired ? '<span class="status-pill status-escalated">검토 필요</span>' : '<span class="status-pill status-approved">기록됨</span>'}</span></li>`));
}

const jpoCaseViewRenderers = {
  "case-full"() { return jpoCaseFullView(); },
  cases() {
    const rows = jpoTable("jeonse_cases", JPO_ROLE_KEY);
    return jpoPanel(`전세 위험 케이스 (${rows.length})`, jpoCaseListMarkup(rows)) + jpoMockNote();
  },
  "price-enrich"() {
    const rows = jpoTable("jeonse_price_snapshots", JPO_ROLE_KEY);
    const needy = jpoTable("jeonse_cases", JPO_ROLE_KEY).filter((c) => c.status === "enriching" || c.sourceMode === "fallback");
    const liveNote = (typeof isLive === "function" && isLive())
      ? `<p class="jbwc-guard">실거래 API 모드(?live=1) — 프록시(:8020) 연결 상태에 따라 live_api/fallback이 기록됩니다.</p>`
      : `<p class="jbwc-guard">실시간 API 미연결 · 저장된 시세 기준으로 동작 중입니다. 키는 환경변수로만 주입됩니다(프록시: npm run demo:proxy).</p>`;
    return jpoPanel(`보강 필요 케이스 (${needy.length})`, jpoCaseListMarkup(needy),
      `<div class="jbwc-samples"><button class="secondary-button" type="button" data-jpo-enrich-latest>최근 케이스 시세 보강 실행</button></div>
      ${jpoState.enrich.status !== "idle" ? `<p class="jbwc-guard" data-enrich-status="${escapeHtml(jpoState.enrich.status)}">${escapeHtml(jpoState.enrich.message)}</p>` : ""}`)
      + jpoPanel(`시세 비교 기록 (${rows.length})`, jpoSnapshotComparisonMarkup(rows, "sale")) + liveNote + jpoMockNote();
  },
  "registry-check"() {
    const rows = jpoTable("jeonse_registry_checks", JPO_ROLE_KEY);
    return jpoPanel(`권리관계 확인 (${rows.length} · 수동 확인 ${rows.filter((x) => x.manualRequired).length})`,
      jpoTableView(["점검", "요약", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-detail="registry:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.checkType)}<br><span class="jbwc-row-note">${escapeHtml(x.evidenceSummary || "-")}</span></span>
        <span>${escapeHtml(jpoCaseNoLabel(x.caseId) || "-")} · 기한 ${escapeHtml(x.dueAt || "-")}</span>
        <span>${jpoStatusPill(x.status)} ${x.manualRequired ? '<span class="status-pill status-escalated">수동 확인 필요</span>' : ""}</span></li>`))
      + `<p class="jbwc-guard">등기부 권리관계는 자동 확정하지 않습니다 — 열람 요약만 기록하고 원문은 저장하지 않습니다.</p>` + jpoMockNote();
  },
  "guarantee-check"() {
    const rows = jpoTable("jeonse_guarantee_checks", JPO_ROLE_KEY);
    return jpoPanel(`보증·HUG 확인 (${rows.length})`, jpoTableView(["확인", "기관/요약", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-detail="guarantee:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.provider)}<br><span class="jbwc-row-note">${escapeHtml(x.evidenceSummary || "-")}</span></span>
        <span>${escapeHtml(jpoCaseNoLabel(x.caseId) || "-")} · 확인 ${escapeHtml(x.checkedAt || "-")}</span>
        <span>${jpoStatusPill(x.status)} ${x.manualRequired ? '<span class="status-pill status-escalated">수동 확인 필요</span>' : ""}</span></li>`))
      + `<p class="jbwc-guard">보증보험 가입 가능 여부는 확정하지 않습니다 — 확인 필요 항목만 정리합니다. 최신 기준 담당자 확인 필요.</p>` + jpoMockNote();
  },
  "victim-application"() {
    const rows = jpoTable("jeonse_support_referrals", JPO_ROLE_KEY).filter((x) => x.referralType === "victimApplication");
    return jpoPanel(`피해지원 신청 검토 (${rows.length})`, jpoTableView(["검토", "기관(참고)", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-detail="referral:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.targetAgency)}<br><span class="jbwc-row-note">${escapeHtml(x.notes || "-")}</span></span>
        <span>${escapeHtml(jpoCaseNoLabel(x.caseId) || "-")}</span>
        <span>${jpoStatusPill(x.status)} <span class="status-pill status-pending">담당자 검토 필요</span></span></li>`))
      + `<p class="jbwc-guard">피해자 결정 신청은 준비 "보조"입니다 — 결정 가능 여부를 확정하지 않으며 실제 신청 대행이 아닙니다.</p>`
      + jpoOfficialRefNote() + jpoMockNote();
  },
  "urgent-auction"() {
    const rows = jpoTable("jeonse_cases", JPO_ROLE_KEY)
      .filter((c) => c.auctionNoticed && jpoActiveCase(c))
      .sort((a, b) => String(a.auctionDeadline).localeCompare(String(b.auctionDeadline)));
    return jpoPanel(`긴급 경·공매 대응 (${rows.length})`, jpoTableView(["케이스", "기한", "담당", "상태"], rows, (c) => `
      <li class="jbwc-row" data-jpo-open-case="${escapeHtml(c.id)}"><span class="jbwc-row-id">${escapeHtml(jpoCaseNoLabel(c.caseNo))}<br><span class="jbwc-row-note">${escapeHtml(c.addressMasked)}</span></span>
        <span>경·공매 기한 ${escapeHtml(c.auctionDeadline || "-")}<br><span class="jbwc-row-note">보증금 ${escapeHtml(jpoWon(c.depositAmount))}</span></span>
        <span>${escapeHtml(jpoUserName(c.assignedToId))}</span>
        <span>${jpoStatusPill(c.status)} ${jpoRiskPill(c.riskLevel)}</span></li>`))
      + `<p class="jbwc-guard">경·공매 케이스는 자동 종결이 금지되며, 우선매수·배당요구 등은 "안내 후보"로만 정리합니다.</p>` + jpoMockNote();
  },
  "price-risk"() {
    const signals = jpoTable("jeonse_risk_signals", JPO_ROLE_KEY).filter((x) => ["JEONSE_RATIO_HIGH", "DEPOSIT_OVER_OFFICIAL_PRICE", "ABOVE_NEIGHBORHOOD_MEDIAN"].includes(x.signalType));
    const snapshots = jpoTable("jeonse_price_snapshots", JPO_ROLE_KEY).filter((x) => x.jeonseRatio != null);
    return jpoPanel(`전세가율/시세 위험 신호 (${signals.length})`, jpoSignalListMarkup(signals))
      + jpoPanel(`케이스별 전세가율 (${snapshots.length})`, jpoSnapshotComparisonMarkup(snapshots, "sale"))
      + `<p class="jbwc-guard">전세가율은 위험 "신호"일 뿐 전세사기 판정이 아닙니다.</p>` + jpoMockNote();
  },
  "rent-comparables"() {
    const rows = jpoTable("jeonse_price_snapshots", JPO_ROLE_KEY).filter((x) => Number(x.comparableRentCount) > 0);
    return jpoPanel(`유사 전월세 거래 비교 (${rows.length})`, jpoSnapshotComparisonMarkup(rows, "rent"))
      + `<p class="jbwc-guard">서울/국토부 전월세 실거래 기반 인근 거래 기준가 비교 — 표본 부족 시 판단을 유보합니다.</p>` + jpoMockNote();
  },
  "sale-comparables"() {
    const rows = jpoTable("jeonse_price_snapshots", JPO_ROLE_KEY).filter((x) => Number(x.comparableTradeCount) > 0);
    return jpoPanel(`매매 실거래 비교 (${rows.length})`, jpoSnapshotComparisonMarkup(rows, "sale"))
      + `<p class="jbwc-guard">국토부 매매 실거래 기준 — 보증금/추정 매매가 비율 산출에 사용합니다.</p>` + jpoMockNote();
  },
  "official-price"() {
    const rows = jpoTable("jeonse_price_snapshots", JPO_ROLE_KEY).filter((x) => Number(x.officialPriceEst) > 0);
    return jpoPanel(`공시가격/추정가 비교 (${rows.length})`, jpoSnapshotComparisonMarkup(rows, "official"))
      + `<p class="jbwc-guard">공시가격 API 미연동 상태에서는 인근 매매 거래 기준가 기반 "추정" 공시가격만 표시합니다 — 확정값 아님.</p>` + jpoMockNote();
  },
  "building-check"() {
    const signals = jpoTable("jeonse_risk_signals", JPO_ROLE_KEY).filter((x) => x.signalType === "ILLEGAL_BUILDING_MANUAL_REQUIRED");
    const checks = jpoTable("jeonse_registry_checks", JPO_ROLE_KEY).filter((x) => String(x.checkType).includes("건축물"));
    return jpoPanel(`건축물·위반건축물 확인 신호 (${signals.length})`, jpoSignalListMarkup(signals))
      + jpoPanel(`건축물 점검 항목 (${checks.length})`, jpoTableView(["점검", "요약", "관련 건", "상태"], checks, (x) => `
        <li class="jbwc-row" data-jpo-open-detail="registry:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
          <span>${escapeHtml(x.checkType)}<br><span class="jbwc-row-note">${escapeHtml(x.evidenceSummary || "-")}</span></span>
          <span>${escapeHtml(jpoCaseNoLabel(x.caseId) || "-")}</span>
          <span>${jpoStatusPill(x.status)} ${x.manualRequired ? '<span class="status-pill status-escalated">수동 확인 필요</span>' : ""}</span></li>`))
      + `<p class="jbwc-guard">건축물대장/위반건축물 여부는 외부기관 확인 필요 — 자동 판정하지 않습니다.</p>` + jpoMockNote();
  },
  "landlord-risk"() {
    const signals = jpoTable("jeonse_risk_signals", JPO_ROLE_KEY).filter((x) => x.signalType === "LANDLORD_RISK_MANUAL_REQUIRED");
    return jpoPanel(`임대인/보증사고 확인 필요 (${signals.length})`, jpoSignalListMarkup(signals))
      + `<p class="jbwc-guard">임대인 신용정보는 조회/저장하지 않습니다 — HUG 보증사고 공개정보 등 외부기관 확인 필요 항목만 관리합니다.</p>` + jpoMockNote();
  },
  "intake-consult"() {
    const rows = jpoTable("jeonse_cases", JPO_ROLE_KEY).filter((c) => ["etcConsult", "legalConsult", "guaranteeInquiry", "depositDelay"].includes(c.intakeType) && jpoActiveCase(c));
    return jpoPanel(`피해 의심 상담 큐 (${rows.length})`, jpoCaseListMarkup(rows)) + jpoMockNote();
  },
  "victim-guide"() {
    const rows = jpoTable("jeonse_cases", JPO_ROLE_KEY).filter((c) => ["victimApplication", "auctionNotice", "depositDelay"].includes(c.intakeType) && jpoActiveCase(c));
    const steps = [
      "1) 피해 정황·계약 정보 정리(익명 Ref 기준)",
      "2) 특별법 요건 항목 대조 — 요건 충족 여부는 담당자·외부기관 확인 필요",
      "3) 제출서류 체크리스트 준비",
      "4) 국토부 지원관리시스템 안내(참고) — 실제 신청은 임차인 본인/공식 채널",
    ];
    return jpoPanel("결정 신청 안내 절차(참고)", `<ul class="jbwc-list">${steps.map((step) => `<li class="jbwc-row"><span>${escapeHtml(step)}</span></li>`).join("")}</ul>`)
      + jpoPanel(`안내 대상 후보 케이스 (${rows.length})`, jpoCaseListMarkup(rows))
      + jpoOfficialRefNote() + jpoMockNote();
  },
  "doc-checklist"() {
    const rows = jpoTable("jeonse_cases", JPO_ROLE_KEY).filter((c) => (c.docChecklist || []).length);
    return jpoPanel(`제출서류 체크리스트 (${rows.length}건)`, jpoTableView(["케이스", "서류 상태", "담당", "상태"], rows, (c) => `
      <li class="jbwc-row" data-jpo-open-case="${escapeHtml(c.id)}"><span class="jbwc-row-id">${escapeHtml(jpoCaseNoLabel(c.caseNo))}</span>
        <span>${(c.docChecklist || []).map(([doc, state]) => `${escapeHtml(doc)}: <strong>${escapeHtml(state)}</strong>`).join("<br>")}</span>
        <span>${escapeHtml(jpoUserName(c.assignedToId))}</span>
        <span>${jpoStatusPill(c.status)}</span></li>`)) + jpoMockNote();
  },
  "legal-referral"() { return jpoReferralView("legal", "법률지원 연계"); },
  "finance-housing-referral"() { return jpoReferralView("financeHousing", "금융·주거지원 연계"); },
  "care-referral"() { return jpoReferralView("care", "센터 연계(심리상담 포함)"); },
  "support-referral"() { return jpoReferralView(null, "피해자 상담/지원 연계(전체)"); },
  "ai-analysis"() {
    const rows = jpoTable("ai_analysis_requests", JPO_ROLE_KEY);
    return jpoPanel(`AI 위험 분석 요청 (${rows.length})`, jpoTableView(["요청", "유형", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.requestType)}</span><span>${escapeHtml(jpoCaseNoLabel(x.caseId) || "-")} · ${escapeHtml(jpoUserName(x.requestedById))}</span>
        <span>${jpoStatusPill(x.status)}</span></li>`)) + jpoMockNote();
  },
  "ai-consult-summary"() {
    const rows = jpoTable("ai_recommendations", JPO_ROLE_KEY).filter((x) => x.kind === "consultSummary");
    return jpoPanel(`AI 상담 요약 (${rows.length})`, jpoTableView(["요약", "에이전트", "관련 건", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-detail="recommendation:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.title)}<br><span class="jbwc-row-note">확신도 ${escapeHtml(x.confidence)}</span></span>
        <span>${escapeHtml(jpoAgentDisplayName(x.agentId))} · ${escapeHtml(jpoCaseNoLabel(x.caseId) || "-")}</span>
        <span>${jpoStatusPill(x.status)}</span></li>`))
      + `<p class="jbwc-guard">고객 공유 문안은 승인 대기(pendingApproval)를 거치기 전에는 발송되지 않습니다.</p>` + jpoMockNote();
  },
  "data-connectors"() {
    const rows = jpoTable("external_connectors", JPO_ROLE_KEY);
    const live = typeof isLive === "function" && isLive();
    return jpoPanel(`데이터 연결 상태 (${rows.length})`, jpoTableView(["커넥터", "분류", "최근 동기화", "상태"], rows, (x) => `
      <li class="jbwc-row" data-jpo-open-detail="connector:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
        <span>${escapeHtml(x.name)}<br><span class="jbwc-row-note">${escapeHtml(x.externalRef || "-")}</span></span>
        <span>${escapeHtml(x.category)} · ${escapeHtml(x.lastSyncAt || "-")}</span>
        <span>${jpoStatusPill(x.health)} ${jpoSourceModePill(x.sourceMode)}</span></li>`))
      + `<p class="jbwc-guard">현재 모드: ${live ? "실시간 API 기준(?live=1) — 프록시 경유, 키는 환경변수로만" : "실시간 API 미연결 · 저장 기준 사용"}. HUG·등기부·건축물대장은 수동 확인(manualRequired) 커넥터입니다.</p>`
      + jpoMockNote();
  },
  roles() {
    const users = jpoTable("users", JPO_ROLE_KEY);
    const rows = jpoTable("role_assignments", JPO_ROLE_KEY);
    return jpoPanel(`담당자 (${users.length})`, jpoTableView(["담당자", "팀", "역할", "상태"], users, (u) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(u.id)}</span>
        <span>${escapeHtml(u.name)}</span><span>${escapeHtml(u.team)} · ${escapeHtml(u.role)}</span><span>${jpoStatusPill(u.status)}</span></li>`))
      + jpoPanel(`권한 배정 (${rows.length})`, jpoTableView(["배정", "역할", "범위", "상태"], rows, (x) => `
        <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
          <span>${escapeHtml(jpoUserName(x.userId))} — ${escapeHtml(x.role)}</span><span>${escapeHtml(x.permissionScope)}</span>
          <span>${jpoStatusPill(x.status)} ${x.reviewRequired ? '<span class="status-pill status-pending">검토 필요</span>' : ""}</span></li>`)) + jpoMockNote();
  },
  "audit-logs"() {
    const rows = jpoTable("jeonse_audit_logs", JPO_ROLE_KEY);
    return jpoPanel(`감사 기록 (${rows.length} · 검토 필요 ${rows.filter((x) => x.reviewRequired).length})`,
      jpoTableView(["기록", "행위", "대상", "상태"], rows, (x) => `
        <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.createdAt)}<br>${escapeHtml(x.id)}</span>
          <span>${escapeHtml(x.action)}<br><span class="jbwc-row-note">${escapeHtml(jpoUserName(x.actorId))}</span></span>
          <span>${escapeHtml(x.targetType)} ${escapeHtml(x.targetId)}</span>
          <span>${x.reviewRequired ? '<span class="status-pill status-escalated">검토 필요</span>' : '<span class="status-pill status-approved">기록됨</span>'} ${jpoRiskPill(x.riskLevel)}</span></li>`)) + jpoMockNote();
  },
  inspections() {
    const rows = jpoTable("inspection_schedules", JPO_ROLE_KEY);
    return jpoPanel(`정기 점검 (${rows.length})`, jpoTableView(["점검", "유형", "담당/기한", "상태"], rows, (x) => `
      <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.id)}</span><span>${escapeHtml(x.inspectionType)}</span>
        <span>${escapeHtml(jpoUserName(x.ownerId))} · 기한 ${escapeHtml(x.dueAt || "-")}</span><span>${jpoStatusPill(x.status)}</span></li>`)) + jpoMockNote();
  },
};

function jpoReferralView(category, title) {
  const rows = jpoTable("jeonse_support_referrals", JPO_ROLE_KEY)
    .filter((x) => (category ? x.referralType === category : x.referralType !== "victimApplication"));
  return jpoPanel(`${title} (${rows.length})`, jpoTableView(["연계", "기관(안내 후보)", "관련 건", "상태"], rows, (x) => `
    <li class="jbwc-row" data-jpo-open-detail="referral:${escapeHtml(x.id)}"><span class="jbwc-row-id">${escapeHtml(x.id)}</span>
      <span>${escapeHtml(x.targetAgency)}<br><span class="jbwc-row-note">${escapeHtml(x.notes || "-")}</span></span>
      <span>${escapeHtml(jpoCaseNoLabel(x.caseId) || "-")}</span>
      <span>${jpoStatusPill(x.status)}</span></li>`))
    + `<p class="jbwc-guard">기관 연계는 "신청 대행"이 아니라 "안내 후보"입니다 — 최신 기준 담당자 확인 필요.</p>` + jpoMockNote();
}
