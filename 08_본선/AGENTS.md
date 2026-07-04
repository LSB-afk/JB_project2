---
tags:
  - area/system
  - type/guide
  - status/active
date: 2026-06-27
up: "[[본선 HOME]]"
aliases:
  - 에이전트협업
  - AGENTS
---
# 본선 에이전트 협업 계약 (Agent Collaboration Contract)

> ⚠️ 대외비 — 6/29 공식발표 전 비공개.
> 이 대회를 **운영하고 실제 일을 하는** 에이전트들이 충돌 없이 협업하고, 작업이 **자동으로 누적**되도록 하는 단일 계약. 모든 서브에이전트·세션은 이 규약을 따른다.

## 1. 원칙
1. **단일 출처(SSOT) 우선** — 사실·수치·에이전트명은 [[_canon|예선 Canon]] / [[JB금융그룹 Fin AI Challenge — 대회 안내 정본 (공식 전문)]] / [[본선-안내]]를 기준으로. 새 사실은 출처와 함께 기록.
2. **기록이 곧 작업** — 모든 의미 있는 작업은 끝나기 전에 `04_증빙/01_핵심로그/`에 한 줄이라도 남긴다(append-only).
3. **핸드오프 무손실** — 에이전트 간 인계는 아래 6블록 포맷을 강제.
4. **옵시디언 정합** — 내부 링크는 위키링크 `[[ ]]`, frontmatter 필수, 중복 파일명 금지([[hagent-os-구조-청사진]] §4).

---

## 2. 역할 분담 (14역할 — 읽는 파일 / 쓰는 파일 / 의사결정)

> 역할 상세 정의: `_system/agents/roles/*.md`
> ★ = 이번 본선에서 1급으로 승격/신설 (금융·준법·디자인)

### 의사결정 3분할
- **자율**: 해당 역할 분야의 검증·기록·분석은 사람 확인 없이 판단·실행.
- **제안→승인**: 범위 변경·코드 구현·문서 수정은 orchestrator 또는 사용자 확인 후 실행.
- **사람만**: 외부 제출·공개·고객 대상 액션은 반드시 사용자 명시적 승인.

