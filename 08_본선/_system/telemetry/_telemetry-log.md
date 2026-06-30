---
tags:
  - area/system
  - type/log
  - status/active
date: 2026-06-27
up: "[[_HARNESS-SYSTEM]]"
aliases:
  - 텔레메트리로그
  - telemetry-log
---
# 텔레메트리 로그

> 대외비 — 6/29 공식발표 전 비공개.
> **append-only** — 절대 기존 행 수정 금지. 새 행은 표 하단에만 추가.

## 스키마

| 컬럼 | 설명 |
|------|------|
| 날짜 | YYYY-MM-DD |
| 트리거 | 세션종료 / 체크포인트 / 수동 |
| 사용 툴 | 주요 툴 목록 (횟수) |
| 토큰 합계 | 서브에이전트 누적 합산 (in/out 미분리 시 총량) |
| 소요 | 추정 소요시간 |
| 작업/산출물 | 수행 작업 요약 |
| 투입 에이전트/모델 | 에이전트명 + 모델 |
| 비고 | 특이사항 |

---

## 로그 테이블

| 날짜 | 트리거 | 사용 툴 | 토큰 합계 | 소요 | 작업/산출물 | 투입 에이전트/모델 | 비고 |
|------|--------|---------|-----------|------|------------|-------------------|------|
| 2026-06-26 | 수동 | Read, Bash, Agent | 53,087 | ~30min | 대회개요 탐색·정리 | general-purpose / sonnet | 본선 준비 Phase 1 |
| 2026-06-26 | 수동 | Read, Bash, Write | 25,518 | ~20min | 원천 인벤토리 구축 | general-purpose / haiku | 본선 준비 Phase 1 |
| 2026-06-26 | 수동 | Write, Edit, Read | 64,639 | ~40min | 대회 정본 작성 | general-purpose / haiku | 기능명세서 v1 |
| 2026-06-26 | 수동 | Read, Agent, Bash | 155,583 | ~90min | MVP 점검·분석 | general-purpose / sonnet | 현 제품 갭분석 |
| 2026-06-26 | 수동 | Write, Read, Agent | 71,170 | ~45min | 발표덱 아웃라인 작성 | general-purpose / sonnet | 본선 발표 준비 |
| 2026-06-26 | 수동 | Write, Edit, Agent | 82,912 | ~50min | 시연 시나리오 작성 | general-purpose / sonnet | 데모 시나리오 v1 |
| 2026-06-26 | 수동 | Read, Write, Agent | 71,470 | ~45min | 구조 청사진 작성 | general-purpose / sonnet | 시스템 아키텍처 설계 |
| 2026-06-27 | 수동 | Read, Bash, Agent | 74,125 | ~45min | paperclip 분석 | general-purpose / sonnet | 레퍼런스 역분석 |
| 2026-06-27 | 수동 | Write, Read, Bash | 78,428 | ~50min | 스캐폴드 빌더 | general-purpose / sonnet | 볼트 구조 생성 |
| 2026-06-27 | 수동 | Write, Read, Bash, Agent | — | ~60min | 인-볼트 메모리+운영 하네스 구축 | Orchestrator / sonnet | 이 세션 (하네스 시스템 구현) |

---

## 기록 시점 규칙

기록 시점: 세션종료(자동 훅 — `automation/session-telemetry.mjs`) / 체크포인트(작업 단위 완료 시 수동) / 수동(사용자 "기록해" 명령)

---

## 누적 통계

| 항목 | 값 |
|------|----|
| 총 세션 수 | 10 |
| 총 토큰 합계 | 676,932+ |
| 기간 | 2026-06-26 ~ 2026-06-27 |
| 주요 모델 | sonnet (7회), haiku (2회) |

---

## 연결

