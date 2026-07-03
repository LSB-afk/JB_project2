/* 전세사기 보호 하네스 — 공공데이터 adapter (MoveValue의 가격 데이터 엔진 아이디어 흡수).
   - API 키는 브라우저에 존재하지 않는다: 로컬 프록시(scripts/api-proxy.mjs)가 환경변수로만 읽는다.
   - ?live=1 + 프록시 정상일 때만 live_api. 그 외에는 익명 스냅샷(snapshot) → fallback 순으로 동작한다.
   - fallback일 때 위험도를 낮게 확정하지 않는다 — "데이터 부족으로 담당자 확인 필요"로 표현한다. */

const JPO_DATASET_LABELS = {
  seoulAptInfo: "서울시 공동주택 아파트 정보(OpenAptInfo)",
  seoulRent: "서울시 부동산 전월세가 정보",
  aptTrade: "국토부 아파트 매매 실거래가",
  aptRent: "국토부 아파트 전월세 실거래가",
  rhTrade: "국토부 연립다세대 매매 실거래가",
  rhRent: "국토부 연립다세대 전월세 실거래가",
  shTrade: "국토부 단독/다가구 매매 실거래가",
  shRent: "국토부 단독/다가구 전월세 실거래가",
  officetelRent: "국토부 오피스텔 전월세 실거래가",
};

/* 익명 지역 스냅샷(모의) — 실거래 API 미연결 시 기준값. 단위: 원, 개략 중앙값.
   실제 통계가 아니라 데모용 스냅샷임을 화면에 "샘플/스냅샷 기준"으로 항상 표시한다. */
const JPO_MARKET_SNAPSHOT = {
  "11500": { region: "서울 강서구 화곡동", housing: {
    apartment: { saleMedian: 780000000, jeonseMedian: 430000000, tradeCount: 42, rentCount: 61 },
    rowHouse: { saleMedian: 285000000, jeonseMedian: 235000000, tradeCount: 18, rentCount: 27 },
    multiHousehold: { saleMedian: 520000000, jeonseMedian: 190000000, tradeCount: 7, rentCount: 12 },
    officetel: { saleMedian: 210000000, jeonseMedian: 165000000, tradeCount: 9, rentCount: 22 },
  }},
  "11620": { region: "서울 관악구 신림동", housing: {
    apartment: { saleMedian: 720000000, jeonseMedian: 410000000, tradeCount: 35, rentCount: 48 },
    rowHouse: { saleMedian: 260000000, jeonseMedian: 215000000, tradeCount: 14, rentCount: 25 },
    multiHousehold: { saleMedian: 480000000, jeonseMedian: 175000000, tradeCount: 6, rentCount: 10 },
    officetel: { saleMedian: 195000000, jeonseMedian: 150000000, tradeCount: 8, rentCount: 31 },
  }},
  "11530": { region: "서울 구로구 개봉동", housing: {
    apartment: { saleMedian: 650000000, jeonseMedian: 380000000, tradeCount: 29, rentCount: 40 },
    rowHouse: { saleMedian: 240000000, jeonseMedian: 200000000, tradeCount: 12, rentCount: 19 },
    multiHousehold: { saleMedian: 450000000, jeonseMedian: 165000000, tradeCount: 5, rentCount: 9 },
    officetel: { saleMedian: 180000000, jeonseMedian: 140000000, tradeCount: 6, rentCount: 17 },
  }},
  "28177": { region: "인천 미추홀구 주안동", housing: {
    apartment: { saleMedian: 320000000, jeonseMedian: 210000000, tradeCount: 21, rentCount: 30 },
    rowHouse: { saleMedian: 165000000, jeonseMedian: 140000000, tradeCount: 9, rentCount: 14 },
    multiHousehold: { saleMedian: 300000000, jeonseMedian: 120000000, tradeCount: 4, rentCount: 7 },
    officetel: { saleMedian: 140000000, jeonseMedian: 110000000, tradeCount: 5, rentCount: 12 },
  }},
  "30170": { region: "대전 서구 둔산동", housing: {
    apartment: { saleMedian: 430000000, jeonseMedian: 290000000, tradeCount: 26, rentCount: 33 },
    rowHouse: { saleMedian: 175000000, jeonseMedian: 145000000, tradeCount: 8, rentCount: 11 },
    multiHousehold: { saleMedian: 330000000, jeonseMedian: 125000000, tradeCount: 4, rentCount: 6 },
    officetel: { saleMedian: 150000000, jeonseMedian: 115000000, tradeCount: 5, rentCount: 13 },
  }},
  "26350": { region: "부산 수영구 광안동", housing: {
    apartment: { saleMedian: 560000000, jeonseMedian: 330000000, tradeCount: 31, rentCount: 39 },
    rowHouse: { saleMedian: 210000000, jeonseMedian: 170000000, tradeCount: 10, rentCount: 16 },
    multiHousehold: { saleMedian: 380000000, jeonseMedian: 140000000, tradeCount: 5, rentCount: 8 },
    officetel: { saleMedian: 170000000, jeonseMedian: 130000000, tradeCount: 7, rentCount: 18 },
  }},
};

