/* ============================================================
   RM 콘솔 감사 해시체인 + 보안·감사 상태 패널
   심사 지적("해시체인은 base 앱 전용, 역할 콘솔은 평문 감사 로그") 해소.

   킬스위치: 이 파일과 index.html의 <script src="./rmoAuditChain.js"> 태그를
   지우면 stock 동작으로 100% 복원된다. 승보의 app/*.js 원본은 무수정 —
   전역 함수(rmoWriteAudit)와 뷰 렌더러 맵(rmoViewRenderers.board)만 런타임 확장한다.

   해시: base 앱 simpleHash와 동일한 FNV-1a(32bit) 골격을 복제해 체인 의미를
   일치시킨다(GENESIS → prevChainHash → chainHash). 체인 헤드는 같은 DB
   (rmo-ops-db-v2)의 rmo_audit_chain_meta 행에 유지. 레거시(선(先)체인) 행은
   정직하게 legacyRows로 집계하고 체인은 첫 체인 행부터 시작한다.
   ============================================================ */

const RMO_AUDIT_TABLE = "rm_officer_audit_logs";
const RMO_CHAIN_META_TABLE = "rmo_audit_chain_meta";

/* base 앱 simpleHash와 동일 상수의 FNV-1a — 로드 순서 독립을 위해 자체 정의 */
function rmoFnv1a(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/* 해시 대상은 위·변조가 의미 있는 안정 필드만 — note/action 편집 시 체인이 깨진다 */
function rmoAuditRowCore(row, seq, prev) {
  return {
    seq,
    id: row.id,
    action: row.action,
    actor: row.actorId,
    target: row.targetId,
    note: row.note || "",
    at: row.createdAt,
    prev,
  };
}

/* 원 감사 행이 기록된 뒤 호출 — 저장된 행 객체를 그대로 변형해 체인 필드를 얹는다.
   rmoInsert가 unshift한 동일 참조이므로 mutate + rmoSaveDb로 영속된다. */
function rmoAuditChainAppend(row) {
  if (!row || !row.id) return;
  const db = rmoRepository.snapshot();
  db[RMO_CHAIN_META_TABLE] = db[RMO_CHAIN_META_TABLE] || [];
  let meta = db[RMO_CHAIN_META_TABLE].find((m) => m.roleKey === RMO_ROLE_KEY);
  if (!meta) {
    meta = { id: "RMO-CHAIN-HEAD", roleKey: RMO_ROLE_KEY, head: "GENESIS", seq: 0 };
    db[RMO_CHAIN_META_TABLE].push(meta);
  }
  const seq = meta.seq + 1;
  const core = rmoAuditRowCore(row, seq, meta.head);
  const hash = rmoFnv1a(meta.head + JSON.stringify(core));
  row.chainSeq = seq;
  row.chainPrev = meta.head;
  row.chainHash = hash;
  meta.head = hash;
  meta.seq = seq;
  rmoSaveDb();
}

/* 체인 행을 seq 순으로 재계산 — {ok, checked, firstBreakAt, legacyRows}.
   레거시(chainSeq 없는) 행은 checked에서 제외하고 개수만 정직하게 보고. */
function rmoAuditChainVerify() {
  const rows = rmoTable(RMO_AUDIT_TABLE, RMO_ROLE_KEY);
  const chained = rows.filter((r) => typeof r.chainSeq === "number").sort((a, b) => a.chainSeq - b.chainSeq);
  const legacyRows = rows.length - chained.length;
  let prev = "GENESIS";
  let firstBreakAt = null;
  for (const r of chained) {
    const expect = rmoFnv1a(prev + JSON.stringify(rmoAuditRowCore(r, r.chainSeq, prev)));
    if (r.chainPrev !== prev || r.chainHash !== expect) { firstBreakAt = r.chainSeq; break; }
    prev = r.chainHash;
  }
  return { ok: firstBreakAt === null, checked: chained.length, firstBreakAt, legacyRows };
}

/* ---- 배선: 단일 초크포인트 rmoWriteAudit 래핑(원본 파일 무수정) ---- */
if (typeof rmoWriteAudit === "function") {
  const __rmoOrigWriteAudit = rmoWriteAudit;
  rmoWriteAudit = function (row) {
    const written = __rmoOrigWriteAudit(row);
    try { rmoAuditChainAppend(written); } catch (_) { /* 체인 실패가 감사 기록을 깨면 안 됨 */ }
    return written;
  };
}

/* ============================================================
   보안·감사 상태 패널 — 흩어진 보안 실체를 한 화면에 실증
   ============================================================ */

const RMO_SEC_GUARDS = [
  ["PII 마스킹·저장 거부", "harnessGuardCheckPII"],
  ["금지 단정 표현 차단", "harnessGuardCheckAssertions"],
  ["콘솔 scope 교차접근 차단", "harnessGuardCheckScope"],
  ["위험건 자동 종결 차단", "harnessGuardCheckAutoClose"],
  ["고위험 승인 필수 게이트", "harnessGuardCheckApprovalRequired"],
];

function rmoSecPill(ok) {
  return `<span class="status-pill ${ok ? "status-approved" : "status-escalated"}">${ok ? "활성" : "미탐지"}</span>`;
}

function rmoSecurityPanel() {
  const guardRows = RMO_SEC_GUARDS.map(([label, fn]) => {
    const ok = typeof window[fn] === "function";
    return `<li class="jbwc-row"><span>${escapeHtml(label)}</span><span class="jbwc-row-id">${escapeHtml(fn)}</span><span>${rmoSecPill(ok)}</span></li>`;
  }).join("");

  let self = typeof window.__lastHarnessSelfTest !== "undefined" ? window.__lastHarnessSelfTest : null;
  if (!self && typeof runHarnessSelfTest === "function") {
    try { self = runHarnessSelfTest(); } catch (_) { self = null; }
  }
  const selfLine = self
    ? `런타임 셀프테스트 <strong>${self.pass ? "PASS" : "FAIL"}</strong> · 검증 항목 ${self.results ? self.results.length : 0}건`
    : "런타임 셀프테스트 미실행";

  const piiRefused = typeof rmoMemoryStats !== "undefined" ? rmoMemoryStats.piiRefused : 0;
  const scopeOk = typeof harnessGuardCheckScope === "function";
  const chain = rmoAuditChainVerify();
  const chainLine = chain.ok
    ? `<strong id="rmo-sec-chain-result">✓ ${chain.checked}건 무결성 검증</strong>`
    : `<strong id="rmo-sec-chain-result" style="color:var(--danger,#c0392b)">✗ ${chain.firstBreakAt}번째 행에서 위·변조 감지</strong>`;

  const body = `
    <p class="jbwc-meta" id="rmo-sec-selftest">${selfLine} · PII 카드 저장 거부 <strong id="rmo-sec-pii">${piiRefused}</strong>건</p>
    <ul class="jbwc-list" id="rmo-sec-guards">
      <li class="jbwc-row jbwc-row-head"><span>가드레일</span><span>구현 함수</span><span>상태</span></li>
      ${guardRows}
    </ul>
    <p class="jbwc-meta" id="rmo-sec-chain">감사 해시체인(변조 검출): ${chainLine} · 레거시(선체인) 행 ${chain.legacyRows}건
      <button class="secondary-button" type="button" onclick="rmoSecRerender()">체인 재검증</button></p>
    <p class="jbwc-meta" id="rmo-sec-scope">콘솔 scope 격리: ${rmoSecPill(scopeOk)} · RM 콘솔 전용 DB 키 <strong>${escapeHtml(RMO_DB_KEY)}</strong>로 타 콘솔 데이터 접근 차단</p>`;

  return `<div id="rmo-sec-panel">${rmoPanel("보안·감사 상태", body)}</div>`;
}

/* 체인 재검증 버튼 — 패널만 제자리 교체(전역, onclick에서 호출) */
function rmoSecRerender() {
  const host = document.getElementById("rmo-sec-panel");
  if (host) { try { host.outerHTML = rmoSecurityPanel(); } catch (_) { /* no-op */ } }
}

/* ---- 뷰 렌더러(board)에 보안 패널을 덧붙임(현재 전역 = 메모리 카드 래퍼 위에 합성) ---- */
if (typeof rmoViewRenderers !== "undefined" && typeof rmoViewRenderers.board === "function") {
  const __rmoOrigBoard = rmoViewRenderers.board;
  rmoViewRenderers.board = function () {
    const base = __rmoOrigBoard.apply(this, arguments);
    let panel = "";
    try { panel = rmoSecurityPanel(); } catch (_) { panel = ""; }
    return base + panel;
  };
}
