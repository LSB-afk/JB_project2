/* RM 하네스 commands — 자동화 전 단계의 검증/큐/새로고침만 허용. */

const rmOfficerCommands = [
  { key: "/rm-run-smoke-test", label: "하네스 자체 점검", description: "scope/count/agent/evaluator/hook 계약을 점검한다." },
  { key: "/rm-refresh-counts", label: "카운트 새로고침", description: "sidebar/보드 count query를 다시 실행한다." },
  { key: "/rm-evaluator-check", label: "가드레일 검증", description: "금지 표현/PII/high-risk 자동종결을 점검한다." },
  { key: "/rm-reprioritize", label: "우선순위 재정렬", description: "업무보드를 급한 순 근거 기준으로 다시 정렬한다." },
];
