---
tags:
  - area/product
  - type/validation
  - status/active
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases:
  - 검증 보고서
  - validation-report
---
# Validation Report — JB LocalGuard OS 문서세트·데모 검증

> 정직 원칙(harness 규약 #6: 검증 실패는 숨기지 않는다). 이 문서는 세트 **잠금(lock)** 시점 스냅샷이며, 미결·약근거·미실행을 그대로 노출한다.

## 1. Documents completed (35)
- **핵심 13**: source-log·business-model·meeting-log·cps·principles·definitions·domain-model·prd·architecture·feature-spec·flow·eval-plan·change-log·handoff(→[[본선 HOME|HANDOFF]] 매핑) ✅
- **확장 8**: ssd·demo-script·pitch·judge-qna·business-metrics·data-strategy·risk-register·submission-checklist ✅
- **rules 6 / evals 3**: Score3, 실 가드레일 코드 인용(E4) ✅
- **커스텀 3**: agent-roster·orchestrator·skill-spec ✅
- **차별성 척추 2**: 경험레이어 서사(왜)·설정근거상향 흐름(어떻게, 신설) ✅
- **메타 3**: harness.yaml·validation-report(본문)·jb-finai-scorecard ✅

## 2. Missing / mapped (정직)
- `12_handoff` = 신규 미작성, `08_본선/HANDOFF.md`(부팅 정본)에 **매핑**. 제품 run/demo는 [[08_본선/04_증빙/02_분석자료/리서치/리서치-인덱스|리서치 인덱스]]·[[07_발표-제출/demo-script|demo-script]]가 커버.
- `01_meeting-log`·`01_business-model` = 기존 문서 매핑(신규 아님).
- **README** = 이번 갱신 완료(기존 플레이스홀더 대체).

## 3. Tests run / not run
| 항목 | 상태 |
|---|---|
| `npm run test`(예선 verify_static 문자열계약, 53파일) | ✅ 통과 |
| `node app/llmClient.js` 폴백 self-check(JB_project2) | ✅ 통과 |
| `node --check`(변경 JS) | ✅ 통과 |
| e2e Playwright(~19 시나리오, 예선) | ⚠️ 미재실행(이번 변경분 대상 아님) |
| **실 LLM 라이브 경로**(`?live=1`) | ❌ 미실행 — 이 환경에 로컬모델/API키 없음. 모델 선택 게이트웨이(로컬/claude/codex) 코드는 폴백으로 완성, 라이브는 데모 PC에서 검증 필요 |
| 문서 SSOT 정합(히어로/승인/용어) 자동검증 | ❌ 수동 스팟체크만 |

## 4. Evidence level 요약
- **E4(작동검증)**: rules 가드레일 인용, ccl-financial 슬라이스, import/export 실코드, verify_static.
- **E2(외부자료)**: 규제 인용(canon §4)·시장/ROI(D1a·D16·D30·D31)·페인포인트(D1b).
- **E0~E1(약근거, 승격 필요)**: 단위경제(CAC/LTV)·EWS 오탐율·확장 seat ROI·49% 수치. 각 문서 [미검증] 태그.

## 5. Known risks (최상위)
1. **히어로 ID 이원화** — 정본 CCL-0001 vs 예선 JBG-104 잔재. 다수 문서 [Open Question]. → naming-rules로 단일화 + 잔재 일괄 정정 필요.
2. **라이브 데모 의존** — 실 에이전트 시연은 모델 선택 게이트웨이(로컬모델 우선·codex 폴백) 기동 전제. 미기동 시 목업 폴백(무회귀)이나 "실동작" 어필 약화.
3. **7/4 팀 미결** — 데모케이스②(전세/피싱)·MCP 채택·담당자 설정범위·캐피탈 사후관리 적용성.
4. **참가자격** — 김주용 계약직 실격 요건 팀 재확인([[본선 HOME|HANDOFF]] §4).
5. **49% 충돌** — 발표 원고 택1 미정([[무제폴더-핵심이해]]).

## 6. Demo readiness
- 🟢 목업 골든패스(CCL-0001): 즉시 시연 가능.
- 🟡 실 LLM 슬라이스: 코드 완성·PR#1(CCL-0001, 김건우 히어로 유지), **데모 PC에서 모델 선택 게이트웨이(로컬 우선·codex 폴백) 기동 시 라이브**. 리허설·초단위 타이밍 미실측([[07_발표-제출/demo-script|demo-script]]).
- 🔴 전세/피싱 골든패스: 실동작 지향이나 [조건부/7-4].

## 7. Pitch readiness
- 🟢 척추·구조: [[07_발표-제출/pitch-outline|pitch-outline]] 12슬라이드 + [[07_발표-제출/judge-qna|judge-qna]] 15카테고리 + 적대검증 최약점 방어 완비.
- 🟡 미정: 발표자·시간배분·49%/ROI 노출 버전.

## 8. Final recommendation
1. **문서 잠금 OK** — 세트는 심사 제출 가능 수준(Score2+, rules/evals Score3). 
2. **선결(오늘)**: 히어로 ID 단일화 + 라이브 데모 리허설(모델 선택 게이트웨이 — 로컬 우선·codex 폴백) + 7/4 팀 미결 5건.
3. **다음**: config 뷰/스키마 보강 → dev-artifact 추출 → paperclip 빌드(7 Codex Task).

## 연결
[[INDEX|제품 인덱스]] · [[jb-finai-scorecard]] · [[harness.yaml]] · [[본선 HOME|HANDOFF]] · [[무제폴더-핵심이해]]
