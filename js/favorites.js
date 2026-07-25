// ════════════════════════════════════════
// FAVORITES (wishlist)
// ════════════════════════════════════════

function updateFavBadge() {
  const b = document.getElementById('favBadge');
  b.style.display = favorites.size > 0 ? 'flex' : 'none';
  b.textContent = favorites.size;
  if (favorites.size > 0) bumpBadge(b);
}

function toggleFav(p) {
  if (favorites.has(p.id)) {
    favorites.delete(p.id);
    showNotif('«' + p.name + '» удалён из избранного');
  } else {
    favorites.add(p.id);
    showNotif('«' + p.name + '» в избранном');
  }
  saveFavorites();
  updateFavBadge();
}

function renderFavorites() {
  const el = document.getElementById('favContent');
  const fp = PRODUCTS.filter(p => favorites.has(p.id));
  if (!fp.length) {
    el.innerHTML =
      '<div class="empty-st">' +
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" width="66" height="66">' +
          '<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>' +
        '</svg>' +
        '<p>Избранное пусто</p>' +
        '<button class="ghost-btn" onclick="navCat(\'all\',null)">Перейти в каталог</button>' +
      '</div>';
    return;
  }
  const g = document.createElement('div');
  g.className = 'pgrid';
  fp.forEach(p => g.appendChild(mkCard(p)));
  el.innerHTML = '';
  el.appendChild(g);
}
