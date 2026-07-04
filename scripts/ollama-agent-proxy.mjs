// 로컬 Ollama 에이전트 프록시 (:8030).
// 브라우저 하네스가 Ollama(:11434)를 직접 노출하지 않도록, 로컬 실행/헬스체크만 중계한다.
// 사용: OLLAMA_MODEL=llama3.1:8b npm run demo:ollama
import http from "node:http";

const OLLAMA_BASE = process.env.OLLAMA_BASE || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";
const PORT = Number(process.env.OLLAMA_AGENT_PROXY_PORT || 8030);
const MAX_BODY_BYTES = 256 * 1024;

const FORBIDDEN_PATTERNS = [
  ["실제 승인/거절 단정", /(승인\s*완료|대출\s*승인|대출\s*거절|거절\s*확정)/i],
  ["실제 금리/한도 산정", /(금리\s*\d|한도\s*\d|승인한도|대출한도)/i],
  ["신용평가 단정", /(신용등급|신용점수|CB\s*점수).*(확정|산출|결정)/i],
  ["전세사기 판단 단정", /전세사기\s*여부[^\n]{0,20}(판단|결정|확정)/i],
  ["피해자 결정 단정", /피해자\s*(결정|인정|확정)/i],
  ["법률 조치 단정", /(법률적\s*조치|법률\s*판단|소송\s*진행|고소\s*진행)[^\n]{0,20}(취한다|결정|권고|확정|진행)/i],
  ["보증 가능성 확정", /보증[^\n]{0,12}(가입|가능성)[^\n]{0,20}(확정|결정|판단)/i],
  ["개인정보 원문 의심", /(\d{6}-?[1-4]\d{6}|01[016789]-?\d{3,4}-?\d{4}|\d{11,})/],
];

function send(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
        reject(new Error("request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (error) { reject(new Error(`invalid json: ${error.message}`)); }
    });
    req.on("error", reject);
  });
}

async function ollamaFetch(path, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.OLLAMA_TIMEOUT_MS || 20000));
  try {
    const response = await fetch(`${OLLAMA_BASE}${path}`, { ...init, signal: controller.signal });
    const text = await response.text();
    let body;
    try { body = text ? JSON.parse(text) : {}; }
    catch { body = { raw: text }; }
    return { response, body };
  } finally {
    clearTimeout(timeout);
  }
}

function extractModels(tagsBody) {
  return (tagsBody.models || []).map((model) => ({
    name: model.name,
    id: model.digest || model.id || "",
    size: model.size || 0,
    modifiedAt: model.modified_at || model.modifiedAt || "",
  }));
}

function evaluateOutput(output) {
  const text = String(output || "");
  const issues = FORBIDDEN_PATTERNS.filter(([, re]) => re.test(text)).map(([label]) => label);
  return {
    ok: issues.length === 0,
    issues,
    requiresHumanReview: true,
  };
}

function safeJsonParse(value) {
  try { return JSON.parse(value); }
  catch { return null; }
}

