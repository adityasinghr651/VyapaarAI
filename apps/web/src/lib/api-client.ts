import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to format errors and handle session expiration
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const responseData = error.response?.data;
    const fallbackMessage = 'An unexpected network error occurred';
    
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject({
      success: false,
      message: responseData?.message || error.message || fallbackMessage,
      errors: responseData?.errors || [],
    });
  },
);

export default api;
