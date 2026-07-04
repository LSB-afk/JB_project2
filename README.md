# app

JB 금융안전 업무지원의 실행 가능한 정적 MVP 앱입니다.

## 실행 방법

```bash
cd app
python3 -m http.server 8000
```

브라우저에서 `http://127.0.0.1:8000/index.html`을 엽니다.

## 파일 역할

| 파일 | 역할 |
| --- | --- |
| `index.html` | 앱 엔트리와 4-zone shell 구조 |
| `styles.css` | HagentOS 기반 레이아웃, Pretendard 폰트, 그룹/패널/카드 스타일 |
| `app.js` | Case, Agent, Skill, Evidence, Approval, Audit 데모 데이터와 화면 렌더링 |
| `modules.js` | 보조 데이터 레지스트리와 패널 |
| `jbWooriCapitalSidebar.config.js` | JB우리캐피탈 route/nav/taxonomy/한국어 라벨 config |
| `jbWooriCapitalAgents.registry.js` | JB우리캐피탈 전용 13개 에이전트 registry·정책·라우팅 규칙 |
| `wooricap-db.js` | JB우리캐피탈 localStorage mock DB + `jbwcRepository` 인터페이스 |
| `jbWooriCapitalServices.js` | JB우리캐피탈 count/search/triage/케이스 생성 서비스 |
| `wooricap.helpers.js` | JB우리캐피탈 공용 렌더 헬퍼(상태 pill·테이블·상세 패널) |
| `wooricap.view.board.js` `wooricap.view.cases.js` `wooricap.view.wizard.js` `wooricap.view.harness.js` | JB우리캐피탈 view 단위 화면 |
| `wooricap.sidebar.js` | JB우리캐피탈 사이드바 점유/복원·검색·카운트 바인딩 |
| `wooricap.js` | JB우리캐피탈 라우팅/이벤트 연결부 |
| `wooricap.css` | JB우리캐피탈 전용 `jbwc-` 스코프 스타일 |

상세 아키텍처와 route/count/taxonomy/guardrail 문서는 `docs/03-JB우리캐피탈-하네스.md` 참고.

## Hero 데모 진입점

- 첫 화면(업무 보드)에서 바로 시작: GP-1 여신(소상공인·SME) `?demo=sme`, GP-2 보이스피싱 차단 `?demo=phishing`
- 전세 보호는 확장 로드맵 미리보기(`?demo=jeonse`)로만 제공
- JB우리캐피탈 전용 포털: `#/jb-woori-capital/board` (독립 하네스, 그룹 확장성 증명)

## 화면 구성

- 대시보드: 관리 건 상태와 운영 지표
- 알림함: 승인 대기/차단/긴급 알림
- 관리 건: 고객/사업자/전세 위험 관리 건
- 승인: RM/준법 승인과 수정 요청
- 실행 이력: AgentRun 로그
- 전세 보호: 전세 관련 위험 신호 신호와 은행 연계 흐름
- AI 업무지원 팀: 업무 범주별 AI Agent 분류
- 조직도: 담당자 최종 확인자와 AI Agent 보고 체계
- 업무 기능: Agent에 장착되는 기능 단위
- 활동 이력/비용/설정: 운영 관리 영역

## 현재 동작

- 카드 클릭 시 오른쪽 상세 패널 갱신
- 상세 패널 on/off
- 상세 패널 항목 접기/펼치기
- AgentRun 실행 후 로그와 상태 갱신
- 승인/수정 요청 후 Case status와 Audit 갱신
- AI 업무지원/업무 기능/기능 연결 상세 확인

## 검증

```bash
cd ..
python3 scripts/verify_static.py
```

추가 브라우저 검증 권장 항목:

- 1920x1080에서 가로 넘침이 없는지 확인
- AI 업무지원 팀 분류 5개가 보이는지 확인
- 상세 패널 접기/펼치기가 실제로 본문을 숨기는지 확인
- 콘솔 오류가 없는지 확인
