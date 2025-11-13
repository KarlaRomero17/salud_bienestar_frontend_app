// notificationService.js - Servicio para gestionar notificaciones de recordatorios
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_IDS_KEY = '@notification_ids';

/**
 * Solicita permisos de notificaciones al usuario
 * @returns {Promise<boolean>} true si se otorgaron los permisos
 */
export const requestNotificationPermissions = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error solicitando permisos de notificación:', error);
    return false;
  }
};

/**
 * Convierte hora en formato "HH:MM" a objeto con hour y minute
 * @param {string} timeString - Hora en formato "HH:MM"
 * @returns {{hour: number, minute: number}}
 */
const parseTime = (timeString) => {
  const [hour, minute] = timeString.split(':').map(Number);
  return { hour, minute };
};

/**
 * Convierte día de la semana en español a número compatible con expo-notifications
 * Expo usa: 1=Domingo, 2=Lunes, 3=Martes, 4=Miércoles, 5=Jueves, 6=Viernes, 7=Sábado
 * @param {string} day - Día en formato "Lun", "Mar", etc.
 * @returns {number} Número del día (1-7)
 */
const dayToNumber = (day) => {
  const days = {
    'Dom': 1,  // Domingo
    'Lun': 2,  // Lunes
    'Mar': 3,  // Martes
    'Mié': 4,  // Miércoles
    'Jue': 5,  // Jueves
    'Vie': 6,  // Viernes
    'Sáb': 7,  // Sábado
  };
  return days[day] || 2;
};

/**
 * Programa notificaciones para un recordatorio específico
 * @param {Object} reminder - Objeto con datos del recordatorio
 * @param {string} reminder._id - ID del recordatorio
 * @param {string} reminder.name - Nombre del medicamento
 * @param {string} reminder.dosage - Dosis
 * @param {string} reminder.time - Hora en formato "HH:MM"
 * @param {Array<string>} reminder.days - Días de la semana ["Lun", "Mar", ...]
 * @returns {Promise<Array<string>>} Array de IDs de notificaciones creadas
 */
export const scheduleReminderNotifications = async (reminder) => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('⚠️ No se otorgaron permisos de notificación');
      return [];
    }

    const { hour, minute } = parseTime(reminder.time);
    const notificationIds = [];

    console.log(`📅 Programando notificaciones para "${reminder.name}" a las ${hour}:${minute < 10 ? '0' + minute : minute}`);

    // Programar una notificación para cada día configurado
    for (const day of reminder.days) {
      const weekday = dayToNumber(day);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Recordatorio de Medicamento',
          body: `Es hora de tomar ${reminder.name} - ${reminder.dosage}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            reminderId: reminder._id,
            type: 'medication',
          },
        },
        trigger: {
          hour,
          minute,
          weekday, // 1=Domingo, 2=Lunes, ..., 7=Sábado (expo-notifications)
          repeats: true, // Repetir semanalmente
        },
      });

      notificationIds.push(notificationId);
      console.log(`✅ ${day} (weekday=${weekday}) → Notificación ID: ${notificationId}`);
    }

    // Guardar los IDs de notificación asociados al recordatorio
    await saveNotificationIds(reminder._id, notificationIds);
    console.log(`💾 ${notificationIds.length} notificaciones guardadas para recordatorio ${reminder._id}`);

    return notificationIds;
  } catch (error) {
    console.error('❌ Error programando notificaciones:', error);
    return [];
  }
};

/**
 * Cancela todas las notificaciones de un recordatorio específico
 * @param {string} reminderId - ID del recordatorio
 * @returns {Promise<void>}
 */
export const cancelReminderNotifications = async (reminderId) => {
  try {
    // Obtener los IDs de notificación guardados
    const notificationIds = await getNotificationIds(reminderId);

    if (notificationIds && notificationIds.length > 0) {
      console.log(`🗑️ Cancelando ${notificationIds.length} notificaciones para recordatorio ${reminderId}`);
      // Cancelar cada notificación
      for (const notificationId of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log(`  ✅ Cancelada: ${notificationId}`);
      }

      // Eliminar los IDs guardados
      await removeNotificationIds(reminderId);
      console.log(`✅ Todas las notificaciones canceladas para ${reminderId}`);
    } else {
      console.log(`ℹ️ No hay notificaciones programadas para recordatorio ${reminderId}`);
    }
  } catch (error) {
    console.error('❌ Error cancelando notificaciones:', error);
  }
};

/**
 * Actualiza las notificaciones de un recordatorio (cancela las viejas y crea nuevas)
 * @param {Object} reminder - Objeto con datos del recordatorio actualizado
 * @returns {Promise<Array<string>>} Array de IDs de las nuevas notificaciones
 */
export const updateReminderNotifications = async (reminder) => {
  try {
    // Primero cancelar las notificaciones existentes
    await cancelReminderNotifications(reminder._id);

    // Luego programar las nuevas si el recordatorio está activo
    if (reminder.active) {
      return await scheduleReminderNotifications(reminder);
    }

    return [];
  } catch (error) {
    console.error('Error actualizando notificaciones:', error);
    return [];
  }
};

/**
 * Guarda los IDs de notificación en AsyncStorage
 * @param {string} reminderId - ID del recordatorio
 * @param {Array<string>} notificationIds - Array de IDs de notificaciones
 * @returns {Promise<void>}
 */
const saveNotificationIds = async (reminderId, notificationIds) => {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    const allIds = stored ? JSON.parse(stored) : {};
    allIds[reminderId] = notificationIds;
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(allIds));
  } catch (error) {
    console.error('Error guardando IDs de notificación:', error);
  }
};

/**
 * Obtiene los IDs de notificación guardados para un recordatorio
 * @param {string} reminderId - ID del recordatorio
 * @returns {Promise<Array<string>|null>} Array de IDs o null
 */
const getNotificationIds = async (reminderId) => {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    if (!stored) return null;
    const allIds = JSON.parse(stored);
    return allIds[reminderId] || null;
  } catch (error) {
    console.error('Error obteniendo IDs de notificación:', error);
    return null;
  }
};

/**
 * Elimina los IDs de notificación guardados para un recordatorio
 * @param {string} reminderId - ID del recordatorio
 * @returns {Promise<void>}
 */
const removeNotificationIds = async (reminderId) => {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    if (!stored) return;
    const allIds = JSON.parse(stored);
    delete allIds[reminderId];
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(allIds));
  } catch (error) {
    console.error('Error eliminando IDs de notificación:', error);
  }
};

/**
 * Cancela todas las notificaciones programadas
 * @returns {Promise<void>}
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(NOTIFICATION_IDS_KEY);
    console.log('Todas las notificaciones canceladas');
  } catch (error) {
    console.error('Error cancelando todas las notificaciones:', error);
  }
};

/**
 * Lista todas las notificaciones programadas (útil para debug)
 * @returns {Promise<Array>}
 */
export const getAllScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Notificaciones programadas:', notifications);
    return notifications;
  } catch (error) {
    console.error('Error obteniendo notificaciones programadas:', error);
    return [];
  }
};

export default {
  requestNotificationPermissions,
  scheduleReminderNotifications,
  cancelReminderNotifications,
  updateReminderNotifications,
  cancelAllNotifications,
  getAllScheduledNotifications,
};
