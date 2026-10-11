import client from './client';

const BASE = '/api/menu-items';

export const getMenuItems = () => client.get(BASE).then((r) => r.data);
export const createMenuItem = (item) => client.post(BASE, item).then((r) => r.data);
export const updateMenuItem = (id, item) => client.put(`${BASE}/${id}`, item).then((r) => r.data);
export const deleteMenuItem = (id) => client.delete(`${BASE}/${id}`).then((r) => r.data);
