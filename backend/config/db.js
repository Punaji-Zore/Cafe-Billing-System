const { Pool, types } = require('pg');
require('dotenv').config();

// Postgres returns NUMERIC and COUNT/SUM(bigint) as strings by default.
// Convert them to real numbers so the API returns numbers, like before.
types.setTypeParser(1700, (v) => parseFloat(v)); // NUMERIC
types.setTypeParser(20, (v) => parseInt(v, 10)); // BIGINT (COUNT)


const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      }
);


// Postgres folds unquoted column names to lowercase (item_id). Our API
// contract uses Item_ID, Item_Name, ... so map every column back to it.
const CONTRACT_COLUMNS = [
  'Customer_ID', 'Customer_Name', 'Phone_No',
  'Employee_ID', 'Employee_Name', 'Role', 'Contact_No', 'Username', 'Password_Hash',
  'Item_ID', 'Item_Name', 'Category', 'Price',
  'Combo_ID', 'Combo_Name', 'Discount_Percent', 'Description',
  'Order_ID', 'Order_Date', 'Total_Amount',
  'Order_Detail_ID', 'Quantity', 'Subtotal',
  'Payment_ID', 'Payment_Mode', 'Payment_Date', 'Amount', 'GST',
  'Log_ID', 'Action', 'Action_Date'
];
const CANON = {};
CONTRACT_COLUMNS.forEach((c) => { CANON[c.toLowerCase()] = c; });

const fixRow = (row) => {
  const out = {};
  for (const key of Object.keys(row)) out[CANON[key] || key] = row[key];
  return out;
};

const wrap = (run) => async (text, params) => {
  const result = await run(text, params);
  result.rows = result.rows.map(fixRow);
  return result;
};

module.exports = {
  query: wrap((text, params) => pool.query(text, params)),
  // For transactions: const client = await db.getClient(); ... client.release();
  async getClient() {
    const client = await pool.connect();
    return { query: wrap((text, params) => client.query(text, params)), release: () => client.release() };
  }
};
