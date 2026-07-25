// ════════════════════════════════════════
// SEARCH — global, works on any page, with history.
// ════════════════════════════════════════
let searchHistory = _load(STORAGE.search, []);

function saveSearchHistory(q) {
  if (!q || q.length < 2) return;
  searchHistory = [q, ...searchHistory.filter(x => x !== q)].slice(0, 8);
  localStorage.setItem(STORAGE.search, JSON.stringify(searchHistory));
}

function renderSearchHistory() {
  const box = document.getElementById('searchHistory');
  if (!searchHistory.length) { box.classList.remove('open'); return; }

  // FIX: previously the query was interpolated raw into an inline
  // onclick — a query containing quotes/HTML broke the markup. Now
  // the text is escaped and clicks resolve by index via delegation.
  box.innerHTML = searchHistory.map((h, i) =>
    '<div class="sh-item" data-i="' + i + '"><span class="sh-item-icon">🕐</span>' + escapeHtml(h) + '</div>'
  ).join('') +
  '<div class="sh-clear">Очистить историю</div>';

  box.querySelectorAll('.sh-item').forEach(el =>
    el.addEventListener('click', () => applySearch(searchHistory[+el.dataset.i]))
  );
  box.querySelector('.sh-clear').addEventListener('click', clearSearchHistory);

  box.classList.add('open');
}

function clearSearchHistory() {
  searchHistory = [];
  localStorage.removeItem(STORAGE.search);
  document.getElementById('searchHistory').classList.remove('open');
}

function applySearch(q) {
  const input = document.getElementById('searchInput');
  input.value = q;
  document.getElementById('searchHistory').classList.remove('open');
  doSearch(q);
}

function doSearch(q) {
  const overlay = document.getElementById('searchOverlay');
  const grid = document.getElementById('searchOverlayGrid');
  const count = document.getElementById('searchOverlayCount');
  if (!q || q.length < 2) {
    overlay.classList.remove('open');
    return;
  }
  const needle = q.toLowerCase();
  const res = PRODUCTS.filter(p =>
    p.brand.toLowerCase().includes(needle) ||
    p.name.toLowerCase().includes(needle)
  );
  count.textContent = 'Найдено ' + res.length + ' ' + pluralRu(res.length, 'товар', 'товара', 'товаров') + ' по запросу «' + q + '»';
  grid.innerHTML = '';
  res.forEach(p => grid.appendChild(mkCard(p)));
  overlay.classList.add('open');
}

function closeSearchOverlay() {
  document.getElementById('searchOverlay').classList.remove('open');
  document.getElementById('searchInput').value = '';
  document.getElementById('searchHistory').classList.remove('open');
}

// ── input wiring ──
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('focus', () => {
  if (!searchInput.value) renderSearchHistory();
});
searchInput.addEventListener('input', function () {
  const q = this.value;
  document.getElementById('searchHistory').classList.remove('open');
  if (!q) {
    document.getElementById('searchOverlay').classList.remove('open');
    return;
  }
  doSearch(q);
});
searchInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && this.value.length >= 2) {
    saveSearchHistory(this.value);
    document.getElementById('searchHistory').classList.remove('open');
  }
  if (e.key === 'Escape') closeSearchOverlay();
});
document.addEventListener('click', function (e) {
  if (!e.target.closest('.tb-search') && !e.target.closest('.search-results-overlay')) {
    document.getElementById('searchHistory').classList.remove('open');
  }
});
