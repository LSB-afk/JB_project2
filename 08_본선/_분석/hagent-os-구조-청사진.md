---
tags:
  - area/system
  - type/reference
  - status/active
date: 2026-06-26
up: "[[_03_제품_MOC]]"
aliases:
  - 청사진
  - hagent-os분석
---
# hagent-os 구조 청사진 — 본선 작업공간 설계 참조

> 분석 대상: `/Users/river/workspace/active/hagent-os/2026 제1회 KEG 바이브코딩 콘테스트/`
> 결과: 506팀 중 **1등** (상금 300만원). 이 구조를 본선 공간 설계의 기준점으로 삼는다.
> 작성: 2026-06-26

---

## 1. hagent-os가 잘한 점

### 1-1. 폴더 택소노미 — 번호 접두사 + 역할 분리

```
01_대회정보/   — 불변 원천 (규정·일정·팀)
02_전략/       — 사고 공간 (리서치·결정·아카이브)
03_제품/       — 구현 공간 (문서 정본 + 코드 스냅샷 분리)
04_증빙/       — 로그 공간 (append-only)
05_제출/       — 산출 공간 (최종 제출물 정본)
06_LLM위키/   — 지식 공간 (persistent knowledge layer)
assets/        — 자산 공간 (excalidraw/pdf/screenshots)
_MOC/          — 내비 공간 (모든 MOC 중앙화)
_system/       — 운영 공간 (대시보드·툴·팀셋업)
.agent/        — AI 운영 공간 (계약·메모리·레지스트리)
.claude/       — Claude 어댑터 (commands·settings)
```

번호 접두사는 정렬 순서 = 작업 흐름 순서와 일치한다. `01`(이해) → `02`(전략) → `03`(구현) → `04`(기록) → `05`(제출)로 자연스럽게 읽힌다.

`03_제품/` 하위에서 **문서 정본(`hagent-os/`)과 코드 스냅샷(`app/`)을 분리**한 점이 탁월하다. 문서와 코드가 뒤섞이지 않고 각각 별도 인덱스를 가진다.

### 1-2. MOC 계층 — 중앙화 + 상하 연결

`_MOC/` 하위에 8개 파일을 집중시킨다:
- `_MOC_HOME.md` — 모든 MOC의 허브, `up: "[[00 HOME]]"` 으로 루트와 연결
- `_01_대회정보_MOC.md` ~ `_06_LLM위키_MOC.md` — 각 섹션 MOC
- `_system_tools_MOC.md` — 시스템·도구 MOC

각 섹션 MOC는 일관된 구조를 가진다:
1. **먼저 읽기** — 해당 섹션의 최우선 2~3개 문서
2. **세부 목록** — 하위 문서 전체 위키링크
3. **연결** — 다른 섹션 MOC로 가는 크로스링크

이 패턴 덕분에 어떤 MOC에서 시작해도 전체 구조를 이탈하지 않는다.

### 1-3. HOME 허브 패턴 (`00 HOME.md`)

```yaml
tags: [area/home, type/reference, status/active, type/moc]
up: "[[_MOC_HOME]]"
aliases: [HOME, 홈]
```

섹션: **패키지 목적 → 빠른 진입 → 섹션 목록 → 탐색 방식(Markdown/Obsidian 독자 분기) → MOC 공간 → 에이전트 진입점 → 패키지 기준선**

특히 **탐색 방식을 독자 유형으로 분기**한 점이 주목할 만하다:
- 일반 Markdown 사용자: `README` → `SHARE-PACKAGE` → 제품 README → 05_제출
- Obsidian 사용자: `00 HOME` → `_MOC/` → 섹션별 문서

### 1-4. `_system/` — 사람과 AI 공용 대시보드

`_system/dashboard/project-dashboard.md`는 **현재 상태·제출 내비게이션·핵심 지표(체크박스)·심사 시나리오·남은 마일스톤**을 단일 파일에 담는다. 에이전트와 사람이 모두 이 파일을 참조하도록 설계되어 있다.

