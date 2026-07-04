---
tags:
  - area/product
  - type/definitions
  - status/active
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases: [정의서, Definitions, 용어집, Naming Rules]
---

# Definitions — 정의서 (Canonical Terms & Naming Rules)

> 신뢰마커: **[확정]** = `app.js`/`modules.js`/[[08_본선/03_제품/04_tech/data-model|데이터 모델]]에서 직접 확인. **[조건부]** = 본선 설계 제안(코드 미검증). **(TBD)** = 미정.
> 근거등급(핵심 주장): **E4** = 데모 실동작으로 보일 수 있음, **E2+** = 1차 자료·코드로 방어됨, **E0** = 가정/미검증. 표기 없으면 E2+로 간주.
> 목적: 같은 개념이 문서마다 다른 이름으로 불리는 것을 막는다 — PRD·아키텍처·플로우·eval·발표 자료는 아래 **정식 객체명만** 쓴다.
> SSOT: `_canon.md` §2(에이전트)·§8(운영 계약), [[08_본선/03_제품/04_tech/data-model|데이터 모델]](엔티티 필드·코드 근거), [[08_본선/03_제품/01_결정-준비/설계/승보-프로토타입-반영|승보 프로토타입 반영]](대조 대상), [[business-model|DDBM]](사용자·데이터·리스크).

---

## A. 업무 용어 사전 (Business Glossary)

> §1의 객체명이 "무엇으로 만들어지는가"의 재료·행위자 정의. 아래 12개 항목은 문서생성 스키마(`04_definitions` 필수 포함 항목)에 대응한다. 각 항목은 §1의 정식 객체 또는 운영 계약으로 귀결된다.

