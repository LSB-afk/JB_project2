---
name: log-toc
description: 04_증빙/01_핵심로그의 append-only 로그(session-log·decision-log·프롬프트-로그)에 자동 목차(TOC) 블록을 삽입·갱신하는 스킬
tags:
  - area/system
  - type/skill
  - status/active
date: 2026-07-04
up: "[[_tools-index]]"
---
# log-toc

> `generate.mjs`를 실행하거나 "로그 목차 갱신해줘"/핵심로그에 새 항목 append 시 동작.

## 목적

`session-log.md`·`decision-log.md`·`프롬프트-로그.md`는 append-only라 매 세션 계속 길어진다(2026-07-04 기준 각각 69·51·141개 항목, 605·295·968줄). 새 세션이나 팀원이 특정 날짜·주제를 찾으려면 지금까지는 파일 **전체**를 읽어야 했다 — AI든 사람이든 마찬가지다.

이 스킬은 각 로그의 frontmatter/안내문 바로 다음에 `<!-- TOC:AUTO --> ... <!-- /TOC:AUTO -->` 블록을 삽입해, `##`/`###` 헤딩을 전부 나열한 목차를 만든다. 옵시디언에서는 `[[#헤딩]]` 클릭으로 바로 이동하고, AI는 목차만 먼저 훑어 필요한 구간만 `Read`(offset/limit)나 grep으로 골라 읽을 수 있다 — 매번 전체를 읽지 않아도 된다.

## 실행

```bash
# 프로젝트 루트에서
node 08_본선/_system/skills/log-toc/generate.mjs            # 실제 적용
node 08_본선/_system/skills/log-toc/generate.mjs --dry-run  # 점검만 (파일 변경 없음)
```

`CLAUDE_PROJECT_DIR` 환경변수가 없으면 `cwd`를 프로젝트 루트로 간주한다.

## 동작 방식

1. 대상 파일에서 기존 `TOC:AUTO` 블록이 있으면 제거(멱등 재실행 대비).
2. frontmatter(`---`) → 첫 `# ` 제목 → 안내 인용문(`>`) 다음, 첫 헤딩 직전을 삽입 위치로 판단.
3. 그 이후의 모든 `##`(1단)·`###`(2단, 들여쓰기)를 순서대로 수집해 `- [[#헤딩 텍스트]]` 목록 생성.
4. 삽입 위치에 새 TOC 블록을 쓴다. 헤딩이 하나도 없으면 건드리지 않음(`NO-HEADINGS`).

## 대상 파일 (하드코딩, 추가 시 `generate.mjs`의 `TARGETS` 배열 수정)

- `08_본선/04_증빙/01_핵심로그/session-log.md`
- `08_본선/04_증빙/01_핵심로그/decision-log.md`
- `08_본선/04_증빙/01_핵심로그/프롬프트-로그.md`

> `master-evidence-ledger.md`는 31줄·헤딩 3개뿐이라 대상에서 제외(이미 그 자체가 다른 로그들의 인덱스 역할).

## 주의사항

- TOC 블록 안은 **직접 편집 금지** — 다음 실행 시 통째로 덮어씀. 로그 본문(항목 추가)은 평소처럼 append.
- `[[#헤딩]]`은 옵시디언 same-file 헤딩 링크라 `canon-moc-sync`의 죽은링크 검사와 충돌하지 않음(실행 확인됨, 2026-07-04).
- `harness-sync` 자동 단계(7번)로 편입되어 세션 체크포인트마다 자동 재생성된다 — 수동 실행은 즉시 반영이 필요할 때만.

## 연결

- [[harness-sync|harness-sync (7단계로 이 스킬 호출)]]
- [[_HARNESS-SYSTEM|하네스 시스템]]
- [[session-log]] · [[decision-log]] · [[프롬프트-로그]]
