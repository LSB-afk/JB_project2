/*
 * JB LocalGuard OS - 업그레이드 모듈 (swappable registries)
 * 이 파일은 app.js 보다 먼저 로드된다. 신규 데이터 레지스트리와 렌더 함수를 정의한다.
 * app.js 의 전역 헬퍼(escapeHtml, iconSvg, currentCase, render 등)는 호출 시점에 참조한다.
 * 설계: docs/02_product/element-specs/
 */

/* =========================================================================
 * 공통: 아주 작은 Markdown 렌더러 (산출물/스킬 본문용)
 * ========================================================================= */
function mdToHtml(md) {
  const esc = (s) => (window.escapeHtml ? escapeHtml(s) : String(s));
  const lines = String(md || "").replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let inList = false;
  let inCode = false;
  const closeList = () => { if (inList) { html += "</ul>"; inList = false; } };
  for (const raw of lines) {
    const line = raw;
    if (line.trim().startsWith("```")) {
      if (inCode) { html += "</code></pre>"; inCode = false; }
      else { closeList(); html += "<pre class='md-code'><code>"; inCode = true; }
      continue;
    }
    if (inCode) { html += esc(line) + "\n"; continue; }
    const inline = (s) => esc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
    if (/^#{1,6}\s/.test(line)) {
      closeList();
      const level = line.match(/^#+/)[0].length;
      html += `<h${level} class='md-h'>${inline(line.replace(/^#+\s/, ""))}</h${level}>`;
    } else if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) { html += "<ul class='md-list'>"; inList = true; }
      html += `<li>${inline(line.replace(/^\s*[-*]\s+/, ""))}</li>`;
    } else if (/^\s*\d+\.\s+/.test(line)) {
      if (!inList) { html += "<ul class='md-list'>"; inList = true; }
      html += `<li>${inline(line.replace(/^\s*\d+\.\s+/, ""))}</li>`;
    } else if (line.trim() === "") {
      closeList();
    } else {
      closeList();
      html += `<p class='md-p'>${inline(line)}</p>`;
    }
  }
  closeList();
  if (inCode) html += "</code></pre>";
  return html;
}

/* =========================================================================
 * 07 · 데이터 거버넌스 / PII (모든 외부 호출의 관문)
 * ========================================================================= */
const dataGovernance = {
  tiers: {
    name: "restricted", residentId: "restricted", account: "restricted",
    phone: "restricted", address: "restricted",
    revenue: "confidential", loanBalance: "confidential", dsr: "confidential",
    caseCode: "internal", riskScore: "internal", status: "internal",
    article: "public", policy: "public", news: "public",
  },
  classify(field) { return this.tiers[field] || "internal"; },
  // 외부 모델 전송 전 PII 토큰화 (주민번호/전화/계좌/성명 패턴)
  tokenizePII(text) {
    let masked = String(text || "");
    const map = [];
    const subs = [
      [/(\d{6})-?[1-4]\d{6}/g, "RRN"],
      [/01[016789]-?\d{3,4}-?\d{4}/g, "PHONE"],
      [/\b\d{2,6}-\d{2,6}-\d{2,7}\b/g, "ACCT"],
    ];
    subs.forEach(([re, kind]) => {
      masked = masked.replace(re, () => {
        const token = `{{${kind}_${map.length + 1}}}`;
        map.push({ token, kind });
        return token;
      });
    });
    // 성명(2~4자 한글 + 직함/조사 휴리스틱은 생략) — 데모용 명시 치환
    return { masked, map };
  },
  // 작업 민감도에 따른 모델 라우팅
  route(taskKind, hasPII) {
    if (hasPII) return { target: "onprem", label: "국내·온프레 모델", reason: "원본 PII 포함 → 외부 반출 금지" };
    if (taskKind === "public-analysis") return { target: "external", label: "외부 프런티어 모델", reason: "공개정보(법령·정책·뉴스), PII 없음" };
    return { target: "external", label: "외부 프런티어 모델", reason: "비식별·토큰화된 입력만 전송" };
  },
  // 외부 전송 페이로드 스캔
  egressScan(payload) {
    const re = /(\d{6}-?[1-4]\d{6})|(01[016789]-?\d{3,4}-?\d{4})/g;
    const hits = String(payload || "").match(re) || [];
    return { safe: hits.length === 0, hits };
  },
};

// 케이스별 거버넌스 처리 기록(데모 시드) — 케이스 상세 패널에서 가시화
const governanceLog = {
  "jeonju-cafe": {
    tokenized: {
      before: "김민수(900101-1******) 010-1234-5678, 전주시 완산구 중앙로 카페 운전자금 1.8억",
      // after 는 tokenizePII 로 렌더 시 생성
    },
    routes: [
      { task: "고객 식별·거래이력 대조", target: "onprem", label: "국내·온프레", note: "원본 PII 필요 → 외부 금지" },
      { task: "매출·금리 부담 분석", target: "external", label: "외부 프런티어", note: "범위화·비식별 수치만" },
      { task: "정책금융 매칭(법령·정책 분석)", target: "external", label: "외부 프런티어", note: "공개정보, PII 없음" },
      { task: "RM 콜백 스크립트 초안", target: "external", label: "외부 프런티어", note: "토큰화된 컨텍스트" },
    ],
    egress: { scanned: 12, blocked: 1, note: "초안에 포함된 연락처 1건 차단·토큰 치환" },
    laws: ["개인정보보호법 §28-2(가명정보 처리 특례)", "신용정보법 §40-2(가명·익명처리)", "전자금융감독규정(망분리)", "금융분야 AI 가이드라인(설명가능성)"],
    regBasis: "전자금융감독규정상 고유식별정보·개인신용정보를 처리하는 경우 망분리 규제가 적용된다. 따라서 외부 SaaS형 LLM에 고객 원본 개인신용정보를 전송하는 것은 규정 위반이며, 반드시 내부 가명·비식별 처리 후 외부 모델을 호출해야 한다.",
  },
};

