#!/usr/bin/env python3
"""JB LocalGuard OS 프로토타입 정적 검증 (standalone).

원본 워크스페이스의 verify_static.py에서 앱/문서 계약만 이식했다.
- 필수 파일 존재
- 핵심 문자열(needle) 계약: 화면 라벨·함수 계약·guardrail 문구
- JB우리캐피탈 전용 레이어의 금지 패턴 부재
- 모든 app/*.js 문법 검사(node --check)
"""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

app_js_files = [
    "app.js",
    "modules.js",
    "jbWooriCapitalSidebar.config.js",
    "jbWooriCapitalAgents.registry.js",
    "wooricap-db.js",
    "jbWooriCapitalServices.js",
    "wooricap.helpers.js",
    "wooricap.view.board.js",
    "wooricap.view.cases.js",
    "wooricap.view.wizard.js",
    "wooricap.view.harness.js",
    "wooricap.sidebar.js",
    "wooricap.js",
    "jeonseProtection.config.js",
    "jeonseProtectionAgents.registry.js",
    "jeonseProtection-db.js",
    "jeonseProtectionServices.js",
    "jeonseProtection.helpers.js",
    "jeonseProtection.view.board.js",
    "jeonseProtection.view.cases.js",
    "jeonseProtection.view.wizard.js",
    "jeonseProtection.view.harness.js",
    "jeonseProtection.sidebar.js",
    "jeonseFraudProtectionHarness.js",
    "harnessCore.js",
    "harnessRegistry.js",
    "harnessVerification.js",
    "jeonseProtectionRules.js",
    "jeonseProtection.commands.js",
    "jeonsePublicData.adapters.js",
    "jeonsePriceRisk.service.js",
    "cclConsole.core.js",
    "cclConsole.data.js",
    "cclConsole.app.js",
    "fdrConsole.core.js",
    "fdrConsole.data.js",
    "fdrConsole.app.js",
]

required = [
    ROOT / "package.json",
    ROOT / "README.md",
    ROOT / "playwright.config.js",
    ROOT / "app/index.html",
    ROOT / "app/styles.css",
    ROOT / "app/wooricap.css",
    ROOT / "docs/01-시스템-아키텍처.md",
    ROOT / "docs/02-은행-DB-연동-설계.md",
    ROOT / "docs/03-JB우리캐피탈-하네스.md",
    ROOT / "docs/04-전세보호-역할-하네스.md",
    ROOT / "app/HARNESS_GUIDE.md",
    ROOT / "app/ROLE_HARNESS_CONTRACT.md",
    ROOT / "app/SECURITY_GUARDRAILS.md",
    ROOT / "scripts/api-proxy.mjs",
    ROOT / "tests/e2e/localguard.spec.js",
    ROOT / "tests/e2e/wooricap.spec.js",
] + [ROOT / "app" / name for name in app_js_files]

missing = [path for path in required if not path.exists()]
if missing:
    raise SystemExit("Missing files:\n" + "\n".join(str(path) for path in missing))

package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
required_scripts = {
    "dev": "python3 -m http.server 8000 --directory app",
    "build": "python3 scripts/verify_static.py",
    "test": "python3 scripts/verify_static.py",
    "test:e2e": "playwright test",
}
for name, command in required_scripts.items():
    if package.get("scripts", {}).get(name) != command:
        raise SystemExit(f"package.json script {name!r} should be {command!r}")

html = (ROOT / "app/index.html").read_text(encoding="utf-8")
css = (ROOT / "app/styles.css").read_text(encoding="utf-8")
js = (ROOT / "app/app.js").read_text(encoding="utf-8")

