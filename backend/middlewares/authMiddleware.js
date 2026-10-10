const jwt = require('jsonwebtoken');

// Protects a route: requires a valid "Authorization: Bearer <token>" header.
// Used only on POST/PUT/DELETE for /menu-items and /combos - GET stays public.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Login required' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.employee = payload; // { Employee_ID, Role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session, please log in again' });
  }
}

module.exports = requireAuth;
