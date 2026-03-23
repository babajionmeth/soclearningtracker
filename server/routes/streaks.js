const express = require('express');
const db = require('../db');
const { authenticate } = require('../auth');

const router = express.Router();

const MILESTONES = [3, 7, 14, 30, 60, 100];

// Helper: get today's date in UTC as YYYY-MM-DD
function todayUTC() {
  return new Date().toISOString().split('T')[0];
}

// Helper: get yesterday's date in UTC as YYYY-MM-DD
function yesterdayUTC() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

// GET /api/streaks
router.get('/streaks', authenticate, (req, res) => {
  try {
    const streak = db.prepare('SELECT * FROM streaks WHERE user_id = ?').get(req.user.id);

    if (!streak) {
      return res.json({
        success: true,
        data: {
          current_streak: 0,
          longest_streak: 0,
          last_checkin: null,
          total_checkins: 0,
          checked_in_today: false
        }
      });
    }

    const today = todayUTC();
    const checkedInToday = streak.last_checkin === today;

    res.json({
      success: true,
      data: {
        current_streak: streak.current_streak,
        longest_streak: streak.longest_streak,
        last_checkin: streak.last_checkin,
        total_checkins: streak.total_checkins,
        checked_in_today: checkedInToday
      }
    });
  } catch (err) {
    console.error('Streaks GET error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/checkin
router.post('/checkin', authenticate, (req, res) => {
  try {
    let streak = db.prepare('SELECT * FROM streaks WHERE user_id = ?').get(req.user.id);

    // Create streak record if missing
    if (!streak) {
      db.prepare(
        'INSERT INTO streaks (user_id, current_streak, longest_streak, total_checkins) VALUES (?, 0, 0, 0)'
      ).run(req.user.id);
      streak = db.prepare('SELECT * FROM streaks WHERE user_id = ?').get(req.user.id);
    }

    const today = todayUTC();
    const yesterday = yesterdayUTC();

    // Already checked in today — idempotent
    if (streak.last_checkin === today) {
      return res.json({
        success: true,
        data: {
          current_streak: streak.current_streak,
          longest_streak: streak.longest_streak,
          last_checkin: streak.last_checkin,
          total_checkins: streak.total_checkins,
          checked_in_today: true,
          message: 'Already checked in today'
        }
      });
    }

    let newStreak;
    if (streak.last_checkin === yesterday) {
      // Continue streak
      newStreak = streak.current_streak + 1;
    } else {
      // Reset streak (first check-in or gap of 2+ days)
      newStreak = 1;
    }

    const newLongest = Math.max(newStreak, streak.longest_streak);
    const newTotal = streak.total_checkins + 1;

    db.prepare(`
      UPDATE streaks
      SET current_streak = ?, longest_streak = ?, last_checkin = ?, total_checkins = ?
      WHERE user_id = ?
    `).run(newStreak, newLongest, today, newTotal, req.user.id);

    // Log check-in activity
    db.prepare(
      'INSERT INTO activity_log (user_id, action, detail) VALUES (?, ?, ?)'
    ).run(req.user.id, 'checkin', JSON.stringify({ streak: newStreak, date: today }));

    // Check for milestone
    let milestone = null;
    if (MILESTONES.includes(newStreak)) {
      milestone = newStreak;
      db.prepare(
        'INSERT INTO activity_log (user_id, action, detail) VALUES (?, ?, ?)'
      ).run(req.user.id, 'streak_milestone', JSON.stringify({ days: newStreak }));
    }

    res.json({
      success: true,
      data: {
        current_streak: newStreak,
        longest_streak: newLongest,
        last_checkin: today,
        total_checkins: newTotal,
        checked_in_today: true,
        milestone
      }
    });
  } catch (err) {
    console.error('Checkin error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
