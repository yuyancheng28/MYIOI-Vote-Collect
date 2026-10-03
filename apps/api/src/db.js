const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/vote.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
const schemaSql = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
db.exec(schemaSql);

function seedDemoUsers() {
  const defaultUsers = [
    { username: 'owner', password: 'password123', role: 'owner' },
    { username: 'admin', password: 'password123', role: 'admin' },
    { username: 'user', password: 'password123', role: 'user' }
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO users (id, username, password_hash, role, created_at)
    VALUES (@id, @username, @password_hash, @role, datetime('now'))
  `);

  for (const user of defaultUsers) {
    stmt.run({
      id: require('crypto').randomUUID(),
      username: user.username,
      password_hash: bcrypt.hashSync(user.password, 10),
      role: user.role
    });
  }
}

seedDemoUsers();

module.exports = db;
