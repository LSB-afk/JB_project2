# JB LocalGuard OS — 본선 MVP 점검 보고서

> ⚠️ **대외비 — 6/29 공식발표 전 비공개** (GoLAB 내부 문서 · 외부 유출·공개 저장소 푸시 금지)
> 작성 기준: 2026-06-26 · 앱 버전 `dashboard-pack-20260613` · 소스 총 10,231줄(app.js 4494 + modules.js 865 + styles.css 4872)

---

## 1. 실제 동작 인벤토리

### 1-A. 진짜 상호작용(상태 변화)하는 기능

| # | 기능 | 핵심 함수 | 상태 변화 내용 |
|---|------|-----------|----------------|
| 1 | **AgentRun 실행** | `startAgentRun` / `runAgents` | Case.status: New/Pending → "Agent Running" → "Approval Pending"(또는 Escalated), agentRuns 배열에 새 run 객체 추가, audit 로그 append, setTimeout 2단계 애니메이션(700ms→1600ms), `createAnalysisResult` 호출로 분석 결과 자동 생성, localStorage persist |
| 2 | **RM 승인** | `approveCase` | Case.status → "Approved", stage → "done", audit append, 관련 agentRuns 모두 "completed"로 닫음, activity 갱신, localStorage persist |
| 3 | **RM 반려** | `rejectCase` | Case.status → "Rejected", stage → "blocked", agentRuns "rejected" 처리, localStorage persist |
| 4 | **지시 실행(오케스트레이터 커맨드)** | `dispatchCommand` | 자유 입력 텍스트를 파라미터로 `startAgentRun` 호출, `lastDispatchResult` 업데이트, 대시보드로 뷰 전환, toast 알림 |
| 5 | **전세 진단 폼** | `runJeonseDiagnosis` | 입력값 5개(보증금/매매가/자산/소득/권리) → 전세가율·자산노출·주거비부담 실계산, riskScore 재산정(`estimatedJeonseScore`), Case 업데이트, analysisResult 생성, Approval Pending 상태로 전환, persist |
| 6 | **케이스 등록 모달** | `buildManualCase` / `openNewCaseModal` | 3개 위험유형(전세/소상공인/사기) 분기, `manual-{seq}` ID 부여, cases 배열 push, persist |
| 7 | **결과 저장** | `saveCaseResult` | `resultSaved: true`, `scenarioResults` prepend, audit append, persist |
| 8 | **후속 작업 생성** | `createFollowUpTask` | `nextTaskCreated: true`, audit append, `scenarioResults` prepend, persist |
| 9 | **감사원장 무결성 검증** | `verifyAuditChain` | audit 배열 전체를 FNV-1a 해시 체인으로 검증, `auditIntegrityResult` 업데이트, "정상 · N개 레코드" 실시간 표시 |
| 10 | **감사 JSON 내보내기** | `exportAuditJson` | Blob 생성, `{code}-audit-ledger.json` 다운로드 트리거 |
| 11 | **칸반 드래그&드롭** | `moveCaseToColumn` / `bindDragTargets` | 칸반 열(backlog→done) 간 이동으로 Case.status/stage 즉시 변경, "in_progress" 이동 시 `startAgentRun` 자동 연동 |
| 12 | **계열사 Rail 필터** | 인라인 이벤트 | `railFilter` 전환으로 전체 대시보드·케이스보드를 계열사 범위로 필터링 |
| 13 | **루틴 토글** | `data-routine-toggle` | routines 배열 `enabled`↔`paused`, activity 갱신 |
| 14 | **PII 토큰화(클라이언트)** | `dataGovernance.tokenizePII` | 성명·주민번호·전화·계좌·주소 패턴 정규식 치환 → `{{KIND_N}}` 토큰, 거버넌스 패널 실시간 표시 |
| 15 | **위험 점수 분해** | `computeRiskDecision` | 케이스 유형별(contract/fraud/smallbiz) 시그널 가중 합산 → approvalLevelMatrix 매핑, 분해 카드 렌더 |
| 16 | **데모 모드 URL 파라미터** | `applyDemoModeFromUrl` | `?demo=sme/jeonse/phishing` → 초기 상태 결정론적 시드, 코치마크 단계 표시 |
| 17 | **검색(사이드바·케이스보드)** | `bindActions` + `searchableCases` | 케이스·에이전트·스킬 실시간 필터 |
| 18 | **스킬 콘텐츠 편집** | `skillEditMode` / `skillBodyPanel` | 스킬 본문 인라인 편집 토글 |
| 19 | **토큰 통계 탭 전환** | `data-token-period` | daily/weekly/monthly 탭 전환, SVG 차트 재렌더 |
| 20 | **플러그인 테스트/토글** | `bindModuleActions` | 플러그인 연결/해제 상태 토글(시뮬레이션) |

