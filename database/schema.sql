PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS polls (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by TEXT,
  created_at TEXT,
  FOREIGN KEY(created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS poll_options (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT,
  FOREIGN KEY(poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  user_id TEXT,
  created_at TEXT,
  FOREIGN KEY(poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  FOREIGN KEY(option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_poll_user ON votes(poll_id, user_id) WHERE user_id IS NOT NULL;
