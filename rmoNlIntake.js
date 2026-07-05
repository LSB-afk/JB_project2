/* ============================================================
   RM 콘솔 자연어 접수 커맨드 팔레트 (NL Case Intake)
   상담·지시 원문을 그대로 붙여넣으면 모델(runAgentModelRequest, 메모리 주입+게이트웨이
   폴백까지 이미 합성된 전역)로 트리아지하여 실 케이스(createRmOfficerCase)를 만든다.
   모델 미기동/파싱 실패 시 결정적 폴백으로 데모가 절대 끊기지 않는다.

   킬스위치: 이 파일과 index.html의 <script src="./rmoNlIntake.js"> 태그를 지우면
   stock 동작으로 100% 복원된다. 승보의 app/*.js 원본은 무수정 — 여기서는 전역 함수
   (rmoNlIntakeOpen)만 새로 노출하고, 문서에 없던 모달 DOM을 키(n)로만 띄운다.
   화면 레이아웃은 열기 전까지 존재하지 않는다(오버레이는 document.body에 주입).
   ============================================================ */

const RMO_NLI_STYLE_ID = "rmo-nli-style";
const RMO_NLI_OVERLAY_ID = "rmo-nli-overlay";
let rmoNliFiles = []; // [{ name, content }] — 클라이언트에서 읽은 첨부(파일당 20KB 캡)

