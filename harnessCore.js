/* ============================================================
   Harness Core — ECC식 하네스 표준 계층 (공유 인프라, business 로직 없음)
   하네스 = Agents + Skills + Commands + Hooks + Rules + Security + Verification이
   연결된 운영 프레임워크. 이 파일은 그 "엔진"만 제공한다:
   - manifest 등록/조회 (harnessRegistry.js가 각 하네스를 등록)
   - hook 실행기 + 위반 로그
   - 공통 guardrail 검사 유틸 (PII/단정 표현/scope/자동 종결/승인 누락)
   - 신규 역할 하네스 scaffold 기술자
   금지: 이 파일에 특정 역할/계열사의 business 상수·쿼리를 넣지 않는다.
   ============================================================ */

const HARNESS_MANIFEST_REQUIRED_KEYS = [
  "id", "kind", "scopeKey", "displayName", "routeBase", "sidebarConfig",
  "countService", "searchService", "caseCreationFlow", "agents", "skills",
  "commands", "hooks", "rules", "guardrails", "verification",
];

const harnessStore = { manifests: {}, hookLog: [] };

function registerHarness(manifest) {
  if (!manifest || !manifest.id) throw new Error("harness manifest requires id");
  harnessStore.manifests[manifest.id] = manifest;
  return manifest;
}

function getHarness(id) {
  return harnessStore.manifests[id] || null;
}

function listHarnesses() {
  return Object.values(harnessStore.manifests);
}

function harnessHookLog() {
  return harnessStore.hookLog.slice();
}

/* hook 실행기 — 등록된 handler들을 순서대로 실행하고 위반 목록을 모은다.
   handler는 (payload, manifest) => string[] | string | null 을 반환한다. */
function harnessRunHooks(harnessId, hookName, payload) {
  const manifest = getHarness(harnessId);
  const handlers = manifest && manifest.hooks && manifest.hooks[hookName];
  const violations = [];
  (handlers || []).forEach((handler) => {
    try {
      const result = handler(payload || {}, manifest);
      if (Array.isArray(result)) violations.push(...result.filter(Boolean));
      else if (result) violations.push(String(result));
    } catch (error) {
      violations.push(`hook 실행 오류(${hookName}): ${error.message}`);
    }
  });
  harnessStore.hookLog.unshift({
    harnessId,
    hook: hookName,
    violations,
    at: new Date().toISOString(),
  });
  if (harnessStore.hookLog.length > 200) harnessStore.hookLog.length = 200;
  return { ok: violations.length === 0, violations };
}

/* ---------- 공통 guardrail 검사 유틸 ---------- */

// 마스킹 데모 전용 센티널(명백한 가짜 번호) — 실 데이터 판정에서 제외
const HARNESS_PII_SENTINELS = ["010-0000-0000"];

const HARNESS_PII_PATTERNS = [
  { kind: "주민등록번호", re: /\d{6}-?[1-4]\d{6}/ },
  // 외국인등록번호는 성별자리 5-8로 주민번호와 별도 형태(하이픈 있는 형태가 신규 커버; 하이픈 없으면 계좌형 \d{11,}로 이미 잡힘)
  { kind: "외국인등록번호", re: /\d{6}-[5-8]\d{6}/ },
  { kind: "전화번호", re: /01[016789]-\d{3,4}-\d{4}/ },
  { kind: "계좌형 숫자열", re: /\d{11,}/ },
  // 이메일: TLD·워드바운더리 요구(보수적 — 코드 내 @media/모델명 오탐 방지)
  { kind: "이메일", re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/ },
  // 여권번호형: 영문 1자 + 숫자 8자(M12345678 스타일)
  { kind: "여권번호", re: /\b[A-Za-z]\d{8}\b/ },
];

function harnessGuardCheckPII(text) {
  let value = String(text == null ? "" : text);
  HARNESS_PII_SENTINELS.forEach((sentinel) => { value = value.split(sentinel).join(""); });
  const hits = HARNESS_PII_PATTERNS.filter((pattern) => pattern.re.test(value));
  return hits.length ? `개인정보 원문 의심 패턴 포함: ${hits.map((h) => h.kind).join(", ")}` : null;
}

/* 단정 표현 검사 — rules.forbiddenAssertions: [{ label, re }] */
function harnessGuardCheckAssertions(text, forbiddenAssertions) {
  const value = String(text == null ? "" : text);
  const hits = (forbiddenAssertions || []).filter((rule) => rule.re.test(value));
  return hits.length ? `확정 단정 표현 금지 위반: ${hits.map((h) => h.label).join(", ")}` : null;
}

/* scope 누락 검사 — row/payload에 scopeKey 필드가 채워져 있는가 */
function harnessGuardCheckScope(payload, scopeKey, expectedValue) {
  if (!payload || payload[scopeKey] !== expectedValue) {
    return `${scopeKey} scope 누락 또는 불일치 (기대값 ${expectedValue})`;
  }
  return null;
}

/* high/critical 자동 종결 시도 검사 */
function harnessGuardCheckAutoClose(riskLevel, status) {
  if (["high", "critical"].includes(riskLevel) && ["completed", "closed"].includes(status)) {
    return `high/critical 자동 종결 시도 차단 (riskLevel=${riskLevel}, status=${status})`;
  }
  return null;
}

/* 고객 발송 문안 승인 누락 검사 */
function harnessGuardCheckApprovalRequired(payload) {
  if (payload && payload.customerFacing && payload.approvalStatus !== "pending") {
    return "고객 발송 문안이 approval pending 없이 진행되려 함";
  }
  return null;
}

/* ---------- 신규 역할 하네스 scaffold ----------
   복사-붙여넣기 alias를 만들지 않기 위해, 새 역할이 갖춰야 할 독립 구성만 기술한다. */
function describeNewHarnessScaffold(roleKey) {
  return {
    roleKey,
    requiredFiles: [
      `<role>.config.js — routeBase/nav/업무유형/라벨 (다른 하네스 상수 참조 금지)`,
      `<role>Agents.registry.js — 전용 agent/skill 정의 + 라우팅 규칙`,
      `<role>Rules.js — 금지 rule + hook handler`,
      `<role>-db.js — scope 강제 repository (scope 미지정 시 예외)`,
      `<role>Services.js — count/search/생성/실행기록 (모든 query에 scope)`,
      `<role>.helpers.js / <role>.view.*.js — 화면 (공통 CSS 토큰만 재사용)`,
      `<role>.commands.js — 운영 명령 registry`,
      `<role>.sidebar.js — 사이드바 점유/복원(점유 중재 상호 호출)`,
      `<role>Harness.js — 라우터/바인딩 + bindModuleActions 체인`,
    ],
    requiredSteps: [
      "harnessRegistry.js에 manifest 등록",
      "index.html 로드 순서: core → config → registry → rules → db → services → views → commands → sidebar → router",
      "verify_static.py에 파일·needle·금지 문자열 추가",
      "전용 e2e(진입/persistence/scope 격리/생성 기록/불변식) + smoke test 추가",
      "HARNESS_GUIDE.md / ROLE_HARNESS_CONTRACT.md 절차 준수",
    ],
    forbidden: [
      "메인/타 하네스 business 함수·상수 import(alias)",
      "scope 없는 전체 조회",
      "label-only 대시보드로의 회귀",
    ],
  };
}
