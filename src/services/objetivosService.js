// services/objetivosService.js
import axios from 'axios';
import { SERVER_URI } from '@env';

const API_BASE_URL = `${SERVER_URI}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export const objetivosService = {
  // Obtener todos los objetivos
  obtenerTodos: async (params = {}) => {
    try {
      const response = await api.get('/health-goals', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener los objetivos');
    }
  },

  // Obtener un objetivo por ID
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/health-goals/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener el objetivo');
    }
  },

  // Crear nuevo objetivo
  crear: async (objetivoData) => {
    try {
      const response = await api.post('/health-goals', objetivoData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al crear el objetivo');
    }
  },

  // Actualizar objetivo
  actualizar: async (id, objetivoData) => {
    try {
      const response = await api.put(`/health-goals/${id}`, objetivoData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar el objetivo');
    }
  },

  // Eliminar objetivo (lógico)
  eliminar: async (id) => {
    try {
      const response = await api.delete(`/health-goals/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar el objetivo');
    }
  },

  // Marcar como completado
  marcarCompletado: async (id) => {
    try {
      const response = await api.patch(`/health-goals/${id}/completar`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al marcar como completado');
    }
  },

  // Actualizar progreso
  actualizarProgreso: async (id, progreso) => {
    try {
      const response = await api.patch(`/health-goals/${id}/progreso`, {
        progress: progreso
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar el progreso');
    }
  },

  // Obtener objetivos próximos a vencer
  obtenerProximosVencer: async (dias = 7) => {
    try {
      const response = await api.get('/health-goals/proximos-vencer', {
        params: { dias }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener objetivos próximos');
    }
  },

  // Obtener objetivos vencidos
  obtenerVencidos: async () => {
    try {
      const response = await api.get('/health-goals/vencidos');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener objetivos vencidos');
    }
  },

  // Obtener estadísticas
  obtenerEstadisticas: async () => {
    try {
      const response = await api.get('/health-goals/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener estadísticas');
    }
  },

  // Buscar objetivos
  buscar: async (termino) => {
    try {
      const response = await api.get('/health-goals', {
        params: { busqueda: termino }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al buscar objetivos');
    }
  },
};

export default objetivosService;