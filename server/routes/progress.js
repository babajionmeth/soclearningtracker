const express = require('express');
const db = require('../db');
const roadmap = require('../data/roadmap');
const { authenticate } = require('../auth');

const router = express.Router();

// GET /api/roadmap — public, returns full roadmap structure
router.get('/roadmap', (req, res) => {
  res.json({ success: true, data: roadmap });
});

// GET /api/progress — returns roadmap merged with user's completion status
router.get('/progress', authenticate, (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT task_id, completed, completed_at, notes FROM progress WHERE user_id = ?'
    ).all(req.user.id);

    // Build a lookup map
    const completionMap = {};
    rows.forEach(r => {
      completionMap[r.task_id] = {
        completed: !!r.completed,
        completed_at: r.completed_at,
        notes: r.notes
      };
    });

    // Merge completion data into roadmap
    const merged = roadmap.map(phase => ({
      ...phase,
      tasks: phase.tasks.map(task => ({
        ...task,
        completed: completionMap[task.id]?.completed || false,
        completed_at: completionMap[task.id]?.completed_at || null,
        notes: completionMap[task.id]?.notes || ''
      }))
    }));

    // Calculate stats
    const totalTasks = roadmap.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = rows.filter(r => r.completed).length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      success: true,
      data: {
        phases: merged,
        stats: { total: totalTasks, completed: completedTasks, percentage }
      }
    });
  } catch (err) {
    console.error('Progress GET error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/progress — mark task done/undone
router.post('/progress', authenticate, (req, res) => {
  try {
    const { task_id, completed, notes } = req.body;

    if (!task_id) {
      return res.status(400).json({ success: false, error: 'task_id required' });
    }

    // Find the task in roadmap to get its phase
    let taskPhase = null;
    for (const phase of roadmap) {
      const found = phase.tasks.find(t => t.id === task_id);
      if (found) { taskPhase = found.phase; break; }
    }

    if (taskPhase === null) {
      return res.status(400).json({ success: false, error: 'Invalid task_id' });
    }

    const isCompleted = completed ? 1 : 0;
    const now = isCompleted ? new Date().toISOString() : null;

    // Upsert progress
    db.prepare(`
      INSERT INTO progress (user_id, phase, task_id, completed, completed_at, notes)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, task_id)
      DO UPDATE SET completed = excluded.completed, completed_at = excluded.completed_at, notes = COALESCE(excluded.notes, notes)
    `).run(req.user.id, taskPhase, task_id, isCompleted, now, notes || null);

    // Log activity
    if (isCompleted) {
      db.prepare(
        'INSERT INTO activity_log (user_id, action, detail) VALUES (?, ?, ?)'
      ).run(req.user.id, 'completed_task', JSON.stringify({ task_id, phase: taskPhase }));
    }

    res.json({ success: true, data: { task_id, completed: !!isCompleted } });
  } catch (err) {
    console.error('Progress POST error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
