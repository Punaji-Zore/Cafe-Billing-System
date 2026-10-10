// Keeps every API error in the {error: "message"} shape from the contract.
function errorHandler(err, req, res, next) {
  console.error(err);

  // Friendly messages for common Postgres errors
  if (err.code === '23503') {
    return res.status(409).json({ error: 'Operation blocked: this record is referenced by other records (or the referenced record does not exist)' });
  }
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate value: that record already exists' });
  }
  if (err.code === '22P02') {
    return res.status(400).json({ error: 'Invalid value in request (e.g. a non-numeric id)' });
  }
  if (err.code === '23514') {
    return res.status(400).json({ error: 'Value rejected by a database check (e.g. negative price or discount outside 0-100)' });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = errorHandler;
