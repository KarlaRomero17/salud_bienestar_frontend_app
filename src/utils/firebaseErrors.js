// Mapeo de códigos de error de Firebase a mensajes en español
const firebaseErrorMessages = {
  // Auth errors
  'auth/email-already-in-use': 'Este correo ya está registrado. ¿Intentas iniciar sesión?',
  'auth/invalid-email': 'El correo electrónico no tiene un formato válido.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/user-not-found': 'No encontramos una cuenta con ese correo. ¿Deseas registrarte?',
  'auth/wrong-password': 'La contraseña es incorrecta. Intenta de nuevo o restablece tu contraseña.',
  'auth/user-disabled': 'La cuenta ha sido desactivada. Contacta al administrador.',
  'auth/operation-not-allowed': 'Operación no permitida.',
  'auth/too-many-requests': 'Muchos intentos. Espera un momento e inténtalo de nuevo.',
  'auth/network-request-failed': 'Error de conexión. Verifica tu red e inténtalo de nuevo.',
  'auth/invalid-credential': 'No pudimos iniciar sesión con esas credenciales. Verifica tu correo y contraseña.',
  'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este correo usando otro método.',
  'auth/requires-recent-login': 'Por seguridad, vuelve a iniciar sesión.',
  
  // Generic
  'auth/internal-error': 'Error interno. Intenta nuevamente',
  'default': 'Ocurrió un error. Intenta nuevamente'
};

export function getFirebaseErrorMessage(error) {
  if (!error) return firebaseErrorMessages.default;

  // Priorizar `error.message` si ya es una cadena amigable generada por el frontend
  if (error.message && typeof error.message === 'string') {
    return error.message;
  }

  const code = error.code || (error.error && error.error.code);

  if (code && firebaseErrorMessages[code]) {
    return firebaseErrorMessages[code];
  }

  return firebaseErrorMessages.default;
}

export default { getFirebaseErrorMessage };
