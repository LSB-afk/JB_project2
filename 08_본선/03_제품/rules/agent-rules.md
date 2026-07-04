---
tags: [area/product, type/rule, status/active]
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases: [에이전트 규칙, agent-rules]
---

# Agent Rules — 에이전트 행동 규칙

> 신뢰마커: **E4(작동검증)** = `_vendor/JB_project2/app/`의 실제 하네스 코드(`harnessCore.js`/`harnessRegistry.js`/`harnessVerification.js`/`jeonseProtectionRules.js`)에서 직접 확인된 가드레일. **[미구현/설계]** = 이 문서에서 규칙으로 신규 확정하지만 `02_제품/app/`(우리 MVP)에는 아직 코드 대응이 없음. 승보 프로토타입은 **참조 구현**이지 우리 앱 코드가 아니다 — 편입 전 [[08_본선/03_제품/01_결정-준비/설계/승보-프로토타입-반영|승보-프로토타입-반영]] 재매핑을 거친다.
> 범위: `Case → AgentRun → Agent → Skill → Evidence → Approval → Audit` 운영 계약에서 Agent/Skill이 지켜야 할 행동 경계. 에이전트별 개별 역할·경계는 [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]] 참조 — 이 문서는 **전 에이전트 공통 규칙**만 다룬다.

---

## 1. 역할 정의 요약

| 구분 | 정의 | 근거 |
|---|---|---|
| Agent | Case에 배정되어 Skill을 실행하는 실행 단위. `isHuman: false`(AI) / `isHuman: true`(사람 승인자) | [[08_본선/03_제품/docs/04_definitions\|definitions]] §1 |
| AgentRun | 한 Agent가 한 Case에 대해 수행한 실행 1건. 판정 시점 스냅샷(`decisionSnapshot`) 불변 보유 | data-model §2 |
| Skill | Agent에 장착되는 표준 능력 단위. `approvalPolicy`·`riskLevel`·`inputPiiGrade` 보유 | data-model §4 |

에이전트는 **판단(Judgment) → 행동 초안(Possible Actions) → 검증(Verification)** 3경계 내에서만 동작한다(`agent-loop` 카드 구조, [[08_본선/03_제품/02_agent-design/agent-roster|agent-roster]] §3). 이 문서는 그 경계를 어길 때 **무엇이 자동으로 차단되는지**를 정의한다.

---

## 2. 허용/금지 행동 (AGT 규칙)

