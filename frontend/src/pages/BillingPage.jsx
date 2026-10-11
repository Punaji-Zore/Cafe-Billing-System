import { useEffect, useState } from 'react';
import { getMenuItems } from '../api/menuApi';
import { getCombos } from '../api/comboApi';
import { getEmployees } from '../api/employeeApi';
import { getCustomers, createCustomer } from '../api/customerApi';
import { createOrder } from '../api/orderApi';
import { createPayment } from '../api/paymentApi';
import { getEmployee, errMsg } from '../api/client';
import OrderCart from '../components/OrderCart.jsx';
import BillReceipt from '../components/BillReceipt.jsx';
import { emojiFor, money } from '../utils';

const GST_RATE = 0.05; // 5% GST recorded with each payment

export default function BillingPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [combos, setCombos] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [employeeId, setEmployeeId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [cart, setCart] = useState([]); // [{Item_ID, Item_Name, Price, Quantity}]
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [paymentMode, setPaymentMode] = useState('Cash');

  const [placedOrder, setPlacedOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null); // order saved but payment failed
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });

  useEffect(() => {
    Promise.all([getMenuItems(), getCombos(), getEmployees(), getCustomers()])
      .then(([m, c, e, cu]) => {
        setMenuItems(m);
        setCombos(c);
        setEmployees(e);
        setCustomers(cu);
        // If an employee is logged in, preselect them as the order taker
        const me = getEmployee();
        if (me && e.some((x) => x.Employee_ID === me.Employee_ID)) setEmployeeId(String(me.Employee_ID));
      })
      .catch((err) => setError(errMsg(err)));
  }, []);

  // ---- cart actions ----
  const addItem = (item) =>
    setCart((prev) => {
      const existing = prev.find((l) => l.Item_ID === item.Item_ID);
      if (existing) return prev.map((l) => (l.Item_ID === item.Item_ID ? { ...l, Quantity: l.Quantity + 1 } : l));
      return [...prev, { Item_ID: item.Item_ID, Item_Name: item.Item_Name, Price: item.Price, Quantity: 1 }];
    });

  const changeQty = (itemId, delta) =>
    setCart((prev) =>
      prev
        .map((l) => (l.Item_ID === itemId ? { ...l, Quantity: l.Quantity + delta } : l))
        .filter((l) => l.Quantity > 0)
    );

  const toggleCombo = (combo) => {
    if (selectedCombo === combo.Combo_ID) {
      setSelectedCombo(null); // keep the cart, just drop the combo
      return;
    }
    setSelectedCombo(combo.Combo_ID);
    setCart(
      combo.items.map((itemId) => {
        const m = menuItems.find((x) => x.Item_ID === itemId);
        return { Item_ID: itemId, Item_Name: m?.Item_Name || `Item ${itemId}`, Price: m?.Price || 0, Quantity: 1 };
      })
    );
  };

  // The combo discount applies only while the cart holds exactly the combo's items
  // (the backend enforces the same rule).
  const combo = combos.find((c) => c.Combo_ID === selectedCombo);
  const cartIds = [...new Set(cart.map((l) => l.Item_ID))].sort((a, b) => a - b);
  const comboIds = combo ? [...combo.items].sort((a, b) => a - b) : [];
  const comboActive = !!combo && cartIds.length === comboIds.length && cartIds.every((id, i) => id === comboIds[i]);
  const discount = comboActive ? combo.Discount_Percent : 0;

  const subtotal = cart.reduce((s, l) => s + l.Price * l.Quantity, 0);
  const total = subtotal * (1 - discount / 100);

  // ---- customers ----
  const addCustomer = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const c = await createCustomer({ Customer_Name: newCustomer.name, Phone_No: newCustomer.phone });
      setCustomers((prev) => [...prev, c]);
      setCustomerId(String(c.Customer_ID));
      setNewCustomer({ name: '', phone: '' });
      setShowNewCustomer(false);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  // ---- checkout ----
  const pay = async (order) => {
    try {
      const p = await createPayment({
        Order_ID: order.Order_ID,
        Payment_Mode: paymentMode,
        Amount: order.Total_Amount,
        GST: Number((order.Total_Amount * GST_RATE).toFixed(2))
      });
      setPayment(p);
      setPlacedOrder(order);
      setPendingOrder(null);
      setError('');
    } catch (err) {
      setPendingOrder(order);
      setError(`Order #${order.Order_ID} was saved, but the payment failed: ${errMsg(err)}`);
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    if (!employeeId) return setError('Select the employee taking this order.');
    if (cart.length === 0) return;
    setBusy(true);
    try {
      const order = await createOrder({
        Customer_ID: customerId ? Number(customerId) : null,
        Employee_ID: Number(employeeId),
        items: cart.map((l) => ({ Item_ID: l.Item_ID, Quantity: l.Quantity })),
        combo_id: comboActive ? selectedCombo : undefined
      });
      // The order response has Item_IDs only; attach names for the receipt
      order.Order_Details = order.Order_Details.map((d) => ({
        ...d,
        Item_Name: cart.find((l) => l.Item_ID === d.Item_ID)?.Item_Name
      }));
      await pay(order);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const retryPayment = async () => {
    setBusy(true);
    await pay(pendingOrder);
    setBusy(false);
  };

  const startNewOrder = () => {
    setCart([]);
    setSelectedCombo(null);
    setPlacedOrder(null);
    setPayment(null);
    setPendingOrder(null);
    setError('');
  };

  // ---- receipt screen ----
  if (placedOrder && payment) {
    return (
      <div className="page">
        <BillReceipt order={placedOrder} payment={payment} onNewOrder={startNewOrder} />
      </div>
    );
  }

  // ---- order saved but payment failed ----
  if (pendingOrder) {
    return (
      <div className="page">
        <div className="section-title">⚠️ Payment pending</div>
        <div className="card">
          <p style={{ marginTop: 0 }}>Order #{pendingOrder.Order_ID} · {money(pendingOrder.Total_Amount)}</p>
          <label>Payment mode
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
              <option>Cash</option><option>Card</option><option>UPI</option>
            </select>
          </label>
          <button className="btn-primary" onClick={retryPayment} disabled={busy}>Retry payment</button>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="section-title">👤 Order details</div>
      <div className="card">
        <div className="row2">
          <label>Employee
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.Employee_ID} value={emp.Employee_ID}>{emp.Employee_Name}</option>
              ))}
            </select>
          </label>
          <label>Customer (optional)
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Walk-in</option>
              {customers.map((c) => (
                <option key={c.Customer_ID} value={c.Customer_ID}>{c.Customer_Name}</option>
              ))}
            </select>
          </label>
        </div>
        {!showNewCustomer ? (
          <button className="btn-small" style={{ marginTop: 10 }} onClick={() => setShowNewCustomer(true)}>＋ New customer</button>
        ) : (
          <form onSubmit={addCustomer} style={{ marginTop: 10 }}>
            <div className="row2">
              <label>Name
                <input value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} required />
              </label>
              <label>Phone
                <input value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
              </label>
            </div>
            <div className="actions" style={{ marginTop: 8 }}>
              <button className="btn-small" type="submit">Save customer</button>
              <button className="btn-small" type="button" onClick={() => setShowNewCustomer(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="section-title">🎁 Combos</div>
      {combos.length === 0 && <div className="empty">No combos yet. An employee can add them in Combos.</div>}
      {combos.map((c) => (
        <button
          key={c.Combo_ID}
          className={`combo-card ${selectedCombo === c.Combo_ID ? 'active' : ''}`}
          onClick={() => toggleCombo(c)}
        >
          <span className="badge">-{c.Discount_Percent}%</span>
          <div className="nm">{c.Combo_Name}</div>
          <div className="sub">{c.items.map((id) => menuItems.find((m) => m.Item_ID === id)?.Item_Name).join(' + ')}</div>
        </button>
      ))}

      <div className="section-title">📋 Menu</div>
      {menuItems.length === 0 && <div className="empty">The menu is empty. An employee can add items in Menu.</div>}
      <div className="grid">
        {menuItems.map((m) => (
          <button key={m.Item_ID} className="item-tile" onClick={() => addItem(m)}>
            <div className="emoji">{emojiFor(m.Category)}</div>
            <div className="nm">{m.Item_Name}</div>
            <div className="pr">{money(m.Price)}</div>
          </button>
        ))}
      </div>

      <div className="section-title">🛒 Cart</div>
      <div className="card">
        <OrderCart cart={cart} onChangeQty={changeQty} />
        {cart.length > 0 && (
          <div className="total-line">
            <span>Total {discount > 0 && <span className="discount-note">(-{discount}% combo)</span>}</span>
            <span>{money(total)}</span>
          </div>
        )}
        {combo && !comboActive && cart.length > 0 && (
          <p className="hint">Combo discount applies only when the cart has exactly the combo's items.</p>
        )}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <label>Payment mode
          <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
            <option>Cash</option><option>Card</option><option>UPI</option>
          </select>
        </label>
        <button className="btn-primary" onClick={handlePlaceOrder} disabled={cart.length === 0 || busy}>
          {busy ? 'Processing…' : '💳 Place order & pay'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
