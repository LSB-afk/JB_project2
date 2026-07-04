---
name: harness-sync
description: 세션 종료·체크포인트 시 모든 시스템 파일을 현재 상태로 동기화하는 루틴. 트리거 — "동기화", "상태 갱신", "harness sync", "최신화", "세션 마무리", "시스템 업데이트", "하네스 동기화"
tags:
  - area/system
  - type/skill
  - status/active
date: 2026-06-27
up: "[[_tools-index]]"
---
# harness-sync

> 세션 체크포인트·종료 시 하네스의 모든 시스템 파일을 현재 상태로 동기화하는 오케스트레이터 스킬.
> 매번 수동 수정 없이 `sync.mjs`(자동 단계) + 에이전트 서술(판단 단계)로 전체 상태를 갱신한다.

---

## 자동(코드) vs 반자동(Claude) 경계

| 단계 | 자동화 방식 | Claude 판단 필요 |
|------|------------|----------------|
| 레지스트리 재생성 | settings.json 파싱 → MD 파일 덮어쓰기 | 없음 |
| 텔레메트리 집계 | CSV → 4개 MD 갱신 | 없음 |
| MOC 링크 추가 | 경로 기반 섹션 라우팅 → `<!-- AUTO-LINKS -->` 마커에 삽입 | 파이프 뒤 `\|설명` 텍스트, 테이블 인라인 삽입 |
| frontmatter 보정 | 누락 필드 자동 삽입 | 루트 허브(`HOME`·`PLAN`) `up` 값은 Claude 설정 |
| 시각화 사이클 | VISUALIZATION-PLAN → Excalidraw 재생성·간트 갭·5초 가독성 검증 | 보드 기획·메시지 품질 판단 |
| 거버넌스 스캔 | regex 탐지 → 경고만 | 위반 심각성 판단 + 대응 |
| 핵심로그 목차(TOC) | 헤딩 스캔 → `<!-- TOC:AUTO -->` 블록 갱신 | 없음 |
| 프롬프트 로그 | — | Claude가 세션 내용 요약·append |
| 메모리·SSoT 갱신 | — | Claude가 맥락 이해 후 서술 |

---

## 10단계 동기화 루틴

> 단계 표기: **[에이전트]** = Claude가 판단해 narrative 작성 / **[스크립트]** = `.mjs` 자동 실행

### 1. 프롬프트 로그 append **[에이전트]**

이번 세션에서 받은 **신규 사용자 프롬프트 원문**을 `_system/memory/context/` 또는 `session-log.md`에 append.
- 이미 기록된 내용은 건드리지 않음
- 민감 정보(PII·대외비)는 마스킹 후 기록

### 2. 플러그인·MCP 레지스트리 재생성 **[스크립트]** `[자동]`

```bash
node 08_본선/_system/skills/harness-sync/plugin-inventory.mjs
```

`~/.claude/settings.json` 읽기 → `enabledPlugins` · `extraKnownMarketplaces` · `mcpServers` 파싱
→ `registry-plugins.md`(활성/비활성 표·마켓플레이스 표) 및 `registry-mcp.md`(settings MCP 섹션) 재생성.

### 3. 텔레메트리 집계 **[스크립트]** `[자동]`

```bash
node 08_본선/_system/skills/telemetry-aggregator/aggregate.mjs
```

`ai-session-intake.csv` → `_telemetry-log.md` · `_contribution-stats.md` · `_agent-registry.md` · `ai-usage-stats.md` 4개 파일 갱신.

### 4. MOC/frontmatter 정합성 보정 **[스크립트]** `[자동 + 반자동]`

```bash
node 08_본선/_system/skills/canon-moc-sync/sync.mjs --apply
```

**자동(코드):**
- 파일 경로로 섹션 결정 — `01_대회정보/*` → `_01_대회정보_MOC`, `02_전략/*` → `_02_전략_MOC`, `03_제품/*` → `_03_제품_MOC`, `04_증빙/*` → `_04_증빙_MOC`, `05_제출/*` → `_05_제출_MOC`, `_system/*`·`_분석/*` → `_system_tools_MOC`
- 해당 섹션 MOC에 `[[경로/파일명]]` 위키링크 1행 자동 추가 (멱등, 중복 추가 없음)
- `tags`, `date`, `up` frontmatter 누락 자동 보정
- 중복 basename 탐지 (콘텐츠 충돌만 경고, `_system` 내부 중복은 무시)
- 루트 허브 파일(`HOME`, `PLAN`, `AGENTS` 등)의 `up` 누락은 에러 아님 — 자동화 제외

**반자동(Claude 판단):**
- 위키링크 `|설명` 텍스트 — 의미 있는 레이블은 Claude가 수동 추가
- 섹션 MOC 테이블에 행 인라인 삽입 — AUTO-LINKS 마커 기반 자동 추가와 별도로, 표 안에 넣으려면 Claude가 판단
- 루트 허브 파일의 `up` 값 — Claude가 맥락에 맞게 설정

### 5. 시각화 사이클 재생성·검증 **[스크립트]** `[자동]`