function rmoNliInjectStyle() {
  if (document.getElementById(RMO_NLI_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = RMO_NLI_STYLE_ID;
  style.textContent = `
    #${RMO_NLI_OVERLAY_ID}{position:fixed;inset:0;z-index:9000;display:flex;align-items:flex-start;
      justify-content:center;padding-top:8vh;background:rgba(15,23,42,.55);backdrop-filter:blur(2px);}
    .rmo-nli-panel{width:min(680px,92vw);max-height:80vh;overflow:auto;background:var(--surface,#fff);
      border:1px solid var(--border,#d9dee7);border-radius:8px;box-shadow:0 24px 60px rgba(15,23,42,.35);
      padding:20px 22px;font-family:Pretendard,system-ui,sans-serif;}
    .rmo-nli-panel h2{margin:0 0 4px;font-size:1.05rem;}
    .rmo-nli-panel textarea{width:100%;min-height:132px;margin-top:10px;padding:10px 12px;box-sizing:border-box;
      border:1px solid var(--border,#d9dee7);border-radius:8px;font:inherit;resize:vertical;}
    .rmo-nli-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px;}
    .rmo-nli-hint{color:var(--muted,#64748b);font-size:.82rem;margin-top:8px;}
    .rmo-nli-chip{display:inline-flex;align-items:center;gap:6px;padding:2px 9px;border-radius:8px;
      background:var(--chip,#eef2f7);font-size:.78rem;}
    .rmo-nli-chip button{border:0;background:none;cursor:pointer;color:var(--muted,#64748b);font-size:.9rem;line-height:1;}
    .rmo-nli-result{margin-top:14px;font-size:.88rem;}
    .rmo-nli-result ul{margin:6px 0 0;padding-left:18px;}
    .rmo-nli-risk{display:inline-block;padding:1px 8px;border-radius:8px;background:var(--chip,#eef2f7);font-weight:600;}
    .rmo-nli-err{color:var(--danger,#c0392b);}`;
  document.head.appendChild(style);
}

function rmoNliIsOpen() {
  return !!document.getElementById(RMO_NLI_OVERLAY_ID);
}

function rmoNlIntakeClose() {
  const el = document.getElementById(RMO_NLI_OVERLAY_ID);
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

/* 전역 진입점 — 사이드바의 기존 신규 접수 흐름도 이 전역을 호출할 수 있게 노출(사이드바 파일 무수정) */
function rmoNlIntakeOpen() {
  try {
    if (rmoNliIsOpen()) return;
    rmoNliInjectStyle();
    rmoNliFiles = [];
    const overlay = document.createElement("div");
    overlay.id = RMO_NLI_OVERLAY_ID;
    overlay.innerHTML = `
      <div class="rmo-nli-panel" role="dialog" aria-modal="true">
        <h2>자연어 접수 — 상담·지시를 그대로 붙여넣으세요</h2>
        <p class="rmo-nli-hint">모델이 제목·도메인·위험도·부족 데이터·하위 케이스로 트리아지합니다. 원문 민감정보는 외부로 나가지 않습니다.</p>
        <textarea id="rmo-nli-input" placeholder="예) 전주 완산구 카페 사장님 대환대출 문의, 매출 자료 아직 없음"></textarea>
        <div class="rmo-nli-row">
          <label class="rmo-nli-chip">파일 첨부(.txt/.md/.csv)
            <input id="rmo-nli-file" type="file" accept=".txt,.md,.csv" multiple style="display:none">
          </label>
          <span id="rmo-nli-chips"></span>
        </div>
        <p class="rmo-nli-hint">⌘/Ctrl+Enter 접수 · Esc 닫기</p>
        <div class="rmo-nli-row">
          <button id="rmo-nli-submit" class="primary-button" type="button">접수</button>
          <button id="rmo-nli-cancel" class="secondary-button" type="button">닫기</button>
        </div>
        <div class="rmo-nli-result" id="rmo-nli-result"></div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => { if (e.target === overlay) rmoNlIntakeClose(); });
    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.preventDefault(); rmoNlIntakeClose(); }
      else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); rmoNliSubmit(); }
    });
    overlay.querySelector("#rmo-nli-cancel").addEventListener("click", rmoNlIntakeClose);
    overlay.querySelector("#rmo-nli-submit").addEventListener("click", rmoNliSubmit);
    const fileInput = overlay.querySelector("#rmo-nli-file");
    fileInput.addEventListener("change", () => rmoNliReadFiles(fileInput));

    const input = overlay.querySelector("#rmo-nli-input");
    if (input) input.focus();
  } catch (error) {
    /* 모달 자체가 콘솔을 깨면 안 됨 */
  }
}

function rmoNliReadFiles(input) {
  Array.from(input.files || []).forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      rmoNliFiles.push({ name: file.name, content: String(reader.result || "").slice(0, 20 * 1024) });
      rmoNliRenderChips();
    };
    reader.onerror = () => {};
    reader.readAsText(file);
  });
  input.value = "";
}

function rmoNliRenderChips() {
  const host = document.getElementById("rmo-nli-chips");
  if (!host) return;
  host.innerHTML = rmoNliFiles.map((f, i) =>
    `<span class="rmo-nli-chip">${escapeHtml(f.name)} <button type="button" onclick="rmoNliRemoveFile(${i})">✕</button></span>`).join(" ");
}

function rmoNliRemoveFile(index) {
  rmoNliFiles = rmoNliFiles.filter((_, i) => i !== index);
  rmoNliRenderChips();
}

/* STRICT JSON 계약 프롬프트 — 원문 + 첨부를 모델에 넘겨 트리아지 결과만 JSON으로 받는다 */
function rmoNliBuildPrompt(rawText) {
  const attached = rmoNliFiles.map((f) => `## 첨부: ${f.name}\n${f.content}`).join("\n\n");
  return [
    "다음 상담/지시 원문을 검토해 아래 스키마의 JSON으로만 답하라(내부 업무 참고용, 다른 텍스트 금지).",
    '{"caseTitle":str,"domain":str,"riskLevel":"low|medium|high","summary":str,"missingData":[str],"subCases":[{"title":str,"reason":str}]}',
    "원문:",
    rawText,
    attached ? "\n" + attached : "",
  ].join("\n");
}

function rmoNliNormRisk(value) {
  return ({ low: "low", medium: "medium", high: "high", critical: "high" })[String(value || "").toLowerCase()] || "medium";
}

/* 모델 응답에서 첫 {...} 블록을 관용적으로 추출 — parsed 우선, 없으면 output/text 문자열 파싱 */
function rmoNliExtractTriage(result) {
  const p = result && result.parsed;
  if (p && typeof p === "object" && (p.caseTitle || p.subCases || p.riskLevel)) return p;
  const text = (result && (result.output || result.text)) || "";
  const match = String(text).match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch (_) { /* 폴백으로 */ } }
  return null;
}

/* 오프라인/파싱 실패 결정적 폴백 — 데모가 절대 끊기지 않는다 */
function rmoNliFallbackTriage(rawText) {
  const firstLine = String(rawText).split(/\n/)[0].trim().slice(0, 40);
  return {
    caseTitle: firstLine || "자연어 접수 건",
    domain: "여신",
    riskLevel: "medium",
    summary: String(rawText).replace(/\s+/g, " ").trim().slice(0, 200),
    missingData: ["담당자 확인 필요 — 모델 미기동(오프라인 접수)"],
    subCases: [],
  };
}

async function rmoNliSubmit() {
  const input = document.getElementById("rmo-nli-input");
  const resultHost = document.getElementById("rmo-nli-result");
  if (!input || !resultHost) return;
  const userText = String(input.value || "").trim();
  const attachedText = rmoNliFiles.map((f) => f.content).join("\n");
  const rawText = [userText, attachedText].filter(Boolean).join("\n").trim();
  if (!rawText) { resultHost.innerHTML = `<p class="rmo-nli-err">접수할 내용을 입력하세요.</p>`; return; }
  resultHost.innerHTML = `<p>트리아지 중…</p>`;

  let triage = null;
  try {
    const result = await runAgentModelRequest({
      harnessId: "rm-officer",
      roleKey: typeof RMO_ROLE_KEY !== "undefined" ? RMO_ROLE_KEY : "rm-officer",
      agentId: "rmo-triage",
      input: { request: rmoNliBuildPrompt(rawText), task: "nl-intake-triage" },
    }, { forceOllama: true });
    triage = rmoNliExtractTriage(result);
  } catch (_) { triage = null; }
  if (!triage) triage = rmoNliFallbackTriage(rawText);

  try {
    const risk = rmoNliNormRisk(triage.riskLevel);
    const missing = Array.isArray(triage.missingData) ? triage.missingData.filter(Boolean).map(String) : [];
    const created = createRmOfficerCase({
      title: String(triage.caseTitle || "자연어 접수 건").slice(0, 60),
      situation: String(triage.summary || rawText).slice(0, 200),
      riskLevel: risk,
      uploadedFileName: rmoNliFiles.length ? rmoNliFiles[0].name : "",
      uploadedFileSummary: rmoNliFiles.length ? `자연어 접수 첨부 ${rmoNliFiles.length}건` : "",
    });
    if (!created || created.blocked || !created.case) {
      resultHost.innerHTML = `<p class="rmo-nli-err">케이스 생성이 가드에 의해 차단되었습니다.</p>`;
      return;
    }
    const parent = created.case;

    // 추가 필요 데이터가 있으면 감사 기록으로 남긴다(해시체인 래퍼가 자동으로 체인화)
    if (missing.length && typeof rmoWriteAudit === "function") {
      try {
        rmoWriteAudit({
          id: rmoNextId("RMO-AUD", "rm_officer_audit_logs"),
          caseId: parent.id, actorId: "USR-RMO-01",
          action: "NL_INTAKE_MISSING_DATA", targetType: "rm_officer_case", targetId: parent.id,
          riskLevel: parent.riskLevel, reviewRequired: true,
          note: `자연어 접수 · 추가 필요 데이터 ${missing.length}건`, createdAt: rmoNow(),
        });
      } catch (_) { /* 감사 실패가 접수를 깨면 안 됨 */ }
    }

    // 하위 케이스 최대 3건 — 상위 케이스 id로 연결
    const subIds = [];
    (Array.isArray(triage.subCases) ? triage.subCases : []).slice(0, 3).forEach((sc) => {
      if (!sc || !sc.title) return;
      const sub = createRmOfficerCase({
        title: "↳ " + String(sc.title).slice(0, 40),
        situation: `상위 ${parent.caseNo}(${parent.id}) 파생 · ${String(sc.reason || "").slice(0, 120)}`.slice(0, 200),
        riskLevel: risk,
      });
      if (sub && sub.case) subIds.push(sub.case.caseNo);
    });

    const enginePath = typeof rmoEngineState !== "undefined" ? rmoEngineState.lastPath : "미배선";
    const missingHtml = missing.length
      ? `<p><strong>📋 추가 필요 데이터</strong></p><ul>${missing.map((m) => `<li><label><input type="checkbox"> ${escapeHtml(m)}</label></li>`).join("")}</ul>`
      : `<p>추가 필요 데이터 없음.</p>`;
    resultHost.innerHTML = `
      <p>생성된 케이스: <strong>${escapeHtml(parent.caseNo)}</strong>${subIds.length ? " · 하위 " + escapeHtml(subIds.join(", ")) : ""}</p>
      <p>위험도 <span class="rmo-nli-risk">${escapeHtml(risk)}</span> · 엔진 경로 <strong>${escapeHtml(String(enginePath))}</strong></p>
      ${missingHtml}
      <p class="rmo-nli-hint">Esc로 닫고 보드에서 확인하세요.</p>`;
    if (typeof render === "function") render();
  } catch (error) {
    resultHost.innerHTML = `<p class="rmo-nli-err">접수 처리 중 오류: ${escapeHtml(String(error && error.message || error))}</p>`;
  }
}

/* ---- 배선: 문서 전역 keydown — RM 콘솔 활성 + 입력 미포커스 + 다른 모달 없음일 때만 n으로 연다 ---- */
document.addEventListener("keydown", (event) => {
  if (event.key !== "n" && event.key !== "N") return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (typeof rmoModeActive !== "function" || !rmoModeActive()) return;
  if (rmoNliIsOpen()) return;
  if (typeof rmoState !== "undefined" && rmoState.modal) return; // 기존 MD 모달 열림 중이면 양보
  const t = event.target;
  if (t && ((/(INPUT|TEXTAREA|SELECT)/).test(t.tagName || "") || t.isContentEditable)) return;
  event.preventDefault();
  rmoNlIntakeOpen();
});
