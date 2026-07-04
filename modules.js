/*
 * JB 금융안전 업무지원 - 업그레이드 모듈 (swappable registries)
 * 이 파일은 app.js 보다 먼저 로드된다. 신규 데이터 레지스트리와 렌더 함수를 정의한다.
 * app.js 의 전역 헬퍼(escapeHtml, iconSvg, currentCase, render 등)는 호출 시점에 참조한다.
 * 설계: docs/02_product/element-specs/
 */

/* =========================================================================
 * 공통: 아주 작은 Markdown 렌더러 (산출물/업무 기능 본문용)
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
 * 07 · 데이터 거버넌스 / 개인정보 (모든 외부 호출의 관문)
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
  // 외부 분석 환경 전송 전 식별정보 비식별 처리 (성명/주민번호/전화/계좌/주소 패턴)
  tokenizePII(text) {
    let masked = String(text || "");
    const map = [];
    const counters = {};
    const sub = (re, kind) => {
      masked = masked.replace(re, () => {
        counters[kind] = (counters[kind] || 0) + 1;
        const token = `{{${kind}_${counters[kind]}}}`;
        map.push({ token, kind });
        return token;
      });
    };
    // 순서 중요: 주민번호(마스킹 포함)·전화·계좌 → 주소 → 성명(괄호 앞)
    sub(/\d{6}-?[1-4][\d*]{6}/g, "RRN");
    sub(/01[016789]-?\d{3,4}-?\d{4}/g, "PHONE");
    sub(/\b\d{2,6}-\d{2,6}-\d{2,7}\b/g, "ACCT");
    sub(/[가-힣]+시\s*[가-힣]+구\s*[가-힣0-9]+(로|길)/g, "ADDR");
    sub(/[가-힣]{2,4}(?=\s*\()/g, "NAME");
    return { masked, map };
  },
  // 작업 민감도에 따른 모델 라우팅
  route(taskKind, has개인정보) {
    if (has개인정보) return { target: "onprem", label: "국내·온프레 모델", reason: "식별정보 원문 포함 → 외부 전송 금지" };
    if (taskKind === "public-analysis") return { target: "external", label: "외부 분석 환경", reason: "공개정보(법령·정책·뉴스), 개인정보 없음" };
    return { target: "external", label: "외부 분석 환경", reason: "비식별 처리된 입력만 전송" };
  },
  // 외부 전송 페이로드 스캔
  egressScan(payload) {
    const re = /(\d{6}-?[1-4]\d{6})|(01[016789]-?\d{3,4}-?\d{4})/g;
    const hits = String(payload || "").match(re) || [];
    return { safe: hits.length === 0, hits };
  },
};

// 관리 건별 거버넌스 처리 기록(데모 시드) — 관리 건 상세 패널에서 가시화
const governanceLog = {
  "jeonju-cafe": {
    tokenized: {
      before: "홍길동(900101-1******) 010-0000-0000, 전주시 완산구 중앙로 카페 운전자금 1.8억", // 가상 인물·미배정 번호(마스킹 데모 센티널)
      // after 는 tokenizePII 로 렌더 시 생성
    },
    routes: [
      { task: "고객 식별·거래이력 대조", target: "onprem", label: "국내·온프레", note: "원본 개인정보 필요 → 외부 금지" },
      { task: "매출·금리 부담 분석", target: "external", label: "외부 분석", note: "범위화·비식별 수치만" },
      { task: "정책금융 후보 검토(법령·정책 분석)", target: "external", label: "외부 분석", note: "공개정보, 개인정보 없음" },
      { task: "RM 콜백 스크립트 초안", target: "external", label: "외부 분석", note: "비식별 처리된 컨텍스트" },
    ],
    egress: { scanned: 12, blocked: 1, note: "초안에 포함된 연락처 1건을 보류하고 비식별 처리" },
    laws: ["개인정보보호법 §28-2(가명정보 처리 특례)", "신용정보법 §40-2(가명·익명처리)", "전자금융감독규정(망분리)", "금융분야 AI 가이드라인(설명가능성)"],
    regBasis: "전자금융감독규정상 고유식별정보·개인신용정보를 처리하는 경우 망분리 규제가 적용된다. 따라서 외부 SaaS형 LLM에 고객 원본 개인신용정보를 전송하는 것은 규정 위반이며, 반드시 내부 가명·비식별 처리 후 외부 분석 환경을 호출해야 한다.",
  },
};

function governancePanelMarkup(caseItem) {
  const id = caseItem && caseItem.id;
  const g = (id && governanceLog[id]) || null;
  if (!g) {
    return `<section class="panel gov-panel"><div class="panel-head"><h3>데이터 거버넌스</h3><span class="status-badge">표준 정책</span></div>
      <p class="md-p">이 관리 건은 표준 개인정보 보호 정책(등급제·비식별 처리·국내/외부 분석 환경 라우팅·외부 전송 전 점검·감사)을 따릅니다.</p></section>`;
  }
  const tok = dataGovernance.tokenizePII(g.tokenized.before);
  const routeRows = g.routes.map((r) => `
    <tr><td>${escapeHtml(r.task)}</td>
    <td><span class="gov-route gov-${r.target}">${escapeHtml(r.label)}</span></td>
    <td class="gov-note">${escapeHtml(r.note)}</td></tr>`).join("");
  const lawChips = g.laws.map((l) => `<span class="tag gov-law">${escapeHtml(l)}</span>`).join("");
  return `
  <section class="panel gov-panel panel-primary">
    <div class="panel-head"><h3>데이터 거버넌스 적용</h3><span class="status-badge gov-ok">개인정보 보호 정책 적용 중</span></div>
    <div class="gov-block">
      <div class="gov-label">① 식별정보 비식별 처리 (외부 분석 환경 전송 전)</div>
      <div class="gov-token-row"><span class="gov-token-tag">식별정보 원문(내부 보관)</span><code class="gov-before">${escapeHtml(g.tokenized.before)}</code></div>
      <div class="gov-token-row"><span class="gov-token-tag ok">비식별 처리 후 분석본</span><code class="gov-after">${escapeHtml(tok.masked)}</code></div>
    </div>
    <div class="gov-block">
      <div class="gov-label">② 모델 라우팅 (민감도 분기)</div>
      <table class="gov-table"><thead><tr><th>작업</th><th>모델</th><th>근거</th></tr></thead><tbody>${routeRows}</tbody></table>
    </div>
    <div class="gov-block">
      <div class="gov-label">③ 외부 전송 전 점검 + 감사</div>
      <p class="md-p">외부 전송 ${escapeHtml(String(g.egress.scanned))}건 점검 · <strong>${escapeHtml(String(g.egress.blocked))}건 보류</strong> — ${escapeHtml(g.egress.note)} (전 접근 감사 기록)</p>
    </div>
    <div class="gov-block">
      <div class="gov-label">④ 근거 법령·가이드라인</div>
      <div class="tag-row">${lawChips}</div>
      ${g.regBasis ? `<p class="md-p gov-reg">${escapeHtml(g.regBasis)}</p>` : ""}
    </div>
  </section>`;
}

/* =========================================================================
 * 06 · 고객 DB + 관리 건↔고객 추적
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
      { date: "2026-05-28", actor: "위험신호 조기감지 AI 업무지원", text: "카드매출 3개월 연속 감소 신호 감지(공개 상권지표 기반)." },
      { date: "2026-06-10", actor: "상환위험 분류 AI 업무지원", text: "운전자금 상환 부담 상승, 금리인하요구권·정책금융 검토 제안." },
      { date: "2026-06-14", actor: "RM 최종 승인자", text: "콜백 스크립트 검토 대기. 고객 직접 접촉 전 승인 필요." },
    ],
  },
];
function customerByCaseId(caseId) {
  return customers.find((c) => c.caseIds.includes(caseId)) || null;
}

function customerTrackingMarkup(caseItem) {
  const c = caseItem && customerByCaseId(caseItem.id);
  if (!c) return "";
  const bars = c.riskTrend.map((p) => {
    const h = Math.min(100, Math.max(10, Math.round(((p.score - 50) / 50) * 100))); // 50→0%,100→100%, 최소 10%
    const hot = p.score >= 85;
    return `
    <div class="trend-col">
      <b class="trend-score ${hot ? "is-hot" : ""}">${escapeHtml(String(p.score))}</b>
      <div class="trend-track"><i class="${hot ? "is-hot" : ""}" style="height:${h}%"></i></div>
      <span class="trend-date">${escapeHtml(p.date.slice(2))}</span>
    </div>`;
  }).join("");
  const notes = c.notes.map((n) => `
    <li><span class="note-date">${escapeHtml(n.date)}</span><span class="note-actor">${escapeHtml(n.actor)}</span><p>${escapeHtml(n.text)}</p></li>`).join("");
  const linkedCases = c.caseIds.map((cid) => {
    const ci = (typeof cases !== "undefined" ? cases : []).find((x) => x.id === cid);
    return ci ? `<span class="tag">${escapeHtml(ci.code)} · ${escapeHtml(ci.customerName)}</span>` : "";
  }).join("");
  return `
  <section class="panel customer-panel">
    <div class="panel-head"><h3>고객 추적</h3><span class="status-badge">개인정보 마스킹</span></div>
    <div class="customer-head">
      <div><strong>${escapeHtml(c.maskedName)}</strong><span class="customer-sub">${escapeHtml(c.affiliate)} · ${escapeHtml(c.segment)} · 거래 ${escapeHtml(c.since)}~</span></div>
      <div class="tag-row">${linkedCases}</div>
    </div>
    <div class="gov-label">리스크 추이 (주의 수준 점수)</div>
    <div class="trend-chart">${bars}</div>
    <div class="gov-label">관찰·상담 이력</div>
    <ul class="customer-notes">${notes}</ul>
  </section>`;
}

/* =========================================================================
 * 03 · 관리 건별 산출물 (MD 결과물) — 일부는 리서치 후 보강
 * ========================================================================= */
