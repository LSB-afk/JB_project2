---
tags:
  - area/product
  - type/risk
  - status/active
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases: [risk-impact-register, 리스크-임팩트-레지스터, Negative-Impacts]
---

# Risk & Impact Register — JB LocalGuard OS

> DDBM(business-model)의 `Negative Impacts`·`Barrier and Risk Linkage`를 추적 가능한 register로 확장한다. 각 리스크는 추상 문장이 아니라 `Owner·Mitigation·Review Gate·Evidence`로 관리하며, 고위험 행동은 사람 승인(L0~L4)이 실행 전 반드시 통과해야 한다.

## 스케일·근거등급 규약
- **Likelihood / Severity**: `낮음(L) · 중간(M) · 높음(H)`. Severity는 발생 시 고객·규제·사업 피해의 크기.
- **근거등급 E0~E5** (Evidence 열에 병기): `E5=1차 공식/법령 · E4=데모로 즉시 시연 가능 · E3=교차검증된 2차 · E2=단일 신뢰소스 · E1=팀 가정 · E0=미검증`. 목표 E2+, 데모 가능 항목은 E4.
- **Status**: `Open(미착수) · Mitigating(대응 설계·구현 중) · Controlled(게이트로 통제됨) · Monitor(운영 중 감시)`.

## Risk & Impact Register

