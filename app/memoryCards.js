/* ============================================================
   Memory Cards — 3계층 메모리(고객/에이전트/직원) MVP 슬라이스
   스펙 SSOT: 모노레포 08_본선/03_제품/00_결정-준비/casesops-분기/
             11-메모리-3계층-자동진화-설계도.md (§2 스키마 · §3 증류 기준)
   원칙: 기본값은 "기억하지 않는다". 사람 결정(승인/반려)만 규칙 기반으로
   증류한다 — LLM 호출 없음, 오프라인 결정적 동작(데모 안전).
   통합: cclConsoleHooks.afterApprovalDecision 배열에 push (기존 코드 무수정 확장점)
   저장: ccl_memory_cards (roleKey scope — cclTable 규약 그대로, scope 없으면 예외)
   PII: 카드 fact는 harnessGuardCheckPII 통과 필수 — 실패 시 저장 거부(Zero-PII)
   격리: staff 카드는 crossBan=true — 고객 위험판단 컨텍스트 주입 금지
   ============================================================ */

const CCL_MEMORY_TABLE = "ccl_memory_cards";
const CCL_MEMORY_LAYER_LABELS = { customer: "고객", agent: "에이전트", staff: "직원(업무)" };

function cclMemoryCards(layer) {
  const rows = cclTable(CCL_MEMORY_TABLE, CCL_ROLE_KEY);
  return layer ? rows.filter((row) => row.layer === layer) : rows;
}

/* 같은 (layer, subject, fact) 카드는 새로 만들지 않고 관측 횟수를 올린다.
   3회 관측부터 candidate → confirmed (설계도11 §3 반복 관측 기준). */
function cclMemoryUpsert(layer, subjectKey, fact, provenanceId) {
  if (harnessGuardCheckPII(fact)) return null; // PII 의심 패턴 → 카드 저장 거부
  const today = new Date().toISOString().slice(0, 10);
  const db = cclRepository.snapshot();
  db[CCL_MEMORY_TABLE] = db[CCL_MEMORY_TABLE] || [];
  const existing = db[CCL_MEMORY_TABLE].find((row) =>
    row.roleKey === CCL_ROLE_KEY && row.layer === layer && row.subjectKey === subjectKey && row.fact === fact);
  if (existing) {
    existing.observedCount += 1;
    if (existing.observedCount >= 3) existing.confidence = "confirmed";
    if (provenanceId && !existing.provenance.includes(provenanceId)) existing.provenance.push(provenanceId);
    existing.updatedAt = today;
    cclSaveDb();
    return existing;
  }
  return cclInsert(CCL_MEMORY_TABLE, {
    id: cclNextId("MEM-CCL", CCL_MEMORY_TABLE),
    roleKey: CCL_ROLE_KEY,
    layer,
    subjectKey,
    fact,
    provenance: provenanceId ? [provenanceId] : [],
    observedCount: 1,
    confidence: "candidate",
    crossBan: layer === "staff",
    createdAt: today,
    updatedAt: today,
  });
}

/* 승인/반려(사람 결정)에서만 증류 — 기존 afterApprovalDecision guard와 동일 조건 확인 */
function cclMemoryDistillFromApproval(payload) {
  const approval = payload && payload.approval;
  const decidedBy = String((payload && payload.decidedBy) || "");
  if (!approval || approval.roleKey !== CCL_ROLE_KEY || !decidedBy.startsWith("USR-")) return;
  const decision = payload.decision === "reject" ? "반려" : "승인";
  const kind = approval.approvalType || "승인 요청";
  cclMemoryUpsert("agent", approval.requestedById || "unknown-agent", `${kind} → 사람 ${decision} 이력`, approval.id);
  cclMemoryUpsert("staff", decidedBy, `${kind} 결정 처리 패턴`, approval.id);
  if (approval.caseId) {
    cclMemoryUpsert("customer", approval.caseId, `사람 ${decision} 조치 기록 (근거 포인터 ${approval.id})`, approval.id);
  }
}

/* 훅 등록 — 증류 실패가 승인 흐름을 절대 막지 않는다(항상 null 반환) */
if (typeof cclConsoleHooks !== "undefined" && Array.isArray(cclConsoleHooks.afterApprovalDecision)) {
  cclConsoleHooks.afterApprovalDecision.push((payload) => {
    try { cclMemoryDistillFromApproval(payload); } catch (error) { /* no-op */ }
    return null;
  });
}

/* 에이전트 하네스 뷰 하단 패널 — 읽기 전용(카드 편집 UI는 의도적으로 없음) */
function cclMemoryCardsPanel() {
  const rows = cclMemoryCards();
  if (!rows.length) {
    return cclPanel("메모리 카드 (0 · 3계층)", `<p class="jbwc-meta">아직 증류된 기억이 없습니다. 승인/반려를 처리하면 사람 결정만 카드로 남습니다 — 기본값은 "기억하지 않는다".</p>`);
  }
  return cclPanel(`메모리 카드 (${rows.length} · 3계층 · 자동 증류)`, cclList(["카드", "계층·주체", "사실(증류)", "신뢰"], rows.slice(0, 12), (x) => `
    <li class="jbwc-row"><span class="jbwc-row-id">${escapeHtml(x.updatedAt)}<br>${escapeHtml(x.id)}</span>
      <span>${escapeHtml(CCL_MEMORY_LAYER_LABELS[x.layer] || x.layer)}<br><span class="jbwc-row-note">${escapeHtml(x.subjectKey)}${x.crossBan ? " · 교차주입 금지" : ""}</span></span>
      <span>${escapeHtml(x.fact)}<br><span class="jbwc-row-note">근거 ${escapeHtml((x.provenance || []).join(", ") || "-")} · 관측 ${x.observedCount}회</span></span>
      <span>${x.confidence === "confirmed" ? '<span class="status-pill status-approved">confirmed</span>' : '<span class="status-pill status-pending">candidate</span>'}</span></li>`));
}