| ID | 규칙 | MUST / MUST-NOT | 강제 계층 | 근거(E4) |
|---|---|---|---|---|
| AGT-01 | 원본 PII(주민번호·전화번호·계좌형 11자리+ 숫자열)를 저장·표시·로그에 남기지 않는다 | MUST-NOT 위반 시 REJECT | Hook(`beforeCaseCreate`/`beforeCustomerMessage`/`afterAgentRun`) + 검증기 | `harnessGuardCheckPII()`(`harnessCore.js:74-79`), 패턴 `HARNESS_PII_PATTERNS`(주민등록번호/전화번호/계좌형 숫자열, `harnessCore.js:68-72`); 런타임 `verifyNoPIILeakage()`(`harnessVerification.js:39-46`) |
| AGT-02 | 확정 단정 표현(예: "전세사기입니다", "피해자 결정 확정") 사용 금지 | MUST-NOT | Hook(`beforeCaseCreate`/`beforeAgentRun`/`beforeCustomerMessage`) | `harnessGuardCheckAssertions()`(`harnessCore.js:82-86`) + 도메인별 `forbiddenAssertions` 패턴(`jeonseProtectionRules.js:6-12`, 5종: 전세사기 단정/피해자 결정 단정/보증 가입 단정/법률 자문 단정/신청 대행 표현) |
| AGT-03 | high/critical 위험도의 Case/AgentRun을 completed/closed로 자동 전이시키지 않는다 — 위반 시 needsReview로 안전 강등 | MUST-NOT (자동 종결) | Hook(`beforeAgentRun`) | `harnessGuardCheckAutoClose()`(`harnessCore.js:97-102`), 안전 강등 + `JPO_HOOK_VIOLATION_AGENT_RUN` 감사 기록(`SECURITY_GUARDRAILS.md` §4) |
| AGT-04 | 고객 대상(customerFacing) 문안은 approvalStatus가 `pending`이 아니면 진행 금지 | MUST-NOT | Hook(`beforeCustomerMessage`) | `harnessGuardCheckApprovalRequired()`(`harnessCore.js:105-110`) |
| AGT-05 | business query는 scope(roleKey/affiliateId) 없이 전체 조회 불가 — repository는 미지정 호출에 예외를 던져야 한다 | MUST | Repository 계약 + `scopeProbe()` | `harnessGuardCheckScope()`(`harnessCore.js:89-94`); `jpoTable()` 미지정 호출 시 `"role scope is required"` 예외(`jeonseProtectionRules.js:36-45`) |
| AGT-06 | 모든 Agent는 공통 금지행동 8종(전세사기/법률자문/보증가입/피해자결정 확정 금지, PII 원문 저장 금지, 임대인 신용정보 조회 금지, 등기부 자동 확정 금지, high/critical 자동종결 금지)을 `blockedActions`에 반드시 포함한다 | MUST | `verifyAgentRegistryCompleteness()` | `JPO_COMMON_BLOCKED_ACTIONS`(`jeonseProtectionAgents.registry.js:4-13`, 8종) + 검증기(`harnessVerification.js:48-65`) |
| AGT-07 | 실제 신청 제출/대행, 대출 승인·금리·한도 확정을 대행하지 않는다 | MUST-NOT | 정책 문장(`ruleStatements`) + `forbiddenAssertions` "신청 대행 표현" | `jeonseProtectionRules.js:23`("실제 신청 대행 금지"), P-005([[08_본선/03_제품/docs/03_principles\|principles]]) |
| AGT-08 | 근거(Evidence) 없이 생성된 행동 초안(action draft)은 승인 대기열에 올리지 않는다 | MUST-NOT | [미구현/설계] — 코드 검증 없음 | Rejection Rules([[08_본선/03_제품/docs/03_principles\|principles]] §Rejection Rules) |
| AGT-09 | 신규 역할/에이전트는 기존 하네스의 business 함수·상수를 import/alias하지 않는다 (`jbwcTable(`, `JPO_*` 등 금지 패턴) | MUST-NOT | 정적 스캔(`verify_static.py` 준하는 게이트, 우리 프로젝트는 별도 도입 [미구현/설계]) | `ROLE_HARNESS_CONTRACT.md` §"금지 alias/import 패턴" |
| AGT-10 | 삭제된 축·label-only 대시보드로 회귀하지 않는다(재유입 금지) | MUST-NOT | `forbiddenResurface()` | `harnessRegistry.js:35-43` 예시(`consumerProtectionDashboardPage`/`complianceDashboardPage`/광주은행 레일 재유입 검출) — 우리 프로젝트에는 대응 심볼 없음, 패턴만 준용 [미구현/설계] |

Reject-If 요약(승인 화면 노출 전 자동 차단 대상):
- Reject-If PII 패턴 매치(AGT-01) → 차단 + 감사 기록.
- Reject-If 단정 표현 매치(AGT-02) → 차단 + 감사 기록.
- Reject-If `riskLevel ∈ {high, critical}` AND `status ∈ {completed, closed}`(AGT-03) → `needsReview`로 강등.
- Reject-If `customerFacing === true` AND `approvalStatus !== "pending"`(AGT-04) → 차단.
- Reject-If scope 필드 누락(AGT-05) → repository 예외.

---

## 3. 사람 승인 트리거 (Human Approval Triggers)

승인 레벨 매트릭스(L0~L4)는 [[08_본선/03_제품/docs/03_principles|principles]] P-002·[[08_본선/03_제품/02_agent-design/agent-roster|agent-roster]] §4가 SSOT다 — 여기서는 **Agent가 언제 승인 큐로 넘겨야 하는지**만 규정한다.

| ID | 트리거 조건 | 필수 승인 주체 |
|---|---|---|
| AGT-11 | `actionType`이 고객 접촉/발송/계좌·계약 변경을 포함 | 최소 RM(L1~L2), L3 이상은 RM+준법 공동 |
| AGT-12 | `riskLevel`이 L3(80-89) 이상 | 준법 최종 승인자 관여 필수(공동 승인) |
| AGT-13 | AI 권고를 담당자가 재정의(override)하는 경우 | 담당자가 표준 사유코드 + 자유기술 입력 후에만 조치 완료 처리 — 근거: 금융위 2026「금융분야 인공지능 가이드라인」 p.30 오버라이드 준수사례("반드시 그 근거 사유... 입력해야만 조치가 완료되도록") [미구현/설계, 국내-AI규제-HITL-딥리서치.md §2.3] |
| AGT-14 | 하나의 Case에서 AI-인간 판단 불일치, 고액·취약차주·예외승인 | 상급자/센터장/위원회 복수인 확인 [미구현/설계, 국내-AI규제-HITL-딥리서치.md §4.1] |