function systemPrompt(body = {}) {
  const roleKey = String(body.roleKey || body.harnessId || "");
  const domainPolicy = roleKey.includes("jeonse")
    ? [
      "전세사기 보호 담당자를 돕되 전세사기 여부, 피해자 결정, 법률 판단, 보증 가입 가능성, 경공매 대응 결정을 확정하지 않는다.",
      "임차인·임대인·주소·계좌·주민번호 등 개인정보 원문을 출력하지 않는다.",
      "결과는 위험 신호, 확인 후보, 담당자 질문, 내부 산출물 초안으로만 작성한다.",
    ]
    : roleKey.includes("rm-officer")
      ? [
        "RM 담당자를 돕되 실제 대출 승인/거절, 금리/한도 산정, 신용평가, 정책자금 대상 확정을 하지 않는다.",
        "고객 개인정보·계좌·세무자료 원문을 출력하지 않는다.",
        "결과는 상담 우선순위, 확인 질문, 내부 검토 산출물 초안으로만 작성한다.",
      ]
      : [
        "기업여신 담당자를 돕되 실제 대출 승인/거절, 금리/한도 산정, 신용평가를 하지 않는다.",
        "개인정보·사업자등록번호·계좌·세무자료 원문을 출력하지 않는다.",
        "결과는 내부 검토 산출물 초안과 담당자 확인 항목으로만 작성한다.",
      ];
  return [
    "너는 JB 금융권 내부 운영 포털의 역할 전용 에이전트다.",
    ...domainPolicy,
    "모든 결과는 내부 운영 참고용이며 담당자 검토 필요로 표시한다.",
    "high/critical 위험도는 자동 완료하지 않고 사람 검토와 에스컬레이션을 요구한다.",
    "반드시 JSON 객체만 반환한다.",
    "JSON 스키마: {\"summary\":\"...\",\"recommendedAgent\":\"...\",\"checklist\":[\"...\"],\"evidence\":[\"...\"],\"riskNotes\":[\"...\"],\"nextActions\":[\"...\"],\"requiresHumanReview\":true}",
  ].join("\n");
}

async function runAgent(body) {
  const model = String(body.model || OLLAMA_MODEL);
  const temperature = Number.isFinite(Number(body.temperature)) ? Number(body.temperature) : 0.2;
  const numPredict = Math.max(256, Math.min(1200, Number(body.maxTokens || body.numPredict || process.env.OLLAMA_NUM_PREDICT || 700)));
  const input = body.input || {};
  const prompt = [
    `harnessId: ${body.harnessId || "unknown"}`,
    `agentId: ${body.agentId || "unknown"}`,
    `roleKey: ${body.roleKey || "unknown"}`,
    "입력 JSON:",
    JSON.stringify(input, null, 2),
  ].join("\n");

  const { response, body: data } = await ollamaFetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      messages: [
        { role: "system", content: systemPrompt(body) },
        { role: "user", content: prompt },
      ],
      options: { temperature, num_predict: numPredict },
    }),
  });
  if (!response.ok) {
    return { ok: false, status: response.status, model, error: data.error || data.raw || "ollama request failed" };
  }
  const output = data.message && data.message.content ? data.message.content : "";
  const parsed = safeJsonParse(output);
  const evaluation = evaluateOutput(output);
  return {
    ok: true,
    status: response.status,
    model,
    output,
    parsed,
    evaluation,
    rawStatus: data.done_reason || data.done || "ok",
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  if (req.method === "OPTIONS") {
    send(res, 204, {});
    return;
  }
  try {
    if (req.method === "GET" && (url.pathname === "/agent/health" || url.pathname === "/agent/models")) {
      const model = url.searchParams.get("model") || OLLAMA_MODEL;
      const { response, body } = await ollamaFetch("/api/tags");
      if (!response.ok) {
        send(res, 502, { connected: false, error: body.error || body.raw || "ollama tags failed", baseUrl: OLLAMA_BASE });
        return;
      }
      const models = extractModels(body);
      send(res, 200, {
        connected: true,
        baseUrl: OLLAMA_BASE,
        defaultModel: OLLAMA_MODEL,
        selectedModel: model,
        modelAvailable: models.some((item) => item.name === model),
        models,
      });
      return;
    }
    if (req.method === "POST" && url.pathname === "/agent/run") {
      const body = await readJson(req);
      const result = await runAgent(body);
      send(res, result.ok ? 200 : 502, result);
      return;
    }
    send(res, 404, { error: "not found" });
  } catch (error) {
    send(res, 500, { error: String(error.message || error) });
  }
});

server.listen(PORT, () => {
  console.log(`[ollama-agent-proxy] http://127.0.0.1:${PORT} -> ${OLLAMA_BASE} model=${OLLAMA_MODEL}`);
});
