// src/config/env.js
import { SERVER_URI } from '@env';

export const ENV = {
  SERVER_URI: SERVER_URI || 'https://salud-bienestar-backend-app.onrender.com',
};

// O si falla, usa esta versión de respaldo:
export const getServerURI = () => {
  return 'https://salud-bienestar-backend-app.onrender.com';
};