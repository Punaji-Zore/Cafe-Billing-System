// TODO: implement per API contract (see Cafe_Billing_System_Project_Plan.md, Section 3)
const pool = require('../config/db');

exports.placeholder = async (req, res, next) => {
  try {
    res.status(501).json({ error: 'employee endpoints not implemented yet' });
  } catch (err) {
    next(err);
  }
};