| # | 용어 | 정의 (JB LocalGuard OS 기준) | 귀결 객체 / 근거 |
|---|---|---|---|
| A1 | **핵심 사용자 (Primary User)** | 전북은행·JB우리캐피탈의 담당 **직군** — RM·여신심사·사후관리·준법·AML. 로그인 역할에 따라 **역할별 대시보드**가 뜨고, 승인 게이트는 이 중 **RM·준법 2역할**로 라우팅된다(고객이 아니라 직원이 사용자) [E2+, canon §2·키스톤-역할축-검증] | Agent(`isHuman:true`) / ApprovalRecord.approverRole |
| A2 | **고객 (Customer)** | 지역 금융의 최종 고객 — 소상공인·개인사업자·가계·전세 임차인. **히어로 = 전주 중앙로 카페 개인사업자**(운전자금 케이스). 고객은 콘솔을 직접 쓰지 않으며, 원본 PII는 외부 LLM 비반출 대상 [E4 히어로, canon §1] | Case의 대상 주체 / RISK-PRIVACY-001 |
| A3 | **파트너 (Partner)** | 준법·컴플라이언스 부서, 데이터 거버넌스팀, 공공데이터 제공기관(law.go.kr·MOLIT·ECOS), CB(NICE/KCB). 데이터·규제 확인의 협력 주체이지 사용자·고객이 아님 [E2+, DDBM Key Partners] | 외부 시스템 / DATA-004 |
| A4 | **데이터 항목 (Data Item)** | Case를 구성·판단하는 입력 자산. `DATA-001` 전세등기 · `DATA-002` 카드매출/상환 · `DATA-003` 신용정보(CB·심사원장) · `DATA-004` 공공 API. 각 항목은 **PII 등급**을 가지며 등급에 따라 로컬/외부 모델로 라우팅된다 [E2+ 공개항목/E0 내부피드 미확보, DDBM Key Data Inventory] | Signal.sourceTag / Evidence / EvidencePack |
| A5 | **AI 판단 (AI Decision)** | `computeRiskDecision`이 산출하는 riskScore + Signal[] + 판정. 결론만이 아니라 **근거·불확실성·다음 확인 항목**을 남긴다. 규제상 **보조수단**이며 최종 판단이 아니다(금융분야 AI 가이드라인) [E4, canon §8·D9] | AgentRun.decisionSnapshot |
| A6 | **추천 (Recommendation)** | AI가 만든 다음 행동 제안 = **RecommendationDraft(행동초안)**. 승인 전까지 고객 대상 실행이 차단된다. 규칙 엔진이 최종 게이트를 맡고 LLM은 초안·설명 계층으로 제한(D9) [E4, §1] | RecommendationDraft (코드명 `Approval.actionDraft`) |
| A7 | **승인 (Approval)** | 사람이 행동초안의 실행을 허용하는 절차·기록 = **ApprovalRecord**(L0~L4, approverRole RM/준법). 준법 게이트는 **L3~L4**. "승인 게이트 통과" = status가 `approved` [E4, §1·승보-프로토타입] | ApprovalRecord (코드명 `Approval`) / Approval Gate |
| A8 | **고위험 행동 (High-Risk Action)** | AI가 **자동 실행하면 안 되는** 고객·금융 영향 행동. blockedActions 예: 대출 승인/거절·금리/한도 산정·신용평가·PII 원문 조회/저장/전송·계좌/결제/자동이체 변경·전자약정 체결·FDS 자동종결·법률/규정 확정 판단. 전부 승인/차단 게이트(준법 L3~L4)를 거친다 [E4, 승보-프로토타입 `*_COMMON_BLOCKED_ACTIONS`] | Skill.riskLevel / ApprovalRecord.gateChecks |
| A9 | **성공 이벤트 (Success Event)** | 근거 100% 연결된 판단이 승인 게이트를 통과해 AuditEvent로 기록되고 triage가 착수되는 것. KPI: Triage 50% 단축 · Evidence traceability 100% · Approval safety 100% [E2+ 목표치, canon §3] | AuditEvent (status→approved) |
| A10 | **실패 이벤트 (Failure Event)** | 불확실·위반 시 **fail-closed로 차단**되는 것 — 반출 스캔이 PII 원문 반출 차단, 승인 없는 발송 원천 차단, 확정판단 금지(전세사기·피해자결정·대출승인 단정) 위반 감지, 근거 누락. "불확실하면 닫는다"가 기본값 [E4, principles·승보-프로토타입 forbiddenAssertions] | AuditEvent (blocked) / RISK-ACTION-001 |
| A11 | **MVP** | 운영 계약(Case→…→Audit) 전체를 브라우저에서 재현하는 콘솔. 4개 함수 계약(`computeRiskDecision`·`buildDashboardData`·`auditChainRecords`·`moveCaseToColumn`)이 데모의 뼈대이며 본선 목표는 이를 **서버 API로 1:1 승격** + 실 LLM 연결 [E4 현재/E0 서버승격, canon §8·CLAUDE.md] | 함수 계약 → 서버 API |
| A12 | **Demo-ready** | 데모에서 실제로 동작함이 보장된 상태. **최소 1개(히어로 전주 카페, 김건우 CCL-0001)는 실 LLM 동작**(유지, 쇼케이스는 6페르소나로 확장), 나머지 도메인은 골든패스 실동작 지향. ⚠️ 런타임=**모델 선택 게이트웨이**(어드민이 claude/codex/로컬모델 중 선택, 로컬 우선·codex 폴백)이며, "3개 실동작"은 완성이 아니라 **개발 목표**로 정직하게 표기한다 [E0→E4 목표, 키스톤-확정 "정직한 전제"] | — (조건부) |

> **정직성 규율**: A11·A12의 "서버 승격"·"3케이스 실동작"·"로컬모델 연결"은 발표·문서에서 **[목표/조건부]**로만 말한다. 완성으로 단정하면 안 됨(키스톤-확정 §정직한 전제). 성공/실패 KPI 수치(A9)는 canon §3 고정값을 그대로 인용한다.

---

## 1. Canonical Terms

