import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import { errMsg } from '../api/client';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('employee', JSON.stringify(data.employee));
      navigate('/admin/menu');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="page">
      <div className="section-title">🔐 Employee Login</div>
      <form className="card" onSubmit={handleSubmit}>
        <label>Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="btn-primary" type="submit">Log In</button>
        {error && <p className="error">{error}</p>}
        <p className="hint">Needed only to add, edit or delete menu items and combos. Billing works without logging in.</p>
      </form>
    </div>
  );
}