| Risk ID | Source | Risk | Impact | Likelihood | Severity | Mitigation | Owner | Evidence | Status |
|---|---|---|---|---|---|---|---|---|---|
| RISK-PRIVACY-001 | DDBM Key Data / Negative Impacts · D25 · D5a | 원본 PII·개인신용정보가 외부 프런티어 LLM으로 반출 | 신용정보법 §40조의2 위반, 재식별 시 5년 이하 징역·5천만원 이하 벌금 + 과징금 중첩, 규제 신뢰 붕괴 | 중간 | 높음 | 데이터 등급제(5단계)·토큰화·모델 라우팅(로컬=원본, 외부=비식별)·출력 반출 스캔·감사원장 4중 방어. 외부에는 토큰·위험코드·근거 포인터·승인상태·모델버전만 전송 | 준법(Compliance Guard Agent + 준법 최종 승인자 L3) | 신용정보법 §40조의2 ①②⑥⑦⑧ [E5]; D5a·D25 요약 [E3] | Controlled |
| RISK-PRIVACY-002 | D5a · D25 | "토큰화하면 외부 반출 자유" 오해 — 복원키가 내부에 있으면 여전히 가명정보 | 가명정보 통제 누락 시 위탁·재식별 규정 위반 | 중간 | 높음 | 토큰↔원본 키 HSM/별도 저장소 분리보관, 가명처리 취급자와 추가정보 접근권한 분리, 외부는 처리위탁+목적외 사용·학습·재판매 금지 계약 | 데이터 거버넌스팀 + 준법 | D5a 요약 Q&A·§40조의2 추가정보 분리보관 [E4] | Mitigating |
| RISK-PRIVACY-003 | D25 | 외부 LLM 국외이전(리전·서브프로세서·원격지원·로그 저장 위치) 미계약 | 국외이전 규정 위반, 감독 대응 불가 | 중간 | 중간 | 계약에 리전·서브프로세서·로그 위치 명시, 반출 프록시·DLP·토큰화·승인·모델/리전 로그 5종 묶음 보존 | 준법 + 데이터 거버넌스팀 | D25 요약 주의·한계 [E2] | Open |
| RISK-BIAS-001 | DDBM Value Proposition / Negative Impacts · D14 | riskScore가 취약 소상공인·전세 고객을 과잉·과소 표적 | 자동화평가 편향, 설명요구·이의제기 대응 실패 | 중간 | 높음 | Evidence 100% 연결 + RM 최종 승인자의 사람 판단으로 자동 실행 차단, 재산정(재심) 파이프라인, 승인율·TPR·오류율·사유코드·override 편차 조기경보 | RM 최종 승인자 | 신용정보법 §36조의2 자동화평가 설명요구권 [E5]; D14 요약 [E3] | Mitigating |
| RISK-DATA-001 | D14 | thin-file(소상공인)·전세 시세/등기/실거래 시차·FDS concept drift로 저품질 입력에 자동 판단 | 오판정, 근거 없는 행동 초안 | 높음 | 중간 | 입력별 생성/수집/갱신시점·결측률·이상치·정합성으로 데이터 신뢰도 점수 산출, 낮으면 자동판단 차단→수기검토. 사기는 룰(즉시 차단)+모델(배치 검증 후 승격) 혼합 | 데이터 엔지니어 + RM | D14 요약 [E3] | Mitigating |
| RISK-DATA-002 | D14 | 한국어 금융 특화 모델 공백 — 지식점수는 올라도 추론·안전성 격차 | 로컬 모델 단독 판단 시 품질 저하 | 중간 | 중간 | 단일 생성모델 금지: 한국어 금융 임베딩/분류기 + 내부문서 RAG + 규칙엔진 + 인간 승인 조합. 외부 LLM은 설명 초안·추가질문 생성으로 범위 축소 | 아키텍트 + 데이터 엔지니어 | D14 요약 Q&A [E2] | Open |
| RISK-ACTION-001 | DDBM Key Activities · D15 | AI 행동 초안이 승인 없이 고객에게 자동 실행되는 것으로 오인·오작동 | 무단 고객 접촉, Knight Capital형 폭주(45분 4.6억달러 초과손실 사례) | 낮음 | 높음 | Approval Gate fail-closed(승인 전 발송 원천 차단), L0~L4 승인 매트릭스 라우팅, 매 AgentRun 종료 시 승인 상태 확인 후에만 Audit·발송 | 운영 조율 에이전트 + 승인 게이트 | canon §0·§8 운영계약 [E5]; D15 요약(Knight Capital) [E3] | Controlled |
| RISK-GOV-001 | D15 | rubber-stamping — 승인자가 근거를 보지 않고 형식 승인 | 사람 승인이 실질 통제가 아니라 알리바이로 전락 | 중간 | 높음 | 승인 화면에 모델출력·입력 스냅샷·규칙/프롬프트/모델 버전·데이터 출처·정책충돌을 한 화면 표시, 이유코드+자유서술 강제, 고위험은 이중·직무분리 승인. KPI를 승인건수 아닌 override 비율·사유로 측정 | 준법 + 조직(승인 정책 오너) | D15 요약 [E3] | Mitigating |
| RISK-GOV-002 | D15 | false block(오차단)으로 정상 고객이 서비스 차단 | Wells Fargo형 대량 오차단(100만+ 계좌 동결 사례), 고객 피해·민원 | 중간 | 중간 | 차단 범위 최소화·부분 제한 우선, 5영업일 내 결과 통보 SLA, 임시 해제 권한·복구 플로우 | RM + 운영 조율 에이전트 | D15 요약(Wells Fargo) [E3] | Open |
| RISK-GOV-003 | D15 | kill switch가 UI 버튼뿐 — 실제 채널·배치·서드파티 API·메시징 큐 미연결 | 사고 시 실행 정지 실패 | 낮음 | 높음 | kill switch가 채널·배치·외부 API·큐까지 실제 차단, 발동 즉시 사고 티켓·영향 고객 집계·감독보고 초안·fallback 모드 자동 생성 | 빌더 + 운영 조율 에이전트 | D15 요약 [E2] | Open |
| RISK-GOV-004 | D15 | 감사원장이 로그 존재만으로는 법적 증거 불성립(무결성·동일성·chain-of-custody 미입증) | 감독·소송 대응 시 증거력 상실 | 낮음 | 높음 | append-only 저장·시간 동기화·해시/전자서명·변경 히스토리·관리자 접근기록·forensic export를 기본값으로. 블록체인 아닌 무결성 요건 충족 우선 | 데이터 스튜어드 + 준법 | D15 요약 [E3]; 접속기록 보존 규정 [E5] | Mitigating |
| RISK-PERF-001 | D8 | 생산성 효과가 과업·숙련도에 따라 갈림 — 속도만 재면 순생산성 오판(숙련 개발자 RCT는 완료시간 +19%) | 도입 효과 과대주장 → PoC에서 반증 위험 | 중간 | 중간 | 파일럿 KPI 5종 고정(총 리드타임·시간당 케이스·블라인드 품질점수·faithfulness·재작업률), 체감 생산성은 보조지표, 벤더 홍보수치 대신 1차 실증만 사용 | 제품 + 판단QA | D8 요약(RCT +19%) [E3] | Monitor |
| RISK-AFFIL-001 | D25 | 계열사(전북은행↔JB우리캐피탈) 식별형 고객원장 상시 통합 | 금융지주 특칙 요건(목적·이용자·기간·분리보관·승인) 미충족 시 위법 | 중간 | 높음 | 3단 고정: 고객응대·실행=각 계열사 식별형, 그룹 모델·리스크=가명형 결합, 대외·외부 LLM=Zero-PII 파생물. 공동 솔트 구조는 기본안에서 제외 | 준법 + 데이터 거버넌스팀 | D25 요약 [E2]; 적대검증 리포트(공동 솔트 제외 권고) [E3] | Open |
| RISK-CLAIM-001 | 적대검증 리포트 · 서사-근거팩 | "Enter가 마우스보다 49% 빠름"(KLM)을 성과지표로 제시 | 심사위원 반문 시 최약점 노출 — KLM은 전문가·무오류 가정·물리조작만 측정, 판단시간은 못 잼(논지와 모순) | 중간 | 중간 | 49%는 "성과"가 아니라 "왜 이렇게 설계했나"의 이론적 상한·설계근거로만 사용, 가능하면 실사용 time-on-task로 보완 | 제품 + 발표 오너 | 서사-근거팩 §4·§7·최약점 [E4]; Card·Moran·Newell KLM 1980 [E5] | Controlled |
| RISK-CLAIM-002 | 적대검증 리포트 · 서사-근거팩 | "중단 후 복귀 23분 15초"(Gloria Mark 오귀속) 인용 | CHI 논문에 없는 인터뷰 발언의 유명 오귀속 — 사용 시 신뢰도 즉시 훼손 | 낮음 | 중간 | **사용 금지**. 발표·문서·데모 카피에서 전면 배제, 대체 근거로만 주의환기 논지 전개 | 발표 오너 + 증빙 | 서사-근거팩 §금지목록 [E4] | Controlled |
| RISK-CLAIM-003 | 적대검증 리포트 | 시장규모(국내 금융 AI 3.2조원 등)·ROI 회수기간을 단일소스/가정을 확정값처럼 제시 | 정량 주장 반증 시 전체 논지 신뢰 하락 | 중간 | 중간 | 시장은 "기회가 크다" 수준으로 낮추고 외부 추정치로 표기, ROI·투자수익은 보수/기준/공격 민감도 표로 분리. 확정값은 canon 일치 수치만 | 리서치 + 제품 | 적대검증 리포트 시장·투자수익 판정 [E3] | Monitor |
| RISK-DEP-001 | DDBM Key Data · Open Questions | Key Data(카드매출·CB·여신원장) 실 데이터 미확보(→ 최영욱 확인 대기) | 데모·PoC 범위 축소, 실동작 시연 리스크 | 높음 | 중간 | Fallback: 원본 처리는 로컬 모델 라우팅/수기 입력, 공공 API는 사전 확보 스냅샷(JSON)으로 대체(실동작-데모-증거팩 폴백 플랜) | 데이터 엔지니어 + 최영욱 | business-model Q-BM-005 [E1] | Mitigating |

