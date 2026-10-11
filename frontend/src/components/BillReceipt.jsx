import { money } from '../utils';

export default function BillReceipt({ order, payment, onNewOrder }) {
  return (
    <div className="receipt">
      <h3 style={{ fontSize: 17 }}>🧾 Order #{order.Order_ID} paid</h3>
      {order.Order_Details.map((d) => (
        <div className="cart-row" key={d.Order_Detail_ID}>
          <span>{d.Item_Name || `Item ${d.Item_ID}`} × {d.Quantity}</span>
          <b>{money(d.Subtotal)}</b>
        </div>
      ))}
      <div className="total-line">
        <span>Total ({payment.Payment_Mode})</span>
        <span>{money(payment.Amount)}</span>
      </div>
      <p className="hint">GST recorded: {money(payment.GST)}</p>
      <button className="btn-primary" onClick={onNewOrder}>Start New Order</button>
    </div>
  );
}
