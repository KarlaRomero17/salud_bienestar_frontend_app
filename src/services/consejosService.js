// services/consejosService.js
import axios from 'axios';

// ¡USA TU IP! Este es un cliente simple solo para esta tarea
const apiClient = axios.create({
  baseURL: 'http://192.168.0.9:5000/api', // <-- ¡PON TU IP AQUÍ!
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