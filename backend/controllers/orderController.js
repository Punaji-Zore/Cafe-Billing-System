const db = require('../config/db');

// POST /orders  body: {Customer_ID, Employee_ID, items:[{Item_ID, Quantity}], combo_id?}
exports.createOrder = async (req, res, next) => {
  const { Customer_ID, Employee_ID, items, combo_id } = req.body;

  if (!Employee_ID || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Employee_ID and a non-empty items array are required' });
  }
  for (const it of items) {
    if (!Number.isInteger(it.Quantity) || it.Quantity <= 0) {
      return res.status(400).json({ error: 'Every item needs a whole-number Quantity greater than 0' });
    }
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Current prices for all ordered items
    const itemIds = items.map((i) => Number(i.Item_ID));
    const { rows: menuRows } = await client.query(
      'SELECT item_id, price FROM menu_item WHERE item_id = ANY($1::int[])',
      [itemIds]
    );
    const priceMap = {};
    menuRows.forEach((r) => { priceMap[r.Item_ID] = r.Price; });

    for (const it of items) {
      if (priceMap[it.Item_ID] === undefined) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Item_ID ${it.Item_ID} does not exist` });
      }
    }

    // Optional combo discount: ordered items must match the combo's item list
    let discountPercent = 0;
    if (combo_id) {
      const { rows: comboRows } = await client.query(
        'SELECT discount_percent FROM combo WHERE combo_id = $1', [combo_id]
      );
      if (comboRows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'combo_id does not exist' });
      }
      const { rows: comboItemRows } = await client.query(
        'SELECT item_id FROM combo_items WHERE combo_id = $1', [combo_id]
      );
      const comboItemIds = comboItemRows.map((r) => r.Item_ID).sort((a, b) => a - b);
      const orderedItemIds = [...new Set(itemIds)].sort((a, b) => a - b);
      const matches = comboItemIds.length === orderedItemIds.length &&
        comboItemIds.every((id, idx) => id === orderedItemIds[idx]);
      if (!matches) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: "Ordered items do not match the combo's item list" });
      }
      discountPercent = comboRows[0].Discount_Percent;
    }

    const lineItems = items.map((it) => ({
      Item_ID: Number(it.Item_ID),
      Quantity: it.Quantity,
      Subtotal: Number((priceMap[it.Item_ID] * it.Quantity).toFixed(2))
    }));
    let total = lineItems.reduce((sum, li) => sum + li.Subtotal, 0);
    if (discountPercent > 0) total = Number((total * (1 - discountPercent / 100)).toFixed(2));

    // Parent row first (Order_Details is its weak entity)
    const { rows: orderRows } = await client.query(
      'INSERT INTO orders (customer_id, employee_id, total_amount) VALUES ($1, $2, $3) RETURNING order_id',
      [Customer_ID || null, Employee_ID, total]
    );
    const orderId = orderRows[0].Order_ID;

    // Weak entity: PK is (order_id, order_detail_id) -> per-order counter starting at 1
    await client.query(
      `INSERT INTO order_details (order_detail_id, order_id, item_id, quantity, subtotal)
       SELECT * FROM UNNEST($1::int[], $2::int[], $3::int[], $4::int[], $5::numeric[])`,
      [
        lineItems.map((_, idx) => idx + 1),
        lineItems.map(() => orderId),
        lineItems.map((li) => li.Item_ID),
        lineItems.map((li) => li.Quantity),
        lineItems.map((li) => li.Subtotal)
      ]
    );

    await client.query('COMMIT');
    res.status(201).json({
      Order_ID: orderId,
      Total_Amount: total,
      Order_Details: lineItems.map((li, idx) => ({ Order_Detail_ID: idx + 1, ...li }))
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally { client.release(); }
};

// GET /orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const { rows: orders } = await db.query('SELECT * FROM orders WHERE order_id = $1', [req.params.id]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });

    const { rows: details } = await db.query(
      `SELECT od.order_detail_id, od.item_id, mi.item_name, od.quantity, od.subtotal
       FROM order_details od JOIN menu_item mi ON mi.item_id = od.item_id
       WHERE od.order_id = $1 ORDER BY od.order_detail_id`,
      [req.params.id]
    );
    res.json({ ...orders[0], Order_Details: details });
  } catch (err) { next(err); }
};
