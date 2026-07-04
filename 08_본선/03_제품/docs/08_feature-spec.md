---
tags:
  - area/product
  - type/spec
  - status/active
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases: [Feature Spec, 기능 명세]
---

# Feature Spec — 기능 명세

> 노멀폼: DDBM-Harness-SDD 스킬 §Phase3 `docs/08_feature-spec.md`(필수필드 Feature ID / User story / Input / Output / Logic / Edge cases / Acceptance criteria / Evidence). SSOT: `_canon.md`, [[08_본선/03_제품/docs/06_prd|PRD]](기능군 1~5·25항목), [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]], [[08_본선/03_제품/01_결정-준비/키스톤-확정|키스톤]]. 코드 근거: `_vendor/JB_project2`(역할축 콘솔)·`02_제품/app/app.js`(4 함수계약). 전체 코드 실측 인벤토리(뷰·함수·데이터·감사체인 적용범위)는 [[08_본선/03_제품/구현현황-JB_project2|구현현황-JB_project2]] 참조(2026-07-04) — 이하 **[실측]** 표기는 이 문서 기준.
>
> **이 문서의 위치**: PRD는 "무엇을 왜"(기능군·수용기준 요약)를, 이 문서는 "각 기능이 어떤 입력→출력→로직→예외로 **테스트 가능**한가"를 정의한다. Feature ID는 PRD 기능군 번호(x.y.z)를 그대로 승계해 추적성을 유지한다.
>
> **근거등급 범례(E0~E5)**: E4=작동 검증(코드/로그로 데모 가능), E3=사용자/절차 검증, E2=외부자료 근거, E1=내부 회의/설계 근거, E0=가설. 목표선 = 핵심 주장 E2+, 데모가능 기능 E4.
> **신뢰마커**: **[확정]**=코드/canon 직접 확인, **[조건부]**=본선 설계 제안(미검증), **[목표/7-4]**=밤샘 개발 목표(현재 미완).

---

## 0. 히어로 케이스 ID 정합 — [확정 2026-07-04]

- 본선 히어로 ID는 **`CCL-0001`(구 `JBG-104`)** 으로 단일 확정한다. 예선 코드 JBG-104(전주 중앙로 카페, riskScore 88)와 본선 CCL-0001은 **동일 히어로(전주 카페 소상공인 여신)** 를 가리키며, 본선 전 산출물은 CCL-0001로 통일한다.
- 선행 Wave1 문서(PRD·agent-roster·키스톤)의 JBG-104 표기는 구 코드 잔재로, 모두 CCL-0001로 정정 대상이다.
- 남은 사항(케이스 코드 네이밍): 두 계열사·다도메인 확장 시 네이밍 규약(`{계열사}{도메인}-{seq}`?)을 `rules/naming-rules.md`에서 잠글 것 **[미결/7-4]**. 히어로 ID 이원화 자체는 종결됨.
- **코드 정본 현행(2026-07-05)**: JB_project2 = 역할 콘솔 4종(CCL/FDR/JPO/JBWC) + RM 대시보드(단일 페이지) + 가드레일 5종 E4. PR#1(ccl-financial)·PR#2(메모리 카드+LLM 게이트웨이) **OPEN 머지 대기**. 실태 색인: [[implementation-index]] · [[구현현황-JB_project2]].

---

## 1. Feature Index (ID / 기능 / 상태 / 추적)

> 상태: **MVP**=본선 시연 범위 / **향후**=미시연. 데모등급: ✅실동작 / 🟡부분(mock·조건부) / ⛔비데모(코드·설계 근거만). E=근거등급. 추적=PRD 위치 + 코드/함수계약.

### 기능군 1 — 케이스 생성·생명주기 FSM

| Feature ID | 기능 | 상태 | 데모 | E | 추적(PRD·코드) |
|---|---|---|---|---|---|
| 1.1.1 | 위험신호 표준스키마 `RiskSignal`(6필드) | MVP | ✅ | E4 | PRD 1.1.1 · `computeRiskDecision` 입력 |
| 1.1.2 | 케이스 기본속성·연결정보 저장 | MVP | ✅ | E4 | PRD 1.1.2 · data-model §1 |
| 1.2.1 | 상태별 허용행동 제약(FSM) | MVP | ✅ | E4 | PRD 1.2.1 · `moveCaseToColumn` |
| 1.2.2 | 5컬럼 칸반 렌더(리스크 배지 L0~L4) | MVP | ✅ | E4 | PRD 1.2.2 · S-03 |
| 1.3.1 | AuditEvent 공통필드·해시체인 | MVP | ✅(base app 한정)* | E4/base·E2/역할콘솔 | PRD 1.3.1 · `auditChainRecords` |
| 1.3.2 | 이벤트타입 목록(최소 7종) | MVP | ✅ | E4 | PRD 1.3.2 · agent-roster §5 |

