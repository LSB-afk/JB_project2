# JB금융그룹 웹사이트 디자인 시스템 가이드

분석 기준일: 2026-07-01  
대상: https://www.jbfg.com/ko/main.do  
참조 리소스: https://www.jbfg.com/assets/css/app.css, https://use.typekit.net/erl8udp.css  
분석 방식: 실제 렌더링 화면, computed style, CSS 원본, 5개 병렬 에이전트의 관점별 조사 통합

## 1. 핵심 진단

현재 JB금융그룹 사이트는 기업 브랜딩 사이트와 IR 자료 허브가 결합된 구조다. 메인 첫 화면은 “젊고 강한 강소 금융그룹”이라는 브랜드 메시지와 동시에 신용등급, IR활동, 경영실적, 주가정보를 대시보드처럼 배치한다.

강점은 금융사다운 신뢰감, 강한 블루 브랜드, 고밀도 IR 정보 접근성, 메인 섹션별 명확한 카드 패턴이다. 개선 여지는 첫 화면의 정보 위계, 모바일 스크롤 부담, focus 접근성, 숨김 패널의 접근성 트리 노출, 보조 텍스트 대비, 상승 색상 대비다.

리디자인 방향은 “신뢰감 있는 금융 그룹 + 젊고 디지털한 투자자 허브”로 잡는다. 현재의 풀블리드 섹션과 카드형 정보 구조는 유지하되, 메인은 `기업 정체성 -> 투자자 바로가기 -> ESG/사회공헌 -> 계열사/글로벌 -> 뉴스` 흐름으로 재정렬하는 것을 권장한다.

## 2. 브랜드 원칙

1. 브랜드 첫인상은 `#0A31A8` 기반의 깊은 블루와 흰 타이포그래피로 만든다.
2. `#1C56FF`는 hover, 액션, 글로벌/디지털 강조에 사용한다.
3. IR/ESG/Global처럼 정보 밀도가 높은 섹션은 “큰 선언형 제목 + 우측 정보 카드” 패턴으로 묶는다.
4. 이미지 카드 hover는 확대와 색 반전으로 반응하되, 본문 가독성을 해치지 않는다.
5. 모든 인터랙티브 요소는 hover만이 아니라 focus/open/active 상태를 명시한다.
6. 모바일에서는 투자자 정보 카드를 전부 첫 화면에 길게 쌓기보다, 요약 카드와 바로가기 그룹으로 축약한다.

## 3. 레이아웃 시스템

### 브레이크포인트

| 이름 | 범위 | 현재 관찰 | 리디자인 기준 |
|---|---:|---|---|
| Wide desktop | 1440px 이상 | 대형 풀블리드, 좌우 여백 57px 내외 | 1440/1680 이상에서 컨텐츠 폭 완만히 확장 |
| Desktop | 1025px 이상 | 좌측 제목 38%, 우측 카드 52% | 2컬럼 기본 |
| Tablet | 681-1024px | 제목 상단, 카드는 하단 가로 흐름 | 상하 스택 + 가로 스크롤 카드 |
| Mobile | 390-680px | 헤더 62px, 카드 1열 | 내부 여백 20-24px, 주요 카드 축약 |
| Small mobile | 390px 이하 | 루트 15px, body 폭 375px 관찰 | H1/카드 높이 추가 압축 |

### 컨테이너

현재 컨테이너는 고정 max-width보다 풀블리드 섹션에 내부 안전 여백을 두는 방식이다.

권장 토큰:

```css
--layout-page-margin: clamp(21px, 5.6vw, 57px);
--layout-content-max-lg: 1564px;
--layout-content-max-md: 1328px;
--layout-content-max-sm: 1000px;
```

현재 관찰값:

| 화면 | 내부 좌우 여백 |
|---|---:|
| 1280 desktop | 약 57px |
| 1024 tablet | 약 56px |
| 768 tablet | 약 42px |
| 390 mobile | 약 21px |

### 섹션 구조

현재 메인 순서:

1. Hero / IR dashboard
2. ESG
3. JB Financial Group Family
4. Global
5. NEWS
6. NOTICE
7. Footer

리디자인 권장 순서:

