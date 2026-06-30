---
tags:
  - area/system
  - type/registry
  - status/active
date: 2026-06-27
up: "[[_tools-index]]"
aliases:
  - MCP레지스트리
  - registry-mcp
---
# registry-mcp

> 세션 MCP(Model Context Protocol) 서버 레지스트리.
> 와이어링은 `claude mcp add <name> <command>` 또는 settings.json으로 등록.
> 인증이 필요한 서버는 `claude mcp add` 후 별도 OAuth/토큰 플로우 필요 — bootstrap.sh는 echo 안내만 출력하고 자동 인증을 실행하지 않는다.
> ⚠️ **팀 동기화 범위**: 플러그인은 `.claude/settings.json`(project scope)으로 clone 시 자동 적용되지만, **MCP 서버는 인증 때문에 자동 동기화되지 않는다** — 팀원 각자 위 명령을 실행하고 본인 계정으로 인증해야 한다. 협업 채널(Discord·Syncthing 등)은 [[registry-integrations]] 참조.

---

## MCP 레지스트리

| 도구 | 종류 | 설치/와이어링 | 인증요부 | 상태 | 용도(본선) | 엔진(Claude/Codex) |
|------|------|-------------|---------|------|-----------|------------------|
| `claude-in-chrome` | 세션 MCP | `claude mcp add claude-in-chrome` | Chrome 확장 권한 | 활성 | 브라우저 자동화·스크린샷·콘솔·네트워크 | Claude |
| `perplexity` | 세션 MCP | `claude mcp add perplexity` | Perplexity 계정 | 활성 | 웹 검색 (Sonar/Pro Search/Deep Research) | Claude |
| `context7` | 세션 MCP | `claude mcp add context7` | 없음 | 활성 | 라이브러리 최신 문서 (npm/pip/github) | Claude |
| `figma` | 세션 MCP | `claude mcp add claude.ai/Figma` | Figma 계정 OAuth | 활성 | 디자인 읽기·쓰기·Code Connect·FigJam | Claude |
| `notion` | 세션 MCP | `claude mcp add claude.ai/Notion` | Notion 통합 토큰 | 활성 | 페이지·데이터베이스 CRUD, 검색 | Claude |
| `google-calendar` | 세션 MCP | `claude mcp add claude.ai/Google_Calendar` | Google OAuth | 활성 | 일정 생성·조회·수정·시간 추천 | Claude |
| `google-drive` | 세션 MCP | `claude mcp add claude.ai/Google_Drive` | Google OAuth | 활성 | 파일 업로드·다운로드·검색·권한 관리 | Claude |
| `excalidraw` | 세션 MCP | `claude mcp add claude.ai/Excalidraw` | 없음 | 활성 | 다이어그램 생성·편집·체크포인트 저장 | Claude |
| `hwp-mcp` | 세션 MCP (settings.json stdio) | `uvx --from hwp-mcp hwp-mcp` | 없음 | **활성** | 한글(.hwp/.hwpx/.docx) 문서 읽기·편집 | Claude |
| `gmail` | 세션 MCP | `claude mcp add claude.ai/Gmail` | Google OAuth | 활성 | 이메일 송수신·검색 | Claude |
| **`GitHub MCP`** | **웹 추천** | `claude mcp add github` (검증 후) | GitHub PAT | **검증 후 사용** | PR·이슈·코드 검색·Actions 연동 | Claude |
| **`Obsidian MCP`** | **웹 추천** | `claude mcp add obsidian-mcp` (검증 후) | 없음 | **검증 후 사용** | 볼트 직접 읽기·쓰기 (플러그인 보완) | Claude |
| **`Notion MCP (공식)`** | **웹 추천** | `claude mcp add notion` (검증 후) | Notion 통합 토큰 | **검증 후 사용** | 현재 세션 MCP 대체 또는 보완 | Claude |

---

## 인증 절차 요약

```
google-calendar / google-drive / gmail:
  claude mcp add <name> → 세션에서 mcp__*__authenticate 호출 → OAuth 플로우

figma:
  claude mcp add claude.ai/Figma → Figma 계정 로그인

notion:
  claude mcp add claude.ai/Notion → Notion 통합 페이지에서 토큰 발급

hwp-mcp / excalidraw / context7:
  인증 불필요 — 설치 후 즉시 사용
```

---

<!-- MCP-SETTINGS-START -->
## settings.json 등록 MCP 서버 (자동 생성)

| 서버명 | 실행 방식 | 커맨드 | 상태 | 용도 |
|-------|---------|--------|------|------|
| `hwp-mcp` | stdio | `uvx --from hwp-mcp hwp-mcp` | 활성 | 한글(.hwp/.hwpx/.docx) 문서 읽기·편집 |
<!-- MCP-SETTINGS-END -->

---

## 연결

- [[_tools-index|도구 인덱스]]
- [[_HARNESS-SYSTEM|하네스 시스템]]
- [[registry-commands|커맨드 레지스트리]] (MCP 추가 커맨드 참조)
