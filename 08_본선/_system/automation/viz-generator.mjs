#!/usr/bin/env node
// ponytail: stdlib only, no deps. Re-run whenever source data changes.
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dir, '..', '..')
const VIZ = join(__dir, '..', 'visualizations')

// ── Element builders ──────────────────────────────────────────────────────────
let _id = 0
const uid = () => `viz-${++_id}`
const seed = (i) => 1000 + i * 7
const vnonce = (i) => 2000 + i * 13

const base = (i, extra = {}) => ({
  id: uid(),
  angle: 0,
  strokeColor: '#1e293b',
  backgroundColor: 'transparent',
  fillStyle: 'solid',
  strokeWidth: 1,
  strokeStyle: 'solid',
  roughness: 1,
  opacity: 100,
  groupIds: [],
  frameId: null,
  roundness: null,
  seed: seed(i),
  version: 1,
  versionNonce: vnonce(i),
  isDeleted: false,
  boundElements: null,
  updated: 1,
  link: null,
  locked: false,
  ...extra,
})

const rect = (i, x, y, w, h, bg = '#e0f2fe', stroke = '#1e293b') => ({
  ...base(i),
  type: 'rectangle',
  x, y, width: w, height: h,
  backgroundColor: bg,
  strokeColor: stroke,
})

const text = (i, x, y, w, h, t, fontSize = 14, align = 'center') => ({
  ...base(i),
  type: 'text',
  x, y, width: w, height: h,
  text: t,
  fontSize,
  fontFamily: 1,
  textAlign: align,
  verticalAlign: 'top',
  baseline: Math.round(fontSize * 1.25),
  containerId: null,
  originalText: t,
  lineHeight: 1.25,
})

const arrow = (i, x, y, dx, dy) => ({
  ...base(i),
  type: 'arrow',
  x, y, width: Math.abs(dx), height: Math.abs(dy),
  points: [[0, 0], [dx, dy]],
  startBinding: null,
  endBinding: null,
  startArrowhead: null,
  endArrowhead: 'arrow',
})

const save = (filename, elements) => {
  const out = {
    type: 'excalidraw',
    version: 2,
    source: 'https://excalidraw.com',
    elements,
    appState: { viewBackgroundColor: '#ffffff', gridSize: null },
    files: {},
  }
  writeFileSync(join(VIZ, filename), JSON.stringify(out, null, 2), 'utf8')
  console.log(`✓ ${filename}: ${elements.length} elements`)
}

// ── 1. TIMELINE ───────────────────────────────────────────────────────────────
// Parse S/R headings from 프롬프트-로그.md
const parseTimeline = () => {
  const src = readFileSync(
    join(ROOT, '04_증빙/01_핵심로그/프롬프트-로그.md'), 'utf8')
  const re = /###\s+(S\d+|R\d+)\s+·\s+([\d\-]+ [\d:]+ KST)\s+·\s+(.+)/g
  const milestones = []
  let m
  while ((m = re.exec(src)) !== null) {
    const [, id, ts, title] = m
    // parse date from ts like "2026-06-26 20:19 KST"
    const datePart = ts.split(' ')[0]
    milestones.push({ id, date: datePart, title: title.trim().slice(0, 40) })
  }
  return milestones
}

const buildTimeline = () => {
  _id = 0
  const milestones = parseTimeline()
  const elements = []

  // Header
  elements.push(text(0, 20, 10, 800, 30, '본선 운영 타임라인 (S/R 마일스톤)', 20, 'left'))

  // Date axis labels (unique dates)
  const dates = [...new Set(milestones.map(m => m.date))].sort()
  const dateX = {}
  const X_START = 60, X_GAP = 200
  dates.forEach((d, i) => {
    dateX[d] = X_START + i * X_GAP
    elements.push(text(100 + i, dateX[d], 50, 140, 20, d, 11, 'center'))
    // tick
    elements.push({ ...base(200 + i), type: 'line', x: dateX[d] + 70, y: 68, width: 0, height: 10,
      points: [[0,0],[0,10]], startBinding: null, endBinding: null, startArrowhead: null, endArrowhead: null })
  })

  // Horizontal axis
  const axisLen = (dates.length - 1) * X_GAP + 140
  elements.push({ ...base(300), type: 'line', x: X_START, y: 78, width: axisLen, height: 0,
    points: [[0,0],[axisLen,0]], startBinding: null, endBinding: null, startArrowhead: null, endArrowhead: 'arrow' })

  // Milestones — S lane y=120, R lane y=220
  const laneY = { S: 120, R: 220 }
  elements.push(text(400, 5, laneY.S + 10, 50, 20, '[S]', 12, 'left'))
  elements.push(text(401, 5, laneY.R + 10, 50, 20, '[R]', 12, 'left'))

  // lane bg bars
  elements.push(rect(402, X_START - 10, laneY.S - 5, axisLen + 20, 70, '#f0f9ff', '#bae6fd'))
  elements.push(rect(403, X_START - 10, laneY.R - 5, axisLen + 20, 70, '#fdf4ff', '#e9d5ff'))

  const sCount = {}, rCount = {}
  milestones.forEach((ms, idx) => {
    const branch = ms.id[0]
    const x = (dateX[ms.date] ?? X_START) + (branch === 'S'
      ? (sCount[ms.date] = (sCount[ms.date] ?? 0) + 1) * 20 - 20
      : (rCount[ms.date] = (rCount[ms.date] ?? 0) + 1) * 20 - 20)
    const y = laneY[branch] ?? laneY.S
    const bg = branch === 'S' ? '#bfdbfe' : '#ddd6fe'
    elements.push(rect(500 + idx, x, y, 110, 50, bg))
    elements.push(text(600 + idx, x + 2, y + 2, 106, 16, ms.id, 12, 'center'))
    elements.push(text(700 + idx, x + 2, y + 18, 106, 28, ms.title, 9, 'left'))
  })

  return elements
}

