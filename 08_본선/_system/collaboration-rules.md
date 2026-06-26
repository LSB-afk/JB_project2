---
tags:
  - area/system
  - type/rules
  - status/active
date: 2026-06-27
up: "[[_HARNESS-SYSTEM]]"
aliases:
  - 협업규칙
  - collaboration-rules
---
# 협업 규칙

> 대외비 — 6/29 공식발표 전 비공개.

GoLAB 팀 4인 + AI 에이전트가 동일한 볼트에서 충돌 없이 협업하기 위한 최소 규칙.

---

## 1. 브랜치 / 커밋

**브랜치 전략**
- `main` — 제출·공유 정본
- `feat/<기능명>` — 기능 개발
- `docs/<문서명>` — 문서 작업
- `chore/<작업명>` — 시스템·설정

**커밋 메시지** (컨벤셔널 커밋 형식)
```
<type>: <한글 설명>

types: feat | fix | docs | refactor | chore | perf | test | ci
```

**6/29 이전 공개 푸시 금지** — `git push origin main`은 팀 확인 후 진행.

---

## 2. 옵시디언 볼트 규칙

1. **위키링크** — 항상 `[[파일명]]` 형식. 절대경로 마크다운 링크 사용 금지
2. **H1 = 파일명 권장** — 첫 번째 H1이 파일의 공식 제목
3. **중복 파일명 절대 금지** — 볼트 전역에서 파일명 고유성 유지
4. **frontmatter 필수** — `tags`, `date`, `up` 세 필드 최소 포함
5. **파일 생성 전 검색** — 유사 파일 존재 여부 확인 후 생성

---

## 3. 로그 append 규약

모든 로그 파일은 append-only:

| 로그 파일 | 기록 시점 | 기록 형식 |
|---------|---------|---------|
| `telemetry/_telemetry-log.md` | 세션종료/체크포인트/수동 | 표 행 추가 |
| `04_증빙/01_핵심로그/프롬프트-로그.md` | 세션 중 중요 프롬프트 | H2 섹션 추가 |
| `04_증빙/decision-log.md` | 의사결정 시점 | H2 섹션 추가 |
| `04_증빙/session-log.md` | 세션 종료 시 | H2 섹션 추가 |

**기존 행 수정 금지** — 오류 발견 시 다음 행에 정정 행 추가.

---

## 4. 핸드오프 6블록

세션 종료 또는 작업 이관 시 다음 6블록을 작성:

```
## 핸드오프 [날짜 시각]

1. **완료**: 이번 세션에서 완료한 작업 목록
2. **진행 중**: 미완료 상태로 넘기는 작업
3. **다음 우선순위**: 다음 세션이 먼저 해야 할 것
4. **블로커**: 현재 막혀 있는 것 / 결정 필요한 것
5. **주의사항**: 건드리지 말아야 할 것 / 알아야 할 것
6. **맥락 파일**: 이어받을 때 먼저 읽어야 할 파일 목록
```

---

## 5. 비밀유지

- **6/29 이전** 외부 공개·공유·푸시 금지
- `.eml` 파일 — `.gitignore`에 포함, 커밋 금지
- 개인정보(고객, 팀원 연락처 등) — `.gitignore` 또는 별도 비공개 폴더
- 심사 전략·채점 기준 분석 — 팀원 외 공유 금지
- GitHub 리포가 public 전환되기 전 확인 체크리스트 운영

---

## 6. 맵 파일 자동화 원칙

> **MOC·레지스트리는 손으로 고치지 않는다.** `harness-sync`(또는 개별 스킬)로만 갱신.

### 대상 맵 파일

| 파일 | 갱신 방법 |
|-----|---------|
| `_MOC/_01_대회정보_MOC` ~ `_05_제출_MOC`, `_system_tools_MOC` | `canon-moc-sync --apply` |
| `_MOC/_MOC_HOME` | Claude가 섹션 MOC 링크 추가 시 수동 반영 |
| `_system/tools/registry-{skills,plugins,mcp,cli,commands}` | `plugin-inventory.mjs` 자동 재생성 |
| `_system/tools/_tools-index` | 수동 편집 허용 (레지스트리 분기 표만) |
| `_system/telemetry/_telemetry-log`, `_contribution-stats`, `ai-usage-stats` | `telemetry-aggregator` 자동 갱신 |
| `_system/agents/_agent-registry` | `telemetry-aggregator` 자동 갱신 |

### 자동(코드) vs 반자동(Claude)

- **자동**: 경로 기반 섹션 라우팅, 위키링크 삽입, frontmatter 필드 보정, 레지스트리 재생성
- **반자동**: 위키링크 `|설명` 표시 텍스트, MOC 테이블 행 삽입, 루트 허브 `up` 값

### 일괄 실행

```bash
# 전체 자동 단계 (레지스트리 → 텔레메트리 → MOC → 거버넌스)
node 08_본선/_system/skills/harness-sync/sync.mjs

# MOC만
node 08_본선/_system/skills/canon-moc-sync/sync.mjs --apply
```

---

## 7. 기록 우선 (Capture-by-default)

> "사용자가 몰라도 에이전트는 놓치지 않고 기록한다."

- 모든 의미 있는 작업·결정은 즉시 해당 로그에 기록
- 나중에 기억에 의존하여 기록하지 않는다
- 텔레메트리는 세션 종료 시 반드시 업데이트
- 불확실하면 기록하고, 나중에 정정

---

## 연결

- [[_HARNESS-SYSTEM|하네스 시스템]]
- [[AGENTS|협업 계약 (AGENTS.md)]]
- [[08_본선/_system/memory/_memory-index|메모리 인덱스]]
- [[08_본선/_system/telemetry/_telemetry-log|텔레메트리 로그]]
