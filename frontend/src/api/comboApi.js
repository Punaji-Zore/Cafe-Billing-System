import axios from 'axios';

const BASE = '/api/combos';

export const getCombos = () => axios.get(BASE).then((res) => res.data);
export const getCombo = (id) => axios.get(`${BASE}/${id}`).then((res) => res.data);
export const createCombo = (combo) => axios.post(BASE, combo).then((res) => res.data);
export const updateCombo = (id, combo) => axios.put(`${BASE}/${id}`, combo).then((res) => res.data);
export const deleteCombo = (id) => axios.delete(`${BASE}/${id}`).then((res) => res.data);
