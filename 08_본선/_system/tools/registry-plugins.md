---
tags:
  - area/system
  - type/registry
  - status/active
date: 2026-06-27
up: "[[_tools-index]]"
aliases:
  - 플러그인레지스트리
  - registry-plugins
---
# registry-plugins

> Claude Code 플러그인 레지스트리. `plugin-inventory.mjs` 실행 시 활성/비활성 표가 자동 재생성된다.
> 수동 수정은 <!-- MANUAL-NOTES --> 구역에만 — 나머지는 스크립트가 덮어씀.

---

## 🔄 프로젝트 동기화 세트 (project scope — 팀 자동 적용)

> **이 repo를 clone하면 아래 11종이 자동 적용됩니다.** SSOT = `.claude/settings.json`(git 추적, `enabledPlugins` + `extraKnownMarketplaces`). 팀원이 일일이 `/plugin install` 안 해도 됨. 적용: clone 후 Claude Code 재시작 → `/reload-plugins`. 인증 필요한 것(figma 등)은 각자 OAuth.

| 분류 | 플러그인 | 마켓플레이스 |
|------|---------|------------|
| 디자인(MVP 재설계) | `frontend-design` · `figma` | claude-plugins-official |
| 디자인 | `ui-ux-pro-max` | `github:nextlevelbuilder/ui-ux-pro-max-skill` |
| 개발·리뷰·문서 | `superpowers` · `code-simplifier` · `code-review` · `skill-creator` · `context7` | claude-plugins-official |
| Codex 연동 | `codex` | `github:openai/codex-plugin-cc` |
| 볼트 운영 | `obsidian` | `github:kepano/obsidian-skills` |
| 참조 | `example-skills` | anthropic-agent-skills |

> **제외**(개인 전역 ~/.claude 에만 둠, 팀 미동기화): `agent-sdk-dev` · `telegram` · `chrome-devtools-mcp` · `ponytail`(프로젝트 스코프에서 제외).
> ⚠️ 아래 자동생성 표(PLUGIN-REGISTRY)는 **개인 전역 기준**이라 위 프로젝트 세트와 다를 수 있음(`plugin-inventory.mjs`가 ~/.claude 읽음).

---

<!-- PLUGIN-REGISTRY-START -->
## 활성 플러그인 (enabledPlugins: true)

| 플러그인 | 마켓플레이스 | 상태 | 용도 | 본선 권장 | 팀 baseline |
|---------|------------|------|------|----------|------------|
| `obsidian` | obsidian-skills (`github:kepano/obsidian-skills`) | **활성** | 볼트 파일 읽기·쓰기·검색·태그 관리 | 필수 | ✅ baseline |
| `superpowers` | claude-plugins-official | **활성** | 브레인스토밍·병렬 에이전트·TDD·코드리뷰 슈퍼파워 | 필수 | ✅ baseline |
| `code-simplifier` | claude-plugins-official | **활성** | 코드 단순화·리팩터링 지원 | 권장 | — |
| `context7` | claude-plugins-official | **활성** | 라이브러리·프레임워크 최신 문서 조회 | 필수 | ✅ baseline |
| `skill-creator` | claude-plugins-official | **활성** | 스킬 정의·배포 자동화 | 필수 | ✅ baseline |
| `codex` | openai-codex (`github:openai/codex-plugin-cc`) | **활성** | Codex CLI 런타임 연동 | 필수 | ✅ baseline |
| `example-skills` | anthropic-agent-skills (`https://github.com/anthropics/skills.git`) | **활성** | 스킬 예시 참조 컬렉션 | 선택 | — |

---

## 비활성 플러그인 (설치 완료, 필요 시 활성화)

