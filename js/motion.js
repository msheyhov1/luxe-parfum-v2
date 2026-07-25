// ════════════════════════════════════════
// MOTION — scroll reveal + entrance cleanup.
// Pure progressive enhancement: if anything here is unsupported,
// content stays fully visible.
// ════════════════════════════════════════
(function () {
  // The staggered card entrance uses animation-fill-mode:both, which would
  // otherwise keep overriding the :hover transform. Strip the one-shot class
  // once its animation finishes so hover lifts work again.
  document.addEventListener('animationend', e => {
    const t = e.target;
    if (t && t.classList && t.classList.contains('card-enter')) {
      t.classList.remove('card-enter');
      t.style.animationDelay = '';
    }
  });

  // Scroll-reveal for static sections marked with .reveal in the markup.
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  function scanReveal() {
    document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
  }

  // exposed so future dynamic content can re-register if needed
  window.scanReveal = scanReveal;
  scanReveal();
})();
