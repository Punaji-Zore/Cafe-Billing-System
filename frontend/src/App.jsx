import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import BillingPage from './pages/BillingPage.jsx';
import AdminMenuPage from './pages/AdminMenuPage.jsx';
import AdminComboPage from './pages/AdminComboPage.jsx';
import SalesReportPage from './pages/SalesReportPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Billing</Link> | <Link to="/admin/menu">Menu Admin</Link> |{' '}
        <Link to="/admin/combos">Combo Admin</Link> | <Link to="/reports">Reports</Link>
      </nav>
      <Routes>
        <Route path="/" element={<BillingPage />} />
        <Route path="/admin/menu" element={<AdminMenuPage />} />
        <Route path="/admin/combos" element={<AdminComboPage />} />
        <Route path="/reports" element={<SalesReportPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
