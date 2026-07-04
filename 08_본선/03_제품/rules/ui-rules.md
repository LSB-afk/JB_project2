---
tags: [area/product, type/rule, status/active]
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases: [UI 규칙, ui-rules]
---

# UI Rules — 화면 규칙

> 화면 IA·사용자 여정·디자인 시스템의 SSOT는 `03_ux/`(병렬 소유, 이 문서는 건드리지 않는다). 이 문서는 **UI가 지켜야 할 실행 가능한 규칙**만 다룬다 — 근거는 `02_제품/app/`(우리 MVP) 실제 코드에서 확인된 패턴.

---

## 1. 주요 사용자 흐름 (Primary User Flows)

| ID | 흐름 | 단계 |
|---|---|---|
| UIR-01 | Case 판단 흐름 | 위험신호 수집 → Case 생성 → AgentRun 실행 → Evidence 인용 → Approval 대기 → 승인/반려 → Audit 기록 (운영 계약 7단계 그대로) |
| UIR-02 | 데모 시나리오 흐름 | URL 쿼리(`?demo=sme`\|`jeonse`\|`phishing`)로 히어로 케이스 진입 → 판정 결과 확인 → 승인 큐 처리 | CLAUDE.md "Demo scenarios are URL-driven" |
| UIR-03 | 승인 처리 흐름 | 승인 대기열(Approval Pending) → 행동 초안 검토(actionDraft) → gateChecks 확인 → 승인/반려/수정 | [[08_본선/03_제품/04_tech/data-model|data-model]] §6 |

---

## 2. 필수 상태 (Required States)

우리 앱은 `empty-state` CSS 클래스와 `data-state-grid` 컴포넌트로 상태를 이미 구현하고 있다 — 신규 화면도 이 어휘를 재사용한다.

| ID | 상태 | 규칙 | 근거(E4) |
|---|---|---|---|
| UIR-04 | Empty | 목록/큐가 비면 `<div class="empty-state">`에 무엇이 없는지 + 다음 행동을 안내하는 한 문장을 표시한다(빈 화면·빈 배열 렌더 금지) | `app.js` 전역 `empty-state` 패턴 12곳+ (예 `"검토할 승인 요청이 없습니다"`, `"연결된 관리 건 없음"`) |
| UIR-05 | Loading | 비동기 분석 중에는 `loading-spinner` + `aria-live="polite"` 컨테이너로 진행 상태를 알린다 | `app.js:4402-4403` `<div class="result-empty loading-result" aria-live="polite"><span class="loading-spinner" aria-hidden="true"></span>` |
| UIR-06 | Error | 외부 API 미연결/오류 상태는 `error` 상태 카드로 표시하고, "고객 안내나 자동 실행 근거로 사용하지 말 것"을 명시한다 | `app.js:3255-3258`, `insight-copy` 문구(`app.js:3273`) |
| UIR-07 | Sample/Real 구분 | 시드/합성 데이터(`sample`)와 사용자 입력(`real`) 데이터는 시각적으로 구분 표시한다(카드 `data-state` 속성) | `app.js:3230-3234` |
| UIR-08 | Stale(최신성 경고) | 실제 API 연동 전까지 "기준 시점과 출처"를 표시하고 최신 기준 재확인을 안내한다 | `app.js:3261-3264`, [[08_본선/03_제품/rules/data-rules|data-rules]] DAT-12 |
| UIR-09 | 명령 입력 오류 | 빈 명령/잘못된 입력에는 즉시 조치 가능한(actionable) 오류 메시지를 표시한다 — 침묵 실패 금지 | `02_제품/tests/e2e/localguard.spec.js` `"empty command shows an actionable error"` 테스트로 검증 |

---

## 3. 위험 고지 (Risk Disclosure)

| ID | 규칙 | 근거 |
|---|---|---|
| UIR-10 | 모든 AI 출력 화면에는 "내부 운영 참고용 · 담당자 검토 필요"를 표시한다 | [[08_본선/03_제품/rules/agent-rules|agent-rules]] AGT-17 |
| UIR-11 | 제도·정책 안내 문구에는 "최신 기준 담당자 확인 필요"를 추가로 표시한다 | 동 출처 |
| UIR-12 | 근거(Evidence)가 연결되지 않은 추천 카드는 화면에 노출하지 않는다(숨기지 말고 아예 생성 자체를 차단 — AGT-08) | [[08_본선/03_제품/docs/03_principles|principles]] P-003, Rejection Rules |
| UIR-13 | confidence/신뢰도(sourceTag)를 생략한 화면 표시는 금지 — `public`/`estimate`/`simulation` 중 하나를 항상 노출 | [[08_본선/03_제품/rules/agent-rules|agent-rules]] AGT-15 |

