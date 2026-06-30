---
tags:
  - area/system
  - type/index
  - status/active
date: 2026-06-27
up: "[[_HARNESS-SYSTEM]]"
aliases:
  - 시각화인덱스
  - viz-index
---
# 시각화 인덱스

> 대외비 — 6/29 공식발표 전 비공개.

이 폴더는 텔레메트리·기여도·타임라인·에이전트 흐름을 Excalidraw 다이어그램으로 시각화한다. 모든 `.excalidraw` 파일은 Obsidian Excalidraw 플러그인 또는 excalidraw.com 에서 편집 가능.

---

## 시각화 목록

| 파일 | 데이터 소스 | 시각화 내용 | 주 독자 |
|------|-----------|-----------|--------|
| [[08_본선/_system/visualizations/timeline\|timeline.excalidraw]] | 일정표, 마일스톤 | 대회 전체 타임라인 (준비→제출→발표→심사) | 팀 전체 |
| [[08_본선/_system/visualizations/contribution\|contribution.excalidraw]] | `_contribution-stats.md` | 팀원×분야 기여 히트맵 + 에이전트 기여 파이차트 | PM·팀장 |
| [[08_본선/_system/visualizations/tokens-time\|tokens-time.excalidraw]] | `_telemetry-log.md` | 세션별 토큰 사용량 × 시간 추이 선그래프 | 운영·에이전트 관리자 |
| [[08_본선/_system/visualizations/agent-flow\|agent-flow.excalidraw]] | `_agent-registry.md` | Orchestrator → 서브에이전트 협업 흐름도 | 심사자·팀 전체 |

---

## 각 다이어그램 데이터 스펙

### timeline.excalidraw
- **소스**: `01_대회정보/일정표`, `08_본선/_system/telemetry/_telemetry-log.md`
- **X축**: 날짜 (2026-06-26 ~ 2026-07-05)
- **Y축**: 작업 레인 (리서치 / 개발 / 문서 / 발표 / 운영)
- **마커**: 마일스톤(MVP 완성, 제출, 발표 D-day) + 체크포인트

### contribution.excalidraw
- **소스**: `_contribution-stats.md` 팀원×분야 표
- **형식 1**: 팀원 × 분야 히트맵 (6×4 셀, 밀도 = 기여 항목 수)
- **형식 2**: AI 에이전트 기여 파이 (토큰 비중)
- **갱신 주기**: 작업 단위 완료 시

### tokens-time.excalidraw
- **소스**: `_telemetry-log.md` 토큰 합계 컬럼
- **X축**: 날짜·세션 순서
- **Y축**: 토큰 합계 (단위: K)
- **보조**: 소요시간 바 차트 (이중 축)
- **목적**: 에이전트 리소스 효율 시각화 (심사 평가 자료)

### agent-flow.excalidraw
- **소스**: `_agent-registry.md` 에이전트 협업 흐름 섹션
- **형식**: 트리 다이어그램 (Orchestrator 루트 → 9개 서브에이전트)
- **레이블**: 에이전트명, 모델, 주요 산출물
- **목적**: 멀티에이전트 협업 구조 심사 제시

---

## 자동 생성

생성기: `_system/automation/viz-generator.mjs`, 마지막 생성: 2026-06-29
재생성: `node 08_본선/_system/automation/viz-generator.mjs` (데이터 변경 시마다)

---

## 편집 방법

1. Obsidian에서 `.excalidraw` 파일 클릭 → Excalidraw 뷰로 자동 열림
2. 또는 파일 내용을 복사하여 [excalidraw.com](https://excalidraw.com) 에서 편집 후 붙여넣기

---

## 연결

- [[_HARNESS-SYSTEM|하네스 시스템]]
- [[08_본선/_system/telemetry/_telemetry-log|텔레메트리 로그]]
- [[08_본선/_system/team/_contribution-stats|기여 통계]]
