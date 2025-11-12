import axios from 'axios';
import tokenManager from '../utils/tokenManager';
import { SERVER_URI } from '@env';

/**
 * 🔒 Cliente HTTP Seguro para Tu API Backend
 * 
 * Este cliente automáticamente:
 * - Agrega el token de Firebase en cada petición (Authorization: Bearer <token>)
 * - Maneja errores 401 (no autorizado)
 * - Renueva el token si expira
 * - Tiene timeout de 15 segundos
 * 
 * USO:
 * import secureApiClient from '../api/secureApiClient';
 * const response = await secureApiClient.get('/recordatorios');
 */

// Crear instancia de axios con configuración base
const secureApiClient = axios.create({
  baseURL: `${SERVER_URI}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 🔒 INTERCEPTOR DE REQUEST: Agrega el token automáticamente
secureApiClient.interceptors.request.use(
  async (config) => {
    try {
      // Obtener token de Firebase (se renueva automáticamente si está por expirar)
      const token = await tokenManager.getToken();
      
      if (token) {
        // Agregar token al header Authorization
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔐 Token agregado a la petición:', config.url);
      } else {
        console.warn('⚠️ No hay token disponible. Usuario no autenticado.');
      }
      
      return config;
    } catch (error) {
      console.error('❌ Error obteniendo token en interceptor:', error);
      // Continuar sin token (el backend rechazará la petición)
      return config;
    }
  },
  (error) => {
    console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// 🔒 INTERCEPTOR DE RESPONSE: Maneja errores de autenticación
secureApiClient.interceptors.response.use(
  (response) => {
    // Petición exitosa
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (no autorizado) y no hemos reintentado
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.warn('⚠️ Token inválido o expirado. Renovando...');
      
      try {
        // Intentar renovar el token
        const newToken = await tokenManager.refreshToken();
        
        if (newToken) {
          // Actualizar el header con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Reintentar la petición original
          return secureApiClient(originalRequest);
        } else {
          console.error('❌ No se pudo renovar el token. Usuario debe volver a iniciar sesión.');
          // Aquí podrías disparar un evento para cerrar sesión
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('❌ Error al renovar token:', refreshError);
        return Promise.reject(error);
      }
    }
    
    // Para otros errores, rechazar normalmente
    if (error.response) {
      console.error(`❌ Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('❌ No se recibió respuesta del servidor:', error.message);
    } else {
      console.error('❌ Error configurando la petición:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default secureApiClient;
