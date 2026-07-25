// ════════════════════════════════════════
// LIGHTBOX — full-screen product image viewer
// ════════════════════════════════════════
let _lbSlide = 0;

function openLightbox(idx) {
  _lbSlide = idx;
  const img = document.getElementById('ppLbImg');
  img.src = ppImgs[_lbSlide];
  img.alt = ppCurrentProduct ? ppCurrentProduct.name : '';
  document.getElementById('ppLightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('ppLightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function lbSlide(dir) {
  _lbSlide = (_lbSlide + dir + ppImgs.length) % ppImgs.length;
  document.getElementById('ppLbImg').src = ppImgs[_lbSlide];
}

document.getElementById('ppLbPrev').addEventListener('click', e => { e.stopPropagation(); lbSlide(-1); });
document.getElementById('ppLbNext').addEventListener('click', e => { e.stopPropagation(); lbSlide(1); });
document.addEventListener('keydown', e => {
  const lb = document.getElementById('ppLightbox');
  if (!lb.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  lbSlide(-1);
  if (e.key === 'ArrowRight') lbSlide(1);
  if (e.key === 'Escape')     closeLightbox();
});