// ── 2. CONTRIBUTION ───────────────────────────────────────────────────────────
const buildContribution = () => {
  _id = 0
  const src = readFileSync(
    join(__dir, '..', 'agents/_agent-registry.md'), 'utf8')

  // Parse table: | **Name** | role | model | tokens | ...
  const rows = []
  const tableRe = /\|\s+\*\*(.*?)\*\*\s+\|[^|]+\|[^|]+\|\s+([\d,—\-~]+)\s+\|/g
  let m
  while ((m = tableRe.exec(src)) !== null) {
    const name = m[1].trim()
    const rawTok = m[2].replace(/[,~—\s]/g, '')
    const tokens = parseInt(rawTok) || 0
    rows.push({ name, tokens })
  }

  const elements = []
  elements.push(text(0, 20, 10, 800, 30, '에이전트 기여도 (누적 토큰)', 20, 'left'))

  const total = rows.reduce((s, r) => s + r.tokens, 0)
  elements.push(text(1, 20, 40, 600, 20, `총 토큰: ${total.toLocaleString()}`, 13, 'left'))

  const maxTok = Math.max(...rows.map(r => r.tokens), 1)
  const BAR_MAX = 500, ROW_H = 36, X_LABEL = 20, X_BAR = 200, Y_START = 75

  rows.forEach((row, i) => {
    const y = Y_START + i * ROW_H
    const barW = row.tokens > 0 ? Math.round((row.tokens / maxTok) * BAR_MAX) : 10
    const bg = row.tokens > 0 ? '#6ee7b7' : '#e2e8f0'
    elements.push(text(100 + i, X_LABEL, y + 8, 175, 20, row.name, 12, 'left'))
    elements.push(rect(200 + i, X_BAR, y + 2, barW, 26, bg, '#059669'))
    const label = row.tokens > 0 ? row.tokens.toLocaleString() : '—'
    elements.push(text(300 + i, X_BAR + barW + 6, y + 8, 120, 20, label, 11, 'left'))
  })

  // Total bar reference line
  elements.push({ ...base(999), type: 'line',
    x: X_BAR, y: Y_START - 5, width: 0, height: rows.length * ROW_H + 5,
    points: [[0,0],[0, rows.length * ROW_H + 5]],
    startBinding: null, endBinding: null, startArrowhead: null, endArrowhead: null,
    strokeColor: '#94a3b8', strokeStyle: 'dashed' })

  return elements
}

