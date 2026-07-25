// ════════════════════════════════════════
// REVIEWS — product page reviews block
// (data lives in js/data/reviews.js as REVIEWS_DATA)
// ════════════════════════════════════════

let _reviewsExpanded = false;

function renderReviews(p) {
  _reviewsExpanded = false;
  const btn = document.getElementById('ppReviewsMore');
  const ratingLine = document.getElementById('ppReviewsRating');

  const stars = Math.round(p.rating);
  ratingLine.innerHTML =
    '<div style="display:flex;gap:3px">' +
      [1,2,3,4,5].map(i => '<span style="font-size:16px;color:' + (i <= stars ? 'var(--gold)' : 'var(--muted)') + '">★</span>').join('') +
    '</div>' +
    '<span style="font-family:\'Cormorant Garamond\',serif;font-size:22px;color:var(--gold-l);margin-left:10px">' + p.rating + '</span>' +
    '<span style="font-size:11px;color:var(--muted);margin-left:6px">' + p.reviews + ' ' + pluralRu(p.reviews, 'отзыв', 'отзыва', 'отзывов') + '</span>';

  _renderReviewsList(REVIEWS_DATA.slice(0, 4));
  btn.style.display = 'block';
  btn.textContent   = 'Показать все отзывы (' + REVIEWS_DATA.length + ')';
}

function _renderReviewsList(reviews) {
  const list = document.getElementById('ppReviewsList');
  list.innerHTML = reviews.map(r => {
    const stars = r.rating;
    return '<div class="pp-review">' +
      '<div class="pp-review-hdr">' +
        '<span class="pp-review-author">' + escapeHtml(r.author) + '</span>' +
        '<div class="pp-review-stars">' +
          [1,2,3,4,5].map(i => '<span class="pp-review-star' + (i <= stars ? ' lit' : '') + '">★</span>').join('') +
        '</div>' +
        '<span class="pp-review-date">' + escapeHtml(r.date) + '</span>' +
      '</div>' +
      (r.pros !== '—' ? '<div class="pp-review-block"><div class="pp-review-label">Достоинства</div><div class="pp-review-text pp-review-pros">' + escapeHtml(r.pros) + '</div></div>' : '') +
      (r.cons !== '—' ? '<div class="pp-review-block"><div class="pp-review-label">Недостатки</div><div class="pp-review-text pp-review-cons">' + escapeHtml(r.cons) + '</div></div>' : '') +
      '<div class="pp-review-block"><div class="pp-review-label">Комментарий</div><div class="pp-review-text">' + escapeHtml(r.comment) + '</div></div>' +
    '</div>';
  }).join('');
}

function showAllReviews() {
  _reviewsExpanded = !_reviewsExpanded;
  _renderReviewsList(_reviewsExpanded ? REVIEWS_DATA : REVIEWS_DATA.slice(0, 4));
  const btn = document.getElementById('ppReviewsMore');
  btn.textContent = _reviewsExpanded
    ? 'Скрыть отзывы'
    : 'Показать все отзывы (' + REVIEWS_DATA.length + ')';
}

function scrollToReviews() {
  const r = document.getElementById('ppReviews');
  if (r) r.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
