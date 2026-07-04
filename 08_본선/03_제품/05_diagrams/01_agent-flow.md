---
tags:
  - area/product
  - type/diagram
  - status/active
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
---

# 에이전트 흐름 다이어그램 — 기업여신 콘솔(CCL) 히어로 CCL-0001

> **정합 기준**: [[08_본선/03_제품/docs/05_domain-model|05_domain-model]] §1·§5(루트 정본). 코드 SSOT: `_vendor/JB_project2/app/cclConsole.core.js`(e57b826). 히어로 = **CCL-0001**(전주 카페 운영자 운전자금, `BIZ-REF-0001`).

---

## 목적

위험 신호 입력부터 승인 게이트·감사 기록까지, **실제 CCL 8종 에이전트**의 실행 시퀀스를 시각화한다. 다른 3콘솔(FDS·전세보호·JB우리캐피탈)은 도메인별 에이전트만 다르고 오케스트레이션·승인 게이트 구조는 동일하다 [E3, 07_architecture §12].

---

## CCL 에이전트 로스터 8종 (표면 5 + 내부 3)

| id | 표시명 | 성격 | 허용 |
|---|---|---|---|
| `ccl-intake` | 여신 접수 분류 에이전트 | 표면 | 분류·라우팅·감사기록 |
| `ccl-financial` | 재무자료 요약 에이전트 | 표면 | 요약·확인필요 표시 |
| `ccl-repayment` | 상환능력 체크 에이전트 | 표면 | 부담 지표 구간 표시 |
| `ccl-doc` | 서류 체크리스트 에이전트 | 표면 | 체크리스트·보완 초안 |
| `ccl-memo` | 승인 품의 초안 에이전트 | 표면 | 초안·승인 요청 등록 |
| `ccl-policy` | 정책금융 후보 에이전트 | 내부 | 후보 나열 |
| `ccl-reply` | 고객 회신 초안 에이전트 | 내부 | 초안 작성(발송 금지) |
| `ccl-supervisor` | 여신 감독 검토 에이전트 | 내부 | 검토 대기 등록 |

모든 에이전트는 공통 금지(`CCL_COMMON_BLOCKED_ACTIONS`)로 대출 승인/거절 확정·금리/한도 산정·신용등급 확정·식별정보 원문 저장/출력·고객 자동발송을 할 수 없다 [E4].

---

## 시퀀스 다이어그램 — CCL-0001 골든패스

```mermaid
sequenceDiagram
    participant RM as 소상공인 담당자(RM)
    participant INT as ccl-intake(분류)
    participant FIN as ccl-financial(재무요약)
    participant REP as ccl-repayment(상환체크)
    participant DOC as ccl-doc(서류체크)
    participant POL as ccl-policy(정책후보, 내부)
    participant MEMO as ccl-memo(품의초안)
    participant SUP as ccl-supervisor(감독검토, 내부)
    participant HSUP as 여신감독(사람, 2선)
    participant RPL as ccl-reply(고객회신초안, 내부)
    participant AUD as ccl_audit_logs(감사)

    RM->>INT: CCL-0001 접수(BIZ-REF-0001, 운전자금)
    INT->>AUD: CASE_CREATED + intake AgentRun 기록
    INT->>FIN: 라우팅(재무자료 요약)
    INT->>REP: 라우팅(상환능력 체크)
    INT->>DOC: 라우팅(서류 체크리스트)
    FIN-->>AUD: AgentRun 기록(매출 하락 추세, 구간값)
    REP-->>AUD: AgentRun 기록(repaymentBand: 부담 확인 필요)
    DOC-->>AUD: AgentRun 기록(서류 누락 플래그)
    Note over INT,DOC: high/critical·서류누락·정책금융 → humanReview 강제
    DOC->>POL: 정책금융 후보 조회(내부)
    POL-->>MEMO: 후보 note(kind:policy) 전달
    MEMO->>MEMO: 품의 초안 작성(MEMO_DRAFTED)
    MEMO->>SUP: 감독 검토 대기 등록(escalated 아님, 통상 pending)
    SUP->>HSUP: 승인 요청(Approval pending)
    HSUP-->>SUP: 승인/반려(CCL_APPROVAL_DECIDED)
    SUP-->>AUD: 결재 결과 append
    alt 승인
        HSUP->>RPL: 고객 회신 초안 작성 허용
        RPL-->>AUD: beforeCustomerMessage 3중 게이트 통과 후 발송
    else 반려
        SUP-->>RM: 보완 요청/재검토
    end
```

**훅 파이프라인**(모든 단계에 적용) [E4]: `onRoleEnter → beforeCaseCreate → afterCaseCreate → beforeAgentRun → afterAgentRun → beforeCustomerMessage → afterApprovalDecision → onAuditWrite`.

---

## 참조

- [[08_본선/03_제품/docs/05_domain-model|05_domain-model — 도메인 모델(정합 대상)]]
- [[08_본선/03_제품/02_agent-design/agent-roster|에이전트 로스터]]
- [[08_본선/03_제품/02_agent-design/orchestrator|오케스트레이터]]
- [[08_본선/03_제품/05_diagrams/03_approval-gate|승인 게이트]]