| 역할 | 주 임무 | 읽기 | 쓰기 | 의사결정 | 모델 |
|------|---------|------|------|----------|------|
| **orchestrator** | 분해·위임·6블록 통합·SSoT·승인 게이트 | 전체 | `PROGRESS`, `decision-log`, `session-log`, MOC | 게이트 운영 | Opus |
| **finance-domain** ★ | 은행 여신·심사·사후관리·소상공인/전세/사기 실무 정합, JB 사업 연계, 고객여정 현실성 ("현직 RM/심사역" 관점) | `_canon`, `05_리서치`, `03_제품` | `02_전략`, `03_제품/01_prd` | 자율(도메인 검증) | Sonnet |
| **compliance-risk** ★ | 신용정보법·개인정보보호법·전자금융감독·내부통제, PII 비반출 거버넌스 정합, 환각·설명가능성·책임소재. **핵심 차별점 수호** | 법령·`06_증빙`, `03_제품/04_tech` | `06_증빙`, 거버넌스 문서 | 자율(규제 검증), 위반 시 게이트 | Sonnet |
| **research** | 사실·근거·출처·법규 확인(perplexity/context7 우선) | `07_원천`, 웹 | `02_전략`, `04_증빙/02_분석자료` | 자율(증빙) | Sonnet |
| **product** | 제품 정의·스코프·25항목 매핑·우선순위 | `02_전략`, `심사기준` | `03_제품/01_prd` | 제안→승인 | Sonnet |
| **designer** ★ | paperclip 기준 디자인시스템·IA·화면맵·발표 비주얼·Excalidraw | paperclip 분석, `03_제품/03_ux` | `03_제품/03_ux`, `assets`, `visualizations` | 제안→승인 | Sonnet |
| **visualization** ★ | 시각화 기획 선행·Excalidraw 자동생성·업그레이드 사이클·보드 데이터 품질 관리 | `VISUALIZATION-PLAN`, `PROGRESS`, 원장 CSV, 레지스트리 | `visualizations`, `viz-generator.mjs`, 원장 CSV | 자율(시각화 갱신), 새 보드 기획 선행 | Sonnet |
| **architect** ★ | 기술 아키텍처 리드(데이터모델·에이전트 런타임·로컬모델·API 계약·PII 아키텍처·배포). product와 builder 사이 시스템 설계 소유 | `_canon`, `00_vision`, `01_prd`, `05_리서치`, paperclip | `03_제품/04_tech`, `05_diagrams`, `06_build-roadmap` | 제안→승인; 갭정정 자율 | Sonnet |
| **builder** | 백엔드+프론트 구현·TDD·오프라인 구동(승인 후 코드) | `03_제품/04_tech`, `app` | `03_제품/app`, `tests` | 제안→승인; 버그 자율 | Sonnet |
| **data-engineer** | 공공데이터·ECOS·등기·HUG·RAG 파이프라인·데이터 모델(2026-07-02 후보→승격) | API 문서, `_canon §10`, `05_리서치` | `03_제품/04_tech`, 데이터 스키마 | 자율(수집·스키마); 외부 API 제안→승인 | Sonnet |
| **judge-qa** | 25항목 적합성·verify-implementation·심사 시뮬 | `05_제출`, `심사기준` | `04_증빙`, `05_제출/live-final-verification` | 자율(검증) | Sonnet |
| **evidence** | Capture-by-default 집행·intake append·기여 통계 | 전체 | `04_증빙/*`, `_system/telemetry`, `team` | 자율(증빙) | **Haiku** |
| **data-steward** ★ | 로그·텔레메트리·**커밋/푸시 통계**·리서치 로우데이터 독립 세션 전담(evidence 상위 운영자) | 전체 로그·CSV·`_결과` | `_system/telemetry`, `team`, 통계 문서 | 자율(데이터 관리) | Sonnet |
| **submission** | 패키징·README→SHARE-PACKAGE·피칭 | `05_제출`, `00_제출` | `05_제출`, `00_제출` | **사람만**(제출 확정) | Sonnet |

---

## 2-A. 후보 에이전트 (대비용 — 정의만, 필요 시 orchestrator가 승격)

> 상세 정의: `_system/agents/candidates/*.md`

| 역할 | 목적 | 승격 트리거 |
|------|------|-----------|
| **red-team-judge** | 적대적 심사위원 페르소나. 데모·발표를 깨려 시도해 약점 사전 발견 | 발표 리허설 전, 제출 패키지 완성 후 |
| ~~data-engineer~~ | → **활성 승격됨(2026-07-02)**. 위 역할표 참조. | (승격 완료) |
| **pitch-storyteller** | 발표 내러티브·스토리텔링·시간 배분 코치 | 7/4~5 발표 준비 2주 전 |
| **security** | 위협 모델·망분리·시크릿·취약점 (준법과 별도 기술 보안) | 코드 보안 검토 필요 시 |

---

## 2-B. 사람 4슬롯 ↔ 에이전트 클러스터 매핑 (실팀 확정 2026-07-03)

> 업무분장 근거 [[업무분장-작업로그]]. 발표 총괄=김민주, **발표자(등단)는 미정**.

| 슬롯 | 담당(실명) | 실제 분장 | 주 에이전트 클러스터 | 후보 |
|------|------|------|-------------------|------|
| **슬롯 A** (문서·제출물·서사) | **김주용** | 문서·기능구조·제출문서·발표흐름 초안·"왜 하나의 AX 콘솔인가" 서사·스킬/플러그인 | submission + product | pitch-storyteller |
| **슬롯 B** (개발) | **이승보** | 프로토타입·설계도·은행 DB 연결 명문화 | builder + architect | data-engineer · security |
| **슬롯 C** (디자인·발표) | **김민주** | 디자인 토큰·화면 톤·발표 전반·이름/슬로건·승인 UX | designer | — |
| **슬롯 D** (외부확인·리서치) | **최영욱** | 공공데이터·KIPRIS 상표·전세/피싱 출처·은행 자동화 vs 차별점 GPT딥리서치 | research | — |

