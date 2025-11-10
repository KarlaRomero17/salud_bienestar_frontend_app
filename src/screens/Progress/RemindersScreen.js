import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Layout from '../../components/Layout';
import { recordatoriosService } from '../../services/recordatoriosService';
import { AuthContext } from '../../context/AuthContext';
import { useNotifications } from '../../utils/useNotifications';

const RemindersScreen = () => {
  const { user } = useContext(AuthContext);
  const [reminders, setReminders] = useState([]);
  const [todayReminders, setTodayReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [notificationSettingsVisible, setNotificationSettingsVisible] = useState(false);
  const { notificationsEnabled, isLoading, requestPermissions, enviarNotificacionPrueba } = useNotifications(user?.uid);
  const [newReminder, setNewReminder] = useState({
    nombre: '',
    dosis: '',
    hora: '08:00',
    dias: [],
    activo: true,
    userId: user?.uid || '', // Usar el UID del usuario en sesión
  });

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const probarNotificacion = async () => {
    await enviarNotificacionPrueba();
  };
  const activarNotificaciones = async () => {
    await requestPermissions();
  };
  const NotificationStatus = () => (
    <TouchableOpacity
      style={styles.notificationStatus}
      onPress={() => setNotificationSettingsVisible(true)}
    >
      <Icon
        name={notificationsEnabled ? "notifications-active" : "notifications-off"}
        size={20}
        color={notificationsEnabled ? "#2a8c4a" : "#666"}
      />
      <Text style={styles.notificationStatusText}>
        {notificationsEnabled ? 'Notificaciones activas' : 'Activar notificaciones'}
      </Text>
    </TouchableOpacity>
  );


  // Cargar recordatorios
  const cargarRecordatorios = async () => {
    // Validar que el usuario esté autenticado
    if (!user?.uid) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
      return;
    }

    try {
      setLoading(true);

      const resultadoTodos = await recordatoriosService.obtenerTodos();
      if (resultadoTodos.exito) {
        setReminders(resultadoTodos.datos);
      }

      const resultadoHoy = await recordatoriosService.obtenerDeHoy();
      if (resultadoHoy.exito) {
        setTodayReminders(resultadoHoy.datos);
      } else {
        const hoy = getToday();
        const recordatoriosHoy = resultadoTodos.datos.filter(reminder =>
          reminder.active && reminder.days.includes(hoy)
        );
        setTodayReminders(recordatoriosHoy);
      }
    } catch (error) {
      console.error('Error cargando recordatorios:', error);
      Alert.alert('Error', 'No se pudieron cargar los recordatorios');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarRecordatorios();
  };

  useEffect(() => {
    cargarRecordatorios();
  }, []);

  // Actualizar userId cuando el usuario cambie
  useEffect(() => {
    if (user?.uid) {
      setNewReminder(prev => ({
        ...prev,
        userId: user.uid
      }));
    }
  }, [user?.uid]);

  const toggleDay = (day) => {
    const updatedDays = newReminder.dias.includes(day)
      ? newReminder.dias.filter(d => d !== day)
      : [...newReminder.dias, day];
    setNewReminder({ ...newReminder, dias: updatedDays });
  };

  const toggleEditDay = (day) => {
    const updatedDays = editingReminder.dias.includes(day)
      ? editingReminder.dias.filter(d => d !== day)
      : [...editingReminder.dias, day];
    setEditingReminder({ ...editingReminder, dias: updatedDays });
  };

  // Abrir modal de edición
  const openEditModal = (reminder) => {
    setEditingReminder({
      _id: reminder._id,
      nombre: reminder.name,
      dosis: reminder.dosage,
      hora: reminder.time,
      dias: [...reminder.days],
      activo: reminder.active,
      userId: reminder.userId,
    });
    setEditModalVisible(true);
  };

  // Cerrar modales y resetear estados
  const closeModals = () => {
    setModalVisible(false);
    setEditModalVisible(false);
    setEditingReminder(null);
    setNewReminder({
      nombre: '',
      dosis: '',
      hora: '08:00',
      dias: [],
      activo: true,
      userId: user?.uid || '', // Usar el UID del usuario en sesión
    });
  };

  const addReminder = async () => {
    if (!newReminder.nombre || !newReminder.dosis || newReminder.dias.length === 0) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setSaving(true);
      const resultado = await recordatoriosService.crear(newReminder);

      if (resultado.exito) {
        setReminders(prev => [...prev, resultado.datos]);
        const resultadoHoy = await recordatoriosService.obtenerDeHoy();
        if (resultadoHoy.exito) {
          setTodayReminders(resultadoHoy.datos);
        }

        closeModals();
        Alert.alert('Éxito', 'Recordatorio creado correctamente');
      }
    } catch (error) {
      console.error('Error creando recordatorio:', error);
      Alert.alert('Error', 'No se pudo crear el recordatorio');
    } finally {
      setSaving(false);
    }
  };

  const updateReminder = async () => {
    if (!editingReminder.nombre || !editingReminder.dosis || editingReminder.dias.length === 0) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setSaving(true);
      const datosActualizacion = {
        nombre: editingReminder.nombre,
        dosis: editingReminder.dosis,
        hora: editingReminder.hora,
        dias: editingReminder.dias,
        activo: editingReminder.activo,
      };

      const resultado = await recordatoriosService.actualizar(editingReminder._id, datosActualizacion);

      if (resultado.exito) {
        setReminders(prev =>
          prev.map(reminder =>
            reminder._id === editingReminder._id ? resultado.datos : reminder
          )
        );

        const resultadoHoy = await recordatoriosService.obtenerDeHoy();
        if (resultadoHoy.exito) {
          setTodayReminders(resultadoHoy.datos);
        }

        closeModals();
        Alert.alert('Éxito', 'Recordatorio actualizado correctamente');
      }
    } catch (error) {
      console.error('Error actualizando recordatorio:', error);
      Alert.alert('Error', 'No se pudo actualizar el recordatorio');
    } finally {
      setSaving(false);
    }
  };

  const toggleReminder = async (id) => {
    try {
      const resultado = await recordatoriosService.alternarEstado(id);
      if (resultado.exito) {
        setReminders(prev =>
          prev.map(reminder => reminder._id === id ? resultado.datos : reminder)
        );
        const resultadoHoy = await recordatoriosService.obtenerDeHoy();
        if (resultadoHoy.exito) {
          setTodayReminders(resultadoHoy.datos);
        }
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado');
    }
  };

  const enviarNotificacionLocalPrueba = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 Recordatorio Local',
        body: 'Esta es una notificación local de prueba',
        sound: true,
        data: { type: 'test-local' },
      },
      trigger: {
        seconds: 5, // En 5 segundos
      },
    });
    
    Alert.alert('✅', 'Notificación local programada para 5 segundos');
  } catch (error) {
    console.error('Error notificación local:', error);
  }
};

  const deleteReminder = async (id, name) => {
    Alert.alert(
      'Eliminar Recordatorio',
      `¿Estás seguro de que quieres eliminar "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const resultado = await recordatoriosService.eliminar(id);
              if (resultado.exito) {
                setReminders(prev => prev.filter(reminder => reminder._id !== id));
                setTodayReminders(prev => prev.filter(reminder => reminder._id !== id));
                Alert.alert('Éxito', 'Recordatorio eliminado correctamente');
              }
            } catch (error) {
              console.error('Error eliminando recordatorio:', error);
              Alert.alert('Error', 'No se pudo eliminar el recordatorio');
            }
          },
        },
      ]
    );
  };

  const markAsTaken = async (id, name) => {
    Alert.alert(
      'Marcar como Tomado',
      `¿Marcar "${name}" como tomado?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, tomado',
          onPress: async () => {
            try {
              const resultado = await recordatoriosService.marcarTomado(id);
              if (resultado.exito) {
                setReminders(prev =>
                  prev.map(reminder => reminder._id === id ? resultado.datos : reminder)
                );
                const resultadoHoy = await recordatoriosService.obtenerDeHoy();
                if (resultadoHoy.exito) {
                  setTodayReminders(resultadoHoy.datos);
                }
                Alert.alert('Éxito', 'Medicamento marcado como tomado');
              }
            } catch (error) {
              console.error('Error marcando como tomado:', error);
              Alert.alert('Error', 'No se pudo marcar como tomado');
            }
          },
        },
      ]
    );
  };

  // Modal de configuracion de notificaciones (agregar en tu JSX)
  const NotificationSettingsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={notificationSettingsVisible}
      onRequestClose={() => setNotificationSettingsVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Configuración de Notificaciones</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setNotificationSettingsVisible(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.notificationInfo}>
            <Icon
              name={notificationsEnabled ? "check-circle" : "notifications-off"}
              size={40}
              color={notificationsEnabled ? "#2a8c4a" : "#FFA500"}
            />
            <Text style={styles.notificationStatusTitle}>
              {notificationsEnabled ? 'Notificaciones Activadas' : 'Notificaciones Desactivadas'}
            </Text>
            <Text style={styles.notificationStatusDescription}>
              {notificationsEnabled
                ? `Tienes permisos para recibir notificaciones. ${todayReminders.length} recordatorio(s) programados para hoy.`
                : 'Necesitas activar los permisos de notificación para recibir recordatorios.'}
            </Text>

            {permissionStatus === 'denied' && Platform.OS === 'android' && (
              <TouchableOpacity
                style={styles.permissionHelp}
                onPress={mostrarInfoPermisos}>
                <Text style={styles.permissionHelpText}>
                  ¿Los permisos fueron denegados? Toca aquí para ver cómo activarlos.
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setNotificationSettingsVisible(false)}>
              <Text style={styles.cancelButtonText}>Cerrar</Text>
            </TouchableOpacity>

            {!notificationsEnabled ? (
              <TouchableOpacity
                style={[styles.modalButton, styles.activateButton]}
                onPress={requestPermissions}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="notifications" size={18} color="#FFFFFF" />
                    <Text style={styles.activateButtonText}> Activar</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.modalButton, styles.testButton]}
                onPress={enviarNotificacionPrueba}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="send" size={18} color="#FFFFFF" />
                    <Text style={styles.testButtonText}> Probar</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderReminderItem = ({ item }) => (
    <View style={[
      styles.reminderCard,
      !item.active && styles.reminderCardInactive
    ]}>
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <View style={styles.titleRow}>
            <Icon name="medication" size={20} color="#2a8c4a" />
            <Text style={styles.reminderName}>{item.name}</Text>
          </View>
          <View style={styles.dosageRow}>
            <Icon name="science" size={16} color="#666" />
            <Text style={styles.reminderDosage}>{item.dosage}</Text>
          </View>
          <View style={styles.daysContainer}>
            {daysOfWeek.map(day => (
              <View
                key={day}
                style={[
                  styles.dayPill,
                  item.days.includes(day) ? styles.dayPillActive : styles.dayPillInactive,
                ]}>
                <Text style={[
                  styles.dayText,
                  item.days.includes(day) ? styles.dayTextActive : styles.dayTextInactive,
                ]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Icon name="access-time" size={18} color="#2a8c4a" />
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>

      <View style={styles.reminderActions}>
        <View style={styles.statusContainer}>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>
              {item.active ? 'Activo' : 'Inactivo'}
            </Text>
            <Switch
              value={item.active}
              onValueChange={() => toggleReminder(item._id)}
              trackColor={{ false: '#767577', true: '#9bfab0' }}
              thumbColor={item.active ? '#2a8c4a' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditModal(item)}>
            <Icon name="edit" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.takenButton]}
            onPress={() => markAsTaken(item._id, item.name)}>
            <Icon name="check-circle" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteReminder(item._id, item.name)}>
            <Icon name="delete-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTodayReminder = (item) => (
    <View key={item._id} style={styles.todayReminder}>
      <View style={styles.todayReminderContent}>
        <View style={styles.todayReminderIcon}>
          <Icon name="notifications-active" size={24} color="#2a8c4a" />
        </View>
        <View style={styles.todayReminderInfo}>
          <Text style={styles.todayReminderName}>{item.name}</Text>
          <Text style={styles.todayReminderDosage}>{item.dosage}</Text>
        </View>
        <View style={styles.todayActions}>
          <Text style={styles.todayReminderTime}>{item.time}</Text>
          <TouchableOpacity
            style={styles.todayActionButton}
            onPress={() => markAsTaken(item._id, item.name)}>
            <Icon name="check" size={16} color="#FFFFFF" />
            <Text style={styles.todayActionText}>Tomar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  function getToday() {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[new Date().getDay()];
  }

  if (loading && !refreshing) {
    return (
      <Layout title="Mis Recordatorios">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2a8c4a" />
          <Text style={styles.loadingText}>Cargando recordatorios...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout title="Mis Recordatorios">
      {/* Header con estadísticas */}
      <View style={styles.headerStats}>
        <View style={styles.statItem}>
          <Icon name="today" size={24} color="#2a8c4a" />
          <Text style={styles.statNumber}>{todayReminders.length}</Text>
          <Text style={styles.statLabel}>Para hoy</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="list-alt" size={24} color="#2a8c4a" />
          <Text style={styles.statNumber}>{reminders.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Recordatorios de hoy */}
      <View style={styles.todaySection}>
        <View style={styles.sectionHeader}>
          <Icon name="schedule" size={20} color="#2a8c4a" />
          <Text style={styles.sectionTitle}>Recordatorios de Hoy</Text>
        </View>
        {todayReminders.length > 0 ? (
          todayReminders.map(renderTodayReminder)
        ) : (
          <View style={styles.emptyToday}>
            <Icon name="event-available" size={40} color="#d0fdd7" />
            <Text style={styles.noRemindersText}>No hay recordatorios para hoy</Text>
            <Text style={styles.noRemindersSubtext}>¡Descansa o agrega nuevos recordatorios!</Text>
          </View>
        )}
      </View>

      {/* Todos los recordatorios */}
      <View style={styles.allRemindersSection}>
        <View style={styles.sectionHeader}>
          <Icon name="format-list-bulleted" size={20} color="#2a8c4a" />
          <Text style={styles.sectionTitle}>Todos los Recordatorios</Text>
        </View>
        <FlatList
          data={reminders}
          renderItem={renderReminderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2a8c4a']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="add-circle-outline" size={50} color="#d0fdd7" />
              <Text style={styles.emptyStateText}>
                No tienes recordatorios configurados
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Agrega tu primer recordatorio para comenzar
              </Text>
            </View>
          }
        />
      </View>

      {/* Botón flotante para agregar */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Icon name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal para agregar recordatorio */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModals}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Recordatorio</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModals}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Icon name="medication" size={20} color="#2a8c4a" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre del medicamento"
                value={newReminder.nombre}
                onChangeText={text => setNewReminder({ ...newReminder, nombre: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Icon name="science" size={20} color="#2a8c4a" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Dosificación (ej: 1 cápsula)"
                value={newReminder.dosis}
                onChangeText={text => setNewReminder({ ...newReminder, dosis: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Icon name="access-time" size={20} color="#2a8c4a" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={newReminder.hora}
                onChangeText={text => setNewReminder({ ...newReminder, hora: text })}
              />
            </View>

            <Text style={styles.inputLabel}>Días de la semana</Text>
            <View style={styles.daysSelector}>
              {daysOfWeek.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    newReminder.dias.includes(day) && styles.dayButtonActive,
                  ]}
                  onPress={() => toggleDay(day)}>
                  <Text
                    style={[
                      styles.dayButtonText,
                      newReminder.dias.includes(day) && styles.dayButtonTextActive,
                    ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModals}
                disabled={saving}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={addReminder}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Icon name="save" size={18} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}> Guardar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para editar recordatorio */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={closeModals}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Recordatorio</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModals}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {editingReminder && (
              <>
                <View style={styles.inputGroup}>
                  <Icon name="medication" size={20} color="#2a8c4a" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre del medicamento"
                    value={editingReminder.nombre}
                    onChangeText={text => setEditingReminder({ ...editingReminder, nombre: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Icon name="science" size={20} color="#2a8c4a" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Dosificación (ej: 1 cápsula)"
                    value={editingReminder.dosis}
                    onChangeText={text => setEditingReminder({ ...editingReminder, dosis: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Icon name="access-time" size={20} color="#2a8c4a" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="HH:MM"
                    value={editingReminder.hora}
                    onChangeText={text => setEditingReminder({ ...editingReminder, hora: text })}
                  />
                </View>

                <Text style={styles.inputLabel}>Días de la semana</Text>
                <View style={styles.daysSelector}>
                  {daysOfWeek.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        editingReminder.dias.includes(day) && styles.dayButtonActive,
                      ]}
                      onPress={() => toggleEditDay(day)}>
                      <Text
                        style={[
                          styles.dayButtonText,
                          editingReminder.dias.includes(day) && styles.dayButtonTextActive,
                        ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.switchContainerModal}>
                  <Text style={styles.switchLabelModal}>Recordatorio activo</Text>
                  <Switch
                    value={editingReminder.activo}
                    onValueChange={(value) => setEditingReminder({ ...editingReminder, activo: value })}
                    trackColor={{ false: '#767577', true: '#9bfab0' }}
                    thumbColor={editingReminder.activo ? '#2a8c4a' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={closeModals}
                    disabled={saving}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={updateReminder}
                    disabled={saving}>
                    {saving ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Icon name="save" size={18} color="#FFFFFF" />
                        <Text style={styles.saveButtonText}> Actualizar</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      <NotificationStatus />
    </Layout>
  );
};

const styles = StyleSheet.create({
  editButton: {
    backgroundColor: '#FFA500',
  },
  switchContainerModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  switchLabelModal: {
    fontSize: 16,
    color: '#2a8c4a',
    fontWeight: '500',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  todaySection: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    marginTop: 10,
  },
  allRemindersSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2a8c4a',
    marginLeft: 8,
  },
  todayReminder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#64c27b',
  },
  todayReminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayReminderIcon: {
    marginRight: 12,
  },
  todayReminderInfo: {
    flex: 1,
  },
  todayReminderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2a8c4a',
    marginBottom: 2,
  },
  todayReminderDosage: {
    fontSize: 14,
    color: '#666',
  },
  todayActions: {
    alignItems: 'flex-end',
  },
  todayReminderTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2a8c4a',
    marginBottom: 6,
  },
  todayActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#64c27b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  todayActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  reminderCard: {
    backgroundColor: '#d0fdd7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderCardInactive: {
    opacity: 0.6,
    backgroundColor: '#F8F9FA',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reminderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2a8c4a',
    marginLeft: 8,
  },
  dosageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reminderDosage: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  dayPillActive: {
    backgroundColor: '#2a8c4a',
  },
  dayPillInactive: {
    backgroundColor: '#E9ECEF',
  },
  dayText: {
    fontSize: 11,
    fontWeight: '500',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  dayTextInactive: {
    color: '#666',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#64c27b',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2a8c4a',
    marginLeft: 4,
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#9bfab0',
    paddingTop: 12,
  },
  statusContainer: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginRight: 10,
    color: '#666',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  takenButton: {
    backgroundColor: '#64c27b',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  emptyToday: {
    alignItems: 'center',
    padding: 30,
  },
  noRemindersText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  noRemindersSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#64c27b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2a8c4a',
  },
  closeButton: {
    padding: 4,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0fdd7',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#2a8c4a',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2a8c4a',
    marginBottom: 10,
  },
  daysSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#64c27b',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  dayButtonActive: {
    backgroundColor: '#64c27b',
  },
  dayButtonText: {
    fontSize: 12,
    color: '#64c27b',
    fontWeight: '500',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#d0fdd7',
  },
  saveButton: {
    backgroundColor: '#64c27b',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  headerContainer: {
    paddingHorizontal: 20,
  },
  notificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationStatusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  notificationInfo: {
    alignItems: 'center',
    padding: 20,
  },
  notificationStatusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2a8c4a',
    marginTop: 10,
    marginBottom: 5,
  },
  notificationStatusDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  activateButton: {
    backgroundColor: '#2a8c4a',
  },
  activateButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16,
  },
  testButton: {
    backgroundColor: '#FFA500',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  permissionHelp: {
  marginTop: 10,
  padding: 8,
  backgroundColor: '#FFF3CD',
  borderRadius: 6,
  borderWidth: 1,
  borderColor: '#FFEAA7',
},
permissionHelpText: {
  fontSize: 12,
  color: '#856404',
  textAlign: 'center',
  fontStyle: 'italic',
},
});

export default RemindersScreen;