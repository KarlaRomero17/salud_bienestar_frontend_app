import axios from 'axios';

const API = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.9:5000/api',
  timeout: 10000,
});

// Puedes interceptar requests para agregar tokens JWT
API.interceptors.request.use(config => {
  // ejemplo: config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
