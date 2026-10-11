import { money } from '../utils';

export default function OrderCart({ cart, onChangeQty }) {
  if (cart.length === 0) return <div className="empty">Tap items above to add them</div>;
  return (
    <div>
      {cart.map((line) => (
        <div className="cart-row" key={line.Item_ID}>
          <div>
            <div className="nm">{line.Item_Name}</div>
            <div className="qty">{money(line.Price)} each</div>
          </div>
          <div className="stepper">
            <button onClick={() => onChangeQty(line.Item_ID, -1)}>−</button>
            <b>{line.Quantity}</b>
            <button onClick={() => onChangeQty(line.Item_ID, 1)}>+</button>
          </div>
          <b>{money(line.Price * line.Quantity)}</b>
        </div>
      ))}
    </div>
  );
}