1. Brand hero: 슬로건, 핵심 메시지, 대표 비주얼
2. Investor quick view: 주가, 실적, 신용등급, 보고서 다운로드
3. Group network: 계열사와 글로벌 현황
4. ESG impact: 전략, 주요 성과, 보고서, 사회공헌
5. News center: 보도자료, 공지, IR/ESG 태그
6. Footer: 관계사, 정책 링크, 소셜, 문의

### 그리드와 카드 크기

| 용도 | Desktop | Tablet | Mobile |
|---|---:|---:|---:|
| Hero info card | 288-334px | 380-512px | 332px |
| ESG card | 288 x 310px | 284px 가로 흐름 | 284px |
| Family card | 320-344px | 320px 가로 흐름 | 320px |
| News card | 361px 2열 | 1-2열 | 332px 1열 |
| Notice CTA | 361 x 267px | 2열 또는 1열 | 1열 |

기본 gap:

```css
--space-card-gap: clamp(14px, 1.1vw, 24px);
--space-section-gap: clamp(64px, 7.4vw, 142px);
--space-grid-gap: clamp(20px, 3.125vw, 32px);
```

## 4. 타이포그래피

### 폰트

현재 CSS와 computed style 기준:

```css
font-family: "SUIT Variable", -apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

기본 특성:

```css
font-weight: 600;
letter-spacing: -0.02em;
word-break: keep-all;
```

리디자인에서는 `body line-height: 1` 상속을 피하고, 본문 기본 행간을 1.55-1.65로 명시한다.

### 타입 스케일

| 토큰 | Desktop | Mobile | Weight | Line height | 용도 |
|---|---:|---:|---:|---:|---|
| Display 1 | 85px | 56-64px | 800 | 1.08-1.12 | 메인 히어로 |
| Headline 1 | 88px | 44px | 800 | 1.1 | 서브 히어로 |
| Headline 2 | 64px | 32px | 700-800 | 1.2-1.3 | 큰 섹션 제목 |
| Title 1 | 40px | 28px | 700-800 | 1.2 | 카드/페이지 제목 |
| Title 2 | 32px | 24px | 700-800 | 1.2 | ESG/뉴스 카드 제목 |
| Title 3 | 22-24px | 20px | 700-800 | 1.35-1.4 | 카드 내부 제목 |
| Body 1 | 20px | 17px | 600 | 1.6 | 강조 본문 |
| Body 2 | 16px | 15px | 600 | 1.6 | 기본 본문 |
| Caption | 13-14px | 13px | 600-700 | 1.4 | 날짜, 메타 |

현재 관찰값:

| 요소 | Desktop 1280 | Mobile 390 |
|---|---:|---:|
| Hero H1 | 85.33px / 93.87px, 800 | 64px / 70.4px, 800 |
| GNB 1depth | 16px / 22.4px, 800 | hidden |
| Widget H2 | 17.78px / 17.78px, 800 | 16.67px / 16.67px, 800 |
| Card H3 | 21.33px / 29.87px, 800 | 20px / 28px, 800 |
| IR date | 14.22px / 14.22px, 700 | 13.33px / 13.33px, 700 |
| Stock number | 42.67px, 800 | 40px, 800 |

## 5. Spacing / Radius

현재는 4/8px 고정 스케일보다 `rem`과 `clamp()`를 섞은 유동 스케일이다. 리디자인에서는 4px 기반 토큰으로 정리하되, 큰 섹션 간격은 clamp로 유지한다.

### Spacing tokens

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 28px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-25: 100px;
--space-36: 144px;
```

### 적용 기준

| 대상 | 기준 |
|---|---:|
| Mobile page margin | 20-24px |
| Desktop page margin | 56-64px |
| Card padding | 24-32px |
| Card gap | 14-24px |
| Section top/bottom | 64-144px |
| Small control gap | 4-8px |
| Button horizontal padding | 16-32px |

### Radius tokens

```css
--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 16px;
--radius-lg: 24px;
--radius-xl: 32px;
--radius-2xl: 40px;
--radius-pill: 999px;
--radius-circle: 50%;
```

현재 주요 radius:

