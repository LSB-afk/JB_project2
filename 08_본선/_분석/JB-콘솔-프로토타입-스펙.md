---
tags:
  - area/product
  - type/spec
  - status/active
date: 2026-07-02
up: "[[_03_제품_MOC]]"
aliases:
  - JB-콘솔-프로토타입-스펙
  - jb-console-spec
---
> **[대외비]** 6/29 공식 발표 전 비공개. ⚠️ **팀 내부 디자인/기능 레퍼런스** — 실제 제출 제품은 팀원 별도 구현. 이 프로토타입은 격리 fork(볼트 밖) `jb-console` 브랜치. **하부 코드=paperclip(MIT), 표절 가드: 외부 공개물은 팀원 별도 구현.**

# JB LocalGuard 콘솔 프로토타입 — SSOT 스펙

이 문서는 fork(`~/Downloads/archives/paperclip-jb-fork`, `jb-console` 브랜치)를 **우리 예선 설계 + JB 디자인**의 고품질 시각 프로토타입으로 만드는 작업의 단일 진실 원천이다. 다른 세션/에이전트/팀원이 이걸 보고 정합하게 협업한다. 품질 바 = **5천만원 외주 납품물**([[jb-console-quality-bar]]).

## 위상·컨텍스트
- **메인 제품 라인에서 벗어난 프로토타입 레인**. fork 독립 git `jb-console` 브랜치(baseline `1bf3099`→JB개조 `98ac2e8`→jb-console). 볼트(JBproject)에는 **코드 미반입**, 이 스펙·학습문서(텍스트)만.
- 실행: `PAPERCLIP_HOME=~/.paperclip-jbfork pnpm dev` → `localhost:3100`(pnpm=`~/.npm-global/bin`).
- 런타임 실측: [[paperclip-런타임-데이터흐름]]. 정적 티어다운: [[paperclip-소스-티어다운]].

## 목표 IA — 우리 예선 15페이지 (paperclip 제네릭 탭 대체)
출처: `02_제품/app/` index.html·app.js·modules.js.

| 섹션 | 페이지 | 목적(RM이 하는 일) | fork 매핑 |
|---|---|---|---|
| 운영업무 | **대시보드** | 위험 클러스터·승인대기·예산·지점별 요약 | 기존 dashboard 재구성 |
| 운영업무 | **알림함** | Escalated/승인대기 긴급 큐 | inbox |
| 운영업무 | **케이스** | 칸반/리스트, 위험·상태·SLA | issues |
| 운영업무 | **승인** | L0~L4 사람 승인/반려, 콜백 검토 | approvals |
| 운영업무 | **실행이력** | AgentRun 로그·스킬별 처리 | agent runs |
| 운영업무 | **전세보호** 🆕 | 전세가율·권리·자산·계약·은행 진단 | **신규 페이지** |
| AI조직 | **에이전트** | 14 에이전트 상태·역할·스킬 | agents |
| AI조직 | **조직도** | 사람 승인자+AI 보고 위계 | org |
| AI조직 | **자동화** | 정기 루틴(야간 스캔 등) | routines |
| AI조직 | **목표** | KPI(Triage 50%↓·근거 100%…) | goals |
| 시스템 | **스킬** | 25종 스킬·승인정책·위험도 | skills |
| 시스템 | **플러그인** | 법령·정책·등기·HUG·KB MCP | plugins |
| 시스템 | **활동** | 상태변경·승인·차단 타임라인 | activity |
| 시스템 | **비용** | 에이전트 예산·토큰·ROI | cost |
| 시스템 | **PII거버넌스** 🆕 | 등급제·토큰화·모델라우팅·반출스캔 | **신규 페이지** |
| 시스템 | **설정** | 계열사 필터·거버넌스 정책 | settings |

## 4 함수계약 (시그니처 페이지가 미러할 로직)
출처 `02_제품/app/app.js`:
- **`computeRiskDecision(item)`**(3562–3604): actionType(contract전세/fraud사기/customerNotice소상공인/internal)별 신호 5종×가중치→기여도 합=score(0-100)→L0(0-39)/L1/L2/L3(80-89)/L4(90-100) 승인 라우팅. 전세: 전세가율34·권리24·임차인노출18·보증14·은행10. 사기: 외부URL34·차단필요28·AI악용22·준법16. 소상공인: 상환스트레스32·정책금융22·서류18·근거16·안내12.
- **`buildDashboardData()`**(3483–3534): 고위험(≥85)·전세위험·차단·승인대기·근거연결률·예산/ROI·지점별 집계.
- **`auditChainRecords(item)`**(3369–3398): GENESIS→각 레코드 {seq·time·actor(사람/오케/에이전트)·action·target·evidenceId·previousHash·hash} 해시체인, 무결성 검증 가능.
- **`moveCaseToColumn(caseId,column)`**(4223–4255): 칸반 상태전이→AgentRun 시작·산출물 생성·감사 훅.

