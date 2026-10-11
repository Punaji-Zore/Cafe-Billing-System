
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// POST /auth/login body: { Username, Password }

exports.login = async (req, res, next) => {
  try {
    const { Username, Password } = req.body;

    if (!Username || !Password) {
      return res.status(400).json({
        error: 'Username and Password are required'
      });
    }

    const { rows } = await db.query(
      `SELECT employee_id, employee_name, role, password_hash
       FROM employee
       WHERE LOWER(TRIM(username)) = LOWER(TRIM($1))`,
      [Username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid username or password'
      });
    }

    const employee = rows[0];

    const valid = await bcrypt.compare(
      Password,
      employee.Password_Hash || ''
    );

    if (!valid) {
      return res.status(401).json({
        error: 'Invalid username or password'
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      {
        Employee_ID: employee.Employee_ID,
        Role: employee.Role
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      employee: {
        Employee_ID: employee.Employee_ID,
        Employee_Name: employee.Employee_Name,
        Role: employee.Role
      }
    });
  } catch (err) {
    next(err);
  }
};

