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
    "agentModelSettings.js",
    "corporateCredit.config.js",
    "corporateCreditAgents.registry.js",
    "corporateCreditRules.js",
    "corporateCreditFinancialData.adapters.js",
    "corporateCreditRisk.service.js",
    "corporateCredit-db.js",
    "corporateCreditServices.js",
    "corporateCreditEvidence.service.js",
    "corporateCredit.helpers.js",
    "corporateCredit.view.board.js",
    "corporateCredit.view.cases.js",
    "corporateCredit.view.wizard.js",
    "corporateCredit.view.harness.js",
    "corporateCredit.commands.js",
    "corporateCredit.sidebar.js",
    "corporateCreditHarness.js",
    "rmOfficer.config.js",
    "rmOfficerAgents.registry.js",
    "rmOfficerWorkMap.js",
    "rmOfficerCapabilities.js",
    "rmOfficerRules.js",
    "rmOfficerPriority.service.js",
    "rmOfficerDeliverable.service.js",
    "rmOfficer-db.js",
    "rmOfficerServices.js",
    "rmOfficer.helpers.js",
    "rmOfficer.view.board.js",
    "rmOfficer.view.cases.js",
    "rmOfficer.view.wizard.js",
    "rmOfficer.view.harness.js",
    "rmOfficer.commands.js",
    "rmOfficer.sidebar.js",
    "rmOfficerHarness.js",
    "rmoMemoryCards.js",
    "rmoCaseOntology.js",
    "rmoEngineSwitch.js",
]

required = [
    ROOT / "package.json",
    ROOT / "README.md",
    ROOT / "playwright.config.js",
    ROOT / "app/index.html",
    ROOT / "app/styles.css",
    ROOT / "app/wooricap.css",
    ROOT / "app/jeonseProtection.exec.css",
    ROOT / "docs/01-시스템-아키텍처.md",
    ROOT / "docs/02-은행-DB-연동-설계.md",
    ROOT / "docs/03-JB우리캐피탈-하네스.md",
    ROOT / "docs/04-전세보호-역할-하네스.md",
    ROOT / "docs/05-RM-하네스.md",
    ROOT / "docs/06-백엔드-서버.md",
    ROOT / "docs/07-백엔드-루프-검증.md",
    ROOT / "app/HARNESS_GUIDE.md",
    ROOT / "app/ROLE_HARNESS_CONTRACT.md",
    ROOT / "app/SECURITY_GUARDRAILS.md",
    ROOT / "server/index.mjs",
    ROOT / "server/lib/seed.mjs",
    ROOT / "server/lib/repository.mjs",
    ROOT / "server/lib/supabaseRepository.mjs",
    ROOT / "server/sql/supabase-api-state.sql",
    ROOT / "scripts/api-proxy.mjs",
    ROOT / "scripts/ollama-agent-proxy.mjs",
    ROOT / "tests/backend/server.test.mjs",
    ROOT / "tests/e2e/localguard.spec.js",
    ROOT / "tests/e2e/wooricap.spec.js",
    ROOT / "tests/e2e/corporate-credit-smoke.spec.js",
    ROOT / "tests/e2e/rm-officer.spec.js",
    ROOT / "tests/e2e/rm-officer-smoke.spec.js",
] + [ROOT / "app" / name for name in app_js_files]

missing = [path for path in required if not path.exists()]
if missing:
    raise SystemExit("Missing files:\n" + "\n".join(str(path) for path in missing))

package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
required_scripts = {
    "dev": "python3 -m http.server 8000 --directory app",
    "build": "python3 scripts/verify_static.py",
    "backend": "node server/index.mjs",
    "backend:test": "node --test tests/backend/*.test.mjs",
    "test": "python3 scripts/verify_static.py",
    "test:e2e": "playwright test",
}
for name, command in required_scripts.items():
    if package.get("scripts", {}).get(name) != command:
        raise SystemExit(f"package.json script {name!r} should be {command!r}")

