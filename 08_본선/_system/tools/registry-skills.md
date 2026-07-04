---
tags:
  - area/system
  - type/registry
  - status/active
date: 2026-06-27
up: "[[_tools-index]]"
aliases:
  - 스킬레지스트리
  - registry-skills
---
# registry-skills

> Claude Code 스킬 레지스트리 — 보유 스킬(글로벌·프로젝트) + 자체 구축 스킬.
> 자체 구축 스킬은 `08_본선/_system/skills/` 하위에 버전 관리되며 bootstrap.sh로 배포.

> **팀 전체 스킬 목록 = 이 문서.** 동기화 방법 — 자체 구축 스킬 = bootstrap.sh(`.claude/skills/`), 표준 스킬 = `~/.claude/skills/`, 플러그인 번들 스킬 = plugin-sync/[[registry-plugins]].

---

## 스킬 레지스트리

| 도구 | 종류 | 설치/와이어링 | 인증요부 | 상태 | 용도(본선) | 엔진(Claude/Codex) |
|------|------|-------------|---------|------|-----------|------------------|
| `notion-publish` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | Notion 페이지 발행 자동화 | Claude |
| `perplexity-web-mcp` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | Perplexity 세션 | 활성 | 웹 검색·AI 모델 쿼리 (pplx_*) | Claude |
| `verify-implementation` | 보유 스킬 (`/verify`) | 내장 슬래시 커맨드 | 없음 | 활성 | 코드 변경 실제 동작 검증 | Claude |
| `web-demo-video` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 시연 영상 자동 녹화 | Claude |
| `token-efficient-ops` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 토큰 절약 배치 최적화 | Claude |
| `manage-skills` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 스킬 목록·활성화 관리 | Claude |
| `deep-research` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 멀티소스 팩트체크 리서치 | Claude |
| `humanize-korean` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | AI 문체 → 자연스러운 한국어 윤문 | Claude |
| `humanize` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 윤문 진입 명령 | Claude |
| `humanize-redo` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 2차 재윤문 | Claude |
| `mac-storage-cleanup` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | macOS 저장공간 정리 | Claude |
| `superpowers:*` | 보유 스킬 (묶음) | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 브레인스토밍·병렬에이전트·TDD·코드리뷰 등 | Claude |
| `obsidian:*` | 보유 스킬 (묶음) | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 옵시디언 Bases·Canvas·CLI·Markdown 관리 | Claude |
| `codex:*` | 보유 스킬 (묶음) | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | Codex CLI 런타임·결과 핸들링·GPT-5.4 프롬프트 | Codex |
| `example-skills:*` | 보유 스킬 (묶음) | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 알고리즘 아트·웹앱·슬랙 GIF 등 참조 예시 | Claude |
| `skill-creator` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 새 스킬 정의·생성 | Claude |
| **`telemetry-aggregator`** | **자체 구축 스킬** | `_system/skills/telemetry-aggregator/` → bootstrap → `.claude/skills/` | 없음 | **활성** | 세션 종료 시 텔레메트리 자동 집계·append | Claude |
| **`canon-moc-sync`** | **자체 구축 스킬** | `_system/skills/canon-moc-sync/` → bootstrap → `.claude/skills/` | 없음 | **활성** | MOC·**부모(up)·태그·죽은링크·도달성(조상→자식 네비) 5단계** 정합성 검증·동기화 | Claude |
| **`meeting-intake`** | **자체 구축 스킬** | `_system/skills/meeting-intake/` → bootstrap → `.claude/skills/` | 없음 | **활성** | 회의 STT → 원문(gitignore)+회의록(추적)+인덱스·메모리·거버넌스 일관 기록 | Claude |
| **`pii-governance-validator`** | **자체 구축 스킬** | `_system/skills/pii-governance-validator/` → bootstrap → `.claude/skills/` | 없음 | **활성** | 개인정보 거버넌스 자동 검증 | Claude |
| **`visualization-cycle`** | **자체 구축 스킬** | `_system/skills/visualization-cycle/` → bootstrap → `.claude/skills/` | 없음 | **활성** | 시각화 기획 선행·Excalidraw 재생성·JSON/인덱스·간트 갭·5초 가독성 검증 | Claude/Codex |
| **`harness-sync`** | **자체 구축 스킬** | `_system/skills/harness-sync/` → bootstrap → `.claude/skills/` | 없음 | **활성** | 세션 체크포인트·종료 시 모든 시스템 파일 동기화 (9단계 루틴) | Claude |
| **`prompt-capture`** | **자체 구축 스킬** | `_system/skills/prompt-capture/` → bootstrap → `.claude/skills/` | 없음 | **활성** | 세션 프롬프트를 분기코드(S/R/T)로 분류해 [[프롬프트-로그]] 멱등 append (extract-prompts.mjs + AI 판단). Capture-by-default 완성 | Claude |
| **`tool-intake`** | **자체 구축 스킬** | `_system/skills/tool-intake/` → bootstrap → `.claude/skills/` | 없음 | **활성** | 신규 도구 도입 6단계(출처검증→SkillSpector 스캔→레지스트리→bootstrap 게이트→메모리 트리거→로그) | Claude/Codex |
| **`session-boot`** | **자체 구축 스킬** | `_system/skills/session-boot/` → bootstrap → `.claude/skills/` | 없음 | **활성** | 새 세션 오리엔테이션 — 진입점·현재상태(미커밋·미해결·다음)·자동스킬·게이트 한 번에 로드(boot.mjs 스냅샷). CLAUDE.md가 본선 작업 시작 시 자동 호출 | Claude/Codex |
| **`submission-consistency-check`** | **자체 구축 스킬** | `_system/skills/submission-consistency-check/` → bootstrap → `.claude/skills/` | 없음 | **활성** | 제출·발표 문서 간 히어로 시나리오·MVP 범위·검증기준·제품정의 **내용 불일치** 교차 감사(예선 SME↔본선 2계열사 충돌 등) | Claude |
| **`plugin-sync`** | **자체 구축 스킬** | `_system/skills/plugin-sync/` → bootstrap → `.claude/skills/` | 없음 | **활성(bootstrap SKILL_DIRS 등록 승인대기)** | 커밋 settings.json(팀 세트)에서 플러그인 마켓플레이스+세트 재설치·동기화(설치가이드=--dry-run). harness-sync의 plugin-inventory와 방향 반대(오염없는 재현) | Claude/Codex |
| **`local-model`** | **자체 구축 스킬** | `_system/skills/local-model/` → bootstrap → `.claude/skills/` | 없음 | **활성** | Ollama로 EXAONE 3.5 / Qwen2.5 로컬 추론, PII 포함 요청 안전 처리 | Claude |
| **`log-toc`** | **자체 구축 스킬** | `_system/skills/log-toc/` → bootstrap → `.claude/skills/` | 없음 | **활성** | 핵심로그 3종(session-log·decision-log·프롬프트-로그)에 `<!-- TOC:AUTO -->` 목차 블록 삽입·갱신 — harness-sync 7단계로 자동 편입 | Claude |
| **`harness-audit`** | **자체 구축 스킬(Workflow형)** | `_system/skills/harness-audit/workflow.js` — `node` 단독 실행 불가, Claude Code `Workflow` 툴로만 호출 | 없음 | **활성** | 9차원(파이프라인·데드파일·층위·정본/레퍼런스·git·기타·역할registry·CC서브에이전트·에이전트토큰registry) 병렬 감사 + 교차검증. 자동 시행 대상 아님(사용자 요청 시만) | Claude |

