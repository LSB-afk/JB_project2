---
tags:
  - area/product
  - type/diagram
  - status/active
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
---

# 승인 게이트 (Human-in-the-Loop) — L0~L4

> **정합 기준**: [[08_본선/03_제품/docs/05_domain-model|05_domain-model]] §3·§4(루트 정본). 코드 SSOT: `_vendor/JB_project2/app/cclConsole.core.js`(e57b826). 히어로 = **CCL-0001**, `riskLevel: high` → 잠정 매핑 L3(준법 결재 구간, [Open Question] 아래 참조).

---

## 핵심 원칙

> **"AI가 결정하지 않는다. 사람이 결정한다."**
>
> 고객 대상 모든 행동은 담당자(RM) 또는 감독/준법(2선)의 명시적 승인 없이는 절대 실행되지 않는다. 예외는 FDS(피싱)의 실시간 선차단뿐이며, 이는 사람 승인 **전** 차단이지 고객 대상 실행이 아니다.

---

## 승인 레벨 L0~L4 ↔ JB_project2 CCL `riskLevel` 정합 [미검증]

| 레벨 | 점수 구간(04_tech 기준) | 승인 주체 | JB_project2 CCL `riskLevel` 잠정 매핑 |
|---|---|---|---|
| L0 | 0–39 | 자동(기록만) | `low` |
| L1 | 40–59 | RM | `low`~`medium` |
| L2 | 60–79 | RM | `medium` |
| L3 | 80–89 | 준법 | `high` |
| L4 | 90–100 | 준법/상위 검토(TBD) | `critical` |

> **[Open Question]**: JB_project2 CCL은 점수 매트릭스가 아니라 `riskLevel(low/medium/high/critical) + requiresHumanReview + supervisor 결재`로 구현되어 있어, 위 매핑은 잠정치다. L4 실 승인 주체("상위 검토")도 정본 미지정 — [[08_본선/03_제품/docs/05_domain-model|05_domain-model §3.1]] 참조.

---

## 승인 플로우 (실제 CCL 구현)

```mermaid
flowchart TD
    A[에이전트 행동 초안 생성<br/>ccl-memo 품의초안 / ccl-reply 회신초안] --> B[승인 대기 등록<br/>Approval status=pending]
    B --> C{여신감독(2선) 검토}
    C -->|승인| D[상태 확정<br/>CCL_APPROVAL_DECIDED]
    C -->|반려| E[케이스 재검토/보완요청]
    D --> F{고객 대상 발송 시도?}
    F -->|예| G[beforeCustomerMessage 3중 게이트<br/>PII 체크·단정표현 체크·승인 확인]
    G -->|통과| H[고객 회신 발송]
    G -->|차단| I[발송 보류 + 보안이벤트 감사]
    F -->|아니오| J[내부 기록만]
    D --> K[ccl_audit_logs append]
    E --> K
    H --> K
    I --> K
```

- **자체 결재 금지**: 승인 결정자는 `USR-`로 시작하는 사람만 통과(`afterApprovalDecision` 훅) [E4].
- **자동 종결 차단**: high/critical 상태의 AgentRun은 자동 `completed` 전이가 차단되고 `needsReview`로 강제된다(`harnessGuardCheckAutoClose`) [E4].
- **금지 단정**: 대출 승인/금리/신용등급 확정 문구는 정규식(`CCL_FORBIDDEN_ASSERTIONS`)으로 차단된다 [E4].

---

## 승인 UI 요소 (실제 구현 기준)

- 행동 초안 전체 표시(`ccl-memo` 품의초안 / `ccl-reply` 회신초안)
- 근거 노트(`ccl_review_notes`)·서류 체크(`ccl_doc_checks`)·상담 로그(`ccl_consult_logs`)
- 규정/정책 후보(`ai_recommendations`, kind:policy) — "지원 가능" 확정 문구 금지
- 승인/반려 버튼(수정 후 승인은 [TBD], MVP 미구현)

---

## 참조

- [[08_본선/03_제품/05_diagrams/02_case-lifecycle|케이스 생명주기]]
- [[08_본선/03_제품/docs/05_domain-model|05_domain-model — 도메인 모델(정합 대상)]]
- [[08_본선/03_제품/04_tech/data-model|04_tech/data-model — Approval 엔티티]]
