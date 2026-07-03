---
tags:
  - area/product
  - type/reference
  - status/active
date: 2026-07-03
up: "[[INDEX|제품 인덱스]]"
aliases: [에이전트 로스터, 14 에이전트 로스터, agent company 구조]
---

# 에이전트 로스터

> SSOT: 14종 **표시명**은 [[_canon|_canon.md §2]](설계 SSOT) — 이 문서의 표시명은 그대로 canon을 따른다. `skillRack`·`approvalLevelMatrix` 등 skill/approval **필드**는 `02_제품/app/app.js` 실제 구현이 근거다. 이 문서는 그 14종을 paperclip式 `company × role` 조직 모델로 재구조화하고, 각 에이전트의 소속·trigger·판단/행동/검증 경계·owner 케이스를 확정한다. 근거: `_vendor/harness-engineering-skills/skills/agent-loop/SKILL.md`, `08_본선/03_제품/00_결정-준비/설계/agents-v2-paperclip기반-재설계.md`, `08_본선/03_제품/00_결정-준비/설계/승보-프로토타입-반영.md`.
>
> **[미결/데모전 정합]** app.js `agents` 배열의 코드 `name` 필드는 canon 표시명과 다르다(예: 오케스트레이터 코드명="업무지원 조율 기능", RM 보좌 코드명="RM Copilot Agent") — 데모 전 코드-canon 정합 작업 필요.

---

## 0. 레이어 구분 (필독 — 숫자 혼선 방지)

**"14개 에이전트"는 메인 콘솔(전북은행 Hero, `02_제품/app/app.js`) 전용 레이어다.** 승보 프로토타입(`_vendor/JB_project2/`)은 JB우리캐피탈 하네스 13개 + 전세보호 역할 하네스 10개, 도합 23개의 **완전히 독립된 에이전트 세트**를 이름·도메인 전부 다르게 이미 구현해 두었다(`승보-프로토타입-반영.md` §2, §6.2). 발표·문서에서 "14개 에이전트"라고만 말하면 승보 세트와 숫자가 충돌하니, **"메인 14 + 계열사/역할별 확장 하네스는 도메인팩 단위로 별도 세트"**로 표현한다. 두 레이어를 병합할지, 승보 세트를 도메인팩으로 흡수할지는 [미결/7-4].

---

## 1. paperclip 개념 ↔ 우리 운영계약 매핑

| paperclip 개념 | 우리 개념 | 비고 |
|---|---|---|
| `company` | 콘솔(계열사 스코프: 전북은행 / JB우리캐피탈) | company-scoped 데이터·권한·로그 |
| `agents` | 14 운영 에이전트 + 사람 승인자 2종 + 승인 게이트 | 상태·skills·runtime config 보유 |
| `issues` / task | `Case` | single-assignee(주 담당 에이전트) + 다수 handoff |
| `heartbeat_runs` | `AgentRun` | wakeup → claim → 실행 → 상태 복귀 |
| `companySkills` / `SKILL.md` | `skillRack`(25종, [[08_본선/03_제품/02_agent-design/skill-spec|스킬 명세]]) | 콘솔 단위 장착·버전관리 |
| `issueWorkProducts` / artifact | `Evidence` | 근거 문서·스냅샷 |
| `approvals` | `Approval`(L0~L4) | RM 최종 승인자, 준법 최종 승인자 |
| `activityLog` + `heartbeatRunEvents` | `Audit`(해시체인, `auditChainRecords`) | 변경·실행·상태·도구호출 추적 |

paperclip의 hiring 모델(`requireBoardApprovalForNewAgents`, `pending_approval → idle`)은 우리 식으로 **도메인팩 확장**에 대응한다 — 신규 에이전트/스킬은 core 14를 늘리는 방식이 아니라 `AGENTS + SKILLS + CASE templates + EVALS + APPROVAL policy` 묶음으로 붙이고, 활성화 전에는 `pending_approval` 상태로 조직도에만 노출한다(RM 또는 준법 최종 승인자 승인 필요). 상세: `08_본선/03_제품/00_결정-준비/설계/agents-v2-paperclip기반-재설계.md` §4.

---

## 2. 도메인팩 (에이전트가 소속되는 확장 단위)

| 도메인팩 | 구성 에이전트 | 계열사 | 상태 |
|---|---|---|---|
| 소상공인 여신팩 | 상환위험 분류, 정책금융 매칭, RM 보좌, 준법 검토 | 전북은행 | 본선 core, 히어로(JBG-104) 소속 |
| 전세보호팩 | 전세위험 관리 리드, 전세가율 분석, 등기 권리 분석, 임차인 손실위험, 계약 체크리스트 | 전북은행 전용 | 본선 core |
| 피싱/AML팩 | 이상거래 탐지·차단, 준법 검토, 은행 연계 | 은행+캐피탈 | 본선 demo |
| 사후관리/EWS팩 | 위험신호 조기감지, 포트폴리오 분석, 은행 연계, 준법 검토 | 은행+캐피탈(캐피탈 확장 core) | [미결/7-4] — 캐피탈 적용성 확정 대기 |

