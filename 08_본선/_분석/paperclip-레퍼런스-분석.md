---
tags:
  - area/general
  - status/draft
date: 2026-06-26
up: "[[08_본선/_MOC/_system_tools_MOC|system_tools_MOC]]"
---

> **[대외비]** 6/29 공식 발표 전 비공개. 대회 출처·팀명·서비스명 외부 검색 노출 금지.

# Paperclip 레퍼런스 분석 — JB LocalGuard OS 본선 적용 기준

> 작성: 2026-06-26 | 목적: 본선 개발에서 paperclip이 증명한 디자인·라우터·데이터·에이전트 운영 패턴을 JB LocalGuard OS에 번역·적용
> 입력: `/Users/river/Downloads/images/paperclip-capture/` 캡처 10장 + `/workspace/hagent-os/.../paperclip/` 분석 7개 파일

---

## 1. 화면별 관찰 (캡처 인용 → 패턴 추출)

### 1-A. CEO 에이전트 대시보드 (`CEO-에이전트-대시보드`)
- 에이전트 상세 화면이 "대화창"이 아니다. 에이전트 카드 상단에 **Latest Run** 블록(run ID·경과 시간·succeeded 배지)이 바로 노출된다.
- 그 아래 **Run Activity / Issues by Priority / Issues by Status / Success Rate** 4개 미니 바차트가 한 행으로 배치. 운영자가 "지금 이 에이전트가 건강한가"를 30초 안에 판단한다.
- 하단 **Recent Issues** 리스트: 티켓 ID·제목·배지(`done`)만 3열로 표시. 클릭하면 이슈 상세로 이동.
- 패턴 추출: 에이전트 상세 = **상태 + 지표 + 최근 연결 작업** 3단 구조. 채팅 로그가 첫 화면이 아니다.

### 1-B. 이슈 보드 — 상태별 목록 (`이슈-보드-상태별-목록`)
- 컬럼: `IN PROGRESS` / `TODO` / `BLOCKED` 3개. 상태 레이블 좌측에 카운트, 우측에 `+`(즉시 추가).
- 각 행: 티켓 ID + 제목 + 담당자 아바타 + 상태 칩(Live/Assignee) + 날짜. 여백이 좁고 밀도가 높다.
- 리스트 뷰와 보드 뷰 전환 버튼이 우측 상단 아이콘 2개로 토글.
- 패턴 추출: **1화면 = 전체 이슈 상태 파악** — 필터·정렬·그룹을 한 행에 묶어 스캔 비용 최소화.

### 1-C. 이슈 상세 + 라이브런 (`이슈-상세-라이브런-화면`)
- 좌측 2/3: 이슈 제목·본문·첨부·댓글·서브이슈·활동 탭.
- 우측 1/3 고정 Properties 패널: Status / Priority / Labels / Assignee / Project / Created / Updated.
- 본문 하단에 **Live Issue Runs** 블록: run ID·상태 칩(`running`)·Stop·Open run 버튼. 실행 transcript가 인라인으로 스트리밍.
- 패턴 추출: 이슈 = **작업 컨텍스트 + 에이전트 실행 + 사람 속성** 세 영역이 한 화면에 공존. 상세 → 실행이 별도 탭이 아니라 인라인.

### 1-D. 조직도 에이전트 구성 보드 (`조직도-에이전트-구성-보드`)
- 전체 캔버스에 트리: CEO → CTO·CMO → ClaudeCoder·CodexCoder. 각 카드: 역할명·직함·사용 모델(Claude/Codex)·상태 점(노란=실행 중, 회색=대기).
- 줌 컨트롤(+/−/Fit) 우측 상단.
- 패턴 추출: 조직도는 **"어떤 에이전트가 어떤 에이전트 아래 있는가"를 위상적으로** 보여주며, 에이전트 상태를 색상 점 하나로 압축.

### 1-E. Inbox / 작업 리스트 (`Inbox-또는-작업-리스트-화면`)
- Mine / Recent / Unread / All 탭. 현재 "Mine" 뷰.
- 행마다 Status 점 + 티켓 ID + Live 칩 + 제목. 컬럼 가시성 설정 드롭다운(Status·ID·Assignee·Project·Tags·Last updated 체크박스).
- 패턴 추출: Inbox = **내게 할당된 것만 필터링 + 컬럼 커스터마이즈**. 이슈 보드와 같은 데이터이지만 관점이 "나" 중심.

