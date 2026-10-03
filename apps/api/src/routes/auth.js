const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { randomUUID } = require('crypto');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });

    const existing = await db.get('SELECT * FROM users WHERE username = $1', [username]);
    if (existing) return res.status(409).json({ message: 'Username already exists' });

    const id = randomUUID();
    const passwordHash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();
    const finalRole = role || 'user';

    await db.run('INSERT INTO users (id, username, password_hash, role, created_at) VALUES ($1,$2,$3,$4,$5)', [id, username, passwordHash, finalRole, now]);

    const token = jwt.sign({ id, username, role: finalRole }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    return res.status(201).json({ token, user: { id, username, role: finalRole } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });

    const user = await db.get('SELECT * FROM users WHERE username = $1', [username]);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    return res.json({ user: payload });
  } catch (err) {
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
  if (!code) return res.status(400).json({ message: 'Missing GitHub code.' });
  return res.json({ message: 'GitHub OAuth callback received. Connect a real GitHub OAuth application to finish the flow.', code });
});

module.exports = router;
