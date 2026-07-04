---
name: submission-consistency-check
description: 제출·발표 산출물(PRD·MVP범위·기능명세서·제출체크리스트·시연 시나리오·최종검증·AI리포트) 사이의 히어로 시나리오·MVP 범위(P0/P1)·검증 기준·제품정의(타겟·차별점)·수치/용어 불일치를 교차 탐지. 제품정의·범위·시나리오가 바뀌었거나 제출물을 갱신/제출하기 전에 사용. 예선(SME 카페) ↔ 본선(2계열사·전세) 같은 프레이밍 충돌을 잡는 고위험 제출 전용 감사.
tags:
  - area/system
  - type/skill
  - status/active
date: 2026-07-01
up: "[[_tools-index]]"
aliases:
  - 제출정합성검사
  - submission-consistency-check
---
# submission-consistency-check

> 제출/발표 직결 문서들이 **서로 모순되지 않는가**를 감사한다. 구조 정합(링크·태그)은 [[canon-moc-sync]], 이건 **내용(시나리오·범위·기준) 정합**. judge-qa 역할을 스킬로 operationalize.

## 언제
- **제품정의·MVP 범위·히어로 시나리오가 바뀐 직후**(예: 6/30 회의로 타겟이 2계열사·전세로 이동 → 예선 SME-카페 프레이밍이 잔존하는지).
- **제출물 갱신/제출 전**(submission 역할은 **사람 승인** 게이트).

## 교차 점검 대상
- 제품: `03_제품/docs/06_prd.md` · `mvp-scope.md` · `00_vision/core-bet`
- 제출: `05_제출/submission-checklist.md` · `live-final-verification.md` · `ai-report-final.md` · `00_제출/기능명세서`·`발표자료`
- 시연: `00_제출/본선-시연-시나리오` · `_system/visualizations/demo-*`·`golden-path`·`storyboard`
- 정본: `_canon`(예선)·`08_본선/_system/memory/context/제품-정의`(본선 SSOT)

## 점검 차원 (불일치 탐지)
1. **히어로 시나리오 일치** — 모든 문서가 같은 대표 시나리오를 쓰나? (예선 "전주 중앙로 카페(SME)" vs 본선 "2계열사·전세사기/보이스피싱" — 어느 것이 본선 히어로인지 단일화).
2. **MVP 범위(P0/P1)** — prd/mvp-scope/체크리스트의 In/Out·우선순위가 서로 같나.
3. **검증 기준** — live-final-verification·judge 시뮬·심사 25항목 매핑이 제품 기능과 일치하나.
4. **제품정의(타겟·차별점)** — 2계열사(은행1+JB우리캐피탈)·확장성·로컬모델·조직도UI가 PRD·발표·리포트에 일관 반영됐나.
5. **수치·용어 = SSOT** — 통계·법령·계열사명은 `_canon`/제품-정의 정본과 일치(미검증 회의 수치 혼입 금지).

## 산출
- `05_제출/submission-consistency-report.md`(frontmatter+up:`[[_05_제출_MOC]]`): **불일치 목록**(문서A↔문서B, 차원, 심각도) + **수정 우선순위**(제출 직결=고). 자동 수정 안 함 — 불일치는 **제품 결정**을 동반하므로 보고만, 결정은 [[decision-log]]·orchestrator.

## 가드레일
- `_canon`/제품-정의가 사실 SSOT. **외부 제출·공개는 사람 승인.** 회의 STT 미검증 수치 반영 금지. 끝에 [[canon-moc-sync]]로 새 리포트 도달성 확인.
