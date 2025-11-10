// services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Para desarrollo en iOS simulador:
// const API_BASE_URL = 'http://localhost:3000/api';

// Para dispositivo físico (reemplaza con tu IP):
const API_BASE_URL = 'http://192.168.1.7:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de red
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error') {
      console.log('Error de red - Verifica:');
      console.log('1. Servidor backend ejecutándose');
      console.log('2. URL correcta:', API_BASE_URL);
      console.log('3. Permisos de internet configurados');
    }
    return Promise.reject(error);
  }
);

export const goalAPI = {
  createGoal: (goalData) => api.post('/goals', goalData),
  getGoals: (filters = {}) => api.get('/goals', { params: filters }),
  getGoal: (id) => api.get(`/goals/${id}`),
  updateGoal: (id, updateData) => api.put(`/goals/${id}`, updateData),
  updateProgress: (id, progress) => api.patch(`/goals/${id}/progress`, { progress }),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
  getStats: () => api.get('/goals/stats'),
};

export default api;