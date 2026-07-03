---
tags:
  - area/product
  - type/reference
  - status/active
date: 2026-07-03
up: "[[INDEX|제품 인덱스]]"
aliases: [오케스트레이터, Case FSM, AgentRun 파이프라인]
---

# 오케스트레이터

> 운영 조율 에이전트(LocalGuard Orchestrator)의 역할을 **Case FSM 5단** + **AgentRun 파이프라인(판단→행동초안→검증)** + **실패정책**으로 명세한다. 근거: `_vendor/harness-engineering-skills/skills/agent-loop/SKILL.md`(Agent Capability Card), `_vendor/harness-engineering-skills/examples/jb-localguard-os/rules/agent-rules.md`(판단/검증 경계), `08_본선/03_제품/00_결정-준비/설계/승보-프로토타입-반영.md` §3(harnessCore 3계층), `02_제품/app/app.js`(`computeRiskDecision`/`buildDashboardData`/`moveCaseToColumn`/`auditChainRecords`, canon §9의 "서버 API 1:1 승격 대상").

---

## 1. 오케스트레이터 역할

운영 조율 에이전트는 스스로 판단을 내리지 않는다 — Case를 적절한 도메인 에이전트(또는 전세보호팩 리드 같은 하위 오케스트레이터)에 라우팅하고, FSM 상태 전이·승인 레벨 산정·승인 대기 중 상태 보존을 담당한다. paperclip 용어로는 Wakeup Coordinator + Run Executor의 역할과 같다: wakeup source가 발생하면 큐잉하고, 담당 에이전트가 claim해 AgentRun을 만들도록 조율한다.

**금지**(`agent-rules.md`와 동형): 고객 대상 행동을 직접 실행하지 않는다, 승인·계좌상태 변경을 하지 않는다, 누락된 근거를 숨기지 않는다.

---

## 2. Case FSM 5단

`02_제품/app/app.js`의 실제 칸반 컬럼(`columns`, `statusToColumn`)을 그대로 FSM 정의로 채택한다.

```
new(접수됨) → in_progress(검토 준비 중) → review(담당자 승인 대기) → done(검토 완료)
                                                                  ↳ blocked(보류)
```

| 상태 | 의미 | 전이 조건 | 담당 |
|---|---|---|---|
| `new` | Case 접수(위험신호가 승격되거나 수동 개설) | 위험신호 조기감지 에이전트의 `case.created` 또는 수동 접수 | 운영 조율 에이전트 |
| `in_progress` | 도메인 에이전트 AgentRun 실행 중(판단→행동초안 단계) | 담당 에이전트 배정 완료 | 배정된 도메인 에이전트 |
| `review` | 담당자 승인 대기(승인 게이트 통과 전) | `computeRiskDecision` 산출 + 준법 검토 통과 | RM/준법 최종 승인자 |
| `done` | 검토 완료(승인 후 실행 또는 내부 종결) | 승인 게이트 통과 | 운영 조율 에이전트 |
| `blocked` | 보류(고위험 차단, 승인 반려, 근거 부족) | L4 차단 판정 또는 반려 | 운영 조율 에이전트 → 상위 검토 |

`moveCaseToColumn(caseId, column)`이 이 전이의 서버 API 승격 대상 함수다(canon §9).

---

## 3. AgentRun 파이프라인 (판단 → 행동초안 → 검증)

Case가 `in_progress`로 들어가면 오케스트레이터는 아래 3단 파이프라인이 순서대로(재실행 가능) 돌도록 조율한다. 각 단계는 별도 Evidence를 남겨야 하며, 다음 단계로 넘어가기 전 이전 단계 산출물이 있어야 한다(`agent-loop` SKILL.md "Generation without verification is incomplete").

| 단계 | 함수/책임 | 산출물 | 담당 |
|---|---|---|---|
| **1. 판단(Judgment)** | `computeRiskDecision(item)` — actionType(`contract`/`fraud`/기본)별로 가중 signal 5개 안팎을 합산해 `score`·`level`·`route`·`matrixReason` 산출 | risk score, 승인 레벨(L0~L4), 사유코드 | 도메인 판단 에이전트(상환위험 분류/전세위험 리드/이상거래 탐지) |
| **2. 행동초안(Draft)** | `createAnalysisResult(item, mode)` — 체크리스트, RM 메모, 콜백 스크립트, 특약 문구 등 고객 대상/내부 대상 초안 생성 | RecommendationDraft(체크리스트 + 초안 문서) | RM 보좌 / 계약 체크리스트 / 정책금융 매칭 |
| **3. 검증(Verification)** | 준법 검토 에이전트의 `compliance-guard`/`privacy-redaction`/`claim-limiter` 통과 + Evidence 연결 확인 | 검증 통과/반려, PII 반출 스캔 결과 | 준법 검토 에이전트 |

