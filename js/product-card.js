// ════════════════════════════════════════
// PRODUCT CARD + GRIDS
// mkCard() builds one card; renderGrid() fills a container;
// rerender() refreshes every visible grid after a state change.
// ════════════════════════════════════════

// mini gallery inside a card (arrows + dots)
function _initCardGallery(el, imgs) {
  let cur = 0;
  const track = el.querySelector('.pcard-track');
  const dots  = el.querySelectorAll('.pgdot');
  function go(n) {
    cur = (n + imgs.length) % imgs.length;
    track.style.transform = 'translateX(-' + (cur * 100) + '%)';
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
  }
  el.querySelector('.pg-arr.l').addEventListener('click', e => { e.stopPropagation(); go(cur - 1); });
  el.querySelector('.pg-arr.r').addEventListener('click', e => { e.stopPropagation(); go(cur + 1); });
  dots.forEach((d, i) => d.addEventListener('click', e => { e.stopPropagation(); go(i); }));

  // drag / swipe / horizontal-wheel — not just the arrows.
  // Attach to the image frame (not the whole card) so the capture-phase
  // click-suppressor can stop a swipe from also opening the product.
  const frame = el.querySelector('.pcard-gallery');
  if (frame && typeof attachSwipe === 'function') {
    attachSwipe(frame, {
      track,
      getIndex: () => cur,
      getCount: () => imgs.length,
      next: () => go(cur + 1),
      prev: () => go(cur - 1),
    });
  }
}

function mkCard(p) {
  const inCart  = cart.find(i => i.id === p.id);
  const isFaved = favorites.has(p.id);

  const slides = p.imgs.map(src =>
    '<div class="pcard-slide"><img src="' + escapeHtml(src) + '" alt="' + escapeHtml(p.name) + '" loading="lazy"><div class="pcard-slide-ov"></div></div>'
  ).join('');
  const dotBtns = p.imgs.map((_, i) =>
    '<button class="pgdot' + (i === 0 ? ' active' : '') + '"></button>'
  ).join('');

  const d = document.createElement('div');
  d.className = 'pcard';

  // if already in cart, show inline qty controls; otherwise a "+" button
  const addHtml = inCart
    ? '<div class="pcard-qty" onclick="event.stopPropagation()">' +
        '<button class="pcard-qb" onclick="cardDecQty(' + p.id + ',event)">−</button>' +
        '<span class="pcard-qn">' + inCart.qty + '</span>' +
        '<button class="pcard-qb" onclick="cardIncQty(' + p.id + ',event)">+</button>' +
      '</div>'
    : '<button class="add-btn plus-only">+</button>';

  d.innerHTML =
    '<div class="pcard-gallery">' +
      '<div class="pcard-track">' + slides + '</div>' +
      (p.badge ? '<div class="pcard-badge">' + escapeHtml(p.badge) + '</div>' : '') +
      '<button class="pcard-fav' + (isFaved ? ' faved' : '') + '">' +
        '<svg fill="' + (isFaved ? 'var(--red)' : 'none') + '" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="13" height="13">' +
          '<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>' +
        '</svg>' +
      '</button>' +
      '<button class="pg-arr l">‹</button><button class="pg-arr r">›</button>' +
      '<div class="pg-dots">' + dotBtns + '</div>' +
    '</div>' +
    '<div class="pcard-body">' +
      '<div class="pcard-brand">' + escapeHtml(p.brand) + '</div>' +
      '<div class="pcard-name">' + escapeHtml(p.name) + '</div>' +
      '<div class="pcard-vol">' + escapeHtml(p.vol) + '</div>' +
      '<div class="pcard-foot">' +
        '<div class="pcard-price">' + formatPrice(p.price) + '</div>' +
        addHtml +
      '</div>' +
    '</div>';

  _initCardGallery(d, p.imgs);

  d.querySelector('.pcard-fav').addEventListener('click', e => {
    e.stopPropagation();
    toggleFav(p);
    rerender();
  });

  if (!inCart) {
    d.querySelector('.add-btn').addEventListener('click', e => {
      e.stopPropagation();
      addToCart(p);
      rerender();
    });
  }

  d.addEventListener('click', () => openProduct(p));
  return d;
}

function cardIncQty(id, e) {
  e.stopPropagation();
  const it = cart.find(i => i.id === id);
  if (it) it.qty++;
  else { const p = PRODUCTS.find(x => x.id === id); if (p) cart.push({ ...p, qty: 1 }); }
  updateCartBadge();
  rerender();
  if (document.getElementById('page-cart').classList.contains('active')) renderCart();
}

function cardDecQty(id, e) {
  e.stopPropagation();
  const it = cart.find(i => i.id === id);
  if (!it) return;
  it.qty--;
  if (it.qty <= 0) cart = cart.filter(i => i.id !== id);
  updateCartBadge();
  rerender();
  if (document.getElementById('page-cart').classList.contains('active')) renderCart();
}

// repaint every grid that may currently be on screen
function rerender() {
  renderGrid(_hd, 'homeGrid', false);
  renderGrid(_nd, 'newGrid', false);
  const cg = document.getElementById('catalogGrid');
  if (cg && cg.children.length) renderGrid(_cd, 'catalogGrid', false);
  const fav = document.getElementById('page-favorites');
  if (fav && fav.classList.contains('active')) renderFavorites();
  const overlay = document.getElementById('searchOverlay');
  if (overlay && overlay.classList.contains('open')) {
    const q = document.getElementById('searchInput').value;
    if (q) doSearch(q);
  }
}

// animate=true → staggered entrance (first paint, catalog filter).
// animate=false → instant repaint (used by rerender on cart/fav changes
// so a "+" click doesn't replay the whole grid).
function renderGrid(data, id, animate = true) {
  const g = document.getElementById(id);
  if (!g) return;
  g.innerHTML = '';
  data.forEach((p, i) => {
    const card = mkCard(p);
    if (animate) {
      card.classList.add('card-enter');
      card.style.animationDelay = Math.min(i * 45, 360) + 'ms';
    }
    g.appendChild(card);
  });
}