function governancePanelMarkup(caseItem) {
  const id = caseItem && caseItem.id;
  const g = (id && governanceLog[id]) || null;
  if (!g) {
    return `<section class="panel gov-panel"><div class="panel-head"><h3>데이터 거버넌스</h3><span class="status-badge">표준 정책</span></div>
      <p class="md-p">이 케이스는 표준 거버넌스(등급제·토큰화·국내/외부 모델 라우팅·egress 스캔·감사)를 따릅니다.</p></section>`;
  }
  const tok = dataGovernance.tokenizePII(g.tokenized.before);
  const routeRows = g.routes.map((r) => `
    <tr><td>${escapeHtml(r.task)}</td>
    <td><span class="gov-route gov-${r.target}">${escapeHtml(r.label)}</span></td>
    <td class="gov-note">${escapeHtml(r.note)}</td></tr>`).join("");
  const lawChips = g.laws.map((l) => `<span class="tag gov-law">${escapeHtml(l)}</span>`).join("");
  return `
  <section class="panel gov-panel">
    <div class="panel-head"><h3>데이터 거버넌스 적용</h3><span class="status-badge gov-ok">PII 보호 활성</span></div>
    <div class="gov-block">
      <div class="gov-label">① PII 토큰화 (외부 모델 전송 전)</div>
      <div class="gov-token-row"><span class="gov-token-tag">원본(국내 볼트)</span><code class="gov-before">${escapeHtml(g.tokenized.before)}</code></div>
      <div class="gov-token-row"><span class="gov-token-tag ok">외부 전송본</span><code class="gov-after">${escapeHtml(tok.masked)}</code></div>
    </div>
    <div class="gov-block">
      <div class="gov-label">② 모델 라우팅 (민감도 분기)</div>
      <table class="gov-table"><thead><tr><th>작업</th><th>모델</th><th>근거</th></tr></thead><tbody>${routeRows}</tbody></table>
    </div>
    <div class="gov-block">
      <div class="gov-label">③ Egress 가드 + 감사</div>
      <p class="md-p">외부 전송 ${escapeHtml(String(g.egress.scanned))}건 스캔 · <strong>${escapeHtml(String(g.egress.blocked))}건 차단</strong> — ${escapeHtml(g.egress.note)} (전 접근 감사 원장 기록)</p>
    </div>
    <div class="gov-block">
      <div class="gov-label">④ 근거 법령·가이드라인</div>
      <div class="tag-row">${lawChips}</div>
      ${g.regBasis ? `<p class="md-p gov-reg">${escapeHtml(g.regBasis)}</p>` : ""}
    </div>
  </section>`;
}

/* =========================================================================
 * 06 · 고객 DB + 케이스↔고객 추적
 * ========================================================================= */
const customers = [
  {
    id: "cust-jeonju-cafe-001",
    name: "김민수", maskedName: "김○○",
    affiliate: "전북은행", segment: "개인사업자",
    since: "2019-03", business: "전주 중앙로 카페 (운전자금 거래)",
    caseIds: ["jeonju-cafe"],
    riskTrend: [
      { date: "2026-03", score: 61 }, { date: "2026-04", score: 70 },
      { date: "2026-05", score: 79 }, { date: "2026-06", score: 88 },
    ],
    notes: [
      { date: "2026-05-28", actor: "Pain Radar Agent", text: "카드매출 3개월 연속 감소 신호 감지(공개 상권지표 기반)." },
      { date: "2026-06-10", actor: "Cashflow Triage Agent", text: "운전자금 상환 부담 상승, 금리인하요구권·정책금융 검토 제안." },
      { date: "2026-06-14", actor: "Human RM Lead", text: "콜백 스크립트 검토 대기. 고객 직접 접촉 전 승인 필요." },
    ],
  },
];
function customerByCaseId(caseId) {
  return customers.find((c) => c.caseIds.includes(caseId)) || null;
}

function customerTrackingMarkup(caseItem) {
  const c = caseItem && customerByCaseId(caseItem.id);
  if (!c) return "";
  const maxScore = Math.max(...c.riskTrend.map((p) => p.score), 100);
  const bars = c.riskTrend.map((p) => `
    <div class="trend-bar"><i style="height:${Math.round((p.score / maxScore) * 100)}%"></i><span>${escapeHtml(p.date.slice(5))}</span><b>${p.score}</b></div>`).join("");
  const notes = c.notes.map((n) => `
    <li><span class="note-date">${escapeHtml(n.date)}</span><span class="note-actor">${escapeHtml(n.actor)}</span><p>${escapeHtml(n.text)}</p></li>`).join("");
  const linkedCases = c.caseIds.map((cid) => {
    const ci = (typeof cases !== "undefined" ? cases : []).find((x) => x.id === cid);
    return ci ? `<span class="tag">${escapeHtml(ci.code)} · ${escapeHtml(ci.customerName)}</span>` : "";
  }).join("");
  return `
  <section class="panel customer-panel">
    <div class="panel-head"><h3>고객 추적</h3><span class="status-badge">PII 마스킹</span></div>
    <div class="customer-head">
      <div><strong>${escapeHtml(c.maskedName)}</strong><span class="customer-sub">${escapeHtml(c.affiliate)} · ${escapeHtml(c.segment)} · 거래 ${escapeHtml(c.since)}~</span></div>
      <div class="tag-row">${linkedCases}</div>
    </div>
    <div class="gov-label">리스크 추이</div>
    <div class="trend-chart">${bars}</div>
    <div class="gov-label">관찰·상담 이력</div>
    <ul class="customer-notes">${notes}</ul>
  </section>`;
}

/* =========================================================================
 * 03 · 케이스별 산출물 (MD 결과물) — 일부는 리서치 후 보강
 * ========================================================================= */
