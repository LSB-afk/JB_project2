---
tags:
  - area/product
  - type/diagram
  - status/active
date: 2026-07-04
up: "[[INDEX|제품 인덱스]]"
---

# 시스템 컨텍스트 다이어그램 (C4 L1)

> **정합 기준**: [[08_본선/03_제품/docs/05_domain-model|05_domain-model]]·[[08_본선/03_제품/docs/07_architecture|07_architecture]](루트 정본) §1. 코드 SSOT: `_vendor/JB_project2/app/`(e57b826, 전세보호 하네스 v3). 히어로 케이스 = **CCL-0001**(전주 카페 운영자 운전자금, `BIZ-REF-0001`, 구 표기 `JBG-104`).

---

## 목적

C4 모델 Level 1 — JB LocalGuard OS(역할축 4콘솔 하이브리드)가 외부 액터·시스템과 어떻게 연결되는지 보여준다.

---

## 범위 — 역할축 4콘솔

| 콘솔 | 계열사 | 도메인 | 코드 근거 |
|---|---|---|---|
| 기업여신(CCL) | 전북은행 | 소상공인·기업여신 심사 | `cclConsole.core.js`·`cclConsole.data.js` |
| FDS(피싱대응) | 전북은행 | 보이스피싱·이상거래 실시간 선차단 | `fdrConsole.core.js`·`fdrConsole.data.js` |
| 전세보호 | 전북은행 | 전세사기 위험 담당자 업무 루프 | `jeonseProtection*.js`(v3) |
| JB우리캐피탈 | JB우리캐피탈 | 오토/개인/기업 여신·EWS(전세 없음) | `jbWooriCapitalAgents.registry.js`·`wooricap*.js` |

---

## 다이어그램

```mermaid
graph LR
  RM["직원(1선)<br/>RM·여신심사·사후관리"]
  SUP["감독/준법(2선)<br/>승인·반려"]
  CUST["고객(차주/임차인/카드고객)<br/>비식별 BIZ-REF"]

  subgraph SYS["LocalGuard OS — 역할축 4콘솔(하이브리드: 전북은행 3 + JB우리캐피탈 1)"]
    CCL["기업여신 콘솔(CCL)<br/>히어로 CCL-0001"]
    FDR["FDS 콘솔<br/>피싱·이상거래"]
    JPO["전세보호 콘솔<br/>(v3)"]
    JBWC["JB우리캐피탈 콘솔"]
    LOCAL["로컬모델 머신<br/>(원본 PII 유일 처리점)"]
  end

  CORE["은행 계정계/정보계<br/>(CDC read · MCI/EAI write)"]
  PUB["공공 오픈API<br/>(국토부·HUG·ECOS, 비-PII)"]
  FRONT["외부 프런티어 LLM<br/>(비식별 컨텍스트만)"]

  RM -->|조회·요청| CCL & FDR & JPO & JBWC
  CCL -->|승인 요청| SUP
  FDR -->|승인 요청| SUP
  JPO -->|승인 요청| SUP
  JBWC -->|승인 요청| SUP
  SUP -->|결재| CCL & FDR & JPO & JBWC
  CCL & JPO & JBWC -.->|승인 후 초안 발송| CUST
  FDR -.->|승인 전 실시간 선차단(예외)| CUST
  CCL & FDR & JPO & JBWC <-->|읽기 CDC / 쓰기 승인후 MCI| CORE
  CCL & FDR & JPO & JBWC --> PUB
  CCL & FDR & JPO & JBWC -->|반출 스캔 통과분| FRONT
  CCL & FDR & JPO & JBWC <--> LOCAL
```

| 외부 액터/시스템 | 관계 | 경계 규칙 | E? |
|---|---|---|---|
| 직원(1선: RM·여신심사·사후관리) | 케이스 조회·AI 요청·초안 요청, **승인권 없음** | 역할·계열사 스코프(`roleKey`) 필수 | E4 |
| 감독/준법(2선) | 승인/반려 결정, 고객 발송 최종 게이트 | 결정자 `USR-*`만 통과 | E4 |
| 고객(차주/임차인) | 상담·회신 대상, **원문 PII 미보관** | `BIZ-REF` 익명 참조·구간값만 | E4 |
| 은행 계정계/정보계 | 읽기=CDC, 쓰기=승인 후 MCI/EAI | AI 직접 원장 조회·직접 Write 금지 | E2 [미검증] |
| 공공 오픈API(국토부·HUG·ECOS) | 시세·통계 조회 | 그 자체 비-PII → 반출 스캔 비대상 | E3 |
| 외부 프런티어 LLM | 비식별 요약·추론 | 반출 스캔 통과분만, 원본 PII 국외이전 금지 | E3 |

**예외**: FDS(사기)만 실시간 선차단이 사람 승인 **전** 허용된다 — 다른 3콘솔(기업여신·전세보호·JB우리캐피탈)은 고객 대상 행동 전부 승인 후 발송 [E2, domain-model §1].

CaseOps 확장(9파이프라인·메모리라우터·119 등)은 팀 미확정 — **[분기/미확정]**, 이 다이어그램 범위 밖.

---

## 참조

- [[08_본선/03_제품/docs/05_domain-model|05_domain-model — 도메인 모델(정합 대상)]]
- [[08_본선/03_제품/docs/07_architecture|07_architecture — 아키텍처(정합 대상)]]
- [[08_본선/03_제품/05_diagrams/99_comprehensive-architecture|종합 아키텍처]]