---

## 플러그인 제공 스킬

> 설치된 플러그인은 각각 번들 스킬을 제공한다. 상세 목록·동기화는 [[registry-plugins]] 참조. 팀 세트(12종): `frontend-design` · `ui-ux-pro-max` · `figma` · `obsidian` · `superpowers` · `code-simplifier` · `context7` · `skill-creator` · `codex` · `code-review` · `example-skills` · `humanize-korean`. 개인 전역(3종): `ponytail` · `taste-skill` · `agent-sdk-dev`.

---

## 후보 스킬 (아이디어 등록 — 트리거 충족 시 구축, 미구현)

> 가치는 있으나 **감사 대상이 아직 충분치 않거나 기존 스킬과 근접**해 보류. 트리거 충족 시 orchestrator가 구축 승격. (cf. 후보 에이전트 [[AGENTS]] §2-A 패턴)

| 후보 | 역할 | 보류 사유 | 구축 트리거 |
|------|------|----------|------------|
| `workflow-gap-audit` | 간트/시각화가 PLAN·PROGRESS·PRD·제출 문서와 정합한지 갭 감사 | [[visualization-cycle]]이 간트·`workflow-gantt-flow-gap-audit.md`를 이미 소유 — **별도 스킬보다 cycle "검증" 확장 권장** | cycle 검증으로 부족하다고 판명 시 분리 |
| `demo-readiness-audit` | 시연 5분 완주·로컬서버·폴백·영상·리허설 감사 | **감사할 실제 시연(runnable)이 아직 없음**(MVP 재설계 중) — YAGNI | MVP 데모 실구동 가능 시 / 리허설(7/3+) |

