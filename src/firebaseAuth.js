// Firebase Auth usando Web SDK (compatible con Expo Go)
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { getDatabase, ref, push, set } from 'firebase/database';

// Importar configuración
import firebaseConfig from './firebaseWeb';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

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
