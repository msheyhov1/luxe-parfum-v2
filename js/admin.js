// ════════════════════════════════════════
// ADMIN ACCESS — client-side gate for the static GitHub Pages demo.
// Credentials are stored only as SHA-256 digests, never as plain text.
// A real production admin must validate credentials on a trusted server.
// ════════════════════════════════════════

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

document.getElementById('adminPassword').addEventListener('keydown', event => {
  if (event.key === 'Enter') doAdminLogin();
});
