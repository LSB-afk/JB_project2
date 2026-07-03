---
tags: [area/product, type/analysis, status/active]
date: 2026-07-03
up: "[[_결정준비-MOC]]"
---

# paperclip 에이전트 조직 모델 기반 JB LocalGuard OS 로스터 재설계

## PART 1 — paperclip 에이전트 조직 모델 요약

### 1. 조직 구조

paperclip은 단순 에이전트 목록이 아니라 **AI-agent company control plane**이다. 핵심 단위는 `company`이고, 모든 주요 객체는 company boundary 안에 묶인다.

구조는 다음 계층으로 읽힌다.

| 층 | paperclip 개념 | 의미 |
|---|---|---|
| 조직 | `company` | 에이전트 조직의 경계. API, 권한, 데이터, 로그가 company-scoped |
| 구성원 | `agents` | 역할·상태·adapter config·runtime config를 가진 실행 주체 |
| 업무 | `issues` / tasks | 에이전트가 맡는 단일 작업 단위. single-assignee 모델 |
| 실행 | `heartbeat_runs` / `agent runs` | 에이전트가 깨어나 작업한 개별 실행 기록 |
| 역량 | `companySkills` / `SKILL.md` | 회사 단위로 설치·버전관리되는 에이전트 역량 |
| 산출물 | `issueWorkProducts` / artifacts | 에이전트가 만든 증거·파일·결과물 |
| 통제 | `approvals` | governed action, hire, budget override 등을 승인하는 게이트 |
| 감사 | `activityLog` + `heartbeatRunEvents` | 변경·실행·상태·도구 호출의 추적 기록 |

따라서 paperclip식 조직은 “에이전트  N명”보다 **회사 → 역할/보고선 → 업무 → 실행 → 증거 → 승인 → 감사**의 운영 계약이 핵심이다.

### 2. 에이전트 생성 / hiring 메커니즘

2026-02-19 CEO Agent Creation and Hiring Governance Plan 기준으로, paperclip은 CEO 에이전트가 신규 에이전트를 만들 수 있게 하되, 기본값은 사람/board 승인이다.

핵심 메커니즘:

| 항목 | 설계 |
|---|---|
| company 설정 | `requireBoardApprovalForNewAgents: true` 기본값 |
| agent 권한 | `can_create_agents` 권한. CEO는 기본 ON, 나머지는 기본 OFF |
| 생성 API | `POST /api/companies/:companyId/agent-hires` |
| 승인 전 상태 | 신규 agent row를 먼저 만들고 `status=pending_approval` |
| 승인 기록 | `approvals(type=hire_agent,status=pending,payload.agentId=...)` |
| 승인 후 | linked agent가 `pending_approval -> idle` |
| 반려 후 | 계획상 `terminated` 또는 비활성 상태 유지 권고 |
| 검토 협업 | approval detail, comments, revision request, resubmit 흐름 |

중요한 점은 “CEO가 마음대로 복제”가 아니라 **limbo agent + 승인 + audit** 구조라는 것이다. 이 모델은 우리에게 “도메인팩 추가 시 신규 에이전트는 곧바로 활성화하지 않고, 승인 전에는 조직도에만 보이는 후보 상태로 둔다”는 설계 근거가 된다.

### 3. 운영 모델

agent-runs 및 agents-runtime 스펙 기준으로 paperclip 에이전트는 상시 실행 프로세스가 아니라 **heartbeat 단위로 깨어나는 실행체**다.

실행 흐름:

1. `timer`, `assignment`, `on_demand`, `automation` 중 하나가 wakeup을 만든다.
2. Wakeup Coordinator가 `agent_wakeup_requests`에 큐잉한다.
3. Run Executor가 요청을 claim하고 `heartbeat_runs`를 만든다.
4. adapter가 실행된다. 예: `claude_local`, `codex_local`, `process`, `http`.
5. 실행 중 status/log/usage/event hook이 기록된다.
6. 결과, session id, token usage, error, stdout/stderr excerpt, full log ref가 저장된다.
7. agent는 `idle`, `error`, `paused` 등 상태로 돌아간다.