\* **[실측 2026-07-04]** 해시체인은 base app에만 구현. CCL/FDR/JPO/JBWC 4개 역할 콘솔(히어로 CCL 포함)의 `*_audit_logs`는 해시체인 없는 평문 리스트 — 구현현황-JB_project2 §4·§8.

### 기능군 2 — 에이전트 오케스트레이션

| Feature ID | 기능 | 상태 | 데모 | E | 추적(PRD·코드) |
|---|---|---|---|---|---|
| 2.1.1 | 실행시퀀스 템플릿(판단→행동초안→검증) | MVP | ✅ 결정형 / 🟡 라이브LLM | E4 결정형·E2 라이브 | PRD 2.1.1 · orchestrator |
| 2.2.1 | AgentRun 상태모델·불변 `decisionSnapshot` | MVP | ✅ | E4 | PRD 2.2.1 · `startAgentRun` |
| 2.2.2 | 실패 처리정책(안전 강등 needsReview) | MVP | 🟡 | E2 | PRD 2.2.2 · 승보 SECURITY_GUARDRAILS |
| 2.3.1 | 실시간 스트리밍뷰(단계별) | MVP | 🟡 | E2 | PRD 2.3.1 · 로컬 EXAONE [목표/7-4] |

### 기능군 3 — 승인게이트 HITL

| Feature ID | 기능 | 상태 | 데모 | E | 추적(PRD·코드) |
|---|---|---|---|---|---|
| 3.1.1 | Approval 엔티티·상태전환(L0~L4) | MVP | ✅ | E4 | PRD 3.1.1 · `approvalLevelMatrix` |
| 3.1.2 | 승인대기함 필터/정렬(SLA) | MVP | ✅ | E3 | PRD 3.1.2 · S-04 |
| 3.2.1 | 초안·근거·규정검증 동시표시 | MVP | ✅ | E4 | PRD 3.2.1 · context-panel |
| 3.2.2 | 수정후승인 편집기·diff 감사 | MVP | 🟡 | E2 | PRD 3.2.2 |
| 3.3.1 | 발송트리거(승인 전이 이벤트만) | MVP | ✅ | E4 | PRD 3.3.1 |
| 3.3.2 | 거부/오류 차단·전환 | MVP | ✅ | E4 | PRD 3.3.2 · Approval safety 100% |

### 기능군 4 — 규정준수·PII 비반출

| Feature ID | 기능 | 상태 | 데모 | E | 추적(PRD·코드) |
|---|---|---|---|---|---|
| 4.1.1 | 규정조회·인용생성(RAG/규정DB) | MVP | 🟡 | E2 | PRD 4.1.1 · canon §4 인용형식 |
| 4.2.1 | 데이터등급제·모델 라우팅(4단계) | MVP | ✅ | E4 | PRD 4.2.1 · `dataGovernance.tiers` |
| 4.2.2 | 토큰매핑 보관·복원 제한 | MVP | 🟡 | E2 | PRD 4.2.2 |
| 4.3.1 | 반출스캔 차단/경고(restricted hard-fail) | MVP | ✅ | E3→E4 목표 | PRD 4.3.1 · 승보 `verifyNoPIILeakage` |
| 4.3.2 | 보안이벤트 감사로그(append-only) | MVP | ✅ | E4 | PRD 4.3.2 · 해시체인 |

### 기능군 5 — 외부시스템연동

| Feature ID | 기능 | 상태 | 데모 | E | 추적(PRD·코드) |
|---|---|---|---|---|---|
| 5.1.1 | 코어 위험신호 커넥터·재시도 | 향후 | ⛔ | E1 | PRD 5.1.1 · mock 커넥터 |
| 5.2.1 | 규정DB/검색 API 계약 | 향후 | ⛔ | E1 | PRD 5.2.1 · api-spec |
| 5.3.1 | 알림발송 요청·결과수집 | MVP | 🟡 | E2 | PRD 5.3.1 · mock 종단 |
| 5.3.2 | 발송실패 재시도금지·idempotency | 향후 | ⛔ | E1 | PRD 5.3.2 |

