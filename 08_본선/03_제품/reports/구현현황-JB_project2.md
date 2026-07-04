---
tags: [area/product, type/reference, status/active]
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases: [JB_project2 구현현황, implementation-inventory]
---

# JB_project2 구현현황 — 페이지·뷰·컴포넌트·함수·데이터 총정리 (코드 SSOT)

> 대상: `_vendor/JB_project2/app/` (읽기 전용 벤더 클론, 이승보 프로토타입 = 제출 코드정본). 모든 수치는 `grep`/파일 직독으로 확인한 실측치이며, 확인 안 된 항목은 `[미확인]`으로 표시했다.
>
> **⚠ 델타 (2026-07-04 야간 pull, upstream 0226bd6)**: 아래 §0~§8 실측치는 `e57b826` 기준이다. 이후 **RM 역할 하네스 신설 3커밋(+3,650줄)** 이 들어왔다 — `rmOfficer.*` 18개 신규 파일(에이전트 레지스트리 319줄·db·서비스·보드/케이스/위저드 뷰), `AGENTS.md`(Codex 오케스트레이션 계약 333줄), e2e 2종(`rm-officer*.spec.js`), 자체 `scripts/verify_static.py`. **5번째 콘솔 = RM 역할 하네스** — 콘솔 수·파일 수·에이전트 로스터 집계는 재실측 필요 [미갱신].

## 0. 파일 구성 (실측)

당초 CLAUDE.md 설명(`index.html` + `app.js` ~250KB + `modules.js` + `styles.css` ~150KB)보다 훨씬 커졌다. 실제 앱 디렉터리는 **43개 파일, 총 24,667줄**의 4-콘솔 번들 구조다.

| 파일군 | 파일 수 | 대표 파일(줄 수) |
|---|---|---|
| 코어/셸 | index.html(120), app.js(5,766), modules.js(865) | 원본 MVP 로직 + 셸 |
| 하네스 엔진 | harnessCore.js(141), harnessRegistry.js(153), harnessVerification.js(101) | 공유 가드레일/자체검증 |
| 기업여신(CCL) 콘솔 | cclConsole.core/data/app.js(244+280+397=921줄) | — |
| FDS/피싱(FDR) 콘솔 | fdrConsole.core/data/app.js(253+302+421=976줄) | — |
| 전세보호(JPO) 콘솔 | jeonseProtection\* 14개 파일(약 3,300줄) | 가장 큰 콘솔 |
| JB우리캐피탈(JBWC) 콘솔 | jbWooriCapital\*, wooricap\* 10개 파일(약 2,600줄) + wooricap.css(771줄) | 자체 CSS 파일 별도 보유 |
| 스타일 | styles.css(8,696줄), wooricap.css(771줄) | 디자인 토큰/컴포넌트 |

`index.html`의 `<script>` 로드 순서: `modules.js → harnessCore.js → (JBWC 번들) → (JPO 번들) → cclConsole.* → fdrConsole.* → harnessRegistry.js → harnessVerification.js → app.js`(마지막, 메인 오케스트레이터).

---

## 1. 역할 콘솔 / 계열사·역할축

`index.html`의 `org-rail`은 **계열사 전환**(전체/전북은행/JB우리캐피탈)과 **역할 전환**(RM/기업여신 담당자/전세보호 담당자/보이스피싱·FDS 담당자) 두 축을 별도로 노출한다. 실제로 구현된 진입점은 6개다.

| 진입점 | 트리거 | roleKey/routeBase | 비고 |
|---|---|---|---|
| 기본 업무 보드(원본 MVP) | 계열사=전체/전북은행 | (route-key 없음, `navigation` 배열, 15개 아이템) | app.js 고유, 예선부터 있던 케이스 대시보드 |
| RM 대시보드 | 역할=RM | `rm-dashboard` (단일 뷰, 하위 라우트 없음) | app.js:1769 `rmDashboardPage`, 콘솔이 아니라 단일 페이지 |
| 기업여신 담당자 콘솔(CCL) | 역할=기업여신 담당자 | `corporate-credit` / `/roles/corporate-credit` | cclConsole.\* |
| FDS/보이스피싱 담당자 콘솔(FDR) | 역할=보이스피싱/FDS 담당자 | `fds-response` / `/roles/fds-response` | fdrConsole.\* |
| 전세보호 담당자 콘솔(JPO) | 역할=전세보호 담당자 | `jeonse-protection` / `/roles/jeonse-protection` | jeonseProtection.\* (가장 방대) |
| JB우리캐피탈 콘솔(JBWC) | 계열사=JB우리캐피탈 | `/jb-woori-capital` | wooricap.\*, jbWooriCapital\* — **역할 전환이 아니라 계열사 전환**에 걸림 |

