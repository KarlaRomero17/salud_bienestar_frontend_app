// Firebase Auth usando Web SDK (compatible con Expo Go)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, signOut as firebaseSignOut, getAuth, initializeAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, push, ref, set } from 'firebase/database';

// Importar configuración
import firebaseConfig from './firebaseWeb';

// Inicializar Firebase solo si no existe
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Inicializar Auth solo si no existe
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

const db = getDatabase(app);

// Implementación de getReactNativePersistence para Firebase v12.5.0
async function getReactNativePersistence(storage) {
  return {
    type: 'LOCAL',
    async getItem(key) {
      try {
        return await storage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    async setItem(key, value) {
      try {
        await storage.setItem(key, value);
      } catch (error) {
        console.warn('Error setting item in storage:', error);
      }
    },
    async removeItem(key) {
      try {
        await storage.removeItem(key);
      } catch (error) {
        console.warn('Error removing item from storage:', error);
      }
    }
  };
}

const firebaseAuth = {
  async signUpWithEmail(email, password, profileObj = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar perfil en Realtime Database
      try {
        const usuariosRef = ref(db, 'usuarios');
        const newRef = push(usuariosRef);
        
        // Generar fechaRegistro si no existe
        const d = new Date();
        const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
        const fechaRegistro = profileObj.fechaRegistro || `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
        
        const profileToSave = { 
          ...profileObj, 
          email, 
          fechaRegistro, 
          idAuth: user.uid 
        };
        
        await set(newRef, profileToSave);
      } catch (dbErr) {
        console.warn('No se pudo guardar usuario en Realtime DB:', dbErr);
      }

      const token = await user.getIdToken();
      return { success: true, user, token };
    } catch (error) {
      console.error('signUpWithEmail error', error);
      return { success: false, error };
    }
  },

  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      return { success: true, user, token };
    } catch (error) {
      console.error('signInWithEmail error', error);
      return { success: false, error };
    }
  },

  async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('signOut error', error);
      throw error;
    }
  }
};

export default firebaseAuth;
