// ════════════════════════════════════════
// ADMIN PANEL — full site content editor for the static demo.
//
// Access is gated client-side (SHA-256 digests, never plain text) — good
// enough for a GitHub Pages demo, NOT real auth. A production build must
// validate on a trusted server and move these edits behind an API.
//
// The panel edits the live content globals (PRODUCTS / CAT_META / CAT_LABELS /
// HERO_SLIDES / journal / static texts) and persists each to localStorage, so
// the storefront re-renders immediately and survives reloads. "Экспорт JSON"
// dumps everything so a developer can bake it into the source permanently.
// ════════════════════════════════════════

// Credentials are generated once and delivered to the owner separately.
// Only their SHA-256 digests are committed to the public repository.
const ADMIN_USER_HASH = '3da0d3e3d470fd4c1a6408588186d2d290b8bb534c3a86e1d3649e94110a7da2';
const ADMIN_PASS_HASH = '54c58ebca0bf72ebeb3d3e14e5a949bc1151934a09a76537b302fcf64235a14b';
const ADMIN_SESSION_KEY = 'luxeAdminAuthenticated';

function isAdminAuthenticated() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
}

async function _sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function doAdminLogin() {
  const login = document.getElementById('adminLogin').value.trim();
  const password = document.getElementById('adminPassword').value;
  const error = document.getElementById('adminLoginErr');
  const [loginHash, passwordHash] = await Promise.all([_sha256(login), _sha256(password)]);

  if (loginHash !== ADMIN_USER_HASH || passwordHash !== ADMIN_PASS_HASH) {
    error.classList.add('show');
    document.getElementById('adminPassword').value = '';
    return;
  }

  sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
  error.classList.remove('show');
  document.getElementById('adminLogin').value = '';
  document.getElementById('adminPassword').value = '';
  history.replaceState({ page: 'journal-admin' }, '', '#journal-admin');
  _showPage('journal-admin');
}

function adminLogout() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  nav('admin-login');
}

const _pwEl = document.getElementById('adminPassword');
if (_pwEl) _pwEl.addEventListener('keydown', event => { if (event.key === 'Enter') doAdminLogin(); });

// ── persistence + storefront refresh ─────────────────────────────────────
function _persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    showNotif('Не удалось сохранить: превышен лимит браузера (фото слишком большие)');
    return false;
  }
}

// Re-render every part of the storefront that depends on the catalogue.
function refreshStore() {
  _hd = PRODUCTS.filter(p => p.cat.includes('hits')).slice(0, 4);
  _nd = PRODUCTS.slice(0, 8);
  if (document.getElementById('homeGrid')) renderGrid(_hd, 'homeGrid');
  if (document.getElementById('newGrid'))  renderGrid(_nd, 'newGrid');
  if (typeof renderCatalog === 'function') renderCatalog(_catFilter || 'all');
}

// ── dashboard shell ──────────────────────────────────────────────────────
const ADMIN_TABS = ['products', 'hero', 'cats', 'journal', 'texts'];

function adminTab(name) {
  document.querySelectorAll('#adminTabs .admin-tab')
    .forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  ADMIN_TABS.forEach(n => {
    const el = document.getElementById('adminPanel-' + n);
    if (el) el.hidden = (n !== name);
  });

  if (name === 'products') renderAdminProducts();
  if (name === 'hero')     { _admHero = _contentClone(HERO_SLIDES); renderAdminHero(); }
  if (name === 'cats')     { _admCatMeta = _contentClone(CAT_META); _admCatLabels = _contentClone(CAT_LABELS); renderAdminCats(); }
  if (name === 'journal')  renderJournalAdmin();
  if (name === 'texts')    renderAdminTexts();
}

function initAdminDashboard() {
  adminTab('products');
}

