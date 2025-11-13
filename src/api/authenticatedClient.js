// SALUD_BIENESTAR_FRONTEND_APP/src/api/authenticatedClient.js

import axios from 'axios';
import tokenManager from '../utils/tokenManager'; // Asegúrate de que esta ruta a tu tokenManager sea correcta

import { SERVER_URI } from '@env';


// Dirección de tu base de datos en tiempo real de Firebase
const FIREBASE_DATABASE_URL = 'https://appsaludybienestar-b7b70-default-rtdb.firebaseio.com';

// Dirección de tu backend de Node.js 
const BACKEND_API_URL = `${SERVER_URI}/api`;



const firebaseApiClient = axios.create({
  baseURL: FIREBASE_DATABASE_URL,
  timeout: 10000,
});

// Interceptor para CADA petición a FIREBASE
// Firebase RTDB necesita el token como un parámetro en la URL (?auth=TOKEN)
firebaseApiClient.interceptors.request.use(async (config) => {
  try {
    const token = await tokenManager.getToken();
    if (token) {
      if (!config.params) {
        config.params = {};
      }
      config.params.auth = token; // Así es como Firebase RTDB se autentica
    }
    return config;
  } catch (error) {
    console.error('Error en interceptor de request de Firebase:', error);
    return Promise.reject(error);
  }
});



const backendApiClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 10000,
});


backendApiClient.interceptors.request.use(async (config) => {
    try {
        const token = await tokenManager.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    } catch (error) {
        console.error('Error en interceptor de request del Backend:', error);
        return Promise.reject(error);
    }
});



/**
 * Funciones para interactuar con la base de datos de Firebase (perfiles de usuario, etc.)
 */
export const firebaseApi = {
  /**
   * Obtiene el perfil de un usuario y su clave única de RTDB a partir de su UID de autenticación.
   * @param {string} uid El UID del usuario de Firebase Authentication.
   * @returns {object|null} El perfil del usuario con su clave de RTDB o null si no se encuentra.
   */
  async getUserProfile(uid) {
    try {
      const response = await firebaseApiClient.get(`/usuarios.json?orderBy="idAuth"&equalTo="${uid}"`);
      if (response.data && Object.keys(response.data).length > 0) {
        const rtdbKey = Object.keys(response.data)[0];
        const userProfile = response.data[rtdbKey];
        return { rtdbKey, ...userProfile };
      }
      return null;
    } catch (error) {
      console.error('Firebase API Error - getUserProfile:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Actualiza el plan de comida de un usuario en Firebase RTDB.
   * @param {string} rtdbKey La clave del documento del usuario en RTDB.
   * @param {object} planData El objeto con el ID del plan. Ej: { planComidaId: '...' } o { planComidaId: null }
   */
  async updateUserPlan(rtdbKey, planData) {
    try {
      // Usamos PATCH para actualizar solo los campos especificados sin borrar el resto del perfil
      const response = await firebaseApiClient.patch(`/usuarios/${rtdbKey}.json`, planData);
      return response.data;
    } catch (error) {
      console.error('Firebase API Error - updateUserPlan:', error.response?.data || error.message);
      throw error;
    }
  }
};

/**
 * Funciones para interactuar con nuestro backend de Node.js (planes de comida, etc.)
 */
export const backendApi = {
  /**
   * Obtiene la lista completa de planes de comida desde nuestro servidor.
   */
  async getPlanesComida() {
    try {
      const response = await backendApiClient.get('/planes-comida');
      return response.data;
    } catch (error) {
      console.error('Backend API Error - getPlanesComida:', error.response?.data || error.message);
      throw error;
    }
  }
};