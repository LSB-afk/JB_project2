---
tags:
  - area/product
  - type/reference
  - status/active
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases: [스킬 명세, per-console 스킬 카탈로그]
---

# 스킬 명세

> **갱신 노트(2026-07-04)**: 이전 버전(07-03)은 예선 `app.js`의 단일 `skillRack`(25종)을 정본으로 삼았다. 본선 실 프로토타입(JB_project2)은 **콘솔별 정적 스킬 배열**(`cclConsoleSkills`·`fdrConsoleSkills`·`jeonseProtectionSkills`·`jbWooriCapitalSkills`)로 완전히 분리돼 있고, 아직 paperclip식 **런타임 registry(`registerPlugin`/`requirePlugin`)로 승격되지 않았다** — 지금은 코드에 박힌 정적 배열이다. **데모의 내부 스킬 = 우리 차별점**(범용 RAG/챗봇이 아니라 금융 도메인 판단 단위로 스킬을 쪼갠 것)이라는 원칙은 유지된다.
>
> 근거: `_vendor/JB_project2/app/cclConsole.core.js`·`fdrConsole.core.js`·`jeonseProtectionAgents.registry.js`·`jbWooriCapitalAgents.registry.js`, [[08_본선/03_제품/00_vision/차별성-설정근거상향-흐름|차별성-설정근거상향-흐름]](스킬 설정 메커니즘의 목표 상태), [[08_본선/03_제품/01_결정-준비/설계/paperclip-통합-블루프린트|paperclip-통합-블루프린트]] §2 #3·#11(스킬 카탈로그·플러그인 registry 이식 설계).

---

## 1. 스킬 설계 원칙

- 각 에이전트는 스킬(재사용 업무 단위)을 장착해 특정 기능을 수행한다. 스킬은 콘솔(하네스) 단위로 정의되며, 콘솔 경계를 넘어 공유되지 않는다(`jeonseProtectionAgents.registry.js` 주석: "메인/계열사 registry를 alias하지 않는다").
- 스킬 실행은 AgentRun의 판단/행동초안/검증 단계 중 하나에 속하며([[08_본선/03_제품/02_agent-design/orchestrator|오케스트레이터]] §3), 모든 실행은 콘솔별 audit 테이블에 기록된다.
- **목표 상태(아직 미구현)**: 담당자가 케이스 유형별로 스킬·외부 API/MCP·내부 DB 접근을 **설정(on/off)**하면 그 설정이 근거 수집 범위를 넓힌다는 것이 실차별성이다([[08_본선/03_제품/00_vision/차별성-설정근거상향-흐름|차별성-설정근거상향-흐름]] §3). 현재 코드는 이 설정 레이어가 없고, 콘솔별 스킬 배열이 정적으로 고정돼 있다 — settings 계층·plugin registry 승격은 [[08_본선/03_제품/01_결정-준비/설계/paperclip-통합-블루프린트|블루프린트]] §6 Task 1~2(미착수)에 명시.
- `agent-loop` SKILL.md의 품질 게이트를 그대로 채택: **검증 없는 생성은 미완성**, **사람 승인 없는 고위험 행동은 차단**.

---

## 2. 콘솔별 스킬 카탈로그 (코드 정본)

### 2.1 기업여신(CCL) — 6종, 히어로 콘솔

| 스킬 key | 라벨 | 담당 에이전트 | 입력 | 출력 |
|---|---|---|---|---|
| `credit-intake-triage` | 여신 접수 분류 | `ccl-intake` | loanType, amountBand | status, handoffs |
| `financial-brief` | 재무자료 요약 브리프 | `ccl-financial` | caseId | summary, flags |
| `repayment-band-check` | 상환 부담 구간 체크 | `ccl-repayment` | caseId | burdenBand, checklist |
| `doc-gap-check` | 서류 누락 확인 | `ccl-doc` | caseId | missingDocs |
| `policy-candidates` | 정책금융 후보 정리 | `ccl-policy` | caseId | candidates |
| `approval-memo-draft` | 승인 품의 초안 | `ccl-memo` | caseId | memoDraft, approvalRequest |

### 2.2 FDS/피싱(FDR) — 6종

