import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JsonRepository, caseCounts, nextId, publicCase, publicRole } from "./lib/repository.mjs";
import { SupabaseRepository } from "./lib/supabaseRepository.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_DB_PATH = path.join(__dirname, "data", "localguard-db.json");
const DEFAULT_STATIC_ROOT = path.join(ROOT, "app");
const DEFAULT_SUPABASE_URL = "https://wtahqybymvtiwypmzsbw.supabase.co";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type, authorization, x-role-key",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  });
  res.end(JSON.stringify(body));
}

function notFound(res) {
  sendJson(res, 404, { error: "not_found" });
}

function badRequest(res, message, details = undefined) {
  sendJson(res, 400, { error: "bad_request", message, details });
}

function normalizeRoleKey(value) {
  return String(value || "").trim();
}

function matchesQuery(value, query) {
  if (!query) return true;
  return String(value || "").toLowerCase().includes(query.toLowerCase());
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 5 * 1024 * 1024) throw new Error("request body too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function readJson(req) {
  const buffer = await readBody(req);
  if (!buffer.length) return {};
  try {
    return JSON.parse(buffer.toString("utf8"));
  } catch (error) {
    error.statusCode = 400;
    throw error;
  }
}

function parseMultipart(buffer, boundary) {
  const parts = [];
  const marker = `--${boundary}`;
  const rawParts = buffer.toString("binary").split(marker).slice(1, -1);
  for (const rawPart of rawParts) {
    const trimmed = rawPart.replace(/^\r\n/, "").replace(/\r\n$/, "");
    const [rawHeaders, ...bodyPieces] = trimmed.split("\r\n\r\n");
    const body = bodyPieces.join("\r\n\r\n");
    const headers = Object.fromEntries(rawHeaders.split("\r\n").map((line) => {
      const index = line.indexOf(":");
      return index === -1 ? [line.toLowerCase(), ""] : [line.slice(0, index).toLowerCase(), line.slice(index + 1).trim()];
    }));
    const disposition = headers["content-disposition"] || "";
    const name = /name="([^"]+)"/.exec(disposition)?.[1] || "";
    const fileName = /filename="([^"]*)"/.exec(disposition)?.[1] || "";
    parts.push({
      name,
      fileName,
      contentType: headers["content-type"] || "text/plain",
      content: Buffer.from(body, "binary"),
    });
  }
  return parts;
}

async function readUpload(req) {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("application/json")) {
    const body = await readJson(req);
    return {
      fileName: body.fileName || body.name || "upload.txt",
      contentType: body.contentType || "text/plain",
      content: body.contentBase64 ? Buffer.from(body.contentBase64, "base64") : Buffer.from(String(body.content || ""), "utf8"),
      metadata: body.metadata || {},
    };
  }
  const boundary = /boundary=([^;]+)/.exec(contentType)?.[1];
  if (!boundary) throw Object.assign(new Error("missing multipart boundary"), { statusCode: 400 });
  const parts = parseMultipart(await readBody(req), boundary);
  const file = parts.find((part) => part.fileName) || parts[0];
  if (!file) throw Object.assign(new Error("missing upload file"), { statusCode: 400 });
  const metadata = {};
  for (const part of parts.filter((item) => !item.fileName)) {
    metadata[part.name] = part.content.toString("utf8");
  }
  return {
    fileName: file.fileName || "upload.bin",
    contentType: file.contentType,
    content: file.content,
    metadata,
  };
}

function buildDeliverable(caseRow, agentId, runId) {
  const roleLabel = {
    "rm-officer": "RM 검토",
    "jeonse-protection": "전세보호 확인",
    "corporate-credit": "기업여신 심사",
    "woori-capital": "계열사 운영",
  }[caseRow.roleKey] || "업무지원";
  const fileName = `${caseRow.caseNo}-${agentId || "agent"}-report.md`.replace(/[^a-zA-Z0-9가-힣._-]+/g, "-");
  return {
    title: `${roleLabel} 산출물 · ${caseRow.title}`,
    fileName,
    summary: `${caseRow.caseNo} 케이스의 ${caseRow.summary} 담당자 검토가 필요한 내부 운영 참고용 산출물입니다.`,
    content: [
      `# ${caseRow.title}`,
      "",
      `- 케이스: ${caseRow.caseNo}`,
      `- 역할: ${caseRow.roleKey}`,
      `- 실행 에이전트: ${agentId || "role-orchestrator"}`,
      `- 실행 기록: ${runId}`,
      "",
      "## 확인 결과",
      caseRow.summary,
      "",
      "## 다음 액션",
      caseRow.nextAction,
      "",
      "## 통제",
      "실제 승인/거절/보증/피해자 결정이 아니며 담당자 검토가 필요합니다.",
    ].join("\n"),
  };
}

