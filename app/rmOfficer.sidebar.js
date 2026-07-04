/* RM 하네스 — sidebar takeover/search/count binding (점유 중재 상호 호출). */

const rmoSidebarOriginal = { brand: null, cta: null, search: null, captured: false };

function rmoCaptureSidebar() {
  if (rmoSidebarOriginal.captured) return;
  const brand = document.querySelector(".sidebar-brand");
  const cta = document.getElementById("new-case-button");
  const search = document.getElementById("sidebar-search");
  if (!brand || !cta || !search) return;
  rmoSidebarOriginal.brand = brand.innerHTML;
  rmoSidebarOriginal.cta = cta;
  rmoSidebarOriginal.search = search;
  rmoSidebarOriginal.captured = true;
}

function rmoTakeoverSidebar() {
  if (typeof jbwcRestoreSidebar === "function") jbwcRestoreSidebar();
  if (typeof jpoRestoreSidebar === "function") jpoRestoreSidebar();
  if (typeof cclRestoreSidebar === "function") cclRestoreSidebar();
  if (typeof fdrRestoreSidebar === "function") fdrRestoreSidebar();
  rmoCaptureSidebar();
  const brand = document.querySelector(".sidebar-brand");
  if (brand && !brand.dataset.rmoMode) {
    brand.dataset.rmoMode = "1";
    brand.innerHTML = `<p class="eyebrow">역할 전용 하네스</p><h1>RM 업무지원 포털</h1><span>여신 상담 큐·정책금융 체크리스트·승인 라우팅을 급한 순 근거 기반으로 돕는 AI 업무지원</span>`;
  }
  const curCta = document.getElementById("new-case-button");
  if (curCta && !curCta.dataset.rmoMode) {
    const mine = curCta.cloneNode(true);
    mine.dataset.rmoMode = "1";
    mine.innerHTML = `<span aria-hidden="true">＋</span> 신규 여신 상담 건 접수`;
    mine.addEventListener("click", () => {
      rmoCaseWizard = rmoDefaultCaseWizard();
      rmoGo("cases-new");
    });
    curCta.replaceWith(mine);
    rmoSidebarOriginal.cta = curCta;
  }
  const curSearch = document.getElementById("sidebar-search");
  if (curSearch && !curSearch.dataset.rmoMode) {
    const mine = curSearch.cloneNode(false);
    mine.dataset.rmoMode = "1";
    mine.value = rmoState.search.q;
    mine.placeholder = "고객 별칭, 케이스 번호, 지역, 은행, 산출물, 상담 주제...";
    let timer = null;
    mine.addEventListener("input", (event) => {
      const q = event.target.value;
      rmoState.search.q = q;
      clearTimeout(timer);
      if (!q.trim()) {
        rmoState.search = { q: "", loading: false, error: false, blocked: null, results: null };
        rmoRenderSearchResults();
        return;
      }
      rmoState.search.loading = true;
      rmoState.search.error = false;
      rmoState.search.blocked = null;
      rmoRenderSearchResults();
      timer = setTimeout(() => {
        searchRmOfficerRecordsAsync(q)
          .then((payload) => {
            rmoState.search.loading = false;
            if (payload && payload.blocked) {
              rmoState.search.blocked = payload.blocked;
              rmoState.search.results = null;
            } else {
              rmoState.search.results = payload.results || [];
            }
            rmoRenderSearchResults();
          })
          .catch(() => { rmoState.search.loading = false; rmoState.search.error = true; rmoRenderSearchResults(); });
      }, 250);
    });
    curSearch.replaceWith(mine);
    rmoSidebarOriginal.search = curSearch;
  }
  rmoRenderNav();
  rmoRenderSearchResults();
}

function rmoRestoreSidebar() {
  const brand = document.querySelector(".sidebar-brand");
  if (brand && brand.dataset.rmoMode) {
    delete brand.dataset.rmoMode;
    if (rmoSidebarOriginal.brand != null) brand.innerHTML = rmoSidebarOriginal.brand;
  }
  const curCta = document.getElementById("new-case-button");
  if (curCta && curCta.dataset.rmoMode && rmoSidebarOriginal.cta) curCta.replaceWith(rmoSidebarOriginal.cta);
  const curSearch = document.getElementById("sidebar-search");
  if (curSearch && curSearch.dataset.rmoMode && rmoSidebarOriginal.search) curSearch.replaceWith(rmoSidebarOriginal.search);
  const box = document.getElementById("rmo-search-results");
  if (box) box.remove();
}

