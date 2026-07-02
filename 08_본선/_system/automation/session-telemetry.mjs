#!/usr/bin/env node
// 본선 운영 하네스 — 세션 텔레메트리 자동 기록 (Claude Code Stop 훅)
// 사용자가 아무것도 안 해도, 세션 종료 시 트랜스크립트를 파싱해
// 사용 툴·토큰(in/out)·소요시간을 telemetry 로그에 1행 append 한다.
//
// 와이어링: README.md 참조 (settings.json hooks.Stop 에 등록). 활성화 전 1회 검증 권장.
// 표준 라이브러리만 사용. Stop 훅 payload(JSON)를 stdin 으로 받는다: { transcript_path, cwd, session_id, ... }

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

function readStdin() {
  try { return fs.readFileSync(0, "utf8"); } catch { return ""; }
}

function main() {
  let payload = {};
  try { payload = JSON.parse(readStdin() || "{}"); } catch { /* noop */ }

  const transcriptPath = payload.transcript_path;
  // ⚠️ 반드시 프로젝트 루트에 앵커. payload.cwd(세션/서브에이전트의 작업 디렉터리)를 쓰면
  // 하위 폴더에서 실행된 세션이 그 안에 중첩 `08_본선/_system/telemetry/` 트리를 만들어
  // 텔레메트리가 여러 곳으로 쪼개진다(협업 가시성 붕괴). CLAUDE_PROJECT_DIR가 정본 루트.
  const projectDir = process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();
  const logPath    = path.join(projectDir, "08_본선/_system/telemetry/_telemetry-log.md");
  const intakePath = path.join(projectDir, "08_본선/_system/telemetry/ai-session-intake.csv");
  const sessionId = payload.session_id || (transcriptPath ? path.basename(transcriptPath, path.extname(transcriptPath)) : "");
  const now = isoNow();

  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    appendRow(logPath, now, "세션종료", "—", "0/0", "—", "(트랜스크립트 없음)");
    appendIntake(intakePath, {
      ts: now + "Z", engine: "claude", agent: "direct", member_slot: "AI",
      domain: "ops", task: "(트랜스크립트 없음)", tokens_in: 0, tokens_out: 0,
      duration: "—", tools: "—", exact_or_estimate: "estimate", prompt_ref: "—", session_id: sessionId,
    });
    return;
  }

  const lines = fs.readFileSync(transcriptPath, "utf8").split("\n").filter(Boolean);
  let inTok = 0, outTok = 0, cacheRead = 0;
  const tools = {};
  const codexDelegations = {};   // subagent_type → 횟수 (Claude→Codex 위임 캡처)
  let firstTs = null, lastTs = null;

  for (const line of lines) {
    let ev; try { ev = JSON.parse(line); } catch { continue; }
    const ts = ev.timestamp || ev.ts;
    if (ts) { firstTs = firstTs || ts; lastTs = ts; }
    const msg = ev.message || ev;
    const usage = msg && msg.usage;
    if (usage) {
      // ponytail: cache_read 는 tokens_in 에서 제외 — 매 턴 전체 문맥을 재독하므로
      // 합산하면 세션당 수억으로 폭증해 통계가 무의미해진다. fresh 입력(새 input + 캐시 생성)만 집계하고,
      // cache_read 는 별도로 모아 비고에 표기(비용 가중치 0.1x, 참고용).
      inTok += (usage.input_tokens || 0) + (usage.cache_creation_input_tokens || 0);
      cacheRead += usage.cache_read_input_tokens || 0;
      outTok += usage.output_tokens || 0;
    }
    const content = (msg && msg.content) || [];
    if (Array.isArray(content)) {
      for (const block of content) {
        if (block && block.type === "tool_use" && block.name) {
          tools[block.name] = (tools[block.name] || 0) + 1;
          // Claude 에서 Codex 실행(서브에이전트 위임) 캡처. Agent tool_use 의 subagent_type 으로 식별.
          // Codex 자체 토큰은 Claude 트랜스크립트에 없으므로(매칭 취약) 위임 사실·횟수만 별도 행으로 기록.
          const sub = block.input && block.input.subagent_type;
          if (block.name === "Agent" && sub && String(sub).toLowerCase().includes("codex")) {
            codexDelegations[sub] = (codexDelegations[sub] || 0) + 1;
          }
        }
      }
    }
  }

  const toolStr = Object.keys(tools).length
    ? Object.entries(tools).sort((a, b) => b[1] - a[1]).map(([n, c]) => `${n}×${c}`).join(", ")
    : "—";
  const dur = firstTs && lastTs ? humanDur(new Date(lastTs) - new Date(firstTs)) : "—";

  const cacheNote = cacheRead ? `(자동 기록 · cache_read ${cacheRead})` : "(자동 기록)";

  // 1. _telemetry-log.md 에 append (기존 동작 유지)
  appendRow(logPath, now, "세션종료", toolStr, `${inTok}/${outTok}`, dur, cacheNote);

  // 2. ai-session-intake.csv 에 1행 append (신규)
  appendIntake(intakePath, {
    ts: now + "Z", engine: "claude", agent: "direct", member_slot: "AI",
    domain: "ops", task: "(자동 기록)", tokens_in: inTok, tokens_out: outTok,
    duration: dur, tools: toolStr, exact_or_estimate: "estimate", prompt_ref: "—", session_id: sessionId,
  });

  // 3. Claude→Codex 위임이 있었으면 engine=codex 별도 행으로 캡처(세션당 1행, #codex 키로 upsert).
  //    토큰은 Claude 트랜스크립트에 없어 '—'(추정). 교차엔진 사용을 통계에 가시화하는 목적.
  const codexCount = Object.values(codexDelegations).reduce((a, b) => a + b, 0);
  if (codexCount > 0) {
    const subTypes = Object.entries(codexDelegations)
      .map(([s, c]) => `${s}×${c}`).join(", ");
    appendIntake(intakePath, {
      ts: now + "Z", engine: "codex", agent: "via-claude", member_slot: "AI",
      domain: "ops", task: `(Claude→Codex 위임 ×${codexCount})`, tokens_in: "—", tokens_out: "—",
      duration: "—", tools: subTypes, exact_or_estimate: "estimate", prompt_ref: "—",
      session_id: sessionId + "#codex",
    });
  }

  // 4. aggregator 자동 호출 — 4개 통계파일을 매 세션 종료 시 무자각 갱신(유지보수 0).
  //    ponytail: 별도 수동 실행 제거. 실패는 조용히 무시(훅은 세션을 막지 않는다).
  runAggregator(projectDir);
}

