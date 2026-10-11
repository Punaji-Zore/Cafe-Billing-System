import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const login = (Username, Password) =>
  axios.post(`${API_URL}/api/auth/login`, { Username, Password })
    .then((res) => res.data);