// ════════════════════════════════════════
// HOME MERCHANDISING — lightweight, data-driven sections.
// The journal data can later be replaced by an admin-panel API response
// without changing the markup or card renderer.
// ════════════════════════════════════════

const DEFAULT_JOURNAL_ARTICLES = [
  {
    image: 'assets/img/p17.jpg',
    date: '18 июля 2026',
    title: 'Как собрать парфюмерный гардероб',
    text: 'Почему одного любимого аромата мало и какие композиции нужны для разных настроений.',
  },
  {
    image: 'assets/img/p08.jpg',
    date: '10 июля 2026',
    title: 'Уд без стереотипов',
    text: 'Разбираемся, почему одна из самых древних нот звучит так современно.',
  },
  {
    image: 'assets/img/p12.jpg',
    date: '3 июля 2026',
    title: 'Как продлить стойкость аромата',
    text: 'Пять простых правил нанесения и хранения, которые действительно работают.',
  },
  {
    image: 'assets/img/p16.jpg',
    date: '26 июня 2026',
    title: 'Ноты, которые пахнут чистотой',
    text: 'Мускус, ирис, нероли и другие аккорды для ощущения свежести.',
  },
];
let JOURNAL_ARTICLES = _load(STORAGE.journal, DEFAULT_JOURNAL_ARTICLES);

function renderJournal() {
  const grid = document.getElementById('journalGrid');
  if (!grid) return;
  grid.innerHTML = JOURNAL_ARTICLES.map(article =>
    '<article class="journal-card">' +
      '<img src="' + article.image + '" alt="' + escapeHtml(article.title) + '" loading="lazy">' +
      '<div class="journal-copy">' +
        '<time>' + escapeHtml(article.date) + '</time>' +
        '<h3>' + escapeHtml(article.title) + '</h3>' +
        '<p>' + escapeHtml(article.text) + '</p>' +
        '<button onclick="showNotif(\'Статья скоро появится в журнале LUXE\')">Читать статью</button>' +
      '</div>' +
    '</article>'
  ).join('');
}

function filterHomeProducts(filter, btn) {
  document.querySelectorAll('.product-sort button').forEach(button => button.classList.remove('active'));
  const activeButton = btn || document.querySelector('.product-sort button[data-filter="' + filter + '"]');
  if (activeButton) activeButton.classList.add('active');

  if (filter === 'new') _nd = PRODUCTS.filter(p => p.cat.includes('new'));
  else if (filter === 'hits') _nd = PRODUCTS.filter(p => p.cat.includes('hits'));
  else if (filter === 'sale') _nd = PRODUCTS.filter(p => p.cat.includes('sale'));
  else _nd = PRODUCTS.slice(0, 8);

  renderGrid(_nd, 'newGrid');
  const target = document.querySelector('.all-products');
  if (!btn && target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function searchBrand(brand) {
  const input = document.getElementById('searchInput');
  if (input) input.value = brand;
  doSearch(brand);
}

function renderJournalAdmin() {
  const editor = document.getElementById('journalEditor');
  if (!editor) return;
  editor.innerHTML = JOURNAL_ARTICLES.map((article, index) =>
    '<fieldset class="journal-editor-card">' +
      '<legend>Материал ' + (index + 1) + '</legend>' +
      '<label>Изображение<input class="fi" data-field="image" data-index="' + index + '" value="' + escapeHtml(article.image) + '"></label>' +
      '<label>Дата<input class="fi" data-field="date" data-index="' + index + '" value="' + escapeHtml(article.date) + '"></label>' +
      '<label>Заголовок<input class="fi" data-field="title" data-index="' + index + '" value="' + escapeHtml(article.title) + '"></label>' +
      '<label>Описание<textarea class="fi" data-field="text" data-index="' + index + '">' + escapeHtml(article.text) + '</textarea></label>' +
    '</fieldset>'
  ).join('');
}

function saveJournalAdmin() {
  const next = JOURNAL_ARTICLES.map(article => ({ ...article }));
  document.querySelectorAll('#journalEditor [data-field]').forEach(field => {
    next[+field.dataset.index][field.dataset.field] = field.value.trim();
  });
  if (next.some(article => !article.image || !article.date || !article.title || !article.text)) {
    showNotif('Заполните все поля журнала');
    return;
  }
  JOURNAL_ARTICLES = next;
  localStorage.setItem(STORAGE.journal, JSON.stringify(JOURNAL_ARTICLES));
  renderJournal();
  showNotif('Материалы журнала сохранены');
}

function resetJournalAdmin() {
  JOURNAL_ARTICLES = DEFAULT_JOURNAL_ARTICLES.map(article => ({ ...article }));
  localStorage.removeItem(STORAGE.journal);
  renderJournalAdmin();
  renderJournal();
  showNotif('Материалы восстановлены');
}

renderJournal();
