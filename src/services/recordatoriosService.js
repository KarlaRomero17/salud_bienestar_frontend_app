import { SERVER_URI } from '@env';
import tokenManager from '../utils/tokenManager';

// Función helper para hacer fetch con timeout Y token de autenticación
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    // 🔒 SEGURIDAD: Obtener el token de Firebase antes de cada petición
    const token = await tokenManager.getToken();
    
    // Agregar el token al header Authorization si existe
    const headers = {
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const recordatoriosService = {
  // Obtener todos los recordatorios
  obtenerTodosConPaginacion: async (queryParams = '') => {
    try {
      console.log('Conectando a:', `${SERVER_URI}/api/recordatorios?${queryParams}`);
      
      const response = await fetchWithTimeout(`${SERVER_URI}/api/recordatorios?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Datos recibidos correctamente');
      return data;
      
    } catch (error) {
      console.error('Error en obtenerTodosConPaginacion:', error.message);
      throw error;
    }
  },

  // Mantén el método original para compatibilidad
  obtenerTodos: async () => {
    return await recordatoriosService.obtenerTodosConPaginacion();
  },

  obtenerDeHoy: async () => {
    try {
      const response = await fetchWithTimeout(`${SERVER_URI}/api/recordatorios/hoy/recordatorios`);
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error en obtenerDeHoy:', error);
      throw error;
    }
  },

  crear: async (datos) => {
    try {
      const response = await fetchWithTimeout(`${SERVER_URI}/api/recordatorios`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error en crear:', error);
      throw error;
    }
  },

  eliminar: async (id) => {
    try {
      const response = await fetchWithTimeout(`${SERVER_URI}/api/recordatorios/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error en eliminar:', error);
      throw error;
    }
  },

  marcarTomado: async (id) => {
    try {
      const response = await fetchWithTimeout(`${SERVER_URI}/api/recordatorios/${id}/tomado`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error en marcarTomado:', error);
      throw error;
    }
  },

  alternarEstado: async (id) => {
    try {
      const response = await fetchWithTimeout(`${SERVER_URI}/api/recordatorios/${id}/activar-desactivar`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error en alternarEstado:', error);
      throw error;
    }
  },

  obtenerPorId: async (id) => {
    try {
      const response = await fetchWithTimeout(`${SERVER_URI}/api/recordatorios/${id}`);
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error en obtenerPorId:', error);
      throw error;
    }
  },
  //actualizar
  actualizar: async (id, datos) => {
    try {
      const response = await fetchWithTimeout(`${SERVER_URI}/api/recordatorios/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error en actualizar:', error);
      throw error;
    }
  }
};