---
tags:
  - area/system
  - type/audit
  - status/active
date: 2026-07-01
up: "[[VISUALIZATION-PLAN]]"
aliases:
  - 간트플로우갭감사
  - workflow-gantt-gap-audit
---
# workflow-gantt-flow-gap-audit

> 목적: `workflow-gantt-blueprint.excalidraw`가 실제 계획·제품·시연 문서의 플로우와 맞는지 점검한다. 이 문서는 다음 간트/스토리보드/제출 체크리스트 갱신의 근거 파일이다.

## 결론

현재 간트의 큰 흐름은 실제 계획과 대체로 맞다.

- [[PLAN]]의 4대 워크스트림(운영 하네스, 제품 재설계, 발표·시연, 증빙·기록)은 간트의 8개 레인으로 잘 풀려 있다.
- 김민주 역할을 `UX/UI·브랜딩·시연 화면` 별도 레인으로 둔 것은 [[PROGRESS]]의 제품 미완료 항목과 직접 연결되므로 타당하다.
- 시연 중심을 `SME(JBG-104)`로 둔 것도 [[본선-시연-시나리오]]의 히어로 시나리오와 일치한다.

다만 세부 문서 중 일부가 구버전 또는 `작성 예정` 상태라, 간트가 실제보다 확정적으로 보일 수 있다. 특히 `submission-checklist`와 `live-final-verification`은 전세 중심 구버전이고, PRD/UX 문서는 아직 씨앗 수준이다.

## 읽은 문서

| 문서 | 확인한 내용 | 상태 |
|---|---|---|
| [[PLAN]] | 목표, 마일스톤, 4대 워크스트림 | top-level 정합 |
| [[PROGRESS]] | 제품 재설계 미완료 항목, 발표·시연 상태, 리서치 상태 | 최신 운영 상태 |
| [[VISUALIZATION-PLAN]] | 간트 목적, 데이터 소스, 갱신 조건 | 최신 시각화 계획 |
| `phase-ledger.csv` | 단계별 완료율 추정 | 간트 완료율 근거 |
| [[06_prd]] | 제품 개요, 핵심 사용자, 기능 요구사항 | draft/stub |
| [[06_mvp-scope]] | P0 기능, 본선 시연 최소 범위 | draft/stub |
| [[scope-board]] | In/Out scope | 전세사기 중심 항목 포함 |
| [[design-system]] | JB 웹 차용, 다크 콘솔, 상태칩, 컴포넌트 씨앗 | draft/stub |
| [[ia-screen-map]] | 조직도/3열 쉘/5컬럼 칸반/화면 목록 | draft/stub |
| [[user-journeys]] | RM 여정과 승인 게이트 씨앗 | draft/stub |
| [[agent-roster]] | 14종 에이전트, 조직도, 승인 게이트 | draft/stub |
| [[orchestrator]] | Case→AgentRun→승인→Audit 흐름 | draft/stub |
| [[08_본선/03_제품/07_발표-제출/submission-checklist\|submission-checklist]] | 제출 전 체크리스트 | 일부 구버전 |
| [[live-final-verification]] | 최종 검증 항목 | 전세 중심 구버전 |
| [[본선-시연-시나리오]] | SME 히어로, 피싱 보조, 전세 제외/잔여시간 언급 | 현재 시연 SSOT |
| [[function-spec]] | 운영 계약, 3개 골든패스, 기능 명세 | 제출 기준 정본 |
| [[기능-변경이력]] | 실제 구현 출발점과 예선 이후 계획 | git 근거 |
| [[제품정의-캔버스]] | 11블록/심사기준 매핑 | 회의 확정 미기입 |
| [[risk-register]] | 시연 장애, MVP 지연 등 리스크 | 상세 대응 미작성 |
| [[bet-memo]] | 라이브 시연 올인, 승인 게이트 차별화 | 간트 방향과 일치 |

## 정합한 부분

| 간트 레인 | 실제 문서 근거 | 판단 |
|---|---|---|
| 문제정의/JB 리서치 | [[PROGRESS]] 리서치 1차 사이클, D1~D19, D+a/b | 정합 |
| AI Agent 설계 | [[function-spec]] 운영 계약, [[agent-roster]], [[orchestrator]] | 정합이나 세부는 draft |
| MVP 구현/고도화 | [[function-spec]], [[기능-변경이력]], [[06_mvp-scope]] | 정합 |
| UX/UI·브랜딩·시연 화면 | [[PROGRESS]]의 IA·화면 지도, 디자인 시스템, 조직도 메인 UI, JB 웹 디자인 | 별도 트랙 필요 |
| 문서/기능명세/변경이력 | [[function-spec]], [[기능-변경이력]], [[08_본선/03_제품/07_발표-제출/submission-checklist\|submission-checklist]] | 정합 |
| QA/검증/시연 안정화 | [[08_본선/03_제품/07_발표-제출/submission-checklist\|submission-checklist]], [[live-final-verification]], [[risk-register]] | 정합이나 체크리스트 갱신 필요 |
| 운영 하네스/AI 협업 증빙 | [[PLAN]], [[PROGRESS]], [[VISUALIZATION-PLAN]] | 정합 |
| 발표/시연/리허설 | [[본선-시연-시나리오]], [[bet-memo]] | 정합 |