`_system/tools/`에 부트스트랩 스크립트, pyproject, `.env.example`을 두어 **새 팀원이 `bootstrap.sh` 한 번으로 환경을 복제**할 수 있게 한다.

### 1-5. SHARE-PACKAGE — 외부 공개 읽기 순서 명시

`SHARE-PACKAGE.md`는 심사자·외부 독자를 위한 별도 진입점이다:
- **추천 읽기 순서** 7단계 (파일 경로 직접 명시)
- **포함 범위** vs **내부 보존 영역** 명확히 구분
- **자산 위치 규칙** (excalidraw/diagrams/screenshots/pdf 각각 어느 폴더)
- **업데이트 규칙** (새 파일 배치 기준)

심사자가 GitHub에서 처음 방문해도 5분 안에 핵심을 찾을 수 있다.

### 1-6. 옵시디언 위키링크 활용

`.agent/rules/obsidian-conventions.md`에서 규칙을 명문화하고 모든 파일이 준수한다:
- 내부 링크: `[[위키링크]]`, 외부 URL: `[]()`
- 모든 노트에 YAML frontmatter (`tags`, `date` 최소)
- 루트 노트 제외 모든 노트에 `up:` 속성 — 구조적 부모를 명시
- 태그 네임스페이스 4종만: `area/*`, `type/*`, `status/*`, `workflow/*`
- 파일명: 한국어 가능, 공백 대신 `_`
- MOC 파일: `_MOC/` 중앙화 + `_` 프리픽스

### 1-7. `06_LLM위키` — Karpathy 스타일 persistent knowledge layer

대회 기간 중 생성된 도메인 지식을 세션이 끝나도 유지되는 wiki로 누적한다. `concepts/`, `problems/`, `theses/`, `comparisons/`, `entities/`, `sources/` 서브 폴더로 분류. AGENTS.md에 **"LLM Wiki First 원칙"** 을 명시해 에이전트가 raw source보다 위키를 먼저 조회하도록 강제한다.

### 1-8. `.agent/` — 에이전트 역할 분담 + 핸드오프 계약

AGENTS.md에 8개 에이전트 역할(PM/Research/Product/Builder/QA/Judge/Evidence/Submission)과 각자가 **읽는 파일 / 쓰는 파일**을 표로 명시한다. 핸드오프 출력 포맷 6블록(Task/Assumptions/Inputs/Output/Open risks/Next action)을 강제해 에이전트 간 문맥 손실을 방지한다.

---

## 2. 우리 본선 공간 폴더 트리 제안

JBproject 기존 구조(`00_제출` ~ `07_원천`)는 예선 공간으로 유지하고, `08_본선/` 하위에 새 작업 공간을 구성한다.

