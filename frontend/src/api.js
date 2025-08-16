import axios from 'axios';

// Detect environment: use localhost for development, Render URL for production
const baseURL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : 'https://mini-auction-system-wze2.onrender.com/api'; // ✅ replace with your actual backend URL

const api = axios.create({
  baseURL,
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
