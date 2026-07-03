---
tags:
  - area/product
  - type/business-model
  - status/draft
date: 2026-07-03
up: "[[INDEX|제품 인덱스]]"
aliases: [DDBM, business-model, 비즈니스모델]
---

# Business Model (DDBM) — JB LocalGuard OS

> [미결/7-4] 이 문서는 7/3 종합 근거(키스톤·ROI·적법성 근거팩) 기준 초안이다. 도메인 조합(하이브리드 옵션3)·데모②·승인직군 확대는 7/4 팀 확정 전까지 최선 가정으로 채웠다.

## Judge-Facing Thesis
JB LocalGuard OS는 전북은행·JB우리캐피탈 두 계열사의 담당 직군(RM·여신심사·사후관리·준법·AML)이 매일 다루는 위험 신호를 `Case → AgentRun → Agent → Skill → Evidence → Approval → Audit` 단일 운영계약으로 묶어, AI는 판단·행동 초안까지만 만들고 사람이 승인 게이트(L0~L4)를 통과시켜야 고객 대상 행동이 나간다. 이 모델의 데이터 우위는 범용 LLM이 흉내 낼 수 없는 지점에서 나온다 — 원본 PII·신용정보는 데이터 등급제·토큰화·모델 라우팅·반출 스캔·감사원장의 4중 방어로 로컬/온프레 모델에만 두고, 외부 프런티어 LLM은 비식별·공개 데이터만 처리한다. 신용정보법 §40조의2·§36조의2, 전자금융감독규정 §15조, 금융위 2026 「금융분야 AI 가이드라인」의 보조수단성·RACI, AI기본법 §34 고영향 AI 사람관리·감독 요건을 설계 시점부터 만족시키므로, 규제 준수 자체가 경쟁사가 단기간에 복제하기 어려운 진입장벽이다.

## DDBM 11 Blocks
| Block | 내용 | 근거 | 확실성 |
|---|---|---|---|
| Mission | 지역 금융(전북은행·JB우리캐피탈) 담당 직군이 위험 신호를 놓치지 않고, 사람 승인 아래에서만 고객에게 행동하는 AI 운영 콘솔을 제공한다. | canon §0 | [검증됨] |
| Key Partners | 전북은행·JB우리캐피탈 실무 직군(RM·여신심사·사후관리·준법·AML), 준법/컴플라이언스 부서, 데이터 거버넌스팀, 공공데이터 제공기관(law.go.kr·MOLIT·ECOS). | 키스톤-확정, 실동작-데모-증거팩 | [검증됨] |
| Key Activities | 신호 수집(Evidence) → 계열사×직군별 Agent 판단 → 행동 초안 생성 → RM/준법 승인(L0~L4) → 감사원장 기록. | 운영계약(canon §0), 스킬-플러그인-데이터 구상 §0 | [검증됨] |
| Key Data | 전세등기(등기부등본 권리관계), 카드매출/상환 스케줄, 신용정보(CB 스코어·심사 원장), 공공 API(law.go.kr·MOLIT 실거래가·ECOS 금리지표). | Key Data Inventory(하단) | [검증됨/일부 추정] |
| Key Enablers | 로컬 LLM(EXAONE 3.5 7.8B 데모, Qwen2.5 배포권고) + 외부 API(Claude/Codex, 비민감 전용), 4중 PII 방어, 승인 게이트 UI, 감사체인. | canon §0, 로컬모델-컴퓨팅-TCO-모델링 | [검증됨/일부 추정] |
| Key Barriers | 은행 내부망 연동·DB 연동방식 미확정, 승인 직군 확대 여부, 데이터 제공 부서 확인 대기("→ 최영욱 확인 필요" 다수), 규제 조문 최종 확인(전자금융감독규정 §15조 항·호 제출 전 재확인). | 스킬-플러그인-데이터 구상 §4, 적법성-근거팩 | [검증됨] |
| Value Proposition | RM·여신심사·사후관리·준법·AML 직군이 반복 행정(대조·초안·기록)에서 시간을 회수하고, 사람은 최종 판단·고객 설명·승인에만 집중한다. | ROI-근거팩 | [검증됨] |
| Benefits | Triage 50% 단축, Evidence traceability 100%, Approval safety 100%, 사후관리 누락 0건 목표. | canon §3 KPI | [검증됨] |
| Negative Impacts | PII 외부 노출 위험, 위험점수 편향(취약 소상공인 과잉 표적화), 행동 초안의 자동 실행 오인. | Barrier·Risk Linkage(하단) | [검증됨] |
| Costs | 로컬 모델 서빙 인프라(GPU/온프레), 외부 LLM API 호출(비민감 건당), 공공 API 인증키 발급·유지, RM 교육, 준법 검토 리소스. | 로컬모델-컴퓨팅-TCO-모델링, 실동작-데모-증거팩 | [추정] |
| Revenues | 계열사별 seat 라이선스(JB RM 좁은정의 116석 기준) + platform fee, 확장 시 여신심사·사후관리·준법·AML 포함 346~365석. | ROI-근거팩 D31 | [검증됨/확장 미검증] |