```
JBproject/
├── 00_제출/           ← 예선 제출물 (건드리지 않음)
├── 01_전략/           ← 예선 전략 (건드리지 않음)
├── 02_제품/           ← 예선 제품 (건드리지 않음)
├── 03_에이전트/       ← 예선 에이전트 정의 (건드리지 않음)
├── 04_아키텍처/       ← 예선 아키텍처 (건드리지 않음)
├── 05_리서치/         ← 예선 리서치 (건드리지 않음)
├── 06_증빙/           ← 예선 증빙 (건드리지 않음)
├── 07_원천/           ← 예선 원천 자료 (건드리지 않음)
│
├── 08_본선/                      ← 본선 전용 공간 (신규)
│   ├── HOME.md                   ← 본선 볼트 홈 허브
│   ├── SHARE-PACKAGE.md          ← 외부 공유용 읽기 순서
│   │
│   ├── _MOC/                     ← 본선 전용 MOC 중앙 공간
│   │   ├── _MOC_HOME.md          ← 본선 MOC 허브
│   │   ├── _01_대회정보_MOC.md
│   │   ├── _02_전략_MOC.md
│   │   ├── _03_제품_MOC.md
│   │   ├── _04_증빙_MOC.md
│   │   ├── _05_제출_MOC.md
│   │   └── _system_tools_MOC.md
│   │
│   ├── _system/                  ← 본선 운영 공간
│   │   ├── dashboard/
│   │   │   └── project-dashboard.md   ← 현재 상태·지표·마일스톤 대시보드
│   │   └── workspace-visual-map.md    ← 구조 시각화 맵
│   │
│   ├── _분석/                    ← 레퍼런스 분석 (이 파일 포함)
│   │   └── hagent-os-구조-청사진.md
│   │
│   ├── 01_대회정보/              ← 본선 공지·심사기준·일정
│   │   ├── 본선_공지.md
│   │   ├── 본선_심사기준.md
│   │   └── 본선_일정표.md
│   │
│   ├── 02_전략/                  ← 본선 전략 공간
│   │   ├── 01_foundation/
│   │   │   ├── 본선-마스터-플레이북.md
│   │   │   └── 예선-본선-갭-분석.md
│   │   ├── 02_problem-framing/
│   │   │   ├── 본선-문제-고도화.md
│   │   │   └── 심사위원-시뮬레이션.md
│   │   ├── 03_decisions/
│   │   │   ├── bet-memo.md
│   │   │   ├── scope-board.md
│   │   │   └── risk-register.md
│   │   └── 98_archive/
│   │
│   ├── 03_제품/                  ← 본선 제품 공간
│   │   ├── README.md
│   │   ├── INDEX.md
│   │   ├── 00_vision/
│   │   │   └── core-bet.md
│   │   ├── 01_prd/
│   │   │   ├── prd.md
│   │   │   └── mvp-scope.md
│   │   ├── 02_agent-design/
│   │   │   ├── agent-roster.md       ← 에이전트 14종 역할 재정의
│   │   │   ├── orchestrator.md
│   │   │   └── skill-spec.md
│   │   ├── 03_ux/
│   │   │   ├── ia-screen-map.md
│   │   │   ├── user-journeys.md
│   │   │   └── design-system.md
│   │   ├── 04_tech/
│   │   │   ├── architecture.md       ← 시스템 구성도
│   │   │   ├── data-model.md
│   │   │   ├── api-spec.md
│   │   │   └── rag-rule-engine.md
│   │   ├── 05_diagrams/
│   │   │   ├── 00_system-context.md
│   │   │   ├── 01_agent-flow.md
│   │   │   ├── 02_case-lifecycle.md
│   │   │   ├── 03_approval-gate.md
│   │   │   ├── 04_erd.md
│   │   │   └── 99_comprehensive-architecture.md
│   │   ├── app/                      ← 실제 구현 코드
│   │   └── tests/
│   │
│   ├── 04_증빙/                  ← 본선 증빙 공간 (append-only)
│   │   ├── 01_핵심로그/
│   │   │   ├── master-evidence-ledger.md   ← 단일 증빙 원장
│   │   │   ├── decision-log.md
│   │   │   ├── prompt-catalog.md
│   │   │   └── session-log.md
│   │   ├── 02_분석자료/          ← 라이브 테스트·점검 메모
│   │   ├── 03_daily/             ← 일별 작업 노트
│   │   │   └── 2026-XX-XX.md
│   │   └── 04_meetings/          ← 미팅 노트
│   │
│   ├── 05_제출/                  ← 본선 최종 제출물
│   │   ├── ai-report-final.md
│   │   ├── submission-checklist.md
│   │   ├── live-final-verification.md
│   │   └── retrospective.md
│   │
│   └── assets/                   ← 본선 자산
│       ├── excalidraw/
│       ├── screenshots/
│       └── pdf/
│
├── _MOC.md                       ← 전체 볼트 MOC (예선 포함 — 기존 파일 유지)
└── _canon.md                     ← 예선 사실 SSOT (기존 파일 유지)
```

### 각 폴더 역할 요약

