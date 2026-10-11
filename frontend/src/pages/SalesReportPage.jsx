import { useEffect, useState } from 'react';
import { getSalesReport } from '../api/reportApi';
import { errMsg } from '../api/client';
import { money } from '../utils';

export default function SalesReportPage() {
  const [report, setReport] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    getSalesReport(from, to).then(setReport).catch((e) => setError(errMsg(e)));
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="page">
      <div className="section-title">📊 Sales report</div>
      <form className="card" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <div className="row2">
          <label>From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label>To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        </div>
        <button className="btn-primary" type="submit">Apply</button>
        <p className="hint">Pick both dates to filter. Leave them empty for all-time totals. Sales count paid orders only.</p>
      </form>
      {error && <p className="error">{error}</p>}

      {report && (
        <>
          <div className="stat-grid">
            <div className="stat-card"><div className="v">{report.total_orders}</div><div className="l">Orders</div></div>
            <div className="stat-card"><div className="v">{money(report.total_sales)}</div><div className="l">Sales</div></div>
          </div>

          <div className="section-title">🏆 Top items</div>
          <div className="card">
            {report.top_items.length === 0 && <div className="empty">No orders in this period</div>}
            {report.top_items.map((item, i) => (
              <div className="admin-row" key={item.Item_ID}>
                <div className="nm">{['🥇', '🥈', '🥉', '4.', '5.'][i]} {item.Item_Name}</div>
                <div style={{ textAlign: 'right' }}>
                  <b>{item.total_quantity} sold</b>
                  <div className="meta">{money(item.total_revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