## Key Data Inventory
| Data-ID | Data Asset | Source | Permission / Consent Basis | Freshness | Quality Risk | Fallback |
|---|---|---|---|---|---|---|
| DATA-001 | 전세등기(등기부등본 권리관계·선순위채권) | 인터넷등기소 등기사항증명서(대량/API 범위 확인 필요) | 신용정보법 §40조의2 내부통제 하 조회, 전세대출·보증 계약 목적 | 계약 시점/변동 시 | 등기부 발급 지연, 대량조회 API 범위 미확정 | 준법 검토가 RM 수동 열람으로 대체, 케이스 보류 |
| DATA-002 | 카드매출·입출금·연체·상환 스케줄 | JB 내부 코어뱅킹/카드 피드(→ 최영욱 확인 필요) | 신용정보법 §40조의2 가명처리 + 계약이행 목적 | 실시간~일 단위 | 원본 PII 노출 위험, 피드 스펙 미확정 | 로컬 모델(원본 처리)로만 라우팅, 미확보 시 사후관리 담당자 수동 입력 |
| DATA-003 | 신용정보(CB 스코어·사업자 신용정보, 여신심사 원장) | NICE/KCB 등 CB, 내부 여신심사 시스템(→ 최영욱 확인 필요) | 신용정보법 §40조의2 ①②⑧ 가명처리+분리보관, 재식별 금지 §40조의2 ⑥⑦ | 심사 시점 기준 | 재식별 위험, 외부 반출 시 즉시 위법 | 외부 LLM에는 구간값·플래그만 전달, 원본은 반출 스캔으로 차단 |
| DATA-004 | 공공 API(law.go.kr 법령·MOLIT 실거래가·ECOS 금리지표) | law.go.kr OpenAPI(서버 IP 사전등록 필요), 공공데이터포털(MOLIT), 한국은행 ECOS | 공개 정보, 별도 동의 불요 | law.go.kr 개정 시/MOLIT·ECOS 일~월 단위 | law.go.kr 키 발급 리드타임, FISIS 스펙 미검증 | 사전 확보한 스냅샷 응답(JSON)으로 대체(실동작-데모-증거팩 폴백 플랜) |

## Barrier and Risk Linkage
| Risk-ID | DDBM 블록 | Risk / Negative Impact | Mitigation | Owner | Review Gate |
|---|---|---|---|---|---|
| RISK-PRIVACY-001 | Key Data / Negative Impacts | 원본 PII·신용정보가 외부 프런티어 LLM으로 반출 | 데이터 등급제·토큰화·모델 라우팅(로컬=원본, 외부=비식별)·반출 스캔·감사원장 4중 방어(canon §0, 신용정보법 §40조의2) | 준법(Compliance Guard Agent + 준법 최종 승인자) | 반출 스캔 통과 + 준법 승인(L3) 이전 외부 전송 차단 |
| RISK-BIAS-001 | Value Proposition / Negative Impacts | 위험점수(riskScore)가 소상공인·전세 취약고객을 과잉 표적·과소 표적할 위험 | 근거 링크(Evidence) 100% 연결 + RM 최종 승인자의 사람 판단으로 자동 실행 차단, 이의제기 대응(신용정보법 §36조의2 자동화평가 설명요구권) | RM 최종 승인자 | 승인 게이트(L2) 전 근거패킷 필수 첨부 |
| RISK-ACTION-001 | Key Activities | AI 행동 초안이 승인 없이 고객에게 자동 실행되는 것으로 오인·오작동 | Approval Gate가 fail-closed(승인 전 발송 원천 차단), L0~L4 승인 매트릭스로 라우팅 | 운영 조율 에이전트 + 승인 게이트 | 매 AgentRun 종료 시 승인 상태 확인 후에만 Audit 기록·발송 |

