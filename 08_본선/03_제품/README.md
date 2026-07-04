---
tags:
  - area/product
  - type/reference
  - status/active
date: 2026-06-26
up: "[[_03_제품_MOC|제품 MOC]]"
---

# JB LocalGuard OS — 제품 README

> 개발자 진입점. 코드 구조·실행 방법·기여 방법.

---

## 제품 한 줄 정의

지역 금융 고객의 위험 신호를 모아 Case를 생성하고, AI 에이전트들이 판단·행동 초안·검증을 수행하되, 고객 대상 행동은 **사람 승인 전까지 차단**하는 금융 AI 에이전트 운영 콘솔.

---

## 코드 위치 (정본 분리)

- **제품·데모·코드 정본** = `LSB-afk/JB_project2`(역할축 콘솔, 벤더 참조 `_vendor/JB_project2/`). 예선 `02_제품/app`은 레거시. 근거 [[레포-지도]].
- **문서 정본** = 이 볼트(`08_본선`). 코드↔문서 정본 분리.
- 실동작 에이전트 슬라이스(ccl-financial 실 LLM) = PR `LSB-afk/JB_project2#1`([[jb-project2-리얼리티]]).

---

## 빠른 시작

```bash
# 제품(JB_project2) 실행
cd _vendor/JB_project2 && npm run dev          # → http://127.0.0.1:8000/index.html
# 데모 시나리오: 전북은행 → 기업여신 콘솔 → 히어로 CCL-0001(전주 카페 운전자금)
# 실 LLM 에이전트로 보려면(선택, 모델 선택 게이트웨이 — 어드민이 claude/codex/로컬모델 중 선택):
#   로컬모델(EXAONE 등, PII 처리) 우선 · 로컬 불가 시 codex 폴백 → URL에 ?live=1
# 정적 검증(예선 앱): npm run test   # verify_static 문자열 계약
```

---

## 기술 스택

- **프론트엔드**: vanilla JS(무번들, `<script>` 로드) · string-template 렌더 · 역할축 콘솔(계열사×역할)
- **상태/데이터**: `localStorage`(데모) · 설계상 read-only 내부 DB·공공 API(CDC/MCI 비접촉, [[18_data-strategy]])
- **AI/에이전트**: 모델 선택 게이트웨이 — 어드민이 **claude code CLI / codex CLI / 로컬모델**(EXAONE 3.5 7.8B 등) 중 선택. PII 하이브리드: 로컬모델이 PII 포함 처리(온프레, 원문 비반출) / 프런티어(claude·codex)는 비민감·최소필드만. 로컬 불가 시 codex 폴백. 운영계약 `Case→AgentRun→Agent→Skill→Evidence→Approval→Audit`. 가드레일 `harnessCore.js`(PII·단정금지·스코프·승인)
- **거버넌스**: 승인 L0~L4(준법 L3~L4) · 원본 PII 외부 비반출 · 감사 해시체인

---

## 주요 설계 문서 (문서세트 INDEX)

- [[08_본선/03_제품/INDEX|제품 문서 인덱스]] — 전체 목록
- 차별성: [[차별성-경험레이어-서사]](왜) · [[차별성-설정근거상향-흐름]](어떻게)
- 제품: [[04_definitions]] · [[05_domain-model]] · [[01_prd/prd|PRD]] · [[08_feature-spec]] · [[09_flow]] · [[07_architecture]]
- 거버넌스/검증: [[rules/agent-rules|rules]] · [[evals/rubric|evals]] · [[jb-finai-scorecard]] · [[validation-report]]
- 핸드오프(부팅): [[본선 HOME|HANDOFF]] · 디자이너 [[_디자이너-핸드오프]]

---

## 참조

- [[_체계/본선-백엔드-실연동-설계|본선 백엔드 실연동 설계]]
