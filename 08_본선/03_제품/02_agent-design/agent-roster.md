---
tags:
  - area/product
  - type/reference
  - status/active
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases: [에이전트 로스터, per-console 에이전트 레지스트리]
---

# 에이전트 로스터

> **SSOT 갱신 노트(2026-07-04)**: 이전 버전(07-03)은 예선 `02_제품/app/app.js`의 단일 메인 콘솔 "14 에이전트"를 정본으로 삼았다. 그 사이 팀은 **역할축 4콘솔**(계열사×역할) 실 프로토타입(`_vendor/JB_project2/`)으로 전환했고, 히어로도 예선 `JBG-104`에서 본선 **`CCL-0001`**(전주 카페 운전자금, corporate-credit 콘솔)로 이동했다(`e57b826` 전세보호 하네스 v3 기준). 이 문서는 **per-console 에이전트 레지스트리를 코드 SSOT로 삼아** 재정렬한다.
>
> **이원성 [미결/데모전 정합]**: `_canon.md §2`의 14종 **표시명**은 발표·문서용 요약 SSOT로 계속 쓰되, 실제 실행되는 코드는 **콘솔 4개(기업여신 8 + FDS/피싱 8 + 전세보호 11 + JB우리캐피탈 13 = 40 에이전트)**로 완전히 분리돼 있다. 두 세트는 이름·도메인이 겹치지 않는 **독립 레지스트리**다. 발표에서 "14개 에이전트"라고만 말하면 콘솔별 실제 개수와 충돌하므로, **"발표 요약 14 + 콘솔별 실제 로스터 8/8/11/13"**으로 구분해 말한다. 두 레이어의 통합 여부는 [미결/7-4].
>
> 근거: `_vendor/JB_project2/app/cclConsole.core.js`·`fdrConsole.core.js`·`jeonseProtectionAgents.registry.js`·`jbWooriCapitalAgents.registry.js`·`harnessRegistry.js`(각 콘솔 `requiredAgents` 검증값), [[08_본선/03_제품/docs/05_domain-model|05_domain-model]], [[08_본선/03_제품/01_결정-준비/설계/paperclip-통합-블루프린트|paperclip-통합-블루프린트]], [[08_본선/03_제품/00_vision/차별성-설정근거상향-흐름|차별성-설정근거상향-흐름]].

---

## 0. 레이어 구분 (필독 — 숫자 혼선 방지)

**"콘솔"이 조직 단위다.** paperclip 개념의 `company`에 대응하는 것이 이제 앱 전체가 아니라 **역할 하네스 1개**다. 계열사 선택 → 역할 선택 → 역할 전용 하네스(콘솔) → 도메인 케이스 보드 순으로 진입하며(`harnessRegistry.js` manifest), 각 콘솔은 자기 스코프(`roleKey`/`affiliateId`)를 벗어난 데이터에 접근할 수 없다.

| 콘솔 | 계열사 | 역할 | 에이전트 수(코드 확정) | 히어로/대표 케이스 | 근거 |
|---|---|---|---|---|---|
| **기업여신(CCL)** | 전북은행 | 여신심사 | **8**(표면 5 + 감독·내부 3) | **CCL-0001**(히어로, 전주 카페 운전자금) | `cclConsole.core.js`, `harnessRegistry.js requiredAgents:8` |
| **FDS/피싱(FDR)** | 전북은행(+캐피탈 연계) | AML/사기대응 | **8** | `FDSC-0001`(보조 데모) | `fdrConsole.core.js`, `requiredAgents:8` |
| **전세보호(JPO)** | 전북은행 전용 | 여신심사·상담 | **11**(v3: 생성 10 + 검증전담 `jpo-evaluator` 1) | `JEONSE-0001`(보조 데모) | `jeonseProtectionAgents.registry.js`, `requiredAgents:11` |
| **JB우리캐피탈(JBWC)** | JB우리캐피탈 | 다도메인(개인/자동차/담보/기업금융 등) | **13** | `CASE-JBWC-0001`형 | `jbWooriCapitalAgents.registry.js`, `requiredAgents:13` |

