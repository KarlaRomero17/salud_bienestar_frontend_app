// RemindersScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Layout from '../../components/Layout';

const RemindersScreen = () => {
  const [reminders, setReminders] = useState([
    {
      id: '1',
      name: 'Vitamina D',
      dosage: '1 cápsula',
      time: '08:00',
      days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
      active: true,
    },
    {
      id: '2',
      name: 'Omega 3',
      dosage: '2 cápsulas',
      time: '20:00',
      days: ['Lun', 'Mié', 'Vie'],
      active: true,
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newReminder, setNewReminder] = useState({
    name: '',
    dosage: '',
    time: '08:00',
    days: [],
    active: true,
  });

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const toggleDay = (day) => {
    const updatedDays = newReminder.days.includes(day)
      ? newReminder.days.filter(d => d !== day)
      : [...newReminder.days, day];
    setNewReminder({ ...newReminder, days: updatedDays });
  };

  const addReminder = () => {
    if (newReminder.name && newReminder.dosage && newReminder.days.length > 0) {
      const reminder = {
        id: Date.now().toString(),
        ...newReminder,
      };
      setReminders([...reminders, reminder]);
      setNewReminder({
        name: '',
        dosage: '',
        time: '08:00',
        days: [],
        active: true,
      });
      setModalVisible(false);
    }
  };

  const toggleReminder = (id) => {
    setReminders(reminders.map(reminder =>
      reminder.id === id
        ? { ...reminder, active: !reminder.active }
        : reminder
    ));
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
            onValueChange={() => toggleReminder(item.id)}
            trackColor={{ false: '#767577', true: '#9bfab0' }}
            thumbColor={item.active ? '#2a8c4a' : '#f4f3f4'}
          />
        </View>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Tomar ahora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const todayReminders = reminders.filter(reminder => 
    reminder.active && reminder.days.includes(getToday())
  );

  function getToday() {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[new Date().getDay()];
  }

  return (
    <Layout title="Mis Recordatorios">
      {/* Recordatorios de hoy */}
      <View style={styles.todaySection}>
        <Text style={styles.sectionTitle}>Recordatorios de Hoy</Text>
        {todayReminders.length > 0 ? (
          todayReminders.map(reminder => (
            <View key={reminder.id} style={styles.todayReminder}>
              <View style={styles.todayReminderInfo}>
                <Text style={styles.todayReminderName}>{reminder.name}</Text>
                <Text style={styles.todayReminderDosage}>{reminder.dosage}</Text>
              </View>
              <Text style={styles.todayReminderTime}>{reminder.time}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noRemindersText}>No hay recordatorios para hoy</Text>
        )}
      </View>

      {/* Todos los recordatorios */}
      <FlatList
        data={reminders}
        renderItem={renderReminderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Todos los Recordatorios</Text>
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

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Icon name="add" size={30} color="#ffffff" />
      </TouchableOpacity>

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
              value={newReminder.name}
              onChangeText={text => setNewReminder({ ...newReminder, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Dosificación (ej: 1 cápsula, 2 tabletas)"
              value={newReminder.dosage}
              onChangeText={text => setNewReminder({ ...newReminder, dosage: text })}
            />

            <Text style={styles.inputLabel}>Hora del recordatorio</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              value={newReminder.time}
              onChangeText={text => setNewReminder({ ...newReminder, time: text })}
            />

            <Text style={styles.inputLabel}>Días de la semana</Text>
            <View style={styles.daysSelector}>
              {daysOfWeek.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    newReminder.days.includes(day) && styles.dayButtonActive,
                  ]}
                  onPress={() => toggleDay(day)}>
                  <Text
                    style={[
                      styles.dayButtonText,
                      newReminder.days.includes(day) && styles.dayButtonTextActive,
                    ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addReminder}>
                <Text style={styles.saveButtonText}>Guardar</Text>
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
});

export default RemindersScreen;