html = (ROOT / "app/index.html").read_text(encoding="utf-8")
css = (ROOT / "app/styles.css").read_text(encoding="utf-8")
jpo_exec_css = (ROOT / "app/jeonseProtection.exec.css").read_text(encoding="utf-8")
js = (ROOT / "app/app.js").read_text(encoding="utf-8")

html_needles = [
    "org-rail",
    "nav-list",
    "page-content",
    "context-panel",
    "./wooricap-db.js",
    "./jeonseProtection.exec.css",
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
    "./agentModelSettings.js",
    "./corporateCredit.config.js",
    "./corporateCreditAgents.registry.js",
    "./corporateCreditRules.js",
    "./corporateCreditFinancialData.adapters.js",
    "./corporateCreditRisk.service.js",
    "./corporateCredit-db.js",
    "./corporateCreditServices.js",
    "./corporateCreditEvidence.service.js",
    "./corporateCredit.helpers.js",
    "./corporateCredit.view.board.js",
    "./corporateCredit.view.cases.js",
    "./corporateCredit.view.wizard.js",
    "./corporateCredit.view.harness.js",
    "./corporateCredit.commands.js",
    "./corporateCredit.sidebar.js",
    "./corporateCreditHarness.js",
    "./rmOfficer.config.js",
    "./rmOfficerAgents.registry.js",
    "./rmOfficerWorkMap.js",
    "./rmOfficerCapabilities.js",
    "./rmOfficerRules.js",
    "./rmOfficerPriority.service.js",
    "./rmOfficerDeliverable.service.js",
    "./rmOfficer-db.js",
    "./rmOfficerServices.js",
    "./rmOfficer.helpers.js",
    "./rmOfficer.view.board.js",
    "./rmOfficer.view.cases.js",
    "./rmOfficer.view.wizard.js",
    "./rmOfficer.view.harness.js",
    "./rmOfficer.commands.js",
    "./rmOfficer.sidebar.js",
    "./rmOfficerHarness.js",
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
    "ROLE_ACTIVATION_PHASES",
    "roleActivationLockedWorkspaceView",
    "startRoleActivation",
    "권한 확인",
    "업무 데이터 연결",
    "케이스 보드 생성",
    "상세 패널 활성화",
    "에이전트 실행 큐 표시",
    "역할을 선택하면 업무 화면이 활성화됩니다.",
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

role_activation_css_needles = [
    ".role-lock-console",
    ".role-skeleton-card",
    ".role-activation-page",
    ".role-activation-step.is-current",
    ".activation-context-panel",
    "@media (prefers-reduced-motion: reduce)",
]
for needle in role_activation_css_needles:
    if needle not in css:
        raise SystemExit(f"role activation CSS missing {needle!r}")

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
    "jeonseProtectionSkills",
    "jeonseProtectionCommands",
    "jeonseProtectionHooks",
    "jeonseProtectionRules",
    "/jeonse-run-smoke-test",
    "beforeCaseCreate",
    "beforeCustomerMessage",
    "jpoDecideApproval",
    "jpoQueueNodesForCase",
    "runJeonseProtectionQueueNode",
    "jeonse_deliverables",
    "jeonse_evidence_files",
    "JPO_FILE_METADATA_CAPTURED",
    "JPO_DELIVERABLE_CREATED",
    "선택된 케이스의 실행 큐",
    "조금만 기다려주세요",
    "Space 다음",
]
for needle in jpo_needles:
    if needle not in joined_jpo:
        raise SystemExit(f"전세보호 role harness missing {needle!r}")

for needle in [
    ".jpo-key-overlay",
    ".jpo-run-overlay",
    ".jpo-sub-workspace",
    ".jpo-command-strip",
    ".properties-resizer",
    "jpo-risk-high",
]:
    if needle not in jpo_exec_css:
        raise SystemExit(f"전세보호 실행 콘솔 CSS missing {needle!r}")

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

