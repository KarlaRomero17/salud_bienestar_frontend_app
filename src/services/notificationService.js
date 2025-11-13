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
 * Calcula la próxima fecha/hora para una notificación
 * @param {number} targetWeekday - Día de la semana (1=Dom, 2=Lun, ..., 7=Sáb)
 * @param {number} hour - Hora (0-23)
 * @param {number} minute - Minuto (0-59)
 * @returns {Date} Fecha/hora de la próxima ocurrencia
 */
const getNextOccurrence = (targetWeekday, hour, minute) => {
  const now = new Date();
  const result = new Date();
  
  // Configurar la hora objetivo
  result.setHours(hour, minute, 0, 0);
  
  // Obtener el día actual (0=Domingo, 1=Lunes, ..., 6=Sábado)
  const currentWeekday = now.getDay() + 1; // Convertir a formato expo (1=Dom)
  
  // Calcular días hasta el día objetivo
  let daysToAdd = targetWeekday - currentWeekday;
  
  // Si el día ya pasó esta semana O es hoy pero la hora ya pasó
  if (daysToAdd < 0 || (daysToAdd === 0 && now > result)) {
    daysToAdd += 7; // Programar para la próxima semana
  }
  
  result.setDate(result.getDate() + daysToAdd);
  
  return result;
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

    const now = new Date();
    console.log(`📅 Programando notificaciones para "${reminder.name}" a las ${hour}:${minute < 10 ? '0' + minute : minute}`);
    console.log(`📍 Hora actual: ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`);

    // Programar una notificación para cada día configurado
    for (const day of reminder.days) {
      const weekday = dayToNumber(day);
      
      // Calcular la próxima ocurrencia de este día y hora
      const nextOccurrence = getNextOccurrence(weekday, hour, minute);
      
      // Calcular segundos hasta la próxima ocurrencia
      const secondsUntilTrigger = Math.floor((nextOccurrence.getTime() - now.getTime()) / 1000);
      
      console.log(`   ${day} → ${nextOccurrence.toLocaleString('es-ES', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      })} (en ${Math.floor(secondsUntilTrigger / 60)} min)`);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Recordatorio de Medicamento',
          body: `Es hora de tomar ${reminder.name} - ${reminder.dosage}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            reminderId: reminder._id,
            type: 'medication',
            day: day,
          },
        },
        trigger: {
          // Usar trigger calendar con repeats para que se repita semanalmente
          weekday: weekday,
          hour: hour,
          minute: minute,
          repeats: true,
        },
      });

      notificationIds.push(notificationId);
      console.log(`   ✅ ID: ${notificationId}`);
    }

    // Guardar los IDs de notificación asociados al recordatorio
    await saveNotificationIds(reminder._id, notificationIds);
    console.log(`💾 Total: ${notificationIds.length} notificaciones programadas`);

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
    console.log('📋 Notificaciones programadas:', notifications.length);
    
    notifications.forEach((notif, index) => {
      const trigger = notif.trigger;
      console.log(`  ${index + 1}. ID: ${notif.identifier}`);
      console.log(`     Título: ${notif.content.title}`);
      console.log(`     Trigger:`, trigger);
      
      if (trigger.type === 'calendar') {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const dayName = trigger.weekday ? days[trigger.weekday - 1] : 'N/A';
        console.log(`     ⏰ ${dayName} a las ${trigger.hour}:${trigger.minute < 10 ? '0' + trigger.minute : trigger.minute}`);
        console.log(`     🔁 Repetir: ${trigger.repeats ? 'Sí' : 'No'}`);
      }
    });
    
    return notifications;
  } catch (error) {
    console.error('Error obteniendo notificaciones programadas:', error);
    return [];
  }
};

/**
 * Función de debug: Verifica el estado de las notificaciones
 * @returns {Promise<Object>}
 */
export const debugNotifications = async () => {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const stored = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    
    const debugInfo = {
      permissions: permissions.status,
      scheduledCount: scheduled.length,
      storedIds: stored ? Object.keys(JSON.parse(stored)).length : 0,
      scheduled: scheduled.map(n => ({
        id: n.identifier,
        trigger: n.trigger,
        content: n.content.title,
      })),
    };
    
    console.log('🔍 DEBUG NOTIFICACIONES:');
    console.log('  Permisos:', debugInfo.permissions);
    console.log('  Programadas:', debugInfo.scheduledCount);
    console.log('  IDs guardados:', debugInfo.storedIds);
    
    return debugInfo;
  } catch (error) {
    console.error('Error en debug:', error);
    return null;
  }
};

export default {
  requestNotificationPermissions,
  scheduleReminderNotifications,
  cancelReminderNotifications,
  updateReminderNotifications,
  cancelAllNotifications,
  getAllScheduledNotifications,
  debugNotifications,
};
