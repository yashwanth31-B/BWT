import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Request Interceptor: Attach JWT Bearer Token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors like token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend reports token expired or unauthorized
    if (error.response && error.response.status === 401) {
      const isAuthRoute = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthRoute) {
        // Expired or invalid token for protected routes
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

// Helper to extract user-friendly error messages
export const getErrorMessage = (error, defaultMsg = 'An unexpected error occurred') => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.join(', ');
  }
  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    return 'Backend server is not reachable. Ensure the Node.js server is running on port 5000.';
  }
  return error.message || defaultMsg;
};

// Check if backend API is online
export const checkHealth = async () => {
  try {
    const res = await api.get('/health');
    return res.data?.status === 'online';
  } catch {
    return false;
  }
};

export default api;
