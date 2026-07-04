---
tags:
  - area/product
  - type/moc
  - status/active
date: 2026-06-26
up: "[[_03_제품_MOC]]"
---

# 제품 문서 전체 인덱스 (상세판) — [[08_본선/_MOC/_03_제품_MOC|제품 MOC]]의 파일 목록 버전

> `03_제품/` 하위 전체 문서를 빠짐없이 나열한 상세 목록. 탐색·역할별 진입은 [[08_본선/_MOC/_03_제품_MOC|제품 MOC]](요약 허브)를 먼저 보고, 특정 파일을 찾을 때만 이 문서를 쓴다.

---

## 계약 이행 현황 (2026-07-05)

> [[08_본선/03_제품/_문서생성-스킬-DDBM-Harness-SDD|DDBM-Harness-SDD 스킬]] Output Contract 대비 실존 파일 대조. 상태: ✅ 계약 경로와 파일명 정확히 일치 · 🟡 부분(내용은 존재하나 파일명/위치가 계약과 다름, 위키링크는 파일명 기준이라 정상 작동) · ⛔ 누락(전용 산출물 없음).

**Core 14** (docs/00~12, 계약상 `01_`이 business-model·meeting-log 둘로 갈라져 14개)

| 계약 경로 | 상태 | 실제 |
|---|---|---|
| `docs/00_source-log.md` | ✅ | 그대로 |
| `docs/01_business-model.md` | 🟡 | `docs/01_business-model.md`(번호 프리픽스 없음) |
| `docs/01_meeting-log.md` | ⛔ | 회의록은 `01_결정-준비/회의록-정리본/`에 산재 — docs/ 전용 통합본 없음 |
| `docs/02_cps.md` | 🟡 | `docs/02_core-bet.md`(Core Bet = CPS 프레임) |
| `docs/03_principles.md` | 🟡 | `docs/03_principles.md` |
| `docs/04_definitions.md` | 🟡 | `docs/04_definitions.md` |
| `docs/05_domain-model.md` | ✅ | 그대로 |
| `docs/06_prd.md` | 🟡 | `docs/06_prd.md` |
| `docs/07_architecture.md` | ✅ | 그대로 |
| `docs/08_feature-spec.md` | ✅ | 그대로 |
| `docs/09_flow.md` | ✅ | 그대로 |
| `docs/10_eval-plan.md` | 🟡 | `evals/eval-plan.md`(docs/가 아니라 evals/) |
| `docs/11_change-log.md` | ✅ | 그대로 |
| `docs/12_handoff.md` | ⛔ | 전용 파일 없음, INDEX에 "12_handoff = [[본선 HOME]] 매핑"으로만 대체 |

**확장 8** (docs/13~20)

| 계약 경로 | 상태 | 실제 |
|---|---|---|
| `docs/13_ssd-implementation.md` | 🟡 | `06_build-roadmap/ssd-implementation.md` |
| `docs/14_demo-script.md` | ✅ | `07_발표-제출/demo-script.md`(alias로 번호 보존) |
| `docs/15_pitch-outline.md` | ✅ | `07_발표-제출/pitch-outline.md` |
| `docs/16_judge-qna.md` | ✅ | `07_발표-제출/judge-qna.md` |
| `docs/17_business-metrics.md` | 🟡 | `docs/17_business-metrics.md` |
| `docs/18_data-strategy.md` | 🟡 | `docs/18_data-strategy.md` |
| `docs/19_risk-impact-register.md` | 🟡 | `docs/19_risk-impact-register.md` |
| `docs/20_competition-submission-checklist.md` | ✅ | `07_발표-제출/submission-checklist.md` |

**Rules 6 / Evals 4 / Project-level**: 전부 ✅ 일치 — `rules/{agent,compliance,data,import-export,naming,ui}-rules.md`(6/6), `evals/{eval-plan,rubric,golden-cases,failure-modes}.md`(4/4), `harness.yaml`·`validation-report.md`(루트, 2/2).

**요약**: 계약 28항목 중 완전 누락은 **2건**(`01_meeting-log`·`12_handoff` — 둘 다 대체 경로는 있으나 전용 산출물 없음), **10건**은 내용은 있으나 파일명/위치가 계약과 다른 부분 일치(번호 프리픽스 생략이 대부분, 위키링크는 파일명 유일성 덕에 깨지지 않음), **16건**은 완전 일치.

---

## 전체 문서 목록

> 🔀 **2026-07-05 재구조화**: 하네스 정규문서(harness normal-form) 15종을 `docs/`로 통합했다(전에는 `00_vision/`·`01_prd/`·03_제품 루트에 흩어져 있었음). `구현현황-JB_project2`·`jb-finai-scorecard`는 `reports/`로, `07_계열사-하네스`·`07_역할-하네스`는 번호 없이 `계열사-하네스`·`역할-하네스`로 개명(`07_발표-제출`은 실제 제출자료라 유지). 파일명은 안 바꿔서 위키링크는 그대로 유효.
- [[08_본선/03_제품/reports/implementation-index|implementation-index — 구현 vs 설계 색인(✅E4/🔶부분/📐설계)]]

