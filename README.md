# JB LocalGuard OS — 프로토타입 (JB_project2)

> **"손은 놓고, 눈만"** — 에이전트가 일하고, 담당자는 승인만. AI는 제안하고, 사람은 결정한다.
>
> JB금융그룹 Fin:AI Challenge 출품용 **담당자 승인 중심 금융 AI 에이전트 운영 콘솔**의 실행 가능한 정적 프로토타입입니다.
> 프레임워크·빌드·백엔드 없이 브라우저에서 전체 운영 루프(접수 → 분류 → 에이전트 제안 → 사람 승인 → 감사 기록)가 동작합니다.

## 빠른 시작

```bash
npm install          # Playwright (검증용)
npm run dev          # http://127.0.0.1:8000/index.html
```

| 데모 | 진입 | 내용 |
| --- | --- | --- |
| GP-1 여신 (Hero 실동작) | `?demo=sme` 또는 첫 화면 CTA | 소상공인·SME 대출심사 운영지원 — AI가 위험 점수·필요 서류·체크리스트·권고 액션을 제안, RM이 승인 |
| GP-2 보이스피싱 (Hero 실동작) | `?demo=phishing` 또는 첫 화면 CTA | 이상거래 탐지·차단 운영지원 — high/critical 자동 종결 금지, human escalation 유지 |
| GP-3 전세 보호 (확장 로드맵) | `?demo=jeonse` | 로드맵 미리보기 — Hero 실동작 범위 아님 |
| JB우리캐피탈 포털 (그룹 확장성 증명) | `#/jb-woori-capital/board` | 동일 운영 패턴을 계열사 전용 독립 하네스로 확장 |
| 전세사기 보호 업무지원 포털 (역할=독립 하네스) | 역할 레일 → 전세보호 담당자 또는 `#/roles/jeonse-protection/board` | lifecycle 보드·공공데이터 시세 엔진·위험 신호 스코어링·피해지원 연계를 가진 별도 운영 콘솔 |

### 실데이터 라이브 데모 (선택, `?live=1`)

기본값은 **OFF**(결정론적 오프라인 데모). 공공 API 1종(국토부 연립다세대 실거래가)으로
"실데이터 증명"을 켜려면:

```bash
# 국토부 실거래 7종 + 서울 열린데이터 — dataset별 키 또는 공용 키 체인 (모두 환경변수로만)
MOLIT_SERVICE_KEY=<국토부 Decoding 키> SEOUL_OPEN_API_KEY=<서울 키> npm run demo:proxy   # 로컬 프록시 :8020
# 브라우저에서 ?live=1 붙여 접속 → 전세 사전 점검의 "주변 매매가"에 실거래가 평균 적용
open "http://127.0.0.1:8000/index.html?live=1#jeonse"
```

- 프록시/키가 없으면 자동으로 **시뮬레이션 기본값 fallback**으로 완주합니다 (모델·API 없이도 데모 보장).
- 감사 로그에 시세 출처(`공공데이터` vs `시뮬레이션 입력`)가 기록됩니다.
- `?model=0`으로 로컬모델 플래그만 끌 수 있습니다 (`window.RUNTIME_CONFIG`).
- 전세보호 포털의 시세 보강도 동일 프록시를 사용합니다: 지원 키 —
  `MOLIT_SERVICE_KEY`/`MOLIT_API_KEY`/`PUBLIC_DATA_API_KEY`/`DATA_GO_KR_KEY`,
  dataset별 `MOLIT_APT_TRADE_KEY`·`MOLIT_APT_RENT_KEY`·`MOLIT_ROW_HOUSE_TRADE_KEY`·`MOLIT_ROW_HOUSE_RENT_KEY`·
  `MOLIT_DETACHED_HOUSE_TRADE_KEY`·`MOLIT_DETACHED_HOUSE_RENT_KEY`·`MOLIT_OFFICETEL_RENT_KEY`,
  서울 `SEOUL_OPEN_API_KEY`/`SEOUL_API_KEY`/`MOVEVALUE_SEOUL_OPEN_API_KEY`. 키 없으면 스냅샷/샘플 fallback.

## 검증

```bash
npm run build      # 정적 계약 검증 (파일·핵심 문자열·금지 패턴·JS 문법)
npm test           # 동일
npm run test:e2e   # Playwright 47개 시나리오 (골든패스·승인/감사·계열사/역할 스코핑·라이브 fallback·반응형)
npm run test:smoke # 전세보호 역할 하네스 스모크만 (16단계 플로우 + 자체 검증 루프)
```

## 문서

| 문서 | 내용 |
| --- | --- |
| [docs/01-시스템-아키텍처.md](docs/01-시스템-아키텍처.md) | 설계도: 전체 구성도, 운영 계약(Case→…→Audit), 에이전트 하네스, 가드레일 |
| [docs/02-은행-DB-연동-설계.md](docs/02-은행-DB-연동-설계.md) | 기존 은행 DB(계정계/정보계/FDS/전자결재)와의 연결 방안 명문화 — 단계별 로드맵·데이터 매핑·보안 통제 |
| [docs/03-JB우리캐피탈-하네스.md](docs/03-JB우리캐피탈-하네스.md) | 계열사 전용 하네스: route·count 매핑·taxonomy·에이전트/핸드오프·seed·전환 주의사항 |
| [docs/04-전세보호-역할-하네스.md](docs/04-전세보호-역할-하네스.md) | 역할 전용 하네스: 역할=독립 업무 하네스 원칙, 메뉴/count 매핑, 라우팅 규칙, PII 가드레일, 공식 근거 |
| [app/HARNESS_GUIDE.md](app/HARNESS_GUIDE.md) | ECC식 하네스 엔지니어링: Agents·Skills·Commands·Hooks·Rules·Verification·Continuous Learning |
| [app/ROLE_HARNESS_CONTRACT.md](app/ROLE_HARNESS_CONTRACT.md) | 역할 하네스 계약: manifest 검증 기준, 신규 역할 추가 절차, 금지 alias 패턴 |
| [app/SECURITY_GUARDRAILS.md](app/SECURITY_GUARDRAILS.md) | 보안 가드레일이 어느 계층(훅/검증기/정적 게이트)에서 자동 검증되는지 명문화 |

## 보안·컴플라이언스 원칙

- 실제 대출 승인/거절·금리/한도 산정·신용평가·금융거래 실행 **없음** (UI 자체가 존재하지 않음)
- 실제 고객 개인정보/신용정보 원문 **미사용** — 익명 참조 ID(CUST-*/CONTRACT-*)만 사용, 전체 데이터는 모의(mock)
- 보이스피싱·FDS 고위험(high/critical) 케이스 **자동 종결 금지** — e2e 불변식으로 고정
- 모든 AI output은 "내부 운영 참고용" — 최종 판단은 담당자 승인
- 운영 credential 없음 — DB 연동 시 서버 환경변수로만 주입 (docs/02 참고)

## 구조

```
app/          정적 SPA (메인 하네스 app.js + JB우리캐피탈 전용 wooricap.*)
tests/e2e/    Playwright 시나리오 33개
scripts/      verify_static.py (정적 계약 게이트)
docs/         아키텍처·DB 연동·계열사 하네스 설계
```