const deliverableRegistry = {
  "jeonju-cafe": [
    {
      id: "dlv-stress",
      title: "상환 스트레스 진단 리포트",
      kind: "report", status: "generated",
      generatedBy: "Cashflow Triage Agent", at: "2026-06-14 10:20",
      govNote: "비식별 수치만 외부 모델로 분석, 원본은 국내 볼트.",
      body: `# 상환 스트레스 진단 리포트\n## 대상\n- 케이스 JBG-104 · 전주 중앙로 카페(개인사업자)\n- 익스포저: 운전자금 1.8억 · 카드매출 둔화\n\n## 핵심 지표 (범위화)\n- 최근 3개월 카드매출 증감률: **-12% / -9% / -7%**\n- 운전자금 월 상환액 대비 가용 현금흐름: **약 1.1배 (경계)**\n- 추정 DSR: **상승 구간** (정밀 산정은 심사 시스템 연동 필요)\n\n## 상환 시나리오\n1. 현 금리 유지 시: 3개월 내 현금흐름 압박 가능성 **중상**\n2. 금리인하요구권 적용 시: 월 상환 부담 완화 여지\n3. 정책금융 대환 시: 만기·금리 재구조화로 압박 완화\n\n## 권고\n- 금리인하요구권 안내 + 정책금융 매칭(별도 산출물)\n- 고객 접촉은 **사람 승인 후**, 과장표현 없는 스크립트 사용\n\n> 본 리포트는 비식별 데이터 기반 초안이며 최종 판단은 RM·심사 검토를 따릅니다.`,
    },
    {
      id: "dlv-policy",
      title: "정책금융 매칭 결과",
      kind: "report", status: "generated",
      generatedBy: "Policy Match Agent", at: "2026-06-14 10:24",
      govNote: "공개 정책·법령 분석(PII 없음) → 외부 모델 허용.",
      body: `# 정책금융 매칭 결과 (초안)\n> 세부 수치는 정책 커넥터(소진공/지역신보) 최신 공고로 확정. 자격은 상담·심사 후 확정.\n\n## 후보 프로그램 (적합도 순)\n1. **소상공인 저금리 대환대출 (2026)** — 7% 이상 사업자대출 → 연 4.5% 고정 전환, 최대 5,000만원, 2년 거치+8년 분할. NCB 919점 이하. 5,000만원 기준 연 약 123만원 이자 절감. 신청: ols.semas.or.kr\n2. **소진공 일반 경영안정자금** — 대리대출, 최대 7,000만원, 운영자금(임대료·인건비·원부자재). 업력·요건 확인 필요.\n3. **소공인 특화자금(운전)** — 직접대출 최대 1억원(제조 소공인 대상, 카페는 해당성 검토).\n4. **햇살론뱅크(전북은행)** — 5,000억 공급, 소상공인 금리 최대 1%p 감면 연계.\n5. **금리인하요구권** — 금융소비자보호법상 권리, 신용상태 개선 시 인하 신청.\n\n## 적합성 메모\n- 카드매출 둔화·운전자금 부담 → **대환 + 경영안정자금** 우선, 담보 여력 제한 시 **지역신용보증재단 보증** 결합.\n- 기준금리 2.5%(2026.01 동결) 환경, 고금리 대출 보유 시 대환 효과 큼.\n\n## 다음 행동\n- 필요 서류 체크리스트(별도 산출물) 안내, RM 상담 예약, 자격 요건 사전 확인.`,
    },
    {
      id: "dlv-script",
      title: "RM 콜백 스크립트 초안",
      kind: "script", status: "draft",
      generatedBy: "RM Copilot Agent", at: "2026-06-14 10:28",
      govNote: "연락처 토큰 치환, 준법 검토 통과 후 발송.",
      body: `# RM 콜백 스크립트 초안 (승인 전)\n## 인사\n"안녕하세요 {{고객}}님, 전북은행 OO지점 OOO입니다. 사업 잘 되고 계신지요."\n\n## 목적 안내 (확정·과장 표현 금지)\n"최근 사업 운영자금 관련해 도움이 될 수 있는 **정책금융·금리 안내**를 드리고자 연락드렸습니다. 가입이나 승인 확정 안내가 아니며 검토 가능한 선택지를 설명드리는 것입니다."\n\n## 핵심\n- 금리인하요구권 안내\n- 정책자금/대환 검토 가능성(자격 요건은 상담·심사 후 확정)\n- 필요 서류 안내\n\n## 준법 체크\n- [x] 확정·보장 표현 없음\n- [x] 개인정보 최소 언급\n- [ ] 사람(RM) 최종 승인 — **대기**`,
    },
    {
      id: "dlv-checklist",
      title: "상담 전 서류 체크리스트",
      kind: "checklist", status: "generated",
      generatedBy: "Document Checklist Agent", at: "2026-06-14 10:30",
      govNote: "양식·항목만, 고객 데이터 미포함.",
      body: `# 상담 전 서류 체크리스트\n## 공통\n- 사업자등록증\n- 최근 부가세 신고서 / 매출 증빙\n- 임대차계약서(사업장)\n- 기존 대출 약정·잔액 확인서\n\n## 정책금융용\n- 소상공인 확인서 / 해당 요건 증빙\n- (보증 결합 시) 지역신보 요구 서류\n\n## 확인 질문\n- 최근 매출 변동 사유\n- 기존 대출 금리·만기 구조\n- 담보·보증 여력`,
    },
    {
      id: "dlv-audit",
      title: "준법·감사 요약",
      kind: "audit", status: "generated",
      generatedBy: "Compliance Guard / Audit Ledger", at: "2026-06-14 10:32",
      govNote: "거버넌스 처리·승인 게이트·감사 해시.",
      body: `# 준법·감사 요약\n## 거버넌스\n- PII 토큰화 적용, 원본은 국내 볼트\n- 모델 라우팅: 식별 작업 국내, 분석/초안 외부(비식별)\n- Egress 스캔 1건 차단(연락처)\n\n## 승인 게이트\n- 외부 고객 접촉: **사람 승인 대기**\n- 확정·보장 표현: 차단 통과\n\n## 감사\n- 근거→판단→행동→승인 전 단계 해시 체인 기록\n- 무결성 검증: 통과`,
    },
  ],
};
function deliverablesForCase(caseId) { return deliverableRegistry[caseId] || []; }

/* =========================================================================
 * 05 · 플러그인 / MCP 레지스트리 (법령·정책·뉴스·JB DB)
 * 리서치 기반 실제 내용 (출처 포함). govTier 가 PII면 거버넌스 강제.
 * ========================================================================= */
