require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const users = [
  { username: 'rahul', password: 'test123' },
  { username: 'friend1', password: 'test123' }
];

const colors = ['#00ff88', '#00d4ff'];

console.log('[SEED] Creating test users...');

users.forEach((u, i) => {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(u.username);
  if (existing) {
    console.log(`  ⚡ User "${u.username}" already exists, skipping.`);
    return;
  }

  const hash = bcrypt.hashSync(u.password, 10);
  const result = db.prepare(
    'INSERT INTO users (username, password_hash, avatar_color) VALUES (?, ?, ?)'
  ).run(u.username, hash, colors[i]);

  // Create streak record
  db.prepare(
    'INSERT INTO streaks (user_id, current_streak, longest_streak, total_checkins) VALUES (?, 0, 0, 0)'
  ).run(result.lastInsertRowid);

  console.log(`  ✓ Created user "${u.username}" (id: ${result.lastInsertRowid})`);
});

console.log('[SEED] Done.');
