/* 전세사기 보호 담당자 역할 하네스 — 사이드바 점유/복원, 내비, 검색, 카운트 바인딩.
   검색·카운트는 전용 서비스만 사용한다. 다른 하네스(계열사)가 점유 중이면 먼저 복원시킨다(점유 중재). */

const jpoSidebarOriginal = { brand: null, cta: null, search: null, captured: false };

function jpoCaptureSidebar() {
  if (jpoSidebarOriginal.captured) return;
  const brand = document.querySelector(".sidebar-brand");
  const cta = document.getElementById("new-case-button");
  const search = document.getElementById("sidebar-search");
  if (!brand || !cta || !search) return;
  jpoSidebarOriginal.brand = brand.innerHTML;
  jpoSidebarOriginal.cta = cta;
  jpoSidebarOriginal.search = search;
  jpoSidebarOriginal.captured = true;
}

function jpoTakeoverSidebar() {
  if (typeof jbwcRestoreSidebar === "function") jbwcRestoreSidebar();
  if (typeof cclRestoreSidebar === "function") cclRestoreSidebar();
  if (typeof fdrRestoreSidebar === "function") fdrRestoreSidebar();
  jpoCaptureSidebar();
  const brand = document.querySelector(".sidebar-brand");
  if (brand && !brand.dataset.jpoMode) {
    brand.dataset.jpoMode = "1";
    brand.innerHTML = `<p class="eyebrow">역할 전용 하네스</p>
      <h1>전세사기 보호 업무지원 포털</h1>
      <span>시세·권리·보증·피해지원 검토를 돕는 AI 업무지원</span>`;
  }
  const curCta = document.getElementById("new-case-button");
  if (curCta && !curCta.dataset.jpoMode) {
    const mine = curCta.cloneNode(true);
    mine.dataset.jpoMode = "1";
    mine.innerHTML = `<span aria-hidden="true">＋</span> 전세 위험/피해 의심 건 접수`;
    mine.addEventListener("click", () => {
      jpoCaseWizard = jpoDefaultCaseWizard();
      jpoGo("cases-new");
    });
    curCta.replaceWith(mine);
    jpoSidebarOriginal.cta = curCta;
  }
  const curSearch = document.getElementById("sidebar-search");
  if (curSearch && !curSearch.dataset.jpoMode) {
    const mine = curSearch.cloneNode(false);
    mine.dataset.jpoMode = "1";
    mine.value = jpoState.search.q;
    mine.placeholder = "사건번호, 익명 고객 ID, 주소 일부, 단지명, 위험 신호, 담당자...";
    let timer = null;
    mine.addEventListener("input", (event) => {
      const q = event.target.value;
      jpoState.search.q = q;
      clearTimeout(timer);
      if (!q.trim()) {
        jpoState.search = { q: "", loading: false, error: false, blocked: null, results: null };
        jpoRenderSearchResults();
        return;
      }
      jpoState.search.loading = true;
      jpoState.search.error = false;
      jpoState.search.blocked = null;
      jpoRenderSearchResults();
      timer = setTimeout(() => {
        searchJeonseProtectionRecordsAsync(q)
          .then((payload) => {
            jpoState.search.loading = false;
            if (payload && payload.blocked) {
              jpoState.search.blocked = payload.blocked;
              jpoState.search.results = null;
            } else {
              jpoState.search.results = payload.results || [];
            }
            jpoRenderSearchResults();
          })
          .catch(() => { jpoState.search.loading = false; jpoState.search.error = true; jpoRenderSearchResults(); });
      }, 250);
    });
    curSearch.replaceWith(mine);
    jpoSidebarOriginal.search = curSearch;
  }
  jpoRenderNav();
  jpoRenderSearchResults();
}

function jpoRestoreSidebar() {
  const brand = document.querySelector(".sidebar-brand");
  if (brand && brand.dataset.jpoMode) {
    delete brand.dataset.jpoMode;
    if (jpoSidebarOriginal.brand != null) brand.innerHTML = jpoSidebarOriginal.brand;
  }
  const curCta = document.getElementById("new-case-button");
  if (curCta && curCta.dataset.jpoMode && jpoSidebarOriginal.cta) curCta.replaceWith(jpoSidebarOriginal.cta);
  const curSearch = document.getElementById("sidebar-search");
  if (curSearch && curSearch.dataset.jpoMode && jpoSidebarOriginal.search) curSearch.replaceWith(jpoSidebarOriginal.search);
  const box = document.getElementById("jpo-search-results");
  if (box) box.remove();
}