> **[미검증] 전세보호 개수 표기 차이**: 팀 지시 스냅샷은 "전세10"으로 언급했으나, v3(`e57b826`) 코드는 `jpo-evaluator`(루프 검증 에이전트, "생성과 검증은 같은 함수가 수행하지 않는다")를 추가해 **실제 11개**다. 발표·문서에서는 코드 기준 11을 정본으로 쓰되, v2 스냅샷(10)과의 차이는 "v3 검증 전담 에이전트 신설"로 설명한다.
>
> `전세`는 전북은행 전용 케이스 유형이며 JB우리캐피탈에 미러링하지 않는다(캐피탈 사업영역 밖, `[[08_본선/03_제품/docs/07_architecture|07_architecture]]` §12). CaseOps 확장(메모리거버넌스·119·CaseOps엔진)은 **팀 미확정**이며 이 4콘솔 로스터와는 별개 트랙이다 [분기/미확정].

---

## 1. paperclip 개념 ↔ 우리 운영계약 매핑 (콘솔 단위로 재확인)

| paperclip 개념 | 우리 개념(콘솔 단위) | 비고 |
|---|---|---|
| `company` | **역할 하네스(콘솔)** — `harnessRegistry.js`의 manifest 1개 | scope-key(`roleKey`/`affiliateId`) 격리, `harnessGuardCheckAutoClose`/`harnessGuardCheckPII` 공통 가드 |
| `agents` | 콘솔별 에이전트 배열(`cclConsoleAgents` 등) + 사람 승인자(담당자·감독/준법) | `allowedActions`/`blockedActions`/`dbReads`/`dbWrites` 화이트리스트 보유 |
| `issues` / task | `Case`(`ccl_cases`/`fdr_cases`/`jeonse_cases`/`ops_cases`) | 콘솔별 테이블 분리, single-assignee + handoff |
| `heartbeat_runs` | `AgentRun`(`recordCorporateCreditAgentRun` 등) | wakeup(코드상 즉시 실행) → 실행 → 상태 복귀 |
| `companySkills` / `SKILL.md` | 콘솔별 skill 배열(§3 참조, 25종 아님 — 콘솔별 6~10종) | 콘솔 단위 장착, 아직 런타임 registry가 아니라 정적 배열 |
| `issueWorkProducts` / artifact | `ccl_review_notes`/`jeonse_risk_signals` 등 Evidence 테이블 | 근거 문서·상태 스냅샷 |
| `approvals` | `approvals` 테이블(콘솔 공용) | 결정자는 항상 `USR-*`(사람) |
| `activityLog` + `heartbeatRunEvents` | `*_audit_logs` + `harnessCore.js`의 `hookLog` | `reviewRequired` 플래그로 감사 뷰 집계 |

paperclip의 hiring 모델(`requireBoardApprovalForNewAgents`, `pending_approval → idle`)은 **신규 콘솔/도메인팩 추가**에 대응한다. 설정 레이어(스킬·외부 API·MCP·내부 DB를 담당자가 on/off)는 [[08_본선/03_제품/00_vision/차별성-설정근거상향-흐름|차별성-설정근거상향-흐름]]의 핵심 메커니즘이지만 **아직 코드로 구현되지 않았다** — `harnessRegistry.js` manifest에 `settings` 필드를 추가하는 것부터가 [[08_본선/03_제품/01_결정-준비/설계/paperclip-통합-블루프린트|paperclip-통합-블루프린트]] §6의 실행 태스크 1번(미착수, 문서 확정 후 착수)이다.

---

## 2. 콘솔별 에이전트 로스터 (코드 SSOT)

### 2.1 기업여신(CCL) — 전북은행, 8종 — **히어로 콘솔**

`cclConsole.core.js:111-159`. 표면 5(고객/케이스 접점) + 내부·감독 3.

