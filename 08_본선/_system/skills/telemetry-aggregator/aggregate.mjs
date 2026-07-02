#!/usr/bin/env node
// telemetry-aggregator — ai-session-intake.csv → 4개 통계 파일 갱신
// 표준 라이브러리만 사용. 실패해도 세션 차단 없음.

import fs from "node:fs";
import path from "node:path";

const BASE = path.join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), "08_본선/_system");

// ── 경로 상수 ─────────────────────────────────────────────────────────────
const PATHS = {
  intake:       path.join(BASE, "telemetry/ai-session-intake.csv"),
  telemetryLog: path.join(BASE, "telemetry/_telemetry-log.md"),
  agentReg:     path.join(BASE, "agents/_agent-registry.md"),
  contribStats: path.join(BASE, "team/_contribution-stats.md"),
  usageStats:   path.join(BASE, "telemetry/ai-usage-stats.md"),
};

function atomicWriteFile(filePath, content) {
  const tmp = filePath + ".tmp";
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, filePath);
}

// ── CSV 파싱 ──────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCSVRow(lines[0]);
  return lines.slice(1).map(line => {
    const vals = splitCSVRow(line);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
}

function splitCSVRow(row) {
  const result = [];
  let cur = "", inQ = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQ && row[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    }
    else if (ch === "," && !inQ) { result.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  result.push(cur.trim());
  return result;
}

function tokenCount(v) {
  const n = parseInt(String(v || "0").replace(/^~/, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function dedupeSessionRows(rows) {
  const kept = [];
  const bySession = new Map();

  for (const r of rows) {
    const sessionId = r.session_id || "";
    if (!sessionId || sessionId === "manual") {
      kept.push(r);
      continue;
    }

    const prev = bySession.get(sessionId);
    if (!prev) {
      bySession.set(sessionId, r);
      kept.push(r);
      continue;
    }

    if (tokenCount(r.tokens_in) > tokenCount(prev.tokens_in)) {
      const idx = kept.indexOf(prev);
      if (idx !== -1) kept[idx] = r;
      bySession.set(sessionId, r);
    }
  }

  return kept;
}

// ── 텔레메트리 로그 append (중복 제외) ──────────────────────────────────
function updateTelemetryLog(rows) {
  let existing = "";
  try { existing = fs.readFileSync(PATHS.telemetryLog, "utf8"); } catch { /* 없으면 새로 */ }

  const seenTs = new Set(
    [...existing.matchAll(/^\| ([\d\-T:Z ]+) \|/gm)].map(m => m[1].trim())
  );

  const newRows = rows.filter(r => r.ts && !seenTs.has(r.ts));
  if (!newRows.length) return 0;

  if (!existing.trim()) {
    existing = telemetryLogHeader();
  }

  const lines = newRows.map(r =>
    `| ${r.ts} | 세션종료 | ${r.tools || "—"} | ${r.tokens_in}/${r.tokens_out} | ${r.duration || "—"} | ${r.task || "—"} | ${r.agent || "—"} | ${r.exact_or_estimate} |`
  ).join("\n");

  atomicWriteFile(PATHS.telemetryLog, existing.trimEnd() + "\n" + lines + "\n");
  return newRows.length;
}

function telemetryLogHeader() {
  return [
    "---",
    "tags: [area/system, type/log, status/active]",
    "date: 2026-06-27",
    'up: "[[_HARNESS-SYSTEM]]"',
    "---",
    "# 텔레메트리 로그 (Append-only · 자동 기록)",
    "",
    "> ⚠️ 대외비. 1행 = 1세션/체크포인트. Stop 훅 또는 집계 스킬이 append.",
    "",
    "| 날짜(UTC) | 트리거 | 사용 툴(횟수) | 토큰(in/out) | 소요 | 작업/산출물 | 투입 에이전트 | 정확도 |",
    "|-----------|--------|--------------|-------------|------|------------|--------------|--------|",
    "",
  ].join("\n");
}

// ── 에이전트 레지스트리 갱신 ──────────────────────────────────────────────
function updateAgentRegistry(rows) {
  let existing = "";
  try { existing = fs.readFileSync(PATHS.agentReg, "utf8"); } catch { return; }

  // 에이전트별 집계
  const agents = {};
  for (const r of rows) {
    const name = r.agent || "unknown";
    if (!agents[name]) agents[name] = { sessions: 0, tokIn: 0, tokOut: 0 };
    agents[name].sessions++;
    agents[name].tokIn  += tokenCount(r.tokens_in);
    agents[name].tokOut += tokenCount(r.tokens_out);
  }

  // <!-- AGGREGATOR:AGENT-STATS --> 블록 교체 또는 append
  const block = Object.entries(agents)
    .sort((a, b) => b[1].sessions - a[1].sessions)
    .map(([name, s]) =>
      `| ${name} | ${s.sessions} | ${s.tokIn.toLocaleString()} | ${s.tokOut.toLocaleString()} |`
    ).join("\n");

  const section = [
    "<!-- AGGREGATOR:AGENT-STATS -->",
    "## AI 사용 통계 (자동 집계)",
    "",
    "| 에이전트 | 세션 수 | 입력 토큰 | 출력 토큰 |",
    "|---------|--------|---------|---------|",
    block,
    "<!-- /AGGREGATOR:AGENT-STATS -->",
  ].join("\n");

  const updated = existing.includes("<!-- AGGREGATOR:AGENT-STATS -->")
    ? existing.replace(/<!-- AGGREGATOR:AGENT-STATS -->[\s\S]*?<!-- \/AGGREGATOR:AGENT-STATS -->/m, section)
    : existing.trimEnd() + "\n\n" + section + "\n";

  atomicWriteFile(PATHS.agentReg, updated);
}

// ── 팀원 기여 통계 갱신 ──────────────────────────────────────────────────
function updateContribStats(rows) {
  let existing = "";
  try { existing = fs.readFileSync(PATHS.contribStats, "utf8"); } catch { return; }

  const domains = ["dev", "design", "doc", "research", "pitch", "ops", "other"];
  const members = ["M1", "M2", "M3", "M4", "AI"];

  // member × domain 세션 수
  const grid = {};
  for (const m of members) {
    grid[m] = {};
    for (const d of domains) grid[m][d] = 0;
  }
  for (const r of rows) {
    const m = members.includes(r.member_slot) ? r.member_slot : "AI";
    const d = domains.includes(r.domain) ? r.domain : "other";
    grid[m][d]++;
  }

  const header = `| 팀원 | ${domains.join(" | ")} | 합계 |`;
  const sep    = `|------|${domains.map(() => "-----").join("|")}|------|`;
  const dataRows = members.map(m => {
    const vals = domains.map(d => grid[m][d]);
    const total = vals.reduce((a, b) => a + b, 0);
    return `| ${m} | ${vals.join(" | ")} | ${total} |`;
  }).join("\n");

  const section = [
    "<!-- AGGREGATOR:CONTRIB-STATS -->",
    "## 팀원 × 분야 기여 (자동 집계)",
    "",
    header,
    sep,
    dataRows,
    "<!-- /AGGREGATOR:CONTRIB-STATS -->",
  ].join("\n");

  const updated = existing.includes("<!-- AGGREGATOR:CONTRIB-STATS -->")
    ? existing.replace(/<!-- AGGREGATOR:CONTRIB-STATS -->[\s\S]*?<!-- \/AGGREGATOR:CONTRIB-STATS -->/m, section)
    : existing.trimEnd() + "\n\n" + section + "\n";

  atomicWriteFile(PATHS.contribStats, updated);
}

// ── ai-usage-stats.md 전체 재생성 ────────────────────────────────────────
function rebuildUsageStats(rows) {
  const engines = {};
  const byDomain = {};
  let totalIn = 0, totalOut = 0;

  for (const r of rows) {
    const eng = r.engine || "claude";
    const dom = r.domain || "other";
    const tin  = tokenCount(r.tokens_in);
    const tout = tokenCount(r.tokens_out);

    if (!engines[eng]) engines[eng] = { sessions: 0, tokIn: 0, tokOut: 0 };
    engines[eng].sessions++;
    engines[eng].tokIn  += tin;
    engines[eng].tokOut += tout;

    if (!byDomain[dom]) byDomain[dom] = { sessions: 0, tokIn: 0, tokOut: 0 };
    byDomain[dom].sessions++;
    byDomain[dom].tokIn  += tin;
    byDomain[dom].tokOut += tout;

    totalIn  += tin;
    totalOut += tout;
  }

  const now = new Date().toISOString().replace("T", " ").slice(0, 16);

  const engineRows = Object.entries(engines)
    .sort((a, b) => b[1].sessions - a[1].sessions)
    .map(([e, s]) => `| ${e} | ${s.sessions} | ${s.tokIn.toLocaleString()} | ${s.tokOut.toLocaleString()} |`)
    .join("\n");

  const domainRows = Object.entries(byDomain)
    .sort((a, b) => b[1].tokIn - a[1].tokIn)
    .map(([d, s]) => `| ${d} | ${s.sessions} | ${s.tokIn.toLocaleString()} | ${s.tokOut.toLocaleString()} |`)
    .join("\n");

  const content = [
    "---",
    "tags:",
    "  - area/system",
    "  - type/stats",
    "  - status/active",
    "date: 2026-06-27",
    'up: "[[_HARNESS-SYSTEM]]"',
    "---",
    "# AI 사용 통계 (SSoT)",
    "",
    `> <!-- aggregator 자동생성 --> 마지막 집계: ${now} UTC`,
    "",
    `## 전체 누적`,
    `- 총 세션: **${rows.length}**`,
    `- 총 입력 토큰: **${totalIn.toLocaleString()}**`,
    `- 총 출력 토큰: **${totalOut.toLocaleString()}**`,
    "",
    "## 엔진별",
    "| 엔진 | 세션 수 | 입력 토큰 | 출력 토큰 |",
    "|------|--------|---------|---------|",
    engineRows || "| (데이터 없음) | — | — | — |",
    "",
    "## 분야별",
    "| 분야 | 세션 수 | 입력 토큰 | 출력 토큰 |",
    "|------|--------|---------|---------|",
    domainRows || "| (데이터 없음) | — | — | — |",
    "",
    "---",
    "[[ai-session-intake.README]] · [[_telemetry-log]] · [[ax-insights]]",
  ].join("\n");

  fs.mkdirSync(path.dirname(PATHS.usageStats), { recursive: true });
  atomicWriteFile(PATHS.usageStats, content + "\n");
}

async function updateGitContribStats() {
  try {
    const gitContribPath = path.join(BASE, "automation/git-contribution.mjs");
    const mod = await import("file://" + gitContribPath);
    const update = mod.default || mod.updateGitContrib;
    if (typeof update === "function") update();
  } catch {
    // Git 기반 기여 집계 실패는 텔레메트리 집계를 막지 않는다.
  }
}

// ── 메인 ─────────────────────────────────────────────────────────────────
async function main() {
  try {
    const csv = fs.readFileSync(PATHS.intake, "utf8");
    const rows = dedupeSessionRows(parseCSV(csv).filter(r => r.ts && !r.ts.startsWith("_CORRECTION")));

    const added = updateTelemetryLog(rows);
    updateAgentRegistry(rows);
    updateContribStats(rows);
    await updateGitContribStats();
    rebuildUsageStats(rows);

    process.stdout.write(
      `[telemetry-aggregator] 완료 — 총 ${rows.length}행 처리, 텔레메트리 ${added}행 신규 추가\n`
    );
  } catch (e) {
    process.stderr.write(`[telemetry-aggregator] 오류: ${e.message}\n`);
  }
}

await main();
