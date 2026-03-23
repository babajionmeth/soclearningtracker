const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// Generate a random hex color for avatar
function randomColor() {
  const colors = ['#00ff88', '#00d4ff', '#ff6b35', '#a855f7', '#ffd700', '#ff3366', '#0088ff'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// POST /api/register
router.post('/register', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }

    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ success: false, error: 'Username must be 2-20 characters' });
    }

    if (password.length < 4) {
      return res.status(400).json({ success: false, error: 'Password must be at least 4 characters' });
    }

    // Check if user exists
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Username already taken' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const avatarColor = randomColor();

    const result = db.prepare(
      'INSERT INTO users (username, password_hash, avatar_color) VALUES (?, ?, ?)'
    ).run(username, hash, avatarColor);

    // Create initial streak record
    db.prepare(
      'INSERT INTO streaks (user_id, current_streak, longest_streak, total_checkins) VALUES (?, 0, 0, 0)'
    ).run(result.lastInsertRowid);

    const token = jwt.sign(
      { id: result.lastInsertRowid, username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, data: { token, username, avatar_color: avatarColor } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, data: { token, username: user.username, avatar_color: user.avatar_color } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