const pluginRegistry = [
  {
    id: "law-moleg", kind: "law", name: "국가법령정보 커넥터",
    scope: ["개인정보보호법", "신용정보법", "전자금융감독규정"],
    govTier: "public", status: "connected",
    summary: "현행법 조문·시행령 조회 (에이전트 준법 판단 근거)",
    usedBy: ["compliance-guard", "audit-ledger"],
    sample: [
      { title: "개인정보보호법 §28-2", text: "가명정보 처리 특례 — 통계·연구·공익기록 목적 시 정보주체 동의 없이 가명정보 처리 가능.", src: "개인정보보호위원회" },
      { title: "개인정보보호법 §28-3", text: "가명정보 결합 제한 — 다른 정보와 결합은 보호위 지정 전문기관을 통해서만.", src: "개인정보보호위원회" },
      { title: "신용정보법 §40-2", text: "가명·익명처리 행위규칙 — 가명처리 후에도 기술적·관리적 보안대책 의무.", src: "한국법령정보센터" },
      { title: "전자금융감독규정(망분리)", text: "고유식별정보·개인신용정보 처리 시 망분리 규제 적용 → 외부 SaaS LLM에 원본 PII 전송 불가.", src: "금융위원회" },
    ],
  },
  {
    id: "policy-sema", kind: "policy", name: "소상공인 정책금융 커넥터",
    scope: ["소진공 정책자금", "저금리 대환", "지역신용보증재단", "햇살론뱅크"],
    govTier: "public", status: "connected",
    summary: "소상공인 정책자금·대환·보증 프로그램 매칭",
    usedBy: ["policy-match", "document-checklist"],
    sample: [
      { title: "소상공인 저금리 대환대출(2026)", text: "7%↑ 사업자대출 → 연 4.5% 고정, 최대 5,000만원, 2년 거치+8년 분할, NCB 919점 이하. 신청 ols.semas.or.kr", src: "소진공/중기부" },
      { title: "일반 경영안정자금", text: "대리대출 최대 7,000만원, 운영자금(임대료·인건비·원부자재), 업력 3년 미만.", src: "소진공" },
      { title: "소공인 특화자금", text: "운전 최대 1억원 / 시설 최대 5억원(제조 소공인 10인 미만).", src: "소진공" },
      { title: "햇살론뱅크(전북은행)", text: "5,000억 공급, 소상공인 금리 최대 1%p 감면(광주은행 3,000억).", src: "JB금융그룹 보도자료" },
    ],
  },
  {
    id: "policy-assembly", kind: "policy", name: "국회·금융정책 커넥터",
    scope: ["국회 의안정보", "금융위 정책", "금융분야 AI 가이드라인"],
    govTier: "public", status: "available",
    summary: "입법·금융정책 동향 모니터링 (규제 변화 대응)",
    usedBy: ["compliance-guard"],
    sample: [
      { title: "금융분야 AI 가이드라인", text: "설명가능성(XAI)·위험관리 절차·설명의무·내부통제 요구. 금융위 발표·개정 지속.", src: "금융위원회" },
      { title: "전자금융감독규정 시행세칙 개정(2026.1 예고)", text: "사무용 SaaS는 내부망 활용 허용. 단 고유식별·개인신용정보 처리 시 망분리 유지.", src: "금융위/데일리안" },
    ],
  },
  {
    id: "news-local", kind: "news", name: "지역경제·상권 뉴스 커넥터",
    scope: ["전북 자영업 지표", "전주 원도심 상권", "소상공인 경기"],
    govTier: "public", status: "connected",
    summary: "지역 상권·경기 신호 수집 (위험 조기 감지)",
    usedBy: ["pain-radar", "evidence-harvest"],
    sample: [
      { title: "전북 자영업 지표(2025.10)", text: "자영업자 24만6천명(전년比 감소), 대출잔액 29.3조(역대 최고), 연체율 2.2%, 취약차주 1.4만명.", src: "뉴시스/한국은행 전북본부" },
      { title: "전주 원도심 상권(글로컬 상권 프로젝트)", text: "한옥마을·웨리단길·객리단길 활성화. 청년 카페 집중, 임차료 상승 압박, 전자상거래 비중 전국 최하위.", src: "세계일보/뉴스핌·중기부" },
      { title: "기준금리(2026.01)", text: "한국은행 기준금리 연 2.5% 동결.", src: "한국은행" },
    ],
  },
  {
    id: "realestate-redev", kind: "realestate", name: "재개발·도시정비 커넥터",
    scope: ["도시정비구역", "재개발·재건축", "상권 변화"],
    govTier: "public", status: "available",
    summary: "재개발·정비사업 정보 (상권/임대 영향, 전세 케이스 시 시세·등기)",
    usedBy: ["pain-radar"],
    sample: [
      { title: "원도심 정비·상권 변화", text: "정비사업 진행 구역의 임대료·유동인구 변화는 소상공인 매출에 직접 영향. 케이스 위험 신호로 반영.", src: "지자체 고시·뉴스" },
    ],
  },
  {
    id: "jb-db", kind: "jb-db", name: "JB 금융 데이터베이스 커넥터",
    scope: ["고객 거래내역", "상담 이력", "여신 심사 데이터"],
    govTier: "restricted", status: "available",
    summary: "고객 거래·상담·심사 이력 (PII 포함 → 거버넌스 필수)",
    usedBy: ["case-os-core", "rm-copilot"],
    govEnforced: true,
    sample: [
      { title: "여신 AICC 연계(JB×네이버클라우드)", text: "2025.12.26 MOU, 하이퍼클로바X 기반 AICC. 상담 데이터 추출·심사 요약·사후관리 근거 자동생성.", src: "전자신문" },
      { title: "PII 처리 원칙", text: "원본 개인신용정보는 국내 볼트·온프레 모델에서만. 외부 모델에는 가명·토큰화 데이터만 전송.", src: "거버넌스 정책" },
    ],
  },
];
function pluginsByKind(kind) { return pluginRegistry.filter((p) => p.kind === kind); }

