// src/services/api.ts (sketch)
import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// attach token
api.interceptors.request.use((config) => {
  const t = getToken();
  if (t && config && config.headers) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

export default api;
