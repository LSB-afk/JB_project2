# JB LocalGuard OS

JB LocalGuard OS는 JB금융그룹 Fin:AI Challenge 자유주제 출품을 위한 AI Agent MVP입니다. 학원 운영자 문제를 금융 문제에 연결하지 않고, `River-181/KEG-Mangsanggwedo`에서 사용한 에이전트 운영 체계만 이전했습니다.

이 MVP는 전북은행, 광주은행, JB우리캐피탈을 중심으로 지역 소상공인과 중소사업자의 연체 조짐, 금리 부담, 정책금융 매칭, 보이스피싱 위험을 하나의 `Case`로 묶고, 각 Agent가 스킬을 장착해 판단, 행동, 검증을 수행하는 운영 콘솔입니다. UI의 메인 모델명은 `JB LocalGuard OS`이며, 대회명은 보조 맥락으로만 사용합니다

## 핵심 방향

- 자유주제: JB금융그룹의 현재 추진 사업 또는 미래 지향점과 연결되는 AI Agent 서비스
- 적용 도메인: 지역 소상공인과 중소사업자 금융안전 운영
- 이전한 시스템: `Case -> AgentRun -> Approval -> Audit`
- 이전한 방식: 스킬 패키지 주입, 승인 중심 자동화, zero-human 레벨, 감사 가능한 활동 로그
- 이전하지 않은 것: 학원 운영자, 학원 업무, 교육 도메인 pain point
- 전세사기 대응 확장: 전세가율, 주변 시세, 권리관계, 고객 자산노출, 계약 체크리스트, 보증보험, 은행 상담 연결을 담당하는 Jeonse Shield Agent 라인

## MVP 실행

브라우저에서 아래 파일을 바로 열면 됩니다.

```text
app/index.html
```

정적 검증은 아래 명령으로 실행합니다.

```bash
python3 scripts/verify_static.py
```

## 문서 구조

- `_MOC`: GitHub 워크스페이스 전체 지도
- `02_전략`: 자유주제 전략, 평가 대응, pain point 근거 연결
- `03_제품`: 제품 PRD, 기능 명세, 실행 앱 연결
- `04_증빙`: PDF, DAKER 페이지, 기사, 공식자료 증빙
- `05_제출`: 제출 패키지와 심사용 산출물
- `06_LLM위키`: LLM/Agent 운영 패턴과 다음 작업 프롬프트
- `07_아키텍처`: Mermaid 기반 시스템/데이터/API/사용자 흐름 다이어그램
- `_체계`: `Case -> AgentRun -> Approval -> Audit` 운영 체계
- `자산`: 앱, 스크립트, 원천 자료 인덱스
- `산출`: 최종 제출/발표 산출물 인덱스
- `docs/00_sources`: PDF와 DAKER 페이지 요구사항을 읽고 정리한 원문 기반 노트
- `docs/01_research`: 금융 pain point 기사와 JB 사업 연계 근거
- `docs/02_product`: PRD와 기능명세서 초안
- `docs/03_agents`: Agent 시스템과 스킬 레지스트리
- `docs/04_submission`: MVP 제안서 초안과 평가항목 대응표
- `docs/05_evidence`: 출처 인덱스
- `app`: 실행 가능한 정적 MVP 콘솔

## 제품 한 줄

JB LocalGuard OS는 지역 금융 고객의 위험 신호를 기사, 정책, 거래 맥락, 상담 기록에서 감지하고, 승인 가능한 조치 초안을 생성하며, 모든 판단과 행동을 감사 로그로 남기는 금융 Agent 운영체계입니다.
