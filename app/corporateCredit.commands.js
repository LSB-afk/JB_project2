/* 기업여신 하네스 commands — 자동화 전 단계의 검증/큐 생성만 허용. */

const corporateCreditCommands = [
  { key: "/corporate-run-smoke-test", label: "하네스 자체 점검", description: "scope/count/agent/evaluator 계약을 점검한다." },
  { key: "/corporate-refresh-counts", label: "카운트 새로고침", description: "sidebar count query를 다시 실행한다." },
  { key: "/corporate-evaluator-check", label: "가드레일 검증", description: "금지 표현/PII/high-risk 자동종결을 점검한다." },
];
