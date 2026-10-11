import axios from 'axios';

// One axios instance for the whole app. It attaches the login token (if any)
// to every request, and logs the user out if the server says the token is bad.
const client = axios.create();

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
export const getEmployee = () => JSON.parse(localStorage.getItem('employee') || 'null');
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('employee');
};
// Turns an axios error into a readable message
export const errMsg = (err) => err.response?.data?.error || err.message;