---

## 4. 승인 UI (Approval UI)

| ID | 규칙 | 근거 |
|---|---|---|
| UIR-14 | 고객 대상(customerFacing) 행동은 승인 화면에서 편집 가능한 초안(actionDraft)으로만 표시하고, 승인 전 발송 버튼을 노출하지 않는다 | [[08_본선/03_제품/docs/03_principles|principles]] P-002, `harnessGuardCheckApprovalRequired()` |
| UIR-15 | 승인 화면은 레벨(L0~L4)과 승인 주체(system/RM/준법)를 항상 함께 표시한다 — 레벨 없이 승인/반려 버튼만 노출 금지 | [[08_본선/03_제품/04_tech/data-model|data-model]] §6, [[08_본선/03_제품/02_agent-design/agent-roster|agent-roster]] §4 레벨표 |
| UIR-16 | gateChecks(`{name, status}[]`)가 `blocked`인 항목이 있으면 승인 버튼을 비활성화한다 | data-model §6 `gateChecks` 필드 |
| UIR-17 | AI 권고를 재정의(override)하는 경우, 사유코드 선택 없이 승인을 완료 처리하지 않는다(폼 제출 차단) | [[08_본선/03_제품/rules/agent-rules|agent-rules]] AGT-13 |
| UIR-18 | 반려 시 대체 조치 문구(`rejectionAlternative`)를 함께 표시한다(반려만 하고 다음 행동을 안내하지 않는 화면 금지) | data-model §6 |

---

## 5. 접근성 기본 (Accessibility Basics)

| ID | 규칙 | 근거(E4) |
|---|---|---|
| UIR-19 | 토글형 내비게이션 버튼에는 `aria-expanded`/`aria-controls`를 부여한다 | `index.html:15-25` (`rail-toggle`, `properties-toggle`) |
| UIR-20 | 랜드마크 영역(사이드바/조직 레일/속성 패널/내비게이션)에는 `aria-label`을 부여한다 | `index.html:12,41,58,76` |
| UIR-21 | 실시간 알림(토스트, 로딩 결과)에는 `aria-live="polite"`를 부여한다 | `index.html:82`(`#toast-root`), `app.js:4402` |
| UIR-22 | 순수 장식용 아이콘(`+` 등)에는 `aria-hidden="true"`를 부여해 스크린리더 중복 낭독을 막는다 | `index.html:49`, `app.js:4403` |
| UIR-23 | 다중 선택 그룹(계열사/역할 서브메뉴)에는 `role="group"`을 부여한다 | `index.html:16,26` |

---

## 6. 데모 화면 우선순위 (Demo Screen Priorities)

| 우선순위 | 화면 | 근거 |
|---|---|---|
| 1 | 히어로 케이스(`JBG-104` 전주 중앙로 카페) 대시보드+판정+승인 | `?demo=sme`, [[08_본선/03_제품/docs/04_definitions|definitions]] §4 |
| 2 | 전세보호 사전 점검(`?demo=jeonse`) | CLAUDE.md 데모 시나리오 |
| 3 | 피싱/이상거래 대응(`?demo=phishing`) | CLAUDE.md 데모 시나리오 |
| 4 | 감사 원장(Audit Ledger) 무결성 검증 + JSON 내보내기 | `verifyAuditChain()`/`exportAuditJson()` — 심사 "검증가능성" 축 직결 |

| ID | 규칙 |
|---|---|
| UIR-24 | 시연 시간(≤5분) 내에서는 §6 우선순위 1→4 순서로만 화면을 전환한다 — 우선순위 밖 화면(설정, 조직도 상세 등)은 질의응답 대비 화면으로 남긴다 |

---

## 연결
[[08_본선/03_제품/docs/03_principles|Principles]] · [[08_본선/03_제품/docs/04_definitions|Definitions]] · [[08_본선/03_제품/04_tech/data-model|데이터 모델]] · [[08_본선/03_제품/rules/agent-rules|Agent Rules]] · [[08_본선/03_제품/rules/data-rules|Data Rules]] · [[08_본선/03_제품/01_결정-준비/설계/승보-프로토타입-반영|승보 프로토타입 반영]]
