import { Link } from 'react-router-dom';
import { isLoggedIn } from '../api/client';

// Wrap a page in this to show it only to logged-in employees.
export default function RequireLogin({ title, children }) {
  if (isLoggedIn()) return children;
  return (
    <div className="page">
      <div className="section-title">{title}</div>
      <div className="card">
        <p style={{ marginTop: 0 }}>Only logged-in employees can change the menu and combos.</p>
        <Link to="/login"><button className="btn-primary" style={{ marginTop: 6 }}>Go to Login</button></Link>
      </div>
    </div>
  );
}
