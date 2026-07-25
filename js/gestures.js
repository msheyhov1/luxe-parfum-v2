// ════════════════════════════════════════
// GESTURES — drag / swipe / horizontal-wheel for the carousels,
// so they aren't button-only. Arrows & dots keep working.
// Progressive enhancement: if pointer events are missing nothing breaks.
// ════════════════════════════════════════

// viewport — element receiving the gesture (the clipping frame)
// opts:
//   track?      — element translated live during a drag (omit for fade/swap galleries)
//   getIndex()  — current slide index (for live-follow + snap-back)
//   getCount()  — number of slides (gesture is disabled when < 2)
//   next()/prev() — advance one slide
function attachSwipe(viewport, opts) {
  if (!viewport) return;
  const track    = opts.track || null;
  const getIndex = opts.getIndex || (() => 0);
  const getCount = opts.getCount || (() => 2);
  const next     = opts.next || (() => {});
  const prev     = opts.prev || (() => {});

  let down = false, startX = 0, startY = 0, moved = false, horiz = false, w = 1, cur = 0;

  viewport.style.touchAction = 'pan-y';                 // keep vertical page scroll
  viewport.addEventListener('dragstart', e => e.preventDefault()); // no ghost image drag

  viewport.addEventListener('pointerdown', e => {
    if (getCount() < 2) return;
    if (e.target.closest('button')) return;             // let arrows / dots handle it
    down = true; moved = false; horiz = false;
    startX = e.clientX; startY = e.clientY;
    w = viewport.clientWidth || 1; cur = getIndex();
    if (track) track.style.transition = 'none';
  });

  viewport.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (!moved) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      horiz = Math.abs(dx) > Math.abs(dy);              // lock axis on first move
      moved = true;
      if (horiz) { try { viewport.setPointerCapture(e.pointerId); } catch (_) {} }
    }
    if (!horiz) return;                                  // vertical → page scrolls
    if (e.cancelable) e.preventDefault();
    if (track) track.style.transform = 'translateX(' + (-cur * 100 + (dx / w) * 100) + '%)';
  }, { passive: false });

  function release(e) {
    if (!down) return;
    down = false;
    if (track) track.style.transition = '';
    if (!horiz) return;
    const dx = (e.clientX || startX) - startX;
    const thr = Math.max(40, w * 0.14);                 // ~14% of width to commit
    if (dx <= -thr) next();
    else if (dx >= thr) prev();
    else if (track) track.style.transform = 'translateX(' + (-cur * 100) + '%)'; // snap back
  }
  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', () => {
    if (down && track) track.style.transform = 'translateX(' + (-getIndex() * 100) + '%)';
    down = false;
  });

  // swallow the click that browsers fire after a real horizontal drag,
  // so a swipe doesn't also open the product / lightbox.
  viewport.addEventListener('click', e => {
    if (moved && horiz) { e.stopPropagation(); e.preventDefault(); moved = false; }
  }, true);

  // horizontal trackpad swipe / shift+wheel → one slide per gesture
  let wheelLock = false;
  viewport.addEventListener('wheel', e => {
    if (getCount() < 2) return;
    const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
    if (!dx || Math.abs(dx) < 12) return;
    if (e.cancelable) e.preventDefault();
    if (wheelLock) return;
    wheelLock = true;
    setTimeout(() => { wheelLock = false; }, 360);
    dx > 0 ? next() : prev();
  }, { passive: false });
}

// ── auto-attach the static carousels (product cards are wired in _initCardGallery) ──
(function attachStaticCarousels() {
  // product page main gallery (live-follow drag)
  const wrap  = document.getElementById('ppMainWrap');
  const track = document.getElementById('ppTrack');
  if (wrap && track) {
    attachSwipe(wrap, {
      track,
      getIndex: () => ppSlide,
      getCount: () => ppImgs.length,
      next: () => goPP(ppSlide + 1),
      prev: () => goPP(ppSlide - 1),
    });
  }

  // hero (crossfade — direction only, no live-follow)
  const hero = document.querySelector('.hero');
  if (hero && window.__hero) {
    attachSwipe(hero, { getCount: window.__hero.count, next: window.__hero.next, prev: window.__hero.prev });
  }

  // lightbox (image swap — attach to inner so background-tap-to-close still works)
  const lbInner = document.querySelector('.pp-lb-inner');
  if (lbInner) {
    attachSwipe(lbInner, { getCount: () => ppImgs.length, next: () => lbSlide(1), prev: () => lbSlide(-1) });
  }
})();