const pluginKindMeta = {
  law: { label: "법령", icon: "shield" },
  policy: { label: "정책·금융", icon: "target" },
  news: { label: "뉴스·상권", icon: "history" },
  realestate: { label: "재개발·정비", icon: "network" },
  "jb-db": { label: "JB 금융 DB", icon: "database" },
};

function pluginStatusBadge(status) {
  const map = { connected: ["연결됨", "gov-ok"], available: ["연결 가능", ""], blocked: ["차단", "status-rejected"] };
  const [label, cls] = map[status] || ["", ""];
  return `<span class="status-badge ${cls}">${escapeHtml(label)}</span>`;
}

function pluginsPage() {
  const ico = (k) => (window.iconSvg ? iconSvg((pluginKindMeta[k] || {}).icon || "puzzle") : "");
  const cards = pluginRegistry.map((p) => {
    const meta = pluginKindMeta[p.kind] || { label: p.kind };
    const scopes = p.scope.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join("");
    const govBadge = p.govTier === "restricted"
      ? `<span class="tag gov-law">거버넌스 필수 · PII</span>`
      : `<span class="tag">공개정보</span>`;
    return `
      <article class="plugin-card is-clickable" data-plugin-id="${escapeHtml(p.id)}" role="button" tabindex="0">
        <div class="plugin-head">
          <span class="plugin-kind" aria-hidden="true">${ico(p.kind)}</span>
          <div class="plugin-title"><strong>${escapeHtml(p.name)}</strong><span class="plugin-kind-label">${escapeHtml(meta.label)}</span></div>
          ${pluginStatusBadge(p.status)}
        </div>
        <p class="md-p">${escapeHtml(p.summary)}</p>
        <div class="tag-row">${scopes}</div>
        <div class="plugin-foot">${govBadge}<span class="plugin-used">사용: ${escapeHtml((p.usedBy || []).join(", ") || "-")}</span></div>
      </article>`;
  }).join("");
  const selected = pluginRegistry.find((p) => p.id === selectedPluginId) || null;
  const detail = selected ? pluginDetailMarkup(selected) : `<div class="empty-state"><p>커넥터를 선택하면 제공 데이터와 거버넌스 처리 방식을 확인할 수 있습니다.</p></div>`;
  return `
    <header class="workspace-header">
      <p class="eyebrow">외부 데이터 연결</p>
      <h2>플러그인 · MCP 커넥터</h2>
      <p>에이전트가 일하기 위해 접근하는 법령·정책·뉴스·JB 금융 DB 연결점입니다. 모든 연결은 데이터 거버넌스를 통과합니다.</p>
    </header>
    <div class="plugin-layout">
      <div class="plugin-grid">${cards}</div>
      <aside class="plugin-detail panel">${detail}</aside>
    </div>`;
}

function pluginDetailMarkup(p) {
  const samples = (p.sample || []).map((s) => `
    <li><strong>${escapeHtml(s.title)}</strong><p>${escapeHtml(s.text)}</p><span class="src">출처: ${escapeHtml(s.src)}</span></li>`).join("");
  const govLine = p.govTier === "restricted"
    ? `<p class="md-p gov-reg">이 커넥터는 PII를 포함하므로 토큰화 + 국내·온프레 모델 라우팅 + egress 스캔이 강제됩니다.</p>`
    : `<p class="md-p">공개정보 커넥터로 PII가 없어 외부 모델 분석이 허용됩니다.</p>`;
  return `
    <div class="panel-head"><h3>${escapeHtml(p.name)}</h3>${pluginStatusBadge(p.status)}</div>
    <p class="md-p">${escapeHtml(p.summary)}</p>
    ${govLine}
    <div class="gov-label">제공 데이터 (실제 근거)</div>
    <ul class="plugin-samples">${samples}</ul>
    <div class="plugin-actions">
      <button class="secondary-button" type="button" data-plugin-test="${escapeHtml(p.id)}">테스트 조회</button>
      <button class="ghost-button" type="button" data-plugin-toggle="${escapeHtml(p.id)}">${p.status === "connected" ? "연결 해제" : "연결"}</button>
    </div>`;
}

/* =========================================================================
 * 02 · 실질 스킬 콘텐츠 (핵심 스킬 본문, 리서치 기반)
 * ========================================================================= */
