# _체계

JB LocalGuard OS의 시스템 체계와 운영 규칙을 정리하는 공간입니다.

## 핵심 체계

```text
Case -> AgentRun -> Agent -> Skill -> Evidence -> Approval -> Audit
```

## 운영 원칙

- 고객-facing 행동은 승인 전 자동 실행하지 않습니다.
- 고위험 fraud case는 외부 접촉을 차단합니다.
- 전세사기 case는 가격, 권리관계, 고객 자산, 계약, 은행 연계를 분리해 판단합니다.
- 모든 판단은 Evidence와 Audit으로 연결합니다.

## 연결 문서

- [Agent 시스템](../docs/03_agents/agent-system.md)
- [Skill Registry](../docs/03_agents/skill-registry.md)
- [기능 명세](../docs/02_product/function-spec.md)
- [아키텍처 다이어그램](../07_아키텍처/README.md)
