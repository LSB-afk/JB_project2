/* 기업여신 하네스 — sidebar takeover/search/count binding. */

const ccrSidebarOriginal = { brand: null, cta: null, search: null, captured: false };

function ccrCaptureSidebar() {
  if (ccrSidebarOriginal.captured) return;
  const brand = document.querySelector(".sidebar-brand");
  const cta = document.getElementById("new-case-button");
  const search = document.getElementById("sidebar-search");
  if (!brand || !cta || !search) return;
  ccrSidebarOriginal.brand = brand.innerHTML;
  ccrSidebarOriginal.cta = cta;
  ccrSidebarOriginal.search = search;
  ccrSidebarOriginal.captured = true;
}

function ccrTakeoverSidebar() {
  if (typeof jbwcRestoreSidebar === "function") jbwcRestoreSidebar();
  if (typeof jpoRestoreSidebar === "function") jpoRestoreSidebar();
  ccrCaptureSidebar();
  const brand = document.querySelector(".sidebar-brand");
  if (brand && !brand.dataset.ccrMode) {
    brand.dataset.ccrMode = "1";
    brand.innerHTML = `<p class="eyebrow">역할 전용 하네스</p><h1>기업여신 업무지원 포털</h1><span>기업여신 접수·심사자료·담보·보증·사후관리 검토를 돕는 AI 업무지원</span>`;
  }
  const curCta = document.getElementById("new-case-button");
  if (curCta && !curCta.dataset.ccrMode) {
    const mine = curCta.cloneNode(true);
    mine.dataset.ccrMode = "1";
    mine.innerHTML = `<span aria-hidden="true">＋</span> 신규 기업여신 운영 건 접수`;
    mine.addEventListener("click", () => {
      ccrCaseWizard = ccrDefaultCaseWizard();
      ccrGo("cases-new");
    });
    curCta.replaceWith(mine);
    ccrSidebarOriginal.cta = curCta;
  }
  const curSearch = document.getElementById("sidebar-search");
  if (curSearch && !curSearch.dataset.ccrMode) {
    const mine = curSearch.cloneNode(false);
    mine.dataset.ccrMode = "1";
    mine.value = ccrState.search.q;
    mine.placeholder = "기업명 별칭, 여신 건, 상품, 담당 RM, 담보/보증, 업무 기능...";
    let timer = null;
    mine.addEventListener("input", (event) => {
      const q = event.target.value;
      ccrState.search.q = q;
      clearTimeout(timer);
      if (!q.trim()) {
        ccrState.search = { q: "", loading: false, error: false, blocked: null, results: null };
        ccrRenderSearchResults();
        return;
      }
      ccrState.search.loading = true;
      ccrState.search.error = false;
      ccrState.search.blocked = null;
      ccrRenderSearchResults();
      timer = setTimeout(() => {
        searchCorporateCreditRecordsAsync(q)
          .then((payload) => {
            ccrState.search.loading = false;
            if (payload && payload.blocked) {
              ccrState.search.blocked = payload.blocked;
              ccrState.search.results = null;
            } else {
              ccrState.search.results = payload.results || [];
            }
            ccrRenderSearchResults();
          })
          .catch(() => { ccrState.search.loading = false; ccrState.search.error = true; ccrRenderSearchResults(); });
      }, 250);
    });
    curSearch.replaceWith(mine);
    ccrSidebarOriginal.search = curSearch;
  }
  ccrRenderNav();
  ccrRenderSearchResults();
}

function ccrRestoreSidebar() {
  const brand = document.querySelector(".sidebar-brand");
  if (brand && brand.dataset.ccrMode) {
    delete brand.dataset.ccrMode;
    if (ccrSidebarOriginal.brand != null) brand.innerHTML = ccrSidebarOriginal.brand;
  }
  const curCta = document.getElementById("new-case-button");
  if (curCta && curCta.dataset.ccrMode && ccrSidebarOriginal.cta) curCta.replaceWith(ccrSidebarOriginal.cta);
  const curSearch = document.getElementById("sidebar-search");
  if (curSearch && curSearch.dataset.ccrMode && ccrSidebarOriginal.search) curSearch.replaceWith(ccrSidebarOriginal.search);
  const box = document.getElementById("ccr-search-results");
  if (box) box.remove();
}

