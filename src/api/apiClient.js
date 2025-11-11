import axios from 'axios';
import { SERVER_URI } from '@env';
const API = axios.create({
  baseURL: SERVER_URI || 'http://10.0.2.2:5000/api',
  timeout: 10000,
});

// Puedes interceptar requests para agregar tokens JWT
API.interceptors.request.use(config => {
  // ejemplo: config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