# 기업여신 담당자 role harness 계약 — 전세/계열사 하네스 복제 금지, role scope 강제
ccr_files = [
    "corporateCredit.config.js",
    "corporateCreditAgents.registry.js",
    "corporateCreditRules.js",
    "corporateCreditFinancialData.adapters.js",
    "corporateCreditRisk.service.js",
    "corporateCredit-db.js",
    "corporateCreditServices.js",
    "corporateCreditEvidence.service.js",
    "corporateCredit.helpers.js",
    "corporateCredit.view.board.js",
    "corporateCredit.view.cases.js",
    "corporateCredit.view.wizard.js",
    "corporateCredit.view.harness.js",
    "corporateCredit.commands.js",
    "corporateCredit.sidebar.js",
    "corporateCreditHarness.js",
]
joined_ccr = "\n".join((ROOT / "app" / name).read_text(encoding="utf-8") for name in ccr_files)
ccr_needles = [
    "CCR_ROLE_KEY",
    "corporate-credit",
    "role scope is required",
    "getCorporateCreditSidebarCounts",
    "searchCorporateCreditRecordsAsync",
    "createCorporateCreditCase",
    "recordCorporateCreditAgentRun",
    "corporateCreditOfficerHarness",
    "previewCorporateCreditTriage",
    "computeCorporateCreditRiskSignals",
    "/roles/corporate-credit",
    "기업여신 업무지원 포털",
    "신규 기업여신 운영 건 접수",
    "운전자금",
    "PF·구조화 금융",
    "조기경보/EWS",
    "여신메모 초안",
    "실제 대출 승인/거절 금지",
    "실제 금리/한도 산정 금지",
    "내부 운영 참고용",
    "담당자 검토 필요",
    "corporate_credit_cases",
    "corporate_credit_agent_runs",
    "corporate_credit_agent_handoffs",
    "corporate_credit_audit_logs",
    "ccrRepository",
    "corporateCreditHooks",
    "Compliance Guardrail Evaluator Agent",
    "runCorporateCreditOllamaSampleRequest",
    "runAgentModelRequest",
    "runtimeStatus",
    "로컬 모델 실행",
]
for needle in ccr_needles:
    if needle not in joined_ccr:
        raise SystemExit(f"기업여신 role harness missing {needle!r}")

for forbidden in [
    "jpoTable(",
    "JPO_ROLE_KEY",
    "jeonseProtectionAgents",
    "jeonseFraudProtectionHarness",
    "jbwcTable(",
    "jbWooriCapitalOpsHarness",
    "전세 안심 점검",
    "전세사기",
    "임대인",
    "보증금",
]:
    if forbidden in joined_ccr:
        raise SystemExit(f"기업여신 role harness should not contain {forbidden!r}")

ccr_harness_registry = (ROOT / "app/harnessRegistry.js").read_text(encoding="utf-8")
for needle in ['id: "corporate-credit"', "corporateCreditOfficerHarness", "scopeProbe"]:
    if needle not in ccr_harness_registry:
        raise SystemExit(f"harnessRegistry missing 기업여신 계약 {needle!r}")

