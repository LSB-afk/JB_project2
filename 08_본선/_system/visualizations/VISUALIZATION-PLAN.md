---
tags:
  - area/system
  - type/plan
  - status/active
date: 2026-07-01
up: "[[_viz-index]]"
aliases:
  - 시각화기획안
  - visualization-plan
---
# VISUALIZATION PLAN

> Excalidraw를 바로 만들지 않는다. 이 문서에 목적·독자·데이터·갱신 조건을 먼저 남긴 뒤 시각화한다.

## 운영 원칙

1. **Plan first**: 새 보드나 큰 변경은 이 문서에 먼저 등록한다.
2. **Source-bound**: 모든 숫자·역할·완료율은 원장, 로그, 문서 경로를 가진다.
3. **Estimate visible**: 추정값은 `estimate`, 미확정 인물·역할은 `TBD`로 표시한다.
4. **Human + AI layer**: 사람 기여와 AI 지원은 경쟁시키지 않고 분리해 보여준다.
5. **Upgrade loop**: 문서·원장·로그가 바뀌면 영향받는 보드만 [[visualization-cycle]]로 재생성한다.
6. **Presentation ready**: 발표용 보드는 5초 안에 핵심 메시지가 보여야 한다.
7. **Audit absorbed**: `workflow-gap-audit`와 `visual-brief-audit`은 별도 신규 스킬이 아니라 [[visualization-cycle]] 검증 단계에서 우선 흡수한다.

## 갱신 사이클

| 단계 | 작업 | 산출물 |
|---|---|---|
| Plan | 보드 목적·독자·데이터·완료 기준 등록 | 이 문서 |
| Source | 원장·로그·문서 변경 확인 | CSV, Markdown, git log |
| Generate | `viz-generator.mjs` 실행 | `.excalidraw` |
| Validate | JSON parse, 링크 존재, 출처 확인, 간트-문서 갭 확인 | 검증 로그 |
| Review | 발표 문장·5초 가독성·추정값·사람/AI/기여 레이어 확인 | 수정 요청 |
| Export | `viz-exporter.mjs` 실행 | 공유용 `.png` + `.svg` |
| Upgrade | 영향받는 보드만 재생성 | 최신 보드 |

## 간트 동기화 묶음

`workflow-gantt-blueprint.excalidraw`가 바뀌면 아래 보드는 같은 기준으로 함께 검토한다.

| 간트 변경 축 | 같이 봐야 할 보드 | 동기화 기준 |
|---|---|---|
| 제품 결정/범위 확정(G4) | `update-control-tower`, `evidence-traceability-board`, `research-to-product-funnel`, `judge-criteria-coverage-map` | 은행·로컬·DB 범위, SME 히어로, 조직도 UX가 같은 문구로 보임 |
| 정적 MVP→백엔드/API 승격(G5) | `finals-demo-readiness-map`, `demo-golden-path-state-machine`, `demo-video-storyboard`, `evidence-traceability-board` | 현 MVP 상태와 API 승격 계획을 섞지 않고 분리 표시 |
| 리서치 흡수→제품 결정(G6) | `research-to-product-funnel`, `project-master-timeline`, `urgent-action-map` | D시리즈 리서치가 제품 결정·발표 문장·시연 근거로 내려온 흐름이 보임 |
| 담당자/AI/기여율 변경 | `team-contribution-role-radar`, `ax-operating-system-map` | 사람(🧑), AI(🤖), main/support, contribution %가 간트와 충돌하지 않음 |

## 보드 기획 목록

