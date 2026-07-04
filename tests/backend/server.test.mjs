import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer as createHttpServer } from "node:http";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer as createNetServer } from "node:net";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createBackendServer } from "../../server/index.mjs";

async function withServer(fn, options = {}) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "jb-backend-test-"));
  const dbPath = path.join(tempDir, "db.json");
  if (Object.hasOwn(options, "initialDbText")) {
    await writeFile(dbPath, options.initialDbText, "utf8");
  }
  const server = createBackendServer({
    dbPath,
    staticRoot: path.resolve("app"),
    publicDataProxyBase: "http://127.0.0.1:1",
    ollamaProxyBase: "http://127.0.0.1:1",
    ...(options.serverOptions || {}),
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await fn({ baseUrl, dbPath });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function withFakeSupabase(fn) {
  let stateRow = null;
  const requests = [];
  const server = createHttpServer(async (req, res) => {
    const rawBody = await readRawBody(req);
    const url = new URL(req.url || "/", "http://127.0.0.1");
    requests.push({
      method: req.method,
      pathname: url.pathname,
      search: url.search,
      headers: req.headers,
      body: rawBody ? JSON.parse(rawBody) : null,
    });
    res.setHeader("content-type", "application/json");
    if (req.headers.apikey !== "test-service-role" || req.headers.authorization !== "Bearer test-service-role") {
      res.writeHead(401);
      res.end(JSON.stringify({ message: "missing service role headers" }));
      return;
    }
    if (url.pathname !== "/rest/v1/jb_backend_state") {
      res.writeHead(404);
      res.end(JSON.stringify({ message: "unknown table" }));
      return;
    }
    if (req.method === "GET") {
      res.writeHead(200);
      res.end(JSON.stringify(stateRow ? [{ payload: stateRow.payload }] : []));
      return;
    }
    if (req.method === "POST") {
      stateRow = { id: requests.at(-1).body.id, payload: requests.at(-1).body.payload };
      res.writeHead(201);
      res.end(JSON.stringify([]));
      return;
    }
    res.writeHead(405);
    res.end(JSON.stringify({ message: "method not allowed" }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await fn({ baseUrl, requests });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function getFreePort() {
  const server = createNetServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  await new Promise((resolve) => server.close(resolve));
  return address.port;
}

async function waitForHealth(baseUrl, child, getLogs) {
  let lastError;
  for (let index = 0; index < 30; index += 1) {
    if (child.exitCode !== null) break;
    try {
      const health = await request(baseUrl, "/api/health");
      if (health.response.status === 200 && health.body.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  const logs = getLogs();
  throw new Error(`backend CLI did not become ready: ${lastError?.message || "not ready"}\n${logs}`);
}

async function request(baseUrl, pathName, options = {}) {
  const response = await fetch(`${baseUrl}${pathName}`, {
    ...options,
    headers: {
      ...(options.body && typeof options.body === "string" ? { "content-type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  return { response, body };
}

test("backend exposes health, role list, and role dashboard", async () => {
  await withServer(async ({ baseUrl }) => {
    const health = await request(baseUrl, "/api/health");
    assert.equal(health.response.status, 200);
    assert.equal(health.body.ok, true);
    assert.equal(health.body.service, "jb-localguard-backend");

    const roles = await request(baseUrl, "/api/roles");
    assert.equal(roles.response.status, 200);
    assert.ok(roles.body.roles.some((role) => role.key === "jeonse-protection"));
    assert.ok(roles.body.roles.some((role) => role.key === "rm-officer"));

    const dashboard = await request(baseUrl, "/api/roles/jeonse-protection/dashboard");
    assert.equal(dashboard.response.status, 200);
    assert.equal(dashboard.body.role.key, "jeonse-protection");
    assert.equal(dashboard.body.counts.total, 1);
    assert.ok(dashboard.body.agentQueue.includes("jpo-price-risk"));
    assert.ok(dashboard.body.nextActions[0].nextAction.includes("피해지원"));
  });
});

test("backend seeds an existing empty db file", async () => {
  await withServer(async ({ baseUrl }) => {
    const roles = await request(baseUrl, "/api/roles");
    assert.equal(roles.response.status, 200);
    assert.ok(roles.body.roles.some((role) => role.key === "jeonse-protection"));
  }, { initialDbText: "" });
});

test("backend CLI starts from the package script entrypoint", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "jb-backend-cli-"));
  const dbPath = path.join(tempDir, "db.json");
  await writeFile(dbPath, "", "utf8");
  const port = await getFreePort();
  const child = spawn(process.execPath, ["server/index.mjs"], {
    cwd: path.resolve("."),
    env: {
      ...process.env,
      JB_BACKEND_DB: dbPath,
      JB_BACKEND_PORT: String(port),
      JB_PUBLIC_DATA_PROXY: "http://127.0.0.1:1",
      JB_OLLAMA_PROXY: "http://127.0.0.1:1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk.toString("utf8"); });
  child.stderr.on("data", (chunk) => { stderr += chunk.toString("utf8"); });
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await waitForHealth(baseUrl, child, () => `stdout=${stdout}\nstderr=${stderr}`);
    const roles = await request(baseUrl, "/api/roles");
    assert.equal(roles.response.status, 200);
    assert.ok(roles.body.roles.some((role) => role.key === "rm-officer"));
  } finally {
    if (child.exitCode === null) {
      child.kill();
      await new Promise((resolve) => child.once("exit", resolve));
    }
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("backend can use Supabase REST API as the repository driver", async () => {
  await withFakeSupabase(async ({ baseUrl, requests }) => {
    await withServer(async ({ baseUrl: backendUrl }) => {
      const health = await request(backendUrl, "/api/health");
      assert.equal(health.response.status, 200);
      assert.equal(health.body.store.driver, "supabase");
      assert.equal(health.body.store.table, "jb_backend_state");

      const created = await request(backendUrl, "/api/cases", {
        method: "POST",
        body: JSON.stringify({
          roleKey: "jeonse-protection",
          title: "Supabase 저장소 연결 검증",
          customerAlias: "CUST-SB-001",
          region: "전북 군산",
          riskLevel: "medium",
        }),
      });
      assert.equal(created.response.status, 201);
      assert.equal(created.body.audit.action, "CASE_CREATED");

      const list = await request(backendUrl, "/api/cases?roleKey=jeonse-protection&q=Supabase");
      assert.equal(list.response.status, 200);
      assert.equal(list.body.cases.length, 1);
      assert.equal(list.body.cases[0].title, "Supabase 저장소 연결 검증");
    }, {
      serverOptions: {
        dbDriver: "supabase",
        supabaseUrl: baseUrl,
        supabaseKey: "test-service-role",
        supabaseTable: "jb_backend_state",
        supabaseStateId: "test-state",
      },
    });

    assert.ok(requests.some((item) => item.method === "GET" && item.search.includes("select=payload")));
    assert.ok(requests.some((item) => item.method === "POST" && item.headers.prefer?.includes("resolution=merge-duplicates")));
  });
});

test("backend persists case creation, file upload, agent run, deliverable, and audit log", async () => {
  await withServer(async ({ baseUrl }) => {
    const created = await request(baseUrl, "/api/cases", {
      method: "POST",
      body: JSON.stringify({
        roleKey: "jeonse-protection",
        caseNo: "JEONSE-NEW-001",
        title: "신규 전세 위험 접수",
        customerAlias: "CUST-JS-NEW",
        region: "전북 전주",
        riskLevel: "high",
        summary: "보증금 대비 시세 비율과 권리관계 확인이 필요한 신규 접수입니다.",
        agentQueue: ["jpo-orchestrator", "jpo-title-registry"],
      }),
    });
    assert.equal(created.response.status, 201);
    assert.equal(created.body.case.caseNo, "JEONSE-NEW-001");
    assert.equal(created.body.audit.action, "CASE_CREATED");

    const caseId = created.body.case.id;
    const upload = await request(baseUrl, `/api/cases/${caseId}/files`, {
      method: "POST",
      body: JSON.stringify({
        fileName: "registry-summary.txt",
        contentType: "text/plain",
        content: "등기 요약: 근저당 및 임차권 확인 필요",
        metadata: { actorId: "tester" },
      }),
    });
    assert.equal(upload.response.status, 201);
    assert.equal(upload.body.file.caseId, caseId);
    assert.equal(upload.body.file.fileName, "registry-summary.txt");
    assert.ok(upload.body.file.textPreview.includes("근저당"));

    const run = await request(baseUrl, "/api/agent-runs", {
      method: "POST",
      body: JSON.stringify({
        caseId,
        agentId: "jpo-title-registry",
      }),
    });
    assert.equal(run.response.status, 201);
    assert.equal(run.body.run.status, "completed");
    assert.equal(run.body.deliverable.status, "human_review_required");
    assert.ok(run.body.deliverable.content.includes("실제 승인/거절/보증/피해자 결정이 아니며"));

    const detail = await request(baseUrl, `/api/cases/${caseId}`);
    assert.equal(detail.response.status, 200);
    assert.equal(detail.body.files.length, 1);
    assert.equal(detail.body.deliverables.length, 1);
    assert.ok(detail.body.auditLogs.some((row) => row.action === "AGENT_RUN_COMPLETED"));

    const audit = await request(baseUrl, `/api/audit-logs?caseId=${caseId}`);
    assert.equal(audit.response.status, 200);
    assert.ok(audit.body.auditLogs.length >= 3);
    assert.equal(audit.body.auditLogs[0].reviewRequired, true);
  });
});

test("backend returns deterministic fallback for public data and model runtime when proxies are absent", async () => {
  await withServer(async ({ baseUrl }) => {
    const market = await request(baseUrl, "/api/public-data/jeonse/market?dataset=rhTrade&lawd=28177&ym=202606");
    assert.equal(market.response.status, 200);
    assert.equal(market.body.sourceMode, "snapshot");
    assert.ok(market.body.median > 0);
    assert.ok(market.body.fallbackReason);

    const health = await request(baseUrl, "/api/model-runtime/health");
    assert.equal(health.response.status, 200);
    assert.equal(health.body.connected, false);
    assert.equal(health.body.sourceMode, "fallback");

    const run = await request(baseUrl, "/api/model-runtime/run", {
      method: "POST",
      body: JSON.stringify({ agentId: "jpo-orchestrator", input: { caseNo: "JEONSE-0004" } }),
    });
    assert.equal(run.response.status, 200);
    assert.equal(run.body.sourceMode, "deterministic-fallback");
    assert.equal(run.body.parsed.requiresHumanReview, true);
  });
});

test("backend can serve the static app shell next to API routes", async () => {
  await withServer(async ({ baseUrl }) => {
    const response = await fetch(`${baseUrl}/index.html`);
    const text = await response.text();
    assert.equal(response.status, 200);
    assert.match(text, /JB/);
    assert.match(response.headers.get("content-type") || "", /text\/html/);
  });
});
