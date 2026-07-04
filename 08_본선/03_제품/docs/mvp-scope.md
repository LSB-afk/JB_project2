---
tags:
  - area/product
  - type/spec
  - status/active
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases: [MVP Scope, 본선 MVP 점검]
---

# MVP Scope — 본선 최소 기능 범위

> **갱신 노트(2026-07-04)**: 이전 버전은 예선 씨앗 아이디어(URL hash 3단 드릴다운, 에이전트 상세 6탭) 단계의 미채움 스텁이었다. 본선은 그 사이 역할축 4콘솔(JB_project2) 프로토타입으로 구체화됐다 — 이 문서는 **현재 확정된 MVP 범위**로 채운다.
>
> SSOT: [[08_본선/03_제품/01_prd/prd|PRD]], [[08_본선/03_제품/08_feature-spec|Feature Spec]], [[08_본선/03_제품/validation-report|validation-report]](6/데모 준비도), [[08_본선/03_제품/harness.yaml|harness.yaml]](open_decisions). 신뢰마커: **[확정]**=코드 직접확인, **[조건부/7-4]**=7/4 팀 결정 대기, **[분기/미확정]**=팀 범위 밖(별도 트랙).

---

## MVP 정의 원칙

> 본선 시연(예선 5분 / 결선 15분) 안에 심사위원에게 "판단→근거→승인→감사가 실제로 동작한다"를 가장 짧은 경로로 보이는 최소 기능 집합.

---

## MVP 범위 — 2단 구성

### 1. 실 LLM 슬라이스 — CCL-0001, PR#1 [확정 코드 / 조건부 라이브]

- **범위**: 히어로 케이스 **CCL-0001**(전주 카페 운전자금, corporate-credit 콘솔)의 `ccl-financial`(재무자료 요약) 슬라이스. 코드는 완성됐고(`llmClient.js` 폴백 self-check 통과), **데모 PC에서 Ollama(로컬모델) 기동 시 실제 LLM 추론이 라이브로 동작**한다.
- **현재 상태**: 🟡 코드 완성·PR#1, 이 개발 환경에는 Ollama/API 키가 없어 라이브 경로(`?live=1`) 미실행 — 폴백 경로로만 검증됨([[08_본선/03_제품/validation-report|validation-report]] §3·§6). 리허설·초단위 타이밍은 미실측.
- **폴백**: LLM 미연결 시 결정형 골든패스로 자동 전환되어 데모가 끊기지 않는다([[08_본선/03_제품/08_feature-spec|08_feature-spec]] F-2.1.1 Edge case (a)).

### 2. 목업 골든패스 — 4콘솔 [확정 코드, 결정형]

`_vendor/JB_project2`의 4개 역할축 콘솔이 동일 운영계약(`Case→AgentRun→Agent→Skill→Evidence→Approval→Audit`) 위에서 각각 결정형 골든패스로 즉시 시연 가능하다([[08_본선/03_제품/validation-report|validation-report]] §6 "목업 골든패스(CCL-0001): 즉시 시연 가능").

| 콘솔 | 계열사 | 상태 | 데모 등급 |
|---|---|---|---|
| 기업여신(CCL) | 전북은행 | 히어로, 실 LLM 슬라이스 포함 | 🟢 목업 즉시 + 🟡 라이브 조건부 |
| FDS/피싱(FDR) | 전북은행 | 보조 데모 후보 | 🔴 [조건부/7-4] — §3 참조 |
| 전세보호(JPO) | 전북은행 전용, v3(11 에이전트) | 보조 데모 후보 | 🔴 [조건부/7-4] — §3 참조 |
| JB우리캐피탈(JBWC) | JB우리캐피탈 | 확장성 증거(다도메인) | 🟢 목업 골든패스 |

---

## 3. 미결 — 데모케이스② [조건부/7-4]

두 번째 실연 케이스를 **전세보호(JPO) vs FDS/피싱(FDR)** 중 무엇으로 할지 팀 결정이 아직 나지 않았다([[08_본선/03_제품/harness.yaml|harness.yaml]] `open_decisions`, [[08_본선/03_제품/validation-report|validation-report]] §5.3). PRD 성공지표(§6 "골든 케이스 통과율")는 잠정적으로 히어로(CCL-0001) + 전세(`JEONSE-0001`) + 피싱(`FDSC-0001`) **3건 모두**를 가정하지만, 이는 데모 시간(예선 5분)을 감안하면 과도할 수 있어 실제로는 **1건만 선택**될 가능성이 있다 — 이 문서와 PRD 사이의 수치 차이는 [미검증], 7/4 팀 결정으로 해소한다.

관련 미결(같은 팀 결정 묶음): MCP 채택 여부, 담당자 설정(config) 허용 범위, 승인 직군 2(RM·준법) 유지 vs 확대.

---

## MVP 제외 기능

- 실제 코어뱅킹/외부 계열사 시스템 프로덕션 연동(mock 커넥터·시뮬레이션만, PRD §5 Non-Goals).
- 서버 승격(함수 계약 → API) — 본선 이후 트랙([[08_본선/03_제품/07_architecture|07_architecture]] §12).
- **CaseOps 확장**(메모리거버넌스·119·CaseOps엔진) — 팀 미확정, 이 MVP 범위와 별도 트랙 [분기/미확정].
- 신용평가·대출 승인·금리/한도 확정 등 AI 확정 판단 전부(PRD §5).

---

## 시연 시나리오

> [[07_발표-제출/demo-script|demo-script]] 참조(분단위 스크립트는 데모케이스② 확정 후 완성 — §3).

---

## 참조

- [[08_본선/03_제품/01_prd/prd|PRD]]
- [[08_본선/03_제품/08_feature-spec|Feature Spec]]
- [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]]
- [[08_본선/03_제품/validation-report|validation-report]]
- [[08_본선/03_제품/harness.yaml|harness.yaml]]
