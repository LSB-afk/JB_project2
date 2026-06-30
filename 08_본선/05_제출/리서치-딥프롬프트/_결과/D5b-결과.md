> 원본 파일: `D5b. 20260630_금융권_AI_클라우드_활용.docx`
> 회수 2026-06-30 · ⚠️ 대외비 · 엔진 산출 원문(가공 최소)

---

# 한국 금융권 망분리 규제 하에서 외부 생성형 AI와 클라우드의 합법적 활용 경로

## 핵심 발견

- **현행 기본 규칙은 여전히 “망분리 유지”다.** 전자금융감독규정 현행본은 `[시행 2026. 2. 13.]`이며, 제15조제1항제3호는 내부 업무용 시스템의 외부통신망 분리·차단 및 접속 금지를, 제15조제1항제5호는 전산실·재해복구센터·보호구역과 “개발·운영·보안” 단말기의 물리적 분리를 요구한다. 즉, 기본법제는 아직 **물리·논리 분리 의무를 원칙으로 유지**한다. **\[1차\]** [\[1\]](https://www.law.go.kr/LSW//admRulSideInfoP.do?admRulSeq=2100000274812&chrClsCd=010201&dashNo=&docCls=jo&joBrNo=00&joNo=0015&urlMode=admRulScJoRltInfoR)

- **그렇지만 2024년 8월 13일 로드맵 이후, “예외와 단계적 제도화”를 통해 외부 생성형 AI·클라우드를 쓰는 길이 열렸다.** 금융위원회는 로드맵에서 생성형 AI는 샌드박스로 인터넷 활용 제한에 대한 특례를 허용하고, SaaS는 이용 범위를 확대하며, 연구·개발 환경은 전자금융감독규정 개정으로 완화하겠다고 밝혔다. **\[1차\]** [\[2\]](https://www.fsc.go.kr/no010101/82885)

- **실제 허용은 말뿐이 아니라 집행으로 이어졌다.** 2024년 11월 금융위는 생성형 AI를 활용한 9개 금융회사의 10개 혁신금융서비스를 첫 지정했고, 2024년 12월에는 다수 금융회사에 대해 “클라우드를 활용한 생성형 AI의 내부망 이용” 및 “내부 업무용 단말기에서 SaaS 및 생성형 AI 이용”을 추가 지정했다. 즉, **“외부 LLM을 금융권이 쓰는 것”은 이미 샌드박스 경로로 현실화**되었다. **\[1차\]** [\[3\]](https://www.fsc.go.kr/no010101/83554?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=.&srchKey=&srchText=)

- **2026년 4월 20일부터는 내부업무망 SaaS가 일부 정규 제도화되었다.** 금융위·금감원은 시행세칙 개정으로 내부 업무망에서도 SaaS를 활용할 경우 일정 보안규율 준수를 전제로 망분리 예외를 허용한다고 발표했다. 다만 **고유식별정보나 개인신용정보를 처리하는 경우에는 이 일반예외가 적용되지 않고**, 가명정보는 여전히 별도 혁신금융서비스 절차가 필요하다고 못 박았다. **\[1차+교차\]** [\[4\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=)

- **따라서 질문의 설계인 “외부 프런티어 LLM을 쓰되 고객 PII는 외부로 내보내지 않는다”는 구조는 정책적으로 가장 정합적인 허용 경로에 가깝다.** 특히 외부 LLM이 **SaaS 형태**이고, 외부로 나가는 프롬프트·컨텍스트에서 **고유식별정보·개인신용정보를 제거**하며, 금융회사 내부에서 보안통제·평가·위원회 보고를 이행하는 경우, 2026년 제도화된 SaaS 예외와 2024~2026 AI 허용정책의 취지에 부합한다. 다만 **가명정보라도 외부 LLM에 보내려면 현재 공개근거상 샌드박스 경로가 더 안전한 해석**이다. 이는 규정문 자체라기보다 정책문서들을 종합한 **규범적 추론**이다. **\[1차+추론\]** [\[5\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=)

- **금융회사의 책임은 줄지 않았고 오히려 강화되는 방향이다.** 클라우드 이용은 제14조의2에서 금융회사가 클라우드 이용기준을 마련하고, 이용범위가 전자금융업무와 그에 필요한 정보처리·보안업무까지 포함될 수 있음을 전제로 한다. 로드맵은 중장기적으로 “자율보안-결과책임” 원칙, CEO·이사회 보고의무 강화, 제3자 리스크 관리 강화를 명시했다. **\[1차\]** [\[6\]](https://www.law.go.kr/admRulSc.do?menuId=5&query=%EC%A0%84%EC%9E%90%EA%B8%88%EC%9C%B5%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&subMenuId=41&tabMenuId=183)

- **앵커에 포함된 “MLS 다층보안체계”라는 용어는, 제가 직접 접속한 금융위 HTML 본문에서는 명시적으로 확인되지 않았다.** 대신 실제로 확인된 법·정책 언어는 “별도 보안대책”, “망분리 대체 정보보호통제”, “자율보안-결과책임”, “제3자 리스크 관리”였다. 따라서 **‘다층보안’은 정책 취지를 설명하는 요약어로는 가능하지만, 이번 조사에서 직접 확인된 공식 용어로 단정하긴 어렵다.** **\[1차 / 용어 직접확인 미흡\]** [\[7\]](https://www.law.go.kr/LSW//admRulInfoP.do?admRulSeq=2200000108281&chrClsCd=010201)

## 근거표

| 주장 | 출처 URL | 발행처·날짜·시행일 | 신뢰도 | 원문 짧은 인용 |
|----|----|----|----|----|
| 망분리 기본의무는 제15조제1항제3호에 남아 있다. [\[1\]](https://www.law.go.kr/LSW//admRulSideInfoP.do?admRulSeq=2100000274812&chrClsCd=010201&dashNo=&docCls=jo&joBrNo=00&joNo=0015&urlMode=admRulScJoRltInfoR) | `https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000254848` | 법제처 국가법령정보센터 · 전자금융감독규정 · 현행본 `[시행 2026. 2. 13.]` | 1차 | “분리·차단 및 접속 금지” [\[8\]](https://www.law.go.kr/LSW//admRulSideInfoP.do?admRulSeq=2100000274812&chrClsCd=010201&dashNo=&docCls=jo&joBrNo=00&joNo=0015&urlMode=admRulScJoRltInfoR) |
| 개발·운영·보안 단말의 물리 분리 의무도 유지된다. [\[8\]](https://www.law.go.kr/LSW//admRulSideInfoP.do?admRulSeq=2100000274812&chrClsCd=010201&dashNo=&docCls=jo&joBrNo=00&joNo=0015&urlMode=admRulScJoRltInfoR) | `https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000254848` | 법제처 · 현행 규정 · `[시행 2026. 2. 13.]` | 1차 | “물리적으로 분리할 것” [\[8\]](https://www.law.go.kr/LSW//admRulSideInfoP.do?admRulSeq=2100000274812&chrClsCd=010201&dashNo=&docCls=jo&joBrNo=00&joNo=0015&urlMode=admRulScJoRltInfoR) |
| 클라우드 이용 근거는 제14조의2에 있다. [\[9\]](https://www.law.go.kr/admRulSc.do?menuId=5&query=%EC%A0%84%EC%9E%90%EA%B8%88%EC%9C%B5%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&subMenuId=41&tabMenuId=183) | `https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000254848` | 법제처 · 전자금융감독규정 · 현행 규정 | 1차 | “클라우드컴퓨팅서비스를 이용하는 경우” [\[10\]](https://www.law.go.kr/admRulSc.do?menuId=5&query=%EC%A0%84%EC%9E%90%EA%B8%88%EC%9C%B5%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&subMenuId=41&tabMenuId=183) |
| 클라우드 이용 범위는 전자금융업무와 그에 필요한 정보처리·보안업무까지 포괄된다. [\[10\]](https://www.law.go.kr/admRulSc.do?menuId=5&query=%EC%A0%84%EC%9E%90%EA%B8%88%EC%9C%B5%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&subMenuId=41&tabMenuId=183) | `https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000254848` | 법제처 · 전자금융감독규정 제14조의2 | 1차 | “전자금융업무…정보보호 등 사무” [\[10\]](https://www.law.go.kr/admRulSc.do?menuId=5&query=%EC%A0%84%EC%9E%90%EA%B8%88%EC%9C%B5%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&subMenuId=41&tabMenuId=183) |
| 로드맵은 생성형 AI에 대해 샌드박스 특례를 예고했다. [\[11\]](https://www.fsc.go.kr/no010101/82885) | `https://www.fsc.go.kr/no010101/82885` | 금융위원회 · 2024-08-13 | 1차 | “규제 특례를 허용한다” [\[12\]](https://www.fsc.go.kr/no010101/82885) |
| 로드맵은 SaaS 범위를 보안관리·CRM·가명정보·모바일까지 넓히겠다고 밝혔다. [\[13\]](https://www.fsc.go.kr/no010101/82885) | `https://www.fsc.go.kr/no010101/82885` | 금융위원회 · 2024-08-13 | 1차 | “가명정보 처리 및 모바일 단말기” [\[14\]](https://www.fsc.go.kr/no010101/82885) |
| 1단계 샌드박스는 가명정보, 2단계는 개인신용정보 확대를 예고했다. [\[15\]](https://www.fsc.go.kr/no010101/82885) | `https://www.fsc.go.kr/no010101/82885` | 금융위원회 · 2024-08-13 | 1차 | “2단계 샌드박스에서는 개인신용정보” [\[14\]](https://www.fsc.go.kr/no010101/82885) |
| 생성형 AI 혁신서비스는 2024년 11월 첫 지정이 이뤄졌다. [\[16\]](https://www.fsc.go.kr/no010101/83554?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=.&srchKey=&srchText=) | `https://www.fsc.go.kr/no010101/83554` | 금융위원회 · 2024-12-09 | 1차 | “9개 금융회사 의 10개” [\[17\]](https://www.fsc.go.kr/no010101/83554?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=.&srchKey=&srchText=) |
| 내부망 생성형 AI·SaaS 이용은 2024년 12월 추가 지정되었다. [\[18\]](https://www.fsc.go.kr/no010101/83584?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) | `https://www.fsc.go.kr/no010101/83584` | 금융위원회 · 2024-12-11 | 1차 | “AWS Bedrock, AZURE OpenAI 등” [\[19\]](https://www.fsc.go.kr/no010101/83862?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) |
| 2026년 4월 20일부터 내부업무망 SaaS는 일정 범위에서 정규 예외가 되었다. [\[20\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) | `https://www.fsc.go.kr/no010101/86745` | 금융위원회·금감원 · 2026-04-20 · 시행 2026-04-20 | 1차 | “망분리 규제 예외를 허용” [\[21\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) |
| 그러나 고유식별정보·개인신용정보 처리에는 그 일반예외가 적용되지 않는다. [\[22\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) | `https://www.fsc.go.kr/no010101/86745` | 금융위원회·금감원 · 2026-04-20 | 1차 | “망분리 예외를 허용하지 않으며” [\[23\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) |
| 2025 개정 클라우드 가이드는 제14조의2에 따른 절차와 보안권고를 안내하는 문서다. [\[24\]](https://www.fsec.or.kr/bbs/detail?bbsNo=11691&menuNo=222) | `https://www.fsec.or.kr/bbs/detail?bbsNo=11691&menuNo=222` | 금융보안원 · 2025-05-22 · 규정 반영 시행 2025-02-05 | 1차 | “세부절차를 안내…보안사항을 권고” [\[25\]](https://www.fsec.or.kr/bbs/detail?bbsNo=11691&menuNo=222) |
| 2026 AI 가이드라인은 모든 금융회사의 AI 활용에 7대 원칙을 제시했다. [\[26\]](https://www.fsc.go.kr/po010101/87142?curPage=2&srchBeginDt=&srchCtgry=1&srchEndDt=&srchKey=&srchText=) | `https://www.fsc.go.kr/po010101/87142` | 금융위원회 · 2026-06-18 · 시행 2026-06-22 | 1차 | “거버넌스…합법성…보안성” [\[27\]](https://www.fsc.go.kr/po010101/87142?curPage=2&srchBeginDt=&srchCtgry=1&srchEndDt=&srchKey=&srchText=) |
| 생성형 AI 내부망 이용 시 혁신금융서비스 지정과 보안대책 이행을 전제로 본다는 공식 가이드 문구가 있다. [\[28\]](https://www.fsc.go.kr/comm/getFile?fileNo=6&fileTy=ATTACH&srvcId=BBSTY1&upperNo=87142) | `https://www.fsc.go.kr/comm/getFile?fileNo=6&fileTy=ATTACH&srvcId=BBSTY1&upperNo=87142` | 금융위원회 별첨 문서 검색 인덱스 · 2026-06 | 1차 | “혁신금융서비스 지정 시, 관련 보안대책” [\[28\]](https://www.fsc.go.kr/comm/getFile?fileNo=6&fileTy=ATTACH&srvcId=BBSTY1&upperNo=87142) |
| 로드맵 FAQ 검색 인덱스는 1단계 데이터 범위를 “가명처리된 개인(신용)정보”까지로 설명한다. [\[29\]](https://www.fsc.go.kr/comm/getFile?fileNo=4&fileTy=ATTACH&srvcId=BBSTY1&upperNo=82937) | `https://www.fsc.go.kr/comm/getFile?fileNo=4&fileTy=ATTACH&srvcId=BBSTY1&upperNo=82937` | 금융위원회 FAQ 검색 인덱스 · 2024-08경 | 1차 | “개인(신용)정보 불가 → 가명처리…허용” [\[29\]](https://www.fsc.go.kr/comm/getFile?fileNo=4&fileTy=ATTACH&srvcId=BBSTY1&upperNo=82937) |

## 허용 금지 매트릭스

| 행위 | 허용 상태 | 근거 정책·조문 | 전제조건 |
|----|----|----|----|
| 내부 업무망에서 외부 인터넷·클라우드에 직접 연결된 일반 업무시스템 운용 | **금지 원칙** [\[8\]](https://www.law.go.kr/LSW//admRulSideInfoP.do?admRulSeq=2100000274812&chrClsCd=010201&dashNo=&docCls=jo&joBrNo=00&joNo=0015&urlMode=admRulScJoRltInfoR) | 전자금융감독규정 제15조제1항제3호 | 내부통신망 연계 업무용 시스템은 외부통신망과 분리·차단되어야 한다. [\[8\]](https://www.law.go.kr/LSW//admRulSideInfoP.do?admRulSeq=2100000274812&chrClsCd=010201&dashNo=&docCls=jo&joBrNo=00&joNo=0015&urlMode=admRulScJoRltInfoR) |
| 외부 프런티어 LLM을 **SaaS 형태**로 내부업무망에서 사용하는 것 | **조건부 허용** [\[30\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) | 2026-04-20 시행세칙 개정 시행 보도자료 | SaaS여야 하고, FSEC 등 평가 SaaS 이용, 단말 보호대책, 반기 1회 평가, 정보보호위원회 보고가 필요하다. [\[30\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) |
| 위 SaaS형 외부 LLM에 **고유식별정보 또는 개인신용정보**를 보내는 것 | **금지** [\[22\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) | 2026-04-20 보도자료 | 일반 SaaS 예외 불가. 이 경로로는 사용할 수 없다고 금융위·금감원이 명시했다. [\[22\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) |
| 위 SaaS형 외부 LLM에 **가명정보**를 보내는 것 | **조건부 허용** [\[31\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) | 2024 로드맵·FAQ, 2026-04-20 보도자료 | 일반예외가 아니라 **별도의 혁신금융서비스 지정** 경로가 필요하다. [\[31\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) |
| 외부 생성형 AI를 이용한 **고객-facing 혁신서비스** 출시 | **조건부 허용** [\[16\]](https://www.fsc.go.kr/no010101/83554?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=.&srchKey=&srchText=) | 2024-12-09 혁신금융서비스 첫 지정 | 혁신금융서비스 지정, 부가조건, 금융보안원·금감원 보안점검/컨설팅 등이 전제다. [\[32\]](https://www.fsc.go.kr/no010101/82885) |
| 연구·개발망에서 외부 인터넷/오픈소스/AI를 활용 | **조건부 허용** [\[33\]](https://www.fsc.go.kr/no010101/82108) | 2022 이후 R&D 망분리 예외, 시행세칙의 “망분리 대체 정보보호통제” | 자체 위험성 평가, 별표7 대체통제, 개인신용정보 제한 등 기존 부가조건을 따른다. [\[33\]](https://www.fsc.go.kr/no010101/82108) |
| 외부 LLM 모델을 변경하며 기존 지정 서비스를 계속 운영 | **조건부 허용** [\[34\]](https://www.fsc.go.kr/no010101/86712?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) | 2026-04-15 절차 개선 방안 | 변경이 경미하고, 사전 보안영향 점검 서면확인서 제출, 금융보안원 분류가 필요하다. [\[34\]](https://www.fsc.go.kr/no010101/86712?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) |
| 고도 보안역량 금융회사가 AI·보안 목적으로 망분리 완화 적용 | **조건부 허용** [\[35\]](https://www.fsc.go.kr/no010101/86972?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) | 2026-05-26 대응방안 | 총자산·상시근로자·전담 CISO 등 요건, 평가, 비조치의견서, 한시적 1년 완화가 필요하다. [\[35\]](https://www.fsc.go.kr/no010101/86972?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) |
| 선정 금융회사에 대한 망분리 전면 해제 | **검토 단계** [\[35\]](https://www.fsc.go.kr/no010101/86972?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) | 2026-05-26 대응방안 | 아직 일반 제도화 아님. 기획형 혁신금융서비스 등 절차를 통한 “검토·추진” 단계다. [\[35\]](https://www.fsc.go.kr/no010101/86972?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) |

## 제품 적용 시사점

질문의 제품 설계, 즉 **“은행 RM용 AI 콘솔이 외부 프런티어 LLM의 추론력을 이용하되, 고객 PII는 외부 구간으로 반출하지 않는 구조”**는 현재 공개된 한국 금융정책 문서들을 종합하면 **가장 보수적으로도 정당화 가능한 설계 방향**이다. 다만 그 정당화는 “외부 LLM 일반 허용”이 아니라, **망분리 기본원칙을 유지한 채 SaaS 예외·혁신금융서비스·대체 보안통제라는 좁고 조건부인 경로를 밟는 것**으로 이해해야 한다. [\[36\]](https://www.law.go.kr/LSW//admRulSideInfoP.do?admRulSeq=2100000274812&chrClsCd=010201&dashNo=&docCls=jo&joBrNo=00&joNo=0015&urlMode=admRulScJoRltInfoR)

핵심은 이 제품이 **무엇을 외부로 내보내지 않느냐**이다. 2026년 4월 20일 제도화된 SaaS 예외는 **고유식별정보 또는 개인신용정보를 처리하는 경우 망분리 예외를 허용하지 않는다**고 명시한다. 따라서 이 설계가 외부 LLM에 전달하는 컨텍스트에서 고객명, 주민번호, 계좌식별값, 개인신용정보 등을 제거하고, 업무 목적도 문안작성·상담보조·지식검색·요약·내부 코파일럿처럼 **비식별·비신용정보형 작업**에 한정한다면, 정책적으로는 2026 SaaS 예외 체계와 합치될 가능성이 높다. 반대로 고객 PII나 개인신용정보를 외부에 보내는 순간, 이 설계의 합법성은 일반 SaaS 예외에서 이탈한다. [\[37\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=)

또 하나의 중요한 포인트는 **외부 LLM의 법적 포지셔닝**이다. 현재 공개 문서상 가장 안전한 경로는 외부 프런티어 모델을 **SaaS로 이용**하는 구조다. 실제로 금융위는 M365·Copilot·HyperCLOVA X·AWS Bedrock·Azure OpenAI 등을 포함한 “내부업무용 단말기에서 SaaS 및 생성형 AI 이용”을 혁신금융서비스로 지정했고, 2026년에는 내부업무망 SaaS 예외를 정규화했다. 따라서 제품 설명서·컨트랙트·아키텍처 문서에서도 외부 모델을 **SaaS형 정보처리 위탁/서비스 이용**으로 정리하는 것이 정책 적합성 측면에서 유리하다. 다만 API·PaaS형 모델 엔드포인트가 언제나 SaaS와 동일하게 해석되는지는 이번 조사만으로 단정하기 어렵다. [\[38\]](https://www.fsc.go.kr/no010101/83862?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=)

정책문서가 제품의 **모델 라우팅·반출 통제 설계**를 뒷받침하는 방식도 분명하다. 로드맵과 후속 조치는 외부 생성형 AI 자체를 금지하는 대신, **어떤 데이터가 외부로 나가도 되는지**, **어떤 보안통제를 병행해야 하는지**, **어떤 조직적 책임이 따라오는지**를 조건으로 붙였다. 다시 말해 제품이 “민감/식별/신용 데이터는 내부 모델 혹은 온프레미스 경로로, 비식별 질의는 외부 프런티어 LLM 경로로” 라우팅하고, 외부 전송 전 탐지·차단·삭제·마스킹을 수행한다면, 이는 기술 편의가 아니라 **정책이 요구하는 데이터 범위 구분을 제품 설계로 구현하는 것**으로 읽힌다. 이 해석은 2024 로드맵의 1단계/2단계 구조, 2026 SaaS 예외의 개인정보 제한, 2026 AI 가이드라인의 합법성·보조수단성·보안성 원칙과 정합적이다. **이 문단의 마지막 판단은 정책문서를 종합한 추론**이다. [\[39\]](https://www.fsc.go.kr/no010101/82885)

실무 체크리스트는 아래처럼 정리하는 것이 안전하다.

- **외부 반출 금지 데이터 범위 정의**: 최소한 고유식별정보, 개인신용정보, 식별 가능한 고객 PII 전반을 외부 LLM 프롬프트·툴콜·로그에서 배제한다. [\[40\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=)
- **서비스 분류**: 외부 LLM 사용 방식을 SaaS형 이용인지, 별도 혁신금융서비스가 필요한 생성형 AI 특례인지 사전에 법무·준법·보안이 공동 판정한다. [\[41\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=)
- **위원회·거버넌스**: 정보보호위원회 심의·의결, 반기 평가 보고, AI 의사결정기구·전담조직·내규 정비를 남긴다. [\[42\]](https://fsc.go.kr/po010105/77672?curPage=&srchBeginDt=&srchCtgry=5&srchEndDt=&srchKey=&srchText=)
- **제3자 리스크 관리**: 클라우드/모델 사업자에 대한 안정성·계약·출구전략·접근권·조사권 확보를 문서화한다. [\[43\]](https://fsc.go.kr/po010105/77672?curPage=&srchBeginDt=&srchCtgry=5&srchEndDt=&srchKey=&srchText=)
- **인간 개입 원칙**: RM 업무에서 AI는 보조수단으로 두고, 고객 제안·상담·판단의 최종 책임은 임직원에게 남긴다. [\[26\]](https://www.fsc.go.kr/po010101/87142?curPage=2&srchBeginDt=&srchCtgry=1&srchEndDt=&srchKey=&srchText=)
- **모델 변경 통제**: 외부 모델 교체·업그레이드 시 보안영향을 사전 점검하고, 샌드박스 지정 서비스라면 변경 절차를 따른다. [\[34\]](https://www.fsc.go.kr/no010101/86712?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=)
- **R&D와 운영 분리**: 연구·개발망 예외, 내부업무망 SaaS 예외, 대고객 혁신서비스 특례를 서로 다른 법적 트랙으로 관리한다. [\[44\]](https://www.fsc.go.kr/no010101/82108)

## 갭과 미검증

이번 조사에서 가장 큰 갭은 **“MLS(다층보안체계)”라는 용어 자체의 1차 문서 직접확인**이다. 사용자가 제시한 앵커와 달리, 제가 직접 접속한 금융위 2024-08-13 로드맵 HTML 본문과 후속 보도자료 본문에서는 **MLS 또는 다층보안체계라는 표현을 직접 확인하지 못했다.** 다만 기능적으로는 시행세칙의 **“망분리 대체 정보보호통제”**, 로드맵의 **별도 보안대책**, 2026 정책의 **AI 보안 가이드라인·제3자 리스크 관리**가 같은 방향의 다층통제를 구성한다. 따라서 **“다층보안”은 취지 요약어로는 가능하지만, 이번 조사 기준 직접 인용 가능한 공식 키워드로는 \[미검증\]**이다. [\[45\]](https://www.law.go.kr/LSW//admRulInfoP.do?admRulSeq=2200000108281&chrClsCd=010201)

두 번째 갭은 **금융보안원 2025 클라우드 가이드 PDF 본문 전체**다. 공개 페이지에서는 발행처, 발행일, 개정 목적, 제14조의2 반영 사실은 직접 확인했지만, PDF 전문을 본문 단위로 열람하지 못해 사용자가 요구한 “개정사항 세부 조문별 인용”은 제한적으로만 제시했다. 그래서 **중요/비중요 업무 구분, 절차, 정보보호위원회 심의, 출구전략, CSP 평가** 등은 직접 읽힌 제14조의2와 금융위 2022 개선방안, 2026 SaaS 보도자료로 교차 보완했다. 이 부분은 **가이드 PDF 전문 확보 후 추가 정밀 검증이 바람직**하다. **\[부분 미검증\]** [\[46\]](https://www.fsec.or.kr/bbs/detail?bbsNo=11691&menuNo=222)

세 번째 갭은 **전자금융감독규정 시행세칙 최신 연혁의 직접 본문 일관성**이다. 국가법령정보센터 검색결과에는 2025-02-05판과 2026-04-20판 연혁이 함께 포착되지만, 웹 렌더링 한계로 최신 세칙 본문 전체를 안정적으로 열람하지 못했다. 다만 2026-04-20 시행 사실과 실질 내용은 금융위·금감원 보도자료와 금융보안원 보안 해설서 공지로 교차 확인되므로, **SaaS 예외 제도화 자체는 신뢰할 수 있으나 세칙 조문 번호·문구의 최신 직접인용은 일부 \[미검증\]**으로 남긴다. [\[47\]](https://www.law.go.kr/admRulSc.do?menuId=5&query=%EC%A0%84%EC%9E%90%EA%B8%88%EC%9C%B5%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&subMenuId=41&tabMenuId=183)

네 번째 갭은 **은행연합회의 별도 공통정책 문건**이다. 이번 조사 범위에서 금융위·금감원·금융보안원 중심의 1차 문서는 충분히 확보했지만, 은행연합회가 외부 LLM 사용조건을 독자적으로 체계화한 공개 정책문서는 직접 확인하지 못했다. 따라서 “은행권 공통 업계기준”은 이번 보고서의 핵심 근거가 아니라 **보조 탐색 과제**로 남긴다. **\[미검증\]**

마지막으로, 이 보고서는 사용자의 지시대로 **법·정책 문서에 한정**했다. 따라서 아래 항목은 별도 트랙으로 넘기는 것이 맞다.

- **D10 기술 트랙**: 게이트웨이 프롬프트 필터링, 토큰화/마스킹, 라우팅 엔진, 외부모델 로그 차단, 고객 세션 분리, 벤더 무학습 계약조항 등의 구현 상세.
- **D12 절차 트랙**: 혁신금융서비스 신청서 작성, 부가조건 협의, 모델 변경 서면확인서 작성, 비조치의견서·샌드박스 운영 절차 상세.

정리하면, **2026년 6월 현재 한국 금융권에서 외부 생성형 AI·클라우드를 합법적으로 쓰는 길은 분명히 존재한다.** 다만 그것은 **“망분리 폐지”가 아니라 “망분리 원칙 + 예외 + 보안통제 + 결과책임”**의 구조다. 따라서 제품 차원에서 가장 안전한 정책적 포지션은 **외부 프런티어 LLM을 SaaS/샌드박스 경로로 활용하되, 고객 PII·개인신용정보는 외부 반출 금지하고, 필요한 경우 가명정보조차 샌드박스 경로로만 처리하는 설계**라고 결론내릴 수 있다. **이 최종 결론은 위 1차 문서들을 종합한 규제해석상 판단**이다. [\[48\]](https://www.law.go.kr/LSW//admRulSideInfoP.do?admRulSeq=2100000274812&chrClsCd=010201&dashNo=&docCls=jo&joBrNo=00&joNo=0015&urlMode=admRulScJoRltInfoR)

------------------------------------------------------------------------

[\[1\]](https://www.law.go.kr/LSW//admRulSideInfoP.do?admRulSeq=2100000274812&chrClsCd=010201&dashNo=&docCls=jo&joBrNo=00&joNo=0015&urlMode=admRulScJoRltInfoR) [\[8\]](https://www.law.go.kr/LSW//admRulSideInfoP.do?admRulSeq=2100000274812&chrClsCd=010201&dashNo=&docCls=jo&joBrNo=00&joNo=0015&urlMode=admRulScJoRltInfoR) [\[36\]](https://www.law.go.kr/LSW//admRulSideInfoP.do?admRulSeq=2100000274812&chrClsCd=010201&dashNo=&docCls=jo&joBrNo=00&joNo=0015&urlMode=admRulScJoRltInfoR) [\[48\]](https://www.law.go.kr/LSW//admRulSideInfoP.do?admRulSeq=2100000274812&chrClsCd=010201&dashNo=&docCls=jo&joBrNo=00&joNo=0015&urlMode=admRulScJoRltInfoR) https://www.law.go.kr/LSW//admRulSideInfoP.do?admRulSeq=2100000274812&chrClsCd=010201&dashNo=&docCls=jo&joBrNo=00&joNo=0015&urlMode=admRulScJoRltInfoR

<https://www.law.go.kr/LSW//admRulSideInfoP.do?admRulSeq=2100000274812&chrClsCd=010201&dashNo=&docCls=jo&joBrNo=00&joNo=0015&urlMode=admRulScJoRltInfoR>

[\[2\]](https://www.fsc.go.kr/no010101/82885) [\[11\]](https://www.fsc.go.kr/no010101/82885) [\[12\]](https://www.fsc.go.kr/no010101/82885) [\[13\]](https://www.fsc.go.kr/no010101/82885) [\[14\]](https://www.fsc.go.kr/no010101/82885) [\[15\]](https://www.fsc.go.kr/no010101/82885) [\[32\]](https://www.fsc.go.kr/no010101/82885) [\[39\]](https://www.fsc.go.kr/no010101/82885) https://www.fsc.go.kr/no010101/82885

<https://www.fsc.go.kr/no010101/82885>

[\[3\]](https://www.fsc.go.kr/no010101/83554?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=.&srchKey=&srchText=) [\[16\]](https://www.fsc.go.kr/no010101/83554?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=.&srchKey=&srchText=) [\[17\]](https://www.fsc.go.kr/no010101/83554?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=.&srchKey=&srchText=) https://www.fsc.go.kr/no010101/83554?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=.&srchKey=&srchText=

<https://www.fsc.go.kr/no010101/83554?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=.&srchKey=&srchText=>

[\[4\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) [\[5\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) [\[20\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) [\[21\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) [\[22\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) [\[23\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) [\[30\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) [\[31\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) [\[37\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) [\[40\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) [\[41\]](https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=

<https://www.fsc.go.kr/no010101/86745?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=>

[\[6\]](https://www.law.go.kr/admRulSc.do?menuId=5&query=%EC%A0%84%EC%9E%90%EA%B8%88%EC%9C%B5%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&subMenuId=41&tabMenuId=183) [\[9\]](https://www.law.go.kr/admRulSc.do?menuId=5&query=%EC%A0%84%EC%9E%90%EA%B8%88%EC%9C%B5%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&subMenuId=41&tabMenuId=183) [\[10\]](https://www.law.go.kr/admRulSc.do?menuId=5&query=%EC%A0%84%EC%9E%90%EA%B8%88%EC%9C%B5%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&subMenuId=41&tabMenuId=183) [\[47\]](https://www.law.go.kr/admRulSc.do?menuId=5&query=%EC%A0%84%EC%9E%90%EA%B8%88%EC%9C%B5%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&subMenuId=41&tabMenuId=183) https://www.law.go.kr/admRulSc.do?menuId=5&query=%EC%A0%84%EC%9E%90%EA%B8%88%EC%9C%B5%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&subMenuId=41&tabMenuId=183

<https://www.law.go.kr/admRulSc.do?menuId=5&query=%EC%A0%84%EC%9E%90%EA%B8%88%EC%9C%B5%EA%B0%90%EB%8F%85%EA%B7%9C%EC%A0%95&subMenuId=41&tabMenuId=183>

[\[7\]](https://www.law.go.kr/LSW//admRulInfoP.do?admRulSeq=2200000108281&chrClsCd=010201) [\[45\]](https://www.law.go.kr/LSW//admRulInfoP.do?admRulSeq=2200000108281&chrClsCd=010201) https://www.law.go.kr/LSW//admRulInfoP.do?admRulSeq=2200000108281&chrClsCd=010201

<https://www.law.go.kr/LSW//admRulInfoP.do?admRulSeq=2200000108281&chrClsCd=010201>

[\[18\]](https://www.fsc.go.kr/no010101/83584?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) https://www.fsc.go.kr/no010101/83584?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=

<https://www.fsc.go.kr/no010101/83584?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=>

[\[19\]](https://www.fsc.go.kr/no010101/83862?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) [\[38\]](https://www.fsc.go.kr/no010101/83862?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) https://www.fsc.go.kr/no010101/83862?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=

<https://www.fsc.go.kr/no010101/83862?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=>

[\[24\]](https://www.fsec.or.kr/bbs/detail?bbsNo=11691&menuNo=222) [\[25\]](https://www.fsec.or.kr/bbs/detail?bbsNo=11691&menuNo=222) [\[46\]](https://www.fsec.or.kr/bbs/detail?bbsNo=11691&menuNo=222) https://www.fsec.or.kr/bbs/detail?bbsNo=11691&menuNo=222

<https://www.fsec.or.kr/bbs/detail?bbsNo=11691&menuNo=222>

[\[26\]](https://www.fsc.go.kr/po010101/87142?curPage=2&srchBeginDt=&srchCtgry=1&srchEndDt=&srchKey=&srchText=) [\[27\]](https://www.fsc.go.kr/po010101/87142?curPage=2&srchBeginDt=&srchCtgry=1&srchEndDt=&srchKey=&srchText=) https://www.fsc.go.kr/po010101/87142?curPage=2&srchBeginDt=&srchCtgry=1&srchEndDt=&srchKey=&srchText=

<https://www.fsc.go.kr/po010101/87142?curPage=2&srchBeginDt=&srchCtgry=1&srchEndDt=&srchKey=&srchText=>

[\[28\]](https://www.fsc.go.kr/comm/getFile?fileNo=6&fileTy=ATTACH&srvcId=BBSTY1&upperNo=87142) https://www.fsc.go.kr/comm/getFile?fileNo=6&fileTy=ATTACH&srvcId=BBSTY1&upperNo=87142

<https://www.fsc.go.kr/comm/getFile?fileNo=6&fileTy=ATTACH&srvcId=BBSTY1&upperNo=87142>

[\[29\]](https://www.fsc.go.kr/comm/getFile?fileNo=4&fileTy=ATTACH&srvcId=BBSTY1&upperNo=82937) https://www.fsc.go.kr/comm/getFile?fileNo=4&fileTy=ATTACH&srvcId=BBSTY1&upperNo=82937

<https://www.fsc.go.kr/comm/getFile?fileNo=4&fileTy=ATTACH&srvcId=BBSTY1&upperNo=82937>

[\[33\]](https://www.fsc.go.kr/no010101/82108) [\[44\]](https://www.fsc.go.kr/no010101/82108) https://www.fsc.go.kr/no010101/82108

<https://www.fsc.go.kr/no010101/82108>

[\[34\]](https://www.fsc.go.kr/no010101/86712?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) https://www.fsc.go.kr/no010101/86712?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=

<https://www.fsc.go.kr/no010101/86712?curPage=1&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=>

[\[35\]](https://www.fsc.go.kr/no010101/86972?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=) https://www.fsc.go.kr/no010101/86972?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=

<https://www.fsc.go.kr/no010101/86972?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText=>

[\[42\]](https://fsc.go.kr/po010105/77672?curPage=&srchBeginDt=&srchCtgry=5&srchEndDt=&srchKey=&srchText=) [\[43\]](https://fsc.go.kr/po010105/77672?curPage=&srchBeginDt=&srchCtgry=5&srchEndDt=&srchKey=&srchText=) https://fsc.go.kr/po010105/77672?curPage=&srchBeginDt=&srchCtgry=5&srchEndDt=&srchKey=&srchText=

<https://fsc.go.kr/po010105/77672?curPage=&srchBeginDt=&srchCtgry=5&srchEndDt=&srchKey=&srchText=>
