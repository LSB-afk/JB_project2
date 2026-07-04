/* JB우리캐피탈 운영 포털 — 사이드바 점유/복원, 내비게이션, 검색, 카운트 바인딩.
   검색과 카운트는 전용 서비스(searchJbWooriCapitalRecordsAsync/getJbWooriCapitalSidebarCountsAsync)만 사용한다. */

const jbwcSidebarOriginal = { brand: null, cta: null, search: null, captured: false };

function jbwcCaptureSidebar() {
  if (jbwcSidebarOriginal.captured) return;
  const brand = document.querySelector(".sidebar-brand");
  const cta = document.getElementById("new-case-button");
  const search = document.getElementById("sidebar-search");
  if (!brand || !cta || !search) return;
  jbwcSidebarOriginal.brand = brand.innerHTML;
  jbwcSidebarOriginal.cta = cta;
  jbwcSidebarOriginal.search = search;
  jbwcSidebarOriginal.captured = true;
}

function jbwcTakeoverSidebar() {
  if (typeof jpoRestoreSidebar === "function") jpoRestoreSidebar();
  if (typeof cclRestoreSidebar === "function") cclRestoreSidebar();
  if (typeof fdrRestoreSidebar === "function") fdrRestoreSidebar();
  jbwcCaptureSidebar();
  const brand = document.querySelector(".sidebar-brand");
  if (brand && !brand.dataset.jbwcMode) {
    brand.dataset.jbwcMode = "1";
    brand.innerHTML = `<p class="eyebrow">JB금융그룹 계열사</p>
      <h1>JB우리캐피탈 운영지원 포털</h1>
      <span>자동차금융·개인금융·고객보호 업무를 돕는 AI 운영지원</span>`;
  }
  const curCta = document.getElementById("new-case-button");
  if (curCta && !curCta.dataset.jbwcMode) {
    const mine = curCta.cloneNode(true);
    mine.dataset.jbwcMode = "1";
    mine.innerHTML = `<span aria-hidden="true">＋</span> 신규 운영 건 접수`;
    mine.addEventListener("click", () => {
      jbwcCaseWizard = jbwcDefaultCaseWizard();
      jbwcGo("cases-new");
    });
    curCta.replaceWith(mine);
    jbwcSidebarOriginal.cta = curCta;
  }
  const curSearch = document.getElementById("sidebar-search");
  if (curSearch && !curSearch.dataset.jbwcMode) {
    const mine = curSearch.cloneNode(false);
    mine.dataset.jbwcMode = "1";
    mine.value = jbwcState.search.q;
    mine.placeholder = "고객 ID, 관리 건, 상품, 담당자, 차량/계약, 업무 기능...";
    let timer = null;
    mine.addEventListener("input", (event) => {
      const q = event.target.value;
      jbwcState.search.q = q;
      clearTimeout(timer);
      if (!q.trim()) {
        jbwcState.search = { q: "", loading: false, error: false, results: null };
        jbwcRenderSearchResults();
        return;
      }
      jbwcState.search.loading = true;
      jbwcState.search.error = false;
      jbwcRenderSearchResults();
      timer = setTimeout(() => {
        searchJbWooriCapitalRecordsAsync(q)
          .then((rows) => { jbwcState.search.loading = false; jbwcState.search.results = rows; jbwcRenderSearchResults(); })
          .catch(() => { jbwcState.search.loading = false; jbwcState.search.error = true; jbwcRenderSearchResults(); });
      }, 250);
    });
    curSearch.replaceWith(mine);
    jbwcSidebarOriginal.search = curSearch;
  }
  jbwcRenderNav();
  jbwcRenderSearchResults();
}

function jbwcRestoreSidebar() {
  const brand = document.querySelector(".sidebar-brand");
  if (brand && brand.dataset.jbwcMode) {
    delete brand.dataset.jbwcMode;
    if (jbwcSidebarOriginal.brand != null) brand.innerHTML = jbwcSidebarOriginal.brand;
  }
  const curCta = document.getElementById("new-case-button");
  if (curCta && curCta.dataset.jbwcMode && jbwcSidebarOriginal.cta) curCta.replaceWith(jbwcSidebarOriginal.cta);
  const curSearch = document.getElementById("sidebar-search");
  if (curSearch && curSearch.dataset.jbwcMode && jbwcSidebarOriginal.search) curSearch.replaceWith(jbwcSidebarOriginal.search);
  const box = document.getElementById("jbwc-search-results");
  if (box) box.remove();
}