// ════════════════════════════════════════
// TAB 1 — PRODUCTS (full CRUD)
// ════════════════════════════════════════
const ADMIN_CATS = [
  { k: 'hits', l: 'Хиты' }, { k: 'him', l: 'Для него' }, { k: 'her', l: 'Для неё' },
  { k: 'unisex', l: 'Унисекс' }, { k: 'toilette', l: 'Туалетная вода' },
  { k: 'oil', l: 'Масляные духи' }, { k: 'home', l: 'Для дома' },
  { k: 'new', l: 'Новинки' }, { k: 'sale', l: 'Распродажа' },
];

let _admEditId = null;   // id of product being edited, or null for a new one
let _admImgs = [];       // working image list for the open editor

function renderAdminProducts() {
  const panel = document.getElementById('adminPanel-products');
  if (!panel) return;

  panel.innerHTML =
    '<div class="adm-bar">' +
      '<h2>Товары</h2>' +
      '<button class="adm-btn" onclick="openProductEditor(null)">＋ Добавить товар</button>' +
    '</div>' +
    '<div class="adm-count">Всего: ' + PRODUCTS.length + '</div>' +
    '<div class="adm-plist">' +
      PRODUCTS.map(p =>
        '<div class="adm-prow">' +
          '<img class="adm-prow-img" src="' + escapeHtml(p.imgs && p.imgs[0] || '') + '" alt="">' +
          '<div class="adm-prow-info">' +
            '<div class="adm-prow-brand">' + escapeHtml(p.brand) + '</div>' +
            '<div class="adm-prow-name">' + escapeHtml(p.name) + '</div>' +
            '<div class="adm-prow-tags">' +
              (p.cat || []).map(c => '<span class="adm-tag">' + escapeHtml(_catLabel(c)) + '</span>').join('') +
            '</div>' +
          '</div>' +
          '<div class="adm-prow-price">' + formatPrice(p.price) + '</div>' +
          '<div class="adm-prow-act">' +
            '<button class="adm-btn ghost sm" onclick="openProductEditor(' + p.id + ')">Изменить</button>' +
            '<button class="adm-btn danger sm" onclick="deleteProduct(' + p.id + ')">Удалить</button>' +
          '</div>' +
        '</div>'
      ).join('') +
    '</div>';
}

function _catLabel(k) {
  const found = ADMIN_CATS.find(c => c.k === k);
  return found ? found.l : (CAT_LABELS[k] || k);
}

function openProductEditor(id) {
  _admEditId = id;
  const p = (id == null)
    ? { brand: '', name: '', vol: '', price: '', badge: '', rating: '', reviews: '', cat: [], notes: [], desc: '', descExtra: '', ingredients: '', imgs: [] }
    : PRODUCTS.find(x => x.id === id) || {};
  _admImgs = (p.imgs || []).slice();
  if (!_admImgs.length) _admImgs = [''];

  const panel = document.getElementById('adminPanel-products');
  const val = v => escapeHtml(v == null ? '' : String(v));

  panel.innerHTML =
    '<div class="adm-form">' +
      '<div class="adm-form-head">' +
        '<h2>' + (id == null ? 'Новый товар' : 'Редактирование товара') + '</h2>' +
        '<button class="adm-btn ghost sm" onclick="renderAdminProducts()">← К списку</button>' +
      '</div>' +
      '<div class="adm-grid">' +
        _field('Бренд', '<input id="pfBrand" class="fi" value="' + val(p.brand) + '">') +
        _field('Название', '<input id="pfName" class="fi" value="' + val(p.name) + '">') +
        _field('Объём', '<input id="pfVol" class="fi" placeholder="100 мл" value="' + val(p.vol) + '">') +
        _field('Цена, ₽', '<input id="pfPrice" class="fi" type="number" min="0" value="' + val(p.price) + '">') +
        _field('Бейдж (необязательно)', '<input id="pfBadge" class="fi" placeholder="Хит, −15%…" value="' + val(p.badge) + '">') +
        _field('Рейтинг', '<input id="pfRating" class="fi" type="number" step="0.1" min="0" max="5" value="' + val(p.rating) + '">') +
        _field('Кол-во отзывов', '<input id="pfReviews" class="fi" type="number" min="0" value="' + val(p.reviews) + '">') +
        '<div class="adm-field wide"><span>Категории</span><div class="adm-cats">' +
          ADMIN_CATS.map(c =>
            '<label class="adm-chk' + ((p.cat || []).includes(c.k) ? ' on' : '') + '">' +
              '<input type="checkbox" value="' + c.k + '" ' + ((p.cat || []).includes(c.k) ? 'checked' : '') +
              ' onchange="this.parentNode.classList.toggle(\'on\',this.checked)">' + c.l +
            '</label>'
          ).join('') +
        '</div></div>' +
        _field('Ноты (через запятую)', '<textarea id="pfNotes" class="fi">' + val((p.notes || []).join(', ')) + '</textarea>', true) +
        _field('Описание', '<textarea id="pfDesc" class="fi">' + val(p.desc) + '</textarea>', true) +
        _field('Дополнительное описание', '<textarea id="pfDescExtra" class="fi">' + val(p.descExtra) + '</textarea>', true) +
        _field('Состав', '<textarea id="pfIngredients" class="fi">' + val(p.ingredients) + '</textarea>', true) +
        '<div class="adm-field wide"><span>Изображения — первое становится обложкой</span>' +
          '<div class="adm-imgs" id="pfImgs"></div>' +
          '<div><button class="adm-btn ghost sm" onclick="admAddProductImg()">＋ Добавить изображение</button></div>' +
        '</div>' +
      '</div>' +
      '<div class="admin-actions">' +
        '<button class="adm-btn" onclick="saveProduct()">Сохранить товар</button>' +
        '<button class="adm-btn ghost" onclick="renderAdminProducts()">Отмена</button>' +
      '</div>' +
    '</div>';

  renderProductImgs();
}