운영 상태 저장은 세 겹이다.

| 저장 | 역할 |
|---|---|
| `agent_runtime_state` | agent별 누적 session, token, cost, last error |
| `agent_task_sessions` | taskKey별 resumable session |
| `heartbeat_runs` | 개별 실행 결과 |
| `heartbeat_run_events` | 실행 중 경량 이벤트 타임라인 |
| RunLogStore | full stdout/stderr log. DB가 아니라 local/object store/postgres 중 선택 |

우리에게 중요한 포인트는 “에이전트가 계속 생각한다”가 아니라 **케이스 이벤트가 오면 짧게 실행하고, 상태·근거·비용·오류를 남긴다**는 점이다.

### 4. 에이전트 활동 가시성

paperclip은 조직도만 보여주는 것이 아니라, 각 에이전트의 거의 모든 활동을 볼 수 있게 설계한다.

가시성 요소:

| 가시성 단위 | paperclip 설계 |
|---|---|
| 조직도 | agent list/tree, reporting line, status badge |
| 실행 상태 | queued/running/succeeded/failed/timed_out/cancelled |
| heartbeat | agent가 언제, 왜, 어떤 source로 깨어났는지 |
| activity log | mutation action, actor, entity, agent/run ref, details |
| run events | lifecycle/status/usage/error/structured event timeline |
| full log | stdout/stderr full stream은 RunLogStore에서 조회 |
| live update | company websocket으로 agent/status/task/activity 변경 push |
| 에러 진단 | stderr/stdout excerpt, full CLI error, error_code |
| 비용/사용량 | token usage, cost telemetry, budget block 기록 |

즉 paperclip식 UI의 본질은 **“조직도 + 각 구성원의 heartbeat transcript + 감사 로그”**다. 단순 카드가 아니라, “누가 왜 깨어났고, 무엇을 읽고, 어떤 근거로 무엇을 시도했으며, 어디서 승인 대기 중인지”를 시간순으로 보여준다.

### 5. evals 프레임워크

2026-03-13 Agent Evals Framework Plan은 agent 성능 평가의 단위를 “모델 단독”이 아니라 **bundle**로 잡는다.

`EvalBundle` 구성:

- adapter type
- model id
- prompt template
- bootstrap prompt
- skill allowlist / skill content version
- runtime flags

평가 레이어는 네 단계다.

| 레이어 | 목적 | 예시 |
|---|---|---|
| Layer 1 deterministic contract evals | judge 없이 hard fail | wrong company 접근, 승인 우회, 산출물 누락 |
| Layer 2 single-step behavior evals | 좁은 행동 평가 | 올바른 issue 선택, status comment 작성, 승인 요청 판단 |
| Layer 3 end-to-end scenario evals | heartbeat 시나리오 전체 | assignment pickup, approval-gated hire, long-thread continuation |
| Layer 4 efficiency/regression evals | 품질 유지 + 비용/속도 개선 | tokens per successful heartbeat, cost, wall-clock, session reuse |

스코어링 원칙:

1. hard check가 먼저다.
2. rubric은 좁은 0-1 또는 0-2 기준으로 둔다.
3. baseline vs candidate pairwise judging을 쓴다.
4. 품질, 비용, 지연은 분리해서 본다.
5. 실제 run trace를 eval case로 승격해 suite를 키운다.

우리에게는 “에이전트를 신뢰한다”는 말을 **approval bypass 없음, evidence 연결, faithfulness, 재작업률, override 비율**로 보이게 만드는 근거가 된다.

### 6. company / skill 구조

AGENTCOMPANIES_SPEC_INVENTORY 기준으로 paperclip은 회사를 파일 패키지로 내보내고 들여올 수 있는 **markdown-first portability model**을 갖는다.

핵심 파일 구조:

