---
tags:
  - area/product
  - type/reference
  - status/active
date: 2026-07-03
up: "[[INDEX|제품 인덱스]]"
aliases: [스킬 명세, skillRack 명세, 내부 스킬 카탈로그]
---

# 스킬 명세

> `02_제품/app/app.js`의 `skillRack`(실제 구현, 25종)을 정본으로 삼아 담당 에이전트·입력·출력·도구/데이터소스·PII 등급을 명세한다. **데모의 내부 스킬 = 우리 차별점**(범용 RAG/챗봇이 아니라 금융 도메인 판단 단위로 스킬을 쪼갠 것). 근거: `_vendor/harness-engineering-skills/skills/agent-loop/SKILL.md`, `08_본선/03_제품/00_결정-준비/설계/skills-스킬·플러그인·외부 플러그인·데이터 구상.md`, `02_제품/app/app.js`(`skillRack`).
>
> **입력/출력/도구 열은 우리 설계안**(SSOT 수치 인용이 아니라 팀이 만드는 스킬 계약)이며, `approval`/`risk` 열은 app.js `skillRack` 배열 값을 그대로 인용한 사실이다. PII 등급은 데이터 등급제(public/internal/confidential/restricted, §3 참고) 기준 제안값이며 최종 확정은 [미결/7-4].

---

## 1. 스킬 설계 원칙

- 각 에이전트는 스킬(Tool)을 장착해 특정 기능을 수행한다. 스킬은 독립적이고 재사용 가능해야 하며, company(콘솔) 단위로 장착·버전관리된다(paperclip `companySkills`/`SKILL.md` 패턴).
- 스킬 실행은 `AgentRun`의 판단/행동초안/검증 단계 중 하나에 속하며([[08_본선/03_제품/02_agent-design/orchestrator|오케스트레이터]] §3), 모든 실행은 Audit 이벤트로 기록된다.
- `agent-loop` SKILL.md의 품질 게이트를 그대로 채택한다: **검증 없는 생성은 미완성**, **사람 승인 없는 고위험 행동은 차단**.

---

## 2. 스킬 카탈로그 (25종, `skillRack` 정본)

> 담당 에이전트는 [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]]의 `skills` 배열과 대조. `approval`/`risk`는 app.js 값 그대로.

