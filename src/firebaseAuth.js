// Firebase Auth usando Web SDK (compatible con Expo Go)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, signOut as firebaseSignOut, getAuth, initializeAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, push, ref, set } from 'firebase/database';
import { SERVER_URI } from '@env';

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

// Helper: POST a MongoDB con reintentos exponenciales y timeout
async function postToMongoWithRetry(url, data, token, retries = 3, timeoutMs = 8000) {
  const attempt = async (remaining) => {
    try {
      // AbortController para timeout (compatible con RN fetch)
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(id);

      // If not OK, throw to trigger retry
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      return await res.json();
    } catch (err) {
      // If no retries left, rethrow
      if (remaining <= 0) throw err;
      // Exponential backoff: 500ms * 2^(attempts)
      const backoff = 500 * Math.pow(2, retries - remaining);
      console.warn(`MongoDB POST failed, reintentando en ${backoff}ms... (${remaining - 1} intentos restantes)`, err.message || err);
      await new Promise((r) => setTimeout(r, backoff));
      return attempt(remaining - 1);
    }
  };

  return attempt(retries);
}

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

      // Obtener token inmediatamente después del registro
      const token = await user.getIdToken();

      // Guardar perfil en Realtime Database (Firebase)
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

      // 🔥 NUEVO: Registrar usuario en MongoDB (tu backend)
      try {
        console.log('🔄 Registrando usuario en MongoDB...');

        // Mapear datos de Firebase a formato de MongoDB
        const mongoUserData = {
          uid: user.uid,
          // Backend expects `uuid` (unique index). Send both to be compatible.
          uuid: user.uid,
          email: user.email,
          token: token,
          peso_actual: profileObj.peso || null,
          unidad_peso: "kg",
          altura: profileObj.altura || null,
          edad: profileObj.edad || null,
          genero: profileObj.sexo || null, // Mapear sexo → genero
          active: true,
          historial_peso: null
        };

        const url = `${SERVER_URI}/api/usuarios/`;
        try {
          const mongoUser = await postToMongoWithRetry(url, mongoUserData, token, 3, 8000);
          console.log('✅ Usuario registrado en MongoDB:', mongoUser);
        } catch (postErr) {
          // Mejor log con detalles para debug
          console.error('❌ Error registrando en MongoDB después de reintentos:', postErr.message || postErr);
          console.warn('Revisa que tu backend esté corriendo y que `SERVER_URI` sea accesible desde el dispositivo/emulador. Valor actual de SERVER_URI:', SERVER_URI);
        }
      } catch (mongoError) {
        // Este catch captura errores inesperados en el bloque de registro
        console.error('❌ Error no manejado al intentar registrar en MongoDB:', mongoError);
      }

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