// ── 3. TOKENS-TIME ────────────────────────────────────────────────────────────
const buildTokensTime = () => {
  _id = 0
  const csv = readFileSync(
    join(__dir, '..', 'telemetry/ai-session-intake.csv'), 'utf8')
  const lines = csv.trim().split('\n').slice(1) // skip header

  const sessions = lines.map((line, i) => {
    const cols = line.split(',')
    const ts = cols[0]?.trim() ?? ''
    const agent = cols[2]?.trim() ?? `S${i+1}`
    const rawIn = cols[6]?.trim().replace(/[~,\s]/g, '') ?? '0'
    const rawOut = cols[7]?.trim().replace(/[~,\s]/g, '') ?? '0'
    const tokIn = parseInt(rawIn) || 0
    const tokOut = parseInt(rawOut) || 0
    const label = ts.slice(0, 10) + ' ' + agent
    return { label, tokIn, tokOut, total: tokIn + tokOut }
  }).filter(s => s.total > 0 || s.tokIn + s.tokOut === 0)

  const elements = []
  elements.push(text(0, 20, 10, 900, 30, '세션별 토큰 사용량 (입력/출력)', 20, 'left'))

  const maxTot = Math.max(...sessions.map(s => s.total), 1)
  const BAR_MAX_H = 200, COL_W = 120, X_START = 60, Y_BASE = 280

  // Y axis label
  elements.push(text(1, 5, Y_BASE - BAR_MAX_H - 10, 50, 20,
    `${Math.round(maxTot/1000)}K`, 10, 'left'))
  elements.push(text(2, 5, Y_BASE - BAR_MAX_H / 2, 50, 20,
    `${Math.round(maxTot/2000)}K`, 10, 'left'))
  elements.push(text(3, 5, Y_BASE - 2, 50, 20, '0', 10, 'left'))

  // Y axis line
  elements.push({ ...base(10), type: 'line',
    x: X_START - 5, y: Y_BASE - BAR_MAX_H - 10, width: 0, height: BAR_MAX_H + 10,
    points: [[0,0],[0, BAR_MAX_H + 10]],
    startBinding: null, endBinding: null, startArrowhead: null, endArrowhead: null })

  sessions.forEach((s, i) => {
    const x = X_START + i * COL_W
    const hIn = s.total > 0 ? Math.round((s.tokIn / maxTot) * BAR_MAX_H) : 4
    const hOut = s.total > 0 ? Math.round((s.tokOut / maxTot) * BAR_MAX_H) : 4

    // stacked: input (bottom), output (top)
    elements.push(rect(100 + i * 2, x + 10, Y_BASE - hIn, 44, hIn, '#93c5fd', '#3b82f6'))
    elements.push(rect(101 + i * 2, x + 55, Y_BASE - hOut, 44, hOut, '#fca5a5', '#ef4444'))

    // x label
    elements.push(text(200 + i, x, Y_BASE + 4, COL_W - 5, 30, s.label, 9, 'center'))
    // total label
    if (s.total > 0) {
      elements.push(text(300 + i, x + 5, Y_BASE - Math.max(hIn, hOut) - 16, COL_W - 10, 16,
        `${(s.total/1000).toFixed(0)}K`, 9, 'center'))
    }
  })

  // Legend
  elements.push(rect(900, X_START, Y_BASE + 50, 16, 16, '#93c5fd', '#3b82f6'))
  elements.push(text(901, X_START + 20, Y_BASE + 50, 80, 16, '입력 토큰', 11, 'left'))
  elements.push(rect(902, X_START + 100, Y_BASE + 50, 16, 16, '#fca5a5', '#ef4444'))
  elements.push(text(903, X_START + 120, Y_BASE + 50, 80, 16, '출력 토큰', 11, 'left'))

  // Baseline
  elements.push({ ...base(950), type: 'line',
    x: X_START - 5, y: Y_BASE, width: sessions.length * COL_W + 20, height: 0,
    points: [[0,0],[sessions.length * COL_W + 20, 0]],
    startBinding: null, endBinding: null, startArrowhead: null, endArrowhead: null })

  return elements
}

