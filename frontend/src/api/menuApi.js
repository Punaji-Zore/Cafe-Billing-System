import axios from 'axios';

const BASE = '/api/menu-items';

export const getMenuItems = () => axios.get(BASE).then((res) => res.data);
export const getMenuItem = (id) => axios.get(`${BASE}/${id}`).then((res) => res.data);
export const createMenuItem = (item) => axios.post(BASE, item).then((res) => res.data);
export const updateMenuItem = (id, item) => axios.put(`${BASE}/${id}`, item).then((res) => res.data);
export const deleteMenuItem = (id) => axios.delete(`${BASE}/${id}`).then((res) => res.data);
