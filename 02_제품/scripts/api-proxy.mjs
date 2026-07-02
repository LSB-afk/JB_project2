// 데모 전용 국토부 연립다세대(빌라) 실거래가 프록시 (로컬 CORS 우회).
// 사용: DATA_GO_KR_KEY=<Decoding 인증키> npm run demo:proxy
// GET /jeonse?lawd=<법정동코드5>&ym=<YYYYMM>&kind=trade|rent
//   kind=trade(기본) → 연립다세대 매매 평균가(전세가율 분모=주변 시세)
//   kind=rent        → 연립다세대 전월세 보증금 평균(참고)
// 응답 { estimatedPrice, samples, source }. 키 없으면 503(앱은 폴백값 사용).
// 브라우저 라이브 데모(?live=1)에서만 호출됨.
import http from "node:http";

const KEY = process.env.DATA_GO_KR_KEY;
// data.go.kr 오픈API 엔드포인트 (연립다세대 = RH)
const ENDPOINT = {
  trade: "https://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade", // 매매 → <dealAmount>
  rent: "https://apis.data.go.kr/1613000/RTMSDataSvcRHRent/getRTMSDataSvcRHRent",     // 전월세 → <deposit>
};

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // 로컬 데모 전용
  const u = new URL(req.url, "http://x");
  if (u.pathname !== "/jeonse") { res.writeHead(404).end(); return; }
  if (!KEY) { res.writeHead(503, { "content-type": "application/json" }).end(JSON.stringify({ error: "no DATA_GO_KR_KEY" })); return; }
  const kind = u.searchParams.get("kind") === "rent" ? "rent" : "trade";
  const field = kind === "rent" ? "deposit" : "dealAmount"; // 만원 단위, 콤마 포함
  try {
    const q = new URLSearchParams({
      serviceKey: KEY, // Decoding 키 사용(URLSearchParams가 인코딩함)
      LAWD_CD: u.searchParams.get("lawd") || "11500",
      DEAL_YMD: u.searchParams.get("ym") || "202605",
      numOfRows: "100",
    });
    const r = await fetch(`${ENDPOINT[kind]}?${q}`);
    const xml = await r.text();
    const re = new RegExp(`<${field}>\\s*([\\d,]+)\\s*</${field}>`, "g");
    const amounts = [...xml.matchAll(re)]
      .map((m) => Number(m[1].replace(/,/g, "")) * 10000) // 만원 → 원
      .filter((n) => n > 0);
    const estimatedPrice = amounts.length
      ? Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length)
      : 0;
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ estimatedPrice, samples: amounts.length, source: `국토부 연립다세대 ${kind === "rent" ? "전월세" : "매매"} 실거래가` }));
  } catch (e) {
    res.writeHead(502, { "content-type": "application/json" }).end(JSON.stringify({ error: String(e) }));
  }
});

server.listen(8020, () => console.log("[api-proxy] http://127.0.0.1:8020/jeonse (연립다세대 RH)"));
