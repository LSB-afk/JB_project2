# UI 밀도·정렬 고도화 리포트

## 목표

JB LocalGuard OS의 14개 주요 해시 라우트를 대상으로 `측정 → 수정 → 재측정` 절차를 수행했다. 이번 작업은 색상, 기능, 데이터 구조를 바꾸지 않고 `work/app/styles.css` 중심으로 과도한 세로 여백, 배지 정렬, 카드 내부 빈 공간, 리스트 행 밀도를 개선하는 데 한정했다.

## 측정 환경

| 항목 | 값 |
| --- | --- |
| 실행 서버 | `python3 -m http.server 4173 --directory app` |
| 측정 스크립트 | `scripts/measure_density.js` |
| 기준 뷰포트 | 1920 x 1080 |
| 측정 라우트 | `#dashboard`, `#inbox`, `#cases`, `#approvals`, `#runs`, `#jeonse`, `#goals`, `#agents`, `#orgchart`, `#skills`, `#routines`, `#activity`, `#budget`, `#settings` |
| Before 캡처 | `test-results/density/before/screenshots/` |
| After 캡처 | `test-results/density/after/screenshots/` |
| 배지 확대 캡처 | `test-results/density/after/screenshots/status-pill-zoom.png` |

## 화면별 Before/After 결과

| 화면 | Scroll before -> after | 절감 px | 레이아웃 간격 before -> after | 초과 gap before -> after | 1920 화면 내 표시 항목 |
| --- | ---: | ---: | ---: | ---: | --- |
| 대시보드 | 3473 -> 3392 | 81 | 90 -> 88 | 24 -> 24 | 6 -> 6 |
| 알림함 | 418 -> 396 | 22 | 55 -> 52 | 24 -> 24 | 3 -> 3 |
| 케이스 | 1172 -> 720 | 452 | 54 -> 52 | 24 -> 24 | 5 -> 5 |
| 승인 | 592 -> 546 | 46 | 55 -> 52 | 24 -> 24 | 2 -> 2 |
| 실행 | 624 -> 574 | 50 | 55 -> 51 | 24 -> 24 | 7 -> 7 |
| 전세 Shield | 954 -> 925 | 29 | 54 -> 52 | 24 -> 24 | 6 -> 6 |
| 운영 목표 | 348 -> 337 | 11 | 54 -> 52 | 24 -> 24 | 10 -> 10 |
| 에이전트 팀 | 1845 -> 1769 | 76 | 66 -> 63 | 24 -> 24 | 14 -> 17 |
| 조직도 | 1444 -> 1432 | 12 | 55 -> 52 | 24 -> 24 | 5 -> 5 |
| 스킬 | 1565 -> 1514 | 51 | 66 -> 64 | 24 -> 24 | 21 -> 24 |
| 자동화 | 642 -> 612 | 30 | 55 -> 52 | 24 -> 24 | 10 -> 10 |
| 활동 이력 | 618 -> 595 | 23 | 54 -> 52 | 24 -> 24 | 11 -> 11 |
| 비용 | 1287 -> 1268 | 19 | 78 -> 76 | 24 -> 24 | 7 -> 7 |
| 설정 | 483 -> 441 | 42 | 55 -> 52 | 24 -> 24 | 4 -> 4 |

가장 큰 개선은 케이스 화면이다. 리스트 모드에서도 보드용 `min-height`가 적용되어 카드 수보다 훨씬 큰 빈 영역이 생기던 문제를 제거해 452px을 줄였다.

## CSS 전수 점검 및 판정