## 갭 목록

| ID | 갭 | 근거 | 영향 | 권고 |
|---|---|---|---|---|
| G1 | `submission-checklist`는 전세사기 E2E를 핵심 시나리오로 둠 | [[08_본선/03_제품/07_발표-제출/submission-checklist\|submission-checklist]] | 현재 시연 SSOT와 충돌 | SME E2E를 기본, 피싱 보조, 전세 optional로 수정 |
| G2 | `live-final-verification`은 전세사기 위험 탐지만 검증 | [[live-final-verification]] | 리허설 체크가 히어로 시연을 검증하지 못함 | SME(JBG-104) 검증을 메인으로 재작성 |
| G3 | PRD/MVP/UX 문서가 `작성 예정` 상태 | [[06_prd]], [[06_mvp-scope]], [[design-system]], [[ia-screen-map]], [[user-journeys]] | 간트가 실제보다 확정적으로 보일 수 있음 | 간트의 UX/UI·제품 레인에는 `estimate/planned` 표시 유지 |
| G4 | 제품 의사결정 레인이 간트에 약함 | [[PROGRESS]]의 은행 선택·배포vs로컬·DB 범위 확정 | 구현/발표 논리의 선행 결정이 묻힘 | `제품 결정/범위 확정` 마커를 간트 또는 update-control-tower에 추가 |
| G5 | 백엔드 실연동은 문서상 미착수인데 간트에는 MVP 고도화 내부에 섞임 | [[PROGRESS]], [[기능-변경이력]] | 구현 리스크가 덜 보임 | `정적 MVP→백엔드/API 승격`을 별도 작업 바로 표시 |
| G6 | 리서치→제품 반영이 아직 미완료 | [[PROGRESS]], [[research-to-product-funnel]] | 딥리서치 성과가 제품 기능에 연결됐다는 증거 약함 | funnel 보드와 간트에 `리서치 흡수→제품 결정` 체크포인트 추가 |
| G7 | 리스크 대응 상세가 비어 있음 | [[risk-register]] | 시연 실패 대비 근거 부족 | 폴백 영상/로컬 구동/브라우저 대체 절차를 risk-register에 반영 |

## 간트 수정 권고

다음 시각화 업그레이드 때 `workflow-gantt-blueprint`에 반영할 권고:

1. `제품 결정/범위 확정` 마커 추가
   - 은행 전북/광주 택1
   - 배포 vs 로컬
   - DB 범위
   - 히어로 시나리오 SME 확정
2. `정적 MVP→백엔드/API 승격` 바 추가
   - 지금은 `MVP 구현/고도화`에 묻혀 있음
   - 실제 리스크가 높으므로 노출 필요
3. `UX/UI·브랜딩·시연 화면` 레인은 유지
   - 단, 완료율은 `45% estimate` 또는 `planned/in_progress`로 보수 표기
4. `QA/검증` 레인에 SME 중심 E2E 리허설을 명시
   - `전세사기 E2E`가 아니라 `SME JBG-104 → 피싱 보조 → 전세 optional`
5. `리서치 흡수→제품 결정` 체크포인트 추가
   - D3e/D3f, D16~D19, D20~D22 결과가 제품 기능/발표 문장으로 들어갔는지 추적

## 문서 수정 권고

| 우선순위 | 문서 | 수정 내용 |
|---|---|---|
| P0 | [[08_본선/03_제품/07_발표-제출/submission-checklist\|submission-checklist]] | 제품 MVP 검증 항목을 SME 히어로 기준으로 갱신 |
| P0 | [[live-final-verification]] | 최종 검증 시나리오를 SME 중심으로 재작성 |
| P1 | [[06_mvp-scope]] | P0 기능 상태를 `작성 예정`에서 실제 시연 기준으로 갱신 |
| P1 | [[design-system]] | 김민주 UX/UI 오너 트랙과 JB 톤앤매너 작업 항목 반영 |
| P1 | [[ia-screen-map]] | 조직도 메인 UI, 케이스 상세, 승인, 거버넌스 패널을 확정 화면으로 승격 |
| P1 | [[risk-register]] | 로컬 서버/브라우저/폴백 영상/포트 충돌 대응 상세화 |

## 다음 액션

- 이 감사 결과를 기준으로 [[08_본선/03_제품/07_발표-제출/submission-checklist|submission-checklist]]와 `live-final-verification`을 먼저 갱신한다.
- 그 다음 `workflow-gantt-blueprint`에는 `제품 결정/범위 확정`, `백엔드/API 승격`, `SME E2E 리허설`을 추가한다.
- 시각화 수정 전에는 [[VISUALIZATION-PLAN]]을 먼저 갱신하고 [[visualization-cycle]]을 실행한다.

## 연결

- [[VISUALIZATION-PLAN]]
- [[_viz-index]]
- [[workflow-gantt-blueprint]]
- [[update-control-tower]]
- [[demo-video-storyboard]]
