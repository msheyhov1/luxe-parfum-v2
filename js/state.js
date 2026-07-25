// ════════════════════════════════════════
// STATE — single source of truth + localStorage persistence
//
// FIX: the original kept cart, favorites, the logged-in user and
// the order count in memory only, so a page reload silently emptied
// the cart, cleared favorites and logged the user out. Everything
// that should survive a reload is now persisted here.
// ════════════════════════════════════════

const STORAGE = {
  users:   'luxeUsers',
  cart:    'luxeCart',
  fav:     'luxeFavorites',
  session: 'luxeSession',
  search:  'luxeSearchHistory',
  journal: 'luxeJournal',
};

function _load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

// ── persisted state ──
let users       = _load(STORAGE.users, []);
let cart        = _load(STORAGE.cart, []);
let favorites   = new Set(_load(STORAGE.fav, []));
const _session  = _load(STORAGE.session, {});
let orderCount  = _session.orderCount || 0;
// Re-hydrate the user from `users` by email so we never duplicate
// the stored password across keys.
let currentUser = _session.email ? (users.find(u => u.email === _session.email) || null) : null;

// ── transient UI state ──
let ppSlide = 0;
let ppImgs = [];
let ppCurrentProduct = null;
let _catFilter = 'all';

// ── grid data caches ──
let _hd = PRODUCTS.filter(p => p.cat.includes('hits')).slice(0, 4); // home "popular"
let _nd = PRODUCTS.slice(0, 8);                              // home full-assortment preview
let _cd = PRODUCTS.slice();                                  // catalog (current filter)

// ── persistence helpers ──
function saveCart()      { localStorage.setItem(STORAGE.cart, JSON.stringify(cart)); }
function saveFavorites() { localStorage.setItem(STORAGE.fav, JSON.stringify([...favorites])); }
function saveUsers()     { localStorage.setItem(STORAGE.users, JSON.stringify(users)); }
function saveSession()   {
  localStorage.setItem(STORAGE.session, JSON.stringify({
    email: currentUser ? currentUser.email : null,
    orderCount,
  }));
}
