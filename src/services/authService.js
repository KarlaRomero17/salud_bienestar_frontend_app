// import API from '../api/apiClient';
import { apiClient } from '../config/api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient .post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  register: async (userData) => {
    try {
      const response = await apiClient .post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