### docs/ — 하네스 정규문서(harness normal-form, 2026-07-05 통합)
- [[08_본선/03_제품/docs/00_source-log|Source Log]] · [[08_본선/03_제품/docs/01_business-model|Business Model (DDBM)]] — 데이터 기반 비즈니스 모델 11블록
- [[08_본선/03_제품/docs/02_core-bet|Core Bet]] — 핵심 베팅(CPS) · [[08_본선/03_제품/docs/03_principles|Principles]] — 제품 원칙(6)+거부규칙(5) · [[08_본선/03_제품/docs/04_definitions|Definitions]] — 정식 용어(8종)+명명규칙
- [[08_본선/03_제품/docs/05_domain-model|Domain Model]] · [[08_본선/03_제품/docs/06_prd|PRD]] · [[08_본선/03_제품/docs/06_mvp-scope|MVP Scope]]
- [[08_본선/03_제품/docs/07_architecture|Architecture]] · [[08_본선/03_제품/docs/08_feature-spec|Feature Spec]] · [[08_본선/03_제품/docs/09_flow|Flow]] · [[08_본선/03_제품/docs/11_change-log|Change Log]]
- [[08_본선/03_제품/docs/17_business-metrics|Business Metrics]] · [[08_본선/03_제품/docs/18_data-strategy|Data Strategy]] · [[08_본선/03_제품/docs/19_risk-impact-register|Risk Register]]
- Vision 서사(그대로 `00_vision/`에 남음): [[08_본선/03_제품/00_vision/차별성-경험레이어-서사|차별성 — 경험레이어 서사]](발표 척추 SSOT) · [[08_본선/03_제품/00_vision/나선형-성장-구조|나선형 성장 구조]] · [[08_본선/03_제품/00_vision/차별성-설정근거상향-흐름|차별성 메커니즘]]

### 02 Agent Design
- [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]]
- [[08_본선/03_제품/02_agent-design/orchestrator|오케스트레이터]]
- [[08_본선/03_제품/02_agent-design/skill-spec|스킬 명세]]

### 03 UX
- [[08_본선/03_제품/03_ux/design-system|디자인 시스템]]
- (미확정 초안 → `_archive/`) [[ia-screen-map]] · [[user-journeys]]

### 설계도 (개발 와이어프레임 빌드용 청사진 · 2026-07-04 신설)
- [[08_본선/03_제품/10_설계도/_설계도-INDEX|설계도 인덱스]] — 5종(메인 업무보드·케이스상세·에이전트 실행뷰·승인·통계추적). "설계도만 봐도 와이어프레임 제작 가능" 수준(ASCII 와이어+컴포넌트 트리+데이터 바인딩+키맵)

### 04 Tech
- [[08_본선/03_제품/04_tech/architecture|기술 아키텍처]]
- [[08_본선/03_제품/04_tech/data-model|데이터 모델]]
- [[08_본선/03_제품/04_tech/api-spec|API 명세]]
- [[08_본선/03_제품/04_tech/rag-rule-engine|RAG·규칙 엔진]]

### 05 Diagrams
- [[08_본선/03_제품/05_diagrams/00_system-context|시스템 컨텍스트]]
- [[08_본선/03_제품/05_diagrams/01_agent-flow|에이전트 흐름]]
- [[08_본선/03_제품/05_diagrams/02_case-lifecycle|케이스 생명주기]]
- [[08_본선/03_제품/05_diagrams/03_approval-gate|승인 게이트]]
- [[08_본선/03_제품/05_diagrams/04_erd|ERD]]
- [[08_본선/03_제품/05_diagrams/05_deployment-topology|배포 토폴로지(3존·Docker 분리)]]
- [[08_본선/03_제품/05_diagrams/06_llm-routing-fallback|LLM 라우팅·폴백 사다리]]
- [[08_본선/03_제품/05_diagrams/07_memory-three-layers|메모리 3계층·증류]]
- [[08_본선/03_제품/05_diagrams/08_ontology-entity-graph|온톨로지 엔티티 그래프]]
- [[08_본선/03_제품/05_diagrams/09_policy-engine-gates|Policy Engine 게이트]]
- [[08_본선/03_제품/05_diagrams/10_observability-dataflow|관측 데이터플로우]]
- [[08_본선/03_제품/05_diagrams/99_comprehensive-architecture|종합 아키텍처]]
- [[_빌드-로드맵-MOC|빌드 로드맵]]