라우팅은 `app.js:5705` `applyHashRoute()`가 4개 콘솔의 `xxxRouteFromHash()`를 순서대로 시도(jbwc → jpo → ccl → fdr)한 뒤에야 원본 `navigation` 매칭으로 폴백하는 단일 디스패처 구조.

---

## 2. 페이지/뷰/라우트 (콘솔별 전체 목록)

### 2-1. 기업여신 담당자(CCL) — 14개 뷰 (`cclConsole.core.js` `CCL_VIEWS`)
`board · cases · cases-new · doc-check · approval-drafts · financial-summary · repayment-check · policy-match · early-warning · consult-log · reply-drafts · ai-analysis · agent-harness · audit-logs`
칸반 컬럼(`CCL_BOARD_COLUMNS`, 6개): 신규 접수 → 자료 수집 → AI 검토 → 담당자 검토 필요 → 품의 진행 → 완료·보류.

### 2-2. FDS/보이스피싱 담당자(FDR) — 15개 뷰 (`fdrConsole.core.js:41-57`)
`board · cases · cases-new · block-review · escalations · anomaly-signals · elder-guard · pattern-summary · rule-status · contact-scripts · payment-hold-guide · follow-up · ai-analysis · agent-harness · audit-logs`

### 2-3. 전세보호 담당자(JPO) — 29개 뷰 (`jeonseProtection.config.js` `JPO_VIEWS`, 콘솔 중 최다)
`board · cases · cases-new · price-enrich · registry-check · guarantee-check · victim-application · urgent-auction · price-risk · rent-comparables · sale-comparables · official-price · building-check · landlord-risk · intake-consult · victim-guide · doc-checklist · legal-referral · finance-housing-referral · care-referral · support-referral · ai-analysis · ai-consult-summary · agent-harness · data-connectors · roles · audit-logs · inspections · case-full`
(라이브 데모 전용 `?live=1` 경로가 `jeonsePublicData.adapters.js`를 통해 실제 `fetch()`를 수행하는 유일한 뷰 — 나머지는 전부 로컬 seed.)

### 2-4. JB우리캐피탈(JBWC) — 24개 뷰 (`jbWooriCapitalSidebar.config.js` `JBWC_VIEWS`)
`board · approvals · audit-logs · privacy-permissions · integrations · cases · cases-new · ai-analysis · ai-assist · capabilities · roles · inspections · consumer-protection · alerts · personal-finance · auto-finance · mortgage-secured · enterprise-finance · customer-management · documents · vehicle-lifecycle · fds · complaints · agent-harness`

### 2-5. 원본 업무 보드(base app) — 15개 nav 아이템 + `rm-dashboard`
`app.js` 최상단 `navigation` 배열(15개, dashboard/approvals 등)과 별도 단일 페이지 `rm-dashboard`. 이 계층은 콘솔이 아니라 예선 단계부터 이어진 flat 페이지 목록이다.

**총 라우트 실측치(소스 `*_VIEWS` 객체 전수): CCL 14 + FDR 15 + JPO 29 + JBWC 24 + base 15 + rm-dashboard 1 = 98개 뷰 키.** (기획 문서에서 언급될 "콘솔 수"는 4가 아니라 base+RM까지 포함하면 6개 진입점으로 계산해야 함.) *초판은 config 라인범위 기준 91로 집계했으나, 소스 `*_VIEWS` 오브젝트 전수 카운트 결과 98이 정확 — 2026-07-04 정정.*

---

## 3. 컴포넌트 (styles.css 실측)

- `styles.css` 고유 클래스 선택자: **484개**(`grep -oE '\.[a-zA-Z][a-zA-Z0-9_-]*' styles.css | sort -u | wc -l`)
- `wooricap.css`(JBWC 전용 별도 스타일시트) 고유 클래스: **53개** → 두 파일 합산 실질 컴포넌트 클래스 **537개** (과제 설명의 "~481개"는 styles.css 단독 수치와 근접, wooricap.css는 별도 카운트가 필요)

컴포넌트 계열(이름에 패턴 포함, 중복 제거 카운트):
| 계열 | 개수 |
|---|---|
| `*panel*` | 28 |
| `*card*` | 21 |
| `*board*` | 9 |
| `*badge*` | 6 |
| `*chip*` | 3 |
| `*pill*` | 2 (status-pill 등은 `status-*` 계열로 별도 분류됨) |
| `*kanban*` | 1 |
| `*timeline*` | 1 |
| `*modal*` | 1 |
| `*tag*` | 1 |

