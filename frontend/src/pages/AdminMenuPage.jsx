import { useEffect, useState } from 'react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../api/menuApi';
import { errMsg } from '../api/client';
import RequireLogin from '../components/RequireLogin.jsx';
import { emojiFor, money } from '../utils';

const emptyForm = { Item_Name: '', Category: '', Price: '' };
const CATEGORY_HINTS = ['Coffee', 'Bakery', 'Snacks', 'Beverage'];

function MenuAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => getMenuItems().then(setItems).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, Price: parseFloat(form.Price) };
      if (editingId) await updateMenuItem(editingId, payload);
      else await createMenuItem(payload);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const startEdit = (item) => {
    setEditingId(item.Item_ID);
    setForm({ Item_Name: item.Item_Name, Category: item.Category || '', Price: item.Price });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.Item_Name}"?`)) return;
    setError('');
    try {
      await deleteMenuItem(item.Item_ID);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="page">
      <div className="section-title">📋 {editingId ? 'Edit menu item' : 'Add menu item'}</div>
      <form className="card" onSubmit={handleSubmit}>
        <label>Item name
          <input name="Item_Name" value={form.Item_Name} onChange={handleChange} required />
        </label>
        <div className="row2">
          <label>Category
            <input name="Category" list="cats" value={form.Category} onChange={handleChange} />
            <datalist id="cats">{CATEGORY_HINTS.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
          <label>Price (₹)
            <input name="Price" type="number" step="0.01" min="0" value={form.Price} onChange={handleChange} required />
          </label>
        </div>
        <button className="btn-primary" type="submit">{editingId ? 'Update item' : '＋ Add item'}</button>
        {editingId && (
          <button className="btn-small" type="button" style={{ marginTop: 8 }}
            onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel edit</button>
        )}
        {error && <p className="error">{error}</p>}
      </form>

      <div className="section-title">All items ({items.length})</div>
      <div className="card">
        {items.length === 0 && <div className="empty">No items yet</div>}
        {items.map((item) => (
          <div className="admin-row" key={item.Item_ID}>
            <div>
              <div className="nm">{emojiFor(item.Category)} {item.Item_Name}</div>
              <div className="meta">{item.Category || 'No category'} · {money(item.Price)}</div>
            </div>
            <div className="actions">
              <button className="btn-small" onClick={() => startEdit(item)}>Edit</button>
              <button className="btn-danger" onClick={() => handleDelete(item)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminMenuPage() {
  return <RequireLogin title="📋 Menu Admin"><MenuAdmin /></RequireLogin>;
}
