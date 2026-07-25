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

// Sync the catalog tab-button labels with CAT_LABELS (admin-editable).
// The sidebar keeps its own richer wording; only the tab strip mirrors labels.
function applyCatLabels() {
  document.querySelectorAll('.ct[data-cat]').forEach(btn => {
    const label = CAT_LABELS[btn.dataset.cat];
    if (label) btn.textContent = label;
  });
}
applyCatLabels();