function jpoRenderNav() {
  const navList = document.getElementById("nav-list");
  if (!navList) return;
  const counts = jpoState.counts;
  const badge = (key) => {
    if (jpoState.countsError) return `<span class="nav-count jbwc-badge-warn" title="카운트 조회 실패">!</span>`;
    if (!counts) return `<span class="nav-count jbwc-badge-skel" aria-label="불러오는 중"></span>`;
    return `<span class="nav-count">${escapeHtml(counts[key] != null ? counts[key] : 0)}</span>`;
  };
  navList.innerHTML = jpoNavigation.map((group) => `
    <div class="nav-section">
      <div class="nav-section-title">${escapeHtml(group.section)}</div>
      ${group.items.map((item) => `
        <button class="nav-button ${jpoState.view === item.id ? "is-active" : ""}" type="button" data-jpo-view="${escapeHtml(item.id)}" title="${escapeHtml(`${group.section} · ${item.label} · ${item.description}`)}">
          <span class="nav-button-main"><span class="nav-icon" aria-hidden="true">${iconSvg(item.icon)}</span>
            <span class="nav-text"><span class="nav-label">${escapeHtml(item.label)}</span><span class="nav-hint">${escapeHtml(item.description)}</span></span></span>
          ${badge(item.countKey)}
        </button>`).join("")}
    </div>`).join("");
  navList.querySelectorAll("[data-jpo-view]").forEach((button) => {
    button.addEventListener("click", () => jpoGo(button.dataset.jpoView));
  });
}

function jpoRenderSearchResults() {
  let box = document.getElementById("jpo-search-results");
  const anchor = document.querySelector(".sidebar-search");
  if (!anchor) return;
  if (!jpoModeActive()) { if (box) box.remove(); return; }
  if (!box) {
    box = document.createElement("div");
    box.id = "jpo-search-results";
    box.className = "jpo-search-results";
    anchor.insertAdjacentElement("afterend", box);
  }
  const s = jpoState.search;
  if (!s.q.trim()) { box.innerHTML = ""; return; }
  if (s.loading) { box.innerHTML = `<div class="jbwc-search-state">검색 중...</div>`; return; }
  if (s.blocked) { box.innerHTML = `<div class="jbwc-search-state jbwc-error">개인정보 원문 검색 차단 — ${escapeHtml(s.blocked)} 익명 Ref로 검색해 주세요.</div>`; return; }
  if (s.error) { box.innerHTML = `<div class="jbwc-search-state jbwc-error">검색 실패 — 다시 시도해 주세요.</div>`; return; }
  if (!s.results || !s.results.length) {
    box.innerHTML = `<div class="jbwc-search-state">'${escapeHtml(s.q)}' 결과 없음 (전세보호 role scope 데이터만 검색)</div>`;
    return;
  }
  box.innerHTML = s.results.map((r) => `
    <button type="button" class="jbwc-search-hit" data-jpo-goto="${escapeHtml(r.view)}" data-jpo-kind="${escapeHtml(r.kind)}" data-jpo-id="${escapeHtml(r.id)}">
      <strong>${escapeHtml(r.label)}</strong><span>${escapeHtml(r.sub)}</span>
    </button>`).join("");
  box.querySelectorAll("[data-jpo-goto]").forEach((el) => {
    el.addEventListener("click", () => {
      const detail = { kind: el.dataset.jpoKind, id: el.dataset.jpoId };
      jpoState.search = { q: "", loading: false, error: false, blocked: null, results: null };
      jpoGo(el.dataset.jpoGoto, detail);
    });
  });
}

function jpoInvalidateCounts() {
  jpoState.counts = null;
  jpoState.countsAt = null;
  jpoState.countsError = false;
}

function jpoEnsureCounts() {
  if (jpoState.counts || jpoState.countsLoading) return;
  jpoState.countsLoading = true;
  getJeonseProtectionSidebarCountsAsync()
    .then((counts) => {
      jpoState.counts = counts;
      jpoState.countsError = false;
      jpoState.countsAt = Date.now();
    })
    .catch(() => { jpoState.countsError = true; })
    .then(() => {
      jpoState.countsLoading = false;
      if (jpoModeActive()) {
        if (typeof render === "function") render();
        else jpoRenderNav();
      }
    });
}
