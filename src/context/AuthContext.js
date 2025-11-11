import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import firebaseAuth from '../firebaseAuth';
import tokenManager from '../utils/tokenManager';
import { getDatabase, ref, query, orderByChild, equalTo, get } from 'firebase/database';

export const AuthContext = createContext();

const USER_STORAGE_KEY = '@user_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Función para cargar el perfil completo del usuario desde Firebase
  const loadUserProfile = async (uid) => {
    try {
      const db = getDatabase();
      const usuariosRef = ref(db, 'usuarios');
      
      // Buscar el usuario por idAuth (que es el uid de Firebase Auth)
      const usuarioQuery = query(usuariosRef, orderByChild('idAuth'), equalTo(uid));
      const snapshot = await get(usuarioQuery);
      
      if (snapshot.exists()) {
        // Obtener el primer (y único) resultado
        const userData = Object.values(snapshot.val())[0];
        const userKey = Object.keys(snapshot.val())[0];
        
        return {
          firebaseKey: userKey, // Clave de Firebase Realtime Database
          ...userData
        };
      } else {
        console.warn('No se encontró el perfil del usuario en la base de datos');
        return null;
      }
    } catch (error) {
      console.error('Error cargando perfil del usuario:', error);
      return null;
    }
  };

  const login = async (email, password, fromRegistration = false) => {
    try {
      // prefer firebaseAuth (works for web and native); fallback to authService if present
      const res = await firebaseAuth.signInWithEmail(email, password);
      
      // Check if login failed (web returns {success: false, error})
      if (res && res.success === false) {
        return { success: false, error: res.error };
      }
      
      // Login successful
      if (res && res.success) {
        // Cargar el perfil completo del usuario
        const userProfile = await loadUserProfile(res.user?.uid);
        
        const userData = {
          uid: res.user?.uid,
          email: res.user?.email,
          token: res.token,
          // Agregar todos los datos del perfil
          nombre: userProfile?.nombre,
          apellido: userProfile?.apellido,
          altura: userProfile?.altura,
          peso: userProfile?.peso,
          edad: userProfile?.edad,
          sexo: userProfile?.sexo,
          idRol: userProfile?.idRol,
          fechaRegistro: userProfile?.fechaRegistro,
          idAuth: userProfile?.idAuth,
          firebaseKey: userProfile?.firebaseKey, // Clave en Realtime Database
        };
        
        setUser(userData);
        setIsNewUser(fromRegistration); // Marcar si viene del registro
        
        // Guardar sesión completa en AsyncStorage
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        
        // Guardar token usando tokenManager para manejo seguro
        await tokenManager.getToken(); // Esto guarda el token automáticamente
        
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
    // Primero cerramos sesión en Firebase (web o native)
    try {
      await firebaseAuth.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión en Firebase:', error);
    }
    
    // Limpiar token
    await tokenManager.clearToken();
    
    // Luego limpiamos el estado local (inmediato)
    setUser(null);
    setIsNewUser(false);
    
    // Finalmente limpiamos AsyncStorage (async)
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Error al limpiar AsyncStorage:', error);
    }
  };

  // Función para actualizar el perfil del usuario
  const updateUserProfile = async (updates) => {
    try {
      if (!user?.uid) {
        return { success: false, error: 'No hay usuario autenticado' };
      }

      // Actualizar en Firebase Realtime Database
      const db = getDatabase();
      const usuariosRef = ref(db, 'usuarios');
      const usuarioQuery = query(usuariosRef, orderByChild('idAuth'), equalTo(user.uid));
      const snapshot = await get(usuarioQuery);
      
      if (snapshot.exists()) {
        const userKey = Object.keys(snapshot.val())[0];
        const userRef = ref(db, `usuarios/${userKey}`);
        
        // Actualizar en Firebase
        const { set } = await import('firebase/database');
        const currentData = Object.values(snapshot.val())[0];
        await set(userRef, { ...currentData, ...updates });
        
        // Actualizar en el estado local
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        
        // Actualizar en AsyncStorage
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        
        return { success: true, user: updatedUser };
      }
      
      return { success: false, error: 'Usuario no encontrado en la base de datos' };
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para recargar el perfil del usuario
  const reloadUserProfile = async () => {
    try {
      if (!user?.uid) {
        return { success: false, error: 'No hay usuario autenticado' };
      }

      const userProfile = await loadUserProfile(user.uid);
      
      if (userProfile) {
        const updatedUser = {
          ...user,
          nombre: userProfile?.nombre,
          apellido: userProfile?.apellido,
          altura: userProfile?.altura,
          peso: userProfile?.peso,
          edad: userProfile?.edad,
          sexo: userProfile?.sexo,
          idRol: userProfile?.idRol,
          fechaRegistro: userProfile?.fechaRegistro,
          firebaseKey: userProfile?.firebaseKey,
        };
        
        setUser(updatedUser);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        
        return { success: true, user: updatedUser };
      }
      
      return { success: false, error: 'No se pudo cargar el perfil' };
    } catch (error) {
      console.error('Error recargando perfil:', error);
      return { success: false, error: error.message };
    }
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
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        loading, 
        isNewUser, 
        setIsNewUser,
        updateUserProfile,
        reloadUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
