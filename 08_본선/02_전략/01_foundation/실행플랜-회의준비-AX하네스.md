---
tags:
  - area/strategy
  - type/plan
  - status/active
date: 2026-06-29
up: "[[_02_전략_MOC]]"
aliases:
  - 실행플랜-회의준비-AX하네스
  - 회의준비-플랜
  - AX하네스-가동-플랜
---
# 실행플랜-회의준비-AX하네스

> S16(2026-06-29) 지시 → 사용자 승인 완료. 원천 프롬프트: [[프롬프트-로그]] S16.

## Context
GoLAB(망상궤도) 본선(13팀, 7/4~5 정읍). **내일 회의**에서 팀이 제품 정의(왜·페인포인트·누구·현실성·정확성)를 합의해야 한다. 그 전에 ① 합의를 돕는 **리서치·통계·방법론 준비물**과 ② "우리가 어떻게 일했나"를 자동으로 데이터화·시각화하는 **AX 메타 하네스**가 필요하다. 후자는 제품 그 자체뿐 아니라 **방법론(협업·재현성·AI활용)이 13팀 중 최고**임을 발표/최종보고서에서 증명할 재료가 된다 — 미래 활용처를 모르므로 **로데이터를 넓게·자동으로 축적**해 둔다. 4인 팀 협업이므로 GitHub/GDrive/Syncthing으로 공유. ⚠️ 6/29 공식발표 전 대외비 — 외부 공개/제출은 절대 사람 승인.

## 확정 결정 (사용자, S16)
1. **11블록 정체** = 비즈니스 모델 캔버스 계열 블록을 **심사기준에 매핑하고 KPI로 추적**하는 융합 비계. → BMC형 11블록 × 심사기준 25항목 매핑 × KPI 칸. **내용은 채우지 않고 비계만**(회의/회의후 채움).
2. **리서치 깊이** = 기존 증빙 정리 + 19종 딥프롬프트 실행 런북 준비만. **라이브 리서치/쿼터 소모 없음.**
3. **자동기록** = Stop 훅 활성화 + Excalidraw 4종 실데이터 시각화까지. (settings.json 변경은 실행 단계 승인 게이트)
4. 산출물은 본선 볼트 Obsidian 규약(frontmatter · H1=파일명 · 위키링크 · 중복명 금지 · MOC 1행).
5. 실무·생성은 Haiku/Sonnet 서브에이전트 병렬 위임 선호.

---

## Track A — 내일 회의 준비물 (최우선)
- **A0** 이 프롬프트 기록(완료, [[프롬프트-로그]] S16) + 이 플랜 볼트 보관(현재 문서).
- **A1** [[방법론-비교-보드]] — 제품정의·전략 방법론 한눈 비교(문제·고객 / 사업모델 / 비전·차별화 / 우선순위 / 검증 / 발표내러티브) + **★우리 선택** + 따를 워크플로. 추천만, 최종 채택은 회의.
- **A2** [[제품정의-캔버스]] — BMC형 **11블록 × 심사기준 매핑 × KPI** 비계. ⚠️ 내용 미작성. 재사용: [[제품-정의]] §1, `_canon.md §8`, [[심사기준]].
- **A3** [[회의-리서치팩]] — 검증 통계 1장(소상공인 연체·폐업 / 전세사기 HUG 4.49조 / 보이스피싱 1.13조 등, 출처 canon 표기) + 딥프롬프트 19종 **실행 런북**(우선순위·도구·귀환위치). 이번엔 미실행. 재사용: `05_리서치/pain-point-evidence.md`.

## Track B — AX 메타 하네스 가동
- **B1 ⚠️승인 게이트** `session-telemetry.mjs` → `.claude/settings.json` `hooks.Stop` 등록(dry-run 검증 후, `update-config`). 이후 토큰·도구·시간 자동 append.
- **B2** `telemetry-aggregator/aggregate.mjs` 실행 → `ai-usage-stats`·`_contribution-stats`·`_agent-registry`·`ax-insights` 실데이터 갱신.
- **B3** Excalidraw 4종(timeline·contribution·tokens-time·agent-flow) 실데이터 주입(excalidraw MCP, `_viz-index` 스펙).
- **B4** `team/member-01~04` 수신 양식 정비(식별 PII 제외) + 회의 4인 확정 요청 + 기여통계 `member_slot` 배선.

## Track C — 도구·협업 레지스트리 갭
- **C1** `registry-integrations.md` 신규 — 누락 **Discord·Syncthing** + 기존 Notion·GDrive·GitHub: 무엇을 어디서 공유/보고·동기화 절차·대외비 경계. `_tools-index` 1행, `bootstrap.sh` echo 추가.
- **C2** MCP는 각자 인증 사실을 `registry-mcp`·`bootstrap STEP5`에 명확화.

## Track D — 기록·SSoT 갱신
- `decision-log`(결정 4건) · `session-log`(세션 요약) · `PROGRESS.md`(Track 체크) · MOC 정합.

---

## 실행 순서 & 위임
A0 → A1·A2·A3(병렬, Sonnet) → C1·C2(Haiku) → B2·B3(데이터 의존) ; **B1은 승인 후**. 회의 임박 → Track A 우선.

## 검증
1. 신규 4문서 frontmatter+H1=파일명, 미해결 위키링크 0 → `canon-moc-sync`.
2. A2: 11블록 각 행에 심사항목·KPI 칸 존재 + **내용 셀 비어 있음**.
3. B1: `node session-telemetry.mjs < 테스트JSON` → intake 1행 → `aggregate.mjs` → 4파생 갱신. dry-run 후에만 등록.
4. B3: 4 excalidraw `elements>0`.
5. C1: Discord·Syncthing이 레지스트리·bootstrap·_tools-index에 모두 등장.

## 승인 게이트 (자율 금지)
- B1 settings.json `hooks.Stop` 등록 → 실행 직전 승인.
- 외부 공개/제출/푸시 → 6/29 대외비 게이트, 사람 승인.
- 구글폼(개인정보·자격증빙) → 팀 직접.

## 연결
- [[_02_전략_MOC]] · [[PLAN]] · [[PROGRESS]] · [[_HARNESS-SYSTEM]] · [[프롬프트-로그]] S16
