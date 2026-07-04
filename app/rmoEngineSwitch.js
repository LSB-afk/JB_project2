/* ============================================================
   RM 엔진 스위치 — runAgentModelRequest 폴백 사다리 배선
   ollama 직결(:8030) 실패 → LLM 게이트웨이(:8022) 폴백 → 둘 다 불가 시
   원 에러를 그대로 재throw 하여 기존 목업/에러 기록 경로를 유지한다.

   킬스위치: 이 파일과 index.html의 <script src="./rmoEngineSwitch.js"> 태그를
   지우면 rmoMemoryCards.js의 메모리 주입 래퍼만 남고 stock 동작으로 복원된다.
   rmoMemoryCards.js가 이미 감싼 전역을 한 겹 더 감싼다(합성):
   engineSwitch( memoryInject( 원본 runAgentModelRequest ) ).
   승보의 app/*.js 원본은 무수정 — 여기서는 전역 함수만 런타임에 확장한다.
   ============================================================ */

const RMO_GATEWAY_URL = "http://127.0.0.1:8022/llm"; // scripts/llm-gateway.mjs (POST /llm)
const rmoEngineState = { lastPath: "미실행" };        // 메모리 패널 상태줄이 읽는 전역

/* 게이트웨이 프롬프트 조립 — ollama-agent-proxy 와 동일 골격(원문 PII 금지, input만 직렬화) */
function rmoBuildGatewayPrompt(payload) {
  const input = (payload && payload.input) || {};
  return [
    `harnessId: ${(payload && payload.harnessId) || "rm-officer"}`,
    `agentId: ${(payload && payload.agentId) || "unknown"}`,
    `roleKey: ${(payload && payload.roleKey) || "unknown"}`,
    "다음 입력을 검토해 summary·nextActions[]·riskNotes[] 키를 가진 JSON으로만 답하라(내부 업무 참고용).",
    "입력 JSON:",
    JSON.stringify(input, null, 2),
  ].join("\n");
}

/* 게이트웨이 응답(/llm) → 호출자가 기대하는 runAgentModelRequest 반환 형태로 변환.
   호출자는 .model / .output / .parsed / .evaluation.ok 를 읽는다(rmoModelOutputSummary). */
function rmoAdaptGatewayResult(data) {
  let parsed = null;
  try { parsed = JSON.parse(data.text); } catch (_) { parsed = null; } // 프로즈 응답이면 output으로 폴백
  return { ok: true, model: `gateway:${data.engine || "?"}`, output: data.text, parsed, evaluation: { ok: true, issues: [] } };
}

if (typeof runAgentModelRequest === "function") {
  const __rmoDirectRequest = runAgentModelRequest; // 이미 메모리 주입까지 합성된 전역
  runAgentModelRequest = async function (payload, options) {
    try {
      const direct = await __rmoDirectRequest(payload, options);
      rmoEngineState.lastPath = "ollama 직결";
      return direct;
    } catch (directError) {
      // 프록시 실패 → 게이트웨이 폴백. 게이트웨이도 불가면 원 에러 재throw(기존 목업 경로 유지).
      try {
        const res = await fetch(RMO_GATEWAY_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            prompt: rmoBuildGatewayPrompt(payload),
            model: options && options.model,
            caseId: payload && payload.input && payload.input.case && payload.input.case.caseNo,
            tier: "local",
          }),
        });
        const data = await res.json();
        if (!res.ok || data.escalated || !data.text) throw new Error("gateway_unavailable");
        rmoEngineState.lastPath = `게이트웨이 폴백(:8022·${data.engine || "?"})`;
        return rmoAdaptGatewayResult(data);
      } catch (_) {
        rmoEngineState.lastPath = "오프라인 목업";
        throw directError; // 기존 catch(목업/에러 기록)로 넘긴다
      }
    }
  };
}
