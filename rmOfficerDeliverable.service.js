/* RM 산출물(MD) 빌더 — 개별 에이전트 .md + 통합본 .md.
   원문 민감정보 없이 요약·근거표·출처만 담는다. AI 산출물은 내부 업무 참고용.
   개별 md 구조: Summary(3~4문장) → 상황 분석 → 근거 표(4~6행) → 판단·권고(단계별) →
   다음 조치 태스크(체크리스트) → 한계·주의(가드레일 고지). 통합본은 개별 md를 옵시디언식으로 링크한다. */

/* 에이전트별 산출물 콘텐츠 템플릿 — 케이스 서사 기반 더미 콘텐츠(구체적 수치·출처 포함).
   에이전트 종류별(리스크 분석/케어/액션/보고 등)로 문체와 구조를 차별화한다. */
const RMO_DELIVERABLE_TEMPLATES = {
  "rmo-triage": {
    summary: "상담 유형·위험 신호·SLA 기한을 검토해 이 케이스의 처리 우선순위를 산정했습니다. 급한 순 정렬 근거와 함께 필요한 분석 에이전트 배정 계획을 함께 정리했습니다. 배정된 각 에이전트는 담당 RM의 승인(Enter) 후 개별적으로 실행됩니다.",
    situationAnalysis: "접수된 상담 유형과 SLA 기한, 위험도 입력을 종합해 우선순위 점수를 계산했습니다. 재해·리스크 대응 유형이거나 SLA가 임박한 경우 우선순위가 높게 산정되며, 이 점수는 업무보드의 급한 순 정렬 기준으로 사용됩니다.",
    evidence: [
      ["상담 유형", "케이스 도메인 및 세부 상담 주제", "접수 정보"],
      ["SLA 기한", "처리 목표 기한까지 남은 일수", "내부 일정"],
      ["위험도 입력", "접수 시점 위험도 초기값", "담당자 입력"],
      ["우선순위 점수", "0~100점 스케일 산정값", "우선순위 산정 로직"],
    ],
    judgment: [
      "1) 우선순위 점수와 SLA 기한을 기준으로 처리 순번을 확정합니다.",
      "2) 케이스 유형에 맞는 분석 에이전트 배정 계획을 생성합니다.",
      "3) high/critical 위험은 준법 가드레일 검증 및 승인 라우팅 경로를 함께 활성화합니다.",
    ],
    nextTasks: ["배정된 분석 에이전트 순서대로 승인(Enter)", "SLA 임박 시 담당자 알림 확인"],
    sources: [{ label: "우선순위 근거 산정 로직", ref: "internal:priority-engine" }],
    expectedValue: "급한 순서를 근거와 함께 제시해 담당자가 첫 착수 케이스를 빠르게 정할 수 있습니다.",
    contribution: 15,
  },
  "rmo-marine-risk": {
    summary: "고수온 예보와 태풍 접근 경보 권역이 사업장 위치와 겹치는 것을 확인했습니다. 최근 5일간 수온이 평년 대비 2.3도 높게 유지되며 폐사 위험이 상승하는 신호가 관측되었습니다. 재해 대응 체크리스트와 운전자금·사료비 부담 신호를 함께 정리했습니다. 실제 피해 발생 여부와 규모는 담당자의 현장 확인이 필요합니다.",
    situationAnalysis: "완도 권역 양식장은 고수온 특보 발효 이후 사료 섭이율 저하와 폐사 위험이 동시에 상승하는 전형적인 패턴을 보입니다. 사료비 지출이 늘어나는 동시에 출하 매출은 지연될 가능성이 있어, 운전자금 상환 일정과 재해 대응 조치를 함께 검토해야 하는 국면입니다.",
    evidence: [
      ["수온 편차", "평년 대비 +2.3도, 5일 연속 고수온 특보", "기상특보(공개·샘플)"],
      ["태풍 경로", "권역 통과 예상 confidence 65%(샘플)", "태풍 경로 예보(공개·샘플)"],
      ["사료비 변동", "최근 30일 사료 매입 지출 전월 대비 +12%", "사업장 지출 내역(샘플)"],
      ["폐사 위험 신호", "인근 권역 폐사 신고 3건(샘플 집계)", "권역 신고 집계(샘플)"],
      ["운전자금 상환일", "7일 이내 상환일 도래", "상환 일정(샘플)"],
    ],
    judgment: [
      "1) 재해 노출도가 높아 상환유예 검토 태스크를 우선 생성합니다.",
      "2) 정책 재해자금 안내 대상 여부 확인을 다음 단계로 제안합니다.",
      "3) 실제 피해 확정 전까지는 담당자 현장 확인을 전제로 안내합니다.",
    ],
    nextTasks: ["상환유예 검토 태스크 생성", "정책 재해자금 안내 자료 준비", "현장 피해 확인 요청"],
    sources: [
      { label: "기상특보·고수온 예보(공개)", ref: "sample:marine-alert" },
      { label: "사업장 권역 매칭(샘플)", ref: "sample:region-match" },
    ],
    expectedValue: "재해 노출을 조기에 근거와 함께 파악해 대응 태스크로 넘길 수 있습니다.",
    contribution: 40,
  },
  "rmo-credit-care": {
    summary: "다가오는 상환일과 최근 입출금 흐름(샘플)을 비교한 결과 상환 여력이 빠듯한 구간이 확인되었습니다. 최근 30일 입금액이 직전 30일 대비 감소한 신호가 있어 분할 상환과 상환일 조정 후보를 함께 준비했습니다. 실제 상환유예 승인은 담당자 검토를 거쳐야 합니다.",
    situationAnalysis: "최근 입출금 흐름은 계절적 매출 변동과 지출 증가가 겹치며 상환일 직전 잔고가 낮아지는 패턴을 보입니다. 연체로 이어지기 전에 분할 상환이나 상환일 조정 같은 완충 조치를 검토할 시점으로 판단됩니다.",
    evidence: [
      ["입금 변동", "최근 30일 입금액 전월 대비 -15%(샘플)", "입출금 흐름(샘플)"],
      ["상환일 임박도", "상환일까지 5일 이내", "상환 일정(샘플)"],
      ["잔고 여유", "상환액 대비 평균 잔고 비율 82%(샘플)", "입출금 흐름(샘플)"],
      ["기존 상담 이력", "최근 3개월 내 상환 관련 상담 1건", "상담 메모(샘플)"],
    ],
    judgment: [
      "1) 분할 상환 시나리오(2회 분할)를 우선 후보로 제시합니다.",
      "2) 상환일을 급여/매출 입금일 이후로 조정하는 후보를 함께 제시합니다.",
      "3) 두 후보 모두 승인 필요 항목으로 표시하고 확정하지 않습니다.",
    ],
    nextTasks: ["분할 상환 시나리오 승인 여부 확인", "상환일 조정 후보 고객 안내 초안 준비", "상환일 리마인드 발송 승인 대기"],
    sources: [
      { label: "상환일정·입출금 흐름(샘플)", ref: "sample:repayment-flow" },
    ],
    expectedValue: "상환 여력 공백을 미리 알려 연체 전 조치로 연결합니다.",
    contribution: 30,
  },
  "rmo-salary-flow": {
    summary: "복직 직후 급여가 정상화되기 전 소득 공백 구간이 있음을 확인했습니다. 최근 급여 입금액이 복직 이전 평균 대비 낮게 유지되고 있으며, 이 구간이 카드론·직장인대출 상환일과 겹치는 것으로 나타났습니다.",
    situationAnalysis: "육아휴직 복귀 초기에는 급여가 단계적으로 정상화되는 경우가 많아 실질 가용 소득이 일시적으로 줄어듭니다. 이 시기에 여러 상환일이 겹치면 상환 부담이 급격히 커질 수 있어 사전 조정이 필요합니다.",
    evidence: [
      ["급여 정상화 시점", "복직 후 2개월차부터 평년 수준 회복 예상(샘플)", "급여주기(샘플)"],
      ["최근 급여 변동", "복직 직후 급여 평년 대비 -22%(샘플)", "급여주기(샘플)"],
      ["겹치는 상환일", "카드론·직장인대출 상환일 3일 이내 집중", "상환 일정(샘플)"],
      ["공백 기간", "약 6주간 소득 공백 구간 추정", "급여-상환 일정 비교(샘플)"],
    ],
    judgment: [
      "1) 소득 정상화 시점(2개월차) 이전까지 상환일 분산을 우선 검토합니다.",
      "2) 급여 정상화 이후에는 별도 조정 없이 정상 상환이 가능할 것으로 판단합니다.",
    ],
    nextTasks: ["상환일 분산 후보 승인 대기", "급여 정상화 시점 재확인 일정 등록"],
    sources: [{ label: "급여주기·소득 흐름(샘플)", ref: "sample:salary-flow" }],
    expectedValue: "소득 정상화 시점을 근거로 상환일 조정 후보를 제시합니다.",
    contribution: 35,
  },
  "rmo-dsr-guard": {
    summary: "카드론·직장인대출 등 월 상환 항목을 모은 결과 특정 월에 상환이 몰리는 집중 구간이 확인되었습니다. DSR을 확정 산출하지 않고, 상환 집중도를 참고 신호로만 제시합니다.",
    situationAnalysis: "여러 상환 항목의 납부일이 월초에 몰려 있어 해당 시점의 현금 흐름 부담이 커지는 구조입니다. 상환일을 월 중 분산시키면 부담이 완화될 여지가 있습니다.",
    evidence: [
      ["집중 구간", "매월 1~5일에 상환 3건 집중(샘플)", "월 상환 목록(샘플)"],
      ["상환 항목 수", "카드론 1건 + 직장인대출 2건", "상환 일정(샘플)"],
      ["집중도 지표", "월 상환액의 68%가 5일 이내 집중(샘플)", "월 상환 집중도(샘플)"],
    ],
    judgment: [
      "1) 상환일 분산 후보(월 중순 이동)를 우선 제시합니다.",
      "2) 분산이 어려운 경우 상환 순서 조정 후보를 대안으로 제시합니다.",
    ],
    nextTasks: ["상환일 분산 후보 승인 대기", "조정 불가 시 대안 시나리오 준비"],
    sources: [{ label: "월 상환 집중도(샘플)", ref: "sample:monthly-repayment" }],
    expectedValue: "상환 집중 위험을 조기에 표시해 조정 검토로 연결합니다.",
    contribution: 25,
  },
  "rmo-youth-finance": {
    summary: "국가장학금 입금 예상 시점과 현재 소액 상환일 사이에 생활비 공백 구간이 있는 것으로 확인되었습니다. 아르바이트 급여만으로는 이 구간의 생활비와 상환을 동시에 감당하기 빠듯한 것으로 판단됩니다.",
    situationAnalysis: "학사일정상 장학금은 개강 후 약 3주 뒤 입금되는 경우가 많아, 그 전까지는 아르바이트 급여에 생활비와 소액 상환을 모두 의존하게 됩니다. 이 구간에 고금리 대체대출로 이어지는 사례가 많아 사전 안내가 필요합니다.",
    evidence: [
      ["장학금 입금 예상", "개강 후 약 3주 뒤(공개 학사일정 기준·샘플)", "학사일정(공개)"],
      ["소액 상환일", "장학금 입금 10일 전 도래", "상환 일정(샘플)"],
      ["아르바이트 급여", "월 급여로 생활비 대비 여유분 낮음(샘플)", "소득 정보(샘플)"],
      ["공백 기간", "약 10일 생활비 공백 추정", "일정 비교(샘플)"],
    ],
    judgment: [
      "1) 소액 상환 리마인드를 장학금 입금일 이후로 조정하는 후보를 제시합니다.",
      "2) 고금리 대체대출 위험을 쉬운 문장으로 안내하는 문안을 함께 준비합니다.",
    ],
    nextTasks: ["상환 리마인드 일정 조정 승인 대기", "고금리 대출 위험 안내 문안 승인 대기"],
    sources: [{ label: "학사일정·장학금 구간(샘플)", ref: "sample:academic-schedule" }],
    expectedValue: "생활비 공백을 미리 알려 고금리 대출 유입을 예방합니다.",
    contribution: 40,
  },
  "rmo-policy-finance": {
    summary: "소상공인 정책자금과 지역 협약대출의 자격 확인 체크리스트를 정리했습니다. 매출 규모·업력·지역 요건 등 확인이 필요한 항목을 목록화했으며, 실제 대상 여부는 확정하지 않습니다.",
    situationAnalysis: "정책자금·협약대출은 매출 규모, 업력, 지역, 업종 등 여러 요건을 동시에 충족해야 하는 경우가 많아 사전에 체크리스트로 정리해두면 상담 시간을 단축할 수 있습니다.",
    evidence: [
      ["업력 요건", "통상 1년 이상 확인 필요(공개 안내 기준·샘플)", "정책자금 요건(공개)"],
      ["매출 규모 요건", "소상공인 기준 매출 구간 확인 필요", "정책자금 요건(공개)"],
      ["지역 요건", "사업장 소재지 협약대출 대상 지역 여부", "지역 협약대출 안내(공개)"],
      ["증빙 서류", "사업자·매출 증빙(원문 저장 금지) 목록", "내부 체크리스트"],
    ],
    judgment: [
      "1) 요건 충족 여부를 담당자가 1차 확인하도록 체크리스트를 우선 제공합니다.",
      "2) 요건 미비 항목은 서류 보완 요청으로 전환합니다.",
    ],
    nextTasks: ["매출 규모·업력 요건 확인", "지역 협약대출 대상 여부 확인", "증빙 서류 보완 요청"],
    sources: [
      { label: "정책자금 요건(공개 안내)", ref: "sample:policy-guide" },
      { label: "지역 협약대출 안내(공개)", ref: "sample:local-loan" },
    ],
    expectedValue: "조달비용을 낮출 정책금융 후보를 근거와 함께 제시합니다.",
    contribution: 45,
  },
  "rmo-action": {
    summary: "선행 분석 결과를 모아 담당 RM이 바로 실행할 수 있는 다음 조치 태스크를 정리했습니다. 상환유예 검토, 정책자금 안내, 담당자 콜백 등 구체적 실행 항목으로 구성했으며, 실제 실행은 담당 RM의 승인 이후 진행됩니다.",
    situationAnalysis: "개별 분석에서 확인된 위험 신호와 기회 요인을 실행 가능한 단위로 쪼개어 우선순위와 함께 정리했습니다. 태스크는 승인 없이 자동 실행되지 않습니다.",
    evidence: [
      ["선행 분석 신호 수", "직전 분석 노드에서 생성된 신호 반영", "선행 분석 결과"],
      ["콜백 후보 시점", "SLA 기한 이전 1일", "케이스 일정"],
      ["안내 문안 필요 여부", "고객 접점 필요 시 Comms Agent로 핸드오프", "핸드오프 규칙"],
    ],
    judgment: [
      "1) 우선순위가 가장 높은 조치부터 태스크로 등록합니다.",
      "2) 고객 접점이 필요한 항목은 안내 문안 초안(Comms Agent)으로 넘깁니다.",
      "3) 모든 태스크는 담당자 승인 후 실행되는 것으로 표시합니다.",
    ],
    nextTasks: ["상환유예 검토 태스크 생성", "정책자금 안내 준비 태스크 생성", "담당자 콜백 예약 후보 등록"],
    sources: [{ label: "내부 조치 규칙", ref: "internal:action-rules" }],
    expectedValue: "다음 조치를 태스크로 정리해 담당자가 바로 실행할 수 있습니다.",
    contribution: 20,
  },
  "rmo-comms": {
    summary: "고객에게 전달할 안내 문안 초안을 쉬운 문장으로 작성했습니다. 확정적 표현 없이 상황 설명과 다음 단계 안내로만 구성했으며, 발송 승인 대기 상태이며 직접 발송하지 않습니다.",
    situationAnalysis: "고객이 이해하기 쉬운 표현으로 현재 상황과 다음 단계만 안내하고, 승인·확정 표현은 배제했습니다. 최종 발송 여부와 문구 수정은 담당자 승인을 거칩니다.",
    evidence: [
      ["문안 톤", "쉬운 문장, 확정 표현 배제", "안내 템플릿"],
      ["발송 채널 후보", "문자/알림톡(샘플)", "내부 채널 정책"],
      ["승인 상태", "발송 전 approval pending", "승인 규칙"],
    ],
    judgment: [
      "1) 상황 설명 → 다음 단계 안내 순서로 문안을 구성합니다.",
      "2) 확정적 표현(승인/거절/금리 등)은 전부 배제합니다.",
    ],
    nextTasks: ["안내 문안 승인 대기", "승인 후 발송 채널 확정"],
    sources: [{ label: "안내 문안 템플릿", ref: "internal:guidance-template" }],
    expectedValue: "고객 눈높이 안내문 초안을 승인 대기 상태로 준비합니다.",
    contribution: 15,
  },

  /* ---- 오** 39세 · JB우리캐피탈 · 기업여신·기술신용 ---- */
  "rmo-biz-cashflow-gap": {
    summary: "최근 3개월 매출 입금 주기를 검토한 결과 특정 구간에 입금 공백이 반복되는 패턴이 확인되었습니다. 카드매출은 유지되고 있으나 현금 매출 입금 시점이 지연되는 신호가 있어 자금 압박 시점을 함께 정리했습니다.",
    situationAnalysis: "최근 원자재 비용 인상과 초기 시설투자 상환이 겹치며 매출 입금과 지출 사이의 시차가 커지는 시기입니다. 이 시차가 반복되면 운전자금 압박으로 이어질 수 있어 조기에 파악하는 것이 중요합니다.",
    evidence: [
      ["카드매출 변동", "최근 30일 카드매출 전월 대비 -18%(샘플)", "카드매출 집계(샘플)"],
      ["현금 매출 입금 지연", "평균 입금 지연 4.5일(샘플)", "매출 입금내역(샘플)"],
      ["입금 공백 구간", "매월 20~25일 반복 공백(샘플)", "입금 패턴 분석(샘플)"],
      ["기존 상담 메모", "재료비 부담 관련 상담 1건(최근 2개월)", "상담 메모(샘플)"],
    ],
    judgment: [
      "1) 입금 공백 구간과 상환일이 겹치는지 우선 확인합니다.",
      "2) 겹치는 경우 상환일 조정 후보를 다음 단계로 제시합니다.",
    ],
    nextTasks: ["상환일-입금공백 겹침 여부 확인", "필요 시 상환일 조정 후보 준비"],
    sources: [{ label: "매출 입금내역(샘플)", ref: "sample:biz-cashflow" }, { label: "카드매출 집계(샘플)", ref: "sample:card-sales" }],
    expectedValue: "자금 압박 시점을 조기에 파악해 상환 조정 검토로 연결합니다.",
    contribution: 25,
  },
  "rmo-biz-material-cost": {
    summary: "원자재 매입단가가 최근 상승하며 마진 압박 신호가 관측되었습니다. 업종 평균 대비 상승폭이 다소 높게 나타나 지속 모니터링이 필요한 것으로 판단됩니다.",
    situationAnalysis: "재료비 인상은 소상공인·소규모 제조업 전반에서 관측되는 흐름이지만, 이 사업장은 업종 평균보다 상승폭이 커 마진 압박이 더 클 가능성이 있습니다.",
    evidence: [
      ["원자재 매입단가 변동", "전분기 대비 +9.5%(샘플)", "매입 거래내역(샘플)"],
      ["업종 평균 상승폭", "동일 업종 평균 +6.2%(공개·샘플)", "업종 원자재 지수(공개·샘플)"],
      ["추정 마진율 변화", "약 -3.1%p 추정(샘플)", "원가율 추정(샘플)"],
    ],
    judgment: [
      "1) 업종 평균 대비 상승폭 차이의 원인을 추가 확인이 필요한 항목으로 표시합니다.",
      "2) 마진 압박이 지속될 경우 상환 여력 위험 신호로 연결합니다.",
    ],
    nextTasks: ["원자재 매입처 변경 검토 여부 확인(담당자)", "마진율 변화 추이 재점검 일정 등록"],
    sources: [{ label: "매입 거래내역(샘플)", ref: "sample:material-purchase" }, { label: "업종 원자재 지수(공개·샘플)", ref: "sample:industry-index" }],
    expectedValue: "마진 압박 정도를 근거와 함께 파악해 상환 여력 판단에 반영합니다.",
    contribution: 20,
  },
  "rmo-biz-lease-review": {
    summary: "장비 리스 계약 조건을 검토한 결과 상환 스케줄과 계약서 사본 간 일부 확인이 필요한 항목이 있어 이번 실행은 반려 처리되었습니다. 리스 계약서 원본 사본 연결이 확인되지 않아 재실행이 필요합니다.",
    situationAnalysis: "장비 리스는 초기 시설투자의 상당 부분을 차지하는 경우가 많아 계약 조건과 상환 스케줄의 정확한 확인이 중요합니다. 이번 실행에서는 계약서 사본 링크가 누락되어 근거가 충분하지 않은 상태로 판단했습니다.",
    evidence: [
      ["리스 계약서 사본", "연결되지 않음 — 재확인 필요", "장비 리스 계약 요약(샘플)"],
      ["리스 상환 스케줄", "월 상환액 데이터는 확인됨(샘플)", "리스 상환 스케줄"],
      ["계약 잔여 기간", "약 18개월 추정(샘플, 계약서 미확인)", "리스 상환 스케줄"],
    ],
    judgment: [
      "1) 계약서 사본 확보 후 재실행이 필요합니다(현재 근거 부족).",
      "2) 상환 스케줄만으로는 계약 조건 정합성을 확정할 수 없습니다.",
    ],
    nextTasks: ["장비 리스 계약서 사본 확보", "사본 확보 후 R(재실행)로 재검토"],
    sources: [{ label: "장비 리스 계약 요약(샘플, 미확인)", ref: "sample:lease-summary" }],
    expectedValue: "근거가 충분해지면 계약조건 정합성 확인 결과를 제공합니다.",
    contribution: 10,
    rejected: true,
  },
  "rmo-tech-credit": {
    summary: "기술신용평가 근거 자료의 최신성과 형식 요건을 확인했습니다. 특허·인증 현황 자료는 확인되었으나 일부 항목의 갱신일이 오래되어 보완이 필요한 것으로 나타났습니다. 평가 확정은 하지 않습니다.",
    situationAnalysis: "기술신용 근거 자료는 갱신 주기가 있어 오래된 자료로는 요건 충족 여부를 판단하기 어렵습니다. 특허·인증 항목은 존재하나 최신 갱신 여부 확인이 필요합니다.",
    evidence: [
      ["특허 현황", "보유 특허 1건 확인(샘플)", "특허/인증 현황(샘플)"],
      ["인증 갱신일", "최근 갱신일로부터 14개월 경과(샘플)", "기술신용평가 근거 요약(샘플)"],
      ["요건 충족 항목", "형식 요건 3/4 충족(샘플)", "요건 체크리스트"],
    ],
    judgment: [
      "1) 인증 갱신이 필요한 항목을 서류 보완 대상으로 표시합니다.",
      "2) 형식 요건 미충족 1건은 담당자 확인 후 보완 요청합니다.",
    ],
    nextTasks: ["인증 갱신 서류 요청", "형식 요건 미충족 항목 보완 안내"],
    sources: [{ label: "기술신용평가 근거 요약(샘플)", ref: "sample:tech-credit-summary" }],
    expectedValue: "기술신용 근거의 최신성 문제를 조기에 표시해 보완 절차로 연결합니다.",
    contribution: 20,
  },
  "rmo-biz-repayment-risk": {
    summary: "매출 입금 공백, 원자재 비용 증가, 리스 계약 확인 이슈를 종합한 결과 상환 여력에 대한 주의 신호가 확인되었습니다. 신용등급이나 한도는 산출하지 않으며, 참고 신호로만 제시합니다.",
    situationAnalysis: "개별 신호는 각각 중간 수준이지만 동시에 겹치는 경우 상환 여력에 복합적인 부담을 줄 수 있습니다. 특히 리스 계약 확인이 완료되지 않은 상태라 최종 판단에는 추가 확인이 필요합니다.",
    evidence: [
      ["매출 입금 공백 신호", "medium 등급(선행 분석 결과)", "선행 분석 결과 요약"],
      ["원자재 비용 신호", "medium 등급(선행 분석 결과)", "선행 분석 결과 요약"],
      ["리스 계약 확인", "미완료(반려) — 재확인 필요", "선행 분석 결과 요약"],
      ["종합 판단", "복합 주의 신호(확정 아님)", "위험 신호 종합"],
    ],
    judgment: [
      "1) 리스 계약 확인이 완료된 뒤 종합 판단을 다시 검토할 것을 권고합니다.",
      "2) 현재 시점에서는 사후관리 모니터링 대상으로 표시합니다.",
    ],
    nextTasks: ["리스 계약 확인 완료 후 재종합", "사후관리 모니터링 대상 등록"],
    sources: [{ label: "선행 분석 결과 종합", ref: "internal:biz-signal-merge" }],
    expectedValue: "복합 위험 신호를 조기에 제시해 사후관리 우선순위에 반영합니다.",
    contribution: 15,
  },
  "rmo-biz-report": {
    summary: "매출 입금 공백·원자재 비용·리스 계약·기술신용 근거·상환 위험도 분석 5건을 종합해 여신 담당자용 검토 보고서를 작성했습니다. 리스 계약서 확인이 미완료 상태임을 명시했으며, 실제 여신 승인·조건 변경 판단은 담당자가 합니다.",
    situationAnalysis: "이 케이스는 매출 압박과 비용 상승이 겹치는 전형적인 소상공인 여신 사후관리 대상입니다. 다만 핵심 근거 중 하나(리스 계약서)가 미확인 상태라 최종 판단 전 보완이 필요합니다.",
    evidence: [
      ["분석 완료 항목", "4/5건 완료", "선행 분석 결과"],
      ["보완 필요 항목", "리스 계약서 사본 1건", "선행 분석 결과"],
      ["종합 위험 신호", "복합 주의(확정 아님)", "상환 위험도 분석"],
      ["권고 우선순위", "리스 계약 확인 → 재종합 → 담당자 판단", "내부 권고 순서"],
    ],
    judgment: [
      "1) 리스 계약서 확인을 최우선 보완 항목으로 제시합니다.",
      "2) 보완 후 최종 여신 검토 판단은 담당자가 진행하도록 안내합니다.",
    ],
    nextTasks: ["리스 계약서 사본 확보 요청", "보완 후 담당자 최종 검토 일정 등록"],
    sources: [{ label: "전체 분석 결과", ref: "internal:biz-report-merge" }],
    expectedValue: "5개 분석을 하나의 검토 보고서로 종합해 담당자 판단 시간을 단축합니다.",
    contribution: 20,
  },

  /* ---- 윤** 76세 · 전북은행 · 보이스피싱 대응 ---- */
  "rmo-fraud-txn-pattern": {
    summary: "최근 거래에서 평소 패턴과 다른 고액 이체 시도가 확인되었습니다. 통상 거래 대비 이체 금액과 빈도가 급격히 늘어난 신호가 있어 이상거래 가능성을 우선 표시합니다. 사기 여부는 확정하지 않습니다.",
    situationAnalysis: "고령 고객의 거래 패턴은 통상 안정적인 소액·정기 거래가 많은데, 이번 케이스는 단기간 내 고액 이체 시도가 반복되는 이례적 패턴을 보입니다. 이런 패턴은 보이스피싱 초기 단계에서 자주 관측됩니다.",
    evidence: [
      ["이체 금액 변동", "평소 대비 이체 금액 4.8배 증가(샘플)", "최근 거래내역(샘플)"],
      ["이체 빈도", "최근 3일 내 이체 시도 3건(평소 월 1건 수준·샘플)", "최근 거래내역(샘플)"],
      ["신규 이체 대상", "최근 등록된 낯선 계좌로 이체 시도(샘플)", "이상거래 플래그(샘플)"],
      ["시간대 패턴", "평소와 다른 야간 시간대 시도 포함(샘플)", "최근 거래내역(샘플)"],
    ],
    judgment: [
      "1) 이상거래 신호가 다수 겹치므로 고령 고객 위험 패턴 검토로 즉시 핸드오프합니다.",
      "2) 사기 여부 확정 전까지는 '이상징후 확인 필요' 상태로만 표시합니다.",
    ],
    nextTasks: ["고령 고객 위험 패턴 분석으로 핸드오프", "송금 보류 필요성 검토 준비"],
    sources: [{ label: "최근 거래내역(샘플)", ref: "sample:fraud-txn" }],
    expectedValue: "이상거래 신호를 조기에 표시해 후속 확인 절차로 빠르게 연결합니다.",
    contribution: 25,
    riskLevel: "high",
  },
  "rmo-fraud-elderly-pattern": {
    summary: "고령 고객 대상 보이스피싱 전형 패턴 DB(샘플)와 비교한 결과 유사도가 높은 것으로 나타났습니다. 특히 '자녀 사칭·긴급 송금 요청' 유형과 유사한 정황이 확인되어 사기 확정은 아니지만 주의가 필요합니다.",
    situationAnalysis: "고령 고객 보이스피싱은 특정 서사(가족 사칭, 기관 사칭, 긴급 상황 강조)를 반복하는 경향이 있습니다. 이번 케이스의 거래 정황은 이러한 전형적 패턴과 다수 겹칩니다.",
    evidence: [
      ["패턴 유사도", "전형 패턴 DB 대비 유사도 78%(샘플)", "고령자 사기 유형 DB(샘플)"],
      ["최근 상담 이력", "최근 상담 없음(첫 이상 신호)", "최근 상담 이력(샘플)"],
      ["연령대 위험군", "70대 이상 고위험군 해당", "고령자 사기 유형 DB(샘플)"],
    ],
    judgment: [
      "1) 유사도가 높아 송금 보류 필요성 검토로 즉시 핸드오프합니다.",
      "2) 사기 확정은 하지 않으며, 고객 확인 질문지로 재확인할 것을 권고합니다.",
    ],
    nextTasks: ["송금 보류 필요성 검토로 핸드오프", "고객 확인 질문지 준비 요청"],
    sources: [{ label: "고령자 사기 유형 DB(샘플)", ref: "sample:elderly-fraud-db" }],
    expectedValue: "고령 고객 위험 패턴을 조기에 표시해 보류·확인 절차를 앞당깁니다.",
    contribution: 25,
    riskLevel: "high",
  },
  "rmo-fraud-consult-notes": {
    summary: "최근 창구·콜센터 상담 메모(샘플)를 재확인한 결과 사기 의심 정황을 시사하는 표현은 발견되지 않았습니다. 다만 상담 이력 자체가 없어 추가 확인이 필요한 상태입니다.",
    situationAnalysis: "상담 메모에 특별한 이상 징후가 기록되어 있지 않다는 것이 사기 가능성을 완전히 배제하는 근거는 아닙니다. 거래 이상징후와 고령 위험 패턴 결과를 함께 고려해야 합니다.",
    evidence: [
      ["상담 이력 존재 여부", "최근 6개월 내 상담 기록 없음", "상담 메모(샘플)"],
      ["키워드 스캔 결과", "의심 키워드 미검출(샘플)", "키워드 스캔"],
    ],
    judgment: [
      "1) 상담 메모만으로는 판단이 어려워 다른 신호와 함께 종합할 것을 권고합니다.",
      "2) 송금 보류 필요성 검토에는 참고 자료로만 반영합니다.",
    ],
    nextTasks: ["송금 보류 필요성 검토에 결과 반영", "필요 시 고객 직접 확인 질문지 병행"],
    sources: [{ label: "상담 메모(샘플)", ref: "sample:consult-notes" }],
    expectedValue: "상담 이력 유무를 확인해 종합 판단의 공백을 줄입니다.",
    contribution: 15,
    riskLevel: "high",
  },
  "rmo-fraud-hold-need": {
    summary: "거래 이상징후와 고령 고객 위험 패턴 결과를 종합한 결과 송금 보류 필요성이 높은 것으로 판단됩니다. 실제 보류·해제 결정은 담당자가 승인 절차를 거쳐 진행해야 합니다.",
    situationAnalysis: "이상거래 신호와 고령자 사기 유형 유사도가 모두 높게 나타나 즉시 확인이 필요한 상황입니다. 확정 판단 전 고객 확인 질문지를 통한 재확인이 우선되어야 합니다.",
    evidence: [
      ["거래 이상징후 결과", "high 등급(선행 분석)", "선행 분석 결과 요약"],
      ["고령 위험 패턴 결과", "high 등급, 유사도 78%(선행 분석)", "선행 분석 결과 요약"],
      ["상담 메모 결과", "특이사항 없음(참고)", "선행 분석 결과 요약"],
      ["종합 보류 필요성", "높음(확정 아님, 담당자 판단 필요)", "보류 필요성 판단 신호"],
    ],
    judgment: [
      "1) 송금 보류 필요성을 '높음'으로 표시하고 담당자 확인을 요청합니다.",
      "2) 확정 보류/해제는 반드시 담당자가 결정하도록 안내합니다.",
    ],
    nextTasks: ["담당자 보류 여부 최종 확인", "고객 확인 질문지 준비 및 진행"],
    sources: [{ label: "선행 분석 결과 종합", ref: "internal:fraud-signal-merge" }],
    expectedValue: "보류 필요성 근거를 명확히 제시해 담당자의 신속한 판단을 돕습니다.",
    contribution: 20,
    riskLevel: "high",
  },
  "rmo-fraud-report": {
    summary: "거래 이상징후·고령 고객 위험 패턴·상담 메모·송금 보류 필요성 분석 4건을 종합해 현장에서 고객에게 확인할 질문지를 작성했습니다. 사기 여부의 최종 판단과 송금 보류 결정은 담당자가 진행합니다.",
    situationAnalysis: "이 케이스는 고령 고객 보이스피싱 전형 패턴과 다수 겹치는 고위험 케이스로 즉시 대응이 필요합니다. 질문지를 통해 고객의 실제 상황을 확인한 뒤 담당자가 최종 판단해야 합니다.",
    evidence: [
      ["종합 위험도", "high(선행 분석 4건 종합)", "선행 분석 결과"],
      ["질문지 항목 수", "5개 확인 질문(샘플)", "확인 질문지 생성"],
      ["권고 대응", "대면 확인 우선 권고", "내부 대응 가이드"],
    ],
    judgment: [
      "1) 송금 실행 전 반드시 대면 또는 유선으로 고객 확인 질문지를 진행할 것을 권고합니다.",
      "2) 질문 결과에 따라 담당자가 보류 유지/해제를 최종 결정하도록 안내합니다.",
    ],
    nextTasks: ["고객 확인 질문지 진행", "결과에 따른 담당자 최종 승인"],
    sources: [{ label: "전체 분석 결과", ref: "internal:fraud-report-merge" }],
    expectedValue: "현장 확인 질문지로 대응 속도를 높이고 오탐 가능성을 함께 낮춥니다.",
    contribution: 20,
    riskLevel: "high",
  },

  /* ---- 송** 50세 · 전북은행 · 농수산 여신 사후관리 ---- */
  "rmo-agri-cashflow-gap": {
    summary: "최근 출하 대금 입금 주기를 검토한 결과 출하 시기와 입금 시점 사이에 반복적인 공백 구간이 확인되었습니다. 성수기 매출 변동으로 상환일이 특정 월에 몰리는 기존 패턴과도 연결되는 신호입니다.",
    situationAnalysis: "출하 대금은 정산 절차상 입금까지 시차가 발생하는 경우가 많아, 이 시차가 상환일과 겹치면 일시적 자금 압박으로 이어질 수 있습니다.",
    evidence: [
      ["출하 대금 입금 지연", "평균 12일 지연(샘플)", "출하대금 입금내역(샘플)"],
      ["공백 구간 반복성", "최근 2개 정산 주기 연속 발생(샘플)", "입금 패턴 분석(샘플)"],
      ["상환일 겹침 여부", "차기 상환일과 5일 이내 겹침", "상환 일정(샘플)"],
    ],
    judgment: [
      "1) 상환일과 입금 공백이 겹치는 것을 우선 신호로 표시합니다.",
      "2) 농자재 지출 분석 결과와 함께 종합할 것을 권고합니다.",
    ],
    nextTasks: ["상환일-입금 공백 겹침 담당자 확인", "농자재 지출 분석과 함께 종합"],
    sources: [{ label: "출하대금 입금내역(샘플)", ref: "sample:agri-cashflow" }],
    expectedValue: "입금 공백 시점을 조기에 파악해 상환 조정 검토에 반영합니다.",
    contribution: 25,
  },
  "rmo-agri-material-cost": {
    summary: "비료·사료 등 농자재 매입 지출이 전분기 대비 증가한 추세가 확인되었습니다. 계절적 요인과 일부 겹치지만 상승폭이 다소 높아 지속 모니터링이 필요합니다.",
    situationAnalysis: "농자재 가격은 계절과 원자재 시장에 따라 변동이 있으나, 이번 케이스는 평년 대비 상승폭이 더 커 비용 부담이 누적되고 있는 것으로 보입니다.",
    evidence: [
      ["농자재 매입 지출 변동", "전분기 대비 +11%(샘플)", "농자재 매입내역(샘플)"],
      ["주요 품목", "사료·비료 매입 비중 확대(샘플)", "농자재 매입내역(샘플)"],
      ["평년 대비 편차", "평년 동기 대비 +6%p 추가 상승(샘플)", "농자재 매입내역(샘플)"],
    ],
    judgment: [
      "1) 지출 증가 추세를 상환 위험도 종합에 반영합니다.",
      "2) 시설 보수 비용과 중복되는 지출 시기가 있는지 확인이 필요합니다.",
    ],
    nextTasks: ["시설 보수 비용과 지출 시기 중복 여부 확인", "상환 위험도 종합에 결과 반영"],
    sources: [{ label: "농자재 매입내역(샘플)", ref: "sample:agri-material" }],
    expectedValue: "지출 증가 추세를 조기에 표시해 사후관리 우선순위에 반영합니다.",
    contribution: 20,
  },
  "rmo-agri-facility-cost": {
    summary: "하우스·축사 등 시설 보수 비용 견적(샘플)을 확인한 결과 일시적으로 큰 지출이 예정되어 있는 것으로 나타났습니다. 계절적으로 보수가 집중되는 시기와 겹쳐 부담이 커질 수 있습니다.",
    situationAnalysis: "시설 보수는 계절 전환기에 집중되는 경향이 있어, 이 시기에 다른 지출(농자재 등)과 겹치면 단기적으로 자금 부담이 커질 수 있습니다.",
    evidence: [
      ["보수 견적 금액대", "샘플 견적 기준 중간 규모(구체 금액 비공개)", "시설 보수 견적(샘플)"],
      ["예정 시기", "차기 계절 전환기(1개월 이내)", "시설 보수 견적(샘플)"],
      ["과거 보수 이력", "최근 2년 내 유사 보수 1건(샘플)", "시설 보수 견적(샘플)"],
    ],
    judgment: [
      "1) 보수 지출 시기와 농자재 지출 시기 중복 여부를 우선 확인합니다.",
      "2) 중복되는 경우 상환 위험도 종합에서 가중치를 높여 반영합니다.",
    ],
    nextTasks: ["보수 지출 시기 확정 여부 담당자 확인", "지출 중복 시 상환 위험도 재종합"],
    sources: [{ label: "시설 보수 견적(샘플)", ref: "sample:agri-facility" }],
    expectedValue: "시설 보수 비용 부담 시점을 조기에 표시해 자금 계획에 반영합니다.",
    contribution: 20,
  },
  "rmo-agri-seasonal-data": {
    summary: "작목별 계절성 지수와 지역 기상 데이터(공개)를 참고한 결과 이번 시기는 통상 매출이 낮아지는 계절적 저점 구간과 겹치는 것으로 확인되었습니다. 매출 확정 산출은 하지 않습니다.",
    situationAnalysis: "계절적 저점 구간에는 출하량과 단가가 함께 낮아지는 경향이 있어, 이 시기의 지출 증가와 겹치면 체감 자금 압박이 더 클 수 있습니다.",
    evidence: [
      ["계절성 지수", "연중 저점 구간(공개 지수 기준·샘플)", "계절성 지수(샘플)"],
      ["지역 기상 데이터", "평년 대비 강수량 다소 많음(공개·샘플)", "지역 기상 데이터(공개)"],
      ["과거 동기 매출 패턴", "최근 2년 동일 시기 매출 감소 반복(샘플)", "계절성 지수(샘플)"],
    ],
    judgment: [
      "1) 계절적 저점과 지출 증가가 겹치는 시기임을 상환 위험도 종합에 반영합니다.",
      "2) 매출 확정 수치는 산출하지 않고 참고 신호로만 제시합니다.",
    ],
    nextTasks: ["계절적 저점 반영해 상환 위험도 재종합", "다음 계절 매출 회복 시점 재확인 일정 등록"],
    sources: [{ label: "계절성 지수(샘플)", ref: "sample:agri-seasonal" }, { label: "지역 기상 데이터(공개)", ref: "sample:regional-weather" }],
    expectedValue: "계절 요인을 근거로 매출 변동 원인을 설명해 오해를 줄입니다.",
    contribution: 15,
  },
  "rmo-agri-repayment-risk": {
    summary: "입금 공백·농자재 지출·시설 보수 비용·계절성 데이터를 종합한 결과 이번 상환 주기에 복합적인 주의 신호가 확인되었습니다. 상환유예 승인은 확정하지 않으며 참고 신호로만 제시합니다.",
    situationAnalysis: "여러 지출 요인이 계절적 저점 구간과 겹치며 상환 여력에 복합적인 부담을 주는 것으로 판단됩니다. 사후관리 조치가 필요한 시점으로 보입니다.",
    evidence: [
      ["입금 공백 신호", "medium 등급(선행 분석)", "선행 분석 결과 요약"],
      ["농자재 지출 신호", "medium 등급(선행 분석)", "선행 분석 결과 요약"],
      ["시설 보수 비용 신호", "medium 등급(선행 분석)", "선행 분석 결과 요약"],
      ["계절성 요인", "저점 구간 겹침(선행 분석)", "선행 분석 결과 요약"],
    ],
    judgment: [
      "1) 복합 신호를 근거로 사후관리 조치 보고서 작성으로 핸드오프합니다.",
      "2) 상환유예 등 실제 조치는 담당자 승인 후 진행하도록 안내합니다.",
    ],
    nextTasks: ["사후관리 조치 보고서 작성으로 핸드오프", "상환유예 검토는 담당자 승인 대기"],
    sources: [{ label: "선행 분석 결과 종합", ref: "internal:agri-signal-merge" }],
    expectedValue: "복합 위험 신호를 조기에 제시해 사후관리 우선순위를 명확히 합니다.",
    contribution: 15,
  },
  "rmo-agri-report": {
    summary: "입금 공백·농자재 지출·시설 보수 비용·계절성 데이터·상환 위험도 분석 5건을 종합해 사후관리 조치 보고서를 작성했습니다. 재검토 일정과 상환유예 검토 후보를 정리했으며, 최종 조치 승인은 담당자가 합니다.",
    situationAnalysis: "이 케이스는 계절적 저점과 지출 증가가 겹치는 시기의 전형적인 농수산 여신 사후관리 대상입니다. 단기 완충 조치를 검토한 뒤 다음 계절 회복 시점에 재점검하는 흐름을 권고합니다.",
    evidence: [
      ["분석 완료 항목", "5/5건 완료", "선행 분석 결과"],
      ["종합 위험 신호", "복합 주의(확정 아님)", "상환 위험도 분석"],
      ["권고 조치", "상환유예 검토 + 재점검 일정 등록", "내부 권고 순서"],
    ],
    judgment: [
      "1) 단기 상환유예 검토를 1순위 후보로 제시합니다.",
      "2) 다음 계절 회복 시점에 재점검 일정을 등록할 것을 권고합니다.",
    ],
    nextTasks: ["상환유예 검토 담당자 승인 대기", "다음 계절 재점검 일정 등록"],
    sources: [{ label: "전체 분석 결과", ref: "internal:agri-report-merge" }],
    expectedValue: "5개 분석을 하나의 사후관리 보고서로 종합해 담당자 판단 시간을 단축합니다.",
    contribution: 20,
  },
};

