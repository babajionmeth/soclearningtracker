// ========================================
// SOC TRACKER — DASHBOARD JS
// ========================================

const API_BASE = '';
let currentUser = null;

// Auth guard
(function initDashboard() {
  const token = localStorage.getItem('soc_token');
  const userStr = localStorage.getItem('soc_user');

  if (!token || !userStr) {
    window.location.href = '/index.html';
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('soc_token');
      localStorage.removeItem('soc_user');
      window.location.href = '/index.html';
      return;
    }
  } catch (e) {
    window.location.href = '/index.html';
    return;
  }

  currentUser = JSON.parse(userStr);
  setupHeader();
  loadAll();
})();

function setupHeader() {
  const avatar = document.getElementById('user-avatar');
  const name = document.getElementById('user-name');

  const initials = currentUser.username.substring(0, 2).toUpperCase();
  avatar.textContent = initials;
  avatar.style.backgroundColor = currentUser.avatar_color || '#00ff88';
  name.textContent = currentUser.username.toUpperCase();
}

function logout() {
  localStorage.removeItem('soc_token');
  localStorage.removeItem('soc_user');
  window.location.href = '/index.html';
}

// Fetch wrapper with JWT
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('soc_token');
  if (!options.headers) options.headers = {};
  if (token) options.headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + url, options);

  if (res.status === 401) {
    localStorage.removeItem('soc_token');
    localStorage.removeItem('soc_user');
    window.location.href = '/index.html';
    return;
  }

  return res;
}

// Toast
function showToast(msg, type) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast' + (type ? ' ' + type : '');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Load all dashboard data
async function loadAll() {
  await Promise.all([
    loadProgress(),
    loadStreaks(),
    loadLeaderboard()
  ]);
}

// Load progress + render phases
async function loadProgress() {
  try {
    const res = await apiFetch('/api/progress');
    if (!res) return;
    const data = await res.json();

    if (!data.success) return;

    const { phases, stats } = data.data;

    // Update overall progress
    document.getElementById('overall-pct').textContent = stats.percentage + '%';
    document.getElementById('overall-count').textContent = `(${stats.completed}/${stats.total} tasks)`;
    document.getElementById('overall-bar').style.width = stats.percentage + '%';

    // Render phase cards
    renderPhases(phases);

  } catch (err) {
    console.error('Failed to load progress:', err);
    document.getElementById('phases-container').innerHTML =
      '<div class="loading" style="color: var(--red);">FAILED TO LOAD ROADMAP</div>';
  }
}

function renderPhases(phases) {
  const container = document.getElementById('phases-container');
  container.innerHTML = '';

  phases.forEach(phase => {
    const completedCount = phase.tasks.filter(t => t.completed).length;
    const totalCount = phase.tasks.length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const card = document.createElement('div');
    card.className = `phase-card phase-${phase.phase}`;
    card.innerHTML = `
      <div class="phase-header" onclick="togglePhase(this)">
        <div class="phase-num">${String(phase.phase).padStart(2, '0')}</div>
        <div class="phase-meta">
          <div class="phase-title">${escapeHtml(phase.name)}</div>
          <div class="phase-tagline">${escapeHtml(phase.tagline)}</div>
          <div class="phase-progress-mini">
            <div class="bar-wrap">
              <div class="bar-fill" style="width: ${pct}%"></div>
            </div>
            <span class="count">${completedCount}/${totalCount}</span>
          </div>
        </div>
        <div class="phase-toggle">›</div>
      </div>
      <div class="phase-body">
        <ul class="task-list">
          ${phase.tasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
              <input type="checkbox"
                id="task-${task.id}"
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask('${task.id}', this.checked, ${phase.phase})">
              <label class="task-label" for="task-${task.id}">${escapeHtml(task.label)}</label>
              <span class="task-type ${task.type}">${task.type.toUpperCase()}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    container.appendChild(card);
  });
}

function togglePhase(header) {
  const card = header.closest('.phase-card');
  card.classList.toggle('open');
}

async function toggleTask(taskId, completed, phase) {
  try {
    const res = await apiFetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, completed })
    });

    if (!res) return;
    const data = await res.json();

    if (!data.success) {
      showToast('Failed to update task', 'error');
      return;
    }

    // Update the task item visually
    const item = document.querySelector(`[data-task-id="${taskId}"]`);
    if (item) {
      item.classList.toggle('completed', completed);
    }

    // Refresh progress stats
    await loadProgress();

    // Refresh leaderboard (task counts changed)
    loadLeaderboard();

    if (completed) {
      showToast('✓ Task completed', '');
    }

  } catch (err) {
    showToast('Connection error', 'error');
  }
}

// Leaderboard
async function loadLeaderboard() {
  try {
    const res = await fetch(API_BASE + '/api/leaderboard');
    const data = await res.json();

    if (!data.success) return;

    const tbody = document.getElementById('leaderboard-body');
    const users = data.data;

    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);">No operatives yet</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => {
      const initials = u.username.substring(0, 2).toUpperCase();
      const isSelf = currentUser && u.username === currentUser.username;
      const rankClass = u.rank <= 3 ? `rank-${u.rank}` : '';
      const phaseStr = u.phase_reached !== null ? `P${u.phase_reached}` : '—';

      return `
        <tr class="${isSelf ? 'self-row' : ''}">
          <td><span class="lb-rank ${rankClass}">${u.rank}</span></td>
          <td>
            <div class="lb-user">
              <div class="lb-avatar" style="background: ${u.avatar_color || '#00ff88'}">${initials}</div>
              <span class="lb-username">${escapeHtml(u.username)}${isSelf ? ' (you)' : ''}</span>
            </div>
          </td>
          <td><span class="lb-tasks">${u.completed_tasks}</span></td>
          <td><span class="lb-streak">🔥 ${u.current_streak}</span></td>
          <td class="hide-mobile"><span class="lb-phase">${phaseStr}</span></td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load leaderboard:', err);
  }
}

// Utils
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
