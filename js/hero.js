// ════════════════════════════════════════
// HERO SLIDER — data-driven, auto-advancing, arrows + dots + swipe.
//
// Slides live in HERO_SLIDES (editable via the admin panel and persisted
// to localStorage). renderHero() rebuilds the .hero inner markup; the .hero
// element itself is preserved so the swipe listener attached in gestures.js
// keeps working across re-renders. window.__hero exposes STABLE wrappers that
// delegate to the current controller, so gestures.js never holds a stale ref.
// ════════════════════════════════════════

const DEFAULT_HERO_SLIDES = [
  {img:'assets/img/p11.jpg', tag:'Новая парфюмерная глава', title:'Аромат, который говорит за вас', text:'Редкие композиции и знаковые бестселлеры мировых парфюмерных домов.', btn:'Смотреть новинки', cat:'all'},
  {img:'assets/img/p12.jpg', tag:'Мужская коллекция', title:'Характер в каждой ноте', text:'Свежие, древесные и пряные композиции для безупречного личного стиля.', btn:'Выбрать аромат', cat:'him'},
  {img:'assets/img/p16.jpg', tag:'Женская коллекция', title:'Свобода быть разной', text:'От прозрачных цветочных аккордов до глубоких восточных шлейфов.', btn:'Открыть коллекцию', cat:'her'},
  {img:'assets/img/p08.jpg', tag:'LUXE Privé', title:'Нишевая парфюмерия без компромиссов', text:'Авторские композиции, редкие ингредиенты и ароматы с собственным голосом.', btn:'Открыть нишу', cat:'unisex'},
  {img:'assets/img/p17.jpg', tag:'Искусство дарить', title:'Подарок, который останется в памяти', text:'Фирменная упаковка и персональная открытка для особенного момента.', btn:'Выбрать подарок', cat:''},
];
let HERO_SLIDES = _contentLoad(CONTENT_KEYS.hero, DEFAULT_HERO_SLIDES);

// stable controller indirection (swipe/gestures bind to these once)
let _heroCtl = null;
let _heroTimer = null;
window.__hero = {
  next:  () => { if (_heroCtl) _heroCtl.next(); },
  prev:  () => { if (_heroCtl) _heroCtl.prev(); },
  count: () => (_heroCtl ? _heroCtl.count() : 0),
};

function _cssUrl(src) { return String(src || '').replace(/['"\\]/g, ''); }

function _heroBtnAttr(slide) {
  // A real category → jump to the catalog; otherwise a friendly notice.
  if (slide.cat && CAT_LABELS[slide.cat]) {
    return "onclick=\"navCat('" + slide.cat + "',null)\"";
  }
  return "onclick=\"showNotif('Скоро в LUXE')\"";
}

function renderHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const slides = (HERO_SLIDES && HERO_SLIDES.length) ? HERO_SLIDES : DEFAULT_HERO_SLIDES;

  hero.innerHTML =
    slides.map((s, i) =>
      '<div class="hslide' + (i === 0 ? ' active' : '') + '">' +
        '<div class="hslide-bg" style="background-image:url(\'' + _cssUrl(s.img) + '\')"></div>' +
        '<div class="hslide-ov"></div>' +
        '<div class="hcont">' +
          '<div class="h-tag">' + escapeHtml(s.tag || '') + '</div>' +
          '<h1>' + escapeHtml(s.title || '') + '</h1>' +
          '<p>' + escapeHtml(s.text || '') + '</p>' +
          '<button class="h-btn" ' + _heroBtnAttr(s) + '>' + escapeHtml(s.btn || 'Подробнее') + '</button>' +
        '</div>' +
      '</div>'
    ).join('') +
    '<button class="h-arr p" id="hP">‹</button>' +
    '<button class="h-arr n" id="hN">›</button>' +
    '<div class="hdots">' +
      slides.map((s, i) => '<button class="hdot' + (i === 0 ? ' active' : '') + '" data-s="' + i + '"></button>').join('') +
    '</div>' +
    '<div class="h-ctr" id="hCtr">01 / ' + String(slides.length).padStart(2, '0') + '</div>';

  _initHeroSlider();
}

function _initHeroSlider() {
  if (_heroTimer) { clearInterval(_heroTimer); _heroTimer = null; }

  const slides = document.querySelectorAll('.hero .hslide');
  const dots   = document.querySelectorAll('.hero .hdot');
  const ctr    = document.getElementById('hCtr');
  if (!slides.length) { _heroCtl = null; return; }

  let cs = 0;
  function goSlide(n) {
    slides[cs].classList.remove('active');
    if (dots[cs]) dots[cs].classList.remove('active');
    cs = (n + slides.length) % slides.length;
    slides[cs].classList.add('active');
    if (dots[cs]) dots[cs].classList.add('active');
    if (ctr) ctr.textContent =
      String(cs + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
  }

  const prev = document.getElementById('hP');
  const next = document.getElementById('hN');
  if (prev) prev.onclick = () => goSlide(cs - 1);
  if (next) next.onclick = () => goSlide(cs + 1);
  dots.forEach(d => d.onclick = () => goSlide(+d.dataset.s));
  if (slides.length > 1) _heroTimer = setInterval(() => goSlide(cs + 1), 5500);

  _heroCtl = {
    next:  () => goSlide(cs + 1),
    prev:  () => goSlide(cs - 1),
    count: () => slides.length,
  };
}

renderHero();
