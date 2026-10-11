import client from './client';

export const createPayment = (payment) => client.post('/api/payments', payment).then((r) => r.data);
