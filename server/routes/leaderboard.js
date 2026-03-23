const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/leaderboard — public, no auth required
router.get('/leaderboard', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT
        u.id,
        u.username,
        u.avatar_color,
        COALESCE(s.current_streak, 0) AS current_streak,
        COALESCE(s.longest_streak, 0) AS longest_streak,
        COALESCE(
          (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.completed = 1),
          0
        ) AS completed_tasks,
        COALESCE(
          (SELECT MAX(p.phase) FROM progress p WHERE p.user_id = u.id AND p.completed = 1),
          -1
        ) AS phase_reached
      FROM users u
      LEFT JOIN streaks s ON s.user_id = u.id
      ORDER BY completed_tasks DESC, current_streak DESC
    `).all();

    // Fix phase_reached: -1 means no tasks completed
    const result = users.map((u, i) => ({
      rank: i + 1,
      username: u.username,
      avatar_color: u.avatar_color,
      completed_tasks: u.completed_tasks,
      current_streak: u.current_streak,
      longest_streak: u.longest_streak,
      phase_reached: u.phase_reached >= 0 ? u.phase_reached : null
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
