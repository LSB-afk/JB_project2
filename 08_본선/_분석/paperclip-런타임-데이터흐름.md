---
tags:
  - area/product
  - type/reference
  - status/active
date: 2026-07-02
up: "[[_03_제품_MOC]]"
aliases:
  - paperclip-런타임-데이터흐름
  - paperclip-runtime-dataflow
---
> **[대외비]** 6/29 공식 발표 전 비공개. 대회 출처·팀명·서비스명 외부 검색 노출 금지.
> ⚠️ **격리 fork 실험 기록.** 실제 설치·부팅·조작으로 얻은 **런타임 사실**만 기록(정적 티어다운 [[paperclip-소스-티어다운]]이 못 담은 부분). 코드는 볼트 밖 fork(`~/Downloads/archives/paperclip-jb-fork/`, 독립 git) — 볼트 미커밋.

# Paperclip 런타임 데이터흐름 — 실측 (fork 설치·부팅·영속 검증)

## 왜 이 문서
정적 소스 티어다운만으로는 **"데이터가 실제로 어떻게 흐르고 어디에 저장되는가"**를 확신할 수 없다. 그래서 MIT 원본을 격리 fork(`paperclip-jb-fork`)로 실제 설치·부팅하고, API로 엔티티를 만들고, 서버를 죽였다 살려 **디스크 영속을 실측**했다. 아래는 그 결과. (경로 매핑 = Codex `codex:codex-rescue` 소스 추적 / 부팅·영속 = Opus 실행 검증.)

## ① 설치·부팅 (실측 ✅)
- **Node** v22.17.1 · **pnpm** 9.15.4(`corepack`/`npm i -g`) · **패키지매니저** pnpm 모노레포(`packages/* + server + ui + cli`).
- `pnpm install` → **13초**(pnpm store 캐시). plugin-sdk dist 미빌드 경고는 **비치명**(core 서버 부팅 무관).
- `pnpm dev` → **HTTP 200 @ `127.0.0.1:3100`**. `/api/health` = `{status:ok, version:0.3.1, deploymentMode:local_trusted, deploymentExposure:private, authReady:true}`.
- 모드: **embedded-postgres + vite-dev-middleware**, bind **loopback(127.0.0.1)**, **Agent JWT missing**(→ 라이브 에이전트 런에만 필요, `pnpm paperclipai onboard`). heartbeat 30s, DB 자동백업 60m/7d.
- **격리 실행법**: `PAPERCLIP_HOME=~/.paperclip-jbfork pnpm dev` → 기존 default 클러스터(`~/.paperclip`, 5/9 실데이터: 회사1·워크스페이스4) **무영향**. 신규 홈에 fresh 클러스터 생성.

## ② 데이터흐름 지도 (소스 file:line — Codex 추적)
공통 형태: **HTTP 라우트 → 서비스 → Drizzle insert → 테이블**, 읽기는 별도 GET 라우트/서비스. 라우터는 `server/src/app.ts`에서 마운트.

### Company
`app.ts:222`(`/api/companies`) → **POST** `routes/companies.ts:297` → `svc.create` `routes/companies.ts:302` → `db.insert(companies)` `services/companies.ts:227,234` → 테이블 **`packages/db/src/schema/companies.ts:3`**. 읽기 = `routes/companies.ts:87`(list)/`:126`(byId), `services/companies.ts:247/253`.

### Issue
`app.ts:229`(`/api`) → **POST** `/companies/:companyId/issues` `routes/issues.ts:5117` → `svc.create` `:5224` → `tx.insert(issues)` `services/issues.ts:5199` → 테이블 **`schema/issues.ts:22`**. 읽기 = `routes/issues.ts:3030`(list)/`:3490`(byId).

### Approval
`app.ts:241`(`/api`) → **POST** `/companies/:companyId/approvals` `routes/approvals.ts:128` → `svc.create` `:149`(+이슈링크 `:162`) → `db.insert(approvals)` `services/approvals.ts:110,112` → 테이블 **`schema/approvals.ts:5`** + 링크 **`schema/issue_approvals.ts:7`**. 읽기 = `routes/approvals.ts:107/116/183`, `routes/issues.ts:5039`(이슈별 승인).

> 이 3개가 우리 운영계약 `Case→AgentRun→Agent→Skill→Evidence→Approval→Audit`의 실동작 대응(매핑표는 [[paperclip-소스-티어다운]] ②). **엔티티=PG 테이블, 라우트=우리가 서버화할 API 계약의 실물 참조.**

