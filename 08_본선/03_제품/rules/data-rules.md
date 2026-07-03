---
tags: [area/product, type/rule, status/active]
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases: [데이터 규칙, data-rules]
---

# Data Rules — 데이터 취급 규칙

> PII 등급·필드 스키마의 SSOT는 [[08_본선/03_제품/04_tech/data-model|데이터 모델]](`04_tech/` 소유, 이 문서는 인용만 하고 재정의하지 않는다). 규제 근거는 [[08_본선/03_제품/rules/compliance-rules|compliance-rules]] CMP 규칙을 재인용하며 이 문서에서 새 법조문을 만들지 않는다.

---

## 1. 데이터 출처 (Data Source)

| ID | 출처 | 종류 | 상태 |
|---|---|---|---|
| DAT-01 | 코어뱅킹(고객 마스터, `Case.customerId` FK) | 1차(내부) | (TBD) — 연동 미착수, data-model §1 |
| DAT-02 | law.go.kr(법령 원문) | 외부 공개 | 도달성 확인, 인증키 불요 |
| DAT-03 | MOLIT(국토부 실거래가, 전세가율 산정) | 외부 공개 API | 도달성 확인됨, 인증키 발급 (TBD) |
| DAT-04 | ECOS(한국은행 경제통계) | 외부 공개 API | 도달성 확인됨, 인증키 발급 (TBD) |
| DAT-05 | 데모 시드 데이터(`app.js` 초기 `cases`/`evidence`) | 합성(synthetic) | [확정] 전량 합성 — [[08_본선/03_제품/00_vision/principles|principles]] P-006 |

---

## 2. 수집 (Collection)

| ID | 규칙 |
|---|---|
| DAT-06 | 신규 데이터 소스 연동 시 `Evidence.sourceTag`(`public`\|`estimate`\|`simulation`) 중 하나로 반드시 태깅한다 — 태깅 없는 수집은 REJECT |
| DAT-07 | 코어뱅킹 등 1차 원본 연동 전까지, 모든 시연·문서 데이터는 DAT-05(합성)만 사용한다 — 실제 고객 데이터 반입 REJECT |

---

## 3. 법적 근거 (Legal Basis)

데이터 처리 근거는 [[08_본선/03_제품/rules/compliance-rules|compliance-rules]] CMP-01~CMP-04를 그대로 적용한다(신용정보법 §3조의2 특별법 우선, §40조의2 가명처리·분리보관, PIPA §28조의4·5 보충). 이 문서에서 별도 조문을 인용하지 않는다 — 필드별 적용은 §5 PII 등급표 참조.

---

## 4. 동의 (Consent)

| ID | 규칙 | 상태 |
|---|---|---|
| DAT-08 | 코어뱅킹 연동 이전에는 콘솔이 독자적으로 신용정보 조회 동의를 수집하지 않는다 | [[08_본선/03_제품/rules/compliance-rules|compliance-rules]] CMP-18과 동일 원칙 |

---

## 5. 품질 검사 (Quality Checks)

| ID | 규칙 | 근거 |
|---|---|---|
| DAT-09 | 포트폴리오 데이터 품질은 BCBS239 4축(정확성·완전성·적시성·적응성)으로 점검한다 | [[08_본선/03_제품/02_agent-design/agent-roster|agent-roster]] "포트폴리오 분석 에이전트" 검증 경계 행 |
| DAT-10 | 국토부 실거래가 등 외부 공공데이터는 "수기입력 오류 가능성"을 상시 신뢰도 표기와 함께 사용한다 — 값만 쓰고 신뢰도 생략 REJECT | agent-roster "전세가율 분석 에이전트" 검증 경계 행 |
| DAT-11 | thin-file(신용이력 부족)·데이터 지연은 별도 탐지 규칙으로 표시한다 | agent-roster "위험신호 조기감지 에이전트" 검증 경계 행 |

---

## 6. 최신성 (Freshness)

