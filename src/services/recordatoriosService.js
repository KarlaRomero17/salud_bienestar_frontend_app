import { SERVER_URI } from '@env';

// Para debug - verifica que la variable se cargue correctamente
console.log('🔧 SERVER_URI cargada:', SERVER_URI);

// Función helper para hacer fetch con timeout
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

export const recordatoriosService = {
  // Obtener todos los recordatorios
  obtenerTodos: async () => {
    try {
      console.log('🔗 Conectando a:', `${SERVER_URI}/api/recordatorios`);
      
      const response = await fetchWithTimeout(`${SERVER_URI}/api/recordatorios`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Datos recibidos correctamente');
      return data;
      
    } catch (error) {
      console.error('❌ Error en obtenerTodos:', error.message);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout: El servidor no respondió a tiempo');
      } else if (error.message.includes('Network request failed')) {
        throw new Error(`No se pudo conectar al servidor: ${SERVER_URI}
        
Solución:
1. Verifica que el servidor esté corriendo
2. Para Android: usa http://10.0.2.2:5000
3. Para iOS: usa http://localhost:5000
4. Para dispositivo físico: usa tu IP local`);
      } else {
        throw error;
      }
    }
  },

  // ... (el resto de tus métodos igual)
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
};