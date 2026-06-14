// Mermaid(.mmd) → PNG 렌더 (손그림풍, 콘솔 팔레트).  DOCX/PDF 양식에 넣을 이미지 생성용.
// 사용: node 02_제품/scripts/render_mermaid.mjs <input.mmd> <output.png> [scale]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [, , inPath, outPath, scaleArg, lookArg] = process.argv;
if (!inPath || !outPath) { console.error("usage: render_mermaid.mjs <in.mmd> <out.png> [scale] [look=handDrawn|classic]"); process.exit(1); }
const scale = Number(scaleArg) || 3;
const look = lookArg === "classic" ? "classic" : "handDrawn";   // classic = 색상 박스 클린, handDrawn = 손그림풍
const curve = look === "classic" ? "linear" : "basis";
const code = fs.readFileSync(inPath, "utf-8");

const html = `<!doctype html><html><head><meta charset="utf-8">
<style>
  html,body{margin:0;background:#fff;font-family:"Apple SD Gothic Neo","Noto Sans KR",sans-serif;}
  #wrap{display:inline-block;padding:28px;background:#fff;}
  .mermaid{font-family:"Apple SD Gothic Neo","Noto Sans KR",sans-serif;}
</style></head>
<body><div id="wrap"><pre class="mermaid">${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></div>
<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  mermaid.initialize({
    startOnLoad: false, look: "${look}", theme: "base",
    themeVariables: {
      fontFamily: '"Apple SD Gothic Neo","Noto Sans KR",sans-serif', fontSize: "16px",
      primaryColor: "#eaf1ff", primaryBorderColor: "#3a63c4", primaryTextColor: "#0e1830",
      lineColor: "#5a6b8c", clusterBkg: "#f6f8fc", clusterBorder: "#b9c6e0", tertiaryColor: "#eefaf3",
    },
    flowchart: { curve: "${curve}", nodeSpacing: 34, rankSpacing: 46, htmlLabels: true },
  });
  const { svg } = await mermaid.render("g", document.querySelector(".mermaid").textContent);
  document.querySelector("#wrap").innerHTML = svg;
  window.__done = true;
</script></body></html>`;

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ deviceScaleFactor: scale });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__done === true, { timeout: 30000 });
  await page.waitForTimeout(400);
  const el = await page.$("#wrap");
  await el.screenshot({ path: path.resolve(outPath) });
  await browser.close();
  console.log("PNG:" + outPath);
};
main().catch((e) => { console.error(e); process.exit(1); });