function rmoDeliverableTemplate(agentId) {
  return RMO_DELIVERABLE_TEMPLATES[agentId] || {
    summary: "내부 업무 참고용 요약을 생성했습니다. 담당자 검토가 필요합니다.",
    situationAnalysis: "케이스 상황을 참고 자료 기준으로 정리했습니다.",
    evidence: [["요약", "근거 기반 참고 결과", "내부 샘플"]],
    judgment: ["1) 담당자 검토 후 다음 단계를 진행합니다."],
    nextTasks: ["담당자 검토"],
    sources: [{ label: "내부 샘플 데이터", ref: "internal:sample" }],
    expectedValue: "담당자 검토를 돕는 참고 결과입니다.",
    contribution: 20,
  };
}

function rmoAgentDisplayName(id) {
  const agent = rmOfficerAgents.find((item) => item.id === id);
  return agent ? agent.displayName : (id || "-");
}

/* 개별 에이전트 MD 산출물 객체(마크다운 body 포함). db insert는 services에서.
   구조: Summary → 상황 분석 → 근거 표(4~6행) → 판단 및 권고(단계별) → 다음 조치 태스크(체크리스트) →
   예상 기대값 → 한계 및 주의(가드레일 고지). */
function rmoBuildAgentDeliverable(caseRow, agentId, overrides) {
  const agent = rmOfficerAgents.find((item) => item.id === agentId) || rmOfficerAgents[0];
  const template = rmoDeliverableTemplate(agentId);
  const summary = (overrides && overrides.summary) || template.summary;
  const situationAnalysis = (overrides && overrides.situationAnalysis) || template.situationAnalysis || "";
  const evidence = (overrides && overrides.evidence) || template.evidence;
  const judgment = (overrides && overrides.judgment) || template.judgment || [];
  const nextTasks = (overrides && overrides.nextTasks) || template.nextTasks || [];
  const sources = (overrides && overrides.sources) || template.sources;
  const fileName = agent.deliverableFile || `${agent.id}.md`;
  const createdAt = new Date().toISOString().slice(0, 10);
  const body = [
    `---`,
    `tags: area/rm type/agent-result status/active`,
    `case: ${caseRow.caseNo}`,
    `agent: ${agent.displayName}`,
    `org: ${agent.org}`,
    `date: ${createdAt}`,
    `up: [[RM 업무지원 포털]]`,
    `aliases: ${agent.deliverableFile || fileName}`,
    `note: 내부 업무 참고용 · 담당자 검토 필요`,
    `---`,
    ``,
    `# ${agent.displayName} 결과 — ${caseRow.theme}`,
    ``,
    `## 1. Summary (요약)`,
    summary,
    ``,
    `- 관련 케이스: ${caseRow.caseNo} · ${caseRow.customerAlias || "익명 고객"} · ${caseRow.region}`,
    `- 업무 목적: ${caseRow.goal || "담당 RM 검토에 필요한 근거와 다음 조치 정리"}`,
    `- 직원 확인 포인트: 실제 승인·금리·한도 산정이 아니라 검토 후보와 근거 확인입니다.`,
    ``,
    `## 상황 분석`,
    situationAnalysis,
    ``,
    `### 케이스 원문 요약`,
    caseRow.situation,
    ``,
    `### 우선순위 근거`,
    caseRow.priorityReason || "-",
    ``,
    `## 근거`,
    `| 항목 | 내용 | 출처 |`,
    `| --- | --- | --- |`,
    ...evidence.map((row) => `| ${row[0]} | ${row[1]} | ${row[2]} |`),
    ``,
    `## 판단 및 권고`,
    ...judgment.map((line) => `- ${line}`),
    ``,
    `## 다음 조치 태스크`,
    ...nextTasks.map((task) => `- [ ] ${task}`),
    ``,
    `## 예상 기대값`,
    template.expectedValue,
    ``,
    `## 담당자 확인 포인트`,
    `- 결과 문장을 그대로 고객에게 발송하지 말고 담당 RM이 표현과 적용 여부를 확인합니다.`,
    `- 금액·기한·정책자금 대상 여부는 실제 업무시스템에서 재확인합니다.`,
    ``,
    `## 한계 및 주의`,
    `> 이 문서는 실제 승인·금리·한도·신용평가·정책자금 대상 확정이 아닙니다. 담당 RM 검토가 필요합니다.`,
  ].join("\n");
  return {
    kind: "agent",
    agentId: agent.id,
    caseId: caseRow.id,
    title: `${agent.displayName} 결과`,
    fileName,
    summary,
    situationAnalysis,
    evidenceRows: evidence.map((row) => ({ item: row[0], detail: row[1], source: row[2] })),
    judgment,
    nextTasks,
    sources,
    contribution: (overrides && overrides.contribution) || template.contribution,
    expectedValue: template.expectedValue,
    body,
    reviewRequired: true,
    createdAt,
  };
}

