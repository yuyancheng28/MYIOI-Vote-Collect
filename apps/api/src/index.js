const express = require('express');
require('dotenv').config();
const { db, isPostgres } = require('./db');
const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/polls');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);

app.listen(port, async () => {
  console.log(`API listening on http://localhost:${port}`);
  if (isPostgres) {
    console.log('Running Postgres migration automatically (DATABASE_URL detected)...');
    try {
      // run migrate script
      require('./migrate');
    } catch (e) {
      console.error('Migration failed on startup:', e.message || e);
    }
  }
});
