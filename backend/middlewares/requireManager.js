
const requireManager = (req, res, next) => {
  if (!req.employee) {
    return res.status(401).json({
      error: 'Login required'
    });
  }

  const role = String(req.employee.Role || '').trim().toLowerCase();

  if (role !== 'manager') {
    return res.status(403).json({
      error: 'Manager access required'
    });
  }

  next();
};

module.exports = requireManager;