`전세`는 전북은행 전용 케이스 유형이며 JB우리캐피탈에 미러링하지 않는다(캐피탈 사업영역 밖). 신규 도메인팩(예: 사후관리 4번째 도메인 정식 편입) 채택 시 `08_본선/03_제품/00_결정-준비/설계/왜-14개-에이전트-정당화.md` §4 기준 최소 +1(자금용도외유용 점검 전문화 단위)이 필요할 수 있음 — [미결/7-4].

---

## 3. 14 에이전트 로스터

> trigger는 paperclip wakeup source(`assignment`/`on_demand`/`timer`/`automation`) 분류. 판단/행동/검증 경계는 `agent-loop` SKILL.md의 Judgment/Possible Actions/Forbidden Actions/Verification 카드를 압축한 것.

### 운영 지휘·분석

| 에이전트 (내부명) | 소속(계열사×직군) | 도메인팩 | Trigger | 판단 경계 | 행동(가능/금지) | 검증 경계 | Owner 케이스 |
|---|---|---|---|---|---|---|---|
| **운영 조율 에이전트**(LocalGuard Orchestrator) | 전체 공통, 전 직군 | 전 도메인팩 core(오케스트레이션) | `assignment`(Case 생성/상태변경) + `on_demand` | Case→하위 에이전트 라우팅 대상, 승인 레벨 산정(`approvalLevelFor`) | 가능: 서브에이전트 배정, FSM 상태 전이(§[[08_본선/03_제품/02_agent-design/orchestrator\|오케스트레이터]]) · 금지: 고객 대상 행동 직접 실행, 승인 게이트 우회 | 라우팅 로그·FSM 상태 정합성, 승인 대기 중 유실 방지 | 전체 케이스 공통(JBG-104 라우팅 예시) |
| **포트폴리오 분석 에이전트**(Analytics Agent) | 은행+캐피탈, 사후관리 | 사후관리/EWS팩 | `timer`(주기 집계) | 지점/계열사별 위험 클러스터·KPI drift 집계 | 가능: 대시보드 집계, 트렌드 요약 · 금지: 개별 케이스 판정, 승인/차단 결정 | BCBS239 데이터품질축(정확성·완전성·적시성·적응성) | 포트폴리오 대시보드(케이스 비종속) |

### 위험·금융 판단

| 에이전트 | 소속 | 도메인팩 | Trigger | 판단 경계 | 행동(가능/금지) | 검증 경계 | Owner 케이스 |
|---|---|---|---|---|---|---|---|
| **위험신호 조기감지 에이전트**(Pain Radar Agent) | 은행+캐피탈, RM·사후관리 | 소상공인 여신팩 + 사후관리/EWS팩 | `timer`/`automation`(상시 신호 스캔) | 매출 둔화·상권·공공데이터 신호 → Case 승격 여부(아직 평가 미확정 단계) | 가능: `evidence-harvest`/`source-ranker`/`pain-classifier` 실행, Case 초안 생성 · 금지: 위험 밴드 확정(상환위험 분류 담당), 고객 접촉 | thin-file 누락·지연 탐지, freshness check | 포트폴리오 스캔 → JBG-104 승격 경로 |
| **상환위험 분류 에이전트**(Cashflow Triage Agent) | 전북은행+캐피탈, 여신심사 | 소상공인 여신팩(core) | `assignment`(Case 개설 후 촉발형) | `cashflow-stress`/`rate-relief` → 위험 밴드 + 사유코드(신정법 §36조의2 자동화평가 결과) | 가능: 위험 밴드 산정, 승인 큐 상정 · 금지: 정책상품 확정 매칭, 고객 발송 | 신용정보법 §36조의2 설명요구권 대응(사유코드 필수) | **JBG-104 전주 중앙로 카페(riskScore 88, 히어로 owner)** |
| **정책금융 매칭 에이전트**(Policy Match Agent) | 전북은행 중심, RM | 소상공인 여신팩 | `on_demand`(상환위험 확정 후 handoff) | `policy-match`/`document-checklist` → 정책자금·보증·대환 후보 매칭 | 가능: 서류 체크리스트 초안 · 금지: 최종 승인, 확정 추천 단정 | 정책자금 공고 RAG 출처 연결(근거패킷) | 광주 송정 도소매(idle demo), JBG-104 정책 후보 |

### 전세 보호 라인 (전북은행 전용)

