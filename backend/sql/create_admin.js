// Creates (or resets) a login:   npm run seed-admin
// Custom:                        node sql/create_admin.js myuser mypassword
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const username = process.argv[2] || 'admin';
const password = process.argv[3] || 'admin123';

const pool = new Pool({
  host: process.env.DB_HOST, port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
});

(async () => {
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO employee (employee_name, role, username, password_hash)
     VALUES ('Admin Manager', 'Manager', $1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [username, hash]
  );
  console.log(`Login ready -> username: ${username}  password: ${password}`);
  await pool.end();
})().catch((err) => { console.error('Failed:', err.message); process.exit(1); });
