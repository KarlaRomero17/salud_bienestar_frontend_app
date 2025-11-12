// services/statsService.js
import axios from 'axios';
import { SERVER_URI } from '@env';

const API_BASE_URL = `${SERVER_URI}/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const statsService = {
    // Obtener todas las estadísticas
    obtenerEstadisticas: async (userId) => {
        try {
            const response = await api.get(`/stats/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error en obtenerEstadisticas:', error);
            throw new Error(error.response?.data?.mensaje || 'Error al obtener estadísticas');
        }
    },

    // Obtener datos para gráfico de peso
    obtenerGraficoPeso: async (userId, limite = 7) => {
        try {
            const response = await api.get(`/stats/${userId}/grafico-peso`, {
                params: { limite }
            });
            return response.data;
        } catch (error) {
            console.error('Error en obtenerGraficoPeso:', error);
            throw new Error(error.response?.data?.mensaje || 'Error al obtener datos de peso');
        }
    },

    // Obtener datos para gráfico de objetivos
    obtenerGraficoObjetivos: async (userId) => {
        try {
            const response = await api.get(`/stats/${userId}/grafico-objetivos`);
            return response.data;
        } catch (error) {
            console.error('Error en obtenerGraficoObjetivos:', error);
            throw new Error(error.response?.data?.mensaje || 'Error al obtener datos de objetivos');
        }
    },

    // Obtener resumen ejecutivo
    obtenerResumen: async (userId) => {
        try {
            const response = await api.get(`/stats/${userId}/resumen`);
            return response.data;
        } catch (error) {
            console.error('Error en obtenerResumen:', error);
            throw new Error(error.response?.data?.mensaje || 'Error al obtener resumen');
        }
    },
    obtenerEstadisticasPorPeriodo: async (userId, periodo = 'mensual') => {
        try {
            const response = await api.get(`/stats/${userId}/periodo`, {
                params: { periodo }
            });
            return response.data;
        } catch (error) {
            console.error('Error en obtenerEstadisticasPorPeriodo:', error);
            throw new Error(error.response?.data?.mensaje || 'Error al obtener estadísticas por período');
        }
    }
};