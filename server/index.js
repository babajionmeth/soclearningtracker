require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize database (runs migrations)
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/progress'));
app.use('/api', require('./routes/streaks'));
app.use('/api', require('./routes/leaderboard'));

// SPA fallback — serve index.html for non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`[SOC-TRACKER] Server running on http://localhost:${PORT}`);
});