| 보드 | 목적 | 독자 | 데이터 소스 | 업데이트 트리거 | 완료 기준 |
|---|---|---|---|---|---|
| `project-master-timeline.excalidraw` | 프로젝트 시작부터 본선까지의 요일 포함 마스터 타임라인. 간트 변경·보드 동기화 마일스톤을 표시 | 발표·심사자 | `git log`, [[기능-변경이력]], [[PROGRESS]] | 일정·마일스톤 변경 | 날짜·요일·본선 D-day·심사항목·보드 동기화가 보임 |
| `workflow-gantt-blueprint.excalidraw` | 전체 워크플로와 단계별 완료율·담당 사람·AI 에이전트를 간트차트로 추적. UX/UI·브랜딩 레인은 김민주 역할이 별도 트랙으로 보이게 한다 | 팀 운영·발표 | [[PLAN]], [[PROGRESS]], `phase-ledger.csv`, `_team-roster`, `_agent-registry` | 체크박스·단계 완료율·역할 변경 | 레인별 완료율, 사람 담당자(🧑), AI 담당 에이전트/모델(🤖), 김민주 UX/UI 오너십이 보임 |
| `ax-operating-system-map.excalidraw` | 사람·AI·툴·산출물·거버넌스가 연결된 AX 운영체계를 증명 | 심사자·팀 | `_tools-index`, `registry-*`, `_agent-registry`, `ai-session-intake.csv` | 도구·AI·에이전트 추가 | 전체 사용 툴 계층과 게이트가 한 장에 보임 |
| `team-contribution-role-radar.excalidraw` | 팀원 역할, 작업, 서포트, 프로젝트 기여 %를 표시. 김주용 PM·문서·툴관리, 김민주 UX/UI·발표 비주얼을 명시 | PM·발표 | `_team-roster`, `_contribution-stats`, `contribution-ledger.csv` | 팀원 역할·작업 원장 변경 | 사람별 기여율과 AI 지원층이 분리 표시됨 |
| `update-control-tower.excalidraw` | 지금 어디까지 왔고 무엇이 막혔는지 추적. 간트 G4/G5/G6 리스크를 함께 표시 | 팀 운영 | [[PROGRESS]], [[PLAN]], `phase-ledger.csv` | PROGRESS 변경·간트 변경 | Done/In Progress/Waiting/Risk와 제품결정·API승격 리스크가 보임 |
| `demo-video-storyboard.excalidraw` | 시연영상 제작용 12컷 스토리보드 | 발표·영상 제작 | [[본선-시연-시나리오]], [[03-발표-시연-스크립트]] | 시연 흐름·영상 규칙 변경 | 컷·자막·화면요소·증빙요소가 있음 |
| `evidence-traceability-board.excalidraw` | 핵심 주장→근거→산출물→심사항목 연결. 제품 결정·API 승격 근거도 포함 | 발표 백업 | `_canon`, D결과, 제출 문서, 심사기준 | 리서치·제출 문서 변경·간트 변경 | 주장마다 출처와 심사항목이 연결되고 G4/G5 근거가 보임 |
| `demo-golden-path-state-machine.excalidraw` | SME/전세/피싱 데모를 상태기계로 표현 | 시연·QA | 앱 데모 시나리오, live verification | 데모 플로우 변경 | 입력→판단→승인→감사→폴백 흐름이 보임 |
| `research-to-product-funnel.excalidraw` | 딥리서치가 제품 결정으로 내려온 흐름 제시. Decision Gate를 간트와 맞춤 | 제품·발표 | D1~D23, D+a/b, 갭감사, 제품정의 | 리서치 회수·제품 반영 변경·간트 변경 | 리서치 묶음→Decision Gate→제품결정→MVP/발표가 이어짐 |

## 공통 메타 박스

모든 신규 보드는 우하단에 아래 정보를 표시한다.

```text
Source:
Last generated:
Data quality:
Next update trigger:
Owner:
```

## 공유용 이미지 Export

| 항목 | 기준 |
|---|---|
| 생성 명령 | `node 08_본선/_system/automation/viz-exporter.mjs` |
| 저장 위치 | `08_본선/assets/excalidraw/exported-images/YYYYMMDD/` |
| 출력 형식 | Excalidraw 손그림풍 PNG(팀 공유·메신저용), SVG(덱·문서 재편집용) |
| 인덱스 | `_export-index.md`에 공유 우선 후보와 전체 파일 목록 기록 |
| 우선 공유 후보 | `workflow-gantt-blueprint`, `project-master-timeline`, `team-contribution-role-radar`, `research-to-product-funnel`, `evidence-traceability-board`, `demo-video-storyboard` |
| 주의 | 기본 export는 손그림풍. 발표 최종본은 Obsidian/Excalidraw 네이티브 export와 비교 QA |

## 데이터 품질 표기

| 표기 | 의미 | 예시 |
|---|---|---|
| `exact` | 로그·원장·공식 문서에서 직접 산출 | 날짜, git author, CSV usage count |
| `estimate` | 사람이 가중치 또는 해석을 넣은 값 | 기여 %, 단계별 중요도 |
| `TBD` | 팀 확정 전 또는 원장 미기입 | 팀원 실명, 역할 확정 |
| `mixed` | exact와 estimate가 함께 있음 | 발표용 종합 보드 |

## 다음 업데이트 조건

- `PROGRESS.md` 체크박스 변경
- `contribution-ledger.csv` 행 추가
- `phase-ledger.csv` 완료율 변경
- `tool-usage-ledger.csv` 행 추가
- `_agent-registry.md` 모델·토큰·에이전트 변경
- 시연 스크립트 또는 발표덱 구조 변경
- [[workflow-gantt-flow-gap-audit]]의 P0/P1 권고 반영
- "있어빌리티", 발표용 가독성, 담당자·AI·기여율 표시 개선 피드백

## 연결

- [[_viz-index]]
- [[visualization]]
- [[visualization-cycle]]
- [[_agent-registry]]
- [[_contribution-stats]]
- [[workflow-gantt-flow-gap-audit]]
