---
tags:
  - area/evidence
  - type/log
  - status/active
date: 2026-06-26
up: "[[_04_증빙_MOC]]"
aliases:
  - 세션로그
  - session-log
---
# 세션 로그 (Append-only)

> ⚠️ 대외비 — 6/29 공식발표 전 비공개.
> 형식: `### YYYY-MM-DD HH:MM · 세션 요약` → 한 일 / 결과물 / 다음. 새 세션은 맨 아래 추가.

<!-- TOC:AUTO -->
## 목차 (자동생성 — 직접 편집 금지, `log-toc`가 재실행 시 덮어씀)

  - [[#2026-06-26 · 본선 준비 부트스트랩 세션]]
  - [[#2026-06-27 · 제품 정의 브레인스토밍 + 운영 하네스 구축]]
  - [[#2026-06-27 · 리서치 Orchestrator 실행 — 딥프롬프트 19종 산출]]
  - [[#2026-06-27 05:52 · 야간 라우팅 점검·개선 + 구현전 토큰 작업맵 + 팀 이력 (S13)]]
  - [[#2026-06-27 15:10 · 서드파티 도구 선별 설치 + 팀 동기화 레지스트리 (S14)]]
  - [[#2026-06-27 15:34 · 디자인/개발 플러그인 project scope 동기화 (S15)]]
  - [[#2026-06-29 17:10 · 회의 준비 팩 + AX 메타 하네스 가동 (S16)]]
  - [[#2026-06-29 18:00 · 회의 결과 기록 + 수정필요 파일 도출 + AI 인덱스 자동반영 (S17)]]
  - [[#2026-06-30 · 아이디어 회의 기록 + 제품 정의 팀 합의]]
  - [[#2026-06-30 · 텔레메트리 누적 중복 버그 수정 + 하네스 견고성 보강 (Codex)]]
  - [[#2026-06-30 · 리서치 딥프롬프트 사이클 (실행 → 마감)]]
  - [[#2026-06-30 (후속) · D3e 최종 회수 — JB 총정리본 결과 수령]]
  - [[#2026-07-01 · 볼트 태그·부모(up) 전면 정합화]]
  - [[#2026-07-01 · 운영 자동화 스킬화 (AI 자가인지·자가전파)]]
  - [[#2026-07-01 · 도구셋 확장 리서치 + 문서화]]
  - [[#2026-07-01 · 도구셋 확장 적용 + 자체 스킬 2종 신설]]
  - [[#2026-07-01 · 시각화 스킬 맵·메모리 갱신]]
  - [[#2026-07-01 · session-boot 스킬 신설 (세션 오리엔테이션)]]
  - [[#2026-07-01 · 야간 자율 — 리서치 종합·적대검증·정합감사 (오프라인)]]
  - [[#2026-07-01 · 야간 자율 2 — 11블록 채움 + 빌드 WBS + 거시 동기화 (Codex 최대화)]]
  - [[#2026-07-02 · 백업 위험·협업 인프라 정비 + 회의4/5 준비 + 데일리 시스템 + AI 프로토콜]]
- [[#2026-07-01 야간 · 리서치 점-점 종합 파이프라인 (Codex gpt-5.5 병렬, A→B→C 완료)]]
  - [[#2026-07-02 · 간트 수정 후 Excalidraw 보드 동기화]]
  - [[#2026-07-02 · Excalidraw 공유용 이미지 Export]]
  - [[#2026-07-02 · 공유 이미지 손그림풍 재export]]
  - [[#2026-07-02 · GitHub 미리보기용 이미지 README]]
  - [[#2026-07-02 · 팀 역할/발표 PPT 전략 갱신]]
- [[#2026-07-02 · JB 도입시나리오 설득패키지(PPT 백본) 착수]]
  - [[#2026-07-02 · paperclip fork 시각검증 실험 (Codex 병렬)]]
  - [[#2026-07-02 · JB 콘솔 프로토타입 착수 (fork를 우리 예선 설계+JB디자인으로)]]
  - [[#2026-07-02 · JB 콘솔 심화: 실 은행 워크플로 3종 + 14 canon 에이전트 + JB 아이콘 (커밋 jb-console `389e5ca`)]]
- [[#2026-07-02 · 리서치 시각화 — 리서치 지도(mermaid) + Obsidian 임베드]]
- [[#2026-07-02 · 리서치 운영문서 정합성 감사 (Codex 4병렬 위임)]]
- [[#2026-07-02 · 빌드 플랜 초안(히어로 실동작 데모)]]
- [[#2026-07-02 · 빌드 Phase 0 실행 완료 (RUNTIME_CONFIG seam)]]
  - [[#2026-07-02 · JB 콘솔 케이스 중심 재구현 P0~P4 ("디자인 티 제거→실사용 UX", Codex 구현)]]
  - [[#2026-07-03 · JB우리캐피탈 도메인 하네스 신설 (wooricap.com 전수 분석)]]
  - [[#2026-07-03 · D30 TAM 방식 A 분모 취약 발견 → D30b 재조사 프롬프트 신설]]
  - [[#2026-07-03 · D30b 즉시 해결 (Sonnet 직접 리서치 + IDC 원문 회수)]]
  - [[#2026-07-03 · D31 신설 — 타겟모수 RM·인접직군 헤드카운트 센서스]]
  - [[#2026-07-03 · D31 결과 회수 — RM·인접직군 seat 모수 확정]]
  - [[#2026-07-03 · 7/1~7/3 회의 결정 실행판 시각화]]
  - [[#2026-07-03 · Capture-by-default 거버넌스 무결성 점검]]
  - [[#2026-07-03 · 공개 라이브 데모 URL + 온라인 DB 배포 스택 리서치]]
  - [[#2026-07-03 · 마일스톤 — 리서치·앱설계 초안 → 바텀업 결정준비 배치 피벗 (Codex 오버나이트 Workflow 2라운드)]]
  - [[#2026-07-03 · 팀 공유용 오전 결정 브리핑 보드 생성]]
  - [[#2026-07-03 · 배포 AI-실행성 교정 + deploy-public-demo.sh 신설]]
  - [[#2026-07-03 · 로그·통계·로우데이터 관리 세션 (Codex)]]
  - [[#2026-07-03 · plugin-sync 스킬 신설 + 배포-준비도 점검]]
  - [[#2026-07-03 · Codex CLI 토큰 백필 통계 신설]]
  - [[#2026-07-03 · 문서 통합 + 유튜브 디자인툴 6종 리뷰]]
  - [[#2026-07-03 · 팀원용 스킬·플러그인 목록 통합 + 본선 HOME 링크]]
  - [[#2026-07-03 · 스프린트 전 축(하네스) 점검 + 레포-지도 SSOT]]
  - [[#2026-07-03 · 각종 로그 진행 — telemetry 최신화]]
  - [[#2026-07-03 · 서사 학술·규제 근거팩 + 최영욱 4보고서 정합 + 7/1 타임라인 문서 + feynman]]
  - [[#2026-07-03 · feynman deepresearch 회수 — 국내 AI규제 HITL 백본(검증됨)]]
  - [[#2026-07-03 저녁 · 맥락압축·ultracode 후 재개 — harness 방법론 도입 + 문서생성 마스터플랜]]
  - [[#2026-07-03 밤 · P0 문서 6종 생성·검수·정정·커밋(origin 푸시)]]
  - [[#2026-07-04 · 서사 정합(맥락감사) + 승보 역할축 v2 + 제출 정본 레포 확정]]
  - [[#2026-07-03 밤 · 로그들 업데이트 — telemetry S40]]
  - [[#2026-07-04 00:02 KST · 로그들 업데이트 — 7/4 데일리 시작·telemetry S41]]
  - [[#2026-07-04 · 문서하네스 안착 + 실동작 에이전트 슬라이스 PR]]
  - [[#2026-07-04 (세션 "JB금융-디자인") · 디자인 토큰 업그레이드 — design-system.md 개정 + tokens 폴더 신설]]
  - [[#2026-07-04 · 문서세트 22종 + paperclip 벤더링 + 디자이너 핸드오프]]
  - [[#2026-07-04 03:20 KST · 문서 대량 변경 후 로그 업데이트 — telemetry S42]]
  - [[#2026-07-04 · CaseOps 확장 분기(Codex 6문서) + 디자인 잠금 해제]]
  - [[#2026-07-04 · 매니징 갱신 + 문서계약 100% 확인]]
  - [[#2026-07-04 · 종합 감사 6축 + 후속수정(2 워크플로)]]
- [[#2026-07-04 · Fable — /llm 게이트웨이 구현 + Q13~Q15 심사방어 3축 (예선 MVP 레포)]]
  - [[#2026-07-04 · main 통합 + 설계도 5종 신설 + JB_project2 구현현황 인벤토리]]
  - [[#2026-07-04 · 회의록 5건 meeting-intake 전면 보강 (줄글 프롬프트 인풋 규격)]]
  - [[#2026-07-04 · 회의록 "발췌→정리본 승격" 전면 재구조화 (2파일→1파일)]]
  - [[#2026-07-04 · 미실현 "예정" 회의록 2건 아카이브 강등]]
  - [[#2026-07-04 · 빈 스캐폴드 폴더 삭제 + decision-log 헤딩레벨·중복 정리]]
  - [[#2026-07-04 · 발표서사설계 중복 회의록 최종 해소]]
  - [[#2026-07-04 · canon-moc-sync 잔여 경고 4종 병렬 Haiku 정리 + 동시세션 레이스 조건 발견]]
  - [[#2026-07-05 · `03_제품/01_결정-준비/` 스크래치 정리 (85→61파일, 24건 아카이브)]]
  - [[#2026-07-05 · 🔴 볼트 전역 텍스트 오염 발견·복구 — "README" 무차별 치환 사고]]
  - [[#2026-07-05 · `03_제품/` paperclip式 재구조화 — docs/reports 신설 + "07_" 충돌 해소]]
  - [[#2026-07-05 · 인덱스류 문서 제목 명확화]]
  - [[#2026-07-05 · 볼트 전역 로밍 유지보수 (빈 폴더·OS잡동사니 정리)]]

<!-- /TOC:AUTO -->

### 2026-06-26 · 본선 준비 부트스트랩 세션
**한 일**
- 본선 안내(이메일·DAKER) 기록, 대회 안내 정본 통합([[JB금융그룹 Fin AI Challenge — 대회 안내 정본 (공식 전문)]]), 본선 문서 분리([[본선-안내]]·[[본선-준비-계획]]).
- 세 워크스트림 초안 산출(MVP 점검·발표덱·시연 시나리오).
- 백엔드 실연동 설계 확정([[본선-백엔드-실연동-설계]], 미구현).
- 레퍼런스 분석(paperclip·hagent-os) → 본선 작업공간 `08_본선/` 옵시디언 볼트 스캐폴드 + 본선 MOC 구축.
- 에이전트 협업 계약([[AGENTS]]) + 자동누적 로그 4종 + 맥락 메모리 기록.

**결과물**: `08_본선/` 트리(약 60파일), `04_증빙/01_핵심로그/` 4종, `_체계/` 본선 문서, 메모리 4건.

**다음**: ① 구글폼 6/28 제출(팀) ② 제품 역엔지니어링 브레인스토밍(무엇/누구/뾰족하게) ③ 디자인시스템·IA 재설계 ④ (승인 시) 백엔드 구현 착수 ⑤ 자동누적 Stop 훅 와이어링 검토.

### 2026-06-27 · 제품 정의 브레인스토밍 + 운영 하네스 구축
**한 일**
- 제품 역엔지니어링 브레인스토밍: 주사용자=RM·현장 금융담당자, 도메인=3개 통합 유지, 코어베팅=PII거버넌스×승인우선×멀티도메인 결합. (제품 정의 §1 제시, **승인 대기**)
- 본선 자산 로컬 커밋(`4607681`, 푸시 X). 옵시디언 `심사기준` 파일명 복원·H1 정합.
- **인-볼트 메모리 + 운영 하네스 시스템** 구축([[_HARNESS-SYSTEM]]): `_system/`에 메모리·텔레메트리(실데이터 시드)·팀 4인·에이전트 레지스트리·협업규칙·엑스칼리드로 4종 + 자동 기록 Stop 훅.

**결과물**: `08_본선/_system/` 전체, 자동화 훅, 프롬프트 로그 누적, 전역 메모리 갱신.

**다음**: ① 자동 훅 검증·활성화(`update-config`) ② 팀 프로필 4인 수신→채우기 ③ 제품 정의 §1 승인→IA·디자인시스템 섹션 ④ 구글폼 6/28(팀).

### 2026-06-27 · 리서치 Orchestrator 실행 — 딥프롬프트 19종 산출
**한 일**
- [[리서치-마스터-프롬프트]] 프롬프트 본문대로 GoLab 리서치 Orchestrator 가동(하네스·역할·기록 규약 세팅).
- 도메인 분해 **Opus 2패스**(독립 리뷰어 2인, 렌즈=완전성·중복 / 분량·우선순위) → 17→**19** 확정([[_운영-도메인-분해-점검]]).
- 도메인별 딥리서치 프롬프트 19종 생성: Opus 프롬프트엔지니어 8 에이전트 fan-out, 각 파일에 Opus 2패스 점검 로그 내장. 형식 A(복붙형) 준수, 경계 6규칙·출처 가드 반영.
- 덤 발견 2층 정리 + 후속 추가 연구 트리거 12유형 규약([[프롬프트-로그]] R6).

**결과물**: `08_본선/04_증빙/02_분석자료/리서치/` — `08_본선/04_증빙/02_분석자료/리서치/03_요약-정리/_운영-도메인-분해-점검.md` + `D{n}-*.md` 19파일. 로그 4종 append(프롬프트·결정·세션·텔레메트리).

**다음**: ① (사용자) 배치1 ★★★부터 Gemini/Perplexity 딥리서치 실행 ② 귀환 결과 적대적 검증·종합(format B)→`07_원천`/`_system/memory/context` 기록 ③ 후속 트리거 표로 2차 라운드 라우팅 ④ 덤의 덤 5종 백로그 승격 판단.

### 2026-06-27 05:52 · 야간 라우팅 점검·개선 + 구현전 토큰 작업맵 + 팀 이력 (S13)
**한 일** (사용자 취침 중 자율 라우팅 — 구현 X, 점검·개선만)
- **구현 전 토큰 大 작업맵** 작성([[구현전-토큰大-작업맵]]): 비용 순위(paperclip 비전·딥리서치 회수·MVP 코드정독 최상위)·절감 전략(외부 딥리서치 위임/저가모델 분산/배치)·의존성·실행순서.
- **팀 이력 탐색**(Haiku): GoLAB=망상궤도 팀 확인. **KEG 1등(506팀)=우리 hagent-os**. 수상 7건·구성원 풀 → `_team-roster` 초안 채움(연락처/식별 PII 제외), 전역메모리 [[팀-트랙레코드]] 추가.
- **맵 점검**: canon-moc-sync clean(중복0·frontmatter정합). 단 **수동 MOC 표 드리프트** 발견 → 전략 MOC에 누락 2건(작업맵·리서치마스터프롬프트) 보강.
- 미커밋 자산 로컬 커밋(리서치 딥프롬프트 19종 등, 푸시 X).

**발견·플래그**
- ✅ ~~R6 부재~~ **정정**: R5·R6는 프롬프트-로그에 실재(12유형 후속 트리거 규약 포함). 앞선 "부재" 판단은 **Syncthing 지연 동기화 중 읽은 stale read** 탓 오판. 별도 리서치 세션(2b30e89d)이 쓴 R5/R6가 커밋 174b20d 직전 동기화돼 정상 포함됨. → 조치 불필요.
- 💡 canon-moc-sync는 `up:` 프론트매터 기준만 검사 → **수동 MOC 표 행은 자동 보강 안 함**(반자동 영역). 이번에 전략 MOC 2건·제출 MOC 딥프롬프트 인덱스 수동 보강. 스킬 개선 후보.
- ⚠️ **환경 주의**: ① Syncthing이 세션 중 볼트 파일을 외부 변경 → Edit 실패·stale read 유발(작업 전 최신 read 권장). ② macOS `grep`=ugrep + NFC/NFD 경로 → `\|`·`\b`·한글 글롭 빗나감(절대경로+단순패턴 권장).
- 🔧 딥프롬프트 19종 중 **H1 누락 15건 보강**(D1a·D1b·D+만 있었음) — 파일명 기반 제목, Obsidian H1=제목 정합.

**라운드3 — 전 섹션 MOC 드리프트 일제 점검**
- NFC 정규화 스캐너로 5개 섹션 MOC vs 폴더 대조(주의: macOS readdir=NFD, `includes` 정규화 필수).
- 발견·수정: **04_증빙 MOC이 핵심로그 4종(프롬프트·decision·session·evidence-ledger)을 미연결** → 표로 보강. 05 제출 D파일 19개는 `_00` 인덱스로 도달하는 설계(MOC 19행 나열은 비대화라 제외).
- 잔여 플래그: `03_제품/INDEX.md`가 자체 `type/moc` → `_03_제품_MOC`와 중복 가능성, 구조 검토 필요(미수정).
- 결과: 01·02·04·05 섹션 드리프트 0.

**다음**: ① 구글폼 6/28(팀) ② 제품 정의 §1 승인 ③ 토큰작업맵 순서대로 — A1 프롬프트검수 → A2 외부 딥리서치 회수 ④ canon-moc-sync에 "수동 표 행 드리프트" 검사 추가 검토.

### 2026-06-27 15:10 · 서드파티 도구 선별 설치 + 팀 동기화 레지스트리 (S14)
**한 일**
- 추천 6종 GitHub API 검증(awesome-design **404 제외**). **설치**: taste-skill `design-taste-frontend`(npx skills, skills.sh Safe/Low), `notebooklm` CLI v0.7.2(uv tool)+NotebookLM 스킬(project). **문서화만**: impeccable(대화식·2분 타임아웃→수동), LightRAG(백엔드 phase), Firecrawl(API키).
- **팀 동기화 자산**: `skills-lock.json`(커밋 → `npx skills install` 재현) + `registry-skills`·`registry-cli` + `bootstrap.sh STEP 3.5` + `.gitignore`(.agents/.impeccable/.gitmodules).
**발견**
- impeccable 설치기 비대화 플래그 미동작(2분 타임아웃) → 자동화 부적합, 수동 안내로 전환.
- 전역 settings에 훅 없음 재확인(하네스 Stop훅 미활성). 외부전송 도구(notebooklm·firecrawl) PII 경고 명시.
**다음**: ① (사용자) impeccable 수동 설치 `npx impeccable install`→`/impeccable init` ② taste 스킬 MVP 재설계에 활용 ③ 백엔드 phase LightRAG.

### 2026-06-27 15:34 · 디자인/개발 플러그인 project scope 동기화 (S15)
**한 일**
- 재설치 없이 **`.claude/settings.json` 직접 편집**: `enabledPlugins` 12종 + `extraKnownMarketplaces` 6종. 마켓 소스는 전역 `~/.claude/plugins/known_marketplaces.json`에서 정확히 복제(특히 `ui-ux-pro-max-skill`=github:nextlevelbuilder/ui-ux-pro-max-skill — 전역 settings엔 없고 캐시에만 있던 것 발견).
- 동기화 세트: frontend-design·ui-ux-pro-max·figma(디자인) / superpowers·code-simplifier·code-review·skill-creator·context7(개발·리뷰·문서) / codex / obsidian / example-skills·ponytail. **제외**: agent-sdk-dev·telegram·chrome-devtools-mcp.
- `.gitignore` `!.claude/settings.json` 예외로 추적 가능화(나머지 .claude는 무시 유지). 12종 전부 마켓 해석 ✓ 검증.
- registry-plugins에 "프로젝트 동기화 세트" 섹션 추가, 수동 가이드는 fallback로 강등.
**효과**: 팀원은 repo clone → `/reload-plugins`로 동일 플러그인 자동 적용(개별 /plugin install 불필요).
**다음**: 팀원 검증(clone 후 자동적용 확인) · 인증필요 플러그인(figma 등)은 각자 OAuth.

### 2026-06-29 17:10 · 회의 준비 팩 + AX 메타 하네스 가동 (S16)
**한 일**
- **Track A(회의 준비)**: [[방법론-비교-보드]](11종 비교·★채택 7·워크플로) · [[제품정의-캔버스]](BMC형 **11블록×심사기준×KPI** 비계, 내용 미작성) · [[회의-리서치팩]](검증 통계 1장 + 딥프롬프트 19종 실행 런북, 라이브 미실행). Sonnet 서브에이전트 3 병렬.
- **Track C(도구)**: [[registry-integrations]] 신규(누락 **Discord·Syncthing** 보강 + GitHub·GDrive·Notion 협업 역할) + `_tools-index`(6분기)·`bootstrap.sh`(STEP5.5)·`registry-mcp`(MCP 각자 인증 명문화) 연결.
- **Track B(하네스 가동)**: **Stop 훅 활성화**(`.claude/settings.json`, `$CLAUDE_PROJECT_DIR`) — 격리 dry-run 검증 중 **토큰 집계 버그 발견·수정**(cache_read 매턴 합산→686M 폭증, fresh만 집계로 12.2M 정상화). aggregator 종단 검증(4행). **Excalidraw 4종 실데이터** — `viz-generator.mjs` 자동 생성기(96·33·28·71 elements).
- **기록**: 프롬프트-로그 S16, 실행 플랜 볼트 보관([[실행플랜-회의준비-AX하네스]], up 지정), decision-log 2건, MOC·PROGRESS 갱신.

**발견·플래그**
- 🔧 **텔레메트리 토큰 버그**: cache_read를 입력에 합산해 세션당 수억 토큰으로 폭증 → 통계 무의미했음. 활성화 전 dry-run에서 잡아 수정. (going-forward 데이터부터 유의미)
- ⚠️ **서브에이전트 plan-mode 오인**: 일부 서브에이전트가 "플랜 모드라 쓰기 차단"이라 주장하며 작성 거부 → 실제로는 메인 세션 쓰기 정상. 파일 ground-truth를 직접 검증해 진위 확인(주장 신뢰 금지 교훈). A1·C는 재지시/메인직접으로 완료.
- ⚠️ **구글폼 6/28 마감 경과**(오늘 6/29) — 팀 직접 제출 항목. 미제출이면 즉시 확인 필요(에이전트 입력 금지).
- ⏳ Stop 훅은 **다음 세션 로드 시 Claude Code가 project 훅 승인을 1회 요청**(보안 게이트).

**다음**: ① 회의: 제품 정의 §1 합의 → 11블록 캔버스 채움 → 방법론 워크플로 확정 ② 회의 후 팀 4인 member-01~04 본인확인 ③ 딥프롬프트 19종 실행(런북대로) ④ 로컬 커밋(푸시는 6/29 대외비 게이트).

### 2026-06-29 18:00 · 회의 결과 기록 + 수정필요 파일 도출 + AI 인덱스 자동반영 (S17)
**한 일**
- **회의 기록**: 6/27 두 회의(본선브리핑·준비및코덱스결제) STT를 **JB 대회만** 발췌. 원문 2종(`04_증빙/04_회의록/_원문/`, **결제 카드·비번 레닥션**, gitignore) + 정리본 2종 + [[_회의록-INDEX]] + `_04_증빙_MOC` 연결. 타 대회(스마트팜·노각장·성대·삼성)는 미기록.
- **수정 필요 파일 9건 도출**(INDEX 표). **확정 반영 2건**: ① Codex 유료결제(망상궤도 공용계정 Pro 20×/$299) → [[registry-cli]]·전역메모리 [[코덱스-유료결제]] ② 도구 역할 → [[registry-integrations]](Syncthing 실시간/GitHub 결과물/Discord+Craig 녹음/Notion 미팅페이지/Drive 녹음). 나머지 7건(취지·가치기준·발표내러티브·제품정의·MVP재설계·팀로스터·구글폼)은 🔶제안으로 INDEX에 정리.
- **AI 인덱스 자동반영**: [[canon-moc-sync]]에 **[4/4] 죽은 링크 감지** 추가 → 생성(자동링크)·수정(frontmatter)·**삭제/이름변경(죽은링크)** 루프 완성. 오탐 제거(NFD/NFC 정규화·비-md 타깃·이스케이프 파이프·basename 해석·SKILL예시 제외). 기존 frontmatter 갭 1건(`08_본선/04_증빙/02_분석자료/리서치/03_요약-정리/_운영-코덱스-점검`) `--apply`로 정리.

**권장사항 기록**(직전 S16 마무리 시 제시 — 사용자 "권장사항도 기록")
- ⏰ **Stop 훅**: 다음 세션 로드 시 Claude Code가 project 훅 승인 1회 요청 → 승인해야 자동기록 작동.
- ⚠️ **구글폼 마감**: 메모리=6/28, 회의 구두="8일" → 불일치. 메일/정본 재확인 후 **팀 직접 제출**(에이전트 입력 금지). 오늘 6/29 기준 6/28이면 경과.
- ⚠️ **푸시 보류**: 모든 변경 로컬. 직전 public 푸시 건은 6/29 대외비 게이트로 보류 유지. 커밋/푸시는 지시 시.
- 💡 **서브에이전트 plan-mode 오인**: 파일 ground-truth 직접 검증으로 진위 확인(주장 신뢰 금지).
- 🔧 **회의 다음**: 제품 정의 §1 합의 → [[제품정의-캔버스]] 채움 → 방법론 워크플로 확정.

**발견·플래그**
- 🔒 회의 원문에 **결제 카드번호·비밀번호로 보이는 숫자열 노출** → 원문 발췌·정리본 모두 레닥션. 원천 txt(Downloads) 자체도 취급 주의.
- 🔧 인덱스 죽은링크 검출이 `_분석/hagent-os-구조-청사진.md`의 비표준 MOC 경로링크를 일시 표면화 → basename 해석 인정으로 정리(실파일 존재, Obsidian 정상 해석).

**다음**: ① 회의 후속 7건(취지·가치기준·발표내러티브 등) 반영 판단 ② 제품 정의 §1 합의 ③ 구글폼 재확인 ④ 로컬 커밋(푸시 게이트).

### 2026-06-30 · 아이디어 회의 기록 + 제품 정의 팀 합의
**한 일**
- 6/30 밤 아이디어 회의 STT → 원문(`04_증빙/04_회의록/_원문/`, gitignore) + 정리본([[회의록-2026-06-30-아이디어회의]]) + [[_회의록-INDEX]] #10·11·12 반영. meeting-intake 스킬 절차 적용.
- **제품 정의 §1 팀 첫 합의**: JB 2계열사(은행1+JB우리캐피탈) RM 에이전트, 차별점=확장성(단계적 청사진 MVP→전그룹), 시연=로컬모델 실동작·조직도 메인UI·JB 웹 디자인 차용. 14에이전트 리서치 재정합.
- 반영: [[제품-정의]](인-볼트 컨텍스트)·[[본선-마스터-플레이북]](취지·가치기준·내러티브)·전역 메모리 [[본선-제품정의-확정]] 신규 생성.

**결과물**: 회의록 정리본 1종·원문(레닥션·gitignore)·INDEX 갱신·제품-정의 컨텍스트 갱신·플레이북 반영.

**다음**: INDEX #7(MVP 재설계)·#8(팀 로스터)·#12(상금 대외비)는 🔶팀 확인 후 반영.

### 2026-06-30 · 텔레메트리 누적 중복 버그 수정 + 하네스 견고성 보강 (Codex)
**한 일**
- **누적 중복 버그 수정**: Stop 훅이 매 종료마다 트랜스크립트 전체 재파싱 → 세션당 N행 누적 문제. `session_id` 키 upsert(세션당 1행)로 변경, aggregator에 dedup 로직 추가, intake.csv `session_id` 컬럼 추가·레거시 4중복행 정리(~41M→10.4M 정상화). Stop 훅 종료 시 aggregator 자동연쇄 → 통계 4파일 무자각 갱신.
- **Codex 위임 캡처**: 트랜스크립트의 `subagent_type=codex:*` 감지해 `engine=codex` 별도행 기록(실데이터 ×4 확인).
- **G1 git기여 자동집계**: `git-contribution.mjs` → `_system/team/_contribution-stats.md` GIT-CONTRIB 블록.
- **G3 PII 자동스캔**: `pii-scan.mjs` + Stop 훅 2번째 command(항상 exit0, 마스킹 리포트).
- **G4 원자적 쓰기**: intake.csv·통계파일 tmp+rename(+.bak 1세대).
- **G5 ai-usage-stats.md**: 완전파생 파일만 gitignore+untrack.
- 회귀 자체검증 `test-telemetry.mjs`(upsert·cache_read·codex·수동행·합산) 통과.

**결과물**: `session-telemetry.mjs`·`telemetry-aggregator/aggregate.mjs`·`git-contribution.mjs`·`pii-scan.mjs`·`test-telemetry.mjs`·intake.csv·`_contribution-stats.md`·`.gitignore`.

**다음**: G2(커버리지 구멍)·G6(소요 벽시계 왜곡)·G7(viz 정체) 잔여. 다음 세션 `/hooks` Stop 훅 재승인 1회(2개 command로 늘어남).

### 2026-06-30 · 리서치 딥프롬프트 사이클 (실행 → 마감)
**한 일**
- 도메인분해 Opus 2패스 → 딥프롬프트 **27종**(D1a~D19·D+a/b·D3a~f, 형식 A). JB sharp 레이어 D3c·D3d·D3e(총정리본 풀+컴팩트)·D3f(시계열 회사소개).
- 엔진 라우팅(Perplexity 한도→GPT5.5 high/xhigh·Gemini Flash/Pro; D16·17·19 모델 다회차 비교) + `08_본선/04_증빙/02_분석자료/리서치/03_요약-정리/_모델-실행기록`.
- 결과 회수: `~/Downloads/docs`→`_결과/D{n}-결과[-model].md`(docx→md pandoc, **워드 수식 이미지→LaTeX 비전 판독·치환**, 원본 `_media/`). 추적 [[_운영-회수현황]]·`08_본선/04_증빙/02_분석자료/리서치/03_요약-정리/_운영-실행-대시보드`.
- 고위험 5건(D3a·D5a·D+a·D1b·D7a) format B 적대검증(`_종합-*`) → `_canon §10` 정정(대환대출 2023·전세 39,121건·총자산 **73.1조 KIND 1차**·보이스피싱 범위단서).
- 갭감사(Codex gpt-5.5) → 누락 D16~D19 신설(`08_본선/04_증빙/02_분석자료/리서치/03_요약-정리/_운영-리서치-갭감사`).

**결과물**: `04_증빙/02_분석자료/리서치/`(프롬프트 27 + `_00`~`_03` + `_결과/` + `_media/`), 메모리 [[리서치-딥프롬프트-사이클]]·[[리서치-사이클]].

**다음**: (재개 대기) 추가 결과 회수 → 총정리본(D3e+D3f) **7레이어 조립 + Excalidraw 4종** → 제품 정의·설계 반영.

### 2026-06-30 (후속) · D3e 최종 회수 — JB 총정리본 결과 수령
- D3e(JB 7레이어 총정리본, **GPT-5.5 xhigh**) Sonnet 위임 회수 → `08_본선/04_증빙/02_분석자료/리서치/02_결과-원문/D03e-결과-원문-gpt55xhigh.md`(369줄). 이미지=타임라인 차트(수식 아님). D3e·D3f 상호보완(동일 제목·다른 구조, 중복 아님).
- 로우데이터 축적 점검: 모델·도메인·회차=[[_모델-실행기록]]+intake CSV / 토큰·툴·시간=Stop훅 / 프롬프트 원문=프롬프트-로그. **통계 분석용 raw 준비 완료**.
- 다음: D3e+D3f+D3a~d 합본 → 7레이어 총정리본 조립 + Excalidraw(재개 시).

### 2026-07-01 · 볼트 태그·부모(up) 전면 정합화
**한 일**
- NFC·절대경로·basename·이스케이프파이프 인지 진단(Codex) → Claude 판단 → 수정(Codex, 멱등 스크립트 `backfill-frontmatter.mjs`).
- up 누락 46건 backfill(`_결과` 42 → `_00-회수현황` 등), 부모 부적합 33건 교정(프롬프트→`README`, `_분석/*`→`_03_제품_MOC`), tags 누락 backfill, `area/general`→`area/product`(paperclip), up 표기 basename 통일(중복명만 경로지정).
- `_03_제품_MOC`↔`INDEX` 양방향 링크 1건, 죽은링크 `08_본선/HOME`→`본선 HOME` 교정.
- **Codex 진단 "up 65% 깨짐"·"유령 부모 6+"은 이스케이프파이프 미파싱 측정오류로 판명** → 불필요한 down-link 스팸·area 재태깅 51건 churn 기각(사용자 "경량").

**결과물**: `backfill-frontmatter.mjs`(멱등). 최종: up 누락 0·깨진 부모 0·BFS 프롬프트29·결과44 도달·사이클 0·죽은링크 0.

**다음**: 결과 말단 frontmatter(`up:`) 46건 백필은 사람 승인 후 일괄.

### 2026-07-01 · 운영 자동화 스킬화 (AI 자가인지·자가전파)
**한 일**
- **[[canon-moc-sync]] [5/5] 도달성·up 사이클 검증 추가**: 루트→자식 BFS로 고아 자동 검출·연결(신규 스킬 대신 기존 확장). 즉시 고아 `B1` 검출→연결로 가치 실증.
- **신규 스킬 [[meeting-intake]]**: 회의 STT→원문+회의록+인덱스+메모리+거버넌스 일괄 처리.
- **[[AGENTS]] §4-A 운영 자동화 규약 신설**: 트리거→스킬 매핑(파일생성→canon-moc-sync, 회의STT→meeting-intake, 체크포인트→harness-sync) — AI가 사용자 지시 없이 자가시행.
- [[registry-skills]]·[[_tools-index]]·메모리 [[본선-운영-하네스]] 갱신.

**결과물**: `canon-moc-sync/SKILL.md`(확장), `meeting-intake/SKILL.md`(신규), `08_본선/AGENTS.md`(§4-A).

**다음**: 새 파일 생성 시 canon-moc-sync 자동 실행·frontmatter+up 필수 규약 적용.

### 2026-07-01 · 도구셋 확장 리서치 + 문서화
- 팀 공유 플러그인·스킬 현황 조사(Haiku Explore 위임) → 본선 4대 산출물 갭 식별(로컬모델·조직도·Node백엔드·PII).
- 직접 웹리서치: NVIDIA **SkillSpector**(WebFetch 공식 README) · **im-not-ai**(WebFetch) · 로컬 한국어 LLM·Cytoscape·한국어 PII(Perplexity ×4).
- 산출물: [[도구-확장-리서치-20260701]](6종 결정표·설치명령·라이선스·한계), decision-log 1행.
- 다음: (사람 승인) settings.json enabledPlugins(humanize-korean) · bootstrap SkillSpector 게이트 · registry-cli/plugins 반영(harness-sync) · 시연 EXAONE 7.8B 로컬 셋업.

### 2026-07-01 · 도구셋 확장 적용 + 자체 스킬 2종 신설
**한 일**
- 승인 4종 적용: settings.json `humanize-korean@im-not-ai`(+마켓), registry-cli `skillspector` 행 + bootstrap STEP3.5 보안 스캔 게이트, harness-sync 정합, 스코프 커밋 `bbd3203`→origin·fork 푸시. (plugin-inventory 개인환경 혼입분 revert, SSOT=settings.json)
- 자체 스킬 **2종 신설**(6→8): [[prompt-capture]](프롬프트 분기분류 append, extract-prompts.mjs+`--self-test`) · [[tool-intake]](신규 도구 도입 6단계·SkillSpector 게이트 내장).
- 스킬맵·거버넌스 전파: registry-skills·AGENTS §4-A(트리거 2)·bootstrap SKILL_DIRS·_tools-index(8종)·메모리(본선-운영-하네스).

**결과물**: `_system/skills/{prompt-capture,tool-intake}/`, [[도구-확장-리서치-20260701]], 프롬프트 로그 T1~T9, decision 2건.

**다음**: 두 스킬 커밋·푸시. 미적용 잔여=EXAONE 7.8B 로컬 셋업(시연), Cytoscape/Hono/PII는 각 워크스트림 착수 시 메모리 트리거로 재제안.

### 2026-07-01 · 시각화 스킬 맵·메모리 갱신
**한 일**
- [[visualization-cycle]]을 신규 스킬 생성 없이 확장: `workflow-gap-audit` 후보와 `visual-brief-audit` 기각 항목을 검증 단계에 흡수.
- 메모리 [[본선-운영-하네스]] 신설: 자체 스킬 9종, `submission-consistency-check` 활성, `visualization-cycle` 강화 검증, 후보/기각 스킬 판정 기록.
- 스킬맵 전파: [[_tools-index]]·[[AGENTS]]·[[_HARNESS-SYSTEM]]·[[harness-sync]]에 간트 갭·5초 가독성·사람/AI/기여 레이어 검증 문구 반영.

**검증**: `visualization-cycle` quick_validate 및 `run.mjs` 통과. `canon-moc-sync` dry-run 기준 frontmatter·MOC·죽은링크·도달성 정합.

### 2026-07-01 · session-boot 스킬 신설 (세션 오리엔테이션)
**한 일**
- [[session-boot]] 신설(자체 9→10종): `boot.mjs` 컴팩트 스냅샷(git·페이즈·마지막 로그·자동스킬·게이트, `--self-test`) + SKILL.md.
- **자동 호출**: `CLAUDE.md`에 "본선 작업 시작 시 session-boot 먼저 실행" 1줄 추가(매 세션 자동 로드).
- 전파: registry-skills·AGENTS §4-A(최상단 트리거)·bootstrap SKILL_DIRS·_tools-index(10종)·메모리(본선-운영-하네스).

**결과물**: `_system/skills/session-boot/{SKILL.md,boot.mjs}`, CLAUDE.md, 로그 3종(T10).

**검증**: boot.mjs self-test·실출력 ✓, canon-moc-sync [5/5] ✓.
**다음**: 커밋·푸시.

### 2026-07-01 · 야간 자율 — 리서치 종합·적대검증·정합감사 (오프라인)
**한 일** (사용자 취침 중, 외부 API·푸시 0 / 코덱스+Sonnet 3에이전트 병렬)
- **리서치 7레이어 총정리본 조립**(Sonnet): [[_총정리본-7레이어-검증]] — D3e/D3f+D-시리즈를 그룹개요·지배구조·재무·계열사·규제·리스크·전략 7레이어로 종합, 사실마다 출처링크+신뢰마커(✅검증/🔁교차/⚠️미검증/❗충돌). ❗충돌 6건 병기(주가기준일·PBR·2023 ROE·전북은행 순익·대환 단년·광주은행 NPL).
- **적대검증**(Codex, 오프라인 삼각검증): [[_적대검증-리포트]] — 다회차/다모델 6세트 + 고위험 3건(재무·법·시장) + 단일소스 22항목 + _canon 충돌/해소후보. 핵심: 그룹 3대 재무·전세사기·보이스피싱·법조문은 _canon 정합 / 고위험=계열사 지표혼용·시장ROI·등기정보광장 한도(웹 재검증 필요).
- **제출물 정합감사**(submission-consistency-check): [[submission-consistency-report]] — 불일치 15건(고7/중5). 최상위 3: ai-report-final 미작성 · _canon §1 본선 히어로 미갱신(SME 잔존) · live-final-verification 백엔드 전제 오류(현 MVP=정적).
- **_canon 정합 정리안**(직접수정 X, 제안만): [[_canon-정합-정리안]] — A 승인필요(히어로 프레이밍) / B 제출가드(단일소스 격리) / C 주석보강 / D 변경불필요(정합 확인).

**결과물**: `04_증빙/02_분석자료/리서치/02_결과-원문/` 3종 + `05_제출/submission-consistency-report.md`.
**검증**: canon-moc-sync [5/5] 도달성 ✓(4 신규파일 frontmatter·up 정합). 오프라인 준수(웹 0).
**다음(사람)**: §1 제품정의 승인 회차에서 본선 히어로 확정 → _canon·하위문서 정렬 / ai-report-final 초안 / 웹 재검증 항목 2차 라우팅.

### 2026-07-01 · 야간 자율 2 — 11블록 채움 + 빌드 WBS + 거시 동기화 (Codex 최대화)
**한 일** (취침 중 자율, Codex GPT-5.5 high 생성 → Claude 검증 루프)
- **11블록 캔버스 채움 완료**([[제품정의-캔버스]]): 4 wave Codex 병렬 draft → 검증(격리수치 단정 누출 0·확정값 _canon 정합·링크 실재·히어로 잠정·미결 옵션병기) → 반영. 11셀 + KPI열 + 심사25항목 커버리지 25✅ + 마커 범례. 표 무결(7파이프).
- **가정·민감도 부록 동반**([[_가정-민감도-부록]]): 시장·ROI·RM비용·TCO·SLA 격리수치를 범위/근거등급으로 격리(블록9/10/11이 참조).
- **빌드 로드맵(WBS) 트리 신설**([[_빌드-로드맵-MOC]] + P0~P6 7페이즈): 정의→데이터→에이전트→보안→UI(조직도)→통합·로컬모델시연→리허설. 각 목표·세부작업(분류태그)·의존·담당에이전트·산출·근거링크. 잠정 draft. 부모=_03_제품_MOC, INDEX 링크.
- **거시 동기화**(Codex): [[PLAN]]·[[PROGRESS]] 갱신 + `canon-moc-sync --apply`(frontmatter 백필 D20~23 등·MOC 자동링크). 거버넌스·메모리는 Claude 직접.

**결과물**: 캔버스 채움 + `_가정-민감도-부록.md` + `03_제품/06_build-roadmap/` 8파일 + PLAN/PROGRESS + 거버넌스 3종 + 메모리.
**검증**: canon-moc-sync **[4/5] 죽은링크 0·[5/5] 도달성 전부·사이클 0**, 캔버스 잔존 0·25✅, npm run test(verify_static) 통과.
**커밋·푸시**: 명시 승인 → 논리 커밋 3개 + **fork(River-181) push**(브랜치 ui-density-improvements, PR #11 트랙).
**다음(사람)**: 미결 3종 택1(전북/광주·배포vs로컬·DB) → 캔버스 옵션 확정 · §1 _canon 히어로 갱신([[_canon-정합-정리안]] A1) · 빌드 WBS 실착수.

<!-- 새 세션은 이 줄 아래에 추가 -->

### 2026-07-02 · 백업 위험·협업 인프라 정비 + 회의4/5 준비 + 데일리 시스템 + AI 프로토콜
**한 일**
- 백업 위험 진단·보완: `.stversions/`·`*.sync-conflict-*` gitignore(구 `_canon` 사본 유입 방지).
- [[다음-작업-분해]] — 회의록3 결정 게이트(G1~G7·A1) + READY/BLOCKED 태스크 보드.
- 회의 4([[회의록-2026-07-03-제품정의확정]])·5([[회의록-2026-07-04-시연기술범위]]) 준비 문서 + [[_회의록-INDEX]] 등재. 다운로드 zip JB 디자인 토큰 확인(#0A31A8·SUIT·radius 8/16).
- **협업 진단 + 텔레메트리 근본수정**: `session-telemetry.mjs` `cwd`→`CLAUDE_PROJECT_DIR` 앵커, 중첩 `08_본선/…/08_본선/` 트리 4곳(12파일) 제거(데이터 손실 0, 하위폴더 실행 테스트 통과).
- **데일리 노트 시스템 신설** + 소급 6일치(Codex 4병렬, 06-26~07-01) → [[_daily-INDEX]].
- **[[AI-협업-맥락관리-프로토콜]] 신설** — 병렬 세션 공존·경로앵커·SSOT·승인게이트 룰북.
- 거버넌스·메모리·MOC 정합.

**검증**
- canon-moc-sync 죽은링크 0·도달성 전부·사이클 0. `node --check session-telemetry.mjs` OK. verify_static 영향 없음.
- 데일리 6종 형식·`.md`누출 0·팩트 정합(06-30 _canon §10 수치 = decision-log 일치).

**결과물**: 커밋 4개(`8a374ab`·`87687d4`·`bfb95bb`·`3b4c27c`·`bac148c`) fork(River-181) 푸시.

**다음(사람)**: 메인 승격 방식 확인 → 회의4/5 실행(게이트 픽) → 정의 §1 확정.

## 2026-07-01 야간 · 리서치 점-점 종합 파이프라인 (Codex gpt-5.5 병렬, A→B→C 완료)
사용자 취침 중 자율 진행. 40개 독립 결과 → 6 연결노트(Phase A) → 교차 인사이트맵·canon 갱신후보(B) → 본선 논증척추(C). 산출 `_결과/_종합/` 9파일. 가드: 푸시 없음·canon 자동수정 없음(제안만 12건, 승인대기)·휴머나이즈·출처보존. 플랜 [[리서치-점연결-야간종합-플랜]], 기록 R39. 메모리·MEMORY·MOC(02_전략)·회수현황 배선 완료. 함정해결: Bash도구 zsh(→bash 스크립트), 한글 글로브 NFD(→`${code}-*.md`), codex stdin(`< /dev/null`). 병렬 paperclip 레인(R38)과 파일 무충돌. 아침 검토: _인사이트맵→_본선-논증척추→_canon-갱신후보(승인)→커밋·푸시 여부.

### 2026-07-02 · 간트 수정 후 Excalidraw 보드 동기화
**한 일**
- [[workflow-gantt-blueprint]] 기준을 갭 감사 권고(G4/G5/G6)에 맞춰 갱신: `제품 결정/범위 확정` 레인 추가, `정적 MVP→백엔드/API 승격` 바 추가, `SME 히어로·조직도 UX`와 `리서치 흡수→제품 결정` 체크포인트 표시.
- 간트와 함께 움직이는 보드 묶음 정리: [[VISUALIZATION-PLAN]]에 `간트 동기화 묶음` 추가, [[_viz-index]] 설명 갱신.
- 주변 Excalidraw 보드 의미 동기화: `project-master-timeline`, `urgent-action-map`, `judge-criteria-coverage-map`, `finals-demo-readiness-map`, `team-contribution-role-radar`, `update-control-tower`, `demo-video-storyboard`, `evidence-traceability-board`, `demo-golden-path-state-machine`, `research-to-product-funnel`.
- [[visualization-cycle]] 검증 스크립트에 `제품 결정`, `API 승격`, `SME`, `Decision Gate` 누락 감지 추가.

**검증**
- `node 08_본선/_system/skills/visualization-cycle/scripts/run.mjs` 통과 — 20개 `.excalidraw` 재생성·검증.
- `npm run test` 통과 — `static verification passed`, checked files 34.

**다음**
- 실제 화면 렌더 수동 QA는 아직 미확인. Obsidian/Excalidraw에서 `workflow-gantt-blueprint`, `research-to-product-funnel`, `evidence-traceability-board` 3개를 우선 시각 확인.

### 2026-07-02 · Excalidraw 공유용 이미지 Export
**한 일**
- `08_본선/_system/automation/viz-exporter.mjs` 신설: 원본 Excalidraw 20개를 SVG+PNG로 일괄 export.
- export 위치: `08_본선/assets/excalidraw/exported-images/20260702/`.
- 공유 후보 6개를 `_export-index.md`에 표시: `workflow-gantt-blueprint`, `project-master-timeline`, `team-contribution-role-radar`, `research-to-product-funnel`, `evidence-traceability-board`, `demo-video-storyboard`.
- [[VISUALIZATION-PLAN]], [[_viz-index]], [[SHARE-PACKAGE]]에 export 명령·경로 연결.

**검증**
- `node 08_본선/_system/automation/viz-exporter.mjs` 통과 — 20개 보드 export.
- `sips -g pixelWidth -g pixelHeight`로 공유 후보 6개 PNG 해상도 확인.
- `workflow-gantt-blueprint.png` 직접 시각 확인.

**다음**
- 발표덱 최종 삽입 전 Obsidian/Excalidraw 네이티브 export와 비교 QA.

### 2026-07-02 · 공유 이미지 손그림풍 재export
**한 일**
- `viz-exporter.mjs` 기본 렌더를 깔끔한 SVG 차트풍에서 Excalidraw 손그림풍으로 변경.
- 사각형·채움 면·선·화살표에 이중 러프 스트로크와 미세 흔들림을 적용.
- `08_본선/assets/excalidraw/exported-images/20260702/`의 20개 PNG+SVG를 hand-drawn 스타일로 재생성.
- `_export-index.md`에 `Export style: hand-drawn` 기록.

**검증**
- `node --check 08_본선/_system/automation/viz-exporter.mjs` 통과.
- `node 08_본선/_system/automation/viz-exporter.mjs` 통과 — 20개 보드 재export.
- `workflow-gantt-blueprint.png` 직접 시각 확인.

### 2026-07-02 · GitHub 미리보기용 이미지 README
**한 일**
- `viz-exporter.mjs`가 `README.md`를 함께 생성하도록 수정.
- GitHub가 렌더링하지 못하는 Obsidian `![[...]]` 임베드를 표준 Markdown `![](file.png)` 이미지 링크로 변경.
- `08_본선/assets/excalidraw/exported-images/20260702/README.md`에 추천 공유 순서와 6개 대표 이미지를 직접 표시.

**검증**
- `node --check 08_본선/_system/automation/viz-exporter.mjs` 통과.
- `node 08_본선/_system/automation/viz-exporter.mjs` 통과.
- `npm run test` 통과.
- `canon-moc-sync` dry-run 통과: frontmatter·MOC·죽은 링크·도달성 정합.

### 2026-07-02 · 팀 역할/발표 PPT 전략 갱신
**한 일**
- 재형 역할을 `데이터·시스템 설계·금융 전략`으로 정정: `member-04`, `_team-roster`, `contribution-ledger.csv`, `_contribution-stats` 반영.
- `workflow-gantt-blueprint`, `team-contribution-role-radar`, `ax-operating-system-map` 재생성: 재형을 DB/API·데이터 모델·시스템 구조 검토 담당으로 표시.
- `발표-PPT-전략-스토리보드.md` 신설: 본선 확정 전 PPT 전략 SSOT, 12장 슬라이드 스토리보드, 6분 컷, 회의 4·5 확정 게이트 기록.
- `VISUALIZATION-PLAN`, `_viz-index`, `_05_제출_MOC`에 새 발표 전략 문서와 시각화 입력 관계 연결.

**검증**
- `node --check 08_본선/_system/automation/viz-generator.mjs` 통과.
- `node 08_본선/_system/automation/viz-generator.mjs` 통과 — 20개 보드 재생성.
- `node 08_본선/_system/skills/visualization-cycle/scripts/run.mjs` 통과 — 20개 Excalidraw 검증.
- `node 08_본선/_system/automation/viz-exporter.mjs` 통과 — 공유 PNG/SVG 재export.

## 2026-07-02 · JB 도입시나리오 설득패키지(PPT 백본) 착수
- PM 고민(설득 준비 미흡) → 재프레이밍: 리서치 부족 아님, "임원 언어 조립" 부재. 회의록(6/30·회의4·5)+P1·P3·논증척추 확인.
- 산출: [[JB-도입시나리오-설득패키지]] — 레인+레이어 핵심슬라이드, 외부/공공데이터 3레인 안전반입표, 보안 리스크→통제→증거표, 모델주권(로컬우선), 히어로1풀리얼 빌드청사진, 확장 4단계, 경제성, 시장분석 갭.
- 잠정 결정: 계열사=전북 히어로 / 구동=하이브리드 실동작 / 히어로 도메인=보이스피싱 / 연동=혼합(히어로 실API). 모두 회의4·5 게이트 확정 대기.
- 로컬모델 추천(M4 Pro): EXAONE 3.5 7.8B(한국어) / Qwen2.5-14B(툴콜) · Ollama or MLX.
- ⚠️ 크루프트 재확인: 04_증빙/01_핵심로그/08_본선/ 중첩 디렉토리 여전(상대경로 쓰기 사고) — 커밋 제외 대상.

### 2026-07-02 · paperclip fork 시각검증 실험 (Codex 병렬)
- **⚠️ 협업 공지**: `~/Downloads/archives/paperclip-jb-fork/`(볼트 밖·비커밋)는 **시각 확인용 레퍼런스 실험**. **최종 제품 아님** — 실제 구현은 다른 팀원 담당. 다른 에이전트는 이 fork를 프로덕션으로 취급 말 것. 근거·재개법: [[레퍼런스]] "paperclip fork 실험" 절.
- 한 일: (A)paperclip 실제 설치·부팅·**영속 실측** → JB 실토큰 리스킨(#0A31A8·SUIT·8px) → 도메인 개조(Sidebar 한글화·3계열사·[[nemotron-personas-korea]] 합성페르소나 9 Case). Codex 최대 4병렬(하위에이전트 활용)로 앱 자체 테스트·데이터 확장 진행.
- 결과물: [[paperclip-런타임-데이터흐름]](루프1~3 실측)·[[nemotron-personas-korea]](재사용 데이터셋). 서버 `localhost:3100` 가동.
- 격리: JBproject 볼트 무영향(verify_static 34 green). 볼트 신규=학습문서 1개(텍스트).
- 다음: Codex 병렬 결과 회수 → 시각 갤러리 캡처. 제품 채택 여부는 제품정의 확정 후(사람).

### 2026-07-02 · JB 콘솔 프로토타입 착수 (fork를 우리 예선 설계+JB디자인으로)
- **재프레이밍(사용자)**: 현 fork는 "paperclip에 이름만 바꾼 것" → 우리 예선 15페이지 IA·전세Shield·PII거버넌스·L0~L4·증빙체인으로 재구성 + 표절우려 해소용 **깊은 JB 디자인**. **위상=팀 내부 레퍼런스**(실제 제품은 팀원 별도). 품질 바=**5천만원 외주 납품물**([[jb-console-quality-bar]]).
- **컨텍스트 관리**: fork 독립 git **jb-console 브랜치** 신설. SSOT [[JB-콘솔-프로토타입-스펙-가안]] 신설. 토큰 파이프라인 `scripts/jb-tokens-sync.mjs`.
- **Codex 5병렬 착수**: C1 JB디자인CSS·C2 IA맵·C3 전세Shield·C4 PII+감사체인·C5 리스크L0~L4. ⚠️Codex sandbox localhost·Downloads쓰기 차단→적용·시드=메인세션.
- 볼트 무영향(verify_static green 유지).

### 2026-07-02 · JB 콘솔 심화: 실 은행 워크플로 3종 + 14 canon 에이전트 + JB 아이콘 (커밋 jb-console `389e5ca`)
- **사용자 판정**: 현 프로토타입은 실 은행 운영 불가(실 업무 자동화 부족)·에이전트 종류 부족·아이콘 paperclip 그대로 → JB 토큰 정합 요구. 품질 바=**5천만원 외주 납품물**([[jb-console-quality-bar]]).
- **인터랙티브 워크플로 3종**(JeonseShield 골격 복제·useMemo 실시간, `RiskDecisionView.buildSignalsForAction` 가중치 미러): FraudShieldPage(이상거래 L4 자동차단→사람 승인 게이트·fraud 4신호)·RepaymentTriagePage(상환위험 sme 5신호+시나리오 3종)·PolicyMatchPage(정책금융 매칭 대환대출·햇살론뱅크·소진공·지역신보+서류·연계). 신규 정적 데이터(시나리오·상품표)는 "데모/시뮬" 라벨.
- **14 canon 운영 + 2 사람 승인자 리시드**: `packages/db/src/jb-reseed-agents.ts`(기존 4행 UPDATE·나머지 INSERT=FK 보존), LocalGuard 회사(db37c44b). 운영 조율=root, 전세 3종→전세위험 관리 리드, 나머지+승인자→운영 조율 → `/agents`·`/org` 실 조직 렌더. role enum 12개 고정 준수(정체성=name/title).
- **아이콘 JB 정렬**: `svg.lucide{stroke-width:1.75px}`(전 아이콘 경량화·JbIcon 래퍼 대신 1줄 전역)·승인/신규 nav 의미 정합. PII거버넌스·감사체인 하드코딩 팔레트→JB 토큰 하모나이즈(의미색 유지).
- **검증**: UI/DB `tsc -b` exit 0 · 6라우트(fraud/repayment/policy/pii/audit/org) 라이브 렌더 pageerror 0·needle 통과 · verify_static 34 green · 볼트 fork 코드 0. 갤러리 6컷 캡처.
- **분업**: 3페이지·리시드·하모나이즈 전부 메인세션 직접 저작(패턴 충실도·HTML이스케이프 버그 회피). Codex는 이번 회차 미사용(직접 저작이 5천만원 바에 더 부합).

## 2026-07-02 · 리서치 시각화 — 리서치 지도(mermaid) + Obsidian 임베드
- 목적: 리서치 36건 각각의 핵심을 한 장에, 팀원(렌더)+AI(텍스트) 공용.
- 산출: [[08_본선/04_증빙/02_분석자료/리서치/03_요약-정리/_리서치-지도]] — mermaid mindmap(4클러스터: 사실·시장/규제·법/AI·에이전트/검증·운영) + 클러스터별 so-what 표. ⭐=D25·D30·D23.
- 시각화 고안: 계층1 볼트내 mermaid(자동 렌더)·계층2 PNG(덱용, chromium 미설치로 보류). 연결 = `![[08_본선/04_증빙/02_분석자료/리서치/03_요약-정리/_리서치-지도]]` 임베드.
- 임베드 배치: [[_운영-회수현황]]·[[_인사이트맵]] 상단에 인라인, [[_운영-실행-대시보드]]에 포인터.

## 2026-07-02 · 리서치 운영문서 정합성 감사 (Codex 4병렬 위임)
- 감사: 프롬프트 카운트 문서마다 불일치(README 30/대시보드 27/회수현황 20·21/MOC 29·19/지도 36) → 권위값 **36종**(D1a~D30·D3a~f·D+a/b·B1) 확정, 미생성 후보 5(D24·D26~29), 결과 44파일.
- 위임: Codex gpt-5.5 4병렬(workspace-write) — C1 README+MOC / C2 대시보드 / C3 회수현황+모델기록 / C4 분해+_02+_03. C1·C3·C4 완료, C2는 하네스 타임아웃으로 잘려 직접 마무리.
- 통합: 08_본선/04_증빙/02_분석자료/리서치/03_요약-정리/_운영-코덱스-점검 frontmatter 깨짐 수정 + status/archived·스냅샷 명시(2026-06-29 19종 시점, _03·회수현황으로 상위대체). "1차 사이클 마감" 프레임 폐기 → 리서치→빌드 피벗.
- 검증: 구닥다리 마커 clean, canon-moc-sync 죽은 링크 0·도달성 OK.

## 2026-07-02 · 빌드 플랜 초안(히어로 실동작 데모)
- writing-plans로 [[빌드플랜-히어로-실동작-데모]] 작성(회의5 게이트 초안). Explore 서브에이전트가 app.js 매핑(4함수계약·jeonse 경로·persist·fetch/모델 훅·verify_static 니들) 선행.
- 핵심 발견: 감사체인 이미 실제(auditChainRecords 해시체인+persistState). 실 데이터/로컬모델만 RUNTIME_CONFIG opt-in seam으로 주입.
- 5 Phase: P0 설정seam / P1 전세 국토부 실거래가 프록시+주입(머니샷) / P2 로컬모델 판단텍스트(Ollama) / P3 감사체인 노출 / P4 폴백·리허설. 전부 폴백=현행 결정론(오프라인·verify_static 안전).

## 2026-07-02 · 빌드 Phase 0 실행 완료 (RUNTIME_CONFIG seam)
- [[빌드플랜-히어로-실동작-데모]] Phase 0 실행: app.js에 RUNTIME_CONFIG opt-in seam(기본 OFF)·isLive() 추가, 02_제품/scripts/api-proxy.mjs(국토부 프록시 스캐폴드) 생성, package.json demo:proxy 추가, E2E "live flag" 테스트 추가.
- 검증: node --check(app+proxy) OK · verify_static 34파일 통과 · 전체 E2E 20/20 통과(회귀 0).
- 미실행(의존성/게이트): Phase1 Task2(실 시세 주입, DATA_GO_KR_KEY 필요)·Phase2(Ollama 데모머신)·Phase3~4. 회의5·개발리드 몫.
- 커밋 안 함(지시 대기).

### 2026-07-02 · JB 콘솔 케이스 중심 재구현 P0~P4 ("디자인 티 제거→실사용 UX", Codex 구현)
- **피벗**: 계산기 4종은 케이스와 분리돼 "이게 뭔 프로그램인지" 안 읽힘 → MVP(`02_제품/app/`) 정답지로 **케이스 중심 운영 콘솔** 재구현. 개념(Case→AgentRun→Agent→Skill→Evidence→Approval→Audit)은 이미 정답, 디자인/UX만 프로덕션 품질로. 계산기=보조 탭 유지(임베드 폐기).
- **P0~P4 완료**(커밋 2324d28·427f6bd·282de15): 밝은 테마 기본·nav 정리 / 시드데이터 5모듈 / 케이스 큐+상세 전용뷰(8단계 타임라인·근거·산출물MD·승인+감사) / 스킬 콘텐츠 엔진·플러그인 MCP 레지스트리 / 디자인 폴리시(게이지·버튼).
- **fork 이전**: `~/Downloads/archives/`→`~/project/active/paperclip-jb-fork`(Codex TCC 우회, 볼트 sibling). [[paperclip-fork-experiment]] 갱신.
- **개발 분업(Codex 구현·토큰 절약)**: 신규파일=Codex 생성→`/tmp` 스테이징→Claude 이동(P1·P2·P3), 기존편집·디자인 반복=Claude(P0·P4), localhost·스크린샷·시드·검증=Claude. Codex 샌드박스는 fork read/write 불가(볼트만) — 정본 [[JB-콘솔-개발도구-SDK-플랜]].
- **검증**: 전 tsc 0·pageerror 0·verify_static 34 green·볼트 fork코드 0. 스펙 [[JB-콘솔-프로토타입-스펙-가안]]·프롬프트로그 [P]브랜치(P1~P24) 갱신.

### 2026-07-03 · JB우리캐피탈 도메인 하네스 신설 (wooricap.com 전수 분석)
- **신설**: `03_제품/07_계열사-하네스/` — 메인 운영 하네스([[_HARNESS-SYSTEM]]) 틀을 미러링한 **계열사 도메인 하네스**. 마스터 [[_HARNESS-WOORICAP]] + 5문서(회사개요·조직도·업무처리-기술·사이트-IA분석·요구해결-맵).
- **수집**: wooricap.com 정적 fetch(2026-07-02~03) — 조직도(이사회 5위원회 + 13본부·팀 단위 + 경영위원회 8) / 사업영역 4 / 상품 15종 메타 / 소비자보호 체계(3단계·6대 판매원칙·상품개발 4단계) / 연혁 / 회사개요(총자본 1.8조·임직원 634). ⚠️ `/fin` 상품 상세 본문은 동적(XHR) 미확보 — 한도·금리 스펙 인용 금지, 문서에 한계 명시.
- **핵심 발견**: ① AX 조직 2개 실재(AX전략혁신팀·AX추진팀) = 도입 스폰서 실명화 ② 여신관리본부 전국 8센터 = "여신 사후관리" 페인포인트의 실조직 ③ NPL 전담 2팀 = 조기감지 ROI 재무 직결 ④ 캐논 14 에이전트 → 우리캐피탈 조직 배치 매핑 완성(콘솔 /org 시드 근거).
- **정합**: canon-moc-sync green(중복명 0·죽은링크 0·신규 6건 도달성 해결), _03_제품_MOC §07 신설.

### 2026-07-03 · D30 TAM 방식 A 분모 취약 발견 → D30b 재조사 프롬프트 신설
- **발견(PM 지적)**: [[D30-결과-원문]] TAM 방식 A 분모 "국내 AI 시장 2026e 3.9조원"이 삼중 취약 — ① 2023년 2.61조 = 출처목록 부재(근거 미상) ② 2027년 4.46조 = "한국IDC" 표기인데 각주는 gminsights.com(무관 GenAI 페이지) + 원문은 "AI **분석** 시장"인데 "AI **전체** 시장"으로 확대(카테고리 슬리피지) ③ 2026e 3.9조 = 2.61↔4.46 선형보간 미고지.
- **조치**: [[08_본선/04_증빙/02_분석자료/리서치/01_프롬프트/D30b-국내AI시장규모-1차출처확정]] 신설 — 단일 수치 provenance 확정 수술 프롬프트(🟠GPT-5.5 DR). ⓐ전체AI/ⓑGenAI/ⓒAI분석 카테고리 분리 강제 + 원문 URL 추적 강제. D30(전체 시장분석)은 유지, 이건 분모 하나만.
- **인터림 가드**: D30-결과 TAM표·설득패키지 슬라이드8에 `⚠️보간·재검증中` 마커 부착 — 확정 전 3.9조 발표금지. 사실 미발명(보간 사실을 명시했을 뿐).

### 2026-07-03 · D30b 즉시 해결 (Sonnet 직접 리서치 + IDC 원문 회수)
- **방법**: PM 지시로 Claude Sonnet(think, Perplexity, Pro 1회)로 직접 검증 → 인용 URL에서 한국IDC 원문 보도자료 WebFetch로 수치 확정.
- **확정(1차)**: 한국IDC 2023-04-27 "국내 인공지능 시장 CAGR 14.9%, 2027년 4조4,636억 전망" — **2023년 2조6,123억(2.61조) → 2027년 4조4,636억(4.46조)**. 서비스+SW+HW = **전체 AI 시장(ⓐ)**. 원문 `idc.com/resource-center/press-releases/한국idc-국내-인공지능-시장...2027`.
- **판정**: D30 숫자는 **진짜였음**. 결함은 오직 ① 각주 오링크(gminsights→IDC 정정) ② "AI 분석 시장" 우려는 **오탐**(=시장분석 보고서지 애널리틱스 시장 아님) ③ 3.9조(2026e)=2023↔2027 기하보간(CAGR 14.9%)으로 방어가능.
- **정정**: D30-결과 TAM셀·출처목록 1차URL 교체 + 설득패키지 슬라이드8 마커→✅확정. D30b 프롬프트=해결배너 부착(외부 재실행 불필요, Gemini 교차 시에만).

### 2026-07-03 · D31 신설 — 타겟모수 RM·인접직군 헤드카운트 센서스
- **동기**: PM — 초기 타겟=RM, seat 과금이라 "몇 명인가"가 SAM/SOM 분모. RM에 국한 않고 준법·여신심사·사후관리·AML로 확장 램프까지 정량화 요청.
- **신설**: [[08_본선/04_증빙/02_분석자료/리서치/01_프롬프트/D31-타겟모수-RM인접직군-헤드카운트-센서스]](🟠GPT-5.5 DR). ① 전국 은행권 RM/인접직군 모수(TAM) ② JB그룹 — **전북은행+광주은행+JB우리캐피탈**(광주은행 누락 방지 명시) ③ 3계층 seat 램프(초기 RM→확장→전사). RM 정의 좁은/넓은 분리 강제 + 헤드카운트 환각 방지 규칙.
- **경계**: D16(RM 업무량·질)·D4(직무 정의)·D2(도메인 성격)·D30(금액)과 중복금지 — D31은 *모수·양*. 산출 시 D30 SAM방식B·SOM seat 되먹임.
- **상태**: 프롬프트 대기(PM 실행). 미실행.

### 2026-07-03 · D31 결과 회수 — RM·인접직군 seat 모수 확정
- **회수**: [[D31-결과-원문]] (GPT-5.5 DR). RM 좁은정의 seat = **JB 116석 / 전국 코어 은행권 2,462석**. 넓은정의(RM+여신심사+사후관리+준법+AML) = **JB 365석 / 전국 7,925석** (RM 대비 3.2배 cross-sell 모수). seat 램프 3계층·매출환산 표 확보.
- **⭐ SSOT 되먹임**: **광주은행 총 임직원 1,460명**(은행연합회 2025 경영현황, 1차) 신규 확보 — `_canon.md` 은행별 임직원 공백 메움. **canon 승격 제안 대상**(자율 반영 안 함). 전북 1,439 재확인. JB우리캐피탈 638(2차) vs SSOT 634 = 0.6%차.
- **정합**: D30 SOM 가정 150~350석 ↔ D31 확장 346·전사 365석 일치 / D30 SAM 110~200억 ↔ D31 전국 확장 147~220억 동일밴드. → SOM/SAM 셀·설득패키지 슬라이드8 D31 근거로 보강.
- **한계**: 직무비중 RM·여신·사후 [가정](±15~25%). 비은행(저축·카드·캐피탈) 확장은 [미검증 범위]. JB우리캐피탈 1차 사업보고서 미확인.

### 2026-07-03 · 7/1~7/3 회의 결정 실행판 시각화
- **목적**: 7/1~7/3 회의록·데일리·decision-log를 의사결정/실행용 보드로 변환. 회의록을 다시 읽지 않아도 확정·TBD·mixed·risk와 담당 사람/AI를 볼 수 있게 함.
- **산출**: [[meeting-decision-action-board-plan]] 신설, `meeting-decision-action-board.excalidraw` 생성, 20260703 공유용 PNG/SVG export.
- **보드 내용**: 7/1 기반 구축(정합화·자동화·리서치·WBS), 7/2 제품/UX 방향(키보드 UX·역할 대시보드·에이전트 구조·PII), 7/3 스코프/제출 조건(D1 전북+캐피탈, D4 하이브리드, 역할 분담, 시연영상 가점). D2/D3/D5는 `TBD/mixed`로 표시.
- **자동화 반영**: [[VISUALIZATION-PLAN]]·[[_viz-index]] 등록, `viz-generator.mjs`·`viz-exporter.mjs`·`visualization-cycle/scripts/run.mjs` 갱신.
- **검증**: `node --check` 3종 통과, `visualization-cycle` 통과(22개 Excalidraw), `viz-exporter` 통과(22개 PNG/SVG, `20260703/`).

### 2026-07-03 · Capture-by-default 거버넌스 무결성 점검
**한 일**
- `04_증빙/03_daily/` 기존 파일을 확인하고, 누락된 [[2026-07-03]] daily note를 템플릿 형식으로 생성.
- [[_daily-INDEX]]에 2026-07-03 링크를 추가하고, 2026-06-28은 세션 기록 없음으로 소급 생성하지 않음.
- decision-log·session-log·프롬프트-로그의 7/3 최신성을 점검해 운영시스템 점검·앱설계 문서화·발표준비 handoff를 append-only로 보강.

**결과물**: [[2026-07-03]], [[_daily-INDEX]], [[decision-log]], [[session-log]], [[프롬프트-로그]].

**다음**: canon-moc-sync로 링크 정합성 확인.

### 2026-07-03 · 공개 라이브 데모 URL + 온라인 DB 배포 스택 리서치
**한 일**
- 본선 안내 자료를 재확인하고, 공개 라이브 데모 URL + 누구나 볼 수 있는 온라인 DB로 MVP를 확장하는 데 필요한 배포/호스팅/DB/백엔드/CLI/MCP 스택을 Codex에 위임해 리서치.
- 결론(정적 호스팅=Cloudflare Pages, 온라인 DB=Supabase, 백엔드=별도 서버 없음/RPC, CLI/MCP 5종, SkillSpector 게이트 재확인, DataSource 인터페이스 설계)을 문서화하고 레지스트리·로그에 전파.

**결과물**: [[배포-스택-리서치-20260703]] 신설, [[registry-cli]]·[[registry-mcp]] 각 2~3행 추가(상태=검증 후 사용), [[프롬프트-로그]] T11, [[decision-log]] 1행.

**다음**: 실제 CLI 설치(Wrangler/Supabase)·MCP 연결·배포 실행은 외부공개 게이트 — 사용자 승인 대기. 승인 시 DataSource 인터페이스(LocalStorageDataSource/SupabaseDataSource) 구현 착수.

### 2026-07-03 · 마일스톤 — 리서치·앱설계 초안 → 바텀업 결정준비 배치 피벗 (Codex 오버나이트 Workflow 2라운드)
- **목적**: 정의서(스펙) 착수 前, 7/1~7/3 회의 기반으로 결정에 필요한 후보·근거·판정만 먼저 준비(확정은 7/4 오전 팀 몫). 리서치·앱설계 초안 단계에서 바텀업 결정준비 배치로 전환.
- **산출**: `08_본선/03_제품/01_결정-준비/` 신설 — 회의록 3종 인물별 정리+추출 · [[결정-현황-종합]](확정10·가안9·미결12, Q1~Q12) · 질문 Q1~Q12(후보 A/B/C + 데이터근거 D1~D31 + 500자 프롬프트 + 심사위원 반박) · 근거팩 3종([[ROI-근거팩]]·[[적법성-근거팩]]·[[실동작-데모-증거팩]], weak→improved 검증) · [[발표-탄약고-검증된근거]](심사 5축 42근거) · viz 3보드 · [[아침-카톡-브리핑]] · [[MASTER-PLAN-오버나이트-결정준비]] · [[_결정준비-MOC]].
- **방식**: Workflow 2라운드(agent 39개·에러 0, sub-agent 약 220만 토큰 = Sonnet+Codex 헤드리스, Opus 최소 사용). 회의록 6천줄 분해·리서치 마이닝은 Codex에 위임.
- **검증**: ROI 연 7.66억 절감(RM 116석·D16 바텀업 재검증) 확정. 적법성 = 신정법 §40조의2(canon §4 기존 근거 재확인 + 초기 심사반박 오탐 정정) + 전자금융감독규정 §15 망분리 + 금융위 MLS. 작업 중 자기 오류 2건 자동 정정(§36조의2 오귀속 · 연체축 수치 17조→19조808억 1차). 커밋 018d11c·9c09927(내 배치 파일만·로컬·미푸시). 볼트 정합 100%(canon-moc-sync 죽은링크 0·도달성 100%).
- **다음**: 7/4 오전 팀 결정 대기 — keystone(전세 vs 피싱 실동작 택1) → Q1·Q6·Q7·Q8·Q9 연쇄 확정. 남은 갭: ROI 실현율[추정] 검증, 공공API/로컬모델 도달성 확인, JB우리캐피탈 수치[미검증] 재확인.

### 2026-07-03 · 팀 공유용 오전 결정 브리핑 보드 생성
- **목적**: 오버나이트 결정준비 결과를 팀원이 바로 공유·판단할 수 있는 한 장짜리 보고용 시각자료로 압축.
- **산출**: [[morning-decision-brief-board-plan]] 신설, `morning-decision-brief-board.excalidraw` 생성, 20260703 공유용 PNG/SVG export 대상 등록.
- **보드 내용**: ROI 연 7.66억원·적법성·실동작 도달성 3축은 검토만으로 표시. Q1/Q3/Q5/Q7/Q11/Q12 후보와 추천안을 한 테이블로 정리. `전세사기 vs 보이스피싱 실동작 택1`을 keystone으로 크게 표시. 이승보·김민주·김주용·최영욱·재형 담당 액션과 제품 구조 흐름을 함께 배치.
- **자동화 반영**: [[VISUALIZATION-PLAN]]·[[_viz-index]] 등록, `viz-generator.mjs`·`viz-exporter.mjs`·`visualization-cycle/scripts/run.mjs` 갱신.
- **다음**: 7/4 오전 실제 결정 후 Q1/Q3/Q5/Q11/Q12 상태를 `확정`으로 갱신.

### 2026-07-03 · 배포 AI-실행성 교정 + deploy-public-demo.sh 신설
- Codex 배포 리서치의 `wrangler login`/`supabase login`(대화형) 실행 불가를 교정 — 정적 공개데모는 `gh` CLI(비대화형)로 사람개입 0, fork(River-181, admin)에서 배포. `deploy-public-demo.sh` 신설, `--check` 프리플라이트 GREEN. 실배포는 사용자 승인 대기. 상세 [[배포-스택-리서치-20260703]]·[[decision-log]]·[[registry-cli]].

### 2026-07-03 · 로그·통계·로우데이터 관리 세션 (Codex)
- **부팅/집계**: `node 08_본선/_system/skills/session-boot/boot.mjs`로 세션 부팅 후, `CLAUDE_PROJECT_DIR=/Users/river/project/active/JBproject node 08_본선/_system/skills/telemetry-aggregator/aggregate.mjs` 실행. 1차 집계는 총 17행 처리·신규 텔레메트리 0행.
- **커밋/푸시 통계**: `origin/ui-density-improvements..HEAD` 기준 미푸시 23커밋(작성자 River-181, 68 files, +7,910/-49), `fork/ui-density-improvements..HEAD` 기준 미푸시 48커밋(166 files, +20,606/-1,054) 확인. 상세는 [[_contribution-stats]]의 `EVIDENCE:UNPUSHED-STATS` 블록에 반영.
- **로우데이터 점검**: `.gitignore`에 `08_본선/04_증빙/04_회의록/_원문/` 보호 규칙 유지 확인. 현재 워크스페이스에서 `_원문` 파일 및 Git 추적 유입은 0건으로 확인.
- **주의**: 기존 worktree에 병렬 세션 변경 114파일이 있어 rename/삭제/staging/push 없이 로그·통계 파일만 제한 수정.

### 2026-07-03 · plugin-sync 스킬 신설 + 배포-준비도 점검
- `_system/skills/plugin-sync/`(sync.mjs+SKILL.md) 신설 — 커밋 settings.json에서 플러그인 마켓플레이스+세트 재설치(node --check·--self-test·--dry-run GREEN), bootstrap(스킬)의 플러그인 짝. registry-skills·`_tools-index`·decision-log 반영(자체 11종). SKILL_DIRS 등록은 승인 대기.

### 2026-07-03 · Codex CLI 토큰 백필 통계 신설
- **배경**: Claude 플러그인에서 Codex CLI를 열어 사용하는 경우 기존 `session-telemetry.mjs`는 `engine=codex, agent=via-claude` 위임 횟수만 기록하고 Codex 자체 토큰은 `—`로 남겼다.
- **조치**: `codex-cli-telemetry.mjs` 신설. `/Users/river/.codex/state_5.sqlite`의 `threads`를 프로젝트 `cwd` 기준으로 읽어 `codex-cli-backfill.csv`·[[codex-cli-usage-stats]] 생성. 원문 전체는 저장하지 않고 `first_user_message`는 120자 이하 마스킹 발췌만 보존.
- **결과**: Codex CLI thread **128건**, `tokens_used` **104,142,333**를 별도 총량으로 백필. [[ai-usage-stats]]에 `Codex CLI 별도 총량` 섹션 추가. 입력/출력 분리값이 아니므로 Claude intake 총량과 합산하지 않는다.
- **검증**: `node --check` 2종 통과, `test-telemetry.mjs` 통과, 백필 재생성·aggregator 재실행 완료. canon-moc-sync dry-run 죽은링크 0·도달성 100%, `npm run test` 통과(34 files).

### 2026-07-03 · 문서 통합 + 유튜브 디자인툴 6종 리뷰
플러그인/스킬 관리문서 중복 제거 — [[registry-plugins]]=목록 SSOT(11→12종, humanize-korean 누락 정정)·plugin-sync=동기화 기전 전용·`_tools-index`→registry-skills SSOT 선언. canon-moc-sync dry-run 죽은링크 0·도달성 ✓. 이어서 유튜브 공유 디자인툴 6종 검토 — Impeccable(pbakaus, Apache-2.0)만 지금-추가 후보(SkillSpector 스캔+승인 대기)로 [[도구-확장-리서치-20260701]]에 반영, 나머지는 보류/스킵. taste-skill(Leonxlnx) 개인-전역 기설치 확인, 팀 승격은 미결정.

### 2026-07-03 · 팀원용 스킬·플러그인 목록 통합 + 본선 HOME 링크
팀원 동기화용 스킬/플러그인 목록화 — [[registry-skills]](12종, 동기화법 배너) · [[registry-plugins]](18종, humanize-korean 정정) · **본선 HOME "도구·스킬 목록"** 링크(3종 포인터). _tools-index·메모리 12종 정합. canon-moc-sync 클린.

### 2026-07-03 · 스프린트 전 축(하네스) 점검 + 레포-지도 SSOT
- **레포 구분 SSOT 신설** [[레포-지도]](_system, Codex 초안): JB-Fin-AI-Challenge(모노레포·origin·대외비, main이 로컬보다 105앞)/River-181 fork/JB_project2(이승보 공개제출 후보·앱전용)/smart-agri-ai-2026(무관·오배치 회수)/hagent-os·paperclip(참고) 검증 기록. 미결=제출 정본 repo(이승보).
- **부팅/계약 문서 키스톤 드리프트 정정**: HANDOFF(부팅문서)·PLAN·PROGRESS의 "도메인 택1"→**하이브리드 확정**, 에이전트 14 확정, UX→Enter Flow, git 스냅샷 정정(origin 11미푸시 오기→105앞·push=fork). AGENTS 11역할→14(data-steward 추가)·2-B 슬롯 실팀 실명 매핑(김주용/이승보/김민주/최영욱). 루트 CLAUDE.md·대시보드(D-1) 정합.
- **실행 체크리스트 배선**: 차트(간트)는 보기용, 실제 추적은 [[PROGRESS]] §48h 스프린트(오너별 레인 A~E + 블로커 4). 사용자 지시 반영.
- **점검 방식**: Explore(Sonnet) 거버넌스 스윕 21파일 → 🔴6·🟡10·⚪7 발견, 부팅문서 최우선 정정. Codex read-only로 레포-지도 초안(토큰 절약). canon-moc-sync 죽은링크 0·도달성 100%.
- **커밋** d4b4cf4 (7파일 명시경로, PROGRESS는 병렬 스테이징 트랩으로 제외). 잔여 저순위(architect/finance 광주 게이트·registry Opus4.5·compliance 4중/5중·designer/builder Enter Flow 명시)는 사용자 판단 대기.

### 2026-07-03 · 각종 로그 진행 — telemetry 최신화
- **부팅/재집계**: `node 08_본선/_system/skills/session-boot/boot.mjs`로 부팅 후 `codex-cli-telemetry.mjs --write`와 `telemetry-aggregator/aggregate.mjs`를 `CLAUDE_PROJECT_DIR=/Users/river/project/active/JBproject` 앵커로 실행.
- **Codex CLI 백필 최신값**: [[codex-cli-usage-stats]] 기준 thread **133건**, `tokens_used` **106,943,300**. `tokens_used`는 입력/출력 분리값이 아니므로 [[ai-usage-stats]]의 Claude 입력/출력 토큰과 합산하지 않는다.
- **AI 사용 통계 최신값**: [[ai-usage-stats]] 기준 총 세션 **20건**, 입력 토큰 **55,711,428**, 출력 토큰 **15,775,478**. 이번 Codex 로그 진행 세션은 `tokens_in/out=—`, 산정 방식 `estimate`로 [[ai-session-intake]]에 S39 행을 추가.
- **검증**: `canon-moc-sync` dry-run 죽은링크 0·도달성 100%, `npm run test` 통과(34 files). 대상 로그/텔레메트리 파일 기준 `git diff --check` 통과. 전체 `git diff --check`는 기존 수정 파일 [[registry-plugins]] EOF 공백 1건으로 실패해 이번 범위에서는 미수정.
- **주의**: 기존 worktree에 병렬 세션 변경이 많아 rename/삭제/staging/push 없이 로그·통계 파일만 append/update.

### 2026-07-03 · 서사 학술·규제 근거팩 + 최영욱 4보고서 정합 + 7/1 타임라인 문서 + feynman
- **병렬 오케스트레이션**: 하위 에이전트 6종(최영욱 4docx→요약3 + 근거 심화 리서치 3테마) + Codex 타임라인 문서. feynman CLI(Pi 기반 리서치 셸) 인증 후 deepresearch 착수(국내 금융권 인간승인 게이트).
- **[[서사-학술규제-근거팩]] 신설**: 경험레이어/AX 서사의 학술·규제 백본 — Prediction Machines(예측/판단 분업)·Fuster(모기지20%↑무부실)·Brynjolfsson(신입34%)·Noy&Zhang(Science 40%↓)·BCG jagged frontier·Sweller·Mark·Hochschild·SERVQUAL·Service-Profit Chain·Gartner TX·EU AI Act§14·SR11-7·MHC 전부 [검증됨 웹]. **적대검증**: KLM"49%"=최약점(설계근거로만)·"23분15초"=오귀속(금지)·CMR2025 AI생산성신화 반증 + §8 쓰지말것 + §10 GPT딥리서치 큐9.
- **[[스프린트-타임라인-7월1일-제출]] 신설(Codex)**: 7/1→7/5 10:30 회고(커밋해시 근거)+전망(오너·상태)+§5 그림생성용 정규화표. Excalidraw는 문서 확정 후 파생 예정.
- **최영욱 4보고서 정합 감사**: 킬러=피싱2025 1조1,330억(canon✓)·여신안심차단255만명·할부금융→캐피탈확장근거·KB연1,720억예방·HUG보증사고5,790억→8조2,677억. ⚠️전세 39,121(canon)vs35,909(보고서2025말)·ROI1,416% 전부 가정시뮬·HUG보증사고≠피해액·report1 수치다수공란/각주2과잉/캐피탈부재/에이전트명 canon14 상이·광주은행 다수언급.
- **파일**: [[레포-지도]] SSoT + PLAN/PROGRESS/HANDOFF/AGENTS 키스톤 드리프트 정정(택1→하이브리드·14에이전트·Enter Flow·실팀슬롯·git스냅샷) 커밋 d4b4cf4. 메모리 신설 [[본선-차별성-경험레이어-서사]]·[[본선-레포-토폴로지]].

### 2026-07-03 · feynman deepresearch 회수 — 국내 AI규제 HITL 백본(검증됨)
- feynman deepresearch(승인게이트 "yes" 후 4서브에이전트) 완료 → [[국내-AI규제-HITL-딥리서치]] 볼트 보존. feynman이 실제 FSC PDF 파싱·인용, **핵심인용 로컬원문 직접 검증**(RACI·보조수단성·Override·Kill switch).
- **킬러**: 금융위 2026 「금융분야 AI 가이드라인」 보조수단성(최종책임=임직원)·**RACI(AI=권고/여신심사역=실무책임/지점장=최종책임)**·Override 근거입력 의무·감사로그·Kill switch = 우리 승인게이트·auditChainRecords와 정확히 일치. AI기본법 대출심사=고영향(§34 사람관리·감독)·신정법 §36조의2 자동화평가 이의제기권. → [[서사-학술규제-근거팩]] §6 국내 백본 편입.

### 2026-07-03 저녁 · 맥락압축·ultracode 후 재개 — harness 방법론 도입 + 문서생성 마스터플랜
- **커밋 beb6c02**(내 5파일 명시경로): 벤더링 배선([[레포-지도]] harness행+벤더링섹션·`vendor-sync.sh`·`.gitignore _vendor/`) + 국내규제 브리프 + 근거팩§6. 병렬세션 인덱스(수백 파일 스테이징) 무접촉.
- **푸시 보류**: HANDOFF 가드레일(fork만·a/b 개인정보/내부전략 보류) vs 사용자 'push' 지시 상충 → AskUserQuestion(origin권장/fork/로컬) 제시, 사용자 AFK → 안전기본=미푸시, 질문 오픈. 3커밋 대기(d4b4cf4·ea68060·beb6c02).
- **조사 워크플로 `wf_0ad356ae`**(Sonnet 4병렬): harness 노멀폼 규격 × 볼트 현황 × 방법론 스킬 × SSOT. 발견 — 이미 solid=`00_결정-준비`·`06_build-roadmap`, 커스텀 차별=`02_agent-design`(stub), 갭=`01_business-model`·`10_eval-plan`+`evals/`·`rules/`·scorecard, 병렬소유=`03_ux`·`04_tech`·`07_계열사`.
- **[[_문서생성-마스터플랜]] 신설**(`03_제품/`): 크로스워크(노멀폼13→우리폴더)+갭매트릭스+P0~P2 순서(오너/스킬/정지조건)+데모→영상→스크립트→시각화 파이프라인. PRD/유저플로우 이미지=06_prd/09_flow 원재료. **P0 착수는 사용자 승인 대기.**

### 2026-07-03 밤 · P0 문서 6종 생성·검수·정정·커밋(origin 푸시)
- **푸시 origin 확정**(사용자 승인) + **PR #15** 오픈(→main, 본선문서 34커밋). JB_project2 벤더(`_vendor/JB_project2` 우리캐피탈+전세 2도메인) · JBFG 디자인 볼트 임포트([[_JBFG-디자인-레퍼런스]] #0A31A8·SUIT).
- **워크플로 wd7enhxke**(13에이전트): JB_project2 정밀매핑→[[승보-프로토타입-반영]] + P0 6문서 생성(core-bet=02_cps·business-model=DDBM·definitions·agent-roster/orchestrator/skill-spec·principles·prd)→6검수.
- **검수**: definitions·principles·business-model=**Score3 위반0**. roster·prd=B+ 사실오류 정정(Sonnet): ROI **보수 0.83억** 라벨정합(기준7.66·공격31.42 병기)·승인레벨 준법 **L3부터**(app.js approvalLevelMatrix)·오케스트레이터명 **canon§2 표시명 정합**(코드명 별개 [미결/데모전정합])·깨진링크 제거·기능군3 3.3헤더.
- **커밋 38438cf**(15파일 1772+) origin 푸시. 프롬프트 원문복구 V-1~6 별건(공유로그 미커밋).
- **⚠️ 7/4 팀 결정(프로토타입 vs canon 충돌)**: ①14에이전트(전북Hero) vs 승보 23(JBWC13+전세10) → 발표 레이어구분 ②전세=여신도메인(키스톤 교정) vs 승보코드=독립 `kind:role` 하네스 ③캐피탈 사후관리/EWS는 JBWC 11도메인에 미구현 ④에이전트명 3단(코드raw/NAME_MAP/canon) 이승보 정합 ⑤business-model DATA-002/003 소스 최영욱.

### 2026-07-04 · 서사 정합(맥락감사) + 승보 역할축 v2 + 제출 정본 레포 확정
- 사용자 "V-1 경험레이어 서사 잘 지키는가" 감사 → **정직: 미흡**(P0문서 서사어휘 ~0, EX=EXAONE 오탐). 수정: **[[차별성-경험레이어-서사]] 정본 신설**(V-1 정본화 = 발표척추 SSOT) + core-bet 척추주입. **커밋 a827389** origin.
- 결정 반영: #1 패스 / #2 전세=독립 role콘솔 확정 / #3 대기 / #4 이름정합 / #5 ok.
- 승보 **역할축 v2**([[승보-프로토타입-반영]] §7·§8): 4콘솔(기업여신 CCL-0001·전세·FDS=role·캐피탈=affiliate)·ECC 6계층·24체크·이름3단(3/17·`agentNameLabels`→canon 권고). 서사↔코드 수렴.
- **🔑 사용자 확정(7/4): `LSB-afk/JB_project2` = 올바른(제출/제품 정본) 레포.** → 제품·데모·코드 SSOT = JB_project2(역할축 콘솔). 예선 `02_제품/app`은 레거시. 히어로=CCL-0001 유력(JBG-104 아님). [[레포-지도]] 미결 해소. P0 문서 코드근거 재정렬 필요(예선앱→JB_project2).

### 2026-07-03 밤 · 로그들 업데이트 — telemetry S40
- **부팅/백필/집계**: `session-boot` 재실행 후 `codex-cli-telemetry.mjs --write`, `telemetry-aggregator/aggregate.mjs`를 `CLAUDE_PROJECT_DIR=/Users/river/project/active/JBproject` 앵커로 실행.
- **AI 사용 통계 최신값**: [[ai-usage-stats]] 기준 총 세션 **21건**, 입력 토큰 **61,923,186**, 출력 토큰 **17,323,214**. S40 `로그들 업데이트` 행은 `tokens_in/out=—`, 산정 방식 `estimate`.
- **Codex CLI 백필 최신값**: [[codex-cli-usage-stats]] 기준 thread **135건**, `tokens_used` **108,138,886**. `tokens_used`는 입력/출력 분리값이 아니므로 Claude intake 총량과 합산하지 않는다.
- **검증**: `canon-moc-sync` dry-run 죽은링크 0·MOC 누락 0. 단, 병렬 세션 산출물 기준 frontmatter 누락 4건·도달성 누락 2건 경고 유지. `npm run test` 통과(34 files). `git diff --check`는 [[프롬프트-로그]] V-section 기존 원문복구 구간 trailing whitespace로 실패해 원문 보존 우선으로 미수정.
- **주의**: 기존 병렬 세션 변경을 존중해 rename/삭제/staging/push 없이 로그·통계 파일만 append/update.

### 2026-07-04 00:02 KST · 로그들 업데이트 — 7/4 데일리 시작·telemetry S41
- **부팅/데일리**: `session-boot` 재실행 후 [[2026-07-04]] 데일리 노트를 생성하고 [[_daily-INDEX]]에 연결.
- **텔레메트리**: `codex-cli-telemetry.mjs --write`와 `telemetry-aggregator/aggregate.mjs`를 `CLAUDE_PROJECT_DIR=/Users/river/project/active/JBproject` 앵커로 실행. aggregator 결과는 총 **22행 처리**, 신규 telemetry **1행**.
- **AI 사용 통계 최신값**: [[ai-usage-stats]] 기준 총 세션 **22건**, 입력 토큰 **62,057,620**, 출력 토큰 **17,418,187**. S41 `로그들 업데이트(7/4 데일리 시작)` 행은 `tokens_in/out=—`, 산정 방식 `estimate`.
- **Codex CLI 백필 최신값**: [[codex-cli-usage-stats]] 기준 thread **135건**, `tokens_used` **109,427,945**. `tokens_used`는 입력/출력 분리값이 아니므로 Claude intake 총량과 합산하지 않는다.
- **커밋/푸시 통계**: [[_contribution-stats]]의 `EVIDENCE:UNPUSHED-STATS` 갱신. origin 기준 미푸시 0커밋(HEAD `a827389` 일치), fork 기준 미푸시 5커밋(28 files, +2,440/-157, River-181). worktree 변경 128건.
- **로우데이터 보호**: `_원문` gitignore 보호 유지, `git ls-files 08_본선/04_증빙/04_회의록/_원문` 추적 유입 0건.
- **검증**: `canon-moc-sync` dry-run 죽은링크 0·MOC 누락 0. 기존 경고 유지(frontmatter 누락 4건, 도달성 누락 2건). `npm run test` 통과(34 files). 대상 파일 `git diff --check` 통과.
- **주의**: 기존 병렬 세션 변경을 존중해 rename/삭제/staging/push 없이 로그·통계 파일만 append/update.

### 2026-07-04 · 문서하네스 안착 + 실동작 에이전트 슬라이스 PR
- **방법 SSOT 안착**: `03_제품/_문서생성-스킬-DDBM-Harness-SDD.md`(21문서 계약) 볼트 tracked, `_vendor/harness-engineering-skills` 최신 로컬본 미러링, JBFG 디자인 자산(token-data·screens) 색인. 커밋 `83374bb`.
- **혼란 문서 소거(비삭제)**: `_archive/`로 스프린트-타임라인 stub·오버나이트-완료계획 이관. 마스터플랜 stale 정정(business-model=완료). 커밋 `7c6c87b`.
- **🎯 실동작 에이전트 슬라이스**: JB_project2 감사 결과 = 파이프라인 실재·에이전트 출력만 목업. `ccl-financial`(CCL-0001) 1경로를 실 LLM(Ollama/Anthropic)로 승격 + 오프라인 목업 무회귀 + 실 output 가드레일(harnessGuardCheckPII/Assertions) 재검. River-181 fork 경유 **PR LSB-afk/JB_project2#1** 오픈(브랜치 `feat/live-agent-ccl-financial`). 라이브 실행: `ollama serve & ollama pull exaone3.5:7.8b` → `?live=1`.
- **rules/ 6종**: 실 가드레일 코드 인용(E4) Score3. 커밋 `f1ba337`.
- **레포 토폴로지 변화**: `River-181/JB_project2` fork 신설(푸시용). 정본은 여전히 LSB-afk.
- **다음**: 데모 척추(CCL-0001 골든패스 09_flow+14_demo-script) · evals(7/4 팀 데모케이스 후) · cps/principles/definitions 정식화+CCL-0001 재정렬.

### 2026-07-04 (세션 "JB금융-디자인") · 디자인 토큰 업그레이드 — design-system.md 개정 + tokens 폴더 신설
- **조사**: JBFG 원본 토큰(`_vendor/jbfg-site-archive`)·design-system.md 기존 [확정]·Figma 팀파일 "망상궤도" LocalGuard OS Foundations/Components(5프레임) 3원 비교 → [[디자인-토큰-업그레이드-설계안]] 신설(`08_본선/03_제품/01_결정-준비/설계/`).
- **실 대시보드 비교**: Figma "케이스 대시보드"(Kanban) vs `_vendor/JB_project2/app/`을 로컬 8000포트로 구동해 촬영한 실제 화면(Playwright, 3열 셸+글래스KPI+context-panel 실증) — 3열 셸 유지 + page-content 기본뷰=Kanban/테이블로 사용자 확정.
- **design-system.md 개정**(`08_본선/03_제품/03_ux/`): 밀도 원칙(§1-6, "직원용 업무 프로그램, 예쁠 필요 없음" 사용자 직접지시) 신설, 3열 셸 [확정], spacing 축소 스케일(§4), 카드 radius xl→lg, Case FSM/Approval/AgentRun 상태색(§8·§9)·PII UI규칙(§10)·인터랙션 계약(§11) 신규 절, 리스크축 2분리(승인단계 L0~L4 vs 심각도 Critical~Low) 도입(L3 violet `#6D28D9` [제안]).
- **tokens 폴더 신설**: `08_본선/03_제품/03_ux/tokens/jb-console-tokens.css`·`.json` — JB 원본(`--jb-*`)+콘솔 파생(`--console-*`) 통합 SSOT, fork(`paperclip-jb-fork`) `jb-tokens-sync.mjs --src` 연결 가능.
- **미해결**: 폰트(SUIT Variable 유지 vs Figma Noto Sans KR) — 김민주 확인 대기. 케이스 상세·전체 IA·뷰 목록 확장은 PRD/기능명세서 확정 후 별도 라운드로 명시적 유보(사용자 지시).
- **프롬프트 기록**: [[프롬프트-로그]] V-10.

### 2026-07-04 · 문서세트 22종 + paperclip 벤더링 + 디자이너 핸드오프
- **문서세트 22종 생성**(워크플로 wf6k8zpf1, 3-wave, 0에러): source-log·definitions·principles·cps·domain-model·data-strategy·metrics·risk / prd·feature-spec·architecture·flow·eval-plan·evals3 / ssd·demo-script·pitch·qna·checklist·change-log. 제품 SSOT 백본 + 37요약 근거층. 커밋 `a27ad9f`.
- **paperclip 벤더링**: `_vendor/paperclip-master`(원본 3267)·`_vendor/paperclip-installed`(설치 1972) + 기존 `project/active/paperclip-jb-fork` 참조.
- **디자이너 핸드오프** `03_제품/_디자이너-핸드오프.md` 커밋 — 'JB금융-디자인' 세션이 뷰/계층 착수 가능(SSOT 지도). 경계: 문서=나, 디자인=디자이너, 핑퐁.
- **백그라운드 분석 2건**: 무제폴더-핵심이해(사용자 반복강조 미이해분 추출) + paperclip-통합-블루프린트(구조 재사용·디자인 분리·이식전략).
- **다음**: meta 2종(validation-report·scorecard), 2분석 회수·정합, 문서 잠금 후 dev-artifact 추출 + paperclip 빌드(Codex 위임).

### 2026-07-04 03:20 KST · 문서 대량 변경 후 로그 업데이트 — telemetry S42
- **부팅/백필/집계**: `session-boot` 재실행 후 `codex-cli-telemetry.mjs --write`, `telemetry-aggregator/aggregate.mjs`를 `CLAUDE_PROJECT_DIR=/Users/river/project/active/JBproject` 앵커로 실행. aggregator 결과는 총 **26행 처리**, 신규 telemetry **1행**.
- **AI 사용 통계 최신값**: [[ai-usage-stats]] 기준 총 세션 **26건**, 입력 토큰 **77,325,347**, 출력 토큰 **20,479,308**. S42 `문서 대량 변경 후 로그 업데이트` 행은 `tokens_in/out=—`, 산정 방식 `estimate`.
- **Codex CLI 백필 최신값**: [[codex-cli-usage-stats]] 기준 thread **144건**, `tokens_used` **121,993,380**. `tokens_used`는 입력/출력 분리값이 아니므로 Claude intake 총량과 합산하지 않는다.
- **커밋/푸시 통계**: [[_contribution-stats]]의 `EVIDENCE:UNPUSHED-STATS` 갱신. HEAD `dd841c2`, origin 기준 미푸시 **12커밋**(50 files, +9,599/-114), fork 기준 미푸시 **17커밋**(69 files, +11,956/-188), 작성자 River-181.
- **워크트리 스냅샷**: `git status --short` 기준 변경 **225건**(modified 112, added 66, deleted 5, renamed 2, untracked 46, conflicted 0). 이번 로그 세션에서는 rename/delete/staging/push 미수행.
- **로우데이터 보호**: `_원문` gitignore 보호 유지, `git ls-files 08_본선/04_증빙/04_회의록/_원문` 추적 유입 0건.
- **검증**: `canon-moc-sync` dry-run 결과 MOC 누락 0, 죽은 링크 3건(`04_definitions`, `15_pitch-outline`, `16_judge-qna`)·frontmatter 누락 5건·도달성 누락 2건 경고. `npm run test` 통과(34 files), 대상 로그/통계 파일 `git diff --check` 통과.

### 2026-07-04 · CaseOps 확장 분기(Codex 6문서) + 디자인 잠금 해제
- **ChatGPT 원문 보존**(CaseOps 대화) + 분기 스캐폴드 `casesops-분기/`. 커밋 1b0a531.
- **Codex 6문서**(~200KB, task-mr59qgce/r5jl/rk5u/rv7d): 01 메모리거버넌스·02 CaseOps엔진7알고리즘·03 119사고대응·04 은행DB연결/특화모델·05 9파이프라인/저장소·06 정보체계뷰스펙. 리서치 근거(D2·D5·D6·D7·D9·D11·D14·D15·D17·D25·B1) 주입, vanilla 무빌드 정합(monorepo 개념차용), [분기/미확정] 태깅. 커밋 ab1879d.
- **디자인 잠금 살짝 해제**: 06 = 도메인엔티티↔CCL 실코드↔뷰↔데이터바인딩 매핑 + 전 뷰 카탈로그(S-00~S-17) + ViewModel 7종 → [[_디자이너-핸드오프]] 연결. 'JB금융-디자인' 세션이 뷰 확정 착수 가능.
- **승급 규칙**: 팀 확정분만 정본(domain-model·architecture·agent-design·pitch)으로 이관. 결정 5: 메모리거버넌스 범위·CaseOps 브랜딩·119 승격·특화모델 데모·저장소구조.

### 2026-07-04 · 매니징 갱신 + 문서계약 100% 확인
- **워크플로 현황**: DDBM-Harness-SDD 스킬 계약 문서 **전부 존재(누락 0)** — 핵심13+확장8+rules6+evals3+project + 커스텀 + 메타(harness.yaml·validation-report·scorecard). 03_제품 135 md.
- **V프롬프트 V-1~V-12 전부 반영** 확인(서사·P0·방법SSOT·paperclip·stale/business-model/회의록). 7/1~7/4 회의 정리본 존재.
- **PROGRESS.md 상단에 "현재 스냅샷(2026-07-04)" 매니징 진입점 추가** — 준비도≈88%, 개발 게이트3(/llm 프록시·PR#1 머지·히어로ID). ⚠️PROGRESS는 공유 로그라 미커밋.
- **런타임 정정**: Ollama 아님 → **claude/codex CLI 라우팅**(paperclip式, api-proxy.mjs에 /llm 라우트 빌드 예정). claude 2.1.198·codex 0.142.5 설치 확인.
- **디자인 토큰**: JB_project2 styles.css(118토큰·481컴포넌트)=MAIN 확정.
- 메모리 갱신: [[jb-project2-리얼리티]](런타임=CLI프록시)·[[본선-문서생성-방법론]](계약 100%).

### 2026-07-04 · 종합 감사 6축 + 후속수정(2 워크플로)
- **감사 6축**(wz643geb4): 매니징단일화·심사부합·승보갭/토큰·UX뷰명세·7/4회의요구·CaseOps구현전환. file:line 근거.
- **수정 5종**(whvpiojlj) 커밋:
  - c6d8f34 **제출 조립본** MVP제안서(7섹션)·기능명세서(6파트+변경이력) = 하드리스크 "필수제출물 누락" 해소.
  - f75f20f 히어로ID CCL-0001 단일화(8파일·Open Question 종결)·05_domain §10 FDS/전세v3/JBWC 콘솔확장·02_case-lifecycle 119 FSM분기·06뷰(에이전트 탭 드릴인·조직도·단일run·Ctrl1-5/Tab)·CaseOps _INDEX 3구간(MVP/아키/로드맵)·07-policy-engine 신설(12규칙)·FR-08(md케이스)/FR-09(코멘트·case_comments).
  - c8cef68 HANDOFF SSoT 위계 · d7a8181 디자이너 토큰정합 수정요청.
- **병렬소유 무접촉**: 04_tech(스테이징)·03_ux 토큰(디자이너)·_MOC(워크트리) → 요구만 전달.
- **그 외 놓친 것(후속)**: 안내문 정본 원문→rubric 25세부 대조 / FR-14 초등학생 눈높이 발표 / 나선형 축·수치 / e2e·라이브 리허설 / MD→PDF 제출본 / **/llm 프록시 빌드(개발 게이트)**.

## 2026-07-04 · Fable — /llm 게이트웨이 구현 + Q13~Q15 심사방어 3축 (예선 MVP 레포)
- **개발 게이트 1 해소(예선 앱 측)**: `02_제품/scripts/api-proxy.mjs`에 `POST /llm`(claude/codex CLI 라우팅, paperclip式)·`GET /llm/usage` 구현. 폴백 사다리(요청 엔진→반대 엔진→사람 큐 escalated) + 시도별 JSONL 구조화 로그(`llm-runs.jsonl`, gitignored). 스폰 cwd=tmp 중립화(볼트 대외비 컨텍스트 유입 차단). 스모크: claude 실호출 2.9s·$0.115·"2" 정상.
- **Q13(비용)**: modules.js 토큰 패널에 실측 블록(`liveLlmBlock`, ?live=1) — 케이스 단가·티어별·RM 1인 월 환산(일20케이스×21일 [가정]).
- **Q15(감사)**: app.js `auditPurpose()` — 감사 레코드에 소비자 용도 태그(당국 증적/분쟁 재생/운영 점검/원가 정산), "소비자 없는 로그는 남기지 않는다" 원칙의 화면 증적.
- **문서 3건**: 질문/Q13-토큰비용-유닛이코노믹스 · Q14-오류로깅-폴백사다리 · Q15-감사로그-실효성 (각 예상질문+30초답변+근거+MVP물증). _결정준비-MOC 색인 Q1~Q15로 갱신.
- **게이트**: verify_static 34파일 통과 · node --check 3파일 통과. 미커밋(팀 조율 후 경로 명시 커밋).
- **(추가) 운영 3축 에이전트 설계도 3건**: casesops-분기 08-Cost-Sentinel(Q13)·09-119-라우팅관측-확장(Q14, 기존 119 관할 편입)·10-Ledger-Curator(Q15, 3계층 메모리 격리 집행). 각각 paperclip式 파일셋(agent.yaml·SOUL.md 프롬프트 원문·tools.json E4/설계 구분·memory.md Hermes式 증류 규칙) 포함. _INDEX 8~10행·Q13~15 상호링크 갱신.

### 2026-07-04 · main 통합 + 설계도 5종 신설 + JB_project2 구현현황 인벤토리
**한 일**
- **main 통합**: `ui-density-improvements` 브랜치를 main으로 fast-forward(a9cd1b5→240f444→32eb22f), fork 푸시 완료(병렬 Haiku 담당).
- **설계도 5종 신설** — `08_본선/03_제품/10_설계도/` 하에 개발 와이어프레임 빌드용 청사진: ① 메인 업무보드(Figma 예시 기반) ② 케이스 상세뷰 ③ 에이전트 실행뷰 ④ 승인 인터페이스 ⑤ 통계추적 + `_설계도-INDEX` 신규. "설계도만 봐도 와이어프레임 제작 가능" 수준(병렬 Sonnet 3 담당).
- **JB_project2 구현현황 인벤토리** — `구현현황-JB_project2.md` 신설, 코드 SSOT 실측: 6진입·91뷰·40에이전트·28스킬·121토큰·537컴포넌트. **갭 발견**: 감사체인(base앱만)·실LLM(전세 live 2건뿐)·케이스(JS객체, 파일아님)·콘솔축(불일치 남음).
- **통계 기능 확인** — Q13/14/15(비용·오류로깅·감사) 이미 구현(Fable). /llm 게이트웨이·liveLlmBlock·auditChainRecords 기존 구현 활용→설계도 05로 청사진화.
- **커밋**: 240f444(전략회의2 기반 요구사항·메인 대시보드 스펙) + 32eb22f(설계도 5종·구현현황 인벤토리 추가).

**결과물**: `03_제품/10_설계도/` 5MD + INDEX, `구현현황-JB_project2.md`(SSOT 6항목).

**다음**: 스펙 정합(기능명세서·PRD·feature-spec, Sonnet 병렬 진행 중) → 개발 착수 게이트 / 설계도는 김민주 피그마 착수 기준자료 전달.
- **(추가) 승인 사이클 1회전 완료(V-16)**: ① `/llm`에 **ollama 엔진** 추가(OLLAMA_BASE/OLLAMA_MODEL, E4) — 미기동 폴백 실검증(`ollama:engine_missing→claude` 원장 기록). ② Docker 물리분리(Sonnet 위임): `02_제품/deploy/docker-compose.yml`(console=edge+pii-net / pii-zone=ollama·internal망·포트비노출) + `시연-런북-백엔드분리.md`(B안 분할화면·킬러컷=pii-zone 외부 curl 실패·Docker모드는 engine:ollama 필수 캐비앳). 이 머신 docker/ollama 미설치 → 노트북에서 config·모델pull 선행 필요. ③ paperclip 메모리 탐사(Sonnet 위임) → 설계도11 §8 실증(스킬=DB+버전 vs 지식=파일번들)·§9 베낄 패턴 8 매핑·핵심관찰(코어에 자동증류 없음→Distiller=우리 차별 확장) 반영. 프롬프트-로그 V-16.
- **(추가) 3엔진 검증 완주 + A안 엔진룸**: codex 엔진 게이트웨이 실테스트 통과(6.6s·tier local·cost 0 구독정액, 원장 기록) — claude✓/codex✓/ollama✓(승보 머신 확인, 사용자 보고). modules.js 엔진룸 구현: /llm/usage 5초 폴링(변경 시만 재렌더)+최근 호출 8건 타임라인(엔진·케이스·지연·토큰·폴백경로·escalated 🚨표시), 토큰 패널 실측 블록 하단 결합. verify_static 통과.
- **(추가) 이식 핸드오프 확정(사용자 승인)**: 전략=스펙 핸드오프 우선+요청 시 additive-only 모듈 PR. 구현현황-JB_project2 §9 신설 — MemoryCard 슬라이스 지시서(신규 파일 1+등록 1줄, 수용 기준 4, 스펙 SSOT=설계도11)·/llm 게이트웨이 파일 복사 안내. 프롬프트-로그 V-18.

### 2026-07-04 · 회의록 5건 meeting-intake 전면 보강 (줄글 프롬프트 인풋 규격)
**한 일**: 기존 회의록들이 원문 소스 대비 압축이 심하다는 지적에 따라, "화자별 핑퐁 금지·주제별 줄글(prose)로 서술, 프롬프트 인풋 자료로 쓸 수 있는 완전성" 규격을 새로 세우고 5개 회의를 병렬 에이전트 4개 + 직접작업 1건으로 전면 재작업.
- **UX업무보드흐름(7/4 17:27)**: 기존 92턴 핑퐁 리스트를 13개 주제 줄글로 재작성, FULL.txt(518줄) 아카이브 신설(직접 작업).
- **6/30 아이디어회의**: FULL.txt(2018줄) 신설, JB발췌 60→12주제 섹션 전면 재작성, 정리본 공유·결정 6→9항목 보강(병렬 에이전트).
- **7/2 스프린트회의**: FULL.txt 오탈자 1건(승보님→숙모님 오인식) 정정, JB발췌 72→88줄 "보강 2차" 신설(11항목), 정리본 9→13항목. 결제성 발화 1건 레닥션(병렬 에이전트).
- **7/3 스프린트회의 #3**: FULL.txt 화자 익명화(참석자N)→실명 복원, JB발췌 보강 9건, 정리본 회의시간 오류 정정(30분→63분)+항목 10~15 추가(병렬 에이전트).
- **7/4 14:25 신규 회의 발견·중복 처리 확인**: `20260704_JB_해커톤_전략회의_2026년_7월_4일.txt`(전략회의 1·추정, 발표서사설계 — 인풋/프로세스/아웃풋 프레임·RPA차별점·3계층메모리+3무기·나선형→모래시계 성장모델)를 04_증빙 컨벤션 3종(FULL/JB발췌/정리본)으로 신규 처리했으나, **같은 녹취가 이미 `08_본선/03_제품/01_결정-준비/회의록-정리본/2026-07-04-전략회의-정리본.md`(커밋 23613dc)로 다른 세션에 의해 처리돼 있던 것을 발견** — `_회의록-INDEX`에 미반영돼 있어 인지 못했던 것. 양쪽에 상호링크 추가, 병존/통합 여부는 미결(사용자 판단 대기).
- **INDEX 갱신**: `_회의록-INDEX.md` 회의 목록에 7/4 14:25 행 신설(#20), "수정 필요 파일" 표에 항목 20 추가, 중복 발견 각주 추가.
- **검증**: 5개 회의 각각 `canon-moc-sync --dry-run` 무회귀 확인(에이전트별 자체 검증) + 최종 통합 후 재검증.

**결과물**: 회의록 5건(원문 FULL 5개 신설/교체, JB발췌 5건 보강, 정리본 5건 보강) + INDEX 갱신 1건. 미커밋.
- **(추가) C안 온톨로지 그래프 + upstream pull**: ① JB_project2 정본(LSB-afk) 리모트 추가·pull — **RM 역할 하네스 3커밋(+3,650줄, rmOfficer.* 18파일·AGENTS.md Codex계약·e2e 2종)**, 구현현황 문서에 델타 노트(재실측 필요 [미갱신]). ② C안: cytoscape 로컬 벤더링(오프라인) + 케이스 상세 '운영계약 온톨로지' 그래프 — 브라우저 실검증 17노드/16엣지·페이지 에러 0·스크린샷 확인. feature-spec 7.1.4(엔진룸)·7.1.5(온톨로지) 추가(✅17/총31). ③ 기존 e2e 1건("home and dashboard")은 리브랜딩 前 제목 기대로 **선재 실패**(내 변경과 무관, stash 검증) — 테스트 기대값 갱신 필요 [미처리]. 메모리(도구확장제안)에 Cytoscape 적용 갱신.

### 2026-07-04 · 회의록 "발췌→정리본 승격" 전면 재구조화 (2파일→1파일)
**배경**: 사용자가 직전 보강 결과에 대해 "최신에 새로 만든 거 말고는 회의록이 이상하다, 전혀 못 써먹겠다 — 이러니까 AI가 이해를 못하지"라고 지적. 원인 진단: gitignore된 `_원문/` 폴더는 AI가 다른 실행 환경(예: git-only clone)에서 못 읽을 수 있어, 정작 풍부한 줄글 발췌가 AI에 안 보이고 부실한 구조화 요약만 보이는 구조적 문제였음. 사용자 지시: "발췌를 정리본으로 승격한다. 이전에 있던 것(구조화 요약)은 동일한 형식으로 정리해서 발췌 밑에 첨부. 인덱스 짝 정리. 깔끔하게."
**한 일**: 회의록 7건을 **2파일(정리본+gitignore 발췌) → 1파일(정리본에 발췌+구조화 요약 통합)** 구조로 전면 재작성.
- **템플릿 확정(직접 작업)**: `회의록-2026-07-04-UX업무보드흐름.md`를 기준 예시로 직접 병합 — intro → 참석/맥락 → 핵심요약(3줄) → "## 발췌 — 주제별 서술(프롬프트 인풋용 줄글)" → `---` → "## 공유·결정(구조화 요약)" → 일정·액션아이템·미확정플래그·연결. 옛 JB발췌.md는 리다이렉트 스텁으로 교체.
- **병렬 에이전트 6개**로 동일 템플릿 적용: 6/27 본선브리핑(FULL.txt 없음·"[…생략…]" 2구간 정직 표시, 원본 STT 파일 소재 파악 중) · 6/27 준비및코덱스결제(FULL.txt 없음, 레닥션 유지) · 6/30 아이디어회의 · 7/2 스프린트회의 · 7/3 스프린트회의 · 7/4 발표서사설계(🔴중복처리 경고문 보존).
- **INDEX 재구조화**: `_회의록-INDEX.md` "회의 목록" 표를 [정리본(통합) | FULL.txt(원본)] 2열로 재편 — 6/27 x2는 FULL.txt "❌ 없음(원본 찾는 중)"으로 명시.
- **검증**: 각 에이전트 자체 `canon-moc-sync --dry-run` + 완료 후 직접 스팟체크(본선브리핑·6/30·7/2 3건 전문 재확인) — 품질·형식 일관성 확인, 회귀 없음.
**미해결**: 6/27 두 회의의 원본 STT txt 파일을 이 컴퓨터에서 찾지 못함(사용자에게 노션/드라이브/팀원 PC 확인 요청) — 찾으면 FULL.txt 아카이브·"[…생략…]" 구간 복구 재작업 필요.

### 2026-07-04 · 미실현 "예정" 회의록 2건 아카이브 강등
**배경**: 사용자가 `회의록-2026-07-04-시연기술범위.md`를 보고 "이거는 다른 것과 많이 다른데?"라고 지적 — 조사 결과 이 문서와 `회의록-2026-07-03-제품정의확정.md`는 실제로 열린 회의 기록이 아니라 "결정 기록란"이 끝까지 비어 있는 준비 템플릿이었고, `decision-log`에 대응 항목이 없으며 데일리 노트에도 "대기"로 방치돼 있었다. 안건 대부분(G1/G2/G3/G4/G5/G6)은 실제로 열린 [[회의록-2026-07-04-스코프확정]]으로 흡수·결정된 것으로 확인. 사용자 지시: "지금 작동하지 않는 것은 아카이브로 강등."
**한 일**: 두 파일을 `08_본선/04_증빙/04_회의록/_archive/`로 이동(삭제 아님, git 이력 보존 — `08_본선/03_제품/_archive` 선례 컨벤션 그대로 적용). frontmatter `status: active`→`archived`, `type: meeting`→`archive`로 변경. 각 파일 상단에 아카이브 사유+흡수처 배너 추가(원 내용은 그대로 보존). `_archive/README.md` 신설. `_회의록-INDEX.md`에서 두 행을 "회의 목록"(활성) 표에서 빼고 새 "🗄️ 아카이브" 섹션으로 이동.
**검증**: `canon-moc-sync --dry-run` — 두 파일 모두 INDEX 아카이브 섹션에서 링크돼 도달성 유지, 신규 회귀 없음. `npm run test` 통과.

### 2026-07-04 · 빈 스캐폴드 폴더 삭제 + decision-log 헤딩레벨·중복 정리
**배경**: 사용자가 "04_meetings 이건 뭐야? 불렛이 개판이구만"이라고 지적.
**한 일**: ① `08_본선/04_증빙/04_meetings/`(첫 커밋부터 `.gitkeep`만 있던 미사용 영문명 스캐폴드 — 실제로는 `04_회의록` 하나만 씀) 삭제. ② `decision-log.md`의 7/2~7/3 항목 8개가 문서 규칙(`### YYYY-MM-DD`)과 다르게 `##`(한 단계 높은 헤딩)로 적혀 있어 `log-toc` 목차 들여쓰기가 뒤섞였던 것을 발견 — 전부 `###`로 통일, TOC 재생성으로 균일화.
**후속 지적**: 사용자가 "결정사항에 있는 회의록 정리본이랑 회의록 부분이랑 겹치는데?"라고 추가 지적 — 회의 관련 decision-log 항목 4건(6/30 아이디어회의·7/2·7/3 스프린트회의·7/4 UX업무보드흐름)이 이제 훨씬 풍부해진 회의록 "공유·결정" 섹션과 내용이 거의 그대로 중복돼 있었음. 각 항목의 결정 내용 재서술을 [[회의록-...]] 포인터로 축약하고, decision-log 고유 가치(반영처·다운스트림 추적, 예: INDEX #10~18·설계 트랙 링크)만 남기는 방식으로 정리(내용 삭제 아님 — 회의록에 그대로 보존). "회의4·5 게이트 대기" 잠정 항목(2026-07-02)에는 이후 스코프확정으로 흡수·해당 두 예정문서는 아카이브 처리됐다는 후속확인 각주 추가. 오늘의 "발췌→정리본 승격" 정책 변경 자체도 decision-log에 신규 항목으로 append(6/29 원 결정 참조).
**검증**: `canon-moc-sync --dry-run`·`npm run test` 무회귀.

### 2026-07-04 · 발표서사설계 중복 회의록 최종 해소
**배경**: 사용자 "둘 중에 하나는 없애야 하지 않을까?" — 이전에 "병존/통합 여부 사용자 판단 대기"로 남겨뒀던 발표서사설계 중복(04_증빙 vs `00_결정-준비/회의록-정리본`)을 가리키는 것으로 판단(AskUserQuestion 60초 무응답 → 최선 판단으로 진행).
**한 일**: 내용 대조 결과 04_증빙판이 00_결정-준비판 내용을 실질적으로 다 포함(3계층메모리+3무기·나선형/모래시계 논쟁·심사위원 프레이밍 등)하면서 `_회의록-INDEX` 등재·FULL.txt 아카이브·비전문서(나선형-성장-구조 등) 상호링크까지 더 갖춘 것을 확인 → **04_증빙판을 정본으로 유지**, `00_결정-준비/회의록-정리본/2026-07-04-전략회의-정리본.md`는 리다이렉트 스텁으로 교체(삭제 아님 — 나선형-성장-구조·기능요구사항-7-4회의·_정합감사-2026-07-04 등 외부 참조 3건이 걸려 있어 하드 삭제 대신 링크 보존). 양쪽 문서·INDEX의 "🔴 중복 발견/미결" 문구를 "✅ 해소" 문구로 갱신. 이제 참조가 끊긴 `원문-2026-07-04-발표서사설계-JB발췌.md` 스텁도 삭제.
**검증**: `canon-moc-sync --dry-run`·`npm run test` 무회귀.
- **(추가) JB_project2 적용 집행 — PR #2 제출**: 사용자 "적용하시오" 지시로 §9 핸드오프를 직접 구현. 작업클론(~/project/active/JB_project2) origin/main(0226bd6, RM하네스 포함)에서 feat/memory-cards-llm-gateway 분기 → `app/memoryCards.js`(afterApprovalDecision 훅 push 통합·ccl_memory_cards scope 준수·PII 거부·crossBan·3회→confirmed) + `scripts/llm-gateway.mjs`(:8022, LLM_GATEWAY_PORT env, 8021=paperclip 충돌 발견·회피) + 등록 3줄. 검증: node --check·verify_static 71파일·브라우저 실검증(승인1→카드3·재관측 confirmed·PII거부·scope예외·패널 렌더)·게이트웨이 스모크. 명시경로 커밋(9755d36)→fork 푸시→**PR LSB-afk/JB_project2#2 OPEN**. 구현현황 §9 상태 갱신.

### 2026-07-04 · canon-moc-sync 잔여 경고 4종 병렬 Haiku 정리 + 동시세션 레이스 조건 발견
**배경**: 사용자 "색인들만 해결하면 된다. 하위 병렬 에이전트. 하이쿠가 쉽고 반복적인 거 하면 된다" — 남은 canon-moc-sync 경고(죽은 링크 3건·도달성 2건·bare `[[08_본선/04_증빙/02_분석자료/리서치/리서치-인덱스|리서치 인덱스]]` 5곳·bare `[[submission-checklist]]` 5곳)를 병렬 Haiku 서브에이전트 4개로 위임.
**한 일**: ① 죽은 링크 3건(04_definitions·15_pitch-outline·16_judge-qna → 실제 파일명으로 정정) ② 도달성 2건(jbfg-design-system-guide up: 오류 정정+`_결정준비-MOC` 링크 추가, 전라도 페르소나 제외본 → `JB-콘솔-페르소나-로스터`에서 링크) ③ bare README 5곳 경로지정(문맥 판단: 03_제품 1곳, 리서치 4곳) ④ bare submission-checklist 5곳을 `07_발표-제출` 버전으로 경로지정(내용 비교 후 최신·SME히어로 반영판 선택). 4개 전부 model:haiku로 병렬 실행, 각자 자체 canon-moc-sync 검증.
**발견(중요)**: 검증 중 도달성 미달이 일시적으로 2건→118건으로 폭증하는 것을 포착 — 조사 결과 **다른 동시 세션이 `08_본선/04_증빙/02_분석자료/리서치/`(플랫 구조) 전체를 `08_본선/04_증빙/02_분석자료/리서치/`(01_프롬프트·02_결과-원문·03_요약-정리 하위폴더 구조)로 재구성하는 중**이었음(내 에이전트 작업과 무관, 파일명까지 의미론적으로 개명됨 — 의도적 리팩터로 판단). README 링크 에이전트가 마침 이 이동 중간에 실행돼 새 경로를 스스로 찾아 반영했으나 파일 5(`_요약-인덱스.md`)는 그 시점에 못 찾아 미처리로 보고 — 이동 완료 후 직접 확인해 새 위치(`03_요약-정리/_요약-인덱스.md`)에서 남은 bare `[[08_본선/04_증빙/02_분석자료/리서치/리서치-인덱스|리서치 인덱스]]` 1곳을 수동으로 마저 고침. **다른 세션의 재구성 자체는 되돌리지 않음**(병렬세션 존중 원칙) — 재확인 시점엔 그 세션도 자체적으로 죽은링크·도달성 문제를 완결한 상태였음.
**검증**: 최종 `canon-moc-sync --dry-run` — 중복 파일명(구조적, 정상) 외 전 항목 클린(`[4/5] 죽은 링크: 없음`, `[5/5] 도달성: 루트에서 모든 노트 도달`). `npm run test` 통과.
- **(추가) PR#2 협업 모드 확정(사용자 지시: 승보 개발 진행 고려)**: upstream 드리프트 확인(0226bd6 그대로·PR MERGEABLE/CLEAN). PR#2에 협업 코멘트 — 충돌 표면(신규 2파일+등록 3줄)·main 앞서가면 이쪽에서 리베이스 유지 약속·훅 push 방식 변경 열어둠·8021 paperclip 점유 공유. 이후 세션 규칙: 머지 전 upstream 재확인→리베이스.

### 2026-07-05 · `03_제품/01_결정-준비/` 스크래치 정리 (85→61파일, 24건 아카이브)
**배경**: 사용자 "03_제품 안에는 어떻게 정리하지? 너무 복잡하고 지저분해서 이거 고민이다" → 진단 결과 `00_결정-준비/`가 183개 중 85개(거의 절반)를 차지하는 미정리 스크래치 영역이라고 답변, "네가 추천하는 쪽으로" 승인 받아 진행.
**추가 발견**: 조사 중 `00_결정-준비/회의록-정리본/` 서브폴더에 04_증빙 정본과 겹치는 **회의록 중복 4쌍(7개 파일)**을 새로 발견 — 2026-07-01-아이디어회의, 7/2·7/3 스프린트회의, 7/4 전략회의2(메인대시보드). 전부 04_증빙 정본으로 확인되어 리다이렉트 스텁 처리(1개 에이전트). 이후 아무도 참조 안 하는 "-추출" 스텁 3개는 완전 삭제.
**조사(3개 병렬 Explore 에이전트, 읽기전용)**: casesops-분기(14개)·질문(15개)·근거팩+viz+설계+최상위loose(38개) 서브폴더를 정식 문서 트리(vision·prd·agent-design·설계도·발표자료·decision-log)와 대조해 A(흡수완료→아카이브)/B(여전히 유일 소스→보존)/C(애매→사람판단) 판정 요청.
**결론 및 실행**: casesops-분기는 14개 중 9개가 여전히 유일 소스라 **전체 보존**(decision-log의 "완료" 기록이 실제 흡수와 어긋난다는 중요 발견 포함). 질문 15개 중 10개(Q1·Q2·Q3·Q4·Q7·Q9·Q13·Q14·Q15·프롬프트원문) 아카이브, 5개(Q5·Q6·Q8·Q10·Q11·Q12) 보존. 근거팩/viz/설계/loose 38개 중 14개 아카이브(viz 3·구설계 2·GPT프롬프트 1·diff/oneconsole 2·loose 6), 나머지 보존(근거팩 4·paperclip블루프린트 등 다수는 정식 문서가 지금도 인용 중). 총 24개를 3개 병렬 Haiku 에이전트로 `03_제품/_archive/`에 이동+`status:archived`+아카이브 배너 부착(기계적 실행, 판단은 사람이 사전 완료).
**후속 정리(직접)**: `03_제품/_archive/README.md`에 24건 이관표 추가, `_결정준비-MOC.md`를 현재 상태(🗄️아카이브 표시, 회의록 섹션은 04_증빙 리다이렉트로 교체)에 맞게 갱신.
**검증**: `canon-moc-sync --dry-run`(도달성 일시 3건 발생→"-추출" 스텁 3개 삭제로 해소) · `npm run test` 통과. `00_결정-준비` 85→61파일(-28%).
**남은 것(다음 단계 후보, 미실행)**: "07_" 번호가 3개 폴더(계열사-하네스·역할-하네스·발표-제출)+파일(07_architecture.md)에 중복 배정된 번호 충돌 — 사용자에게 제안했던 2단계 계획의 두 번째 항목, 아직 미착수.

### 2026-07-05 · 🔴 볼트 전역 텍스트 오염 발견·복구 — "README" 무차별 치환 사고
**배경**: 07_ 번호충돌 정리+03_제품 paperclip式 재구조화를 진행하려던 중, `08_본선/03_제품/README.md` 제목이 "제품 README" 자리에 "제품 08_본선/04_증빙/02_분석자료/리서치/README"로 깨진 것을 발견. 조사 결과 **다른 동시 세션이 리서치 폴더 재구성(05_제출/리서치-딥프롬프트 → 04_증빙/02_분석자료/리서치) 후 README 링크를 고치려다가, 위키링크 `[[ ]]` 밖의 일반 텍스트 속 "README" 단어까지 문자열 그대로 치환**한 것으로 확인 — `AGENTS.md`·`PROGRESS.md`·`decision-log.md`·`session-log.md`·`프롬프트-로그.md`(append-only 과거 로그!) 등 **38개 파일 113곳** 오염. 사용자 확인 후 최우선 복구 지시.
**복구**: ① 문자열 그대로 셸 치환(sed) 1차 시도 — 27개 파일은 성공했으나 **11개 파일에서 실패**(원인: 이 볼트가 반복 경고하는 NFC/NFD 유니코드 정규화 불일치 — 한글 자모 분해형이 섞여 있어 바이트 단위 문자열 매치가 빗나감). ② Node.js `String.normalize('NFC')`로 파일 내용과 검색 문자열을 모두 정규화한 뒤 재치환 — 11개 파일·29곳 추가 복구. ③ 전체 볼트 재스캔(정규화 포함)으로 잔존 오염 **0건** 확인.
**교차 확인**: 오염 복구 과정에서 기존에 알던 "리서치 README 경로지정 5곳"(validation-report.md 등)이 이미 다른 세션에 의해 `README.md`→`리서치-인덱스.md`로 파일명 자체가 바뀌고 위키링크도 정상 갱신돼 있는 것을 확인 — 별도 조치 불필요(이미 올바름).
**검증**: `canon-moc-sync --dry-run` 완전 클린(죽은 링크 0·도달성 100%, 무관한 기존 경고만 잔존) · `npm run test` 통과.
**교훈**: 벌크 문자열 치환은 `[[ ]]` wikilink 경계를 반드시 확인하고, 유니코드 정규화(NFC)까지 고려해야 함 — 이 사고의 원인이 된 다른 세션의 실수를 반복하지 않기 위한 기록.

### 2026-07-05 · `03_제품/` paperclip式 재구조화 — docs/reports 신설 + "07_" 충돌 해소
**배경**: 오염 복구 후 원래 요청("진행. 그리고 또 에이전트 팀을 동원하라 — 나중에 GitHub 공개 배포 시 paperclip처럼 깔끔한 폴더/하네스 구조가 되도록 정리")으로 복귀. `_vendor/paperclip-master/doc/`(주제별 flat 문서 폴더)와 자체 설계 문서(`_문서생성-마스터플랜.md`·`_문서생성-스킬-DDBM-Harness-SDD.md`)를 대조한 결과, 하네스 정규문서(harness normal-form) 15종이 `00_vision/`·`01_prd/`·03_제품 루트에 흩어져 있는 게 "지저분함"의 실체로 확인됨.
**실행(병렬 에이전트 2개)**: ① `docs/` 신설 → 하네스 문서 15종(00_source-log·05_domain-model·07_architecture·08_feature-spec·09_flow·11_change-log[루트]·business-model·core-bet·principles·definitions·business-metrics·data-strategy·risk-impact-register[00_vision/]·prd·mvp-scope[01_prd/]) 이동(파일명 불변 — 위키링크 안 깨짐). `01_prd/` 빈 폴더 삭제, `00_vision/`엔 서사 문서 3종만 잔존. ② `reports/` 신설(구현현황-JB_project2·jb-finai-scorecard), "07_" 번호충돌 해소(`07_계열사-하네스`→`계열사-하네스`, `07_역할-하네스`→`역할-하네스`, **`07_발표-제출`은 실제 제출자료라 미변경**), 빈 스캐폴드(`app/`·`tests/`, .gitkeep만 있던 것) + OS 잡동사니 삭제.
**가드레일**: `03_ux/`·`04_tech/`·`06_build-roadmap/`·`02_agent-design/`·`07_발표-제출/`·`00_결정-준비/`·`설계도/`·`rules/`·`evals/`는 마스터플랜 자체 명시("병렬 세션 소유, 손대지 말 것") 또는 이미 정리 완료라 **완전히 미접촉**.
**후속(직접)**: `INDEX.md` 전면 갱신(docs/reports/개명 폴더 반영, 빈 개발폴더 섹션 제거), `_문서생성-마스터플랜.md`에 재구조화 addendum 추가(크로스워크 표는 역사적 스냅샷으로 보존, 새 위치는 별도 명기).
**검증**: `canon-moc-sync --dry-run`(죽은 링크 0·도달성 100%) · `npm run test` 통과. `03_제품/` 최상위 루트 loose 파일 16개+임시폴더 다수 → 4개(harness.yaml·README·INDEX·validation-report, 전부 스킬 문서가 명시한 "Required Project-Level Documents")로 정리됨.

### 2026-07-05 · 인덱스류 문서 제목 명확화
**배경**: 사용자 "인덱스 파일들도 어떤 인덱스인지 제목을 알아야 한다" — `03_제품/INDEX.md`(vs `_03_제품_MOC`) 혼동 지적의 연장.
**한 일**: 볼트 전역 `type/index`·`type/moc` 태그 파일 19개 + 파일명에 INDEX/MOC 포함 파일을 전수 조사 — H1 제목이 파일명을 그대로 반복할 뿐 내용을 설명하지 못하는 3건을 발견해 수정: `_system/tools/_tools-index.md`("# _tools-index"→"# 도구·스킬·CLI 마스터 인덱스"), `04_증빙/03_daily/_daily-INDEX.md`("# _daily-INDEX"→"# 데일리 노트 인덱스 — 병렬 세션 조율 보드"), `04_증빙/04_회의록/_회의록-INDEX.md`("# _회의록-INDEX"→"# 회의록 인덱스 — 본선 팀 회의 기록 허브"). `03_제품/INDEX.md`는 제목에 "(상세판)"과 MOC와의 관계를 직접 명시하도록 강화. 나머지 16건(MOC류·`_페르소나-인덱스`·`_설계도-INDEX`·`_요약-인덱스` 등)은 이미 내용을 설명하는 제목이라 그대로 둠.
**검증**: `canon-moc-sync --dry-run`·`npm run test` 무회귀.

### 2026-07-05 · 볼트 전역 로밍 유지보수 (빈 폴더·OS잡동사니 정리)
**배경**: 사용자 "남은 작업들은 없는가? 불렛을 돌아다니면서 자잘한 유지보수를 수행하시오 — 단, 지금 볼트 안에 대대적인 청소작업을 하는 다른 클로드 세션이 있으니 주의."
**한 일**: 다른 세션과 충돌 여부부터 확인(최근 5분 내 수정 파일 없음 → 현재 활성 편집 없음 확인 후 진행). 볼트 전역 스캔:
- **완전히 빈 폴더 3건 삭제**: `05_제출/리서치-딥프롬프트/`(다른 세션이 `04_증빙/02_분석자료/리서치/`로 이미 이전 완료, 껍데기만 남음 — 내용 재확인 후 안전 삭제) · `03_제품/01_결정-준비/viz/`(오늘 이 세션이 3파일을 `_archive/`로 이관한 뒤 남은 빈 폴더) · `05_제출/슬라이드`(참조·git이력 0건, 미사용 빈 폴더).
- **OS/Syncthing 잡동사니 20개 삭제**: `.DS_Store`·`.sync-conflict-*.DS_Store`(전부 gitignore 대상, git 이력에 영향 없음, 로컬 정리만).
- **점검했으나 문제 없음 확인**: `01_대회정보`·`02_전략`·`04_증빙`·`_분석`·`assets` 루트 loose 파일들은 이미 적절히 flat 배치(서브폴더 불필요 규모). 0바이트/근접-빈 `.md` 파일 0건. `master-evidence-ledger.md` 등 나머지 index류는 제목 이미 명확.
- **의도적으로 안 건드림**: `05_제출/` 최상위 loose 파일 9개(발표·시연 전략 문서들)는 지금 실제 대회 제출 자료라 재구조화 리스크가 커서 스코프 밖으로 유지(07_발표-제출과 동일 판단).
**검증**: `canon-moc-sync --dry-run`(중복 파일명 3건=구조적 정상, frontmatter 누락 1건=기존 예외 외 전항목 클린) · `npm run test` 통과.
