// ════════════════════════════════════════
// CATALOG — category hero + filtered grid
// ════════════════════════════════════════

function renderCatalog(cat) {
  _catFilter = cat;
  const m = CAT_META[cat] || CAT_META.all;
  document.getElementById('catBg').style.backgroundImage = "url('" + m.img + "')";
  document.getElementById('catTitle').textContent = m.title;
  document.getElementById('catSub').textContent   = m.sub;
  _cd = (cat === 'all') ? PRODUCTS.slice() : PRODUCTS.filter(p => p.cat.includes(cat));
  renderGrid(_cd, 'catalogGrid');
}

function filterCat(cat, btn) {
  document.querySelectorAll('.ct').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderCatalog(cat);
}
