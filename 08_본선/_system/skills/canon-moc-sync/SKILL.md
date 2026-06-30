---
name: canon-moc-sync
description: 신규 .md 파일 중복명 검사 + 섹션 MOC 위키링크 자동추가 + frontmatter 필수 필드 검증·보정
tags:
  - area/system
  - type/skill
  - status/active
date: 2026-06-27
up: "[[_tools-index]]"
---
# canon-moc-sync

> 볼트 정합성 유지 스킬. 파일 경로에 따라 해당 섹션 MOC에 위키링크를 자동 추가하고,
> frontmatter 필수 필드를 검증·보정한다.

## 실행

```bash
# 리포트만 (파일 수정 없음, 기본값)
node 08_본선/_system/skills/canon-moc-sync/sync.mjs

# 실제 적용 (위키링크 추가 + frontmatter 보정)
node 08_본선/_system/skills/canon-moc-sync/sync.mjs --apply
```

## 수행 작업

### 1. 중복 파일명 검사

- `08_본선/` 전체를 재귀 탐색해 `.md` 파일명(확장자 제외)이 겹치는 쌍을 탐지
- `_system/` 내부 파일(SKILL.md, README.md 등)끼리의 중복은 **정상으로 무시**
- 콘텐츠 파일(비시스템) 간 중복만 **경고** 출력 (경로지정 위키링크 권장)
- exit code 0 유지 (CI 블로킹 없음, 경고만)

### 2. frontmatter 필수 필드 검증 및 보정

필수 3개 필드 검사:
- `tags`
- `date`
- `up`

**루트 허브 파일** (`HOME.md`, `PLAN.md`, `AGENTS.md`, `PROGRESS.md`, `SHARE-PACKAGE.md`, `_MOC_HOME.md`)는
`up` 누락이 정상 — 에러 없음.

`--apply` 모드에서는 누락 필드를 자동 삽입:
- `tags` 없으면 `area/general, status/draft` 기본값 삽입
- `date` 없으면 오늘 날짜 삽입
- `up` 없으면 해당 섹션 MOC 링크 삽입

### 3. 섹션 MOC 위키링크 자동 추가 (맵-인지 라우팅)

파일 경로를 보고 해당 섹션 MOC를 결정:

| 경로 패턴 | 대상 MOC |
|----------|---------|
| `01_대회정보/*` | `_MOC/_01_대회정보_MOC.md` |
| `02_전략/*` | `_MOC/_02_전략_MOC.md` |
| `03_제품/*` | `_MOC/_03_제품_MOC.md` |
| `04_증빙/*` | `_MOC/_04_증빙_MOC.md` |
| `05_제출/*` | `_MOC/_05_제출_MOC.md` |
| `_system/*`, `_분석/*` | `_MOC/_system_tools_MOC.md` |

**제외 대상** (자동 추가 안 함):
- `_` 접두어 파일 (내부 파일)
- `_MOC/` 디렉터리 파일 (MOC 자체)
- `_system/` 파일 (시스템 파일)
- 루트 허브 파일 (`HOME`, `PLAN`, `AGENTS` 등)

**멱등** — 이미 링크가 있으면 중복 추가 안 함.

추가 위치: MOC의 `<!-- AUTO-LINKS -->` 마커 아래 (없으면 파일 끝)

### 4. 죽은 링크(dead link) 감지 — 삭제·이름변경 반영

- 볼트 전체에서 `[[08_본선/<경로>…]]` 형태의 **경로지정 위키링크**를 스캔.
- 정확 경로(`.md`·`.excalidraw`·`.canvas`·`.base`) **또는** basename이 볼트 어디에도 없으면 = **죽은 링크**(파일이 삭제·이름변경됨)로 **경고**.
- Obsidian의 basename 해석 + 비-md 타깃 + 표 이스케이프 파이프(`\|`) + macOS NFD/NFC를 모두 고려해 **오탐 최소화**.
- `--apply`에서도 **자동 삭제하지 않음**(삭제는 사람 판단) — 리포트만. 링크 갱신 또는 수동 정리.
- 이로써 "파일이 생기면(3) · 수정되면(2) · 없어지면(4) 알아서 반영"되는 인덱스 정합 루프 완성.

## 출력 예시

### dry-run (기본)

```
[canon-moc-sync] 모드: --dry-run | 볼트: 08_본선

[1/4] ✓ 중복 파일명(콘텐츠): 없음
       (시스템 내부 중복 3건은 정상 — 무시)
[2/4] frontmatter 누락: 1건
  - 08_본선/_분석/paperclip-레퍼런스-분석.md (누락: tags, date, up)
[3/4] ✓ MOC 누락 링크: 없음

[canon-moc-sync] dry-run 완료 — 수정 없음. --apply 로 실제 적용.
```

### apply

```
[canon-moc-sync] 모드: --apply | 볼트: 08_본선

[1/4] ✓ 중복 파일명(콘텐츠): 없음
[2/4] frontmatter 누락: 2건
  - 08_본선/02_전략/초안.md (누락: up)
  - 08_본선/_분석/분석.md (누락: tags, date, up)
[3/4] MOC 누락 링크: 1건
  _02_전략_MOC.md:
    + [[08_본선/02_전략/초안]]
  [link+] _02_전략_MOC.md ← [[08_본선/02_전략/초안]]
  [fm+]   08_본선/02_전략/초안.md (보정: up)
  [fm+]   08_본선/_분석/분석.md (보정: tags, date, up)

[canon-moc-sync] apply 완료 — 링크추가: 1건, frontmatter보정: 2건
```

## 주의사항

- MOC 파일 내용은 자동 추가만 함 — 기존 링크·테이블·섹션 수정 없음
- 표(table) 안에 행으로 넣으려면 Claude가 수동으로 편집
- `|설명` 파이프 뒤 표시 텍스트는 Claude가 맥락에 맞게 추가
- 중복 파일명은 에러가 아닌 경고 (exit code 0 유지)

## 연결

- [[collaboration-rules]] — 볼트 규칙 원본
- [[_HARNESS-SYSTEM]] — 하네스 시스템
- [[harness-sync]] — 오케스트레이터 (4단계에서 이 스킬 호출)