### 기각(중복) — 기존으로 흡수
- `product-decision-ledger` → **[[decision-log]]**(append-only 결정 원장)에 제품 결정 기록. 미정 결정(전북/광주·배포vs로컬·DB범위)은 [[PROGRESS]] 제품 섹션에 추적.
- `visual-brief-audit` → **[[visualization-cycle]]** "검증" 단계에 보드 가독성(5초 메시지·기여·근거·다음액션) 체크로 흡수. 현재 `run.mjs`가 필수 보드 메타 박스와 간트/기여 보드의 사람·AI·진척률 레이어를 검사.

---

## 서드파티 설치형 스킬 (외부 repo — 팀 동기화 대상)

> 외부 GitHub repo에서 설치하는 스킬. **소스를 우리 repo에 커밋하지 않고**(런타임은 `.agents/`·`.claude/` = gitignored), 팀원은 **bootstrap.sh STEP 3.5** 또는 `npx skills install`(락파일 기반)로 각자 설치한다. ⚠️ *코드를 전 권한으로 실행*하므로 설치 전 출처 확인 필수.

| 스킬                              | 출처(검증)                                                    | 설치                                                                                       | 인증/주의                                  | 상태          | 용도(본선)                                  |
| ------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------- | ----------- | --------------------------------------- |
| `design-taste-frontend` (Taste) | `Leonxlnx/taste-skill` (51.7k★, MIT, skills.sh: Safe/Low) | `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"` | 없음                                     | **설치됨**     | MVP 재설계 — 레이아웃·타이포·모션 감각, generic UI 탈피 |
| `notebooklm` (skill)            | `teng-lin/notebooklm-py` (16.9k★, MIT)                    | `notebooklm skill install --scope project` (CLI 선설치 필요)                                  | ⚠️ **비공식**·구글 NotebookLM로 **데이터 외부전송** | **설치됨**     | 리서치 리포트 grounded Q&A·요약(외부 출처 전용)       |
| `impeccable`                    | `pbakaus/impeccable` (41.7k★, Apache-2.0)                 | `npx impeccable install` → `/impeccable init` (**대화식·프로젝트 훅 설치**)                        | 프로젝트 훅 추가(전역 하네스 무관)                   | **미설치(수동)** | 프론트엔드 결과물 디자인 마감 정제                     |

> **`design-taste-frontend`는 `skills-lock.json`에 잠금** → 팀원은 repo clone 후 `npx skills install` 한 줄로 동일 버전 재현.
> **`impeccable`은 대화식 설치**(비대화 플래그 미동작·2분 타임아웃 확인)라 자동화 제외. 각자 터미널에서 위 명령 실행.

---

## 연결

- [[_tools-index|도구 인덱스]]
- [[_HARNESS-SYSTEM|하네스 시스템]]
- 자체 스킬 소스: `08_본선/_system/skills/`
- 서드파티 설치 동기화: `bootstrap.sh` STEP 3.5 · 루트 `skills-lock.json`
