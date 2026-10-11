import client from './client';

export const getCustomers = () => client.get('/api/customers').then((r) => r.data);
export const createCustomer = (customer) => client.post('/api/customers', customer).then((r) => r.data);