function ccrRenderNav() {
  const navList = document.getElementById("nav-list");
  if (!navList) return;
  const counts = ccrState.counts;
  const badge = (key) => {
    if (ccrState.countsError) return `<span class="nav-count jbwc-badge-warn" title="카운트 조회 실패">!</span>`;
    if (!counts) return `<span class="nav-count jbwc-badge-skel" aria-label="불러오는 중"></span>`;
    return `<span class="nav-count">${escapeHtml(counts[key] != null ? counts[key] : 0)}</span>`;
  };
  navList.innerHTML = ccrNavigation.map((group) => `<div class="nav-section">
    <div class="nav-section-title">${escapeHtml(group.section)}</div>
    ${group.items.map((item) => `<button class="nav-button ${ccrState.view === item.id ? "is-active" : ""}" type="button" data-ccr-view="${escapeHtml(item.id)}">
      <span class="nav-button-main"><span class="nav-icon" aria-hidden="true">${iconSvg(item.icon)}</span><span class="nav-text"><span class="nav-label">${escapeHtml(item.label)}</span><span class="nav-hint">${escapeHtml(item.description)}</span></span></span>${badge(item.countKey)}
    </button>`).join("")}
  </div>`).join("");
  navList.querySelectorAll("[data-ccr-view]").forEach((button) => button.addEventListener("click", () => ccrGo(button.dataset.ccrView)));
}

function ccrRenderSearchResults() {
  let box = document.getElementById("ccr-search-results");
  const anchor = document.querySelector(".sidebar-search");
  if (!anchor) return;
  if (!ccrModeActive()) { if (box) box.remove(); return; }
  if (!box) {
    box = document.createElement("div");
    box.id = "ccr-search-results";
    box.className = "jpo-search-results";
    anchor.insertAdjacentElement("afterend", box);
  }
  const s = ccrState.search;
  if (!s.q.trim()) { box.innerHTML = ""; return; }
  if (s.loading) { box.innerHTML = `<div class="jbwc-search-state">검색 중...</div>`; return; }
  if (s.blocked) { box.innerHTML = `<div class="jbwc-search-state jbwc-error">민감정보 원문 검색 차단 — ${escapeHtml(s.blocked)} 익명 기업 ID나 사건번호로 검색해 주세요.</div>`; return; }
  if (s.error) { box.innerHTML = `<div class="jbwc-search-state jbwc-error">검색 실패 — 다시 시도해 주세요.</div>`; return; }
  if (!s.results || !s.results.length) {
    box.innerHTML = `<div class="jbwc-search-state">'${escapeHtml(s.q)}' 결과 없음 (기업여신 role scope 데이터만 검색)</div>`;
    return;
  }
  box.innerHTML = s.results.map((r) => `<button type="button" class="jbwc-search-hit" data-ccr-goto="${escapeHtml(r.view)}" data-ccr-kind="${escapeHtml(r.kind)}" data-ccr-id="${escapeHtml(r.id)}"><strong>${escapeHtml(r.label)}</strong><span>${escapeHtml(r.sub)}</span></button>`).join("");
  box.querySelectorAll("[data-ccr-goto]").forEach((el) => el.addEventListener("click", () => {
    ccrState.search = { q: "", loading: false, error: false, blocked: null, results: null };
    ccrGo(el.dataset.ccrGoto, { kind: el.dataset.ccrKind, id: el.dataset.ccrId });
  }));
}

function ccrInvalidateCounts() {
  ccrState.counts = null;
  ccrState.countsAt = null;
  ccrState.countsError = false;
}

function ccrEnsureCounts() {
  if (ccrState.counts || ccrState.countsLoading) return;
  ccrState.countsLoading = true;
  getCorporateCreditSidebarCountsAsync()
    .then((counts) => {
      ccrState.counts = counts;
      ccrState.countsError = false;
      ccrState.countsAt = Date.now();
    })
    .catch(() => { ccrState.countsError = true; })
    .then(() => {
      ccrState.countsLoading = false;
      if (ccrModeActive()) {
        if (typeof render === "function") render();
        else ccrRenderNav();
      }
    });
}
