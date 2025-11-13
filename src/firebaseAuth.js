// SALUD_BIENESTAR_FRONTEND_APP/src/utils/firebaseAuth.js
// VERSIÓN CORREGIDA SIN FUNCIÓN DUPLICADA

import { getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence, // <-- 1. Importamos la función oficial...
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { getDatabase, ref, push, set } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { SERVER_URI } from '@env';

import firebaseConfig from './firebaseWeb'; 

// --- INICIALIZACIÓN MODERNA Y CORRECTA ---

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Inicializa Auth con persistencia usando la función oficial importada
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getDatabase(app);

// Helper para POST a MongoDB
async function postToMongoWithRetry(url, data, token, retries = 3, timeoutMs = 8000) {
  // ... (Tu función de postToMongoWithRetry se mantiene igual, es correcta)
  const attempt = async (remaining) => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(id);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      return await res.json();
    } catch (err) {
      if (remaining <= 0) throw err;
      const backoff = 500 * Math.pow(2, retries - remaining);
      console.warn(`MongoDB POST failed, reintentando en ${backoff}ms... (${remaining - 1} intentos restantes)`, err.message || err);
      await new Promise((r) => setTimeout(r, backoff));
      return attempt(remaining - 1);
    }
  };
  return attempt(retries);
}

// --- ¡BLOQUE DUPLICADO ELIMINADO! ---
// 2. ...Y eliminamos por completo la implementación manual de aquí.
/*
async function getReactNativePersistence(storage) {
  // ... (código borrado)
}
*/


const firebaseAuth = {
  async signUpWithEmail(email, password, profileObj = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      // Guardar perfil en Realtime Database (Firebase)
      try {
        const usuariosRef = ref(db, 'usuarios');
        const newRef = push(usuariosRef);
        const d = new Date();
        const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
        const fechaRegistro = profileObj.fechaRegistro || `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
        const profileToSave = { ...profileObj, email, fechaRegistro, idAuth: user.uid };
        await set(newRef, profileToSave);
      } catch (dbErr) {
        console.warn('No se pudo guardar usuario en Realtime DB:', dbErr);
      }

      // Registrar usuario en MongoDB (tu backend)
      try {
        //console.log('🔄 Registrando usuario en MongoDB...');

        // Mapear datos de Firebase a formato de MongoDB
        const mongoUserData = {
          uid: user.uid,
          uuid: user.uid,
          email: user.email,
          token: token,
          peso_actual: profileObj.peso || null,
          unidad_peso: "kg",
          altura: profileObj.altura || null,
          edad: profileObj.edad || null,
          genero: profileObj.sexo || null,
          active: true,
          historial_peso: null
        };
        const url = `${SERVER_URI}/api/usuarios/`;
        try {
          const mongoUser = await postToMongoWithRetry(url, mongoUserData, token, 3, 8000);
          //console.log('✅ Usuario registrado en MongoDB:', mongoUser);
        } catch (postErr) {
          console.error('❌ Error registrando en MongoDB después de reintentos:', postErr.message || postErr);
          console.warn('Revisa que tu backend esté corriendo y que `SERVER_URI` sea accesible. Valor actual de SERVER_URI:', SERVER_URI);
        }
      } catch (mongoError) {
        console.error('❌ Error no manejado al intentar registrar en MongoDB:', mongoError);
      }

      return { success: true, user, token };
    } catch (error) {
      console.error('signUpWithEmail error', error);
      return { success: false, error };
    }
  },

  _mapAuthErrorToMessage(error) {
    const code = error && error.code ? error.code : null;
    switch (code) {
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
        return 'Las credenciales son incorrectas. Verifica tu correo y contraseña.';
      case 'auth/invalid-email':
        return 'El formato del correo es inválido.';
      case 'auth/user-disabled':
        return 'La cuenta ha sido desactivada. Contacta al administrador.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta más tarde.';
      default:
        return 'Error al iniciar sesión. Intenta de nuevo más tarde.';
    }
  },

  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      return { success: true, user, token };
    } catch (error) {
      const friendly = firebaseAuth._mapAuthErrorToMessage(error);
      console.warn('signInWithEmail failed:', error && error.code ? error.code : error.message || error, '-', friendly);
      return { success: false, error: { code: error && error.code ? error.code : null, message: friendly } };
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

export { auth };
export default firebaseAuth;