| Term | Definition | Anti-Synonyms |
|---|---|---|
| **Case** | 위험 신호가 모여 만들어지는 운영 계약의 루트 엔티티. 모든 AgentRun·ApprovalRecord·AuditEvent가 여기서 파생 [확정, data-model §1] | ticket, lead, 문의건 |
| **Signal (위험신호)** | `computeRiskDecision`이 만드는 구조화 값 객체 — name/value/weight/contribution/sourceTag/evidenceId를 가진 개별 위험 신호 하나 [확정, data-model §1.2. 코드명은 `RiskSignal`] | risk factor(설명 없는 혼용), 지표, feature |
| **EvidencePack** | 하나의 Case·판단이 인용하는 Evidence[]의 구조화 집합(출처·URL·PII등급 보존). 개별 원소 하나는 `Evidence` [확정, data-model §5. 코드는 `evidence[]` + `Case.evidenceIds`] | 근거 텍스트 뭉치, explanation blob, 설명 문단 |
| **RecommendationDraft (행동초안)** | AI가 만든, 승인 전까지 고객 대상 실행이 차단되는 다음 행동 제안. 현재 코드에서는 `Approval.actionDraft` 문자열 필드로 존재(별도 엔티티 아님) [확정 필드/조건부 승격, data-model §6] | final decision, 확정 조치, 발송 완료 문안 |
| **ApprovalRecord** | 승인 절차 한 건의 영속 기록 — level(L0~L4)·approverRole·status·gateChecks를 가짐 [확정, data-model §6. 코드명은 `Approval`] | optional review, FYI 로그, 참고용 결재 |
| **AuditEvent** | GENESIS부터 시작해 `previousHash`로 연결되는 불변 감사 이벤트. 위변조 저항용 해시체인의 한 링크 [확정, data-model §7, `auditChainRecords()`] | log line, 단순 로그, 이벤트 기록(구분 없는 지칭) |
| **AgentRun** | 한 Case에 대해 하나의 Agent가 수행한 실행 단위. 판정 시점 스냅샷(`decisionSnapshot`)을 불변으로 보유 [확정, data-model §2, `startAgentRun()`] | task, job, 처리건 |
| **Skill** | Agent에 장착되어 실행되는 표준 능력 단위 — approvalPolicy·riskLevel·inputPiiGrade를 가짐 [확정, data-model §4, `skillRack`] | plugin(느슨한 지칭), 기능, 모듈 |

**관련 개념(정식 8종은 아니지만 혼동 방지용)**
- **Approval Gate (승인 게이트)**: ApprovalRecord를 만들어내는 관문·메커니즘 자체(`_canon.md` §2, §8). **ApprovalRecord(결과 기록)와 Approval Gate(관문 절차)는 서로 다른 개념** — "승인 게이트를 통과했다" = ApprovalRecord.status가 `approved`가 됨.
- **Agent**: RM/준법 등 사람 승인자(`isHuman: true`)와 AI 에이전트(`isHuman: false`)를 함께 담는 엔티티 [확정, data-model §3]. RM/준법은 "직군"이지 별도 객체가 아님 — 직군 상세는 [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]] 참조, 이 문서에서 중복 정의하지 않음.

---

## 2. Concept Hierarchy

```text
Case
 └── AgentRun (다건, 시간순)
      ├── 입력: Signal[] (위험 판단 신호 — decisionSnapshot에 스냅샷 보존)
      ├── 인용: EvidencePack (= Evidence[] 근거 묶음)
      └── 산출: RecommendationDraft (행동초안 — Approval.actionDraft)
           └── Approval Gate 통과 필요 → ApprovalRecord (L0~L4, approverRole)
                └── 모든 상태 변화 → AuditEvent[] (GENESIS 해시체인)
executed by: Agent (isHuman true/false) equipped with Skill[]
```

---

## 3. Naming Propagation (문서 용어 ↔ 코드 ↔ 목표 서버 모델)

| Term | 문서/발표 용어 | 현재 코드 (`app.js`/`data-model.md`) | 목표 서버 모델 | 안정 ID |
|---|---|---|---|---|
| Case | 케이스 | `item` 객체 → `Case`(data-model §1) | `Case` | 표시 코드 `JBG-104`형, PK는 UUID [확정, data-model §0.4] |
| Signal | 위험 신호 | `computeRiskDecision().signals` → `RiskSignal`(§1.2) | `Signal` | 값 객체, 별도 PK 없음 |
| EvidencePack | 근거 묶음 | `evidence[]` + `Case.evidenceIds` | `EvidencePack`(조회 결과) / 원소 `Evidence` | Evidence PK는 slug, 예 `jb-ai-mou` |
| RecommendationDraft | 행동 초안 | `Approval.actionDraft`(문자열 필드) | 승격 시 별도 엔티티 분리 검토 (TBD) | 없음(현재 필드) |
| ApprovalRecord | 승인 기록 | `Approval`(§6) | `ApprovalRecord` | PK UUID, `level` L0~L4 |
| AuditEvent | 감사 이벤트 | `AuditEvent`(§7) | 동일 | PK UUID + 해시체인 `seq`(1부터) |
| AgentRun | 에이전트 실행 | `AgentRun`(§2) | 동일 | 표시용 `run-001` |
| Skill | 스킬 | `Skill`(§4) | 동일 | slug, 예 `cashflow-stress` |

