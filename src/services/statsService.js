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
    // Obtener todas las estadísticas con filtros
    async obtenerEstadisticas(USER_UUID, filtros = {}) {
        try {
            const params = new URLSearchParams();

            // Agregar parámetros de filtro
            if (filtros.anio) {
                params.append('anio', filtros.anio);
            }
            if (filtros.mes) {
                params.append('mes', filtros.mes);
            }

            console.log('📡 Llamando a la API:', `/stats/${USER_UUID}?${params.toString()}`);
            
            const response = await api.get(`/stats/${USER_UUID}?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error en statsService.obtenerEstadisticas:', error);
            if (error.response) {
                console.error('Respuesta del error:', error.response.data);
                console.error('Status:', error.response.status);
            }
            throw error;
        }
    },

    // Las otras funciones mantienen sus rutas originales
    obtenerGraficoPeso: async (userId, limite = 7) => {
        try {
            const response = await api.get(`/stats/user/${userId}/grafico-peso`, {
                params: { limite }
            });
            return response.data;
        } catch (error) {
            console.error('Error en obtenerGraficoPeso:', error);
            throw new Error(error.response?.data?.mensaje || 'Error al obtener datos de peso');
        }
    },

    obtenerGraficoObjetivos: async (userId) => {
        try {
            const response = await api.get(`/stats/user/${userId}/grafico-objetivos`);
            return response.data;
        } catch (error) {
            console.error('Error en obtenerGraficoObjetivos:', error);
            throw new Error(error.response?.data?.mensaje || 'Error al obtener datos de objetivos');
        }
    },

    obtenerResumen: async (userId) => {
        try {
            const response = await api.get(`/stats/user/${userId}/resumen`);
            return response.data;
        } catch (error) {
            console.error('Error en obtenerResumen:', error);
            throw new Error(error.response?.data?.mensaje || 'Error al obtener resumen');
        }
    },

    obtenerEstadisticasPorPeriodo: async (userId, periodo = 'mensual') => {
        try {
            const response = await api.get(`/stats/user/${userId}/periodo`, {
                params: { periodo }
            });
            return response.data;
        } catch (error) {
            console.error('Error en obtenerEstadisticasPorPeriodo:', error);
            throw new Error(error.response?.data?.mensaje || 'Error al obtener estadísticas por período');
        }
    }
};