html_needles = [
    "org-rail",
    "nav-list",
    "page-content",
    "context-panel",
    "./wooricap-db.js",
    "./jbWooriCapitalSidebar.config.js",
    "./jbWooriCapitalAgents.registry.js",
    "./jbWooriCapitalServices.js",
    "./wooricap.helpers.js",
    "./wooricap.view.board.js",
    "./wooricap.view.cases.js",
    "./wooricap.view.wizard.js",
    "./wooricap.view.harness.js",
    "./wooricap.sidebar.js",
    "./wooricap.js",
    "./jeonseProtection.config.js",
    "./jeonseProtectionAgents.registry.js",
    "./jeonseProtection-db.js",
    "./jeonseProtectionServices.js",
    "./jeonseProtection.helpers.js",
    "./jeonseProtection.view.board.js",
    "./jeonseProtection.view.cases.js",
    "./jeonseProtection.view.wizard.js",
    "./jeonseProtection.view.harness.js",
    "./jeonseProtection.sidebar.js",
    "./jeonseFraudProtectionHarness.js",
    "./harnessCore.js",
    "./harnessRegistry.js",
    "./harnessVerification.js",
    "./jeonseProtectionRules.js",
    "./jeonseProtection.commands.js",
    "./jeonsePublicData.adapters.js",
    "./jeonsePriceRisk.service.js",
    "./cclConsole.core.js",
    "./fdrConsole.app.js",
    "./app.js",
]
for needle in html_needles:
    if needle not in html:
        raise SystemExit(f"HTML missing {needle!r}")

js_needles = [
    "computeRiskDecision",
    "buildDashboardData",
    "auditChainRecords",
    "moveCaseToColumn",
    "demoProfiles",
    "손은 놓고, 눈만",
    "liveAgentIds",
    "agentExecutionBadge",
    "그룹 확장성",
    "전세 안심 점검 · 로드맵",
    "GP-1 소상공인 자금압박",
    "GP-2 보이스피싱 차단",
    "RUNTIME_CONFIG",
    "ensureJeonseLiveMarket",
    "시세 출처",
    "jeonse-protection-harness",
    "jeonseProtectionHarnessPage",
]
for needle in js_needles:
    if needle not in js:
        raise SystemExit(f"JS missing {needle!r}")

wooricap_needles = [
    "JBWC_AFFILIATE_ID",
    "getJbWooriCapitalSidebarCounts",
    "affiliateId scope is required",
    "searchJbWooriCapitalRecordsAsync",
    "createJbWooriCapitalOpsCase",
    "recordJbWooriCapitalAgentRun",
    "jbWooriCapitalOpsHarness",
    "routeJbWooriCapitalCase",
    "/jb-woori-capital/cases/new",
    "JB우리캐피탈 운영지원 포털",
    "신규 JB우리캐피탈 운영 건 접수",
    "FDS & Voice Phishing Response Agent",
    "실제 대출 승인/거절",
    "내부 운영 참고용",
    "jbwcRepository",
    "JBWC_STATUS_LABELS",
    "JBWC_FIELD_LABELS",
    "jbwcViewRenderers",
    "그룹 확장성 증명",
]
joined_wooricap = "\n".join(
    (ROOT / "app" / name).read_text(encoding="utf-8")
    for name in app_js_files
    if name not in ("app.js", "modules.js")
)
for needle in wooricap_needles:
    if needle not in joined_wooricap:
        raise SystemExit(f"JB우리캐피탈 implementation missing {needle!r}")

for forbidden in ["전세 안심 점검", "jbWooriCapitalDashboardConfig", "roleDashboardPage(jbWooriCapital"]:
    if forbidden in joined_wooricap:
        raise SystemExit(f"JB우리캐피탈 dedicated layer should not contain {forbidden!r}")

