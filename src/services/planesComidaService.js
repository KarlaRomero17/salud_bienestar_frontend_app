// SALUD_BIENESTAR_FRONTEND_APP/src/services/planesComidaService.js

// Usaremos el apiClient normal, ya que no necesitamos autenticación por ahora.
import apiClient from '../api/apiClient'; 
import { firebaseApi, backendApi } from '../../api/authenticatedClient';

// --- Para pruebas, necesitamos el ID de un paciente que exista en tu base de datos ---
// 1. Ve a MongoDB Compass.
// 2. Entra a la colección 'paciente'.
// 3. Copia el valor del campo '_id' de cualquier paciente.
// 4. Pega ese ID aquí.
const PACIENTE_ID_PRUEBA = '60d5ecb4b4832a4a2c71a3b2';

// Obtener todos los planes de comida disponibles
export const fetchPlanesComida = async () => {
  try {
    const response = await apiClient.get('/planes-comida');
    return response.data;
  } catch (error) {
    console.error("Error al obtener los planes de comida:", error.response?.data || error.message);
    throw error;
  }
};

// Seleccionar un plan de comida
export const selectPlanComida = async (planId) => {
  try {
    const response = await apiClient.post('/planes-comida/seleccionar', { 
        planId: planId,
        pacienteId: PACIENTE_ID_PRUEBA // Enviamos el ID del paciente
    });
    return response.data;
  } catch (error) {
    console.error("Error al seleccionar el plan:", error.response?.data || error.message);
    throw error;
  }
};

// Obtener el plan de comida del usuario actual
export const fetchMiPlanComida = async () => {
  try {
    // Enviamos el ID del paciente en la URL, como definimos en el backend
    const response = await apiClient.get(`/planes-comida/mi-plan/${PACIENTE_ID_PRUEBA}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener mi plan:", error.response?.data || error.message);
    throw error;
  }
};

// Cancelar el plan de comida actual
export const cancelPlanComida = async () => {
  try {
    const response = await apiClient.put('/planes-comida/cancelar', {
        pacienteId: PACIENTE_ID_PRUEBA // Enviamos el ID del paciente
    });
    return response.data;
  } catch (error) {
    console.error("Error al cancelar el plan:", error.response?.data || error.message);
    throw error;
  }
};