// ════════════════════════════════════════
// HERO SLIDER — auto-advancing, with arrows + dots.
// ════════════════════════════════════════
(function initHero() {
  let cs = 0;
  const slides = document.querySelectorAll('.hslide');
  const dots   = document.querySelectorAll('.hdot');
  if (!slides.length) return;

  function goSlide(n) {
    slides[cs].classList.remove('active');
    dots[cs].classList.remove('active');
    cs = (n + slides.length) % slides.length;
    slides[cs].classList.add('active');
    dots[cs].classList.add('active');
    // FIX: was hardcoded "0" prefix ('01 / 0' + len); now padded properly.
    document.getElementById('hCtr').textContent =
      String(cs + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
  }

  document.getElementById('hP').onclick = () => goSlide(cs - 1);
  document.getElementById('hN').onclick = () => goSlide(cs + 1);
  dots.forEach(d => d.onclick = () => goSlide(+d.dataset.s));
  setInterval(() => goSlide(cs + 1), 5500);

  // expose relative controls so gestures.js can add swipe support
  window.__hero = {
    next:  () => goSlide(cs + 1),
    prev:  () => goSlide(cs - 1),
    count: () => slides.length,
  };
})();
