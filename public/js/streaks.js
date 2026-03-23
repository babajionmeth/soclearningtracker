// ========================================
// SOC TRACKER — STREAKS JS
// ========================================

async function loadStreaks() {
  try {
    const res = await apiFetch('/api/streaks');
    const data = await res.json();

    if (!data.success) return;

    const s = data.data;
    document.getElementById('current-streak').textContent = s.current_streak;
    document.getElementById('longest-streak').textContent = s.longest_streak;
    document.getElementById('total-checkins').textContent = s.total_checkins;

    // Update badges
    const badges = document.querySelectorAll('.streak-badge');
    badges.forEach(badge => {
      const days = parseInt(badge.dataset.days);
      if (s.longest_streak >= days) {
        badge.classList.add('earned');
      }
    });

    // Update check-in button
    const btn = document.getElementById('btn-checkin');
    const status = document.getElementById('checkin-status');

    if (s.checked_in_today) {
      btn.classList.add('checked');
      btn.textContent = '✓ CHECKED IN';
      btn.disabled = true;
      status.textContent = '// TODAY\'S CHECK-IN COMPLETE';
    } else {
      btn.classList.remove('checked');
      btn.textContent = '🔥 CHECK IN TODAY';
      btn.disabled = false;
      status.textContent = '';
    }

  } catch (err) {
    console.error('Failed to load streaks:', err);
  }
}

async function doCheckin() {
  const btn = document.getElementById('btn-checkin');
  if (btn.disabled) return;

  btn.disabled = true;
  btn.textContent = 'CHECKING IN...';

  try {
    const res = await apiFetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.error || 'Check-in failed', 'error');
      btn.disabled = false;
      btn.textContent = '🔥 CHECK IN TODAY';
      return;
    }

    const s = data.data;

    // Update display
    document.getElementById('current-streak').textContent = s.current_streak;
    document.getElementById('longest-streak').textContent = s.longest_streak;
    document.getElementById('total-checkins').textContent = s.total_checkins;

    btn.classList.add('checked');
    btn.textContent = '✓ CHECKED IN';
    document.getElementById('checkin-status').textContent = '// TODAY\'S CHECK-IN COMPLETE';

    // Update badges
    const badges = document.querySelectorAll('.streak-badge');
    badges.forEach(badge => {
      const days = parseInt(badge.dataset.days);
      if (s.longest_streak >= days) {
        badge.classList.add('earned');
      }
    });

    // Show milestone toast if hit
    if (s.milestone) {
      showToast('🏆 STREAK MILESTONE: ' + s.milestone + ' DAYS!', 'milestone');
    } else if (s.message) {
      showToast('Already checked in today', '');
    } else {
      showToast('🔥 Day ' + s.current_streak + ' streak!', '');
    }

  } catch (err) {
    showToast('Connection error', 'error');
    btn.disabled = false;
    btn.textContent = '🔥 CHECK IN TODAY';
  }
}
