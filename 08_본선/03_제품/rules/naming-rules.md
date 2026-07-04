---
tags: [area/product, type/rule, status/active]
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases: [명명 규칙, naming-rules]
---

# Naming Rules — 명명 규칙

> 정식 객체명(Case/Signal/EvidencePack/… 8종)과 그 반의어(Anti-Synonyms) 금지 규칙은 [[08_본선/03_제품/docs/04_definitions|definitions]] §1·§5가 SSOT다 — **이 문서에서 재정의하지 않는다.** 이 문서는 definitions.md가 다루지 않는 5개 층위(파일/기능ID/데이터필드/API/이벤트/테스트)만 다룬다.

---

## 1. 파일명 (File Naming)

| ID | 규칙 | 근거 |
|---|---|---|
| NAM-01 | Obsidian 볼트 파일명은 kebab-case, 확장자 `.md` | CLAUDE.md "Obsidian conventions" |
| NAM-02 | 볼트 전체에서 파일명 중복 금지(폴더가 달라도) | CLAUDE.md, `08_본선/AGENTS.md` |
| NAM-03 | 하네스 소스 파일은 `<role>.<layer>.js` 패턴(`config`/`agents.registry`/`Rules`/`db`/`Services`/`helpers`/`view.*`/`commands`/`sidebar`) — 역할 접두 없이 공용 이름(예 `rules.js` 단독) 사용 금지 | `describeNewHarnessScaffold()`(`harnessCore.js:114-141`), 실 파일 목록(`jeonseProtection.*.js` 9종) |
| NAM-04 | 내보내기 파일명은 `${caseCode}-<종류>.{ext}` (예 `JBG-104-audit-ledger.json`) | [[08_본선/03_제품/rules/import-export-rules|import-export-rules]] IOX-02·IOX-15 |

---

## 2. 기능 ID 명명 (Feature-ID Naming)

[[08_본선/03_제품/docs/04_definitions|definitions]] §4 Stable ID Formats를 그대로 채택한다:

| ID 포맷 | 용도 | 현황 |
|---|---|---|
| `REQ-001` | PRD/기능 요구 단위 | 미부여 |
| `F-001` | 기능명세서 기능 단위 | 미부여 |
| `GC-001` | Approval.gateChecks[] 개별 체크 항목 | 권고, 미도입 |
| `RISK-<도메인>-001` | 심사기준 5.5 리스크 항목(예 `RISK-PRIVACY-001`) | 미도입 |
| `JBG-104` 형 | Case 표시 코드(전북은행) | [확정] |
| `CASE-JBWC-0001` 형 | Case 표시 코드(JB우리캐피탈, 승보 프로토타입 규약) | **JB우리캐피탈 접두는 (TBD)** — 편입 시 접두 통일 필요, definitions.md §4 경고 그대로 승계 |

| ID | 규칙 |
|---|---|
| NAM-05 | 이 문서(`rules/`) 및 다른 rules 파일의 규칙 ID는 3~4글자 접두(`AGT`/`CMP`/`DAT`/`IOX`/`NAM`/`UIR`) + 2자리 순번을 쓴다 — 접두 재사용·중복 순번 금지 |
| NAM-06 | 신규 안정 ID 포맷을 도입하기 전에 definitions.md §4에 먼저 등록한다(중복 포맷 생성 금지) | definitions.md 규칙 5 |

---

## 3. 데이터 필드 명명 (Data-Field Naming)

| ID | 규칙 | 근거 |
|---|---|---|
| NAM-07 | 엔티티 필드는 camelCase(예 `riskScore`, `evidenceIds`, `approverRole`) | [[08_본선/03_제품/04_tech/data-model|data-model]] 전체 필드표 |
| NAM-08 | PK는 문맥에 따라 `id`(UUID, Case/AgentRun/Approval/AuditEvent) 또는 slug(Agent/Skill/Evidence) — 두 체계를 섞어 같은 엔티티에 쓰지 않는다 | data-model §0.4 |
| NAM-09 | FK 필드명은 `<참조엔티티>Id`(예 `caseId`, `agentRunId`) 패턴 | data-model §2·§6 |
| NAM-10 | enum 필드값은 영문 소문자 스네이크/캐멀 혼용 금지 — 기존 값 그대로 사용(`status`는 영문 Capitalized `"New"`/`"Approval Pending"`, `stage`는 snake_case `"in_progress"`) — 신규 enum 추가 시 같은 필드의 기존 대소문자 컨벤션을 따른다 | data-model §1 `status` vs `stage` 필드 비교 |
| NAM-11 | PII 등급 필드는 반드시 `piiGrade`/`inputPiiGrade` 이름을 재사용한다 — 새 이름(`sensitivity`, `dataLevel` 등) 도입 금지 | data-model §4·§5 |