| 스킬 key | 라벨 | 담당 에이전트 | 입력 | 출력 |
|---|---|---|---|---|
| `alert-triage` | 경보 분류·라우팅 | `fdr-intake` | alertType, riskLevel | status, handoffs |
| `signal-brief` | 위험 신호 요약 | `fdr-signal` | caseId | summary |
| `elder-priority` | 고령·취약 우선 보호 | `fdr-elder` | caseId | priorityFlag, checklist |
| `contact-script` | 송금 전 확인 스크립트(승인 대기) | `fdr-contact` | caseId | script, approvalRequest |
| `hold-block-recommend` | 차단/보류 권고 | `fdr-block` | caseId | recommendation |
| `report-guide` | 지급정지·신고 절차 안내 후보 | `fdr-report` | caseId | guideCandidates |

### 2.3 전세보호(JPO) — 10종(+ 검증 스킬 1종은 §2.3.1)

| 스킬 key | 라벨 | 담당 에이전트 | 입력 | 출력 |
|---|---|---|---|---|
| `loop-evaluate` | 루프 검증(확정표현·근거·PII·연계상태) | `jpo-evaluator` | caseId, outputSummary | verdict, notes |
| `intake-triage` | 접수 분류·초기 상태 산정 | `jpo-intake` | intakeType, riskSignals | status, handoffs |
| `market-median-enrich` | 실거래 중앙값 보강 | `jpo-price` | housingType, lawdCode, dealYm | saleMedian, jeonseMedian, sourceMode |
| `jeonse-ratio-signal` | 전세가율/과다 신호 산출 | `jpo-price` | depositAmount, saleMedian, jeonseMedian | riskSignals |
| `registry-checklist` | 권리관계 체크리스트 | `jpo-registry` | caseId | checkItems, manualRequired |
| `guarantee-checklist` | 보증·HUG 확인 체크리스트 | `jpo-guarantee` | caseId | checkItems, manualRequired |
| `auction-deadline-watch` | 경·공매 기한 감시 | `jpo-auction` | caseId, auctionDeadline | urgentSignal, escalation |
| `victim-doc-checklist` | 피해자 신청 서류 체크리스트 | `jpo-victim` | caseId | docChecklist |
| `consult-summary-draft` | 상담 요약·안내 초안(승인 대기) | `jpo-comms` | caseId, context | summary, approvalRequest |
| `source-quality-report` | 데이터 품질/증적 리포트 | `jpo-dataquality` | caseId | sourceMode, confidence |

#### 2.3.1 검증 전담 스킬(v3 신설) — 왜 별도 스킬/에이전트인가

`loop-evaluate`는 **생성 스킬과 같은 함수가 검증을 겸하지 않는다**는 원칙의 코드 구현이다(`jpo-evaluator` guardrails: "생성과 검증은 같은 함수가 수행하지 않는다"). 확정 표현(전세사기/법률/보증/피해자 결정 단정) 탐지, 근거 수 점검, PII 원문 노출 탐지, high/critical 자동 완료 차단을 담당하며, 통과 시 `EVALUATOR_CHECKED` 감사 이벤트를 남긴다. 이 분리는 [[08_본선/03_제품/00_vision/차별성-설정근거상향-흐름|차별성-설정근거상향-흐름]]이 요구하는 "판단 직전까지만 AI가 돕는다"는 원칙을 스킬 단위에서 강제하는 구조다.

### 2.4 JB우리캐피탈(JBWC) — 6종(13 에이전트 대비 다대다 매핑)

| 스킬 key | 라벨 | 담당 에이전트 | 입력 | 출력 |
|---|---|---|---|---|
| `ops-triage` | 운영 건 분류·라우팅 | `jbwc-orchestrator` | domain, riskLevel | recommendedAgent, initialStatus |
| `document-status-check` | 문서·전자약정 상태 점검 | `jbwc-doc` | caseId | pendingDocuments |
| `vehicle-task-runner` | 차량 태스크 생성·추적 | `jbwc-vehicle`, `jbwc-auto` | vehicleRefId | taskId |
| `fds-escalation` | FDS 고위험 에스컬레이션 | `jbwc-fds` | alertType, severity | escalation, approvalRequest |
| `consumer-right-review` | 소비자 권리 검토 플로우 | `jbwc-protect` | reviewType | checklist, reviewFlag |
| `ops-audit-writer` | 운영 감사 기록 | `jbwc-compliance` | action, targetId | auditId |

