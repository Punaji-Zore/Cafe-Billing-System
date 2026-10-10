const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Never return password_hash to the client
const SAFE_COLUMNS = 'employee_id, employee_name, role, contact_no, username';

exports.getAllEmployees = async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT ${SAFE_COLUMNS} FROM employee ORDER BY employee_id`);
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getEmployeeById = async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT ${SAFE_COLUMNS} FROM employee WHERE employee_id = $1`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// POST /employees  body: {Employee_Name, Role, Contact_No, Username?, Password?}
exports.createEmployee = async (req, res, next) => {
  try {
    const { Employee_Name, Role, Contact_No, Username, Password } = req.body;
    if (!Employee_Name) return res.status(400).json({ error: 'Employee_Name is required' });

    const passwordHash = Password ? await bcrypt.hash(Password, 10) : null;
    const { rows } = await db.query(
      `INSERT INTO employee (employee_name, role, contact_no, username, password_hash)
       VALUES ($1, $2, $3, $4, $5) RETURNING ${SAFE_COLUMNS}`,
      [Employee_Name, Role, Contact_No, Username || null, passwordHash]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const { Employee_Name, Role, Contact_No } = req.body;
    const { rows } = await db.query(
      `UPDATE employee SET employee_name = $1, role = $2, contact_no = $3
       WHERE employee_id = $4 RETURNING ${SAFE_COLUMNS}`,
      [Employee_Name, Role, Contact_No, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM employee WHERE employee_id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'deleted' });
  } catch (err) { next(err); }
};
