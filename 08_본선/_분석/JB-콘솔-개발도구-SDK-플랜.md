---
tags:
  - area/product
  - type/plan
  - status/active
date: 2026-07-02
up: "[[_03_제품_MOC]]"
aliases:
  - JB-콘솔-개발도구-SDK-플랜
  - jb-console-devtools-sdk
---
> **[대외비]** 팀 내부 레퍼런스. fork(`~/project/active/paperclip-jb-fork`, `jb-console`)를 케이스 운영 콘솔로 재구현하는 데 쓰는 **개발 도구·SDK·플러그인/스킬 사용 플랜**. 사용자 요청(P20) 정본. 플랜 원본 `~/.claude/plans/paperclip-eager-scone.md`, 제품 스펙 [[JB-콘솔-프로토타입-스펙]].

# JB 콘솔 — 개발 도구 · SDK · 플러그인/스킬 사용 플랜

## 1. 빌드 오케스트레이션 — Codex 구현(클로드 토큰 절약)

### 실측 제약 (중요)
- **Codex 샌드박스는 볼트(`~/project/active/JBproject`)만 write 허용.** fork(`~/project/active/paperclip-jb-fork`)는 sibling이라 **Codex가 읽지도 쓰지도 못함**(이동·chmod 무관 — 샌드박스 정책). Codex는 localhost 도달도 불가.
- 따라서:
  - **신규 파일(from scratch)** = Codex가 볼트의 MVP 원본(app.js·canon·element-specs)을 **읽어** TS/TSX를 **`/tmp/codex-jb-staging/`에 생성** → **Claude가 fork로 이동**(cp). Codex가 무거운 추출·생성 담당 → 토큰 절약. (P1 시드데이터·P2 케이스뷰·P3 스킬/플러그인이 이 방식.)
  - **기존 fork 파일 편집** = Codex 불가(읽기 못 함) → **Claude 직접 편집**. (P0 테마/nav·P4 디자인 폴리시가 이 방식. 소규모·시각 반복이라 직접이 적합.)
  - **localhost·DB·스크린샷·검증** = 항상 Claude(로컬 권한). dev 서버 `:3100`, Playwright(playwright-core CJS default import), DB 시드 via API, `tsc -b`, `measure_density.js`.

### 분업 요약
| 작업 | 담당 |
|---|---|
| 신규 컴포넌트·데이터 생성 | **Codex** → 스테이징 |
| 스테이징→fork 이동·기존파일 편집·디자인 반복 | **Claude** |
| 라우트/nav 와이어링·tsc·서버·스크린샷·시드·커밋 | **Claude** |

### Claude Code 스킬 활용
`subagent-driven-development`·`dispatching-parallel-agents`(Codex 위임) · `executing-plans` · `requesting/receiving-code-review`(Codex diff 검수) · `verification-before-completion` · `test-driven-development`(계산 로직) · `using-git-worktrees`(병렬 격리) · `finishing-a-development-branch`(jb-console 마무리). 문서: `context7`(React19·shadcn·Tailwind v4·Vite) · Figma MCP(디자인) · `humanize-korean`(한국어 UI 카피).

## 2. 제품 SDK / 플러그인 / 스킬 아키텍처 (본선 확장성 서사)

콘솔이 시연하는 구조 → 실서비스 승격 경로:

| 프로토타입 객체 (콘솔) | 실서비스 승격 | 근거 |
|---|---|---|
| **Skill**(`jb-skills.ts` body·inputs·sources, `/skills` 엔진) | **Agent SDK 툴/스킬 패키지** — 에이전트가 장착하는 capability. body=시스템프롬프트·절차, inputs=파라미터 스키마, sources=근거 커넥터. | element-spec 02 |
| **Plugin/MCP 커넥터**(`jb-plugins.ts`, `/plugins` 레지스트리) | **MCP 서버** — law/policy/news/realestate/jb-db. govTier가 PII면(=jb-db `restricted`) 온프레·토큰화 강제. `연결/테스트 조회`=MCP handshake·tool call. | element-spec 05 |
| **AgentRun / 타임라인**(케이스 상세) | **Agent SDK 실행 루프** — 판단→행동초안→검증, 각 스텝 evidence·approval gate. | function-spec §3, hero-walkthrough |
| **승인 게이트 / 감사 원장** | 사람 승인 API + 무결성 해시 감사 로그(`auditChainRecords` 이식). | canon §8 운영 계약 |

- **데이터 거버넌스**: 외부 LLM 호출 구간 = 등급제→PII 토큰화→모델 라우팅(국내/외부)→반출 스캔. `jb-plugins` govTier + `/pii-governance` 화면이 이 4중 방어를 시연. 원본 PII 비반출.
- **데모 범위**: 모의/캐시 응답. 실 라이브 MCP 호출·실 Agent SDK 런은 범위 밖(팀원 별도 구현·BYO LLM 키).

## 3. 현재 구현 상태 (P0~P4)
[[JB-콘솔-프로토타입-스펙]] 참조. jb-console 커밋: P0~P2 `2324d28` · P3 `427f6bd` · P4 `282de15`. 전 페이즈 tsc 0·라이브 렌더 pageerror 0.
