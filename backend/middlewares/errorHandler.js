// Centralized error handler - keeps all API error responses in the
// {error: "message"} shape defined in the API contract.
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = errorHandler;