### 1-B. 정적 목업/하드코딩 영역

| 영역                      | 내용                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **에이전트 상태값**            | `status: "running"/"idle"` 등 — 실시간 변화 없는 초기값. `startAgentRun` 이후 케이스 연결 에이전트만 간접 반영                                                  |
| **AgentRun 로그 텍스트**     | 2단계 setTimeout 로그는 케이스 유형에 따라 분기하는 고정 문자열, 실 LLM 응답 아님                                                                               |
| **리스크 점수(초기 케이스)**      | `riskScore: 88/72/94/67/91` — 전세 진단 외 케이스는 하드코딩 수치                                                                                   |
| **비용·토큰 통계**            | `monthlyCostTrend`, `tokenUsage` — 모두 하드코딩 시나리오 수치                                                                                   |
| **deliverableRegistry** | 전주 카페(JBG-104)에만 실제 산출물 5종 존재, 나머지 케이스는 `createAnalysisResult`의 템플릿 텍스트                                                              |
| **governanceLog**       | 전주 카페 1건에만 구체적 토큰화 Before/After + 라우팅 테이블 존재                                                                                         |
| **customers 배열**        | 고객 추적 객체 1건(김○○)만 존재                                                                                                                 |
| **플러그인 "테스트 조회"**       | 실제 외부 API 호출 없음, 상태 토글만                                                                                                              |
| **조직도 / 자동화 / 설정**      | 정적 렌더, 상태 변화 없음                                                                                                                      |
| **`openCaseDetail`**    | `caseDetailPage()` 함수는 구현되어 있고 `data-view-jump="cases"` breadcrumb 있으나, 내비게이션 뷰에서 직접 접근 경로가 약함 (activeView = "case-detail"이 라우터에 없음) |

### 1-C. 핵심 함수 동작 판정

| 함수                                       | 판정      | 근거                                                                                 |
| ---------------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `runAgents` / `startAgentRun`            | ✅ 실동작   | Case 상태 전이 + AgentRun 생성 + 2단계 비동기 로그 + analysisResult 생성 + localStorage persist   |
| `approveCase`                            | ✅ 실동작   | 상태 Approved로 전이, runs 닫음, activity 갱신                                              |
| `dispatchCommand`                        | ✅ 실동작   | 자유 텍스트 → `startAgentRun` 연동, 실행결과 배너                                               |
| `openCaseDetail` / `caseDetailPage`      | ⚠️ 부분동작 | 함수 자체는 존재·렌더 가능. 단 네비게이션 라우터에 `"case-detail"` 뷰 진입점이 없어 `data-view-jump` 클릭시에만 접근됨 |
| `computeRiskDecision`                    | ✅ 실동작   | 유형별 시그널 가중 계산 + approvalLevelMatrix 조회, UI에 분해 카드 렌더                               |
| `auditChainRecords` + `verifyAuditChain` | ✅ 실동작   | FNV-1a 유사 해시 체인, 무결성 검증 + JSON 내보내기                                                |
| 거버넌스 패널 (`governancePanelMarkup`)        | ✅ 실동작   | PII 토큰화 실행(`tokenizePII`), 4중 방어 패널 렌더 — **단 전주 카페 1케이스만** 상세 데이터 있음               |
| 전세 진단 폼 (`runJeonseDiagnosis`)           | ✅ 실동작   | 수식 계산(전세가율/자산노출/주거비) 전부 실행, riskScore 재계산, 상태 전이                                   |
| 새 케이스 등록 (`buildManualCase`)             | ✅ 실동작   | 3종 위험유형 분기, 유효성 검사, cases push                                                     |

---

## 2. 본선 평가축 갭 분석

### 4.2 — 핵심 기능이 실제 동작 가능한 MVP로 구현/확인 가능한가

**현황 (강점):** AgentRun 실행→승인→감사 전 사이클이 실제 상태 변화로 재현되며 localStorage에 persist된다. 전세 진단 폼은 실제 수식 계산을 포함하며, 감사 해시 체인은 JSON 내보내기까지 가능하다. 데모 URL 3종(`?demo=sme/jeonse/phishing`)이 결정론적 시작점을 보장한다.