| 플러그인 | 마켓플레이스 | 상태 | 용도 | 본선 권장 |
|---------|------------|------|------|----------|
| `agent-sdk-dev` | claude-code-plugins | 비활성 | Anthropic Agent SDK 개발 지원 | 고급 선택 |
| `frontend-design` | claude-plugins-official | 비활성 | 프론트엔드 컴포넌트 설계·생성 | 디자이너 권장 |
| `ui-ux-pro-max` | ui-ux-pro-max-skill | 비활성 | UI/UX 고급 설계 지원 | 디자이너 권장 |
| `telegram` | claude-plugins-official | 비활성 | Telegram 메시징 연동 | 선택 |
| `figma` | claude-plugins-official | 비활성 | Figma 디자인 연동 (MCP 보완) | 디자이너 권장 |
| `chrome-devtools-mcp` | claude-plugins-official | 비활성 | Chrome DevTools 브라우저 디버깅 | QA 권장 |

---

## 등록된 마켓플레이스 (extraKnownMarketplaces)

| 마켓플레이스 ID | 소스 | 설명 |
|--------------|------|------|
| `obsidian-skills` | `github:kepano/obsidian-skills` | Obsidian 볼트 플러그인 |
| `openai-codex` | `github:openai/codex-plugin-cc` | OpenAI Codex CLI 연동 |
| `anthropic-agent-skills` | `https://github.com/anthropics/skills.git` | Anthropic 공식 에이전트 스킬 |
| `omc` | `https://github.com/Yeachan-Heo/oh-my-claudecode.git` | Oh My Claude Code |
<!-- PLUGIN-REGISTRY-END -->

---

## 팀원 설치 가이드 (fallback — 자동 동기화 안 될 때만)

> 기본은 위 **프로젝트 동기화 세트**(clone → 자동). 아래는 자동 적용이 안 되거나 개인 전역에 깔고 싶을 때의 수동 절차.

### 1단계 — 마켓플레이스 등록

```sh
# 비공식 마켓플레이스 4종 추가 (순서 무관)
/plugin marketplace add github:kepano/obsidian-skills
/plugin marketplace add github:openai/codex-plugin-cc
/plugin marketplace add git:https://github.com/anthropics/skills.git
/plugin marketplace add git:https://github.com/Yeachan-Heo/oh-my-claudecode.git
```

### 2단계 — Baseline 플러그인 설치 (Claude Code)

```sh
# 팀 baseline 5종 — 전원 필수
/plugin install obsidian@obsidian-skills
/plugin install superpowers@claude-plugins-official
/plugin install context7@claude-plugins-official
/plugin install skill-creator@claude-plugins-official
/plugin install codex@openai-codex
```

### 3단계 — 역할별 추가 설치

```sh
# 디자이너 권장
/plugin install frontend-design@claude-plugins-official
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
/plugin install figma@claude-plugins-official

# QA 권장
/plugin install chrome-devtools-mcp@claude-plugins-official

# 예시·참조용
/plugin install example-skills@anthropic-agent-skills
```

### 대안 — settings.json 직접 편집

`~/.claude/settings.json`의 `enabledPlugins` 배열에 `"obsidian@obsidian-skills"` 형식으로 추가하거나, `plugin-inventory.mjs`가 재생성한 값을 그대로 적용.

### Codex CLI 사용 시

Codex CLI는 별도 바이너리(`codex` 명령)를 설치한 뒤, `codex@openai-codex` 플러그인이 Claude Code와 런타임을 연동. 두 환경 모두 baseline 설치 권장.

---

<!-- MANUAL-NOTES -->
## 수동 메모

- 비활성 플러그인은 `settings.json → enabledPlugins` 배열에서 해당 행을 삭제하면 비활성 처리됨.
- `plugin-inventory.mjs`는 활성/비활성 표만 재생성하며 이 섹션(수동 메모)은 보존.
<!-- /MANUAL-NOTES -->

---

## 연결

- [[_tools-index|도구 인덱스]]
- [[_HARNESS-SYSTEM|하네스 시스템]]
- [[registry-mcp|MCP 레지스트리]]
- [[registry-skills|스킬 레지스트리]]
