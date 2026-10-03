const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { randomUUID } = require('crypto');

const router = express.Router();

router.post('/register', (req, res) => {
  const { username, password, role } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const existing = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  const id = randomUUID();
  const finalRole = role || 'user';
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (id, username, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(id, username, passwordHash, finalRole);

  const token = jwt.sign(
    { id, username, role: finalRole },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    token,
    user: { id, username, role: finalRole }
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role }
  });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    return res.json({ user: payload });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

router.get('/github-url', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID || 'demo_client_id';
  const redirectUri = encodeURIComponent(process.env.GITHUB_REDIRECT_URI || 'http://localhost:4000/api/auth/github/callback');
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user,user:email`;
  return res.json({ url });
});

router.get('/github/callback', (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ message: 'Missing GitHub code.' });
  }

  return res.json({
    message: 'GitHub OAuth callback received. Connect a real GitHub OAuth application to finish the flow.',
    code
  });
});

module.exports = router;
