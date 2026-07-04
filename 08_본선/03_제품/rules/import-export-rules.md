---
tags: [area/product, type/rule, status/active]
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
aliases: [가져오기-내보내기 규칙, import-export-rules]
---

# Import/Export Rules — 입출력 형식 규칙

> 현재 `02_제품/app/`에는 **내보내기(export)만 구현**되어 있고 가져오기(import)는 없다. 이 문서는 (1) 실제 코드에서 검증되는 export 규칙과 (2) 향후 데이터 연동([[08_본선/03_제품/06_build-roadmap/P1-데이터-연동기반|P1-데이터-연동기반]])에서 필요한 import 설계를 함께 다룬다. [미구현/설계] 표시 항목은 코드 대응이 없는 신규 규칙이다.

---

## 1. 내보내기 형식 (Export Formats) — E4 코드 검증

| ID | 규칙 | 근거(E4) |
|---|---|---|
| IOX-01 | 감사 원장 내보내기는 JSON만 지원한다(`application/json` Blob) | `exportAuditJson()`(`app.js:4774-4791`) |
| IOX-02 | 파일명 규칙: `${caseCode}-audit-ledger.json` (예 `JBG-104-audit-ledger.json`) | `anchor.download = \`${item.code}-audit-ledger.json\``(`app.js:4786`) |
| IOX-03 | 내보내기 payload 필수 필드: `schemaVersion`(int), `exportedAt`(ISO datetime), `caseCode`(string), `caseTitle`(string), `integrity`({ok, records}) | `app.js:4775-4781` |
| IOX-04 | `schemaVersion`은 앱 저장 스키마 버전(`storageSchemaVersion`, 현재 `4`)과 동일 값을 사용한다 — export/저장 스키마 버전 불일치 시 REJECT | `app.js:669`, `persistState()`(`app.js:4793-4809`) |
| IOX-05 | JSON은 사람이 읽을 수 있도록 2-space 들여쓰기로 직렬화한다(`JSON.stringify(payload, null, 2)`) | `app.js:4782` |
| IOX-06 | 검토 패킷(외부 반출용) 내보내기는 직렬화 결과를 `beforeExternalReferenceOpen` 훅으로 PII 스캔한 뒤에만 생성하고 감사 기록을 남긴다 | `SECURITY_GUARDRAILS.md` §6, `/jeonse-export-review-packet` 명령(`jeonseProtection.commands.js:87`, 참조 구현) |

---

## 2. 허용/거부 입력 형식 (Accepted/Rejected Input Formats) [미구현/설계]

> 우리 MVP는 `localStorage`(`jb-localguard-os-state-v2`)만 읽고, 외부 파일 import 기능이 없다. 아래는 P1 데이터 연동 착수 시 적용할 설계 규칙이다.

| ID | 규칙 |
|---|---|
| IOX-07 | 대량 Case 시드/이관은 CSV(UTF-8, 헤더 필수) 또는 JSON(schemaVersion 필드 필수)만 허용한다 |
| IOX-08 | Reject-If: 파일 인코딩이 UTF-8이 아님(BOM 없는 EUC-KR 등) — 인코딩 오류로 즉시 거부, 부분 반입 금지 |
| IOX-09 | Reject-If: CSV 헤더가 [[08_본선/03_제품/04_tech/data-model|data-model]] §1 Case 스키마의 필수 필드(`code`/`affiliate`/`segment`/`riskScore`/`status` 등)를 누락 |
| IOX-10 | Reject-If: import 페이로드에 원본 PII(주민번호/전화번호/계좌형 숫자열 패턴)가 포함 — `harnessGuardCheckPII()` 동일 패턴 재사용, 즉시 거부 |
| IOX-11 | Reject-If: `schemaVersion`이 현재 앱 버전보다 최신(포워드 호환 없음) — 거부하고 앱 업그레이드 안내 |

---

## 3. 내보내기 스키마 (Export Schema) — CSV [미구현/설계]

| ID | 규칙 |
|---|---|
| IOX-12 | 향후 CSV 내보내기 도입 시 컬럼 순서는 [[08_본선/03_제품/04_tech/data-model|data-model]] §1 Case 필드 순서를 그대로 따른다(`code, affiliate, segment, riskScore, riskLevel, status, stage` 순) |
| IOX-13 | CSV는 `restricted`/`confidential` 등급 필드(§data-rules DAT-14 참조)를 컬럼에서 완전히 제외한다 — 원본 PII가 CSV로 나가는 경로 자체를 만들지 않는다 |
| IOX-14 | CSV 인코딩은 UTF-8 with BOM(Excel 한글 호환)으로 고정한다 |

---

## 4. 파일명 규칙 (File Naming) — 확장

| ID | 규칙 | 근거 |
|---|---|---|
| IOX-15 | 모든 내보내기 파일명은 `${caseCode}-<종류>.{json\|csv}` 패턴을 따른다(IOX-02 확장) — 예 `JBG-104-audit-ledger.json`, `JBG-104-case-export.csv`(TBD) |
| IOX-16 | `<종류>` 토큰은 kebab-case 영문만 사용한다(한글·공백·특수문자 금지) — [[08_본선/03_제품/rules/naming-rules|naming-rules]] NAM-01과 동일 규칙 |

---

## 5. 오류 메시지 (Error Messages) [미구현/설계]

| ID | 규칙 |
|---|---|
| IOX-17 | scope 누락 오류는 코드와 동일한 문구를 그대로 사용자에게 노출한다: `"<scopeKey> scope is required"` — 내부 예외 메시지와 화면 표시 문구를 분리하지 않는다(디버깅 일관성) |
| IOX-18 | PII 패턴 탐지 거부 메시지는 어떤 필드가 문제인지 종류(주민등록번호/전화번호/계좌형 숫자열)만 밝히고, 탐지된 원문 값 자체는 절대 메시지에 포함하지 않는다 | `harnessGuardCheckPII()` 반환 문자열 패턴(`harnessCore.js:78`, `"개인정보 원문 의심 패턴 포함: ${hits.map(...)}"` — 값이 아닌 종류만 나열) 준용 |
| IOX-19 | 스키마 버전 불일치 오류는 "현재 버전"과 "요청 버전"을 함께 표시한다(사용자가 어느 쪽을 업그레이드해야 하는지 판단 가능하도록) |

---

## 연결
[[08_본선/03_제품/04_tech/data-model|데이터 모델]] · [[08_본선/03_제품/rules/data-rules|Data Rules]] · [[08_본선/03_제품/rules/naming-rules|Naming Rules]] · [[08_본선/03_제품/06_build-roadmap/P1-데이터-연동기반|P1-데이터-연동기반]] · [[08_본선/03_제품/docs/03_principles|Principles]]