function createAudit(db, input) {
  const audit = {
    id: nextId(db, "audit", "AUDIT"),
    roleKey: input.roleKey || null,
    caseId: input.caseId || null,
    actorId: input.actorId || "backend",
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId || null,
    message: input.message,
    riskLevel: input.riskLevel || "low",
    reviewRequired: input.reviewRequired !== false,
    createdAt: new Date().toISOString(),
  };
  db.auditLogs.push(audit);
  return audit;
}

function roleDashboard(db, roleKey) {
  const role = db.roles.find((item) => item.key === roleKey);
  if (!role) return null;
  const cases = db.cases.filter((item) => item.roleKey === roleKey);
  const recentRuns = db.agentRuns.filter((item) => item.roleKey === roleKey).slice(-5).reverse();
  const recentAudits = db.auditLogs.filter((item) => item.roleKey === roleKey).slice(-8).reverse();
  return {
    role: publicRole(role),
    counts: caseCounts(cases),
    cases: cases.map(publicCase),
    nextActions: cases.map((item) => ({ caseId: item.id, caseNo: item.caseNo, title: item.title, nextAction: item.nextAction })),
    agentQueue: [...new Set(cases.flatMap((item) => item.agentQueue || []))],
    recentRuns,
    recentAudits,
  };
}

async function fetchJsonWithTimeout(url, timeoutMs = 2500, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    let body;
    try { body = text ? JSON.parse(text) : {}; }
    catch { body = { raw: text }; }
    return { ok: response.ok, status: response.status, body };
  } finally {
    clearTimeout(timeout);
  }
}

function jeonseSnapshot(dataset) {
  const snapshots = {
    aptTrade: 410_000_000,
    aptRent: 235_000_000,
    rhTrade: 285_000_000,
    rhRent: 180_000_000,
    shTrade: 360_000_000,
    shRent: 170_000_000,
    officetelRent: 160_000_000,
  };
  return {
    median: snapshots[dataset] || snapshots.rhTrade,
    count: 12,
    source: "backend snapshot fallback",
    dataset,
    sourceMode: "snapshot",
  };
}

function createRepository(options = {}) {
  if (options.repository) return options.repository;
  const driver = options.dbDriver || process.env.JB_DB_DRIVER || "json";
  if (driver === "supabase") {
    return new SupabaseRepository({
      url: options.supabaseUrl || process.env.SUPABASE_URL || process.env.JB_SUPABASE_URL || DEFAULT_SUPABASE_URL,
      key: options.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.JB_SUPABASE_SERVICE_ROLE_KEY,
      table: options.supabaseTable || process.env.JB_SUPABASE_TABLE || "jb_backend_state",
      stateId: options.supabaseStateId || process.env.JB_SUPABASE_STATE_ID || "localguard",
    });
  }
  if (driver !== "json") {
    throw new Error(`unsupported JB_DB_DRIVER: ${driver}`);
  }
  return new JsonRepository(options.dbPath || process.env.JB_BACKEND_DB || DEFAULT_DB_PATH);
}

async function serveStatic(req, res, staticRoot) {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  const rawPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const target = path.normalize(path.join(staticRoot, rawPath));
  if (!target.startsWith(staticRoot)) {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }
  try {
    const info = await stat(target);
    if (!info.isFile()) throw new Error("not file");
    const ext = path.extname(target).toLowerCase();
    res.writeHead(200, { "content-type": MIME_TYPES[ext] || "application/octet-stream" });
    createReadStream(target).pipe(res);
  } catch {
    if (!path.extname(rawPath)) {
      const fallback = path.join(staticRoot, "index.html");
      res.writeHead(200, { "content-type": MIME_TYPES[".html"] });
      createReadStream(fallback).pipe(res);
      return;
    }
    res.writeHead(404);
    res.end("not found");
  }
}

