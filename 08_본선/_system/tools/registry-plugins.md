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

> **이 repo를 clone하면 아래 13종이 자동 적용됩니다.** SSOT = `.claude/settings.json`(git 추적, `enabledPlugins` + `extraKnownMarketplaces`). 팀원이 일일이 `/plugin install` 안 해도 됨. 적용: clone 후 Claude Code 재시작 → `/reload-plugins`, 또는 `plugin-sync` 스킬(아래). 인증 필요한 것(figma 등)은 각자 OAuth.

| 분류 | 플러그인 | 마켓플레이스 |
|------|---------|------------|
| 디자인(MVP 재설계) | `frontend-design` · `figma` | claude-plugins-official |
| 디자인 | `ui-ux-pro-max` | `github:nextlevelbuilder/ui-ux-pro-max-skill` |
| 개발·리뷰·문서 | `superpowers` · `code-simplifier` · `code-review` · `skill-creator` · `context7` | claude-plugins-official |
| Codex 연동 | `codex` | `github:openai/codex-plugin-cc` |
| 볼트 운영 | `obsidian` | `github:kepano/obsidian-skills` |
| 문서·윤문 | `humanize-korean` | `github:epoko77-ai/im-not-ai` |
| 문서 방법론 | `harness-engineering` | `github:River-181/harness-engineering-skills` |
| 참조 | `example-skills` | anthropic-agent-skills |

> **제외**(개인 전역 ~/.claude 에만 둠, 팀 미동기화): `agent-sdk-dev` · `ponytail` · `taste-skill` · `oh-my-claudecode(omc)` · `telegram` · `chrome-devtools-mcp`.
> ⚠️ 아래 자동생성 표(PLUGIN-REGISTRY)는 **개인 전역 기준**이라 위 프로젝트 세트와 다를 수 있음(`plugin-inventory.mjs`가 ~/.claude 읽음).

---

<!-- PLUGIN-REGISTRY-START -->
## 활성 플러그인 (enabledPlugins: true)

| 플러그인 | 마켓플레이스 | 상태 | 용도 | 본선 권장 | 팀 baseline |
|---------|------------|------|------|----------|------------|
| `frontend-design` | claude-plugins-official | **활성** | 프론트엔드 컴포넌트 설계·생성 | 필수(MVP 재설계) | ✅ baseline |
| `ui-ux-pro-max` | ui-ux-pro-max-skill | **활성** | UI/UX 고급 설계 지원 | 필수(MVP 재설계) | ✅ baseline |
| `figma` | claude-plugins-official | **활성** | Figma 디자인 연동 (MCP 보완) | 필수(MVP 재설계) | ✅ baseline |
| `obsidian` | obsidian-skills (`github:kepano/obsidian-skills`) | **활성** | 볼트 파일 읽기·쓰기·검색·태그 관리 | 필수 | ✅ baseline |
| `superpowers` | claude-plugins-official | **활성** | 브레인스토밍·병렬 에이전트·TDD·코드리뷰 슈퍼파워 | 필수 | ✅ baseline |
| `code-simplifier` | claude-plugins-official | **활성** | 코드 단순화·리팩터링 지원 | 권장 | — |
| `code-review` | claude-plugins-official | **활성** | 코드 리뷰·개선 지원 | 필수 | ✅ baseline |
| `context7` | claude-plugins-official | **활성** | 라이브러리·프레임워크 최신 문서 조회 | 필수 | ✅ baseline |
| `skill-creator` | claude-plugins-official | **활성** | 스킬 정의·배포 자동화 | 필수 | ✅ baseline |
| `codex` | openai-codex (`github:openai/codex-plugin-cc`) | **활성** | Codex CLI 런타임 연동 | 필수 | ✅ baseline |
| `example-skills` | anthropic-agent-skills (`https://github.com/anthropics/skills.git`) | **활성** | 스킬 예시 참조 컬렉션 | 선택 | — |
| `humanize-korean` | im-not-ai (`github:epoko77-ai/im-not-ai`) | **활성** | 한국어 윤문·AI 티 제거 | 권장 | ✅ baseline |
| `ponytail` | claude-plugins-official | **활성** | 효율적 개발·게으른 엔지니어 패턴 | 개인 선택 | — |
| `taste-skill` | taste-skill | **활성** | UI/UX 설계 감각·미학 | 개인 선택 | — |
| `agent-sdk-dev` | claude-code-plugins | **활성** | Anthropic Agent SDK 개발 지원 | 개인 선택 | — |

---

## 비활성 플러그인 (설치 완료, 필요 시 활성화)

| 플러그인 | 마켓플레이스 | 상태 | 용도 | 본선 권장 |
|---------|------------|------|------|----------|
| `telegram` | claude-plugins-official | 비활성 | Telegram 메시징 연동 | 선택 |
| `chrome-devtools-mcp` | claude-plugins-official | 비활성 | Chrome DevTools 브라우저 디버깅 | QA 권장 |
| `oh-my-claudecode` | oh-my-claudecode (`github:Yeachan-Heo/oh-my-claudecode.git`) | 비활성 | Claude Code 커스터마이징 | 선택 |

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

## 팀원 설치·동기화 (자동 — plugin-sync 스킬)

> 설치·동기화는 **`plugin-sync` 스킬**이 전담한다(상세: `08_본선/_system/skills/plugin-sync/SKILL.md`). 명령 목록을 손으로 이중관리하지 않고 SSOT(`.claude/settings.json`) 하나에서 파생 → 표류 없음.

```sh
node 08_본선/_system/skills/plugin-sync/sync.mjs --dry-run   # 설치 명령 미리보기(= 항상 최신 정본)
node 08_본선/_system/skills/plugin-sync/sync.mjs             # 실제 설치·동기화(멱등·재실행 안전)
node 08_본선/_system/skills/plugin-sync/sync.mjs --global    # 개인 전역 세트까지
```

수동 fallback: Claude Code에서 `/plugin marketplace add <소스>` → `/plugin install <플러그인@마켓>`. 소스·플러그인 목록은 위 `--dry-run` 출력을 그대로 사용(하드코딩 목록은 표류하므로 두지 않음). Codex CLI는 별도 바이너리(`codex`) 설치 후 `codex@openai-codex`가 런타임 연동.

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