const skillContent = {
  "cashflow-stress": {
    sources: ["news-local#전북 자영업 지표", "policy-sema#금리인하요구권"],
    body: `# 매출 둔화·금리 부담·상환 압박 판단\n\n## 목적/적용\n소상공인 케이스에서 현금흐름 악화와 상환 압박을 조기에 정량 판단해 정책금융·금리 조치로 연결한다.\n\n## 입력 (데이터 등급)\n- 카드/현금 매출 추이 [confidential, 범위화]\n- 운전자금·대출 잔액·금리·만기 [confidential]\n- 업종·지역 상권 지표 [public, 뉴스 커넥터]\n- 고객 식별정보 [restricted] — **외부 모델 미전송**\n\n## 처리 절차\n1. 최근 3~6개월 매출 증감률 산출, 추세(둔화/급감) 분류\n2. 월 상환액 대비 가용 현금흐름 배수 계산 (1.0 미만=위험, 1.0~1.2=경계)\n3. 추정 DSR·이자보상배율 점검 (정밀치는 심사 시스템 연동)\n4. 지역 상권 신호(공실·유동인구·경기) 가중\n5. 종합 상환 스트레스 등급(저/중/중상/고) 산출\n\n## 판단 기준/임계값\n- 매출 3개월 연속 감소 + 현금흐름 배수 1.2 이하 → "중상" 이상\n- 보유 대출 금리 7% 이상 → 대환 후보 자동 태깅\n- 기준금리(2.5%) 대비 과도 스프레드 → 금리인하요구권 안내 후보\n\n## 출력\n- 상환 스트레스 진단 리포트(산출물), 상환 시나리오 3종, 권고 조치\n\n## 근거\n- 금리인하요구권: 금융소비자보호법상 권리\n- 전북 자영업 부담 지표(대출잔액 29.3조·연체율 2.2%) 맥락 반영\n\n## 승인/리스크\n- 판단은 내부용, 고객 접촉 권고는 사람 승인 필요. 리스크: medium`,
  },
  "policy-match": {
    sources: ["policy-sema#소상공인 저금리 대환대출", "policy-sema#일반 경영안정자금"],
    body: `# 정책금융·대환·보증 매칭\n\n## 목적/적용\n케이스의 자금 수요·신용 상태에 맞는 공적 정책금융 프로그램을 매칭하고 적합도를 정렬한다.\n\n## 입력 (데이터 등급)\n- 자금 용도·규모·기존 대출 구조 [confidential]\n- 업력·업종·상시근로자 수 [internal]\n- 정책 프로그램 카탈로그 [public, 정책 커넥터]\n- 고객 식별정보 [restricted] — 미전송\n\n## 처리 절차\n1. 자금 용도 분류(운전/시설/대환)\n2. 프로그램 요건 매칭: 소진공 경영안정자금(≤7천만), 소공인 특화자금(운전 1억/시설 5억), 대환(7%↑→4.5%, ≤5천만, NCB 919↓), 햇살론뱅크(전북 5천억)\n3. 담보·보증 여력 점검 → 부족 시 지역신용보증재단 보증 결합\n4. 금리인하요구권 병행 가능성 점검\n5. 적합도 점수화·정렬, 예상 절감액 추정(예: 대환 5천만 기준 연 약 123만원)\n\n## 판단 기준/임계값\n- 보유 대출 금리 7% 이상 & NCB 919 이하 → 대환 1순위\n- 업력 3년 미만 & 운영자금 → 경영안정자금 후보\n\n## 출력\n- 정책금융 매칭 결과(산출물), 후보 프로그램 표, 다음 행동(서류·상담)\n\n## 근거/출처\n- 소진공/중기부 공고(ols.semas.or.kr), JB금융 햇살론뱅크 보도자료\n- 세부 수치는 정책 커넥터 최신값으로 확정\n\n## 승인/리스크\n- 자격은 "검토 가능성"으로만 안내(확정·보장 표현 금지). 리스크: medium`,
  },
  "compliance-guard": {
    sources: ["law-moleg#개인정보보호법 §28-2", "law-moleg#전자금융감독규정(망분리)"],
    body: `# 준법·개인정보·과장표현 검토\n\n## 목적/적용\n고객 대상 산출물·행동이 준법·개인정보·표현 규제를 위반하지 않는지 게이트한다.\n\n## 입력 (데이터 등급)\n- 산출물 초안(스크립트·안내문) [internal]\n- 포함된 개인정보 [restricted]\n- 관련 법령 [public, 법령 커넥터]\n\n## 처리 절차\n1. 확정·보장·과장 표현 탐지("승인됩니다", "무조건" 등) → 차단/수정\n2. 개인정보 최소화 점검, PII 노출 시 토큰화 요구\n3. 외부 모델 전송 대상이면 망분리·가명처리 적합성 검증\n4. 금융분야 AI 가이드라인(설명가능성·내부통제) 체크\n5. 통과/보류 판정 + 사람 승인 게이트 연결\n\n## 판단 기준\n- 원본 개인신용정보 외부 전송 시도 → **차단**(전자금융감독규정 망분리)\n- 확정 표현 1건 이상 → 보류\n\n## 출력\n- 준법 체크 결과, 수정 제안, 승인 게이트 상태\n\n## 근거\n- 개인정보보호법 §28-2/§28-3, 신용정보법 §40-2, 전자금융감독규정(망분리), 금융분야 AI 가이드라인\n\n## 승인/리스크\n- 외부 행동 차단 권한 보유. 리스크: high(필수 통제)`,
  },
};
function skillBody(slug) {
  const c = skillContent[slug];
  return c ? c.body : "";
}

/* 스킬 본문 패널 (보기/편집) — app.js skillDetailMarkup 에서 호출 */
function skillBodyPanel(skill) {
  const body = skillBody(skill.slug);
  const srcs = skillSources(skill.slug);
  const srcChips = srcs.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join("");
  if (!body && !skillEditMode) {
    return compactPanel("운영 콘텐츠", "실제 절차·기준", `<div class="empty-state"><p>이 스킬은 아직 상세 콘텐츠가 없습니다. 편집으로 추가할 수 있습니다.</p><button id="skill-edit-toggle" class="secondary-button" type="button">콘텐츠 편집</button></div>`);
  }
  const inner = skillEditMode
    ? `<textarea id="skill-body-edit" data-slug="${escapeHtml(skill.slug)}" class="skill-editor" rows="18">${escapeHtml(body)}</textarea>
       <div class="action-row"><button id="skill-save" class="primary-button" type="button">저장</button><button id="skill-edit-toggle" class="ghost-button" type="button">취소</button></div>`
    : `<div class="md-render skill-body">${mdToHtml(body)}</div>
       ${srcChips ? `<div class="gov-label">근거 출처</div><div class="tag-row">${srcChips}</div>` : ""}
       <div class="action-row"><button id="skill-edit-toggle" class="secondary-button" type="button">편집</button></div>`;
  return compactPanel("운영 콘텐츠", "실제 절차·판단 기준·근거", inner, skillEditMode ? "편집 중" : "보기");
}
function skillSources(slug) {
  const c = skillContent[slug];
  return (c && c.sources) || [];
}

/* 신규 UI 상태 (app.js 보다 먼저 선언 → 전역 공유) */
let selectedPluginId = null;
let selectedDeliverableId = null;
let skillEditMode = false;

/* =========================================================================
 * 01 · 케이스 상세 페이지 (자율운영 뷰)
 * ========================================================================= */
