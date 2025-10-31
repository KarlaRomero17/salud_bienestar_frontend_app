import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import firebaseAuth from '../firebaseAuth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      // prefer firebaseAuth (works for web and native); fallback to authService if present
      const res = await firebaseAuth.signInWithEmail(email, password);
      if (res && res.success) {
        setUser(res.user);
        return { success: true };
      }
      // fallback: try backend auth
      const apiRes = await authService.login(email, password);
      setUser(apiRes.user || null);
      return { success: true };
    } catch (error) {
      console.warn('AuthContext login error', error);
      return { success: false, error };
    }
  };

  const logout = () => setUser(null);

  useEffect(() => {
    // Aquí podrías cargar el usuario guardado en AsyncStorage
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