| 대상 | 현재 |
|---|---:|
| Hero glass widget | 32-44px clamp |
| ESG card | 약 32-44px |
| Family image | 약 14px |
| News card image | 16-24px 권장 |
| Button / tab / input | pill |
| Icon button | circle |

## 6. 컬러 시스템

### 핵심 팔레트

| Token | Value | Usage |
|---|---:|---|
| `brand-primary` | `#0A31A8` | 메인 배경, 푸터, primary CTA |
| `brand-accent` | `#1C56FF` | hover, Global, 강조 카드 |
| `brand-deep` | `#0D2D77` | ESG 배경 |
| `brand-navy` | `#0B235B` | 어두운 정보 카드 |
| `esg-green` | `#9ECFA9` | ESG 보조, gradient |
| `focus-green` | `#51E3A4` | focus ring 보조 |
| `tech-cyan` | `#19E4EE` | 장식/글로우 전용 |
| `text-primary` | `#333333` | 기본 텍스트 |
| `text-secondary` | `#666666` | 보조 텍스트 |
| `text-tertiary` | `#767676` | 접근성 보정 메타 |
| `border-default` | `#E5E5E5` | 보더/디바이더 |
| `bg-muted` | `#F3F3F3` | 아이콘/약한 배경 |
| `bg-subtle` | `#F8F8F8` | 섹션 보조 |
| `bg-news` | `#FCFCFC` | 뉴스 배경 |

### 접근성 대비

| 조합 | 대비 | 판정 |
|---|---:|---|
| white on `#0A31A8` | 10.41:1 | 통과 |
| white on `#0D2D77` | 12.66:1 | 통과 |
| white on `#0B235B` | 14.94:1 | 통과 |
| white on `#1C56FF` | 5.49:1 | 통과 |
| `#666666` on white | 5.74:1 | 통과 |
| `#999999` on white | 2.85:1 | 실패 |
| `#FF0000` on white | 4.00:1 | 일반 텍스트 실패 |
| white on `#19E4EE` | 1.57:1 | 실패 |

권장:

1. 작은 메타 텍스트는 `#999999` 대신 `#767676` 이상.
2. 상승 색상은 `#FF0000` 대신 `#D00000`.
3. 시안은 텍스트 배경으로 사용하지 않고 장식/아이콘/글로우에 제한.
4. 이미지 위 텍스트는 `rgba(0,0,0,0.4)` 이상의 오버레이 또는 별도 텍스트 배경 사용.

## 7. 컴포넌트 명세

### Header

현재:

- fixed, desktop 높이 약 98px
- mobile 높이 62px
- 메인에서는 transparent/dark, 스크롤/메뉴 open 시 white
- hide 상태: `transform: translateY(-105%)`

리디자인:

| 속성 | Desktop | Mobile |
|---|---:|---:|
| Height | 96px | 62px |
| Logo width | 150-160px | 124px |
| Padding inline | page margin | page margin |
| Background states | transparent, solid, elevated | solid/transparent |

상태:

- `transparent`: 히어로 위, white text
- `solid`: white background, primary text
- `elevated`: white + subtle blur/shadow
- `hidden`: scroll down 시 translateY
- `menu-open`: white background + rounded bottom

### GNB / Mega Menu

현재 CSS:

- 1depth font 16px, weight 800
- item min-width `clamp(100px, 10.7vw, 180px)`
- submenu padding `40px 0`
- open 시 opacity 1, clip-path inset 해제, 하단 radius 32-40px
- column divider `#E5E5E5`

리디자인:

| 속성 | 값 |
|---|---:|
| Item min size | 136 x 96px |
| Submenu top padding | 40px |
| Submenu transition | 240-300ms ease-out |
| Hover text | `brand-primary` |
| Active indicator | dot 또는 underline 추가 |

접근성:

- `aria-expanded`와 open state 동기화
- `Esc`로 닫기
- keyboard tab 순서가 visible menu 안에만 머물게 관리

### Site Map / Full Menu

현재:

- 햄버거 클릭 시 full-screen modal
- 모바일은 좌측 1depth, 우측 2depth 리스트
- 관찰상 숨은 패널이 접근성 트리에 일부 노출될 수 있음

