// ════════════════════════════════════════
// PRODUCT PAGE — gallery, info, specs, cart/fav controls.
// openProduct() pushes history; _renderProduct() paints
// (also called by popstate / direct hash load).
// ════════════════════════════════════════

function openProduct(p) {
  // FIX: close the search overlay so it doesn't stay pinned
  // over the product page when opening a search result.
  closeSearchOverlay();
  history.pushState({ page: 'product', productId: p.id }, '', '#product-' + p.id);
  _renderProduct(p);
}

function _renderProduct(p) {
  ppCurrentProduct = p;
  ppSlide = 0;
  ppImgs = p.imgs;

  // breadcrumb
  document.getElementById('ppBN').textContent = p.name;

  // banner
  document.getElementById('ppBannerBg').style.backgroundImage = "url('" + p.imgs[0] + "')";
  document.getElementById('ppBannerTitle').textContent = p.brand + ' — ' + p.name;
  document.getElementById('ppBannerSub').textContent   = p.vol + ' · ' + formatPrice(p.price);

  // main image track — click opens lightbox
  const track = document.getElementById('ppTrack');
  track.innerHTML = p.imgs.map((src, i) =>
    '<img class="pp-main-img" src="' + escapeHtml(src) + '" alt="' + escapeHtml(p.name) + '" data-i="' + i + '">'
  ).join('');
  track.style.transform = 'translateX(0)';
  track.querySelectorAll('.pp-main-img').forEach(img => {
    img.addEventListener('click', () => openLightbox(+img.dataset.i));
  });

  // thumbnails
  const thumbsEl = document.getElementById('ppThumbs');
  thumbsEl.innerHTML = p.imgs.map((src, i) =>
    '<img class="pp-thumb' + (i === 0 ? ' active' : '') + '" src="' + escapeHtml(src) + '" alt="" data-i="' + i + '">'
  ).join('');
  thumbsEl.querySelectorAll('.pp-thumb').forEach(t => {
    t.addEventListener('click', () => goPP(+t.dataset.i));
  });

  // gallery arrows
  document.getElementById('ppPL').onclick = (e) => { e.stopPropagation(); goPP(ppSlide - 1); };
  document.getElementById('ppPR').onclick = (e) => { e.stopPropagation(); goPP(ppSlide + 1); };

  // text fields
  document.getElementById('ppBrand').textContent     = p.brand;
  document.getElementById('ppName').textContent      = p.name;
  document.getElementById('ppVol').textContent       = p.vol;
  document.getElementById('ppPrice').textContent     = formatPrice(p.price);
  document.getElementById('ppDescText').textContent  = p.desc;
  document.getElementById('ppDescExtra').textContent = p.descExtra || '';
  document.getElementById('ppIngr').textContent      = p.ingredients || '';

  // rating (clickable → scroll to reviews)
  const stars = Math.round(p.rating);
  document.getElementById('ppRating').innerHTML =
    '<div class="pp-stars" style="cursor:pointer" onclick="scrollToReviews()">' +
      [1,2,3,4,5].map(i => '<span class="pp-star' + (i <= stars ? ' lit' : '') + '">★</span>').join('') +
    '</div>' +
    '<div class="pp-rating-count" style="cursor:pointer;text-decoration:underline;text-underline-offset:3px" onclick="scrollToReviews()">' +
      p.rating + ' · ' + p.reviews + ' ' + pluralRu(p.reviews, 'отзыв', 'отзыва', 'отзывов') +
    '</div>';

  // notes chips
  const ne = document.getElementById('ppNotes');
  ne.innerHTML = '';
  p.notes.forEach(n => {
    const s = document.createElement('span');
    s.className = 'pp-note';
    s.textContent = n;
    ne.appendChild(s);
  });

  // spec: fragrance pyramid (first 3 notes)
  const noteLabels = ['Верхние ноты', 'Ноты сердца', 'Базовые ноты'];
  document.getElementById('ppSpecNotes').innerHTML = p.notes.slice(0, 3).map((n, i) =>
    '<div class="pp-spec-row">' +
      '<span class="pp-spec-key">' + (noteLabels[i] || 'Нота') + '</span>' +
      '<span class="pp-spec-val">' + escapeHtml(n) + '</span>' +
    '</div>'
  ).join('');

  const genderLabel = p.cat.includes('him') ? 'Мужской' : p.cat.includes('her') ? 'Женский' : 'Унисекс';
  document.getElementById('ppSpecInfo').innerHTML =
    '<div class="pp-spec-row"><span class="pp-spec-key">Тип продукта</span><span class="pp-spec-val">Парфюмерная вода</span></div>' +
    '<div class="pp-spec-row"><span class="pp-spec-key">Объём</span><span class="pp-spec-val">' + escapeHtml(p.vol) + '</span></div>' +
    '<div class="pp-spec-row"><span class="pp-spec-key">Пол</span><span class="pp-spec-val">' + genderLabel + '</span></div>' +
    '<div class="pp-spec-row"><span class="pp-spec-key">Бренд</span><span class="pp-spec-val">' + escapeHtml(p.brand) + '</span></div>' +
    '<div class="pp-spec-row"><span class="pp-spec-key">Стойкость</span><span class="pp-spec-val">Высокая · 8–12 часов</span></div>' +
    '<div class="pp-spec-row"><span class="pp-spec-key">Шлейф</span><span class="pp-spec-val">Заметный</span></div>';

  // cart + qty controls
  const cartBtn  = document.getElementById('ppCart');
  const qtyCtrl  = document.getElementById('ppQtyCtrl');
  const qtyNum   = document.getElementById('ppQtyNum');
  const qtyMinus = document.getElementById('ppQtyMinus');
  const qtyPlus  = document.getElementById('ppQtyPlus');

  function updCartUI() {
    const ic = cart.find(i => i.id === p.id);
    if (ic) {
      cartBtn.style.display = 'none';
      qtyCtrl.style.display = 'flex';
      qtyNum.textContent = ic.qty;
    } else {
      cartBtn.style.display = '';
      qtyCtrl.style.display = 'none';
      cartBtn.textContent = 'В корзину';
      cartBtn.className = 'pp-cbtn add';
    }
  }
  updCartUI();
  cartBtn.onclick = () => { addToCart(p); updCartUI(); rerender(); };
  qtyMinus.onclick = () => {
    const ic = cart.find(i => i.id === p.id);
    if (!ic) return;
    ic.qty--;
    if (ic.qty <= 0) cart = cart.filter(i => i.id !== p.id);
    updateCartBadge(); updCartUI(); rerender();
  };
  qtyPlus.onclick = () => {
    const ic = cart.find(i => i.id === p.id);
    if (ic) ic.qty++; else addToCart(p);
    updateCartBadge(); updCartUI(); rerender();
  };

  // fav button
  const fb = document.getElementById('ppFav');
  fb.classList.toggle('faved', favorites.has(p.id));
  fb.onclick = () => { toggleFav(p); fb.classList.toggle('faved', favorites.has(p.id)); rerender(); };

  // reviews
  renderReviews(p);

  // show the page
  document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active'));
  document.getElementById('page-product').classList.add('active');
  window.scrollTo(0, 0);
}

function goPP(n) {
  ppSlide = (n + ppImgs.length) % ppImgs.length;
  document.getElementById('ppTrack').style.transform = 'translateX(-' + (ppSlide * 100) + '%)';
  document.querySelectorAll('.pp-thumb').forEach((t, i) => t.classList.toggle('active', i === ppSlide));
}