| id | 표시명 | domain | 판단 경계 | 행동(허용) | 검증/금지 | Owner 케이스 |
|---|---|---|---|---|---|---|
| `ccl-intake` | 여신 접수 분류 에이전트 | orchestration | 상품·금액대·서류상태 기준 분류 | 분류·라우팅·감사기록 | 자동 종결 금지 | CCL-0001 접수 |
| `ccl-financial` | 재무자료 요약 에이전트 | financialSummary | 재무 요약 지표(구간값) | 요약·이상 항목 표시 | 재무 건전성 확정 평가 금지 | **CCL-0001**(riskScore/재무 슬라이스, PR#1 실 LLM 대상) |
| `ccl-repayment` | 상환능력 체크 에이전트 | repaymentCheck | 상환 부담 **구간** | 체크리스트 | 상환 가능/불가 확정 금지 | CCL-0001 |
| `ccl-doc` | 서류 체크리스트 에이전트 | docCheck | 서류 구비/누락 | 체크리스트·보완 초안 | — | CCL-0001 |
| `ccl-memo` | 승인 품의 초안 에이전트 | approvalDrafts | 품의 근거 정리 | 초안·승인 요청 등록 | 자체 결재 금지 | CCL-0001 |
| `ccl-policy` | 정책금융 후보 에이전트 | policyMatch | 정책자금 후보 나열 | 후보 정리 | 지원 가능 확정 금지 | CCL-0001 정책 후보 |
| `ccl-reply` | 고객 회신 초안 에이전트 | replyDrafts | 상담 요약 | 초안 작성 | 자동 발송 금지 | CCL-0001 회신 |
| `ccl-supervisor` | 여신 감독 검토 에이전트 | governance | 고위험/승인 큐 추적 | 검토 대기 등록 | 자체 승인 금지 | 승인 큐(케이스 비종속) |

공통 금지(`CCL_COMMON_BLOCKED_ACTIONS`): 대출 승인/거절 확정·금리/한도 산정·신용등급 확정·실거래 실행·식별정보 원문 저장/출력·고객 자동 발송·high/critical 자동 종결. 상세: [[08_본선/03_제품/docs/05_domain-model|05_domain-model §1]].

### 2.2 FDS/피싱(FDR) — 8종

`fdrConsole.core.js:125-163`.

| id | 표시명 | domain | Owner 역할 |
|---|---|---|---|
| `fdr-intake` | 경보 접수 분류 에이전트 | orchestration | 분류·라우팅 |
| `fdr-signal` | 이상거래 신호 요약 에이전트 | anomalySignals | 신호 요약 |
| `fdr-elder` | 고령 고객 보호 에이전트 | elderGuard | 고령·취약 우선 보호 |
| `fdr-pattern` | 거래 패턴 요약 에이전트 | patternSummary | 거래 패턴 요약 |
| `fdr-contact` | 고객 확인 스크립트 에이전트 | contactScripts | 송금 전 확인 스크립트(승인 대기) |
| `fdr-block` | 차단·보류 검토 에이전트 | blockReview | 차단/보류 권고 |
| `fdr-report` | 외부 신고 안내 에이전트 | paymentHoldGuide | 지급정지·신고 절차 안내 후보 |
| `fdr-supervisor` | FDS 감독 검토 에이전트 | governance | 승인 큐·감사 추적 |

> FDS만 **예외적으로 실시간 선차단**(사람 승인 전 임시 보류)을 허용한다 — 나머지 콘솔은 전부 승인 후 실행 원칙([[08_본선/03_제품/docs/05_domain-model|05_domain-model §1]] "왜 사람 승인 게이트인가").

### 2.3 전세보호(JPO) — 전북은행 전용, 11종(v3)

`jeonseProtectionAgents.registry.js`. v2(10종: intake·price·registry·guarantee·auction·victim·legal·comms·dataquality·supervisor)에 v3에서 **`jpo-evaluator`(루프 검증 에이전트)**가 추가돼 생성-검증 분리가 완성됐다.

| id | 표시명 | domain | 판단/검증 경계 |
|---|---|---|---|
| `jpo-intake` | 전세 접수 분류 에이전트 | orchestration | 접수 유형 분류·라우팅 |
| `jpo-price` | 시세·유사거래 에이전트 | priceRisk | 전세가율 산출, 시세 확정 감정 금지 |
| `jpo-registry` | 등기부 체크리스트 에이전트 | registryCheck | 권리관계 체크리스트, 등기 원문 저장 금지 |
| `jpo-guarantee` | 보증·HUG 체크리스트 에이전트 | guaranteeCheck | 보증 확인 체크리스트, 가입 가능 확정 금지 |
| `jpo-auction` | 경·공매 기한 감시 에이전트 | urgentAuction | 기한 임박 신호·에스컬레이션(자동 종결 금지) |
| `jpo-victim` | 피해자 신청 안내 에이전트 | victimApplication | 요건·서류 체크리스트, 신청 대행 금지 |
| `jpo-legal` | 법률지원 연계 에이전트 | supportReferral | 연계 후보 정리("안내 후보"만) |
| `jpo-comms` | 임차인 상담 요약 에이전트 | communication | 상담 요약·안내 초안, 자동 발송 금지 |
| `jpo-dataquality` | 데이터 품질·증적 에이전트 | dataQuality | sourceMode·표본 부족 플래그, PII 마스킹 점검 |
| `jpo-supervisor` | 감독자 검토 에이전트 | governance | 검토 큐·승인 추적, 자체 승인 금지 |
| **`jpo-evaluator`**(v3 신설) | 루프 검증 에이전트 | evaluation | **생성 에이전트와 분리된 검증 전담** — 확정 표현·근거 부족·PII 노출·자동 완료를 별도로 점검(`EVALUATOR_CHECKED` 감사 기록) |

공통 금지(`JPO_COMMON_BLOCKED_ACTIONS`): 전세사기 여부·피해자 결정·보증가입·법률자문 확정 금지, 임대인 신용정보 조회 금지, high/critical 자동 종결 금지.

### 2.4 JB우리캐피탈(JBWC) — 13종

`jbWooriCapitalAgents.registry.js:43-255`.

| id | 표시명 | domain |
|---|---|---|
| `jbwc-orchestrator` | JB 분류 오케스트레이터 | orchestration |
| `jbwc-personal` | 개인금융 운영 에이전트 | personalFinance |
| `jbwc-auto` | 자동차금융 운영 에이전트 | autoFinance |
| `jbwc-mortgage` | 담보금융 운영 에이전트 | mortgageSecured |
| `jbwc-enterprise` | 기업금융 운영 에이전트 | enterpriseFinance |
| `jbwc-care` | 고객관리 운영 에이전트 | customerManagement |
| `jbwc-doc` | 문서·전자약정 에이전트 | documentContract |
| `jbwc-vehicle` | 차량관리 에이전트 | vehicleLifecycle |
| `jbwc-protect` | 소비자보호 에이전트 | consumerProtection |
| `jbwc-fds` | FDS·보이스피싱 대응 에이전트 | fdsVoicePhishing |
| `jbwc-complaint` | 민원·고객센터 에이전트 | complaintContactCenter |
| `jbwc-compliance` | 내부통제 에이전트 | complianceInternalControl |
| `jbwc-metrics` | 운영 지표·QA 에이전트 | metrics |

전세 도메인은 캐피탈 사업영역 밖이라 이 로스터에 없다([[08_본선/03_제품/docs/07_architecture|07_architecture]] §12 "전북은행(여신·전세·피싱·사후관리) + JB우리캐피탈(오토/개인/기업 여신·EWS, 전세 없음)").

---

## 3. 승인 레벨 — 매트릭스(canon) vs 코드(riskLevel) 정합 [미검증]

`04_tech/data-model`·예선 `app.js`는 **L0~L4**(L3~L4=준법) 매트릭스로 기술한다. JB_project2 4콘솔은 공통적으로 **`riskLevel(low/medium/high/critical) + requiresHumanReview(bool) + 감독/USR- 결재`** 구조로 구현돼 있고, L0~L4 라벨 자체는 코드에 없다.

| L레벨(문서) | 잠정 매핑(riskLevel) | E? |
|---|---|---|
| L0/L1 | low | E1(미검증) |
| L2 | medium | E1 |
| L3 | high | E1 |
| L4 | critical | E1 |

L4의 "실 승인 주체"(상위 검토)는 정본 미지정 — [Open Question], [[08_본선/03_제품/docs/05_domain-model|05_domain-model §3.2]]과 동일 입장. 발표에서는 "L0~L4는 목표 정책 표현, 현재 코드는 riskLevel 4단계로 구현"이라고 정직하게 구분한다.

| 역할 | 표시명 | 설명 |
|-----|-------|------|
| Human RM/여신심사(1선) | 담당자(reviewer) | 케이스 조회·AI 요청·초안 요청. 승인권 없음 |
| Human 감독/준법(2선) | 감독/승인자(supervisor) | 결재 주체. `USR-*`만 통과(`afterApprovalDecision`) |
| Approval Gate | 승인 게이트 | 고위험 자동종결·자체승인 hard fail 차단 |

---

## 4. activityLog / eval 최소 장치 (콘솔 공통)

콘솔마다 `harnessRegistry.js`의 `verification` 블록이 최소 eval을 강제한다(`requiredAgents`·`requiredHooks`·`scopeProbe`·`piiScan`·`forbiddenResurface`).

| 이벤트 | 의미 |
|---|---|
| `*_CASE_CREATED` | Case 생성(콘솔별 접두: `CASE_CREATED`/`EARLY_WARNING_FLAGGED` 등) |
| `*_AGENT_RUN` | AgentRun 기록(`recordCorporateCreditAgentRun` 등) |
| `*_APPROVAL_DECIDED` | 승인/반려 확정 |
| `*_HOOK_BLOCKED_*` | 가드 위반 차단(`beforeCaseCreate`/`beforeCustomerMessage` 실패) |
| `EVALUATOR_CHECKED`(전세보호 전용, v3) | `jpo-evaluator`의 생성-분리 검증 통과/실패 |
| `audit.sealed`(목표 서버 모델) | 04_tech 원안의 GENESIS 해시체인 — 현재 코드는 append-only + `reviewRequired` 플래그로 구현, 해시체인은 미구현([[08_본선/03_제품/docs/05_domain-model|05_domain-model §7]]) |

최소 eval 요건(콘솔 공통): 승인 안전(고위험 자동종결 0건), 근거 연결(Evidence 테이블 write 100%), 스코프 격리(`role scope is required` 예외로 강제), PII 반출 금지(원문 저장/출력 0건), 규칙 준수(`*_FORBIDDEN_ASSERTIONS` 정규식 차단).

---

## 부록 A. 운영 에이전트 3종 (콘솔 공통·고객 비대면) [분기/미확정]

위 4콘솔 로스터(고객 업무 에이전트)와 **별개 레이어** — 콘솔 숫자(8/8/11/13)에 합산하지 않는다. 심사 공격질문 3축(비용·오류·감사)을 상시 운영으로 담당하며, paperclip式 파일셋(agent.yaml·SOUL.md 프롬프트 원문·tools.json·memory.md)으로 정의된다. 도구 계약의 절반은 이미 E4(게이트웨이·원장·감사 함수)에 바인딩되어 있다.

| 에이전트 | 담당 | 핵심 권한 경계 | 설계도 |
|---|---|---|---|
| Cost Sentinel | Q13 원가 순찰·티어 효율 제안 | 읽기 전용 — 라우팅 정책 변경은 제안→사람 승인 | [[08-Cost-Sentinel-에이전트-설계도]] |
| 119 (관할 확장) | Q14 라우팅 오류 관측·사고 승격 | Kill Switch는 critical만, 그 외 전부 제안 | [[09-119-라우팅관측-확장-설계도]] |
| Ledger Curator | Q15 감사 실효성·메모리 승격 심사 | 원장 불변 — 수정 권한 자체가 없음 | [[10-Ledger-Curator-에이전트-설계도]] |

메모리 계약(고객/에이전트/직원 3계층 격리, Hermes式 증류)은 [[01-메모리-거버넌스]] 8계층에 매핑, 실장 스펙(MemoryCard 스키마·Distiller 프롬프트·RAG 주입·SOUL 자동진화)은 [[11-메모리-3계층-자동진화-설계도]] — 각 설계도의 "메모리 계약" 절 참조.

## 참조

- [[08_본선/03_제품/02_agent-design/orchestrator|오케스트레이터]]
- [[08_본선/03_제품/02_agent-design/skill-spec|스킬 명세]]
- [[08_본선/03_제품/docs/05_domain-model|도메인 모델(CCL 상세)]]
- [[08_본선/03_제품/docs/07_architecture|아키텍처]]
- [[08_본선/03_제품/docs/04_definitions|정의서]](히어로 ID·용어 정합)
- [[08_본선/03_제품/00_vision/차별성-설정근거상향-흐름|차별성-설정근거상향-흐름]]
- [[08_본선/03_제품/01_결정-준비/설계/paperclip-통합-블루프린트|paperclip-통합-블루프린트]]
- [[08_본선/03_제품/01_결정-준비/설계/agents-v2-paperclip기반-재설계|agents-v2-paperclip기반-재설계]]