### 1-F. 에이전트 성과 대시보드 (`에이전트-성과-대시보드-1`, `-2`, `-3`)
- Dashboard 메인: **AGENTS 섹션** 맨 위에 에이전트 라이브 카드(현재 실행 중 이슈·사용 스킬·STDOUT 스트림).
- 4개 KPI 카운터: Agents Enabled / Tasks In Progress / Month Spend($0.00) / Pending Approvals.
- Recent Activity + Recent Tasks 두 열이 하단 나란히.
- 에이전트 개별 화면: Dashboard / Instructions / Skills / Configuration / Runs / Budget 탭 6개.
  - **Runs 탭**: run ID·상태·timestamp·"Assignment" 레이블. 클릭하면 전체 transcript.
  - **Costs 탭 하단**: Input tokens / Output tokens / Cached tokens / Total cost 4열.
- 패턴 추출: 에이전트 = **운영 개체(직원)**. 예산·실행·성과·지시·스킬이 탭으로 분리되어 운영자가 감사·수정·재배치할 수 있다.

### 1-G. Activity 로그 (`문서-상세-리더-화면`의 ACTIVITY 페이지)
- 단일 피드: 에이전트명 + 동사(checked out / commented on / changed status) + 오브젝트 ID + 제목 + 경과 시간.
- 우측 상단 "All types" 드롭다운으로 이벤트 유형 필터.
- 패턴 추출: Activity = **시계열 감사 피드**. 사람 행동과 에이전트 행동이 같은 피드에 섞임.

### 1-H. 이슈 상세 — 라이브런 인라인 스트리밍 (`Inbox-새-이슈-상세-라이브런`)
- 본문 아래 "LIVE RUNS" 블록. run ID + `running` 칩 + 타임스탬프.
- Step별 번호가 붙은 내러티브 스트림: `close it (PATCH status to done) if...`, `GET /api/agents/me/inbox-lite`, `GET /api/companies/{companyId}/issues?assignedAgentId=...`.
- 에이전트가 실제 API 호출 경로를 텍스트로 노출. 운영자가 "지금 무엇을 하고 있는가"를 볼 수 있다.
- 패턴 추출: 라이브런 = **실행 과정의 투명한 노출**, 결과만이 아니라 중간 단계도 스트리밍.

### 1-I. 보드 뷰 멀티컬럼 (`보드-뷰-멀티컬럼-화면`)
- 컬럼: BACKLOG(4) / TODO(0) / IN PROGRESS(2) / IN REVIEW(0) / BLOCKED.
- 카드: ID + 제목 + 담당자 아이콘. 드래그 예상 영역. 컬럼 헤더에 카운트.
- 에이전트가 "2 live" 상태인 동안 IN PROGRESS 컬럼에 카드가 실시간으로 이동.
- 패턴 추출: 보드 = **상태 이동 시각화**. 사람도 에이전트도 같은 칸반 위에서 이동.

### 1-J. Instance Settings (`회사-설정-AI-정책-화면`)
- General / Heartbeats / Experimental / Plugins 탭.
- General: "Censor username in logs" / "Keyboard shortcuts" 토글 + "AI feedback sharing(Always allow / Don't allow)" 선택.
- 패턴 추출: 설정 = **운영자 레벨 인스턴스 정책**. 보안(로그 마스킹), 피드백 공유, 플러그인이 같은 탭 체계.

---

## 2. 4개 축별 우리가 채택할 구체 권고

### 2-A. 디자인 시스템

