# SECURITY GUARDRAILS — 보안은 후처리가 아니라 기본값

이 문서는 모든 하네스에 적용되는 보안·컴플라이언스 가드레일과, 그것이 **어느 계층에서
자동 검증되는지**를 명문화한다. 화면 문구가 아니라 훅/검증기/정적 게이트가 지킨다.

## 1. PII (개인정보 원문 금지)

- 저장·표시·검색·로그 어디에도 실명/주민번호/전화번호/계좌번호/상세주소 원문을 두지 않는다.
  데이터는 익명 Ref(TENANT-REF-*, PROPERTY-REF-*, CUST-* …)와 구간값(보증금 band)만 사용한다.
- 자동 검증:
  - 훅: `beforeCaseCreate`/`beforeCustomerMessage`/`beforeExternalReferenceOpen`/`afterAgentRun` → `harnessGuardCheckPII`
  - 검색: 주민/전화/계좌형 패턴 질의는 검색 자체 차단 (`jpoSearchBlockedReason`)
  - 런타임: `verifyNoPIILeakage()` — 저장소 직렬화 + 화면 innerText 스캔
  - 정적: `verify_static.py` — 소스 전체 실패턴 스캔
- 마스킹 데모 센티널: `010-0000-0000`(미배정 번호)과 가상 인물(홍길동)만 데모 원문에 허용.
  센티널 목록은 `HARNESS_PII_SENTINELS`가 단일 관리한다.

## 2. 권한·scope

- 모든 business query는 scope(roleKey/affiliateId) 필수 — repository가 미지정 호출에 예외를 던진다
  ("role scope is required" / "affiliateId scope is required").
- 자동 검증: `verifyRoleHarnessScope()`(scopeProbe), e2e 격리 테스트(타 scope seed 미노출),
  `onAuditWrite`/`afterCaseCreate`/`afterAgentRun` 훅의 scope 필드 검사.
- 운영 DB 전환 시 이 계약은 서버 행 수준 보안(RLS)으로 승격한다 (docs/02 §5).

## 3. 승인 누락 방지 (고객 대상 발송)

- 고객 안내문·문자·콜백 스크립트는 **항상 approval pending**을 거친다. 자동 발송 경로 자체가 없다.
- 자동 검증: `beforeCustomerMessage` 훅(`harnessGuardCheckApprovalRequired`),
  e2e "안내문 approval pending" 불변식, 승인 결정은 `afterApprovalDecision` 훅이
  사람 담당자(USR-*)인지 확인한다.

## 4. 자동 종결 금지 (high/critical)

- high/critical 위험의 run/case/alert는 completed/closed로 자동 전이될 수 없다.
- 자동 검증: `beforeAgentRun` 훅이 시도를 감지하면 needsReview로 **안전 강등**하고
  `JPO_HOOK_VIOLATION_AGENT_RUN` 감사 기록을 남긴다. e2e 불변식이 이중 확인한다.

## 5. 확정 판단·대행 금지 (금융/법률)

- 전세사기 여부·피해자 결정 가능성·보증 가입 가능성·법률 자문을 단정하는 표현,
  실제 신청 제출/대행, 대출 승인/금리/한도 판단은 금지.
- 자동 검증: `forbiddenAssertions` 패턴 훅 검사 + 정적 게이트의 단정 리터럴 스캔 +
  `verifyAgentRegistryCompleteness()`(모든 agent blockedActions에 공통 금지 9종 포함).
- 모든 AI output에는 "내부 운영 참고용 · 담당자 검토 필요"를, 제도 안내에는
  "최신 기준 담당자 확인 필요"를 표시한다.

## 6. 외부 반출

- 검토 패킷 내보내기(`/jeonse-export-review-packet`)는 직렬화 결과를
  `beforeExternalReferenceOpen` 훅으로 검사한 뒤에만 생성하고 감사 기록을 남긴다.
- 외부 LLM/API 연동 시(로드맵): 비식별 데이터만, 서버 사이드 프록시 + 환경변수 키 (docs/02 §5).

## 위반 처리 원칙

차단 가능한 지점(생성·발송·반출)은 **차단 + 감사 기록**, 이미 발생한 지점은
**안전 강등 + reviewRequired 감사 기록**. 모든 훅 실행은 `harnessHookLog()`에 남는다.