| 파일 | 의미 |
|---|---|
| `COMPANY.md` | 회사 정의 |
| `TEAM.md` | 팀/조직 구조 |
| `AGENTS.md` | 에이전트 정의와 지시문 |
| `PROJECT.md` | 프로젝트 |
| `TASK.md` | 작업 / recurring task |
| `SKILL.md` | skill package |
| `.paperclip.yaml` | vendor sidecar / 확장 메타데이터 |
| `manifest.json` | package manifest |

이 구조의 의미는 크다. 에이전트 조직은 DB row만이 아니라 **이식 가능한 회사 패키지**다. 우리도 이를 그대로 구현할 필요는 없지만, `도메인팩 = AGENTS + SKILL + TASK template + eval cases + approval policy` 묶음으로 정의하는 설계가 자연스럽다.

## PART 2 — 우리 로스터 재설계안

## 1. “14개가 맞는가” 재판정

결론부터 말하면, **운영 AI 에이전트 14개는 유지**한다. 다만 현재 문서처럼 “14명 평면 나열”로 설명하면 약하고, paperclip식으로 **company-scoped 조직 + 직군별 dashboard + domain pack specialists**로 다시 구조화해야 한다.

### 왜 5개로 줄이면 안 되는가

키스톤 문서의 직군 축은 맞다. 실제 콘솔의 1차 축은 `계열사 × 담당 직군`이어야 한다.

- 계열사: 전북은행, 광주은행, JB우리캐피탈, JB자산운용, JB인베스트먼트
- 본선 MVP 중심: 전북은행 + JB우리캐피탈
- 직군: RM, 여신심사, 사후관리, 준법, AML

하지만 이 5개는 **메뉴/조직 축**이지 실행 에이전트 단위로는 너무 굵다. D9가 말한 것처럼 멀티에이전트는 coordination overhead가 있으므로 남발하면 안 되지만, 금융 케이스는 도구·근거·규칙이 도메인별로 다르다.

예를 들어 전세 케이스에서 `전세가율`, `등기 권리`, `임차인 손실위험`은 입력 데이터와 검증 기준이 다르다. 이를 하나의 “여신심사 에이전트”에 넣으면 설명성과 eval 설계가 약해진다. 반대로 20개 이상으로 늘리면 본선 MVP 범위에서 활동 로그, eval, UI 구현 부담이 커진다.

### 왜 14개에서 더 늘리지 않는가

paperclip의 교훈은 “많은 에이전트”가 아니라 **필요할 때 hiring하고, pending approval로 검토하며, company/skill package로 확장**하는 것이다. 본선 핵심은 이미 `_canon.md §2`에 고정된 14개 로스터와 일치한다. `_canon.md`가 SSOT이므로 명칭과 수량은 이를 따른다.

추가 도메인은 core roster를 늘리는 방식이 아니라 `도메인팩`으로 붙이는 것이 맞다.

- 기본 로스터: 운영 AI 에이전트 14개
- 사람 승인자: 2명
- 승인 게이트: 1개
- 확장 단위: domain pack당 Lead 1 + Specialist 2~3 + 기존 준법/승인/감사 재사용

### 재판정: 14유지

**재판정: 14유지.**

이유:

1. `_canon.md §2`가 운영 에이전트 14종을 SSOT으로 고정한다.
2. 키스톤의 5개 직군은 사이드바/권한/대시보드 축이고, 실제 판단 단위로는 부족하다.
3. D9 기준으로 멀티에이전트는 전문화가 있을 때 정당화되며, 우리 14개는 여신·전세·피싱·사후관리·준법의 서로 다른 데이터/도구/검증 경계를 반영한다.
4. 20개 이상 확장은 본선 MVP에서 coordination overhead와 eval 부담이 커진다.
5. paperclip 모델상 증원은 core roster 증식이 아니라 승인된 hiring/domain pack으로 처리하는 편이 맞다.

## 2. 직군 × 도메인 매핑안

### 조직 축

