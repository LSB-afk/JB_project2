# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is the workspace for **JB LocalGuard OS** — a competition entry for the JB금융그룹 Fin:AI Challenge (자유주제 / JB 미래사업 AI). It is **not** a conventional application repo. It is ~90% an Obsidian-style documentation vault (Korean-numbered folders, markdown, wikilinks, diagrams) plus a small **static vanilla-JS MVP web app** under `02_제품/app/` that demonstrates the product. There is no build pipeline, no framework, no backend — the MVP reproduces the operating loop entirely in the browser with `localStorage` state.

The product concept: a financial AI-agent operations console that collects regional-banking customer risk signals into a `Case`, runs specialized AI agents (판단 → 행동 초안 → 검증), and gates all customer-facing actions behind human approval — while **never exporting raw customer PII to external LLMs**. The operating contract is `Case → AgentRun → Agent → Skill → Evidence → Approval → Audit`.

## Commands

```bash
npm install            # Playwright (verification only)
npm run dev            # serve the MVP: python3 -m http.server 8000 --directory 02_제품/app → http://127.0.0.1:8000/index.html
npm run test           # static verification (02_제품/scripts/verify_static.py) — also aliased as `npm run build`
npm run test:e2e       # Playwright E2E (02_제품/tests/e2e/localguard.spec.js, ~19 scenarios)
```

Run a single E2E test: `npx playwright test -g "home and dashboard"`. The Playwright config starts its own server on port **8010** (note: different from the dev port 8000) and resets `localStorage` before each test.

Demo scenarios are URL-driven: `?demo=sme` (hero: 전주 중앙로 카페), `?demo=jeonse`, `?demo=phishing`.

## The static-verification contract (critical gotcha)

`02_제품/scripts/verify_static.py` is the gate that `npm run test`/`build` runs. It is a **string-presence contract**, not a logic test. It asserts that:
- a fixed list of required files all exist (editing/renaming/moving any of them breaks the build — update the list in the script if you intentionally restructure),
- specific Korean and English **substrings** are literally present in `index.html`, `styles.css`, `app.js`, and the aggregated markdown docs (e.g. agent display names, function names like `computeRiskDecision`, scenario strings like `"전주 중앙로 카페"`, CSS tokens like `border-radius: 8px` and `Pretendard`),
- `package.json` scripts match expected values exactly,
- `node --check 02_제품/app/app.js` passes (syntax only).

When editing the app or docs, **assume any visible label, function name, or CSS token may be load-bearing for this check** — run `npm run test` after changes and reconcile both the code and the needle list if a string legitimately changes.

## MVP app architecture (`02_제품/app/`)

Plain `<script>`-loaded vanilla JS, no modules/bundler:
- `index.html` — shell with named mount points (`#page-content`, `#context-panel`, `org-rail`, `nav-list`, etc.).
- `app.js` (~186 KB) — main app: rendering, state, and the four core "function contracts" the finals plan promises to lift 1:1 into server APIs: `computeRiskDecision`, `buildDashboardData`, `auditChainRecords`, `moveCaseToColumn`.
- `modules.js` — supporting data registries and panels (governance, customers, deliverables, plugins, skills, token usage, case detail).
- `styles.css` (~95 KB) — design system; Pretendard font, 8px radius cards.
- State persists under `localStorage` key `jb-localguard-os-state-v2`.

Follow the existing vanilla-JS idiom (string-template HTML rendering, no JSX/TS). The global TypeScript coding-style rules in `~/.claude/rules` largely do not apply to this app — match surrounding code.

## Two workspaces: 예선 (preliminary) and 본선 (finals)

The top level holds the **예선** workspace as Korean-numbered folders plus `_체계`:

| Path | Contents |
| --- | --- |
| `_canon.md` | **SSOT** — single source of truth for all facts/numbers/agent names. When numbers, names, or citations conflict anywhere, `_canon.md` wins. |
| `_MOC.md` | Map of Contents (navigation hub). |
| `00_제출/` | Deliverables: MVP proposal, function spec, presentation deck. |
| `01_전략/` … `07_원천/` | strategy, product (`02_제품/` = app + tests + scripts + assets), agents, architecture, research, evidence/citations, source PDFs. |
| `_체계/` | operating rules, judging criteria, finals prep plans. |

`08_본선/` is a **self-contained Obsidian vault for the active finals work** with its own `HOME.md`, `AGENTS.md`, `PLAN.md`, `PROGRESS.md`, and a `_system/` operations harness (shared in-vault memory, telemetry, team/agent registries, dashboards, Excalidraw visualizations). Inside `08_본선/`:
- Use Obsidian conventions: wikilinks `[[ ]]`, required frontmatter, **no duplicate filenames** across the vault.
- `08_본선/AGENTS.md` is the collaboration contract: role split (orchestrator, finance-domain, compliance-risk, research, product, designer, builder, judge-qa, evidence, submission), a 3-way decision model (자율 / 제안→승인 / 사람만), and a **Capture-by-default** logging rule — every meaningful action appends a line under `08_본선/04_증빙/01_핵심로그/` before finishing.
- Decisions that are 외부 제출/공개/고객 대상 (external submission, publishing, customer-facing) require **explicit user approval** — never self-authorize them.

## Conventions and constraints

- **SSOT discipline**: never invent or drift facts/statistics/agent names. Check `_canon.md` (예선) and `08_본선/_system/memory/` + the 대회 안내 정본 in `_체계/` (본선). Verified statistics and legal citations have a specific required form — reuse the canon wording rather than paraphrasing.
- **Confidentiality / .gitignore**: finals material is 대외비 until 2026-06-29. Original finals emails (`07_원천/메일/`), demo videos (`*.webm`, `*.mp4`, `00_제출/시연영상/`), and Obsidian/Syncthing local config are gitignored and must not be published or searchable.
- Filenames and most prose are in Korean — preserve them exactly (they're referenced by `verify_static.py`, wikilinks, and import paths).
- Tooling in `02_제품/scripts/`: `render_mermaid.mjs` / `record_demo.mjs` (diagrams + demo capture) and `measure_density.js` — a Playwright UI-density profiler (`node measure_density.js before|after` screenshots a fixed route list at 1920×1080 for layout-density comparison; relevant to the `ui-density-improvements` branch). `node_modules/` and `test-results/` are regenerable and gitignored.