#### paperclip이 증명한 것
| 요소 | 관찰 |
|------|------|
| **레이아웃** | 왼쪽 좁은 사이드바(org rail + 내비) + 중앙 메인 워크벤치 + 우측 고정 속성 패널(1/4폭) 3열 구조 |
| **타이포·밀도** | 다크 배경, 14px 기본체, 행간 간결, 여백 최소. "운영 콘솔" 밀도. 카드 패딩 12–16px |
| **색 시스템** | 다크 기반 + 상태별 색(노란=running, 초록=done, 빨간=blocked, 회색=idle). 배지·칩으로 압축 |
| **컴포넌트** | 보드(멀티컬럼 칸반) / 리스트 뷰(행 밀도 높음) / 이슈 상세(좌 본문 + 우 속성패널) / 에이전트 카드 / run 스트리밍 블록 / KPI 카운터 4셀 / 미니 바차트 |
| **정보 위계** | 티켓 ID(작게·회색) → 제목(굵게·흰색) → 상태칩·날짜(소·오른쪽). 위계가 일관 |

#### 현 MVP 대비 버릴 것
- 배경 밝은 흰색 + 큰 여백 → 다크 배경·밀도 높은 레이아웃으로 전환
- 단일 메인 컬럼만 있는 레이아웃 → 우측 속성 패널(토글 가능) 추가
- 타이포·간격 불일치 → 8px 그리드 기반 통일

#### 새로 할 것
1. **3열 쉘 고정**: `org-rail(48px) + sidebar(220px) + workbench(flex) + properties-panel(280px, 토글)`. 이미 index.html에 골격은 있으나 속성 패널 완성도 낮음 → 이슈 상세·케이스 상세에 고정 패널 구현.
2. **KPI 카운터 4셀**: 대시보드 상단에 "활성 에이전트 수 / 진행 중 케이스 / 이번 달 처리 비용(또는 토큰) / 승인 대기 건수" 고정 배치.
3. **상태 칩 시스템 통일**: `running(노란)·pending(보라)·done(초록)·blocked(빨간)·idle(회색)` 5종 칩을 전 화면에 일관 적용.
4. **미니 바차트**: 에이전트 상세 탭에 최근 14일 실행 활동·이슈 우선순위 분포 차트.
5. **리스트 ↔ 보드 뷰 토글**: 케이스 보드에 이미 있으나 컬럼 구성(Backlog/Todo/In Progress/In Review/Blocked)을 paperclip과 동일하게 5단으로 표준화.

### 2-B. 라우터/내비게이션 모델

#### paperclip이 증명한 것
- URL 구조: `/dashboard` → `/issues` → `/issues/{id}` → `/agents/{id}` → `/agents/{id}/runs/{runId}` — 오브젝트 중심 깊이 3단.
- 뷰 전환은 사이드바 클릭(목록) → 행 클릭(상세) → 라이브런 링크(실행 세부)의 3단 드릴다운.
- 상세 화면은 전체 페이지 교체가 아니라 메인 패널 교체 + 속성 패널 업데이트.
- 보드↔리스트는 같은 URL, 토글 버튼으로 뷰만 교체.
- 에이전트·이슈·조직도·활동·설정이 모두 독립된 최상위 라우트로 존재.

#### 현 MVP 대비 버릴 것
- 전체 `activeView` 단순 문자열 스위치 → 오브젝트 ID를 포함한 url-hash 라우팅(`#/cases/JBG-104`)으로 전환
- 속성 패널이 케이스 클릭 시 암묵적으로 바뀌는 구조 → 명시적 `openDetail(type, id)` API

#### 새로 할 것
1. **3단 드릴다운 고정**: `목록(board/list) → 상세(workbench 교체 + 패널 업데이트) → 실행 상세(라이브런 전체 transcript 페이지)`.
2. **URL hash 라우팅**: `#/dashboard`, `#/cases`, `#/cases/{id}`, `#/agents/{id}`, `#/agents/{id}/runs/{runId}`, `#/approvals`, `#/audit` — 북마크·공유·뒤로가기 지원.
3. **보드↔리스트 토글 유지 + In Review 컬럼 추가**: 현재 `Approval Pending` 상태를 별도 컬럼으로 시각화(paperclip의 `IN REVIEW` 컬럼에 대응).
4. **에이전트 상세 탭 라우팅**: `#/agents/{id}` → 기본 Dashboard 탭. 탭 클릭 시 `#/agents/{id}/skills`, `/runs`, `/budget` 등.

### 2-C. 데이터 저장 방식

