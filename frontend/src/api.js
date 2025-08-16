import axios from 'axios';

// --- THIS IS THE DYNAMIC LOGIC ---
// It checks if the app is running on localhost. If not, it uses your live Render URL.
const baseURL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : 'https://mini-auction-system-wze2.onrender.com'; // <-- IMPORTANT: REPLACE THIS

const api = axios.create({
  baseURL: baseURL,
});
// ------------------------------------

// The interceptor to add the token remains the same
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