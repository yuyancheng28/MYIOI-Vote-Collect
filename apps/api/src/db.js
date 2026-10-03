const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL || null;

// Helper abstraction exposing async get/all/run
let dbClient = null;
let isPostgres = false;

function normalizeSqlForSqlite(sql) {
  // replace $1, $2... with ? for better-sqlite3
  return sql.replace(/\$\d+/g, '?');
}

if (DATABASE_URL) {
  // Postgres
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false });
  isPostgres = true;

  dbClient = {
    async get(sql, params = []) {
      const res = await pool.query(sql, params);
      return res.rows[0] || null;
    },
    async all(sql, params = []) {
      const res = await pool.query(sql, params);
      return res.rows || [];
    },
    async run(sql, params = []) {
      const res = await pool.query(sql, params);
      return { rowCount: res.rowCount };
    },
    async query(sql, params = []) {
      return pool.query(sql, params);
    }
  };
} else {
  // SQLite (local dev)
  const Database = require('better-sqlite3');
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/vote.db');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma('foreign_keys = ON');

  // Run schema.sql once
  const schemaSql = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
  sqlite.exec(schemaSql);

  dbClient = {
    async get(sql, params = []) {
      const s = sqlite.prepare(normalizeSqlForSqlite(sql));
      return s.get(...params) || null;
    },
    async all(sql, params = []) {
      const s = sqlite.prepare(normalizeSqlForSqlite(sql));
      return s.all(...params) || [];
    },
    async run(sql, params = []) {
      const s = sqlite.prepare(normalizeSqlForSqlite(sql));
      const info = s.run(...params);
      return { lastInsertRowid: info.lastInsertRowid, changes: info.changes };
    },
    async query(sql, params = []) {
      const s = sqlite.prepare(normalizeSqlForSqlite(sql));
      return { rows: s.all(...params) };
    }
  };
}

async function seedDemoUsers() {
  const now = new Date().toISOString();
  const defaults = [
    { username: 'owner', password: 'password123', role: 'owner' },
    { username: 'admin', password: 'password123', role: 'admin' },
    { username: 'user', password: 'password123', role: 'user' }
  ];

  for (const u of defaults) {
    const existing = await dbClient.get('SELECT * FROM users WHERE username = $1', [u.username]);
    if (existing) continue;
    const password_hash = bcrypt.hashSync(u.password, 10);
    const id = require('crypto').randomUUID();
    await dbClient.run('INSERT INTO users (id, username, password_hash, role, created_at) VALUES ($1, $2, $3, $4, $5)', [id, u.username, password_hash, u.role, now]);
  }
}

// If using Postgres and schema not applied, do not auto-run migrations here; migrations are run via migrate script.
(async () => {
  if (!isPostgres) {
    try { await seedDemoUsers(); } catch (e) { console.error('Seed error', e); }
  }
})();

module.exports = { db: dbClient, isPostgres };
