// src/config/api.js
import Constants from 'expo-constants';

// Configuración para diferentes entornos
const ENVIRONMENTS = {
  development: {
    API_BASE_URL: 'http://localhost:5001', // Para desarrollo
  },
  preview: {
    API_BASE_URL: 'https://salud-bienestar-backend-app.onrender.com', // Para APK
  },
  production: {
    API_BASE_URL: 'https://salud-bienestar-backend-app.onrender.com', // Para producción
  }
};

// Detecta automáticamente el entorno
const getEnvironment = () => {
  // Si estamos en desarrollo con Expo Go
  if (__DEV__) {
    return 'development';
  }
  
  // Si es un APK compilado
  return 'preview'; // Siempre usa Render para APKs
};

// Exporta la URL base automáticamente
export const API_BASE_URL = ENVIRONMENTS[getEnvironment()].API_BASE_URL;
export default ENVIRONMENTS[getEnvironment()];