| 에이전트 | 소속 | 도메인팩 | Trigger | 판단 경계 | 행동(가능/금지) | 검증 경계 | Owner 케이스 |
|---|---|---|---|---|---|---|---|
| **전세위험 관리 리드**(Jeonse Shield Lead) | 전북은행, RM·여신심사 | 전세보호팩(리드) | `assignment`(전세 케이스 접수) | 하위 3전문가(가율·등기·자산) 결과 종합, 은행 연계 필요 여부 | 가능: `case-os-core`로 하위 handoff 생성 · 금지: 개별 전문 판단 대체(통합만, 재계산 금지) | 3전문가 결과 전원 연결 확인 전 종료 금지 | `seoul-jeonse-villa` |
| **전세가율 분석 에이전트**(Deposit Ratio Agent) | 전북은행, 여신심사 | 전세보호팩 | `assignment`(리드 하위 handoff) | `jeonse-price-ratio`/`local-market-compare` → 가격 신뢰도(구간) | 가능: 비율·괴리 산출, data confidence 표기 · 금지: 확정가격 판단(band만) | 국토부 실거래가 수기입력 오류 가능성 상시 표기 | `seoul-jeonse-villa` |
| **등기 권리 분석 에이전트**(Registry Rights Agent) | 전북은행, 여신심사·준법 | 전세보호팩 | `assignment` | `registry-rights-scan`/`ownership-transfer-delta` → 권리관계 사실확인 | 가능: 근저당·압류·신탁등기 위험 플래그 · 금지: 등기 원문 저장/재식별, 법률자문 확정 | 근거(근저당/압류/신탁 여부) 명시 없이 위험판정 금지 | `seoul-jeonse-villa` |
| **임차인 손실위험 에이전트**(Tenant Asset Risk Agent) | 전북은행, 여신심사 | 전세보호팩 | `assignment`(등기 결과 입력 후, 파이프라인 순서 의존) | `tenant-asset-exposure`/`housing-cost-burden` → 손실추정 + fallback 옵션 | 가능: 손실 주의 수준 산정 · 금지: 보증가입 확정 판단(안내만, 계약 체결 아님) | 등기+시세 결합 계산 근거 명시 | `seoul-jeonse-villa` |

### 준법·차단·계약 통제

| 에이전트 | 소속 | 도메인팩 | Trigger | 판단 경계 | 행동(가능/금지) | 검증 경계 | Owner 케이스 |
|---|---|---|---|---|---|---|---|
| **이상거래 탐지·차단 에이전트**(Fraud Shield Agent) | 은행+캐피탈, AML | 피싱/AML팩 | `on_demand`(FDS 알림 수신) | `fraud-shield`/`do-not-contact-rule` → 고위험 사기 징후, 차단 필요 판정 | 가능: 고객 접촉 보류(do-not-contact), 보안팀 상위 검토 요청 · 금지: 계좌/거래 변경, high/critical **자동종결**(승보 SECURITY_GUARDRAILS 채택 권고 — 안전 강등만 허용) | 전자금융거래법 §22·시행령 §12 접속·거래기록 보존 | `gunsan-manufacturing` |
| **준법 검토 에이전트**(Compliance Guard Agent) | 전체, 준법 | 전 도메인팩 횡단(core 통제) | `assignment`(모든 고객향 초안이 필수 경유) | `compliance-guard`/`privacy-redaction`/`claim-limiter` → PII 반출·과장표현 검토 | 가능: 반출 스캔, 표현 리스크 플래그 · 금지: 자체 승인(승인은 RM/준법 최종 승인자만) | 신용정보법 §40조의2, PIPA §37조의2 | 승인 대기열(케이스 비종속) |
| **계약 체크리스트 에이전트**(Contract Checklist Agent) | 은행 중심, 준법·여신심사 | 전세보호팩 | `assignment`(계약 전 단계) | `pre-contract-checklist`/`special-clause-drafter`/`compliance-guard` → 서류·특약 완결성 | 가능: 체크리스트·특약 문구 초안 · 금지: 특약 확정 체결, 법률자문 단정 | 서류 누락은 재요청으로 복구 가능한 운영 리스크로 분류(준법 검토와의 병합 스트레스 테스트에서 가장 얇은 고리 — `08_본선/03_제품/00_결정-준비/설계/왜-14개-에이전트-정당화.md` §3-3) | `seoul-jeonse-villa` |

### 고객·은행 연계