---

## 4. API 명명 (API Naming)

> 상세 계약은 [[08_본선/03_제품/04_tech/api-spec|api-spec]](병렬 소유) — 이 문서는 정합성 확인용 크로스체크만 유지한다.

| ID | 규칙 | 근거 |
|---|---|---|
| NAM-12 | REST 엔드포인트는 `/api/v1/<복수형-리소스>` (예 `/api/v1/cases`, `/api/v1/dashboard`) | [[08_본선/03_제품/04_tech/data-model|data-model]] §9 매핑표 |
| NAM-13 | 상태 변경 전용 경로는 `PATCH /api/v1/<리소스>/:id/<필드>` (예 `PATCH /api/v1/cases/:id/column`) | 동 출처 |
| NAM-14 | 4대 함수 계약(`computeRiskDecision`/`buildDashboardData`/`auditChainRecords`/`moveCaseToColumn`)은 서버 API 승격 시에도 함수명을 그대로 유지한다(`verify_static.py` needle 고정) | CLAUDE.md "static-verification contract" |

---

## 5. 이벤트 명명 (Event Naming)

paperclip `activityLog` 매핑([[08_본선/03_제품/02_agent-design/agent-roster|agent-roster]] §5)을 그대로 채택한다:

| 이벤트명 패턴 | 예 |
|---|---|
| `<entity>.<action>` (점 구분, 과거형 또는 진행 접미사) | `case.created`, `agent.wakeup.requested`, `agent.run.started`/`.succeeded`/`.failed`, `evidence.attached`, `risk.decision.computed`, `approval.requested`/`.approved`/`.rejected`, `audit.sealed` |

| ID | 규칙 |
|---|---|
| NAM-15 | 신규 이벤트는 `<entity>.<action>` 소문자 점 표기를 따른다 — camelCase나 언더스코어 이벤트명 금지 |
| NAM-16 | 다단계 이벤트(요청→성공/실패)는 `.requested`/`.succeeded`(또는 `.approved`)/`.failed`(또는 `.rejected`) 접미사 3종 중에서만 선택한다 |

---

## 6. 테스트 명명 (Test Naming)

| ID | 규칙 | 근거 |
|---|---|---|
| NAM-17 | Playwright `test(...)` 설명 문자열은 소문자로 시작하는 자연어 서술문(무엇을 검증하는지, 동사+목적어) — 예 `"audit ledger verifies hash chain and exports json"` | `02_제품/tests/e2e/localguard.spec.js` 19개 테스트 제목 전수 확인 |
| NAM-18 | 테스트 파일명은 `<제품명>.spec.js` 단수 파일(하네스별 분리 시 `<role>.spec.js`) | 동 파일, `ROLE_HARNESS_CONTRACT.md` §신규 역할 하네스 절차 "전용 e2e spec + smoke spec" |
| NAM-19 | smoke test 명령/함수는 `runHarnessSelfTest`/`/jeonse-run-smoke-test` 처럼 `run*SelfTest` 또는 `/<role>-run-smoke-test` 패턴을 따른다 | `harnessVerification.js:81`, `ROLE_HARNESS_CONTRACT.md` §신규 역할 하네스 절차 |

---

## 연결
[[08_본선/03_제품/docs/04_definitions|Definitions]] · [[08_본선/03_제품/04_tech/data-model|데이터 모델]] · [[08_본선/03_제품/04_tech/api-spec|API 명세]] · [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]] · [[08_본선/03_제품/rules/import-export-rules|Import/Export Rules]] · [[08_본선/03_제품/docs/03_principles|Principles]]