```bash
node 08_본선/_system/skills/visualization-cycle/scripts/run.mjs
```

[[VISUALIZATION-PLAN]]을 기준으로 `_system/automation/viz-generator.mjs`를 실행하고, `.excalidraw` JSON, `_viz-index` 등록 상태, 간트 갭 링크, 발표용 5초 가독성, 사람/AI/기여 레이어를 검증한다. 새 보드나 큰 변경은 먼저 [[VISUALIZATION-PLAN]]에 등록되어 있어야 한다.

### 6. 거버넌스 스캔 **[스크립트]** `[자동]`

```bash
node 08_본선/_system/skills/pii-governance-validator/validate.mjs 2>/dev/null || true
```

대외비·PII 위반 0건 확인. 위반 발견 시 경고 출력 후 계속 진행(블로킹 없음).

### 7. 핵심로그 목차(TOC) 갱신 **[스크립트]** `[자동]`

```bash
node 08_본선/_system/skills/log-toc/generate.mjs
```

`session-log.md`·`decision-log.md`·`프롬프트-로그.md`의 `<!-- TOC:AUTO -->` 블록을 헤딩(`##`/`###`) 기준으로 재생성. 상세 → [[log-toc]].

### 8. 인-볼트 메모리 갱신 **[에이전트]**

`_system/memory/context/` 내 파일들을 현재 상태로 갱신:
- `본선-현황.md` — 현재 진행 단계·완료 항목 반영
- `제품-정의.md` — 제품 정의 변경 사항 반영
- 전역 메모리(`~/.claude/projects/.../MEMORY.md`) 미러 안내 출력

### 9. SSoT 문서 갱신 **[에이전트]**

아래 파일들을 현재 상태로 갱신:
- `PROGRESS.md` — 완료 태스크·다음 단계
- `_system/dashboard/project-dashboard.md` — 운영 대시보드
- `_system/telemetry/` 내 `session-log.md`(있으면) — 세션 요약 행 추가
- `decision-log.md`(있으면) — 이번 세션 주요 결정 기록

### 10. 동기화 요약 출력 **[에이전트 + 스크립트]**

`sync.mjs`가 자동 단계(2·3·4·5·6·7) 결과를 1개 블록으로 출력 후,
에이전트가 판단 단계(1·8·9) 완료 여부를 합쳐 최종 요약 출력:

```
[harness-sync] 동기화 완료 — 2026-06-27
  ✓ 1. 프롬프트 로그 append (n건)
  ✓ 2. 플러그인·MCP 레지스트리 재생성 (활성 N, 비활성 M)
  ✓ 3. 텔레메트리 집계 (intake X행 → 4파일 갱신)
  ✓ 4. MOC 정합성 (중복 0 · frontmatter 누락 0 · 신규 링크 K건)
  ✓ 5. 시각화 사이클 (VISUALIZATION-PLAN 기준 Excalidraw 재생성·검증)
  ✓ 6. 거버넌스 스캔 (PII 위반 0)
  ✓ 7. 핵심로그 목차(TOC) 갱신 (session-log·decision-log·프롬프트-로그)
  ✓ 8. 인-볼트 메모리 갱신 (context/ N파일)
  ✓ 9. SSoT 문서 갱신 (PROGRESS·대시보드·session-log)
```

---

## 실행 방법

### 전체 자동 단계만 일괄 실행

```bash
node 08_본선/_system/skills/harness-sync/sync.mjs
```

`--dry-run` 플래그로 실제 파일 변경 없이 점검만 가능:

```bash
node 08_본선/_system/skills/harness-sync/sync.mjs --dry-run
```

### 에이전트 트리거 (Claude Code 대화)

```
/harness-sync
harness sync 해줘
세션 마무리
동기화해줘
```

---

## 주의사항

- **맵 파일(MOC·레지스트리)은 손으로 고치지 않는다** — `harness-sync`(또는 개별 스킬)로만 갱신. 상세 규칙 → [[collaboration-rules]]
- 각 단계는 독립 실행 — 한 단계 실패 시 다음 단계로 계속 진행
- `sync.mjs`는 표준 라이브러리만 사용 (외부 의존성 없음, 외부 전송 없음)
- `plugin-inventory.mjs`는 `~/.claude/settings.json` 읽기 전용 — settings 파일을 수정하지 않음

---

## 연결

- [[registry-plugins|플러그인 레지스트리]] — 2단계 재생성 대상
- [[registry-mcp|MCP 레지스트리]] — 2단계 재생성 대상
- [[telemetry-aggregator|텔레메트리 집계기]] — 3단계 호출
- [[canon-moc-sync|MOC 정합성 동기화]] — 4단계 호출
- [[visualization-cycle|시각화 사이클]] — 5단계 호출
- [[pii-governance-validator|거버넌스 검증기]] — 6단계 호출
- [[log-toc|핵심로그 목차 갱신]] — 7단계 호출
- [[_tools-index|도구 인덱스]]
- [[_HARNESS-SYSTEM|하네스 시스템]]