function _field(label, control, wide) {
  return '<div class="adm-field' + (wide ? ' wide' : '') + '"><span>' + label + '</span>' + control + '</div>';
}

function renderProductImgs() {
  const box = document.getElementById('pfImgs');
  if (!box) return;
  if (!_admImgs.length) { box.innerHTML = '<div class="adm-hint">Нет изображений — добавьте хотя бы одно.</div>'; return; }
  box.innerHTML = _admImgs.map((src, i) =>
    '<div class="adm-img-row">' +
      '<img class="adm-img-prev" src="' + escapeHtml(src) + '" alt="">' +
      '<input class="fi" value="' + escapeHtml(src) + '" placeholder="URL или загрузите файл →" oninput="admSetProductImg(' + i + ', this.value)">' +
      '<label class="adm-btn ghost sm adm-upload">Загрузить<input type="file" accept="image/*" onchange="admUploadProductImg(' + i + ', this)"></label>' +
      '<button class="adm-btn ghost sm" onclick="admRemoveProductImg(' + i + ')" title="Удалить">✕</button>' +
    '</div>'
  ).join('');
}

function admSetProductImg(i, value) {
  _admImgs[i] = value;
  const prev = document.querySelectorAll('#pfImgs .adm-img-prev')[i];
  if (prev) prev.src = value;
}
function admAddProductImg() { _admImgs.push(''); renderProductImgs(); }
function admRemoveProductImg(i) { _admImgs.splice(i, 1); renderProductImgs(); }
function admUploadProductImg(i, input) {
  _readImage(input, dataUrl => { _admImgs[i] = dataUrl; renderProductImgs(); });
}

function _readImage(input, cb) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => cb(reader.result);
  reader.readAsDataURL(file);
}