// ── 4. AGENT-FLOW ─────────────────────────────────────────────────────────────
const buildAgentFlow = () => {
  _id = 0
  const elements = []

  // Operating contract: Case → AgentRun → Agent → Skill → Evidence → Approval → Audit
  const contract = ['Case', 'AgentRun', 'Agent', 'Skill', 'Evidence', 'Approval', 'Audit']
  const CONTRACT_Y = 20
  const CONTRACT_X = 40
  const C_W = 100, C_H = 40, C_GAP = 20
  const contractColors = ['#fde68a','#a7f3d0','#bfdbfe','#ddd6fe','#fed7aa','#fca5a5','#86efac']

  elements.push(text(0, CONTRACT_X, CONTRACT_Y - 22, 800, 20, '운영 계약 흐름 (Case → Audit)', 15, 'left'))

  contract.forEach((label, i) => {
    const x = CONTRACT_X + i * (C_W + C_GAP)
    elements.push(rect(10 + i, x, CONTRACT_Y, C_W, C_H, contractColors[i]))
    elements.push(text(20 + i, x, CONTRACT_Y + 11, C_W, 18, label, 13, 'center'))
    if (i < contract.length - 1) {
      elements.push(arrow(30 + i, x + C_W, CONTRACT_Y + C_H / 2, C_GAP, 0))
    }
  })

  // Separator
  const SEP_Y = CONTRACT_Y + C_H + 20
  elements.push({ ...base(99), type: 'line',
    x: 20, y: SEP_Y, width: 860, height: 0,
    points: [[0,0],[860,0]],
    startBinding: null, endBinding: null, startArrowhead: null, endArrowhead: null,
    strokeColor: '#94a3b8', strokeStyle: 'dashed' })

  elements.push(text(100, 20, SEP_Y + 8, 400, 20, '멀티에이전트 협업 구조 (Orchestrator → 9 서브에이전트)', 14, 'left'))

  // Orchestrator node
  const ORC_X = 360, ORC_Y = SEP_Y + 40
  elements.push(rect(200, ORC_X, ORC_Y, 160, 50, '#fef08a', '#ca8a04'))
  elements.push(text(201, ORC_X, ORC_Y + 8, 160, 18, 'Orchestrator', 14, 'center'))
  elements.push(text(202, ORC_X, ORC_Y + 28, 160, 16, 'Claude Opus 4.5', 10, 'center'))

  // 9 sub-agents in 3 groups
  const groups = [
    { label: '리서치 계열', color: '#e0f2fe', agents: [
      { name: '대회개요탐색', model: 'Sonnet', tok: '53,087' },
      { name: '원천인벤토리', model: 'Haiku', tok: '25,518' },
      { name: 'paperclip분석', model: 'Sonnet', tok: '74,125' },
    ]},
    { label: '문서 계열', color: '#f0fdf4', agents: [
      { name: '대회정본작성', model: 'Haiku', tok: '64,639' },
      { name: '발표덱아웃라인', model: 'Sonnet', tok: '71,170' },
      { name: '시연시나리오', model: 'Sonnet', tok: '82,912' },
    ]},
    { label: '개발·운영 계열', color: '#fdf4ff', agents: [
      { name: 'MVP점검', model: 'Sonnet', tok: '155,583' },
      { name: '구조청사진', model: 'Sonnet', tok: '71,470' },
      { name: '스캐폴드빌더', model: 'Sonnet', tok: '78,428' },
    ]},
  ]

  const NODE_W = 140, NODE_H = 52, NODE_GAP_X = 20, NODE_GAP_Y = 18
  const GROUP_GAP = 30
  let gIdx = 0
  const ORC_CENTER_X = ORC_X + 80
  const ORC_BOT_Y = ORC_Y + 50

  let totalGroupW = 0
  groups.forEach(g => { totalGroupW += g.agents.length * (NODE_W + NODE_GAP_X) - NODE_GAP_X + GROUP_GAP })
  totalGroupW -= GROUP_GAP

  let curX = ORC_CENTER_X - totalGroupW / 2
  const SUB_Y = ORC_Y + 110

  groups.forEach((grp, gi) => {
    const grpW = grp.agents.length * (NODE_W + NODE_GAP_X) - NODE_GAP_X
    const grpCenterX = curX + grpW / 2

    // Group label
    elements.push(rect(300 + gi * 100, curX - 5, SUB_Y - 22, grpW + 10, 18, grp.color, '#94a3b8'))
    elements.push(text(301 + gi * 100, curX - 5, SUB_Y - 22, grpW + 10, 18, grp.label, 10, 'center'))

    // Arrow from Orchestrator to group center
    elements.push(arrow(400 + gi, ORC_CENTER_X, ORC_BOT_Y,
      grpCenterX - ORC_CENTER_X, SUB_Y - ORC_BOT_Y - 4))

    grp.agents.forEach((ag, ai) => {
      const x = curX + ai * (NODE_W + NODE_GAP_X)
      const y = SUB_Y
      elements.push(rect(500 + gIdx * 10, x, y, NODE_W, NODE_H, grp.color, '#64748b'))
      elements.push(text(501 + gIdx * 10, x + 2, y + 4, NODE_W - 4, 18, ag.name, 11, 'center'))
      elements.push(text(502 + gIdx * 10, x + 2, y + 22, NODE_W - 4, 14, ag.model, 9, 'center'))
      elements.push(text(503 + gIdx * 10, x + 2, y + 36, NODE_W - 4, 14, `${ag.tok} tok`, 9, 'center'))
      gIdx++
    })

    curX += grpW + GROUP_GAP
  })

  return elements
}

// ── Main ──────────────────────────────────────────────────────────────────────
save('timeline.excalidraw', buildTimeline())
save('contribution.excalidraw', buildContribution())
save('tokens-time.excalidraw', buildTokensTime())
save('agent-flow.excalidraw', buildAgentFlow())

console.log('Done. Re-run whenever source data changes.')
