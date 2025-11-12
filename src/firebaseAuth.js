// SALUD_BIENESTAR_FRONTEND_APP/src/utils/firebaseAuth.js 
import { getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence, // <-- Importamos la función oficial de Firebase
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { getDatabase, ref, push, set } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// Importar configuración
import firebaseConfig from './firebaseWeb'; 

// --- INICIALIZACIÓN MODERNA Y CORRECTA ---

let app;
// Inicializar Firebase solo si no se ha hecho antes
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Inicializa Auth con persistencia usando la función oficial
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getDatabase(app);

// --- lógica de autenticación  ---

const firebaseAuth = {
  async signUpWithEmail(email, password, profileObj = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar perfil en Realtime Database
      try {
        const usuariosRef = ref(db, 'usuarios');
        const newRef = push(usuariosRef);

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

// Exportamos tanto el objeto 'auth' 
export { auth };
export default firebaseAuth;