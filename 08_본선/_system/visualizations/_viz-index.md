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

> 운영 원칙: Excalidraw를 먼저 만들지 않는다. [[VISUALIZATION-PLAN]]에 목적·독자·데이터·갱신 조건을 먼저 남긴 뒤 생성한다. 담당 역할은 [[visualization]].

---

## 시각화 목록

| 파일                                                                                   | 데이터 소스                            | 시각화 내용                         | 주 독자        |
| ------------------------------------------------------------------------------------ | --------------------------------- | ------------------------------ | ----------- |
| [[08_본선/_system/visualizations/timeline\|timeline.excalidraw]]                       | 일정표, 마일스톤                         | 대회 전체 타임라인 (준비→제출→발표→심사)       | 팀 전체        |
| [[08_본선/_system/visualizations/contribution\|contribution.excalidraw]]               | `_contribution-stats.md`          | 팀원×분야 기여 히트맵 + 에이전트 기여 파이차트    | PM·팀장       |
| [[08_본선/_system/visualizations/tokens-time\|tokens-time.excalidraw]]                 | `_telemetry-log.md`               | 세션별 토큰 사용량 × 시간 추이 선그래프        | 운영·에이전트 관리자 |
| [[08_본선/_system/visualizations/agent-flow\|agent-flow.excalidraw]]                   | `_agent-registry.md`              | Orchestrator → 서브에이전트 협업 흐름도   | 심사자·팀 전체    |
| [[08_본선/_system/visualizations/jb-group-structure\|jb-group-structure.excalidraw]]   | `JB-총정리본-플랜`, D3e/D3f 결과          | JB금융지주→국내 계열사→해외 플랫폼 구조도       | 발표·보고서      |
| [[08_본선/_system/visualizations/jb-history-timeline\|jb-history-timeline.excalidraw]] | D3e/D3f 결과                        | JB 성장 변곡점 타임라인(1969→AX 원년)     | 발표·보고서      |
| [[08_본선/_system/visualizations/jb-finance-snapshot\|jb-finance-snapshot.excalidraw]] | D3e/D3f 결과, `_canon §10`          | 총자산·순익·ROE·CET1·계열사 순익 한눈 보기   | 발표·보고서      |
| [[08_본선/_system/visualizations/jb-ecosystem-fit\|jb-ecosystem-fit.excalidraw]]       | `JB-총정리본-플랜`, 리서치 갭감사             | JB 문제면 × LocalGuard OS 코어 정합 맵 | 제품정의·발표     |
| [[08_본선/_system/visualizations/urgent-action-map\|urgent-action-map.excalidraw]]     | `PROGRESS`, `_회의록-INDEX`, 리서치 갭감사 | 지금 남은 작업 우선순위와 시각화 연결도         | 팀 운영        |
| [[08_본선/_system/visualizations/project-master-timeline\|project-master-timeline.excalidraw]] | `git log`, `기능-변경이력`, 본선 로그 | 프로젝트 시작→본선 발표까지 심사기준 기반 마스터 타임라인 + 간트 동기화 마일스톤 | 발표·심사자 |
| [[08_본선/_system/visualizations/workflow-gantt-blueprint\|workflow-gantt-blueprint.excalidraw]] | `심사기준`, `PLAN`, `PROGRESS`, `기능-변경이력` | 전체 워크플로 간트차트 + 제품결정/API승격/UXUI 레인 + 담당자/AI | 발표·팀 운영 |
| [[08_본선/_system/visualizations/judge-criteria-coverage-map\|judge-criteria-coverage-map.excalidraw]] | `_체계/심사기준`, 제출 패키지 매핑 | 25개 심사 세부항목 커버리지 맵 | 발표 백업 |
| [[08_본선/_system/visualizations/finals-demo-readiness-map\|finals-demo-readiness-map.excalidraw]] | 본선 안내, 본선 준비계획 | SME 히어로 직접 시연·정적 MVP/API승격 분리·리스크 방어 맵 | 발표·리허설 |
| [[08_본선/_system/visualizations/ax-operating-system-map\|ax-operating-system-map.excalidraw]] | `_agent-registry`, `registry-*`, `tool-usage-ledger.csv` | 사람·AI·툴·산출물·거버넌스 연결 맵 | 심사자·발표 |
| [[08_본선/_system/visualizations/team-contribution-role-radar\|team-contribution-role-radar.excalidraw]] | `_team-roster`, `_contribution-stats`, `contribution-ledger.csv` | 김주용 PM·김민주 UX/UI 포함 팀원 역할·기여 %·AI Support Layer | PM·발표 |
| [[08_본선/_system/visualizations/update-control-tower\|update-control-tower.excalidraw]] | `PROGRESS`, `PLAN`, `phase-ledger.csv` | Done/In Progress/Waiting/Risk + 제품결정/API승격 리스크 추적판 | 팀 운영 |
| [[08_본선/_system/visualizations/demo-video-storyboard\|demo-video-storyboard.excalidraw]] | 시연 시나리오, 발표 스크립트 | SME 히어로 중심 시연영상 12컷 스토리보드 | 발표·영상 |
| [[08_본선/_system/visualizations/evidence-traceability-board\|evidence-traceability-board.excalidraw]] | `_canon`, D결과, 제출문서, 심사기준 | 주장→근거→산출물→심사항목 + 제품결정/API승격 추적판 | 발표 백업 |
| [[08_본선/_system/visualizations/demo-golden-path-state-machine\|demo-golden-path-state-machine.excalidraw]] | 본선 시연 시나리오, live verification | SME 히어로/피싱 보조/전세 optional 데모 상태기계 | 시연·QA |
| [[08_본선/_system/visualizations/research-to-product-funnel\|research-to-product-funnel.excalidraw]] | D1~D23, D+a/b, 갭감사, 제품정의 | 리서치→Decision Gate→제품결정→MVP/발표 전환 흐름 | 제품·발표 |

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

