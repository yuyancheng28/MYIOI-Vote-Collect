const express = require('express');
const { randomUUID } = require('crypto');
const { db } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const polls = await db.all(`
      SELECT p.*, COUNT(v.id) AS total_votes
      FROM polls p
      LEFT JOIN votes v ON v.poll_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    return res.json({ polls });
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error' }); }
});

router.post('/', requireAuth, requireRole('admin', 'owner'), async (req, res) => {
  try {
    const { title, description, options } = req.body || {};
    if (!title || !Array.isArray(options) || options.length < 2) return res.status(400).json({ message: 'Title and at least 2 options are required.' });
    const cleanedOptions = options.map((o) => String(o).trim()).filter(Boolean);
    if (cleanedOptions.length < 2) return res.status(400).json({ message: 'Each option must contain a non-empty value.' });

    const pollId = randomUUID();
    const now = new Date().toISOString();
    await db.run('INSERT INTO polls (id, title, description, created_by, created_at) VALUES ($1,$2,$3,$4,$5)', [pollId, title, description || '', req.user.id, now]);

    for (const opt of cleanedOptions) {
      await db.run('INSERT INTO poll_options (id, poll_id, text, created_at) VALUES ($1,$2,$3,$4)', [randomUUID(), pollId, opt, now]);
    }

    return res.status(201).json({ message: 'Poll created successfully', pollId });
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error' }); }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const poll = await db.get('SELECT * FROM polls WHERE id = $1', [req.params.id]);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    const options = await db.all('SELECT * FROM poll_options WHERE poll_id = $1 ORDER BY created_at', [req.params.id]);
    return res.json({ poll, options });
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error' }); }
});

router.post('/:id/vote', requireAuth, async (req, res) => {
  try {
    const pollId = req.params.id;
    const { optionId } = req.body || {};
    const poll = await db.get('SELECT * FROM polls WHERE id = $1', [pollId]);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    const option = await db.get('SELECT * FROM poll_options WHERE id = $1 AND poll_id = $2', [optionId, pollId]);
    if (!option) return res.status(400).json({ message: 'Invalid option' });

    const existingVote = await db.get('SELECT * FROM votes WHERE poll_id = $1 AND user_id = $2', [pollId, req.user.id]);
    if (existingVote) return res.status(400).json({ message: 'You have already voted in this poll.' });

    await db.run('INSERT INTO votes (id, poll_id, option_id, user_id, created_at) VALUES ($1,$2,$3,$4,$5)', [randomUUID(), pollId, optionId, req.user.id, new Date().toISOString()]);
    return res.json({ message: 'Vote submitted successfully' });
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error' }); }
});

router.get('/:id/results', requireAuth, requireRole('admin', 'owner'), async (req, res) => {
  try {
    const poll = await db.get('SELECT * FROM polls WHERE id = $1', [req.params.id]);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    const rows = await db.all(`
      SELECT o.id, o.text, COUNT(v.id) AS vote_count
      FROM poll_options o
      LEFT JOIN votes v ON v.option_id = o.id
      WHERE o.poll_id = $1
      GROUP BY o.id, o.text
      ORDER BY o.created_at ASC
    `, [req.params.id]);

    const totalVotes = rows.reduce((sum, row) => sum + Number(row.vote_count || 0), 0);
    return res.json({ poll, results: rows, totalVotes });
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
