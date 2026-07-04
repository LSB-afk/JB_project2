# ROLE HARNESS CONTRACT — 역할 하네스 계약

모든 역할 하네스는 이 계약을 통과해야 한다. 기준 구현: `jeonse-protection`
(전세사기 보호 담당자). **기준 템플릿을 복사-붙여넣기 alias로 만드는 것은 금지** —
`describeNewHarnessScaffold(roleKey)`가 반환하는 독립 구성을 각자 새로 작성한다.

## 신규 역할 하네스 추가 절차

1. `harnessCore.js`의 `describeNewHarnessScaffold("<role-key>")` 체크리스트 확인.
2. 전용 파일 세트 작성 (모두 `<role>` 접두 네임스페이스):
   config → agents registry(+skills) → rules(+hooks) → scope 강제 db(repository) →
   services(count/search/생성/실행기록) → helpers/views → commands → sidebar(점유 중재) → router.
3. `index.html` 로드 순서에 삽입: `harnessCore` 이후, `harnessRegistry` 이전.
4. `harnessRegistry.js`에 manifest 등록 (`enforceHooks: true`, requiredHooks 3종 이상).
5. `app.js` 배선: applyHashRoute 분기, pages/context 맵, 레일 핸들러, activeView 마커.
6. `verify_static.py`: 파일 목록·needle·금지 문자열 추가.
7. e2e 전용 spec + smoke spec 추가 후 `npm run build && npm run test:e2e` 통과.
8. `docs/0N-<역할>-하네스.md` 작성, 이 문서와 `HARNESS_GUIDE.md` 갱신.

## 필수 독립 구성 (역할마다 자기 것)

routeBase / sidebarConfig / countService / searchService / caseCreationFlow(전용 wizard) /
agentRegistry / rules / hooks / seed·mock data(익명 Ref, 타 scope 검증 seed 포함) / tests.

## 금지 alias/import 패턴

- 다른 하네스의 business 함수·상수 참조: `jbwcTable(`, `JBWC_*`, `jpoTable(`, `JPO_*`(자기 하네스 외),
  메인 `agents` 배열, `roleDashboardPage(` — verify가 역할 레이어에서 검출 시 실패.
- `mainHarness` / `defaultHarness` / `safetyHarness` 이름의 alias 하네스.
- scope(roleKey/affiliateId) 없는 전체 조회 — repository는 미지정 시 반드시 예외를 던져야 한다.
- label-only 대시보드(텍스트 config만 바꾼 generic 화면)로의 회귀.
- 삭제된 축의 재유입: `consumer-protection-dashboard`, `compliance-dashboard`, `data-affiliate="광주은행"`.

## manifest 검증 기준 (runHarnessSelfTest)

| 검증기 | 통과 기준 |
| --- | --- |
| verifyHarnessIntegrity | manifest 필수 키 16종 + count/search 함수 + 전용 wizard + skills ≥1 |
| verifyRoleHarnessScope | scopeProbe: 미지정 조회 시 예외 발생, countService 정상 반환 |
| verifyNoForbiddenRoleResurface | 삭제 역할/광주은행/label-only 심볼 미존재 |
| verifyNoPIILeakage | 저장소 직렬화·화면 innerText에 주민/전화/계좌 패턴 없음 |
| verifyAgentRegistryCompleteness | 필수 agent 수 + 11개 필드 + 공통 blockedActions 전원 포함 |
| verifyHookCoverage | enforceHooks 시 requiredHooks·requiredCommands 연결 확인 |

## 다음 역할 확장 후보와 적용 패턴

- **RM**: ✅ 등록됨 (scope `rm-officer`) — 여신 상담 큐·정책금융 체크리스트·승인 라우팅 + 급한 순 "근거" 우선순위 + 키보드 승인 큐 + 개별/통합 MD 산출물. 히어로 케이스(전주 카페)를 seed로 승격. 문서: `docs/05-RM-하네스.md`.
- **기업여신 담당자**: 전결 라우팅·자금용도 점검을 derived 테이블로, 승인 매트릭스(L1~L4)를 rules로.
- **보이스피싱/FDS 담당자**: 기존 fds-dashboard(라벨형)를 이 계약으로 승격 — 경보 큐/지급정지 절차 안내 후보/자동 종결 금지 불변식 재사용.
- **JB우리캐피탈 운영 담당자**: 이미 manifest 등록됨. 남은 공통화: `enforceHooks: true` 전환(케이스 생성·에이전트 실행 지점에 hook 배선), commands registry 추가.
