// ════════════════════════════════════════
// NOTIFICATION — bottom toast.
// When `clickTarget` is given the toast becomes clickable and
// navigates there (e.g. "added to cart → open cart").
// ════════════════════════════════════════
function showNotif(msg, clickTarget) {
  const n = document.getElementById('notif');
  n.textContent = msg;
  n.style.cursor = clickTarget ? 'pointer' : 'default';
  n.onclick = clickTarget ? () => nav(clickTarget) : null;
  n.classList.add('show');
  clearTimeout(n._t);
  n._t = setTimeout(() => n.classList.remove('show'), 3000);
}