리디자인:

| 속성 | 값 |
|---|---:|
| Overlay | 100dvh |
| Header area | 96px desktop / 62px mobile |
| Close button | 44 x 44px |
| Mobile category width | 44-46vw |
| Animation | opacity + clip-path, 240ms |

필수 개선:

- hidden 상태에서 `aria-hidden="true"` 또는 inert 적용
- 닫기 버튼 레이블 중복 제거
- close 후 trigger로 focus 복귀

### Buttons / Pills

현재:

- header pill: height 28px 내외, hover 시 blue fill
- capsule button: height 56px 내외, radius pill

명세:

| Size | Height | Padding | Font |
|---|---:|---:|---:|
| sm | 32px | 0 14px | 14px / 800 |
| md | 44px | 0 20px | 15-16px / 700 |
| lg | 52-56px | 0 32px | 16px / 700 |

상태:

- default: white or transparent
- hover: `brand-primary` fill + white text
- focus: 2px ring, offset 3px
- disabled: opacity 0.35, pointer-events none

### Inputs / Search

현재:

- 보도자료 검색 input은 pill, 약 50px 높이
- CSS에서 focus outline 제거 확인

명세:

```css
height: 48px;
padding: 0 48px 0 20px;
border: 1px solid var(--color-border-default);
border-radius: var(--radius-pill);
font-size: 15px;
font-weight: 700;
```

상태:

- focus: `box-shadow: 0 0 0 3px rgba(28,86,255,.18); border-color: brand-accent`
- error: red border + 메시지
- empty submit: disabled 또는 validation

### Tabs

현재:

- pill tab, 약 48-53px
- active: blue fill, white text
- hover: light gray background

명세:

| 속성 | 값 |
|---|---:|
| Height | 48-52px |
| Padding | 0 22px |
| Radius | pill |
| Gap | 8px |
| Active | brand-primary fill |

### Hero / IR Dashboard Cards

현재:

- glass blur card
- radius 32-44px
- padding 약 24-28px
- action icon 32px circle
- desktop 2컬럼, mobile 1열

리디자인:

| 카드 | 핵심 정보 | 권장 |
|---|---|---|
| Credit Rating | AA+ 3개 | compact summary |
| IR Activity | 최신 3건 | 전체 행 클릭 가능 |
| Annual Report | 최신 보고서 | download + detail |
| Performance | 자료/재무제표/Factbook/Call | action list |
| Stock | price/KOSPI/KOSDAQ | 숫자 대비 및 상태 색 보정 |

상태:

- card hover: 배경 밝기/elevation 소폭
- icon hover: white fill + blue icon
- focus: 카드 전체 또는 액션 단위 focus ring

### ESG Cards

현재:

- dark navy card, icon, title, desc, action
- 2x2 desktop / horizontal flow mobile
- hover action 색 반전

명세:

| 속성 | 값 |
|---|---:|
| Min height | 300-320px |
| Padding | 28-32px |
| Radius | 32px |
| Icon | 96-110px |
| Title | 28-32px |

### Family Cards

현재:

- horizontal swiper
- card hover: blue background, white text, image scale 1.165
- no-link card는 arrow 숨김

명세:

| 속성 | 값 |
|---|---:|
| Slide width | 320-344px |
| Image aspect | 약 300 / 180 |
| Image radius | 14-16px |
| Card padding | 24-28px |
| Hover scale | 1.08-1.16 |

### News Cards

현재:

- 2열 이미지 카드
- hover image scale
- title 2줄 clamp, date 고정

명세:

| 속성 | 값 |
|---|---:|
| Desktop grid | 2 columns |
| Mobile grid | 1 column |
| Image radius | 16-24px |
| Title clamp | 2 lines |
| Date | caption token |

추가 제안:

- `IR 뉴스 / ESG 뉴스 / 사회공헌 / 그룹 소식` 태그 도입
- PR 목록에 grid/list toggle selected state 명확화

### Footer / Family Site

현재:

- footer background `#0A31A8`
- Family site toggle 249 x 48px
- dropdown opens upward, opacity/visibility/translateY
- social/back-to-top circle hover 반전

