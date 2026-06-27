---
tags:
  - area/system
  - type/index
  - status/active
date: 2026-06-27
up: "[[_HARNESS-SYSTEM]]"
aliases:
  - 도구인덱스
  - tools-index
---
# _tools-index

> 이 볼트에서 사용 가능한 모든 도구·플러그인·스킬·MCP·CLI·슬래시 커맨드를 5개 레지스트리로 분류한 마스터 인덱스.
> 신규 도구 추가 시 해당 레지스트리에만 행을 추가하면 된다. MOC 파일은 건드리지 않는다.

---

## 5개 레지스트리 분기

| 레지스트리 | 파일 | 분류 기준 |
|-----------|------|----------|
| 스킬 | [[registry-skills]] | Claude Code 스킬 (보유 + 자체 구축 + 서드파티 설치형) |
| 플러그인 | [[registry-plugins]] | Obsidian / Claude Code 활성 플러그인 |
| MCP | [[registry-mcp]] | 세션 MCP 서버 (인증 필요 여부 포함) |
| CLI / 로컬 | [[registry-cli]] | 로컬 CLI 바이너리 + 프로젝트 스크립트 |
| 커맨드 | [[registry-commands]] | 슬래시 커맨드 (Claude Code 내장) |

---

## 맵 자동화 흐름

> MOC·레지스트리·통계는 손으로 고치지 않는다. `harness-sync` 또는 개별 스킬로만 갱신.

```
harness-sync/sync.mjs
  ├─ [2] plugin-inventory.mjs  → registry-plugins.md + registry-mcp.md
  ├─ [3] telemetry-aggregator  → _telemetry-log / _contribution-stats / ai-usage-stats / _agent-registry
  ├─ [4] canon-moc-sync --apply
  │        ├─ 섹션 라우팅: 01_* → _01_대회정보_MOC … 05_* → _05_제출_MOC
  │        ├─ AUTO-LINKS 마커에 [[경로/파일]] 1행 삽입 (멱등)
  │        └─ frontmatter tags/date/up 누락 자동 보정
  └─ [5] pii-governance-validator → 위반 경고 (블로킹 없음)
```

**Claude 판단(반자동)**: 위키링크 `|설명` 텍스트 · MOC 테이블 행 삽입 · 루트 허브 `up` 값

---

## Bootstrap

새 팀원 또는 새 기기에서 하네스를 초기화할 때:

```sh
chmod +x 08_본선/_system/tools/bootstrap.sh
bash 08_본선/_system/tools/bootstrap.sh --dry-run   # 먼저 점검
bash 08_본선/_system/tools/bootstrap.sh              # 실제 적용
```

상세 동작 → [[bootstrap.sh]] (상단 주석 참조)

---

## 자랑 포인트 TOP 5

1. **Capture-by-default** — Stop 훅 + telemetry-aggregator 스킬이 세션 종료 시 툴/토큰/시간을 자동 기록. 사용자가 아무것도 안 해도 기록됨.
2. **자체 구축 스킬 4종** — `telemetry-aggregator` · `canon-moc-sync` · `pii-governance-validator` · `harness-sync`가 `_system/skills/`에 버전 관리되며 bootstrap으로 `.claude/skills/`에 즉시 배포 가능. `harness-sync`는 8단계 동기화 루틴 오케스트레이터이며, `plugin-inventory.mjs`가 settings.json → 레지스트리 재생성을 자동화.
3. **에이전트 레지스트리 + 텔레메트리 연동** — 676,932+ 토큰 누적 집계, 에이전트별 산출물 추적. [[_agent-registry]] 참조.
4. **MCP 풀 스택** — chrome · perplexity · figma · notion · google-calendar · google-drive · excalidraw · hwp-mcp 8종 세션 연동. 인증 정보 없이 `claude mcp add` echo만 bootstrap에 포함(보안 원칙).
5. **웹 추천 → 검증 후 승격 파이프라인** — GitHub MCP / Obsidian MCP / Notion MCP은 상태="검증 후 사용"으로 레지스트리에 등록, 검증 완료 시 `상태=활성`으로 승격.

---

## 연결

- [[_HARNESS-SYSTEM|하네스 시스템 마스터]]
- [[_agent-registry|에이전트 레지스트리]]
- [[project-dashboard|운영 대시보드]]