## canon 에이전트 정본 (14 운영 + 2 사람 + 게이트)
출처 `_canon.md` §2 · `03_에이전트/`. **표시명 정확히 사용.**
- 운영지휘/분석: **운영 조율 에이전트**(L0)·**포트폴리오 분석 에이전트**(L0)
- 위험·금융: **위험신호 조기감지 에이전트**(L0)·**상환위험 분류 에이전트**(L1/2·히어로 owner)·**정책금융 매칭 에이전트**(L1/2)
- 전세 Shield: **전세위험 관리 리드**(L1/2)·**전세가율 분석 에이전트**·**등기 권리 분석 에이전트**(L3)·**임차인 손실위험 에이전트**
- 통제: **이상거래 탐지·차단 에이전트**(L4)·**준법 검토 에이전트**(L3)·**계약 체크리스트 에이전트**(L3)
- 고객연계: **RM 보좌 에이전트**(L1/2)·**은행 연계 에이전트**(L1/2)
- 사람: **RM 최종 승인자**·**준법 최종 승인자** · 게이트: **승인 게이트**(L0~L4 강제)

## canon 데모 시나리오 (정본 수치)
- **히어로 — 전주 중앙로 카페**(JBG-104, 전북은행, 개인사업자, risk **88**, Approval Pending, 운전자금 1.8억·카드매출 둔화). KPI: Triage 50%↓.
- **전세보호**: 피해자 누적 인정 **39,121건**(국토부 2026-06-09), HUG 사고액 2024 **4.49조**(역대최고)→2025 1.24조, 평균 보증금 ≈1.3억. KPI: safe-contract 체크 100%.
- **보이스피싱**: 2025.1~11 피해 **1조 1,330억(+56.1%)**, 건당 5,248만원, 50대+ 53%. KPI: 승인 100%.
- 법령(정본 문구): 신용정보법 §40조의2 ①②⑥⑦⑧ / 개인정보보호법 §28조의4·5 / 전자금융감독규정 §15① / 금융위 망분리 로드맵(2024-08-13, MLS).

## JB 디자인 토큰 (디자이너 갱신 → 파이프라인)
출처 `~/Downloads/archives/https-www-jbfg-com-ko-main/outputs/jbfg-design-tokens.css`. 핵심: primary `#0A31A8`·accent `#1C56FF`·deep `#0D2D77`·navy `#0B235B`·esg `#9ECFA9`·focus-green `#51E3A4`·cyan `#19E4EE`(장식). SUIT Variable, 헤드라인 800, letter-spacing -0.02em·숫자 -0.06em. radius 4/8/16/24/**32**/40·pill. glass `rgba(0,19,74,.48)`. 여백 clamp(margin 57·section-y 144·card-gap 24). 모션 120/200/280/600ms.
- **파이프라인**: 디자이너가 위 토큰 css 갱신 → `node scripts/jb-tokens-sync.mjs`(fork) → `ui/src/index.css` 토큰 블록 재생성.
- **차별화(표절 해소)**: 네이비 히어로 헤더·글래스 KPI·큰 타이포·32px 카드·넉넉한 여백 = IR 대시보드급 → paperclip 조밀 회색 task-board와 육안 상이.

## 시그니처 페이지 (P3, 실제 동작)
1. **전세 Shield**: 진단 폼→전세가율/자산노출/주거비/종합위험→체크리스트·특약초안·은행연계(HUG). 고위험(근저당/신탁)→L3 pending. `runJeonseDiagnosis` 미러.
2. **PII 거버넌스**: 등급제·토큰화 전/후·모델 라우팅·반출 스캔·법령 칩. `modules.js` governance 미러.
3. **리스크 L0~L4 뷰**: `computeRiskDecision` 신호 분해+승인 매트릭스.
4. **감사 체인 뷰**: `auditChainRecords` 해시체인 무결성 시각화.

## 진행 상태 (페이즈)
- [x] P0 셋업: jb-console 브랜치 · 이 스펙문서 · 토큰 파이프라인
- [x] P1 깊은 JB 디자인 시스템 (Codex C1) — 토큰 전면 + `.jb-*` 컴포넌트 CSS. 커밋 `6437d21`
- [x] P1b 대시보드 JB 네이비 히어로 배너 + 글래스 KPI. 커밋 `f38c137`
- [x] P2 IA 재구성 (운영업무·AGENTS·시스템 네비, 전세보호·리스크판정·PII·감사체인 라우트). 커밋 `2975443`
- [x] P3 시그니처 4페이지 — 전세Shield(runJeonseDiagnosis)·리스크L0~L4(computeRiskDecision)·PII거버넌스(4중방어)·감사체인(auditChainRecords). 전부 실동작·페이지에러 0. 커밋 `2975443`
- [x] P4 실 은행 워크플로 심화 (커밋 `389e5ca`) — 사용자 판정("실 은행 업무 자동화 부족·에이전트 종류 부족·아이콘") 대응:
  - **인터랙티브 워크플로 3종**(JeonseShield 골격 복제·useMemo 실시간): `FraudShieldPage`(이상거래 L4 자동차단→사람 승인 게이트·fraud 4신호)·`RepaymentTriagePage`(상환위험 sme 5신호+시나리오 3종)·`PolicyMatchPage`(정책금융 매칭 대환대출·햇살론뱅크·소진공·지역신보+서류·연계). 신호 가중치는 `RiskDecisionView.buildSignalsForAction` 미러.
  - **14 canon 운영 에이전트 + 2 사람 승인자 리시드**: `packages/db/src/jb-reseed-agents.ts`(기존 4행 UPDATE·나머지 INSERT로 FK 보존), LocalGuard 회사(db37c44b) 대상. 운영 조율=root, 전세 3종→전세위험 관리 리드, 나머지+승인자→운영 조율. `/agents`·`/org` 실 조직 렌더. role은 enum 12개 고정 준수(정체성=name/title).
  - **아이콘 JB 정렬**: `svg.lucide { stroke-width: 1.75px }`(전 아이콘 경량화, JbIcon 래퍼 대신 1줄 전역)·승인/신규 nav 아이콘 의미 정합(승인 Stamp·상환 Activity·정책 HandCoins·이상거래 Ban).
