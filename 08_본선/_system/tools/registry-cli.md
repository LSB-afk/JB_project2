---
tags:
  - area/system
  - type/registry
  - status/active
date: 2026-06-27
up: "[[_tools-index]]"
aliases:
  - CLI레지스트리
  - registry-cli
---
# registry-cli

> 로컬 CLI 바이너리 및 프로젝트 전용 스크립트 레지스트리.
> 버전은 bootstrap.sh 전제 점검 시 자동 확인. 누락 시 설치 안내 메시지 출력.

---

## CLI / 로컬 레지스트리

| 도구 | 종류 | 설치/와이어링 | 인증요부 | 상태 | 용도(본선) | 엔진(Claude/Codex) |
|------|------|-------------|---------|------|-----------|------------------|
| `node` | 로컬 CLI | `brew install node` / `nvm install --lts` | 없음 | 활성 | 스크립트 실행 · Playwright · 빌드 | — |
| `python3` | 로컬 CLI | macOS 내장 or `brew install python` | 없음 | 활성 | 데이터 처리 · 분석 스크립트 | — |
| `gh` | 로컬 CLI | `brew install gh` → `gh auth login` | GitHub 계정 | 활성 | PR·이슈·Actions · 릴리즈 | — |
| `pandoc` | 로컬 CLI | `brew install pandoc` | 없음 | 활성 | Markdown → DOCX/PDF/HTML 변환 | — |
| `ffmpeg` | 로컬 CLI | `brew install ffmpeg` | 없음 | 활성 | 시연 영상 인코딩·편집 | — |
| `Playwright` | 로컬 CLI | `npm install -g playwright` → `playwright install` | 없음 | 활성 | E2E 테스트 · 브라우저 자동화 | — |
| `render_mermaid.mjs` | 프로젝트 스크립트 | `02_제품/scripts/render_mermaid.mjs` | 없음 | 활성 | Mermaid 다이어그램 → PNG 렌더링 | node |
| `record_demo.mjs` | 프로젝트 스크립트 | `02_제품/scripts/record_demo.mjs` | 없음 | 활성 | 시연 시나리오 자동 녹화 (Playwright 기반) | node |
| `uv` | 로컬 CLI | `curl -LsSf https://astral.sh/uv/install.sh \| sh` or `brew install uv` | 없음 | 활성 | 파이썬 툴/패키지 격리 설치 (notebooklm 등) | — |
| `npx skills` | 패키지 러너 | `npx skills <add\|install>` (vercel-labs/agent-skills) | 없음 | 활성 | 서드파티 에이전트 스킬 설치·락파일 동기화 | Claude/Codex |
| `notebooklm` | 로컬 CLI | `uv tool install "notebooklm-py[browser]"` | ⚠️ 비공식·구글 외부전송 | **활성** | NotebookLM grounded 리서치(외부 출처 전용) | Claude/Codex |
| `firecrawl` | 로컬 CLI(SDK/API) | `npm i -g @mendable/firecrawl-js` (호스티드 API) | **API 키 필요** | 미설치(문서) | 공개 웹 스크래핑(공공데이터, **공개 출처 전용**) | node |
| `lightrag` (lib) | 파이썬 라이브러리 | `uv pip install lightrag-hku` (**백엔드 단계**) | LLM/임베딩 키 | 미설치(문서) | 백엔드 RAG(공공·내부문서) 구성요소 — 구현 phase | python |

---

## 전제 점검 명령

```sh
# bootstrap.sh --dry-run 이 아래 명령을 순서대로 실행
node  --version
python3 --version
gh    --version
pandoc --version
ffmpeg -version
npx playwright --version
```

---

## 프로젝트 스크립트 사용 예시

```sh
# Mermaid 렌더링
node 02_제품/scripts/render_mermaid.mjs <input.md> <output.png>

# 시연 영상 녹화
node 02_제품/scripts/record_demo.mjs --scenario <scenario.json>
```

---

## 연결

- [[_tools-index|도구 인덱스]]
- [[_HARNESS-SYSTEM|하네스 시스템]]