**약점/공백:**
- AgentRun의 "분석 결과"는 `createAnalysisResult` 내부 템플릿 텍스트이며 실 LLM 추론이 없다. 심사위원이 "실제 AI 판단인가?"를 물었을 때 답이 약하다.
- 에이전트 14종의 심박(heartbeat), 큐, 상태가 실시간 변하지 않는다. 대시보드의 "38초 전" 등은 초기값이 고정된 채로 있다.
- 히어로 시나리오 SME 케이스 이외 케이스는 산출물(`deliverableRegistry`) 없음 — 전세/피싱 케이스 클릭 시 빈 산출물 영역 노출.

### 4.4 — 본선에서 추가 개발·고도화할 기반이 충분한가

**현황:** `_canon.md` §9에 "정적 함수 계약을 서버 API로 1:1 승격" 계획이 명시되어 있고, `computeRiskDecision`, `buildDashboardData`, `auditChainRecords`, `moveCaseToColumn` 등 주요 함수가 순수 함수(외부 의존 없음)로 설계되어 있어 API로 추출하기 용이하다. 플러그인 레지스트리, 스킬 콘텐츠 구조, 거버넌스 `dataGovernance` 객체 모두 실 연동 교체를 염두에 둔 인터페이스다.

**약점:** 백엔드 API 없이 1박2일 현장에서 실연동을 구현하려면 FastAPI/Node 서버 설정·LLM API 키·네트워크 환경이 필요하다. 인프라 선택을 미리 확정하지 않으면 고도화가 표층적으로 그칠 수 있다.

### 5.4 — PoC → 파일럿 → 내부 적용 → 고객 서비스화 발전 경로

**현황:** `function-spec.md` §5에 PoC(현재) → 파일럿(1개 본부) → 내부 적용(사후관리·심사 보조, 네이버클라우드 MOU 방향) → 고객 서비스화 경로가 문서화되어 있다.

**약점:** 현장 시연 시 "지금 단계에서 무엇이 실제로 작동하고 무엇이 Mock인지"를 심사위원이 명확히 구별할 수 있어야 한다. 현재 앱은 데이터 신뢰도 카드(sample/real/error 구분)로 이를 일부 가시화하고 있지만, PoC→파일럿 전환의 구체적 **조건**과 **JB와의 연계 방안** 설명이 발표 자료에서 보강 필요하다.

### 5.5 — 환각·설명가능성·책임소재 리스크 대응 방향

**현황(강점):** 이 항목은 현재 MVP에서 가장 잘 구현된 부분이다.
- `computeRiskDecision`의 **신호별 기여 점수 분해(≥3개 시그널 + 가중치 + 출처 태그)** 가 UI에 표시 — 설명가능성(XAI) 구현체.
- 감사 원장의 해시 체인 + JSON 내보내기 — 책임소재 추적 구현체.
- 승인 레벨 L0–L4 매트릭스 + "확정 표현 금지" 준법 게이트 — 환각 억제 아키텍처.
- PII 4중 방어(등급제·토큰화·모델 라우팅·반출 스캔)가 `dataGovernance` 객체 + 거버넌스 패널로 시각화.

**약점:** 실 LLM 없는 현재 구조에서 "환각"이 발생하지 않으므로 5.5는 문서/설계 수준의 대응이다. 본선에서 실 LLM을 붙이면 환각 가능성이 생기는데, 그 경우의 **실제 hallucination 억제 메커니즘**(RAG 기반 grounding, confidence threshold, 사람 검토 의무화)을 시연으로 보여줄 준비가 필요하다.

---

## 3. 오프라인 구동 가능성 (현장 시연 판정)

**판정: 대부분 구동 가능, 폰트 1개 CDN 의존**

| 항목 | 상태 |
|------|------|
| 외부 LLM API 호출 | ✅ 없음 — `fetch`, `XMLHttpRequest`, `axios` 호출 코드 0건 |
| 외부 JS 라이브러리 CDN | ✅ 없음 — Vanilla JS, 외부 스크립트 태그 없음 |
| 외부 CSS CDN | ⚠️ **있음 1건** — `styles.css` 1번째 줄 `@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/...css")` (Pretendard 가변 폰트) |
| localStorage 의존 | ✅ 정상 작동 — 서버 불필요 |
| 서버 필요 여부 | `python3 -m http.server` 수준 로컬 서버 또는 파일 직접 열기면 충분 |

