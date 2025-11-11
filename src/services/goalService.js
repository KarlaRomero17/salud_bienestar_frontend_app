import { SERVER_URI } from '@env';

// Función helper para hacer fetch con timeout (la misma que recordatorios)
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const goalService = {
  // Obtener todos los objetivos del usuario
  obtenerTodos: async (userId) => {
    try {
      console.log('🎯 Conectando a:', `${SERVER_URI}/api/goals?userId=${userId}`);
      
      const response = await fetchWithTimeout(`${SERVER_URI}/api/goals?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Objetivos recibidos correctamente');
      return data;
      
    } catch (error) {
      console.error('Error en obtenerTodos:', error.message);
      throw error;
    }
  },

  // Crear nuevo objetivo
  crear: async (datos) => {
    try {
      const response = await fetchWithTimeout(`${SERVER_URI}/api/goals`, {
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

  // Actualizar objetivo
  actualizar: async (id, datos) => {
    try {
      const response = await fetchWithTimeout(`${SERVER_URI}/api/goals/${id}`, {
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
  },

  // Eliminar objetivo
  eliminar: async (id, userId) => {
    try {
      const response = await fetchWithTimeout(`${SERVER_URI}/api/goals/${id}?userId=${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error en eliminar:', error);
      throw error;
    }
  },

  // Actualizar progreso
  actualizarProgreso: async (id, progress, userId) => {
    try {
      const response = await fetchWithTimeout(`${SERVER_URI}/api/goals/${id}/progress`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ progress, userId }),
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error en actualizarProgreso:', error);
      throw error;
    }
  },
};