| 계열사 | 직군 | 담당 도메인 |
|---|---|---|
| 전북은행 | RM | 소상공인 여신, 정책금융, 고객 안내, 전세 케이스 접점 |
| 전북은행 | 여신심사 | 상환위험, 전세가율, 등기 권리, 임차인 손실위험 |
| 전북은행 | 사후관리 | 위험신호 조기감지, 포트폴리오 모니터링 |
| 전북은행 | 준법 | 신용정보/개인정보/계약/설명가능성 검토 |
| 전북은행 | AML | 보이스피싱, 이상거래 탐지·차단 |
| JB우리캐피탈 | 여신심사 | 오토/비오토/기업/부동산 여신 [추정: 세부 상품 라인은 입력 문서의 D3d 언급 기반] |
| JB우리캐피탈 | 사후관리 | EWS, 자금용도 점검, 부실징후 조기경보 |
| JB우리캐피탈 | 준법/AML | 이상거래, 내부통제, 접속·거래기록 보존 |
| 광주은행 | RM/여신/사후관리 | 전북은행 패턴 확장 후보 [추정] |
| JB자산운용/JB인베스트먼트 | 준법/리스크 | 향후 domain pack 후보 [추정] |

### 14개 에이전트 재구조화

| 에이전트 | 소속 직군 | 담당 계열사 | 담당 도메인 | paperclip식 역할 |
|---|---|---|---|---|
| 운영 조율 에이전트 | 공통 | 전체 | Case routing, AgentRun 조율 | CEO/Orchestrator |
| 포트폴리오 분석 에이전트 | 사후관리 | 은행+캐피탈 | 포트폴리오 위험, KPI | Analytics specialist |
| 위험신호 조기감지 에이전트 | RM·사후관리 | 은행+캐피탈 | 매출 둔화, 연체 전조, EWS | Signal specialist |
| 상환위험 분류 에이전트 | 여신심사 | 은행+캐피탈 | 현금흐름, 상환위험, reason code | Credit triage specialist |
| 정책금융 매칭 에이전트 | RM | 전북은행 중심 | 정책자금, 보증, 대환 | Product/eligibility specialist |
| 전세위험 관리 리드 | RM·여신심사 | 전북은행 | 전세 케이스 총괄 | Domain lead |
| 전세가율 분석 에이전트 | 여신심사 | 전북은행 | 시세·공시·실거래 비교 | Data specialist |
| 등기 권리 분석 에이전트 | 여신심사·준법 | 전북은행 | 등기, 선순위권리, 권리하자 | Legal-data specialist |
| 임차인 손실위험 에이전트 | 여신심사 | 전북은행 | 보증금 손실, 보증 가능성 | Loss-risk specialist |
| 이상거래 탐지·차단 에이전트 | AML·사후관리 | 은행+캐피탈 | 보이스피싱, FDS, AML | Fraud specialist |
| 준법 검토 에이전트 | 준법 | 전체 | PII, 신정법/PIPA, 내부통제 | Governance specialist |
| 계약 체크리스트 에이전트 | 준법·여신심사 | 은행 중심 | 전세/여신 계약, 누락서류 | Checklist specialist |
| RM 보좌 에이전트 | RM | 은행 중심 | 고객 메모, 콜가이드, next action | Frontline copilot |
| 은행 연계 에이전트 | RM·사후관리 | 은행+캐피탈 | 내부 API/action packet 초안 | Tool/action handoff specialist |

주의: `전세`는 키스톤 기준 은행 전용 도메인이다. JB우리캐피탈에 전세 라인을 그대로 미러링하지 않는다. 캐피탈 확장은 `여신 + 사후관리/EWS + 이상거래/준법` 중심이 더 정합적이다.

## 3. 활동 가시성 UI 설계안

우리 MVP `02_제품/app`에는 paperclip의 전체 서버/WebSocket 구조를 그대로 넣지 않는다. 대신 정적 MVP 범위에서는 **조직도 + 활동 피드 + 실행 타임라인**을 local state로 재현한다.

### 화면 구조

