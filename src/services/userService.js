// services/userService.js
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

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export const userService = {
  // Crear usuario (para registro inicial)
  crearUsuario: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al crear el usuario');
    }
  },

  // Obtener perfil del usuario
  obtenerPerfil: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener el perfil');
    }
  },

  // Actualizar perfil del usuario
  actualizarPerfil: async (userId, profileData) => {
    try {
      const response = await api.put(`/users/${userId}`, profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar el perfil');
    }
  },

  // Registrar nuevo peso
  registrarPeso: async (userId, pesoData) => {
    try {
      const response = await api.post(`/users/${userId}/peso`, pesoData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al registrar el peso');
    }
  },

  // Obtener historial de peso
  obtenerHistorialPeso: async (userId, params = {}) => {
    try {
      const response = await api.get(`/users/${userId}/historial-peso`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener el historial');
    }
  },

  // Obtener estadísticas de peso
  obtenerEstadisticasPeso: async (userId, dias = 30) => {
    try {
      const response = await api.get(`/users/${userId}/estadisticas-peso`, {
        params: { dias }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener estadísticas');
    }
  },

  // Eliminar registro de peso
  eliminarRegistroPeso: async (userId, registroId) => {
    try {
      const response = await api.delete(`/users/${userId}/historial-peso/${registroId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar el registro');
    }
  },

  // Calcular grasa corporal (fórmula simplificada)
  calcularGrasaCorporal: (peso, altura, edad, genero, medidaCintura = null) => {
    let grasaCorporal;
    
    if (genero === 'masculino') {
      grasaCorporal = (1.20 * (peso / ((altura/100) * (altura/100)))) + (0.23 * edad) - 16.2;
    } else {
      grasaCorporal = (1.20 * (peso / ((altura/100) * (altura/100)))) + (0.23 * edad) - 5.4;
    }

    // Ajustar con medida de cintura si está disponible
    if (medidaCintura) {
      if (genero === 'masculino') {
        grasaCorporal += (medidaCintura - 90) * 0.1;
      } else {
        grasaCorporal += (medidaCintura - 80) * 0.1;
      }
    }

    return Math.max(5, Math.min(50, grasaCorporal)).toFixed(1);
  }
};

export default userService;