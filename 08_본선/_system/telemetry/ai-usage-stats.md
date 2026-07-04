---
tags:
  - area/system
  - type/stats
  - status/active
date: 2026-06-27
up: "[[_HARNESS-SYSTEM]]"
---
# AI 사용 통계 (SSoT)

> <!-- aggregator 자동생성 --> 마지막 집계: 2026-07-04 19:12 UTC

## 전체 누적
- 총 세션: **32**
- 총 입력 토큰: **96,464,689**
- 총 출력 토큰: **25,069,227**

## 엔진별
| 엔진 | 세션 수 | 입력 토큰 | 출력 토큰 |
|------|--------|---------|---------|
| claude | 18 | 96,464,689 | 25,069,227 |
| codex | 13 | 0 | 0 |
| chatgpt | 1 | 0 | 0 |

## 분야별
| 분야 | 세션 수 | 입력 토큰 | 출력 토큰 |
|------|--------|---------|---------|
| ops | 29 | 96,434,689 | 24,529,227 |
| research | 3 | 30,000 | 540,000 |

## Codex CLI 별도 총량

- Codex CLI thread: **144**
- Codex CLI tokens_used: **121,993,380**
- 주의: `tokens_used`는 Codex thread 총량이며 입력/출력 분리값이 아니므로 위 표의 입력/출력 토큰과 합산하지 않음.
- 원천: [[codex-cli-backfill]] · [[codex-cli-usage-stats]]

---
[[ai-session-intake.README]] · [[_telemetry-log]] · [[codex-cli-usage-stats]] · [[ax-insights]]