function saveProduct() {
  const get = id => (document.getElementById(id).value || '').trim();
  const brand = get('pfBrand');
  const name = get('pfName');
  const price = parseInt(get('pfPrice'), 10);
  const imgs = _admImgs.map(s => (s || '').trim()).filter(Boolean);

  if (!brand || !name) { showNotif('Укажите бренд и название'); return; }
  if (!(price >= 0)) { showNotif('Укажите корректную цену'); return; }
  if (!imgs.length) { showNotif('Добавьте хотя бы одно изображение'); return; }

  const cat = Array.from(document.querySelectorAll('#adminPanel-products .adm-chk input:checked')).map(c => c.value);
  const notes = get('pfNotes').split(/[,\n]/).map(s => s.trim()).filter(Boolean);
  const rating = parseFloat(get('pfRating'));
  const reviews = parseInt(get('pfReviews'), 10);
  const badge = get('pfBadge');

  const product = {
    id: _admEditId == null ? _nextProductId() : _admEditId,
    brand, name,
    vol: get('pfVol'),
    price,
    cat,
    rating: isNaN(rating) ? 0 : rating,
    reviews: isNaN(reviews) ? 0 : reviews,
    notes,
    desc: get('pfDesc'),
    descExtra: get('pfDescExtra'),
    ingredients: get('pfIngredients'),
    imgs,
  };
  if (badge) product.badge = badge;

  if (_admEditId == null) {
    PRODUCTS.push(product);
  } else {
    const idx = PRODUCTS.findIndex(x => x.id === _admEditId);
    if (idx >= 0) PRODUCTS[idx] = product; else PRODUCTS.push(product);
  }

  if (!_persist(CONTENT_KEYS.products, PRODUCTS)) return;
  refreshStore();
  renderAdminProducts();
  showNotif('Товар сохранён');
}

function _nextProductId() {
  return PRODUCTS.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;
}

function deleteProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  if (!confirm('Удалить товар «' + p.brand + ' ' + p.name + '»?')) return;
  const idx = PRODUCTS.findIndex(x => x.id === id);
  if (idx >= 0) PRODUCTS.splice(idx, 1);
  if (!_persist(CONTENT_KEYS.products, PRODUCTS)) return;
  refreshStore();
  renderAdminProducts();
  showNotif('Товар удалён');
}

// ════════════════════════════════════════
// TAB 2 — HERO SLIDER
// ════════════════════════════════════════
let _admHero = [];

function _catOptions(selected) {
  const opts = ['<option value=""' + (!selected || !CAT_LABELS[selected] ? ' selected' : '') + '>— без перехода —</option>'];
  Object.keys(CAT_LABELS).forEach(k => {
    opts.push('<option value="' + k + '"' + (selected === k ? ' selected' : '') + '>' + escapeHtml(CAT_LABELS[k]) + '</option>');
  });
  return opts.join('');
}

function renderAdminHero() {
  const panel = document.getElementById('adminPanel-hero');
  if (!panel) return;
  const val = v => escapeHtml(v == null ? '' : String(v));

  panel.innerHTML =
    '<div class="adm-bar"><h2>Слайдер на главной</h2>' +
      '<button class="adm-btn" onclick="admAddHeroSlide()">＋ Добавить слайд</button></div>' +
    _admHero.map((s, i) =>
      '<div class="adm-form" data-hero-i="' + i + '" style="margin-bottom:14px">' +
        '<div class="adm-form-head"><h2 style="font-size:20px">Слайд ' + (i + 1) + '</h2>' +
          '<button class="adm-btn danger sm" onclick="admRemoveHeroSlide(' + i + ')">Удалить слайд</button></div>' +
        '<div class="adm-grid">' +
          '<div class="adm-field wide"><span>Фон слайда</span>' +
            '<div class="adm-img-row">' +
              '<img class="adm-img-prev" src="' + val(s.img) + '" alt="">' +
              '<input class="fi" data-field="img" value="' + val(s.img) + '" placeholder="URL или загрузите файл →">' +
              '<label class="adm-btn ghost sm adm-upload">Загрузить<input type="file" accept="image/*" onchange="admUploadHeroImg(' + i + ', this)"></label>' +
              '<span></span>' +
            '</div>' +
          '</div>' +
          _field('Тег (маленькая надпись)', '<input class="fi" data-field="tag" value="' + val(s.tag) + '">') +
          _field('Текст кнопки', '<input class="fi" data-field="btn" value="' + val(s.btn) + '">') +
          _field('Заголовок', '<input class="fi" data-field="title" value="' + val(s.title) + '">', true) +
          _field('Подзаголовок', '<textarea class="fi" data-field="text">' + val(s.text) + '</textarea>', true) +
          _field('Кнопка ведёт в категорию', '<select class="fi" data-field="cat">' + _catOptions(s.cat) + '</select>') +
        '</div>' +
      '</div>'
    ).join('') +
    '<div class="admin-actions">' +
      '<button class="adm-btn" onclick="saveHero()">Сохранить слайдер</button>' +
      '<button class="adm-btn ghost" onclick="resetHero()">Вернуть исходные</button>' +
    '</div>';
}