> **finance-domain · compliance-risk = AI(Sonnet) 전담** — 전담 금융/준법 인력이 사람 슬롯에 없음(최영욱=외부확인 리서치가 금융 사실 보조). PII 비반출·규제 게이트는 AI가 설계 첫날부터 수호.
> evidence · visualization · judge-qa · red-team = AI 주도 + 팀 공유 (특정 슬롯에 고정하지 않음)

---

## 3. 핸드오프 출력 포맷 (6블록 — 모든 서브에이전트 최종 메시지)

```
1. Task        — 무엇을 했나 (1줄)
2. Inputs      — 읽은 파일/근거
3. Output      — 만든/수정한 파일 경로
4. Assumptions — 가정한 것
5. Open risks  — 미해결·불확실
6. Next action — 다음에 할 일 (담당 역할 에이전트 지정)
```

---

## 4. 자동 누적 규약 (Append-only)
모든 세션·에이전트는 작업 종료 시 아래에 **추가**한다(덮어쓰기 금지):
- 사용자 프롬프트 원문 → [[프롬프트-로그]]
- 의사결정(선택·이유·대안) → [[decision-log]]
- 세션 요약(한 일·결과·다음) → [[session-log]]
- 위 3종의 인덱스/상태 → [[master-evidence-ledger]]
- **텔레메트리 1행** → `_system/telemetry/ai-session-intake.csv` (컬럼: ts, engine, agent, member_slot, domain, task, tokens_in, tokens_out, duration, tools, exact|estimate, prompt_ref)
- **시각화 갱신** → 새 문서·원장·로그 변화가 보드에 영향을 주면 [[VISUALIZATION-PLAN]]을 먼저 갱신하고 [[visualization-cycle]]로 재생성·검증한다.

> **완전 자동화(선택)**: Claude Code Stop 훅으로 세션 종료 시 `session-log`에 타임스탬프 항목을 자동 append 가능. 와이어링은 `update-config`로 settings.json에 등록(사용자 승인 후). 미적용 시에도 위 규약을 수동 준수.

---

## 4-A. 운영 자동화 스킬 — AI 자동 시행 규약
> ⚠️ **사용자가 지시하지 않아도** 아래 트리거에 해당하면 AI(Claude/Codex)는 **스스로 해당 스킬을 시행**한다. 팀원은 바뀐 사실을 몰라도, AI를 쓰는 한 문서·기록이 일관되게 누적·정합된다. 스킬 목록·상태 = [[registry-skills]].

| 트리거(이 상황이면) | 시행 스킬 | 무엇을 |
|---|---|---|
| **본선(08_본선) 작업 세션 시작·인수인계** | [[session-boot]] | 진입점·현재상태(미커밋·미해결·다음)·자동스킬·게이트를 `boot.mjs` 스냅샷으로 로드 → 3~5줄 브리핑. CLAUDE.md가 자동 호출. |
| **파일을 새로 만들거나 이동/이름변경** | [[canon-moc-sync]] | 부모(up)·태그·MOC링크·**죽은링크([4/5])·도달성([5/5] 조상→자식 네비)** 검증. 누락 시 `--apply` 또는 부모 인덱스에 링크. **새 노트는 frontmatter(area/type/status)+up 필수.** |
| **세션 체크포인트·종료** | [[harness-sync]] | 텔레메트리 집계·레지스트리·MOC·시각화·PII를 일괄 동기화(자동 단계). |
| **회의 녹취(.txt) 공유·"회의록 기록"** | [[meeting-intake]] | 원문(gitignore)+회의록(추적)+INDEX·메모리·거버넌스 일관 기록. |
| **세션 종료·"프롬프트 기록/남겨라"** | [[prompt-capture]] | 세션 사용자 프롬프트를 분기코드(S/R/T…)로 분류해 [[프롬프트-로그]]에 멱등 append. |
| **새 도구(플러그인·CLI·MCP·스킬) 추가·설치·검토** | [[tool-intake]] | 출처검증→**SkillSpector 보안스캔**→레지스트리 등록→bootstrap 게이트→AI 메모리 트리거→로그. settings.json·bootstrap은 승인 게이트. |
| **제품정의·MVP범위·시나리오 변경 / 제출물 갱신 전** | [[submission-consistency-check]] | 제출·발표 문서 간 히어로 시나리오·범위·검증기준·제품정의 불일치 교차 감사(보고만, 제출은 사람 승인). |
| **문서·원장 변경이 보드에 영향 / 시각화 가독성 피드백** | [[visualization-cycle]] | VISUALIZATION-PLAN 선행 갱신 후 Excalidraw 재생성·간트 갭·5초 가독성·사람/AI/기여 레이어 검증. |
| **로그·산출물에 PII 유입 우려** | [[pii-governance-validator]] / `pii-scan.mjs`(Stop훅) | 한국 PII 패턴 스캔·마스킹 경고. |
| **핵심로그(session-log/decision-log/프롬프트-로그)에 새 항목 append** | [[log-toc]] | `<!-- TOC:AUTO -->` 목차 블록 재생성 — 매번 전체를 안 읽어도 항목 탐색 가능. harness-sync 7단계에도 포함. |

