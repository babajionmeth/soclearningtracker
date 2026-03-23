// ========================================
// SOC TRACKER — AUTH JS
// ========================================

const API = '';

// Check if already logged in
(function checkAuth() {
  const token = localStorage.getItem('soc_token');
  if (token) {
    // Verify token is still valid by decoding expiry
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) {
        window.location.href = '/dashboard.html';
        return;
      }
    } catch (e) { /* invalid token, stay on login */ }
    localStorage.removeItem('soc_token');
    localStorage.removeItem('soc_user');
  }
})();

// Tab switching
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(el => el.classList.remove('active'));

  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('form-' + tab).classList.add('active');

  // Clear errors
  document.getElementById('login-error').textContent = '';
  document.getElementById('register-error').textContent = '';
}

// Login
async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-login');
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  if (!username || !password) {
    errEl.textContent = '> All fields required';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'AUTHENTICATING...';

  try {
    const res = await fetch(API + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!data.success) {
      errEl.textContent = '> ' + (data.error || 'Login failed');
      btn.disabled = false;
      btn.textContent = 'ACCESS SYSTEM ▸';
      return;
    }

    // Store token and user info
    localStorage.setItem('soc_token', data.data.token);
    localStorage.setItem('soc_user', JSON.stringify({
      username: data.data.username,
      avatar_color: data.data.avatar_color
    }));

    showToast('ACCESS GRANTED — Welcome back, ' + data.data.username);
    setTimeout(() => window.location.href = '/dashboard.html', 500);

  } catch (err) {
    errEl.textContent = '> Connection error';
    btn.disabled = false;
    btn.textContent = 'ACCESS SYSTEM ▸';
  }
}

// Register
async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-register');
  const errEl = document.getElementById('register-error');
  errEl.textContent = '';

  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;

  if (!username || !password) {
    errEl.textContent = '> All fields required';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'CREATING OPERATIVE...';

  try {
    const res = await fetch(API + '/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!data.success) {
      errEl.textContent = '> ' + (data.error || 'Registration failed');
      btn.disabled = false;
      btn.textContent = 'CREATE OPERATIVE ▸';
      return;
    }

    localStorage.setItem('soc_token', data.data.token);
    localStorage.setItem('soc_user', JSON.stringify({
      username: data.data.username,
      avatar_color: data.data.avatar_color
    }));

    showToast('OPERATIVE CREATED — Welcome, ' + data.data.username);
    setTimeout(() => window.location.href = '/dashboard.html', 500);

  } catch (err) {
    errEl.textContent = '> Connection error';
    btn.disabled = false;
    btn.textContent = 'CREATE OPERATIVE ▸';
  }
}

// Toast notification
function showToast(msg, type) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast' + (type ? ' ' + type : '');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