/* 통합본 MD 산출물 — 개별 md를 링크로 연결 + 관여율 표 + 출처 종합 */
function rmoBuildIntegratedDeliverable(caseRow, agentDeliverables) {
  const createdAt = new Date().toISOString().slice(0, 10);
  const links = agentDeliverables.map((d) => ({ fileName: d.fileName, deliverableId: d.id, title: d.title, agentId: d.agentId }));
  const allSources = [];
  agentDeliverables.forEach((d) => (d.sources || []).forEach((s) => {
    if (!allSources.some((x) => x.ref === s.ref)) allSources.push(s);
  }));
  const contributionRows = agentDeliverables.map((d) => ({
    agent: rmoAgentDisplayName(d.agentId),
    fileName: d.fileName,
    data: (d.sources || []).map((s) => s.label).join(", "),
    date: d.createdAt,
    contribution: d.contribution,
  }));
  const caseTypeLabel = (RMO_CASE_TYPES[caseRow.caseType] || {}).label || caseRow.caseType || "-";
  const sourceLabels = (caseRow.prioritySources || []).map((s) => s.label).join(" · ") || "담당자 입력/샘플 근거";
  const policyCandidateByType = {
    disasterRisk: "재해 피해 확인 서류, 상환유예 검토, 정책 재해자금 안내 후보",
    repaymentCare: "상환일 분산, 상환유예 검토, 고객 리마인드 후보",
    dailyFinance: "생활비 공백 안내, 장학금/학사일정 확인, 고금리 대체 이용 예방 안내",
    policyStartup: "정책자금 기본요건, 지역 협약대출, 필요 서류 체크리스트",
    bizCreditReferral: "기업여신 검토 보고서, 기술신용 근거 보완, 리스 계약 확인",
    fraudResponse: "송금 보류 검토, 담당자 콜백, 고객 확인 질문지",
    agriPostMonitoring: "농수산 여신 사후관리, 출하대금 입금 지연 확인, 상환유예 검토",
  };
  const policyCandidate = policyCandidateByType[caseRow.caseType] || "담당 RM 검토 후보, 고객 안내 초안, 추가 근거 확인";
  const body = [
    `---`,
    `tags: area/rm type/integrated-report status/active`,
    `case: ${caseRow.caseNo}`,
    `type: 통합본`,
    `date: ${createdAt}`,
    `up: [[RM 업무지원 포털]]`,
    `aliases: 통합본.md ${caseRow.caseNo}`,
    `note: 내부 업무 참고용 · 담당자 검토 필요`,
    `---`,
    ``,
    `# 통합 리포트 — ${caseRow.theme}`,
    ``,
    `## 1. Summary (요약)`,
    `${caseRow.caseNo} ${caseRow.theme} 케이스는 ${agentDeliverables.length}개 개별 산출물을 종합해 담당 RM이 검토할 상황, 위험 신호, 근거 데이터, 다음 조치 후보를 한 문서로 묶은 통합본입니다.`,
    ``,
    `- 고객/지역: ${caseRow.customerAlias || "익명 고객"} · ${caseRow.region} · ${caseRow.bank}`,
    `- 상담 유형: ${caseTypeLabel}`,
    `- 처리 목표: ${caseRow.goal || "담당 RM 검토"}`,
    `- 담당자 확인 포인트: 실제 승인·거절·금리·한도·신용평가·정책자금 대상 확정은 이 문서로 처리하지 않습니다.`,
    ``,
    `## 2. 상황 분석`,
    `### 고객 상황`,
    `${caseRow.situation}`,
    ``,
    `### 위험 신호`,
    `${caseRow.priorityReason || "위험 신호는 담당자 입력과 샘플 근거를 기준으로 정리했습니다."}`,
    ``,
    `### SLA/긴급도`,
    `- 위험도: ${RMO_PRIORITY_LABELS[caseRow.priority] || caseRow.priority || caseRow.riskLevel || "-"} / ${caseRow.riskLevel || "-"}`,
    `- SLA: ${caseRow.dueAt || "-"}까지 담당자 검토 필요`,
    `- 근거 데이터: ${sourceLabels}`,
    ``,
    `## 3. 에이전트 실행 결과`,
    `### 실행 에이전트 목록`,
    ...agentDeliverables.map((d) => `- ${rmoAgentDisplayName(d.agentId)}: [[${d.fileName}]] · ${d.summary}`),
    ``,
    `### 사용 에이전트/스킬 및 산출물`,
    `| 에이전트 | 산출물.md | 사용 데이터 | 날짜 | 관여율 |`,
    `| --- | --- | --- | --- | --- |`,
    ...contributionRows.map((r) => `| ${r.agent} | ${r.fileName} | ${r.data} | ${r.date} | ${r.contribution}% |`),
    ``,
    `### 실행 상태`,
    `- 개별 산출물 ${agentDeliverables.length}건이 통합본에 연결되었습니다.`,
    `- high/critical 또는 고객 접점 항목은 사람 승인 대기 상태로 남깁니다.`,
    ``,
    `## 4. 정책/여신 검토 후보`,
    `### 가능한 지원 후보`,
    `- ${policyCandidate}`,
    ``,
    `### 확인 필요 서류`,
    `- 상담 메모, 고객 확인 정보, 공개/샘플 근거 최신성, 필요 시 계약·매출·상환 일정 후보`,
    ``,
    `### 제한사항`,
    `- 이 문서는 검토 후보와 질문을 정리합니다. 실제 금융거래 실행, 여신 승인, 조건 변경, 정책자금 대상 확정은 담당자/승인권자가 별도로 수행합니다.`,
    ``,
    `## 5. 다음 액션`,
    `- 개별 산출물의 근거 표를 확인하고 부족한 데이터는 고객 정보 버튼에서 다시 확인합니다.`,
    `- 필요 시 고객 안내 초안을 열람하고 표현·발송 여부를 승인합니다.`,
    `- 반려 또는 근거 부족 산출물은 R 재실행으로 보완합니다.`,
    `- 승인 필요 항목은 A 승인 또는 승인 라우팅에서 처리합니다.`,
    ``,
    `## 6. 감사 기록`,
    `### 생성 시각`,
    `- ${createdAt}`,
    ``,
    `### 사용 데이터`,
    ...allSources.map((s) => `- ${s.label} (${s.ref})`),
    ``,
    `### 실행 에이전트`,
    ...contributionRows.map((r) => `- ${r.agent}: ${r.fileName} · ${r.contribution}%`),
    ``,
    `### 사람 승인 대기 여부`,
    `- ${caseRow.requiresHumanReview || ["high", "critical"].includes(caseRow.riskLevel) ? "필요: 담당 RM 또는 승인권자 검토 후 진행" : "내부 참고: 담당자 확인 후 다음 단계 진행"}`,
    ``,
    `> 통합본은 개별 산출물의 요약이며 실제 금융 판단이 아닙니다. 담당 RM 검토가 필요합니다.`,
  ].join("\n");
  return {
    kind: "integrated",
    agentId: "rmo-triage",
    caseId: caseRow.id,
    title: `${caseRow.caseNo} 통합 리포트`,
    fileName: "통합본.md",
    summary: `${caseRow.theme} — 개별 산출물 ${agentDeliverables.length}건을 통합했습니다.`,
    links,
    contributionRows,
    sources: allSources,
    contribution: 100,
    body,
    reviewRequired: true,
    createdAt,
  };
}
