import Constants from 'expo-constants';

const SERVER_URI = Constants.expoConfig?.extra?.SERVER_URI;

console.log('Server URL:', SERVER_URI);

// Exporta la URL base para usar en toda tu app
export const API_BASE_URL = SERVER_URI;

// O exporta un cliente axios preconfigurado
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});