### jb-group-structure.excalidraw
- **소스**: [[JB-총정리본-플랜]], [[D3e-결과-gpt55xhigh]], [[D3f-결과-gpt55xhigh]]
- **형식**: 지주→국내 계열사→해외 플랫폼 구조도
- **목적**: JB를 "지역은행"이 아니라 운영 복잡도가 있는 금융그룹으로 제시

### jb-history-timeline.excalidraw
- **소스**: D3e/D3f 성장·연혁 섹션
- **형식**: 1969→2013→2014→2016→2020→2025→2026 변곡점 타임라인
- **목적**: LocalGuard OS가 AX 원년과 기업여신 AI 흐름에 맞물린다는 맥락 제시

### jb-finance-snapshot.excalidraw
- **소스**: D3e/D3f 재무표, `_canon §10`
- **형식**: 핵심 KPI 카드 + 계열사 순익 막대
- **목적**: 수억 단위 구매 여력과 도입 명분을 한 장으로 압축

### jb-ecosystem-fit.excalidraw
- **소스**: [[JB-총정리본-플랜]], [[리서치-갭감사]]
- **형식**: JB 문제면 → LocalGuard 코어 → 구매자/심사자/제품 언어 전환 맵
- **목적**: 리서치 결과를 제품 정의와 발표 펀치라인으로 연결

### urgent-action-map.excalidraw
- **소스**: [[PROGRESS]], [[_회의록-INDEX]], [[리서치-갭감사]]
- **형식**: 총정리본·제품반영·검증근거·발표운영 4레인 액션 맵
- **목적**: 지금 무엇을 해야 하는지 팀 공유용으로 정렬

### project-master-timeline.excalidraw
- **소스**: `git log`, [[기능-변경이력]], [[session-log]], [[decision-log]], [[본선 일정표]]
- **형식**: 2026-06-11 첫 커밋부터 2026-07-05 본선 발표·시연까지의 마스터 타임라인
- **목적**: 프로젝트 전 기간의 산출물·검증·심사항목 커버리지를 발표용 청사진으로 제시

### workflow-gantt-blueprint.excalidraw
- **소스**: [[심사기준]], [[PLAN]], [[PROGRESS]], [[기능-변경이력]], [[_team-roster]], [[_agent-registry]]
- **형식**: 레인별 간트차트(문제정의/JB리서치, 제품결정/범위확정, AI Agent 설계, MVP/API승격, UX/UI·브랜딩, 문서, QA, 하네스, 발표) + 사람/AI 담당자
- **목적**: 전체 협업 워크플로를 심사기준 코드·완료율·담당 사람(🧑)·AI 에이전트/모델(🤖)과 함께 추적하고 G4/G5/G6 갭감사 권고를 보드 동기화 기준으로 삼음

### judge-criteria-coverage-map.excalidraw
- **소스**: [[심사기준]], [[제출 패키지 체크리스트 + 심사 25항목 매핑]]
- **형식**: 5개 평가축 × 5개 세부항목 카드
- **목적**: 25개 세부항목을 어떤 산출물·검증·시연 증거로 커버했는지 백업 슬라이드화

### finals-demo-readiness-map.excalidraw
- **소스**: [[본선 안내]], [[본선 준비 실행 계획]]
- **형식**: SME 히어로 직접 시연, 오프라인 안정성, 산출물 정합, 리스크 방어 4분면
- **목적**: 본선 현장 시연 불가·장비·변경이력·리스크 대응 문제를 사전에 방어

