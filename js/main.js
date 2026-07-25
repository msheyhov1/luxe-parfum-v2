// ════════════════════════════════════════
// INIT — runs last, after every module is loaded
// and the DOM is fully parsed.
// ════════════════════════════════════════

// initial history state for the home page
history.replaceState({ page: 'home' }, '', '#home');

// home grids
renderGrid(_hd, 'homeGrid');
renderGrid(_nd, 'newGrid');

// restore header badges from persisted state
updateCartBadge();
updateFavBadge();

// highlight "all" in the sidebar
const _allNav = document.querySelector('#catNav li[data-cat="all"]');
if (_allNav) _allNav.classList.add('active');

// deep-link support: open the right page/product from the URL hash
(function checkHash() {
  const hash = location.hash.slice(1);
  if (!hash || hash === 'home') return;

  if (hash.startsWith('product-')) {
    const id = parseInt(hash.replace('product-', ''), 10);
    const p = PRODUCTS.find(x => x.id === id);
    if (p) { _renderProduct(p); return; }
  }
  if (document.getElementById('page-' + hash)) _showPage(hash);
})();