function _collectHero() {
  document.querySelectorAll('#adminPanel-hero [data-hero-i]').forEach(box => {
    const i = +box.dataset.heroI;
    if (!_admHero[i]) return;
    box.querySelectorAll('[data-field]').forEach(f => { _admHero[i][f.dataset.field] = f.value; });
  });
}

function admAddHeroSlide() {
  _collectHero();
  _admHero.push({ img: '', tag: '', title: '', text: '', btn: 'Подробнее', cat: '' });
  renderAdminHero();
}
function admRemoveHeroSlide(i) {
  _collectHero();
  _admHero.splice(i, 1);
  renderAdminHero();
}
function admUploadHeroImg(i, input) {
  _collectHero();
  _readImage(input, dataUrl => { _admHero[i].img = dataUrl; renderAdminHero(); });
}

function saveHero() {
  _collectHero();
  const clean = _admHero.filter(s => s.title || s.img || s.text);
  if (!clean.length) { showNotif('Добавьте хотя бы один слайд'); return; }
  HERO_SLIDES = clean;
  if (!_persist(CONTENT_KEYS.hero, HERO_SLIDES)) return;
  renderHero();
  showNotif('Слайдер сохранён');
}
function resetHero() {
  HERO_SLIDES = _contentClone(DEFAULT_HERO_SLIDES);
  localStorage.removeItem(CONTENT_KEYS.hero);
  _admHero = _contentClone(HERO_SLIDES);
  renderAdminHero();
  renderHero();
  showNotif('Слайдер восстановлен');
}

// ════════════════════════════════════════
// TAB 3 — CATEGORIES (banners + labels)
// ════════════════════════════════════════
let _admCatMeta = {};
let _admCatLabels = {};

