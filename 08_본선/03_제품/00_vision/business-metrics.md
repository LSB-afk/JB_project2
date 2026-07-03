---
tags:
  - area/product
  - type/metrics
  - status/active
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases: [business-metrics, 비즈니스지표, DDBM-metrics]
---

# Business Metrics — JB LocalGuard OS

> [미결/7-4] 수치·가정의 백본은 [[business-model|Business Model(DDBM)]]과 동일하다. 도메인 조합·데모②·승인직군 확대는 7/4 팀 확정 전까지 최선 가정으로 채웠다.
> **근거등급 범례** — E5 공개 1차실측 / E4 데모에서 실측·시연 가능 / E3 공개 2차·벤더 실증 / E2 산식+공개앵커 조합 / E1 내부 가정 / E0 미검증. 목표는 E2+, 데모 지표는 E4.

## 왜 이 지표 세트인가 (심사위원 반문 대비)

돈을 움직이는 1순위는 토큰단가가 아니라 **현장 채택률**이다(D23). 그래서 지표를 "모델 성능"이 아니라 `채택 → 활성 → 유지 → 매출 / 원가 / 단위경제 → 임팩트 → 신뢰` 순서로 잡는다. downside도 금융비용이 아니라 adoption risk이므로(D23), 대시보드 1차 지표는 Adoption·Activation·Trust에 무게를 둔다.

## Required Metrics (8 카테고리)

| Category | Metric | 정의 / 측정 | 목표·기준값 | 근거등급 | 근거 |
|---|---|---|---|---|---|
| **Adoption** | 기관 도입 수 | 계약 체결 계열사 | 2곳(전북은행·JB우리캐피탈) | E2 | [[business-model\|DDBM]] Key Partners |
| Adoption | seat 수 (램프) | 라이선스 활성 seat | 초기 116 → 확장 346 → 전사 365석 | E2 | D31 |
| Adoption | WAU/MAU | 주·월 활성 사용자 수 | 파일럿 seat의 ≥60% [가정] | E1 | D23 |
| **Activation** | 첫 케이스 완결률 | 신규 seat이 첫 `Case`를 승인·감사기록까지 완료한 비율 | ≥80% (온보딩 2주 내) [가정] | E1 | D16·D23 |
| Activation | AI 초안 채택률 | 자동 생성 행동 초안이 RM 승인으로 채택된 비율 | 데모에서 실측 | E4 | D23·D16 |
| Activation | 첫 EWS 대응률 | 첫 위험알림을 조치까지 연결한 비율 | ≥70% [가정] | E1 | D1a |
| **Retention** | DAU/WAU | 일·주 활성 비율(반복 사용 강도) | ≥0.5 [가정] | E1 | D23 |
| Retention | 케이스 재방문율 | 동일 seat의 주간 반복 사용률 | 추적만(파일럿 실측 대상) | E0 | D16 |
| Retention | QA 재작업률 | 승인 반려·재작성 비율(낮을수록 유지 신호) | 하향 추세 | E1 | D23 |
| **Revenue** | seat ARR 단가 | seat당 연 라이선스 | 200만~300만원/석 [가정] | E1 | D31 |
| Revenue | 연 매출(ARR) | seat 램프 × 단가 | JB 초기 2.32~3.48억 → 확장 6.92~10.38억 → 전사 7.30~10.95억 | E2 | D31 |
| Revenue | 계약 밴드 | managed service 계약 규모 | 파일럿 1억후반~2억 / 정식 3억~5억 / 강화 그 이상 | E2 | D19 |
| **Cost** | 추론 API 원가 | 연 LLM 추론비(기준 사용량 월 0.863억 토큰) | GPT-5 mini ~92만원 / GPT-5 ~462만원 / Sonnet4 ~837만원 | E3 | D23 |
| Cost | RM 시간당 loaded 원가 | 총보상×간접비배율 / 연 실업무시간 | 6.8만~12.9만원/시간 | E3 | D16 |
| Cost | 운영통제비(OPEX) | 로그·감사보관 + DLP + 백업/DR + 관찰성 + 온콜 + 월리포트 | 계약가의 주원가(토큰비 아님), 연 OPEX 1억 [가정] | E2 | D19 |
| Cost | 초기 구축비 | 구축·라이선스 온보딩 | 3.0억~5억 [가정] | E1 | D23·[[business-model\|DDBM]] |
| **Unit Economics** | ROI(3년, 위험조정) | 편익/비용 | 기준 471% | E2 | D23 |
| Unit Economics | NPV / Payback | 3년 NPV·회수기간 | NPV 24.2억 / 회수 5.4개월 | E2 | D23 |
| Unit Economics | CAC / LTV | 획득비용·생애가치 | [미검증] — 파일럿 후 산정 | E0 | — |
| Unit Economics | gross margin | managed service 마진 | [미검증] — 운영원가 확정 후 | E0 | D19 |
| **Impact** | 케이스당 절감시간 | 심사·사후관리 touch time 단축 | 75분 → 5분 (재무추출 45→5분, 심사의견 30분→10초) | E3 | D1a |
| Impact | 연 절감시간 | 전 여신업무 시간 회수 | 연 27,000시간(벤더 실증, 일반화 주의) | E3 | D1a |
| Impact | 반복행정 절감액 | 116석×케이스×절감시간×원가×실현율 | 보수 0.83 / 기준 7.66 / 공격 31.42억원/년 | E2 | [[business-model\|DDBM]]·D16 |
| Impact | 리스크 회피 | 손실 조기탐지 / 탐지율 개선 | 부실 1건당 5,520만원 회피, 탐지 1%p당 ~2,266만원/년 | E2 | D1a·D23 |
| **Trust** | Approval safety | 고객 대상 행동의 승인 게이트(L0~L4) 통과율 | **100%**(fail-closed) | E4 | canon §3 |
| Trust | Evidence traceability | 판단→근거 링크 연결률 | **100%** | E4 | canon §3 |
| Trust | 오탐/미탐(EWS) | false positive / false negative | 추적(파일럿 보정 대상) | E0 | D16 |
| Trust | 이의제기율 | 자동화평가 설명요구·이의 건수(신용정보법 §36조의2) | 추적 + 100% 대응 | E2 | [[business-model\|DDBM]] RISK-BIAS-001 |
| Trust | 감사로그 완결성 | `누가·언제·무슨 근거로·후속조치` 기록 누락률 | 0건(사후관리 누락 0건 목표) | E4 | canon §3·D1a |