---

## 4. 불확실성 처리 (Uncertainty Handling)

| ID | 규칙 |
|---|---|
| AGT-15 | Skill 산출물의 confidence/신뢰도(sourceTag: `public`\|`estimate`\|`simulation`)를 숨기거나 생략하지 않는다 — [[08_본선/03_제품/docs/03_principles\|principles]] Rejection Rules |
| AGT-16 | 정책 규칙(policy rules) 부재 상태에서 생성된 행동 초안은 승인 대기열로 넘기지 않고 차단한다 — 동 출처 |
| AGT-17 | 제도 안내 문구에는 "최신 기준 담당자 확인 필요"를, 그 외 모든 AI 출력에는 "내부 운영 참고용 · 담당자 검토 필요"를 표시한다 | `requiredNotices`(`jeonseProtectionRules.js:31`), `SECURITY_GUARDRAILS.md` §5 |

---

## 5. 도구 경계 (Tool Boundaries)

| ID | 규칙 | 강제 |
|---|---|---|
| AGT-18 | 외부 프런티어 LLM(Claude/Codex API 등) 호출 payload에는 원본 PII(`restricted`/`confidential` 등급 필드)를 포함하지 않는다 — 로컬 모델(EXAONE 등)만 원본 처리 | 반출 스캔(`beforeExternalReferenceOpen` 훅, `harnessGuardCheckPII`) — [[08_본선/03_제품/docs/03_principles\|principles]] P-001 |
| AGT-19 | Agent는 자신에게 배정되지 않은 타 계열사/타 역할 scope의 데이터·도구를 호출하지 않는다 | Repository scope 강제(AGT-05와 동일 메커니즘) |
| AGT-20 | 승인(Approval) 자체를 Agent가 자체 승인하지 않는다 — 승인은 사람 승인자(`USR-*`/`human-*`)만 | `afterApprovalDecision` 훅: `decidedBy`가 `USR-`로 시작하지 않으면 위반(`jeonseProtectionRules.js:78`) |

---

## 6. 로깅 요구사항 (Capture-by-default)

| ID | 규칙 |
|---|---|
| AGT-21 | 모든 훅 실행(위반 유무 무관)은 `harnessHookLog()`에 남는다(`harnessId`/`hook`/`violations`/`at`) | `harnessCore.js:53-59` |
| AGT-22 | 상태 전환(Case→AgentRun→Agent→Skill→Evidence→Approval)마다 AuditEvent(GENESIS 해시체인)를 생성한다 — 누락 시 해당 전이는 무효 | [[08_본선/03_제품/docs/03_principles\|principles]] P-004, `auditChainRecords()`(data-model §7) |
| AGT-23 | 차단 가능 지점(생성·발송·반출)은 **차단 + 감사 기록**, 이미 발생한 지점은 **안전 강등 + reviewRequired 감사 기록** | `SECURITY_GUARDRAILS.md` "위반 처리 원칙" |

---

## 7. 사용자향 설명 요구사항 (User-Facing Explanation)

| ID | 규칙 |
|---|---|
| AGT-24 | 위험 밴드·자동화평가 결과에는 사유코드(사람이 읽을 수 있는 근거)를 동반한다 — 신용정보법 §36조의2(자동화평가 설명요구권) 대응 | [[08_본선/03_제품/02_agent-design/agent-roster\|agent-roster]] "상환위험 분류 에이전트" 행 |
| AGT-25 | Evidence 없는 추천 카드는 승인 화면에 노출하지 않는다 | [[08_본선/03_제품/docs/03_principles\|principles]] P-003 |

---

## 연결
[[08_본선/03_제품/docs/04_definitions|Definitions]] · [[08_본선/03_제품/docs/03_principles|Principles]] · [[08_본선/03_제품/docs/02_core-bet|Core Bet]] · [[08_본선/03_제품/01_결정-준비/설계/승보-프로토타입-반영|승보 프로토타입 반영]] · [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]] · [[08_본선/03_제품/rules/compliance-rules|Compliance Rules]] · [[08_본선/03_제품/rules/data-rules|Data Rules]]
