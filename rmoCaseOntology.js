/* ============================================================
   RM 케이스 온톨로지 그래프 — 운영계약(Case→Agent→Memory→Approval→Audit)을
   현재 케이스의 실데이터로 관계 그래프 렌더 (예선 modules.js:600 블록을 RMO로 이식).

   킬스위치: 이 파일과 index.html의 <script src="./vendor/cytoscape.min.js"> ·
   <script src="./rmoCaseOntology.js"> 태그를 제거하면 stock 동작으로 복원된다.
   승보의 app/*.js 원본 무수정 — 뷰 렌더러 맵(rmoViewRenderers)만 런타임 확장하고
   CSS는 JS에서 head에 주입한다(styles.css 무수정). cytoscape 미로드 시 조용히 생략.

   데이터 소스: rmoBuildWorkMapTree(오케스트레이터·분석·보고) · rm_officer_agent_handoffs ·
   rm_officer_agent_runs(에이전트별 런 수) · rmo_memory_cards(계층별) ·
   케이스 status(승인 게이트) · rm_officer_audit_logs(감사 건수).
   ============================================================ */

let cyOntology = null;

function rmoOntologyInjectCss() {
  if (document.getElementById("rmo-onto-style")) return;
  const style = document.createElement("style");
  style.id = "rmo-onto-style";
  style.textContent = ".rmo-onto-graph{height:320px;border:1px solid #e5e7eb;border-radius:8px;background:#fafbfc}";
  document.head.appendChild(style);
}

/* 온톨로지를 그릴 대상 케이스 — 현재 뷰 컨텍스트가 케이스면 그것, 아니면 가장 급한 케이스 */
function rmoOntologyCurrentCase() {
  try {
    const model = typeof rmoViewContextModel === "function" ? rmoViewContextModel() : null;
    if (model && model.kind === "case" && model.row) return model.row;
  } catch (_) { /* fall through */ }
  const cases = rmoTable("rm_officer_cases", RMO_ROLE_KEY);
  return (typeof rmoSortByUrgency === "function" ? rmoSortByUrgency(cases) : cases)[0] || null;
}

function rmoOntologyElements(caseRow) {
  const els = [];
  const node = (id, label, kind) => els.push({ data: { id, label, kind } });
  const edge = (s, t, label) => els.push({ data: { id: `${s}->${t}`, source: s, target: t, label } });

  node("case", `${caseRow.caseNo}\n${caseRow.customerAlias || caseRow.theme || ""}`, "case");

  const tree = typeof rmoBuildWorkMapTree === "function" ? rmoBuildWorkMapTree(caseRow) : { orchestrator: null, branches: [], report: null };
  const runs = rmoTable("rm_officer_agent_runs", RMO_ROLE_KEY).filter((r) => r.caseId === caseRow.id);
  const runCountOf = (agentId) => runs.filter((r) => r.agentId === agentId).length;
  const agentNode = (a, prefix) => {
    if (!a || !a.agentId) return null;
    const nid = `ag-${a.agentId}`;
    if (!els.some((e) => e.data.id === nid)) {
      const n = runCountOf(a.agentId);
      node(nid, `${rmoAgentDisplayName(a.agentId)}${n ? `\n런 ${n}건` : ""}`, "agent");
    }
    return nid;
  };

  const orchId = tree.orchestrator ? agentNode(tree.orchestrator) : null;
  if (orchId) edge("case", orchId, "AgentRun");
  (tree.branches || []).slice(0, 6).forEach((b) => {
    const bid = agentNode(b);
    if (bid && orchId) edge(orchId, bid, "AgentRun");
    else if (bid) edge("case", bid, "AgentRun");
  });
  const reportId = tree.report ? agentNode(tree.report) : null;
  if (reportId) edge(orchId || "case", reportId, "AgentRun");

  // 라이브 핸드오프(fromAgent→toAgent)
  rmoTable("rm_officer_agent_handoffs", RMO_ROLE_KEY)
    .filter((h) => h.caseId === caseRow.id)
    .slice(0, 6)
    .forEach((h) => {
      const from = `ag-${h.fromAgentId}`;
      const to = `ag-${h.toAgentId}`;
      if (els.some((e) => e.data.id === from) && els.some((e) => e.data.id === to)) {
        edge(from, to, "Handoff");
      }
    });

  // 두 기능의 연결 지점 — 이 케이스에 카드가 있는 메모리 계층 노드
  if (typeof rmoMemoryCards === "function") {
    const agentIds = new Set(els.filter((e) => e.data.kind === "agent").map((e) => e.data.id.slice(3)));
    const layerLabels = (typeof RMO_MEMORY_LAYER_LABELS !== "undefined" && RMO_MEMORY_LAYER_LABELS) || { customer: "고객", agent: "에이전트", staff: "직원" };
    ["customer", "agent", "staff"].forEach((layer) => {
      const cards = rmoMemoryCards(layer).filter((c) =>
        c.subjectKey === caseRow.id || agentIds.has(c.subjectKey) || (layer === "staff"));
      const relevant = layer === "staff" ? rmoMemoryCards("staff") : cards;
      if (relevant.length) {
        const mid = `mem-${layer}`;
        node(mid, `메모리·${layerLabels[layer]}\n${relevant.length}건`, "memory");
        edge("case", mid, "Memory");
      }
    });
  }

  // 승인 게이트 · 감사 원장
  const statusLabel = (typeof RMO_STATUS_LABELS !== "undefined" && RMO_STATUS_LABELS[caseRow.status]) || caseRow.status || "-";
  node("approval", `승인 게이트\n${statusLabel}`, "approval");
  edge("case", "approval", "Approval");
  const auditCount = rmoTable("rm_officer_audit_logs", RMO_ROLE_KEY).filter((a) => a.caseId === caseRow.id).length;
  node("audit", `감사 원장\n${auditCount}건`, "audit");
  edge("approval", "audit", "Audit");

  return els;
}

