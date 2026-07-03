/* 로컬/외부 LLM 클라이언트 — ?live=1 전용 opt-in seam.
   기본 OFF = 오프라인 결정론적 모의 동작 그대로(전세 실거래가 라이브 패턴과 동일한 seam 재사용).
   기업여신 ccl-financial 실행 경로에서만 호출한다. 어떤 실패(오프라인·타임아웃·비정상 응답)든 null 반환 →
   호출부가 기존 모의 문자열로 fallback 한다. PII 원문은 프롬프트에 넣지 않는다(호출부가 익명 구간지표만 구성). */

const LLM_DEFAULT_MODEL = "exaone3.5:7.8b";
const LLM_TIMEOUT_MS = 20000;

function llmConfig() {
  if (typeof RUNTIME_CONFIG !== "undefined" && RUNTIME_CONFIG) return RUNTIME_CONFIG;
  if (typeof window !== "undefined" && window.RUNTIME_CONFIG) return window.RUNTIME_CONFIG;
  return {};
}

// 라이브 에이전트 활성 여부 — 전세 실거래가와 동일한 ?live=1 opt-in을 재사용.
// RUNTIME_CONFIG.localModel 은 이 코드베이스에서 boolean(=live && ?model!=0) 이므로 그대로 enable 플래그로 쓴다.
// anthropicKey 가 주입돼 있으면(선택) 그쪽을 우선한다.
function llmAgentsEnabled() {
  const cfg = llmConfig();
  if (cfg.anthropicKey) return true;
  return cfg.localModel === true;
}

async function llmCallOllama(prompt, cfg, signal) {
  const base = cfg.ollamaBase || "http://127.0.0.1:11434";
  const model = cfg.localModelName || LLM_DEFAULT_MODEL;
  const res = await fetch(`${base}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0.2 } }),
    signal,
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text = data && typeof data.response === "string" ? data.response.trim() : "";
  return text || null;
}

async function llmCallAnthropic(prompt, cfg, signal) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": cfg.anthropicKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: cfg.anthropicModel || "claude-3-5-haiku-latest",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    }),
    signal,
  });
  if (!res.ok) return null;
  const data = await res.json();
  const block = data && Array.isArray(data.content) ? data.content.find((b) => b.type === "text") : null;
  const text = block && typeof block.text === "string" ? block.text.trim() : "";
  return text || null;
}

// 프롬프트 → 생성 텍스트(string) 또는 null. 20초 하드 타임아웃 + 전체 try/catch.
async function llmGenerate(prompt) {
  const cfg = llmConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);
  try {
    if (cfg.anthropicKey) return await llmCallAnthropic(prompt, cfg, controller.signal);
    return await llmCallOllama(prompt, cfg, controller.signal);
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// 순수 fallback 코어 — LLM 결과가 없거나(null/공백) guardrail 위반이면 항상 모의 문자열을 유지한다.
function llmPickText(mockText, llmText, guardViolation) {
  if (guardViolation) return mockText;
  if (typeof llmText === "string" && llmText.trim()) return llmText.trim();
  return mockText;
}

if (typeof window !== "undefined") {
  window.llmGenerate = llmGenerate;
  window.llmAgentsEnabled = llmAgentsEnabled;
  window.llmPickText = llmPickText;
}

// node-only self-check(브라우저에서는 실행 안 함): 오프라인 fallback이 모의 문자열을 그대로 돌려주는지 검증.
//   node app/llmClient.js
if (typeof window === "undefined" && typeof module !== "undefined" && require.main === module) {
  const assert = require("node:assert");
  assert.strictEqual(llmPickText("MOCK", null, null), "MOCK");        // 오프라인(client null) → 모의 유지
  assert.strictEqual(llmPickText("MOCK", "", null), "MOCK");          // 빈 응답 → 모의 유지
  assert.strictEqual(llmPickText("MOCK", "실 요약", null), "실 요약"); // 정상 응답 → 실 텍스트
  assert.strictEqual(llmPickText("MOCK", "실 요약", "PII 의심"), "MOCK"); // guardrail 위반 → 모의로 fallback
  process.stdout.write("llmClient fallback self-check ok\n");
}
