> 원본 파일: `D7a. 20260630_JB_LocalGuard_OS용_한국_공공·금융_데이터_API_조달_리서치.docx`
> 회수 2026-06-30 · ⚠️ 대외비 · 엔진 산출 원문(가공 최소)

---

# JB LocalGuard OS용 한국 공공·금융 데이터 API 조달 리서치

## 핵심 발견

이번 점검에서 **즉시 MVP에 넣을 수 있는 공공·준공공 데이터 축**은 비교적 분명했습니다.\
소상공인 라인에서는 **국세청 사업자등록 상태조회 API**, **소상공인시장진흥공단 상가(상권)정보 API**, **행정안전부 지방행정 인허가 데이터**, **한국은행 ECOS**가 가장 바로 붙이기 쉬웠습니다. 전세 라인에서는 **국토교통부 실거래가 공개시스템/RTMS OpenAPI**, **HUG 전세보증금반환보증 관련 공개 데이터**, **법원 등기정보광장 비식별 통계 데이터**가 유효했습니다. 사기 라인에서는 **경찰청 보이스피싱 통계**, **KISA 피싱사이트 URL/악성사이트 차단 통계**, 그리고 기관계약형이긴 하지만 **금융결제원 오픈뱅킹·어카운트인포 계열 API**가 핵심 후보입니다. [\[1\]](https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y)

