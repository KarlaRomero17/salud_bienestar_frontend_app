import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebaseWeb';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener instancia de Messaging
export const messaging = getMessaging(app);

// Solicitar permisos y obtener token
export const getFCMToken = async () => {
  try {
    // Solicitar permisos de notificación
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Permisos de notificación concedidos');
      
      // Obtener token FCM
      const token = await getToken(messaging, {
        vapidKey: 'TU_VAPID_KEY_OPCIONAL' // Opcional para web push
      });
      
      console.log('Token FCM obtenido:', token);
      return token;
    } else {
      console.log('Permisos de notificación denegados');
      return null;
    }
  } catch (error) {
    console.error('Error obteniendo token FCM:', error);
    return null;
  }
};

// Escuchar mensajes en primer plano
export const onForegroundMessage = (callback) => {
  return onMessage(messaging, callback);
};