// 전세보호 데모 전용 공공데이터 프록시 (로컬 CORS 우회, :8020).
// 키는 환경변수로만 읽는다 — 코드/저장소에 하드코딩 금지. 키가 없으면 503 → 앱은 스냅샷/샘플 fallback.
// 사용: MOLIT_SERVICE_KEY=<국토부 Decoding 키> [SEOUL_OPEN_API_KEY=<서울 키>] npm run demo:proxy
//
// 엔드포인트:
//   GET /jeonse/market?dataset=<key>&lawd=<법정동5>&ym=<YYYYMM>
//       dataset: aptTrade|aptRent|rhTrade|rhRent|shTrade|shRent|officetelRent
//       응답 { median, count, source, dataset } — 실거래 중앙값(원)
//   GET /jeonse/seoul-status         서울 열린데이터 키 인증 상태 프로브(파싱 단정 없이 연결만 확인)
//   GET /jeonse?lawd=&ym=&kind=      (하위호환) 연립다세대 매매/전월세 — 기존 ?live=1 전세 데모용
import http from "node:http";

/* 국토부(data.go.kr) dataset 정의 — dataset별 전용 키 → 공용 키 체인으로 fallback */
const MOLIT_COMMON_KEYS = ["MOLIT_SERVICE_KEY", "MOLIT_API_KEY", "PUBLIC_DATA_API_KEY", "DATA_GO_KR_KEY"];
const MOLIT_DATASETS = {
  aptTrade: { path: "RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade", field: "dealAmount", keys: ["MOLIT_APT_TRADE_KEY"], label: "국토부 아파트 매매 실거래가" },
  aptRent: { path: "RTMSDataSvcAptRent/getRTMSDataSvcAptRent", field: "deposit", keys: ["MOLIT_APT_RENT_KEY"], label: "국토부 아파트 전월세 실거래가" },
  rhTrade: { path: "RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade", field: "dealAmount", keys: ["MOLIT_ROW_HOUSE_TRADE_KEY"], label: "국토부 연립다세대 매매 실거래가" },
  rhRent: { path: "RTMSDataSvcRHRent/getRTMSDataSvcRHRent", field: "deposit", keys: ["MOLIT_ROW_HOUSE_RENT_KEY"], label: "국토부 연립다세대 전월세 실거래가" },
  shTrade: { path: "RTMSDataSvcSHTrade/getRTMSDataSvcSHTrade", field: "dealAmount", keys: ["MOLIT_DETACHED_HOUSE_TRADE_KEY"], label: "국토부 단독/다가구 매매 실거래가" },
  shRent: { path: "RTMSDataSvcSHRent/getRTMSDataSvcSHRent", field: "deposit", keys: ["MOLIT_DETACHED_HOUSE_RENT_KEY"], label: "국토부 단독/다가구 전월세 실거래가" },
  officetelRent: { path: "RTMSDataSvcOffiRent/getRTMSDataSvcOffiRent", field: "deposit", keys: ["MOLIT_OFFICETEL_RENT_KEY"], label: "국토부 오피스텔 전월세 실거래가" },
};
const SEOUL_KEYS = ["SEOUL_OPEN_API_KEY", "SEOUL_API_KEY", "MOVEVALUE_SEOUL_OPEN_API_KEY"];

function pickKey(names) {
  for (const name of names) {
    if (process.env[name]) return process.env[name];
  }
  return null;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

async function fetchMolitMedian(dataset, lawd, ym) {
  const config = MOLIT_DATASETS[dataset];
  const key = pickKey([...config.keys, ...MOLIT_COMMON_KEYS]);
  if (!key) return { status: 503, body: { error: `no api key (env: ${config.keys[0]} 또는 MOLIT_SERVICE_KEY 계열)` } };
  const q = new URLSearchParams({ serviceKey: key, LAWD_CD: lawd || "11500", DEAL_YMD: ym || "202605", numOfRows: "200" });
  const response = await fetch(`https://apis.data.go.kr/1613000/${config.path}?${q}`);
  const xml = await response.text();
  const re = new RegExp(`<${config.field}>\\s*([\\d,]+)\\s*</${config.field}>`, "g");
  const amounts = [...xml.matchAll(re)]
    .map((m) => Number(m[1].replace(/,/g, "")) * 10000) // 만원 → 원
    .filter((n) => n > 0);
  return { status: 200, body: { median: median(amounts), count: amounts.length, source: config.label, dataset } };
}

async function seoulStatusProbe() {
  const key = pickKey(SEOUL_KEYS);
  if (!key) return { status: 503, body: { error: "no seoul api key (SEOUL_OPEN_API_KEY 계열)" } };
  // 응답 스키마를 단정하지 않고 인증/연결 상태만 프로브한다 (OpenAptInfo 1건 요청)
  const response = await fetch(`http://openapi.seoul.go.kr:8088/${key}/json/OpenAptInfo/1/1/`);
  const text = await response.text();
  const authFailed = /INFO-100|인증키/.test(text) && !/INFO-000/.test(text);
  return { status: 200, body: { connected: response.ok && !authFailed, source: "서울시 공동주택 아파트 정보(OpenAptInfo)", probe: response.status } };
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // 로컬 데모 전용
  const u = new URL(req.url, "http://x");
  const send = (status, body) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  };
  try {
    if (u.pathname === "/jeonse/market") {
      const dataset = u.searchParams.get("dataset");
      if (!MOLIT_DATASETS[dataset]) { send(400, { error: `unknown dataset: ${dataset}` }); return; }
      const result = await fetchMolitMedian(dataset, u.searchParams.get("lawd"), u.searchParams.get("ym"));
      send(result.status, result.body);
      return;
    }
    if (u.pathname === "/jeonse/seoul-status") {
      const result = await seoulStatusProbe();
      send(result.status, result.body);
      return;
    }
    if (u.pathname === "/jeonse") {
      // 하위호환: 기존 메인 데모(?live=1 전세 사전 점검)가 사용하는 연립다세대 값
      const kind = u.searchParams.get("kind") === "rent" ? "rhRent" : "rhTrade";
      const result = await fetchMolitMedian(kind, u.searchParams.get("lawd"), u.searchParams.get("ym"));
      if (result.status !== 200) { send(result.status, result.body); return; }
      send(200, { estimatedPrice: result.body.median, samples: result.body.count, source: result.body.source });
      return;
    }
    send(404, { error: "not found" });
  } catch (error) {
    send(502, { error: String(error) });
  }
});

server.listen(8020, () => console.log("[api-proxy] http://127.0.0.1:8020 — /jeonse/market (MOLIT 7종) · /jeonse/seoul-status · /jeonse(하위호환)"));