function renderAdminCats() {
  const panel = document.getElementById('adminPanel-cats');
  if (!panel) return;
  const val = v => escapeHtml(v == null ? '' : String(v));

  panel.innerHTML =
    '<div class="adm-bar"><h2>Категории</h2></div>' +
    '<div class="admin-note" style="margin-bottom:18px">Название и баннер (заголовок, подпись, фон) показываются на странице каталога выбранной категории.</div>' +
    Object.keys(_admCatMeta).map(k => {
      const m = _admCatMeta[k];
      return '<div class="adm-form" data-cat-k="' + k + '" style="margin-bottom:14px">' +
        '<div class="adm-form-head"><h2 style="font-size:20px">' + escapeHtml(_admCatLabels[k] || k) + '</h2></div>' +
        '<div class="adm-grid">' +
          _field('Название на вкладке каталога', '<input class="fi" data-field="label" value="' + val(_admCatLabels[k]) + '">') +
          _field('Заголовок баннера', '<input class="fi" data-field="title" value="' + val(m.title) + '">') +
          _field('Подпись баннера', '<input class="fi" data-field="sub" value="' + val(m.sub) + '">', true) +
          '<div class="adm-field wide"><span>Фон баннера</span>' +
            '<div class="adm-img-row">' +
              '<img class="adm-img-prev" src="' + val(m.img) + '" alt="">' +
              '<input class="fi" data-field="img" value="' + val(m.img) + '" placeholder="URL или загрузите файл →">' +
              '<label class="adm-btn ghost sm adm-upload">Загрузить<input type="file" accept="image/*" onchange="admUploadCatImg(\'' + k + '\', this)"></label>' +
              '<span></span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('') +
    '<div class="admin-actions">' +
      '<button class="adm-btn" onclick="saveCats()">Сохранить категории</button>' +
      '<button class="adm-btn ghost" onclick="resetCats()">Вернуть исходные</button>' +
    '</div>';
}

function _collectCats() {
  document.querySelectorAll('#adminPanel-cats [data-cat-k]').forEach(box => {
    const k = box.dataset.catK;
    box.querySelectorAll('[data-field]').forEach(f => {
      if (f.dataset.field === 'label') _admCatLabels[k] = f.value;
      else if (_admCatMeta[k]) _admCatMeta[k][f.dataset.field] = f.value;
    });
  });
}

function admUploadCatImg(k, input) {
  _collectCats();
  _readImage(input, dataUrl => { if (_admCatMeta[k]) _admCatMeta[k].img = dataUrl; renderAdminCats(); });
}

function saveCats() {
  _collectCats();
  CAT_META = _contentClone(_admCatMeta);
  CAT_LABELS = _contentClone(_admCatLabels);
  if (!_persist(CONTENT_KEYS.catMeta, CAT_META)) return;
  _persist(CONTENT_KEYS.catLabels, CAT_LABELS);
  refreshStore();
  if (typeof applyCatLabels === 'function') applyCatLabels();
  showNotif('Категории сохранены');
}
function resetCats() {
  CAT_META = _contentClone(DEFAULT_CAT_META);
  CAT_LABELS = _contentClone(DEFAULT_CAT_LABELS);
  localStorage.removeItem(CONTENT_KEYS.catMeta);
  localStorage.removeItem(CONTENT_KEYS.catLabels);
  _admCatMeta = _contentClone(CAT_META);
  _admCatLabels = _contentClone(CAT_LABELS);
  renderAdminCats();
  refreshStore();
  if (typeof applyCatLabels === 'function') applyCatLabels();
  showNotif('Категории восстановлены');
}

// ════════════════════════════════════════
// TAB 5 — STATIC TEXTS (about / contacts)
// ════════════════════════════════════════
const TEXT_ABOUT = ['abH1', 'abP1', 'abH2', 'abP2', 'abH3', 'abP3'];
const TEXT_CONTACTS = ['ctAddr', 'ctPhone'];
let _defaultTexts = null;

function _elText(id) { const el = document.getElementById(id); return el ? el.textContent : ''; }
function _elMultiline(id) {
  const el = document.getElementById(id);
  return el ? el.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') : '';
}
function _setMultiline(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = escapeHtml(value).replace(/\n/g, '<br>');
}

function _captureDefaultTexts() {
  _defaultTexts = {};
  TEXT_ABOUT.forEach(id => _defaultTexts[id] = _elText(id));
  TEXT_CONTACTS.forEach(id => _defaultTexts[id] = _elMultiline(id));
}

// Apply stored overrides to the live DOM (called on page load).
function applyTexts() {
  const stored = _contentLoad(CONTENT_KEYS.texts, null);
  if (!stored) return;
  TEXT_ABOUT.forEach(id => { if (stored[id] != null) { const el = document.getElementById(id); if (el) el.textContent = stored[id]; } });
  TEXT_CONTACTS.forEach(id => { if (stored[id] != null) _setMultiline(id, stored[id]); });
}

function renderAdminTexts() {
  const panel = document.getElementById('adminPanel-texts');
  if (!panel) return;
  const val = v => escapeHtml(v == null ? '' : String(v));

  panel.innerHTML =
    '<div class="adm-bar"><h2>Тексты страниц</h2></div>' +
    '<div class="adm-form" style="margin-bottom:14px">' +
      '<div class="adm-form-head"><h2 style="font-size:20px">Страница «О нас»</h2></div>' +
      '<div class="adm-grid">' +
        _field('Заголовок 1', '<input class="fi" id="tx-abH1" value="' + val(_elText('abH1')) + '">') +
        _field('Заголовок 2', '<input class="fi" id="tx-abH2" value="' + val(_elText('abH2')) + '">') +
        _field('Абзац 1', '<textarea class="fi" id="tx-abP1">' + val(_elText('abP1')) + '</textarea>', true) +
        _field('Абзац 2', '<textarea class="fi" id="tx-abP2">' + val(_elText('abP2')) + '</textarea>', true) +
        _field('Заголовок 3', '<input class="fi" id="tx-abH3" value="' + val(_elText('abH3')) + '">', true) +
        _field('Абзац 3', '<textarea class="fi" id="tx-abP3">' + val(_elText('abP3')) + '</textarea>', true) +
      '</div>' +
    '</div>' +
    '<div class="adm-form">' +
      '<div class="adm-form-head"><h2 style="font-size:20px">Страница «Контакты»</h2></div>' +
      '<div class="adm-grid">' +
        _field('Адрес и часы работы (каждая строка с новой строки)', '<textarea class="fi" id="tx-ctAddr">' + val(_elMultiline('ctAddr')) + '</textarea>', true) +
        _field('Телефон и e-mail (каждая строка с новой строки)', '<textarea class="fi" id="tx-ctPhone">' + val(_elMultiline('ctPhone')) + '</textarea>', true) +
      '</div>' +
    '</div>' +
    '<div class="admin-actions">' +
      '<button class="adm-btn" onclick="saveTexts()">Сохранить тексты</button>' +
      '<button class="adm-btn ghost" onclick="resetTexts()">Вернуть исходные</button>' +
    '</div>';
}

function saveTexts() {
  const snapshot = {};
  TEXT_ABOUT.forEach(id => {
    const input = document.getElementById('tx-' + id);
    if (!input) return;
    snapshot[id] = input.value;
    const el = document.getElementById(id);
    if (el) el.textContent = input.value;
  });
  TEXT_CONTACTS.forEach(id => {
    const input = document.getElementById('tx-' + id);
    if (!input) return;
    snapshot[id] = input.value;
    _setMultiline(id, input.value);
  });
  _persist(CONTENT_KEYS.texts, snapshot);
  showNotif('Тексты сохранены');
}

function resetTexts() {
  if (!_defaultTexts) return;
  TEXT_ABOUT.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = _defaultTexts[id]; });
  TEXT_CONTACTS.forEach(id => _setMultiline(id, _defaultTexts[id]));
  localStorage.removeItem(CONTENT_KEYS.texts);
  renderAdminTexts();
  showNotif('Тексты восстановлены');
}

