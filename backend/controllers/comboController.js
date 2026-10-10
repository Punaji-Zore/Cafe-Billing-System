const db = require('../config/db');

// GET /combos -> [{..., items:[Item_ID,...]}]
exports.getAllCombos = async (req, res, next) => {
  try {
    const { rows: combos } = await db.query('SELECT * FROM combo ORDER BY combo_id');
    const { rows: links } = await db.query('SELECT combo_id, item_id FROM combo_items');
    res.json(combos.map((combo) => ({
      ...combo,
      items: links.filter((l) => l.Combo_ID === combo.Combo_ID).map((l) => l.Item_ID)
    })));
  } catch (err) { next(err); }
};

// GET /combos/:id -> {..., items:[{Item_ID, Item_Name}]}
exports.getComboById = async (req, res, next) => {
  try {
    const { rows: combos } = await db.query('SELECT * FROM combo WHERE combo_id = $1', [req.params.id]);
    if (combos.length === 0) return res.status(404).json({ error: 'Combo not found' });
    const { rows: items } = await db.query(
      `SELECT mi.item_id, mi.item_name
       FROM combo_items ci JOIN menu_item mi ON mi.item_id = ci.item_id
       WHERE ci.combo_id = $1`,
      [req.params.id]
    );
    res.json({ ...combos[0], items });
  } catch (err) { next(err); }
};

// POST /combos (login required)  body: {Combo_Name, Discount_Percent, Description, item_ids:[..]}
exports.createCombo = async (req, res, next) => {
  const { Combo_Name, Discount_Percent, Description, item_ids } = req.body;
  if (!Combo_Name || Discount_Percent === undefined || !Array.isArray(item_ids) || item_ids.length === 0) {
    return res.status(400).json({ error: 'Combo_Name, Discount_Percent and a non-empty item_ids array are required' });
  }
  const ids = [...new Set(item_ids.map(Number))];

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'INSERT INTO combo (combo_name, discount_percent, description) VALUES ($1, $2, $3) RETURNING *',
      [Combo_Name, Discount_Percent, Description]
    );
    const combo = rows[0];
    await client.query(
      'INSERT INTO combo_items (combo_id, item_id) SELECT $1::int, UNNEST($2::int[])',
      [combo.Combo_ID, ids]
    );
    await client.query('COMMIT');
    res.status(201).json({ ...combo, items: ids });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally { client.release(); }
};

// PUT /combos/:id (login required)
exports.updateCombo = async (req, res, next) => {
  const { Combo_Name, Discount_Percent, Description, item_ids } = req.body;
  if (!Array.isArray(item_ids) || item_ids.length === 0) {
    return res.status(400).json({ error: 'item_ids must be a non-empty array' });
  }
  const ids = [...new Set(item_ids.map(Number))];

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE combo SET combo_name = $1, discount_percent = $2, description = $3
       WHERE combo_id = $4 RETURNING *`,
      [Combo_Name, Discount_Percent, Description, req.params.id]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Combo not found' });
    }
    // Replace the item list
    await client.query('DELETE FROM combo_items WHERE combo_id = $1', [req.params.id]);
    await client.query(
      'INSERT INTO combo_items (combo_id, item_id) SELECT $1::int, UNNEST($2::int[])',
      [req.params.id, ids]
    );
    await client.query('COMMIT');
    res.json({ ...rows[0], items: ids });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally { client.release(); }
};

// DELETE /combos/:id (login required) - combo_items rows removed by ON DELETE CASCADE
exports.deleteCombo = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM combo WHERE combo_id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Combo not found' });
    res.json({ message: 'deleted' });
  } catch (err) { next(err); }
};