const deliverableRegistry = {
  "jeonju-cafe": [
    {
      id: "dlv-stress",
      title: "상환 부담 검토 리포트",
      kind: "report", status: "generated",
      generatedBy: "상환위험 분류 AI 업무지원", at: "2026-06-14 10:20",
      govNote: "비식별 수치만 외부 분석 환경으로 분석, 식별정보 원문은 내부 보관.",
      body: `# 상환 부담 검토 리포트\n## 대상\n- 관리 건 JBG-104 · 전주 중앙로 카페(개인사업자)\n- 익스포저: 운전자금 1.8억 · 카드매출 둔화\n\n## 핵심 지표 (범위화)\n- 최근 3개월 카드매출 증감률: **-12% / -9% / -7%**\n- 운전자금 월 상환액 대비 가용 현금흐름: **약 1.1배 (경계)**\n- 추정 DSR: **상승 구간** (정밀 산정은 심사 시스템 연동 필요)\n\n## 상환 시나리오\n1. 현 금리 유지 시: 3개월 내 현금흐름 압박 가능성 **중상**\n2. 금리인하요구권 적용 시: 월 상환 부담 완화 여지\n3. 정책금융 대환 시: 만기·금리 재구조화로 압박 완화\n\n## 권고\n- 금리인하요구권 안내 + 정책금융 후보 검토(별도 산출물)\n- 고객 접촉은 **담당자 최종 확인 후**, 과장표현 없는 스크립트 사용\n\n> 본 리포트는 비식별 데이터 기반 초안이며 최종 검토는 RM·심사 검토를 따릅니다.`,
    },
    {
      id: "dlv-policy",
      title: "정책금융 후보 검토 결과",
      kind: "report", status: "generated",
      generatedBy: "정책금융 후보 검토 AI 업무지원", at: "2026-06-14 10:24",
      govNote: "공개 정책·법령 분석(개인정보 없음) → 비식별 데이터에 한해 외부 분석 검토.",
      body: `# 정책금융 후보 검토 결과 (초안)\n> 세부 수치는 정책 커넥터(소진공/지역신보) 최신 공고로 최종 확인. 자격은 상담·심사 후 최종 확인.\n\n## 후보 프로그램 (적합도 순)\n1. **소상공인 저금리 대환대출 (2026)** — 7% 이상 사업자대출 → 연 4.5% 고정 전환, 최대 5,000만원, 2년 거치+8년 분할. NCB 919점 이하. 5,000만원 기준 연 약 123만원 이자 절감. 신청: ols.semas.or.kr\n2. **소진공 일반 경영안정자금** — 대리대출, 최대 7,000만원, 운영자금(임대료·인건비·원부자재). 업력·요건 확인 필요.\n3. **소공인 특화자금(운전)** — 직접대출 최대 1억원(제조 소공인 대상, 카페는 해당성 검토).\n4. **햇살론뱅크(전북은행)** — 5,000억 공급, 소상공인 금리 최대 1%p 감면 연계.\n5. **금리인하요구권** — 금융소비자보호법상 권리, 신용상태 개선 시 인하 신청.\n\n## 적합성 메모\n- 카드매출 둔화·운전자금 부담 → **대환 + 경영안정자금** 우선, 담보 여력 제한 시 **지역신용보증재단 보증** 결합.\n- 기준금리 2.5%(2026.01 동결) 환경, 고금리 대출 보유 시 대환 효과 큼.\n\n## 후속 확인 항목\n- 필요 서류 체크리스트(별도 산출물) 안내, RM 상담 예약, 자격 요건 사전 확인.`,
    },
    {
      id: "dlv-script",
      title: "RM 콜백 스크립트 초안",
      kind: "script", status: "draft",
      generatedBy: "RM 보좌 AI 업무지원", at: "2026-06-14 10:28",
      govNote: "연락처 토큰 치환, 준법 검토 점검 완료 후 발송.",
      body: `# RM 콜백 스크립트 초안 (승인 전)\n## 인사\n"안녕하세요 {{고객}}님, 전북은행 OO지점 OOO입니다. 사업 잘 되고 계신지요."\n\n## 목적 안내 (최종 확인·과장 표현 금지)\n"최근 사업 운영자금 관련해 도움이 될 수 있는 **정책금융·금리 안내**를 드리고자 연락드렸습니다. 가입이나 승인 최종 확인 안내가 아니며 검토 가능한 선택지를 설명드리는 것입니다."\n\n## 핵심\n- 금리인하요구권 안내\n- 정책자금/대환 검토 가능성(자격 요건은 상담·심사 후 최종 확인)\n- 필요 서류 안내\n\n## 준법 체크\n- [x] 최종 확인·보장 표현 없음\n- [x] 개인정보 최소 언급\n- [ ] RM 최종 확인 — **대기**`,
    },
    {
      id: "dlv-checklist",
      title: "상담 전 서류 체크리스트",
      kind: "checklist", status: "generated",
      generatedBy: "서류 체크리스트 AI 업무지원", at: "2026-06-14 10:30",
      govNote: "양식·항목만, 고객 데이터 미포함.",
      body: `# 상담 전 서류 체크리스트\n## 공통\n- 사업자등록증\n- 최근 부가세 신고서 / 매출 증빙\n- 임대차계약서(사업장)\n- 기존 대출 약정·잔액 확인서\n\n## 정책금융용\n- 소상공인 확인서 / 해당 요건 증빙\n- (보증 결합 시) 지역신보 요구 서류\n\n## 확인 질문\n- 최근 매출 변동 사유\n- 기존 대출 금리·만기 구조\n- 담보·보증 여력`,
    },
    {
      id: "dlv-audit",
      title: "준법·감사 요약",
      kind: "audit", status: "generated",
      generatedBy: "준법 검토 / 감사 원장", at: "2026-06-14 10:32",
      govNote: "거버넌스 처리·담당자 승인 절차·감사 해시.",
      body: `# 준법·감사 요약\n## 거버넌스\n- 식별정보 비식별 처리 적용, 원문은 내부 보관\n- 모델 라우팅: 식별 작업 국내, 분석/초안 외부(비식별)\n- 외부 전송 전 점검 1건 보류(연락처)\n\n## 담당자 승인 절차\n- 외부 고객 접촉: **담당자 최종 확인 대기**\n- 최종 확인·보장 표현: 표현 점검 완료\n\n## 감사\n- 근거→검토→행동→승인 전 단계 무결성 해시 기록\n- 무결성 검증: 점검 완료`,
    },
  ],
};
function deliverablesForCase(caseId) { return deliverableRegistry[caseId] || []; }

