#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = process.cwd()
const VIZ = path.join(ROOT, '08_본선/_system/visualizations')
const PLAN = path.join(VIZ, 'VISUALIZATION-PLAN.md')
const INDEX = path.join(VIZ, '_viz-index.md')
const GENERATOR = path.join(ROOT, '08_본선/_system/automation/viz-generator.mjs')

const required = [
  'project-master-timeline.excalidraw',
  'workflow-gantt-blueprint.excalidraw',
  'ax-operating-system-map.excalidraw',
  'team-contribution-role-radar.excalidraw',
  'update-control-tower.excalidraw',
  'demo-video-storyboard.excalidraw',
  'evidence-traceability-board.excalidraw',
  'demo-golden-path-state-machine.excalidraw',
  'research-to-product-funnel.excalidraw',
]

function assertFile(file) {
  if (!fs.existsSync(file)) throw new Error(`missing file: ${file}`)
}

function textOfBoard(file) {
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (parsed.type !== 'excalidraw' || !Array.isArray(parsed.elements)) {
    throw new Error(`invalid excalidraw structure: ${path.basename(file)}`)
  }
  return parsed.elements
    .filter(element => element.type === 'text' && typeof element.text === 'string')
    .map(element => element.text)
    .join('\n')
}

function assertIncludes(text, needle, context) {
  if (!text.includes(needle)) throw new Error(`${context} missing "${needle}"`)
}

function main() {
  assertFile(PLAN)
  assertFile(INDEX)
  assertFile(GENERATOR)

  const plan = fs.readFileSync(PLAN, 'utf8')
  const index = fs.readFileSync(INDEX, 'utf8')

  for (const board of required) {
    if (!plan.includes(board)) throw new Error(`board missing from VISUALIZATION-PLAN.md: ${board}`)
    if (!index.includes(board.replace(/\.excalidraw$/, ''))) {
      throw new Error(`board missing from _viz-index.md: ${board}`)
    }
  }

  assertIncludes(plan, '5초', 'VISUALIZATION-PLAN.md visual brief rule')
  assertIncludes(plan, 'workflow-gantt-flow-gap-audit', 'VISUALIZATION-PLAN.md workflow gap link')

  const gapAudit = path.join(VIZ, 'workflow-gantt-flow-gap-audit.md')
  if (fs.existsSync(gapAudit)) {
    assertIncludes(index, 'workflow-gantt-flow-gap-audit', '_viz-index.md workflow gap link')
  }

  execFileSync(process.execPath, [GENERATOR], { cwd: ROOT, stdio: 'inherit' })

  const files = fs.readdirSync(VIZ).filter(file => file.endsWith('.excalidraw')).sort()
  for (const file of files) {
    const full = path.join(VIZ, file)
    textOfBoard(full)
  }

  for (const file of required) {
    const text = textOfBoard(path.join(VIZ, file))
    assertIncludes(text, 'Source:', `${file} metadata`)
    assertIncludes(text, 'Next', `${file} metadata`)
    assertIncludes(text, 'Owner', `${file} metadata`)
  }

  const workflowText = textOfBoard(path.join(VIZ, 'workflow-gantt-blueprint.excalidraw'))
  assertIncludes(workflowText, 'UX/UI', 'workflow-gantt-blueprint visual brief')
  assertIncludes(workflowText, '제품 결정', 'workflow-gantt-blueprint product decision lane')
  assertIncludes(workflowText, 'API 승격', 'workflow-gantt-blueprint API escalation lane')
  assertIncludes(workflowText, 'SME', 'workflow-gantt-blueprint SME hero sync')
  assertIncludes(workflowText, '🧑', 'workflow-gantt-blueprint people layer')
  assertIncludes(workflowText, '🤖', 'workflow-gantt-blueprint AI layer')
  assertIncludes(workflowText, '%', 'workflow-gantt-blueprint progress layer')

  const readinessText = textOfBoard(path.join(VIZ, 'finals-demo-readiness-map.excalidraw'))
  assertIncludes(readinessText, 'SME', 'finals-demo-readiness-map SME hero sync')
  assertIncludes(readinessText, 'API 승격', 'finals-demo-readiness-map API escalation sync')

  const evidenceText = textOfBoard(path.join(VIZ, 'evidence-traceability-board.excalidraw'))
  assertIncludes(evidenceText, '제품 결정', 'evidence-traceability-board product decision sync')
  assertIncludes(evidenceText, 'API 승격', 'evidence-traceability-board API escalation sync')

  const funnelText = textOfBoard(path.join(VIZ, 'research-to-product-funnel.excalidraw'))
  assertIncludes(funnelText, 'Decision Gate', 'research-to-product-funnel decision gate sync')

  const contributionText = textOfBoard(path.join(VIZ, 'team-contribution-role-radar.excalidraw'))
  assertIncludes(contributionText, '🧑', 'team-contribution-role-radar people layer')
  assertIncludes(contributionText, '🤖', 'team-contribution-role-radar AI layer')
  assertIncludes(contributionText, '%', 'team-contribution-role-radar contribution layer')

  console.log(`[visualization-cycle] ok: ${files.length} excalidraw files validated`)
}

main()