### ax-operating-system-map.excalidraw
- **소스**: [[_agent-registry]], [[registry-skills]], [[registry-plugins]], [[registry-mcp]], [[registry-cli]], [[registry-integrations]], `tool-usage-ledger.csv`
- **형식**: Human Team → AI Engines → Agents → Tools → Outputs → Governance Gates
- **목적**: 우리가 AI와 도구를 운영체계처럼 사용했다는 메타 평가 자료
- **업데이트 트리거**: AI 엔진·툴·에이전트·산출물 추가

### team-contribution-role-radar.excalidraw
- **소스**: [[_team-roster]], [[_contribution-stats]], `contribution-ledger.csv`
- **형식**: 팀원 카드 + 역할 + 작업 + Human share + AI Support Layer
- **목적**: 팀원별 역할·기여 %·서포트 관계를 발표용으로 추적
- **업데이트 트리거**: 팀원 역할 확정, 작업 원장 행 추가

### update-control-tower.excalidraw
- **소스**: [[PROGRESS]], [[PLAN]], `phase-ledger.csv`
- **형식**: Done / In Progress / Waiting / Risk 4레인
- **목적**: 오늘 기준 무엇이 끝났고 무엇이 막혔는지 팀 공유
- **업데이트 트리거**: `PROGRESS.md` 체크박스 변경

### demo-video-storyboard.excalidraw
- **소스**: [[본선-시연-시나리오]], [[03-발표-시연-스크립트]]
- **형식**: 12컷 영상 제작판(컷·자막·화면요소·증빙요소)
- **목적**: 시연영상 제작 시 무엇을 녹화하고 강조할지 고정
- **업데이트 트리거**: 시연 흐름·영상 규칙·제출 조건 변경

### evidence-traceability-board.excalidraw
- **소스**: [[_canon]], 리서치 결과, 제출 문서, [[심사기준]]
- **형식**: 핵심 주장 → 근거/출처 → 보여줄 산출물 → 심사항목
- **목적**: 발표 중 강한 주장에 대한 백업 근거를 즉시 제시
- **업데이트 트리거**: 리서치·제출 문서·심사 매핑 변경

### demo-golden-path-state-machine.excalidraw
- **소스**: [[본선-시연-시나리오]], live verification
- **형식**: Input → Classify → Generate → Govern → Approve → Audit 상태기계
- **목적**: 시연이 정적 화면이 아니라 통제되는 상태 전이임을 증명
- **업데이트 트리거**: 데모 플로우·폴백 시나리오 변경

### research-to-product-funnel.excalidraw
- **소스**: D1~D23, D+a/b, [[리서치-갭감사]], 제품정의
- **형식**: 리서치 → 갭감사 → Decision Gate → 제품결정 → MVP/발표 funnel
- **목적**: 리서치가 실제 기능과 발표 문장으로 변환된 과정을 설명
- **업데이트 트리거**: 리서치 회수·제품 반영 변경

---

## 공유용 이미지 Export

공유용 PNG/SVG는 원본 Excalidraw에서 자동 추출해 아래 폴더에 보관한다. 기본 공유본은 깔끔한 차트 렌더가 아니라 Excalidraw 손그림풍으로 export한다.

- 생성기: `08_본선/_system/automation/viz-exporter.mjs`
- 최신 export: `08_본선/assets/excalidraw/exported-images/20260702/`
- 인덱스: [[08_본선/assets/excalidraw/exported-images/20260702/_export-index|Excalidraw Exported Images]]
- 우선 공유 후보: `workflow-gantt-blueprint`, `project-master-timeline`, `team-contribution-role-radar`, `research-to-product-funnel`, `evidence-traceability-board`, `demo-video-storyboard`
- 주의: PNG는 팀 공유·메신저용, SVG는 발표덱 재편집용. 발표 최종본은 Obsidian/Excalidraw 네이티브 export와 비교 QA한다.

## 자동 생성

생성기: `_system/automation/viz-generator.mjs`, 마지막 생성: 2026-07-02
재생성: `node 08_본선/_system/automation/viz-generator.mjs` (데이터 변경 시마다)
이미지 export: `node 08_본선/_system/automation/viz-exporter.mjs`

기획 문서: [[VISUALIZATION-PLAN]]
담당 역할: [[visualization]]

## 감사·개선 문서

- [[workflow-gantt-flow-gap-audit]] — `workflow-gantt-blueprint`가 실제 PLAN/PROGRESS/제품/시연 문서와 맞는지 점검한 갭 감사.

---

## 편집 방법

1. Obsidian에서 `.excalidraw` 파일 클릭 → Excalidraw 뷰로 자동 열림
2. 또는 파일 내용을 복사하여 [excalidraw.com](https://excalidraw.com) 에서 편집 후 붙여넣기

---

## 연결

- [[_HARNESS-SYSTEM|하네스 시스템]]
- [[08_본선/_system/telemetry/_telemetry-log|텔레메트리 로그]]
- [[08_본선/_system/team/_contribution-stats|기여 통계]]