**핵심 규칙(부모-자식 정합)**: 새로 생성되는 **모든** 파일은 부모(up)와 자식이 잘 연결되어 **조상(본선 HOME)에서부터 타고 내려갈 수 있어야** 한다. 작업 끝에 `canon-moc-sync`의 `[5/5] 도달성`이 ✓인지 확인한다(고아=`✗`로 표시됨).

**링크 측정 규율**: 링크·부모·도달성이 "깨졌다"는 판단은 **직접 grep으로 단정하지 말고 `canon-moc-sync`로** 한다. 직접 스캐너를 짜면 **NFC·이스케이프파이프(`\|`)·볼트루트 절대경로·중복 basename**을 반드시 처리하라 — 이 함정으로 Codex·Sonnet·BFS가 "65% 깨짐"·"유령 부모"를 반복 오판했다(전부 측정오류). 결과가 기준(깨진 부모 0)과 크게 다르면 **파일이 아니라 스캐너를 의심**하라.

---

## 5. 지식 우선순위 (LLM-Wiki-First)
raw 원천을 매번 다시 읽기 전에 정제된 지식을 먼저 본다: [[_MOC_HOME|본선 MOC]] → 섹션 MOC → `03_제품` 정본 → 그래도 없으면 `07_원천`/웹.

**리서치는 요약 먼저(Summary-First).** 딥리서치 결과(`04_증빙/02_분석자료/리서치/02_결과-원문/`)를 소비할 때는 **[[_요약-인덱스]] → `[[Dxx-요약]]`(⚡30초·🎯바로 쓸 것·🙋전문가 Q&A·⚠️한계)를 먼저 읽고**, 근거·수치·인용이 필요할 때만 원문 `Dxx-결과-원문.md`를 연다. 각 원문 상단 `📄 요약 먼저` 콜아웃이 요약으로 되돌린다. 요약이 없거나 낡았으면 **codex(gpt-5.4)로 재생성**(4병렬 배치) — 출처 [[_모델-실행기록]].

---

## 6. 연결
- [[본선 HOME|본선 홈]] · [[project-dashboard|운영 대시보드]] · [[hagent-os-구조-청사진|구조 청사진]]
- 역할 상세: [[_system/agents/roles/orchestrator|orchestrator]] · [[_system/agents/roles/finance-domain|finance-domain]] · [[_system/agents/roles/compliance-risk|compliance-risk]] · [[_system/agents/roles/research|research]] · [[_system/agents/roles/product|product]] · [[_system/agents/roles/architect|architect]] · [[_system/agents/roles/designer|designer]] · [[_system/agents/roles/visualization|visualization]] · [[_system/agents/roles/builder|builder]] · [[_system/agents/roles/data-engineer|data-engineer]] · [[_system/agents/roles/judge-qa|judge-qa]] · [[_system/agents/roles/evidence|evidence]] · [[_system/agents/roles/submission|submission]] · [[_system/agents/roles/data-steward|data-steward]]
- 후보: [[_system/agents/candidates/red-team-judge|red-team-judge]] · [[_system/agents/candidates/pitch-storyteller|pitch-storyteller]] · [[_system/agents/candidates/security|security]]
