// JB LocalGuard OS — 시연영상 녹화 스크립트 (자막형, 무음)
// Playwright로 앱을 실제 조작하며 화면 녹화 → webm 산출.
// 변환/압축은 ffmpeg(별도 단계). 산출물은 git 비추적(.gitignore).
//
// 실행 전: python3 -m http.server 8011 --directory 02_제품/app (백그라운드)
// 실행:   node 02_제품/scripts/record_demo.mjs
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "http://127.0.0.1:8011";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "00_제출/시연영상");
const W = 1440, H = 810;

// 한 한국어 라인을 읽는 표준 시간(가독성)
const READ = 3600;

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2,
    recordVideo: { dir: OUT, size: { width: W, height: H } },
  });
  const page = await context.newPage();

  // 캡션/타이틀 오버레이 주입 (body 부착 → 앱의 render()가 지워도 생존)
  const installOverlay = async () => {
    await page.evaluate(() => {
      if (document.getElementById("demo-cap")) return;
      const style = document.createElement("style");
      style.textContent = `
        #demo-cap{position:fixed;left:0;right:0;bottom:34px;z-index:2147483646;display:flex;justify-content:center;pointer-events:none;font-family:"Apple SD Gothic Neo","Noto Sans KR",sans-serif;}
        #demo-cap .cap{max-width:78%;background:rgba(8,14,26,.86);color:#eef3fb;font-size:23px;font-weight:600;line-height:1.5;letter-spacing:-.2px;padding:14px 26px;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.45);border:1px solid rgba(120,160,235,.35);text-align:center;opacity:0;transition:opacity .35s ease;}
        #demo-cap .cap.show{opacity:1;}
        #demo-cap .eb{color:#7fb0ff;font-weight:700;font-size:15px;letter-spacing:.4px;margin-right:10px;}
        #demo-card{position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:radial-gradient(1200px 700px at 50% 35%,#16203a,#070b15 75%);color:#eef3fb;font-family:"Apple SD Gothic Neo","Noto Sans KR",sans-serif;opacity:0;transition:opacity .5s ease;pointer-events:none;}
        #demo-card.show{opacity:1;}
        #demo-card .logo{font-size:20px;letter-spacing:3px;color:#7fb0ff;font-weight:700;}
        #demo-card h1{font-size:52px;font-weight:800;margin:0;letter-spacing:-1px;}
        #demo-card p{font-size:24px;color:#aebfdc;margin:0;max-width:70%;text-align:center;line-height:1.55;font-weight:500;}
        #demo-card .tag{margin-top:8px;font-size:16px;color:#88f0c4;border:1px solid rgba(136,240,196,.4);padding:7px 16px;border-radius:999px;}`;
      document.head.appendChild(style);
      const cap = document.createElement("div");
      cap.id = "demo-cap";
      cap.innerHTML = `<div class="cap"></div>`;
      document.body.appendChild(cap);
      const card = document.createElement("div");
      card.id = "demo-card";
      card.innerHTML = `<div class="logo">🛡 JB LOCALGUARD OS</div><h1></h1><p></p><div class="tag" style="display:none"></div>`;
      document.body.appendChild(card);
    });
  };

  const cap = async (eyebrow, text, hold = READ) => {
    await page.evaluate(({ eb, t }) => {
      const el = document.querySelector("#demo-cap .cap");
      if (!el) return;
      el.innerHTML = (eb ? `<span class="eb">${eb}</span>` : "") + t;
      el.classList.add("show");
    }, { eb: eyebrow, t: text });
    await page.waitForTimeout(hold);
  };
  const capHide = async () => {
    await page.evaluate(() => document.querySelector("#demo-cap .cap")?.classList.remove("show"));
    await page.waitForTimeout(350);
  };

  const card = async (title, sub, tag, hold = 4200) => {
    await page.evaluate(({ title, sub, tag }) => {
      const c = document.getElementById("demo-card");
      c.querySelector("h1").textContent = title;
      c.querySelector("p").textContent = sub;
      const tg = c.querySelector(".tag");
      if (tag) { tg.style.display = "inline-block"; tg.textContent = tag; } else { tg.style.display = "none"; }
      c.classList.add("show");
    }, { title, sub, tag });
    await page.waitForTimeout(hold);
  };
  const cardHide = async () => {
    await page.evaluate(() => document.getElementById("demo-card")?.classList.remove("show"));
    await page.waitForTimeout(600);
  };

  const go = async (url) => {
    await page.goto(BASE + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    await installOverlay();
  };
  const clickView = async (viewId) => {
    await page.click(`[data-view="${viewId}"]`).catch(() => {});
    await page.waitForTimeout(900);
  };
  const scrollTo = async (selector, pause = 1500) => {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, selector);
    await page.waitForTimeout(pause);
  };
  const openCase = async (id) => {
    await page.evaluate((cid) => { if (window.openCaseDetail) window.openCaseDetail(cid); }, id);
    await page.waitForTimeout(1000);
  };

  // ───────────────────────────────────────── 0. 표지
  await go("/index.html");
  await card(
    "JB LocalGuard OS",
    "지역 금융 고객의 위험 신호를 모아, AI 에이전트가 판단·행동·검증하되 — 고객 대상 행동은 사람 승인 전까지 차단하는 금융 AI Agent 운영 콘솔",
    "JB금융그룹 Fin:AI Challenge · 자유주제",
    4600
  );
  await cardHide();

  // ───────────────────────────────────────── 1. 서비스 소개 (대시보드)
  await cap("서비스 소개", "흩어진 위험 신호 — 기사·정책공고·시세·등기·상담기록·사기경보 — 를 하나의 케이스로 모읍니다.", 4200);
  await cap("서비스 소개", "14종 전문 AI 에이전트가 스킬을 장착해 판단 → 행동 초안 → 검증을 수행합니다.", 4200);
  await scrollTo(".workbench, #page-content", 1200);
  await cap("운영 현황", "대시보드에서 위험·상태·SLA 큐와 운영 지표를 한눈에 확인합니다.", 4000);
  await capHide();

  // ───────────────────────────────────────── 2. 핵심 시나리오 ① 전주 카페 SME (히어로, 가장 깊게)
  await go("/index.html?demo=sme");
  await cap("핵심 시나리오 ①", "전주 중앙로 카페 — 매출 둔화 신호를 정책금융 매칭으로 잇는 소상공인 자금압박 대응.", 4400);
  await openCase("jeonju-cafe");
  await page.waitForTimeout(600);
  await scrollTo(".cd-header", 1200);
  await cap("케이스 상세", "위험도·상태·담당 에이전트가 하나의 케이스로 묶여 자율운영됩니다.", 4200);
  // 라이브 동작 — 에이전트 실행 (정적 보고서가 아님을 증명)
  await cap("주요 기능 동작", "‘에이전트 실행’ 버튼을 누르면 판단 루프가 실제로 동작합니다 — 정적 분석 보고서가 아닙니다.", 4200);
  await page.click("#cd-run").catch(() => {});
  await page.waitForTimeout(1400);
  await scrollTo(".cd-timeline", 1400);
  await cap("자율운영 타임라인", "위험 분류 → 정책금융 매칭 → 준법 검토를 근거·confidence와 함께 단계별로 기록합니다.", 5000);
  await scrollTo(".dlv-grid", 1300);
  await cap("산출물", "콜백 초안·정책금융 체크리스트 등 실제 업무 산출물을 생성합니다.", 4000);
  // 차별점 — 데이터 거버넌스 (가장 길게)
  await scrollTo(".gov-panel", 1500);
  await cap("최대 차별점", "데이터 거버넌스 — 외부 LLM의 추론력은 쓰되 고객 원본 PII는 절대 외부로 반출하지 않습니다.", 4800);
  await cap("PII 비반출 4중 방어", "데이터 등급제 · 토큰화 · 모델 라우팅 · 반출 스캔 — 토큰화 전/후와 라우팅 근거를 화면에서 확인합니다.", 5200);
  await scrollTo(".gate-list", 1300);
  await cap("승인 게이트", "고객 대상 행동은 RM·준법 담당자의 사람 승인 전까지 차단됩니다.", 4400);
  await scrollTo(".cd-audit", 1300);
  await cap("감사 원장", "모든 판단·행동을 행위자·근거·시각과 함께 무결성 해시로 남깁니다.", 4400);
  await capHide();

  // ───────────────────────────────────────── 3. 핵심 시나리오 ② 전세 보호
  await go("/index.html?demo=jeonse");
  await cap("핵심 시나리오 ②", "전세 보호 — 전세가율·등기 권리관계를 계약 전에 진단해 보증금 손실 위험을 차단합니다.", 4600);
  await page.waitForTimeout(400);
  await scrollTo(".demo-coach, #page-content", 1200);
  await cap("전세 Shield 라인", "전세위험 관리 리드 + 전세가율·권리·손실위험·계약·은행 연계 전문 에이전트가 협업합니다.", 4800);
  await openCase("seoul-jeonse-villa");
  await scrollTo(".gov-panel", 1400);
  await cap("위험 점수 + 근거", "위험 점수와 근거를 제시하고, 안전 계약 특약 초안과 은행 상담을 RM이 승인합니다.", 4600);
  await capHide();

  // ───────────────────────────────────────── 4. 핵심 시나리오 ③ 보이스피싱 차단
  await go("/index.html?demo=phishing");
  await cap("핵심 시나리오 ③", "보이스피싱 차단 — 사기 신호를 분석해 고객 대상 외부 발송을 자동 차단 제안합니다.", 4600);
  await page.waitForTimeout(400);
  await scrollTo(".demo-coach, #page-content", 1200);
  await cap("사람 승인 + 차단 근거", "보안팀 검토 근거를 남기고, 사람 승인/반려로 외부 접촉을 통제합니다.", 4600);
  await capHide();

  // ───────────────────────────────────────── 5. 마무리
  await card(
    "승인·감사형 지역 금융 AI Agent 운영체계",
    "외부 LLM은 쓰되 고객 PII는 내보내지 않는다 — 챗봇이 아니라, 금융권 실도입이 가능한 내부 운영체계입니다.",
    "에이전트 14 · 스킬 25 · 골든패스 3 · E2E 19",
    5200
  );
  await cardHide();

  await page.waitForTimeout(500);
  await context.close(); // video flush
  await browser.close();

  // webm 경로 출력
  const fs = await import("node:fs");
  const files = fs.readdirSync(OUT).filter((f) => f.endsWith(".webm"));
  console.log("WEBM:" + (files[0] || "NONE"));
};

main().catch((e) => { console.error(e); process.exit(1); });