## Cost and Revenue Units
| Unit | Assumption | Value | Evidence | Sensitivity |
|---|---|---|---|---|
| RM 반복행정 절감액(케이스×seat×원가) | 116석 × 케이스/인/년 × 케이스당 절감시간 × 시간당 loaded 원가 × 실현율, 기준 시나리오(360건×20분×10만원×55%) | 보수 0.83억/기준 7.66억/공격 31.42억 원/년 | ROI-근거팩 D16 바텀업 산식 | 확장 seat(346~365) 적용은 [미검증] |
| seat 매출(ARR) | seat당 연 200만~300만원 [가정] | RM초기 116석 2.32~3.48억, 확장 346석 6.92~10.38억, 전사 365석 7.30~10.95억 | ROI-근거팩 D31 | 벤더 매출 관점, 구매자 ROI와 별개 |
| 도입비 | 초기 구축/라이선스 + 연간 운영비(OPEX) | 초기 5억, 연 OPEX 1억 [가정] | ROI-근거팩 Dplus-a | seat fee + 계열사별 platform fee 가격식 |
| 연체 방어 상방(별도 축, 인과 미검증) | 전북은행 여신잔액 19조808억×연체율 1.46%×연체 회피율 1.0~5.0% | 보수 27.9억/기준 69.6억/낙관 139.2억 원 | ROI-근거팩 Dplus-a | 인과 미검증 — PoC에서 경보→조치→정상화 로그 필요, 심사 발표는 반복행정 절감(0.83~7.66억)을 기준 프레임으로 사용 |

## Open Questions
| ID | Question | Why It Matters | Default Assumption | Owner |
|---|---|---|---|---|
| Q-BM-001 | 도메인 조합 옵션 1/2/3 중 최종 확정(현재 하이브리드 옵션3 가정) | Key Activities·데모 범위·확장 서사가 바뀜 | 하이브리드(전북은행=여신·전세보호·피싱, 캐피탈=여신·사후관리) | 팀(7/4) |
| Q-BM-002 | 데모 케이스 ② = 전세 vs 피싱 | 감성 서사·Key Data 우선순위(등기부 vs FDS) 결정 | 미정, 문서엔 둘 다 명시 | 팀(7/4) |
| Q-BM-003 | 사후관리 편입 여부 및 캐피탈 적용성 | Key Activities·Revenue 확장 seat 범위 변경 | 편입 권고(EWS 킬러 도메인) | 팀(7/4) |
| Q-BM-004 | 승인 직군(RM·준법 2역할) 유지 vs 확대 | Barrier·Risk Linkage의 승인 오너·Cost(교육) 변경 | 유지(RM+준법) | 팀(7/4) |
| Q-BM-005 | 카드매출·CB 신용정보·여신심사 원장 실 데이터 제공 가능 범위 | Key Data Inventory DATA-002/003의 Source·Freshness 확정 | Fallback(로컬 라우팅/수동 입력)으로 데모 진행 | 최영욱 확인 대기 |

## Definition of Done
- [x] DDBM 11블록 전부 작성, 각 항목이 canon/키스톤/ROI 근거에 연결됨.
- [x] Key Data Inventory에 Source·Permission·Freshness·Quality Risk·Fallback 명시.
- [x] Negative Impacts가 RISK-PRIVACY-001/RISK-BIAS-001/RISK-ACTION-001에 매핑됨.
- [x] Cost·Revenue가 ROI-근거팩 보수/기준/공격 시나리오 단위로 명시됨.
- [x] Judge-Facing Thesis가 PII 비반출 차별점과 규제 근거를 구체적으로 인용함.
- [ ] 7/4 팀 확정(도메인 조합·데모②·사후관리·승인직군) 반영 후 [미결/7-4] 태그 해제.

## 연결
- [[08_본선/03_제품/00_vision/core-bet|Core Bet]]
- [[08_본선/03_제품/00_결정-준비/키스톤-확정|키스톤-확정]]
- [[08_본선/03_제품/00_결정-준비/근거팩/ROI-근거팩|ROI-근거팩]]
- [[08_본선/03_제품/00_결정-준비/근거팩/적법성-근거팩|적법성-근거팩]]
- [[08_본선/03_제품/00_결정-준비/설계/skills-스킬·플러그인·외부 플러그인·데이터 구상|스킬-플러그인-데이터 구상]]
- [[08_본선/03_제품/00_결정-준비/근거팩/실동작-데모-증거팩|실동작-데모-증거팩]]