#### paperclip이 증명한 것
| 엔티티 | 설명 |
|--------|------|
| **Issue** | 티켓 ID, 제목, 상태(Backlog/Todo/InProgress/InReview/Blocked/Done), 우선순위, 레이블, 담당자, 프로젝트, 생성/수정 시각 |
| **Goal** | 목표 계층 — Issue들을 하나의 목표 아래 묶음 |
| **Agent** | 역할, 모델, 스킬 목록, heartbeat 상태, run 히스토리, 토큰 비용 |
| **Run** | run ID, 시작 시각, 상태, transcript 스트림, 연결 이슈 |
| **Approval** | 승인 대상(run/이슈), 요청자(에이전트), 검토자(사람), 결과, 시각 |
| **Activity** | 시계열 이벤트: 에이전트 체크아웃·상태 변경·코멘트·Board 조작 |
| **Skill** | slug, 설명, 타입(instruction package), 적용 에이전트 목록 |
| **Cost event** | run당 입력/출력/캐시 토큰, 달러 비용 |

- 핵심 설계: **오브젝트가 대화가 아니라 케이스(Issue)**. 에이전트는 케이스를 체크아웃해서 처리하고 결과를 돌려준다.
- 상태 모델: 케이스 상태 이동이 명확한 FSM(`New→Todo→InProgress→InReview→Done/Blocked`). `X-Paperclip-Run-Id` 헤더로 모든 변경에 audit 연결.

#### 현 MVP 대비 버릴 것
- 케이스 데이터가 JS 리터럴 배열 → 서버 API + 상태 테이블로 승격 필요(본선 목표)
- `audit` 배열이 케이스 안에 내장 → 독립 `AuditEvent` 엔티티로 분리
- `stage`·`status`·`approvalStatus` 등 유사 필드 난립 → `status` FSM 단일화

#### 새로 할 것 (본선 데이터 모델)
1. **Case 엔티티 확장**:
   ```
   Case { id, title, type(sme/jeonse/phishing), status(FSM 5단), priority,
          riskScore, affiliateId, assignedAgentId, skills[], evidence[],
          auditEvents[], approvalId, createdAt, updatedAt }
   ```
2. **AgentRun 엔티티 독립**:
   ```
   AgentRun { runId, caseId, agentId, status, startedAt, endedAt,
              transcript[], inputTokens, outputTokens, cachedTokens, costUsd }
   ```
3. **Approval 엔티티**:
   ```
   Approval { id, runId, caseId, level(L0-L4), requestedBy(agentId),
              reviewedBy(humanId), decision(pending/approved/rejected),
              draftAction, createdAt, decidedAt }
   ```
4. **AuditEvent 엔티티**:
   ```
   AuditEvent { id, caseId, runId, actorType(agent/human/system),
                actorId, verb, objectType, objectId, timestamp, evidence }
   ```
5. **Skill 레지스트리**: 현재 정적 배열 → `Skill { slug, type, purpose, approvalRequired, riskLevel, agentIds[] }` DB 테이블.
6. **상태 FSM 공식화**: `New → InProgress → InReview(Approval Pending) → Done | Blocked`. 이슈 상세·보드·감사원장이 같은 FSM을 참조.

### 2-D. 에이전트 운영 방식

#### paperclip이 증명한 것
| 화면/개념 | 운영 패턴 |
|-----------|-----------|
| **라이브런** | 에이전트 실행이 이슈 상세에 인라인 스트리밍. 운영자가 중간 과정을 실시간 감시. Stop 버튼으로 즉시 중단. |
| **조직도** | 에이전트 위계를 트리로 시각화. 클릭하면 에이전트 상세로 이동. 상태 점으로 live/idle 구분. |
| **성과 대시보드** | 에이전트별 최근 14일 Run Activity·Issues by Priority·Issues by Status·Success Rate 바차트. |
| **프롬프트/Instructions 탭** | 에이전트 상세에 Instructions 탭: 시스템 프롬프트를 UI에서 직접 편집·저장. 재배포 없이 프롬프트 조정. |
| **Skills 탭** | 에이전트에 장착된 스킬 목록 + 활성/비활성 토글. 스킬을 착탈식으로 운영. |
| **Heartbeat** | 에이전트가 주기적으로 inbox를 확인하는 사이클. 로그에서 "No assignments, no mentions, no approvals. Nothing actionable. Exiting heartbeat." 패턴. |
| **Approval flow** | 에이전트가 `pending_approval` 상태로 이슈를 올리면 인간 운영자가 Inbox에서 승인/반려. 승인 후 에이전트가 다음 단계 실행. |
| **Budget 탭** | 에이전트별 토큰·비용 누적. 월간 spend 모니터링. |

