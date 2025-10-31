// Mapeo de códigos de error de Firebase a mensajes en español
const firebaseErrorMessages = {
  // Auth errors
  'auth/email-already-in-use': 'Este correo ya está registrado',
  'auth/invalid-email': 'El correo electrónico no es válido',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
  'auth/user-not-found': 'No existe una cuenta con este correo',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
  'auth/operation-not-allowed': 'Operación no permitida',
  'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
  'auth/network-request-failed': 'Error de conexión. Verifica tu red',
  'auth/invalid-credential': 'Credenciales inválidas',
  'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este correo usando otro método',
  'auth/requires-recent-login': 'Por seguridad, vuelve a iniciar sesión',
  
  // Generic
  'auth/internal-error': 'Error interno. Intenta nuevamente',
  'default': 'Ocurrió un error. Intenta nuevamente'
};

export function getFirebaseErrorMessage(error) {
  if (!error) return firebaseErrorMessages.default;
  
  const code = error.code || (error.error && error.error.code);
  
  if (code && firebaseErrorMessages[code]) {
    return firebaseErrorMessages[code];
  }
  
  // Si tiene message personalizado, devolverlo
  if (error.message) {
    return error.message;
  }
  
  return firebaseErrorMessages.default;
}

export default { getFirebaseErrorMessage };
