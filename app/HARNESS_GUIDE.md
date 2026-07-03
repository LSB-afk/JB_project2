# HARNESS GUIDE — 하네스 엔지니어링 가이드

> 하네스는 단순 UI/프롬프트 묶음이 아니라 **Agents + Skills + Commands + Hooks + Rules +
> Security + Verification + Continuous Learning**이 연결된 운영 프레임워크다.
> (참고 관점: Everything Claude Code / ECC 하네스 리뷰)

## 역할별 하네스란

- **역할 = 화면 필터가 아니라 독립 업무 하네스.** 각 역할/계열사는 자기 메뉴·데이터 스코프·
  에이전트·승인·감사 흐름을 가진 별도 운영 콘솔이다.
- 현재 등록된 하네스: `jeonse-protection`(역할), `jb-woori-capital`(계열사).
  main/default/safety 같은 이름의 alias 하네스는 존재하지 않으며, 만들면 verify가 실패한다.
- 필요한 구성요소만 선택적으로 도입한다 — agent/skill을 무조건 늘리면 오히려 느슨해진다
  (메인 조직도의 "실동작 5 vs 확장 예정 9" 분리와 같은 원칙).

## 공통 UI와 business logic의 경계

| 재사용 가능 (공통) | 분리 필수 (하네스 전용) |
| --- | --- |
| 4-zone 셸, `jbwc-*` CSS 토큰, `escapeHtml`/`iconSvg`/`render` | route/menu/query scope/count/search/case creation |
| 조직 레일, 토스트, 상세 패널 프레임 | agent registry, rules, hooks, guardrail, seed |

## 하네스 manifest 구조 (`harnessCore.js` / `harnessRegistry.js`)

```js
{
  id, kind(role|affiliate), scopeKey, scopeValue, displayName, routeBase,
  sidebarConfig, countService, searchService, caseCreationFlow,
  agents, skills, commands, hooks, rules, guardrails,
  verification: { enforceHooks, requiredHooks, requiredAgents, scopeProbe, piiScan, forbiddenResurface }
}
```

## Agents / Skills / Commands / Hooks / Rules 역할

- **Agents**: 책임·허용/금지 액션·dbReads/Writes·핸드오프·guardrail·metrics를 가진 실행 단위.
- **Skills**: 에이전트가 수행하는 재사용 가능한 업무 단위(입력→출력 계약). 예: `price-ratio-check`.
- **Commands**: 운영자가 실행하는 명령 registry(`/jeonse-new-case` 등). 앱 내부 버튼 액션으로 표현.
- **Hooks**: 실행 지점 가드(onRoleEnter, beforeCaseCreate, beforeAgentRun, beforeCustomerMessage,
  beforeExternalReferenceOpen, afterApprovalDecision, onAuditWrite …). 위반은 차단 또는 안전 강등 + 감사 기록.
- **Rules**: 하네스별 정책 파일(`jeonseProtectionRules.js`) — 금지 조항·단정 표현 패턴·필수 고지.

## Verification (Smoke Test / 자체 검증 루프)

- 브라우저: `runHarnessSelfTest(id)` — manifest 무결성/scope 강제/금지 재유입/PII/agent 완결성/hook 커버리지.
  `/jeonse-run-smoke-test` 명령으로 화면에서 실행 가능.
- 정적: `npm run build`(verify_static.py) — 파일·needle·금지 리터럴·실PII 패턴 스캔.
- e2e: `npm run test:e2e` 전체, `npm run test:smoke` 전세보호 스모크만.
- **작업이 끝나면 반드시 이 세 계층을 모두 돌린다.**

## Continuous Learning

세션에서 배운 패턴은 코드 리뷰 코멘트로 흘려보내지 말고 다음 중 하나로 남긴다:
1. 이 문서/`ROLE_HARNESS_CONTRACT.md`/`SECURITY_GUARDRAILS.md` 갱신
2. `verify_static.py` needle/금지 문자열 추가 (재발 방지 게이트)
3. e2e 불변식 테스트 추가
4. 워크스페이스 `.omc/decisions.md`·세션 로그 기록