`status-pill`류(승인 대기/차단/검토 필요 등 상태 배지)는 각 콘솔 렌더러(`cclList`, `fdrList`, `jbwc-row` 등)에서 광범위하게 재사용되는 실질적 최다 사용 컴포넌트지만 클래스명 검색 패턴상 "pill" 계열에 잡히지 않아 위 표에서 저평가됨 — 실사용 빈도 기준 최다 컴포넌트는 `status-pill` 변형.

---

## 4. 핵심 함수/함수 계약 — 실제 vs 목업

| 함수 | 위치 | 성격 |
|---|---|---|
| `computeRiskDecision(item)` | app.js:4687 | **REAL** 결정론적 가중합 스코어링(도메인별 5개 signal × weight). LLM 미호출, 하드코딩된 signal 문구 템플릿에 실제 케이스 필드값 삽입 |
| `buildDashboardData()` | app.js:4608 | **REAL** 로컬 state 집계 함수 |
| `auditChainRecords(item)` | app.js:4494 | **REAL** 해시체인 감사로그 — `simpleHash()`(FNV-1a 32bit, app.js:4485)로 `previousHash` 연쇄. **단, 이 해시체인은 base app에만 존재**하며 CCL/FDR/JPO/JBWC 4개 역할 콘솔의 `*_audit_logs` 테이블은 해시체인 없이 평문 리스트로만 렌더링됨(예: cclConsole.app.js:193-199) — 콘솔 전체에 일관 적용되지 않은 기능 |
| `moveCaseToColumn(caseId, column)` | app.js:5351 | **REAL** in-memory 상태 변경(직접 mutation, 커스텀 undo 없음) + 승인대기 이동 시 산출물 생성 훅 트리거 |
| `createCorporateCreditCase(form)` | cclConsole.data.js:179 | **REAL** — CCL 전용 케이스 생성, `harnessRunHooks("afterCaseCreate", …)` 경유 |
| `recordCorporateCreditAgentRun(run)` | cclConsole.data.js:219 | **REAL** 로컬 append, 출력 텍스트 자체는 하드코딩된 템플릿(**MOCKED LLM output**) |
| `cclDecideApproval(approvalId, decision, decidedBy)` | cclConsole.data.js:238 | **REAL** 승인/반려 상태 전이 로직 |
| `harnessGuardCheckPII / CheckAssertions / CheckScope / CheckAutoClose / CheckApprovalRequired` | harnessCore.js:74-110 | **REAL** — 정규식 기반 주민번호/전화번호/11자리 이상 숫자열 탐지, scope 필드 강제, high/critical 자동종결 차단, 고객발송 승인누락 차단. 실제 동작하는 가드레일(모의 아님) |
| `verifyHarnessIntegrity / verifyRoleHarnessScope / verifyNoForbiddenRoleResurface / verifyNoPIILeakage / verifyAgentRegistryCompleteness / verifyHookCoverage / runHarnessSelfTest` | harnessVerification.js 전체 | **REAL** 자체 검증기 — manifest 필수키·countService·PII DOM 스캔(`document.body.innerText` 정규식 검사)·agent 필드 완결성·hook 커버리지를 실제로 실행해 `window.__lastHarnessSelfTest`에 기록. mock이 아니라 런타임에 도는 self-test |

**LLM 실호출 여부**: 코드 전체에서 `fetch()`는 단 2곳(app.js:705, jeonsePublicData.adapters.js:91) — 둘 다 **data.go.kr 공공데이터(전세 실거래가) 조회**용이며 `?live=1` 데모 슬라이스 전용. OpenAI/Anthropic 등 LLM API 호출은 **전무**. 모든 "AI 에이전트 산출물"은 JS 템플릿 문자열에 케이스 필드를 보간한 정적 텍스트 — 표시된 40개 에이전트 전부 출력 텍스트는 목업.

---

## 5. 데이터 모델 / localStorage 테이블

콘솔별로 완전히 분리된 5개의 localStorage DB 키(스코프 격리, alias 금지가 하네스 규칙):

