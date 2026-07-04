#!/usr/bin/env node
/**
 * log-toc/generate.mjs
 * 04_증빙/01_핵심로그의 append-only 로그(session-log·decision-log·프롬프트-로그)에
 * 자동 목차(TOC) 블록을 삽입/갱신한다. 표준 라이브러리만 사용, 외부 전송 없음.
 *
 * Usage:
 *   node generate.mjs            # 실제 적용
 *   node generate.mjs --dry-run  # 점검만 (파일 변경 없음)
 */

import fs from 'node:fs'
import path from 'node:path'

const BASE_DIR = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
const DRY_RUN = process.argv.includes('--dry-run')

const TARGETS = [
  '08_본선/04_증빙/01_핵심로그/session-log.md',
  '08_본선/04_증빙/01_핵심로그/decision-log.md',
  '08_본선/04_증빙/01_핵심로그/프롬프트-로그.md',
]

const START_MARK = '<!-- TOC:AUTO -->'
const END_MARK = '<!-- /TOC:AUTO -->'
const HEADING_RE = /^(#{2,3})\s+(.*)$/

/** frontmatter(--- ~ ---) + 첫 H1(# ) + 안내 인용문(>) 다음, 첫 헤딩 직전 위치를 찾는다 */
function findInsertPoint(lines) {
  let i = 0
  if (lines[0]?.trim() === '---') {
    i = 1
    while (i < lines.length && lines[i].trim() !== '---') i++
    i++
  }
  while (i < lines.length) {
    const t = lines[i].trim()
    if (t === '' || t.startsWith('# ') || t.startsWith('>')) {
      i++
      continue
    }
    break
  }
  return i
}

/** 기존 TOC 블록 제거 (있으면) */
function stripExistingToc(lines) {
  const startIdx = lines.findIndex(l => l.trim() === START_MARK)
  const endIdx = lines.findIndex(l => l.trim() === END_MARK)
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return lines
  const before = lines.slice(0, startIdx)
  const after = lines.slice(endIdx + 1)
  // 마커 앞뒤에 남는 중복 빈 줄 1개는 허용, 나머지 정리
  while (before.length && before.at(-1).trim() === '') before.pop()
  while (after.length && after[0].trim() === '') after.shift()
  return [...before, ...after]
}

function processFile(relPath) {
  const abs = path.join(BASE_DIR, relPath)
  if (!fs.existsSync(abs)) return { file: relPath, status: 'MISSING' }

  const original = fs.readFileSync(abs, 'utf8')
  const bodyLines = stripExistingToc(original.split('\n'))
  const insertAt = findInsertPoint(bodyLines)

  const headings = []
  bodyLines.forEach((line, idx) => {
    if (idx < insertAt) return
    const m = line.match(HEADING_RE)
    if (m) headings.push({ level: m[1].length, text: m[2].trim() })
  })

  if (!headings.length) return { file: relPath, status: 'NO-HEADINGS' }

  const tocBody = ['## 목차 (자동생성 — 직접 편집 금지, `log-toc`가 재실행 시 덮어씀)', '']
  for (const h of headings) {
    const indent = h.level === 2 ? '' : '  '
    tocBody.push(`${indent}- [[#${h.text}]]`)
  }
  const needsLeadingBlank = insertAt > 0 && bodyLines[insertAt - 1].trim() !== ''
  const tocBlock = [...(needsLeadingBlank ? [''] : []), START_MARK, ...tocBody, '', END_MARK, '']

  const finalLines = [...bodyLines.slice(0, insertAt), ...tocBlock, ...bodyLines.slice(insertAt)]
  const finalText = finalLines.join('\n')

  const changed = finalText !== original
  if (changed && !DRY_RUN) fs.writeFileSync(abs, finalText, 'utf8')

  return { file: relPath, status: changed ? 'UPDATED' : 'UNCHANGED', count: headings.length }
}

const results = TARGETS.map(processFile)

console.log(`\n[log-toc] ${DRY_RUN ? '점검(dry-run)' : '갱신'} — ${new Date().toISOString().slice(0, 10)}\n`)
for (const r of results) {
  const icon = r.status === 'UPDATED' ? '✓' : r.status === 'UNCHANGED' ? '○' : '⚠'
  console.log(`  ${icon} ${r.file} — ${r.status}${r.count ? ` (항목 ${r.count}개)` : ''}`)
}
if (DRY_RUN) console.log('\n  [dry-run] 실제 파일은 변경되지 않았습니다.')

process.exit(0)