function caseDetailPage(caseItem) {
  if (!caseItem) return `<div class="empty-state"><p>케이스를 찾을 수 없습니다.</p></div>`;
  const c = caseItem;
  const lbl = window.statusLabel ? statusLabel(c.status) : c.status;
  const cls = window.statusClass ? statusClass(c.status) : "";
  const agentList = (typeof agents !== "undefined" ? agents : []).filter((a) => (c.agents || []).includes(a.id));
  const deliverables = deliverablesForCase(c.id);
  const isPending = c.status === "Approval Pending";

  // 자율운영 타임라인 단계
  const steps = [
    { key: "detect", label: "위험 감지", agent: "Pain Radar Agent", skill: "evidence-harvest", done: true },
    { key: "evidence", label: "근거 수집(플러그인)", agent: "Evidence Harvest", skill: "source-ranker", done: true },
    { key: "analyze", label: "분석·판단", agent: "Cashflow Triage Agent", skill: "cashflow-stress", done: true },
    { key: "match", label: "정책 매칭", agent: "Policy Match Agent", skill: "policy-match", done: true },
    { key: "draft", label: "산출물 초안", agent: "RM Copilot Agent", skill: "notification-brief", done: deliverables.length > 0 },
    { key: "gate", label: "승인 게이트", agent: "Compliance Guard", skill: "approval-gate", done: !isPending },
    { key: "audit", label: "감사 기록", agent: "Audit Ledger", skill: "audit-ledger", done: !isPending },
  ];
  const timeline = steps.map((s, i) => `
    <li class="cd-step ${s.done ? "is-done" : "is-active"}">
      <span class="cd-step-no">${i + 1}</span>
      <div class="cd-step-body">
        <strong>${escapeHtml(s.label)}</strong>
        <span class="cd-step-meta">${escapeHtml(s.agent)} · 스킬 ${escapeHtml(s.skill)}</span>
      </div>
      <span class="cd-step-status">${s.done ? "완료" : "진행 중"}</span>
    </li>`).join("");

  const agentCards = agentList.map((a) => `
    <article class="cd-agent">
      <div><strong>${escapeHtml(a.name)}</strong><span class="cd-agent-role">${escapeHtml(a.role || a.type)}</span></div>
      <div class="cd-agent-meta">큐 ${escapeHtml(String(a.queue ?? 0))} · 예산 ${Math.round((a.spent || 0) / 10000)}/${Math.round((a.budget || 0) / 10000)}만원</div>
    </article>`).join("") || `<p class="md-p">배정된 에이전트가 없습니다.</p>`;

  // 플러그인 근거 (이 케이스 관련 커넥터)
  const usedPlugins = pluginRegistry.filter((p) => ["law-moleg", "policy-sema", "news-local", "jb-db"].includes(p.id));
  const pluginChips = usedPlugins.map((p) => `<span class="tag" data-plugin-id="${escapeHtml(p.id)}">${escapeHtml(p.name)}</span>`).join("");

  const dlvCards = deliverables.map((d) => `
    <article class="dlv-card is-clickable" data-deliverable-id="${escapeHtml(d.id)}" role="button" tabindex="0">
      <div class="dlv-head"><strong>${escapeHtml(d.title)}</strong><span class="status-pill ${d.status === "generated" ? "status-approved" : ""}">${escapeHtml(d.status === "generated" ? "생성됨" : d.status === "draft" ? "초안" : "대기")}</span></div>
      <span class="dlv-meta">${escapeHtml(d.generatedBy)} · ${escapeHtml(d.at)}</span>
      <p class="dlv-gov">${escapeHtml(d.govNote || "")}</p>
    </article>`).join("") || `<p class="md-p">아직 산출물이 없습니다. 위 "산출물 생성"으로 결과물을 만들 수 있습니다.</p>`;

  const gates = (c.gates || []).map((g) => `
    <li class="gate-row gate-${g[1]}"><span>${escapeHtml(g[0])}</span><span class="gate-status">${escapeHtml(g[1] === "passed" ? "통과" : g[1] === "blocked" ? "차단" : "대기")}</span></li>`).join("");
  const auditRows = (c.audit || []).slice().reverse().map((a) => `
    <li><span class="note-date">${escapeHtml(Array.isArray(a) ? a[0] : "")}</span><p>${escapeHtml(Array.isArray(a) ? a[1] : "")}</p></li>`).join("");

  return `
    <nav class="cd-breadcrumb"><button class="link-button" type="button" data-view-jump="cases">케이스 보드</button> / <span>${escapeHtml(c.code)} · ${escapeHtml(c.customerName)}</span></nav>
    <header class="cd-header panel">
      <div class="cd-title">
        <div>
          <p class="eyebrow">자율운영 케이스</p>
          <h2>${escapeHtml(c.customerName)}</h2>
          <span class="cd-sub">${escapeHtml(c.code)} · ${escapeHtml(c.affiliate)} · ${escapeHtml(c.region || "")} · ${escapeHtml(c.primaryPain || "")}</span>
        </div>
        <div class="cd-badges">
          <span class="status-pill ${cls}">${escapeHtml(lbl)}</span>
          <span class="risk-chip">위험도 ${escapeHtml(String(c.riskScore))}</span>
        </div>
      </div>
      <div class="cd-actions">
        <button id="cd-run" class="primary-button" type="button">에이전트 실행</button>
        <button id="cd-generate" class="secondary-button" type="button">산출물 생성</button>
        <button id="cd-approve" class="secondary-button" type="button" ${isPending ? "" : "disabled"}>승인</button>
        <button id="cd-reject" class="ghost-button" type="button" ${isPending ? "" : "disabled"}>반려</button>
        <button id="cd-export" class="ghost-button" type="button">감사 JSON</button>
      </div>
    </header>

    <div class="cd-grid">
      <section class="panel cd-col">
        <div class="panel-head"><h3>자율운영 타임라인</h3></div>
        <ul class="cd-timeline">${timeline}</ul>
      </section>
      <section class="panel cd-col">
        <div class="panel-head"><h3>담당 에이전트 루프</h3><span class="status-badge">${escapeHtml(String(agentList.length))}개 배정</span></div>
        <div class="cd-agents">${agentCards}</div>
        <div class="gov-label">근거 커넥터(플러그인)</div>
        <div class="tag-row">${pluginChips}</div>
      </section>
    </div>

    <section class="panel">
      <div class="panel-head"><h3>산출물 (실제 결과물)</h3><span class="status-badge">${escapeHtml(String(deliverables.length))}건</span></div>
      <div class="dlv-grid">${dlvCards}</div>
    </section>

    ${governancePanelMarkup(c)}

    ${customerTrackingMarkup(c)}

    <div class="cd-grid">
      <section class="panel cd-col">
        <div class="panel-head"><h3>승인 게이트</h3></div>
        <ul class="gate-list">${gates || "<li class='md-p'>게이트 없음</li>"}</ul>
      </section>
      <section class="panel cd-col">
        <div class="panel-head"><h3>감사 원장</h3></div>
        <ul class="cd-audit">${auditRows || "<li class='md-p'>기록 없음</li>"}</ul>
      </section>
    </div>`;
}