function rmoInitCaseOntology(caseRow) {
  const el = document.getElementById("rmo-onto-graph");
  if (!el || typeof cytoscape === "undefined" || !caseRow) return; // 라이브러리 미로드 시 조용히 생략
  if (cyOntology) { try { cyOntology.destroy(); } catch (_) { /* noop */ } }
  cyOntology = cytoscape({
    container: el,
    elements: rmoOntologyElements(caseRow),
    layout: {
      name: "concentric",
      concentric: (n) => (n.data("kind") === "case" ? 3 : n.data("kind") === "agent" ? 2 : 1),
      levelWidth: () => 1,
      padding: 16,
    },
    style: [
      { selector: "node", style: { label: "data(label)", "text-wrap": "wrap", "text-max-width": 90, "font-size": 10, "font-family": "Pretendard, sans-serif", "text-valign": "center", color: "#1f2937", "background-color": "#e5e7eb", width: 48, height: 48 } },
      { selector: 'node[kind="case"]', style: { "background-color": "#0f4c92", color: "#ffffff", width: 80, height: 80, "font-size": 11 } },
      { selector: 'node[kind="agent"]', style: { "background-color": "#3b82f6", color: "#ffffff" } },
      { selector: 'node[kind="memory"]', style: { "background-color": "#8b5cf6", color: "#ffffff" } },
      { selector: 'node[kind="deliverable"]', style: { "background-color": "#f59e0b" } },
      { selector: 'node[kind="approval"]', style: { "background-color": "#ef4444", color: "#ffffff" } },
      { selector: 'node[kind="audit"]', style: { "background-color": "#6b7280", color: "#ffffff" } },
      { selector: "edge", style: { label: "data(label)", "font-size": 8, "curve-style": "bezier", "target-arrow-shape": "triangle", width: 1.5, "line-color": "#cbd5e1", "target-arrow-color": "#cbd5e1" } },
    ],
    wheelSensitivity: 0.2,
  });
}

function rmoOntologySection() {
  const caseRow = rmoOntologyCurrentCase();
  if (!caseRow) return "";
  const meta = `<p class="jbwc-meta">현재 케이스 <strong>${escapeHtml(caseRow.caseNo)}</strong> · ${escapeHtml(caseRow.theme || "")} — Case·Agent·Memory·Approval·Audit 실데이터 관계도</p>`;
  return rmoPanel("케이스 온톨로지 그래프", meta + `<div id="rmo-onto-graph" class="rmo-onto-graph"></div>`);
}

/* 뷰 렌더러(board·agent-harness)에 온톨로지 섹션을 덧붙이고 렌더 직후 cytoscape 마운트 */
if (typeof rmoViewRenderers !== "undefined") {
  ["board", "agent-harness"].forEach((viewKey) => {
    const orig = rmoViewRenderers[viewKey];
    if (typeof orig !== "function") return;
    rmoViewRenderers[viewKey] = function () {
      const base = orig.apply(this, arguments);
      let section = "";
      try { section = rmoOntologySection(); } catch (_) { section = ""; }
      if (section) {
        rmoOntologyInjectCss();
        const caseRow = rmoOntologyCurrentCase();
        setTimeout(() => { try { rmoInitCaseOntology(caseRow); } catch (_) { /* noop */ } }, 0);
      }
      return base + section;
    };
  });
}
