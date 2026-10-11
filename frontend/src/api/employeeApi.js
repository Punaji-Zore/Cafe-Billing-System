import client from './client';

export const getEmployees = () => client.get('/api/employees').then((r) => r.data);
