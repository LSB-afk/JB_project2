#!/usr/bin/env python3
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

required = [
    ROOT / "README.md",
    ROOT / "_MOC/README.md",
    ROOT / "02_전략/README.md",
    ROOT / "03_제품/README.md",
    ROOT / "04_증빙/README.md",
    ROOT / "05_제출/README.md",
    ROOT / "06_LLM위키/README.md",
    ROOT / "07_아키텍처/README.md",
    ROOT / "_체계/README.md",
    ROOT / "자산/README.md",
    ROOT / "산출/README.md",
    ROOT / "docs/00_sources/pdf-read.md",
    ROOT / "docs/00_sources/daker-page-line-read.md",
    ROOT / "docs/01_research/pain-point-evidence.md",
    ROOT / "docs/02_product/prd.md",
    ROOT / "docs/02_product/function-spec.md",
    ROOT / "docs/02_product/hagentos-ui-adaptation.md",
    ROOT / "docs/03_agents/agent-system.md",
    ROOT / "docs/03_agents/jeonse-shield-agents.md",
    ROOT / "docs/03_agents/skill-registry.md",
    ROOT / "docs/04_submission/mvp-proposal-draft.md",
    ROOT / "docs/04_submission/evaluation-fit.md",
    ROOT / "docs/05_evidence/source-index.md",
    ROOT / "app/index.html",
    ROOT / "app/styles.css",
    ROOT / "app/app.js",
]

missing = [path for path in required if not path.exists()]
if missing:
    raise SystemExit("Missing files:\n" + "\n".join(str(path) for path in missing))

html = (ROOT / "app/index.html").read_text(encoding="utf-8")
css = (ROOT / "app/styles.css").read_text(encoding="utf-8")
js = (ROOT / "app/app.js").read_text(encoding="utf-8")

html_needles = [
    "JB LocalGuard OS",
    "org-rail",
    "nav-list",
    "page-content",
    "context-panel",
    "./app.js",
]
for needle in html_needles:
    if needle not in html:
        raise SystemExit(f"HTML missing {needle!r}")

js_needles = [
    "전주 중앙로 카페",
    "광주 송정 도소매",
    "군산 부품 제조업",
    "익산 음식점",
    "renderWorkbench",
    "page-content",
    "context-panel",
    "command-input",
    "case-board",
    "case-list-board",
    "hagent-kanban",
    "dispatchResultMarkup",
    "moveCaseToColumn",
    "approvalTab",
    "live-runs",
    "evidence-feed",
    "audit-log",
    "LocalGuard AI",
    "AI Agent 모델",
    "Skill Registry",
    "Jeonse Shield Lead",
    "Registry Rights Agent",
    "orgChartView",
    "org-diagram",
    "org-branch-grid",
    "jeonseView",
    "jeonse-price-ratio",
    "runAgents",
    "approveAction",
    "Fraud Shield Agent",
    "Approval Pending",
    "audit",
]
for needle in js_needles:
    if needle not in js:
        raise SystemExit(f"JS missing {needle!r}")

doc_needles = [
    "자유주제",
    "Case -> AgentRun -> Approval -> Audit",
    "학원 운영자",
    "JB금융그룹-네이버클라우드",
    "4-zone layout",
    "Jeonse Shield",
    "전세 위험 신호 탐지",
    "Map of Contents",
    "GitHub 워크스페이스",
    "HagentOS Process Mirroring",
    "sidebar: 240px desktop",
    "Browser verification on the local server",
    "Mermaid",
    "시스템 아키텍처",
    "데이터 아키텍처",
    "API 아키텍처",
    "사용자 흐름",
]
joined_docs = "\n".join(
    path.read_text(encoding="utf-8")
    for path in required
    if path.suffix == ".md"
)
for needle in doc_needles:
    if needle not in joined_docs:
        raise SystemExit(f"Docs missing {needle!r}")

if "border-radius: 8px" not in css:
    raise SystemExit("CSS should keep cards and controls at 8px radius")

if "Pretendard" not in css:
    raise SystemExit("CSS should use Pretendard as the primary font")

node_check = subprocess.run(
    ["node", "--check", str(ROOT / "app/app.js")],
    text=True,
    capture_output=True,
    check=False,
)
if node_check.returncode != 0:
    raise SystemExit(node_check.stderr or node_check.stdout)

print("static verification passed")
print(f"checked files: {len(required)}")