| 폴더 | 역할 | 핵심 파일 |
|------|------|----------|
| `08_본선/HOME.md` | 본선 볼트 홈 허브 | 섹션 링크, 탐색 방식 분기 |
| `08_본선/_MOC/` | 모든 본선 MOC 중앙 공간 | `_MOC_HOME.md`, 섹션별 MOC 7개 |
| `08_본선/_system/` | 대시보드 + 시각화 맵 | `project-dashboard.md` |
| `08_본선/_분석/` | 구조 분석·참조 문서 | 이 파일 |
| `08_본선/01_대회정보/` | 본선 공지·심사기준 원천 | 변경 불가 원본 |
| `08_본선/02_전략/` | 예선→본선 갭 분석·의사결정 | 플레이북, bet-memo, risk |
| `08_본선/03_제품/` | 제품 문서 정본 + 코드 | PRD, 아키텍처, 에이전트 설계 |
| `08_본선/04_증빙/` | AI 활용 로그 (append-only) | master-evidence-ledger |
| `08_본선/05_제출/` | 최종 제출물 정본 | AI리포트, 체크리스트 |
| `08_본선/assets/` | 시각 자산 원본 | excalidraw, screenshots |

---

## 3. 본선 MOC 구조 제안

### 3-1. `08_본선/_MOC/_MOC_HOME.md` 섹션 구성

```markdown
## 빠른 시작
- [[본선 HOME|본선 홈]]
- [[08_본선/_system/dashboard/project-dashboard|운영 대시보드]]
- [[08_본선/05_제출/submission-checklist|제출 체크리스트]]

## 오늘 우선 확인 (집중 구간 변경 시 갱신)
- [[08_본선/_04_증빙_MOC|04 증빙]] — 세션 로그 최신 상태
- [[_03_제품_MOC|03 제품]] — 구현 진행 상태
- [[08_본선/_system/dashboard/project-dashboard|대시보드]] — 지표·마일스톤

## 섹션 MOC
- [[08_본선/_01_대회정보_MOC|01 대회정보]]
- [[08_본선/_02_전략_MOC|02 전략]]
- [[_03_제품_MOC|03 제품]]
- [[08_본선/_04_증빙_MOC|04 증빙]]
- [[08_본선/_05_제출_MOC|05 제출]]
- [[08_본선/_system_tools_MOC|System Tools]]

## 예선 연결 (참조용)
- [[_MOC|예선 전체 MOC]] — 예선 문서 구조
- [[_canon|예선 Canon]] — 예선 SSOT (수치·에이전트 명칭 기준)
```

### 3-2. `08_본선/_MOC/_03_제품_MOC.md` 핵심 섹션

제품 MOC는 hagent-os 패턴을 그대로 따르되 JBproject 맥락에 맞게 조정한다:

```markdown
## 먼저 볼 문서
- [[08_본선/04_증빙/02_분석자료/리서치/리서치-인덱스|제품 개요]]
- [[08_본선/03_제품/01_prd/prd|PRD]]
- [[08_본선/03_제품/05_diagrams/99_comprehensive-architecture|종합 구조도]]
- [[08_본선/05_제출/live-final-verification|라이브 최종 검증]]

## 에이전트 설계
- [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]]
- [[08_본선/03_제품/02_agent-design/orchestrator|Orchestrator]]
- [[08_본선/03_제품/02_agent-design/skill-spec|Skill 명세]]

## 아키텍처 / 기술
- [[08_본선/03_제품/04_tech/architecture|시스템 구성도]]
- [[08_본선/03_제품/04_tech/data-model|데이터 모델]]
- [[08_본선/03_제품/04_tech/rag-rule-engine|RAG + Rule Engine]]

## UX / 디자인
- [[08_본선/03_제품/03_ux/design-system|디자인 시스템]]
- [[ia-screen-map|IA 화면 지도]] · [[user-journeys|사용자 여정]](미확정 초안, `_archive/`)

## 다이어그램
- [[08_본선/03_제품/05_diagrams/00_system-context|시스템 컨텍스트]]
- [[08_본선/03_제품/05_diagrams/01_agent-flow|에이전트 흐름도]]
- [[08_본선/03_제품/05_diagrams/02_case-lifecycle|케이스 생애주기]]
- [[08_본선/03_제품/05_diagrams/03_approval-gate|승인 게이트]]
- [[08_본선/03_제품/05_diagrams/99_comprehensive-architecture|종합 구조도]]
```

