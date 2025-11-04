import axios from 'axios';
import tokenManager from '../utils/tokenManager';

/**
 * Cliente HTTP configurado para usar tokens de Firebase
 * Automáticamente agrega el token de autenticación a cada petición
 */

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: 'https://appsaludybienestar-b7b70-default-rtdb.firebaseio.com', // Tu Firebase Realtime Database
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para agregar el token a cada petición
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Obtener token actual (se renueva automáticamente si es necesario)
      const token = await tokenManager.getToken();
      
      if (token) {
        // Agregar token al header Authorization
        config.headers.Authorization = `Bearer ${token}`;
        
        // O agregarlo como parámetro de query (para Firebase Realtime Database)
        if (!config.params) {
          config.params = {};
        }
        config.params.auth = token;
      }
      
      return config;
    } catch (error) {
      console.error('Error en interceptor de request:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (no autorizado) y no hemos reintentado
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar renovar el token
        console.log('Token expirado, renovando...');
        const newToken = await tokenManager.refreshToken();
        
        if (newToken) {
          // Actualizar el header y reintentar la petición
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          if (originalRequest.params) {
            originalRequest.params.auth = newToken;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error al renovar token:', refreshError);
        // Aquí podrías redirigir al login si el token no se puede renovar
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Ejemplo de funciones para usar con el token
 */
export const authenticatedAPI = {
  // GET: Obtener datos del usuario
  async getUserProfile(uid) {
    try {
      const response = await apiClient.get(`/usuarios.json?orderBy="idAuth"&equalTo="${uid}"`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  },

  // POST: Crear nuevo dato
  async createData(endpoint, data) {
    try {
      const response = await apiClient.post(`/${endpoint}.json`, data);
      return response.data;
    } catch (error) {
      console.error('Error al crear dato:', error);
      throw error;
    }
  },

  // PUT: Actualizar dato existente
  async updateData(endpoint, id, data) {
    try {
      const response = await apiClient.put(`/${endpoint}/${id}.json`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar dato:', error);
      throw error;
    }
  },

  // DELETE: Eliminar dato
  async deleteData(endpoint, id) {
    try {
      const response = await apiClient.delete(`/${endpoint}/${id}.json`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar dato:', error);
      throw error;
    }
  },

  // Ejemplo: Verificar si el token es válido haciendo una petición simple
  async verifyToken() {
    try {
      const response = await apiClient.get('/.json?shallow=true');
      return { valid: true, data: response.data };
    } catch (error) {
      return { valid: false, error };
    }
  }
};

export default apiClient;