> 캐피탈은 13 에이전트 대비 스킬이 6종뿐이다 — 나머지 에이전트(`jbwc-personal`/`jbwc-mortgage`/`jbwc-enterprise`/`jbwc-care`/`jbwc-complaint`/`jbwc-metrics`)는 전용 스킬이 아직 코드에 없고 공통 스킬을 재사용하거나 스킬 없이 상태 추적만 한다 — **정합성 결함, 보강 대상**([[08_본선/03_제품/docs/08_feature-spec|08_feature-spec]] §3 약근거 표에 준하는 성격) [미검증/7-4].

---

## 3. PII 등급제

`public` / `internal` / `confidential` / `restricted` 4등급([[08_본선/03_제품/docs/05_domain-model|05_domain-model]] §2.1과 동일 기준). `restricted`(성명·주민번호·계좌·연락처·주소 등 원본 식별정보)는 외부 반출 금지 — 이 등급이 필요한 스킬(등기부 조회, 재무자료 원본 등)은 내부/온프레 모델로만 라우팅하고, 외부 LLM에는 토큰화·비식별 컨텍스트만 전달한다(신용정보법 §40조의2). 콘솔 코드는 스킬별 PII 등급 필드를 아직 명시적으로 갖고 있지 않다 — `dbReads`/`dbWrites` 화이트리스트와 `blockedActions`(원문 저장/출력 금지 문구)로 사실상 등급을 강제하는 형태다 [E4, 필드화는 [미검증/7-4]].

---

## 4. 정합성 결함 — 보강 대상 (미해결)

| 항목 | 상태 |
|---|---|
| 콘솔별 스킬 배열에 PII 등급 필드 부재(§3) | [미결/7-4] |
| JBWC 13 에이전트 대비 스킬 6종 — 나머지 7개 에이전트 전용 스킬 미정의(§2.4) | [미결/7-4] 담당자 확인 필요 |
| 담당자 설정(config) 레이어 전체 미구현 — 정적 배열을 런타임 registry로 승격 필요 | [[08_본선/03_제품/01_결정-준비/설계/paperclip-통합-블루프린트|블루프린트]] §6 Task 1~2, 미착수 |
| 콘솔 간 공용 스킬 없음(4개 레지스트리가 이름·형식이 겹쳐도 완전 독립) — 통합/재사용 여부 | [미결/7-4] |
| 예선 `skillRack`(25종, canon 인용)과 4콘솔 스킬 합(6+6+10+6=28종) 간 이름 매핑 없음 | [Open Question] — 제출 문서에서 canon 25 인용 시 "발표 요약", 코드 근거는 콘솔별 표 인용으로 구분 |

담당자·기한 미정 — 앱 구현 담당자 확인 필요.

---

## 5. 최소 eval 장치 (스킬 단위, 콘솔 공통)

| 평가축 | 최소 장치 | 통과 기준 |
|---|---|---|
| 승인 안전 | `approvalRequest` 산출 스킬 실행 후 반드시 `approvals` 테이블 pending 등록 | 100% |
| 근거 연결 | 판단형 스킬 출력이 콘솔별 Evidence 테이블(`*_review_notes`/`*_risk_signals`)과 연결 | 100% |
| PII 반출 | `restricted` 등급 스킬의 원본 필드가 외부 LLM 프롬프트에 포함되지 않음 | hard fail 없음 |
| 스코프 경계 | 스킬 실행 시 케이스의 계열사/역할 스코프 밖 데이터 접근 없음(`role scope is required`) | hard fail 없음 |
| 자동종결 금지 | high/critical 케이스를 자동 종결하지 않음(`harnessGuardCheckAutoClose`) | hard fail 없음 |
| 생성-검증 분리(전세보호 특유) | `loop-evaluate`가 생성 스킬과 별도 함수로 실행됨 | hard fail 없음(v3 신설 원칙) |

---

## 참조

- [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]]
- [[08_본선/03_제품/02_agent-design/orchestrator|오케스트레이터]]
- [[08_본선/03_제품/00_vision/차별성-설정근거상향-흐름|차별성-설정근거상향-흐름]]
- [[08_본선/03_제품/01_결정-준비/설계/paperclip-통합-블루프린트|paperclip-통합-블루프린트]]
- [[08_본선/03_제품/docs/05_domain-model|도메인 모델]]
