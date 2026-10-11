import axios from 'axios'; // plain axios on purpose: a wrong password must not trigger the auto-logout redirect

export const login = (Username, Password) =>
  axios.post('/api/auth/login', { Username, Password }).then((res) => res.data);