function runAggregator(cwd) {
  try {
    const agg = path.join(cwd, "08_본선/_system/skills/telemetry-aggregator/aggregate.mjs");
    if (fs.existsSync(agg)) {
      execFileSync(process.execPath, [agg], { cwd, stdio: "ignore", timeout: 20000 });
    }
  } catch { /* noop — 세션 차단 금지 */ }
}

function appendRow(logPath, date, trigger, tools, tokens, dur, note) {
  try {
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    if (!fs.existsSync(logPath)) {
      fs.writeFileSync(logPath, telemetryHeader());
    }
    const row = `| ${date} | ${trigger} | ${tools} | ${tokens} | ${dur} | — | (자동) | ${note} |\n`;
    fs.appendFileSync(logPath, row);
  } catch (e) {
    // 훅은 절대 세션을 막지 않는다: 실패는 조용히 무시
  }
}

function appendIntake(intakePath, row) {
  // ai-session-intake.csv 에 1행 upsert. 컬럼 순서:
  // ts,engine,agent,member_slot,domain,task,tokens_in,tokens_out,duration,tools,exact_or_estimate,prompt_ref,session_id
  try {
    fs.mkdirSync(path.dirname(intakePath), { recursive: true });
    if (!fs.existsSync(intakePath)) {
      fs.writeFileSync(intakePath, intakeHeader() + "\n");
    }
    const csvVal = (v) => {
      const s = String(v ?? "—");
      return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const line = [
      csvVal(row.ts), csvVal(row.engine), csvVal(row.agent), csvVal(row.member_slot),
      csvVal(row.domain), csvVal(row.task), csvVal(row.tokens_in), csvVal(row.tokens_out),
      csvVal(row.duration), csvVal(row.tools), csvVal(row.exact_or_estimate), csvVal(row.prompt_ref),
      csvVal(row.session_id || ""),
    ].join(",");

    const text = fs.readFileSync(intakePath, "utf8");
    const lines = text.split(/\r?\n/).filter((line, i, arr) => line || i < arr.length - 1);
    if (!lines.length) lines.push(intakeHeader());

    const headers = splitCSVRow(lines[0]);
    let sessionIdx = headers.indexOf("session_id");
    if (sessionIdx === -1) {
      lines[0] = lines[0] + ",session_id";
      for (let i = 1; i < lines.length; i++) lines[i] = lines[i] + ",";
      sessionIdx = headers.length;
    }

    const sessionId = String(row.session_id || "");
    if (!sessionId || sessionId === "manual") {
      lines.push(line);
      atomicWriteIntake(intakePath, lines.join("\n") + "\n");
      return;
    }

    let replaced = false;
    const next = [lines[0]];
    for (const existing of lines.slice(1)) {
      const vals = splitCSVRow(existing);
      if ((vals[sessionIdx] || "") === sessionId) {
        if (!replaced) next.push(line);
        replaced = true;
      } else {
        next.push(existing);
      }
    }
    if (!replaced) next.push(line);
    atomicWriteIntake(intakePath, next.join("\n") + "\n");
  } catch (e) {
    // 실패는 조용히 무시 — 세션 차단 금지
  }
}

function atomicWriteIntake(intakePath, content) {
  const tmp = intakePath + ".tmp";
  fs.writeFileSync(tmp, content);
  if (fs.existsSync(intakePath)) {
    fs.copyFileSync(intakePath, intakePath + ".bak");
  }
  fs.renameSync(tmp, intakePath);
}

function splitCSVRow(row) {
  const result = [];
  let cur = "", inQ = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQ && row[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === "," && !inQ) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function intakeHeader() {
  return "ts,engine,agent,member_slot,domain,task,tokens_in,tokens_out,duration,tools,exact_or_estimate,prompt_ref,session_id";
}

function telemetryHeader() {
  return [
    "---",
    "tags: [area/system, type/log, status/active]",
    "date: 2026-06-27",
    'up: "[[_HARNESS-SYSTEM]]"',
    "---",
    "# 텔레메트리 로그 (Append-only · 자동 기록)",
    "",
    "> ⚠️ 대외비. 1행 = 1세션/체크포인트. Stop 훅이 자동 append. 수동 추가도 가능.",
    "",
    "| 날짜(UTC) | 트리거 | 사용 툴(횟수) | 토큰(in/out) | 소요 | 작업/산출물 | 투입 | 비고 |",
    "|------|--------|--------------|-------------|------|------------|------|------|",
    "",
  ].join("\n");
}

function isoNow() { return new Date().toISOString().replace("T", " ").slice(0, 16); }
function humanDur(ms) {
  if (!ms || ms < 0) return "—";
  const m = Math.round(ms / 60000);
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60}m`;
}

main();