## ③ 저장 구조 (실측 ✅)
- **임베디드 PostgreSQL 데이터 디렉터리** = `~/.paperclip/instances/default/db` (격리 실행 시 `~/.paperclip-jbfork/instances/default/db`, **73MB**).
- 경로 해상: `packages/shared/src/home-paths.ts:16,19`(home=`~/.paperclip`) → `:30,34`(instance=`instances/default`) → `:55,59`(db=`db`).
- 부팅 흐름(`server/src/index.ts`): `DATABASE_URL` 미설정 → `embedded-postgres` import(`:326,329`) → `persistent:true`, port **54329**, 충돌 시 `detectPort`(`:420,426,431`) → **`PG_VERSION` 존재 시 init 건너뜀**(`:377,437,448`) → restart 후 기존 상태 유지.
- **Migration**: 폴더 `packages/db/src/migrations`(`client.ts:9`), `ensureMigrations`가 pending 자동 적용(`index.ts:152,197`), Drizzle migrator(`client.ts:660,668,710`). 부팅 로그 = "Migrations already applied".
- **구조적 엔티티(회사·이슈·승인) = PG**. 에이전트 작업 산출물·워크스페이스·프로젝트는 **파일시스템 폴더**(`instances/default/{companies,workspaces,projects,data/backups}/<uuid>/`)로 분리 저장 — default 인스턴스에서 실물 확인.

## ④ 실행 검증 — 영속 사이클 (실측 ✅)
1. **생성**: `POST /api/companies {name:"JB금융그룹 LocalGuard", budgetMonthlyCents:500000}` → `201`, `id=db37c44b-7bb7-4f73-8323-c9ec255e276a`, **`issuePrefix:"JBL"` 자동 파생**, `issueCounter:0`, `status:active`.
2. **리드백**: `GET /api/companies` → 방금 회사 1건 정상.
3. **완전 종료**: 서버(pid 3100) + PG(pid 54329) `kill` → `HTTP 000`, PG 리스너 소멸 확인.
4. **재기동**: `pnpm dev` 재부팅(~20s) → `GET /api/companies` → **같은 회사 생존**(동일 `id`·`createdAt=17:24:07`). ✅ **임베디드 PG 디스크 영속 결정적 증명.**
- 로컬 loopback 호출은 `actor.source==="local_implicit"`로 인정 → **토큰 없이 CRUD 가능**(생성 라우트 가드 `routes/companies.ts:303`). 프로덕션/원격은 instance admin 필요.

## ⑤ 키 필요/범위 밖
- **LLM 키(BYO)** = 실제 **에이전트 라이브 런**에만 필요(Agent JWT). 데이터흐름·영속·스킨·도메인 개조는 **키 없이 전부 관찰·검증됨**.
- `psql` 직접 조회는 embedded PG 비밀번호 미노출로 스킵(API 리드백으로 충분히 대체).

## 우리 제품(서버화)에의 함의
- 우리 파이널 목표 = 4 함수계약(`computeRiskDecision` 등)을 **서버 API로 승격**. paperclip의 `routes/*.ts → services/*.ts → db.insert(schema)` 3층이 그 **직접 참조 아키텍처**.
- **임베디드 PG(`persistent:true` + `PG_VERSION` skip-init)** = "외부 DB 셋업 0"으로 데모/온프렘 배포하는 실전 패턴 — JB 온프렘/로컬모델 요건과 정합.
- **PII 무반출 원칙 유지**: 이 fork는 로컬 loopback·가공 예시 데이터만. 실데이터·키 반입 없음.

## 루프2 — JB 디자인 토큰 리스킨 (실측 ✅)
- 대상: `ui/src/index.css` **단일 파일**(+42/−39, 순수 값 스왑). Tailwind v4 `@theme inline` + `:root` 구조라 값만 교체.
- 적용: `--primary #0A31A8`(JB브랜드) · `--ring #51E3A4`(focus-green) · `--destructive #D00000`(status-rise) · `--radius 0.5rem`(8px) · `--border/--input #E5E5E5` · `--chart-1..5` JB팔레트(accent/cyan/deep/esg/focus) · `--agent-1a..10b` JB navy→cyan→green 10쌍 · SUIT Variable 웹폰트(@import CDN + `--font-sans` + body font-family).
- 검증: Vite `hmr update /src/index.css` → **브라우저 계산 스타일에 `--primary:#0A31A8` 등 전부 반영**(재부팅 불필요). "Create Task" 버튼 근검정→**JB 블루** 육안 확인.
- 함의: **디자인 전면 차용은 값 스왑 1파일로 끝**. 우리 제품 리스킨도 동일하게 토큰 레벨에서 가능(단, 우리는 바닐라JS라 `styles.css` CSS 변수로 이식).

