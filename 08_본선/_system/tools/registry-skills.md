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

---

## 스킬 레지스트리

| 도구 | 종류 | 설치/와이어링 | 인증요부 | 상태 | 용도(본선) | 엔진(Claude/Codex) |
|------|------|-------------|---------|------|-----------|------------------|
| `notion-publish` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | Notion 페이지 발행 자동화 | Claude |
| `perplexity-web-mcp` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | Perplexity 세션 | 활성 | 웹 검색·AI 모델 쿼리 (pplx_*) | Claude |
| `verify` | 보유 스킬 (`/verify`) | 내장 슬래시 커맨드 | 없음 | 활성 | 코드 변경 실제 동작 검증 | Claude |
| `web-demo-video` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 시연 영상 자동 녹화 | Claude |
| `token-efficient-ops` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 컨텍스트 절약·배치 최적화 | Claude |
| `manage-skills` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 스킬 목록·활성화 관리 | Claude |
| `deep-research` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 멀티소스 팩트체크 리서치 | Claude |
| `humanize-korean` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | AI 문체 → 자연스러운 한국어 윤문 | Claude |
| `superpowers:*` | 보유 스킬 (묶음) | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 브레인스토밍·병렬에이전트·TDD·코드리뷰 등 | Claude |
| `obsidian:*` | 보유 스킬 (묶음) | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 옵시디언 Bases·Canvas·CLI·Markdown 관리 | Claude |
| `codex:*` | 보유 스킬 (묶음) | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | Codex CLI 런타임·결과 핸들링·GPT-5.4 프롬프트 | Codex |
| `example-skills:*` | 보유 스킬 (묶음) | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 알고리즘 아트·웹앱·슬랙 GIF 등 참조 예시 | Claude |
| `skill-creator` | 보유 스킬 | `~/.claude/skills/` 전역 등록 | 없음 | 활성 | 새 스킬 정의·생성 | Claude |
| **`telemetry-aggregator`** | **자체 구축 스킬** | `_system/skills/telemetry-aggregator/` → bootstrap → `.claude/skills/` | 없음 | **활성** | 세션 종료 시 텔레메트리 자동 집계·append | Claude |
| **`canon-moc-sync`** | **자체 구축 스킬** | `_system/skills/canon-moc-sync/` → bootstrap → `.claude/skills/` | 없음 | **활성** | MOC 정합성 자동 검증·동기화 | Claude |
| **`pii-governance-validator`** | **자체 구축 스킬** | `_system/skills/pii-governance-validator/` → bootstrap → `.claude/skills/` | 없음 | **활성** | 개인정보 거버넌스 자동 검증 | Claude |
| **`harness-sync`** | **자체 구축 스킬** | `_system/skills/harness-sync/` → bootstrap → `.claude/skills/` | 없음 | **활성** | 세션 체크포인트·종료 시 모든 시스템 파일 동기화 (8단계 루틴) | Claude |

---

## 서드파티 설치형 스킬 (외부 repo — 팀 동기화 대상)

> 외부 GitHub repo에서 설치하는 스킬. **소스를 우리 repo에 커밋하지 않고**(런타임은 `.agents/`·`.claude/` = gitignored), 팀원은 **bootstrap.sh STEP 3.5** 또는 `npx skills install`(락파일 기반)로 각자 설치한다. ⚠️ *코드를 전 권한으로 실행*하므로 설치 전 출처 확인 필수.

| 스킬 | 출처(검증) | 설치 | 인증/주의 | 상태 | 용도(본선) |
|------|-----------|------|----------|------|-----------|
| `design-taste-frontend` (Taste) | `Leonxlnx/taste-skill` (51.7k★, MIT, skills.sh: Safe/Low) | `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"` | 없음 | **설치됨** | MVP 재설계 — 레이아웃·타이포·모션 감각, generic UI 탈피 |
| `notebooklm` (skill) | `teng-lin/notebooklm-py` (16.9k★, MIT) | `notebooklm skill install --scope project` (CLI 선설치 필요) | ⚠️ **비공식**·구글 NotebookLM로 **데이터 외부전송** | **설치됨** | 리서치 리포트 grounded Q&A·요약(외부 출처 전용) |
| `impeccable` | `pbakaus/impeccable` (41.7k★, Apache-2.0) | `npx impeccable install` → `/impeccable init` (**대화식·프로젝트 훅 설치**) | 프로젝트 훅 추가(전역 하네스 무관) | **미설치(수동)** | 프론트엔드 결과물 디자인 마감 정제 |

> **`design-taste-frontend`는 `skills-lock.json`에 잠금** → 팀원은 repo clone 후 `npx skills install` 한 줄로 동일 버전 재현.
> **`impeccable`은 대화식 설치**(비대화 플래그 미동작·2분 타임아웃 확인)라 자동화 제외. 각자 터미널에서 위 명령 실행.

---

## 연결

- [[_tools-index|도구 인덱스]]
- [[_HARNESS-SYSTEM|하네스 시스템]]
- 자체 스킬 소스: `08_본선/_system/skills/`
- 서드파티 설치 동기화: `bootstrap.sh` STEP 3.5 · 루트 `skills-lock.json`
