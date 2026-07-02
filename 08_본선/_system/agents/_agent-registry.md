---
tags:
  - area/system
  - type/registry
  - status/active
date: 2026-06-27
up: "[[_HARNESS-SYSTEM]]"
aliases:
  - 에이전트레지스트리
  - agent-registry
---
# 에이전트 레지스트리

> 대외비 — 6/29 공식발표 전 비공개.

이 파일은 이번 대회에서 운영된 모든 AI 에이전트의 정의·역할·기여를 추적한다. 협업 계약은 [[AGENTS]] 링크 참조.

---

## 에이전트 레지스트리 표

| 에이전트명 | 역할 | 모델 | 누적 토큰 | 주요 산출물 | 상태 |
|----------|------|------|----------|-----------|------|
| **Orchestrator** | 메인 오케스트레이터 — 전체 세션 조율·메모리 관리·서브에이전트 발행 | Claude Opus (Opus 4.5) | — | 하네스 시스템, 전략 문서 전체 | 활성 |
| **대회개요 탐색** | 대회 공지·심사기준·일정 탐색 및 정리 | claude-sonnet-4-6 (Sonnet) | 53,087 | 대회 개요 문서 | 완료 |
| **원천 인벤토리** | 기존 파일·자료 목록화 및 분류 | claude-haiku-4-5 (Haiku) | 25,518 | 원천 인벤토리 파일 | 완료 |
| **대회 정본작성** | 기능명세서·제출 문서 정본 작성 | claude-haiku-4-5 (Haiku) | 64,639 | 기능명세서 v1 | 완료 |
| **MVP 점검** | 현 MVP 코드·UI·갭 점검 및 분석 | claude-sonnet-4-6 (Sonnet) | 155,583 | MVP 갭분석 리포트 | 완료 |
| **발표덱 아웃라인** | 본선 발표 구조 설계 및 아웃라인 작성 | claude-sonnet-4-6 (Sonnet) | 71,170 | 발표덱 아웃라인 v1 | 완료 |
| **시연 시나리오** | 데모 시연 흐름·스크립트 작성 | claude-sonnet-4-6 (Sonnet) | 82,912 | 시연 시나리오 v1 | 완료 |
| **구조 청사진** | 시스템 아키텍처·컴포넌트 설계 문서 작성 | claude-sonnet-4-6 (Sonnet) | 71,470 | 시스템 아키텍처 청사진 | 완료 |
| **paperclip 분석** | paperclip 레퍼런스 역엔지니어링 분석 | claude-sonnet-4-6 (Sonnet) | 74,125 | paperclip 패턴 분석 문서 | 완료 |
| **스캐폴드 빌더** | 볼트 폴더 구조·초기 파일 생성 | claude-sonnet-4-6 (Sonnet) | 78,428 | 볼트 스캐폴드 | 완료 |
| **visualization** | 시각화 기획 선행·Excalidraw 자동생성·업그레이드 사이클·데이터 품질 관리 | Sonnet/Codex | estimate | VISUALIZATION-PLAN, visualization-cycle, Excalidraw 보드 | 활성 |

---

## 역할 로스터 변경 (2026-07-02 · 앱 설계·구축 진입)

> 역할 페르소나 SSOT = `roles/*.md`. 앱 설계 단계 진입에 맞춰 셋업(사용자 승인).

- **[[architect]] 신설 ★** — product(무엇을)와 builder(구현) 사이 **기술 아키텍처 리드**(데이터모델·에이전트 런타임·로컬모델·API 계약·PII 아키텍처·배포). 로스터 공백 보강.
- **[[data-engineer]] 후보→활성 승격** — 공공데이터·API·RAG·데이터모델. 트리거(서버 API 착수) 충족.
- **[[designer]]·[[compliance-risk]] 앱 설계 단계 배정** — designer=JB 디자인시스템(토큰 확보)·조직도 메인UI·IA / compliance-risk=PII 비반출을 설계 첫날부터.
- 남은 후보: pitch-storyteller·red-team-judge·security(트리거 대기).

---

## 누적 집계

| 항목 | 값 |
|------|----|
| 등록 에이전트 수 | 11 (Orchestrator 포함) |
| 서브에이전트 수 | 10 |
| 총 누적 토큰 | 676,932+ |
| 활성 에이전트 | 2 (Orchestrator, visualization) |
| 완료 에이전트 | 9 |

---

## 에이전트 협업 흐름

```
Orchestrator (Opus)
├── 리서치 계열: 대회개요탐색, 원천인벤토리, paperclip분석
├── 문서 계열: 대회정본작성, 발표덱아웃라인, 시연시나리오
├── 개발 계열: MVP점검, 구조청사진
└── 운영 계열: 스캐폴드빌더, visualization, [이 세션]
```

시각화: [[08_본선/_system/visualizations/agent-flow|에이전트 흐름 다이어그램]]

---

## 연결

- [[AGENTS|협업 계약 (AGENTS.md)]]
- [[_HARNESS-SYSTEM|하네스 시스템]]
- [[08_본선/_system/telemetry/_telemetry-log|텔레메트리 로그]]
- [[08_본선/_system/team/_contribution-stats|기여 통계]]
- [[08_본선/_system/visualizations/VISUALIZATION-PLAN|시각화 기획안]]
- [[08_본선/_system/skills/visualization-cycle/SKILL|시각화 사이클 스킬]]

<!-- AGGREGATOR:AGENT-STATS -->
## AI 사용 통계 (자동 집계)

| 에이전트 | 세션 수 | 입력 토큰 | 출력 토큰 |
|---------|--------|---------|---------|
| direct | 8 | 44,016,059 | 11,532,959 |
| via-claude | 3 | 0 | 0 |
| orchestrator | 2 | 50,000 | 570,000 |
| gpt-5.3-codex-spark | 1 | 0 | 0 |
| gpt-5.5-xhigh | 1 | 0 | 0 |
<!-- /AGGREGATOR:AGENT-STATS -->