function rmoRenderNav() {
  const navList = document.getElementById("nav-list");
  if (!navList) return;
  const counts = rmoState.counts;
  const badge = (key) => {
    if (rmoState.countsError) return `<span class="nav-count jbwc-badge-warn" title="카운트 조회 실패">!</span>`;
    if (!counts) return `<span class="nav-count jbwc-badge-skel" aria-label="불러오는 중"></span>`;
    return `<span class="nav-count">${escapeHtml(counts[key] != null ? counts[key] : 0)}</span>`;
  };
  navList.innerHTML = rmoNavigation.map((group) => `<div class="nav-section">
    <div class="nav-section-title">${escapeHtml(group.section)}</div>
    ${group.items.map((item) => `<button class="nav-button ${rmoState.view === item.id ? "is-active" : ""}" type="button" data-rmo-view="${escapeHtml(item.id)}">
      <span class="nav-button-main"><span class="nav-icon" aria-hidden="true">${iconSvg(item.icon)}</span><span class="nav-text"><span class="nav-label">${escapeHtml(item.label)}</span><span class="nav-hint">${escapeHtml(item.description)}</span></span></span>${badge(item.countKey)}
    </button>`).join("")}
  </div>`).join("");
  navList.querySelectorAll("[data-rmo-view]").forEach((button) => button.addEventListener("click", () => rmoGo(button.dataset.rmoView)));
}

function rmoRenderSearchResults() {
  let box = document.getElementById("rmo-search-results");
  const anchor = document.querySelector(".sidebar-search");
  if (!anchor) return;
  if (!rmoModeActive()) { if (box) box.remove(); return; }
  if (!box) {
    box = document.createElement("div");
    box.id = "rmo-search-results";
    box.className = "jpo-search-results";
    anchor.insertAdjacentElement("afterend", box);
  }
  const s = rmoState.search;
  if (!s.q.trim()) { box.innerHTML = ""; return; }
  if (s.loading) { box.innerHTML = `<div class="jbwc-search-state">검색 중...</div>`; return; }
  if (s.blocked) { box.innerHTML = `<div class="jbwc-search-state jbwc-error">민감정보 원문 검색 차단 — ${escapeHtml(s.blocked)} 익명 고객 ID나 케이스 번호로 검색해 주세요.</div>`; return; }
  if (s.error) { box.innerHTML = `<div class="jbwc-search-state jbwc-error">검색 실패 — 다시 시도해 주세요.</div>`; return; }
  if (!s.results || !s.results.length) {
    box.innerHTML = `<div class="jbwc-search-state">'${escapeHtml(s.q)}' 결과 없음 (RM role scope 데이터만 검색)</div>`;
    return;
  }
  box.innerHTML = s.results.map((r) => `<button type="button" class="jbwc-search-hit" data-rmo-goto="${escapeHtml(r.view)}" data-rmo-kind="${escapeHtml(r.kind)}" data-rmo-id="${escapeHtml(r.id)}"><strong>${escapeHtml(r.label)}</strong><span>${escapeHtml(r.sub)}</span></button>`).join("");
  box.querySelectorAll("[data-rmo-goto]").forEach((el) => el.addEventListener("click", () => {
    rmoState.search = { q: "", loading: false, error: false, blocked: null, results: null };
    if (el.dataset.rmoKind === "case") rmoGo("board", { kind: "case", id: el.dataset.rmoId });
    else if (el.dataset.rmoKind === "deliverable") { const d = rmoTable("rm_officer_deliverables", RMO_ROLE_KEY).find((x) => x.id === el.dataset.rmoId); rmoState.modal = d ? { fileName: d.fileName, caseId: d.caseId } : null; rmoGo(el.dataset.rmoGoto); }
    else rmoGo(el.dataset.rmoGoto);
  }));
}
