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
- [[08_본선/03_제품/03_ux/ia-screen-map|IA·화면 맵]]
- [[08_본선/03_제품/03_ux/user-journeys|사용자 여정]]
- [[08_본선/03_제품/03_ux/design-system|디자인 시스템]]

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

### Evals (평가 · 예정)
- `evals/` — rubric·golden-cases·failure-modes (7/4 팀 데모케이스 확정 후)

---

## 개발 폴더
- `app/` — 제품 소스코드
- `tests/` — 테스트 코드

---

## 탐색
- [[08_본선/03_제품/README|제품 README]] — 개발자 진입
- [[08_본선/_MOC/_03_제품_MOC|제품 MOC]] — 역할별 탐색
