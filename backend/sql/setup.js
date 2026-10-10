// One command to prepare the database:  npm run setup-db
// Creates the database if missing, creates tables + trigger, and loads
// sample data (only when the menu is empty). Safe to run again.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
const base = { host: DB_HOST, port: DB_PORT || 5432, user: DB_USER, password: DB_PASSWORD };
const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');

(async () => {
  if (!/^[A-Za-z0-9_]+$/.test(DB_NAME || '')) {
    throw new Error('DB_NAME in .env must contain only letters, numbers and underscores');
  }

  const admin = new Client({ ...base, database: 'postgres' });
  await admin.connect();
  const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);
  if (exists.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${DB_NAME}"`);
    console.log(`Created database ${DB_NAME}`);
  }
  await admin.end();

  const client = new Client({ ...base, database: DB_NAME });
  await client.connect();
  await client.query(read('schema.sql'));
  await client.query(read('triggers.sql'));
  console.log('Tables and trigger are ready');

  const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM menu_item');
  if (rows[0].n === 0) {
    await client.query(read('seed.sql'));
    console.log('Loaded sample data');
  } else {
    console.log('Menu already has data - skipped sample data');
  }
  await client.end();
})().catch((err) => { console.error('Setup failed:', err.message); process.exit(1); });