### 3-3. 독자 경로 분기

본선 HOME.md에 명시할 3개 독자 경로:

**심사자 5분 경로**
1. `08_본선/HOME.md` — 제품 한 줄 정의·차별점 확인
2. `08_본선/05_제출/ai-report-final.md` — AI 리포트 최종본
3. `08_본선/03_제품/05_diagrams/99_comprehensive-architecture.md` — 종합 구조도
4. 앱 실행 (`?demo=sme`) — 골든 패스 시연
5. `08_본선/03_제품/01_prd/prd.md` → 본선 추가 기능 확인

**개발자 경로**
1. `08_본선/03_제품/README.md`
2. `08_본선/03_제품/04_tech/architecture.md`
3. `08_본선/03_제품/02_agent-design/agent-roster.md`
4. `08_본선/03_제품/04_tech/api-spec.md`
5. `08_본선/04_증빙/01_핵심로그/decision-log.md`

**발표자 경로**
1. `08_본선/HOME.md` — 전체 구조 파악
2. `_canon.md` (예선) + `08_본선/02_전략/01_foundation/예선-본선-갭-분석.md`
3. `08_본선/03_제품/05_diagrams/` — 다이어그램 전체
4. `08_본선/05_제출/ai-report-final.md`
5. `08_본선/_system/dashboard/project-dashboard.md` — 구현 현황 지표

### 3-4. 섹션 간 위키링크 연결망 (크로스링크)

각 섹션 MOC 하단에 **연결** 섹션을 두어 인접 섹션으로 이동 경로를 제공한다:

```
01_대회정보 ──→ 02_전략 (규정을 전략으로 번역)
02_전략     ──→ 03_제품 (전략이 제품으로 내려감)
03_제품     ──→ 04_증빙 (구현 근거 기록)
04_증빙     ──→ 05_제출 (증빙이 제출물로 이어짐)
05_제출     ──→ 01_대회정보 (제출 형식 재확인)
```

---

## 4. 옵시디언 정합성 체크리스트

본선 공간을 Obsidian vault로 운영할 때 위키링크가 깨지지 않도록 지켜야 할 규칙 목록이다.

### 4-1. 파일명 규칙

| 규칙 | 이유 | 예시 |
|------|------|------|
| 공백 대신 `-` 또는 `_` 사용 | Obsidian 위키링크에서 공백은 `%20`으로 인코딩되어 가독성 저하 | `agent-roster.md` (O), `agent roster.md` (X) |
| 한국어 파일명 허용 | Obsidian은 UTF-8 지원, 단 CLI 스크립트 참조 시 따옴표 필요 | `본선_일정표.md` (O) |
| `_` 프리픽스는 MOC 파일 전용 | MOC가 일반 노트와 혼동되지 않도록 | `_03_제품_MOC.md` (O), `_progress.md` (X) |
| 중복 파일명 금지 (경로 무관) | Obsidian 단축 위키링크 `[[파일명]]`은 볼트 전체에서 유일해야 함 | `prd.md`가 `02_전략/`과 `03_제품/`에 동시 존재하면 안 됨 |
| 숫자 접두사로 정렬 제어 | 폴더 정렬 = 읽기 흐름과 일치 | `01_foundation/`, `02_problem-framing/` |

### 4-2. frontmatter 필수 필드

```yaml
---
tags:
  - area/<영역>       # system/home/product/evidence/submission 중 하나
  - type/<유형>       # moc/reference/log/task/guide 중 하나
  - status/<상태>     # active/draft/complete/archive 중 하나
date: YYYY-MM-DD
up: "[[부모노트명]]"   # 루트 노트(HOME, _MOC_HOME) 제외 필수
aliases:              # 검색 편의어 (선택)
  - 별칭
---
```

