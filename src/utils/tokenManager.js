import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';

const TOKEN_STORAGE_KEY = '@firebase_token';
const TOKEN_EXPIRY_KEY = '@token_expiry';

/**
 * TokenManager - Maneja los tokens de Firebase de forma segura
 * 
 * Los tokens de Firebase son JWT (JSON Web Tokens) que:
 * - Se generan automáticamente al iniciar sesión
 * - Tienen una duración de 1 hora
 * - Se renuevan automáticamente
 * - Están firmados digitalmente por Firebase
 */
const tokenManager = {
  /**
   * Obtiene el token del usuario actual
   * Si el token está por expirar, lo renueva automáticamente
   */
  async getToken(forceRefresh = false) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.warn('No hay usuario autenticado');
        return null;
      }

      // Obtener token de Firebase (se renueva automáticamente si es necesario)
      const token = await user.getIdToken(forceRefresh);
      
      // Guardar en AsyncStorage para acceso offline
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      
      // Guardar tiempo de expiración (1 hora desde ahora)
      const expiryTime = Date.now() + (60 * 60 * 1000); // 1 hora
      await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      
      return token;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  },

  /**
   * Obtiene el token almacenado en AsyncStorage
   * Útil para verificar si hay una sesión guardada
   */
  async getStoredToken() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      const expiry = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
      
      // Verificar si el token ha expirado
      if (expiry && Date.now() > parseInt(expiry, 10)) {
        console.log('Token expirado, renovando...');
        return await this.getToken(true); // Forzar renovación
      }
      
      return token;
    } catch (error) {
      console.error('Error al obtener token almacenado:', error);
      return null;
    }
  },

  /**
   * Renueva el token manualmente
   */
  async refreshToken() {
    return await this.getToken(true);
  },

  /**
   * Limpia el token del almacenamiento
   */
  async clearToken() {
    try {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      await AsyncStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error('Error al limpiar token:', error);
    }
  },

  /**
   * Decodifica el token JWT para ver su contenido
   * (solo para debugging, no verificar firma aquí)
   */
  decodeToken(token) {
    try {
      if (!token) return null;
      
      // Un JWT tiene 3 partes separadas por puntos: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Token inválido');
        return null;
      }
      
      // Decodificar el payload (segunda parte)
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      
      return decoded;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  },

  /**
   * Verifica si el token es válido (no expirado)
   */
  async isTokenValid() {
    try {
      const token = await this.getStoredToken();
      if (!token) return false;
      
      const decoded = this.decodeToken(token);
      if (!decoded) return false;
      
      // Verificar si ha expirado (exp está en segundos, Date.now() en milisegundos)
      const now = Date.now() / 1000;
      return decoded.exp > now;
    } catch (error) {
      console.error('Error al verificar token:', error);
      return false;
    }
  }
};

export default tokenManager;
