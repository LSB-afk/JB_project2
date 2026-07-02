---
tags:
  - area/system
  - type/plan
  - status/active
date: 2026-07-02
up: "[[VISUALIZATION-PLAN]]"
aliases:
  - 리서치-도메인-아틀라스-플랜
  - research-domain-atlas-plan
---
# Research Domain Atlas Plan

> 목적: 리서치가 많다는 사실을 보여주는 보드가 아니라, 어떤 큰 범주가 있고 각 D/B 리서치가 어느 범주에 속하며 어떤 제품 결정·시연·발표 근거로 연결되는지 한 장에서 보이게 한다.

## 보드 정의

| 항목 | 내용 |
|---|---|
| 파일 | `research-domain-atlas.excalidraw` |
| 주 독자 | 팀원, 발표 준비자, 심사 백업 질의 대응자 |
| 핵심 메시지 | 31+개 딥리서치는 흩어진 자료가 아니라 `문제/Pain → JB/시장 → 규제/데이터 → 시스템/Agent → 검증/운영 → 제품·시연·발표`로 이어지는 증거 네트워크다. |
| 데이터 소스 | [[README]], [[_00-도메인-분해-점검]], [[_01-실행-대시보드]], [[_00-회수현황]], [[_인사이트맵]], [[_본선-논증척추]] |
| 업데이트 트리거 | D시리즈 추가/회수, `_인사이트맵` 갱신, 제품 정의·PPT 전략·시연 척추 변경 |
| 완료 기준 | 5초 안에 큰 범주 6개, 각 범주의 D/B 코드, 주요 연결선, 제품·시연·발표 활용처, 미해결 갭이 보인다. |

## 시각 구조

1. **좌측 입력 레이어**: 리서치 프롬프트/결과/종합/논증척추의 흐름.
2. **중앙 도메인 아틀라스**: 6개 클러스터 카드.
3. **우측 활용 레이어**: 제품 결정, MVP/시연, 발표/심사 백업.
4. **연결선**: 클러스터 간 강화·충돌·의존 관계를 짧은 라벨로 표시.
5. **하단 갭/다음 액션**: D25 실행대기, ROI 수치 reconcile, 데이터 레인 적법성, 실도입 API 경로.

## 클러스터 분류

| 클러스터 | 포함 리서치 | 역할 |
|---|---|---|
| Pain & RM Workflow | D1a, D1b, D2, D4, D16 | 문제정의, RM 업무량, 조직/직무, 고객 리스크 |
| JB Fit & Market | D3a, D3b, D3c, D3d, D3e, D3f, D30, D+a, D23 | JB 도입근거, 시장규모, ROI, 바이어 언어 |
| Data & Regulation | D5a, D5b, D7a, D7b, D12, D17, D25 | 개인정보·망분리·데이터/API·계열사 공동이용·적법성 |
| Agent/System Architecture | D6, D9, D10, D11, D20, D21, D22, B1 | 코어뱅킹, 보안, 메모리, 모델주권, 하네스/OSS |
| Governance & Validation | D8, D13, D14, D15, D18, D19, D+b | 생산성 측정, MVP 검증, 데이터품질, 승인/감사, 운영리스크 |
| Synthesis & Pitch Spine | 연결-1..6, `_인사이트맵`, `_본선-논증척추`, `_canon-갱신후보` | 교차 인사이트, 심사 5기준 매핑, 발표 방어 문장 |

## 핵심 연결선

| 연결 | 의미 | 보드 라벨 |
|---|---|---|
| Pain → JB Fit | RM 고통을 JB 2계열사 파일럿 서사로 좁힘 | pain to buyer |
| JB Fit → Governance | ROI/시장 주장을 승인·감사·운영 리스크 방어와 결합 | value needs trust |
| Data Regulation → Agent/System | PII 비반출이 보안 문구가 아니라 아키텍처를 결정 | PII shapes architecture |
| Agent/System → Governance | 모델이 아니라 운영계약·승인게이트가 핵심 | model-agnostic OS |
| Governance → Demo/Pitch | MVP는 답변 품질이 아니라 상태 변화 불변식으로 증명 | invariant demo |
| Synthesis → All | 점-점 연결 노트가 발표 첫 문장과 반론 방어를 생성 | pitch spine |

## 표기 규칙

- `✅` 회수 완료, `TBD` 실행대기, `mixed` 수동 종합/추정 포함.
- 리서치 코드는 카드 안에 짧게 보이게 하고, 긴 제목은 문서 링크에서 확인한다.
- `D25`처럼 아직 실행대기인 항목은 하단 갭 박스에 따로 둔다.
- 숫자는 보드에서 최소화하고, 정량값은 [[_canon]] 또는 해당 결과 문서로 연결한다.

## 연결

- [[VISUALIZATION-PLAN]]
- [[_viz-index]]
- [[research-to-product-funnel]]
- [[evidence-traceability-board]]
- [[_인사이트맵]]
- [[_본선-논증척추]]
