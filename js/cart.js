// ════════════════════════════════════════
// CART
// updateCartBadge() is the single choke-point for every cart
// mutation, so persistence (saveCart) lives here.
// ════════════════════════════════════════

function addToCart(p) {
  const ex = cart.find(i => i.id === p.id);
  if (ex) ex.qty++;
  else cart.push({ ...p, qty: 1 });
  updateCartBadge();
  showNotif('«' + p.name + '» добавлен в корзину → открыть корзину', 'cart');
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartBadge();
  renderCart();
  rerender();
}

function changeQty(id, d) {
  const it = cart.find(i => i.id === id);
  if (!it) return;
  it.qty += d;
  if (it.qty <= 0) cart = cart.filter(i => i.id !== id);
  updateCartBadge();
  renderCart();
  rerender();
}

// restart the pop animation on a badge (shared by cart + favorites)
function bumpBadge(el) {
  if (!el) return;
  el.classList.remove('badge-pop');
  void el.offsetWidth; // force reflow so the animation replays
  el.classList.add('badge-pop');
}

function updateCartBadge() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cartBadge');
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none'; // hide "0" for a cleaner header
  if (count > 0) bumpBadge(badge);
  saveCart();
}

function renderCart() {
  const el = document.getElementById('cartContent');
  if (!cart.length) {
    el.innerHTML =
      '<div class="empty-st">' +
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" width="66" height="66">' +
          '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>' +
        '</svg>' +
        '<p>Корзина пуста</p>' +
        '<button class="ghost-btn" onclick="navCat(\'all\',null)">Перейти в каталог</button>' +
      '</div>';
    return;
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const qtyTotal = cart.reduce((s, i) => s + i.qty, 0);

  const listEl = document.createElement('div');
  listEl.className = 'cart-list';
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'ci';
    row.style.cursor = 'pointer';
    row.innerHTML =
      '<img class="ci-img" src="' + escapeHtml(item.imgs[0]) + '" alt="' + escapeHtml(item.name) + '">' +
      '<div class="ci-info">' +
        '<div class="ci-brand">' + escapeHtml(item.brand) + '</div>' +
        '<div class="ci-name">' + escapeHtml(item.name) + '</div>' +
        '<div class="ci-vol">' + escapeHtml(item.vol) + '</div>' +
        '<div class="ci-qty" onclick="event.stopPropagation()">' +
          '<button class="qb" onclick="changeQty(' + item.id + ',-1)">−</button>' +
          '<span class="qn">' + item.qty + '</span>' +
          '<button class="qb" onclick="changeQty(' + item.id + ',1)">+</button>' +
        '</div>' +
      '</div>' +
      '<div class="ci-price">' + formatPrice(item.price * item.qty) + '</div>' +
      '<button class="ci-rm" onclick="event.stopPropagation();removeFromCart(' + item.id + ')">✕</button>';
    const prod = PRODUCTS.find(p => p.id === item.id);
    if (prod) row.addEventListener('click', () => openProduct(prod));
    listEl.appendChild(row);
  });

  el.innerHTML = '';
  el.appendChild(listEl);
  el.insertAdjacentHTML('beforeend',
    '<div class="cart-sum">' +
      '<div class="sr"><span>Товары (' + qtyTotal + ' шт.)</span><span>' + formatPrice(total) + '</span></div>' +
      '<div class="st-row"><span>Итого</span><span>' + formatPrice(total) + '</span></div>' +
      '<button class="gold-btn" onclick="nav(\'order\')">Оформить заказ</button>' +
    '</div>'
  );
}