# 역할 하네스(전세사기 보호 담당자) 계약 — 라벨-only 구현 금지, 계열사/메인 business alias 금지
jpo_files = [
    "jeonseProtection.config.js",
    "jeonseProtectionAgents.registry.js",
    "jeonseProtection-db.js",
    "jeonseProtectionServices.js",
    "jeonseProtection.helpers.js",
    "jeonseProtection.view.board.js",
    "jeonseProtection.view.cases.js",
    "jeonseProtection.view.wizard.js",
    "jeonseProtection.view.harness.js",
    "jeonseProtection.sidebar.js",
    "jeonseFraudProtectionHarness.js",
    "jeonseProtectionRules.js",
    "jeonseProtection.commands.js",
    "jeonsePublicData.adapters.js",
    "jeonsePriceRisk.service.js",
]
joined_jpo = "\n".join((ROOT / "app" / name).read_text(encoding="utf-8") for name in jpo_files)
jpo_needles = [
    "JPO_ROLE_KEY",
    "jeonse-protection-officer",
    "role scope is required",
    "getJeonseProtectionSidebarCounts",
    "searchJeonseProtectionRecordsAsync",
    "createJeonseProtectionCase",
    "recordJeonseProtectionAgentRun",
    "jeonseFraudProtectionHarness",
    "computeJeonseRiskAssessment",
    "fetchJeonseMarketData",
    "/roles/jeonse-protection",
    "전세사기 보호 업무지원 하네스",
    "신규 전세 위험/피해 의심 건 접수",
    "전세사기 보호 업무지원 포털",
    "피해지원 신청 검토",
    "위험 접수 보드",
    "내부 운영 참고용",
    "담당자 검토 필요",
    "최신 기준 담당자 확인 필요",
    "JEONSE-0001",
    "jeonse_price_snapshots",
    "JEONSE_RATIO_HIGH",
    "sourceMode",
    "JEONSE-RUN-0001",
    "jpoRepository",
    "JPO_STATUS_LABELS",
    "CUST-JS-",
    "JPO_MARKET_SNAPSHOT",
    "전세위험-",
    "익명 고객",
    "인근 거래 기준가",
    "대체 기준 사용",
    "실시간 API 기준",
    "EVALUATOR_CHECKED",
    "jpo-evaluator",
    "jeonse_evidence",
    "시세 비교 기록",
    "자동 실행 준비됨",
    "case-full",
    "/jeonse-daily-triage",
    "runJeonseLoopEvaluator",
    "jeonseProtectionSkills",
    "jeonseProtectionCommands",
    "jeonseProtectionHooks",
    "jeonseProtectionRules",
    "/jeonse-run-smoke-test",
    "beforeCaseCreate",
    "beforeCustomerMessage",
    "jpoDecideApproval",
]
for needle in jpo_needles:
    if needle not in joined_jpo:
        raise SystemExit(f"전세보호 role harness missing {needle!r}")

for forbidden in [
    "jbwcTable(",
    "JBWC_DOMAIN_TAXONOMY",
    "jbWooriCapitalAgents",
    "jbWooriCapitalOpsHarness",
    "roleDashboardPage(",
    "전세 안심 점검",
]:
    if forbidden in joined_jpo:
        raise SystemExit(f"전세보호 role harness should not contain {forbidden!r}")

if "jeonse-protection-dashboard" in js or "jeonseProtectionDashboardConfig" in js:
    raise SystemExit("label-only jeonse-protection-dashboard resurfaced in app.js")

# ---- ECC 하네스 표준 계층 계약 ----
harness_core = (ROOT / "app/harnessCore.js").read_text(encoding="utf-8")
harness_registry = (ROOT / "app/harnessRegistry.js").read_text(encoding="utf-8")
harness_verify = (ROOT / "app/harnessVerification.js").read_text(encoding="utf-8")
for needle in [
    "registerHarness",
    "harnessRunHooks",
    "harnessGuardCheckPII",
    "describeNewHarnessScaffold",
]:
    if needle not in harness_core:
        raise SystemExit(f"harnessCore missing {needle!r}")
for needle in ['id: "jeonse-protection"', 'id: "jb-woori-capital"', "scopeProbe", "enforceHooks"]:
    if needle not in harness_registry:
        raise SystemExit(f"harnessRegistry missing {needle!r}")
for needle in [
    "verifyHarnessIntegrity",
    "verifyRoleHarnessScope",
    "verifyNoForbiddenRoleResurface",
    "verifyNoPIILeakage",
    "verifyAgentRegistryCompleteness",
    "verifyHookCoverage",
    "runHarnessSelfTest",
]:
    if needle not in harness_verify:
        raise SystemExit(f"harnessVerification missing {needle!r}")