| 키 | 콘솔 | 내부 테이블(실측) |
|---|---|---|
| `jb-finance-support-state-v4` | base app | `appStorageKey` — CLAUDE.md에 기술된 `jb-localguard-os-state-v2`와 **다름**(버전 드리프트, 02_제품/app과 _vendor/JB_project2/app은 별개 상태 스키마) |
| `ccl-ops-db-v1` | CCL | `users, ccl_cases, ccl_review_notes, ccl_doc_checks, ccl_memo_drafts, approvals, ccl_audit_logs, ccl_consult_logs, ai_analysis_requests, ai_recommendations, harness_agents, ccl_agent_runs, agent_handoffs` (13개 테이블, cclConsole.data.js:6-91) |
| `fdr-ops-db-v1` | FDR | `fdr_signals, fdr_block_reviews, fdr_rules, fdr_followups, approvals, fdr_audit_logs, ai_analysis_requests, ai_recommendations, harness_agents, fdr_agent_runs, agent_handoffs` (11개 테이블, fdrConsole.data.js:45-95) |
| `jpo-ops-db-v2` | JPO | `role_workspaces, jeonse_price_snapshots, jeonse_risk_signals, jeonse_registry_checks, jeonse_guarantee_checks, jeonse_support_referrals, approvals, jeonse_evidence, jeonse_audit_logs, ai_analysis_requests, ai_recommendations, harness_agents, jeonse_agent_runs, agent_handoffs, external_connectors, inspection_schedules` (16개 테이블, 4콘솔 중 최다 — jeonseProtection-db.js:139-247) |
| `jbwc-ops-db-v3` | JBWC | `affiliates, approvals, audit_logs, privacy_permission_checks, external_connectors, ai_analysis_requests, ai_recommendations, inspection_schedules, customer_support_cases, consumer_protection_reviews, fds_alerts, document_cases, vehicle_lifecycle_tasks, harness_agents, agent_runs, agent_handoffs, kpi_snapshots` (17개 테이블 — wooricap-db.js:123-242; 유일하게 자체 `cases` 없이 `document_cases`/`customer_support_cases` 등 도메인별 분리 테이블 사용) |

기타: `jb-localguard-nav-order-v1`(nav 순서 커스터마이즈), `skillContentStorageKey`(modules.js:757, 업무 기능 콘텐츠 편집 영속화).

**Case는 마크다운 파일이 아니라 순수 JS 객체(localStorage에 JSON 직렬화)** — PRD의 FR류 문서가 "케이스=문서"를 전제한다면 실제 구현과 어긋난다.

---

## 6. 에이전트 & 스킬 로스터

| 콘솔 | 에이전트 수 | 스킬 수 |
|---|---|---|
| CCL | 8 (`cclConsoleAgents`, cclConsole.core.js:111) | 6 (`cclConsoleSkills`, :161) |
| FDR | 8 (`fdrConsole.core.js`) | 6 (`fdrConsoleSkills`, :171) |
| JPO | 11 (`jeonseProtectionAgents.registry.js`) | 10 (`jeonseProtectionSkills`, :246) |
| JBWC | 13 (`jbWooriCapitalAgents.registry.js`) | 6 (`jbWooriCapitalSkills`, :271) |
| **합계** | **40 에이전트** | **28 스킬** |

각 에이전트는 `id, agentKey, name, displayName, domain, responsibilities, allowedActions, blockedActions, dbReads, dbWrites, handoffRules, guardrails, metrics` 필드를 갖추도록 `verifyAgentRegistryCompleteness`가 강제(필드 누락 시 self-test 실패) — 스펙만 있는 게 아니라 실제로 검증기가 도는 구조.

---

## 7. 디자인 토큰 (styles.css 실측)

- 고유 CSS 커스텀 프로퍼티(`--*`): **110개**(styles.css) + **11개**(wooricap.css, 별도 파일) = **총 121개** — 과제 설명 "~118개"에 근접하나 정확히는 121개(두 파일 합산), styles.css 단독으로는 110개.
- 선언 라인 수(다크모드/미디어쿼리 재정의 포함 총 등장 횟수): 260줄 — 고유명 대비 재정의가 2배 이상 많음(테마 오버라이드가 많다는 뜻).
- 고유 클래스 선택자: styles.css 484개 + wooricap.css 53개 = 537개.

---

## 8. 구현 vs 목업 vs 부재 총괄표