### Rules (거버넌스 규칙 · Score3)
- [[08_본선/03_제품/rules/agent-rules|Agent Rules]] — 에이전트 행동 경계(AGT-01~25, E4 코드인용)
- [[08_본선/03_제품/rules/compliance-rules|Compliance Rules]] — 규제·PII·감사·보존(CMP, 신뢰마커 [확정]/[미검증])
- [[08_본선/03_제품/rules/data-rules|Data Rules]] — 데이터 출처·적법근거·민감등급·비식별(DAT)
- [[08_본선/03_제품/rules/import-export-rules|Import/Export Rules]] — 입출력 포맷·스키마(IOX, 감사 export 실코드 검증)
- [[08_본선/03_제품/rules/naming-rules|Naming Rules]] — 파일·ID·필드·API·이벤트 명명(NAM)
- [[08_본선/03_제품/rules/ui-rules|UI Rules]] — 플로우·상태·리스크 고지·승인 UI·접근성(UIR)

### Evals (평가 · Score3) ✅
- [[08_본선/03_제품/evals/eval-plan|Eval Plan]] · [[08_본선/03_제품/evals/rubric|Rubric]] · [[08_본선/03_제품/evals/golden-cases|Golden Cases]] · [[08_본선/03_제품/evals/failure-modes|Failure Modes]]

### Project / Meta (문서세트 잠금 — 루트)
- [[08_본선/03_제품/harness.yaml|harness.yaml]] — 문서/규칙/평가/에이전트/게이트 단일 매니페스트
- [[08_본선/03_제품/validation-report|Validation Report]] — 완료·미실행·리스크·데모/피치 준비도(정직)
- [[08_본선/03_제품/_디자이너-핸드오프|디자이너 핸드오프]]

### reports/ (2026-07-05 신설)
- [[08_본선/03_제품/reports/구현현황-JB_project2|JB_project2 구현현황]] — 코드 SSOT 실측(6진입·91뷰·40에이전트·121토큰·537컴포넌트, 실재/모의/부재)
- [[08_본선/03_제품/reports/jb-finai-scorecard|JB Fin:AI Scorecard]] — 5축 자가채점 ≈84/105

### 계열사-하네스 · 역할-하네스 (2026-07-05 개명, 번호 제거)
- [[08_본선/03_제품/08_계열사-하네스/_HARNESS-WOORICAP|우리캐피탈 하네스]] — 조직도·회사개요·업무처리기술·사이트IA·요구해결맵
- [[08_본선/03_제품/09_역할-하네스/_HARNESS-RM|RM 역할 하네스]] — 9섹션 UX 빌드 스펙

### 07_발표-제출 (제출 정본 · 손대지 않음)
- [[08_본선/03_제품/07_발표-제출/MVP제안서|MVP제안서(7섹션)]] · [[08_본선/03_제품/07_발표-제출/기능명세서|기능명세서(6파트+변경이력)]]
- [[08_본선/03_제품/07_발표-제출/demo-script|Demo Script]] · [[08_본선/03_제품/07_발표-제출/pitch-outline|Pitch]] · [[08_본선/03_제품/07_발표-제출/judge-qna|Judge Q&A]] · [[08_본선/03_제품/07_발표-제출/submission-checklist|Submission Checklist]]
- [[08_본선/03_제품/06_build-roadmap/ssd-implementation|SSD]] · **12_handoff = [[본선 HOME|HANDOFF]] 매핑**

---

### CaseOps 확장 (설계·정의 문서 — ⚠️ 미구현/분기)
> ⚠️ **아직 완전히 개발 구현에 들어온 것이 아니다.** 아래는 CaseOps 확장 개념의 **설계·정의 문서**로, GPT웹 작업 + 팀 논의로 맥락이 쌓이는 중이며 확정 전까지 `[분기/미확정]` 상태다. 확정된 것만 정본(`05_domain-model`·`07_architecture`·`02_agent-design`·`pitch`)으로 승격한다. 진입 AI/세션은 이 섹션을 **"구현 대기 설계안"**으로 취급할 것.
- [[08_본선/03_제품/01_결정-준비/casesops-분기/_INDEX|CaseOps 분기 인덱스]] — 결정 1~5 + 원문
- [[08_본선/03_제품/01_결정-준비/casesops-분기/01-메모리-거버넌스|01 메모리 거버넌스]] · [[08_본선/03_제품/01_결정-준비/casesops-분기/02-CaseOps-Engine-7알고리즘|02 CaseOps Engine·7알고리즘]] · [[08_본선/03_제품/01_결정-준비/casesops-분기/03-119-사고대응-에이전트|03 119 사고대응]]
- [[08_본선/03_제품/01_결정-준비/casesops-분기/04-은행DB연결-특화모델|04 은행DB연결·특화모델]] · [[08_본선/03_제품/01_결정-준비/casesops-분기/05-9파이프라인-아키텍처-저장소|05 9파이프라인·저장소]] · [[08_본선/03_제품/01_결정-준비/casesops-분기/06-정보체계-뷰-데이터바인딩-스펙|06 정보체계·뷰·데이터바인딩]] · [[08_본선/03_제품/01_결정-준비/casesops-분기/07-policy-engine|07 Policy Engine]]

---

## 탐색
- [[08_본선/04_증빙/02_분석자료/리서치/리서치-인덱스|리서치 인덱스]] — 개발자 진입
- [[08_본선/_MOC/_03_제품_MOC|제품 MOC]] — 역할별 탐색
