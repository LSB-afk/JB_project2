#!/usr/bin/env node
// ponytail: stdlib only, no deps. Re-run whenever source data changes.
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dir, '..', '..')
const VIZ = join(__dir, '..', 'visualizations')
const GENERATED_AT = '2026-07-02 KST'

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

const text = (i, x, y, w, h, t, fontSize = 14, align = 'center', color = '#1e293b') => ({
  ...base(i),
  type: 'text',
  x, y, width: w, height: h,
  text: t,
  strokeColor: color,
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

const line = (i, x, y, dx, dy, color = '#94a3b8', style = 'solid') => ({
  ...base(i),
  type: 'line',
  x, y,
  width: Math.abs(dx),
  height: Math.abs(dy),
  points: [[0, 0], [dx, dy]],
  startBinding: null,
  endBinding: null,
  startArrowhead: null,
  endArrowhead: null,
  strokeColor: color,
  strokeStyle: style,
})

const weekdayKo = (dateLike) =>
  new Intl.DateTimeFormat('ko-KR', { weekday: 'short', timeZone: 'Asia/Seoul' })
    .format(new Date(`${dateLike}T00:00:00+09:00`))

const readMaybe = (path, fallback = '') => existsSync(path) ? readFileSync(path, 'utf8') : fallback

const splitCsvRow = (line) => {
  const out = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    const next = line[i + 1]
    if (ch === '"' && quoted && next === '"') { cur += '"'; i++; continue }
    if (ch === '"') { quoted = !quoted; continue }
    if (ch === ',' && !quoted) { out.push(cur); cur = ''; continue }
    cur += ch
  }
  out.push(cur)
  return out
}

const readCsv = (path) => {
  const raw = readMaybe(path).trim()
  if (!raw) return []
  const lines = raw.split(/\r?\n/).filter(Boolean)
  const headers = splitCsvRow(lines.shift())
  return lines.map(line => {
    const vals = splitCsvRow(line)
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
  })
}

const metaBox = (elements, i, x, y, w, source, trigger, owner, quality = 'mixed') => {
  elements.push(rect(i, x, y, w, 88, '#f8fafc', '#94a3b8'))
  elements.push(text(i + 1, x + 12, y + 10, w - 24, 16, `Source: ${source}`, 9, 'left', '#334155'))
  elements.push(text(i + 2, x + 12, y + 28, w - 24, 16, `Last generated: ${GENERATED_AT}`, 9, 'left', '#334155'))
  elements.push(text(i + 3, x + 12, y + 46, w - 24, 16, `Data quality: ${quality}`, 9, 'left', '#334155'))
  elements.push(text(i + 4, x + 12, y + 64, w - 24, 16, `Next: ${trigger} · Owner: ${owner}`, 9, 'left', '#334155'))
}

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

// ── 5. JB-GROUP-STRUCTURE ───────────────────────────────────────────────────
const buildJbGroupStructure = () => {
  _id = 0
  const elements = []

  elements.push(text(0, 20, 10, 900, 30, 'JB금융그룹 구조도 — 은행+캐피탈+운용+투자+해외', 20, 'left'))
  elements.push(text(1, 20, 42, 900, 22, '목적: 심사위원에게 “그룹을 실제로 파악했다”는 첫 장 구조 신호 제공', 12, 'left'))

  const rootX = 390, rootY = 85
  elements.push(rect(10, rootX, rootY, 230, 78, '#fef3c7', '#92400e'))
  elements.push(text(11, rootX + 8, rootY + 8, 214, 20, 'JB금융지주', 17, 'center'))
  elements.push(text(12, rootX + 8, rootY + 34, 214, 34, '총자산 73.1조\n순익 7,104억 / ROE 12.4%', 11, 'center'))

  const subs = [
    { x: 30, y: 230, w: 170, h: 86, title: '전북은행', body: '모태은행\n자산 24.5조\n순익 2,287억', color: '#dbeafe' },
    { x: 230, y: 230, w: 170, h: 86, title: '광주은행', body: '광주·전남 축\n순익 2,726억\n거점 119개', color: '#dcfce7' },
    { x: 430, y: 230, w: 180, h: 86, title: 'JB우리캐피탈', body: '비은행 성장엔진\n순익 2,815억\n총여신 9.85조', color: '#fee2e2' },
    { x: 640, y: 230, w: 160, h: 86, title: 'JB자산운용', body: '대체투자·AUM\n6.35조\n순익 20억', color: '#ede9fe' },
    { x: 830, y: 230, w: 170, h: 86, title: 'JB인베스트먼트', body: '신성장 투자창\n순익 83억\n벤처·신기술', color: '#ccfbf1' },
  ]

  subs.forEach((s, i) => {
    elements.push(rect(100 + i, s.x, s.y, s.w, s.h, s.color, '#334155'))
    elements.push(text(120 + i, s.x + 6, s.y + 7, s.w - 12, 20, s.title, 14, 'center'))
    elements.push(text(140 + i, s.x + 8, s.y + 34, s.w - 16, 42, s.body, 10, 'center'))
    elements.push(arrow(160 + i, rootX + 115, rootY + 78, s.x + s.w / 2 - (rootX + 115), s.y - rootY - 78))
  })

  const overseasY = 390
  elements.push(text(200, 30, overseasY - 35, 450, 24, '해외 플랫폼', 15, 'left'))
  const overseas = [
    { x: 60, title: 'PPCBank', body: '캄보디아\n순익 486억\n전북 50%+캐피탈 10%' },
    { x: 270, title: 'JBSV', body: '베트남 증권\n광주은행 100%\nIB 플랫폼' },
    { x: 480, title: 'JBCM', body: '미얀마 캐피탈\n캐피탈 95.6%\n현지 여신' },
    { x: 690, title: 'JB PPAM', body: '캄보디아 운용\n전북 60%+운용 40%\n현지 운용' },
  ]
  overseas.forEach((o, i) => {
    elements.push(rect(220 + i, o.x, overseasY, 175, 80, '#f8fafc', '#64748b'))
    elements.push(text(240 + i, o.x + 6, overseasY + 7, 163, 18, o.title, 13, 'center'))
    elements.push(text(260 + i, o.x + 8, overseasY + 30, 159, 42, o.body, 9, 'center'))
  })

  elements.push(text(300, 30, 505, 940, 26,
    '해석: 자산은 은행, 이익 성장은 캐피탈·해외. LocalGuard OS는 은행 심사·사후관리와 그룹 데이터 경계에 꽂힌다.',
    13, 'left'))

  return elements
}

// ── 6. JB-HISTORY-TIMELINE ──────────────────────────────────────────────────
const buildJbHistoryTimeline = () => {
  _id = 0
  const elements = []
  elements.push(text(0, 20, 10, 900, 30, 'JB금융 성장 타임라인 — 지역은행에서 AX 금융그룹으로', 20, 'left'))

  const events = [
    { year: '1969', title: '전북은행', body: '그룹 모태 형성', color: '#dbeafe' },
    { year: '2013', title: '금융지주 전환', body: 'JB금융지주 출범\nJB우리캐피탈 편입', color: '#fef3c7' },
    { year: '2014', title: '광주은행 인수', body: '호남 양대 은행 축 완성\n자산운용 편입', color: '#dcfce7' },
    { year: '2016', title: 'PPCBank', body: '캄보디아 은행 플랫폼\n해외 확장 본격화', color: '#ccfbf1' },
    { year: '2020', title: 'JBSV·PPAM', body: '베트남 증권·캄보디아 운용\n현지법인 네트워크', color: '#ede9fe' },
    { year: '2025', title: 'Naver Cloud MOU', body: '기업여신 상담→심사→사후관리\nAI 적용 검토', color: '#fee2e2' },
    { year: '2026', title: 'AX 원년', body: '그룹 AI 에이전트 플랫폼\nLocalGuard 정합 지점', color: '#fef9c3' },
  ]

  const x0 = 55, y = 140, gap = 145
  elements.push({ ...base(10), type: 'line', x: x0, y: y + 44, width: gap * (events.length - 1), height: 0,
    points: [[0,0],[gap * (events.length - 1),0]], startBinding: null, endBinding: null,
    startArrowhead: null, endArrowhead: 'arrow', strokeColor: '#475569' })

  events.forEach((e, i) => {
    const x = x0 + i * gap
    elements.push(rect(40 + i, x - 45, y - 78, 110, 64, e.color, '#475569'))
    elements.push(text(60 + i, x - 40, y - 70, 100, 18, e.year, 14, 'center'))
    elements.push(text(80 + i, x - 40, y - 48, 100, 26, e.title, 10, 'center'))
    elements.push({ ...base(100 + i), type: 'ellipse', x: x - 6, y: y + 38, width: 12, height: 12,
      backgroundColor: '#0f172a', strokeColor: '#0f172a' })
    elements.push(text(120 + i, x - 52, y + 62, 118, 50, e.body, 9, 'center'))
  })

  elements.push(rect(200, 80, 330, 850, 78, '#f8fafc', '#94a3b8'))
  elements.push(text(201, 95, 344, 820, 22, '발표용 메시지', 15, 'left'))
  elements.push(text(202, 95, 370, 820, 25,
    'JB는 “지역은행”이 아니라 은행·캐피탈·해외·AX가 결합된 운영 복잡도가 높은 그룹이다. 그래서 단순 챗봇보다 감사 가능한 운영 콘솔이 맞다.',
    12, 'left'))

  return elements
}

// ── 7. JB-FINANCE-SNAPSHOT ──────────────────────────────────────────────────
const buildJbFinanceSnapshot = () => {
  _id = 0
  const elements = []
  elements.push(text(0, 20, 10, 900, 30, 'JB금융 재무 한눈 — 구매 여력과 도입 명분', 20, 'left'))

  const metrics = [
    { label: '총자산', value: '73.1조', note: 'FY2025', color: '#dbeafe' },
    { label: '지배순익', value: '7,104억', note: '사상 최대', color: '#dcfce7' },
    { label: 'ROE', value: '12.4%', note: '고수익성', color: '#fef3c7' },
    { label: 'CET1', value: '12.58%', note: '자본 완충', color: '#ede9fe' },
    { label: 'CIR', value: '38.8%', note: '효율성', color: '#fee2e2' },
  ]

  metrics.forEach((m, i) => {
    const x = 35 + i * 190
    elements.push(rect(20 + i, x, 72, 165, 96, m.color, '#334155'))
    elements.push(text(40 + i, x + 10, 84, 145, 20, m.label, 13, 'center'))
    elements.push(text(60 + i, x + 10, 108, 145, 32, m.value, 22, 'center'))
    elements.push(text(80 + i, x + 10, 142, 145, 18, m.note, 10, 'center'))
  })

  elements.push(text(120, 35, 210, 930, 25, '계열사 순익 기여 — 2025', 16, 'left'))
  const profits = [
    { name: '전북은행', value: 2287, color: '#60a5fa' },
    { name: '광주은행', value: 2726, color: '#34d399' },
    { name: 'JB우리캐피탈', value: 2815, color: '#f87171' },
    { name: 'PPCBank', value: 486, color: '#2dd4bf' },
    { name: '인베스트', value: 83, color: '#a78bfa' },
    { name: '자산운용', value: 20, color: '#fbbf24' },
  ]
  const max = Math.max(...profits.map(p => p.value))
  profits.forEach((p, i) => {
    const y = 252 + i * 42
    const w = Math.round((p.value / max) * 520)
    elements.push(text(140 + i, 45, y + 7, 135, 18, p.name, 11, 'left'))
    elements.push(rect(160 + i, 185, y, w, 28, p.color, '#334155'))
    elements.push(text(180 + i, 185 + w + 8, y + 6, 120, 18, `${p.value.toLocaleString()}억`, 11, 'left'))
  })

  elements.push(rect(260, 735, 248, 230, 160, '#f8fafc', '#94a3b8'))
  elements.push(text(261, 750, 264, 200, 24, '제품 정합 신호', 15, 'left'))
  elements.push(text(262, 750, 295, 200, 86,
    '1. 기업여신·사후관리 AI 공식 검토\n2. 캐피탈 이익 비중 확대\n3. 지역 SME·전세·사기 리스크\n4. AX 내재화 원년',
    11, 'left'))

  return elements
}

// ── 8. JB-ECOSYSTEM-FIT ─────────────────────────────────────────────────────
const buildJbEcosystemFit = () => {
  _id = 0
  const elements = []
  elements.push(text(0, 20, 10, 900, 30, '생태계 × JB LocalGuard OS 정합 맵', 20, 'left'))
  elements.push(text(1, 20, 42, 900, 22, '목적: 리서치 결과를 제품 설계와 발표 펀치라인으로 연결', 12, 'left'))

  const left = [
    { y: 105, title: '소상공인·SOHO 여신', body: 'RM 품의·증빙대조·사후관리\n지역 경기·연체 리스크', color: '#dbeafe' },
    { y: 215, title: '전세·피싱·취약고객', body: '다중 위험 신호\n민감정보·책임소재', color: '#fee2e2' },
    { y: 325, title: '계열사 데이터 경계', body: '전북·광주·캐피탈\n공동이용·위탁·가명결합', color: '#ede9fe' },
  ]
  const mid = [
    { y: 95, title: 'PII Guard', body: '외부 LLM 비반출\nDLP·마스킹·로그', color: '#ccfbf1' },
    { y: 205, title: 'Approval First', body: 'AI 제안은 초안\n사람 승인 전 행동 차단', color: '#fef3c7' },
    { y: 315, title: 'Evidence Chain', body: '근거·출처·버전\n감사 가능한 케이스 메모리', color: '#dcfce7' },
    { y: 425, title: 'RM Console', body: '리드타임·재작업·override\n현업 채택 지표', color: '#e0f2fe' },
  ]
  const right = [
    { y: 120, title: '구매자 언어', body: '수억 가격 방어\nROI·TCO·SLA', color: '#f8fafc' },
    { y: 265, title: '심사자 언어', body: '방법론+결과물\nAI 협업 운영체계', color: '#f8fafc' },
    { y: 410, title: '제품 언어', body: 'LocalGuard OS\n거버넌드 운영 콘솔', color: '#f8fafc' },
  ]

  elements.push(text(10, 35, 78, 240, 20, 'JB 문제면', 15, 'center'))
  elements.push(text(11, 380, 78, 250, 20, 'LocalGuard 코어', 15, 'center'))
  elements.push(text(12, 740, 78, 220, 20, '전환 결과', 15, 'center'))

  left.forEach((n, i) => {
    elements.push(rect(30 + i, 35, n.y, 245, 74, n.color, '#334155'))
    elements.push(text(50 + i, 45, n.y + 8, 225, 18, n.title, 13, 'center'))
    elements.push(text(70 + i, 45, n.y + 34, 225, 30, n.body, 10, 'center'))
  })
  mid.forEach((n, i) => {
    elements.push(rect(100 + i, 385, n.y, 245, 74, n.color, '#334155'))
    elements.push(text(120 + i, 395, n.y + 8, 225, 18, n.title, 13, 'center'))
    elements.push(text(140 + i, 395, n.y + 34, 225, 30, n.body, 10, 'center'))
  })
  right.forEach((n, i) => {
    elements.push(rect(180 + i, 750, n.y, 220, 78, n.color, '#334155'))
    elements.push(text(200 + i, 760, n.y + 10, 200, 18, n.title, 13, 'center'))
    elements.push(text(220 + i, 760, n.y + 36, 200, 30, n.body, 10, 'center'))
  })

  ;[
    [280, 142, 105, 0], [280, 252, 105, -10], [280, 362, 105, -20],
    [630, 132, 120, 20], [630, 242, 120, 60], [630, 352, 120, 20], [630, 462, 120, -15],
  ].forEach((a, i) => elements.push(arrow(260 + i, a[0], a[1], a[2], a[3])))

  elements.push(rect(340, 35, 535, 935, 58, '#dbeafe', '#2563eb'))
  elements.push(text(341, 55, 550, 895, 26,
    '펀치라인: JB의 실제 복잡도는 “AI 답변”보다 “감사 가능한 AI 운영”을 요구한다.',
    18, 'center',))

  return elements
}

// ── 9. URGENT-ACTION-MAP ─────────────────────────────────────────────────────
const buildUrgentActionMap = () => {
  _id = 0
  const elements = []
  elements.push(text(0, 20, 10, 940, 30, '당장 해야 할 시각화/작업 맵 — PROGRESS 기준', 20, 'left'))

  const lanes = [
    { x: 35, title: '1. 총정리본', color: '#dbeafe', items: ['D3e+D3f+D3a~d 조립', '리서치 흡수→제품 결정', '그룹 구조·연혁·재무·정합맵 Excalidraw'] },
    { x: 285, title: '2. 제품 결정', color: '#dcfce7', items: ['은행·로컬·DB 범위 확정', 'SME 히어로 시연 SSOT', 'IA·디자인 시스템·조직도 UX'] },
    { x: 535, title: '3. MVP/API', color: '#fef3c7', items: ['정적 MVP 현상태 검증', '백엔드/API 승격 범위 결정', 'SME E2E·피싱 보조 리허설'] },
    { x: 785, title: '4. 발표·운영', color: '#fee2e2', items: ['발표덱·영상 보드 동기화', '제출 정합성 체크', 'MOC 검증 CP1 + 커밋'] },
  ]

  lanes.forEach((lane, i) => {
    elements.push(rect(20 + i, lane.x, 80, 210, 360, lane.color, '#334155'))
    elements.push(text(40 + i, lane.x + 10, 96, 190, 22, lane.title, 14, 'center'))
    lane.items.forEach((item, j) => {
      const y = 145 + j * 86
      elements.push(rect(80 + i * 10 + j, lane.x + 18, y, 174, 54, '#ffffff', '#64748b'))
      elements.push(text(120 + i * 10 + j, lane.x + 28, y + 10, 154, 28, item, 10, 'center'))
      if (j < lane.items.length - 1) elements.push(arrow(160 + i * 10 + j, lane.x + 105, y + 54, 0, 32))
    })
  })

  elements.push(rect(260, 35, 480, 960, 70, '#f8fafc', '#94a3b8'))
  elements.push(text(261, 55, 496, 920, 34,
    '우선순위: 간트 변경(G4/G5/G6)은 제품 결정·MVP/API·시연·제출 보드까지 같이 동기화한다. 이후 발표 덱으로 옮긴다.',
    13, 'left'))

  return elements
}

// ── 10. PROJECT-MASTER-TIMELINE ──────────────────────────────────────────────
const buildProjectMasterTimeline = () => {
  _id = 0
  const elements = []
  const dark = '#111827'
  const grid = '#cbd5e1'
  const x0 = 70
  const y0 = 92
  const colW = 96
  const rowH = 72
  const dates = [
    ['2026-06-11', '06/11', 'Start'], ['2026-06-12', '06/12', 'Ops'], ['2026-06-13', '06/13', 'QA'], ['2026-06-14', '06/14', 'Submit'],
    ['2026-06-15', '06/15', 'Close'], ['2026-06-26', '06/26', 'Finals'], ['2026-06-27', '06/27', 'Harness'], ['2026-06-29', '06/29', 'Open'],
    ['2026-06-30', '06/30', 'Research'], ['2026-07-01', '07/01', 'MVP/Viz'], ['2026-07-02', '07/02', 'Deck/Sync'], ['2026-07-03', '07/03', 'Rehearsal'],
    ['2026-07-04', '07/04', 'Onsite'], ['2026-07-05', '07/05', 'Final'],
  ]
  const milestones = [
    { i: 0, label: '첫 커밋\n프로젝트 출발', color: '#2563eb' },
    { i: 3, label: '예선 제출\n제안서·명세서', color: '#16a34a' },
    { i: 5, label: '본선 안내\n13팀 진출', color: '#7c3aed' },
    { i: 8, label: '리서치 1차\n27종 회수', color: '#ea580c' },
    { i: 9, label: '간트 수정\n보드 동기화', color: '#db2777' },
    { i: 10, label: '정합성·덱\n제출 준비', color: '#0891b2' },
    { i: 13, label: '발표·시연\n수상 평가', color: '#dc2626' },
  ]
  const cards = [
    { x: 95, y: 360, title: '1. 문제정의', body: '자유주제 취지\nRM·지역금융 Pain\n1.1~1.5', color: '#dbeafe' },
    { x: 285, y: 360, title: '2. 금융연계', body: 'JB 사업·AX·고객가치\n2.1~2.5', color: '#dcfce7' },
    { x: 475, y: 360, title: '3. Agent 설계', body: '판단→행동→검증\nRAG·Rule·멀티 Agent\n3.1~3.5', color: '#ede9fe' },
    { x: 665, y: 360, title: '4. MVP 검증', body: '동작 MVP·E2E·변경이력\n4.1~4.5', color: '#fef3c7' },
    { x: 855, y: 360, title: '5. 리스크/확장', body: 'PII·보안·환각·PoC 경로\n5.1~5.5', color: '#fee2e2' },
    { x: 1045, y: 360, title: '본선 시연', body: '직접 시연 필수\n로컬 구동·폴백\n실격 리스크 방어', color: '#f8fafc' },
  ]

  elements.push(text(0, 40, 18, 980, 36, '프로젝트 마스터 타임라인 — 심사기준 기반 협업 청사진', 22, 'left'))
  elements.push(text(1, 42, 52, 1120, 22,
    '2026-06-11 첫 구현부터 2026-07-05 본선 발표·시연까지, 25개 심사 항목을 산출물과 검증으로 누적 커버한 흐름',
    12, 'left'))

  elements.push(rect(10, x0 - 10, y0 - 14, dates.length * colW + 20, 58, dark, 'transparent'))
  dates.forEach((d, i) => {
    const x = x0 + i * colW
    const dayColor = d[0] === '2026-07-04' || d[0] === '2026-07-05' ? '#fecaca' : '#cbd5e1'
    elements.push(text(30 + i, x, y0 - 2, colW - 8, 30, `${d[1]}\n${weekdayKo(d[0])}`, 11, 'center', '#f8fafc'))
    elements.push(text(60 + i, x, y0 + 31, colW - 8, 18, d[2], 9, 'center', dayColor))
    elements.push(line(90 + i, x, y0 + 50, 0, 210, grid, 'dashed'))
  })
  elements.push(line(120, x0, y0 + 150, dates.length * colW - 20, 0, '#475569'))

  milestones.forEach((m, i) => {
    const x = x0 + m.i * colW + 36
    elements.push(line(150 + i, x, y0 + 46, 0, 230, m.color, 'solid'))
    elements.push(rect(170 + i, x - 42, y0 + 178, 98, 62, '#ffffff', m.color))
    elements.push(text(190 + i, x - 35, y0 + 190, 84, 34, m.label, 10, 'center', '#0f172a'))
  })

  elements.push(rect(240, x0 + 8, y0 + 82, colW * 4 - 14, rowH, '#dbeafe', '#2563eb'))
  elements.push(text(241, x0 + 20, y0 + 102, colW * 4 - 38, 24, '예선 MVP 구축·제출: 기능명세서 기준 문서 확정', 13, 'center'))
  elements.push(text(242, x0 + 20, y0 + 128, colW * 4 - 38, 18, '4.1 · 4.2 · 4.3 · 4.5', 10, 'center', '#1d4ed8'))

  elements.push(rect(250, x0 + colW * 5 + 8, y0 + 82, colW * 4 - 14, rowH, '#ede9fe', '#7c3aed'))
  elements.push(text(251, x0 + colW * 5 + 20, y0 + 102, colW * 4 - 38, 24, '본선 운영 하네스·딥리서치·회의 기록', 13, 'center'))
  elements.push(text(252, x0 + colW * 5 + 20, y0 + 128, colW * 4 - 38, 18, '2.1~2.5 · 3.5 · 5.4 · 5.5', 10, 'center', '#6d28d9'))

  elements.push(rect(260, x0 + colW * 9 + 8, y0 + 82, colW * 5 - 14, rowH, '#fee2e2', '#dc2626'))
  elements.push(text(261, x0 + colW * 9 + 20, y0 + 102, colW * 5 - 38, 24, '제품 결정·MVP 고도화·보드 동기화·리허설', 13, 'center'))
  elements.push(text(262, x0 + colW * 9 + 20, y0 + 128, colW * 5 - 38, 18, 'G4/G5/G6 · 4.2 · 4.4 · 5.5 · 직접 시연', 10, 'center', '#b91c1c'))

  cards.forEach((c, i) => {
    elements.push(rect(300 + i, c.x, c.y, 160, 104, c.color, '#334155'))
    elements.push(text(330 + i, c.x + 10, c.y + 12, 140, 20, c.title, 13, 'center'))
    elements.push(text(360 + i, c.x + 12, c.y + 40, 136, 45, c.body, 10, 'center'))
  })

  elements.push(rect(420, 70, 505, 1260, 62, '#f8fafc', '#94a3b8'))
  elements.push(text(421, 88, 520, 1215, 24,
    '발표 문장: “우리는 결과물만 만든 것이 아니라, 심사기준 25개를 작업 레인·로그·검증·변경이력으로 추적했고, 간트 변경은 관련 보드까지 같이 동기화했습니다.”',
    14, 'left'))
  metaBox(elements, 460, 1000, 585, 330, 'git log, 기능-변경이력, PROGRESS', '일정·마일스톤 변경', 'visualization', 'mixed')

  return elements
}

// ── 11. WORKFLOW-GANTT-BLUEPRINT ────────────────────────────────────────────
const buildWorkflowGanttBlueprint = () => {
  _id = 0
  const elements = []
  const x0 = 340
  const y0 = 92
  const colW = 78
  const rowH = 90
  const dates = [
    { iso: '2026-06-11', label: '06/11' }, { iso: '2026-06-12', label: '06/12' }, { iso: '2026-06-13', label: '06/13' }, { iso: '2026-06-14', label: '06/14' },
    { iso: '2026-06-15', label: '06/15' }, { iso: '2026-06-26', label: '06/26' }, { iso: '2026-06-27', label: '06/27' }, { iso: '2026-06-29', label: '06/29' },
    { iso: '2026-06-30', label: '06/30' }, { iso: '2026-07-01', label: '07/01' }, { iso: '2026-07-02', label: '07/02' }, { iso: '2026-07-03', label: '07/03' },
    { iso: '2026-07-04', label: '07/04' }, { iso: '2026-07-05', label: '07/05' },
  ]
  const lanes = [
    { name: '1. 문제정의/JB 리서치', humans: '🧑 김주용 · 🧑 재형(data/system)', robots: '🤖 research(Claude Sonnet) · GPT/Gemini DR', bg: '#e8f4fd', bars: [
      { s: 0, e: 3, label: 'Pain·JB 사업 근거', owner: '🧑김주용 main · 🤖research', tag: '1.x · 2.x', color: '#4a9eed' },
      { s: 6, e: 8, label: 'D1~D19 딥리서치', owner: '🧑김주용 main · 🤖GPT/Gemini', tag: '1.3 · 2.1 · 2.5', color: '#2563eb' },
    ]},
    { name: '2. 제품 결정/범위 확정', humans: '🧑 김주용 · 🧑 이승보 · 🧑 김민주 · 🧑 재형', robots: '🤖 product(Claude Sonnet) · judge-qa · submission', bg: '#ecfeff', bars: [
      { s: 8, e: 10, label: '은행·로컬·DB 범위 결정', owner: '🧑김주용 main · 🧑재형 data/system · 🧑이승보 tech · 🤖product', tag: 'G4 · 제품 §1', color: '#0e7490' },
      { s: 9, e: 11, label: 'SME 히어로·조직도 UX 확정', owner: '🧑김민주 UX main · 🧑김주용 story · 🤖designer', tag: '시연 SSOT', color: '#0891b2' },
    ]},
    { name: '3. AI Agent 설계', humans: '🧑 김주용 · 🧑 이승보 · 🧑 재형', robots: '🤖 orchestrator(Claude Opus 4.5) · builder(Sonnet)', bg: '#f3f0ff', bars: [
      { s: 0, e: 3, label: 'Case→AgentRun→Audit', owner: '🧑김주용 main · 🧑재형 data model · 🧑이승보 support · 🤖orchestrator', tag: '3.1 · 3.2 · 3.4', color: '#8b5cf6' },
      { s: 6, e: 9, label: '멀티 Agent·모델기록', owner: '🤖orchestrator main · 🧑김주용 · 🧑재형 system review', tag: '3.3 · 3.5', color: '#7c3aed' },
    ]},
    { name: '4. MVP 구현/고도화', humans: '🧑 이승보 · 🧑 김주용 · 🧑 김민주 · 🧑 재형', robots: '🤖 builder(Claude Sonnet) · Codex GPT-5.5', bg: '#f0fdf4', bars: [
      { s: 0, e: 4, label: '라이브 콘솔·골든패스', owner: '🧑이승보 main · 🧑김민주 UX support · 🤖builder/Codex', tag: '4.2 · 4.4', color: '#22c55e' },
      { s: 10, e: 12, label: '정적 MVP→백엔드/API 승격', owner: '🧑이승보 main · 🧑재형 DB/API · 🧑김주용 spec · 🤖Codex', tag: 'G5 · API 승격', color: '#15803d' },
      { s: 11, e: 13, label: '본선 시연 안정화', owner: '🧑김주용 main · 🧑이승보 · 🤖judge-qa', tag: '4.2 · 직접 시연', color: '#16a34a' },
    ]},
    { name: '5. UX/UI·브랜딩·시연 화면', humans: '🧑 김민주 · 🧑 김주용', robots: '🤖 design-ai(Figma/Claude) · visualization(Codex)', bg: '#fdf2f8', bars: [
      { s: 7, e: 9, label: 'JB 톤앤매너·디자인 시스템', owner: '🧑김민주 main · 🧑김주용 context · 🤖design-ai', tag: '2.2 · 4.5', color: '#db2777' },
      { s: 9, e: 11, label: '조직도 중심 UX/UI', owner: '🧑김민주 main · 🧑이승보 implement · 🤖builder', tag: '2.2 · 5.2', color: '#be185d' },
      { s: 10, e: 13, label: '발표덱·시연영상 비주얼', owner: '🧑김민주 main · 🧑김주용 story · 🤖visualization', tag: '4.5 · 발표', color: '#9d174d' },
    ]},
    { name: '6. 문서/기능명세/변경이력', humans: '🧑 김주용 · 🧑 재형(data/system)', robots: '🤖 evidence(Claude Haiku) · submission(Sonnet)', bg: '#fff7ed', bars: [
      { s: 2, e: 4, label: '제안서·기능명세·변경이력', owner: '🧑김주용 main · 🤖submission', tag: '4.1 · 4.3 · 4.5', color: '#f59e0b' },
      { s: 8, e: 13, label: '문서정리·툴관리·정합성', owner: '🧑김주용 main · 🧑재형 data/system review · 🤖evidence', tag: '기능 변경이력', color: '#ea580c' },
    ]},
    { name: '7. QA/검증/시연 안정화', humans: '🧑 김주용 · 🧑 이승보 · 🧑 김민주', robots: '🤖 judge-qa(Claude Sonnet) · Codex GPT-5.5', bg: '#f0fdfa', bars: [
      { s: 2, e: 4, label: 'E2E·정적검증·스크린샷', owner: '🤖judge-qa main · 🧑이승보 fix', tag: '4.2 · 4.5', color: '#06b6d4' },
      { s: 11, e: 13, label: 'SME JBG-104 E2E·피싱 보조', owner: '🧑김주용 main · 🧑이승보 · 🧑김민주 visual QA', tag: 'G1/G2 · 본선 방어', color: '#0891b2' },
    ]},
    { name: '8. 운영 하네스/AI 협업 증빙', humans: '🧑 김주용 · 🧑 전체 팀', robots: '🤖 evidence(Haiku) · visualization(Sonnet/Codex GPT-5.5)', bg: '#fefce8', bars: [
      { s: 5, e: 9, label: 'Stop훅·텔레메트리·에이전트 로그', owner: '🤖evidence main · 🧑김주용', tag: '2.5 · 5.2', color: '#fbbf24' },
      { s: 8, e: 13, label: '청사진·Excalidraw·보드 동기화', owner: '🤖visualization main · 🧑김주용 PM/tool', tag: 'G6 · 방법론 증빙', color: '#eab308' },
    ]},
    { name: '9. 발표/시연/리허설', humans: '🧑 김주용 · 🧑 김민주 · 🧑 재형', robots: '🤖 pitch-storyteller(Sonnet) · visualization(Sonnet/Codex)', bg: '#fff1f2', bars: [
      { s: 9, e: 10, label: 'MVP 완료+시나리오', owner: '🧑김주용 main · 🤖pitch', tag: '4.2', color: '#ef4444' },
      { s: 10, e: 11, label: '발표 덱 최종', owner: '🧑김민주 visual main · 🧑김주용 story · 🤖visualization', tag: '1~5 전체', color: '#dc2626' },
      { s: 11, e: 13, label: '최종 리허설→본선', owner: '🧑김주용 main · 🧑재형 data/system Q&A · 🤖judge-qa', tag: '직접 시연', color: '#b91c1c' },
    ]},
  ]

  elements.push(text(0, 40, 18, 980, 36, '전체 워크플로 간트차트 — 심사기준·담당자·AI 에이전트 추적형', 22, 'left'))
  elements.push(text(1, 42, 52, 1250, 22, '레인별 작업 바는 산출물·검증·심사항목과 함께 담당 사람(🧑), 담당 AI 에이전트/모델(🤖)을 표시한다. UX/UI는 별도 제품완성도 트랙으로 관리한다.', 12, 'left'))
  elements.push(rect(10, 40, y0 - 10, x0 + dates.length * colW - 10, 52, '#1e1e2e', 'transparent'))
  elements.push(text(11, 55, y0 + 8, 260, 20, '트랙 / 담당 / 날짜', 13, 'left', '#e5e7eb'))

  dates.forEach((d, i) => {
    const x = x0 + i * colW
    const dayColor = d.iso === '2026-07-04' || d.iso === '2026-07-05' ? '#fecaca' : '#f8fafc'
    elements.push(text(30 + i, x, y0 - 3, colW - 8, 34, `${d.label}\n${weekdayKo(d.iso)}`, 10, 'center', dayColor))
    elements.push(line(60 + i, x, y0 + 42, 0, lanes.length * rowH + 20, '#d1d5db', 'dashed'))
  })

  lanes.forEach((lane, i) => {
    const y = y0 + 62 + i * rowH
    const pct = ['80%', '70%', '93%', '60%', '45%', '67%', '67%', '93%', '67%'][i] ?? 'TBD'
    elements.push(rect(100 + i, 40, y, x0 + dates.length * colW - 50, rowH - 8, lane.bg, 'transparent'))
    elements.push(text(130 + i, 56, y + 10, 230, 18, lane.name, 12, 'left'))
    elements.push(text(150 + i, 286, y + 10, 42, 18, pct, 12, 'center', '#0f172a'))
    elements.push(text(160 + i, 56, y + 33, 260, 14, lane.humans, 8, 'left', '#334155'))
    elements.push(text(170 + i, 56, y + 52, 270, 14, lane.robots, 8, 'left', '#6d28d9'))
    lane.bars.forEach((bar, j) => {
      const x = x0 + bar.s * colW + 8
      const w = (bar.e - bar.s + 1) * colW - 16
      elements.push(rect(180 + i * 10 + j, x, y + 18, w, 42, bar.color, 'transparent'))
      elements.push(text(240 + i * 10 + j, x + 8, y + 20, w - 16, 13, bar.label, 8, 'center', '#ffffff'))
      elements.push(text(280 + i * 10 + j, x + 8, y + 34, w - 16, 12, bar.owner, 7, 'center', '#ffffff'))
      elements.push(text(300 + i * 10 + j, x + 8, y + 48, w - 16, 10, bar.tag, 7, 'center', '#e0f2fe'))
    })
  })

  ;[
    { idx: 3, label: '예선 제출', color: '#16a34a' },
    { idx: 5, label: '본선 안내', color: '#7c3aed' },
    { idx: 8, label: '제품§1', color: '#0e7490' },
    { idx: 9, label: 'MVP/Viz', color: '#ea580c' },
    { idx: 10, label: '동기화', color: '#0891b2' },
    { idx: 13, label: '발표·시연', color: '#dc2626' },
  ].forEach((m, i) => {
    const x = x0 + m.idx * colW + colW / 2
    elements.push(line(430 + i, x, y0 + 34, 0, lanes.length * rowH + 42, m.color))
    elements.push(text(450 + i, x - 42, y0 + lanes.length * rowH + 122, 84, 20, `◆ ${m.label}`, 10, 'center', m.color))
  })

  const legendY = y0 + lanes.length * rowH + 158
  elements.push(rect(500, 40, legendY, x0 + dates.length * colW - 50, 78, '#f8fafc', '#94a3b8'))
  elements.push(text(501, 60, legendY + 14, 1160, 22,
    '범례: 레인 왼쪽은 전체 담당, 각 작업 바 내부는 해당 작업 단위의 main/support 담당이다. G4/G5/G6는 간트 갭 감사 권고 반영. 🧑 사람 · 🤖 AI 에이전트(모델).',
    12, 'left'))
  elements.push(text(502, 60, legendY + 42, 1160, 18,
    '현재 시각화 담당 로봇 인물: 🤖 visualization · Sonnet/Codex GPT-5.5 · VISUALIZATION-PLAN→Excalidraw 업그레이드 사이클 담당',
    10, 'left', '#6d28d9'))
  metaBox(elements, 540, 1040, legendY + 8, 360, 'PLAN, PROGRESS, phase-ledger.csv, _team-roster, _agent-registry', '체크박스·단계·역할 변경', 'visualization', 'estimate')

  return elements
}

// ── 12. JUDGE-CRITERIA-COVERAGE-MAP ──────────────────────────────────────────
const buildJudgeCriteriaCoverageMap = () => {
  _id = 0
  const elements = []
  const groups = [
    { title: '1. 주제적합성·문제정의', color: '#dbeafe', items: ['1.1 자유주제 취지', '1.2 RM·상황 정의', '1.3 Pain·병목·리스크', '1.4 JB 관점 중요도', '1.5 서비스 과제화'], evidence: '문제정의·리서치·SCQA' },
    { title: '2. 금융업무·고객가치', color: '#dcfce7', items: ['2.1 JB 사업 연결', '2.2 업무/고객 여정', '2.3 가치·효율·리스크', '2.4 규제·보안·내부통제', '2.5 AX·인재 취지'], evidence: 'D3e/D3f·JB 정합맵' },
    { title: '3. AI Agent 설계', color: '#ede9fe', items: ['3.1 판단·행동·검증', '3.2 데이터→액션 흐름', '3.3 모델/RAG/Rule/멀티', '3.4 구성도·구현가능', '3.5 API·라이선스 제약'], evidence: 'Agent-flow·기능명세·API 승격' },
    { title: '4. MVP 완성도·검증', color: '#fef3c7', items: ['4.1 산출물 일관성', '4.2 실제 동작 MVP', '4.3 명세 구체성', '4.4 고도화 기반', '4.5 형식·가독성'], evidence: 'SME E2E·변경이력·시연' },
    { title: '5. 혁신·확장·리스크', color: '#fee2e2', items: ['5.1 업무방식 차별성', '5.2 새 경험/전환', '5.3 계열사 확장', '5.4 PoC→상용 경로', '5.5 PII·보안·환각·책임'], evidence: 'PII Guard·로드맵·TCO/SLA' },
  ]

  elements.push(text(0, 40, 18, 980, 36, '심사기준 25항목 커버리지 맵', 22, 'left'))
  elements.push(text(1, 42, 52, 1120, 22, '공식 5개 평가축을 산출물·검증·시연 증거와 1:1 연결하는 발표 백업 보드', 12, 'left'))

  groups.forEach((g, i) => {
    const x = 45 + i * 255
    const y = 95
    elements.push(rect(20 + i, x, y, 226, 405, g.color, '#334155'))
    elements.push(text(50 + i, x + 10, y + 14, 206, 34, g.title, 14, 'center'))
    g.items.forEach((it, j) => {
      const iy = y + 66 + j * 45
      elements.push(rect(100 + i * 10 + j, x + 16, iy, 194, 32, '#ffffff', '#94a3b8'))
      elements.push(text(160 + i * 10 + j, x + 24, iy + 8, 178, 14, it, 9, 'left'))
    })
    elements.push(rect(230 + i, x + 16, y + 316, 194, 60, '#f8fafc', '#64748b'))
    elements.push(text(260 + i, x + 25, y + 328, 176, 15, '주요 증거', 10, 'center'))
    elements.push(text(290 + i, x + 25, y + 348, 176, 20, g.evidence, 10, 'center'))
  })

  elements.push(rect(360, 45, 540, 1246, 74, '#f8fafc', '#94a3b8'))
  elements.push(text(361, 65, 556, 1205, 24,
    '강조 우선순위: 3번(AI Agent 설계) → 2번(JB 업무 연계) → 4번(MVP 검증). 간트 G4/G5/G6는 제품 결정·정적 MVP→API 승격·리서치 흡수 증거로 추적한다.',
    13, 'left'))

  return elements
}

// ── 13. FINALS-DEMO-READINESS-MAP ────────────────────────────────────────────
const buildFinalsDemoReadinessMap = () => {
  _id = 0
  const elements = []
  const columns = [
    { x: 45, title: '직접 시연 필수', color: '#fee2e2', items: ['SME JBG-104 히어로 완주', '피싱 보조·전세 optional', '발표자 장비에서 실행'] },
    { x: 315, title: '오프라인 안정성', color: '#fef3c7', items: ['정적 MVP도 현장 실행 가능', '노트북·충전기·어댑터 준비', '네트워크 차단 상태 테스트'] },
    { x: 585, title: '산출물 정합', color: '#dbeafe', items: ['간트·스토리보드·체크리스트 동기화', '변경 일자·대상·내용·사유 기록', '제안서·명세서·시연 같은 서사'] },
    { x: 855, title: '리스크 방어', color: '#dcfce7', items: ['PII 비반출·승인 전 행동 차단', '정적 MVP→API 승격은 계획/범위 분리', '폴백 영상/스크립트 준비'] },
  ]

  elements.push(text(0, 40, 18, 980, 36, '본선 시연 준비도 맵 — 실격 리스크 방어', 22, 'left'))
  elements.push(text(1, 42, 52, 1160, 22, '공식 안내 기준: 본선은 발표평가이며, 발표 시 반드시 시연 가능해야 한다.', 12, 'left'))

  columns.forEach((c, i) => {
    elements.push(rect(20 + i, c.x, 95, 238, 310, c.color, '#334155'))
    elements.push(text(50 + i, c.x + 12, 115, 214, 24, c.title, 15, 'center'))
    c.items.forEach((item, j) => {
      const y = 165 + j * 68
      elements.push(rect(90 + i * 10 + j, c.x + 18, y, 202, 46, '#ffffff', '#64748b'))
      elements.push(text(130 + i * 10 + j, c.x + 28, y + 10, 182, 22, item, 10, 'center'))
    })
  })

  const y = 455
  elements.push(rect(240, 45, y, 1048, 92, '#f8fafc', '#94a3b8'))
  elements.push(text(241, 65, y + 16, 1010, 24,
    '발표 운영 원칙: SME 히어로 작동 화면을 먼저 보여주고, 정적 MVP와 API 승격 계획은 구분해 말한다. 폴백은 “현장 안정성 설계”로 설명한다.',
    14, 'left'))
  elements.push(text(242, 65, y + 48, 1010, 20,
    '연결 심사항목: 4.1 산출물 일관성 · 4.2 동작 MVP · 4.5 형식 준수 · 5.5 운영 리스크 관리',
    12, 'left', '#475569'))

  return elements
}

// ── 14. AX-OPERATING-SYSTEM-MAP ─────────────────────────────────────────────
const buildAxOperatingSystemMap = () => {
  _id = 0
  const elements = []
  const intake = readCsv(join(__dir, '..', 'telemetry/ai-session-intake.csv'))
  const tools = readCsv(join(__dir, '..', 'tools/tool-usage-ledger.csv'))
  const engines = [...new Set(intake.map(r => r.engine).filter(Boolean))]
  const toolNames = tools.slice(0, 10).map(r => r.tool_name)

  elements.push(text(0, 40, 18, 1100, 34, 'AX Operating System Map — 사람·AI·툴·산출물·거버넌스', 22, 'left'))
  elements.push(text(1, 42, 52, 1160, 22, '대회 작업을 단순 프롬프트가 아니라 운영체계처럼 기록·분업·검증한 구조', 12, 'left'))

  const cols = [
    { x: 55, title: 'Human Team', color: '#dbeafe', items: ['🧑 김주용 / PM·문서·툴', '🧑 김민주 / UXUI·브랜딩', '🧑 이승보 / 개발·아키텍처', '🧑 재형 / 데이터·시스템 설계'] },
    { x: 285, title: 'AI Engines', color: '#ede9fe', items: engines.length ? engines.map(e => e) : ['claude', 'codex', 'chatgpt', 'gemini'] },
    { x: 515, title: 'Agents', color: '#fef3c7', items: ['Orchestrator', 'research', 'designer', 'evidence', 'builder', 'judge-qa'] },
    { x: 745, title: 'Tools', color: '#dcfce7', items: toolNames.length ? toolNames : ['GitHub', 'Obsidian', 'Excalidraw', 'Syncthing'] },
    { x: 975, title: 'Outputs', color: '#fee2e2', items: ['MVP', '기능명세', '리서치 27종', '발표·시연', 'Excalidraw 청사진'] },
  ]

  cols.forEach((col, ci) => {
    elements.push(rect(20 + ci, col.x, 95, 190, 390, col.color, '#334155'))
    elements.push(text(50 + ci, col.x + 10, 114, 170, 22, col.title, 15, 'center'))
    col.items.slice(0, 7).forEach((item, ii) => {
      const y = 160 + ii * 43
      elements.push(rect(100 + ci * 20 + ii, col.x + 16, y, 158, 30, '#ffffff', '#64748b'))
      elements.push(text(200 + ci * 20 + ii, col.x + 24, y + 8, 142, 13, item, 9, 'left'))
    })
    if (ci < cols.length - 1) elements.push(arrow(360 + ci, col.x + 190, 290, 40, 0))
  })

  elements.push(rect(500, 55, 520, 1110, 72, '#f8fafc', '#94a3b8'))
  elements.push(text(501, 75, 536, 1060, 20, 'Governance Gates: PII 비반출 · 승인 전 행동 차단 · 프롬프트/토큰/툴 로그 · 기능 변경이력 · JSON 검증', 13, 'left'))
  elements.push(text(502, 75, 562, 1060, 18, `현재 기록: AI 세션 ${intake.length}행 · 툴 사용 원장 ${tools.length}행 · 에이전트 레지스트리 기반`, 11, 'left', '#475569'))
  metaBox(elements, 540, 900, 615, 350, '_agent-registry, registry-*, tool-usage-ledger.csv', '도구·AI·에이전트 추가', 'visualization', 'mixed')

  return elements
}

// ── 15. TEAM-CONTRIBUTION-ROLE-RADAR ────────────────────────────────────────
const buildTeamContributionRoleRadar = () => {
  _id = 0
  const elements = []
  const ledger = readCsv(join(__dir, '..', 'team/contribution-ledger.csv'))
  const people = ['M1', 'M2', 'M3', 'M4']
  const emoji = { M1: '🧑‍💼', M2: '🧑‍🎨', M3: '🧑‍💻', M4: '🧑‍💼', AI: '🤖' }
  const grouped = {}
  ledger.forEach(r => {
    const slot = r.member_slot || 'TBD'
    grouped[slot] ??= { weight: 0, rows: [] }
    grouped[slot].weight += Number(r.weight) || 0
    grouped[slot].rows.push(r)
  })
  const humanTotal = people.reduce((s, p) => s + (grouped[p]?.weight || 0), 0) || 1
  const aiWeight = grouped.AI?.weight || 0

  elements.push(text(0, 40, 18, 1100, 34, 'Team Contribution & Role Radar — 사람 기여 % + AI Support Layer', 22, 'left'))
  elements.push(text(1, 42, 52, 1160, 22, '역할·작업·서포트·기여율을 원장 기반으로 계속 업데이트하는 발표용 추적 보드', 12, 'left'))

  people.forEach((slot, i) => {
    const x = 55 + i * 285
    const r = grouped[slot]?.rows?.[0] || {}
    const weight = grouped[slot]?.weight || 0
    const pct = Math.round((weight / humanTotal) * 100)
    elements.push(rect(20 + i, x, 95, 245, 250, '#f8fafc', '#334155'))
    elements.push(text(50 + i, x + 14, 112, 216, 24, `${emoji[slot]} ${slot} · ${r.member_name || 'TBD'}`, 16, 'center'))
    elements.push(text(80 + i, x + 18, 142, 208, 18, r.role || '역할 확정 대기', 10, 'center', '#475569'))
    elements.push(rect(110 + i, x + 28, 182, 188, 26, '#e2e8f0', '#94a3b8'))
    elements.push(rect(130 + i, x + 28, 182, Math.max(8, Math.round(188 * pct / 100)), 26, '#60a5fa', 'transparent'))
    elements.push(text(150 + i, x + 34, 187, 176, 15, `Human share ${pct}% · weight ${weight}`, 10, 'center', '#0f172a'))
    const tasks = (grouped[slot]?.rows || []).slice(0, 3).map(row => `${row.domain}: ${row.task.slice(0, 28)}`)
    tasks.forEach((task, j) => {
      elements.push(text(180 + i * 10 + j, x + 20, 230 + j * 25, 205, 15, task, 8, 'left', '#334155'))
    })
  })

  elements.push(rect(300, 55, 385, 1090, 95, '#ede9fe', '#7c3aed'))
  elements.push(text(301, 75, 402, 1045, 22, `${emoji.AI} AI Support Layer · Claude / Codex / ChatGPT / Gemini · support weight ${aiWeight}`, 16, 'left', '#312e81'))
  elements.push(text(302, 75, 432, 1045, 22, 'AI는 사람 기여와 경쟁하지 않고 리서치·코딩·검증·시각화 보조층으로 분리 표기한다.', 12, 'left', '#312e81'))
  elements.push(text(303, 75, 456, 1045, 18, '간트 동기화 기준: 제품 결정은 전원 협업, UX/UI는 김민주 lead, MVP/API는 이승보 lead, 데이터·시스템 설계는 재형 support, PM·문서·툴은 김주용 lead.', 10, 'left', '#312e81'))
  metaBox(elements, 340, 850, 510, 350, 'contribution-ledger.csv, _team-roster, _contribution-stats', '팀원 역할·작업 원장 변경', 'visualization', 'estimate')

  return elements
}

// ── 16. UPDATE-CONTROL-TOWER ────────────────────────────────────────────────
const buildUpdateControlTower = () => {
  _id = 0
  const elements = []
  const phases = readCsv(join(__dir, '..', 'progress/phase-ledger.csv'))
  const buckets = [
    { x: 55, title: 'Done', color: '#dcfce7', items: phases.filter(p => Number(p.completion_pct) >= 90).map(p => `${p.phase_name} ${p.completion_pct}%`) },
    { x: 345, title: 'In Progress', color: '#dbeafe', items: phases.filter(p => Number(p.completion_pct) > 0 && Number(p.completion_pct) < 90).map(p => `${p.phase_name} ${p.completion_pct}%`) },
    { x: 635, title: 'Waiting', color: '#fef3c7', items: ['은행·로컬·DB 범위 최종 선택', '_canon 히어로 프레이밍 승인', '본선 리허설 체크'] },
    { x: 925, title: 'Risk', color: '#fee2e2', items: ['정적 MVP/API 승격 혼동', '시연 현장 네트워크', '렌더 수동 QA 미확인'] },
  ]

  elements.push(text(0, 40, 18, 1100, 34, 'Update Control Tower — 진행률·대기·리스크 추적판', 22, 'left'))
  elements.push(text(1, 42, 52, 1160, 22, 'PROGRESS와 원장을 기준으로 지금 무엇이 끝났고, 무엇이 막혔는지 한 장에서 확인', 12, 'left'))
  buckets.forEach((b, i) => {
    elements.push(rect(20 + i, b.x, 95, 250, 360, b.color, '#334155'))
    elements.push(text(50 + i, b.x + 18, 116, 214, 24, b.title, 16, 'center'))
    b.items.slice(0, 6).forEach((it, j) => {
      const y = 165 + j * 43
      elements.push(rect(90 + i * 10 + j, b.x + 18, y, 214, 30, '#ffffff', '#64748b'))
      elements.push(text(140 + i * 10 + j, b.x + 28, y + 8, 194, 13, it, 9, 'left'))
    })
  })
  metaBox(elements, 240, 850, 500, 350, 'PROGRESS, PLAN, phase-ledger.csv', 'PROGRESS 체크박스 변경', 'visualization', 'estimate')
  return elements
}

// ── 17. DEMO-VIDEO-STORYBOARD ───────────────────────────────────────────────
const buildDemoVideoStoryboard = () => {
  _id = 0
  const elements = []
  const shots = [
    ['1', '표지', '금융 AI Agent 운영 콘솔', '서비스명·대회명'],
    ['2', '대시보드', '위험 신호를 케이스로 통합', '큐·SLA·KPI'],
    ['3', '문제', 'RM 혼자 조기대응 어려움', 'SME Hero'],
    ['4', 'SME 진입', 'JBG-104 전주 카페', '?demo=sme'],
    ['5', 'AgentRun', '클릭으로 판단 루프 실행', '타임라인 생성'],
    ['6', '판단/산출물', '정책금융·콜백 초안', 'Evidence chip'],
    ['7', 'PII 거버넌스', '원본 PII 비반출', '토큰화·스캔 PASS'],
    ['8', '승인 게이트', '승인 전 행동 차단', 'Pending→Approved'],
    ['9', '감사 원장', '누가·언제·근거·해시', 'Audit log'],
    ['10', '피싱 차단', '고위험 L4 행동 거부', '?demo=phishing'],
    ['11', '전세 Shield', '잔여시간 optional 확장', '?demo=jeonse'],
    ['12', '클로징', '챗봇이 아닌 운영체계', 'KPI·E2E·간트 증빙'],
  ]
  elements.push(text(0, 40, 18, 1100, 34, 'Demo Video Storyboard — 시연영상 12컷 제작판', 22, 'left'))
  elements.push(text(1, 42, 52, 1160, 22, 'SME JBG-104 히어로를 중심으로 PII 거버넌스와 승인 게이트를 크게 보여주고, 피싱은 보조·전세는 optional로 둔다.', 12, 'left'))
  shots.forEach((s, i) => {
    const col = i % 4
    const row = Math.floor(i / 4)
    const x = 55 + col * 295
    const y = 105 + row * 150
    elements.push(rect(20 + i, x, y, 260, 118, '#f8fafc', '#334155'))
    elements.push(text(60 + i, x + 12, y + 10, 232, 18, `${s[0]}. ${s[1]}`, 13, 'left'))
    elements.push(rect(100 + i, x + 14, y + 38, 98, 52, '#e2e8f0', '#94a3b8'))
    elements.push(text(140 + i, x + 124, y + 38, 120, 30, s[2], 10, 'left'))
    elements.push(text(180 + i, x + 124, y + 75, 120, 22, s[3], 9, 'left', '#475569'))
  })
  elements.push(rect(260, 55, 585, 790, 70, '#fee2e2', '#dc2626'))
  elements.push(text(261, 75, 600, 750, 20, '반드시 크게 보여줄 3개: AgentRun 클릭 · PII 토큰화/반출 스캔 PASS · Approval Pending → Approved', 13, 'left'))
  metaBox(elements, 300, 875, 585, 350, '본선-시연-시나리오, 발표-시연-스크립트', '시연 흐름·영상 규칙 변경', 'visualization', 'mixed')
  return elements
}

// ── 18. EVIDENCE-TRACEABILITY-BOARD ─────────────────────────────────────────
const buildEvidenceTraceabilityBoard = () => {
  _id = 0
  const elements = []
  const rows = [
    ['JB 정합성', 'D3a~D3f / _canon §10', 'JB ecosystem fit', '2.1~2.5'],
    ['제품 결정', '제품정의·간트 G4', '은행/로컬/DB 범위표', '2.2 · 4.3'],
    ['AI Agent 구조', 'agent-roster / agent-flow', 'AgentRun demo', '3.1~3.5'],
    ['동작 MVP', 'function-spec / live verification', 'SME golden path', '4.1~4.5'],
    ['API 승격', '간트 G5 / architecture', '정적 MVP→API plan', '3.4 · 4.4'],
    ['PII·승인 리스크', 'D5a/D10/D15 / gov panel', 'PII PASS + Approval', '5.5'],
    ['협업 방법론', 'telemetry / ledgers / Excalidraw', 'AX OS map', '2.5 · 5.4'],
  ]
  elements.push(text(0, 40, 18, 1100, 34, 'Evidence Traceability Board — 주장→근거→산출물→심사항목', 22, 'left'))
  elements.push(text(1, 42, 52, 1160, 22, '발표에서 강한 주장을 할 때 바로 백업할 수 있는 근거 연결판', 12, 'left'))
  const headers = ['핵심 주장', '근거/출처', '보여줄 산출물', '심사항목']
  headers.forEach((h, i) => {
    elements.push(rect(20 + i, 55 + i * 285, 100, 260, 38, '#1e293b', 'transparent'))
    elements.push(text(40 + i, 65 + i * 285, 111, 240, 16, h, 12, 'center', '#f8fafc'))
  })
  rows.forEach((r, ri) => {
    r.forEach((cell, ci) => {
      const x = 55 + ci * 285
      const y = 155 + ri * 58
      elements.push(rect(100 + ri * 10 + ci, x, y, 260, 48, ci === 3 ? '#fef3c7' : '#f8fafc', '#94a3b8'))
      elements.push(text(180 + ri * 10 + ci, x + 12, y + 13, 236, 18, cell, 10, 'center'))
    })
  })
  metaBox(elements, 300, 870, 600, 350, '_canon, D결과, 제출문서, 심사기준', '리서치·제출 문서 변경', 'evidence + visualization', 'mixed')
  return elements
}

// ── 19. DEMO-GOLDEN-PATH-STATE-MACHINE ─────────────────────────────────────
const buildDemoGoldenPathStateMachine = () => {
  _id = 0
  const elements = []
  const states = [
    ['Input', '케이스 선택\nSME·전세·피싱', '#dbeafe'],
    ['Classify', '위험분류\nriskScore·confidence', '#ede9fe'],
    ['Generate', '행동 초안\n콜백·체크리스트', '#dcfce7'],
    ['Govern', 'PII 토큰화\n반출 스캔', '#fef3c7'],
    ['Approve', 'RM 승인 전\n행동 차단', '#fee2e2'],
    ['Audit', '상태·근거·해시\n원장 기록', '#f8fafc'],
  ]
  elements.push(text(0, 40, 18, 1100, 34, 'Demo Golden Path State Machine — 라이브 시연 상태기계', 22, 'left'))
  elements.push(text(1, 42, 52, 1160, 22, '정상 경로와 차단 경로를 함께 보여줘 “실제로 통제되는 AI Agent”임을 증명한다.', 12, 'left'))
  states.forEach((s, i) => {
    const x = 60 + i * 190
    elements.push(rect(20 + i, x, 150, 150, 92, s[2], '#334155'))
    elements.push(text(50 + i, x + 10, 164, 130, 20, s[0], 14, 'center'))
    elements.push(text(80 + i, x + 12, 194, 126, 36, s[1], 10, 'center'))
    if (i < states.length - 1) elements.push(arrow(120 + i, x + 150, 196, 40, 0))
  })
  const paths = [
    ['SME Hero', 'JBG-104 → 정책금융·콜백 초안 → RM 승인 → Audit'],
    ['피싱 보조', '고위험 L4 → 고객 대상 자동 발송 blocked'],
    ['전세 optional', '임대차 리스크 → 안전계약 체크리스트 → 잔여시간 시연'],
  ]
  paths.forEach((p, i) => {
    const y = 330 + i * 62
    elements.push(rect(180 + i, 90, y, 1000, 42, i === 2 ? '#fee2e2' : '#f8fafc', '#64748b'))
    elements.push(text(210 + i, 110, y + 12, 100, 16, p[0], 12, 'center'))
    elements.push(text(240 + i, 240, y + 12, 790, 16, p[1], 11, 'left'))
  })
  metaBox(elements, 300, 830, 545, 350, '본선-시연-시나리오, live verification', '데모 플로우 변경', 'visualization + judge-qa', 'mixed')
  return elements
}

// ── 20. RESEARCH-DOMAIN-ATLAS ──────────────────────────────────────────────
const buildResearchDomainAtlas = () => {
  _id = 0
  const elements = []
  elements.push(text(0, 40, 18, 1180, 34, 'Research Domain Atlas — 리서치 지형도와 근거 네트워크', 22, 'left'))
  elements.push(text(1, 42, 52, 1220, 24, '31+개 D/B 리서치를 큰 범주·연결선·제품/시연/발표 활용처로 압축한 발표 백업 지도', 12, 'left'))

  const inputs = [
    ['Prompt Set', 'D1~D23\nD30·D25\nB1'],
    ['Results', '회수현황\n모델기록\n종합검증'],
    ['Synthesis', '연결-1..6\n인사이트맵\n논증척추'],
  ]
  elements.push(text(10, 55, 100, 230, 20, 'Research Intake', 15, 'center'))
  inputs.forEach((item, i) => {
    const y = 140 + i * 118
    elements.push(rect(20 + i, 55, y, 210, 82, i === 0 ? '#dbeafe' : i === 1 ? '#ecfeff' : '#fef3c7', '#334155'))
    elements.push(text(40 + i, 70, y + 12, 180, 18, item[0], 13, 'center'))
    elements.push(text(60 + i, 75, y + 38, 170, 34, item[1], 10, 'center'))
    if (i < inputs.length - 1) elements.push(arrow(80 + i, 160, y + 82, 0, 36))
  })

  const clusters = [
    {
      x: 300, y: 115, color: '#dbeafe', title: 'Pain & RM Workflow',
      codes: 'D1a D1b D2 D4 D16',
      body: '소상공인·전세·피싱 pain\nRM 업무량·조직/직무',
      output: '문제정의 · SME hero',
    },
    {
      x: 610, y: 115, color: '#fef3c7', title: 'JB Fit & Market',
      codes: 'D3a~f D30 D+a D23',
      body: 'JB 2계열사 정합\n시장·ROI·why now',
      output: '바이어 언어 · 금융가치',
    },
    {
      x: 920, y: 115, color: '#fee2e2', title: 'Data & Regulation',
      codes: 'D5a D5b D7a/b D12 D17 D25',
      body: '법령·망분리·데이터/API\n계열사 공동이용·적법성',
      output: 'PII 비반출 · 데이터 레인',
    },
    {
      x: 300, y: 360, color: '#ede9fe', title: 'Agent/System Architecture',
      codes: 'D6 D9 D10 D11 D20 D21 D22 B1',
      body: '코어뱅킹·보안·메모리\n모델주권·하네스·OSS',
      output: 'model-agnostic OS',
    },
    {
      x: 610, y: 360, color: '#dcfce7', title: 'Governance & Validation',
      codes: 'D8 D13 D14 D15 D18 D19 D+b',
      body: 'MVP 검증·데이터품질\n승인/감사·운영리스크',
      output: '상태 변화 불변식',
    },
    {
      x: 920, y: 360, color: '#f8fafc', title: 'Synthesis & Pitch Spine',
      codes: '연결-1..6 · 인사이트맵 · 논증척추',
      body: '교차 인사이트\n심사5기준·반론방어',
      output: '발표 첫 문장 · QA 백업',
    },
  ]

  clusters.forEach((c, i) => {
    elements.push(rect(120 + i, c.x, c.y, 250, 172, c.color, '#334155'))
    elements.push(text(150 + i, c.x + 14, c.y + 14, 222, 22, c.title, 14, 'center'))
    elements.push(rect(180 + i, c.x + 20, c.y + 44, 210, 28, '#ffffff', '#94a3b8'))
    elements.push(text(210 + i, c.x + 28, c.y + 51, 194, 14, c.codes, 9, 'center', '#334155'))
    elements.push(text(240 + i, c.x + 20, c.y + 88, 210, 42, c.body, 10, 'center'))
    elements.push(text(270 + i, c.x + 20, c.y + 140, 210, 18, `→ ${c.output}`, 10, 'center', '#0f766e'))
  })

  const link = (i, x, y, dx, dy, label, lx, ly) => {
    elements.push(arrow(i, x, y, dx, dy))
    elements.push(text(i + 1, lx, ly, 140, 16, label, 8, 'center', '#475569'))
  }
  link(300, 550, 188, 60, 0, 'pain to buyer', 548, 167)
  link(302, 860, 188, 60, 0, 'value needs trust', 850, 167)
  link(304, 1045, 287, -10, 73, 'PII shapes architecture', 1038, 314)
  link(306, 550, 446, 60, 0, 'OS contract', 548, 424)
  link(308, 860, 446, 60, 0, 'pitch spine', 858, 424)
  link(310, 735, 287, 0, 73, '검증 기준', 746, 318)

  elements.push(rect(330, 1265, 105, 250, 132, '#ecfeff', '#0891b2'))
  elements.push(text(331, 1282, 122, 216, 20, 'Product Decisions', 14, 'center'))
  elements.push(text(332, 1286, 156, 210, 52, 'Zero-PII Case Hub\nApproval-first\n전북은행+JB우리캐피탈', 10, 'center'))

  elements.push(rect(340, 1265, 275, 250, 132, '#dcfce7', '#16a34a'))
  elements.push(text(341, 1282, 292, 216, 20, 'Demo / MVP', 14, 'center'))
  elements.push(text(342, 1286, 326, 210, 52, 'SME hero\njeonse/phishing optional\nverify_static + Playwright', 10, 'center'))

  elements.push(rect(350, 1265, 445, 250, 132, '#fef3c7', '#ca8a04'))
  elements.push(text(351, 1282, 462, 216, 20, 'Pitch / Judge QA', 14, 'center'))
  elements.push(text(352, 1286, 496, 210, 52, '심사 5기준\n반론 방어\n백업 근거 위치', 10, 'center'))

  elements.push(arrow(360, 1170, 200, 95, -20))
  elements.push(arrow(361, 1170, 438, 95, -95))
  elements.push(arrow(362, 1170, 438, 95, 55))

  const gaps = [
    ['TBD', 'D25 데이터 레인 적법성 실행대기'],
    ['mixed', 'D23 ROI: GPT 그룹스케일 ↔ Gemini 전북은행 단독 reconcile'],
    ['next', '제품정의·PPT전략 변경 시 atlas→funnel→evidence 동시 갱신'],
  ]
  elements.push(rect(380, 55, 620, 1120, 86, '#fff7ed', '#ea580c'))
  elements.push(text(381, 75, 636, 150, 18, 'Open Gaps / Update Rule', 13, 'left'))
  gaps.forEach((g, i) => {
    elements.push(rect(390 + i, 250 + i * 300, 638, 270, 42, i === 0 ? '#fee2e2' : '#ffffff', '#fed7aa'))
    elements.push(text(410 + i, 262 + i * 300, 651, 38, 14, g[0], 10, 'center', '#9a3412'))
    elements.push(text(430 + i, 305 + i * 300, 650, 195, 18, g[1], 9, 'left', '#7c2d12'))
  })

  metaBox(elements, 500, 1195, 620, 340, 'research-domain-atlas-plan, README, 회수현황, 인사이트맵, 논증척추', 'D시리즈 추가·회수, 제품정의·PPT 변경', 'research + visualization', 'mixed')
  return elements
}

// ── 21. RESEARCH-TO-PRODUCT-FUNNEL ─────────────────────────────────────────
const buildResearchToProductFunnel = () => {
  _id = 0
  const elements = []
  const stages = [
    { x: 60, w: 200, title: '27+ Deep Research', body: 'D1~D23\nD+a/b\nD3a~f', color: '#dbeafe' },
    { x: 310, w: 200, title: 'Gap Audit', body: 'D16~D19\n신뢰도·논문·수치\nCodex 5.5 점검', color: '#ede9fe' },
    { x: 560, w: 200, title: 'Decision Gate', body: '은행·로컬·DB\nSME Hero\n조직도 UX', color: '#ecfeff' },
    { x: 810, w: 200, title: 'Product Decisions', body: 'RM 콘솔\nPII Guard\nApproval First', color: '#dcfce7' },
    { x: 1060, w: 200, title: 'MVP & Pitch', body: 'SME 데모\nAPI 승격계획\n심사기준 커버', color: '#fef3c7' },
  ]
  elements.push(text(0, 40, 18, 1100, 34, 'Research-to-Product Funnel — 리서치가 제품 결정으로 내려온 흐름', 22, 'left'))
  elements.push(text(1, 42, 52, 1160, 22, '많이 조사했다가 아니라, 조사 결과가 기능·시연·발표 문장으로 변환됐다는 것을 보여준다.', 12, 'left'))
  stages.forEach((s, i) => {
    elements.push(rect(20 + i, s.x, 130, s.w, 180, s.color, '#334155'))
    elements.push(text(50 + i, s.x + 16, 152, s.w - 32, 22, s.title, 15, 'center'))
    elements.push(text(80 + i, s.x + 18, 190, s.w - 36, 70, s.body, 12, 'center'))
    if (i < stages.length - 1) elements.push(arrow(130 + i, s.x + s.w, 220, 50, 0))
  })
  const products = [
    ['JB 정합성', 'D3e/D3f → JB 구조·재무·AX 원년 → ecosystem fit'],
    ['제품 결정', 'D3/D20~D23 → 은행·로컬·DB·SME Hero 결정 게이트'],
    ['검증 가능성', 'D13/D16 → KPI·샘플·평가 설계 → MVP/API 검증 문장'],
    ['운영 리스크', 'D5a/D10/D15 → PII·승인·감사 → 거버넌스 패널'],
  ]
  products.forEach((p, i) => {
    const y = 380 + i * 58
    elements.push(rect(200 + i, 95, y, 1020, 40, '#f8fafc', '#94a3b8'))
    elements.push(text(230 + i, 115, y + 12, 150, 16, p[0], 12, 'center'))
    elements.push(text(260 + i, 290, y + 12, 790, 16, p[1], 11, 'left'))
  })
  metaBox(elements, 320, 830, 635, 350, 'D1~D23, D+a/b, 갭감사, 제품정의', '리서치 회수·제품 반영 변경', 'research + visualization', 'mixed')
  return elements
}

// ── Main ──────────────────────────────────────────────────────────────────────
save('timeline.excalidraw', buildTimeline())
save('contribution.excalidraw', buildContribution())
save('tokens-time.excalidraw', buildTokensTime())
save('agent-flow.excalidraw', buildAgentFlow())
save('jb-group-structure.excalidraw', buildJbGroupStructure())
save('jb-history-timeline.excalidraw', buildJbHistoryTimeline())
save('jb-finance-snapshot.excalidraw', buildJbFinanceSnapshot())
save('jb-ecosystem-fit.excalidraw', buildJbEcosystemFit())
save('urgent-action-map.excalidraw', buildUrgentActionMap())
save('project-master-timeline.excalidraw', buildProjectMasterTimeline())
save('workflow-gantt-blueprint.excalidraw', buildWorkflowGanttBlueprint())
save('judge-criteria-coverage-map.excalidraw', buildJudgeCriteriaCoverageMap())
save('finals-demo-readiness-map.excalidraw', buildFinalsDemoReadinessMap())
save('ax-operating-system-map.excalidraw', buildAxOperatingSystemMap())
save('team-contribution-role-radar.excalidraw', buildTeamContributionRoleRadar())
save('update-control-tower.excalidraw', buildUpdateControlTower())
save('demo-video-storyboard.excalidraw', buildDemoVideoStoryboard())
save('evidence-traceability-board.excalidraw', buildEvidenceTraceabilityBoard())
save('demo-golden-path-state-machine.excalidraw', buildDemoGoldenPathStateMachine())
save('research-domain-atlas.excalidraw', buildResearchDomainAtlas())
save('research-to-product-funnel.excalidraw', buildResearchToProductFunnel())

console.log('Done. Re-run whenever source data changes.')
