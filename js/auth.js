// ════════════════════════════════════════
// AUTH — register / login / logout / account
// NOTE: this is a demo store — accounts live in localStorage and
// passwords are stored in plain text. Do NOT reuse as-is for a real
// site (see CLAUDE.md → Security).
// ════════════════════════════════════════

function doLogin() {
  const em  = document.getElementById('loginEmail').value.trim().toLowerCase();
  const ps  = document.getElementById('loginPass').value;
  const err = document.getElementById('loginErr');
  const u   = users.find(x => x.email === em && x.pass === ps);
  if (!u) { err.classList.add('show'); return; }
  err.classList.remove('show');
  currentUser = u;
  saveSession();
  showNotif('Добро пожаловать, ' + u.firstName + '!');
  nav('account');
}

function doRegister() {
  const ln = document.getElementById('regLN').value.trim();
  const fn = document.getElementById('regFN').value.trim();
  const mn = document.getElementById('regMN').value.trim();
  const yr = document.getElementById('regYr').value.trim();
  const gn = document.getElementById('regGn').value;
  const em = document.getElementById('regEm').value.trim().toLowerCase();
  const ps = document.getElementById('regPs').value;
  const err = document.getElementById('regErr');

  if (!ln || !fn || !mn || !yr || !gn || !em || ps.length < 6 || !em.includes('@')) {
    err.textContent = 'Заполните все поля корректно'; err.classList.add('show'); return;
  }
  if (users.find(u => u.email === em)) {
    err.textContent = 'Пользователь с такой почтой уже существует'; err.classList.add('show'); return;
  }
  err.classList.remove('show');

  const u = { lastName: ln, firstName: fn, middleName: mn, year: yr, gender: gn, email: em, pass: ps };
  users.push(u);
  saveUsers();
  currentUser = u;
  saveSession();
  showNotif('Добро пожаловать, ' + fn + '!');
  nav('account');
}

function doLogout() {
  currentUser = null;
  saveSession();
  showNotif('Вы вышли из аккаунта');
  nav('home');
}

function renderAccount() {
  if (!currentUser) { nav('login'); return; }
  const u = currentUser;
  const gm = { male: 'Мужской', female: 'Женский', other: 'Не указан' };
  document.getElementById('accHello').textContent = u.firstName + ' ' + u.lastName;
  document.getElementById('accEmail').textContent = u.email;
  document.getElementById('accFavC').textContent  = itemsLabel(favorites.size);
  document.getElementById('accCartC').textContent = itemsLabel(cart.reduce((s, i) => s + i.qty, 0));
  document.getElementById('accOrdC').textContent  = ordersLabel(orderCount);
  document.getElementById('accIG').innerHTML =
    '<div class="acc-ii"><label>Фамилия</label><p>'      + escapeHtml(u.lastName)   + '</p></div>' +
    '<div class="acc-ii"><label>Имя</label><p>'          + escapeHtml(u.firstName)  + '</p></div>' +
    '<div class="acc-ii"><label>Отчество</label><p>'     + escapeHtml(u.middleName) + '</p></div>' +
    '<div class="acc-ii"><label>Год рождения</label><p>' + escapeHtml(u.year)       + '</p></div>' +
    '<div class="acc-ii"><label>Пол</label><p>'          + (gm[u.gender] || '—')    + '</p></div>' +
    '<div class="acc-ii"><label>Email</label><p>'        + escapeHtml(u.email)      + '</p></div>';
}
