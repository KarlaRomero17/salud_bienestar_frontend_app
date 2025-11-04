import React, { useState, useEffect } from 'react';
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

const RemindersScreen = () => {
  const [reminders, setReminders] = useState([]);
  const [todayReminders, setTodayReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newReminder, setNewReminder] = useState({
    nombre: '',
    dosis: '',
    hora: '08:00',
    dias: [],
    activo: true,
    userId: '-OdER-8T0_WKhxrfi5HY', // Tu userId temporal
  });

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Cargar recordatorios
  const cargarRecordatorios = async () => {
    try {
      setLoading(true);
      const resultado = await recordatoriosService.obtenerTodos();
      
      if (resultado.exito) {
        setReminders(resultado.datos);
        
        // Filtrar recordatorios de hoy
        const hoy = getToday();
        const recordatoriosHoy = resultado.datos.filter(reminder => 
          reminder.active && reminder.days.includes(hoy)
        );
        setTodayReminders(recordatoriosHoy);
      } else {
        Alert.alert('Error', resultado.mensaje || 'Error al cargar recordatorios');
      }
    } catch (error) {
      console.error('Error cargando recordatorios:', error);
      Alert.alert('Error', 'No se pudieron cargar los recordatorios');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    cargarRecordatorios();
  };

  // Cargar al montar el componente
  useEffect(() => {
    cargarRecordatorios();
  }, []);

  const toggleDay = (day) => {
    const updatedDays = newReminder.dias.includes(day)
      ? newReminder.dias.filter(d => d !== day)
      : [...newReminder.dias, day];
    setNewReminder({ ...newReminder, dias: updatedDays });
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
        
        // Actualizar recordatorios de hoy si corresponde
        const hoy = getToday();
        if (resultado.datos.active && resultado.datos.days.includes(hoy)) {
          setTodayReminders(prev => [...prev, resultado.datos]);
        }
        
        setNewReminder({
          nombre: '',
          dosis: '',
          hora: '08:00',
          dias: [],
          activo: true,
          userId: '-OdER-8T0_WKhxrfi5HY',
        });
        setModalVisible(false);
        Alert.alert('Éxito', 'Recordatorio creado correctamente');
      } else {
        Alert.alert('Error', resultado.mensaje || 'Error al crear recordatorio');
      }
    } catch (error) {
      console.error('Error creando recordatorio:', error);
      Alert.alert('Error', 'No se pudo crear el recordatorio');
    } finally {
      setSaving(false);
    }
  };

  const toggleReminder = async (id, currentActive) => {
    try {
      const resultado = await recordatoriosService.alternarEstado(id);
      
      if (resultado.exito) {
        // Actualizar estado local
        setReminders(prev => 
          prev.map(reminder =>
            reminder._id === id ? resultado.datos : reminder
          )
        );
        
        // Actualizar recordatorios de hoy
        const hoy = getToday();
        if (resultado.datos.days.includes(hoy)) {
          if (resultado.datos.active) {
            setTodayReminders(prev => [...prev, resultado.datos]);
          } else {
            setTodayReminders(prev => prev.filter(r => r._id !== id));
          }
        } else if (!resultado.datos.active) {
          setTodayReminders(prev => prev.filter(r => r._id !== id));
        }
      } else {
        Alert.alert('Error', resultado.mensaje || 'Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado');
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
              } else {
                Alert.alert('Error', resultado.mensaje || 'Error al eliminar');
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
                // Actualizar el recordatorio en la lista
                setReminders(prev => 
                  prev.map(reminder =>
                    reminder._id === id ? resultado.datos : reminder
                  )
                );
                
                Alert.alert('Éxito', 'Medicamento marcado como tomado');
              } else {
                Alert.alert('Error', resultado.mensaje || 'Error al marcar como tomado');
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

  const renderReminderItem = ({ item }) => (
    <View style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <Text style={styles.reminderName}>{item.name}</Text>
          <Text style={styles.reminderDosage}>{item.dosage}</Text>
          <View style={styles.daysContainer}>
            {daysOfWeek.map(day => (
              <Text
                key={day}
                style={[
                  styles.dayText,
                  item.days.includes(day) ? styles.dayActive : styles.dayInactive,
                ]}>
                {day}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>
      
      <View style={styles.reminderActions}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>
            {item.active ? 'Activo' : 'Inactivo'}
          </Text>
          <Switch
            value={item.active}
            onValueChange={() => toggleReminder(item._id, item.active)}
            trackColor={{ false: '#767577', true: '#9bfab0' }}
            thumbColor={item.active ? '#2a8c4a' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.takenButton]}
            onPress={() => markAsTaken(item._id, item.name)}>
            <Text style={styles.actionText}>✅</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteReminder(item._id, item.name)}>
            <Text style={styles.actionText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTodayReminder = (item) => (
    <View key={item._id} style={styles.todayReminder}>
      <View style={styles.todayReminderInfo}>
        <Text style={styles.todayReminderName}>{item.name}</Text>
        <Text style={styles.todayReminderDosage}>{item.dosage}</Text>
      </View>
      <View style={styles.todayActions}>
        <Text style={styles.todayReminderTime}>{item.time}</Text>
        <TouchableOpacity 
          style={styles.todayActionButton}
          onPress={() => markAsTaken(item._id, item.name)}>
          <Text style={styles.todayActionText}>Tomar</Text>
        </TouchableOpacity>
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
      {/* Recordatorios de hoy */}
      <View style={styles.todaySection}>
        <Text style={styles.sectionTitle}>📅 Recordatorios de Hoy</Text>
        {todayReminders.length > 0 ? (
          todayReminders.map(renderTodayReminder)
        ) : (
          <Text style={styles.noRemindersText}>No hay recordatorios para hoy</Text>
        )}
      </View>

      {/* Todos los recordatorios */}
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
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>💊 Todos los Recordatorios</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No tienes recordatorios configurados
            </Text>
            <Text style={styles.emptyStateSubtext}>
              ¡Agrega tu primer recordatorio!
            </Text>
          </View>
        }
      />

      {/* Botón flotante para agregar */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Icon name="add" size={30} color="#ffffff" />
      </TouchableOpacity>

      {/* Modal para agregar recordatorio */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Recordatorio</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre del medicamento/suplemento"
              value={newReminder.nombre}
              onChangeText={text => setNewReminder({ ...newReminder, nombre: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Dosificación (ej: 1 cápsula, 2 tabletas)"
              value={newReminder.dosis}
              onChangeText={text => setNewReminder({ ...newReminder, dosis: text })}
            />

            <Text style={styles.inputLabel}>Hora del recordatorio</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              value={newReminder.hora}
              onChangeText={text => setNewReminder({ ...newReminder, hora: text })}
            />

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
                onPress={() => setModalVisible(false)}
                disabled={saving}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={addReminder}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  todaySection: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 15,
  },
  todayReminder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#64c27b',
  },
  todayReminderInfo: {
    flex: 1,
  },
  todayReminderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 4,
  },
  todayReminderDosage: {
    fontSize: 14,
    color: '#666',
  },
  todayReminderTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a8c4a',
  },
  noRemindersText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  listContainer: {
    padding: 20,
  },
  reminderCard: {
    backgroundColor: '#d0fdd7',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 5,
  },
  reminderDosage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  daysContainer: {
    flexDirection: 'row',
  },
  dayText: {
    fontSize: 12,
    marginRight: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dayActive: {
    backgroundColor: '#2a8c4a',
    color: '#ffffff',
  },
  dayInactive: {
    backgroundColor: '#e0e0e0',
    color: '#999',
  },
  timeContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2a8c4a',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a8c4a',
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#64c27b',
    borderRadius: 20,
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '500',
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 10,
  },
  daysSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayButton: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a8c4a',
    borderRadius: 20,
    marginBottom: 5,
  },
  dayButtonActive: {
    backgroundColor: '#2a8c4a',
  },
  dayButtonText: {
    fontSize: 12,
    color: '#2a8c4a',
    fontWeight: '500',
  },
  dayButtonTextActive: {
    color: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#2a8c4a',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  todayActions: {
    alignItems: 'flex-end',
  },
  todayActionButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#64c27b',
    borderRadius: 15,
    marginTop: 5,
  },
  todayActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  takenButton: {
    backgroundColor: '#27ae60',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },

});

export default RemindersScreen;