### 기능군 6 — 케이스 협업·저장형태 (7/4 회의 신규 FR)

> 7/4 전략회의에서 새로 제기됐으나 현 문서·프로토타입에 미반영이던 두 요구(`00_결정-준비/기능요구사항-7-4회의.md` FR-08·FR-09)를 기능으로 정식화한다. 둘 다 **현재 미구현 · 설계 단계**로, 데모등급 ⛔(코드·설계 근거만), 상태 향후.

| Feature ID | 기능 | 상태 | 데모 | E | 추적(회의·코드) |
|---|---|---|---|---|---|
| 6.1.1 | 케이스 = 마크다운 파일(옵션적 표현/저장 형태) | 향후 | ⛔ | E1 | FR-08(김주용 17:18) · 현 케이스=상태객체/`localStorage` |
| 6.2.1 | 케이스 코멘트/메모/댓글 담당자 피드백 | 향후 | ⛔ | E1 | FR-09(김주용 17:32) · 신규 엔티티(미구현) |

### 기능군 7 — 운영 관측 (LLM 게이트웨이·원가·감사 실효성) [2026-07-04 구현]

> 심사 공격질문 3축(비용·오류·감사, [[Q13-토큰비용-유닛이코노믹스]]·[[Q14-오류로깅-폴백사다리]]·[[Q15-감사로그-실효성]])을 문서가 아니라 작동으로 답하는 기능군. base app(`02_제품/app`) + `api-proxy.mjs` 구현. 상시 순찰 에이전트화는 [설계](casesops-분기 08~10).

