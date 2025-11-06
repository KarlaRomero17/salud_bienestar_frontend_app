import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

/**
 * Helper wrapper around react-native-firebase for Auth and Realtime Database
 * Usage:
 * import FirebaseNative from '../src/firebaseNative';
 * await FirebaseNative.signInWithEmail(email, password);
 * const users = await FirebaseNative.getUsers();
 */

const FirebaseNative = {
  // Authentication
  async signInWithEmail(email, password) {
    try {
      const userCred = await auth().signInWithEmailAndPassword(email, password);
      return userCred;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new Firebase Authentication user and save profile in Realtime Database under /usuarios
   * profileObj should include the fields expected by the app (nombre, apellido, altura, peso, edad, sexo, idRol, etc.)
   */
  async createUserWithEmailAndProfile(email, password, profileObj = {}) {
    try {
      const userCred = await auth().createUserWithEmailAndPassword(email, password);
      const uid = userCred.user.uid;

      // Ensure fechaRegistro if not provided
      const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
      const d = new Date();
      const fechaRegistro = profileObj.fechaRegistro || `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;

      const profileToSave = {
        ...profileObj,
        email,
        fechaRegistro,
        idAuth: uid
      };

      // Save profile under usuarios using push() to be consistent with existing structure
      const ref = database().ref('usuarios').push();
      await ref.set(profileToSave);

      return { userCred, profileKey: ref.key };
    } catch (error) {
      throw error;
    }
  },

  async signOut() {
    try {
      await auth().signOut();
    } catch (error) {
      throw error;
    }
  },

  // Realtime Database helpers
  async getUsers() {
    try {
      const snapshot = await database().ref('usuarios').once('value');
      return snapshot.val();
    } catch (error) {
      throw error;
    }
  },

  async getRoles() {
    try {
      const snapshot = await database().ref('roles').once('value');
      return snapshot.val();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Adds a user under /usuarios using push() (generates a new key).
   * userObj: plain object with the user fields.
   */
  async addUser(userObj) {
    try {
      const ref = database().ref('usuarios').push();
      await ref.set(userObj);
      return { key: ref.key };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Subscribe to users changes. callback receives the plain value (object or array).
   * Returns an unsubscribe function.
   */
  subscribeToUsers(callback) {
    const ref = database().ref('usuarios');
    const listener = ref.on('value', snapshot => callback(snapshot.val()));
    return () => ref.off('value', listener);
  },

  /**
   * Utility: migrate an array-stored node (bad pattern in RTDB) into an object keyed by push ids.
   * WARNING: this writes to the database. It will first create a backup at `${path}_backup_<ts>`.
   * Use only once and verify the result before deleting backups.
   *
   * Example: await FirebaseNative.migrateArraysToObjects('usuarios');
   */
  async migrateArraysToObjects(path = 'usuarios') {
    const rootRef = database().ref(path);
    const ts = Date.now();
    const backupPath = `${path}_backup_${ts}`;

    try {
      const snap = await rootRef.once('value');
      const data = snap.val();
      if (!Array.isArray(data)) {
        return { migrated: false, reason: 'source is not an array' };
      }

      // Save backup
      await database().ref(backupPath).set(data);

      // Build new object keyed by push keys
      const newObj = {};
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item === null || item === undefined) continue;
        const key = database().ref(path).push().key;
        newObj[key] = item;
      }

      // Overwrite original path with new object
      await database().ref(path).set(newObj);
      return { migrated: true, backupPath };
    } catch (error) {
      throw error;
    }
  }
};

export default FirebaseNative;
