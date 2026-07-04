#!/usr/bin/env node
/**
 * harness-sync/sync.mjs
 * 자동 단계(2·3·4·5·6)를 순서대로 실행하는 동기화 오케스트레이터.
 * 표준 라이브러리만 사용. 외부 전송 없음.
 *
 * Usage:
 *   node sync.mjs            # 실제 실행
 *   node sync.mjs --dry-run  # 점검만 (파일 변경 없음)
 */

import { execFileSync } from 'node:child_process'
import { existsSync, realpathSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DRY_RUN = process.argv.includes('--dry-run')
const START_TIME = Date.now()

// 프로젝트 루트: harness-sync/ → skills/ → _system/ → 08_본선/ → project root
const SYSTEM_DIR = resolve(__dirname, '..', '..')
const SKILLS_DIR = resolve(SYSTEM_DIR, 'skills')

// 각 단계별 스크립트 경로
// 맵 자동화 순서: (a) 레지스트리 재생성 → (b) 텔레메트리 집계 → (c) MOC/frontmatter --apply → (d) 시각화 사이클
const STEPS = [
  {
    id: 2,
    name: '플러그인·MCP 레지스트리 재생성',
    script: resolve(SKILLS_DIR, 'harness-sync', 'plugin-inventory.mjs'),
    args: [],
    // [자동] settings.json → registry-plugins.md / registry-mcp.md 재생성
  },
  {
    id: 3,
    name: '텔레메트리 집계',
    script: resolve(SKILLS_DIR, 'telemetry-aggregator', 'aggregate.mjs'),
    args: [],
    // [자동] ai-session-intake.csv → _telemetry-log / _contribution-stats / ai-usage-stats 갱신
  },
  {
    id: 4,
    name: 'MOC/frontmatter 정합성 보정',
    script: resolve(SKILLS_DIR, 'canon-moc-sync', 'sync.mjs'),
    // [자동] --apply: 섹션 MOC 위키링크 추가 + frontmatter 보정
    // [반자동] 어느 섹션에 넣을지 판단(경로 기반 자동), 설명 문구는 Claude가 작성
    args: DRY_RUN ? ['--dry-run'] : ['--apply'],
  },
  {
    id: 5,
    name: '시각화 사이클 재생성·검증',
    script: resolve(SKILLS_DIR, 'visualization-cycle', 'scripts', 'run.mjs'),
    args: [],
    // [자동] VISUALIZATION-PLAN → viz-generator → Excalidraw JSON 검증
  },
  {
    id: 6,
    name: '거버넌스 스캔 (PII)',
    script: resolve(SYSTEM_DIR, 'automation', 'pii-scan.mjs'),
    args: [],
    // [자동] 대외비·PII 위반 탐지 (경고만, 블로킹 없음) — Stop 훅과 동일 스크립트 재사용(pii-governance-validator/validate.mjs는 미구현)
  },
]

/** 단계 실행 결과 */
const results = []

function runStep(step) {
  const { id, name, script, args } = step

  if (!existsSync(script)) {
    return { id, name, status: 'SKIP', note: `스크립트 없음: ${script}` }
  }

  if (DRY_RUN) {
    return { id, name, status: 'DRY', note: '(dry-run: 실행하지 않음)' }
  }

  try {
    const out = execFileSync(process.execPath, [script, ...args], {
      cwd: realpathSync(resolve(SYSTEM_DIR, '..', '..')), // project root
      encoding: 'utf8',
      timeout: 60_000,
    })
    const summary = extractSummary(out)
    return { id, name, status: 'OK', note: summary }
  } catch (err) {
    // 실패해도 다음 단계 진행 (non-blocking)
    const msg = err.stdout || err.message || String(err)
    return { id, name, status: 'WARN', note: msg.trim().split('\n').at(-1) ?? '오류' }
  }
}

/**
 * 스크립트 stdout에서 마지막 요약 줄 추출.
 * 없으면 마지막 비어있지 않은 줄 반환.
 */
function extractSummary(output) {
  const lines = output.trim().split('\n').filter(Boolean)
  // "[xxx] ..." 패턴 우선
  const tagged = lines.filter(l => /^\[.+\]/.test(l))
  if (tagged.length) return tagged.at(-1)
  return lines.at(-1) ?? '완료'
}

// ─── 실행 ───────────────────────────────────────────────

console.log(`\n[harness-sync] 동기화 시작${DRY_RUN ? ' (dry-run)' : ''} — ${new Date().toISOString().slice(0, 10)}\n`)

for (const step of STEPS) {
  const result = runStep(step)
  results.push(result)

  const icon = result.status === 'OK' ? '✓' : result.status === 'SKIP' ? '↷' : result.status === 'DRY' ? '○' : '⚠'
  console.log(`  ${icon} ${result.id}. ${result.name}`)
  if (result.note) console.log(`       ${result.note}`)
}

const elapsed = ((Date.now() - START_TIME) / 1000).toFixed(1)
const failed = results.filter(r => r.status === 'WARN')

console.log(`\n[harness-sync] 자동 단계 완료 (${elapsed}s)`)
if (failed.length) {
  console.log(`  ⚠ 경고 ${failed.length}건: ${failed.map(r => r.name).join(', ')}`)
}
console.log(`  에이전트 판단 단계(1·7·8)는 Claude가 별도 수행.`)
if (DRY_RUN) {
  console.log(`  [dry-run] 실제 파일은 변경되지 않았습니다.`)
}

process.exit(failed.length > 0 ? 1 : 0)