명세:

| 요소 | 값 |
|---|---:|
| Footer desktop height | 약 250px |
| Footer mobile height | 약 347px |
| Family toggle | 48px height |
| Dropdown max-height | 240-280px |
| Scrollbar | 4px |
| Social icon | 36-40px |

## 8. Motion / Interaction

현재 모션 패턴:

| 대상 | Duration | Property |
|---|---:|---|
| Header hide/show | 500ms | transform |
| Menu open | 200-300ms | opacity, clip-path, height |
| Dropdown | 200ms | opacity, visibility, translateY |
| Button color | 100-200ms | color, background |
| Card image hover | 500-800ms | transform scale |
| ESG background object | 1.2-1.5s | transform, position |

리디자인 기준:

```css
--motion-fast: 120ms;
--motion-base: 200ms;
--motion-menu: 280ms;
--motion-card: 600ms;
--ease-standard: cubic-bezier(.2, 0, 0, 1);
--ease-out: cubic-bezier(.16, 1, .3, 1);
```

반드시 `prefers-reduced-motion` 대응:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 9. 접근성 체크리스트

우선 개선:

1. 모든 link/button/input/select에 focus-visible 스타일 추가.
2. `input:focus { outline: none; }` 제거 또는 대체 focus ring 적용.
3. 숨김 사이트맵/패밀리 패널에 `inert` 또는 `aria-hidden` 적용.
4. 모달 open 시 body scroll lock, focus trap, Esc close, trigger focus return 적용.
5. 이미지 위 텍스트 대비 보장: 최소 40% dark overlay 또는 텍스트 배경.
6. 작은 `#999999` 텍스트를 `#767676` 이상으로 보정.
7. 상승 색상 `#FF0000`을 `#D00000`로 보정.
8. 탭/슬라이더는 keyboard arrow 또는 tab 접근 가능하게 설계.
9. 모바일 메뉴 3depth는 현재 위치와 펼침 상태를 명확히 표시.
10. 다운로드/외부 링크 아이콘에 accessible label 제공.

## 10. 리디자인 IA 제안

### Main

권장 구조:

1. Hero: 브랜드 슬로건 + 대표 비주얼 + 핵심 CTA 1-2개
2. Investor Snapshot: 주가, 실적, 신용등급, 보고서, IR 일정
3. Group Portfolio: 국내/글로벌 계열사, 주요 수치
4. ESG Impact: 전략, 성과, 정책, 보고서
5. News & Disclosure: 보도자료, 공시, 공지
6. Footer

### 투자정보

현재 깊은 3depth를 아래처럼 재그룹핑:

1. IR 홈
2. 실적·보고서
3. 공시
4. 주가·주주환원
5. IR 일정·문의

### ESG

권장 흐름:

1. 전략
2. 주요 성과
3. 정책·가이드라인
4. 보고서
5. 사회공헌 사례

### PR센터

권장 개선:

- 뉴스 태그: IR, ESG, 사회공헌, 그룹 소식
- 기사 카드에 이미지/요약/날짜/태그 일관 적용
- 검색 결과, 페이지네이션, grid/list state 명확화

## 11. 디자인 토큰 CSS 초안

상세 토큰은 `jbfg-design-tokens.css` 파일로 별도 제공한다.

핵심 예시:

```css
:root {
  --color-brand-primary: #0A31A8;
  --color-brand-accent: #1C56FF;
  --color-brand-deep: #0D2D77;
  --color-text-primary: #333333;
  --font-family-base: "SUIT Variable", -apple-system, system-ui, sans-serif;
  --layout-page-margin: clamp(21px, 5.6vw, 57px);
  --radius-xl: 32px;
}
```

## 12. 참고 캡처

- `jbfg-home-desktop-viewport.png`: 데스크톱 첫 화면
- `jbfg-home-mobile-390.png`: 모바일 첫 화면
- `jbfg-mobile-sitemap-open.png`: 모바일 사이트맵 open
- `jbfg-esg-desktop.png`, `jbfg-family-desktop.png`, `jbfg-global-desktop.png`, `jbfg-news-desktop.png`, `jbfg-notice-desktop.png`: 주요 섹션