> **코드-문서 불일치 메모 [확정 결함, 리네임 우선순위 낮음]**: 코드는 이미 `RiskSignal`/`Evidence`/`Approval`을 쓰고 있어 위 표의 "문서 용어"(Signal/EvidencePack/ApprovalRecord)와 정확히 일치하지 않는다. `verify_static.py`가 `computeRiskDecision` 등 기존 문자열을 needle로 고정하므로 **코드 리네임은 서버 승격 시점으로 미루고**, 그 전까지 문서·발표에서는 정식 용어를 쓰되 최초 등장 시 코드명을 괄호 병기한다 (예: "Signal(코드명 `RiskSignal`)").

---

## 4. Stable ID Formats (안정 ID 포맷)

| 포맷 | 용도 | 현황 |
|---|---|---|
| `REQ-001` | PRD/기능 요구 단위 | 미부여 — `01_prd/prd.md`·`mvp-scope.md`에 도입 시 이 포맷 사용 |
| `F-001` | 기능명세서 기능 단위 | 미부여 — `00_제출` 기능명세서 승격 시 부여 |
| `GC-001` | Gate Check(승인 관문 개별 체크 항목) | `Approval.gateChecks[]`(data-model §6)에 부여 권고 — MVP는 `{name, status}` 튜플만 있고 안정 ID 없음 [조건부] |
| `RISK-<도메인>-001` | 심사기준 5.5(개인정보·보안·환각·설명가능성) 대응 리스크 항목 | 예 `RISK-PRIVACY-001`, `RISK-HALLUCINATION-001` — 아직 미도입 |
| `JBG-104` 형 | 케이스 표시 코드(예선) | [확정, canon §1·data-model §0.4] 예선 히어로 표시코드 `JBG-104`. **본선 콘솔의 히어로 케이스 코드는 `CCL-0001`**(전주 카페 운전자금, 승보 `cclConsole` seed) — **두 코드 병존은 [Open Question]**, 발표·문서 히어로 지칭은 본선 기준 `CCL-0001` 우선, 편입 시 단일화 필요 |
| `CCL-0001` 형 | 본선 콘솔 케이스 코드(기업여신) | [확정, 승보-프로토타입-반영] 전북은행 기업여신 콘솔 seed. `<CONSOLE>-<seq>` 규약. **JB우리캐피탈 접두는 `<TYPE>-JBWC-<seq>`**(예 `CASE-JBWC-0001`) — canon `JBG-` 포맷과 규약이 달라 편입 시 재매핑 필요 |

---

## 5. Naming Rules

1. 문서·발표·eval 전체에서 §1의 **정식 8종 Canonical Term만** 쓴다. 동의어(Anti-Synonyms 열)는 금지.
2. **Approval Gate(관문, 메커니즘)** ≠ **ApprovalRecord(승인 기록, 데이터)** — 항상 구분해 쓴다.
3. 코드가 아직 다른 이름(`RiskSignal`/`Evidence`/`Approval`)을 쓰는 구간은 리네임하지 말고, §3 표대로 문서에서 "정식 용어(코드명 `X`)" 형태로 병기한다.
4. 파일명 kebab-case, Obsidian 위키링크 `[[ ]]`, 파일명 중복 금지 — CLAUDE.md 컨벤션 그대로 적용.
5. 신규 안정 ID를 도입할 때는 §4 포맷을 우선 재사용하고, 새 접두어를 만들기 전에 이 문서를 갱신한다.
6. 승보 프로토타입(`_vendor/JB_project2/`) 등 외부 코드의 객체명(JBWC/JPO 접두, `<TYPE>-JBWC-<seq>`)을 우리 문서에 그대로 옮기지 않는다 — 편입 시 반드시 이 표로 재매핑.

## 연결
[[08_본선/03_제품/04_tech/data-model|데이터 모델]] · [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]] · [[08_본선/03_제품/01_결정-준비/설계/승보-프로토타입-반영|승보 프로토타입 반영]] · [[08_본선/03_제품/00_vision/core-bet|Core Bet]]
