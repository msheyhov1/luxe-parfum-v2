// ════════════════════════════════════════
// UTILS — pure helpers, no DOM/state side effects
// ════════════════════════════════════════

// Escape user-supplied text before inserting into innerHTML.
// Prevents broken markup / injection from search queries etc.
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

// 43500 -> "43 500 ₽"
function formatPrice(n) {
  return Number(n).toLocaleString('ru-RU') + ' ₽';
}

// Russian plural: pluralRu(1,'товар','товара','товаров') -> 'товар'
function pluralRu(n, one, few, many) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

// "3 товара"
function itemsLabel(n) {
  return n + ' ' + pluralRu(n, 'товар', 'товара', 'товаров');
}

// "2 заказа"
function ordersLabel(n) {
  return n + ' ' + pluralRu(n, 'заказ', 'заказа', 'заказов');
}
