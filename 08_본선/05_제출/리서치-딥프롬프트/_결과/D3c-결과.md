> 원본 파일: `D3c. 20260630_JB금융그룹이_지금_RM용_거버넌드_AI_Agent_운영_콘솔을_도입해야_하는_이유.docx`
> 회수 2026-06-30 · ⚠️ 대외비 · 엔진 산출 원문(가공 최소)

---

# JB금융그룹이 지금 RM용 거버넌드 AI Agent 운영 콘솔을 도입해야 하는 이유

## 핵심 발견

- **JB의 공개 로드맵 공백 ↔ 제품의 RM 운영 콘솔**: JB금융그룹은 2025년 12월 26일 네이버클라우드와의 MOU에서 **기업여신 상담→심사→사후관리** 전 단계에 AI를 “단계적으로 검토”하겠다고 공표했다. 공개 원문은 초기 상담의 **문서 데이터 추출·정형화**, 심사의 **신청서·재무자료·거래정보 요약·분석**, 그리고 **사후관리**까지를 범위로 적시했지만, 사후관리의 구체 운영 체계는 비어 있다. RM용 거버넌드 AI Agent 운영 콘솔은 바로 이 “공개된 로드맵의 빈 칸”, 특히 **사후관리·승인 근거 정리·후속 조치 orchestration**를 메우는 제품이다. [\[1\]](https://www.jbfg.com/ko/prcenter/press/detail/17.do)

- **김기홍 회장의 AX 선언 ↔ 제품의 즉시 실행성**: JB의 공개 원문상 가장 중요한 경영진 메시지는 2026년 3월 전략회의에서 나온 “**올해를 AX가 전 그룹 임직원들 사이에 뿌리내리는 원년이 될 수 있도록**”이라는 발언이다. 같은 회의에서 JB는 2026년 핵심 실행축으로 **RORWA 중심 질적 성장, 외국인 및 전략 여신 시장 확대, IB 역량 강화, AX 내재화**를 제시했다. 즉, JB는 “AI를 해볼까” 단계가 아니라 **AI를 전 그룹 운영 체계로 내재화할 실행도구**가 필요한 단계다. [\[2\]](https://www.jbfg.com/ko/prcenter/press/detail/24.do)

- **JB의 수익구조 집중도 ↔ RM 생산성 개선의 레버리지**: JB의 2024년 별도 기준 주요 자회사 순이익 기여도는 **광주은행 39%, JB우리캐피탈 31%, 전북은행 25%**였다. 또한 2024년 전북은행 원화대출은 **18.1조원**, 광주은행은 **23.5조원**이었고, 두 은행의 **기업대출은 전년 대비 8% 이상 증가**했다. 그룹 이익의 대부분이 전북은행·광주은행·JB우리캐피탈에 쏠려 있는 구조에서, 기업여신 RM의 상담·심사·사후관리 효율을 높이는 시스템은 “한 부서의 생산성 툴”이 아니라 **그룹 핵심 이익원에 직접 작동하는 운영 레버**다. [\[3\]](https://www.jbfg.com/assets/download/pages/esg/achievements/JB%20Financial%20Group%20PRB%20Report%282025%29.pdf?utm_source=chatgpt.com)

- **지역 기반 여신 포트폴리오의 취약성 ↔ 멀티도메인 조기경보**: JB는 공식 지속가능성 문서에서 그룹 기업여신 포트폴리오가 **부동산·임대업 41.2%, 도소매 9.0%, 제조업 9.1%, 건설업 6.5%**라고 공개했다. 광주·전남에서는 자영업 부채가 2019년 대비 2023년에 **광주 65.4%, 전남 58.3% 증가**했고, 폐업공제금 수령 건수도 **광주 60.5%, 전남 115.4% 증가**했다. 전북에 대해서도 한국은행 전북본부 보고서를 인용한 2차 보도에서 2025년 2분기 말 자영업자 대출잔액이 **29.3조원**, 연체율이 **2.2%**, 상호금융 비중이 **49.8%**까지 높아졌다는 신호가 확인된다. 이 상황에서는 단일 심사 AI보다, **소상공인·부동산·전세·피싱 신호를 함께 보는 RM 콘솔형 사후관리 AI**가 더 직접적인 해법이다. [\[4\]](https://www.bok.or.kr/fileSrc/portal/3f9e3e08733b44e589c5f4d10eb62aae/2/7885ca82b80543a6abe05180ca49593c.pdf)

- **JB의 내부 통제 구조 ↔ 액션별 인간 승인형 설계**: JB 조직도에는 **내부통제위원회, 리스크관리위원회, 리스크관리본부, 준법감시인, 금융소비자보호본부, AX·미래성장본부, NewTech부 정보보호팀, 디지털혁신부**가 동시에 보인다. ESG 정책 페이지에는 **개인정보보호 정책, 그룹 내부통제규정, 자금세탁방지 정책, 그룹 금융소비자보호 헌장**, 그리고 전북은행·광주은행의 **ISO/IEC 27001 인증**이 공개돼 있다. 따라서 JB에 맞는 AI는 “완전자율 에이전트”가 아니라, **외부 LLM을 쓰더라도 고객 PII는 비반출하고, 각 액션마다 사람 승인과 로그를 남기는 거버넌드 콘솔**이어야 조직 구조와 맞는다. 이 제품 방향은 JB의 공개 통제 체계와 거의 1:1로 정렬된다. [\[5\]](https://www.jbfg.com/ko/governance/organization.do)

- **경쟁 압력의 성격 ↔ 지금 사야 하는 이유**: BNK는 2025년 10월 **그룹 공동 생성형 AI 플랫폼 도입** 추진, AI 전략 방향 수립, AI 거버넌스 컨설팅, 해커톤까지 공개했다. iM뱅크는 2025년 4월 **외부 생성형 AI를 내부 정보처리시스템과 연계한 비대면 대화형 재무상담·PB 서비스**를 혁신금융서비스로 소개했고, 카카오뱅크는 메인에서 스스로를 **“나의 첫 번째 AI 은행”**으로 내세우고 AI 검색을 전면화하고 있다. 토스뱅크는 광주은행과 **함께대출**을 운영하면서, 금융사기 고객을 위한 **안심보상제**와 FDS 연계를 공개하고 있다. JB가 지금 필요한 것은 ‘AI 브랜딩’이 아니라, 이미 발표한 기업여신 AX를 конкурент보다 빨리 **실제 RM 운영 체계**로 굳히는 일이다. [\[6\]](https://www.bnkfg.com/02/03.jsp?dataSeqNo=6760&utm_source=chatgpt.com)

## 제품↔JB 정합 매트릭스

| 제품 요소 | 꽂히는 JB의 공개 약속·KPI·고통 | 근거 링크·발행처·날짜 | 신뢰도 |
|----|----|----|----|
| **RM용 거버넌드 AI 운영 콘솔** | JB는 네이버클라우드 MOU에서 **기업여신 상담·심사·사후관리**에 AI 적용을 단계적으로 검토하겠다고 밝혔다. 그러나 공개된 세부 예시는 상담·심사 쪽이 중심이고, **사후관리 운영체계는 공백**이다. 이 공백이 바로 콘솔의 도입 자리다. | JB금융그룹 보도자료, 2025-12-26 [\[1\]](https://www.jbfg.com/ko/prcenter/press/detail/17.do) | 1차 |
| **문서추출·재무요약·승인 근거 자동 초안** | JB 공개 원문은 초기 상담에서 **문서 데이터 추출·정형화**, 심사에서 **재무자료·거래정보 요약·분석**, 심사 종료 후 **승인 판단 근거 자동 생성**을 명시한다. 제품의 핵심 기능과 직접 겹친다. | JB금융그룹 보도자료, 2025-12-26 [\[1\]](https://www.jbfg.com/ko/prcenter/press/detail/17.do) | 1차 |
| **외부 LLM 사용 + 고객 PII 비반출** | JB는 하이퍼클로바X 활용을 공식화했지만, 동시에 그룹 차원에서 **개인정보보호 정책**, **내부통제규정**, **자금세탁방지 정책**, 전북은행·광주은행 **ISO/IEC 27001**을 공개한다. 따라서 외부 LLM 활용은 가능하지만, **PII 비반출형 아키텍처**가 조직적으로 맞다. 이는 공개 자료에 근거한 적용 설계상의 **합리적 추론**이다. | ESG 정책·가이드라인, JB금융그룹, 2026 사이트 기준 [\[7\]](https://www.jbfg.com/ko/esg/guideline.do) | 1차+추론 |
| **액션마다 사람 승인** | JB 조직도에는 **내부통제위원회**, **리스크관리위원회**, **준법감시인**, **금융소비자보호본부**가 병존한다. 완전자율 실행보다 **사람 승인형 워크플로우**가 내부 통제 구조와 정합적이다. | JB금융그룹 조직도, 2026 사이트 기준 [\[8\]](https://www.jbfg.com/ko/governance/organization.do) | 1차+추론 |
| **소상공인·자영업 멀티도메인 통합** | 광주·전남 자영업은 2023년 부채가 2019년 대비 **광주 65.4%, 전남 58.3% 증가**했고, 폐업공제금 수령 건수도 크게 늘었다. JB의 지역은행 모델상 사후관리 자동화와 조기경보가 특히 필요하다. | 한국은행 광주전남본부·목포본부 보고서, 2024-08-28 [\[9\]](https://www.bok.or.kr/fileSrc/portal/3f9e3e08733b44e589c5f4d10eb62aae/2/7885ca82b80543a6abe05180ca49593c.pdf) | 1차 |
| **취약차주 조기보호** | JB는 ESG 전략에서 **포용금융 확대**, **금융소비자 보호 및 금융사고 예방**을 핵심으로 내세운다. 제품의 취약차주 조기경보는 영업 효율화뿐 아니라 JB의 공개 ESG 메시지와도 맞물린다. | ESG 전략체계, JB금융그룹 [\[10\]](https://www.jbfg.com/ko/esg/strategy.do?utm_source=chatgpt.com) | 1차 |
| **전세사기 사전차단 시그널** | 광주는 **전세사기피해자 결정 현황** 데이터를 공개하고, 2025년 **전세사기 피해자 주거안정 지원사업**도 시행했다. 이는 전세사기 리스크가 정책·행정 차원에서 실제 대응 이슈임을 뜻한다. 전세 관련 대출·상담 신호를 RM 콘솔에 같이 올리는 것이 타당하다. | 공공데이터포털·광주광역시 복지플랫폼, 2025 [\[11\]](https://data.go.kr/data/15142922/fileData.do?utm_source=chatgpt.com) | 1차 |
| **고령층 보이스피싱 차단** | 경찰청 공식 자료에 따르면 2025년 1~3월 보이스피싱 피해자 중 **50대 이상 비중이 53%**였고, 전남과 전북은 2025년 고령인구 비중이 각각 **27.4%, 25.4%**였다. 지역은행 고객 기반을 감안하면, 고령층 피싱 차단은 ESG가 아니라 **핵심 고객 보호 기능**이다. | 경찰청 통합대응센터, 2025-05-28; 2025 고령자 통계, 2025-09-29 [\[12\]](https://www.counterscam112.go.kr/bbs002/board/boardDetail.do?pstSn=60) | 1차 |
| **계열사 공통 운영체계** | JB는 조직도상 지주 아래 **AX·미래성장본부**, **디지털혁신부**, **리스크관리본부**를 두고 있고, AI 경진대회에는 **전북은행·광주은행·JB우리캐피탈**이 모두 참여했다. 제품을 계열사별 point solution이 아니라 **그룹 공통 콘솔**로 제안해야 하는 이유다. | 조직도, 2026; AI 경진대회 보도자료, 2026-02-20 [\[13\]](https://www.jbfg.com/ko/governance/organization.do) | 1차 |
| **도입 속도형 PoC→확산 경로** | JB 내부 인터뷰에 따르면 전북은행 AI혁신부는 **전사 AI 전략, 인프라, AI 거버넌스 운영, 의사결정 구조**를 담당한다. JB는 또 핀다·한패스·웹케시 등과 전략적 투자·제휴를 실제로 집행해 온 전례가 있다. → 즉, AX·미래성장본부/AI혁신부 주관으로 작은 PoC를 열고 빠르게 확산하는 방식이 현실적이다. | JBFG Careers 인터뷰; JB금융그룹 보도자료, 2025-03-27 [\[14\]](https://www.jbfg.com/ko/career/career-insights/interview-detail/11.do) | 1차 |

## 도입 트리거와 결정 경로

JB의 가장 직접적인 외부 트리거는 2025년 12월 26일 **JB금융그룹–네이버클라우드 MOU**다. 공개 원문은 “기업 여신 상담부터 심사, 사후관리까지 금융 업무 전반에 AI를 활용하는 방안을 단계적으로 검토”하겠다고 적시했다. 또한 구체 유스케이스로 **상담 정보 및 문서 데이터 추출·정형화**, **신청서·재무자료·거래정보 요약·분석**, **승인 판단 근거 자동 생성**을 언급했다. 중요한 점은 이것이 어디까지나 **공표된 추진 방향**이라는 사실이다. 따라서 지금 JB에 들어갈 메시지는 “이미 운영 중인 시스템을 대체하자”가 아니라, **공개한 AX 로드맵을 실행 가능한 거버넌드 운영 콘솔로 채우자**가 맞다. [\[1\]](https://www.jbfg.com/ko/prcenter/press/detail/17.do)

이 로드맵을 제품 관점에서 칸별로 매핑하면 더 선명해진다. **상담 단계**에는 문서 인입·OCR 대체·핵심 필드 추출·상담 메모 구조화가 들어간다. **심사 단계**에는 재무요약, 거래정보 요약, 승인 사유 초안, 리스크 체크리스트 생성이 들어간다. **사후관리 단계**에는 연체·업황·전세사기·피싱 징후를 묶어 RM에게 우선순위화해 보여주고, 고객 접촉·보완서류 요청·내부보고 초안을 생성하는 운영 콘솔이 들어간다. 이 중 공개 자료에서 가장 비어 있는 칸이 **사후관리**이므로, 제품 포지셔닝은 “삼성급 범용 AI”가 아니라 **기업여신 사후관리용 RM Agent Console**이 가장 날카롭다. [\[15\]](https://www.jbfg.com/ko/prcenter/press/detail/17.do)

의사결정 조직도 공개돼 있다. JB 조직도상 대표이사 회장 아래에 **AX·미래성장본부**가 있고, 그 밑에 **AX·전략부, NewTech부, 디지털혁신부**가 있다. 옆으로는 **리스크관리본부**, **준법감시인**, **금융소비자보호본부**가 붙어 있으며, 이사회 산하에는 **리스크관리위원회**와 **내부통제위원회**가 있다. 즉 실무 오너는 AX·미래성장본부 계열, 요건 정의와 데이터/보안 검증은 NewTech·디지털혁신·리스크관리본부, 통제 포맷 정합성은 준법감시·금융소비자보호, 최종 프레임은 내부통제위원회/리스크관리위원회가 맞는 구조다. **“액션마다 사람 승인”**이라는 제품 조건은 이 구조 덕분에 오히려 장점이 된다. [\[16\]](https://www.jbfg.com/ko/governance/organization.do)

도입 의지도 객관적 신호가 있다. 2026년 3월 경영전략회의에는 **각 계열사 경영진 및 주요 부서장 150여명**이 참석했고, JB는 **AX 내재화**를 2026년 핵심 실행축으로 재확인했다. 2026년 2월 AI 경진대회는 **66개팀**, **총상금 1억원** 규모였고, 대상은 **JB우리캐피탈의 “AI 기반 차세대 기업 여신심사·분석 솔루션”**이었다. 2026년 6월 채용 페이지에는 **AI혁신, AI위험관리** 직무의 그룹 내 Job Posting이 실제로 올라왔고, 2026년 4월의 글로벌 인재 채용에는 **AI전략, AI정보보안, 신용평가모형**이 함께 공고됐다. 즉 JB는 AI를 홍보 소재가 아니라 **조직·인사·실행 의제**로 다루고 있다. [\[17\]](https://www.jbfg.com/ko/prcenter/press/detail/24.do)

과거의 신기술/제휴 방식도 “사는 회사”에 가깝다. JB는 2025년 3월 공식 보도에서 **핀다, 한패스, 웹케시그룹, 인피나, OKXE**에 대한 투자·전략 제휴를 밝혔고, **광주은행–토스뱅크 함께대출**, **전북은행–카카오뱅크 공동대출 추진**도 같이 공개했다. 이는 거대 SI만 고집하는 조직이 아니라, **전략적 제휴→테스트→확산** 경로를 실제로 써온 조직이라는 뜻이다. RM Agent Console은 이 점에서 JB가 이미 익숙한 도입 패턴과 맞는다. [\[18\]](https://www.jbfg.com/ko/prcenter/press/detail/1196.do)

## JB 특유의 고통과 경쟁 압력

JB가 시중은행보다 더 절박한 이유는 **수익구조와 지역구조가 더 직접적으로 얽혀 있기 때문**이다. 공식 PRB 보고서 기준 2024년 JB의 주요 자회사 이익 기여도는 **광주은행 39%, JB우리캐피탈 31%, 전북은행 25%**였다. 다시 말해, 전북은행·광주은행·JB우리캐피탈에서 RM 생산성이나 사후관리 품질이 흔들리면 그룹 전체가 바로 영향을 받는다. 동시에 JB는 2024년 연결총자산 **66.7조원**, 임직원 **4,650명** 규모의 “강소 금융그룹”이다. 대형 시중은행처럼 많은 실험을 병렬로 돌려 실패를 흡수하는 구조가 아니라, **좁고 깊게 맞는 도구 하나가 더 중요**한 구조다. [\[19\]](https://www.jbfg.com/assets/download/pages/esg/achievements/JB%20Financial%20Group%20PRB%20Report%282025%29.pdf?utm_source=chatgpt.com)

여기에 지역 포트폴리오의 성격이 겹친다. JB 공식 문서상 기업여신 포트폴리오의 **41.2%가 부동산·임대업**, 9.0%가 도소매, 6.5%가 건설이다. 이는 경기둔화·상권침체·부동산 스트레스에 민감한 업종 비중이 높다는 의미다. 한국은행 광주전남본부·목포본부 보고서는 광주·전남 자영업의 **영세화, 업황 회복 부진, 폐업 증가, 부채 증가**를 명시했고, 자영업 부채 조달의 상당 부분이 **비은행권**에 쏠렸다고 분석했다. 전북에 대해서도 한국은행 전북본부 보고서를 인용한 복수의 2차 보도는 자영업자 대출잔액의 급증, 상호금융 의존 확대, 취약차주 증가를 전한다. 이런 환경에서는 심사 시점 1회의 모델이 아니라, **RM이 매일 보는 사후관리 콘솔**이 더 효율적이다. [\[20\]](https://www.jbfg.com/assets/download/pages/esg/achievements/JB%20Financial%20Group%20PRB%20Report%282025%29.pdf?utm_source=chatgpt.com)

전세사기와 보이스피싱은 “부가 기능”이 아니라 지역은행 고객보호의 실전 과제다. 광주는 2025년에 **전세사기 피해자 주거안정 지원사업**을 공고했고, 공공데이터포털에는 **광주광역시 전세사기피해자 결정 현황** 데이터가 공개돼 있다. 전북 역시 **전세사기 발생건수 및 관계 통계**를 공개 데이터로 제공한다. 보이스피싱 쪽에서는 경찰청 통합대응센터가 2025년 1~3월 **피해액 3,116억원**, **50대 이상 피해자 비중 53%**를 공식 공개했다. 전남과 전북은 2025년 고령인구 비중이 각각 **27.4%, 25.4%**로 높다. 따라서 **고령층 피싱 차단 + 전세 리스크 사전 탐지 + 기업여신 사후관리**를 한 화면에서 보는 구조가 지방은행 JB에는 더 실용적이다. [\[21\]](https://data.go.kr/data/15142922/fileData.do?utm_source=chatgpt.com)

경쟁 압력도 이미 시작됐다. BNK는 공식 보도에서 **그룹 공동 생성형 AI 플랫폼 도입**, **AI 전략 방향성 수립**, **AI 거버넌스 컨설팅**, **해커톤 개최**까지 한 묶음으로 발표했다. iM뱅크는 공식 사이트에서 **외부 생성형 AI를 내부 정보처리시스템과 연계한 비대면 대화형 재무상담 및 PB서비스**를 2025년 4월 혁신금융서비스 사례로 소개한다. 카카오뱅크는 메인 카피 자체가 “**나의 첫 번째 AI 은행**”이고, 토스뱅크는 광주은행과 함께대출을 운영하면서 **안심보상제와 FDS**를 고객 보호 UX로 전면에 내세운다. JB가 이 경쟁에서 뒤처지지 않으려면, 추상적 AI 선언보다 **RM 현업이 바로 쓰는 governed console**을 먼저 띄우는 것이 맞다. [\[6\]](https://www.bnkfg.com/02/03.jsp?dataSeqNo=6760&utm_source=chatgpt.com)

JB의 공개 ESG 메시지와도 정합적이다. JB는 ESG 전략체계에서 **금융 접근성 및 포용금융 확대**, **금융소비자 보호 및 금융사고 예방**을 명시하고, 2023년 통합연차보고서 보도자료에서도 **디지털 경쟁력 강화**, **포용금융과 사회공헌**, **금융소비자 보호**를 주요 토픽으로 따로 강조했다. 제품이 제안하는 **취약차주 조기보호, 전세사기 사전차단, 고령층 피싱 차단**은 비용절감 서사보다 JB의 대외 메시지와 더 잘 맞는다. 영업 툴이 아니라 **상생금융·포용금융·소비자보호를 실행하는 운영 인프라**로 말할 수 있다는 뜻이다. [\[22\]](https://www.jbfg.com/ko/esg/strategy.do?utm_source=chatgpt.com)

## 근거표

| 주장 | 출처 링크 | 발행처·날짜 | 신뢰도 | 원문 인용 |
|----|----|----|----|----|
| JB–네이버클라우드 MOU는 기업여신 상담·심사·사후관리 전반의 AI 활용을 “단계적으로 검토”하는 내용이다 | JB금융그룹 보도자료 [\[1\]](https://www.jbfg.com/ko/prcenter/press/detail/17.do) | JB금융그룹, 2025-12-26 | 1차 | “기업 여신 상담부터 심사, 사후관리까지 금융 업무 전반에 AI를 활용하는 방안을 단계적으로 검토” |
| 상담 단계의 문서 추출·정형화, 심사 단계의 요약·분석, 승인 판단 근거 자동 생성이 공개 예시다 | JB금융그룹 보도자료 [\[1\]](https://www.jbfg.com/ko/prcenter/press/detail/17.do) | JB금융그룹, 2025-12-26 | 1차 | “문서에서 필요한 데이터를 추출·정형화… 재무자료·거래 정보 등을 AI가 요약·분석… 승인 판단 근거를 AI가 자동 생성” |
| 김기홍 회장은 2026년을 AX가 뿌리내리는 원년으로 공개 발언했다 | JB금융그룹 보도자료 [\[2\]](https://www.jbfg.com/ko/prcenter/press/detail/24.do) | JB금융그룹, 2026-03-05 | 1차 | “올해를 AX 가 전 그룹 임직원들사이에 뿌리내리는 원년이 될 수 있도록” |
| JB는 2026년 핵심 실행축에 AX 내재화를 포함했다 | JB금융그룹 보도자료 [\[2\]](https://www.jbfg.com/ko/prcenter/press/detail/24.do) | JB금융그룹, 2026-03-05 | 1차 | “▲… ▲IB 역량 강화 ▲AX 내재화를 2026년 변화와 혁신의 핵심 실행축으로” |
| JB AI 경진대회는 66개팀, 총상금 1억원 규모였고 JB우리캐피탈의 기업여신심사·분석 솔루션이 대상을 받았다 | JB금융그룹 보도자료 [\[23\]](https://www.jbfg.com/ko/prcenter/press/detail/23.do) | JB금융그룹, 2026-02-20 | 1차 | “총 상금 1 억원 규모… 총 66 개팀… ‘AI 기반 차세대 기업 여신심사·분석 솔루션’ 이 수상” |
| JB 조직도상 AX·미래성장본부, NewTech부, 디지털혁신부, 리스크관리본부, 준법감시인, 금융소비자보호본부가 존재한다 | JB금융그룹 조직도 [\[8\]](https://www.jbfg.com/ko/governance/organization.do) | JB금융그룹, 2026 사이트 기준 | 1차 | “AX·미래성장본부… NewTech부 정보보호팀… 디지털혁신부… 리스크관리본부… 준법감시인… 금융소비자보호본부” |
| JB는 개인정보보호 정책, 그룹 내부통제규정, AML 정책, 금융소비자보호 헌장을 공개하고 있다 | ESG 정책 및 가이드라인 [\[7\]](https://www.jbfg.com/ko/esg/guideline.do) | JB금융그룹, 2026 사이트 기준 | 1차 | “개인정보보호 정책… 그룹 내부통제규정… 자금세탁방지 정책… 그룹 금융소비자보호 헌장” |
| 전북은행 AI혁신부는 전사 AI 전략·인프라·AI 거버넌스·의사결정 구조를 담당한다고 소개한다 | JBFG Careers 현직자 인터뷰 [\[24\]](https://www.jbfg.com/ko/career/career-insights/interview-detail/11.do) | JBFG Careers, 2026 사이트 기준 | 1차 | “전사 AI 전략 수립… AI 거버넌스 운영… AI 추진 관련 의사결정 구조” |
| JB 채용공고에는 AI혁신·AI위험관리, AI전략·AI정보보안 등이 실제 올라왔다 | JBFG Careers 채용공고 [\[25\]](https://www.jbfg.com/ko/career/job-openings/recruit.do) | JBFG Careers, 2026-06·04 | 1차 | “AI혁신 AI위험관리”, “AI전략 AI정보보안” |
| JB는 핀다·한패스·웹케시그룹 등과 전략적 투자·제휴를 했고, 광주은행–토스뱅크·전북은행–카카오뱅크 협업을 추진했다 | JB금융그룹 보도자료 [\[26\]](https://www.jbfg.com/ko/prcenter/press/detail/1196.do) | JB금융그룹, 2025-03-27 | 1차 | “핀다… 한패스… 웹케시그룹… 전략적 투자계약… 광주은행은 토스뱅크와… 전북은행도 카카오뱅크와” |
| JB의 2024년 주요 자회사 순이익 기여도는 광주은행 39%, JB우리캐피탈 31%, 전북은행 25%다 | PRB Report and Self-Assessment [\[3\]](https://www.jbfg.com/assets/download/pages/esg/achievements/JB%20Financial%20Group%20PRB%20Report%282025%29.pdf?utm_source=chatgpt.com) | JB Financial Group, 2025 PDF | 1차 |  |
| JB의 2024년 전북은행·광주은행 원화대출은 각각 18.1조원, 23.5조원이며 기업대출은 8% 이상 성장했다 | PRB Report and Self-Assessment [\[27\]](https://www.jbfg.com/assets/download/pages/esg/achievements/JB%20Financial%20Group%20PRB%20Report%282025%29.pdf?utm_source=chatgpt.com) | JB Financial Group, 2025 PDF | 1차 |  |
| JB 기업여신 포트폴리오에서 부동산·임대업 비중이 41.2%다 | PRB Report and Self-Assessment [\[27\]](https://www.jbfg.com/assets/download/pages/esg/achievements/JB%20Financial%20Group%20PRB%20Report%282025%29.pdf?utm_source=chatgpt.com) | JB Financial Group, 2025 PDF | 1차 | “\[Corporate Loan Portfolio by Industry\] Real estate/Lease 41.2%” |
| 광주·전남 자영업 부채는 2019년 대비 2023년에 광주 65.4%, 전남 58.3% 증가했다 | 한국은행 광주전남본부 보고서 [\[9\]](https://www.bok.or.kr/fileSrc/portal/3f9e3e08733b44e589c5f4d10eb62aae/2/7885ca82b80543a6abe05180ca49593c.pdf) | 한국은행, 2024-08-28 | 1차 | “2023년 광주와 전남 자영업자 부채는 2019년 대비 각각 65.4%, 58.3% 증가” |
| 광주·전남의 폐업공제금 수령 건수는 광주 60.5%, 전남 115.4% 증가했다 | 한국은행 광주전남본부 보고서 [\[9\]](https://www.bok.or.kr/fileSrc/portal/3f9e3e08733b44e589c5f4d10eb62aae/2/7885ca82b80543a6abe05180ca49593c.pdf) | 한국은행, 2024-08-28 | 1차 | “광주는… 60.5% 증가… 전남… 115.4% 증가” |
| 전북 자영업자 대출잔액 29.3조원, 상호금융 비중 49.8%, 연체율 2.2%는 한국은행 전북본부 보고서 기반 2차 보도로 확인된다 | 전북노컷·뉴시스 [\[28\]](https://jb.nocutnews.co.kr/news/6435395?utm_source=chatgpt.com) | 2025-11-27 | 2차 | “29.3조 원”, “49.8%”, “연체율은… 2.2%” |
| 2025년 1~3월 보이스피싱 피해자 중 50대 이상 비중은 53%였다 | 경찰청 통합대응센터 보도자료 [\[29\]](https://www.counterscam112.go.kr/bbs002/board/boardDetail.do?pstSn=60) | 경찰청, 2025-05-28 | 1차 | “50 대 이상 피해자 비중… ’25년 1월~3월 53%” |
| 전남·전북의 2025년 고령인구 비중은 각각 27.4%, 25.4%다 | 2025 고령자 통계 [\[30\]](https://mods.go.kr/board.es?act=view&bid=10820&list_no=438832&mid=a10301010000) | 국가데이터처, 2025-09-29 | 1차 | “전남(27.4%)… 전북(25.4%)” |
| 광주는 전세사기 피해자 주거안정 지원사업을 시행했고 피해자 결정 현황 데이터를 공개한다 | 광주광역시 복지플랫폼·공공데이터포털 [\[31\]](https://welfare.gwangju.go.kr/main/board/1/read/10278?utm_source=chatgpt.com) | 광주광역시, 2025-01-14 | 1차 | “전세사기피해자 주거안정 지원사업”, “전세사기피해자 결정 현황” |
| BNK는 그룹 공동 생성형 AI 플랫폼 도입을 추진 중이다 | BNK금융지주 보도자료 [\[32\]](https://www.bnkfg.com/02/03.jsp?dataSeqNo=6760&utm_source=chatgpt.com) | BNK금융지주, 2025-10-23 | 1차 | “그룹 공동 생성형 AI플랫폼 도입” |
| iM뱅크는 외부 생성형 AI와 내부 시스템을 연계한 재무상담·PB 서비스를 혁신금융서비스로 소개한다 | iM뱅크 공식 페이지 [\[33\]](https://www.imbank.co.kr/cms/hlp/sdc_7/sdc_71/sdc_713/sdc_7131/1218060_5147.html) | iM뱅크, 2025-04-17 사례 | 1차 | “외부 생성형 AI를 내부 정보처리시스템과 연계” |
| 카카오뱅크는 스스로를 “나의 첫 번째 AI 은행”으로 포지셔닝한다 | 카카오뱅크 메인 [\[34\]](https://www.kakaobank.com/) | 카카오뱅크, 2026 사이트 기준 | 1차 | “나의 첫 번째 AI 은행” |
| 토스뱅크는 금융사기 피해 고객을 위한 안심보상제와 FDS 기반 연락 체계를 공개한다 | 토스뱅크 공식 콘텐츠 [\[35\]](https://www.tossbank.com/articles/financial-fraud-prevention-vol-1?utm_source=chatgpt.com) | 토스뱅크, 2026-02경 | 1차 | “최대 5,000만 원까지 보상… ‘이상 거래 탐지 시스템(FDS)’” |

## 갭과 미검증

공개 자료 기준으로는 **JB금융그룹의 AI·디지털 총 투자액, AI 전담 인력 목표, 연간 AI 예산 규모**를 확인하지 못했다. 공식 IR·공시·보도자료에서 반복적으로 확인되는 것은 **AX 실행 의지, 조직 신설·운영, 해커톤/상금, 채용, 제휴/투자**까지이며, “AI 투자액 얼마” 수준의 총액 공시는 이번 조사 범위에서 찾지 못했다. 따라서 이 부분은 **\[미검증\]**으로 둬야 한다. [\[17\]](https://www.jbfg.com/ko/prcenter/press/detail/24.do)

또한 **전북 지역 자영업 대출 세부 수치**는 한국은행 전북본부의 공식 보고서 존재는 확인됐지만, 웹에서 안전하게 직접 열람 가능한 본문 확보가 제한돼 일부 핵심 숫자는 **공식 보고서를 인용한 2차 보도**를 함께 사용했다. 따라서 전북 자영업 관련 세부 수치 중 **29.3조원, 49.8%, 2.2%** 등은 본 보고서에서 **\[2차\]**로 취급하는 것이 정직하다. [\[36\]](https://www.bok.or.kr/portal/bbs/P0000800/view.do?depth=201499&menuNo=201499&nttId=10094814&programType=rgHqtData&relate=Y&searchBbsSeCd=z15&utm_source=chatgpt.com)

마지막으로, 사용자 프롬프트에 있는 “**외부 LLM 사용하되 고객 PII 비반출, 액션마다 사람 승인**”은 공개 문서의 문구 그 자체는 아니다. 다만 JB가 공개한 **개인정보보호 정책, ISO 27001, 내부통제위원회, 준법감시인, 금융소비자보호본부, AI 거버넌스 운영 조직**을 감안하면, JB에 맞는 실제 제안 아키텍처로서는 가장 설득력 있는 방향이라는 **\[추론\]**이다. 다시 말해, 이 부분은 JB가 이미 그렇게 한다는 뜻이 아니라, **JB의 공개 통제 구조상 그렇게 제안해야 통과 가능성이 가장 높다**는 뜻이다. [\[37\]](https://www.jbfg.com/ko/esg/guideline.do)

종합하면, JB에 대한 메시지는 단순하다. **“AI를 하셔야 합니다”가 아니다. “JB가 이미 공표한 기업여신 AX 로드맵 중, 가장 비어 있고 가장 급한 사후관리·통제·소비자보호 칸을, JB의 내부통제 구조에 맞는 RM 운영 콘솔로 지금 채우셔야 합니다.”** 이것이 공개 근거만으로 가장 뾰족하게 성립하는 제안이다. [\[38\]](https://www.jbfg.com/ko/prcenter/press/detail/17.do)

------------------------------------------------------------------------

[\[1\]](https://www.jbfg.com/ko/prcenter/press/detail/17.do) [\[15\]](https://www.jbfg.com/ko/prcenter/press/detail/17.do) [\[38\]](https://www.jbfg.com/ko/prcenter/press/detail/17.do) JB금융그룹

<https://www.jbfg.com/ko/prcenter/press/detail/17.do>

[\[2\]](https://www.jbfg.com/ko/prcenter/press/detail/24.do) [\[17\]](https://www.jbfg.com/ko/prcenter/press/detail/24.do) JB금융그룹

<https://www.jbfg.com/ko/prcenter/press/detail/24.do>

[\[3\]](https://www.jbfg.com/assets/download/pages/esg/achievements/JB%20Financial%20Group%20PRB%20Report%282025%29.pdf?utm_source=chatgpt.com) [\[19\]](https://www.jbfg.com/assets/download/pages/esg/achievements/JB%20Financial%20Group%20PRB%20Report%282025%29.pdf?utm_source=chatgpt.com) [\[20\]](https://www.jbfg.com/assets/download/pages/esg/achievements/JB%20Financial%20Group%20PRB%20Report%282025%29.pdf?utm_source=chatgpt.com) [\[27\]](https://www.jbfg.com/assets/download/pages/esg/achievements/JB%20Financial%20Group%20PRB%20Report%282025%29.pdf?utm_source=chatgpt.com) 2025 JB Financial Group PRB Report and Self-Assessment

<https://www.jbfg.com/assets/download/pages/esg/achievements/JB%20Financial%20Group%20PRB%20Report%282025%29.pdf?utm_source=chatgpt.com>

[\[4\]](https://www.bok.or.kr/fileSrc/portal/3f9e3e08733b44e589c5f4d10eb62aae/2/7885ca82b80543a6abe05180ca49593c.pdf) [\[9\]](https://www.bok.or.kr/fileSrc/portal/3f9e3e08733b44e589c5f4d10eb62aae/2/7885ca82b80543a6abe05180ca49593c.pdf) bok.or.kr

<https://www.bok.or.kr/fileSrc/portal/3f9e3e08733b44e589c5f4d10eb62aae/2/7885ca82b80543a6abe05180ca49593c.pdf>

[\[5\]](https://www.jbfg.com/ko/governance/organization.do) [\[8\]](https://www.jbfg.com/ko/governance/organization.do) [\[13\]](https://www.jbfg.com/ko/governance/organization.do) [\[16\]](https://www.jbfg.com/ko/governance/organization.do) 조직도 \| 기업지배구조 \| JB금융그룹

<https://www.jbfg.com/ko/governance/organization.do>

[\[6\]](https://www.bnkfg.com/02/03.jsp?dataSeqNo=6760&utm_source=chatgpt.com) [\[32\]](https://www.bnkfg.com/02/03.jsp?dataSeqNo=6760&utm_source=chatgpt.com) 보도자료 \| 홍보센터

<https://www.bnkfg.com/02/03.jsp?dataSeqNo=6760&utm_source=chatgpt.com>

[\[7\]](https://www.jbfg.com/ko/esg/guideline.do) [\[37\]](https://www.jbfg.com/ko/esg/guideline.do) ESG 정책 및 가이드라인 \| ESG \| JB금융그룹

<https://www.jbfg.com/ko/esg/guideline.do>

[\[10\]](https://www.jbfg.com/ko/esg/strategy.do?utm_source=chatgpt.com) [\[22\]](https://www.jbfg.com/ko/esg/strategy.do?utm_source=chatgpt.com) ESG 전략체계

<https://www.jbfg.com/ko/esg/strategy.do?utm_source=chatgpt.com>

[\[11\]](https://data.go.kr/data/15142922/fileData.do?utm_source=chatgpt.com) [\[21\]](https://data.go.kr/data/15142922/fileData.do?utm_source=chatgpt.com) 광주광역시_전세사기피해자 결정 현황

<https://data.go.kr/data/15142922/fileData.do?utm_source=chatgpt.com>

[\[12\]](https://www.counterscam112.go.kr/bbs002/board/boardDetail.do?pstSn=60) [\[29\]](https://www.counterscam112.go.kr/bbs002/board/boardDetail.do?pstSn=60) 알림센터 \> 보도자료

<https://www.counterscam112.go.kr/bbs002/board/boardDetail.do?pstSn=60>

[\[14\]](https://www.jbfg.com/ko/career/career-insights/interview-detail/11.do) [\[24\]](https://www.jbfg.com/ko/career/career-insights/interview-detail/11.do) 현직자 인터뷰 \| Career Insights \| JBFG Careers

<https://www.jbfg.com/ko/career/career-insights/interview-detail/11.do>

[\[18\]](https://www.jbfg.com/ko/prcenter/press/detail/1196.do) [\[26\]](https://www.jbfg.com/ko/prcenter/press/detail/1196.do) JB금융그룹

<https://www.jbfg.com/ko/prcenter/press/detail/1196.do>

[\[23\]](https://www.jbfg.com/ko/prcenter/press/detail/23.do) JB금융그룹

<https://www.jbfg.com/ko/prcenter/press/detail/23.do>

[\[25\]](https://www.jbfg.com/ko/career/job-openings/recruit.do) 채용공고 \| Job Openings \| JBFG Careers

<https://www.jbfg.com/ko/career/job-openings/recruit.do>

[\[28\]](https://jb.nocutnews.co.kr/news/6435395?utm_source=chatgpt.com) 전북 자영업자는 줄고 대출은 증가…자영업 위기 지속 - 전북노컷

<https://jb.nocutnews.co.kr/news/6435395?utm_source=chatgpt.com>

[\[30\]](https://mods.go.kr/board.es?act=view&bid=10820&list_no=438832&mid=a10301010000) 2025 고령자 통계 \| 전체 \| 보도자료 \| 새소식 : 국가데이터처

<https://mods.go.kr/board.es?act=view&bid=10820&list_no=438832&mid=a10301010000>

[\[31\]](https://welfare.gwangju.go.kr/main/board/1/read/10278?utm_source=chatgpt.com) 광주광역시 광주복지플랫폼 복지소식 \< 공공복지 소식 -

<https://welfare.gwangju.go.kr/main/board/1/read/10278?utm_source=chatgpt.com>

[\[33\]](https://www.imbank.co.kr/cms/hlp/sdc_7/sdc_71/sdc_713/sdc_7131/1218060_5147.html) 금융소비자보호

<https://www.imbank.co.kr/cms/hlp/sdc_7/sdc_71/sdc_713/sdc_7131/1218060_5147.html>

[\[34\]](https://www.kakaobank.com/) 카카오뱅크

<https://www.kakaobank.com/>

[\[35\]](https://www.tossbank.com/articles/financial-fraud-prevention-vol-1?utm_source=chatgpt.com) \[금융사기 예방 리포트\] “당신도 공범입니까?”라는 말에 속지 ...

<https://www.tossbank.com/articles/financial-fraud-prevention-vol-1?utm_source=chatgpt.com>

[\[36\]](https://www.bok.or.kr/portal/bbs/P0000800/view.do?depth=201499&menuNo=201499&nttId=10094814&programType=rgHqtData&relate=Y&searchBbsSeCd=z15&utm_source=chatgpt.com) 전북지역 자영업 현황 및 여건 점검 \| 조사연구자료(상세)

<https://www.bok.or.kr/portal/bbs/P0000800/view.do?depth=201499&menuNo=201499&nttId=10094814&programType=rgHqtData&relate=Y&searchBbsSeCd=z15&utm_source=chatgpt.com>