// ════════════════════════════════════════
// EXPORT / RESET ALL
// ════════════════════════════════════════
function exportContent() {
  const bundle = {
    products:  PRODUCTS,
    catMeta:   CAT_META,
    catLabels: CAT_LABELS,
    hero:      HERO_SLIDES,
    journal:   (typeof JOURNAL_ARTICLES !== 'undefined') ? JOURNAL_ARTICLES : undefined,
    texts:     _contentLoad(CONTENT_KEYS.texts, {}),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'luxe-content.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showNotif('Контент выгружен в luxe-content.json');
}

function resetAllContent() {
  if (!confirm('Сбросить ВЕСЬ контент к исходному состоянию? Это удалит все ваши изменения.')) return;
  [CONTENT_KEYS.products, CONTENT_KEYS.catMeta, CONTENT_KEYS.catLabels, CONTENT_KEYS.hero, CONTENT_KEYS.texts, STORAGE.journal]
    .forEach(k => localStorage.removeItem(k));

  PRODUCTS = _contentClone(DEFAULT_PRODUCTS);
  CAT_META = _contentClone(DEFAULT_CAT_META);
  CAT_LABELS = _contentClone(DEFAULT_CAT_LABELS);
  HERO_SLIDES = _contentClone(DEFAULT_HERO_SLIDES);
  if (typeof JOURNAL_ARTICLES !== 'undefined') JOURNAL_ARTICLES = _contentClone(DEFAULT_JOURNAL_ARTICLES);

  refreshStore();
  renderHero();
  if (typeof renderJournal === 'function') renderJournal();
  resetTexts();
  adminTab('products');
  showNotif('Весь контент сброшен');
}

// Capture pristine copy text and apply any stored overrides on first load.
_captureDefaultTexts();
applyTexts();
