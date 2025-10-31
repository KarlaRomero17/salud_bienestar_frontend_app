import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import firebaseAuth from '../firebaseAuth';

export const AuthContext = createContext();

const USER_STORAGE_KEY = '@user_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      // prefer firebaseAuth (works for web and native); fallback to authService if present
      const res = await firebaseAuth.signInWithEmail(email, password);
      
      // Check if login failed (web returns {success: false, error})
      if (res && res.success === false) {
        return { success: false, error: res.error };
      }
      
      // Login successful
      if (res && res.success) {
        const userData = {
          uid: res.user?.uid,
          email: res.user?.email,
          token: res.token
        };
        setUser(userData);
        // Guardar sesión en AsyncStorage
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        return { success: true };
      }
      
      // fallback: try backend auth (if firebaseAuth didn't return expected format)
      try {
        const apiRes = await authService.login(email, password);
        const userData = apiRes.user || null;
        if (userData) {
          setUser(userData);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
          return { success: true };
        }
        // backend didn't return a user -> treat as authentication failure
        return { success: false, error: new Error('Credenciales incorrectas') };
      } catch (apiErr) {
        // backend call failed -> return the error
        return { success: false, error: apiErr };
      }
    } catch (error) {
      console.warn('AuthContext login error', error);
      return { success: false, error };
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  };

  useEffect(() => {
    // Restaurar sesión desde AsyncStorage
    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.warn('Error loading session', error);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
