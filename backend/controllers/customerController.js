const db = require('../config/db');

exports.getAllCustomers = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM customer ORDER BY customer_id');
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM customer WHERE customer_id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const { Customer_Name, Phone_No } = req.body;
    if (!Customer_Name) return res.status(400).json({ error: 'Customer_Name is required' });
    const { rows } = await db.query(
      'INSERT INTO customer (customer_name, phone_no) VALUES ($1, $2) RETURNING *',
      [Customer_Name, Phone_No]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const { Customer_Name, Phone_No } = req.body;
    const { rows } = await db.query(
      'UPDATE customer SET customer_name = $1, phone_no = $2 WHERE customer_id = $3 RETURNING *',
      [Customer_Name, Phone_No, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM customer WHERE customer_id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'deleted' });
  } catch (err) { next(err); }
};