| 스킬 ID(slug) | 유형 | 담당 에이전트 | 입력(설계안) | 도구/데이터소스(설계안) | 출력(설계안) | approval(app.js) | risk(app.js) | PII 등급(제안) |
|---|---|---|---|---|---|---|---|---|
| `case-os-core` | orchestration | 운영 조율 에이전트, 전세위험 관리 리드 | Case 상태 변경 요청 | 내부 Case DB | 상태 전이 이벤트, 담당 에이전트 배정 | internal only | low | internal |
| `evidence-harvest` | research | 위험신호 조기감지 에이전트 | 뉴스/공시/상담메모 스트림 | `news-local`, 내부 상담 이력(jb-db) | 위험 근거 후보 목록 | internal only | low | internal |
| `source-ranker` | research | 위험신호 조기감지 에이전트 | evidence-harvest 출력 | 내부 점수화 규칙 | 공식성·최신성·관련성 점수 | internal only | low | internal |
| `pain-classifier` | reasoning | 위험신호 조기감지 에이전트 | 순위화된 근거 | 내부 분류 모델(로컬) | 상환/금리/사기/정책금융/디지털장벽 분류 | internal only | low | internal |
| `cashflow-stress` | finance | 상환위험 분류 에이전트 | 매출·거래 이력(집계) | jb-db, ECOS API(금리) | 상환 압박 지표 | RM review | medium | confidential |
| `rate-relief` | finance | 상환위험 분류 에이전트 | 대출 조건 + 금리지표 | ECOS API | 대환 검토 필요성 판정 | RM review | medium | internal |
| `policy-match` | finance | 정책금융 매칭 에이전트 | 비식별 고객 프로필 + 위험 밴드 | `policy-sema`, `policy-assembly` | 정책자금/대환/보증 후보 목록 | RM review | medium | internal |
| `document-checklist` | operations | 정책금융 매칭 에이전트, 상담 준비 | 케이스 유형 | 내부 규칙(체크리스트 템플릿) | 필요 서류·확인 질문 목록 | RM review | low | internal |
| `fraud-shield` | risk | 이상거래 탐지·차단 에이전트 | 거래/콜백/URL 로그 | 내부 FDS, 금융위 보이스피싱 경보(public) | 사기 위험 플래그 + 차단 필요 여부 | blocks external action | high | confidential |
| `do-not-contact-rule` | risk | 이상거래 탐지·차단 에이전트 | fraud-shield 출력 | 내부 룰엔진 | 고객 접촉 금지 플래그(mandatory) | mandatory | high | confidential |
| `notification-brief` | communication | RM 보좌 에이전트, 은행 연계 에이전트 | 승인된 판단 + 고객 메모 | Claude/OpenAI API(비식별 초안) 또는 로컬모델 | RM 메모, 콜백 스크립트 초안 | approval required | medium | confidential |
| `compliance-guard` | compliance | 준법 검토 에이전트, 계약 체크리스트 에이전트 | 고객향 초안 텍스트 | `law-moleg`(법령 RAG), 내부 반출 스캔 | 금지표현/개인정보/준법 리스크 플래그 | mandatory | high | restricted-scan |
| `approval-gate` | control | 운영 조율 에이전트, 전세위험 관리 리드 | AgentRun 결과 + 승인 레벨 | 내부 승인 큐 | 승인 요청 이벤트(`approval.requested`) | mandatory | high | internal |
| `audit-ledger` | control | 운영 조율 에이전트, 전세위험 관리 리드 | 모든 이벤트 스트림 | 내부 해시체인(`auditChainRecords`) | 감사 레코드(근거·검토·행동·승인) | mandatory | low | internal |
| `portfolio-signal` | analytics | 포트폴리오 분석 에이전트 | 지점/계열사별 집계 데이터 | jb-db 집계 | 위험 클러스터 요약 | internal only | low | internal |
| `jeonse-price-ratio` | jeonse-risk | 전세위험 관리 리드, 전세가율 분석 에이전트 | 매매 추정가 + 보증금 | 국토부 실거래가·공시가격 API | 전세가율 위험 산정 | RM review | high | confidential |
| `local-market-compare` | jeonse-risk | 전세가율 분석 에이전트 | 대상 매물 + 주변 시세 | 국토부 실거래가, `realestate-redev` | 시세 대비 보증금 과다 여부 | RM review | medium | internal |
| `registry-rights-scan` | legal-risk | 등기 권리 분석 에이전트 | 등기부 조회 결과(원문 미저장) | 인터넷등기소 등기사항증명서 조회 | 근저당/압류/가압류/신탁등기 위험 목록 | human/legal review | high | confidential |
| `ownership-transfer-delta` | legal-risk | 등기 권리 분석 에이전트 | 소유권 이전 이력 | 인터넷등기소 | 단기 이전·매매가 급변·임대인 변경 신호 | human/legal review | high | confidential |
| `guarantee-feasibility` | guarantee | 임차인 손실위험 에이전트, 은행 연계 에이전트 | 선순위 채권 + 보증 한도 | HUG 안심전세 기준 | 보증보험 가입 가능성 분류 | RM review | high | confidential |
| `tenant-asset-exposure` | asset-risk | 임차인 손실위험 에이전트 | 총자산 + 보증금 | jb-db(고객 신고값) | 자산 대비 보증금 노출 비중 | advisor review | medium | confidential |
| `housing-cost-burden` | asset-risk | 임차인 손실위험 에이전트 | 월소득 + 주거비 | jb-db | 소득 대비 주거비 부담률 | advisor review | medium | confidential |
| `pre-contract-checklist` | contract | 계약 체크리스트 에이전트 | 계약 유형(전세/여신) | 내부 규칙 | 계약 전 확인 서류·질문 목록 | approval required | medium | internal |
| `special-clause-drafter` | contract | 계약 체크리스트 에이전트 | 위험 판정 결과 | 로컬모델(법률 문구, PII 미개입) | 근저당말소·보증보험·잔금조건 특약 초안 | legal review | high | internal |
| `bank-linkage-brief` | banking | 은행 연계 에이전트 | 상담 요청 + 승인 결과 | jb-db, 내부 API gateway | 계열사 시스템 연동/상담 연결 초안 | RM approval | medium | confidential |

