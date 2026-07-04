---
tags:
  - area/product
  - type/moc
  - status/active
date: 2026-06-26
up: "[[_03_제품_MOC]]"
---

# 제품 문서 인덱스

> `03_제품/` 하위 전체 문서 목록. [[08_본선/_MOC/_03_제품_MOC|제품 MOC]]의 상세 버전.

---

## 전체 문서 목록

### 00 Vision
- [[08_본선/03_제품/00_vision/core-bet|Core Bet]] — 핵심 베팅
- [[08_본선/03_제품/00_vision/차별성-경험레이어-서사|차별성 — 경험레이어 서사]] — 발표 척추(SSOT)
- [[08_본선/03_제품/00_vision/business-model|Business Model (DDBM)]] — 데이터 기반 비즈니스 모델 11블록
- [[08_본선/03_제품/00_vision/definitions|Definitions]] — 정식 용어(8종)+명명규칙
- [[08_본선/03_제품/00_vision/principles|Principles]] — 제품 원칙(6)+거부규칙(5)

### 01 PRD
- [[08_본선/03_제품/01_prd/prd|PRD]] — 제품 요구사항
- [[08_본선/03_제품/01_prd/mvp-scope|MVP Scope]] — 최소 기능 범위

### 02 Agent Design
- [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]]
- [[08_본선/03_제품/02_agent-design/orchestrator|오케스트레이터]]
- [[08_본선/03_제품/02_agent-design/skill-spec|스킬 명세]]

### 03 UX
- [[08_본선/03_제품/03_ux/design-system|디자인 시스템]]
- (미확정 초안 → `_archive/`) [[ia-screen-map]] · [[user-journeys]]

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

### Project / Meta (문서세트 잠금)
- [[08_본선/03_제품/harness.yaml|harness.yaml]] — 문서/규칙/평가/에이전트/게이트 단일 매니페스트
- [[08_본선/03_제품/validation-report|Validation Report]] — 완료·미실행·리스크·데모/피치 준비도(정직)
- [[08_본선/03_제품/jb-finai-scorecard|JB Fin:AI Scorecard]] — 5축 자가채점 ≈84/105
- [[08_본선/03_제품/README|제품 README]] — 실행법·기술스택 · **12_handoff = [[본선 HOME|HANDOFF]] 매핑**
- [[08_본선/03_제품/00_source-log|Source Log]] · [[08_본선/03_제품/11_change-log|Change Log]]

### 신규 제품 문서 (루트·발표제출)
- **제출 정본**: [[08_본선/03_제품/07_발표-제출/MVP제안서|MVP제안서(7섹션)]] · [[08_본선/03_제품/07_발표-제출/기능명세서|기능명세서(6파트+변경이력)]] · [[08_본선/03_제품/00_vision/나선형-성장-구조|나선형 성장 구조]] · [[08_본선/03_제품/00_결정-준비/casesops-분기/07-policy-engine|Policy Engine]]
- [[08_본선/03_제품/05_domain-model|Domain Model]] · [[08_본선/03_제품/07_architecture|Architecture]] · [[08_본선/03_제품/08_feature-spec|Feature Spec]] · [[08_본선/03_제품/09_flow|Flow]]
- 발표·제출: [[08_본선/03_제품/07_발표-제출/demo-script|Demo Script]] · [[08_본선/03_제품/07_발표-제출/pitch-outline|Pitch]] · [[08_본선/03_제품/07_발표-제출/judge-qna|Judge Q&A]] · [[08_본선/03_제품/07_발표-제출/submission-checklist|Submission Checklist]] · [[08_본선/03_제품/06_build-roadmap/ssd-implementation|SSD]]
- Vision 추가: [[08_본선/03_제품/00_vision/business-metrics|Business Metrics]] · [[08_본선/03_제품/00_vision/data-strategy|Data Strategy]] · [[08_본선/03_제품/00_vision/risk-impact-register|Risk Register]] · [[08_본선/03_제품/00_vision/차별성-설정근거상향-흐름|차별성 메커니즘]]

---

### CaseOps 확장 (설계·정의 문서 — ⚠️ 미구현/분기)
> ⚠️ **아직 완전히 개발 구현에 들어온 것이 아니다.** 아래는 CaseOps 확장 개념의 **설계·정의 문서**로, GPT웹 작업 + 팀 논의로 맥락이 쌓이는 중이며 확정 전까지 `[분기/미확정]` 상태다. 확정된 것만 정본(`05_domain-model`·`07_architecture`·`02_agent-design`·`pitch`)으로 승격한다. 진입 AI/세션은 이 섹션을 **"구현 대기 설계안"**으로 취급할 것.
- [[08_본선/03_제품/00_결정-준비/casesops-분기/_INDEX|CaseOps 분기 인덱스]] — 결정 1~5 + 원문
- [[08_본선/03_제품/00_결정-준비/casesops-분기/01-메모리-거버넌스|01 메모리 거버넌스]] · [[08_본선/03_제품/00_결정-준비/casesops-분기/02-CaseOps-Engine-7알고리즘|02 CaseOps Engine·7알고리즘]] · [[08_본선/03_제품/00_결정-준비/casesops-분기/03-119-사고대응-에이전트|03 119 사고대응]]
- [[08_본선/03_제품/00_결정-준비/casesops-분기/04-은행DB연결-특화모델|04 은행DB연결·특화모델]] · [[08_본선/03_제품/00_결정-준비/casesops-분기/05-9파이프라인-아키텍처-저장소|05 9파이프라인·저장소]] · [[08_본선/03_제품/00_결정-준비/casesops-분기/06-정보체계-뷰-데이터바인딩-스펙|06 정보체계·뷰·데이터바인딩]]

## 개발 폴더
- `app/` — 제품 소스코드
- `tests/` — 테스트 코드

---

## 탐색
- [[08_본선/03_제품/README|제품 README]] — 개발자 진입
- [[08_본선/_MOC/_03_제품_MOC|제품 MOC]] — 역할별 탐색