#### 현 MVP 대비 버릴 것
- 에이전트 운영이 사이드바 목록 클릭으로만 노출, 실행 상태 시각화 없음
- 라이브런이 별도 패널에 숨겨진 텍스트 → 이슈 상세 인라인 스트리밍으로 이동
- 에이전트 조직도 없음 → 트리 뷰 추가 필요

#### 새로 할 것
1. **에이전트 상세 6탭 구현**: Dashboard / Instructions / Skills / Configuration / Runs / Budget. 현재 에이전트 목록만 있고 상세 없음.
2. **라이브런 인라인**: 케이스 상세 화면 하단에 `LIVE RUNS` 블록. run ID + 상태 칩 + Stop 버튼 + transcript 스트리밍 영역. Open run → 전체 화면 transcript.
3. **에이전트 조직도 뷰**: `#/org` 라우트. 트리 캔버스(paperclip ORG CHART와 동일). 카드: 에이전트 표시명·역할·모델·상태 점.
4. **Heartbeat 로그 노출**: 에이전트 상세 Runs 탭에 heartbeat 이벤트 포함. "마지막 heartbeat: 38초 전" 을 사이드바 푸터에도 표시(현재 시스템 헬스와 연동).
5. **승인 플로우 시각화**: Inbox 화면을 "승인 대기" 케이스 + 라이브런 축약 표시로 재설계. 승인/반려 버튼이 인라인으로.
6. **Instructions 편집**: 에이전트 상세 Instructions 탭에서 시스템 프롬프트 textarea + 저장 버튼. 본선에서 실제 에이전트 프롬프트 조정 데모 가능.
7. **Activity 피드**: `#/activity` 라우트에 paperclip Activity 화면과 동일한 시계열 감사 피드. 에이전트·사람·시스템 이벤트 혼합.

---

## 3. JB LocalGuard OS 화면 맵 — paperclip 대응 번역

| 우리 화면 | paperclip 대응 | 번역 내용 |
|-----------|---------------|-----------|
| **대시보드** (`#/dashboard`) | Dashboard | KPI 4셀(활성 에이전트/진행 케이스/이번 달 처리/승인 대기) + 에이전트 라이브 카드 + Recent Activity + Recent Cases |
| **케이스 보드** (`#/cases`) | Issues (보드/리스트) | 5컬럼 칸반(New/진행/검토(Approval Pending)/완료/차단) + 리스트 뷰 토글. 필터: 계열사·케이스 유형·에이전트 |
| **케이스 상세** (`#/cases/{id}`) | Issue Detail | 좌: 케이스 본문·위험신호·에이전트 실행 근거·코멘트. 우: 속성 패널(상태·우선순위·담당 에이전트·계열사·riskScore·승인 레벨). 하단: 라이브런 인라인 |
| **승인** (`#/approvals`) | Approvals | 승인 대기 목록 + 조치 초안 + 승인/반려 인라인 버튼. 레벨(L1-L4) 컬럼 필터 |
| **에이전트 목록** (`#/agents`) | Agents | 14종 에이전트 카드 그리드. 상태 칩(running/idle/paused). 클릭 → 상세 |
| **에이전트 상세** (`#/agents/{id}`) | AgentDetail | 6탭: Dashboard·Instructions·Skills·Configuration·Runs·Budget. Run 탭에 heartbeat 포함 |
| **에이전트 조직도** (`#/org`) | Org Chart | 트리 캔버스: Orchestrator → (Pain Radar / Cashflow Triage / Policy Match / ...) → Fraud Shield / Compliance Guard. 상태 점 |
| **감사 원장** (`#/audit`) | Activity | 시계열 피드. 에이전트 판단·사람 승인·시스템 이벤트 혼합. 유형 필터(케이스 변경/승인/실행/스킬 호출) |
| **스킬 레지스트리** (`#/skills`) | CompanySkills | 스킬 카드 그리드(slug·목적·승인 레벨·위험도). 클릭 → 스킬 상세(적용 에이전트·히스토리) |
| **받은편지함** (`#/inbox`) | Inbox | Mine/Recent/Unread/All 탭. 내게 할당된 승인 대기·긴급 케이스 집중 |
| **설정** (`#/settings`) | Instance Settings | 일반(로그 마스킹·AI 피드백 정책) + Heartbeat 주기 + 플러그인 |