## DDBM Negative Impacts 연결
| DDBM Negative Impact | 대응 Risk ID |
|---|---|
| PII 외부 노출 위험 | RISK-PRIVACY-001 · RISK-PRIVACY-002 · RISK-PRIVACY-003 |
| 위험점수 편향(취약 소상공인 과잉 표적화) | RISK-BIAS-001 · RISK-DATA-001 |
| 행동 초안의 자동 실행 오인 | RISK-ACTION-001 · RISK-GOV-001 · RISK-GOV-003 |

## Open Questions
| ID | Question | Why It Matters | Default Assumption | Owner |
|---|---|---|---|---|
| Q-RISK-001 | RISK-GOV-002/003(false block SLA·kill switch 실채널 연결) 데모 범위 포함 여부 | 승인우선 서사의 "구조로 강제" 주장을 시연으로 뒷받침할지 결정 | 문서·설계에 명시, 데모는 승인 게이트 우선 | 팀(7/4) |
| Q-RISK-002 | 계열사 데이터 결합(RISK-AFFIL-001) 가명형 결합 실증을 데모에 넣을지 | 확장성 차별점 서사의 근거 강도 | 3단 구조 설명 + Zero-PII 메모리만 시연 | 팀(7/4) |
| Q-RISK-003 | RISK-PERF-001 파일럿 KPI 5종을 발표 evals와 정합시킬지 | 효과 주장의 반증 대비 | evals/rubric과 매핑 | 제품 |

## Definition of Done (Score2 릴리스 최소)
- [x] 필수 10개 컬럼(Risk ID~Status) 전부 채운 register.
- [x] DDBM `Negative Impacts` 3항목이 Risk ID에 매핑됨.
- [x] 매핑 리서치(D15·D8·D14·D25·D5a·적대검증)의 최약점(KLM 49%·23분 오귀속·시장/ROI 단일소스)이 RISK-CLAIM으로 반영됨.
- [x] 고위험 행동은 승인 게이트(L0~L4)·fail-closed로 실행 전 통제됨을 Mitigation·Review Gate로 명시.
- [x] 각 리스크에 근거등급 E0~E5 병기, 약근거/미검증/가정은 Status(Open)·[E1]/[E2]로 표시.
- [ ] 7/4 팀 확정(데모 범위·계열사 결합·KPI 정합) 반영 후 Open 항목 재평가.

## 연결
- [[08_본선/03_제품/00_vision/business-model|Business Model (DDBM)]]
- [[08_본선/03_제품/00_vision/core-bet|Core Bet]]
- [[08_본선/03_제품/00_vision/principles|Principles]]
- [[08_본선/03_제품/00_결정-준비/근거팩/적법성-근거팩|적법성-근거팩]]
- [[08_본선/03_제품/00_결정-준비/근거팩/서사-학술규제-근거팩|서사-학술규제-근거팩]]
- [[08_본선/05_제출/리서치-딥프롬프트/_결과/_적대검증-리포트|적대검증 리포트]]
