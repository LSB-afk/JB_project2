---
tags:
  - area/product
  - type/plan
  - status/active
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases: [SSD Implementation, SDD 구현계획, ssd-implementation]
---

# SSD Implementation — 문서를 작동 MVP로 내리는 구현계획

> 노멀폼: DDBM-Harness-SDD 스킬 §Phase6 `docs/13_ssd-implementation.md`. 순서 = `Specify → Clarify → Plan → Tasks → Implement → Verify → Demo`.
> **이 문서의 위치**: [[08_본선/03_제품/docs/08_feature-spec|Feature Spec]](테스트 가능한 입출력)과 [[08_본선/03_제품/docs/07_architecture|Architecture]](레이어·경계)를 **실제 작업 목록**으로 변환한다. 새 사실을 만들지 않고 두 문서 + 코드 SSOT를 작업으로 배치한다.
>
> **코드 SSOT**: `_vendor/JB_project2`(역할축 콘솔, 정적 브라우저 프로토타입 v0.2.0). 히어로 실동작 슬라이스 = **ccl-financial**(라이브 에이전트, 브랜치 `feat/live-agent-ccl-financial`, PR **LSB-afk/JB_project2#1**). Demo-critical path = **CCL-0001**(전주 카페 운전자금, `BIZ-REF-0001`, 구 JBG-104).
>
> **근거등급**: E4=코드/데모 직접확인 · E3=백본 SSOT 문서·절차 · E2=리서치 근거층 · E1=설계의도(미검증) · [목표/7-4]=밤샘 개발 목표(현재 미완) · [TBD]/[Open Question]=미정.

---

## 1. Specify (범위 고정)

| 항목 | 내용 | E? |
|---|---|---|
| **MVP goal** | JB_project2 정적 프로토타입에서 히어로 여신 케이스 **CCL-0001**이 `케이스 생성 → 위험판정 → 에이전트 handoff(판단→행동초안→검증) → 사람 승인 → 감사기록`을 끊김 없이 완주하고, **최소 이 한 경로는 실 LLM(ccl-financial)** 로 동작함을 보인다. | E4 골격 / [목표/7-4] 라이브 |
| **Demo-critical path** | `?demo=sme` → CCL-0001 오픈 → riskScore 88·band L3 재현 → 정책·서류 체크리스트 초안 → **RM+준법(L3) 승인** → 감사원장 append. 라이브 시 `?live=1`. | E4 |
| **Primary user scenario** | 여신 담당(1선)이 흩어진 위험신호를 한 스키마로 받아 근거와 함께 판정을 검토하고, 고객향 행동을 **승인 게이트 뒤에서만** 실행. 결정은 준법(2선). | E3, 키스톤 |
| **Required inputs** | CCL-0001 케이스 + `RiskSignal[]`(6필드), 역할 스코프 `roleKey`, (라이브 시) 로컬모델 Ollama `exaone3.5:7.8b` 또는 Anthropic `claude-3-5-haiku` 키. **원문 PII는 프롬프트 미투입 — 익명 구간지표만.** | E4 [코드: `llmClient.js`] |
| **Required outputs** | ① 위험밴드+사유 ② 정책·서류 체크리스트 초안 ③ 승인 카드(초안·근거·규정검증 동시) ④ append-only 감사로그 + 상태전이. | E4 |
| **Constraints** | 서버·프레임워크·빌드 없음(정적 브라우저 + `localStorage`). 원본 PII 외부 LLM 비반출. 승인 없는 자동 고객발송 원천 차단. 라이브 실패 시 **결정형 모의로 자동 fallback**(데모 무중단). | E4 [`README §실데이터`] |
| **Non-goals** | 실 계정계 CDC·MCI/EAI 연동(mock), 실 등기·금결원, 서버 API 승격, DB 이관, **3케이스 전부 실 LLM**(히어로 1개만 지향), 전세(jeonse)·피싱 실동작 완성도 히어로급까지. | E3, 키스톤 §정직한 전제 |

---

## 2. Clarify (미결 질문 — 카테고리별)

> 형식: Question / Why it matters / Default assumption if unanswered / Risk if wrong. 대부분 선행 문서에서 이미 [Open Question]으로 표면화됨 → 여기선 **7/4 팀 확정 대상**만 추린다.

| # | Cat | Question | Why | Default | Risk if wrong |
|---|---|---|---|---|---|
| C1 | Demo | 히어로 케이스 ID를 **CCL-0001**로 통일하나(구 JBG-104)? | 데모 스크립트·코드·문서 ID 불일치 시 시연 중 모순 노출 | CCL-0001 정본, 표기 `CCL-0001(구 JBG-104)` | 심사위원 앞 ID 혼선 → 신뢰 감점 |
| C2 | AI/model | 라이브 백엔드를 로컬 Ollama(exaone)로 갈까 Anthropic 키로 갈까? | 현장 네트워크·GPU 가용성에 데모 성패 좌우 | 로컬 우선, 실패 시 Anthropic, 둘 다 실패 시 결정형 fallback | 현장 라이브 실패 시 "실동작" 주장 붕괴 → fallback 서사 필수 |
| C3 | Risk/compliance | 승인 L0~L4 ↔ `riskLevel/requiresHumanReview` 잠정매핑(low→L0/1·med→L2·high→L3·crit→L4)을 데모에 확정 노출하나? | L3=RM+준법 공동결재가 차별성 핵심 게이트 | 잠정매핑 사용, L4 실주체 [Open Question] | 게이트 레벨 오설명 → 규제 서사 약화 |
| C4 | Data | 히어로에서 실데이터(RTMS 등)를 켜나? | ccl-financial(여신)은 실데이터보다 실 LLM이 핵심, 실데이터는 전세 트랙 | 히어로=실 LLM 중심, 실데이터 라이브는 전세 백업데모로만 | 여신에 무관한 실데이터 강조 → 초점 흐림 |
| C5 | Technical | DB는 `localStorage` 유지인가 서버 승격인가? | P0 옵션 A/B/C 미확정 | 데모=localStorage 유지, 승격은 로드맵 | 데모 직전 DB 이관 시도 = 리스크 | 
| C6 | Business/Submission | 제출 KPI를 절대값("0건 보장")으로 쓸지 범위·분모형으로 쓸지 | D13: 절대보장은 감점요소 | 전부 "N건 평가셋 위반 0 관측"형 | 보편보장 표현 = 심사 감점 [E2, D13] |
| C7 | User | 2개 계열사(전북은행+JB우리캐피탈) 조직레일을 데모에 노출하나? | 그룹 확장성이 차별성 논거 | org-rail 2노드 노출, 히어로는 전북은행 스코프 | 확장 서사 미노출 시 "단일 은행 도구"로 축소 인식 |

---

## 3. Plan (구현 계획)

| 항목 | 계획 | E? |
|---|---|---|
| **Stack** | 정적 브라우저(vanilla JS, `<script>` 로드, 모듈러·번들 없음) + `python3 -m http.server`. 검증=`verify_static.py`(문자열 계약) + Playwright. LLM seam=`llmClient.js`(Ollama `exaone3.5:7.8b` 기본 / Anthropic `claude-3-5-haiku`), `?live=1` opt-in, 실패 시 `null`→모의 fallback. **새 의존성 추가 없음.** | E4 [`package.json` v0.2.0] |
| **File structure** | `_vendor/JB_project2/app/`: `cclConsole.{core,app,data}.js`(히어로 여신), `llmClient.js`(라이브 seam), `harnessCore.js`·`harnessVerification.js`(가드), `index.html`·`styles.css`. 계열사=`wooricap.*`, 전세=`jeonseProtection.*`. **읽기전용 — 이 계획은 기존 파일에 작업을 매핑만 한다.** | E4 |
| **Components** | 5레이어(콘솔 UI / Gateway 인증·DLP / 오케스트레이션 / RAG·규칙 / 데이터·감사) — [[08_본선/03_제품/docs/07_architecture|Architecture §2]]. CCL 에이전트 8종(표면 5+감독·내부 3) [`cclConsole.core.js:111-159`]. | E4 |
| **API routes** | **현 MVP는 서버 없음** — 4 함수계약(`computeRiskDecision`·`buildDashboardData`·`auditChainRecords`·`moveCaseToColumn`)이 API 계약의 대리물. 서버 승격 매핑(`POST /api/cases/:id/risk-decision` 등)은 [향후], Architecture §5. | E4 함수 / E1 서버 |
| **Data schema** | 7단 계약 엔티티 `localStorage`(`ccl-ops-db-v1`), 전행 `roleKey`/`workspaceId` 스코프 태깅. PII 비반출: 저장은 `BIZ-REF`·구간값·파생피처만(원문 식별자 미보관) [E2, D7a]. | E4 |
| **Model calls** | 라이브 경로만 LLM 호출 — 프롬프트에 **익명 구간지표만** 구성(호출부 책임), 초안 문장 생성·요약에 한정. 판단·점수는 규칙/함수계약이 최종 게이트(LLM은 요약·설명만) [E2, D9/D20]. temperature 0.2, timeout 20s. | E4 [`llmClient.js`] |
| **State management** | `localStorage` 단일 소스 + 훅 파이프라인이 상태전이 강제: `onRoleEnter→beforeCaseCreate→afterCaseCreate→beforeAgentRun→afterAgentRun→beforeCustomerMessage→afterApprovalDecision→onAuditWrite`. | E4 |
| **Logging** | `ccl_audit_logs` append-only(`actorId·action·targetType·targetId·riskLevel·reviewRequired·createdAt`). `reviewRequired=true`만 감독 감사뷰 집계. 해시체인은 목표(현 CCL=append+플래그) [E1]. | E4 |
| **Deployment assumption** | 로컬모델 머신(M4 Pro, localhost 전용) = 원본 PII 유일 처리점, 콘솔 서버 동일 사설망. **최종 검증은 이승보 PC 기준** [E3, 04_tech §4]. 데모 현장은 노트북 1대 + (선택)로컬 Ollama. | E3/E1 |
| **Test strategy** | 3단: ① `npm run test`(`verify_static.py` 문자열계약) ② `npm run test:e2e`(Playwright ~19 시나리오) ③ 라이브 수동 리허설. KPI마다 테스트 클래스 1:1 매핑(백업 슬라이드) [E2, D13]. | E4 |

> **왜 서버가 아니라 정적인가** [E3, 키스톤]: 데모의 목적은 인프라가 아니라 **운영 루프·승인 게이트·감사 무결성**을 검증 가능하게 보이는 것. `입력→근거→승인게이트→상태변화→감사로그` 프레임을 브라우저에서 완결하는 게 "좋은 답을 했다"보다 강하다 [E2, D13].

---

## 4. Tasks (작업 분해)

> 우선순위 = Demo-critical path 먼저. 상태: ☐미착수 / ◐진행 / ☑완료(코드 존재).

| Task ID | Task | Output | Depends On | Completion Criteria | Test |
|---|---|---|---|---|---|
| T1 | 히어로 케이스 ID·데이터 고정(CCL-0001, riskScore 88·L3 재현) | `cclConsole.data.js` 시드 확정 | C1 확정 | 동일 입력→`riskScore=88·band=L3` 재현 | e2e: 판정 재현 |
| T2 | 위험판정 골격 `computeRiskDecision` 검증(신호 6필드·기여도) | 판정+기여도 렌더 | T1 | 6필드 결측 시 케이스 생성 차단+감사(실패) | e2e: 결측 차단 |
| T3 | FSM `moveCaseToColumn` 5컬럼·금지전이 차단 | 상태전이+감사 | T1 | 금지전이 UI 차단+감사(실패), 배지 L0~L4 | e2e: 전이 차단 |
| T4 | 에이전트 handoff 실행시퀀스(판단→행동초안→검증) 결정형 완주 | 3단 산출+AgentRun 로그 | T2,T3 | 최소 3 handoff 완주, `decisionSnapshot` 불변 조회 | e2e: handoff |
| T5 | **라이브 슬라이스 ccl-financial 연결**(초안 문장 실 LLM) | `?live=1` 실 응답 | T4, C2 | 로컬/Anthropic 응답 렌더, **실패 시 결정형 fallback 무중단** | 수동 라이브 리허설 |
| T6 | 승인 게이트 L0~L4(L3=RM+준법 공동), 우회 차단 | 승인 카드+전이 | T4 | rejected 고객행동 100% 차단, 자체승인 hard fail | e2e: 승인/거부/우회 |
| T7 | 감사원장 append-only + `reviewRequired` 집계 | 감사뷰 | T6 | 케이스당 최소 4 이벤트타입, 변조 검출 | e2e: 감사/변조 |
| T8 | PII 반출스캔 절차(restricted hard-fail) + canary 시드 | 차단 판정+보안이벤트 | T5 | restricted 필드 외부경로 미라우팅, 시도·차단 감사편입 | canary 테스트셋 [목표 E4] |
| T9 | 조직레일 2계열사(전북은행+JB우리캐피탈) 노출·스코프 격리 | org-rail 2노드 | T1 | 타 스코프 행 격리(`role scope is required`) | e2e: 스코프 격리 |
| T10 | KPI 프레이밍 백업 슬라이드(테스트↔KPI 1:1) | 근거 슬라이드 | T2~T8 | 절대보장 문구 0건, 전부 범위·분모형 | 문구 grep 점검 |

> **약근거/미검증**: T5·T8은 [목표/7-4] — 7/3 기준 실 LLM 미연결·canary 자동스캔 미완(키스톤 §정직한 전제). T5 실패 시 T4 결정형 골든패스가 데모를 담보한다.

---

## 5. Implement (구현 순서)

노멀폼 순서 그대로. 앞선 단계 verify 전에는 뒷 단계 polish 금지.

1. **Demo-critical path** — T1~T4(CCL-0001 결정형 완주). 라이브 없이도 데모가 서는 상태를 먼저 만든다.
2. **Data input/output** — RiskSignal 6필드·판정·체크리스트 렌더 안정화(T2).
3. **Core AI/rules logic** — 규칙 게이트 최종성 확인 후 T5 라이브 슬라이스 연결(LLM은 초안·요약만).
4. **Risk/approval/audit** — T6·T7·T8(승인 게이트·감사·반출스캔). 여기까지가 차별성 척추.
5. **UI states** — 승인 전 자동발송 UI 미노출, 차단/보류 케이스 노출(골든패스만 X) [E2, D13].
6. **Evaluation cases** — 골든패스 + 실패/차단 케이스 평가셋(최소 30, 평가자 2명 권고선) [E2, D13].
7. **Polish** — verify 통과 후에만.

---

## 6. Verify (검증)

| 단계 | 방법 | 통과기준 | E? |
|---|---|---|---|
| Lint | (전용 린터 없음) `node --check app/cclConsole.core.js` 등 구문검사 | 구문 에러 0 | E4 |
| Typecheck | 해당 없음(vanilla JS, TS 아님) | — | — |
| Unit test | 함수계약 결정형 재현(입력→출력 고정) | CCL-0001 재현 100% | E4 |
| Smoke test | `npm run test`(`verify_static.py` 문자열계약) | 필수파일·문자열·`node --check` 전부 pass | E4 |
| Golden case test | `npm run test:e2e` 히어로 골든패스 | 판정·handoff·승인·감사 시나리오 green | E4 |
| Failure mode test | 라이브 실패→fallback, 금지전이·우회승인·변조·PII 반출 | 전부 차단/무중단, **critical flow 위반 0건(분모 명시)** | E4/[목표] |
| Manual demo rehearsal | `?demo=sme`(+`?live=1`) 현장 리허설, 네트워크 OFF 케이스 포함 | 라이브·fallback 양쪽 완주 | [목표/7-4] |

> **KPI 프레이밍(필수)** [E2, D13]: "정확도 X%"·"0건 보장" 금지. `critical flow N개 테스트 위반 0건`, `평가셋 N건에서 FN 0 관측`처럼 범위·분모 동반. PII 검증은 canary·honeytoken으로 direct ask / indirect injection / summarization leakage / tool-arg leakage를 돌리고 최종출력·로그·내부메시지까지 스캔. LLM-as-judge는 보조 채점기로만, 최종 acceptance는 정책룰+정답셋+인간감사 샘플로 닫는다.

---

## 7. Demo (발표 시나리오 연결)

| 항목 | 내용 |
|---|---|
| **Demo route** | `?demo=sme`(히어로) → 첫화면 CTA / CCL-0001 오픈. 라이브: `?demo=sme&live=1`. 백업: `?demo=phishing`(피싱 차단), `?demo=jeonse`(전세 로드맵·실데이터 옵션). |
| **Demo data** | CCL-0001(전주 카페 운전자금, `BIZ-REF-0001`, riskScore 88·band L3). org-rail: 전북은행 + JB우리캐피탈 2노드. |
| **Expected screen** | 3열 셸 — org-rail(계열사)·워크벤치(칸반·승인함)·컨텍스트 패널(위험신호 기여도·근거·규정검증·감사). 승인 카드에 초안·근거링크·법령인용 동시 노출. |
| **Narration** | "흩어진 신호를 한 스키마로 받아 → AI가 판정·초안을 제안 → **결정은 사람(RM+준법 L3)** → 모든 행위가 수정불가 감사로그. AI는 직원이 사람답게 판단할 여유를 만든다." |
| **Failure fallback** | 라이브 LLM 실패(네트워크·GPU·타임아웃) → `llmClient` `null` 반환 → **결정형 골든패스(템플릿 초안)로 자동 전환**, 데모 무중단. 감사로그에 출처(`시뮬레이션 입력`) 표기. |
| **Time limit** | 결선 15분 중 데모 **약 4~5분**(히어로 1케이스 완주), 나머지 차별성·확장·근거. 라이브는 첫 1케이스만, 백업 2케이스는 결정형 스냅샷. |

> **차별성 척추 연결**: 업무를 '경험'으로 재해석 → 역할 기반 AI Agent 게이트(4관점: 직원·조직·그룹·고객). 조어 PX·AX는 '우리 팀 실행원칙'으로 선제고지(학계정립 주장 금지).

---

## 8. 약근거·미검증·가정 명시

| 항목 | 등급 | 처리 |
|---|---|---|
| 히어로 ID CCL-0001 vs JBG-104 | [Open Question] | C1, 7/4 팀·`rules/naming-rules.md` 확정 |
| T5 라이브 ccl-financial 실 LLM | [목표/7-4] E2 | 7/3 기준 미연결. fallback=결정형 골든패스(담보) |
| T8 PII canary 자동스캔 E4 격상 | [목표] E3→E4 | 절차 정의됨, 자동 e2e 미완 |
| 승인 L0~L4 ↔ riskLevel 매핑, L4 실주체 | [Open Question] | 잠정매핑 사용, domain §3 |
| 서버 API 승격·DB 이관 | [향후] E1 | MVP=localStorage·함수계약, 데모범위 밖 |
| CDC/MCI·EAI·등기·금결원 연동 | [향후/미검증] E1/E2 | mock, 비공개 규격(D6/D7a) |
| GPU TCO·tok/s·break-even 수치 | [추정] E2, D22 | 인용 시 `[추정]` 명시, 재검증 필요 |
| 절대값 KPI("0건 보장") | 감점요소 | 전부 "N건 위반 0 관측"형 [E2, D13] |

---

## 연결

- [[08_본선/03_제품/docs/08_feature-spec|Feature Spec — 테스트 가능한 입출력(변환 원본)]]
- [[08_본선/03_제품/docs/07_architecture|Architecture — 레이어·경계·모델 라우팅]]
- [[08_본선/03_제품/06_build-roadmap/_빌드-로드맵-MOC|빌드 로드맵 MOC(P0~P6)]]
- [[08_본선/03_제품/06_build-roadmap/빌드플랜-히어로-실동작-데모|히어로 실동작 데모 빌드플랜]]
- [[08_본선/03_제품/01_결정-준비/키스톤-확정|키스톤 — 데모 3케이스·정직한 전제]]
- [[08_본선/03_제품/00_vision/차별성-경험레이어-서사|차별성 경험레이어 서사]]