| Feature ID | 기능 | 상태 | 데모 | E | 추적(PRD·코드) |
|---|---|---|---|---|---|
| 7.1.1 | LLM 게이트웨이 `POST /llm` — claude·codex·ollama 3엔진 라우팅 + 폴백 사다리 + 시도별 JSONL 원장 | MVP | ✅(프록시 기동 시) | E4 | judge-qna §16 · `api-proxy.mjs handleLlm()` · JB_project2 이식본 `scripts/llm-gateway.mjs`(:8022, PR#2) |
| 7.1.2 | 토큰 실측 패널 — 케이스 단가·티어별·RM 1인 월 환산(`GET /llm/usage`) | MVP | ✅(`?live=1` 한정) | E4 | Q13 · `modules.js liveLlmBlock()` |
| 7.1.3 | 감사 레코드 소비자 용도 태그(당국 증적/분쟁 재생/운영 점검/원가 정산) | MVP | ✅(base app) | E4 | Q15 · `app.js auditPurpose()` |
| 7.1.4 | 엔진룸 — 최근 LLM 호출 타임라인(5초 폴링, 폴백·격상 표시) | MVP | ✅(`?live=1` 한정) | E4 | Q14 · `modules.js engineRoomRows()` |
| 7.1.5 | 운영계약 온톨로지 그래프 — 케이스 실데이터 관계 렌더(cytoscape 로컬 벤더링, 17노드/16엣지 실측) | MVP | ✅(base app) | E4 | 케이스 상세 · `modules.js initCaseOntology()` |

### 기능군 8 — 메모리 3계층 (PR#2 제출·머지 대기) [2026-07-04 구현·검증]

> 고객/에이전트/직원 메모리 카드 — "기본값은 기억하지 않는다" 증류. 스펙 SSOT: [[11-메모리-3계층-자동진화-설계도]]. fork 브랜치에서 수용기준 4/4 브라우저 실검증, **머지 전이라 정본 데모는 조건부**.

| Feature ID | 기능 | 상태 | 데모 | E | 추적(PRD·코드) |
|---|---|---|---|---|---|
| 8.1.1 | MemoryCard 저장·규칙 증류(승인/반려→3계층 카드, 3회→confirmed, PII 거부, crossBan) | MVP | 🟡(PR#2 브랜치 한정) | E4/fork | `memoryCards.js` · `afterApprovalDecision` 훅 push |
| 8.1.2 | 메모리 카드 읽기 전용 뷰(에이전트 하네스 하단, provenance 표시) | MVP | 🟡(PR#2 브랜치 한정) | E4/fork | `cclMemoryCardsPanel()` |

### 기능군 9 — 운영 순찰 에이전트 3종 [설계]

> 관측 원장을 순찰하는 상시 운영 레이어 — 실행 권한 없음(제안→사람 승인). 설계 SSOT: casesops-분기 08~10.

| Feature ID | 기능 | 상태 | 데모 | E | 추적(PRD·코드) |
|---|---|---|---|---|---|
| 9.1.1 | Cost Sentinel — 원가 순찰·티어 효율 제안·break-even 감시 | 향후 | ⛔ | E1 | [[08-Cost-Sentinel-에이전트-설계도]] |
| 9.1.2 | 119 라우팅 관측 확장 — 임계 초과 사고 승격·사람 큐 티켓 | 향후 | ⛔ | E1 | [[09-119-라우팅관측-확장-설계도]] |
| 9.1.3 | Ledger Curator — 소비자 없는 로그 검사·메모리 승격 심사 | 향후 | ⛔ | E1 | [[10-Ledger-Curator-에이전트-설계도]] |

**데모가능 요약**: ✅실동작 17 / 🟡부분 10 / ⛔비데모 9 (총 36 항목 — 기능군6 ⛔2·기능군7 ✅5·기능군8 🟡2(PR#2)·기능군9 ⛔3 포함). E4(작동 검증) 목표 달성 = ✅ 12항목 중 결정형 로직. 라이브 LLM 스트리밍(2.3.1)·PII 반출스캔 E4 격상은 **[목표/7-4]** — 현재 미완(키스톤 §정직한 전제). FR-08·FR-09는 **[설계/미구현]** — 발표 시 로드맵 항목으로만 제시.

---

## 2. Feature Template — 데모-크리티컬(E4) 상세

> `ccl-financial` 실동작 슬라이스(히어로 CCL-0001 여신 판단→승인→감사)를 **E4로 확정**한다. 아래 상세 명세는 데모 경로가 지나는 기능만 테스트 가능한 문장으로 전개한다. 나머지는 §1 Index + PRD 수용기준으로 갈음.

### F-1.1.1 · 위험신호 표준스키마 `RiskSignal` — E4

| 필드 | 내용 |
|---|---|
| **User story** | 여신심사 직군이 흩어진 위험 신호(매출 둔화·상권·연체·서류)를 **동일 스키마**로 받아, 각 신호가 위험점수에 얼마나 기여했는지 근거와 함께 보고 싶다. |
| **Input** | `name`, `value`, `weight`, `contribution`, `sourceTag`, `evidenceId` 6필드. 최소 1개 이상. |
| **Output** | 정규화된 `RiskSignal[]` — `computeRiskDecision`의 입력. 각 신호가 결과 화면에서 기여도(%)로 렌더. |
| **Logic** | 신호 배열 → 가중합 → `riskScore`(0~100) + `band`(L0~L4). D2 근거: 여신은 심사엔진보다 **상태·근거 대조**가 먼저 [E2, D2 요약]. 절대금액·전결 임계값은 **하드코딩 금지, 설정값 구조**로 [E2, D2 §주의]. |
| **Edge cases** | (a) 필드 누락 신호 → 케이스 생성 차단, 어떤 필드가 비었는지 표기. (b) 신호 0건 → 케이스 생성 불가. (c) `contribution` 합≠riskScore 재현식 → 정합 실패 플래그. |
| **Acceptance criteria** | ① `computeRiskDecision` 출력의 모든 신호가 6필드를 빠짐없이 채운다. ② 필드 누락 시 케이스 생성이 차단되고 AuditEvent(실패)가 남는다. ③ CCL-0001 입력에서 `riskScore=88·band=L3`가 **재현**된다(동일 입력→동일 출력). |
| **Evidence** | `02_제품/app/app.js` `computeRiskDecision` + Playwright e2e(`localguard.spec.js`) + `verify_static.py` 문자열 계약. 심사 프레이밍: "정확도"가 아니라 **"평가셋 N건에서 재현·0 위반 관측"** [E4, D13 요약]. |

### F-1.2.1 · 상태별 허용행동 제약 FSM `moveCaseToColumn` — E4

| 필드 | 내용 |
|---|---|
| **User story** | RM이 케이스를 신규→진행→검토→완료로 옮기되, 금지된 전이(예: 차단 케이스의 임의 완료)는 **시스템이 막아** 규제 리스크를 예방하고 싶다. |
| **Input** | `caseId`, `targetColumn`(신규/진행/검토/완료/차단), actor. |
| **Output** | 허용 시 상태 전이 + AuditEvent(성공). 금지 시 UI 차단 + AuditEvent(실패). |
| **Logic** | 5컬럼 FSM 전이표. 결정형 결과는 **규칙 계층이 최종 게이트**, LLM은 요약·설명만 [E2, D9 요약]. D2: `상담→품의→전결→심사→약정→기표→사후관리→회수` 상태를 실무 상태기계로 매핑 [E2]. |
| **Edge cases** | (a) 차단 컬럼 → 승인 액션 비활성화. (b) high/critical 판정 케이스는 실패 run에서도 completed/closed로 **자동 전이 금지**(안전 강등만, F-2.2.2 연동). (c) 동시 전이 경합 → 마지막 상태 기준 재검증. |
| **Acceptance criteria** | ① 금지된 상태 전이 시도가 UI에서 차단되고 AuditEvent(실패)가 기록된다. ② 차단 컬럼에서 승인 액션이 비활성이다. ③ 5컬럼이 모두 렌더되고 카드마다 리스크 배지(L0~L4)가 표시된다. |
| **Evidence** | `moveCaseToColumn` 함수계약 + e2e 상태전이 시나리오. |

### F-1.3.1 · AuditEvent 해시체인 `auditChainRecords` — E4

| 필드 | 내용 |
|---|---|
| **User story** | 준법 직군이 모든 판단·승인·반출차단이 **사후 수정 불가**하게 기록됐음을 검증하고, 심사위원에게 감사 무결성을 증명하고 싶다. |
| **Input** | 이벤트 스트림(actor/action/timestamp/evidenceId/seq/previousHash). |
| **Output** | GENESIS부터 `previousHash`로 연결된 append-only 레코드. 무결성 검증 결과(pass/fail). |
| **Logic** | 각 레코드 `hash = H(prev, payload)`. 최소 7종 이벤트타입(`case.created`·`agent.run.*`·`evidence.attached`·`risk.decision.computed`·`approval.*`·`audit.sealed`). D13: 각 claim에 `source_id·hash·policy_rule_id` 부착 = **attribution coverage** 측정 근거 [E2, D13]. |
| **Edge cases** | (a) 레코드 중간 변조 → previousHash 불일치로 검증 실패 노출. (b) seq 누락/역전 → 무결성 fail. (c) 삭제 시도 → append-only 위반으로 차단·보안이벤트 기록. |
| **Acceptance criteria** | ① 모든 AuditEvent가 previousHash 일치 검증을 통과한다. ② 케이스 1건당 **최소 4개** 이벤트타입이 기록된다(성공지표 연동). ③ 임의 변조 레코드 주입 시 검증이 **fail**로 검출된다. *(①·③은 base app 범위에서만 충족 — 아래 실측 참조)* |
| **Evidence** | `auditChainRecords` 함수계약 + 변조 주입 테스트. **[실측 2026-07-04]** 이 함수와 해시체인은 `02_제품/app.js`/`_vendor/JB_project2/app.js`의 **base app에만** 존재한다. CCL/FDR/JPO/JBWC 4개 역할 콘솔(히어로 CCL-0001 포함)은 각자 `*_audit_logs` 테이블에 append만 하고 `previousHash` 연쇄가 없다(예: `cclConsole.app.js:193-199`) — "탬퍼-에비던트 감사체인 전 콘솔 적용"은 **미충족**, base app 시연 범위로만 주장할 것([[08_본선/03_제품/구현현황-JB_project2|구현현황-JB_project2]] §4·§8). |

### F-2.1.1 · 실행시퀀스 판단→행동초안→검증(히어로 파이프라인) — E4 결정형 / E2 라이브

| 필드 | 내용 |
|---|---|
| **User story** | RM이 CCL-0001을 열면 상환위험 분류→정책금융 매칭→RM 보좌 초안까지 에이전트 handoff가 **실행시퀀스대로** 흐르고, 각 단계 근거를 확인하고 싶다. |
| **Input** | CCL-0001 케이스 + `RiskSignal[]`. trigger 4분류(`assignment`/`on_demand`/`timer`/`automation`). |
| **Output** | 3단계 산출(위험밴드+사유코드 / 정책·서류 체크리스트 초안 / 콜백 스크립트 초안) + 단계별 AgentRun 로그. |
| **Logic** | **결정형 골격**(라우팅·상태·근거연결)은 코드로 확정 실행. **라이브 LLM 추론**(초안 문장 생성·스트리밍)은 로컬 EXAONE/Claude API 경유 — 7/3 기준 **미연결, 밤샘 목표** [목표/7-4, 키스톤 §정직한 전제]. D9: 단일 에이전트/classic RAG로 시작→specialist handoff 추가가 표준 경로 [E2]. |
| **Edge cases** | (a) LLM 미연결 시 → **결정형 골든패스로 폴백**(초안은 템플릿, 데모 계속). (b) 상환위험 미확정 상태에서 정책매칭 handoff 요청 → 순서 위반 차단. (c) 단계 실패 → 자동종결 없이 needsReview. |
| **Acceptance criteria** | ① 히어로 CCL-0001이 최소 3개 에이전트 handoff를 실행시퀀스대로 완주한다. ② 각 AgentRun이 불변 `decisionSnapshot`을 보유해 실행이력(S-05)에서 조회된다. ③ LLM 장애 시 결정형 폴백으로 데모가 끊기지 않는다. |
| **Evidence** | orchestrator 실행 파이프라인 + e2e handoff 시나리오. **라이브 LLM 부분은 [미검증/목표]** — 발표엔 [목표/조건부]로 정직 표기. |

### F-3.1.1 · Approval 엔티티·게이트 L0~L4 — E4

| 필드 | 내용 |
|---|---|
| **User story** | 승인자(RM·준법)가 고객 대상 행동을 **초안·근거·규정검증을 한 화면**에서 보고 승인/거부/수정후승인하되, 승인 없는 자동 실행은 원천 불가여야 한다. |
| **Input** | `Approval`(level L0~L4, approverRole, gateChecks[], actionDraft). score 기반 레벨 산정. |
| **Output** | 상태 전이(pending→approved/rejected/edited-approved) + 발송 큐 진입 여부. L3(80~89)=**RM+준법 공동** 결재. |
| **Logic** | `approvalLevelMatrix`(app.js): L0 내부기록만 ~ L4 발송보류/차단. D9: 승인 전 `interrupt/checkpoint/tool approval`로 **hold** = 검증된 구현 패턴 [E2]. 고객 행동은 approved/edited-approved 전이 이벤트만 발송 트리거(F-3.3.1). |
| **Edge cases** | (a) pending/rejected에서 발송 워크플로 트리거 시도 → 정적검증 차단. (b) 자체승인(게이트 우회) → hard fail. (c) L3 케이스에 준법 서명 누락 → 승인 미완결. |
| **Acceptance criteria** | ① 상태는 pending→approved/rejected/edited-approved만 허용, 그 외 전이는 hard fail. ② rejected 케이스의 고객향 행동이 **100% 차단**된다. ③ 승인 카드 클릭 시 초안·근거링크·규정검증(법령 인용)이 동시 노출된다. ④ **critical flow 승인 불변식 위반 0건**(범위·분모 명시 프레이밍) [E4, D13]. |
| **Evidence** | `approvalLevelMatrix` + e2e 승인/거부/우회차단 시나리오. |

### F-4.3.1 · 반출스캔 PII 차단(restricted hard-fail) — E3, E4 목표

| 필드 | 내용 |
|---|---|
| **User story** | 준법이 외부 LLM으로 나가는 모든 페이로드에서 원본 PII/신용정보를 **차단**하고, 시도·차단을 감사로그로 증명해 "PII 4중방어"를 실동작으로 보이고 싶다. |
| **Input** | 외부 전송 후보 페이로드 + `dataGovernance.tiers`(restricted/confidential/internal/public) 등급. |
| **Output** | restricted 발견 시 차단(hard fail), confidential 경고. 보안이벤트 AuditEvent(append-only). |
| **Logic** | 승보 `verifyNoPIILeakage` 패턴 참고 [조건부]. D13: 검증은 synthetic **canary·honeytoken**으로 direct ask / indirect injection / summarization leakage / tool-arg leakage를 돌리고 **최종출력·로그·내부메시지 전부 스캔** [E2, D13]. |
| **Edge cases** | (a) 토큰화 우회(원문 잔존) → 반출스캔 재검증에서 차단. (b) 요약 과정 재식별 누출 → summarization leakage 테스트로 검출. (c) 도구 인자에 PII 삽입 → tool-arg 스캔. |
| **Acceptance criteria** | ① 원문 PII 포함 외부 전송 테스트케이스가 **100% 차단**된다(canary N건, 분모 명시). ② restricted 등급 필드가 클라우드 LLM 경로로 라우팅되지 않는다. ③ 반출시도/차단이 해시체인에 편입돼 사후 삭제·수정 불가함을 검증한다. |
| **Evidence** | 반출스캔 정책 + canary 테스트셋. **현재 E3(절차 정의)**, canary 자동 스캔 e2e 완성 시 **E4** [목표/7-4]. "PII 누출 0건"을 **보편 보장으로 쓰지 않는다** — 범위·분모 필수 [E2, D13 §주의]. |

### F-6.1.1 · 케이스 = 마크다운 파일 (옵션적 표현/저장 형태) — [설계] E1

| 필드 | 내용 |
|---|---|
| **User story** | 담당자가 한 케이스를 사람이 읽고 버전관리·이관·감사할 수 있는 **마크다운 파일**(1건=1개 또는 여러 개)로 보관·열람하고 싶다(김주용 17:18 "하나의 케이스는 하나의 마크다운 파일이 될 수도, 여러 개가 될 수도"). |
| **Input** | 케이스 상태객체(`ccl_cases`/`fdr_cases`/`jeonse_cases`/`ops_cases` 레코드 + 연결 노트·근거·감사). **[실측 2026-07-04]** 실제로는 콘솔별 5개 독립 localStorage DB(`jb-finance-support-state-v4`/`ccl-ops-db-v1`/`fdr-ops-db-v1`/`jpo-ops-db-v2`/`jbwc-ops-db-v3`)에 순수 JS 객체(JSON)로 저장되며, 파일시스템 기반 케이스 문서는 존재하지 않는다([[08_본선/03_제품/구현현황-JB_project2|구현현황-JB_project2]] §5). |
| **Output** | 케이스 1건의 md 표현(front-matter=식별자·상태·리스크, 본문=요약·근거·감사 타임라인). **저장 형태는 옵션** — 현 프로토타입의 상태객체/`localStorage`를 대체하지 않고 **읽기·export 레이어**로 얹는다. |
| **Logic** | 상태객체 → md 직렬화(비식별 유지: `BIZ-REF`/마스킹만, PII 원문 금지). 여러 파일 분할 시 케이스 ID로 묶음. **미구현** — 표현/저장 형태 확정은 [설계]. |
| **Edge cases** | (a) PII 원문이 md에 직렬화되지 않도록 반출스캔(F-4.3.1) 경유. (b) 파일↔상태객체 정합(동기화 방향·SSOT) 미정 [Open Question]. (c) 여러 파일 분할 시 감사 체인 연속성. |
| **Acceptance criteria** | ① 케이스 1건이 비식별 md로 export되고 재열람된다. ② md에 PII 원문이 없다(반출스캔 통과). ③ 상태객체와 md 표현이 동일 식별자로 매핑된다. *(모두 [목표] — 현재 미충족)* |
| **Evidence** | FR-08(`00_결정-준비/기능요구사항-7-4회의.md`). 현 프로토타입은 케이스=상태객체/콘솔 테이블 레코드 — **md 파일 표현 없음(미구현)**. |

### F-6.2.1 · 케이스 코멘트/메모/댓글 담당자 피드백 — [설계/미구현] E1

| 필드 | 내용 |
|---|---|
| **User story** | 직원(담당자)이 하나의 케이스에 **코멘트·자신의 메모·댓글** 형태로 에이전트 결과물에 피드백을 남기고, 그 피드백이 케이스 이력·(향후)에이전트 학습 루프에 축적되게 하고 싶다(김주용 17:32). |
| **Input** | `caseId`, `actorId`(USR-*), `commentType`(comment/memo/reply), `bodyText`, (선택)`parentCommentId`. |
| **Output** | 신규 엔티티 `case_comments`(레코드) append + 감사 로그. 케이스 상세 뷰에 스레드로 렌더. **신규 F-항목** — PRD·domain-model에 미존재. |
| **Logic** | append-only 코멘트 스레드. 작성 시 PII 체크·단정 표현 체크(고객 공유 아님, 내부 메모). 에이전트 산출물(AgentRun/Recommendation)에 대한 피드백은 `targetType`으로 연결. FR-11 "쓸수록 피드백 학습"의 입력원으로 설계상 연결되나 **학습 루프는 미구현**. |
| **Edge cases** | (a) 코멘트에 PII 원문 → 반출스캔/마스킹. (b) 삭제 시 append-only 유지(취소선/철회 상태). (c) 고객 대상 발송과 혼동 방지 — 코멘트는 **내부 전용**, 발송 게이트(F-3.3.1) 미경유. |
| **Acceptance criteria** | ① 담당자가 케이스에 코멘트/메모를 남기고 스레드로 조회된다. ② 코멘트가 감사 로그에 편입된다. ③ 코멘트는 고객 발송 경로로 나가지 않는다. *(모두 [목표] — 현재 미충족)* |
| **Evidence** | FR-09(`00_결정-준비/기능요구사항-7-4회의.md`). 현 PRD·feature-spec·domain-model에 코멘트/댓글 기능 없음(메모리 '유형' 언급만) — **신규 기능·미구현**. |

---

## 3. 약근거·미검증·가정 명시

| 항목 | 등급 | 처리 |
|---|---|---|
| 히어로 ID | [확정 2026-07-04] CCL-0001 단일화(구 JBG-104) | §0. 이원화 종결. 네이밍 규약만 naming-rules에서 잠금 [미결/7-4] |
| 라이브 LLM 스트리밍(2.3.1)·히어로 라이브 추론(2.1.1 라이브) | [목표/7-4] E2 | 로컬모델·API 미연결(키스톤 §정직한 전제). 폴백=결정형 골든패스 |
| PII 반출스캔 E4 격상(4.3.1) | [목표] E3→E4 | canary 자동 스캔 e2e 미완 |
| 실패 안전강등·수정후승인 diff(2.2.2·3.2.2) | [조건부] E2 | 정책 문서화 우선, 장애주입 데모는 조건부 |
| 규정 RAG 인용(4.1.1) | [조건부] E2 | 규정DB는 로컬 mock, 인용 형식은 canon §4 준수 |
| 외부 커넥터·API 계약(5.1.1·5.2.1) | [향후] E1 | MVP는 mock, 코드·설계 근거만 |
| Triage 50%·ROI 등 절대KPI | [추정] | D13 프레이밍 적용 — "N건 평가셋 0 위반 관측"으로 서술, 보편 보장 금지 |
| 케이스=마크다운 파일(6.1.1/FR-08) | [설계] E1 | 표현/저장 형태·파일↔상태객체 SSOT 미정. 발표 로드맵 항목 |
| 케이스 코멘트/메모/댓글(6.2.1/FR-09) | [설계/미구현] E1 | 신규 엔티티 `case_comments` 미구현. FR-11 학습루프 입력원으로만 연결 |
| 코드 실측 인벤토리(2026-07-04) | [실측] E4 | 43파일/24,667줄, 6진입점·98뷰(§1.3.1 참고), 에이전트 40(8+8+11+13)·스킬28, CSS 커스텀프로퍼티 121·컴포넌트클래스 537, LLM 실호출 0건(fetch 2건=data.go.kr 전세API), Case=JS객체+localStorage(5개 독립 DB, 마크다운 아님). 전거: [[08_본선/03_제품/구현현황-JB_project2|구현현황-JB_project2]] |

---

## 연결

- [[08_본선/03_제품/docs/06_prd|PRD]] (기능군 1~5 수용기준 SSOT)
- [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]] (실행시퀀스·승인 매트릭스)
- [[08_본선/03_제품/01_결정-준비/키스톤-확정|키스톤]] (역할축·데모 3케이스·정직한 전제)
- [[08_본선/03_제품/04_tech/data-model|데이터 모델]]
- [[08_본선/03_제품/06_build-roadmap/_빌드-로드맵-MOC|빌드 로드맵]] (P0~P6)
- [[08_본선/03_제품/01_결정-준비/설계/승보-프로토타입-반영|승보 프로토타입 반영]] (`verifyNoPIILeakage`·계열사 하네스)
