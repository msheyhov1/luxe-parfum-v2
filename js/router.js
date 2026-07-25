// ════════════════════════════════════════
// ROUTER — history-based navigation.
// Each nav() pushes a history entry so the browser
// back/forward buttons work as expected.
// ════════════════════════════════════════

function nav(page) {
  history.pushState({ page }, '', '#' + page);
  _showPage(page);
}

function _showPage(page) {
  // FIX: any navigation should dismiss an open search overlay,
  // otherwise it stayed pinned on top of the new page.
  closeSearchOverlay();

  if (page === 'journal-admin' && !isAdminAuthenticated()) {
    page = 'admin-login';
    history.replaceState({ page }, '', '#admin-login');
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (!el) return;
  el.classList.add('active');
  window.scrollTo(0, 0);

  if (page === 'cart')      renderCart();
  if (page === 'favorites') renderFavorites();
  if (page === 'catalog')   { renderCatalog(_catFilter); _syncCatTabs(); }
  if (page === 'account')   renderAccount();
  if (page === 'order')     renderOrderForm();
  if (page === 'journal-admin') renderJournalAdmin();
}

window.addEventListener('popstate', e => {
  const state = e.state;
  if (!state) { _showPage('home'); return; }
  if (state.page === 'product' && state.productId) {
    const p = PRODUCTS.find(x => x.id === state.productId);
    if (p) { _renderProduct(p); return; }
  }
  _showPage(state.page || 'home');
});

// ── menu (sidebar) ──
function toggleMenu() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('mOv').classList.toggle('open');
}
function closeMenu() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('mOv').classList.remove('open');
}

// ── home / category navigation ──
function goHome() {
  closeSearchOverlay();
  document.querySelectorAll('#catNav li').forEach(x => x.classList.remove('active'));
  const li = document.querySelector('#catNav li[data-cat="all"]');
  if (li) li.classList.add('active');
  nav('home');
}

function navCat(cat, li) {
  closeSearchOverlay();
  document.querySelectorAll('#catNav li').forEach(x => x.classList.remove('active'));
  const target = li || document.querySelector('#catNav li[data-cat="' + cat + '"]');
  if (target) target.classList.add('active');
  _catFilter = cat;
  nav('catalog');
  renderCatalog(cat);
  _syncCatTabs();
  closeMenu();
}

function navProfile() {
  currentUser ? nav('account') : nav('login');
}

function _syncCatTabs() {
  document.querySelectorAll('.ct').forEach(t => {
    t.classList.toggle('active', t.textContent.trim() === CAT_LABELS[_catFilter]);
  });
}
