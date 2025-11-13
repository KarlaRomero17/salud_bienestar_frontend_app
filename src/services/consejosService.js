// services/consejosService.js
import axios from 'axios';
import { SERVER_URI } from '@env';

const API_BASE_URL = `${SERVER_URI}/api`;
// ¡USA TU IP! Este es un cliente simple solo para esta tarea
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchTodosLosConsejos = async () => {
  try {
    const response = await apiClient.get('/consejos');
    return response.data;
  } catch (error) {
    console.error("Error al obtener los consejos:", error);
    throw error;
  }
};