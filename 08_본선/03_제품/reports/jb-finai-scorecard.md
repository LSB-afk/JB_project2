---
tags:
  - area/product
  - type/eval
  - status/active
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases:
  - 심사 자가채점
  - jb-finai-scorecard
---
# JB Fin:AI 자가채점 스코어카드

> 심사 스키마: 벤더 `_vendor/harness-engineering-skills/references/jb-finai-rubric.md` + 대회 안내 정본. **5축 × 20 + 시연영상 +5 = 105점.** 자가채점은 낙관 금지 — 근거 문서·근거등급을 병기하고 갭을 노출한다.

## 1. 5축 자가채점
| 축 | 배점 | 자가 | 근거 문서 | 갭/리스크 |
|---|--:|--:|---|---|
| 1. 주제 적합·문제 정의 | 20 | **17** | [[02_core-bet]]·[[01_prd/prd\|prd]]·[[00_source-log]]·D1a/D2/D16 | 문제=강. 히어로 ID 단일화 미완 |
| 2. 금융 업무 연계·고객가치 | 20 | **16** | [[01_business-model]]·[[17_business-metrics]]·[[18_data-strategy]]·D3b/D19/D23 | 단위경제 E0~E1(약근거). 캐피탈 수치 [미검증] |
| 3. AI Agent 설계·기술 타당성 | 20 | **16** | [[02_agent-design/agent-roster\|roster]]·[[orchestrator]]·[[07_architecture]]·[[차별성-설정근거상향-흐름]] | 실동작 1경로(E4)·나머지 목업. paperclip 이식 미착수 |
| 4. MVP 완성도·검증가능성 | 20 | **15** | [[08_feature-spec]]·[[evals/eval-plan\|eval-plan]]·[[evals/golden-cases\|golden-cases]]·[[validation-report]] | 라이브 데모=모델 선택 게이트웨이(로컬 우선·codex 폴백) 리허설 미실측·e2e 미재실행 |
| 5. 혁신·확장성·운영리스크 | 20 | **17** | [[차별성-경험레이어-서사]]·[[rules/agent-rules\|rules]]·[[19_risk-impact-register]]·[[evals/failure-modes\|failure-modes]]·D30/Dplus | 운영거버넌스 빈칸 공략=강. 확장 seat ROI 미검증 |
| **소계** | **100** | **≈81** | | |
| 시연영상 가점 | +5 | **+3** | [[07_발표-제출/demo-script\|demo-script]] | 영상 미제작·초단위 미확정 |
| **총점(자가)** | **105** | **≈84** | | 목표 90+ = 아래 §4 선결 |

## 2. 필수 AI Agent 3요소 (판단·행동·검증) 실증
| 요소 | 우리 실증 | 근거등급 |
|---|---|---|
| judgment(판단) | `computeRiskDecision`/`computeJeonseRiskAssessment` 규칙 스코어 + ccl-financial 실 LLM 요약 | E4 |
| action(행동) | 행동 초안 생성(RecommendationDraft)·승인 큐 라우팅 | E4 |
| verification(검증) | `harnessGuardCheckPII`/`Assertions` 재검 + 승인게이트 + 감사 해시체인 | E4 |

## 3. 필수 문서 형태 커버리지
- **MVP 제안서**(Summary/Problem/Solution/Key Features/Data·Tech/User Scenario/Expected Impact): [[01_prd/prd\|prd]]+[[02_core-bet]]+[[18_data-strategy]] 커버 ✅
- **기능명세서**(Service/Architecture/Feature Spec/Flow/Future Work/Appendix): [[08_feature-spec]]+[[07_architecture]]+[[09_flow]]+[[06_build-roadmap/ssd-implementation\|ssd]] 커버 ✅
- **⚠️ 기능 변경이력**(미기재=하드리스크): [[11_change-log]] §A 기능변경이력 ✅

## 4. 하드리스크 체크(실격/감점 방지)
| 하드리스크 | 상태 |
|---|---|
| 필수 제출물 누락 | 🟡 GitHub 제출 URL·시연영상 미확정([[07_발표-제출/submission-checklist\|checklist]]) |
| 현장 데모 미구동 | 🟡 목업은 확실·라이브는 모델 선택 게이트웨이(로컬모델 기동 필요, 실패 시 codex 폴백) → 폴백 준비됨 |
| 기능 변경이력 미기록 | 🟢 [[11_change-log]] 기재 |
| 타팀 코드·문서 무단복제 | 🟢 paperclip=구조·스키마셰이프만, 디자인 JBFG 재작성([[paperclip-통합-블루프린트]]) |
| PII·보안·저작권·환각·설명가능·책임 리스크 방치 | 🟢 rules/·PII 4중방어·승인게이트·[[19_risk-impact-register]] |

## 5. 90+ 도달 선결(우선순위)
1. 히어로 ID CCL-0001 단일화(축1·4 +2점).
2. 라이브 데모 리허설(모델 선택 게이트웨이 — 로컬 우선·codex 폴백)·초단위 확정(축4·영상 +3점).
3. 단위경제·확장 seat ROI 근거 승격 E0→E2(축2 +2점).
4. GitHub 제출 URL·시연영상 확정(하드리스크 해소).

## 연결
[[validation-report]] · [[evals/rubric|rubric]] · [[harness.yaml]] · [[07_발표-제출/pitch-outline|pitch-outline]] · [[07_발표-제출/judge-qna|judge-qna]]