이 3단은 `agent-rules.md`의 Judgment/Verification Boundary와 1:1 대응한다 — "Every RecommendationDraft must pass policy guard checks and human approval before being treated as actionable."

### 3.1 승인 게이트 → 실행 → 감사

```
판단(computeRiskDecision) → 행동초안(createAnalysisResult) → 검증(준법 검토)
  → 승인 게이트 [approvalLevelFor: L0~L4, L3=RM+준법 공동]
    ├─ 승인(approved) → 행동 실행 → done
    ├─ 반려(rejected)  → blocked → 재작업 루프(1단으로 복귀)
    └─ 미승인·근거 부족 → review 유지(자동 실행 금지)
  → auditChainRecords 해시체인 기록(모든 분기 공통 — 승인/반려/차단 전부 기록)
```

`approvalLevelFor(score)`가 `approvalLevelMatrix`(L0~L4)를 조회해 라우트를 결정한다. 고위험(fraud, L4) 케이스는 외부 접촉 자체가 차단되며, 승인 게이트를 우회하는 자동 실행 경로는 존재하지 않는다([[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]] §4).

### 3.2 히어로 케이스(JBG-104) 트레이스 예시

1. 위험신호 조기감지 에이전트가 매출 둔화 신호를 감지 → `case.created`(전주 중앙로 카페, JBG-104)
2. 상환위험 분류 에이전트가 `in_progress`에서 `cashflow-stress`/`rate-relief` 실행 → riskScore 88 → `risk.decision.computed`(L3)
3. 정책금융 매칭 에이전트가 정책자금 후보 + 서류 체크리스트 초안(행동초안 단계)
4. 준법 검토 에이전트가 PII·과장표현 검토(검증 단계) → 통과
5. `review` 상태에서 RM 최종 승인자 + 준법 최종 승인자 공동 승인(L3) → `approval.approved`
6. RM 콜백/정책금융 안내 실행 → `done` → `audit.sealed`

---

## 4. 실패정책

paperclip의 heartbeat 실행 상태(`queued`/`running`/`succeeded`/`failed`/`timed_out`/`cancelled`)를 AgentRun 상태로 채택하고, 실패 시 아래 정책을 적용한다.

| 실패 유형 | 정책 | 근거 |
|---|---|---|
| AgentRun 실행 오류/timeout | 제한된 횟수 재시도 → 지속 실패 시 `blocked` 전이 + 사람에게 escalate, `heartbeat_run_events`에 error 기록 | paperclip 실행 모델([[08_본선/03_제품/00_결정-준비/설계/agents-v2-paperclip기반-재설계]] §3) |
| 승인 SLA 초과 | 상위 보고(운영 조율 에이전트가 재알림) — **세부 재시도/우회 규칙은 아직 구체화 필요** | `agentReadinessGaps`("실행 실패 복구") — [미결/7-4] |
| 고위험(fraud) 신호의 오탐 가능성 | high/critical Case는 **자동종결 금지** — 안전 강등(`needsReview`)만 허용, 위반 시도는 `HOOK_VIOLATION` 유형으로 감사 기록 | 승보 프로토타입 SECURITY_GUARDRAILS 채택 권고(`08_본선/03_제품/00_결정-준비/설계/승보-프로토타입-반영.md` §4.2) — 현재 app.js에 미구현, 설계 원칙으로 채택 제안 |
| PII 반출 스캔 실패/재식별 위험 발생 | 즉시 중단·회수·파기, 원본 재사용 금지 | 신용정보법 §40조의2 ⑥⑦ |
| 계열사/케이스 경계 침범(scope 위반) | hard fail — 승인 불가, 즉시 차단 | 계열사 스코프 원칙([[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]] §1) |
| 준법 검토 반려 | `review`에서 `blocked`로 전이하지 않고 1단(판단)으로 재작업 루프 — 반려 사유를 Evidence에 첨부 | `agent-rules.md` Verification Boundary |

**원칙**: "차단 가능 지점(생성·발송·반출)은 차단 + 감사기록, 이미 발생한 지점은 안전 강등 + reviewRequired 감사기록"(승보 SECURITY_GUARDRAILS 원칙 인용) — 실패를 숨기는 대신 항상 `audit.sealed`로 귀결시킨다.

---

## 참조

- [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]]
- [[08_본선/03_제품/02_agent-design/skill-spec|스킬 명세]]
- [[08_본선/03_제품/05_diagrams/01_agent-flow|에이전트 흐름 다이어그램]]
- [[08_본선/03_제품/05_diagrams/03_approval-gate|승인 게이트]]
- [[08_본선/03_제품/00_결정-준비/설계/agents-v2-paperclip기반-재설계]]
- [[08_본선/03_제품/00_결정-준비/설계/승보-프로토타입-반영]]