| 에이전트 | 소속 | 도메인팩 | Trigger | 판단 경계 | 행동(가능/금지) | 검증 경계 | Owner 케이스 |
|---|---|---|---|---|---|---|---|
| **RM 보좌 에이전트**(RM Copilot Agent) | 은행 중심, RM | 소상공인 여신팩+전세보호팩 공통 인터페이스 | `on_demand`(RM 요청) / `automation`(승인 후 발송 대기) | `notification-brief`/`tone-control` → 메모·콜백 스크립트 초안 | 가능: 초안 작성 · 금지: 자동 발송(승인 필수) | "AI는 보조수단" 원칙, RM 최종 승인자 서명 필수 | JBG-104 콜백 초안 |
| **은행 연계 에이전트**(Bank Linkage Agent) | 은행+캐피탈, RM·사후관리 | 전세보호팩(현재), 확장 시 사후관리/EWS팩 | `on_demand`(리드/보좌 handoff) | `bank-linkage-brief`/`guarantee-feasibility`/`notification-brief` → 계열사 시스템 연동 초안 | 가능: action packet 초안 · 금지: 계열사 경계 침범(타 회사 데이터 접근), 접속기록 누락 | 전자금융거래법 §22, 신용정보업감독규정 접속기록 보존 | 전세대출 상담 연결(`seoul-jeonse-villa`) |

---

## 4. 사람 승인자 / 게이트

| 역할 | 표시명 | 설명 |
|-----|-------|------|
| Human RM Lead | RM 최종 승인자 | L1~L3 승인(L3는 준법 최종 승인자와 공동) |
| Human Compliance Lead | 준법 최종 승인자 | L3~L4 승인, L3 공동 승인 |
| Approval Gate | 승인 게이트 | 고객 행동 사전 차단 게이트, 자체 승인 불가(우회 시 hard fail) |

> **승인 레벨 정정(app.js `approvalLevelMatrix` 기준, 2026-07-03 확인)**: L3(score 80-89)의 고객 안내 승인자는 "RM+준법 승인" 공동 결재다. 일부 설계 문서(`skills-스킬·플러그인·...md`)가 "준법 최종 승인자" 단독으로 잘못 적은 사실오류가 있었으므로, `_canon §8`(운영계약) 및 app.js 실제 구현을 기준으로 정정한다.

| 레벨 | score | customerNotice | contract | fraud |
|---|---|---|---|---|
| L0 | 0-39 | 내부 기록만 | 내부 기록만 | 모니터링 |
| L1 | 40-59 | RM 검토 후 승인 | RM 확인 | 보안 확인 |
| L2 | 60-79 | RM 편집 후 발송 | 체크리스트 확인 | 고객 접촉 보류 |
| L3 | 80-89 | **RM+준법 승인**(공동) | 법률/보증 원문 확인 | 보안팀 승인 |
| L4 | 90-100 | 승인 전 발송 보류 | 사람 결정 전 차단 | 차단 검토 요청 |

---

## 5. activityLog / eval 최소 장치 (paperclip 가시성 모델)

paperclip의 `activityLog` + `heartbeatRunEvents`를 우리 이벤트 타입으로 매핑한다(상세 실행 파이프라인은 [[08_본선/03_제품/02_agent-design/orchestrator|오케스트레이터]] §3).

| 이벤트 | 의미 |
|---|---|
| `case.created` | 위험 신호가 Case로 승격 |
| `agent.wakeup.requested` | 에이전트 실행 요청(trigger 발생) |
| `agent.run.started` / `.succeeded` / `.failed` | AgentRun 생명주기 |
| `evidence.attached` | 근거 문서/스냅샷 연결 |
| `risk.decision.computed` | `computeRiskDecision` 결과 생성 |
| `approval.requested` / `.approved` / `.rejected` | 승인 게이트 통과/반려 |
| `audit.sealed` | Audit 해시체인에 기록(`auditChainRecords`) |

최소 eval 장치(요건 요약, 스킬별 세부 eval 기준은 [[08_본선/03_제품/02_agent-design/skill-spec|스킬 명세]] §5 참조): 승인 안전(고객 대상 action 전 `approval.requested` 100%), 근거 연결(Evidence id 100%), 계열사/케이스 경계(hard fail 없음), PII 반출(hard fail 없음), 규칙 준수(L0~L4 policy id 기록). 출처: `08_본선/03_제품/00_결정-준비/설계/agents-v2-paperclip기반-재설계.md` §5.

---

## 참조

- [[08_본선/03_제품/02_agent-design/orchestrator|오케스트레이터]]
- [[08_본선/03_제품/02_agent-design/skill-spec|스킬 명세]]
- [[08_본선/03_제품/05_diagrams/01_agent-flow|에이전트 흐름 다이어그램]]
- [[08_본선/03_제품/00_결정-준비/설계/agents-v2-paperclip기반-재설계]]
- [[08_본선/03_제품/00_결정-준비/설계/왜-14개-에이전트-정당화]]
- [[08_본선/03_제품/00_결정-준비/설계/승보-프로토타입-반영]]
