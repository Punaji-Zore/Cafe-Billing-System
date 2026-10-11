
import axios from 'axios';

// Send all API requests to the deployed Render backend.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Attach the login token to every request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired or invalid login tokens.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('token')) {
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;

export const isLoggedIn = () => !!localStorage.getItem('token');

export const getEmployee = () =>
  JSON.parse(localStorage.getItem('employee') || 'null');

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('employee');
};

// Turn an Axios error into a readable message.
// Turn an Axios error into a readable string.
export const errMsg = (err) => {
  const data = err.response?.data;
  const message = data?.error ?? data?.message;

  if (typeof message === 'string') return message;

  if (message && typeof message.message === 'string') {
    return message.message;
  }

  return err.message || 'Something went wrong.';
};
