import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import BillingPage from './pages/BillingPage.jsx';
import AdminMenuPage from './pages/AdminMenuPage.jsx';
import AdminComboPage from './pages/AdminComboPage.jsx';
import SalesReportPage from './pages/SalesReportPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { isLoggedIn, getEmployee, logout } from './api/client';

function Layout() {
  useLocation(); // re-render on every page change so the login state shown below stays fresh
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const employee = getEmployee();

  const tab = (to, icon, label, end) => (
    <NavLink to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
      <span className="ic">{icon}</span>{label}
    </NavLink>
  );

  return (
    <>
      <header className="top">
        <h1>☕ Cafe Billing System</h1>
        <p>
          {loggedIn
            ? `Signed in as ${employee?.Employee_Name} (${employee?.Role})`
            : 'Billing is open. Menu & Combo admin need an employee login.'}
        </p>
      </header>

      <Routes>
        <Route path="/" element={<BillingPage />} />
        <Route path="/admin/menu" element={<AdminMenuPage />} />
        <Route path="/admin/combos" element={<AdminComboPage />} />
        <Route path="/reports" element={<SalesReportPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>

      <nav className="bottom">
        {tab('/', '🧾', 'Billing', true)}
        {tab('/admin/menu', '📋', 'Menu')}
        {tab('/admin/combos', '🎁', 'Combos')}
        {tab('/reports', '📊', 'Reports')}
        {loggedIn ? (
          <button onClick={() => { logout(); navigate('/'); }}>
            <span className="ic">🔓</span>Logout
          </button>
        ) : (
          tab('/login', '🔐', 'Login')
        )}
      </nav>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