function jpoEstimateOfficialPrice(saleMedian) {
  // 공시가격 원본 API 미연동 상태의 "추정" 공시가격(개략 70% 가정) — 항상 '추정' 표기로만 사용
  return Math.round(Number(saleMedian || 0) * 0.7);
}

function jpoMarketSnapshotSync(housingType, lawdCode) {
  const region = JPO_MARKET_SNAPSHOT[String(lawdCode)];
  const values = region && region.housing[housingType];
  if (!values) {
    return {
      sourceMode: "fallback",
      source: "실거래 API 미연결 · 스냅샷 없음",
      region: region ? region.region : String(lawdCode),
      saleMedian: 0, jeonseMedian: 0, comparableTradeCount: 0, comparableRentCount: 0,
    };
  }
  return {
    sourceMode: "snapshot",
    source: "공공데이터 스냅샷(모의)",
    region: region.region,
    saleMedian: values.saleMedian,
    jeonseMedian: values.jeonseMedian,
    comparableTradeCount: values.tradeCount,
    comparableRentCount: values.rentCount,
  };
}

async function jpoFetchMarketDataset(dataset, lawdCode, dealYm) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  try {
    const url = `${RUNTIME_CONFIG.apiProxyBase}/jeonse/market?dataset=${encodeURIComponent(dataset)}&lawd=${encodeURIComponent(lawdCode)}&ym=${encodeURIComponent(dealYm)}`;
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    if (!data || typeof data.median !== "number") throw new Error("empty");
    return data; // { median, count, source, dataset }
  } finally {
    clearTimeout(timer);
  }
}

/* 시세 보강 진입점 — 항상 { sourceMode, saleMedian, jeonseMedian, comparable*Count, source } 반환 */
async function fetchJeonseMarketData({ housingType, lawdCode, dealYm }) {
  const snapshot = jpoMarketSnapshotSync(housingType, lawdCode);
  if (typeof isLive !== "function" || !isLive()) return snapshot;
  const mapping = JPO_HOUSING_TYPES[housingType] || {};
  try {
    const [trade, rent] = await Promise.all([
      mapping.trade ? jpoFetchMarketDataset(mapping.trade, lawdCode, dealYm) : Promise.resolve(null),
      mapping.rent ? jpoFetchMarketDataset(mapping.rent, lawdCode, dealYm) : Promise.resolve(null),
    ]);
    if (!trade && !rent) return snapshot;
    return {
      sourceMode: "live_api",
      source: (rent && rent.source) || (trade && trade.source) || "국토부/서울 실거래 API",
      region: snapshot.region,
      saleMedian: trade ? trade.median : snapshot.saleMedian,
      jeonseMedian: rent ? rent.median : snapshot.jeonseMedian,
      comparableTradeCount: trade ? trade.count : 0,
      comparableRentCount: rent ? rent.count : 0,
    };
  } catch (error) {
    return snapshot.sourceMode === "snapshot" ? snapshot : { ...snapshot, sourceMode: "fallback" };
  }
}
