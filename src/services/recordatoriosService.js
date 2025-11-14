import { SERVER_URI } from '@env';
import tokenManager from '../utils/tokenManager';

// Función helper para hacer fetch con timeout Y token de autenticación
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    // SEGURIDAD: Obtener el token de Firebase antes de cada petición
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
  // ✨ Obtener todos los recordatorios del usuario usando el nuevo endpoint
  obtenerTodos: async (userId) => {
    try {
      if (!userId) {
        throw new Error('userId es requerido para obtener recordatorios');
      }

      const url = `${SERVER_URI}/api/recordatorios/usuario/${userId}`;
      // console.log('Recordatorios | Conectando a:', url);

      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // console.log(`Datos recibidos: ${data.length || 0} recordatorios del usuario`);
      return data;

    } catch (error) {
      // console.error('Error en obtenerTodos:', error.message);
      throw error;
    }
  },

  // Obtener recordatorios de hoy del usuario
  obtenerDeHoy: async (userId) => {
    try {
      if (!userId) {
        return { exito: false, error: 'No userId', datos: [] };
      }

      const url = `${SERVER_URI}/api/recordatorios/hoy/usuario/${userId}`;
      // console.log('Recordatorios de hoy | Conectando a:', url);

      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        return { exito: false, error: `Error ${response.status}`, datos: [] };
      }

      const result = await response.json();
      // console.log('Resultado completo:', result);

      // El backend ya devuelve {exito, datos}
      if (result.exito && Array.isArray(result.datos)) {
        // Filtrar solo los activos
        const deHoy = result.datos.filter(recordatorio => {
          return recordatorio && recordatorio.active === true;
        });

        // console.log(`Recordatorios de hoy: ${deHoy.length}`);
        return { exito: true, datos: deHoy };
      } else {
        return { exito: false, error: 'Respuesta inválida del servidor', datos: [] };
      }

    } catch (error) {
      console.error('Error en obtenerDeHoy:', error);
      return { exito: false, error: error.message, datos: [] };
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
        body: JSON.stringify({
          tomadoEl: new Date().toISOString() // 🔥 ENVIAR LA FECHA
        })
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
  }
};