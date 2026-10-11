import client from './client';

// The backend applies the date filter only when BOTH dates are given
export const getSalesReport = (from, to) => {
  const params = from && to ? { from, to } : {};
  return client.get('/api/reports/sales', { params }).then((r) => r.data);
};
