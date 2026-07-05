/* ============================================================
   RM 3계층 메모리 카드 — 실 에이전트 런에서 자동 증류되는 기억 슬라이스
   (예선 PR#2 memoryCards.js를 CCL→RMO 콘솔로 재타깃)

   킬스위치: 이 파일과 index.html의 <script src="./rmoMemoryCards.js"> 태그를
   제거하면 stock 동작으로 100% 복원된다. 승보의 app/*.js 원본은 무수정이며,
   여기서는 전역 함수(recordRmOfficerAgentRun · runAgentModelRequest)와
   훅 배열(rmOfficerHooks.afterApprovalDecision) · 뷰 렌더러 맵(rmoViewRenderers)만
   런타임에 확장한다. 증류/주입 실패가 원래 런을 절대 깨뜨리지 않는다(try/catch).

   저장: rmo-ops-db-v2 · 테이블 rmo_memory_cards · RMO_ROLE_KEY scope
   원칙: 기본값은 "기억하지 않는다" — 기록 필드에서만 짧은 한국어 사실을 만든다.
         PII 가드(harnessGuardCheckPII) 통과 못 하면 저장 거부(Zero-PII).
   ============================================================ */

const RMO_MEMORY_TABLE = "rmo_memory_cards";
const RMO_MEMORY_LAYER_LABELS = { customer: "고객", agent: "에이전트", staff: "직원(업무)" };

/* 데모 계기판용 카운터 — PII 거부 건수 / 마지막 LLM 주입 적중 수 */
const rmoMemoryStats = { piiRefused: 0, lastInjected: 0, injectTotal: 0 };

function rmoMemoryCards(layer) {
  const rows = rmoTable(RMO_MEMORY_TABLE, RMO_ROLE_KEY);
  return layer ? rows.filter((row) => row.layer === layer) : rows;
}

/* 같은 (layer, subjectKey, fact) 카드는 새로 만들지 않고 관측 횟수를 올린다.
   3회 관측부터 candidate → confirmed. staff 카드는 crossBan=true(위험판단 컨텍스트 주입 금지). */
function rmoMemoryUpsert(layer, subjectKey, fact, provenanceId) {
  if (!subjectKey || !fact) return null;
  if (typeof harnessGuardCheckPII === "function" && harnessGuardCheckPII(fact)) {
    rmoMemoryStats.piiRefused += 1; // PII 의심 패턴 → 카드 저장 거부
    return null;
  }
  const today = new Date().toISOString().slice(0, 10);
  const db = rmoRepository.snapshot();
  db[RMO_MEMORY_TABLE] = db[RMO_MEMORY_TABLE] || [];
  const existing = db[RMO_MEMORY_TABLE].find((row) =>
    row.roleKey === RMO_ROLE_KEY && row.layer === layer && row.subjectKey === subjectKey && row.fact === fact);
  if (existing) {
    existing.observedCount += 1;
    if (existing.observedCount >= 3) existing.confidence = "confirmed";
    if (provenanceId && !existing.provenance.includes(provenanceId)) existing.provenance.push(provenanceId);
    existing.updatedAt = today;
    rmoSaveDb();
    return existing;
  }
  return rmoInsert(RMO_MEMORY_TABLE, rmoScopedRow({
    id: rmoNextId("MEM-RMO", RMO_MEMORY_TABLE),
    layer,
    subjectKey,
    fact,
    provenance: provenanceId ? [provenanceId] : [],
    observedCount: 1,
    confidence: "candidate",
    crossBan: layer === "staff",
    createdAt: today,
    updatedAt: today,
  }));
}

/* 위험도 라벨 — 확정 표현 없이 짧게 */
function rmoMemoryRiskWord(riskLevel) {
  return ({ critical: "매우 높음", high: "높음", medium: "보통", low: "낮음" })[riskLevel] || String(riskLevel || "보통");
}

/* 실 에이전트 런 1건에서 고객·에이전트 계층 사실을 증류.
   record 필드에서만 문장을 만든다 — 없는 정보는 만들지 않는다. */