- [[_HARNESS-SYSTEM|하네스 시스템]]
- [[08_본선/_system/agents/_agent-registry|에이전트 레지스트리]]
- [[08_본선/_system/visualizations/tokens-time|토큰/시간 시각화]]
| 2026-06-26 19:39 | 세션종료 | — | 0/0 | — | — | (자동) | (트랜스크립트 없음) |
| 2026-06-26 19:39Z | 세션종료 | — | 0/0 | — | (트랜스크립트 없음) | direct | estimate |
| 2026-06-27 06:10Z | 세션종료 | Agent×10(opus),Read,Write,Edit,Bash | ~30000/~540000 | ~30m | 리서치 도메인 분해 Opus 2패스 + 딥프롬프트 19종 생성 | orchestrator | estimate |
| 2026-06-27 11:48Z | 세션종료 | codex-companion task×3 | —/— | running | 딥리서치 자동위임 D9·D10·D11(web_search·effort high) | gpt-5.3-codex-spark | estimate |
| 2026-06-27 11:48Z | 세션종료 | Bash,Skill,Write,Edit | ~20000/~30000 | ~15m | 엔진 배정(Perplexity5/Gemini11/Codex3)+실행 대시보드 | orchestrator | estimate |
| 2026-06-29 08:23 | 세션종료 | Bash×42, Read×19, Edit×16, Agent×10, Write×7, Skill×2 | 2663663/531834 | 60h30m | — | (자동) | (자동 기록 · cache_read 41856166) |
| 2026-06-29 08:30 | 세션종료 | Bash×422, Edit×214, Read×170, Write×81, Agent×56, TaskUpdate×47, AskUserQuestion×31, TaskCreate×27, ToolSearch×16, ExitPlanMode×6, SendMessage×5, WebFetch×5, mcp__claude-in-chrome__tabs_context_mcp×3, mcp__claude-in-chrome__computer×3, Skill×2, mcp__claude_ai_Excalidraw__read_me×1, mcp__claude_ai_Excalidraw__create_view×1, mcp__claude_ai_Excalidraw__export_to_excalidraw×1, mcp__claude-in-chrome__navigate×1, mcp__claude-in-chrome__get_page_text×1 | 12283538/4034779 | 401h59m | — | (자동) | (자동 기록 · cache_read 684403868) |
| 2026-06-29 08:58 | 세션종료 | Bash×42, Edit×24, Read×20, Agent×10, Write×8, Skill×2 | 2855382/584523 | 61h5m | — | (자동) | (자동 기록 · cache_read 49306386) |
| 2026-06-29 09:03 | 세션종료 | Bash×433, Edit×233, Read×181, Write×87, Agent×56, TaskUpdate×55, TaskCreate×32, AskUserQuestion×31, ToolSearch×16, ExitPlanMode×6, SendMessage×5, WebFetch×5, mcp__claude-in-chrome__tabs_context_mcp×3, mcp__claude-in-chrome__computer×3, Skill×2, mcp__claude_ai_Excalidraw__read_me×1, mcp__claude_ai_Excalidraw__create_view×1, mcp__claude_ai_Excalidraw__export_to_excalidraw×1, mcp__claude-in-chrome__navigate×1, mcp__claude-in-chrome__get_page_text×1 | 13340308/4266565 | 402h32m | — | (자동) | (자동 기록 · cache_read 721104899) |
| 2026-06-29 09:07 | 세션종료 | Bash×42, Edit×32, Read×20, Agent×10, Write×9, Skill×2 | 3049254/629524 | 61h13m | — | (자동) | (자동 기록 · cache_read 55283529) |
| 2026-06-30 03:57 | 세션종료 | Bash×439, Edit×237, Read×183, Write×87, Agent×56, TaskUpdate×55, TaskCreate×32, AskUserQuestion×31, ToolSearch×16, ExitPlanMode×6, SendMessage×5, WebFetch×5, mcp__claude-in-chrome__tabs_context_mcp×3, mcp__claude-in-chrome__computer×3, Skill×2, mcp__claude_ai_Excalidraw__read_me×1, mcp__claude_ai_Excalidraw__create_view×1, mcp__claude_ai_Excalidraw__export_to_excalidraw×1, mcp__claude-in-chrome__navigate×1, mcp__claude-in-chrome__get_page_text×1 | 14431859/4317837 | 421h25m | — | (자동) | (자동 기록 · cache_read 731144959) |
| 2026-06-30 04:00 | 세션종료 | Bash×48, Edit×48, Read×22, Agent×15, Write×13, Skill×2 | 7225686/843347 | 80h6m | — | (자동) | (자동 기록 · cache_read 77346578) |
| 2026-06-30 04:00 | 세션종료 | Bash×440, Edit×238, Read×183, Write×87, Agent×56, TaskUpdate×55, TaskCreate×32, AskUserQuestion×31, ToolSearch×16, ExitPlanMode×6, SendMessage×5, WebFetch×5, mcp__claude-in-chrome__tabs_context_mcp×3, Skill×3, mcp__claude-in-chrome__computer×3, mcp__claude_ai_Excalidraw__read_me×1, mcp__claude_ai_Excalidraw__create_view×1, mcp__claude_ai_Excalidraw__export_to_excalidraw×1, mcp__claude-in-chrome__navigate×1, mcp__claude-in-chrome__get_page_text×1 | 14584360/4333808 | 421h28m | — | (자동) | (자동 기록 · cache_read 735110622) |
| 2026-06-30 05:05 | 세션종료 | Edit×73, Bash×63, Read×22, Agent×18, Write×16, Skill×2 | 7742952/1141367 | 81h11m | — | (자동) | (자동 기록 · cache_read 129560431) |
| 2026-06-30 05:38 | 세션종료 | Edit×74, Bash×68, Read×23, Agent×18, Write×16, Skill×2 | 7793324/1178698 | 81h44m | — | (자동) | (자동 기록 · cache_read 144311978) |
| 2026-06-30 07:27 | 세션종료 | Edit×93, Bash×77, Read×36, Write×21, Agent×18, Skill×2 | 10021616/1381209 | 83h34m | — | (자동) | (자동 기록 · cache_read 210199901) |
| 2026-06-30 07:32 | 세션종료 | Edit×94, Bash×83, Read×36, Write×21, Agent×18, Skill×2 | 10080407/1425935 | 83h38m | — | (자동) | (자동 기록 · cache_read 224598343) |
| 2026-06-30 07:37 | 세션종료 | Edit×94, Bash×84, Read×36, Write×21, Agent×18, Skill×2 | 10090084/1430871 | 83h43m | — | (자동) | (자동 기록 · cache_read 229006025) |
| 2026-06-30 07:40 | 세션종료 | Edit×94, Bash×86, Read×36, Write×21, Agent×18, Skill×2 | 10099642/1442976 | 83h47m | — | (자동) | (자동 기록 · cache_read 233434220) |
