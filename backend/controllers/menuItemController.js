const db = require('../config/db');

// GET /menu-items
exports.getAllItems = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM menu_item ORDER BY item_id');
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /menu-items/:id
exports.getItemById = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM menu_item WHERE item_id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// POST /menu-items  (login required)
exports.createItem = async (req, res, next) => {
  try {
    const { Item_Name, Category, Price } = req.body;
    if (!Item_Name || Price === undefined || isNaN(Number(Price))) {
      return res.status(400).json({ error: 'Item_Name and a numeric Price are required' });
    }
    const { rows } = await db.query(
      'INSERT INTO menu_item (item_name, category, price) VALUES ($1, $2, $3) RETURNING *',
      [Item_Name, Category, Price]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// PUT /menu-items/:id  (login required)
exports.updateItem = async (req, res, next) => {
  try {
    const { Item_Name, Category, Price } = req.body;
    const { rows } = await db.query(
      'UPDATE menu_item SET item_name = $1, category = $2, price = $3 WHERE item_id = $4 RETURNING *',
      [Item_Name, Category, Price, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// DELETE /menu-items/:id  (login required)
exports.deleteItem = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM menu_item WHERE item_id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'deleted' });
  } catch (err) { next(err); }
};