---

## 3. PII 등급제 (참고, `08_본선/03_제품/00_결정-준비/설계/skills-스킬·플러그인·...md` §5)

`public` / `internal` / `confidential` / `restricted` 4등급. `restricted`(성명·주민번호·계좌·연락처·주소 등 원본 식별정보)는 외부 반출 금지 — 이 등급이 필요한 스킬(`fraud-shield`, `registry-rights-scan` 등)은 내부/온프레 모델로만 라우팅하고, 외부 LLM에는 토큰화·비식별 컨텍스트만 전달한다(신용정보법 §40조의2). `restricted-scan`(compliance-guard)은 원본을 처리하는 것이 아니라 원본이 섞여 있는지 **스캔만** 하는 특수 등급이다.

---

## 4. 정합성 결함 — 보강 대상 (미해결)

`agents` 배열의 `skills` 필드와 표시명 사전에는 있으나 `skillRack` 카탈로그(위 25종)에는 **없는** 5개 스킬이 있다 — MVP 자체의 데이터 정합성 결함이며 문서 문제가 아니다.

| 스킬 | 등장 위치 | 담당 에이전트 | 상태 |
|---|---|---|---|
| `tone-control` | agents 배열 | RM 보좌 에이전트 | [미결/7-4] `skillRack` 편입 or 제거 |
| `trend-summary` | agents 배열 | 포트폴리오 분석 에이전트 | [미결/7-4] |
| `case-metrics` | agents 배열 | 포트폴리오 분석 에이전트 | [미결/7-4] |
| `privacy-redaction` | agents 배열 | 준법 검토 에이전트 | [미결/7-4] |
| `claim-limiter` | agents 배열 | 준법 검토 에이전트 | [미결/7-4] |

담당자·기한 미정 — 앱 구현 담당자 확인 필요(→담당자 확인). 제출 문서에서는 canon 기준 스킬 25를 정본으로 쓴다.

---

## 5. 최소 eval 장치 (스킬 단위)

| 평가축 | 최소 장치 | 통과 기준 |
|---|---|---|
| 승인 안전 | `mandatory`/`approval required` 스킬 실행 후 반드시 `approval.requested` | 100% |
| 근거 연결 | 판단형 스킬(`reasoning`/`finance`/`jeonse-risk`/`legal-risk`) 출력은 Evidence id와 연결 | 100% |
| PII 반출 | `restricted`/`restricted-scan` 등급 스킬의 원본 필드가 외부 LLM 프롬프트에 포함되지 않음 | hard fail 없음 |
| 회사 경계 | 스킬 실행 시 케이스의 계열사 스코프 밖 데이터 접근 없음 | hard fail 없음 |
| 자동종결 금지 | `do-not-contact-rule`/`fraud-shield`가 high/critical 케이스를 자동 종결하지 않음 | hard fail 없음(승보 SECURITY_GUARDRAILS 채택 권고, [[08_본선/03_제품/02_agent-design/orchestrator|오케스트레이터]] §4) |

---

## 참조

- [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]]
- [[08_본선/03_제품/02_agent-design/orchestrator|오케스트레이터]]
- [[08_본선/03_제품/04_tech/rag-rule-engine|RAG·규칙 엔진]]
- [[08_본선/03_제품/00_결정-준비/설계/skills-스킬·플러그인·외부 플러그인·데이터 구상]]