| UI 영역 | 설계 |
|---|---|
| 좌측 사이드바 | `계열사 × 직군` 선택. 예: 전북은행/RM, 전북은행/AML, JB우리캐피탈/사후관리 |
| 중앙 상단 | 선택 직군의 agent roster. 상태 badge: idle/running/paused/approval_pending/error |
| 중앙 메인 | Case board. `Case → AgentRun → Evidence → Approval → Audit` 흐름 표시 |
| 우측 패널 | 선택 agent 또는 case의 run timeline |
| 하단/탭 | Activity feed: heartbeat, evidence attached, approval requested, human approved, audit sealed |

### Agent detail에 보여줄 항목

| 항목 | 표시 예 |
|---|---|
| 상태 | `idle`, `running`, `approval_pending`, `blocked`, `error` |
| wakeup source | `assignment`, `on_demand`, `timer`, `automation` |
| 현재 케이스 | `JBG-104`, 전세 케이스, 피싱 케이스 |
| 장착 skill | `risk banding`, `registry parse`, `fraud triage` |
| 최근 heartbeat | 시작/종료시각, 결과, 요약 |
| 근거 연결 | Evidence count, citation coverage |
| 승인 대기 | L1/L2/L3/L4, 승인자 |
| eval badge | hard checks pass, faithfulness, override rate [추정: MVP에서는 샘플 값/시뮬레이션] |

### Activity feed 이벤트 타입

paperclip의 `activityLog`와 `heartbeatRunEvents`를 우리 용어로 바꾼다.

| 이벤트 | 의미 |
|---|---|
| `case.created` | 위험 신호가 Case로 승격 |
| `agent.wakeup.requested` | 에이전트 실행 요청 |
| `agent.run.started` | AgentRun 시작 |
| `agent.status.updated` | 진행상황 메시지 |
| `evidence.attached` | 근거 문서/스냅샷 연결 |
| `risk.decision.computed` | `computeRiskDecision` 결과 생성 |
| `approval.requested` | 고객 대상 행동 전 승인 대기 |
| `approval.approved/rejected` | 사람 승인/반려 |
| `audit.sealed` | Audit chain에 기록 |

## 4. 에이전트 생성·확장 모델

paperclip의 hiring 모델을 우리 식으로 바꾸면, 확장은 개별 에이전트를 손으로 추가하는 방식이 아니라 **도메인팩**으로 한다.

### 도메인팩 정의

`Domain Pack = AGENTS + SKILLS + CASE templates + EVALS + APPROVAL policy + DATA connectors`

| 구성 | 내용 |
|---|---|
| `AGENTS` | Lead 1 + Specialist 2~3 |
| `SKILLS` | RAG query, rule check, document parse, action packet |
| `CASE templates` | 대표 케이스 유형, 입력 필드, 상태 전이 |
| `EVALS` | hard checks, scenario cases, faithfulness 기준 |
| `APPROVAL policy` | L0~L4, RM/준법 승인 라우팅 |
| `DATA connectors` | 내부/외부 데이터 후보. 미확정은 `(담당자 확인)` 표기 |

### 기본 도메인팩

| 도메인팩 | 구성 | 상태 |
|---|---|---|
| 소상공인 여신팩 | 상환위험 분류, 정책금융 매칭, RM 보좌, 준법 검토 | 본선 core |
| 전세보호팩 | 전세위험 관리 리드, 전세가율, 등기 권리, 임차인 손실위험, 계약 체크리스트 | 전북은행 전용 |
| 피싱/AML팩 | 이상거래 탐지·차단, 준법 검토, 은행 연계 | 본선 demo 후보 |
| 사후관리/EWS팩 | 위험신호 조기감지, 포트폴리오 분석, 은행 연계, 준법 검토 | 캐피탈 확장 core |

### 신규 도메인팩 hiring 절차

1. 운영 조율 에이전트가 신규 domain pack 필요를 제안한다.
2. 초안 상태의 신규 agent/skill/card가 생성된다.
3. 상태는 `pending_approval`로 둔다.
4. RM 또는 준법 최종 승인자가 검토한다.
5. 승인 전에는 고객 대상 action, API handoff, 자동 실행을 금지한다.
6. 승인되면 해당 계열사/직군 dashboard에 활성화한다.
7. eval smoke suite를 통과해야 “운영 가능” badge를 준다.