- `up:` 값은 Obsidian 위키링크 문자열: `"[[_MOC_HOME]]"` 형태
- `up:`은 구조적 부모만 — 관련 문서나 참조는 본문 링크 사용
- 태그 네임스페이스 4종만: `area/*`, `type/*`, `status/*`, `workflow/*`

### 4-3. 위키링크 작성 규칙

| 상황 | 올바른 형태 | 잘못된 형태 |
|------|-----------|-----------|
| 같은 볼트 내 노트 참조 | `[[파일명]]` | `[파일명](./경로/파일명.md)` |
| 표시 텍스트 변경 | `[[파일명\|표시텍스트]]` | 마크다운 링크 |
| 경로 지정 (중복명 방지) | `[[08_본선/03_제품/01_prd/prd\|PRD]]` | `[[prd]]` (중복 시 충돌) |
| 이미지/파일 임베드 | `![[파일명.png]]` | `![](./assets/파일명.png)` |
| 외부 URL | `[표시텍스트](https://...)` | `[[https://...]]` |

### 4-4. HOME 허브 패턴 (본선 HOME.md 템플릿)

```markdown
---
tags: [area/home, type/moc, status/active]
date: YYYY-MM-DD
up: "[[_MOC_HOME]]"
aliases: [본선HOME, 본선홈]
---
# JB LocalGuard OS 본선 홈

> 한 줄 정의 + 차별점

## 빠른 진입
- [[08_본선/SHARE-PACKAGE|공유 패키지]] — 외부 독자 진입점
- [[08_본선/05_제출/ai-report-final|AI 리포트 최종본]]
- [[08_본선/03_제품/05_diagrams/99_comprehensive-architecture|종합 구조도]]

## 섹션
- [[08_본선/_01_대회정보_MOC|01 대회정보]]
- [[08_본선/_02_전략_MOC|02 전략]]
- [[_03_제품_MOC|03 제품]]
- [[08_본선/_04_증빙_MOC|04 증빙]]
- [[08_본선/_05_제출_MOC|05 제출]]
- [[08_본선/_system_tools_MOC|System Tools]]

## 탐색 방식
- **심사자**: 이 파일 → AI리포트 → 구조도 → 앱 실행
- **개발자**: 제품 README → 아키텍처 → 에이전트 설계
- **발표자**: 예선-본선 갭 분석 → 다이어그램 → 대시보드

## 예선 연결
- [[_MOC|예선 MOC]] / [[_canon|예선 Canon]]

## MOC 공간
- [[08_본선/_MOC/_MOC_HOME|본선 MOC 허브]]

## 패키지 기준선
- 스냅샷 기준일: YYYY-MM-DD
- 제출 상태: [[08_본선/05_제출/submission-checklist|체크리스트]]
```

### 4-5. 중복명 충돌 예방 체크리스트

- [ ] 볼트 전체에서 동일 파일명이 두 개 이상 존재하지 않는지 확인
- [ ] 중복 위험이 있는 범용 이름(`README.md`, `index.md`)은 폴더명을 경로에 포함해 위키링크 작성: `[[08_본선/04_증빙/02_분석자료/리서치/리서치-인덱스|리서치 인덱스]]`
- [ ] 예선 파일과 본선 파일이 동일한 `aliases`를 가지지 않도록 본선 파일엔 `본선` 접두어를 alias에 추가
- [ ] 새 노트 생성 후 `tags`, `date`, `up` 필드 누락 여부 확인
- [ ] `up:` 체인이 루트(HOME 또는 _MOC_HOME)까지 연결되는지 확인

---

## 참조 파일 경로 (이 분석에 사용된 원본)

- 분석 원본 루트: `/Users/river/workspace/active/hagent-os/2026 제1회 KEG 바이브코딩 콘테스트/`
- `00 HOME.md`, `_MOC/_MOC_HOME.md`, `_MOC/_01~_06_*_MOC.md`, `_MOC/_system_tools_MOC.md`
- `SHARE-PACKAGE.md`, `.agent/AGENTS.md`, `.agent/rules/obsidian-conventions.md`
- `_system/dashboard/project-dashboard.md`, `_system/team-setup/workspace-visual-map.md`