## 데모에서 실측할 지표 (E4 세트)

발표 시 콘솔에서 라이브로 보여줄 지표는 다음 4개로 고정한다(모델 벤치마크 대신 현업 신호).

- **AI 초안 채택률** — 자동 초안이 승인으로 채택되는 비율.
- **케이스당 절감분수** — 처리 전/후 touch time 차이.
- **Approval safety 100% / Evidence traceability 100%** — 승인 없는 발송 원천 차단, 근거패킷 첨부.
- **1,000건당 실현가치** — 기준안 약 4.81백만원(D23).

## 파일럿에서 보정할 값 (지금은 약근거)

아래는 공개 실측이 약하거나 내부 가정이다. 계약 직전 ROI 계산서는 단기 파일럿·RM 인터뷰로 반드시 재산정한다(D16·D23·D1a).

| 값 | 현 상태 | 보정 방법 |
|---|---|---|
| RM 1인당 월 케이스 수(`N_i`) | E1 내부 가정 | 4주 업무 로그 실측 |
| 케이스당 절감시간(`ΔT_i`) | E3 단일 사례 | 단계별 touch time 계측 |
| 실현율 `R`(기준 55%) | E1 가정 | 자동초안 채택률 로그 |
| EWS 오탐/미탐 | E0 미검증 | 파일럿 알림→조치 로그 |
| CAC / LTV / gross margin | E0 미검증 | 획득비용·운영원가 확정 후 |

## Open Questions

| ID | Question | Why It Matters | Owner |
|---|---|---|---|
| Q-BM-006 | seat당 단가(200만~300만) 실제 계약 밴드 확정 | Revenue·ARR 전 구간 이동 | 팀(7/4) |
| Q-BM-007 | 연 OPEX·운영통제비 실단가(로그·DLP·DR) | Cost·gross margin·payback | 최영욱 확인 대기 |
| Q-BM-008 | 확장 seat(346~365) 반복행정 절감액 적용 | Impact 상방이 [미검증] | 팀(7/4) |
| Q-BM-009 | 연체 방어 상방(27.9~139.2억)의 인과 검증 | Impact 별도 축, 심사 프레임은 반복행정 절감 사용 | PoC |

## Definition of Done

- [x] 8개 카테고리(Adoption/Activation/Retention/Revenue/Cost/UnitEconomics/Impact/Trust) 모두 최소 1개 지표.
- [x] 각 지표에 근거등급(E0~E5) 표시, 약근거·미검증·가정 명시.
- [x] Revenue·Cost가 숫자 가설 포함(seat 단가·API 원가·loaded rate).
- [x] Unit Economics가 ROI/NPV/Payback 포함, CAC/LTV는 [미검증] 명시.
- [x] Impact·Trust가 canon KPI(Approval safety·Evidence traceability·사후관리 누락 0)와 연결.
- [ ] 7/4 팀 확정(seat 단가·OPEX·확장 seat·연체 인과) 반영 후 [미결/7-4] 해제.

## 연결
- [[business-model|Business Model(DDBM)]]
- [[core-bet|Core Bet]]
- [[08_본선/03_제품/00_결정-준비/근거팩/ROI-근거팩|ROI-근거팩]]
- [[08_본선/03_제품/00_결정-준비/키스톤-확정|키스톤-확정]]
- [[차별성-경험레이어-서사|차별성 경험레이어 서사]]