이 구조가 paperclip의 CEO hiring + approval model과 가장 잘 맞는다.

## 5. 신뢰도 evals 설계안

심사위원에게 필요한 메시지는 “AI가 똑똑하다”가 아니라 **“에이전트 행동을 제한하고, 검증하고, 되돌아볼 수 있다”**다.

### 최소 eval 장치

| 평가축 | 최소 장치 | 통과 기준 |
|---|---|---|
| 승인 안전 | 고객 대상 action 전 `approval.requested` 필수 | Approval safety 100% |
| 근거 연결 | 모든 판단에 Evidence id 연결 | Evidence traceability 100% |
| 회사 경계 | 다른 계열사/케이스 데이터 접근 차단 | hard fail 없음 |
| PII 반출 | 원본 PII 외부 LLM 전달 금지, 토큰화/마스킹 로그 | hard fail 없음 |
| RAG faithfulness | 주장별 근거 링크 또는 내부 이벤트 연결 | 미근거 주장 flagged |
| 규칙 준수 | L0~L4 policy id 기록 | 고위험 action은 L3/L4 |
| 생산성 | 최종 승인까지 리드타임, 재작업률 | D8식 속도+품질 동시 측정 |
| 운영 품질 | override 비율, 반려 사유, blocked reporting | rubber-stamping 징후 탐지 |

### EvalCase 예시

| 케이스 | hard check | rubric |
|---|---|---|
| `sme.jbg104.cashflow_triage` | 상환위험 판단에 Evidence 연결, 고객 안내 자동발송 금지 | reason code 적절성, RM 메모 유용성 |
| `jeonse.registry_rights` | 등기 근거 없이 위험판정 금지 | 권리관계 설명 명확성 |
| `phishing.partial_block` | L4 action은 준법 승인 전 실행 금지 | false block 리스크 설명 |
| `capital.ews.aftercare` | 사후관리 신호와 조치 초안 분리 | 후속 확인 항목 구체성 |
| `governance.company_boundary` | 타 계열사 데이터 접근 시 fail | 없음. deterministic only |
| `governance.pii_export_scan` | 원본 PII 외부 prompt 포함 시 fail | 없음. deterministic only |

### EvalBundle 단위

우리도 paperclip처럼 모델만 비교하지 말고 bundle 단위로 비교해야 한다.

`JB EvalBundle = agent + model route + prompt version + skill version + rule policy version + data connector version`

예:

- `cashflow-triage/local-pii-safe/v1`
- `jeonse-shield/rag-citation/v1`
- `fraud-shield/approval-gated/v1`

이렇게 해야 “모델이 좋아졌다”가 아니라 “이 에이전트 구성의 운영 신뢰도가 유지된다”를 보여줄 수 있다.

## 최종 결론 — 재판정

## 재판정: 14유지

운영 AI 에이전트는 **14개 유지**가 맞다. 단, 설명 방식은 바꿔야 한다.

- 기존: 14개 전문가를 평면 나열
- 변경: `company × role` 콘솔 위에 `domain pack`으로 장착되는 paperclip식 agent company 구조
- core roster: `_canon.md §2`의 14개
- 사람 승인자: RM 최종 승인자, 준법 최종 승인자
- 게이트: 승인 게이트
- 확장: 신규 도메인팩은 `pending_approval` hiring + eval 통과 후 활성화

한 줄로 정리하면, **5개 직군은 콘솔의 조직 축이고, 14개 에이전트는 실제 판단·근거·승인·감사를 수행하는 실행 로스터**다. paperclip 모델을 본보기로 삼으면 14개를 더 늘리기보다, 14개를 회사/직군/도메인팩 아래에 재배치하고 모든 활동을 heartbeat·activity·eval로 보이게 만드는 것이 가장 방어 가능하다.