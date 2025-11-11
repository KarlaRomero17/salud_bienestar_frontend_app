import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Layout from '../../components/Layout';
import { goalService } from '../../services/goalService'; // ✅ Usar el servicio corregido
import { AuthContext } from '../../context/AuthContext';

const HealthGoalsScreen = () => {
  const [goals, setGoals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const { user } = useContext(AuthContext);
  
  // ... (resto del código se mantiene igual)

  const loadGoals = async () => {
    const userId = user?.uid;
    
    if (!userId) {
      console.log('❌ userId no disponible');
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Cargando objetivos para userId:', userId);
      
      // ✅ Usar el servicio corregido
      const response = await goalService.obtenerTodos(userId);
      console.log('📦 Respuesta completa del servidor:', response);
      
      if (response.success) {
        setGoals(response.data || []);
        console.log('✅ Objetivos cargados del servidor:', response.data?.length || 0);
        
        if (!response.data || response.data.length === 0) {
          console.log('📭 No hay objetivos en la base de datos');
        }
      } else {
        console.log('❌ El servidor respondió con success: false');
        setGoals([]);
      }
    } catch (error) {
      console.error('💥 Error cargando objetivos:', error.message);
      
      setGoals([]);
      
      Alert.alert(
        'Error de conexión', 
        'No se pudieron cargar los objetivos. Verifica tu conexión al servidor.'
      );
    } finally {
      setLoading(false);
    }
  };

    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      type: goal.type,
      targetWeight: goal.targetWeight.toString(),
      unit: goal.unit,
      targetDate: goal.targetDate,
    });
    
    const goalDate = new Date(goal.targetDate);
    setSelectedYear(goalDate.getFullYear());
    setSelectedMonth(goalDate.getMonth());
    setSelectedDay(goalDate.getDate());
    
    setModalVisible(true);
  };

  const saveGoal = async () => {
    if (!newGoal.title || !newGoal.targetWeight || !newGoal.targetDate) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!user?.uid) {
      Alert.alert('Error', 'Usuario no identificado');
      return;
    }

    try {
      setLoading(true);
      const goalData = {
        title: newGoal.title,
        type: newGoal.type,
        targetWeight: parseFloat(newGoal.targetWeight),
        unit: newGoal.unit,
        targetDate: newGoal.targetDate,
        userId: user.uid
      };

      console.log('💾 Guardando objetivo:', goalData);

      let response;
      if (editingGoal) {
        response = await goalAPI.updateGoal(editingGoal._id, goalData);
      } else {
        response = await goalAPI.createGoal(goalData);
      }

      console.log('✅ Respuesta guardar:', response.data);

      if (response.data.success) {
        await loadGoals(); // Recargar los objetivos desde el servidor
        setModalVisible(false);
        resetForm();
        Alert.alert('Éxito', editingGoal ? 'Objetivo actualizado' : 'Objetivo creado');
      }
    } catch (error) {
      console.error('💥 Error guardando objetivo:', error);
      Alert.alert('Error', 'No se pudo guardar el objetivo. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (goal) => {
    if (!user?.uid) {
      Alert.alert('Error', 'Usuario no identificado');
      return;
    }

    Alert.alert(
      'Eliminar Objetivo',
      `¿Estás seguro de que quieres eliminar "${goal.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await goalAPI.deleteGoal(goal._id, user.uid);
              if (response.data.success) {
                await loadGoals(); // Recargar los objetivos desde el servidor
                Alert.alert('Éxito', 'Objetivo eliminado');
              }
            } catch (error) {
              console.error('Error eliminando objetivo:', error);
              Alert.alert('Error', 'No se pudo eliminar el objetivo');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const updateProgress = async (goalId, progress) => {
    if (!user?.uid) {
      Alert.alert('Error', 'Usuario no identificado');
      return;
    }

    try {
      console.log('🔄 Actualizando progreso:', goalId, progress);
      const response = await goalAPI.updateProgress(goalId, progress, user.uid);
      if (response.data.success) {
        await loadGoals(); // Recargar los objetivos desde el servidor
      }
    } catch (error) {
      console.error('Error actualizando progreso:', error);
      Alert.alert('Error', 'No se pudo actualizar el progreso');
    }
  };

  const confirmDateSelection = () => {
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    setNewGoal({ ...newGoal, targetDate: formattedDate });
    setDateModalVisible(false);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openDatePicker = () => {
    if (newGoal.targetDate) {
      const currentDate = new Date(newGoal.targetDate);
      setSelectedYear(currentDate.getFullYear());
      setSelectedMonth(currentDate.getMonth());
      setSelectedDay(currentDate.getDate());
    }
    setDateModalVisible(true);
  };

  const ProgressSelector = ({ goal }) => (
    <View style={styles.progressSelector}>
      <Text style={styles.progressLabel}>Progreso:</Text>
      <View style={styles.progressButtons}>
        {[0, 25, 50, 75, 100].map((progress) => (
          <TouchableOpacity
            key={progress}
            style={[
              styles.progressButton,
              goal.progress === progress && styles.progressButtonActive,
            ]}
            onPress={() => updateProgress(goal._id, progress)}
          >
            <Text style={[
              styles.progressButtonText,
              goal.progress === progress && styles.progressButtonTextActive,
            ]}>
              {progress}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderGoalItem = ({ item }) => (
    <View style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={styles.goalIcon}>
          <Icon
            name={goalTypes.find(type => type.id === item.type)?.icon || 'flag'}
            size={24}
            color="#2a8c4a"
          />
        </View>
        <View style={styles.goalInfo}>
          <Text style={styles.goalTitle}>{item.title}</Text>
          <Text style={styles.goalTarget}>
            {item.type === 'gain' ? 'Aumentar' : item.type === 'loss' ? 'Reducir' : 'Mantener'} {item.targetWeight} {item.unit}
          </Text>
          <Text style={styles.goalTarget}>
            Fecha objetivo: {formatDisplayDate(item.targetDate)}
          </Text>
        </View>
        <View style={styles.goalActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Icon name="edit" size={20} color="#2a8c4a" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => deleteGoal(item)}
          >
            <Icon name="delete" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ProgressSelector goal={item} />
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${item.progress}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {item.progress}%
        </Text>
      </View>
    </View>
  );

  const DatePickerColumn = ({ data, selectedValue, onValueChange, style }) => (
    <ScrollView style={[styles.pickerColumn, style]} showsVerticalScrollIndicator={false}>
      {data.map((item, index) => {
        const value = typeof item === 'object' ? item.value : item;
        const label = typeof item === 'object' ? item.name || item.label : item;
        const isSelected = value === selectedValue;
        
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.pickerItem,
              isSelected && styles.pickerItemSelected
            ]}
            onPress={() => onValueChange(value)}>
            <Text style={[
              styles.pickerItemText,
              isSelected && styles.pickerItemTextSelected
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <Layout title="Mis Objetivos">
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2a8c4a" />
          <Text style={styles.loadingText}>Cargando objetivos...</Text>
        </View>
      )}

      <FlatList
        data={goals}
        renderItem={renderGoalItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={loadGoals}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {loading ? 'Cargando...' : 'No tienes objetivos configurados'}
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
            >
              <Text style={styles.emptyStateButtonText}>
                Crear primer objetivo
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Icon name="add" size={30} color="#ffffff" />
      </TouchableOpacity>

      {/* Modal para crear/editar objetivo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingGoal ? 'Editar Objetivo' : 'Nuevo Objetivo'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Título del objetivo"
              value={newGoal.title}
              onChangeText={text => setNewGoal({ ...newGoal, title: text })}
            />

            <Text style={styles.inputLabel}>Tipo de objetivo</Text>
            <View style={styles.typeSelector}>
              {goalTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    newGoal.type === type.id && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewGoal({ ...newGoal, type: type.id })}>
                  <Icon
                    name={type.icon}
                    size={20}
                    color={newGoal.type === type.id ? '#ffffff' : '#2a8c4a'}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      newGoal.type === type.id && styles.typeButtonTextActive,
                    ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Peso objetivo</Text>
            <View style={styles.weightContainer}>
              <TextInput
                style={[styles.input, styles.weightInput]}
                placeholder="0.0"
                keyboardType="numeric"
                value={newGoal.targetWeight}
                onChangeText={text => setNewGoal({ ...newGoal, targetWeight: text })}
              />
              <View style={styles.unitSelector}>
                {unitTypes.map(unit => (
                  <TouchableOpacity
                    key={unit.id}
                    style={[
                      styles.unitButton,
                      newGoal.unit === unit.id && styles.unitButtonActive,
                    ]}
                    onPress={() => setNewGoal({ ...newGoal, unit: unit.id })}>
                    <Text
                      style={[
                        styles.unitButtonText,
                        newGoal.unit === unit.id && styles.unitButtonTextActive,
                      ]}>
                      {unit.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.inputLabel}>Fecha objetivo</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={openDatePicker}>
              <Text style={newGoal.targetDate ? styles.dateButtonText : styles.dateButtonPlaceholder}>
                {newGoal.targetDate ? formatDisplayDate(newGoal.targetDate) : 'Seleccionar fecha'}
              </Text>
              <Icon name="calendar-today" size={20} color="#2a8c4a" />
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                disabled={loading}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={saveGoal}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingGoal ? 'Actualizar' : 'Guardar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar fecha */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={dateModalVisible}
        onRequestClose={() => setDateModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.dateModalContent]}>
            <Text style={styles.modalTitle}>Seleccionar Fecha</Text>
            
            <View style={styles.datePickerContainer}>
              <DatePickerColumn
                data={days}
                selectedValue={selectedDay}
                onValueChange={setSelectedDay}
                style={styles.dayColumn}
              />
              <DatePickerColumn
                data={months}
                selectedValue={selectedMonth}
                onValueChange={(month) => {
                  setSelectedMonth(month);
                  const daysInNewMonth = getDaysInMonth(selectedYear, month);
                  if (selectedDay > daysInNewMonth) {
                    setSelectedDay(daysInNewMonth);
                  }
                }}
                style={styles.monthColumn}
              />
              <DatePickerColumn
                data={years}
                selectedValue={selectedYear}
                onValueChange={(year) => {
                  setSelectedYear(year);
                  const daysInNewMonth = getDaysInMonth(year, selectedMonth);
                  if (selectedDay > daysInNewMonth) {
                    setSelectedDay(daysInNewMonth);
                  }
                }}
                style={styles.yearColumn}
              />
            </View>

            <View style={styles.selectedDatePreview}>
              <Text style={styles.selectedDateText}>
                Fecha seleccionada: {formatDisplayDate(new Date(selectedYear, selectedMonth, selectedDay).toISOString())}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDateModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={confirmDateSelection}>
                <Text style={styles.saveButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  goalCard: {
    backgroundColor: '#d0fdd7',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  goalIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9bfab0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 5,
  },
  goalTarget: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  goalActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
  progressSelector: {
    marginBottom: 15,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  progressButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2a8c4a',
    minWidth: 50,
    alignItems: 'center',
  },
  progressButtonActive: {
    backgroundColor: '#2a8c4a',
  },
  progressButtonText: {
    color: '#2a8c4a',
    fontSize: 12,
    fontWeight: '500',
  },
  progressButtonTextActive: {
    color: '#ffffff',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2a8c4a',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2a8c4a',
    minWidth: 40,
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
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  dateModalContent: {
    maxHeight: '90%',
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
    backgroundColor: '#f9f9f9',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 10,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  typeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#2a8c4a',
    borderRadius: 8,
    marginBottom: 10,
  },
  typeButtonActive: {
    backgroundColor: '#2a8c4a',
  },
  typeButtonText: {
    marginLeft: 8,
    color: '#2a8c4a',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  weightInput: {
    flex: 1,
    marginRight: 10,
    marginBottom: 0,
  },
  unitSelector: {
    flexDirection: 'row',
    width: 120,
  },
  unitButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2a8c4a',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  unitButtonActive: {
    backgroundColor: '#2a8c4a',
  },
  unitButtonText: {
    color: '#2a8c4a',
    fontWeight: '500',
  },
  unitButtonTextActive: {
    color: '#ffffff',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  dateButtonPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  datePickerContainer: {
    flexDirection: 'row',
    height: 200,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  pickerColumn: {
    flex: 1,
  },
  dayColumn: {
    flex: 1,
  },
  monthColumn: {
    flex: 1.5,
  },
  yearColumn: {
    flex: 1,
  },
  pickerItem: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#2a8c4a',
    borderRadius: 6,
    margin: 2,
  },
  pickerItemText: {
    fontSize: 16,
    color: '#666',
  },
  pickerItemTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  selectedDatePreview: {
    padding: 15,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: 16,
    color: '#2a8c4a',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
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
    justifyContent: 'center',
    flex: 1,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#2a8c4a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 16,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2a8c4a',
  },
});

export default HealthGoalsScreen;