**조치:** 현장 전 Pretendard 폰트를 로컬 번들로 교체하거나 `@import` 줄을 제거해 시스템 폰트 fallback으로 전환하면 완전 오프라인 구동 가능하다.

---

## 4. 고도화 후보 목록 (본선 임팩트 순)

| 순위 | 고도화 항목 | 기대 효과 | 난이도 | 분류 | 평가축 |
|------|-------------|-----------|--------|------|--------|
| **1** | **실 LLM 연동 AgentRun** — `startAgentRun` 내부 로그를 Claude/GPT API 실호출로 교체, 케이스 컨텍스트(비식별)+시스템 프롬프트(스킬 프롬프트) 전송, 응답을 transcript에 실시간 append | 심사 4.2 결정적 개선 — "진짜 AI가 판단한다"를 라이브 시연으로 증명 | 상 | 백엔드 실연동 | 4.2, 5.5 |
| **2** | **히어로 SME 케이스(JBG-104) 완전 골든 패스 강화** — `?demo=sme` 진입 시 자동으로 dispatchCommand 실행 → AgentRun 시작 → 15초 내 Approval Pending → 승인 버튼까지 원클릭, 발표 5분 내 완주 가능 스크립트 보장 | 4.2 시연 완성도, 발표 임팩트 극대화 | 하 | 정적 강화 | 4.2, 4.1 |
| **3** | **나머지 케이스 산출물 추가** — `deliverableRegistry`에 서울 전세(JBG-201)·군산 피싱(JBG-127) 산출물 각 3종 이상 추가, 각 케이스 클릭 시 빈 영역 해소 | 4.2·4.3 완성도, 전세/피싱 데모 패스 강화 | 하 | 정적 강화 | 4.2, 4.3 |
| **4** | **공공 API 1개 실연동** — 한국은행 ECOS API(금리·경제지표) 또는 소진공 정책자금 공고 RSS 연결, 플러그인 패널에서 실데이터 조회 버튼 동작 | "외부 데이터 실연동" 증거, 3.5 API 출처/제약 실증, 4.4 고도화 기반 가시화 | 중 | 백엔드 실연동 | 3.3, 3.5, 4.4 |
| **5** | **Pretendard 폰트 로컬 번들** — CDN 의존성 제거, 현장 오프라인 구동 완전 보장 | 발표 안정성, 실격 리스크 제거 | 하 | 정적 강화 | (운영 리스크) |
| **6** | **에이전트 헬스 실시간 펄스** — `setInterval`로 에이전트 heartbeat 카운터 갱신 + 큐 수 미세 변동 시뮬레이션, "살아있는 운영 콘솔" 시각적 효과 강화 | 발표 현장 몰입도, 심사위원이 "정말 실행 중"으로 느끼게 | 하 | 정적 강화 | 4.2 (인식) |
| **7** | **RAG 기반 정책금융 매칭** — `policy-sema` 플러그인 샘플 데이터를 실제 소진공 공고 기반 JSON DB로 교체, 케이스 자금 수요와 매칭 점수 실계산 | 3.3 기술 구체성, 5.4 PoC 설득력 | 중 | 백엔드 실연동 | 3.3, 5.4 |
| **8** | **발표용 데모 모드 보강** — `?demo=sme` 진입 시 "데모 코치마크" 각 단계 버튼에 키보드 단축키(→ 키) 연결, 발표자 한손 조작 가능하도록 | 발표 사고 방지, 시연 흐름 매끄럽게 | 하 | 정적 강화 | (운영) |

---

## 5. 총평 요약

**실동작 비중:** 전체 기능 중 상태 변화를 수반하는 진짜 상호작용은 약 **70%** (케이스 CRUD, AgentRun 생성·진행·종료 사이클, 전세 진단 수식 계산, 감사 해시 검증, 승인/반려 등). 나머지 30%는 하드코딩 표시값(에이전트 상태, 비용·토큰 통계) 또는 미구현 플러그인 실호출이다.

**오프라인 구동:** Pretendard 폰트 CDN 1개만 제거하면 완전 오프라인 가능. LLM·외부 API 호출 코드 없음.

**본선 고도화 top 3:**
1. **실 LLM 연동 AgentRun** — 심사 4.2 결정적 차별화, 가장 임팩트 크지만 난이도 상
2. **히어로 SME 골든 패스 자동화** — 발표 5분 안에 완주 보장, 난이도 하·즉시 실행 가능
3. **나머지 케이스 산출물 추가** — 전세/피싱 케이스 빈 영역 해소, 난이도 하·1~2시간 작업