### 화면 간 이동 흐름 (paperclip 보드↔상세↔라이브런 대응)
```
대시보드
  └─ 케이스 클릭 → 케이스 상세 (중앙 패널 교체 + 우 속성패널)
       └─ 라이브런 클릭 → 라이브런 전체 transcript (#/cases/{id}/runs/{runId})
  └─ 에이전트 카드 클릭 → 에이전트 상세 탭
       └─ Runs 탭 → 개별 run transcript

승인 inbox → 케이스 상세 → 승인/반려 → Activity 피드 업데이트
```

---

## 4. 현 MVP 대비 가장 큰 변화 3가지 요약

### 변화 1. 에이전트를 "운영 개체"로 완성 (가장 큰 갭)
현 MVP에서 에이전트는 사이드바 목록 항목에 불과하다. 에이전트 상세 화면(6탭), 라이브런 인라인 스트리밍, heartbeat 로그, 토큰 비용 추적이 없다. paperclip은 에이전트를 "직원"처럼 다룬다 — Instructions(프롬프트)·Skills(능력)·Runs(이력)·Budget(비용)·Dashboard(성과)를 한 화면에서 관리·감사·수정한다. 본선에서 이 6탭 에이전트 상세가 "AI Agent 운영 콘솔"임을 심사위원에게 보여주는 핵심 증거가 된다.

### 변화 2. 라이브런 = 실행 투명성의 시각화 진입점
현재 에이전트 실행은 케이스 상세의 숨겨진 텍스트 블록이다. paperclip의 라이브런은 이슈 상세에 인라인으로 스트리밍되며, 에이전트가 어떤 API를 호출하고 어떤 판단을 했는지가 Step 단위로 실시간 노출된다. 이것이 "판단 근거 100% Evidence 연결"(KPI) 요건을 UI로 증명하는 방법이다. 라이브런 블록을 케이스 상세 하단에 인라인으로, Stop 버튼과 함께 배치하는 것이 두 번째 핵심 변화다.

### 변화 3. 승인 플로우가 단순 모달이 아니라 운영 루프로
현재 MVP의 승인은 버튼 클릭 → 상태 변경의 단순 플로우다. paperclip의 승인은 에이전트가 `IN REVIEW` 상태로 이슈를 올리고, 운영자 Inbox에 나타나며, 조치 초안을 검토한 뒤 승인/반려가 에이전트 다음 단계 실행을 트리거하는 연속 루프다. JB LocalGuard OS의 L1-L4 승인 레벨 매트릭스를 이 운영 루프로 구현하면 "고객 대상 행동은 승인 전 차단"(Canon §8)을 UI로 증명할 수 있다.

---

## 5. 4개 축별 핵심 권고 1줄 요약

| 축 | 권고 |
|----|------|
| **디자인** | 다크 3열 쉘(org-rail + sidebar + workbench + 우측 속성패널)·8px 그리드·5종 상태칩 시스템을 전 화면에 일관 적용한다 |
| **라우터** | 오브젝트 중심 URL hash 3단 드릴다운(`목록→상세→라이브런`)으로 현재 activeView 스위치를 교체하고, 보드/리스트 토글·5컬럼 칸반을 표준화한다 |
| **데이터** | Case/AgentRun/Approval/AuditEvent 4 엔티티를 독립 테이블로 분리하고 FSM 5단 상태 모델을 단일화한다 |
| **에이전트 운영** | 에이전트 상세 6탭(Dashboard·Instructions·Skills·Runs·Budget·Configuration) + 케이스 상세 인라인 라이브런 스트리밍을 본선 핵심 UI로 구현한다 |