/* =========================================================================
 * 05 · 플러그인 / MCP 레지스트리 (법령·정책·뉴스·JB DB)
 * 리서치 기반 실제 내용 (출처 포함). govTier 가 개인정보면 거버넌스 강제.
 * ========================================================================= */
const pluginRegistry = [
  {
    id: "law-moleg", kind: "law", name: "국가법령정보 커넥터",
    scope: ["개인정보보호법", "신용정보법", "전자금융감독규정"],
    govTier: "public", status: "connected",
    summary: "현행법 조문·시행령 조회 (AI 업무지원 준법 검토 근거)",
    usedBy: ["compliance-guard", "audit-ledger"],
    sample: [
      { title: "개인정보보호법 §28-2", text: "가명정보 처리 특례 — 통계·연구·공익기록 목적 시 정보주체 동의 없이 가명정보 처리 가능.", src: "개인정보보호위원회" },
      { title: "개인정보보호법 §28-3", text: "가명정보 결합 제한 — 다른 정보와 결합은 보호위 지정 전문기관을 통해서만.", src: "개인정보보호위원회" },
      { title: "신용정보법 §40-2", text: "가명·익명처리 행위규칙 — 가명처리 후에도 기술적·관리적 보안대책 의무.", src: "한국법령정보센터" },
      { title: "전자금융감독규정(망분리)", text: "고유식별정보·개인신용정보 처리 시 망분리 규제 적용 → 외부 SaaS LLM에 원본 개인정보 전송 불가.", src: "금융위원회" },
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
    summary: "재개발·정비사업 정보 (상권/임대 영향, 전세 관리 건 시 시세·등기)",
    usedBy: ["pain-radar"],
    sample: [
      { title: "원도심 정비·상권 변화", text: "정비사업 진행 구역의 임대료·유동인구 변화는 소상공인 매출에 직접 영향. 관리 건 위험 신호로 반영.", src: "지자체 고시·뉴스" },
    ],
  },
  {
    id: "jb-db", kind: "jb-db", name: "JB 금융 데이터베이스 커넥터",
    scope: ["고객 거래내역", "상담 이력", "여신 심사 데이터"],
    govTier: "restricted", status: "available",
    summary: "고객 거래·상담·심사 이력 (개인정보 포함 → 거버넌스 필수)",
    usedBy: ["case-os-core", "rm-copilot"],
    govEnforced: true,
    sample: [
      { title: "여신 AICC 연계(JB×네이버클라우드)", text: "2025.12.26 MOU, 하이퍼클로바X 기반 AICC. 상담 데이터 추출·심사 요약·사후관리 근거 자동생성.", src: "전자신문" },
      { title: "개인정보 처리 원칙", text: "식별정보 원문은 내부 보관·온프레 모델에서만 사용합니다. 외부 분석 환경에는 비식별 데이터만 전송합니다.", src: "거버넌스 정책" },
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
      ? `<span class="tag gov-law">거버넌스 필수 · 개인정보</span>`
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
      <p>AI 업무지원 기능이 참조하는 법령·정책·뉴스·JB 금융 DB 연결점입니다. 모든 연결은 개인정보·권한 정책을 거쳐 점검합니다.</p>
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
    ? `<p class="md-p gov-reg">이 커넥터는 개인정보를 포함하므로 비식별 처리, 국내·온프레 모델 라우팅, 외부 전송 전 점검이 강제됩니다.</p>`
    : `<p class="md-p">공개정보 커넥터로 개인정보가 없어 외부 분석 환경 분석이 허용됩니다.</p>`;
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
 * 02 · 실질 업무 기능 콘텐츠 (핵심 업무 기능 본문, 리서치 기반)
 * ========================================================================= */
const skillContent = {
  "cashflow-stress": {
    sources: ["news-local#전북 자영업 지표", "policy-sema#금리인하요구권"],
    body: `# 매출 둔화·금리 부담·상환 압박 검토\n\n## 목적/적용\n소상공인 관리 건에서 현금흐름 악화와 상환 압박을 조기에 정량 검토해 정책금융·금리 조치로 연결한다.\n\n## 입력 (데이터 등급)\n- 카드/현금 매출 추이 [confidential, 범위화]\n- 운전자금·대출 잔액·금리·만기 [confidential]\n- 업종·지역 상권 지표 [public, 뉴스 커넥터]\n- 고객 식별정보 [restricted] — **외부 분석 환경 미전송**\n\n## 처리 절차\n1. 최근 3~6개월 매출 증감률 산출, 추세(둔화/급감) 분류\n2. 월 상환액 대비 가용 현금흐름 배수 계산 (1.0 미만=위험, 1.0~1.2=경계)\n3. 추정 DSR·이자보상배율 점검 (정밀치는 심사 시스템 연동)\n4. 지역 상권 신호(공실·유동인구·경기) 가중\n5. 종합 상환 부담 등급(저/중/중상/고) 산출\n\n## 검토 기준/임계값\n- 매출 3개월 연속 감소 + 현금흐름 배수 1.2 이하 → "중상" 이상\n- 보유 대출 금리 7% 이상 → 대환 후보 자동 태깅\n- 기준금리(2.5%) 대비 과도 스프레드 → 금리인하요구권 안내 후보\n\n## 출력\n- 상환 부담 검토 리포트(산출물), 상환 시나리오 3종, 검토할 조치\n\n## 근거\n- 금리인하요구권: 금융소비자보호법상 권리\n- 전북 자영업 부담 지표(대출잔액 29.3조·연체율 2.2%) 맥락 반영\n\n## 승인/리스크\n- 검토은 내부용, 고객 접촉 권고는 담당자 최종 확인 필요. 리스크: medium`,
  },
  "policy-match": {
    sources: ["policy-sema#소상공인 저금리 대환대출", "policy-sema#일반 경영안정자금"],
    body: `# 정책금융·대환·보증 매칭\n\n## 목적/적용\n관리 건의 자금 수요·신용 상태에 맞는 공적 정책금융 프로그램을 매칭하고 적합도를 정렬한다.\n\n## 입력 (데이터 등급)\n- 자금 용도·규모·기존 대출 구조 [confidential]\n- 업력·업종·상시근로자 수 [internal]\n- 정책 프로그램 카탈로그 [public, 정책 커넥터]\n- 고객 식별정보 [restricted] — 미전송\n\n## 처리 절차\n1. 자금 용도 분류(운전/시설/대환)\n2. 프로그램 요건 매칭: 소진공 경영안정자금(≤7천만), 소공인 특화자금(운전 1억/시설 5억), 대환(7%↑→4.5%, ≤5천만, NCB 919↓), 햇살론뱅크(전북 5천억)\n3. 담보·보증 여력 점검 → 부족 시 지역신용보증재단 보증 결합\n4. 금리인하요구권 병행 가능성 점검\n5. 적합도 점수화·정렬, 예상 절감액 추정(예: 대환 5천만 기준 연 약 123만원)\n\n## 검토 기준/임계값\n- 보유 대출 금리 7% 이상 & NCB 919 이하 → 대환 1순위\n- 업력 3년 미만 & 운영자금 → 경영안정자금 후보\n\n## 출력\n- 정책금융 후보 검토 결과(산출물), 후보 프로그램 표, 후속 확인 항목(서류·상담)\n\n## 근거/출처\n- 소진공/중기부 공고(ols.semas.or.kr), JB금융 햇살론뱅크 보도자료\n- 세부 수치는 정책 커넥터 최신값으로 최종 확인\n\n## 승인/리스크\n- 자격은 "검토 가능성"으로만 안내(최종 확인·보장 표현 금지). 리스크: medium`,
  },
  "compliance-guard": {
    sources: ["law-moleg#개인정보보호법 §28-2", "law-moleg#전자금융감독규정(망분리)"],
    body: `# 준법·개인정보·과장표현 검토\n\n## 목적/적용\n고객 대상 산출물·행동이 준법·개인정보·표현 규제를 위반하지 않는지 검토합니다.\n\n## 입력 (데이터 등급)\n- 산출물 초안(스크립트·안내문) [internal]\n- 포함된 개인정보 [restricted]\n- 관련 법령 [public, 법령 커넥터]\n\n## 처리 절차\n1. 최종 확인·보장·과장 표현 탐지("승인됩니다", "무조건" 등) → 보류/수정 요청\n2. 개인정보 최소화 점검, 개인정보 노출 시 비식별 처리 요구\n3. 외부 분석 환경 전송 대상이면 망분리·가명처리 적합성 검증\n4. 금융분야 AI 가이드라인(설명가능성·내부통제) 체크\n5. 점검 완료/보류 판정 + 담당자 승인 절차 연결\n\n## 검토 기준\n- 식별정보 원문 외부 전송 시도 → **보류**(전자금융감독규정 망분리)\n- 최종 확인 표현 1건 이상 → 수정 요청\n\n## 출력\n- 준법 체크 결과, 수정 제안, 담당자 승인 절차 상태\n\n## 근거\n- 개인정보보호법 §28-2/§28-3, 신용정보법 §40-2, 전자금융감독규정(망분리), 금융분야 AI 가이드라인\n\n## 승인/리스크\n- 고객 영향 조치 보류 권한 보유. 리스크: high(필수 통제)`,
  },
};
function skillBody(slug) {
  const c = skillContent[slug];
  return c ? c.body : "";
}

/* 업무 기능 본문 패널 (보기/편집) — app.js skillDetailMarkup 에서 호출 */
function skillBodyPanel(skill) {
  const body = skillBody(skill.slug);
  const srcs = skillSources(skill.slug);
  const srcChips = srcs.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join("");
  if (!body && !skillEditMode) {
    return compactPanel("운영 콘텐츠", "실제 절차·기준", `<div class="empty-state"><p>이 업무 기능은 아직 상세 콘텐츠가 없습니다. 편집으로 추가할 수 있습니다.</p><button id="skill-edit-toggle" class="secondary-button" type="button">콘텐츠 편집</button></div>`);
  }
  const inner = skillEditMode
    ? `<textarea id="skill-body-edit" data-slug="${escapeHtml(skill.slug)}" class="skill-editor" rows="18">${escapeHtml(body)}</textarea>
       <div class="action-row"><button id="skill-save" class="primary-button" type="button">저장</button><button id="skill-edit-toggle" class="ghost-button" type="button">취소</button></div>`
    : `<div class="md-render skill-body">${mdToHtml(body)}</div>
       ${srcChips ? `<div class="gov-label">근거 출처</div><div class="tag-row">${srcChips}</div>` : ""}
       <div class="action-row"><button class="primary-button" type="button" data-skill-view="${escapeHtml(skill.slug)}">전체 보기</button><button id="skill-edit-toggle" class="secondary-button" type="button">편집</button></div>`;
  return compactPanel("운영 콘텐츠", "실제 절차·검토 기준·근거", inner, skillEditMode ? "편집 중" : "보기");
}
function skillSources(slug) {
  const c = skillContent[slug];
  return (c && c.sources) || [];
}

/* 신규 UI 상태 (app.js 보다 먼저 선언 → 전역 공유) */
let selectedPluginId = null;
let docView = null; // 공용 문서 뷰어 (산출물·업무 기능 본문 등): {eyebrow,title,body,footL,footR}
let skillEditMode = false;
let tokenPeriod = "daily"; // 토큰 통계 기간: daily | weekly | monthly

/* =========================================================================
 * 토큰 사용량 통계 (일간/주간/월간) — input/output 토큰
 * ========================================================================= */
const tokenUsage = {
  daily: [
    { x: "6/08", input: 302000, output: 121000 },
    { x: "6/09", input: 358000, output: 142000 },
    { x: "6/10", input: 331000, output: 138000 },
    { x: "6/11", input: 402000, output: 167000 },
    { x: "6/12", input: 377000, output: 151000 },
    { x: "6/13", input: 438000, output: 182000 },
    { x: "6/14", input: 351000, output: 144000 },
  ],
  weekly: [
    { x: "5월 2주", input: 1980000, output: 820000 },
    { x: "5월 3주", input: 2110000, output: 880000 },
    { x: "5월 4주", input: 2240000, output: 910000 },
    { x: "6월 1주", input: 2360000, output: 980000 },
    { x: "6월 2주", input: 2280000, output: 940000 },
    { x: "6월 3주", input: 2520000, output: 1040000 },
  ],
  monthly: [
    { x: "3월", input: 5900000, output: 2300000 },
    { x: "4월", input: 6900000, output: 2700000 },
    { x: "5월", input: 8700000, output: 3400000 },
    { x: "6월", input: 9600000, output: 3800000 },
  ],
};
const tokenPeriodLabels = { daily: "일간", weekly: "주간", monthly: "월간" };

function formatTokens(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return Math.round(n / 1000) + "K";
  return String(n);
}

function tokenStatsView() {
  const rows = tokenUsage[tokenPeriod] || tokenUsage.daily;
  const totalIn = rows.reduce((s, r) => s + r.input, 0);
  const totalOut = rows.reduce((s, r) => s + r.output, 0);
  const total = totalIn + totalOut;
  const outRate = total ? Math.round((totalOut / total) * 100) : 0;
  const inRate = 100 - outRate;
  const lastTot = rows[rows.length - 1].input + rows[rows.length - 1].output;
  const prevTot = rows.length > 1 ? rows[rows.length - 2].input + rows[rows.length - 2].output : lastTot;
  const delta = prevTot ? Math.round(((lastTot - prevTot) / prevTot) * 1000) / 10 : 0;
  const up = delta >= 0;
  const series = rows.map((r) => ({ x: r.x, y: r.input + r.output }));
  const tabs = ["daily", "weekly", "monthly"].map((k) =>
    `<button type="button" class="seg-btn ${k === tokenPeriod ? "is-active" : ""}" data-token-period="${k}">${tokenPeriodLabels[k]}</button>`).join("");
  return `
    <div class="token-stats">
      <div class="token-head">
        <div class="token-hero">
          <span class="token-hero-label">총 토큰 · ${tokenPeriodLabels[tokenPeriod]}</span>
          <div class="token-hero-row">
            <strong>${formatTokens(total)}</strong>
            <span class="delta-badge ${up ? "up" : "down"}">${up ? "▲" : "▼"} ${Math.abs(delta)}%</span>
          </div>
          <span class="token-hero-sub">최근 구간 ${formatTokens(lastTot)} · 직전 대비</span>
        </div>
        <div class="segmented">${tabs}</div>
      </div>
      ${svgArea(series, { w: 620, h: 180, valueLabels: false, aria: `${tokenPeriodLabels[tokenPeriod]} 토큰 사용량` })}
      <div class="io-split">
        <div class="io-bar"><i class="io-in" style="width:${inRate}%"></i><i class="io-out" style="width:${outRate}%"></i></div>
        <div class="io-legend">
          <span class="io-leg"><i class="io-dot in"></i>입력 ${formatTokens(totalIn)} · ${inRate}%</span>
          <span class="io-leg"><i class="io-dot out"></i>출력 ${formatTokens(totalOut)} · ${outRate}%</span>
        </div>
      </div>
    </div>`;
}

/* =========================================================================
 * 01 · 관리 건 상세 페이지 (자율운영 뷰)
 * ========================================================================= */
function caseDetailPage(caseItem) {
  if (!caseItem) return `<div class="empty-state"><p>관리 건을 찾을 수 없습니다.</p></div>`;
  const c = caseItem;
  const lbl = window.statusLabel ? statusLabel(c.status) : c.status;
  const cls = window.statusClass ? statusClass(c.status) : "";
  const agentList = (typeof agents !== "undefined" ? agents : []).filter((a) => (c.agents || []).includes(a.id));
  const deliverables = deliverablesForCase(c.id);
  const isPending = c.status === "Approval Pending";

  // 자율운영 타임라인 단계
  const steps = [
    { key: "detect", label: "위험 감지", agent: "Pain Radar Agent", skill: "evidence-harvest", done: true },
    { key: "evidence", label: "근거 수집(플러그인)", agent: "근거 수집", skill: "source-ranker", done: true },
    { key: "analyze", label: "분석·검토", agent: "Cashflow Triage Agent", skill: "cashflow-stress", done: true },
    { key: "match", label: "정책 매칭", agent: "Policy Match Agent", skill: "policy-match", done: true },
    { key: "draft", label: "산출물 초안", agent: "RM Copilot Agent", skill: "notification-brief", done: deliverables.length > 0 },
    { key: "gate", label: "담당자 승인 절차", agent: "Compliance Guard", skill: "approval-gate", done: !isPending },
    { key: "audit", label: "감사 기록", agent: "감사 원장", skill: "audit-ledger", done: !isPending },
  ];
  const timeline = steps.map((s, i) => `
    <li class="cd-step ${s.done ? "is-done" : "is-active"}">
      <span class="cd-step-no">${i + 1}</span>
      <div class="cd-step-body">
        <strong>${escapeHtml(s.label)}</strong>
        <span class="cd-step-meta">${escapeHtml(window.agentLabel ? agentLabel(s.agent) : s.agent)} · 업무 기능 ${escapeHtml(window.skillLabel ? skillLabel(s.skill) : s.skill)}</span>
      </div>
      <span class="cd-step-status">${s.done ? "완료" : "진행 중"}</span>
    </li>`).join("");

  const agentCards = agentList.map((a) => `
    <article class="cd-agent">
      <div><strong>${escapeHtml(window.agentLabel ? agentLabel(a) : a.name)}</strong><span class="cd-agent-role">${escapeHtml(a.role || a.type)}</span></div>
      <div class="cd-agent-meta">큐 ${escapeHtml(String(a.queue ?? 0))} · 예산 ${Math.round((a.spent || 0) / 10000)}/${Math.round((a.budget || 0) / 10000)}만원</div>
    </article>`).join("") || `<p class="md-p">배정된 AI 업무지원 기능이 없습니다.</p>`;

  // 플러그인 근거 (이 관리 건 관련 커넥터)
  const usedPlugins = pluginRegistry.filter((p) => ["law-moleg", "policy-sema", "news-local", "jb-db"].includes(p.id));
  const pluginChips = usedPlugins.map((p) => `<span class="tag" data-plugin-id="${escapeHtml(p.id)}">${escapeHtml(p.name)}</span>`).join("");

  const dlvCards = deliverables.map((d) => `
    <article class="dlv-card is-clickable" data-deliverable-id="${escapeHtml(d.id)}" role="button" tabindex="0">
      <div class="dlv-head"><strong>${escapeHtml(d.title)}</strong><span class="status-pill ${d.status === "generated" ? "status-approved" : ""}">${escapeHtml(d.status === "generated" ? "생성됨" : d.status === "draft" ? "초안" : "대기")}</span></div>
      <span class="dlv-meta">${escapeHtml(d.generatedBy)} · ${escapeHtml(d.at)}</span>
      <p class="dlv-gov">${escapeHtml(d.govNote || "")}</p>
    </article>`).join("") || `<p class="md-p">아직 산출물이 없습니다. 위 "산출물 생성"으로 결과물을 만들 수 있습니다.</p>`;

  const gates = (c.gates || []).map((g) => `
    <li class="gate-row gate-${g[1]}"><span>${escapeHtml(g[0])}</span><span class="gate-status">${escapeHtml(g[1] === "passed" ? "점검 완료" : g[1] === "blocked" ? "차단" : "대기")}</span></li>`).join("");
  const auditRows = (c.audit || []).slice().reverse().map((a) => `
    <li><span class="note-date">${escapeHtml(Array.isArray(a) ? a[0] : "")}</span><p>${escapeHtml(Array.isArray(a) ? a[1] : "")}</p></li>`).join("");

  return `
    <nav class="cd-breadcrumb"><button class="link-button" type="button" data-view-jump="cases">관리 건 보드</button> / <span>${escapeHtml(c.code)} · ${escapeHtml(c.customerName)}</span></nav>
    <header class="cd-header panel">
      <div class="cd-title">
        <div>
          <p class="eyebrow">자율운영 관리 건</p>
          <h2>${escapeHtml(c.customerName)}</h2>
          <span class="cd-sub">${escapeHtml(c.code)} · ${escapeHtml(c.affiliate)} · ${escapeHtml(c.region || "")} · ${escapeHtml(c.primaryPain || "")}</span>
        </div>
        <div class="cd-badges">
          <span class="status-pill ${cls}">${escapeHtml(lbl)}</span>
          <span class="risk-chip">주의 수준 ${escapeHtml(String(c.riskScore))}</span>
        </div>
      </div>
      <div class="cd-actions">
        <button id="cd-run" class="primary-button" type="button">AI 분석 요청</button>
        <button id="cd-generate" class="secondary-button" type="button">산출물 생성</button>
        <button id="cd-approve" class="secondary-button" type="button" ${isPending ? "" : "disabled"}>고객 안내 승인</button>
        <button id="cd-reject" class="ghost-button" type="button" ${isPending ? "" : "disabled"}>수정 요청</button>
        <button id="cd-export" class="ghost-button" type="button">감사 JSON</button>
      </div>
    </header>

    <div class="cd-grid">
      <section class="panel cd-col">
        <div class="panel-head"><h3>자율운영 타임라인</h3></div>
        <ul class="cd-timeline">${timeline}</ul>
      </section>
      <section class="panel cd-col">
        <div class="panel-head"><h3>담당 AI 업무지원 루프</h3><span class="status-badge">${escapeHtml(String(agentList.length))}개 배정</span></div>
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
        <div class="panel-head"><h3>담당자 승인 절차</h3></div>
        <ul class="gate-list">${gates || "<li class='md-p'>게이트 없음</li>"}</ul>
      </section>
      <section class="panel cd-col">
        <div class="panel-head"><h3>감사 원장</h3></div>
        <ul class="cd-audit">${auditRows || "<li class='md-p'>기록 없음</li>"}</ul>
      </section>
    </div>`;
}

/* 공용 문서 뷰어 (모달) — 산출물·업무 기능 본문 등 긴 MD를 크게/스크롤로 표시 */
function docViewerMarkup() {
  if (!docView) return "";
  const d = docView;
  return `
    <div class="modal-backdrop" data-doc-close="backdrop">
      <div class="modal-card doc-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(d.title)}">
        <div class="modal-head">
          <div>${d.eyebrow ? `<p class="eyebrow">${escapeHtml(d.eyebrow)}</p>` : ""}<h2>${escapeHtml(d.title)}</h2></div>
          <button class="icon-only-button" type="button" data-doc-close="btn" aria-label="닫기">${window.iconSvg ? iconSvg("x") : "×"}</button>
        </div>
        <div class="doc-body md-render">${mdToHtml(d.body)}</div>
        ${(d.footL || d.footR) ? `<div class="doc-foot"><span class="dlv-gov">${escapeHtml(d.footL || "")}</span><span class="dlv-meta">${escapeHtml(d.footR || "")}</span></div>` : ""}
      </div>
    </div>`;
}

/* 관리 건 상세 진입 */
function openCaseDetail(caseId) {
  if (caseId) selectedCaseId = caseId;
  activeDetailType = "case";
  activeView = "case-detail";
  if (window.render) render();
}

/* 산출물 생성 (데모: 준비된 산출물을 generated 로 최종 확인) */
function generateDeliverables(caseId) {
  const list = deliverableRegistry[caseId];
  if (!list || !list.length) { if (window.notify) notify("이 관리 건은 데모 산출물이 준비되어 있지 않습니다."); return; }
  list.forEach((d) => { if (d.status !== "generated") d.status = "generated"; });
  if (window.notify) notify(`산출물 생성 완료 · ${list.length}건 (거버넌스 점검 완료)`);
  if (window.render) render();
}

function openDoc(doc) { docView = doc; renderDeliverableViewer(); }
function closeDoc() { docView = null; renderDeliverableViewer(); }

/* 문서 뷰어 렌더 (닫기 핸들러 자체 바인딩 → 부분 렌더에서도 동작) */
function renderDeliverableViewer() {
  const root = document.getElementById("deliverable-root");
  if (!root) return;
  root.innerHTML = docViewerMarkup();
  root.querySelectorAll("[data-doc-close]").forEach((el) =>
    el.addEventListener("click", (e) => {
      // backdrop 클릭은 backdrop 자체를 눌렀을 때만 닫기 (모달 본문 클릭은 유지)
      if (el.dataset.docClose === "backdrop" && e.target !== el) return;
      closeDoc();
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
  click("[data-deliverable-id]", (el) => {
    const did = el.dataset.deliverableId;
    let found = null;
    Object.keys(deliverableRegistry).forEach((cid) => { (deliverableRegistry[cid] || []).forEach((d) => { if (d.id === did) found = d; }); });
    if (found) openDoc({ eyebrow: `산출물 · ${found.kind}`, title: found.title, body: found.body, footL: found.govNote, footR: `${found.generatedBy} · ${found.at}` });
  });
  // 업무 기능 본문 전체 보기
  click("[data-skill-view]", (el) => {
    const slug = el.dataset.skillView;
    const body = skillBody(slug);
    const label = (window.skillLabel ? skillLabel(slug) : slug);
    if (body) openDoc({ eyebrow: "업무 기능 운영 콘텐츠", title: label, body });
  });

  // 토큰 통계 기간 토글
  click("[data-token-period]", (el) => { tokenPeriod = el.dataset.tokenPeriod; if (window.render) render(); });

  // 뷰 점프 / 관리 건 상세 진입
  click("[data-view-jump]", (el) => { activeView = el.dataset.viewJump; if (window.render) render(); });
  click("[data-open-case-detail]", (el) => openCaseDetail(el.dataset.openCaseDetail || selectedCaseId));

  // 관리 건 상세 액션 버튼
  const onId = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("click", fn); };
  onId("cd-run", () => { if (window.runAgents) runAgents(); });
  onId("cd-generate", () => generateDeliverables(window.currentCase ? currentCase().id : selectedCaseId));
  onId("cd-approve", () => { if (window.approveCase && window.currentCase) approveCase(currentCase()); });
  onId("cd-reject", () => { if (window.rejectCase && window.currentCase) rejectCase(currentCase()); });
  onId("cd-export", () => { if (window.exportAuditJson && window.currentCase) exportAuditJson(currentCase()); });

  // 업무 기능 본문 편집
  onId("skill-edit-toggle", () => { skillEditMode = !skillEditMode; if (window.render) render(); });
  onId("skill-save", () => {
    const ta = document.getElementById("skill-body-edit");
    const slug = ta && ta.dataset.slug;
    if (ta && slug && skillContent[slug]) { skillContent[slug].body = ta.value; }
    else if (ta && slug) { skillContent[slug] = { body: ta.value, sources: [] }; }
    persistSkillContent();
    skillEditMode = false;
    if (window.notify) notify("업무 기능 본문이 저장되었습니다.");
    if (window.render) render();
  });
}

/* 업무 기능 콘텐츠 편집 영속화 (localStorage) — 02-skill-content-engine 스펙 */
const skillContentStorageKey = "jb-localguard-skill-content-v1";
function persistSkillContent() {
  try { localStorage.setItem(skillContentStorageKey, JSON.stringify(skillContent)); }
  catch (e) { console.warn("skillContent 저장 실패", e); }
}
function restoreSkillContent() {
  try {
    const raw = localStorage.getItem(skillContentStorageKey);
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.keys(saved || {}).forEach((slug) => { skillContent[slug] = saved[slug]; });
  } catch (e) { console.warn("skillContent 복원 실패", e); }
}
restoreSkillContent();

/* =========================================================================
 * M2 · SVG/CSS 차트 헬퍼 (라이브러리 없음). 호출 시점에 escapeHtml 사용.
 * ========================================================================= */
function chartColorByScore(v) { return v >= 85 ? "#c0322a" : v >= 70 ? "#b76700" : "#07569d"; }

function svgDonut(value, total, opts) {
  opts = opts || {};
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const r = 42, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  const color = opts.color || (pct >= 90 ? "#c0322a" : pct >= 70 ? "#b76700" : "#07569d");
  return `<div class="donut-wrap">
    <svg viewBox="0 0 100 100" class="donut" role="img" aria-label="${escapeHtml(opts.aria || (pct + "퍼센트"))}">
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="#e8eef6" stroke-width="11"/>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="11" stroke-linecap="round"
        stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 50 50)"/>
      <text x="50" y="50" class="donut-pct" text-anchor="middle" dominant-baseline="central">${pct}%</text>
    </svg>
    ${opts.label ? `<div class="donut-label"><strong>${escapeHtml(opts.label)}</strong>${opts.sub ? `<span>${escapeHtml(opts.sub)}</span>` : ""}</div>` : ""}
  </div>`;
}

let __chartSeq = 0;
function svgArea(series, opts) {
  opts = opts || {};
  const showVals = opts.valueLabels !== false;
  const stroke = opts.color || "#07569d";
  const w = opts.w || 600, h = opts.h || 200, padX = 16, padTop = 22, padBot = 28;
  const vals = series.map((s) => s.y);
  const rawMax = Math.max(...vals), rawMin = Math.min(...vals);
  const pad = (rawMax - rawMin) * 0.18 || rawMax * 0.1 || 1;
  const max = rawMax + pad, min = Math.max(0, rawMin - pad);
  const n = series.length, span = (max - min) || 1, base = h - padBot;
  const X = (i) => padX + (n > 1 ? (i / (n - 1)) * (w - 2 * padX) : (w - 2 * padX) / 2);
  const Y = (v) => padTop + (1 - (v - min) / span) * (base - padTop);
  const pts = series.map((s, i) => [X(i), Y(s.y)]);
  // Catmull-Rom → cubic Bézier 평활화
  let line = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    line += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  const areaPath = `${line} L ${pts[n - 1][0].toFixed(1)} ${base} L ${pts[0][0].toFixed(1)} ${base} Z`;
  const gid = "ga" + (++__chartSeq);
  const grid = [0.25, 0.5, 0.75].map((f) => { const gy = (padTop + f * (base - padTop)).toFixed(1); return `<line x1="${padX}" y1="${gy}" x2="${w - padX}" y2="${gy}" class="chart-grid"/>`; }).join("");
  const anchor = (i) => (i === 0 ? "start" : i === n - 1 ? "end" : "middle");
  const last = n - 1;
  const endDot = `<circle cx="${pts[last][0].toFixed(1)}" cy="${pts[last][1].toFixed(1)}" r="6" fill="${stroke}" opacity="0.14"/><circle cx="${pts[last][0].toFixed(1)}" cy="${pts[last][1].toFixed(1)}" r="3.4" fill="${stroke}"/>`;
  const labels = series.map((s, i) => `<text x="${X(i).toFixed(1)}" y="${h - 8}" class="chart-ax" text-anchor="${anchor(i)}">${escapeHtml(s.x)}</text>`).join("");
  const valLabels = showVals ? series.map((s, i) => `<text x="${X(i).toFixed(1)}" y="${(Y(s.y) - 9).toFixed(1)}" class="chart-val" text-anchor="${anchor(i)}">${escapeHtml(s.label || "")}</text>`).join("") : "";
  return `<svg viewBox="0 0 ${w} ${h}" class="area-chart" role="img" aria-label="${escapeHtml(opts.aria || "추세")}">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${stroke}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${stroke}" stop-opacity="0.015"/>
    </linearGradient></defs>
    ${grid}
    <path d="${areaPath}" fill="url(#${gid})"/>
    <path d="${line}" fill="none" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    ${endDot}${valLabels}${labels}
  </svg>`;
}

function riskHistogram(caseList) {
  const buckets = [
    { label: "0–24", min: 0, max: 24, color: "#15803d" },
    { label: "25–49", min: 25, max: 49, color: "#5a9e52" },
    { label: "50–74", min: 50, max: 74, color: "#b76700" },
    { label: "75–100", min: 75, max: 100, color: "#c0322a" },
  ];
  const counts = buckets.map((b) => caseList.filter((c) => c.riskScore >= b.min && c.riskScore <= b.max).length);
  const max = Math.max(...counts, 1);
  return `<div class="histo" role="img" aria-label="주의 수준 점수 분포">
    ${buckets.map((b, i) => `
      <div class="histo-col">
        <b class="histo-count">${counts[i]}</b>
        <div class="histo-bar-wrap"><i class="histo-bar" style="height:${Math.round((counts[i] / max) * 100)}%;background:${b.color}"></i></div>
        <span class="histo-label">${escapeHtml(b.label)}</span>
      </div>`).join("")}
  </div>`;
}

function rankingBars(items) {
  return `<div class="rankbars">${items.map((it) => {
    const color = chartColorByScore(it.value);
    const open = it.caseId ? ` data-case-id="${escapeHtml(it.caseId)}" role="button" tabindex="0"` : "";
    return `<div class="rankbar-row${it.caseId ? " is-clickable" : ""}"${open}>
      <div class="rankbar-meta"><strong>${escapeHtml(it.label)}</strong>${it.sub ? `<span>${escapeHtml(it.sub)}</span>` : ""}</div>
      <div class="rankbar-track"><i style="width:${Math.min(100, Math.max(3, it.value))}%;background:${color}"></i></div>
      <em>${escapeHtml(String(it.value))}${escapeHtml(it.unit || "점")}</em>
    </div>`;
  }).join("")}</div>`;
}