/* 산출물 뷰어 (모달) */
function deliverableViewerMarkup() {
  if (!selectedDeliverableId) return "";
  let found = null;
  Object.keys(deliverableRegistry).forEach((cid) => {
    (deliverableRegistry[cid] || []).forEach((d) => { if (d.id === selectedDeliverableId) found = d; });
  });
  if (!found) return "";
  return `
    <div class="modal-backdrop" data-deliverable-close="1">
      <div class="modal dlv-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(found.title)}">
        <div class="modal-head">
          <div><p class="eyebrow">산출물 · ${escapeHtml(found.kind)}</p><h3>${escapeHtml(found.title)}</h3></div>
          <button class="icon-button" type="button" data-deliverable-close="1" aria-label="닫기">${window.iconSvg ? iconSvg("x") : "×"}</button>
        </div>
        <div class="modal-body dlv-body md-render">${mdToHtml(found.body)}</div>
        <div class="modal-foot">
          <span class="dlv-gov">${escapeHtml(found.govNote || "")}</span>
          <span class="dlv-meta">${escapeHtml(found.generatedBy)} · ${escapeHtml(found.at)}</span>
        </div>
      </div>
    </div>`;
}

/* 케이스 상세 진입 */
function openCaseDetail(caseId) {
  if (caseId) selectedCaseId = caseId;
  activeDetailType = "case";
  activeView = "case-detail";
  if (window.render) render();
}

/* 산출물 생성 (데모: 준비된 산출물을 generated 로 확정) */
function generateDeliverables(caseId) {
  const list = deliverableRegistry[caseId];
  if (!list || !list.length) { if (window.notify) notify("이 케이스는 데모 산출물이 준비되어 있지 않습니다."); return; }
  list.forEach((d) => { if (d.status !== "generated") d.status = "generated"; });
  if (window.notify) notify(`산출물 생성 완료 · ${list.length}건 (거버넌스 통과)`);
  if (window.render) render();
}

/* 산출물 뷰어 렌더 (닫기 핸들러 자체 바인딩 → 부분 렌더에서도 동작) */
function renderDeliverableViewer() {
  const root = document.getElementById("deliverable-root");
  if (!root) return;
  root.innerHTML = deliverableViewerMarkup();
  root.querySelectorAll("[data-deliverable-close]").forEach((el) =>
    el.addEventListener("click", (e) => {
      if (e.currentTarget !== e.target && el.classList.contains("modal-backdrop")) return;
      selectedDeliverableId = null;
      renderDeliverableViewer();
    })
  );
}

/* 신규 컨트롤 바인딩 — app.js render() 끝에서 호출 */
function bindModuleActions() {
  const click = (sel, fn) => document.querySelectorAll(sel).forEach((el) => el.addEventListener("click", (e) => fn(el, e)));

  // 플러그인 카드/칩 선택
  click("[data-plugin-id]", (el) => {
    selectedPluginId = el.dataset.pluginId;
    if (activeView !== "plugins") activeView = "plugins";
    if (window.render) render();
  });
  click("[data-plugin-test]", (el) => {
    const p = pluginRegistry.find((x) => x.id === el.dataset.pluginTest);
    if (window.notify) notify(`${p ? p.name : "커넥터"} 테스트 조회 · ${(p && p.sample ? p.sample.length : 0)}건 응답 (모의)`);
  });
  click("[data-plugin-toggle]", (el) => {
    const p = pluginRegistry.find((x) => x.id === el.dataset.pluginToggle);
    if (!p) return;
    p.status = p.status === "connected" ? "available" : "connected";
    if (window.notify) notify(`${p.name} ${p.status === "connected" ? "연결됨" : "연결 해제"}`);
    if (window.render) render();
  });

  // 산출물 뷰어 (열기만; 닫기는 renderDeliverableViewer 가 자체 바인딩)
  click("[data-deliverable-id]", (el) => { selectedDeliverableId = el.dataset.deliverableId; renderDeliverableViewer(); });

  // 뷰 점프 / 케이스 상세 진입
  click("[data-view-jump]", (el) => { activeView = el.dataset.viewJump; if (window.render) render(); });
  click("[data-open-case-detail]", (el) => openCaseDetail(el.dataset.openCaseDetail || selectedCaseId));

  // 케이스 상세 액션 버튼
  const onId = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("click", fn); };
  onId("cd-run", () => { if (window.runAgents) runAgents(); });
  onId("cd-generate", () => generateDeliverables(window.currentCase ? currentCase().id : selectedCaseId));
  onId("cd-approve", () => { if (window.approveCase && window.currentCase) approveCase(currentCase()); });
  onId("cd-reject", () => { if (window.rejectCase && window.currentCase) rejectCase(currentCase()); });
  onId("cd-export", () => { if (window.exportAuditJson && window.currentCase) exportAuditJson(currentCase()); });

  // 스킬 본문 편집
  onId("skill-edit-toggle", () => { skillEditMode = !skillEditMode; if (window.render) render(); });
  onId("skill-save", () => {
    const ta = document.getElementById("skill-body-edit");
    const slug = ta && ta.dataset.slug;
    if (ta && slug && skillContent[slug]) { skillContent[slug].body = ta.value; }
    else if (ta && slug) { skillContent[slug] = { body: ta.value, sources: [] }; }
    skillEditMode = false;
    if (window.notify) notify("스킬 본문이 저장되었습니다.");
    if (window.render) render();
  });
}