가장 중요한 주의점은 **등기 영역**입니다. 2026-06-29 기준 직접 확인된 공개 경로로는, 등기정보광장의 Open API와 무료 결과파일은 **비식별 등기정보·신청/열람/발급 현황·권리별 통계** 중심이었고, **개별 부동산의 등기사항증명서/등기기록을 기계적으로 대량 취득하는 공개 Open API는 직접 확인되지 않았습니다**. 실제 전세 권리분석에 필요한 개별 등기사항은 결국 **인터넷등기소 열람/발급(유료)** 쪽이 실무 경로이며, 비용은 공식 약관·규칙상 **열람 700원, 인터넷 발급 1,000원**입니다. 다만 **자동화/대량조회 허용 여부를 명시한 공개 약관 문구는 이번 세션에서 직접 확보하지 못해 \[미검증\]**으로 두는 것이 안전합니다. [\[2\]](https://data.iros.go.kr/rp/oa/openOapiAppl.do)

두 번째 주의점은 **라이선스 해석**입니다. data.go.kr에서 다수 데이터셋이 “**이용허락범위 제한 없음**”으로 표시되지만, 포털 공통정책은 동시에 “**저작권 등 제3자 권리가 포함된 공공데이터는 권리자의 정당한 이용허락을 확보해야**” 한다고 명시합니다. 따라서 **데이터셋 메타의 “제한 없음”만 보고 무조건 2차 배포 가능으로 단정하기보다**, 조직 내 제품 약관과 데이터셋 원문 메타를 함께 보며 판단해야 합니다. [\[3\]](https://www.data.go.kr/ugs/selectPortalPolicyView.do)

세 번째 주의점은 **기관계약형 API와 공개형 API를 구분**해야 한다는 점입니다. 예를 들어 금융결제원 오픈뱅킹은 공개 포털에 API 구조가 열려 있지만, 공식 설명상 **“금융결제원과 오픈뱅킹 이용계약을 체결하고 이용승인을 받은 핀테크사업자 및 참가기관”**이 대상입니다. 즉, 이 계열은 **MVP의 공공 데이터 축**이 아니라 **향후 제휴·심사 완료 후 붙이는 상용 연동 축**으로 보는 편이 맞습니다. [\[4\]](https://openapi.kftc.or.kr/service/openBanking)

## API와 데이터 인벤토리

| API/데이터셋 | 제공기관 | 주요 항목 | 인증/발급 절차 | 호출 한도 | 갱신주기 | 비용 | 라이선스·재배포·자동화 제약 | 신뢰도 | URL |
|----|----|----|----|----|----|----|----|----|----|
| 한국은행 ECOS Open API | 한국은행 | 금리, 통화·유동성, 환율, 물가, 경기, 지급결제, 신용카드 등 경제통계 전반 [\[5\]](https://ecos.bok.or.kr/) | ECOS Open API 페이지 접속 → 일반 이용자 선택 → 본인인증/회원가입 → 인증키 신청. 공식 페이지에 “회원가입을 위한 본인인증 절차”와 “인증키 신청”이 노출됩니다. [\[6\]](https://ecos.bok.or.kr/api/) | **공식 한도 문구 직접확인 실패** → \[미검증\] | 통계표별 상이. ECOS는 일·월·분기·연 통계를 함께 제공하므로 표별 메타 확인이 필요합니다. [\[5\]](https://ecos.bok.or.kr/) | 무료 추정이나 **공식 요금 문구 직접확인 실패** → \[미검증\] | 한국은행 공표 공공데이터는 “**별도의 절차 없이 자유롭게 이용**” 가능하지만, 출처 표시와 가공 시 명시가 필요합니다. 제공대상 공공데이터 목록 외 정보는 별도 협의가 필요합니다. [\[7\]](https://www.bok.or.kr/portal/main/contents.do?menuNo=200228) | 1차+일부 \[미검증\] | 공식 페이지 [\[8\]](https://ecos.bok.or.kr/api/) |
| 국토교통부_아파트 매매 실거래가 자료 | 국토교통부 | 아파트 매매 실거래가, 계약일, 면적, 층, 건축년도 등 [\[9\]](https://www.data.go.kr/data/15126469/openapi.do) | data.go.kr 회원가입 → 활용신청 → 자동승인 → 서비스키 발급. 포털 가이드상 승인 후 인증키로 호출합니다. [\[10\]](https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do) | 개발계정 **10,000**, 운영계정은 활용사례 등록 시 증액 신청 가능. [\[9\]](https://www.data.go.kr/data/15126469/openapi.do) | 실시간. [\[9\]](https://www.data.go.kr/data/15126469/openapi.do) | 무료. [\[9\]](https://www.data.go.kr/data/15126469/openapi.do) | 데이터셋 메타는 “**이용허락범위 제한 없음**”. 다만 포털 공통정책상 제3자 권리 포함 시 별도 허락 확보 필요. [\[11\]](https://www.data.go.kr/data/15126469/openapi.do) | 1차 | 공식/포털 [\[12\]](https://www.data.go.kr/data/15126469/openapi.do) |
| 국토교통부_아파트 전월세 실거래가 자료 | 국토교통부 | 아파트 전·월세 계약 데이터, 계약일, 보증금, 월세 등 [\[13\]](https://www.data.go.kr/data/15126474/openapi.do) | data.go.kr 활용신청 후 서비스키 발급. [\[10\]](https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do) | 개발계정 **10,000**, 운영계정 증액 신청 가능. [\[13\]](https://www.data.go.kr/data/15126474/openapi.do) | 실시간. [\[13\]](https://www.data.go.kr/data/15126474/openapi.do) | 무료. [\[13\]](https://www.data.go.kr/data/15126474/openapi.do) | “**이용허락범위 제한 없음**”. 포털 공통정책의 제3자 권리 예외는 동일 적용. [\[14\]](https://www.data.go.kr/data/15126474/openapi.do) | 1차 | 공식/포털 [\[15\]](https://www.data.go.kr/data/15126474/openapi.do) |
| 국토교통부_연립다세대 매매·전월세 실거래가 자료 | 국토교통부 | 연립/다세대의 매매 및 전월세 실거래가 [\[16\]](https://www.data.go.kr/data/15126473/openapi.do) | data.go.kr 활용신청 후 서비스키 발급. [\[10\]](https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do) | 매매 API는 개발계정 **10,000** 확인, 전월세도 동일 포털 체계로 제공되나 상세 한도는 이번 수집본에서 매매 우선 확인. [\[17\]](https://www.data.go.kr/data/15126467/openapi.do) | 실시간. [\[17\]](https://www.data.go.kr/data/15126467/openapi.do) | 무료. [\[17\]](https://www.data.go.kr/data/15126467/openapi.do) | “**이용허락범위 제한 없음**”. [\[18\]](https://www.data.go.kr/data/15126473/openapi.do) | 1차 | 공식/포털 [\[16\]](https://www.data.go.kr/data/15126473/openapi.do) |
| 국토교통부_단독/다가구 매매·전월세 실거래가 자료 | 국토교통부 | 단독/다가구 매매·임대차 실거래가. 단독/다가구는 개인정보 보호로 지번 일부만 제공됩니다. [\[19\]](https://www.data.go.kr/data/15126465/openapi.do) | data.go.kr 활용신청 후 서비스키 발급. [\[10\]](https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do) | 개발계정 **10,000**, 운영계정 증액 가능. [\[20\]](https://www.data.go.kr/data/15126465/openapi.do) | 실시간. [\[20\]](https://www.data.go.kr/data/15126465/openapi.do) | 무료. [\[20\]](https://www.data.go.kr/data/15126465/openapi.do) | “**이용허락범위 제한 없음**”. [\[21\]](https://www.data.go.kr/data/15126465/openapi.do) | 1차 | 공식/포털 [\[19\]](https://www.data.go.kr/data/15126465/openapi.do) |
| 국토교통부 실거래가공개시스템 자료제공 | 국토교통부 | 웹에서 조건별 CSV/XLS 다운로드. 거래·전월세, 건물유형, 지역, 기간 조회 [\[22\]](https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=) | 별도 API키 없이 웹 다운로드. [\[23\]](https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=) | 웹 자료제공은 “시도별 자료제공 계약일자 범위는 **최대 1년**” 제약. [\[23\]](https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=) | 신고정보 실시간 변경 반영. 제공시점 따라 결과 상이 가능. [\[23\]](https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=) | 무료. [\[23\]](https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=) | 공식 안내에 “**법적인 효력이 없으므로 참고용**”이라고 명시. 외부 공개 통계로는 공식통계 활용 권고. [\[23\]](https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=) | 1차 | 공식 시스템 [\[24\]](https://rt.molit.go.kr/) |
| 인터넷등기소 부동산등기기록 열람·등기사항증명서 발급 | 대한민국 법원 인터넷등기소 | 개별 부동산 등기기록 열람, 등기사항증명서 발급, 소유권·근저당 등 권리관계 확인 | 인터넷등기소 접속 후 건별 열람/발급. API 공개 여부는 이번 세션에서 확인되지 않았고, 실무상 건별 결제형 서비스로 확인됩니다. [\[25\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1) | 공개 API형 호출 한도 **직접확인 실패** → \[미검증\] | 개별 등기기록 조회형 서비스로 실시간성 전제. 다만 공식 갱신 SLA 문구는 \[미검증\]. | **열람 700원/통, 인터넷 발급 1,000원/통**. 법원규칙도 인터넷 발급 1,000원을 재확인합니다. [\[25\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1) | 공식 약관 검색 스니펫에 수수료가 직접 명시됩니다. 다만 **자동화·대량조회 허용/금지 문구는 이번 세션에서 직접 확보 실패** → \[미검증\]. [\[25\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1) | 1차+일부 \[미검증\] | 공식 페이지/규칙 [\[25\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1) |
| 등기정보광장 Open API / 등기정보자료 신청 | 대한민국 법원 등기정보광장 | 비식별 등기정보 자료, 권리별 현황, 열람·발급 현황, 실거래가(등기기준) 통계, 결과 파일 다운로드 [\[26\]](https://data.iros.go.kr/rp/oa/openOapiAppl.do) | 회원가입·로그인 → Open API 신청 목록 선택 → 명세서 다운로드 → 서비스별 인증키 신청. FAQ에 따르면 인증키는 상세 화면의 “인증키신청”으로 발급. 유효기간은 **발급일로부터 1년**. [\[27\]](https://data.iros.go.kr/rp/oa/openOapiIntro.do) | 개별 API별 공개 한도 문구 **직접확인 실패** → \[미검증\] | 월별/통계성 데이터 중심. 무료 결과파일은 신청형 다운로드. [\[28\]](https://data.iros.go.kr/ld/da/openDataApplInfrm.do) | 무료. FAQ에 “등기정보자료 신청 및 결과파일 다운로드는 … **무료**” 명시. [\[29\]](https://data.iros.go.kr/iu/fa/openFaq.do) | 약관 검색 결과에 “**비식별 등기정보 자료**”를 무료로 제공한다고 명시. 즉, 공개 경로는 비식별 자료 중심으로 확인되었습니다. **개별 부동산 권리분석용 공개 Open API는 직접 확인하지 못함.** [\[30\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1) | 1차+일부 \[미검증\] | 공식 페이지 [\[31\]](https://data.iros.go.kr/rp/oa/openOapiAppl.do) |
| HUG 빅데이터 개방 포털 Open API | 주택도시보증공사 | 전세 및 임대보증, 분양시장, 분양보증, 든든전세주택 모집공고 등 카테고리형 API/공공데이터 [\[32\]](https://www.khug.or.kr/houstar/web/p05/01/p050101.jsp) | FAQ에 따르면 데이터 목록의 “신청” 버튼 클릭 후 **본인 인증**을 거쳐 인증키를 발급받습니다. [\[33\]](https://khug.or.kr/houstar/web/p05/02/p050207.jsp) | **공식 호출 한도 문구 직접확인 실패** → \[미검증\] | 데이터별 상이. 예: 든든전세주택 모집공고 API는 모집공고 시 표출. [\[34\]](https://khug.or.kr/houstar/web/p03/01/p030105.jsp?articleId=36932&currentPage=1&mode=S) | 무료 추정이나 **공식 요금 문구 직접확인 실패** → \[미검증\] | HUG 화면은 시스템 유형을 “일반/서버구축”으로 나누며, 일반은 “**서버에 저장하지 않고**”, 서버구축은 “**저장하거나 DB화**”하는 경우로 설명합니다. 저장형 사용은 신청 유형 구분이 필요합니다. 라이선스 일반조항은 \[미검증\]. [\[35\]](https://www.khug.or.kr/houstar/web/p03/01/p030105.jsp?articleId=34715&currentPage=1&mode=S) | 1차+일부 \[미검증\] | 공식 페이지 [\[36\]](https://www.khug.or.kr/index.jsp?mainType=housta) |
| 주택도시보증공사_전세보증금반환보증 상세현황 | 주택도시보증공사 / data.go.kr | 전세보증금반환보증 상세 현황. 지역·시점별 보증 데이터에 활용 가능 [\[37\]](https://www.data.go.kr/data/15033824/fileData.do) | 파일데이터 다운로드형. 오픈포맷인 경우 공공데이터포털 자동변환 API 경로 활용 가능하나, 본 건은 주 경로가 파일 다운로드입니다. [\[38\]](https://www.data.go.kr/data/15033824/fileData.do) | 호출 한도 표시는 이번 수집본에서 직접확인 실패 → \[미검증\] | **분기**. 차기 등록 예정일도 표기됩니다. [\[37\]](https://www.data.go.kr/data/15033824/fileData.do) | 무료. [\[37\]](https://www.data.go.kr/data/15033824/fileData.do) | 이용허락범위 표시는 이번 수집본에서 값 직접확인 실패 → \[미검증\]. | 1차+일부 \[미검증\] | 공식/포털 [\[37\]](https://www.data.go.kr/data/15033824/fileData.do) |
| 소상공인시장진흥공단_상가(상권)정보_API | 소상공인시장진흥공단 | 상가업소번호, 상호명, 업종코드, 주소, 위경도, 상권영역, 반경/행정경계/건물 단위 조회 등 [\[39\]](https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y) | data.go.kr 회원가입 → 활용신청 → 자동승인 → 서비스키 발급. [\[10\]](https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do) | 개발계정 **10,000**, 운영계정은 활용사례 등록 시 증액 가능. [\[40\]](https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y) | API 메타는 **실시간**, 표준데이터셋 기본정보는 **분기**. 즉 운영상 최신 업소 조회와 정기 배치 기준을 구분해 써야 합니다. [\[39\]](https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y) | 무료. [\[40\]](https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y) | “**이용허락범위 제한 없음**”. 포털 공통정책상 제3자 권리 예외는 별도 검토 필요. [\[41\]](https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y) | 1차 | 공식/포털 [\[39\]](https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y) |
| 국세청_사업자등록정보 진위확인 및 상태조회 서비스 | 국세청 | 휴업/폐업, 과세유형, 폐업일자, 진위확인 결과 등. 1회 최대 100건 조회 가능 [\[42\]](https://www.data.go.kr/data/15081808/openapi.do) | data.go.kr 회원가입 → 활용신청 → 자동승인 → 인증키 발급. 공지로도 개방 사실과 100건 단위 제공을 재확인. [\[43\]](https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do) | **1회 100건, 1일 100만건 제한**. [\[42\]](https://www.data.go.kr/data/15081808/openapi.do) | **30분 주기 업데이트**, 신규 개업자는 반영에 1~2일 소요 가능. [\[44\]](https://www.data.go.kr/data/15081808/openapi.do) | 무료. [\[45\]](https://www.data.go.kr/data/15081808/openapi.do) | “**이용허락범위 제한 없음**”. [\[46\]](https://www.data.go.kr/data/15081808/openapi.do) | 1차 | 공식/포털 [\[47\]](https://www.data.go.kr/data/15081808/openapi.do) |
| 행정안전부 지방행정 인허가정보 / 식품_일반음식점 조회서비스 | 행정안전부 | 전국 지자체 인허가 업종. 일반음식점의 인허가일자, 영업상태, 사업장명, 주소 등. 전국 195종 인허가 데이터는 data.go.kr로 이관 후 제공 중. [\[48\]](https://www.data.go.kr/data/15154916/openapi.do) | data.go.kr 활용신청 경로. 기존 localdata 시스템은 **2026-04-16 폐쇄**되고 data.go.kr로 안내됩니다. [\[49\]](https://www.localdata.go.kr/devcenter/bbs/devQnaDetail.do%3Bjsessionid%3D9sU7GlKuf3GPBgF5yUtVWq6YhlQmBDhsffqCgill1BSUgHVZvNSmgjxrXlw3kzU7.opendata01_servlet_engine1?bbsId=B0000100&menuNo=20003&nttId=1633&pageIndex=5&searchCnd=&searchWrd=) | 개별 서비스 **정확한 트래픽 문구 직접확인 실패** → \[미검증\] | 파일데이터 기준 **매일 갱신**, 다만 **2일전 기준으로 현행화**. [\[50\]](https://www.data.go.kr/data/15045016/fileData.do?recommendDataYn=Y) | 무료. [\[50\]](https://www.data.go.kr/data/15045016/fileData.do?recommendDataYn=Y) | 일반음식점 파일데이터는 data.go 다운로드형이며, 라이선스 값 자체는 이번 수집본에서 직접값 확보 실패 → \[미검증\]. | 1차+일부 \[미검증\] | 공식/포털 [\[51\]](https://www.data.go.kr/data/15154916/openapi.do) |
| 금융감독원 OPENDART 공시 API | 금융감독원 | 공시검색, 정기보고서 재무정보, 지분공시, XBRL 원본 등 상장·비상장 공시 정보 [\[52\]](https://www.data.go.kr/data/3075133/openapi.do) | 회원가입·약관 동의 후 인증키 발급. 약관상 인증키는 금융감독원이 회원에게 부여하는 고유값입니다. [\[53\]](https://opendart.fss.or.kr/uss/umt/EgovMberInsertView.do) | 약관상 허용량 제한이 있고, 개발가이드에는 “일반적으로 **20,000건 이상**” 요청 시 제한 에러 설명. [\[54\]](https://opendart.fss.or.kr/intro/terms.do) | 실시간. [\[55\]](https://www.data.go.kr/data/3075133/openapi.do) | 약관상 “원칙적으로 무료”. [\[56\]](https://opendart.fss.or.kr/intro/terms.do) | 약관상 저작권은 금융감독원에 있고, 약관 미기재 사항은 저작권법 및 공공데이터법에 따릅니다. [\[56\]](https://opendart.fss.or.kr/intro/terms.do) | 1차 | 공식 페이지 [\[57\]](https://www.data.go.kr/data/3075133/openapi.do) |
| 금융통계정보시스템 FISIS Open API | 금융감독원 | 금융회사별 재무·영업현황, 금융권역 비교, 월보 통계 등 | 2020년 금감원 보도 재배포 자료에서 Open API 제공을 확인했으나, **2026-06-29 기준 공식 인증·한도·약관 페이지를 이번 세션에서 직접 확보하지 못함**. [\[58\]](https://eiec.kdi.re.kr/policy/materialView.do?datecount=&num=196723&pg=&pp=20&recommend=&topic=O) | \[미검증\] | \[미검증\] | \[미검증\] | Open API 존재 자체는 2차 자료로 확인되나, **현행 약관·호출정책 직접확인 실패**. | 2차 / \[미검증\] | 관련 공지·보도 재배포 [\[58\]](https://eiec.kdi.re.kr/policy/materialView.do?datecount=&num=196723&pg=&pp=20&recommend=&topic=O) |
| 경찰청_보이스피싱 현황 / 지역별 피해 현황 | 경찰청 | 연도별 보이스피싱 건수·유형·지역별 피해 현황. 사기라인 통계 피처에 적합 [\[59\]](https://www.data.go.kr/data/15063815/fileData.do) | 파일데이터 다운로드. 오픈포맷은 포털 자동변환 API 활용 가능. [\[60\]](https://www.data.go.kr/data/15155637/fileData.do) | 자동변환 API의 개별 한도 문구는 이번 수집본에서 직접확인 실패 → \[미검증\] | 데이터셋별 상이. 최신 파일은 연도 확장형 집계 데이터입니다. [\[61\]](https://www.data.go.kr/data/15063815/fileData.do) | 무료. [\[62\]](https://www.data.go.kr/data/15091224/fileData.do?recommendDataYn=Y) | 지역별 피해 현황 데이터는 “**이용허락범위 제한 없음**”. 보이스피싱 현황 본 파일도 공공데이터포털 경로로 제공됩니다. [\[62\]](https://www.data.go.kr/data/15091224/fileData.do?recommendDataYn=Y) | 1차+일부 \[미검증\] | 공식/포털 [\[63\]](https://www.data.go.kr/data/15063815/fileData.do) |
| 한국인터넷진흥원_피싱사이트 URL / 악성사이트 차단 건수 | 한국인터넷진흥원 | 피싱 URL 목록, 악성사이트 차단 건수, 피싱 차단 건수 등. 보이스피싱·스미싱 방어 룰 입력에 유효 [\[64\]](https://www.data.go.kr/data/15109780/fileData.do) | 파일데이터 다운로드. 오픈포맷 파일은 data.go 자동변환 API 활용 가능. [\[60\]](https://www.data.go.kr/data/15155637/fileData.do) | 개별 한도 문구 직접확인 실패 → \[미검증\] | 악성사이트 차단 건수는 집계형 통계. 피싱 URL은 탐지·수집 결과 반영형. 정확한 표기 주기는 이번 세션에서 직접확인 실패 → \[미검증\]. [\[65\]](https://www.data.go.kr/data/15109780/fileData.do) | 무료. [\[66\]](https://www.data.go.kr/data/15155637/fileData.do) | 악성사이트 차단 건수는 포털에 “**이용허락범위 제한 없음**”과 자동변환 API 안내가 노출됩니다. 피싱 URL 파일의 라이선스 값은 이번 수집본에서 직접값 확보 실패 → \[미검증\]. [\[67\]](https://www.data.go.kr/data/15155637/fileData.do) | 1차+일부 \[미검증\] | 공식/포털 [\[68\]](https://www.data.go.kr/data/15109780/fileData.do) |
| 한국주택금융공사 HOUSTAT Open API | 한국주택금융공사 | 주택금융·MBS·정책모기지 관련 통계, 타기관 주택금융 통계 연계 조회 [\[69\]](https://houstat.hf.go.kr/research/portal/openapi/openApiIntroPage.do) | HOUSTAT 로그인 후 Open API 인증키 발급내역/개발가이드 사용. 로그인 변경 공지도 존재합니다. [\[70\]](https://houstat.hf.go.kr/research/portal/openapi/openApiIntroPage.do) | **정량 한도 직접확인 실패**. 다만 약관상 일정량 이상 트래픽 유발 시 활용사례 등록을 강제할 수 있고, 미등록 시 인증Key 사용 제한 가능. [\[71\]](https://houstat.hf.go.kr/research/portal/intro/userAgreementPage.do) | 통계별 공표일정 기준. [\[72\]](https://houstat.hf.go.kr/research/portal/compose/announcePage.do) | 무료 추정이나 명시 요금 문구는 이번 수집본에서 직접확인 실패 → \[미검증\] | 약관상 인증Key 공유 금지, 고트래픽 시 활용사례 등록 요구 가능. [\[71\]](https://houstat.hf.go.kr/research/portal/intro/userAgreementPage.do) | 1차+일부 \[미검증\] | 공식 페이지 [\[73\]](https://houstat.hf.go.kr/research/portal/openapi/openApiIntroPage.do) |
| 금융결제원 오픈뱅킹 / 어카운트인포 / FIN MAP | 금융결제원 | 오픈뱅킹은 계좌실명조회·잔액·거래내역, 어카운트인포는 계좌·카드·보험·대출 통합조회, FIN MAP은 ATM/지점 정보 [\[4\]](https://openapi.kftc.or.kr/service/openBanking) | 공통적으로 **금융결제원과 이용계약 체결 및 이용승인**을 받은 기관/사업자 대상. 공개형 포털이지만 일반 공개 데이터 API와는 성격이 다릅니다. [\[4\]](https://openapi.kftc.or.kr/service/openBanking) | 공개 문서에서 정량 한도 직접확인 실패 → \[미검증\] | 서비스 운영형 API. | 비용 \[미검증\] | **공개형 공공데이터가 아니라 계약형 인프라 API**. RM 콘솔에 유용하지만, 조달 난이도와 심사 요건이 높습니다. [\[4\]](https://openapi.kftc.or.kr/service/openBanking) | 1차+일부 \[미검증\] | 공식 포털 [\[4\]](https://openapi.kftc.or.kr/service/openBanking) |
| 국세청_현금영수증 현황 | 국세청 | 현금영수증 가맹점 가입자 수 등 제도 운영 통계. 정적 통계형 데이터로만 확인 [\[74\]](https://www.data.go.kr/data/3059462/fileData.do) | 파일데이터 다운로드. **거래단위 현금영수증 공개 API는 이번 세션에서 직접 확인하지 못함**. | API형 한도 없음 | 통계형 파일데이터. 최신 파일 갱신형. [\[74\]](https://www.data.go.kr/data/3059462/fileData.do) | 무료. [\[74\]](https://www.data.go.kr/data/3059462/fileData.do) | “**이용허락범위 제한 없음**”. 다만 이는 통계 파일데이터 기준입니다. [\[74\]](https://www.data.go.kr/data/3059462/fileData.do) | 1차+일부 \[미검증\] | 공식/포털 [\[74\]](https://www.data.go.kr/data/3059462/fileData.do) |

## 도메인 활용 매핑

| 도메인 | 결합 데이터 | 산출 지표 | 제약·주의 |
|----|----|----|----|
| 소상공인 | 상가(상권)정보 API + 사업자등록 상태조회 + 지방행정 인허가 + ECOS | 입지밀도, 동종업종 경쟁도, 영업/폐업 플래그, 인허가 상태, 금리 민감도, 지역·업종별 침체신호 | 상권정보는 API 메타는 실시간이지만 표준데이터 배치는 분기라서 **실시간/배치 시점 분리**가 필요합니다. 사업자 상태조회는 **1회 100건/1일 100만건**이고, 신규 개업 반영 지연이 있을 수 있습니다. [\[75\]](https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y) |
| 전세 | RTMS 매매·전월세 + 인터넷등기소 유료 열람/발급 + 등기정보광장 통계 + HUG 전세보증 데이터 + HF HOUSTAT | 전세가율, 최근 실거래가 하방, 선순위권리/근저당 플래그, 보증사고 다발지역, 보증 가입가능성 보조지표 | **개별 등기권리 분석은 유료 등기 열람/발급이 핵심**이며 공개 Open API로 대체되지 않습니다. RTMS 웹 자료는 “참고용”이고, 단독/다가구는 지번이 일부만 공개됩니다. HUG는 일부 API가 저장형/비저장형을 구분하므로 아키텍처 설계 때 서버저장 여부를 먼저 결정해야 합니다. [\[76\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1) |
| 사기 | 경찰청 보이스피싱 통계 + KISA 피싱사이트 URL/악성사이트 차단 통계 + 금융결제원 계약형 API + 사업자 상태조회 | 지역·연령·유형별 피싱 위험도, URL 블랙리스트, 악성사이트 차단 이벤트, 계좌실명조회 결과, 의심 사업자 휴폐업 플래그 | **공개 데이터만으로는 개인 단위 이상거래 탐지가 불가능**합니다. 공개형으로는 통계·URL·차단목록을 쓰고, 실제 계좌 검증·이체 맥락 확인은 금융결제원 계약형 API가 필요합니다. [\[77\]](https://www.data.go.kr/data/15063815/fileData.do) |

## 근거표

| 주장 | 출처 | 발행처·날짜 | 신뢰도 | 원문 인용 |
|----|----|----|----|----|
| 한국은행 공표 공공데이터는 별도 절차 없이 자유 이용 가능 | 공식 페이지 [\[7\]](https://www.bok.or.kr/portal/main/contents.do?menuNo=200228) | 한국은행, 무일자 | 1차 | “별도의 절차 없이 자유롭게 이용” |
| 한국은행 데이터 이용 시 출처 표시 필요 | 공식 페이지 [\[7\]](https://www.bok.or.kr/portal/main/contents.do?menuNo=200228) | 한국은행, 무일자 | 1차 | “출처가 한국은행임을 반드시 밝혀야” |
| data.go.kr는 제3자 권리 포함 데이터에 예외를 둠 | 공식 페이지 [\[78\]](https://www.data.go.kr/ugs/selectPortalPolicyView.do) | 공공데이터포털, 무일자 | 1차 | “제3자 권리가 포함된 공공데이터” |
| data.go “제1유형”은 상업적 이용과 변경 가능 | 공식 페이지 [\[78\]](https://www.data.go.kr/ugs/selectPortalPolicyView.do) | 공공데이터포털, 무일자 | 1차 | “상업적, 비상업적 이용가능” |
| data.go 활용신청 후 인증키로 호출 | 공식 페이지 [\[10\]](https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do) | 공공데이터포털, 무일자 | 1차 | “인증키를 발급받을 수 있습니다” |
| RTMS 웹 자료는 법적 효력이 없는 참고용 | 공식 페이지 [\[23\]](https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=) | 국토교통부 실거래가공개시스템, 무일자 | 1차 | “법적인 효력이 없으므로 참고용” |
| RTMS 웹 자료제공은 시도별 기간이 최대 1년 | 공식 페이지 [\[23\]](https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=) | 국토교통부 실거래가공개시스템, 무일자 | 1차 | “계약일자 범위는 최대 1년” |
| 인터넷등기소 열람 수수료 | 공식 페이지 [\[79\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1) | 인터넷등기소, 무일자 | 1차 | “등기기록 열람 : 1통당 700원” |
| 인터넷등기소 인터넷 발급 수수료 | 공식 규칙/포털 [\[25\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1) | 인터넷등기소 / 대법원규칙, 2025-08-01 시행 | 1차 | “인터넷에 의한 … 1통에 대하여 1,000원” |
| 등기정보광장은 비식별 자료 무료 제공 | 공식 페이지 [\[80\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1) | 등기정보광장, 무일자 | 1차 | “비식별 등기정보 자료”, “무료로 이용 가능” |
| 등기정보광장 Open API 키 유효기간 1년 | 공식 FAQ [\[81\]](https://data.iros.go.kr/rp/oa/openOapiIntro.do) | 등기정보광장 FAQ, 무일자 | 1차 | “발급일로부터 1년” |
| 국세청 상태조회 API 한도 | 공식 페이지 [\[42\]](https://www.data.go.kr/data/15081808/openapi.do) | data.go.kr / 국세청, 수정일 2026-05-13 | 1차 | “1회 100건, 1일 100만건 제한” |
| 국세청 상태조회 API 갱신주기 | 공식 페이지 [\[44\]](https://www.data.go.kr/data/15081808/openapi.do) | data.go.kr / 국세청, 수정일 2026-05-13 | 1차 | “30분 주기로 업데이트” |
| OPENDART는 사용량 허용량 제한이 있음 | 공식 약관 [\[56\]](https://opendart.fss.or.kr/intro/terms.do) | 금융감독원, 2020-01-21 | 1차 | “이용횟수에 허용량 제한” |
| OPENDART 일반 한도 설명 | 공식 개발가이드 [\[82\]](https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS005&apiId=2020039) | 금융감독원, 무일자 | 1차 | “일반적으로는 20,000건 이상의 요청” |
| OPENDART는 원칙적으로 무료 | 공식 약관 [\[56\]](https://opendart.fss.or.kr/intro/terms.do) | 금융감독원, 2020-01-21 | 1차 | “원칙적으로 무료입니다” |
| HUG Open API는 저장형/비저장형을 구분 | 공식 페이지 [\[35\]](https://www.khug.or.kr/houstar/web/p03/01/p030105.jsp?articleId=34715&currentPage=1&mode=S) | HUG 빅데이터 개방 포털, 무일자 | 1차 | “서버에 저장하지 않고”, “저장하거나 DB화” |
| HUG Open API 인증키는 본인인증 후 발급 | 공식 FAQ [\[33\]](https://khug.or.kr/houstar/web/p05/02/p050207.jsp) | HUG 빅데이터 개방 포털, 무일자 | 1차 | “본인 인증을 진행” |
| 금융결제원 오픈뱅킹은 승인받은 기관용 | 공식 페이지 [\[83\]](https://openapi.kftc.or.kr/service/openBanking) | 금융결제원, 무일자 | 1차 | “이용승인을 받은 핀테크사업자” |
| HOUSTAT는 고트래픽 시 활용사례 등록 요구 가능 | 공식 약관 [\[71\]](https://houstat.hf.go.kr/research/portal/intro/userAgreementPage.do) | 한국주택금융공사, 무일자 | 1차 | “활용사례 등록을 강제할 수” |

## 제품 적용 시사점

JB LocalGuard OS의 **RAG·룰엔진 기초 데이터축**은 세 층으로 나누는 것이 현실적입니다.\
첫째, **무상·저마찰 공개형 API층**입니다. 여기에 ECOS, RTMS, 상권정보, 사업자 상태조회, 경찰청·KISA 통계 데이터를 넣습니다. 이 층은 운영계정 발급과 캐시만 잘 잡으면 곧바로 서비스화가 가능합니다. 둘째, **유료·건별 조회층**인데, 대표가 인터넷등기소입니다. 전세 권리분석의 핵심 리스크를 잡으려면 이 층이 사실상 필수입니다. 셋째, **기관계약형 고신뢰 연동층**으로, 금융결제원 오픈뱅킹/어카운트인포 계열을 둡니다. 이 층은 MVP가 아니라 PoC 이후 제휴 추진 대상으로 분리하는 편이 안전합니다. [\[84\]](https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y)

소상공인 라인에서는 **업체식별-입지-업황-거시금리** 순으로 결합하는 구조가 가장 깔끔합니다.\
사업자등록번호로 국세청 상태조회에서 휴·폐업/과세유형을 확인하고, 주소·업종은 상권정보 API 및 지방행정 인허가 데이터와 결합하며, 금리·경기 민감도는 ECOS로 보강하면 됩니다. 이때 원시 사업자등록번호는 외부 모델에 보내지 말고 **내부 망에서만 조회 후 상태 플래그·조회시각·출처 ID만 보관**하는 방식이 적절합니다. 이 보관 축소는 개인정보 노출을 줄이면서도, 국세청의 30분 갱신 주기와 상권 데이터의 정기 갱신 차이를 룰엔진에서 흡수하기 쉽다는 장점도 있습니다. 이는 공개 데이터의 라이선스·갱신 구조를 고려한 설계상 추론입니다. [\[85\]](https://www.data.go.kr/data/15081808/openapi.do)

전세 라인에서는 **주소 정규화 → RTMS 기준가격대 산출 → 등기 권리정규화 → HUG/HF 보증보조지표 결합** 순서가 적합합니다.\
RTMS로 최근 매매가와 전월세 거래를 받아 전세가율 후보를 계산하고, 등기사항증명서 열람 결과는 원문 PDF·이미지 자체를 장기 저장하기보다 **소유자일치 여부, 선순위권리 총액, 근저당 최고채권액, 가압류 여부, 말소기준권리 여부**처럼 정규화된 피처만 남기는 편이 좋습니다. HUG 전세보증금반환보증 상세현황과 사고 데이터는 개별 물건 판단보다는 **지역·유형별 사후 위험 가중치**로 넣는 게 안전합니다. 이런 분리는 인터넷등기소의 유료·건별 서비스 구조와 HUG 데이터의 공공 통계 성격을 동시에 반영한 설계입니다. [\[86\]](https://www.data.go.kr/data/15126469/openapi.do)

사기 라인에서는 **개인 단위 FDS와 공공데이터 기반 인텔리전스**를 분리해야 합니다.\
공개형 데이터로는 경찰청의 보이스피싱 통계, KISA의 피싱 URL·악성사이트 차단 통계로 **지역·유형·URL 위험 인텔리전스**를 만들 수 있습니다. 그러나 **계좌 소유주 일치, 입출금 맥락, 비정상 거래 행태 자체**는 공개 데이터만으로 확인되지 않으므로, 실제 탐지·차단은 금융결제원 계약형 API나 은행 내부 거래로그가 필요합니다. 따라서 LocalGuard OS는 외부 공공데이터를 **사전 경고·룰 부스팅 피처**로, 내부 거래데이터를 **최종 판단 피처**로 두는 이중 구조가 적절합니다. 이 역시 공식 서비스 설명을 바탕으로 한 제품 설계상 추론입니다. [\[87\]](https://www.data.go.kr/data/15063815/fileData.do)

PII 비반출 원칙 아래에서는 **식별자 최소화**가 핵심입니다.\
사업자등록번호, 주소 세부지번, 계좌번호, 휴대폰번호, 등기 원문 같은 민감 요소는 **외부 LLM/RAG 인덱스에 넣지 말고**, 내부 안전영역에서 조회 후 해시·가명화·집계값·불리언 규칙값으로 변환해야 합니다. 특히 등기와 사업자 상태조회는 출처가 명확한 대신 원식별자 의존성이 높으므로, 제품 저장 스키마는 `조회시각`, `출처`, `판정`, `파생피처` 중심으로 설계하는 편이 라이선스·보안·감사 대응에 모두 유리합니다. [\[88\]](https://www.bok.or.kr/portal/main/contents.do?menuNo=200228)

## 갭과 미검증

이번 세션에서 **MVP 제외 또는 별도 법무·제휴 검토가 필요한 항목**도 분명했습니다.\
가장 큰 갭은 **인터넷등기소/등기정보광장의 자동화 허용 범위**입니다. 수수료와 무료 비식별 자료 제공은 확인됐지만, **개별 등기기록 열람·발급의 자동수집 허용 여부**, **대량조회 허용 범위**, **기술적 차단 정책**은 공식 원문을 이번 세션에서 직접 확보하지 못했습니다. 따라서 전세 라인 MVP에서 등기는 “**사람 개입형 또는 은행 내부 승인형 조회**”로만 두고, 완전 자동 수집은 제외하는 것이 보수적으로 맞습니다. [\[89\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1)

**FISIS**도 같은 범주입니다.\
Open API 존재는 2020년 금감원 시스템 개편 보도 재배포 자료에서 확인했지만, **현행 공식 약관·호출 한도·인증 절차를 직접 열람해 확정하지 못했습니다**. 따라서 본선 기능명세서에는 FISIS를 넣더라도 **\[미검증\]**로 표기하고, 실제 사양 부록의 “확정 사용 API” 목록에서는 한 번 더 공식 접속·확인 뒤 승격하는 것이 안전합니다. [\[58\]](https://eiec.kdi.re.kr/policy/materialView.do?datecount=&num=196723&pg=&pp=20&recommend=&topic=O)

**HUG 빅데이터 Open API**도 인증 경로와 저장형/비저장형 구분까지는 확인됐지만, **정량 호출 한도와 일반 라이선스 조항**은 이번 세션에서 직접 확보하지 못했습니다. 따라서 HUG는 당장에는 **data.go.kr 파일데이터 중심 배치 ingest**로 시작하고, 실시간 Open API는 별도 확인 후 붙이는 편이 무난합니다. [\[90\]](https://khug.or.kr/houstar/web/p05/02/p050207.jsp)

**금융결제원 오픈뱅킹/어카운트인포 계열 API**는 기술적으로 매우 유용하지만, 공식 설명상 **이용계약 및 이용승인**이 전제되는 계약형 인프라입니다. 비용, 심사기준, 테스트베드 범위, 운영 전환 조건을 이번 세션에서 확정하지 못했으므로, 이를 **공공 개방 API**처럼 사양서에 적는 것은 부정확합니다. 이 축은 “제휴형/기관승인형 연동 후보”로만 표기하는 것이 정확합니다. [\[4\]](https://openapi.kftc.or.kr/service/openBanking)

정리하면, **즉시 확정 가능한 축**은 RTMS, 상권정보, 국세청 상태조회, 행안부 인허가, OPENDART, 경찰청/KISA 통계이고, **조건부 확정 축**은 HUG·HF HOUSTAT, **법무·제휴 선행 축**은 인터넷등기소 자동화와 금융결제원 계열입니다. 이 구분으로 사양서 부록을 작성하면 과장 없이도 실제 구현 가능성이 높은 조달 표를 만들 수 있습니다. [\[91\]](https://www.data.go.kr/data/15126469/openapi.do)

------------------------------------------------------------------------

[\[1\]](https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y) [\[39\]](https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y) [\[40\]](https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y) [\[41\]](https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y) [\[75\]](https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y) [\[84\]](https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y) https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y

<https://www.data.go.kr/data/15012005/openapi.do?recommendDataYn=Y>

[\[2\]](https://data.iros.go.kr/rp/oa/openOapiAppl.do) [\[26\]](https://data.iros.go.kr/rp/oa/openOapiAppl.do) [\[31\]](https://data.iros.go.kr/rp/oa/openOapiAppl.do) https://data.iros.go.kr/rp/oa/openOapiAppl.do

<https://data.iros.go.kr/rp/oa/openOapiAppl.do>

[\[3\]](https://www.data.go.kr/ugs/selectPortalPolicyView.do) [\[78\]](https://www.data.go.kr/ugs/selectPortalPolicyView.do) https://www.data.go.kr/ugs/selectPortalPolicyView.do

<https://www.data.go.kr/ugs/selectPortalPolicyView.do>

[\[4\]](https://openapi.kftc.or.kr/service/openBanking) [\[83\]](https://openapi.kftc.or.kr/service/openBanking) https://openapi.kftc.or.kr/service/openBanking

<https://openapi.kftc.or.kr/service/openBanking>

[\[5\]](https://ecos.bok.or.kr/) https://ecos.bok.or.kr/

<https://ecos.bok.or.kr/>

[\[6\]](https://ecos.bok.or.kr/api/) [\[8\]](https://ecos.bok.or.kr/api/) https://ecos.bok.or.kr/api/

<https://ecos.bok.or.kr/api/>

[\[7\]](https://www.bok.or.kr/portal/main/contents.do?menuNo=200228) [\[88\]](https://www.bok.or.kr/portal/main/contents.do?menuNo=200228) https://www.bok.or.kr/portal/main/contents.do?menuNo=200228

<https://www.bok.or.kr/portal/main/contents.do?menuNo=200228>

[\[9\]](https://www.data.go.kr/data/15126469/openapi.do) [\[11\]](https://www.data.go.kr/data/15126469/openapi.do) [\[12\]](https://www.data.go.kr/data/15126469/openapi.do) [\[86\]](https://www.data.go.kr/data/15126469/openapi.do) [\[91\]](https://www.data.go.kr/data/15126469/openapi.do) https://www.data.go.kr/data/15126469/openapi.do

<https://www.data.go.kr/data/15126469/openapi.do>

[\[10\]](https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do) [\[43\]](https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do) https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do

<https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do>

[\[13\]](https://www.data.go.kr/data/15126474/openapi.do) [\[14\]](https://www.data.go.kr/data/15126474/openapi.do) [\[15\]](https://www.data.go.kr/data/15126474/openapi.do) https://www.data.go.kr/data/15126474/openapi.do

<https://www.data.go.kr/data/15126474/openapi.do>

[\[16\]](https://www.data.go.kr/data/15126473/openapi.do) [\[18\]](https://www.data.go.kr/data/15126473/openapi.do) https://www.data.go.kr/data/15126473/openapi.do

<https://www.data.go.kr/data/15126473/openapi.do>

[\[17\]](https://www.data.go.kr/data/15126467/openapi.do) https://www.data.go.kr/data/15126467/openapi.do

<https://www.data.go.kr/data/15126467/openapi.do>

[\[19\]](https://www.data.go.kr/data/15126465/openapi.do) [\[20\]](https://www.data.go.kr/data/15126465/openapi.do) [\[21\]](https://www.data.go.kr/data/15126465/openapi.do) https://www.data.go.kr/data/15126465/openapi.do

<https://www.data.go.kr/data/15126465/openapi.do>

[\[22\]](https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=) [\[23\]](https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=) https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=

<https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=>

[\[24\]](https://rt.molit.go.kr/) https://rt.molit.go.kr/

<https://rt.molit.go.kr/>

[\[25\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1) [\[30\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1) [\[76\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1) [\[79\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1) [\[80\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1) [\[89\]](https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1) https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1

<https://data.iros.go.kr/cm/et/openUtnRgltn.do?sParam=1>

[\[27\]](https://data.iros.go.kr/rp/oa/openOapiIntro.do) [\[81\]](https://data.iros.go.kr/rp/oa/openOapiIntro.do) https://data.iros.go.kr/rp/oa/openOapiIntro.do

<https://data.iros.go.kr/rp/oa/openOapiIntro.do>

[\[28\]](https://data.iros.go.kr/ld/da/openDataApplInfrm.do) https://data.iros.go.kr/ld/da/openDataApplInfrm.do

<https://data.iros.go.kr/ld/da/openDataApplInfrm.do>

[\[29\]](https://data.iros.go.kr/iu/fa/openFaq.do) https://data.iros.go.kr/iu/fa/openFaq.do

<https://data.iros.go.kr/iu/fa/openFaq.do>

[\[32\]](https://www.khug.or.kr/houstar/web/p05/01/p050101.jsp) https://www.khug.or.kr/houstar/web/p05/01/p050101.jsp

<https://www.khug.or.kr/houstar/web/p05/01/p050101.jsp>

[\[33\]](https://khug.or.kr/houstar/web/p05/02/p050207.jsp) [\[90\]](https://khug.or.kr/houstar/web/p05/02/p050207.jsp) https://khug.or.kr/houstar/web/p05/02/p050207.jsp

<https://khug.or.kr/houstar/web/p05/02/p050207.jsp>

[\[34\]](https://khug.or.kr/houstar/web/p03/01/p030105.jsp?articleId=36932&currentPage=1&mode=S) https://khug.or.kr/houstar/web/p03/01/p030105.jsp?articleId=36932&currentPage=1&mode=S

<https://khug.or.kr/houstar/web/p03/01/p030105.jsp?articleId=36932&currentPage=1&mode=S>

[\[35\]](https://www.khug.or.kr/houstar/web/p03/01/p030105.jsp?articleId=34715&currentPage=1&mode=S) https://www.khug.or.kr/houstar/web/p03/01/p030105.jsp?articleId=34715&currentPage=1&mode=S

<https://www.khug.or.kr/houstar/web/p03/01/p030105.jsp?articleId=34715&currentPage=1&mode=S>

[\[36\]](https://www.khug.or.kr/index.jsp?mainType=housta) https://www.khug.or.kr/index.jsp?mainType=housta

<https://www.khug.or.kr/index.jsp?mainType=housta>

[\[37\]](https://www.data.go.kr/data/15033824/fileData.do) [\[38\]](https://www.data.go.kr/data/15033824/fileData.do) https://www.data.go.kr/data/15033824/fileData.do

<https://www.data.go.kr/data/15033824/fileData.do>

[\[42\]](https://www.data.go.kr/data/15081808/openapi.do) [\[44\]](https://www.data.go.kr/data/15081808/openapi.do) [\[45\]](https://www.data.go.kr/data/15081808/openapi.do) [\[46\]](https://www.data.go.kr/data/15081808/openapi.do) [\[47\]](https://www.data.go.kr/data/15081808/openapi.do) [\[85\]](https://www.data.go.kr/data/15081808/openapi.do) https://www.data.go.kr/data/15081808/openapi.do

<https://www.data.go.kr/data/15081808/openapi.do>

[\[48\]](https://www.data.go.kr/data/15154916/openapi.do) [\[51\]](https://www.data.go.kr/data/15154916/openapi.do) https://www.data.go.kr/data/15154916/openapi.do

<https://www.data.go.kr/data/15154916/openapi.do>

[\[49\]](https://www.localdata.go.kr/devcenter/bbs/devQnaDetail.do%3Bjsessionid%3D9sU7GlKuf3GPBgF5yUtVWq6YhlQmBDhsffqCgill1BSUgHVZvNSmgjxrXlw3kzU7.opendata01_servlet_engine1?bbsId=B0000100&menuNo=20003&nttId=1633&pageIndex=5&searchCnd=&searchWrd=) https://www.localdata.go.kr/devcenter/bbs/devQnaDetail.do%3Bjsessionid%3D9sU7GlKuf3GPBgF5yUtVWq6YhlQmBDhsffqCgill1BSUgHVZvNSmgjxrXlw3kzU7.opendata01_servlet_engine1?bbsId=B0000100&menuNo=20003&nttId=1633&pageIndex=5&searchCnd=&searchWrd=

<https://www.localdata.go.kr/devcenter/bbs/devQnaDetail.do%3Bjsessionid%3D9sU7GlKuf3GPBgF5yUtVWq6YhlQmBDhsffqCgill1BSUgHVZvNSmgjxrXlw3kzU7.opendata01_servlet_engine1?bbsId=B0000100&menuNo=20003&nttId=1633&pageIndex=5&searchCnd=&searchWrd=>

[\[50\]](https://www.data.go.kr/data/15045016/fileData.do?recommendDataYn=Y) https://www.data.go.kr/data/15045016/fileData.do?recommendDataYn=Y

<https://www.data.go.kr/data/15045016/fileData.do?recommendDataYn=Y>

[\[52\]](https://www.data.go.kr/data/3075133/openapi.do) [\[55\]](https://www.data.go.kr/data/3075133/openapi.do) [\[57\]](https://www.data.go.kr/data/3075133/openapi.do) https://www.data.go.kr/data/3075133/openapi.do

<https://www.data.go.kr/data/3075133/openapi.do>

[\[53\]](https://opendart.fss.or.kr/uss/umt/EgovMberInsertView.do) https://opendart.fss.or.kr/uss/umt/EgovMberInsertView.do

<https://opendart.fss.or.kr/uss/umt/EgovMberInsertView.do>

[\[54\]](https://opendart.fss.or.kr/intro/terms.do) [\[56\]](https://opendart.fss.or.kr/intro/terms.do) https://opendart.fss.or.kr/intro/terms.do

<https://opendart.fss.or.kr/intro/terms.do>

[\[58\]](https://eiec.kdi.re.kr/policy/materialView.do?datecount=&num=196723&pg=&pp=20&recommend=&topic=O) https://eiec.kdi.re.kr/policy/materialView.do?datecount=&num=196723&pg=&pp=20&recommend=&topic=O

<https://eiec.kdi.re.kr/policy/materialView.do?datecount=&num=196723&pg=&pp=20&recommend=&topic=O>

[\[59\]](https://www.data.go.kr/data/15063815/fileData.do) [\[61\]](https://www.data.go.kr/data/15063815/fileData.do) [\[63\]](https://www.data.go.kr/data/15063815/fileData.do) [\[77\]](https://www.data.go.kr/data/15063815/fileData.do) [\[87\]](https://www.data.go.kr/data/15063815/fileData.do) https://www.data.go.kr/data/15063815/fileData.do

<https://www.data.go.kr/data/15063815/fileData.do>

[\[60\]](https://www.data.go.kr/data/15155637/fileData.do) [\[66\]](https://www.data.go.kr/data/15155637/fileData.do) [\[67\]](https://www.data.go.kr/data/15155637/fileData.do) https://www.data.go.kr/data/15155637/fileData.do

<https://www.data.go.kr/data/15155637/fileData.do>

[\[62\]](https://www.data.go.kr/data/15091224/fileData.do?recommendDataYn=Y) https://www.data.go.kr/data/15091224/fileData.do?recommendDataYn=Y

<https://www.data.go.kr/data/15091224/fileData.do?recommendDataYn=Y>

[\[64\]](https://www.data.go.kr/data/15109780/fileData.do) [\[65\]](https://www.data.go.kr/data/15109780/fileData.do) [\[68\]](https://www.data.go.kr/data/15109780/fileData.do) https://www.data.go.kr/data/15109780/fileData.do

<https://www.data.go.kr/data/15109780/fileData.do>

[\[69\]](https://houstat.hf.go.kr/research/portal/openapi/openApiIntroPage.do) [\[70\]](https://houstat.hf.go.kr/research/portal/openapi/openApiIntroPage.do) [\[73\]](https://houstat.hf.go.kr/research/portal/openapi/openApiIntroPage.do) https://houstat.hf.go.kr/research/portal/openapi/openApiIntroPage.do

<https://houstat.hf.go.kr/research/portal/openapi/openApiIntroPage.do>

[\[71\]](https://houstat.hf.go.kr/research/portal/intro/userAgreementPage.do) https://houstat.hf.go.kr/research/portal/intro/userAgreementPage.do

<https://houstat.hf.go.kr/research/portal/intro/userAgreementPage.do>

[\[72\]](https://houstat.hf.go.kr/research/portal/compose/announcePage.do) https://houstat.hf.go.kr/research/portal/compose/announcePage.do

<https://houstat.hf.go.kr/research/portal/compose/announcePage.do>

[\[74\]](https://www.data.go.kr/data/3059462/fileData.do) https://www.data.go.kr/data/3059462/fileData.do

<https://www.data.go.kr/data/3059462/fileData.do>

[\[82\]](https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS005&apiId=2020039) https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS005&apiId=2020039

<https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS005&apiId=2020039>
