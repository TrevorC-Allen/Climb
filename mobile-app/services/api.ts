import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = globalThis?.localStorage?.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
