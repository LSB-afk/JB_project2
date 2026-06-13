# JB LocalGuard OS 심사 통과형 실동작 서비스 리포트

## 1. 전체 요약

- 개선 목표: 화면형 MVP를 심사위원이 직접 검증할 수 있는 실동작 서비스 사이클로 고도화한다.
- 주요 수정 내용: 골든 패스 3종, 설명 가능한 위험 판단 엔진, 감사 해시 체인, JSON 내보내기, 저장 schemaVersion, 비용 해석 문구, Playwright 캡처 검증을 추가했다.
- 현재 작동 가능한 기능: 전세 보호 진단, 보이스피싱 차단 승인, 소상공인 자금압박 RM 연결, 결과 저장, 후속 작업 생성, 감사 무결성 검증, 승인 레벨 매트릭스 확인.
- 남은 한계: 등기부/HUG/은행 내부망 API는 아직 실연동이 아니며, 화면에서는 `공공데이터`, `시뮬레이션`, `추정`으로 출처를 구분한다.

## 2. 사용자 시나리오 검증 결과

| 시나리오 | 기존 상태 | 문제점 | 개선 내용 | 최종 상태 |
| --- | --- | --- | --- | --- |
| GP-1 전세 보호 | 전세 화면과 케이스가 분리되어 보임 | 사용자가 결과 근거와 다음 행동을 한 번에 확인하기 어려움 | `?demo=jeonse`에서 전세 케이스, 위험 점수, 체크리스트, 은행 연계 행동을 한 흐름으로 고정 | 작동 |
| GP-2 보이스피싱 차단 | 사기 케이스는 카드 정보 중심 | 차단 사유와 승인 레벨이 설명되지 않음 | 외부 URL·콜백 위험, AI 악용 사기 신호, 고객 접촉 차단 신호를 점수 분해로 표시 | 작동 |
| GP-3 소상공인 자금압박 | RM 콜백 흐름은 있었지만 심사 시연 진입점이 약함 | 저장/후속 작업/대시보드 가치 확인이 끊김 | `?demo=sme`에서 승인 대기 케이스와 RM 다음 행동을 바로 재현 | 작동 |

## 3. UI 오류 및 버그 수정 내역

| Bug ID | 위치 | 문제 | 심각도 | 수정 내용 | 상태 |
| --- | --- | --- | --- | --- | --- |
| BUG-001 | 데모 진입 | 동일한 시작 상태가 없어 시연 결과가 달라질 수 있음 | High | URL 기반 데모 프로필과 케이스 초기화를 추가 | 완료 |
| BUG-002 | 분석 결과 | AI 판단 근거가 요약 문장에 머물러 설명가능성이 약함 | High | 신호별 점수 기여도, 출처 칩, 승인 레벨 라우팅 표시 | 완료 |
| BUG-003 | 감사 로그 | 감사 기록은 있었지만 무결성 확인이 불가능함 | Medium | hash chain, 검증 버튼, JSON export 추가 | 완료 |
| BUG-004 | 비용 대시보드 | 비용 수치가 행동 우선순위로 연결되지 않음 | Medium | 비용 비중, ROI, 우선 처리군을 해석 문구로 생성 | 완료 |
| BUG-005 | 테스트 산출물 | 기존 캡처 경로만 존재해 지시서 요구 경로와 다름 | Low | `test-results/screenshots`와 `tests/results/screenshots`에 동시 저장 | 완료 |

## 4. Playwright 테스트 결과

| 테스트명 | 목적 | 결과 | 스크린샷 |
| --- | --- | --- | --- |
| home and dashboard render | 대시보드 핵심 정보 렌더링 | 통과 | `tests/results/screenshots/home.png`, `dashboard.png` |
| golden path demo modes | 3개 골든 패스 진입·판단·출처 확인 | 통과 | `golden-jeonse-start.png`, `golden-phishing-start.png`, `golden-sme-start.png` |
| audit ledger verifies | 감사 해시 체인 검증과 JSON export | 통과 | `golden-audit-ledger.png` |
| approval matrix and storage schema | 승인 매트릭스와 localStorage schemaVersion 확인 | 통과 | `golden-approval-matrix.png` |
| mobile/tablet viewport | 반응형 레이아웃 확인 | 통과 | `mobile-view.png`, `tablet-view.png` |

## 5. 비용·통계·데이터 대시보드 개선

- 추가된 KPI: 현재 사용 비용, 월말 예상 비용, 절감 가능 위험, 비용 대비 효과.
- 추가된 차트: 월별 비용 추이, 항목별 비용 비중, 지역별 위험도, 위험도 랭킹.
- 비용 계산 방식: `buildDashboardData()`에서 케이스 수, 승인 대기, 전세 위험, 차단 건수를 기반으로 예상 비용·절감 가능 위험·ROI를 산출한다.
- 데이터 해석 문구: `generateCostInsight()`가 가장 큰 비용 항목과 우선 처리군을 연결해 다음 행동을 제안한다.
- 빈 데이터/오류 상태 처리: `dataStateCard()`가 sample, success, empty, error, stale 상태를 카드로 표시한다.

## 6. Fabel 5 자문 반영 내역

| 자문 항목 | Fabel 5 의견 | 반영 여부 | 반영 내용 |
| --- | --- | --- | --- |
| 시나리오 우선순위 | 전세, 사기, 소상공인 3종이 자유주제와 금융업 연결성을 가장 잘 보여준다. | 반영 | 3개 `?demo=` 모드 추가 |
| UI 방향 | 판단 근거와 다음 행동이 한 화면에서 보여야 한다. | 반영 | 데모 코치마크와 점수 분해 패널 추가 |
| 대시보드 설계 | 비용은 행동 우선순위 문장으로 해석해야 한다. | 반영 | 비용 해석 문구 생성 |
| 버그 우선순위 | 저장과 감사 흐름은 심사 시연에서 실패하면 치명적이다. | 반영 | 감사 검증·export·schemaVersion 테스트 추가 |
| 최종 통합 | 시뮬레이션과 추정 데이터는 명시적으로 분리해야 한다. | 반영 | 판단 신호별 출처 칩 추가 |

## 7. 수정된 파일 목록

| 파일 | 수정 내용 |
| --- | --- |
| `app/app.js` | 골든 패스 데모 모드, 위험 판단 엔진, 승인 레벨 매트릭스, 감사 해시 체인, 비용 해석 로직 추가 |
| `app/styles.css` | 데모 코치마크, 점수 분해, 출처 칩, 승인 매트릭스, 감사 툴바 스타일 추가 |
| `tests/e2e/localguard.spec.js` | 골든 패스, 감사 export, 승인 매트릭스, schemaVersion 테스트와 이중 캡처 저장 추가 |
| `scripts/verify_static.py` | 새 핵심 기능 문자열 정적 검증 추가 |
| `.omc/decisions.md` | 주요 의사결정과 Fabel 5 advisory pass 기록 |

## 8. 실행 방법

```bash
npm install
npm run dev
npm run test
npm run test:e2e
```

데모 URL:

```text
http://127.0.0.1:8000/index.html?demo=jeonse
http://127.0.0.1:8000/index.html?demo=phishing
http://127.0.0.1:8000/index.html?demo=sme
```
