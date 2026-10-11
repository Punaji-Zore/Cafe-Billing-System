import { useEffect, useState } from 'react';
import { getCombos, createCombo, updateCombo, deleteCombo } from '../api/comboApi';
import { getMenuItems } from '../api/menuApi';
import { errMsg } from '../api/client';
import RequireLogin from '../components/RequireLogin.jsx';

const emptyForm = { Combo_Name: '', Discount_Percent: '', Description: '', item_ids: [] };

function ComboAdmin() {
  const [combos, setCombos] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    getCombos().then(setCombos).catch((e) => setError(errMsg(e)));
    getMenuItems().then(setMenuItems).catch((e) => setError(errMsg(e)));
  };
  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleItem = (id) =>
    setForm((f) => ({
      ...f,
      item_ids: f.item_ids.includes(id) ? f.item_ids.filter((x) => x !== id) : [...f.item_ids, id]
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.item_ids.length === 0) return setError('Pick at least one item for the combo.');
    try {
      const payload = { ...form, Discount_Percent: parseFloat(form.Discount_Percent) };
      if (editingId) await updateCombo(editingId, payload);
      else await createCombo(payload);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const startEdit = (combo) => {
    setEditingId(combo.Combo_ID);
    setForm({
      Combo_Name: combo.Combo_Name,
      Discount_Percent: combo.Discount_Percent,
      Description: combo.Description || '',
      item_ids: combo.items
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (combo) => {
    if (!confirm(`Delete combo "${combo.Combo_Name}"?`)) return;
    setError('');
    try {
      await deleteCombo(combo.Combo_ID);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const itemName = (id) => menuItems.find((m) => m.Item_ID === id)?.Item_Name || `#${id}`;

  return (
    <div className="page">
      <div className="section-title">🎁 {editingId ? 'Edit combo' : 'Add combo'}</div>
      <form className="card" onSubmit={handleSubmit}>
        <label>Combo name
          <input name="Combo_Name" value={form.Combo_Name} onChange={handleChange} required />
        </label>
        <div className="row2">
          <label>Discount %
            <input name="Discount_Percent" type="number" step="0.01" min="0" max="100"
              value={form.Discount_Percent} onChange={handleChange} required />
          </label>
          <label>Description (optional)
            <input name="Description" value={form.Description} onChange={handleChange} />
          </label>
        </div>
        <label>Items in this combo</label>
        <div>
          {menuItems.map((m) => (
            <label className="chip" key={m.Item_ID}>
              <input type="checkbox" checked={form.item_ids.includes(m.Item_ID)} onChange={() => toggleItem(m.Item_ID)} />
              {m.Item_Name}
            </label>
          ))}
        </div>
        <button className="btn-primary" type="submit">{editingId ? 'Update combo' : '＋ Add combo'}</button>
        {editingId && (
          <button className="btn-small" type="button" style={{ marginTop: 8 }}
            onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel edit</button>
        )}
        {error && <p className="error">{error}</p>}
      </form>

      <div className="section-title">All combos ({combos.length})</div>
      <div className="card">
        {combos.length === 0 && <div className="empty">No combos yet</div>}
        {combos.map((c) => (
          <div className="admin-row" key={c.Combo_ID}>
            <div>
              <div className="nm">{c.Combo_Name} · {c.Discount_Percent}% off</div>
              <div className="meta">{c.items.map(itemName).join(' + ')}</div>
            </div>
            <div className="actions">
              <button className="btn-small" onClick={() => startEdit(c)}>Edit</button>
              <button className="btn-danger" onClick={() => handleDelete(c)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminComboPage() {
  return <RequireLogin title="🎁 Combo Admin"><ComboAdmin /></RequireLogin>;
}
