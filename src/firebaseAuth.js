// Wrapper auth helper that uses Web SDK on web (for localhost testing)
// and the native helper on mobile (when running a custom dev client / native build).
import { Platform } from 'react-native';

// On web we use Firebase Web SDK
const useWeb = Platform.OS === 'web';

if (useWeb) {
  // Initialize firebase app (firebaseWeb.js already initializes app if imported)
  // Use require synchronously to ensure metro includes the module on web builds
  // eslint-disable-next-line global-require
  require('./firebaseWeb');
}

import FirebaseNative from './firebaseNative';

// Web SDK imports (dynamically required to avoid bundling on native)
async function webSignUp(email, password, profileObj = {}) {
  const { createUserWithEmailAndPassword, getAuth } = await import('firebase/auth');
  const { getDatabase, ref, push, set } = await import('firebase/database');

  const auth = getAuth();
  const db = getDatabase();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // add profile to Realtime DB
    try {
      const usuariosRef = ref(db, 'usuarios');
      const newRef = push(usuariosRef);
      // include fechaRegistro if not provided
      const d = new Date();
      const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
      const fechaRegistro = profileObj.fechaRegistro || `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
      const profileToSave = { ...profileObj, email, fechaRegistro, idAuth: user.uid };
      await set(newRef, profileToSave);
    } catch (dbErr) {
      console.warn('No se pudo guardar usuario en Realtime DB:', dbErr);
    }

    const token = await user.getIdToken();
    return { success: true, user, token };
  } catch (error) {
    console.error('webSignUp error', error);
    return { success: false, error };
  }
}

async function webSignIn(email, password) {
  const { signInWithEmailAndPassword, getAuth } = await import('firebase/auth');
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();
    return { success: true, user, token };
  } catch (error) {
    console.error('webSignIn error', error);
    return { success: false, error };
  }
}

const firebaseAuth = {
  async signUpWithEmail(email, password, profileObj = {}) {
    if (Platform.OS === 'web') return webSignUp(email, password, profileObj);
    // native
    return FirebaseNative.createUserWithEmailAndProfile(email, password, profileObj);
  },

  async signInWithEmail(email, password) {
    if (Platform.OS === 'web') return webSignIn(email, password);
    return FirebaseNative.signInWithEmail(email, password);
  }
};

export default firebaseAuth;
