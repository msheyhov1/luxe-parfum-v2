// ════════════════════════════════════════
// ORDER — checkout form, CDEK pickup autocomplete
// ════════════════════════════════════════

function renderOrderForm() {
  if (currentUser) {
    document.getElementById('ordLN').value = currentUser.lastName   || '';
    document.getElementById('ordFN').value = currentUser.firstName  || '';
    document.getElementById('ordMN').value = currentUser.middleName || '';
  }
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('ordSum').innerHTML =
    cart.map(i => escapeHtml(i.brand + ' — ' + i.name + ' × ' + i.qty)).join('<br>');
  document.getElementById('ordTotal').textContent = formatPrice(total);
}

// CDEK pickup-point autocomplete
document.getElementById('ordCdek').addEventListener('input', function () {
  const q   = this.value.toLowerCase();
  const sug = document.getElementById('cdekSug');
  if (q.length < 2) { sug.style.display = 'none'; return; }

  const matches = CDEK.filter(a => a.toLowerCase().includes(q)).slice(0, 5);
  if (matches.length) {
    sug.style.display = 'block';
    sug.innerHTML = matches.map((a, i) => '<div class="cdek-item" data-i="' + i + '">' + escapeHtml(a) + '</div>').join('');
    sug.querySelectorAll('.cdek-item').forEach(el =>
      el.addEventListener('click', () => selCdek(matches[+el.dataset.i]))
    );
  } else {
    sug.style.display = 'block';
    sug.innerHTML = '<div class="cdek-item" style="cursor:default;color:var(--muted)">Отделений не найдено</div>';
  }
});

function selCdek(a) {
  document.getElementById('ordCdek').value = a;
  document.getElementById('cdekSug').style.display = 'none';
}

function submitOrder() {
  const ln  = document.getElementById('ordLN').value.trim();
  const fn  = document.getElementById('ordFN').value.trim();
  const mn  = document.getElementById('ordMN').value.trim();
  const cd  = document.getElementById('ordCdek').value.trim();
  const err = document.getElementById('ordErr');

  // FIX: guard against confirming an order with an empty cart.
  if (!cart.length) {
    showNotif('Корзина пуста');
    nav('catalog');
    return;
  }
  if (!ln || !fn || !mn || !cd) { err.classList.add('show'); return; }
  err.classList.remove('show');

  orderCount++;
  saveSession();
  cart = [];
  updateCartBadge();
  rerender();
  showNotif('Заказ успешно оформлен!');
  nav('home');
}
