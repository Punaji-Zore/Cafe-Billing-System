import client from './client';

export const createOrder = (order) => client.post('/api/orders', order).then((r) => r.data);
export const getOrder = (id) => client.get(`/api/orders/${id}`).then((r) => r.data);
