# Skill Registry

Skill packages are domain capabilities mounted onto Agents. This follows the reference system pattern where an Agent is not hardcoded for one job; it receives skills with instructions, tools, policies, and metadata.

## Skills

| Slug | Type | Purpose | Approval Policy |
| --- | --- | --- | --- |
| `case-os-core` | orchestration | Create and update case state | internal only |
| `evidence-harvest` | research | Pull pain evidence from news, policy, official pages, counseling notes | internal only |
| `source-ranker` | research | Rank source credibility and freshness | internal only |
| `pain-classifier` | reasoning | Classify case pain as cashflow, rate, delinquency, fraud, policy, digital-barrier | internal only |
| `cashflow-stress` | finance | Estimate repayment stress from sales pressure, debt burden, and rate sensitivity | RM review |
| `rate-relief` | finance | Identify rate shock and relief/refinance conversation needs | RM review |
| `policy-match` | finance | Match support program clues and required documents | RM review |
| `document-checklist` | operations | Produce missing document checklist | RM review |
| `fraud-shield` | risk | Detect suspicious call, deepfake, phishing, abnormal callback, forced transfer | blocks external action |
| `do-not-contact-rule` | risk | Stop customer-facing output when fraud or compliance risk is high | mandatory |
| `notification-brief` | communication | Draft RM note or customer callback script | approval required |
| `tone-control` | communication | Keep text factual, calm, non-promissory | approval required |
| `compliance-guard` | compliance | Check prohibited claims, privacy exposure, misleading benefit language | mandatory |
| `privacy-redaction` | compliance | Mask PII in logs and drafts | mandatory |
| `claim-limiter` | compliance | Replace guaranteed outcome wording with review-safe wording | mandatory |
| `approval-gate` | control | Require human approval before external action | mandatory |
| `audit-ledger` | control | Record evidence, judgment, action, user approval, timestamp | mandatory |
| `portfolio-signal` | analytics | Aggregate branch or affiliate level pain clusters | internal only |
| `trend-summary` | analytics | Summarize changing risk themes | internal only |
| `case-metrics` | analytics | Track queue age, approval status, recurring pain | internal only |
| `jeonse-price-ratio` | jeonse-risk | Estimate high jeonse-ratio risk against likely market value | RM review |
| `local-market-compare` | jeonse-risk | Compare deposit against nearby market references | RM review |
| `registry-rights-scan` | legal-risk | Detect mortgage, seizure, provisional seizure, trust registration, and other registry risk signals | human/legal review |
| `ownership-transfer-delta` | legal-risk | Detect short-term ownership transfer and abnormal ownership history | human/legal review |
| `guarantee-feasibility` | guarantee | Classify likely guarantee-insurance feasibility questions and required checks | RM review |
| `tenant-asset-exposure` | asset-risk | Estimate deposit exposure versus customer assets and loss sensitivity | advisor review |
| `housing-cost-burden` | asset-risk | Analyze housing cost and jeonse-loan repayment burden versus monthly income | advisor review |
| `pre-contract-checklist` | contract | Draft document, landlord, broker, and guarantee pre-checklist | approval required |
| `special-clause-drafter` | contract | Draft special clause wording for human/legal review | legal review |
| `bank-linkage-brief` | banking | Connect jeonse-loan counseling, guarantee guidance, warning, and safe-contract guide | RM approval |

## Skill Contract

```json
{
  "slug": "fraud-shield",
  "name": "Fraud Shield",
  "type": "risk",
  "instructions": [
    "Look for suspicious callback, urgent transfer, voice modulation, deepfake, unusual URL, or account takeover clues.",
    "If fraud risk is high, block customer-facing messages and create an escalation memo."
  ],
  "tools": ["evidence_feed", "case_notes", "risk_rules"],
  "policies": ["do_not_contact_on_high_fraud", "audit_required"],
  "metadata": {
    "riskLevel": "high",
    "requiresApproval": true,
    "zeroHumanLevel": "L4"
  }
}
```

## Runtime Loading Rule

1. Orchestrator opens a case.
2. The case pain tags decide which skills are mounted.
3. Agents run only with mounted skills.
4. Every skill output must include `evidence`, `confidence`, `proposedAction`, and `approvalPolicy`.
5. Approval Gate blocks actions whose policy is not satisfied.

## Proposed Skills — Pending Approval (Not Yet Runtime-Loaded)

