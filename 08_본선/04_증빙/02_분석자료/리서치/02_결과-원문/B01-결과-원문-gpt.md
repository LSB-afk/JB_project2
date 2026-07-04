---
tags:
  - area/product
  - type/reference
  - status/active
date: 2026-07-01
up: "[[_운영-회수현황]]"
aliases:
  - B1-결과
  - B1-rolemodel-oss-result
---
> 📄 **요약 먼저** → [[B01-요약]] · 상세가 필요할 때만 아래 원문을 본다.

> 원본 파일: `20260701_JB_LocalGuard_OS를_위한_오픈소스_롤모델_벤치마크.docx`
> 회수 2026-07-01 · ⚠️ 대외비 · **사용 모델: ChatGPT Deep Research (GPT)** · 프롬프트: [[B1-롤모델-오픈소스-벤치마크]]
> ✅ **결론**: 기능=**StackStorm**(승인게이트·이력, Apache-2.0, 난이도 S) + **Temporal**(append-only 이벤트·Signal 승인, MIT) / 디자인=**Carbon**(엔터프라이즈 토큰·테이블, Apache-2.0) + **Tremor**(대시보드 블록). ⚠️ TheHive·Windmill·n8n·Midday·Twenty·Grafana = **AGPL/GPL/fair-code 오염 → 화면 클린룸 재구현만**.
> 🔄 **2026-07-01 위상 갱신**: 사용자 제공 **paperclip(MIT)** = **Phase 2 디자인+아키텍처 1차 본보기 확정** — 우리 제품과 구조 동일(Case/Agent/Approval/Audit·조직도·승인큐·감사로그)·한 앱에 토큰·IA·라우터·데이터·에이전트운영 일체. 본 결과의 Carbon/Tremor=**토큰 규율 보조**, StackStorm/Temporal=**서버계약 개념 보조**로 강등. 상세 티어다운: [[paperclip-소스-티어다운]].

---

# JB LocalGuard OS를 위한 오픈소스 롤모델 벤치마크