# RM(관계관리 담당자) role harness 계약 — 전세/기업여신/계열사 하네스 복제 금지, role scope 강제.
# 페르소나 이름은 needle에 넣지 않는다([조건부] 정합차) — 제목·버튼·에이전트명 등 안정 라벨만 검증.
rmo_files = [
    "rmOfficer.config.js",
    "rmOfficerAgents.registry.js",
    "rmOfficerWorkMap.js",
    "rmOfficerCapabilities.js",
    "rmOfficerRules.js",
    "rmOfficerPriority.service.js",
    "rmOfficerDeliverable.service.js",
    "rmOfficer-db.js",
    "rmOfficerServices.js",
    "rmOfficer.helpers.js",
    "rmOfficer.view.board.js",
    "rmOfficer.view.cases.js",
    "rmOfficer.view.wizard.js",
    "rmOfficer.view.harness.js",
    "rmOfficer.commands.js",
    "rmOfficer.sidebar.js",
    "rmOfficerHarness.js",
]
joined_rmo = "\n".join((ROOT / "app" / name).read_text(encoding="utf-8") for name in rmo_files)
rmo_needles = [
    "RMO_ROLE_KEY",
    "rm-officer",
    "role scope is required",
    "getRmOfficerSidebarCounts",
    "searchRmOfficerRecordsAsync",
    "createRmOfficerCase",
    "recordRmOfficerAgentRun",
    "approveRmOfficerAssignment",
    "rmOfficerHarness",
    "previewRmOfficerPriority",
    "computeRmOfficerPriority",
    "/roles/rm-officer",
    "RM 업무지원 포털",
    "신규 여신 상담 건 접수",
    "업무보드",
    "여신 상담 큐",
    "정책금융 체크리스트",
    "승인 라우팅",
    "통합 리포트",
    "우선순위 근거",
    "내부 업무 참고용",
    "담당자 검토 필요",
    "rm_officer_cases",
    "rm_officer_agent_runs",
    "rm_officer_agent_handoffs",
    "rm_officer_audit_logs",
    "rmoRepository",
    "rmOfficerHooks",
    "rmOfficerCommands",
    "RMO_STAGE_BY_STATUS",
    "Marine Risk Agent",
    "Action Agent",
    "Compliance Guardrail Evaluator Agent",
    "양식장 재해위험 대응",
    "전주 중앙로 카페 여신 상담",
    "조금만 기다려주세요",
    "Enter를 눌러 승인해주세요",
    "runRmOfficerOllamaSampleRequest",
    "runAgentModelRequest",
    "runtimeStatus",
    "로컬 모델 실행",
    "/rm-run-smoke-test",
    "rmoBuildWorkMapTree",
    "RMO_NODE_STATUS_LABELS",
    "RMO_NODE_STATUS_COLOR",
    "rmoNodeStatusColorClass",
    "needsApproval",
    "에이전트 업무 계층도",
    "직원 최종 승인",
    "rmoApproveCaseReport",
    "rmoRerunWorkMapNode",
    "bizCreditReferral",
    "fraudResponse",
    "agriPostMonitoring",
    "선행 분석 노드를 먼저 완료해야 합니다",
    "업무 기능 저장소",
    "RMO_CAPABILITY_CATEGORIES",
    "rmoCapabilityRepositoryView",
    "관리 및 운영 기능",
    "주의 신호 분류",
    "정책자금 초안 검토",
    "상환 일정 분석",
    "리마인드 자동화",
    "외부 데이터 연결",
    "보고서 생성",
    "담당자 승인 절차",
    "감사 기록",
    "통합 리포트 생성",
    "담당 역할",
    "산출물 유형",
    "핵심 요약",
    "직원 액션",
    "rmoDeliverableDocType",
]
for needle in rmo_needles:
    if needle not in joined_rmo:
        raise SystemExit(f"RM role harness missing {needle!r}")

for forbidden in [
    "jpoTable(",
    "JPO_ROLE_KEY",
    "jeonseProtectionAgents",
    "jeonseFraudProtectionHarness",
    "jbwcTable(",
    "jbWooriCapitalOpsHarness",
    "ccrTable(",
    "CCR_ROLE_KEY",
    "corporateCreditOfficerHarness",
    "roleDashboardPage(",
    "전세사기",
]:
    if forbidden in joined_rmo:
        raise SystemExit(f"RM role harness should not contain {forbidden!r}")

rmo_harness_registry = (ROOT / "app/harnessRegistry.js").read_text(encoding="utf-8")
for needle in ['id: "rm-officer"', "rmOfficerHarness", "getRmOfficerSidebarCounts"]:
    if needle not in rmo_harness_registry:
        raise SystemExit(f"harnessRegistry missing RM 계약 {needle!r}")

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