| 영역 | 상태 | 근거 |
|---|---|---|
| 4개 역할 콘솔 라우팅/뷰 전환 | **REAL** | 각 콘솔 `*RouteFromHash` + `applyHashRoute` 디스패치, 실제 hash 기반 네비게이션 동작 |
| 리스크 스코어링(`computeRiskDecision`) | **REAL(결정론적 로직)** | 가중합 공식 실동작, 단 signal 서술 문구는 템플릿 |
| 감사로그 해시체인 | **부분 REAL** | base app만 해시체인(FNV-1a), 4개 역할 콘솔은 평문 리스트만 — **콘솔 전체 일관성 없음** |
| PII/스코프/승인/자동종결 가드레일 | **REAL** | harnessCore.js 정규식·필드 검사가 실제로 실행되고 위반 시 문자열 반환 |
| 하네스 자체검증(self-test) | **REAL** | harnessVerification.js가 런타임에 manifest/agent/hook을 실제로 스캔 |
| AI 에이전트 산출물 텍스트 | **MOCKED** | 전부 JS 템플릿 리터럴, LLM API 호출 없음(전체 코드베이스에 `fetch()` 2건, 둘 다 공공데이터 API) |
| 라이브 전세 실거래가 조회(`?live=1`) | **REAL(제한적)** | 로컬 프록시 경유 실제 data.go.kr fetch, 나머지 데이터는 seed |
| 케이스 = 문서(마크다운) 모델 | **부재** | 순수 JS 객체 + localStorage, 파일 시스템 기반 케이스 문서 없음 |
| 감사/컴플라이언스 리포트 내보내기 | **REAL(부분)** | `exportAuditJson`(app.js:4525) base app에만 존재, 역할 콘솔에는 미확인 |
| 5개 독립 localStorage DB(콘솔별 스코프 격리) | **REAL** | 서로 다른 storage key, `harnessGuardCheckScope`로 교차 오염 검사 |
| E2E 테스트 커버리지 | **REAL** | `_vendor/JB_project2/tests/e2e/`에 5개 spec 파일, 총 60개 `test()` 시나리오(jeonse-protection 16, localguard 24, role-consoles 7, wooricap 11, jeonse-smoke 2) |

---

## 참고 — 확인 방법

모든 수치는 다음 방식으로 직접 확인했다(재현 가능):
```bash
cd _vendor/JB_project2/app
wc -l *.js *.css *.html
grep -oE '\.[a-zA-Z][a-zA-Z0-9_-]*' styles.css | sort -u | wc -l   # 484
grep -oE '^\s*--[a-zA-Z0-9-]+:' styles.css | sort -u | wc -l       # 110
grep -n "function <이름>" *.js                                     # 함수 위치
grep -c "test(" ../tests/e2e/*.spec.js                              # 60
```

## 9. 다음 이식 후보 — 핸드오프 (사용자 승인 2026-07-04, 상태: **PR 제출됨 — `LSB-afk/JB_project2#2` OPEN**)

> 위 §0~§8과 달리 이 절만 **실측이 아니라 이식 지시서**다. 전략(사용자 확정): **스펙 핸드오프 우선, 승보 요청 시 additive-only 모듈 PR**(River-181 fork 경유). 타이밍은 PR `LSB-afk/JB_project2#1` 머지 후.
>
> **집행 완료(2026-07-04 야간, 사용자 '적용하시오' 지시)**: 아래 §9.1·§9.2를 additive-only로 구현해 **PR #2** 제출 — `app/memoryCards.js`(승인→3계층 카드 증류, 수용 기준 4개 브라우저 실검증 통과) + `scripts/llm-gateway.mjs`(:8022, 3엔진+폴백 사다리, 8021은 paperclip 점유로 회피). 기존 파일 수정은 등록 3줄(index.html·cclConsole.app.js·package.json).

### 9.1 MemoryCard 슬라이스 (스펙 SSOT = [[11-메모리-3계층-자동진화-설계도]])

- **방식**: 신규 파일 1개(`memoryCards.js` — MemoryCard 저장 + Distiller 후처리 + memory 뷰 렌더) + 기존 코드 등록 지점 **1줄**만 터치. 충돌 표면적 최소화(PR#1과 같은 방식).
- **스키마·증류 프롬프트**: 설계도 11 §2(MemoryCard)·§3(Distiller — "기본값은 기억하지 않는다") 원문 그대로. 저장은 기존 `cclTable(table, roleKey)` scope 규칙 준수(`ccl_memory_cards`).
- **수용 기준**: ① CCL-0001 실행 후 카드 1~2장 생성 ② 에이전트 상세에서 카드 열람(읽기 전용) ③ 카드 fact에 PII 원문 0건(포인터만) ④ scope 없는 조회는 기존처럼 예외.
- **paperclip 매핑 근거**: 설계도 11 §9 (설정 diff 스냅샷·풀로그/발췌 분리·fingerprint 중복 억제 등 8패턴).

### 9.2 /llm 게이트웨이 (참고 — 필요 시 파일 복사)

예선 레포 `02_제품/scripts/api-proxy.mjs`에 구현·검증 완료(단일 파일, 의존성 0): claude✓/codex✓/ollama✓ 3엔진 + 폴백 사다리 + JSONL 원장 + `/llm/usage` 집계. JB_project2에서 로컬모델 연동 시 이 파일을 그대로 가져가 `OLLAMA_BASE`만 맞추면 됨. Docker 물리분리 구성은 `02_제품/deploy/`(compose+런북).
