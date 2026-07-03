---
tags:
  - area/product
  - type/spec
  - status/draft
date: 2026-07-03
up: "[[INDEX|제품 인덱스]]"
aliases: [정의서, Definitions, 용어집, Naming Rules]
---

# Definitions — 정의서 (Canonical Terms & Naming Rules)

> 신뢰마커: **[확정]** = `app.js`/`modules.js`/[[08_본선/03_제품/04_tech/data-model|데이터 모델]]에서 직접 확인. **[조건부]** = 본선 설계 제안(코드 미검증). **(TBD)** = 미정.
> 목적: 같은 개념이 문서마다 다른 이름으로 불리는 것을 막는다 — PRD·아키텍처·플로우·eval·발표 자료는 아래 **정식 객체명만** 쓴다.
> SSOT: `_canon.md` §2(에이전트)·§8(운영 계약), [[08_본선/03_제품/04_tech/data-model|데이터 모델]](엔티티 필드·코드 근거), [[08_본선/03_제품/00_결정-준비/설계/승보-프로토타입-반영|승보 프로토타입 반영]](대조 대상).

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
| `JBG-104` 형 | 케이스 표시 코드 | [확정, canon §1·data-model §0.4] 전북은행 히어로 케이스 `JBG-104`. **JB우리캐피탈 코드 접두는 (TBD, 미확정)** — 승보 프로토타입은 `<TYPE>-JBWC-<seq>` 별도 규약 사용(예 `CASE-JBWC-0001`), 우리 canon 포맷과 충돌 가능 — 편입 시 조정 필요 |

---

## 5. Naming Rules

1. 문서·발표·eval 전체에서 §1의 **정식 8종 Canonical Term만** 쓴다. 동의어(Anti-Synonyms 열)는 금지.
2. **Approval Gate(관문, 메커니즘)** ≠ **ApprovalRecord(승인 기록, 데이터)** — 항상 구분해 쓴다.
3. 코드가 아직 다른 이름(`RiskSignal`/`Evidence`/`Approval`)을 쓰는 구간은 리네임하지 말고, §3 표대로 문서에서 "정식 용어(코드명 `X`)" 형태로 병기한다.
4. 파일명 kebab-case, Obsidian 위키링크 `[[ ]]`, 파일명 중복 금지 — CLAUDE.md 컨벤션 그대로 적용.
5. 신규 안정 ID를 도입할 때는 §4 포맷을 우선 재사용하고, 새 접두어를 만들기 전에 이 문서를 갱신한다.
6. 승보 프로토타입(`_vendor/JB_project2/`) 등 외부 코드의 객체명(JBWC/JPO 접두, `<TYPE>-JBWC-<seq>`)을 우리 문서에 그대로 옮기지 않는다 — 편입 시 반드시 이 표로 재매핑.

## 연결
[[08_본선/03_제품/04_tech/data-model|데이터 모델]] · [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]] · [[08_본선/03_제품/00_결정-준비/설계/승보-프로토타입-반영|승보 프로토타입 반영]] · [[08_본선/03_제품/00_vision/core-bet|Core Bet]]