function jbwcRenderNav() {
  const navList = document.getElementById("nav-list");
  if (!navList) return;
  const counts = jbwcState.counts;
  const badge = (key) => {
    if (jbwcState.countsError) return `<span class="nav-count jbwc-badge-warn" title="카운트 조회 실패">!</span>`;
    if (!counts) return `<span class="nav-count jbwc-badge-skel" aria-label="불러오는 중"></span>`;
    return `<span class="nav-count">${escapeHtml(counts[key] != null ? counts[key] : 0)}</span>`;
  };
  navList.innerHTML = jbwcNavigation.map((group) => `
    <div class="nav-section">
      <div class="nav-section-title">${escapeHtml(group.section)}</div>
      ${group.items.map((item) => `
        <button class="nav-button ${jbwcState.view === item.id ? "is-active" : ""}" type="button" data-jbwc-view="${escapeHtml(item.id)}" title="${escapeHtml(`${group.section} · ${item.label} · ${item.description}`)}">
          <span class="nav-button-main"><span class="nav-icon" aria-hidden="true">${iconSvg(item.icon)}</span>
            <span class="nav-text"><span class="nav-label">${escapeHtml(item.label)}</span><span class="nav-hint">${escapeHtml(item.description)}</span></span></span>
          ${badge(item.countKey)}
        </button>`).join("")}
    </div>`).join("");
  navList.querySelectorAll("[data-jbwc-view]").forEach((button) => {
    button.addEventListener("click", () => jbwcGo(button.dataset.jbwcView));
  });
}

function jbwcRenderSearchResults() {
  let box = document.getElementById("jbwc-search-results");
  const anchor = document.querySelector(".sidebar-search");
  if (!anchor) return;
  if (!jbwcModeActive()) { if (box) box.remove(); return; }
  if (!box) {
    box = document.createElement("div");
    box.id = "jbwc-search-results";
    anchor.insertAdjacentElement("afterend", box);
  }
  const s = jbwcState.search;
  if (!s.q.trim()) { box.innerHTML = ""; return; }
  if (s.loading) { box.innerHTML = `<div class="jbwc-search-state">검색 중...</div>`; return; }
  if (s.error) { box.innerHTML = `<div class="jbwc-search-state jbwc-error">검색 실패 — 다시 시도해 주세요.</div>`; return; }
  if (!s.results || !s.results.length) {
    box.innerHTML = `<div class="jbwc-search-state">'${escapeHtml(s.q)}' 결과 없음 (JB우리캐피탈 데이터만 검색)</div>`;
    return;
  }
  box.innerHTML = s.results.map((r) => `
    <button type="button" class="jbwc-search-hit" data-jbwc-goto="${escapeHtml(r.view)}" data-jbwc-kind="${escapeHtml(r.kind)}" data-jbwc-id="${escapeHtml(r.id)}">
      <strong>${escapeHtml(r.label)}</strong><span>${escapeHtml(r.sub)}</span>
    </button>`).join("");
  box.querySelectorAll("[data-jbwc-goto]").forEach((el) => {
    el.addEventListener("click", () => {
      const detail = { kind: el.dataset.jbwcKind, id: el.dataset.jbwcId };
      jbwcState.search = { q: "", loading: false, error: false, results: null };
      jbwcGo(el.dataset.jbwcGoto, detail);
    });
  });
}

function jbwcInvalidateCounts() {
  jbwcState.counts = null;
  jbwcState.countsAt = null;
  jbwcState.countsError = false;
}

function jbwcEnsureCounts() {
  if (jbwcState.counts || jbwcState.countsLoading) return;
  jbwcState.countsLoading = true;
  getJbWooriCapitalSidebarCountsAsync()
    .then((counts) => {
      jbwcState.counts = counts;
      jbwcState.countsError = false;
      jbwcState.countsAt = Date.now();
    })
    .catch(() => { jbwcState.countsError = true; })
    .then(() => {
      jbwcState.countsLoading = false;
      if (jbwcModeActive()) {
        if (typeof render === "function") render();
        else jbwcRenderNav();
      }
    });
}