function rmoMemoryDistillFromRun(run) {
  if (!run || run.roleKey !== RMO_ROLE_KEY) return;
  const runtimeWord = run.runtime === "ollama" ? "로컬 모델" : "모의";
  const reviewWord = run.status === "needsReview" || run.requiresHumanReview ? " · 사람 검토 대기" : "";
  if (run.agentId) {
    rmoMemoryUpsert("agent", run.agentId,
      `${runtimeWord} 실행 결과 기록 · 위험 ${rmoMemoryRiskWord(run.riskLevel)}${reviewWord}`, run.id);
  }
  if (run.caseId) {
    rmoMemoryUpsert("customer", run.caseId,
      `${rmoAgentDisplayName(run.agentId)} 분석 이력 · 위험 ${rmoMemoryRiskWord(run.riskLevel)}`, run.id);
  }
}

/* 승인/반려(사람 결정)에서만 직원 계층을 증류 — afterApprovalDecision 훅 payload:
   { approvalId, decision, decidedBy } → approvalId로 승인 행을 되짚어 caseId/유형 확보. */
function rmoMemoryDistillFromApproval(payload) {
  const decidedBy = String((payload && payload.decidedBy) || "");
  if (!decidedBy) return; // decidedBy 없는 결정은 가드가 이미 위반 처리
  const approval = rmoTable("rm_officer_approvals", RMO_ROLE_KEY).find((a) => a.id === (payload && payload.approvalId));
  const decisionWord = payload && payload.decision === "reject" ? "반려" : "승인";
  const kind = (approval && approval.approvalType) || "승인 요청";
  rmoMemoryUpsert("staff", decidedBy, `${kind} ${decisionWord} 결정 처리 패턴`, approval && approval.id);
  if (approval && approval.caseId) {
    rmoMemoryUpsert("customer", approval.caseId, `사람 ${decisionWord} 결정 처리됨 · 근거 ${approval.id}`, approval.id);
  }
}

/* ---- 실 흐름 배선: 단일 초크포인트 recordRmOfficerAgentRun 래핑 ---- */
if (typeof recordRmOfficerAgentRun === "function") {
  const __rmoOrigRecord = recordRmOfficerAgentRun;
  recordRmOfficerAgentRun = function (input) {
    const run = __rmoOrigRecord(input);
    try { rmoMemoryDistillFromRun(run); } catch (_) { /* 메모리 실패가 런을 깨면 안 됨 */ }
    return run;
  };
}

/* ---- 직원 계층: afterApprovalDecision 훅 배열에 증류기 push(데이터 변형, 파일 무수정) ---- */
if (typeof rmOfficerHooks !== "undefined" && Array.isArray(rmOfficerHooks.afterApprovalDecision)) {
  rmOfficerHooks.afterApprovalDecision.push((payload) => {
    try { rmoMemoryDistillFromApproval(payload); } catch (_) { /* no-op */ }
    return null; // 훅은 위반 문자열만 반환 — 항상 null(증류는 결정 흐름을 막지 않음)
  });
}

/* ---- 읽기→주입: runAgentModelRequest 래핑, 관련 카드 top3를 프롬프트 input에 붙임 ----
   proxy(/agent/run)는 body.input 전체를 JSON.stringify해 프롬프트에 넣으므로
   input.priorMemory에 실으면 그대로 모델 컨텍스트가 된다. crossBan(staff)은 제외. */
function rmoMemoryRelevantFacts(payload, limit) {
  const agentId = payload && payload.agentId;
  const caseNo = payload && payload.input && payload.input.case && payload.input.case.caseNo;
  const caseRow = caseNo ? rmoTable("rm_officer_cases", RMO_ROLE_KEY).find((c) => c.caseNo === caseNo) : null;
  const caseId = caseRow && caseRow.id;
  return rmoMemoryCards()
    .filter((card) => !card.crossBan && (card.subjectKey === agentId || (caseId && card.subjectKey === caseId)))
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .slice(0, limit || 3)
    .map((card) => `[메모리:${RMO_MEMORY_LAYER_LABELS[card.layer] || card.layer}] ${card.fact} (관측 ${card.observedCount}회·${card.confidence})`);
}