| ID | 규칙 | 상태 |
|---|---|---|
| DAT-12 | `RiskSignal`/`Evidence` 인용 시점(`sourceTag`)과 조회 시점 간 지연이 발생하면 화면에 "최신 기준 담당자 확인 필요"를 표시한다 | `requiredNotices`(`jeonseProtectionRules.js:31`), [[08_본선/03_제품/rules/agent-rules|agent-rules]] AGT-17 |
| DAT-13 | 위험신호 조기감지 에이전트는 상시 스캔(`timer`/`automation` trigger)으로 freshness check를 수행한다 | agent-roster §3 |

---

## 7. 민감 필드 (Sensitive Fields)

[[08_본선/03_제품/04_tech/data-model|데이터 모델]] §0.2 PII 등급 4단계(`restricted`/`confidential`/`internal`/`public`)를 그대로 인용한다:

| 등급 | 예시 필드(data-model §1·§4·§5) | 외부(클라우드 LLM) 전송 규칙 |
|---|---|---|
| `restricted` | `Case.customerName`, `Case.customerId` | **금지** — 토큰화 필수, 로컬 모델만(DAT-14) |
| `confidential` | `Case.exposure`, `AgentRun.command`, `Skill.inputPiiGrade=confidential` | 범위화·비식별 처리 후에만 전송 가능 |
| `internal` | `Case.code`/`riskScore`/`status` | 원문 전송 가능(사내 시스템 간) |
| `public` | `Evidence.piiGrade=public`(시드 8건 전부) | 제한 없음 |

| ID | 규칙 | 강제 |
|---|---|---|
| DAT-14 | `restricted`/`confidential` 필드는 외부 프런티어 LLM payload에 포함되면 REJECT — 로컬 모델(EXAONE 등)만 원본 처리 | `harnessGuardCheckPII()` + `beforeExternalReferenceOpen` 훅(E4, 승보 참조 구현) |
| DAT-15 | 신규 필드 추가 시 반드시 4등급 중 하나를 부여한다 — 등급 미부여 필드는 스키마 리뷰 REJECT | [[08_본선/03_제품/04_tech/data-model|data-model]] §0.2 |

---

## 8. 비식별화 (De-identification)

| ID | 규칙 | 근거 |
|---|---|---|
| DAT-16 | `restricted` 필드는 토큰(예 `TENANT-REF-*`/`CUST-*`)으로 치환하고, 토큰↔원본 키는 분리 보관한다 | CMP-02(신용정보법 §40조의2 ①②⑧) |
| DAT-17 | 재식별 가능 조합(주소+연령대+업종 등 준식별자 조합)이 반출 페이로드에서 탐지되면 즉시 처리 중단·회수·파기 | CMP-03·CMP-14 |
| DAT-18 | 마스킹 데모 센티널(`010-0000-0000` 등)만 데모 원문에 허용하며 단일 목록(`HARNESS_PII_SENTINELS`)으로 관리한다 | `harnessCore.js:66`(E4) |

---

## 9. 접근 제어 (Access Control)

| ID | 규칙 | 강제 |
|---|---|---|
| DAT-19 | 모든 조회(query)는 scope(`roleKey`/`affiliateId`) 필수 — 미지정 호출은 예외를 던진다 | Repository 계약, [[08_본선/03_제품/rules/agent-rules|agent-rules]] AGT-05(E4, `harnessGuardCheckScope`) |
| DAT-20 | 운영 DB 전환 시 scope 계약은 서버 행 수준 보안(Row-Level Security)으로 승격한다 | `SECURITY_GUARDRAILS.md` §2, data-model 승격 로드맵 |
| DAT-21 | 계열사 간 데이터 공동이용은 "식별형 내부경영관리" / "가명분석" / "클린룸" 3옵션 중 하나로만 허용하며, 무제한 공유로 표현하지 않는다 | [[08_본선/03_제품/06_build-roadmap/P3-보안-거버넌스|P3-보안-거버넌스]] §②·§⑥ |

---

## 연결
[[08_본선/03_제품/04_tech/data-model|데이터 모델]] · [[08_본선/03_제품/rules/compliance-rules|Compliance Rules]] · [[08_본선/03_제품/rules/agent-rules|Agent Rules]] · [[08_본선/03_제품/00_vision/principles|Principles]] · [[08_본선/03_제품/00_vision/definitions|Definitions]] · [[08_본선/03_제품/06_build-roadmap/P3-보안-거버넌스|P3-보안-거버넌스]]