# ---- 역할 콘솔 계약 (기업여신 ccl / FDS fdr) ----
console_src = "".join((ROOT / f"app/{name}").read_text(encoding="utf-8") for name in [
    "cclConsole.core.js", "cclConsole.data.js", "cclConsole.app.js",
    "fdrConsole.core.js", "fdrConsole.data.js", "fdrConsole.app.js",
])
for needle in [
    "기업여신 심사지원 포털", "여신 검토 보드", "BIZ-REF-", "실제 대출 승인/거절 확정 금지",
    "금리/한도 산정 금지", "품의 초안", "corporate-credit",
    "FDS·보이스피싱 대응 포털", "경보 대응 보드", "CUST-FD-", "경보 자동 종결 금지",
    "closedByHuman", "fds-response", "role scope is required",
]:
    if needle not in console_src:
        raise SystemExit(f"role console missing {needle!r}")
app_src = (ROOT / "app/app.js").read_text(encoding="utf-8")
for needle in ["#corporate-credit-dashboard", "#fds-dashboard"]:
    if needle in app_src:
        raise SystemExit(f"label-only dashboard hash 재유입: {needle!r}")
for needle in ["corporate-credit-harness", "fds-response-harness", "/roles/corporate-credit/board", "/roles/fds-response/board"]:
    if needle not in app_src:
        raise SystemExit(f"app.js console wiring missing {needle!r}")

# ---- 공공데이터 프록시 계약 (키는 환경변수로만) ----
proxy_src = (ROOT / "scripts/api-proxy.mjs").read_text(encoding="utf-8")
for needle in [
    "MOLIT_SERVICE_KEY",
    "SEOUL_OPEN_API_KEY",
    "MOVEVALUE_SEOUL_OPEN_API_KEY",
    "MOLIT_APT_TRADE_KEY",
    "MOLIT_OFFICETEL_RENT_KEY",
    "/jeonse/market",
    "process.env",
]:
    if needle not in proxy_src:
        raise SystemExit(f"api-proxy missing {needle!r}")
if re.search(r"serviceKey\s*[:=]\s*[\"'][A-Za-z0-9+/=%]{20,}", proxy_src):
    raise SystemExit("api-proxy에 하드코딩된 키가 있는 것으로 보임")

# ---- 금지 alias/단정 리터럴 + 실PII 패턴 정적 스캔 ----
all_app_js = "\n".join((ROOT / "app" / name).read_text(encoding="utf-8") for name in app_js_files)
scan_target = all_app_js + html
for forbidden in [
    "mainHarness",
    "defaultHarness",
    "safetyHarness",
    "전세사기 확정",
    "피해자 결정 확정",
    "보증 가능 확정",
]:
    if forbidden in scan_target:
        raise SystemExit(f"forbidden harness/assertion literal found: {forbidden!r}")

pii_scan = scan_target.replace("010-0000-0000", "")  # 마스킹 데모 센티널 제외
for label, pattern in [
    ("주민등록번호", r"\d{6}-[1-4]\d{6}"),
    ("전화번호", r"01[016789]-\d{3,4}-\d{4}"),
]:
    if re.search(pattern, pii_scan):
        raise SystemExit(f"실제 {label} 패턴이 소스에 존재함")

if "border-radius: 8px" not in css:
    raise SystemExit("CSS should keep cards and controls at 8px radius")
if "Pretendard" not in css:
    raise SystemExit("CSS should use Pretendard as the primary font")

for script in app_js_files:
    node_check = subprocess.run(
        ["node", "--check", str(ROOT / "app" / script)],
        text=True,
        capture_output=True,
        check=False,
    )
    if node_check.returncode != 0:
        raise SystemExit(node_check.stderr or node_check.stdout)

doc_contracts = {
    "app/HARNESS_GUIDE.md": ["Agents", "Skills", "Commands", "Hooks", "Rules", "Continuous Learning"],
    "app/ROLE_HARNESS_CONTRACT.md": ["신규 역할 하네스 추가 절차", "금지", "manifest"],
    "app/SECURITY_GUARDRAILS.md": ["PII", "자동 종결 금지", "승인"],
}
for path, needles in doc_contracts.items():
    text = (ROOT / path).read_text(encoding="utf-8")
    for needle in needles:
        if needle not in text:
            raise SystemExit(f"{path} missing {needle!r}")

print("static verification passed")
print(f"checked files: {len(required)}")
