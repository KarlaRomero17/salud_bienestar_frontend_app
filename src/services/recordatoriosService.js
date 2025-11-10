import { SERVER_URI } from '@env';

// Función helper para hacer fetch con timeout
const fetchWithTimeout = async (url, options = {}, timeout = 20000) => { // ✅ Aumentar timeout a 20s
  const controller = new AbortController();
  const id = setTimeout(() => {
    console.log('⏰ Timeout alcanzado, abortando...');
    controller.abort();
  }, timeout);
  
  try {
    console.log('🔗 Conectando a:', url);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(id);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error HTTP:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Conexión exitosa');
    return response;
    
  } catch (error) {
    clearTimeout(id);
    
    if (error.name === 'AbortError') {
      console.error('⏰ Timeout de conexión después de', timeout, 'ms');
      throw new Error('El servidor no respondió. Verifica que esté ejecutándose.');
    } else {
      console.error('❌ Error de conexión:', error.message);
      throw new Error(`No se pudo conectar al servidor: ${error.message}`);
    }
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error en actualizar:', error);
      throw error;
    }
  },


  registrarToken: async (userId, token) => {
    try {
      console.log('Registrando token FCM para usuario:', userId);

      const response = await fetchWithTimeout(`${SERVER_URI}/api/recordatorios/register-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          token,
          platform: 'fcm' // Indicar que es un token FCM
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const result = await response.json();
      console.log('Token FCM registrado exitosamente');
      return result;
    } catch (error) {
      console.error('Error en registrarToken:', error);
      throw error;
    }
  },

  enviarNotificacionPrueba: async (userId) => {
    try {
      console.log('Enviando notificación de prueba para usuario:', userId);

      const response = await fetchWithTimeout(`${SERVER_URI}/api/recordatorios/test-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en enviarNotificacionPrueba:', error);
      throw error;
    }
  }
  
};