ollama_proxy_src = (ROOT / "scripts/ollama-agent-proxy.mjs").read_text(encoding="utf-8")
agent_model_src = (ROOT / "app/agentModelSettings.js").read_text(encoding="utf-8")
for needle in [
    "OLLAMA_BASE",
    "OLLAMA_MODEL",
    "/agent/health",
    "/agent/run",
    "http://127.0.0.1:11434",
    "실제 대출 승인/거절",
    "requiresHumanReview",
]:
    if needle not in ollama_proxy_src:
        raise SystemExit(f"ollama-agent-proxy missing {needle!r}")
for needle in [
    "AGENT_MODEL_SETTINGS_KEY",
    "agentModelSettingsPanelMarkup",
    "checkAgentModelHealth",
    "runAgentModelRequest",
    "/agent/models",
    "data-agent-model-select",
    "forceOllama",
    "http://127.0.0.1:8030",
    "Ollama 로컬 모델",
]:
    if needle not in agent_model_src:
        raise SystemExit(f"agentModelSettings missing {needle!r}")
if re.search(r"(api[_-]?key|token|secret)\s*[:=]\s*[\"'][A-Za-z0-9+/=%]{20,}", ollama_proxy_src, re.I):
    raise SystemExit("ollama-agent-proxy에 credential 하드코딩 의심 문자열이 있음")

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

# RM 업무 계층도 노드 상태 6색이 CSS에 실제로 정의되어 있는지 확인(회색/파랑/노랑/초록/빨강/보라)
for node_color_class in [".rmo-node-gray", ".rmo-node-blue", ".rmo-node-yellow", ".rmo-node-green", ".rmo-node-red", ".rmo-node-purple"]:
    if node_color_class not in css:
        raise SystemExit(f"RM work map 노드 상태색 CSS 누락: {node_color_class!r}")

for script in app_js_files:
    node_check = subprocess.run(
        ["node", "--check", str(ROOT / "app" / script)],
        text=True,
        capture_output=True,
        check=False,
    )
    if node_check.returncode != 0:
        raise SystemExit(node_check.stderr or node_check.stdout)

proxy_check = subprocess.run(
    ["node", "--check", str(ROOT / "scripts/ollama-agent-proxy.mjs")],
    text=True,
    capture_output=True,
    check=False,
)
if proxy_check.returncode != 0:
    raise SystemExit(proxy_check.stderr or proxy_check.stdout)

for backend_script in [
    ROOT / "server/index.mjs",
    ROOT / "server/lib/seed.mjs",
    ROOT / "server/lib/repository.mjs",
    ROOT / "server/lib/supabaseRepository.mjs",
    ROOT / "tests/backend/server.test.mjs",
]:
    backend_check = subprocess.run(
        ["node", "--check", str(backend_script)],
        text=True,
        capture_output=True,
        check=False,
    )
    if backend_check.returncode != 0:
        raise SystemExit(backend_check.stderr or backend_check.stdout)

backend_src = (ROOT / "server/index.mjs").read_text(encoding="utf-8")
for needle in [
    "/api/roles",
    "/api/cases",
    "/api/agent-runs",
    "/api/deliverables",
    "/api/audit-logs",
    "/api/public-data/jeonse/market",
    "/api/model-runtime/run",
    "FILE_UPLOADED",
    "AGENT_RUN_COMPLETED",
    "JB_DB_DRIVER",
    "SupabaseRepository",
]:
    if needle not in backend_src:
        raise SystemExit(f"backend server missing {needle!r}")

supabase_src = (ROOT / "server/lib/supabaseRepository.mjs").read_text(encoding="utf-8")
for needle in [
    "/rest/v1",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "authorization",
    "resolution=merge-duplicates",
]:
    if needle not in supabase_src:
        raise SystemExit(f"supabase repository missing {needle!r}")

supabase_sql = (ROOT / "server/sql/supabase-api-state.sql").read_text(encoding="utf-8")
for needle in [
    "create table if not exists public.jb_backend_state",
    "payload jsonb not null",
    "enable row level security",
    "service_role",
]:
    if needle not in supabase_sql:
        raise SystemExit(f"supabase sql missing {needle!r}")

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
