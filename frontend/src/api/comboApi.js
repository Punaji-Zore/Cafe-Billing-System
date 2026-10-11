import client from './client';

const BASE = '/api/combos';

export const getCombos = () => client.get(BASE).then((r) => r.data);
export const createCombo = (combo) => client.post(BASE, combo).then((r) => r.data);
export const updateCombo = (id, combo) => client.put(`${BASE}/${id}`, combo).then((r) => r.data);
export const deleteCombo = (id) => client.delete(`${BASE}/${id}`).then((r) => r.data);
