> 원본 파일: `D5a. 20260630_금융권_LLM_거버넌스_아키텍처_리서치.docx`
> 회수 2026-06-30 · ⚠️ 대외비 · 엔진 산출 원문(가공 최소)

---

# 한국 금융권 외부 LLM 비반출 거버넌스 아키텍처에 대한 법조문 확정 리서치

## 핵심 발견

- **은행·금융회사의 신용정보 처리에는 신용정보법이 특별법으로 우선 적용되고, 개인정보보호법은 보충 적용된다.** law.go.kr 현행 「신용정보의 이용 및 보호에 관한 법률」 제3조의2는 “신용정보의 이용 및 보호에 관하여 다른 법률에 특별한 규정이 있는 경우를 제외하고는 이 법에서 정하는 바에 따른다” 및 “개인정보의 보호에 관하여 이 법에 특별한 규정이 있는 경우를 제외하고는 「개인정보 보호법」에서 정하는 바에 따른다”라고 규정한다. 따라서 금융회사(은행)가 개인신용정보의 가명처리를 설계할 때 **신용정보법 §40조의2를 우선 앵커**로 두고, PIPA §28조의2~5를 보충 규범으로 붙이는 구조가 법체계상 가장 정합적이다. [\[1\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540)

- **토큰↔원본 키 분리보관은 단순 모범사례가 아니라, 법률·시행령·감독규정이 합쳐 요구하는 실정법상 안전조치다.** 신용정보법 §40조의2①은 “가명처리에 사용한 추가정보를 … 분리하여 보관하거나 삭제”하도록 하고, §40조의2②는 기술적·물리적·관리적 보안대책을 요구하며, §40조의2⑧은 조치 기록을 3년간 보존하도록 한다. 여기에 신용정보법 시행령은 **추가정보 접근통제, 가명처리 전 개인신용정보와 가명정보의 분리, 담당자 지정·교육**을 요구하고, 신용정보업감독규정 별표 8은 **추가정보를 가명정보와 분리된 저장소에 암호화 저장, 접근권한 분리, 접근기록 3년간 보관, 월 1회 이상 점검**까지 구체화한다. PIPA도 시행령 제29조의5에서 **가명정보와 추가정보의 분리보관·접근권한 분리**를 명시한다. [\[2\]](https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=001540&lsRvsGubun=all)

- **재식별 금지는 양 법체계 모두에서 핵심 금지규범이다.** 신용정보법 §40조의2⑥은 “영리 또는 부정한 목적으로 특정 개인을 알아볼 수 있게 가명정보를 처리”하는 것을 금지하고, §40조의2⑦은 특정 개인을 알아볼 수 있게 된 경우 **즉시 회수·처리중지·삭제**를 요구한다. PIPA 제28조의5도 현행법상 “제28조의2 또는 제28조의3에 따라 가명정보를 처리하는 자”에게 **특정 개인 식별 목적 처리 금지**를 두고, 식별 가능 정보가 생성되면 **즉시 처리중지·회수·파기**를 요구한다. [\[3\]](https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=001540&lsRvsGubun=all)

- **다만 PIPA 제28조의5의 문언은 신설 당시보다 현재 더 좁아졌다.** 2020년 시행본은 “누구든지 특정 개인을 알아보기 위한 목적으로 가명정보를 처리해서는 아니 된다”였는데, 현행 law.go.kr 검색결과상 제28조의5①은 “제28조의2 또는 제28조의3에 따라 가명정보를 처리하는 자는 …”로 기재되어 있다. 즉, **현행 문언은 적용대상을 ‘법상 가명정보 특례 처리자’로 한정하는 방향으로 보이며**, 실무상 재식별 금지 논증에서는 현재 문언과 신설 당시 문언의 차이를 함께 적시하는 편이 안전하다. [\[4\]](https://www.law.go.kr/LSW/lsInfoP.do?efYd=20200805&lsiSeq=213857)

- **PIPA의 가명정보 안전조치 조문 구조도 신설 당시와 현행이 다르다.** 2020년 신설 당시 제28조의4는 ① 안전성 확보조치, ② 처리기록 작성·보관의 2개 항 중심이었는데, 현행은 시행령과 연동되어 **가명정보 처리 기간 설정, 추가기록 항목 관리**가 보강된 구조로 운용되고 있다. 따라서 금융권 설계서에는 “PIPA §28조의4”만 적지 말고, **시행령 제29조의5 및 기록 항목**까지 함께 묶어 적는 것이 맞다. [\[5\]](https://www.law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010102&lsId=011357)

- **위반 시 제재는 ‘형벌·과태료·과징금’이 중첩된다.** 신용정보법은 고의적 재식별에 대해 **5년 이하 징역 또는 5천만원 이하 벌금**을 두고, 추가정보 미분리·보안대책 미수립·재식별 후 미중단에는 **3천만원 이하 과태료**를 둔다. 별도로 §42조의2는 제40조의2제6항 위반 등에 대해 **관련 매출액 3% 이하 과징금**(매출액이 없거나 산정 곤란 시 **200억원 이하**)을 둔다. PIPA는 제71조로 재식별 목적 처리와 무동의 가명정보 제3자 제공 등을 형사처벌하고, 제75조로 안전조치·회수파기·기록보관 위반에 과태료를 부과하며, 제64조의2로 위반행위 유형에 따라 **전체 매출액 기준 3% 이하 과징금** 체계를 둔다. [\[6\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0050&lsiSeq=260423&urlMode=lsScJoRltInfoR)

- **PIPA 과징금 체계는 2023 개정으로 ‘전체 매출액 기준’이 정착했고, 2026년에는 더 강화되는 방향으로 개정이 진행되었다.** 현재 law.go.kr 현행 제64조의2는 **전체 매출액의 3% 이하**를 기준으로 하고, 시행령과 과징금 부과기준 고시는 관련 없는 매출액 제외, 기준금액 산정, 가중·감경 요소를 상세화한다. 한편 2026.3.10 개정법과 2026.6.1 시행령 입법예고는 **반복적·중대한 개인정보 침해에 최대 10%까지** 상향하는 방향을 전제로 세부 산식을 정비하고 있다. 2026.6.29 현재 이는 **향후 시행 예정 사항**과 **입법예고 사항**을 구분해서 봐야 한다. [\[7\]](https://law.go.kr/LSW//lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1020398647)

- **실제 제재 사례는 이미 금융권에서 고액으로 나오고 있다.** PIPC는 2026년 롯데카드에 **과징금 96억 2,000만원**, 2025년 카카오페이·애플 사건에 총 **83억 7,520만원**, 2024년 4개 다이렉트 자동차보험사에 **92억 770만원**을 부과했다. 다만, 이번 조사에서 공개적으로 확인된 사례들은 주로 **주민등록번호 처리·안전조치·동의·국외이전·마케팅 이용** 관련 PIPA 집행사례였고, **신용정보법 §40조의2 가명정보 재식별 자체를 정면으로 처분한 공개 사례는 별도로 확인하지 못했다.** [\[8\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11878)

- **외부 프런티어 LLM에 ‘가명·토큰화 데이터만’ 보내는 구조는 원칙적으로 가명정보 처리 틀 안에 들어갈 수 있지만, 자동으로 적법해지는 것은 아니다.** 신용정보법상 “가명처리” 정의 자체가 **추가정보 분리보관**을 전제로 하고, PIPC의 가명정보·AI 안내는 **LLM API 활용**을 명시적으로 다루면서도 맥락별 안전조치와 위험평가를 요구한다. 학설도 “최소한의 가명처리만으로 추가처리가 당연히 적법해지는 것은 아니고, 재식별 위험 판단은 동태적·맥락 의존적”이라고 본다. 즉, 외부 LLM 제공은 **은행 내부에만 추가정보가 있고, 외부 모델 사업자가 재결합할 수 없으며, 출력 재식별을 차단할 기술·계약·감사통제가 실제 작동할 때** 가명정보 처리로 방어 가능성이 높다. 반대로 준식별자 조합이나 외부 데이터 결합으로 재식별 가능성이 높아지면 §40조의2⑥·⑦ 및 PIPA §28조의5 리스크가 바로 열린다. [\[9\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0002&lsiSeq=260423&urlMode=lsScJoRltInfoR)

## 근거표

| 주장 | 조문/출처 URL | 발행처·날짜·시행일 | 신뢰도 | 원문 인용 |
|----|----|----|----|----|
| 신용정보법 특별법 우선, PIPA 보충 적용 | law.go.kr 조문정보 [\[10\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540) | 법제처 국가법령정보센터, 현행; 신용정보법 \[시행 2024. 8. 14.\] | 1차 | “① 신용정보의 이용 및 보호에 관하여 다른 법률에 특별한 규정이 있는 경우를 제외하고는 이 법에서 정하는 바에 따른다. ② 개인정보의 보호에 관하여 이 법에 특별한 규정이 있는 경우를 제외하고는 「개인정보 보호법」에서 정하는 바에 따른다.” |
| 신용정보법 가명처리 정의는 추가정보 분리보관을 전제 | law.go.kr 조문정보 [\[11\]](https://www.law.go.kr/LSW//lsLawLinkInfo.do?chrClsCd=010202&lsId=001540&lsJoLnkSeq=900370822&print=print) | 법제처 국가법령정보센터, 현행; 신용정보법 \[시행 2024. 8. 14.\] | 1차 | “가명처리란 … 제40조의2제1항 및 제2항에 따라 그 추가정보를 분리하여 보관하는 등 … 처리한 경우를 포함한다.” |
| 신용정보법 §40조의2① | law.go.kr 현행 본문 검색결과 [\[12\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540) | 법제처 국가법령정보센터, 현행; 신용정보법 \[시행 2024. 8. 14.\] | 1차 | “신용정보회사등은 가명처리에 사용한 추가정보를 대통령령으로 정하는 방법으로 분리하여 보관하거나 삭제하여야 한다.” |
| 신용정보법 §40조의2①②⑥⑦⑧ 전문 확인 | law.go.kr 제정·개정문/연혁 대조 [\[13\]](https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=001540&lsRvsGubun=all) | 법제처 국가법령정보센터, 2020 신설 전문·현행과 대조; 현행 시행 2024. 8. 14. | 1차 | “② … 내부관리계획을 수립하고 접속기록을 보관하는 등 … 보안대책을 수립ㆍ시행하여야 한다.” / “⑥ … 영리 또는 부정한 목적으로 특정 개인을 알아볼 수 있게 가명정보를 처리하여서는 아니 된다.” / “⑦ … 즉시 그 가명정보를 회수하여 처리를 중지하고 … 즉시 삭제하여야 한다.” / “⑧ … 조치 기록을 3년간 보존하여야 한다.” |
| 신용정보법 시행령상 추가정보 접근통제·분리·교육 | law.go.kr 시행령 본문 검색결과 [\[14\]](https://law.go.kr/LSW/lsInfoP.do?lsiSeq=283179) | 법제처 국가법령정보센터, 신용정보법 시행령 \[시행 2026. 2. 3.\] | 1차 | “법 제40조의2제1항에서 ‘대통령령으로 정하는 방법’이란 … 추가 정보에 대한 접근을 통제하는 방법” / “가명처리 전 개인신용정보와 가명정보의 분리에 관한 사항” |
| 감독규정 별표 8: 추가정보는 분리 저장소에 암호화 저장, 접근권한 분리 | law.go.kr PDF 본문 [\[15\]](https://www.law.go.kr/flDownload.do?bylClsCd=200201&flNm=%5B%EB%B3%84%ED%91%9C+8%5D+%EA%B0%80%EB%AA%85%EC%A0%95%EB%B3%B4%EC%97%90+%EA%B4%80%ED%95%9C+%EB%B3%B4%ED%98%B8%EC%A1%B0%EC%B9%98+%EA%B8%B0%EC%A4%80%28%EC%A0%9C43%EC%A1%B0%EC%9D%987+%EA%B4%80%EB%A0%A8%29&flSeq=148907803) | 법제처 국가법령정보센터, 신용정보업감독규정 별표 8, \[별표 8\] \<개정 2021.9.30., 2022.7.7.\>; 현행 게시 규정 \[시행 2025. 2. 5.\]는 별표 8 포함 [\[16\]](https://www.law.go.kr/admRulBylInfoPLinkR.do?admRulNm=%EC%8B%A0%EC%9A%A9%EC%A0%95%EB%B3%B4%EC%97%85%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&bylBrNo=00&bylCls=BF&bylNo=0017) | 1차 | “추가정보를 가명정보와 분리된 저장소에 암호화하여 저장” / “가명정보를 취급하는 직원이 추가정보에 접근할 수 있는 권한을 부여하지 않아야” |
| 감독규정 별표 8: 가명처리 전 정보와 가명정보 분리 저장, 기록 3년 이상 | law.go.kr PDF 본문 [\[15\]](https://www.law.go.kr/flDownload.do?bylClsCd=200201&flNm=%5B%EB%B3%84%ED%91%9C+8%5D+%EA%B0%80%EB%AA%85%EC%A0%95%EB%B3%B4%EC%97%90+%EA%B4%80%ED%95%9C+%EB%B3%B4%ED%98%B8%EC%A1%B0%EC%B9%98+%EA%B8%B0%EC%A4%80%28%EC%A0%9C43%EC%A1%B0%EC%9D%987+%EA%B4%80%EB%A0%A8%29&flSeq=148907803) | 법제처 국가법령정보센터, 신용정보업감독규정 별표 8 | 1차 | “가명처리전 개인신용정보와 가명처리한 개인신용정보를 분리하여 저장” / “가명정보 처리 시 … 처리 목적, 처리 방법, 처리 일시를 기록하여 … 3년 이상 보관” |
| PIPA §28조의2 | law.go.kr 조문정보 [\[17\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=02&joNo=0028&lsiSeq=270351&urlMode=lsScJoRltInfoR) | 법제처 국가법령정보센터, 개인정보 보호법 \[시행 2025. 10. 2.\] | 1차 | “① 개인정보처리자는 통계작성, 과학적 연구, 공익적 기록보존 등을 위하여 정보주체의 동의 없이 가명정보를 처리할 수 있다. ② … 제3자에게 제공하는 경우에는 특정 개인을 알아보기 위하여 사용될 수 있는 정보를 포함해서는 아니 된다.” |
| PIPA §28조의3 | law.go.kr 조문정보 [\[18\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=03&joNo=0028&lsiSeq=270351&urlMode=lsScJoRltInfoR) | 법제처 국가법령정보센터, 개인정보 보호법 \[시행 2025. 10. 2.\] | 1차 | “서로 다른 개인정보처리자 간의 가명정보의 결합은 … 지정하는 전문기관이 수행한다.” |
| PIPA §28조의4 현행 | law.go.kr 조문정보·현행 검색결과 [\[19\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=04&joNo=0028&lsiSeq=270351&urlMode=lsScJoRltInfoR) | 법제처 국가법령정보센터, 개인정보 보호법 \[시행 2025. 10. 2.\] | 1차 | “추가 정보를 별도로 분리하여 보관ㆍ관리하는 등 … 안전성 확보에 필요한 … 조치를 하여야 한다.” / “관련 기록을 작성하여 보관” |
| PIPA §28조의4 신설 당시 | law.go.kr 제정·개정문 [\[20\]](https://www.law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010102&lsId=011357) | 법제처 국가법령정보센터, 2020 시행본 \[시행 2020. 8. 5.\] | 1차 | “② 개인정보처리자는 가명정보를 처리하고자 하는 경우에는 … 관련 기록을 작성하여 보관하여야 한다.” |
| PIPA §28조의5 현행 | law.go.kr 현행 검색결과 [\[21\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=011357) | 법제처 국가법령정보센터, 개인정보 보호법 \[시행 2025. 10. 2.\] | 1차 | “① 제28조의2 또는 제28조의3에 따라 가명정보를 처리하는 자는 특정 개인을 알아보기 위한 목적으로 가명정보를 처리해서는 아니 된다.” |
| PIPA §28조의5 신설 당시 | law.go.kr 2020 시행본·제정문 [\[22\]](https://www.law.go.kr/LSW/lsInfoP.do?efYd=20200805&lsiSeq=213857) | 법제처 국가법령정보센터, \[시행 2020. 8. 5.\] | 1차 | “① 누구든지 특정 개인을 알아보기 위한 목적으로 가명정보를 처리해서는 아니 된다. ② … 즉시 해당 정보의 처리를 중지하고, 지체 없이 회수ㆍ파기하여야 한다.” |
| PIPA 시행령 제29조의5 | law.go.kr 시행령 조문정보·PDF snippet [\[23\]](https://www.law.go.kr/lumLsLinkPop.do?chrClsCd=010202&lspttninfSeq=159009) | 법제처 국가법령정보센터, 개인정보 보호법 시행령 \[시행 2026. 5. 19.\] | 1차 | “가명정보와 추가정보의 분리 보관” / “가명정보와 추가정보에 대한 접근 권한의 분리” / “가명정보 처리의 목적 … 관련 기록” |
| 신용정보법상 재식별 형사처벌 | law.go.kr 조문정보 [\[24\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0050&lsiSeq=260423&urlMode=lsScJoRltInfoR) | 법제처 국가법령정보센터, 신용정보법 \[시행 2024. 8. 14.\] | 1차 | “제40조의2제6항을 위반하여 … 가명정보를 처리한 자”는 “5년 이하의 징역 또는 5천만원 이하의 벌금” |
| 신용정보법상 가명정보 과태료 | law.go.kr 조문정보 [\[25\]](https://www.law.go.kr/LSW//lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1001140492) | 법제처 국가법령정보센터, 신용정보법 \[시행 2024. 8. 14.\] | 1차 | “제40조의2제1항 … 추가정보를 분리하여 보관하거나 삭제하지 아니한 자” / “제40조의2제2항 … 보안대책을 수립ㆍ시행하지 아니한 자” / “제40조의2제7항 … 처리를 중지하거나 정보를 즉시 삭제하지 아니한 자” |
| 신용정보법상 과징금 | law.go.kr 조문정보·연혁 및 FSC 설명자료 [\[26\]](https://www.law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000461405) | 법제처 국가법령정보센터; 금융위원회, 2019-11-28 | 1차 | “관련 매출액의 3퍼센트 이하” / “매출액이 없거나 … 산정이 곤란한 경우 … 200억원 이하” / FSC: “전체 매출액의 3% 이하의 과징금” |
| PIPA상 재식별 형사처벌 | law.go.kr 조문정보 [\[27\]](https://www.law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900079259) | 법제처 국가법령정보센터, 개인정보 보호법 \[시행 2025. 10. 2.\] | 1차 | “제28조의5제1항 … 특정 개인을 알아보기 위한 목적으로 가명정보를 처리한 자”는 “5년 이하의 징역 또는 5천만원 이하의 벌금” |
| PIPA상 가명정보 회수·파기 미이행 과태료 | law.go.kr 조문정보 [\[28\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0075&lsiSeq=270351&urlMode=lsScJoRltInfoR) | 법제처 국가법령정보센터, 개인정보 보호법 \[시행 2025. 10. 2.\] | 1차 | “제28조의5제2항 … 이용을 중지하지 아니하거나 이를 회수ㆍ파기하지 아니한 자” |
| PIPA상 전체 매출액 기준 과징금 | law.go.kr 조문정보·부과기준 고시 [\[29\]](https://law.go.kr/LSW//lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1020398647) | 법제처 국가법령정보센터; 개인정보위 과징금 부과기준; 시행령 개정이유 | 1차 | “전체 매출액의 100분의 3을 초과하지 아니하는 범위” / “전체 매출액에서 위반행위와 관련이 없는 매출액을 제외한 매출액” |
| 위탁과 제3자 제공 구분의 기본 규범 | law.go.kr 조문정보 [\[30\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0017&lsiSeq=260423&urlMode=lsScJoRltInfoR) | 법제처 국가법령정보센터, 신용정보법 \[시행 2024. 8. 14.\], PIPA \[시행 2025. 10. 2.\] | 1차 | “개인신용정보의 처리 위탁에 대해서는 「개인정보 보호법」 제26조 제1항부터 제3항까지의 규정을 준용” / “업무위탁에 따른 개인정보의 처리 제한” / “범위를 초과하여 제3자에게 제공하여서는 아니 된다” |
| 금융분야 공식 가이드 최신 확인 | 금융위 보도자료·금융보안원 게시 [\[31\]](https://www.fsc.go.kr/po010101/77193?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) | 금융위원회 2022-01-06; 금융보안원 데이터전문기관 포털 2022.1 수정게시 / 2022-02-21 게시 | 1차 | “금융분야 가명익명처리 안내서.pdf” / “개정본(금융위원회, 금융감독원) \[수정게시: 2022.1월\]” |
| 2026년 추가 개정 움직임 | 정부입법예고·개인정보위 보도자료 · FSC 자료 [\[32\]](https://opinion.lawmaking.go.kr/gcom/ogLmPp/86932?isOgYn=Y&pageIndex=2) | 정부입법예고 2026-06-01, 2026-03-16; 개인정보위 2024-03-06; 금융위 2025-11-10/2026 지원방향 | 1차 | “반복적이거나 중대한 개인정보 침해행위에 대해서는 … 최대 10%” / “자동화된 결정의 범위” / “금융분야 가명익명처리 안내서 개정 … 26.1분기중 완료” |

## 제재·과징금 사례표

| 처분일 | 대상 | 위반조항 | 금액 | 출처 URL |
|----|----|----|----|----|
| 2026-03-12 | 롯데카드 | 주민등록번호 처리 및 암호화 관련 PIPA 위반. 보도자료 문구상 “법적 근거 없이 주민등록번호를 처리” 및 “충분한 암호화를 적용하지 않은 행위”; 조문 체계상 **PIPA §24조의2 관련**으로 해석된다. 다만 보도자료 본문에 조문번호가 직접 적시되지는 않아 **조문번호 매칭은 해석기재**다. | 과징금 **96억 2,000만 원**, 과태료 **480만 원** | PIPC 보도자료 [\[33\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11878) |
| 2025-01-22 의결, 2025-01-23 보도 | 카카오페이·애플 | 국외이전 규정 위반. 보도자료 본문은 “보호법 상 국외이전 규정을 위반”이라고 적시하며, 현행 조문 체계상 **PIPA §28조의8 관련** 사안이다. 카카오페이는 동의 없는 이용자 정보 제공, 애플은 수탁자·국외이전 사실 미고지. | 카카오페이 **59억 6,800만 원**, 애플 **24억 500만 원 + 과태료 220만 원**, 총 **83억 7,520만 원** | PIPC 보도자료 [\[34\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=10955) |
| 2024-12-11 의결, 2024-12-12 보도 | 현대해상화재보험·악사손해보험·하나손해보험·엠지손해보험 | 적법한 동의 없는 수집·마케팅 이용, 미파기. 보도자료는 “적법한 동의 없이 개인정보를 수집해 마케팅에 활용” 및 미파기 사실을 적시하나 조문번호는 직접 적시하지 않는다. 조문 체계상 **PIPA §§15, 22, 21 관련**으로 해석되지만 **직접 조문 표시는 미공개**다. | 4개사 합산 과징금 **92억 770만 원** | PIPC 보도자료 [\[35\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=10853) |
| 2024-12-11 의결, 2024-12-12 보도 | 롯데손해보험 | 보험료 계산 중단·미가입자 정보 1년 초과 보유. 보도자료상 미파기 관련. 조문 체계상 **PIPA §21 관련**으로 해석되나 **직접 조문 표시는 미공개**다. | 과태료 **540만 원** | PIPC 보도자료 [\[35\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=10853) |

사례 해석상 주의할 점이 있다. 위 표의 금액과 사실관계는 모두 공식 보도자료로 확인되지만, **일부 사건의 위반조문 번호는 보도자료의 사실 서술을 현행 조문 체계와 대조해 매칭한 것**이다. 특히 롯데카드, 보험사 사건은 보도자료상 조문번호가 직접 표기되지 않아, **금액은 1차 확인, 조문번호는 해석기재**로 보는 것이 안전하다. 또한 이번 조사 범위에서 **신용정보법 §40조의2 자체를 정면 위반사유로 내세운 공개 제재 사례**는 확인하지 못했다. [\[36\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11878)

## 제품 적용 시사점

은행의 **PII 비반출 아키텍처**를 법적으로 가장 잘 설명하는 문장은 다음과 같다. **“원본 개인신용정보는 은행 내부에서만 유지하고, 외부 LLM에는 가명·토큰화된 최소정보만 라우팅하며, 추가정보는 별도 분리·암호화·접근통제 하에 보관하고, 출력 단계에서 재식별 위험을 탐지·차단하며, 전 과정의 처리기록을 3년 이상 보존하는 구조”**라는 설명이다. 이 문장은 신용정보법 §3조의2, §40조의2①②⑥⑦⑧, 시행령, 감독규정 별표 8, 그리고 PIPA §28조의2~5 및 시행령 제29조의5를 거의 그대로 제품 언어로 옮긴 것이다. [\[37\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540)

### 데이터 등급제

데이터 등급제의 법적 출발점은 **“무엇이 개인신용정보인가, 무엇이 가명정보인가, 어느 법을 우선 적용하는가”를 체계적으로 구분하는 것**이다. 신용정보법 제3조의2 때문에 은행권에서는 먼저 **신용정보법상 개인신용정보·가명정보 규율**을 적용하고, 그 다음 PIPA를 보충 적용해야 한다. 따라서 데이터 분류 체계는 최소한 **원본 개인신용정보 / 가명정보 / 익명정보 / AI 입력 불가 데이터 / AI 입력 가능 데이터**를 나눠야 하고, 분류 기준에는 신용정보법 제2조의 “개인신용정보”, “가명처리”, “가명정보” 정의와 §40조의2 행위규칙을 직접 연결해 두는 편이 좋다. [\[38\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540)

### 토큰화와 키 분리보관

여기가 제품 차별점의 핵심이다. **“토큰↔원본 키 분리보관”은 보안 모범사례가 아니라 법상 요구되는 통제다.** 신용정보법 §40조의2①은 추가정보의 분리보관 또는 삭제를 요구하고, 시행령은 추가정보 접근통제를, 감독규정 별표 8은 **분리된 저장소, 암호화 저장, 접근권한 분리, 일시 접근 시 사전승인 및 기록 보관**을 구체화한다. PIPA 시행령 제29조의5도 **가명정보와 추가정보의 분리보관·접근권한 분리**를 명시한다. 따라서 제품 문구를 “키 매니지먼트 강화” 수준에서 끝내지 말고, **‘신용정보법 §40조의2①②⑧ + PIPA §28조의4 및 시행령 제29조의5를 충족하는 분리보관형 토큰화’**라고 직접 말할 수 있다. [\[39\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540)

### 모델 라우팅

모델 라우팅은 법적으로 **“외부 LLM에 무엇까지 나갈 수 있는가”를 정하는 게이트**다. 신용정보법상 가명처리는 추가정보를 분리보관한 상태에서만 성립하므로, 외부 프런티어 LLM 라우트에는 **원본 개인식별자·계좌식별자·주민번호·연락처, 그리고 추가정보 재결합 키가 절대 포함되어선 안 된다.** 나아가 외부 LLM 사업자가 입력 데이터를 **자체 목적(예: 재학습, 프로파일링, 재판매)**으로 쓰면 위탁이 아니라 사실상 독립 이용·제공 문제로 번질 수 있으므로, 은행은 외부 API 사용을 **처리위탁 계약 + 목적 외 사용 금지 + 재위탁 통제 + 로그감사 가능성** 구조로 설계해야 한다. 신용정보법 제17조는 개인신용정보 처리위탁에 대해 PIPA 제26조 제1항부터 제3항을 준용하므로, **라우팅 제어는 단순 엔지니어링 이슈가 아니라 위탁법제 준수 장치**다. [\[40\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0017&lsiSeq=260423&urlMode=lsScJoRltInfoR)

이 문맥에서 외부 LLM 전송이 곧바로 불법이라고 볼 수는 없다. PIPC의 2025 생성형 AI 안내 보도자료는 **ChatGPT 등 상용 LLM 서비스를 활용하는 사업자**를 안내서 적용대상 예시로 들고 있다. 다만 이는 “무조건 전송 가능”이 아니라, **생애주기 단계별 안전조치와 맥락별 법적 기준을 점검하라**는 의미다. 따라서 은행이 외부 LLM을 쓰려면 **원본 PII는 내부 한정, 외부에는 가명·토큰화 데이터만, 추가정보는 내부 관리, 재식별 가능성 증가 시 즉시 중단·회수·삭제, 출력 검열 로그 유지**라는 구조가 필수다. [\[41\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11410)

### 반출 스캔과 출력 차단

반출 스캔은 법적으로 **재식별 금지 의무의 실시간 통제장치**다. 신용정보법 §40조의2⑦은 특정 개인을 알아볼 수 있게 된 경우 즉시 회수·처리중지·삭제를 요구하고, PIPA §28조의5②도 식별 가능 정보 생성 시 즉시 처리중지·회수·파기를 요구한다. 따라서 LLM 출력 전후에 **주민번호 패턴, 주소 조합, 거래식별자, 희소 속성 조합, 준식별자 조합에 의한 단일화 위험**을 스캔하는 것은 단순 DLP가 아니라, **법상 사후의무를 사전·동시적으로 이행하는 장치**라고 설명할 수 있다. 감독규정 별표 8이 “가명정보의 목적 외 활용 방지 및 재식별 방지 대책”과 “재식별 가능성을 발견한 경우 처리중단 및 파기 요청”을 요구한다는 점도 같은 방향이다. [\[42\]](https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=001540&lsRvsGubun=all)

### 감사원장

감사원장은 기록 보존과 사후 소명 능력의 문제다. 신용정보법 §40조의2⑧은 가명처리·익명처리 조치 기록을 **3년간 보존**하라고 하고, 감독규정 별표 8은 **접근자의 신원, 관리책임자의 신원, 접근일시, 대상정보, 사유, 용도**를 3년 이상 보관하게 하며, **가명정보 처리 목적·방법·일시**도 가명정보 파기 후 3년 이상 남기게 한다. PIPA도 현행 §28조의4와 시행령 제29조의5에서 **가명정보 처리 목적, 항목, 기간, 제공 시 제공받는 자 등 기록 항목**을 보관하도록 한다. 즉, 제품의 감사원장은 “누가 어떤 프롬프트를 만들었는가” 수준이 아니라, **어떤 데이터가 어떤 가명처리 규칙과 어떤 외부모델 라우트, 어떤 승인, 어떤 스캔 결과를 거쳐 나갔는지**를 법적 증빙 형식으로 남겨야 한다. [\[43\]](https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=001540&lsRvsGubun=all)

### 제품 차별점 문장으로 바로 쓸 수 있는 표현

- **“토큰↔원본 키 분리보관”**: “신용정보법 §40조의2①②⑧과 PIPA §28조의4·시행령 제29조의5에 맞춰, 토큰화 추가정보를 원본 업무데이터와 분리된 암호화 저장소에 보관하고 접근권한을 분리·기록하는 구조를 채택했다.” [\[44\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540)

- **“재식별 금지”**: “신용정보법 §40조의2⑥⑦과 PIPA §28조의5에 따라, 외부 LLM 출력이 특정 개인 재식별 위험을 높이면 즉시 처리중단·회수·삭제가 가능하도록 반출 스캔과 비상 차단 절차를 내장했다.” [\[3\]](https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=001540&lsRvsGubun=all)

- **“외부 LLM 비반출”**: “신용정보법 제3조의2에 따라 금융권 신용정보 특례를 우선 적용해, 원본 PII·신용정보는 외부 모델로 반출하지 않고 은행 내부에서만 보유하며, 외부 모델에는 가명·토큰화된 최소 정보만 위탁 처리 범위 안에서 라우팅한다.” [\[45\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540)

## 확장 논점

### 외부 LLM 전송이 가명정보 처리로 적법 포섭되는지

법적으로는 **가능할 수 있으나, 조건부**다. 신용정보법의 “가명처리” 정의는 “추가정보를 사용하지 아니하고는 특정 개인을 알아볼 수 없도록 … 처리”하면서, 그 전제로 제40조의2에 따라 **추가정보를 분리보관**한 경우를 포함한다고 본다. 따라서 은행이 고객 원본 PII를 토큰화·대체하고, 토큰↔원본 맵은 은행 내부 HSM/별도 저장소에만 보관하며, 외부 LLM 사업자는 해당 추가정보에 접근할 수 없고, 목적 외 사용도 계약상 금지된다면, 외부로 나가는 데이터는 **원칙적으로 가명정보로 평가될 여지**가 있다. [\[46\]](https://www.law.go.kr/LSW//lsLawLinkInfo.do?chrClsCd=010202&lsId=001540&lsJoLnkSeq=900370822&print=print)

하지만 **LLM의 추론력 자체가 재식별 위험을 없애주지는 않는다.** 오히려 외부 모델 사업자가 보유한 다른 데이터, 인터넷 공개정보, 희소 속성 조합, 문맥 정보와 결합할 때 특정 개인이 추정될 수 있다면, 실질적으로는 “다른 정보와 쉽게 결합”하거나 “특정 개인을 알아볼 수 있게” 되는 문제로 돌아온다. PIPC의 가명정보 가이드라인 예시는 **재식별되거나 재식별 가능성이 현저하게 높아지는 상황이 발생하면 즉시 처리중단, 회수·파기, 통지**를 요구하는 운영모델을 제시하고 있고, 학설도 적정 가명처리 수준의 판단은 **동태적·맥락 의존적**이라고 본다. 따라서 외부 LLM 사용 여부는 **형식적 토큰화 여부만이 아니라, 외부 사업자가 접근 가능한 보조정보 환경과 출력 단계 위험까지 포함해 판단**해야 한다. [\[47\]](https://www.privacy.go.kr/cmm/fms/FileDown.do?atchFileId=FILE_000000000843428&fileSn=0)

PIPC의 2025 생성형 AI 안내는 특히 실무적으로 중요하다. 이 보도자료는 **“ChatGPT 등 상용 대규모언어모델(LLM) 서비스를 활용”**하는 사업자를 적용 예시로 들면서, 생성형 AI 활용을 **서비스형 LLM 활용, 기성 LLM 활용, 자체개발** 등 유형으로 구분하고 최소한의 안전조치를 제시하겠다고 밝혔다. 이는 곧 금융권에서도 “외부 LLM 사용” 자체가 금지어는 아니지만, **데이터 입력 유형별·수명주기별 통제체계**가 있어야 한다는 의미로 읽힌다. [\[48\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11410)

### 위탁과 제3자 제공의 구분

은행이 외부 AI 서비스를 사용할 때, 사업자가 **은행 지시에 따라 처리만 하고 독자 목적을 가지지 않으며**, 결과물도 은행을 위해서만 생성하고, 자기 모델 학습·재활용·재판매를 하지 않는다면 구조는 대체로 **처리위탁** 쪽으로 정리된다. 이때 신용정보법 제17조가 개인신용정보 처리위탁에 관해 PIPA 제26조 제1항부터 제3항을 준용하므로, 계약서에는 **목적 외 처리 금지, 기술적·관리적 보호조치, 재위탁 조건, 관리·감독, 수탁자 공개**가 들어가야 한다. 반대로 외부 사업자가 데이터를 자기 목적에 쓰거나 독자적 모델 고도화에 사용하면 **제3자 제공 또는 별도 처리자 구조**로 위험이 커진다. [\[30\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0017&lsiSeq=260423&urlMode=lsScJoRltInfoR)

국외 클라우드·국외 AI API를 쓰는 경우에는 이 위탁 논점에 더해 **PIPA 국외이전 규율**이 추가된다. 카카오페이·애플 사건은 국외이전·수탁자 통지·동의 문제에서 실제 거액 과징금이 부과될 수 있음을 보여준다. 따라서 은행이 해외 LLM API를 쓴다면 **“가명정보이므로 괜찮다”는 한 줄로는 부족하고**, 국외이전 통지·근거, 위수탁 구조, 하위 수탁자, 기술·관리 보호조치까지 별도 점검해야 한다. [\[49\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=10955)

### 마이데이터와 자동화된 결정

마이데이터 자체가 이번 아키텍처의 직접 근거는 아니지만, **전송요구권·자동화된 결정 설명요구권 강화 흐름**은 은행 AI 아키텍처 설계에 영향을 준다. 개인정보위는 2025년 본인전송요구권을 전 분야로 확대하는 시행령 개정을 발표했고, 2024년에는 자동화된 결정의 범위와 설명·검토 요구 기준을 해설했다. 은행이 외부 LLM을 의사결정 보조나 자동화평가에 엮을수록, 단순 보안통제뿐 아니라 **설명 가능성, 인간 개입, 데이터 계보 추적** 요건이 더 중요해진다. [\[50\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11294)

### 공식 가이드라인 최신성

금융분야 공식 가이드라인으로 확인된 최신 **실제 게시본**은 금융위원회 보도자료 및 금융보안원 데이터전문기관 포털에 게시된 **「금융분야 가명·익명처리 안내서」 개정본(2022.1.)**이다. 2026년 금융데이터 결합 활용 지원방향 자료에는 **“금융분야 가명익명처리 안내서 개정 … 26.1분기중 완료”**라고 적혀 있으나, 이번 조사 범위에서는 2026년판 별도 공개본을 공식 게시물로 확인하지 못했다. 따라서 2026-06-29 현재 실무 레퍼런스는 **2022.1 게시본 + 2026 정책자료상 개정 예고**로 보는 것이 타당하다. [\[51\]](https://www.fsc.go.kr/po010101/77193?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=)

## 갭 / \[미검증\]

- **신용정보법 §40조의2의 현행 ①②⑥⑦⑧ 전문은 law.go.kr 현행 검색결과와 law.go.kr 제정·개정문(2020 신설본)을 대조해 확인**했지만, 국가법령정보센터의 비자바스크립트 렌더링 한계 때문에 현행 본문 페이지에서 각 항 전문이 한 화면에 완전 노출되지는 않았다. 다만 현행 시행일은 \[시행 2024. 8. 14.\]로, **이번 조사에서 확인된 범위 내에서는 해당 항들의 후속 개정 흔적은 찾지 못했다.** 엄격한 문서감사 목적이라면 내부 법무가 law.go.kr 원문 다운로드본(HWP/PDF)으로 한 번 더 스냅샷 보관하는 것이 좋다. [\[52\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540)

- **PIPA §28조의5의 정확한 문언 변경 시점**은 law.go.kr 2020 시행본과 현행본의 비교로 변화 자체는 확인했지만, 이번 조사에서는 **변경을 일으킨 정확한 공포번호·시행일을 article-level로 추가 특정하지 못했다.** 따라서 “2020 신설 당시 ‘누구든지’ → 현행 ‘제28조의2 또는 제28조의3에 따라 가명정보를 처리하는 자’”라는 사실은 확인되지만, **정확한 개정 시점 표기는 \[부분 미검증\]**으로 두는 것이 안전하다. [\[4\]](https://www.law.go.kr/LSW/lsInfoP.do?efYd=20200805&lsiSeq=213857)

- **사례표의 위반조항 번호는 일부 해석기재**다. 롯데카드, 4개 보험사, 롯데손해보험 사건은 공식 보도자료에서 사실관계와 금액은 확인되지만, 조문번호가 본문에 직접 찍혀 있지 않았다. 따라서 표의 조문번호는 **사실관계를 현행 PIPA 구조에 대입한 해석**이고, **의결서 원문이나 처분서 사본 확보가 추가로 필요**하다. [\[53\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11878)

- **신용정보법 §40조의2 가명정보 재식별 위반에 대한 공개 제재 사례**는 이번 조사에서 찾지 못했다. 공개적으로 확인된 금융권 제재는 주로 주민등록번호 처리, 암호화 미흡, 동의 없는 마케팅 활용, 국외이전 같은 PIPA 집행사례였다. 따라서 “가명정보 재식별 규범의 실제 집행 강도”를 입증하려면 개인정보위 의결서·금융위 의사록·금감원 검사결과 문서에 대한 추가 열람이 필요하다. \[미검증\] [\[8\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11878)

- **2026년 금융분야 가명·익명처리 안내서 개정본**은 정책자료상 예고는 확인했으나, 2026-06-29 기준으로 금융위·금감원·금융보안원 공식 게시에서 별도 최신 PDF를 확인하지 못했다. 따라서 “최신 공식 가이드라인”은 **현재 공개본 기준 2022.1**로 적는 것이 맞고, “2026 개정본 존재”는 \[미검증\] 처리하는 것이 안전하다. [\[54\]](https://www.fsc.go.kr/comm/getFile?fileNo=12&fileTy=ATTACH&srvcId=BBSTY1&upperNo=85908)

- **외부 LLM 추론에 의한 재식별 위험에 관한 직접 심결례**는 찾지 못했다. 이번 보고서의 관련 평가는 법문, PIPC 가이드, 생성형 AI 안내, 일반 학설을 종합한 것으로, **“LLM 추론 재식별”을 직접 판단한 금융권 공개 심결례는 \[미검증\]**이다. [\[55\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11410)

------------------------------------------------------------------------

[\[1\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540) [\[10\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540) [\[12\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540) [\[37\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540) [\[38\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540) [\[39\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540) [\[44\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540) [\[45\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540) [\[52\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540) https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540

<https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=001540>

[\[2\]](https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=001540&lsRvsGubun=all) [\[3\]](https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=001540&lsRvsGubun=all) [\[13\]](https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=001540&lsRvsGubun=all) [\[42\]](https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=001540&lsRvsGubun=all) [\[43\]](https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=001540&lsRvsGubun=all) https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=001540&lsRvsGubun=all

<https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=001540&lsRvsGubun=all>

[\[4\]](https://www.law.go.kr/LSW/lsInfoP.do?efYd=20200805&lsiSeq=213857) [\[22\]](https://www.law.go.kr/LSW/lsInfoP.do?efYd=20200805&lsiSeq=213857) https://www.law.go.kr/LSW/lsInfoP.do?efYd=20200805&lsiSeq=213857

<https://www.law.go.kr/LSW/lsInfoP.do?efYd=20200805&lsiSeq=213857>

[\[5\]](https://www.law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010102&lsId=011357) [\[20\]](https://www.law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010102&lsId=011357) https://www.law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010102&lsId=011357

<https://www.law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010102&lsId=011357>

[\[6\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0050&lsiSeq=260423&urlMode=lsScJoRltInfoR) [\[24\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0050&lsiSeq=260423&urlMode=lsScJoRltInfoR) https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0050&lsiSeq=260423&urlMode=lsScJoRltInfoR

<https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0050&lsiSeq=260423&urlMode=lsScJoRltInfoR>

[\[7\]](https://law.go.kr/LSW//lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1020398647) [\[29\]](https://law.go.kr/LSW//lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1020398647) https://law.go.kr/LSW//lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1020398647

<https://law.go.kr/LSW//lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1020398647>

[\[8\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11878) [\[33\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11878) [\[36\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11878) [\[53\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11878) https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11878

<https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11878>

[\[9\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0002&lsiSeq=260423&urlMode=lsScJoRltInfoR) https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0002&lsiSeq=260423&urlMode=lsScJoRltInfoR

<https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0002&lsiSeq=260423&urlMode=lsScJoRltInfoR>

[\[11\]](https://www.law.go.kr/LSW//lsLawLinkInfo.do?chrClsCd=010202&lsId=001540&lsJoLnkSeq=900370822&print=print) [\[46\]](https://www.law.go.kr/LSW//lsLawLinkInfo.do?chrClsCd=010202&lsId=001540&lsJoLnkSeq=900370822&print=print) https://www.law.go.kr/LSW//lsLawLinkInfo.do?chrClsCd=010202&lsId=001540&lsJoLnkSeq=900370822&print=print

<https://www.law.go.kr/LSW//lsLawLinkInfo.do?chrClsCd=010202&lsId=001540&lsJoLnkSeq=900370822&print=print>

[\[14\]](https://law.go.kr/LSW/lsInfoP.do?lsiSeq=283179) https://law.go.kr/LSW/lsInfoP.do?lsiSeq=283179

<https://law.go.kr/LSW/lsInfoP.do?lsiSeq=283179>

[\[15\]](https://www.law.go.kr/flDownload.do?bylClsCd=200201&flNm=%5B%EB%B3%84%ED%91%9C+8%5D+%EA%B0%80%EB%AA%85%EC%A0%95%EB%B3%B4%EC%97%90+%EA%B4%80%ED%95%9C+%EB%B3%B4%ED%98%B8%EC%A1%B0%EC%B9%98+%EA%B8%B0%EC%A4%80%28%EC%A0%9C43%EC%A1%B0%EC%9D%987+%EA%B4%80%EB%A0%A8%29&flSeq=148907803) https://www.law.go.kr/flDownload.do?bylClsCd=200201&flNm=%5B%EB%B3%84%ED%91%9C+8%5D+%EA%B0%80%EB%AA%85%EC%A0%95%EB%B3%B4%EC%97%90+%EA%B4%80%ED%95%9C+%EB%B3%B4%ED%98%B8%EC%A1%B0%EC%B9%98+%EA%B8%B0%EC%A4%80%28%EC%A0%9C43%EC%A1%B0%EC%9D%987+%EA%B4%80%EB%A0%A8%29&flSeq=148907803

<https://www.law.go.kr/flDownload.do?bylClsCd=200201&flNm=%5B%EB%B3%84%ED%91%9C+8%5D+%EA%B0%80%EB%AA%85%EC%A0%95%EB%B3%B4%EC%97%90+%EA%B4%80%ED%95%9C+%EB%B3%B4%ED%98%B8%EC%A1%B0%EC%B9%98+%EA%B8%B0%EC%A4%80%28%EC%A0%9C43%EC%A1%B0%EC%9D%987+%EA%B4%80%EB%A0%A8%29&flSeq=148907803>

[\[16\]](https://www.law.go.kr/admRulBylInfoPLinkR.do?admRulNm=%EC%8B%A0%EC%9A%A9%EC%A0%95%EB%B3%B4%EC%97%85%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&bylBrNo=00&bylCls=BF&bylNo=0017) https://www.law.go.kr/admRulBylInfoPLinkR.do?admRulNm=%EC%8B%A0%EC%9A%A9%EC%A0%95%EB%B3%B4%EC%97%85%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&bylBrNo=00&bylCls=BF&bylNo=0017

<https://www.law.go.kr/admRulBylInfoPLinkR.do?admRulNm=%EC%8B%A0%EC%9A%A9%EC%A0%95%EB%B3%B4%EC%97%85%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&bylBrNo=00&bylCls=BF&bylNo=0017>

[\[17\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=02&joNo=0028&lsiSeq=270351&urlMode=lsScJoRltInfoR) https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=02&joNo=0028&lsiSeq=270351&urlMode=lsScJoRltInfoR

<https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=02&joNo=0028&lsiSeq=270351&urlMode=lsScJoRltInfoR>

[\[18\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=03&joNo=0028&lsiSeq=270351&urlMode=lsScJoRltInfoR) https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=03&joNo=0028&lsiSeq=270351&urlMode=lsScJoRltInfoR

<https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=03&joNo=0028&lsiSeq=270351&urlMode=lsScJoRltInfoR>

[\[19\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=04&joNo=0028&lsiSeq=270351&urlMode=lsScJoRltInfoR) https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=04&joNo=0028&lsiSeq=270351&urlMode=lsScJoRltInfoR

<https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=04&joNo=0028&lsiSeq=270351&urlMode=lsScJoRltInfoR>

[\[21\]](https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=011357) https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=011357

<https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=011357>

[\[23\]](https://www.law.go.kr/lumLsLinkPop.do?chrClsCd=010202&lspttninfSeq=159009) https://www.law.go.kr/lumLsLinkPop.do?chrClsCd=010202&lspttninfSeq=159009

<https://www.law.go.kr/lumLsLinkPop.do?chrClsCd=010202&lspttninfSeq=159009>

[\[25\]](https://www.law.go.kr/LSW//lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1001140492) https://www.law.go.kr/LSW//lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1001140492

<https://www.law.go.kr/LSW//lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1001140492>

[\[26\]](https://www.law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000461405) https://www.law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000461405

<https://www.law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000461405>

[\[27\]](https://www.law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900079259) https://www.law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900079259

<https://www.law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900079259>

[\[28\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0075&lsiSeq=270351&urlMode=lsScJoRltInfoR) https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0075&lsiSeq=270351&urlMode=lsScJoRltInfoR

<https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0075&lsiSeq=270351&urlMode=lsScJoRltInfoR>

[\[30\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0017&lsiSeq=260423&urlMode=lsScJoRltInfoR) [\[40\]](https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0017&lsiSeq=260423&urlMode=lsScJoRltInfoR) https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0017&lsiSeq=260423&urlMode=lsScJoRltInfoR

<https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0017&lsiSeq=260423&urlMode=lsScJoRltInfoR>

[\[31\]](https://www.fsc.go.kr/po010101/77193?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) [\[51\]](https://www.fsc.go.kr/po010101/77193?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) https://www.fsc.go.kr/po010101/77193?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=

<https://www.fsc.go.kr/po010101/77193?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=>

[\[32\]](https://opinion.lawmaking.go.kr/gcom/ogLmPp/86932?isOgYn=Y&pageIndex=2) https://opinion.lawmaking.go.kr/gcom/ogLmPp/86932?isOgYn=Y&pageIndex=2

<https://opinion.lawmaking.go.kr/gcom/ogLmPp/86932?isOgYn=Y&pageIndex=2>

[\[34\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=10955) [\[49\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=10955) https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=10955

<https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=10955>

[\[35\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=10853) https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=10853

<https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=10853>

[\[41\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11410) [\[48\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11410) [\[55\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11410) https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11410

<https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11410>

[\[47\]](https://www.privacy.go.kr/cmm/fms/FileDown.do?atchFileId=FILE_000000000843428&fileSn=0) https://www.privacy.go.kr/cmm/fms/FileDown.do?atchFileId=FILE_000000000843428&fileSn=0

<https://www.privacy.go.kr/cmm/fms/FileDown.do?atchFileId=FILE_000000000843428&fileSn=0>

[\[50\]](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11294) https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11294

<https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=11294>

[\[54\]](https://www.fsc.go.kr/comm/getFile?fileNo=12&fileTy=ATTACH&srvcId=BBSTY1&upperNo=85908) https://www.fsc.go.kr/comm/getFile?fileNo=12&fileTy=ATTACH&srvcId=BBSTY1&upperNo=85908

<https://www.fsc.go.kr/comm/getFile?fileNo=12&fileTy=ATTACH&srvcId=BBSTY1&upperNo=85908>
