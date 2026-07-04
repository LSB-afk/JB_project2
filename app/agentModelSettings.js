/* 로컬 에이전트 모델 설정.
   실제 credential 없이 브라우저 localStorage에 프록시 URL/모델명만 저장한다. */

const AGENT_MODEL_SETTINGS_KEY = "jb-agent-model-settings-v1";
const AGENT_MODEL_DEFAULTS = {
  runtime: "mock",
  proxyBase: "http://127.0.0.1:8030",
  model: "llama3.1:8b",
  temperature: 0.2,
  timeoutMs: 15000,
  updatedAt: "",
};

const agentModelUiState = {
  health: { status: "idle", message: "연결 확인 전", models: [] },
  saving: false,
};

function loadAgentModelSettings() {
  try {
    const raw = window.localStorage.getItem(AGENT_MODEL_SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...AGENT_MODEL_DEFAULTS, ...parsed };
  } catch (error) {
    return { ...AGENT_MODEL_DEFAULTS };
  }
}

function saveAgentModelSettings(next) {
  const current = loadAgentModelSettings();
  const merged = {
    ...current,
    ...next,
    runtime: next.runtime === "ollama" ? "ollama" : "mock",
    proxyBase: String(next.proxyBase || current.proxyBase || AGENT_MODEL_DEFAULTS.proxyBase).replace(/\/$/, ""),
    model: String(next.model || current.model || AGENT_MODEL_DEFAULTS.model).trim(),
    temperature: Math.max(0, Math.min(1, Number(next.temperature ?? current.temperature ?? 0.2))),
    timeoutMs: Math.max(3000, Math.min(60000, Number(next.timeoutMs ?? current.timeoutMs ?? 15000))),
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(AGENT_MODEL_SETTINGS_KEY, JSON.stringify(merged));
  return merged;
}

function agentModelRuntimeEnabled() {
  return loadAgentModelSettings().runtime === "ollama";
}

function agentModelRuntimeLabel(settings = loadAgentModelSettings()) {
  return settings.runtime === "ollama" ? "Ollama 로컬 모델" : "모의 실행";
}

function agentModelSettingsSummary() {
  const settings = loadAgentModelSettings();
  return {
    ...settings,
    label: agentModelRuntimeLabel(settings),
    health: agentModelUiState.health,
  };
}

function agentModelSettingsPanelMarkup() {
  const settings = loadAgentModelSettings();
  const health = agentModelUiState.health;
  const healthClass = health.status === "ok" ? "status-healthy" : (health.status === "error" ? "status-critical" : "status-new");
  return `
    <article class="work-item settings-action-card agent-model-settings-card">
      <div class="item-head">
        <strong>에이전트 모델 설정</strong>
        <span class="source-badge">${escapeHtml(agentModelRuntimeLabel(settings))}</span>
      </div>
      <p>기업여신 하네스의 agent output을 모의 실행으로 남기거나, 로컬 Ollama 프록시를 통해 생성한 뒤 동일한 guardrail과 audit 로그로 저장합니다.</p>
      <form id="agent-model-settings-form" class="settings-form">
        <label>
          실행 방식
          <select name="runtime">
            <option value="mock" ${settings.runtime === "mock" ? "selected" : ""}>모의 실행 로그 저장</option>
            <option value="ollama" ${settings.runtime === "ollama" ? "selected" : ""}>Ollama 로컬 모델 실행</option>
          </select>
        </label>
        <label>
          프록시 URL
          <input name="proxyBase" type="url" value="${escapeHtml(settings.proxyBase)}" placeholder="http://127.0.0.1:8030" />
        </label>
        <label>
          모델명
          <input name="model" type="text" value="${escapeHtml(settings.model)}" placeholder="llama3.1:8b" />
        </label>
        <label>
          온도
          <input name="temperature" type="number" min="0" max="1" step="0.1" value="${escapeHtml(String(settings.temperature))}" />
        </label>
        <label>
          타임아웃(ms)
          <input name="timeoutMs" type="number" min="3000" max="60000" step="1000" value="${escapeHtml(String(settings.timeoutMs))}" />
        </label>
        <div class="settings-button-row">
          <button class="primary-button" type="submit">모델 설정 저장</button>
          <button class="secondary-button" type="button" data-agent-model-health>연결 확인</button>
        </div>
      </form>
      <div class="jbwc-lastrun">
        <p><strong>상태</strong> <span class="status-pill ${healthClass}">${escapeHtml(health.status)}</span></p>
        <p>${escapeHtml(health.message || "연결 확인 전")}</p>
        ${health.models && health.models.length ? `<p class="jbwc-meta">감지 모델: ${health.models.map((m) => escapeHtml(m.name)).join(" · ")}</p>` : ""}
      </div>
      <p class="jbwc-guard">Ollama 응답은 내부 운영 참고용으로만 저장되며 실제 승인·거절·금리·한도·신용평가 판단에 사용하지 않습니다.</p>
    </article>
  `;
}

async function checkAgentModelHealth() {
  const settings = loadAgentModelSettings();
  agentModelUiState.health = { status: "loading", message: "Ollama 프록시 연결 확인 중", models: [] };
  const url = `${settings.proxyBase}/agent/health?model=${encodeURIComponent(settings.model)}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok || !data.connected) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  agentModelUiState.health = {
    status: data.modelAvailable ? "ok" : "error",
    message: data.modelAvailable
      ? `${data.selectedModel} 모델 사용 가능`
      : `${data.selectedModel} 모델이 Ollama에 없습니다. ollama pull 또는 모델명 변경이 필요합니다.`,
    models: data.models || [],
  };
  return data;
}

async function runAgentModelRequest(payload) {
  const settings = loadAgentModelSettings();
  if (settings.runtime !== "ollama") {
    throw new Error("Ollama 런타임이 비활성화되어 있습니다.");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), settings.timeoutMs);
  try {
    const response = await fetch(`${settings.proxyBase}/agent/run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        ...payload,
        model: settings.model,
        temperature: settings.temperature,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || `Ollama 실행 실패 (${response.status})`);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function bindAgentModelSettingsActions() {
  const form = document.getElementById("agent-model-settings-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      saveAgentModelSettings({
        runtime: data.get("runtime"),
        proxyBase: data.get("proxyBase"),
        model: data.get("model"),
        temperature: data.get("temperature"),
        timeoutMs: data.get("timeoutMs"),
      });
      if (typeof notify === "function") notify("에이전트 모델 설정을 저장했습니다.");
      render();
    });
  }
  document.querySelectorAll("[data-agent-model-health]").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await checkAgentModelHealth();
        if (typeof notify === "function") notify("Ollama 프록시 연결을 확인했습니다.");
      } catch (error) {
        agentModelUiState.health = { status: "error", message: String(error.message || error), models: [] };
        if (typeof notify === "function") notify("Ollama 연결 확인에 실패했습니다.");
      } finally {
        render();
      }
    });
  });
}