| 선택자 | 현재 값 또는 패턴 | 판정 | 사유 |
| --- | --- | --- | --- |
| `.board-panel .case-board` | `min-height: calc(100vh - 236px)` | 제거/분리 | 케이스 리스트 화면에서 실제 행 수보다 큰 빈 보드 영역을 강제했다. 리스트 전용 `.case-list-board`는 `min-height: 0`으로 분리했다. |
| `.board-panel .hagent-kanban` | `min-height: calc(100dvh - 210px)` | 축소 | 칸반은 보드형 UX라 최소 높이가 필요하지만 과도했다. `min(480px, calc(100dvh - 240px))`로 상한을 둔다. |
| `.status-pill` | 여러 위치의 높이, padding, line-height | 통일 | 상태 배지가 행 안에서 아래로 쏠려 보였다. 고정 24px, `line-height: 1`, flex 중앙 정렬로 통일했다. |
| `.context-panel .status-pill` | `line-height: 1.25` 계열 | 축소 | 한글 상태 문구가 배지 내부에서 수직 중앙에 오도록 최종 override에서 `line-height: 1`로 고정했다. |
| `.case-list` | `gap: 14px` | 축소 | 12px 토큰으로 맞춰 목록 그룹 사이 공백을 줄였다. |
| `.case-list-rows` | `gap: 7px` | 축소 | 4px 토큰으로 맞춰 상태 행 사이 간격 폭발을 줄였다. |
| `.case-row` | `padding: 11px 12px` | 축소 | 행 높이는 44px 이상 유지하되 세로 padding을 8px로 줄였다. |
| `.approval-list` | `gap: 10px`, `margin-top: 12px` | 축소 | 승인 목록의 행 사이 간격을 8px 기준으로 정리했다. |
| `.approval-item` | 넓은 내부 gap/padding | 축소 | 상태 배지, 제목, 액션 버튼 사이의 빈 공간을 줄였다. |
| `.approval-actions` | `margin-top` 과다 | 축소 | 액션 버튼이 카드 하단으로 밀리는 느낌을 줄였다. |
| `.workspace-header h2`, `.page-header h2` | 큰 제목 line-height | 축소 | 운영 콘솔 화면에서 헤더가 과도하게 높아지는 것을 줄였다. |
| `.workspace-panel`, `.panel` | 카드 내부 padding/gap | 축소 | 카드 내부 여백을 12px 기준으로 정리했다. |
| `.metric-card` | 큰 최소 높이 | 축소 | KPI 카드의 고정 높이를 96px로 낮춰 대시보드 상단 정보 밀도를 높였다. |
| `.agent-team-group`, `.agent-team-grid` | 그룹 padding/gap | 축소 | 에이전트 팀 화면에서 첫 화면 표시 카드 수가 14개에서 17개로 늘었다. |
| `.skill-card`, `.agent-card`, `.run-card`, `.work-item` | 카드 내부 하단 margin 잔존 | 제거 | 마지막 요소 아래 추가 margin을 제거해 카드 하단 빈 공간을 줄였다. |

## 간격 토큰

`app/styles.css` 상단 `:root`에 다음 토큰을 고정했다.

| 토큰 | 값 | 사용 기준 |
| --- | ---: | --- |
| `--space-1` | 4px | 행 내부 미세 간격, 칩 그룹 최소 gap |
| `--space-2` | 8px | 목록 행 gap, 작은 버튼/칩 padding |
| `--space-3` | 12px | 카드 내부 기본 padding, 패널 gap |
| `--space-4` | 16px | 페이지 상단 padding, 주요 버튼 padding |
| `--space-5` | 20px | 섹션 사이 중간 간격 후보 |
| `--space-6` | 24px | 섹션 사이 최대 간격 후보 |

## 상태 배지 표준화 결과

전 화면 상태 배지는 아래 스펙으로 수렴했다.

```css
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
```

적용 화면:

| 화면 | 적용 위치 |
| --- | --- |
| 케이스 | 케이스 행 상태 배지, 위험 태그 |
| 승인 | 승인 대기/통과 상태 배지, 액션 버튼 행 |
| 실행 | 실행 중/대기 상태 배지 |
| 에이전트 팀 | 에이전트 상태 배지 |
| 스킬 | 스킬 위험/분류 칩 |
| 오른쪽 상세 패널 | 상태, 출처, 위험 칩 |

기존 색상 토큰 대비 측정:

| 토큰 | 대비 |
| --- | ---: |
| warning | 3.80:1 |
| violet | 5.82:1 |
| danger | 4.80:1 |
| cyan/blue | 6.68:1 |
| success | 3.62:1 |

이번 작업의 전제 조건이 “색상 변경 금지”였기 때문에 `warning`, `success` 토큰의 AA 미달은 색상 변경 없이 제한사항으로 남겼다.

## 회귀 검증

| 검증 | 결과 |
| --- | --- |
| `node scripts/measure_density.js before` | 통과, before 캡처 14장 생성 |
| `node scripts/measure_density.js after` | 통과, after 캡처 14장 및 diff 생성 |
| 1920 / 1366 / 390 레이아웃 테스트 | 통과, 가로 스크롤 0, 첫 콘텐츠 상단 정렬 확인 |
| 콘솔 에러 | 14개 라우트 측정 기준 0건 |

## 남은 제한사항

- 케이스 데이터가 현재 5건 샘플이기 때문에 “케이스 목록 8행 이상 표시”는 데이터 변경 없이는 달성할 수 없다. 이번 작업에서는 더미 행을 추가하지 않고 불필요한 빈 보드 높이만 제거했다.
- `warning`, `success` 상태 토큰은 기존 색상 유지 조건 때문에 WCAG AA 4.5:1에는 미달한다. 다음 접근성 pass에서 토큰을 조정해야 한다.
- 차트나 표 데이터가 실제 API와 연결되면 긴 텍스트, 빈 데이터, 지연 상태 기준으로 별도 밀도 QA가 필요하다.