export function createBackendServer(options = {}) {
  const repository = createRepository(options);
  const staticRoot = path.resolve(options.staticRoot || process.env.JB_STATIC_ROOT || DEFAULT_STATIC_ROOT);
  const publicDataProxyBase = options.publicDataProxyBase || process.env.JB_PUBLIC_DATA_PROXY || "http://127.0.0.1:8020";
  const ollamaProxyBase = options.ollamaProxyBase || process.env.JB_OLLAMA_PROXY || "http://127.0.0.1:8030";

  return http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
      sendJson(res, 204, {});
      return;
    }

    const url = new URL(req.url || "/", "http://127.0.0.1");
    const segments = url.pathname.split("/").filter(Boolean);

    try {
      if (segments[0] !== "api") {
        await serveStatic(req, res, staticRoot);
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/health") {
        await repository.ensure();
        sendJson(res, 200, {
          ok: true,
          service: "jb-localguard-backend",
          store: typeof repository.describe === "function" ? repository.describe() : { driver: "custom" },
          dbPath: repository.dbPath,
          time: new Date().toISOString(),
        });
        return;
      }

      if (process.env.NODE_ENV !== "production" && req.method === "POST" && url.pathname === "/api/dev/reset") {
        const db = await repository.reset();
        sendJson(res, 200, { ok: true, counts: { roles: db.roles.length, cases: db.cases.length } });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/roles") {
        const db = await repository.read();
        sendJson(res, 200, { roles: db.roles.map(publicRole) });
        return;
      }

      if (req.method === "GET" && segments[1] === "roles" && segments[3] === "dashboard") {
        const db = await repository.read();
        const dashboard = roleDashboard(db, normalizeRoleKey(segments[2]));
        if (!dashboard) return notFound(res);
        sendJson(res, 200, dashboard);
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/cases") {
        const db = await repository.read();
        const roleKey = normalizeRoleKey(url.searchParams.get("roleKey"));
        const status = url.searchParams.get("status");
        const query = url.searchParams.get("q");
        const cases = db.cases
          .filter((item) => !roleKey || item.roleKey === roleKey)
          .filter((item) => !status || item.status === status)
          .filter((item) => matchesQuery(`${item.caseNo} ${item.title} ${item.customerAlias} ${item.region}`, query));
        sendJson(res, 200, { cases: cases.map(publicCase), counts: caseCounts(cases) });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/cases") {
        const body = await readJson(req);
        const result = await repository.mutate((db) => {
          const roleKey = normalizeRoleKey(body.roleKey);
          const role = db.roles.find((item) => item.key === roleKey);
          if (!role) return { error: "unknown roleKey" };
          if (!body.title) return { error: "title is required" };
          const createdAt = new Date().toISOString();
          const caseRow = {
            id: nextId(db, "case", "CASE"),
            roleKey,
            caseNo: body.caseNo || `${roleKey.toUpperCase()}-${db.counters.case}`,
            title: String(body.title),
            customerAlias: body.customerAlias || "CUST-NEW",
            region: body.region || "미지정",
            status: body.status || "received",
            riskLevel: body.riskLevel || "medium",
            urgency: body.urgency || "normal",
            summary: body.summary || "신규 접수 케이스입니다. 담당자 검토 전 단계입니다.",
            dataScope: Array.isArray(body.dataScope) ? body.dataScope : [],
            nextAction: body.nextAction || "기본 식별 후 담당자 검토 큐에 올립니다.",
            agentQueue: Array.isArray(body.agentQueue) ? body.agentQueue : ["role-orchestrator"],
            createdAt,
            updatedAt: createdAt,
          };
          db.cases.push(caseRow);
          const audit = createAudit(db, {
            roleKey,
            caseId: caseRow.id,
            actorId: body.actorId || "api-user",
            action: "CASE_CREATED",
            targetType: "case",
            targetId: caseRow.id,
            message: `${caseRow.caseNo} 신규 케이스가 접수되었습니다.`,
            riskLevel: caseRow.riskLevel,
            reviewRequired: true,
          });
          return { case: caseRow, audit };
        });
        if (result.error) return badRequest(res, result.error);
        sendJson(res, 201, result);
        return;
      }

      if (segments[1] === "cases" && segments[2]) {
        const caseId = segments[2];
        if (req.method === "GET" && segments.length === 3) {
          const db = await repository.read();
          const caseRow = db.cases.find((item) => item.id === caseId || item.caseNo === caseId);
          if (!caseRow) return notFound(res);
          sendJson(res, 200, {
            case: publicCase(caseRow),
            files: db.files.filter((item) => item.caseId === caseRow.id),
            deliverables: db.deliverables.filter((item) => item.caseId === caseRow.id),
            auditLogs: db.auditLogs.filter((item) => item.caseId === caseRow.id),
          });
          return;
        }

        if (req.method === "POST" && segments[3] === "files") {
          const upload = await readUpload(req);
          const result = await repository.mutate((db) => {
            const caseRow = db.cases.find((item) => item.id === caseId || item.caseNo === caseId);
            if (!caseRow) return { error: "case not found" };
            const file = {
              id: nextId(db, "file", "FILE"),
              roleKey: caseRow.roleKey,
              caseId: caseRow.id,
              fileName: upload.fileName,
              contentType: upload.contentType,
              size: upload.content.length,
              textPreview: upload.content.toString("utf8").slice(0, 500),
              metadata: upload.metadata,
              createdAt: new Date().toISOString(),
            };
            db.files.push(file);
            const audit = createAudit(db, {
              roleKey: caseRow.roleKey,
              caseId: caseRow.id,
              actorId: upload.metadata.actorId || "api-user",
              action: "FILE_UPLOADED",
              targetType: "file",
              targetId: file.id,
              message: `${file.fileName} 파일이 케이스 분석 자료로 업로드되었습니다.`,
              riskLevel: caseRow.riskLevel,
              reviewRequired: true,
            });
            return { file, audit };
          });
          if (result.error) return notFound(res);
          sendJson(res, 201, result);
          return;
        }
      }

      if (req.method === "POST" && url.pathname === "/api/agent-runs") {
        const body = await readJson(req);
        const result = await repository.mutate((db) => {
          const caseRow = db.cases.find((item) => item.id === body.caseId || item.caseNo === body.caseId);
          if (!caseRow) return { error: "case not found" };
          const agentId = String(body.agentId || caseRow.agentQueue?.[0] || "role-orchestrator");
          const createdAt = new Date().toISOString();
          const run = {
            id: nextId(db, "run", "RUN"),
            roleKey: caseRow.roleKey,
            caseId: caseRow.id,
            agentId,
            status: "completed",
            runtime: body.runtime || "deterministic-backend",
            input: body.input || { caseId: caseRow.id },
            outputSummary: `${caseRow.caseNo} ${agentId} 실행이 완료되어 담당자 검토 산출물을 생성했습니다.`,
            reviewRequired: true,
            startedAt: createdAt,
            completedAt: createdAt,
          };
          db.agentRuns.push(run);
          const built = buildDeliverable(caseRow, agentId, run.id);
          const deliverable = {
            id: nextId(db, "deliverable", "DLV"),
            roleKey: caseRow.roleKey,
            caseId: caseRow.id,
            runId: run.id,
            agentId,
            kind: body.kind || "agent-report",
            status: "human_review_required",
            createdAt,
            ...built,
          };
          db.deliverables.push(deliverable);
          caseRow.status = "human_review_required";
          caseRow.updatedAt = createdAt;
          const audit = createAudit(db, {
            roleKey: caseRow.roleKey,
            caseId: caseRow.id,
            actorId: agentId,
            action: "AGENT_RUN_COMPLETED",
            targetType: "agent_run",
            targetId: run.id,
            message: `${agentId} 실행과 산출물 생성이 완료되었습니다. 담당자 검토가 필요합니다.`,
            riskLevel: caseRow.riskLevel,
            reviewRequired: true,
          });
          return { run, deliverable, audit };
        });
        if (result.error) return badRequest(res, result.error);
        sendJson(res, 201, result);
        return;
      }

      if (req.method === "GET" && segments[1] === "agent-runs" && segments[2]) {
        const db = await repository.read();
        const run = db.agentRuns.find((item) => item.id === segments[2]);
        if (!run) return notFound(res);
        sendJson(res, 200, { run });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/deliverables") {
        const db = await repository.read();
        const roleKey = normalizeRoleKey(url.searchParams.get("roleKey"));
        const caseId = url.searchParams.get("caseId");
        const deliverables = db.deliverables
          .filter((item) => !roleKey || item.roleKey === roleKey)
          .filter((item) => !caseId || item.caseId === caseId);
        sendJson(res, 200, { deliverables });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/audit-logs") {
        const db = await repository.read();
        const roleKey = normalizeRoleKey(url.searchParams.get("roleKey"));
        const caseId = url.searchParams.get("caseId");
        const auditLogs = db.auditLogs
          .filter((item) => !roleKey || item.roleKey === roleKey)
          .filter((item) => !caseId || item.caseId === caseId)
          .slice()
          .reverse();
        sendJson(res, 200, { auditLogs });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/public-data/jeonse/market") {
        const dataset = url.searchParams.get("dataset") || "rhTrade";
        const lawd = url.searchParams.get("lawd") || "11500";
        const ym = url.searchParams.get("ym") || "202605";
        const proxy = await fetchJsonWithTimeout(`${publicDataProxyBase}/jeonse/market?${new URLSearchParams({ dataset, lawd, ym })}`).catch((error) => ({ ok: false, status: 0, body: { error: String(error.message || error) } }));
        if (proxy.ok && proxy.body && Number(proxy.body.median) > 0) {
          sendJson(res, 200, { ...proxy.body, sourceMode: "live_api" });
          return;
        }
        sendJson(res, 200, { ...jeonseSnapshot(dataset), fallbackReason: proxy.body?.error || "public data proxy unavailable" });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/model-runtime/health") {
        const proxy = await fetchJsonWithTimeout(`${ollamaProxyBase}/agent/health`).catch((error) => ({ ok: false, status: 0, body: { error: String(error.message || error) } }));
        sendJson(res, 200, proxy.ok ? { ...proxy.body, sourceMode: "ollama_proxy" } : { connected: false, sourceMode: "fallback", error: proxy.body?.error || "ollama proxy unavailable" });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/model-runtime/run") {
        const body = await readJson(req);
        const proxy = await fetchJsonWithTimeout(`${ollamaProxyBase}/agent/run`, 8000, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }).catch((error) => ({ ok: false, status: 0, body: { error: String(error.message || error) } }));
        if (proxy.ok) {
          sendJson(res, 200, { ...proxy.body, sourceMode: "ollama_proxy" });
          return;
        }
        sendJson(res, 200, {
          ok: true,
          sourceMode: "deterministic-fallback",
          parsed: {
            summary: "로컬 모델 프록시가 없어 결정론적 백엔드 fallback으로 처리했습니다.",
            recommendedAgent: body.agentId || "role-orchestrator",
            checklist: ["담당자 검토 필요", "실제 승인/거절 아님", "감사 로그 확인"],
            evidence: ["입력 케이스 요약", "백엔드 fallback"],
            riskNotes: ["모델 미연결"],
            nextActions: ["필요 시 npm run demo:ollama 실행"],
            requiresHumanReview: true,
          },
        });
        return;
      }

      notFound(res);
    } catch (error) {
      const status = error.statusCode || 500;
      sendJson(res, status, {
        error: status === 500 ? "internal_error" : "bad_request",
        message: String(error.message || error),
      });
    }
  });
}

function isMainModule() {
  if (!process.argv[1]) return false;
  return fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
}

if (isMainModule()) {
  const port = Number(process.env.PORT || process.env.JB_BACKEND_PORT || 8010);
  const server = createBackendServer();
  server.listen(port, () => {
    console.log(`[jb-backend] http://127.0.0.1:${port} api=/api/health db=${process.env.JB_BACKEND_DB || DEFAULT_DB_PATH}`);
  });
}