이 리서치의 결론을 먼저 말하면, **기능 롤모델은 StackStorm와 Temporal의 조합이 가장 현실적**이고, **디자인 롤모델은 Carbon을 중심으로 Tremor식 대시보드 레이아웃을 클린룸 재구현하는 방식이 가장 안전**합니다. 이유는 단순합니다. StackStorm는 지금 당장 가져오기 좋은 **승인 게이트·일시정지·실행 이력 패턴**을 이미 문서와 코드 구조로 드러내고 있고, Temporal은 **append-only 이벤트 히스토리와 signal 기반 human approval**라는 서버 계약의 정석을 제공합니다. Carbon은 IBM 계열의 **신뢰감 있는 엔터프라이즈 토큰·타이포·테이블 규율**을 제공하고, Tremor는 **차트+카드+필터 패턴**을 빠르게 벤치마크하기 좋습니다. 반대로 TheHive, Windmill, n8n, Midday, Twenty, Grafana 계열은 기능·화면은 훌륭하지만 **AGPL/GPL 또는 fair-code 계열 라이선스** 때문에 “소스 lift”는 위험하고, 대부분 React/TS/Svelte/Next 결합이라 **바닐라 JS 런타임으로 통째 이식**하는 것은 비현실적입니다. [\[1\]](https://github.com/stackstorm/st2)

## 기능 후보 숏리스트 표

| 프로젝트 | 한 줄 정체 | 운영계약 매핑 | 라이선스 | 스택 | 성숙도 | 리프트 대상 | 이식난이도 | 출처 |
|----|----|----|----|----|----|----|----|----|
| **StackStorm** | 이벤트 기반 운영 자동화·SOAR 계열 플랫폼 | **Case ✖ / AgentRun ✅ / Agent ◐ / Skill ✅ / Evidence ◐ / Approval ✅ / Audit ✅**. `core.ask`가 워크플로를 `paused`로 멈추고 응답 JSON schema로 재개, 실행 이력이 audit trail로 남음. | **Apache-2.0**. 안전한 편. | Python 중심, rules/workflows/actions, 별도 Web UI. | **상**. 6.5k stars, latest 3.9.0, 2026-01 기준 актив. | `Inquiry` 상태기계, `paused/pending` 승인 큐, 응답 schema, 실행 이력 모델, 알림 rule 패턴. **서버 계약은 수일 내 모사 가능**. | **S** | [\[2\]](https://github.com/stackstorm/st2) |
| **Temporal** | Durable execution 엔진 | **Case ✖ / AgentRun ✅ / Agent ✖ / Skill ✖ / Evidence ◐ / Approval ✅ / Audit ✅**. Signal로 human approval, Event History가 append-only 로그 역할. | **MIT**. 매우 안전. | 코어 Go, 다수 SDK, Web UI. | **상**. Temporal 공식은 “100% open-source, MIT-licensed”와 21k+ stars를 전면에 표기. | `AgentRun`을 워크플로 실행으로, `Approval`을 Signal로, `Audit`를 Event History로 모델링. **개념·API 계약 차용은 매우 좋지만 엔진 자체 도입은 수일 안에 불가**. | **M** | [\[3\]](https://temporal.io/?utm_source=chatgpt.com) |
| **Dify** | 에이전트 워크플로 개발 플랫폼 | **Case ✖ / AgentRun ✅ / Agent ✅ / Skill ✅ / Evidence ◐ / Approval ✅ / Audit ◐**. Human Input 노드가 워크플로를 pause하고 form token으로 재개. | **Apache-2.0**. 안전한 편. | TypeScript + Python. | **상**. 147k stars, latest 1.15.0 on 2026-06-25. | 승인 폼 UX, `human_input_required` 이벤트, paused-form API, tool/provider permission YAML. **개념·API·UI IA는 차용 가능, 런타임 컴포넌트 lift는 비현실적**. | **M** | [\[4\]](https://github.com/langgenius/dify) |
| **Windmill** | 스크립트·UI·워크플로 엔진 | **Case ✖ / AgentRun ✅ / Agent ◐ / Skill ✅ / Evidence ◐ / Approval ✅ / Audit ✅**. Suspend/Approval step와 audit logs가 공식 기능. | **혼합**: AGPL-3.0 + Apache-2.0 + unknown LICENSE. **오염 경고**. | Rust backend + Svelte/TS frontend. | **상**. 17k stars, latest 2026-06-29. | 승인 step UX, suspend/resume URL 개념, job detail/log metadata, granular permission IA. **소스 lift는 위험, 행위 모델만 참고**. | **M** | [\[5\]](https://github.com/windmill-labs/windmill) |
| **n8n** | 비즈니스 자동화 + AI 워크플로 | **Case ✖ / AgentRun ✅ / Agent ✅ / Skill ✅ / Evidence ◐ / Approval ✅ / Audit ◐**. AI agent tool-level human approval, Wait node, executions UI, RBAC. | **Sustainable Use License + EE carve-outs**. **OSI permissive 아님**. | TypeScript/Node. | **상**. 활발한 문서·릴리스, 광범위한 사용자층. | tool-level approval의 UX/카피, wait/resume semantics, executions list/filters, redaction settings. **행위·IA만 참고**. | **M** | [\[6\]](https://raw.githubusercontent.com/n8n-io/n8n/master/LICENSE.md) |
| **Trigger.dev** | 장기 실행 AI agent/workflow 런타임 | **Case ✖ / AgentRun ✅ / Agent ✅ / Skill ◐ / Evidence ◐ / Approval ✅ / Audit ✅**. Waitpoint tokens가 human-in-the-loop approval, tracing/logging built-in. | **Apache-2.0**. 안전한 편. | TypeScript 98.8%. | **중상**. 16k+ stars, 활발한 pre-release cadence. | waitpoint token 모델, realtime run status, tracing/logging 정보구조. **개념은 훌륭하지만 React/TS 종속이 커서 UI는 레퍼런스 전용**. | **M** | [\[7\]](https://github.com/triggerdotdev/trigger.dev) |
| **TheHive** | 보안 사고 케이스 관리 플랫폼 | **Case ✅ / AgentRun ◐ / Agent ◐ / Skill ◐ / Evidence ✅ / Approval ✖ / Audit ✅**. Cases·observables·task logs·audit logs는 강함. 승인 게이트는 약함. | **AGPL-3.0**. **오염 경고**. | Scala + JS/HTML. | **중**. 공개 OSS는 archived, 최신 유지판은 commercial. | `Case/Observable/Task log/History` 정보 구조, evidence 중심 케이스 IA. **현재는 소스보다 계약·용어 수준 차용만 권장**. | **M** | [\[8\]](https://github.com/TheHive-Project/TheHive) |
| **Langflow** | AI agent/workflow low-code 빌더 | **Case ✖ / AgentRun ✅ / Agent ✅ / Skill ✅ / Evidence ◐ / Approval ✖ / Audit ◐**. 자체 Traces와 MCP server는 좋지만 정식 approval gate는 약함. | **MIT**. 안전. | Python 기반, 시각 편집기 + API/MCP. | **상**. 150k+ stars 계열, traces 기본 제공. | trace detail IA, flow activity 화면, MCP/API 키 permission 개념. **UI 컴포넌트 lift는 불가, 관측 UX 패턴은 참고 가능**. | **M** | [\[9\]](https://github.com/windmill-labs/windmill) |
| **Flowise** | 시각형 AI agent builder | **Case ✖ / AgentRun ✅ / Agent ✅ / Skill ✅ / Evidence ◐ / Approval ✖ / Audit ◐**. Prometheus/OpenTelemetry/Analytics와 credential RBAC는 강점, approval gate는 약함. | **Apache-2.0**. 안전. | TypeScript/Node. | **상**. 41k+ stars, 활발한 문서 업데이트. | credentials 암호화, chatflow-level API key, node-by-node analytics/monitoring IA. **서버 보안 설정 아이디어 차용 가치 있음**. | **M** | [\[10\]](https://github.com/flowiseai/flowise) |

### 기능 측면의 냉정한 판정

**당장 JB LocalGuard OS와 구조적으로 가장 닮은 것은 StackStorm와 TheHive 사이 어딘가**입니다. TheHive는 `Case/Evidence/Audit`가 강하고, StackStorm는 `AgentRun/Approval/Audit`가 강합니다. 그러나 **실제로 며칠 안에 가져오기 쉬운 쪽은 StackStorm**입니다. 이유는 `core.ask`와 `inquirer runner`가 승인 게이트를 **명시적 상태 전이**로 보여주고, 실행 결과를 **audit trail**로 다루기 때문입니다. TheHive는 케이스 운영 화면과 증거 구조는 훌륭하지만, 현재 공개 OSS 계보가 archive 상태이고 최신 유지판은 commercial이라 롤모델 가치는 있어도 **차용 안전성은 낮아졌습니다**. [\[11\]](https://docs.stackstorm.com/inquiries.html)

**human-in-the-loop 승인 게이트를 “코드로 실제 구현”한 것이 가장 분명한 후보는 StackStorm, Dify, Windmill, n8n, Trigger.dev**입니다. StackStorm는 `core.ask`와 `inquirer` runner가 워크플로를 `paused`로 멈추고 JSON schema 응답으로 재개합니다. Dify는 Human Input 노드가 `human_input_required` 이벤트와 `form_token`을 발행한 뒤 API로 재개합니다. Windmill은 suspend/approval step과 resume URLs를 노출합니다. n8n은 AI agent의 특정 tool 실행 전에 human review를 강제합니다. Trigger.dev는 waitpoint token을 approval workflow의 원시 primitive로 둡니다. 반면 Temporal은 승인 UI를 내장한 제품이라기보다, **Signal과 Event History로 승인 그 자체를 여러분이 구현하는 엔진**입니다. [\[12\]](https://docs.stackstorm.com/inquiries.html)

### 승인·감사 구현 위치

StackStorm에서 승인 게이트는 공식 문서상 `core.ask` **action +** `inquirer` **runner + inquiry resource**에 있고, 승인 후 워크플로 재개는 `Inquiry` 응답으로 일어납니다. 알림 연결은 `core.st2.generic.inquiry` trigger와 rule로 붙입니다. 감사 추적은 README가 **“historical list of action executions”**를 명시하고, 실행 개체 모델은 `st2common/models/db/liveaction.py` 등 실행 모델 계층에 놓여 있습니다. [\[13\]](https://docs.stackstorm.com/inquiries.html)

Dify는 승인 게이트가 공식적으로 **Human Input node / Human Input API /** `workflow_run.py` **/** `models/workflow.py` 축에 걸쳐 있습니다. 문서에서 `form_token`과 `human_input_required`를 설명하고, 레포에는 human-input URL 빌드와 workflow pause 모델 필드가 드러납니다. 다만 **변조방지 audit trail까지는 StackStorm·Temporal만큼 강하게 주장하기 어렵고**, 여기서는 workflow-run archive/log 수준으로 보는 것이 보수적입니다. [\[14\]](https://docs.dify.ai/en/cloud/use-dify/nodes/human-input?utm_source=chatgpt.com)

Temporal의 human approval 구현은 공식적으로 **Signal/message passing** 패턴에 위치합니다. Event History는 모든 명령/신호를 기록하고, 승인 여부는 `WorkflowExecutionSignaled` 이벤트까지 포함해 이력으로 남습니다. 이것은 “승인 UI”가 아니라 **감사 가능한 승인 메커니즘의 엔진 레벨 primitive**입니다. [\[15\]](https://docs.temporal.io/develop/python/workflows/message-passing?utm_source=chatgpt.com)

## 디자인 롤모델 표

| 대상 | 정체 | 따라할 패턴 | 라이선스 | 바닐라-JS 이식성 | 신뢰감 이유 | 출처 |
|----|----|----|----|----|----|----|
| **Carbon** | IBM의 오픈소스 엔터프라이즈 디자인 시스템 | **구체적으로 따라할 것**: 테마 토큰 기반 색상 교체, productive typography(14px `body-long-01`), data table 구조, 4-테마 체계(White/Gray 10/Gray 90/Gray 100). | **Apache-2.0** | **높음**. 토큰/CSS/IA 차용에 최적. React 런타임 lift는 불필요. | IBM 제품군이 써온 “무겁지만 믿을 만한” 톤이 그대로 나옴. | [\[16\]](https://raw.githubusercontent.com/carbon-design-system/carbon/main/LICENSE) |
| **Radix Themes** | 접근성 중심 테마/컴포넌트 체계 | **구체적으로 따라할 것**: 9-step spacing scale(4/8/12/16/24/32/40/48/64), radius 옵션, 색상 스케일(light/dark/alpha), form field의 안정된 기본 상태. | **MIT** | **중간**. React 런타임은 못 쓰지만 spacing/radius/color 규칙은 즉시 이식 가능. | 작은 토큰 결정들이 일관돼 보여서 “기본기가 좋다”는 인상을 줌. | [\[17\]](https://github.com/radix-ui/primitives/blob/main/LICENSE?utm_source=chatgpt.com) |
| **Tremor** | 대시보드/차트 중심 UI 라이브러리 | **구체적으로 따라할 것**: KPI 카드-차트-범례-필터 블록, 대시보드 섹션ing, “copy-and-paste 가능한” chart recipes. | **Apache-2.0** | **중간**. React 코드 자체는 못 옮기지만 블록 IA와 화면 구성은 옮기기 좋음. | 운영 콘솔에서 중요한 “읽히는 밀도”가 높고 KPI→드릴다운 흐름이 좋다. | [\[18\]](https://github.com/tremorlabs/tremor?utm_source=chatgpt.com) |
| **Midday** | 프리랜서용 재무 운영 앱 | **레퍼런스 전용**: `Financial Overview` 인접 도메인이라 금융 콘솔 톤 참고 가치가 큼. 다만 공개 문서에서 토큰/규칙 추출은 제한적이라 **세부 패턴은 \[미검증\]**. | **AGPL-3.0 + 상용 조건 언급** | **낮음**. Next/React/TS 모노레포. | 금융 수치·개요 카드 중심 IA가 도메인 핏이 좋다. | [\[19\]](https://github.com/midday-ai/midday) |
| **Twenty** | 오픈소스 CRM | **레퍼런스 전용**: RM/CRM 관점의 레코드 밀도와 탐색 구조 참고 후보. 다만 접근 가능한 설계 문서 범위에서 **구체 토큰·컴포넌트는 \[미검증\]**. | **대부분 AGPL/GPL 계열 + Enterprise 상용 조항** | **낮음**. TypeScript 대형 모노레포. | CRM 맥락의 리스트/객체 중심 정보구조가 LocalGuard OS의 RM 콘솔과 인접하다. | [\[20\]](https://github.com/twentyhq/twenty) |

### 디자인에서 실제로 베껴 올 수 있는 것

디자인 쪽에서 **합법적·현실적으로 lift 가능한 것은 거의 전부 “토큰, 규칙, IA, 레이아웃”**입니다. Carbon의 productive typography, 테이블 밀도, 다크/라이트 테마 토큰화는 **바닐라 JS + 문자열 템플릿 + CSS 변수**로 2~3일 내 이식할 수 있습니다. Radix는 spacing/radius/color scale이 특히 좋고, Tremor는 KPI 카드와 차트 블록 배치법이 좋습니다. 반면 Midday/Twenty 같은 앱은 **화면 인상(reference)**은 얻을 수 있지만, AGPL/GPL과 React/Next 러닝타임 때문에 **코드를 가져오는 순간부터 리스크가 커집니다**. 결국 여러분 스택에서는 “컴포넌트 소스 reuse”가 아니라 “token + DOM 구조 + CSS state rule clean-room 재구현”이 정답입니다. [\[21\]](https://raw.githubusercontent.com/carbon-design-system/carbon/main/LICENSE)

## Top 추천

### StackStorm

**왜 우리 롤모델인가:** `Case → Approval → Resume → Audit`에 필요한 인간 승인 루프를 가장 직접적으로 보여줍니다. `core.ask`는 승인 질문을 생성하고, 워크플로는 `paused`, 실행은 `pending`, 승인 응답은 JSON schema로 검증됩니다. 이런 구조는 JB LocalGuard OS의 `Approval`을 별도 엔티티로 두고 `AgentRun.status = waiting_approval`로 두는 현재 방향과 매우 잘 맞습니다. 또한 새 inquiry가 들어오면 trigger/rule로 Slack 등 외부 채널에 알릴 수 있어, “승인 큐 + 라우팅 + 재개” 패턴을 거의 그대로 개념 차용할 수 있습니다. [\[22\]](https://docs.stackstorm.com/inquiries.html)

**며칠 내 리프트 가능 범위:**\
여러분 스택 기준으로는 다음이 **3~5일 안에 가능**합니다.\
`Approval` 스키마, `paused/pending/approved/rejected/expired` 상태 열거형, 승인 응답 schema, 알림 route, 실행 이력의 최소 필드(`triggered_by`, `started_at`, `ended_at`, `input_snapshot`, `output_snapshot`, `approval_snapshot`) 설계입니다. 이건 서버 API 승격 전에도 localStorage mock으로 먼저 붙일 수 있습니다. 반면 StackStorm의 실제 엔진, rule bus, pack ecosystem은 **며칠 안에 복제 불가**입니다. [\[23\]](https://docs.stackstorm.com/inquiries.html)

**리스크:** Python 기반 엔진과 UI를 가져오는 건 의미가 거의 없고, 챙겨야 할 것은 **행위 계약만**입니다. 소스 자체를 가져오려는 순간 여러분 스택과 거리가 벌어집니다. [\[24\]](https://github.com/stackstorm/st2)

### Temporal

**왜 우리 롤모델인가:** LocalGuard OS가 장기적으로 서버 API로 승격될 때 가장 아픈 지점은 “에이전트 실행이 며칠 걸리거나, 승인 대기로 멈추거나, 재시도/복구되면서도 감사 가능한가”입니다. Temporal은 이 문제에 대한 업계 표준급 해답입니다. human approval은 Signal로 넣고, 모든 단계는 Event History에 남습니다. 즉, `AgentRun`을 durable workflow로, `Approval`을 signal message로, `Audit`를 event stream으로 보는 설계를 학습할 가치가 매우 큽니다. [\[25\]](https://docs.temporal.io/ai-cookbook/human-in-the-loop-python?utm_source=chatgpt.com)

**며칠 내 리프트 가능 범위:**\
**2~4일 안에 가능한 것**은 Temporal을 직접 붙이는 게 아니라, **Temporal식 계약을 자체 API에 반영**하는 일입니다. 예를 들면 `agent_runs/{id}/signals/approve`, `agent_runs/{id}/events`, `agent_runs/{id}/visibility` 같은 API shape, append-only `audit_events` 테이블, case-detail 오른쪽 패널의 이벤트 타임라인. 반면 실제 Temporal 클러스터 도입, 워커 설계, namespace/visibility store 운영은 **며칠짜리 작업이 아닙니다**. [\[26\]](https://docs.temporal.io/develop/python/workflows/message-passing?utm_source=chatgpt.com)

**리스크:** 제품 자체가 아니라 **서버 계약의 롤모델**로 써야 합니다. 바닐라 JS UI에 바로 도움이 되는 건 적고, 백엔드 승격 후에야 진가가 납니다. [\[27\]](https://docs.temporal.io/?utm_source=chatgpt.com)

### Carbon

**왜 우리 롤모델인가:** 은행권 운영 콘솔에서 가장 중요한 것은 “멋짐”보다 **읽히는 규율**입니다. Carbon은 그 규율이 문서화돼 있습니다. productive type, 테마 토큰, data table 구조, 4개 테마가 모두 명확합니다. 여러분이 원하는 “신뢰감 있고 공공/금융 UI처럼 보이는” 느낌은 Carbon 쪽이 가장 빠르고 안전하게 낼 수 있습니다. [\[28\]](https://carbondesignsystem.com/?utm_source=chatgpt.com)

**며칠 내 리프트 가능 범위:**\
**2~3일 안에 가능한 것**은 CSS 변수를 중심으로 한 색상 토큰, typography scale, 8px 계열 spacing, 버튼/폼/테이블 상태 규칙, 다크 테마 대응입니다. 즉 `--bg`, `--surface`, `--text-primary`, `--text-secondary`, `--border-subtle`, `--focus` 같은 토큰 체계와, dense table row heights, section spacing, drawer shell을 바로 설계할 수 있습니다. React 컴포넌트는 필요 없습니다. [\[29\]](https://raw.githubusercontent.com/carbon-design-system/carbon/main/LICENSE)

**리스크:** Carbon을 그대로 쓰면 IBM스러움이 너무 강해질 수 있습니다. 따라서 **토큰·간격·정보구조만 가져오고, 브랜딩은 따로 입혀야** 합니다. [\[30\]](https://v10.carbondesignsystem.com/guidelines/themes/overview/?utm_source=chatgpt.com)

### Tremor

**왜 우리 롤모델인가:** Carbon이 “규율”을 준다면 Tremor는 “대시보드 블록 구조”를 줍니다. LocalGuard OS는 결국 KPI 카드, 케이스 큐, 승인 큐, 리스크 신호 시각화, 실행 타임라인이 한 화면에 공존해야 합니다. Tremor는 차트·카드·필터 블록의 배치를 빠르게 참고하기 좋습니다. [\[31\]](https://github.com/tremorlabs/tremor?utm_source=chatgpt.com)

**며칠 내 리프트 가능 범위:**\
**1~2일 안에 가능한 것**은 KPI strip, chart card head/footer 구조, legend placement, filter bar, empty/error/loading states의 DOM 구조입니다. React 구현체는 못 쓰지만, HTML 문자열 템플릿으로 충분히 재현 가능한 수준의 패턴입니다. [\[32\]](https://www.tremor.so/docs/visualizations/bar-chart?utm_source=chatgpt.com)

**리스크:** Tremor는 Tailwind/React 전제라 “예쁘다”는 이유로 소스까지 가져가면 오히려 멀어집니다. **layout recipe만** 쓰는 게 맞습니다. [\[33\]](https://github.com/tremorlabs/tremor?utm_source=chatgpt.com)

## 라이선스 경고 박스

**강한 경고가 필요한 후보**는 TheHive, Windmill, Midday, Twenty, Grafana입니다. TheHive는 **AGPL-3.0**이고 공개 OSS 계보가 archive입니다. Windmill은 레포에 **AGPL-3.0 + Apache-2.0 + unknown LICENSE**가 함께 존재합니다. Midday는 레포 README에 **AGPL-3.0 for non-commercial use**와 commercial-use 문의를 병기합니다. Twenty는 LICENSE에서 **대부분 GPL/AGPL 계열 + Enterprise 상용 파일**을 명시합니다. Grafana는 기본적으로 **AGPL-3.0-only**입니다. 이들에서 **소스 코드, CSS, 컴포넌트, 템플릿을 직접 lift**하는 것은 경연 제출물이나 향후 폐쇄형 제품에 라이선스 오염 리스크가 있습니다. 화면을 보고 **클린룸 재구현**하는 정도로만 다루는 것이 안전합니다. 법률 자문은 아니지만, 보수적으로 보면 이 선을 넘지 않는 편이 맞습니다. [\[34\]](https://github.com/TheHive-Project/TheHive/blob/main/LICENSE?utm_source=chatgpt.com)

**안전한 대안**은 StackStorm, Temporal, Dify, Trigger.dev, Langflow, Flowise, Carbon, Radix Themes, Tremor입니다. 각각 **Apache-2.0 / MIT 계열**이거나, 적어도 레포 LICENSE 기준에서 permissive로 분류됩니다. 다만 여기서도 주의할 점은, permissive라고 해서 **React/TS 런타임을 바닐라 JS에 그대로 이식할 수 있는 것은 아니라는 점**입니다. 안전한 것과 쉬운 것은 다릅니다. 여러분에게 안전하면서 쉬운 것은 **토큰·IA·API 계약·상태기계·데이터 스키마**입니다. [\[35\]](https://github.com/stackstorm/st2)

## 현실 점검

질문의 핵심인 **“며칠 안에 OSS급으로 작동하게 만들 수 있는가”**에 대해 냉정하게 답하면, **예, 일부는 가능하지만 엔진 전체는 불가능**입니다. 가능한 것은 **운영계약의 껍데기와 핵심 UX**입니다. 예를 들면 `Case → AgentRun → Evidence → Approval → Audit`의 최소 데이터 계약, 승인 대기 상태, 승인 인박스, 케이스 타임라인, 실행 이력 패널, approval form, tool/action preview, evidence attachment list, audit event append log, role check stub는 **며칠 단위로 만들 수 있습니다**. StackStorm의 inquiry 흐름, Dify의 Human Input 폼, Carbon의 productive tokens를 참고하면 이건 충분히 현실적입니다. [\[36\]](https://docs.stackstorm.com/inquiries.html)

반대로 **처음부터 재구현해야 하는 것**도 분명합니다. Durable workflow engine, 분산 워커, 버전 잠금, exactly-once에 가까운 side-effect 통제, tamper-evident 감사 저장, 장기 보존·export, fine-grained tool entitlement, 대규모 plugin ecosystem, multi-tenant SSO/RBAC 운영 UI는 **며칠 안에 못 합니다**. 특히 Temporal/Trigger.dev/Windmill/n8n이 제공하는 런타임 성질은 화면 모사와 차원이 다릅니다. 이 부분은 “OSS급으로 보이는 콘솔”과 “OSS급 엔진”을 분리해서 생각해야 합니다. 전자는 가능하지만, 후자는 아닙니다. [\[37\]](https://docs.temporal.io/encyclopedia/event-history?utm_source=chatgpt.com)

따라서 가장 현실적인 실행 계획은 이렇습니다.\
**첫째**, UI/정보구조는 Carbon + Tremor 레퍼런스로 바닐라 CSS/HTML로 재구현합니다.\
**둘째**, 서버 승격 전까지는 localStorage로 `Case`, `AgentRun`, `Approval`, `AuditEvent`의 계약을 먼저 굳힙니다.\
**셋째**, approval gate는 StackStorm/Dify식으로 먼저 만들고, 나중에 Temporal식 event history로 백엔드 승격을 준비합니다.\
이 조합이면 “며칠 안에 작동하는 데모”와 “나중에 서버로 승격 가능한 계약”을 동시에 잡을 수 있습니다. [\[38\]](https://github.com/stackstorm/st2)

## 근거표

| 주장 | 출처 URL | 발행처·날짜·버전 | 신뢰도 | 원문 짧은 인용 | 갭 / \[미검증\] | 근거 |
|----|----|----|----|----|----|----|
| StackStorm는 승인 질문으로 워크플로를 멈출 수 있다 | `https://docs.stackstorm.com/inquiries.html` | StackStorm Docs, 3.9.0 | 1차 | “pause a workflow” | 없음 | [\[39\]](https://docs.stackstorm.com/inquiries.html) |
| StackStorm의 승인 action은 `core.ask` + `inquirer` runner다 | `https://docs.stackstorm.com/inquiries.html` | StackStorm Docs, 3.9.0 | 1차 | “built on the `inquirer` runner” | 없음 | [\[39\]](https://docs.stackstorm.com/inquiries.html) |
| StackStorm는 audit trail을 action execution history로 본다 | `https://github.com/stackstorm/st2` | GitHub repo README, accessed 2026-07-01 | 1차 | “Audit trail is the historical list” | 없음 | [\[24\]](https://github.com/stackstorm/st2) |
| Temporal은 Event History로 모든 단계를 기록한다 | `https://docs.temporal.io/encyclopedia/event-history` | Temporal Docs, accessed 2026-07-01 | 1차 | “record every step taken” | 없음 | [\[40\]](https://docs.temporal.io/encyclopedia/event-history?utm_source=chatgpt.com) |
| Temporal 승인 입력은 Signal 패턴으로 넣는다 | `https://docs.temporal.io/develop/python/workflows/message-passing` | Temporal Python SDK Docs, accessed 2026-07-01 | 1차 | “WorkflowHandle.signal” | 승인 UI는 직접 구현해야 함 | [\[41\]](https://docs.temporal.io/develop/python/workflows/message-passing?utm_source=chatgpt.com) |
| Dify Human Input는 워크플로를 pause하고 decision form을 보낸다 | `https://docs.dify.ai/en/cloud/use-dify/nodes/human-input` | Dify Docs, 2026-06-09 | 1차 | “pauses workflows” | 없음 | [\[42\]](https://docs.dify.ai/en/cloud/use-dify/nodes/human-input?utm_source=chatgpt.com) |
| Dify는 `human_input_required` 이벤트와 `form_token`으로 재개한다 | `https://docs.dify.ai/en/self-host/use-dify/nodes/hitl-api-integration-flow` | Dify Docs, 2026-06 하순 | 1차 | “emits a `human_input_required` event” | 없음 | [\[43\]](https://docs.dify.ai/en/self-host/use-dify/nodes/hitl-api-integration-flow?utm_source=chatgpt.com) |
| Dify 레포는 Apache-2.0이며 TS/Python 비중이 높다 | `https://raw.githubusercontent.com/langgenius/dify/main/LICENSE` / `https://github.com/langgenius/dify` | LICENSE + GitHub repo, release 1.15.0 on 2026-06-25 | 1차 | “Apache License Version 2.0” / “TypeScript 52.1%” | 없음 | [\[44\]](https://github.com/stackstorm/st2) |
| Windmill은 approval step과 audit logs를 공식 지원한다 | `https://www.windmill.dev/docs/flows/flow_approval` / `https://www.windmill.dev/docs/core_concepts/audit_logs` | Windmill Docs, accessed 2026-07-01 | 1차 | “implementing approval steps” / “audit logs for every operation” | 없음 | [\[45\]](https://www.windmill.dev/docs/flows/flow_approval?utm_source=chatgpt.com) |
| n8n은 AI tool calls에 explicit human approval을 넣을 수 있다 | `https://docs.n8n.io/release-notes` / `https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/tools-agent` | n8n Docs, 2026-06 하순 | 1차 | “explicit human approval” | 없음 | [\[46\]](https://docs.n8n.io/release-notes?utm_source=chatgpt.com) |
| n8n Wait node는 실행 데이터를 DB로 offload한다 | `https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait` | n8n Docs, 2026-06 하순 | 1차 | “offloads the execution data” | 없음 | [\[47\]](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait?utm_source=chatgpt.com) |
| TheHive는 case·observable·audit log 중심 플랫폼이다 | `https://docs.strangebee.com/thehive/user-guides/analyst-corner/cases/about-cases/` / `https://docs.strangebee.com/thehive/user-guides/organization/about-audit-logs/` | StrangeBee Docs, TheHive 5 | 1차 | “central repository” / “full traceability” | 최신 OSS판은 commercial 전환 | [\[48\]](https://docs.strangebee.com/thehive/user-guides/analyst-corner/cases/about-cases/?utm_source=chatgpt.com) |
| Carbon은 IBM의 오픈소스 디자인 시스템이며 토큰 기반 테마를 가진다 | `https://carbondesignsystem.com/` / `https://v10.carbondesignsystem.com/guidelines/themes/overview/` | Carbon site, accessed 2026-07-01 | 1차 | “open source design system” / “changing a set of universal variables” | 없음 | [\[49\]](https://carbondesignsystem.com/?utm_source=chatgpt.com) |
| Carbon productive body type 기본값은 14px/20px다 | `https://v10.carbondesignsystem.com/guidelines/typography/productive/` | Carbon v10 Docs | 1차 | “Size: 14px” | 없음 | [\[50\]](https://v10.carbondesignsystem.com/guidelines/typography/productive/?utm_source=chatgpt.com) |
| Radix Themes는 MIT이며 spacing/radius/color 규칙을 문서화한다 | `https://github.com/radix-ui/primitives/blob/main/LICENSE` / `https://www.radix-ui.com/themes/docs/theme/spacing` / `https://www.radix-ui.com/themes/docs/theme/radius` | LICENSE + Radix docs, accessed 2026-07-01 | 1차 | “MIT License” / “9-step scale” | 없음 | [\[51\]](https://github.com/radix-ui/primitives/blob/main/LICENSE?utm_source=chatgpt.com) |
| Tremor는 Apache-2.0 기반의 dashboard/chart component 레퍼런스다 | `https://github.com/tremorlabs/tremor` / `https://github.com/tremorlabs/tremor-npm` | GitHub repo, accessed 2026-07-01 | 1차 | “Apache-2.0 license” | 코드 자체는 React/Tailwind 전제 | [\[52\]](https://github.com/tremorlabs/tremor?utm_source=chatgpt.com) |
| Midday는 AGPL-3.0 기반이며 금융 overview 인접 도메인이다 | `https://github.com/midday-ai/midday` / `https://raw.githubusercontent.com/midday-ai/midday/main/LICENSE` | GitHub repo, latest v0.5.0 on 2026-02-15 | 1차 | “Financial Overview” / “AGPL-3.0 license” | 세부 디자인 토큰 문서 \[미검증\] | [\[53\]](https://github.com/midday-ai/midday) |
| Twenty는 AGPL/GPL 계열 + enterprise carve-out이 있다 | `https://raw.githubusercontent.com/twentyhq/twenty/main/LICENSE` | LICENSE file, accessed 2026-07-01 | 1차 | “mostly licensed under” | 세부 디자인 시스템 문서 추출은 제한적 | [\[54\]](https://raw.githubusercontent.com/twentyhq/twenty/main/LICENSE) |

### 열린 질문과 한계

이번 리서치에서 **가장 높은 확신으로 검증한 것**은 라이선스, 공식 문서상의 approval/audit 존재 여부, 스택 거리, 그리고 문서화된 디자인 토큰입니다. 반대로 **보수적으로 \[미검증\]로 남긴 것**은 Midday/Twenty 같은 앱의 세부 디자인 토큰과 컴포넌트 규칙, 그리고 일부 프로젝트 내부 코드 파일까지 내려간 정확한 source-path 매핑입니다. 따라서 구현 착수 시에는 **StackStorm/Dify/Temporal/Carbon**을 1차 롤모델로 삼고, AGPL/GPL 앱은 **화면 인상 레퍼런스만** 보는 것이 가장 안전합니다. [\[55\]](https://docs.stackstorm.com/inquiries.html)

------------------------------------------------------------------------

[\[1\]](https://github.com/stackstorm/st2) [\[2\]](https://github.com/stackstorm/st2) [\[24\]](https://github.com/stackstorm/st2) [\[35\]](https://github.com/stackstorm/st2) [\[38\]](https://github.com/stackstorm/st2) [\[44\]](https://github.com/stackstorm/st2) GitHub - StackStorm/st2: StackStorm (aka "IFTTT for Ops") is event-driven automation for auto-remediation, incident responses, troubleshooting, deployments, and more for DevOps and SREs. Includes rules engine, workflow, 160 integration packs with 6000+ actions (see https://exchange.stackstorm.org) and ChatOps. Installer at https://docs.stackstorm.com/install/index.html · GitHub

<https://github.com/stackstorm/st2>

[\[3\]](https://temporal.io/?utm_source=chatgpt.com) Temporal: Durable Execution Solutions

<https://temporal.io/?utm_source=chatgpt.com>

[\[4\]](https://github.com/langgenius/dify) GitHub - langgenius/dify: Production-ready platform for agentic workflow development. · GitHub

<https://github.com/langgenius/dify>

[\[5\]](https://github.com/windmill-labs/windmill) [\[9\]](https://github.com/windmill-labs/windmill) GitHub - windmill-labs/windmill: Open-source developer platform to power your entire infra and turn scripts into webhooks, workflows and UIs. Fastest workflow engine (13x vs Airflow). Open-source alternative to Retool and Temporal. · GitHub

<https://github.com/windmill-labs/windmill>

[\[6\]](https://raw.githubusercontent.com/n8n-io/n8n/master/LICENSE.md) raw.githubusercontent.com

<https://raw.githubusercontent.com/n8n-io/n8n/master/LICENSE.md>

[\[7\]](https://github.com/triggerdotdev/trigger.dev) GitHub - triggerdotdev/trigger.dev: Trigger.dev – build and deploy fully‑managed AI agents and workflows · GitHub

<https://github.com/triggerdotdev/trigger.dev>

[\[8\]](https://github.com/TheHive-Project/TheHive) GitHub - TheHive-Project/TheHive: TheHive is a Collaborative Case Management Platform, now distributed as a commercial version · GitHub

<https://github.com/TheHive-Project/TheHive>

[\[10\]](https://github.com/flowiseai/flowise) GitHub - FlowiseAI/Flowise: Build AI Agents, Visually · GitHub

<https://github.com/flowiseai/flowise>

[\[11\]](https://docs.stackstorm.com/inquiries.html) [\[12\]](https://docs.stackstorm.com/inquiries.html) [\[13\]](https://docs.stackstorm.com/inquiries.html) [\[22\]](https://docs.stackstorm.com/inquiries.html) [\[23\]](https://docs.stackstorm.com/inquiries.html) [\[36\]](https://docs.stackstorm.com/inquiries.html) [\[39\]](https://docs.stackstorm.com/inquiries.html) [\[55\]](https://docs.stackstorm.com/inquiries.html) Inquiries — StackStorm 3.9.0 documentation

<https://docs.stackstorm.com/inquiries.html>

[\[14\]](https://docs.dify.ai/en/cloud/use-dify/nodes/human-input?utm_source=chatgpt.com) [\[42\]](https://docs.dify.ai/en/cloud/use-dify/nodes/human-input?utm_source=chatgpt.com) Human Input - Dify Docs

<https://docs.dify.ai/en/cloud/use-dify/nodes/human-input?utm_source=chatgpt.com>

[\[15\]](https://docs.temporal.io/develop/python/workflows/message-passing?utm_source=chatgpt.com) [\[26\]](https://docs.temporal.io/develop/python/workflows/message-passing?utm_source=chatgpt.com) [\[41\]](https://docs.temporal.io/develop/python/workflows/message-passing?utm_source=chatgpt.com) Workflow message passing - Python SDK

<https://docs.temporal.io/develop/python/workflows/message-passing?utm_source=chatgpt.com>

[\[16\]](https://raw.githubusercontent.com/carbon-design-system/carbon/main/LICENSE) [\[21\]](https://raw.githubusercontent.com/carbon-design-system/carbon/main/LICENSE) [\[29\]](https://raw.githubusercontent.com/carbon-design-system/carbon/main/LICENSE) raw.githubusercontent.com

<https://raw.githubusercontent.com/carbon-design-system/carbon/main/LICENSE>

[\[17\]](https://github.com/radix-ui/primitives/blob/main/LICENSE?utm_source=chatgpt.com) [\[51\]](https://github.com/radix-ui/primitives/blob/main/LICENSE?utm_source=chatgpt.com) license - radix-ui/primitives

<https://github.com/radix-ui/primitives/blob/main/LICENSE?utm_source=chatgpt.com>

[\[18\]](https://github.com/tremorlabs/tremor?utm_source=chatgpt.com) [\[31\]](https://github.com/tremorlabs/tremor?utm_source=chatgpt.com) [\[33\]](https://github.com/tremorlabs/tremor?utm_source=chatgpt.com) [\[52\]](https://github.com/tremorlabs/tremor?utm_source=chatgpt.com) tremorlabs/tremor: Copy & Paste React components to ...

<https://github.com/tremorlabs/tremor?utm_source=chatgpt.com>

[\[19\]](https://github.com/midday-ai/midday) [\[53\]](https://github.com/midday-ai/midday) GitHub - midday-ai/midday: Invoicing, Time tracking, File reconciliation, Storage, Financial Overview & your own Assistant made for Freelancers · GitHub

<https://github.com/midday-ai/midday>

[\[20\]](https://github.com/twentyhq/twenty) GitHub - twentyhq/twenty: The open alternative to Salesforce, designed for AI. · GitHub

<https://github.com/twentyhq/twenty>

[\[25\]](https://docs.temporal.io/ai-cookbook/human-in-the-loop-python?utm_source=chatgpt.com) Human-in-the-Loop AI Agent

<https://docs.temporal.io/ai-cookbook/human-in-the-loop-python?utm_source=chatgpt.com>

[\[27\]](https://docs.temporal.io/?utm_source=chatgpt.com) Temporal Docs \| Temporal Platform Documentation

<https://docs.temporal.io/?utm_source=chatgpt.com>

[\[28\]](https://carbondesignsystem.com/?utm_source=chatgpt.com) [\[49\]](https://carbondesignsystem.com/?utm_source=chatgpt.com) Carbon Design System

<https://carbondesignsystem.com/?utm_source=chatgpt.com>

[\[30\]](https://v10.carbondesignsystem.com/guidelines/themes/overview/?utm_source=chatgpt.com) Themes

<https://v10.carbondesignsystem.com/guidelines/themes/overview/?utm_source=chatgpt.com>

[\[32\]](https://www.tremor.so/docs/visualizations/bar-chart?utm_source=chatgpt.com) Bar Chart - Tremor

<https://www.tremor.so/docs/visualizations/bar-chart?utm_source=chatgpt.com>

[\[34\]](https://github.com/TheHive-Project/TheHive/blob/main/LICENSE?utm_source=chatgpt.com) TheHive/LICENSE at main

<https://github.com/TheHive-Project/TheHive/blob/main/LICENSE?utm_source=chatgpt.com>

[\[37\]](https://docs.temporal.io/encyclopedia/event-history?utm_source=chatgpt.com) [\[40\]](https://docs.temporal.io/encyclopedia/event-history?utm_source=chatgpt.com) Event History \| Temporal Platform Documentation

<https://docs.temporal.io/encyclopedia/event-history?utm_source=chatgpt.com>

[\[43\]](https://docs.dify.ai/en/self-host/use-dify/nodes/hitl-api-integration-flow?utm_source=chatgpt.com) Human Input API Integration Flow

<https://docs.dify.ai/en/self-host/use-dify/nodes/hitl-api-integration-flow?utm_source=chatgpt.com>

[\[45\]](https://www.windmill.dev/docs/flows/flow_approval?utm_source=chatgpt.com) Suspend & Approval / Prompts

<https://www.windmill.dev/docs/flows/flow_approval?utm_source=chatgpt.com>

[\[46\]](https://docs.n8n.io/release-notes?utm_source=chatgpt.com) Release notes

<https://docs.n8n.io/release-notes?utm_source=chatgpt.com>

[\[47\]](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait?utm_source=chatgpt.com) Wait \| Nodes

<https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait?utm_source=chatgpt.com>

[\[48\]](https://docs.strangebee.com/thehive/user-guides/analyst-corner/cases/about-cases/?utm_source=chatgpt.com) About Cases - TheHive 5 Documentation - StrangeBee

<https://docs.strangebee.com/thehive/user-guides/analyst-corner/cases/about-cases/?utm_source=chatgpt.com>

[\[50\]](https://v10.carbondesignsystem.com/guidelines/typography/productive/?utm_source=chatgpt.com) Typography – Carbon Design System

<https://v10.carbondesignsystem.com/guidelines/typography/productive/?utm_source=chatgpt.com>

[\[54\]](https://raw.githubusercontent.com/twentyhq/twenty/main/LICENSE) raw.githubusercontent.com

<https://raw.githubusercontent.com/twentyhq/twenty/main/LICENSE>
