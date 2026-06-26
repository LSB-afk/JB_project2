# _체계

JB LocalGuard OS의 시스템 체계와 운영 규칙을 정리하는 공간입니다.

## 대회·본선 문서

- [[JB금융그룹 Fin AI Challenge — 대회 안내 정본 (공식 전문)]] — 대회 안내 정본(공식 전문): 개요·평가기준 25항목·규칙·일정·상금·동의사항.
- [본선-안내.md](본선-안내.md) — 오프라인 본선 정보·시상·이메일·팀 현황 (⚠️ 대외비, 6/29 공식발표 전 비공개).
- [본선-준비-계획.md](본선-준비-계획.md) — 본선 준비 실행 계획·체크리스트.

## 이 폴더의 역할

이 폴더는 제품이 흔들리지 않도록 하는 운영 계약입니다. 기능을 추가하더라도 아래 흐름과 안전 정책을 유지해야 합니다.

## 핵심 체계

```text
Case -> AgentRun -> Agent -> Skill -> Evidence -> Approval -> Audit
```

## 생애주기

| 단계 | 의미 | 화면/문서 |
| --- | --- | --- |
| Case | 고객/사업자/전세 위험을 하나의 작업 단위로 등록 | 케이스, 대시보드 |
| AgentRun | 케이스에 대해 Agent 실행을 생성 | 실행 이력, 상세 패널 |
| Agent | 역할이 분리된 실행 주체 | 에이전트 팀, 조직도 |
| Skill | Agent가 장착하는 처리 능력 | 스킬, 전세 보호 기능 |
| Evidence | 판단 근거와 출처 | 근거 피드, 증빙 문서 |
| Approval | 고객-facing 행동 전 사람 검토 | 승인 큐 |
| Audit | 실행/판단/승인 이력 | 활동 이력, 상세 패널 |

## 운영 원칙

- 고객-facing 행동은 승인 전 자동 실행하지 않습니다.
- 고위험 fraud case는 외부 접촉을 차단합니다.
- 전세사기 case는 가격, 권리관계, 고객 자산, 계약, 은행 연계를 분리해 판단합니다.
- 모든 판단은 Evidence와 Audit으로 연결합니다.
- Agent는 결론만 내리지 않고 근거, 불확실성, 다음 확인 항목을 남깁니다.
- 승인 이후에도 실행 결과와 후속 조치는 감사 로그로 남깁니다.

## 승인 정책

| 위험 수준 | 허용 자동화 | 필요 통제 |
| --- | --- | --- |
| L0 | 관찰, 태그, 근거 수집 | 감사 로그 |
| L1 | 내부 메모, 체크리스트 초안 | RM 검토 |
| L2 | 고객 안내 초안, 콜백 태스크 | RM 승인 |
| L3 | 금융조건, 계약 특약, 민감 권고 | RM + 준법/법률 검토 |
| L4 | 사기, 법률, 중대한 불이익 가능성 | 외부 접촉 차단, 상위 검토 |

## Agent 팀 분류

- 운영 지휘·감사: LocalGuard Orchestrator, Analytics Agent
- 위험·금융 판단: Pain Radar, Cashflow Triage, Policy Match
- 전세 보호 전문 라인: Jeonse Shield Lead, Deposit Ratio, Registry Rights, Tenant Asset Risk
- 준법·차단·계약 통제: Fraud Shield, Compliance Guard, Contract Checklist
- 고객 안내·은행 연계: RM Copilot, Bank Linkage

## 연결 문서

- [Agent 시스템](../03_에이전트/agent-system.md)
- [Skill Registry](../03_에이전트/skill-registry.md)
- [기능 명세](../02_제품/function-spec.md)
- [아키텍처 다이어그램](../04_아키텍처/README.md)
- [LLM 운영 위키](../03_에이전트/README.md)

## 다음 보강 방향

- 위험 점수 산식과 승인 레벨 산정 규칙을 코드/문서 양쪽에 동기화합니다.
- 실제 API 전환 시 `Case`, `AgentRun`, `Approval`, `AuditEvent` 스키마를 분리합니다.
- 감사 로그에 actor, action, evidence id, approval id를 명시적으로 남깁니다.
