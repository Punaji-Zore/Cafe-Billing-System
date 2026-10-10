const db = require('../config/db');

// GET /reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD
exports.getSalesReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const hasRange = from && to;
    // "to" date is inclusive (whole day)
    const where = hasRange ? 'WHERE o.order_date >= $1::date AND o.order_date < ($2::date + 1)' : '';
    const params = hasRange ? [from, to] : [];

    const { rows: totalRows } = await db.query(
      `SELECT COUNT(DISTINCT o.order_id) AS total_orders, COALESCE(SUM(p.amount), 0) AS total_sales
       FROM orders o LEFT JOIN payment p ON p.order_id = o.order_id
       ${where}`,
      params
    );

    const { rows: topItems } = await db.query(
      `SELECT mi.item_id, mi.item_name, SUM(od.quantity) AS total_quantity, SUM(od.subtotal) AS total_revenue
       FROM order_details od
       JOIN menu_item mi ON mi.item_id = od.item_id
       JOIN orders o ON o.order_id = od.order_id
       ${where}
       GROUP BY mi.item_id, mi.item_name
       ORDER BY total_quantity DESC
       LIMIT 5`,
      params
    );

    res.json({
      total_sales: totalRows[0].total_sales,
      total_orders: totalRows[0].total_orders,
      top_items: topItems
    });
  } catch (err) { next(err); }
};