## 루프3 — JB 도메인 개조 (실측 ✅)
- **표시계층 relabel**(Codex): `ui/src/components/Sidebar.tsx` 네비 16개 한글화 — 케이스·루틴·목표·산출물·스킬·프로젝트·조직도·비용·활동·설정·새 케이스·업무·계열사. route/키/변수 무변경. (전면 relabel은 라벨이 21개 TSX에 하드코딩 + i18n 로케일이 9줄짜리라 위험 → **고가시성 1파일만** 타깃.)
- **JB 실데이터 시드**(API, 키 불필요): 3계열사(**JB금융그룹 LocalGuard·전북은행·JB우리캐피탈**) + 리스크 Case 총 **9건**(계열사별 3건). 그룹 hero(JBL-1 SME여신·JBL-2 전세사기·JBL-3 보이스피싱) + 전북은행(CMP: 다중채무·재기지원·소상공인) + JB우리캐피탈(JB: 자동차할부·개인사업자·고령금융). issuePrefix에서 키 자동 파생(JBL/CMP/JB).
- **페르소나 데이터셋 활용**: [[nemotron-personas-korea]](NVIDIA, **합성 한국인 페르소나** — 실 PII 아님 → 고객PII 무반출 원칙 정합). datasets-server API로 600행 수집→전북/전주·직군 선별. 각 Case = 실 페르소나 각색(신태관 카페사장·최은재 철도종사 신혼·고병선 수선집 고령·오정숙 주방보조·이정주 자동차영업·김효진 웨딩플래너 등, 이름까지 데이터셋 내장). Case 상세엔 **차주정보·리스크신호·권고액션** 3층 = RM 실무 활용형.
- ⚠️ 제약(422): `in_progress`/`in_review` 상태는 **assignee(에이전트) 필수** — 에이전트 없이는 todo/backlog까지만. 라이브 에이전트 배정·런은 BYO 키 영역.
- 검증: 최종 화면에 **한글 네비 + JBL-1/2/3 Case + JB 블루 + SUIT** 동시 렌더·영속.
- 결론: **"거의 실사용 수준 JB 콘솔"이 격리 fork에서 실제로 구현됨**. 남은 영문(TASKS 헤더·New Task 버튼·AGENTS 섹션)은 전면 relabel 시 별도 작업(테스트 21개 동반 수정 필요).

## 3루프 총평 (의사결정 근거)
- **(A) fork→개조 경로는 실현 가능**: 설치 몇 분 + 값스왑 1파일 리스킨 + 네비 1파일 relabel + API 시드 = 반나절이면 JB 브랜드·JB 도메인 콘솔이 실동작.
- **단, 스택 종속**(React/Vite/Drizzle/Postgres). 우리 파이널이 이 실물을 **그대로 배포**할지, 아니면 이 검증된 아키텍처·토큰·IA만 **우리 바닐라JS/서버로 리프트**할지는 **제품정의 확정 후** 결정(현재 대기). 이 실험은 그 판단의 **실측 근거**.

## Codex 병렬 실행 + 테스트 검증 (2026-07-02)
- **Codex 4병렬**(A 테스트·B 조직도·C 데이터·D 인벤토리, 하위에이전트 활용): **Codex sandbox가 ①localhost:3100 TCP ②`~/Downloads` 쓰기 ③`node_modules` 임시쓰기를 전부 차단** → Codex는 **소스·스키마 리서치만 성공**, **실행(API 시드·테스트·스크린샷)은 Opus(내)가 수행**. 효과적 분업 = **Codex 리서치 / 나 실행**. (재사용 교훈: fork는 볼트 밖이라 Codex writable-root 밖 → 실행계는 메인 셸로.)
- **데이터 확장(내 실행, Codex 스키마 기반)**: **9 에이전트**(조직도 계층 reportsTo — 그룹 CEO→판단·행동초안·검증, 계열사 RM 리드→RM; adapter=`process`/`command:true` 키불요) + **4 승인**(pending, `request_board_approval`/`budget_override`) + **4 목표** + **3 루틴**.
- **테스트(내 실행, sandbox 없음)**: `vitest run Sidebar.test.tsx` → **14 pass / 6 fail**. 6 실패 **전부 영문라벨 assert**(`toContain("Inbox")`·`textContent==="Artifacts"` 등 — 우리가 한글화한 라벨). **구조 breakage 0** = 우리 시각개조는 순수 코스메틱 확정. 타입: 편집물이 라벨 문자열+CSS값뿐이라 type-inert.
- **시각 검증(갤러리)**: 조직도(판단→행동초안→검증 계층·`computeRiskDecision` 표기) · 대시보드(Agents 4·**Pending Approvals 2**·감사 activity) · 인박스 승인큐(**검증 에이전트 요청→사람 Approve/Reject 게이트**) · Case 상세(차주·신호·권고 3층). 우리 운영계약 `Case→AgentRun→Agent→Skill→Evidence→Approval→Audit` 전 구간이 화면에 실재.

## 연결
- 부모: [[_03_제품_MOC]] · 정적 분석: [[paperclip-소스-티어다운]](소스 티어다운) · [[paperclip-레퍼런스-분석]](스크린샷 IA)
- fork(비커밋): `~/Downloads/archives/paperclip-jb-fork/` (baseline `1bf3099`) · Codex 원본 리포트: fork 내 `_JB분석/런타임-데이터흐름.md`
- 다음: 루프2 JB 디자인 토큰 리스킨 → 루프3 JB 도메인 개조(표시계층·seed).
