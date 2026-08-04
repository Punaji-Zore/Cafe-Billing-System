const pool = require('../config/db');

// GET /menu-items
exports.getAllItems = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Menu_Item');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /menu-items/:id
exports.getItemById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Menu_Item WHERE Item_ID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /menu-items
exports.createItem = async (req, res, next) => {
  try {
    const { Item_Name, Category, Price } = req.body;
    if (!Item_Name || Price === undefined) {
      return res.status(400).json({ error: 'Item_Name and Price are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO Menu_Item (Item_Name, Category, Price) VALUES (?, ?, ?)',
      [Item_Name, Category, Price]
    );
    res.status(201).json({ Item_ID: result.insertId, Item_Name, Category, Price });
  } catch (err) {
    next(err);
  }
};

// PUT /menu-items/:id
exports.updateItem = async (req, res, next) => {
  try {
    const { Item_Name, Category, Price } = req.body;
    const [result] = await pool.query(
      'UPDATE Menu_Item SET Item_Name = ?, Category = ?, Price = ? WHERE Item_ID = ?',
      [Item_Name, Category, Price, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ Item_ID: Number(req.params.id), Item_Name, Category, Price });
  } catch (err) {
    next(err);
  }
};

// DELETE /menu-items/:id
exports.deleteItem = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM Menu_Item WHERE Item_ID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'deleted' });
  } catch (err) {
    next(err);
  }
};