- [x] P5 검증·폴리시·갤러리 — UI/DB `tsc -b` 0 · 6라우트 라이브 렌더 pageerror 0 · verify_static 34 green · 볼트 fork 코드 0. 갤러리 캡처 완료.

### 해소된 항목
- PII거버넌스·감사체인 자체 블루 팔레트(#091c4d·#edf4fb·#d6e3f1 등) → JB 토큰(`text-foreground`/`text-primary`/`bg-card`/`border-border`/`bg-primary/10`)으로 하모나이즈(의미색 red/amber/emerald/violet·무결성 유지). `min-h-screen` 제거→Layout 정합.
- 라우트 루트 `repayment-triage`·`policy-match`·`fraud-shield`(+기존 jeonse/pii/audit/risk)를 `lib/company-routes.ts` BOARD_ROUTE_ROOTS에 등록.

## 에이전트 분업 (실측 제약 반영)
- **Codex(최대 5병렬)** = 설계·코드생성·리서치(텍스트 산출). ⚠️ Codex sandbox는 localhost·`~/Downloads` 쓰기 차단 → fork 직접 편집·시드 불가.
- **메인 세션(실권한)** = Codex 산출 적용(Write/Edit)·서버·API 시드·스크린샷·검증.

## 가드
- 우리 라이브 앱 `02_제품/app/*` 무수정. 볼트 verify_static green 유지.
- 시각 프로토타입: 폼+계산=프론트, 데이터=시드(백엔드 엔진 범위 밖). 합성 PII만·localhost 전용.
- 외부 제출·공개=사람 승인 게이트(팀원 별도 구현).

---

## 케이스 중심 재구현 (2026-07-02, P0~P4) — "디자인 티 제거 → 실사용 UX"

**전환**: 사용자 판정("계산기가 핵심 아니다·디자인 밤티 제거·실사용 UX 품질")에 따라, `02_제품/app/` MVP를 **정답지**로 삼아 fork를 **케이스 중심 운영 콘솔**로 재구현. 계산기 4종은 보조 탭 유지(케이스 임베드 폐기). fork 위치 이전: `~/Downloads/archives/` → **`~/project/active/paperclip-jb-fork`**(Codex-writable sibling). 개발도구/SDK 분업 = [[JB-콘솔-개발도구-SDK-플랜]].

| 페이즈 | 결과 | 커밋 |
|---|---|---|
| **P0** | 밝은 테마 기본(다크 OS에서도 라이트 고정, 토글 유지)·제네릭 nav 숨김(루틴/목표/산출물/프로젝트) | `2324d28` |
| **P1** | 시드 데이터 5모듈(`ui/src/data/`): jb-types·cases(6건, 히어로 JBG-104 8단계 타임라인)·evidence·skills(md body)·plugins(MCP) | `2324d28` |
| **P2** | 케이스 큐(`/cases`, 계열사 그룹) + **케이스 상세 전용 뷰**(`/cases/:caseId`): 결정규칙 배너·헤더+위험도 게이지·자율운영 타임라인·에이전트 루트·근거+플러그인·산출물 MD·승인 게이트+감사 | `2324d28` |
| **P3** | 스킬 콘텐츠 엔진(`/skills`, body md·입력등급·근거·편집) + 플러그인/MCP 레지스트리(`/plugins`, law/policy/news/realestate/jb-db·govTier·상태) | `427f6bd` |
| **P4** | 디자인 폴리시: 헤더 게이지 라벨형(88/100+L눈금)·플러그인 버튼 채도 완화 | `282de15` |

**검증**: 전 페이즈 `tsc -b` 0 · 라이브 렌더(`/cases`·`/cases/JBG-104`·`/skills`·`/plugins`) pageerror 0 · verify_static 34 green · 볼트에 fork 코드 0(sibling). **구현 방식**: 신규파일=Codex 생성→스테이징→Claude 이동, 기존편집·디자인=Claude 직접, 서버·스크린샷·검증=Claude.

**남은 것**: 갤러리 정리·(선택) 케이스 상세 나머지 미세 폴리시·본선 서사 연결.
