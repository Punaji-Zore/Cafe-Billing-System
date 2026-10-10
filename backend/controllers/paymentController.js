const db = require('../config/db');

// POST /payments  body: {Order_ID, Payment_Mode, Amount, GST}
// The trigger trg_after_payment_insert logs this into order_log automatically.
exports.createPayment = async (req, res, next) => {
  try {
    const { Order_ID, Payment_Mode, Amount, GST } = req.body;
    if (!Order_ID || Amount === undefined) {
      return res.status(400).json({ error: 'Order_ID and Amount are required' });
    }
    const { rows: orderRows } = await db.query('SELECT order_id FROM orders WHERE order_id = $1', [Order_ID]);
    if (orderRows.length === 0) return res.status(400).json({ error: 'Order_ID does not exist' });

    const { rows } = await db.query(
      'INSERT INTO payment (order_id, payment_mode, amount, gst) VALUES ($1, $2, $3, $4) RETURNING *',
      [Order_ID, Payment_Mode, Amount, GST]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM payment WHERE payment_id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};
