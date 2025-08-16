import axios from 'axios';


const baseURL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'https://mini-auction-system-wze2.onrender.com';

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
