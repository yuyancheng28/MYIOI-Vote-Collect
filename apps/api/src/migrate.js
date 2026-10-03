const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set. Skipping Postgres migration.');
  process.exit(1);
}

const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: DATABASE_URL, ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false });
  await client.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../../database/schema_postgres.sql'), 'utf8');
    console.log('Running Postgres migrations...');
    await client.query(sql);
    console.log('Migrations applied.');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