> Source: `08_본선/05_제출/리서치-딥프롬프트/_04-담당자별-에이전트스킬-설계-기획프롬프트.md`. These back the 4 role dashboards (기업여신·소비자보호·FDS·준법감시) whose UI already ships skill tags not yet in the registry above. Do not mount until `product` approves per the AGENTS.md propose→approve gate.

| Slug | Type | Purpose | Approval Policy | Target persona |
| --- | --- | --- | --- | --- |
| `financial-statement-parse` | finance | Parse financial statements, VAT filings, tax invoices for credit review | RM review | 기업여신 |
| `collateral-valuation` | finance | Compute LTV and effective collateral value | RM review | 기업여신 |
| `facility-lease-review` | finance | Cross-check facility loan / lease-installment cases against CREFIA disclosure items | RM review | 기업여신 |
| `delegation-authority-router` | operations | Route branch-delegated / HQ-review / credit-committee cases by parameterized delegation-authority matrix (not hardcoded) | RM review; escalates to legal/compliance review | 기업여신 |
| `fund-usage-check` | compliance | Cross-check tax invoices and remittances against stated loan purpose | RM review; escalates to mandatory on suspected misuse | 기업여신 |
| `suitability-check` | compliance | Assess product suitability/appropriateness against the 6 mandatory customer-disclosure items | RM review; escalates to legal review on mismatch | 소비자보호 |
| `product-risk-match` | compliance | Match product risk profile against customer profile | RM review | 소비자보호 |
| `prohibited-claim-detector` | compliance | Detect guaranteed-return, loss-minimization, or exaggerated sales claims | mandatory | 소비자보호 |
| `complaint-classifier` | operations | Classify complaint intake by type and severity | RM review | 소비자보호 |
| `response-draft` | communication | Draft complaint responses bundled with evidence packet | approval required | 소비자보호 |
| `vulnerable-customer-flag` | compliance | Flag elderly / first-time / digitally vulnerable customers for extra disclosure | RM review | 소비자보호 |
| `plain-language-rewrite` | communication | Rewrite customer-facing text into plain, low-literacy-friendly language | approval required | 소비자보호 |
| `impersonation-pattern` | risk | Detect authority-impersonation, remote-control app install, deepfake-call signals | internal only (scoring); blocks external action only via `fraud-shield` | FDS/보이스피싱 |
| `mule-account-pattern` | risk | Detect mule-account patterns: rapid multi-deposit, split withdrawal, cross-bank report history | internal only (scoring) | FDS/보이스피싱 |
| `freeze-justification-check` | compliance | Review false-positive appeal evidence against a 5-business-day SLA before unfreezing | mandatory (human approval to unfreeze) | FDS/보이스피싱 |
| `interbank-liaison` | operations | Record cross-bank hotline coordination for mule-account freezes | internal only | FDS/보이스피싱 |
| `rule-performance-monitor` | analytics | Track shared/proprietary detection-rule performance and override rates | internal only | FDS/보이스피싱 |
| `rule-update-proposal` | analytics | Draft detection-rule update proposals from monitored performance | internal only | FDS/보이스피싱 |
| `duty-map-trace` | compliance | Trace task → owner → approver → responsible executive per 책무구조도 | internal only (observation); escalates to mandatory on gap | 준법감시 |
| `three-lines-check` | compliance | Verify 1st/2nd/3rd line-of-defense execution for a case | internal only | 준법감시 |
| `pii-egress-scan` | compliance | Scan outbound payloads for residual PII before external egress | mandatory | 준법감시 |
| `pseudonymization-audit` | compliance | Audit separation of pseudonymized data from re-identification keys and access-scope compliance | mandatory | 준법감시 |
| `affiliate-boundary-check` | compliance | Verify inter-affiliate data use stays within 금융지주회사법§48-2 internal-management purpose (excludes sales/marketing use) | mandatory | 준법감시 |
| `hash-chain-verify` | control | Verify audit-ledger hash-chain integrity | internal only (observation); escalates to mandatory on tamper signal | 준법감시 |
| `approval-log-completeness` | control | Check approval logs for missing approver, timestamp, or evidence link | internal only | 준법감시 |
| `kill-switch-trigger` | control | Trigger emergency stop of automated actions on critical violation | mandatory | 준법감시 |
| `incident-report-draft` | communication | Draft incident reports per 전자금융감독규정시행세칙 3-stage reporting (initial 24h / interim / final) | approval required | 준법감시 |
