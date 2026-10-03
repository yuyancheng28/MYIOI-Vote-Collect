const express = require('express');
const { randomUUID } = require('crypto');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const polls = db.prepare(`
    SELECT p.*, COUNT(v.id) AS total_votes
    FROM polls p
    LEFT JOIN votes v ON v.poll_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all();

  return res.json({ polls });
});

router.post('/', requireAuth, requireRole('admin', 'owner'), (req, res) => {
  const { title, description, options } = req.body || {};

  if (!title || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ message: 'Title and at least 2 options are required.' });
  }

  const cleanedOptions = options.map((option) => String(option).trim()).filter(Boolean);

  if (cleanedOptions.length < 2) {
    return res.status(400).json({ message: 'Each option must contain a non-empty value.' });
  }

  const pollId = randomUUID();

  db.transaction(() => {
    db.prepare(`
      INSERT INTO polls (id, title, description, created_by, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(pollId, title, description || '', req.user.id);

    const insertOption = db.prepare(`
      INSERT INTO poll_options (id, poll_id, text, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `);

    for (const option of cleanedOptions) {
      insertOption.run(randomUUID(), pollId, option);
    }
  })();

  return res.status(201).json({ message: 'Poll created successfully', pollId });
});

router.get('/:id', requireAuth, (req, res) => {
  const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(req.params.id);
  if (!poll) {
    return res.status(404).json({ message: 'Poll not found' });
  }

  const options = db.prepare('SELECT * FROM poll_options WHERE poll_id = ? ORDER BY created_at').all(req.params.id);
  return res.json({ poll, options });
});

router.post('/:id/vote', requireAuth, (req, res) => {
  const pollId = req.params.id;
  const { optionId } = req.body || {};

  const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(pollId);
  if (!poll) {
    return res.status(404).json({ message: 'Poll not found' });
  }

  const option = db.prepare('SELECT * FROM poll_options WHERE id = ? AND poll_id = ?').get(optionId, pollId);
  if (!option) {
    return res.status(400).json({ message: 'Invalid option' });
  }

  const existingVote = db.prepare('SELECT * FROM votes WHERE poll_id = ? AND user_id = ?').get(pollId, req.user.id);
  if (existingVote) {
    return res.status(400).json({ message: 'You have already voted in this poll.' });
  }

  db.prepare(`
    INSERT INTO votes (id, poll_id, option_id, user_id, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(randomUUID(), pollId, optionId, req.user.id);

  return res.json({ message: 'Vote submitted successfully' });
});

router.get('/:id/results', requireAuth, requireRole('admin', 'owner'), (req, res) => {
  const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(req.params.id);
  if (!poll) {
    return res.status(404).json({ message: 'Poll not found' });
  }

  const resultRows = db.prepare(`
    SELECT o.id, o.text, COUNT(v.id) AS vote_count
    FROM poll_options o
    LEFT JOIN votes v ON v.option_id = o.id
    WHERE o.poll_id = ?
    GROUP BY o.id, o.text
    ORDER BY o.created_at ASC
  `).all(req.params.id);

  const totalVotes = resultRows.reduce((sum, row) => sum + Number(row.vote_count || 0), 0);

  return res.json({ poll, results: resultRows, totalVotes });
});

module.exports = router;
