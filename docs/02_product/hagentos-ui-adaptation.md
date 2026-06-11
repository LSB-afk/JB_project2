# HagentOS UI Adaptation

This update expands JB LocalGuard OS from a simple 3-column MVP into a HagentOS-style finance operations console. The main hero title is the AI Agent model name, `JB LocalGuard OS`; the challenge title is kept as contextual metadata, not the primary product title.

## Borrowed System Items

- 4-zone layout: organization rail, sidebar navigation, main work surface, properties panel
- Command bar: natural-language instruction to Orchestrator
- Dashboard metrics: risk, approval, live run, budget
- Case board: TODO, IN PROGRESS, APPROVAL, DONE, BLOCKED
- Approval queue: human-in-the-loop review before external action
- Live AgentRun panel: running agent, linked case, transcript preview
- Agent team: status, reportsTo, heartbeat, queue, mounted skills
- Skill registry: skill type, purpose, risk, approval policy
- Heartbeat routines: scheduled scans and coalesced operational runs
- Activity ledger: audit-style timeline
- Budget page: per-Agent budget consumption
- Settings: organization profile, approval policy, integration adapters

## Finance Adaptation

The reference HagentOS domain is not copied. Each item is mapped to JB finance operations.

| HagentOS item | LocalGuard finance mapping |
| --- | --- |
| 기관 | JB affiliate tenant: 전북은행, 광주은행, JB우리캐피탈 |
| 학생/학부모 | 지역 소상공인, 개인사업자, 중소사업자 |
| 민원 case | 금융 위험 case: cashflow, rate, fraud, policy, digital barrier |
| 원장 승인 | RM, 준법, 보안 담당자 승인 |
| k-skill | finance/risk/compliance skill package |
| Activity | AgentRun and approval audit ledger |
| Schedule/Routine | daily pain radar scan, fraud sync, SLA checks |
| Budget | per-Agent API/runtime budget |

## Visual Direction

The palette follows the attached JB Challenge banner:

- deep navy: command and rail surfaces
- JB blue: primary actions and active states
- cyan: live state, evidence highlights, metric accents
- white: panel surfaces for scanability

## Layout Specification

- organization rail: 72px
- sidebar: 272px desktop, 248px medium
- properties panel: 360px desktop
- page padding: 18px
- page gap: 16px
- card and control radius: 8px
- hero minimum height: 220px
- command panel: 280px label column plus flexible command input
- operations grid: flexible board plus 320px live-run panel

The UI avoids the academy domain and presents a finance operating system suitable for the free-topic JB future business AI track.