if (typeof runAgentModelRequest === "function") {
  const __rmoOrigModelRequest = runAgentModelRequest;
  runAgentModelRequest = function (payload, options) {
    try {
      if (payload && payload.roleKey === RMO_ROLE_KEY && payload.input) {
        const facts = rmoMemoryRelevantFacts(payload, 3);
        rmoMemoryStats.lastInjected = facts.length;
        if (facts.length) {
          payload = { ...payload, input: { ...payload.input, priorMemory: facts } };
          rmoMemoryStats.injectTotal += facts.length;
        }
      }
    } catch (_) { /* 주입 실패는 무시하고 원 호출로 폴백 */ }
    return __rmoOrigModelRequest(payload, options);
  };
}

/* ---- 읽기 전용 패널(카드 편집 UI는 의도적으로 없음) ---- */
function rmoMemoryCardsPanel() {
  const rows = rmoMemoryCards().sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  const enginePath = typeof rmoEngineState !== "undefined" ? rmoEngineState.lastPath : "미배선"; // rmoEngineSwitch.js 폴백 사다리 상태
  const stat = `<p class="jbwc-meta" id="rmo-mem-status">3계층 자동 증류 · PII 거부 <strong>${rmoMemoryStats.piiRefused}</strong>건 · 마지막 LLM 주입 <strong>메모리 적중 ${rmoMemoryStats.lastInjected}건</strong> · 누적 주입 ${rmoMemoryStats.injectTotal}건 · 엔진 경로 <strong id="rmo-engine-path">${escapeHtml(enginePath)}</strong></p>`;
  if (!rows.length) {
    return rmoPanel("3계층 메모리 카드 (0)",
      `${stat}<p class="jbwc-meta" id="rmo-mem-empty">아직 증류된 기억이 없습니다. 샘플/승인 실행을 하면 사람·에이전트 결정만 카드로 남습니다 — 기본값은 "기억하지 않는다".</p>`);
  }
  return rmoPanel(`3계층 메모리 카드 (${rows.length} · 고객·에이전트·직원)`,
    stat + `<ul class="jbwc-list" id="rmo-mem-list">
      <li class="jbwc-row jbwc-row-head"><span>계층</span><span>대상</span><span>사실(증류)</span><span>횟수·신뢰</span></li>
      ${rows.slice(0, 10).map((x) => `<li class="jbwc-row">
        <span>${escapeHtml(RMO_MEMORY_LAYER_LABELS[x.layer] || x.layer)}${x.crossBan ? '<br><span class="jbwc-row-note">교차주입 금지</span>' : ""}</span>
        <span class="jbwc-row-id">${escapeHtml(x.subjectKey)}</span>
        <span>${escapeHtml(x.fact)}<br><span class="jbwc-row-note">근거 ${escapeHtml((x.provenance || []).join(", ") || "-")}</span></span>
        <span>${x.observedCount}회 ${x.confidence === "confirmed" ? rmoStatusPill("approved") : rmoStatusPill("pending")}</span></li>`).join("")}
    </ul>`);
}

/* ---- 뷰 렌더러(board·agent-harness)에 메모리 패널을 덧붙임(원본 문자열 + 패널) ---- */
if (typeof rmoViewRenderers !== "undefined") {
  ["board", "agent-harness"].forEach((viewKey) => {
    const orig = rmoViewRenderers[viewKey];
    if (typeof orig !== "function") return;
    rmoViewRenderers[viewKey] = function () {
      const base = orig.apply(this, arguments);
      let panel = "";
      try { panel = rmoMemoryCardsPanel(); } catch (_) { panel = ""; }
      return base + panel;
    };
  });
}
