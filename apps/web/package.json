require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/polls');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MYIOI Vote Collect API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
