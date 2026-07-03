---
tags:
  - area/product
  - type/reference
  - status/active
date: 2026-07-03
up: "[[_문서생성-마스터플랜]]"
aliases:
  - JBFG 디자인 레퍼런스
  - jbfg design
---
# JBFG 디자인 레퍼런스 — 콘솔 디자인 퀄리티 상향용

> JB금융그룹 공식 사이트(jbfg.com) 디자인 시스템을 우리 콘솔에 반영해 **디자인 퀄리티를 높인다**(사용자 지시 2026-07-03). 원본 아카이브는 `_vendor/jbfg-site-archive/`(로컬·gitignore), 추출본 2종은 본 폴더에 보관. 분석: 2026-07-01 5에이전트 통합(computed style + CSS 원본).

## 핵심 브랜드 토큰 (`jbfg-design-tokens.css`)
- **브랜드 블루**: primary `#0A31A8` · accent `#1C56FF`(hover·액션·디지털 강조) · deep `#0D2D77` · navy `#0B235B`
- **강조**: ESG green `#9ECFA9` · focus green `#51E3A4` · tech cyan `#19E4EE`
- **텍스트**: primary `#333333` · secondary `#666666` · tertiary `#767676` · inverse `#FFF`
- **상태**: 상승 `#D00000` · 하락 `#1850FF` · border `#E5E5E5`
- **타이포**: `SUIT Variable`, weight 500(regular)~800(extrabold), letter-spacing -0.02em(숫자 -0.06em); display clamp(56~96px)·headline clamp(44~88px)·title clamp(20~40px)·body 16~20px
- **레이아웃**: page-margin clamp(21~57px) · content-max 1564/1328/1000 · header 96px(데스크톱)

## 우리 콘솔 반영 방향
1. 1차 브랜드 인상 = 깊은 블루 `#0A31A8` + 흰 타이포. `#1C56FF`는 hover·액션.
2. 정보밀도 높은 섹션(대시보드·케이스) = "큰 선언형 제목 + 우측 정보카드" 패턴(guide §2).
3. 모든 인터랙티브 요소 = hover만이 아니라 **focus/open/active 상태 명시**(승인 UX 접근성).
4. ⚠️ **앱 변경 게이트**: 현재 앱은 Pretendard + 8px radius(`verify_static` 니들). SUIT Variable·토큰 교체는 **김민주·이승보 디자인 결정** — app 변경 시 verify_static 니들 동기화 필수. 본 레퍼런스는 [[design-system]] 정합 **입력**이며 직접 앱을 바꾸지 않는다.

## 파일
- `jbfg-design-tokens.css` — CSS 변수 토큰(색·타이포·레이아웃)
- `jbfg-design-system-guide.md` — 브랜드 원칙·레이아웃 시스템·브레이크포인트·컴포넌트 가이드(17KB)

## 연결
[[_문서생성-마스터플랜]] · [[design-system]] · [[레포-지도]]
