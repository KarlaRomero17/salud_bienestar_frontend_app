// HealthGoalsScreen.js
import React, { useState, useEffect } from 'react';
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
import { goalAPI } from '../../services/api';

const HealthGoalsScreen = () => {
  const [goals, setGoals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    type: 'loss',
    targetWeight: '',
    unit: 'kg',
    targetDate: '',
  });

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const goalTypes = [
    { id: 'loss', name: 'Pérdida de peso', icon: 'fitness-center' },
    { id: 'gain', name: 'Aumento masa muscular', icon: 'directions-run' },
    { id: 'maintain', name: 'Mantener peso', icon: 'monitor-weight' },
  ];

  const unitTypes = [
    { id: 'kg', name: 'kg' },
    { id: 'lb', name: 'lb' },
  ];

  // Generar arrays para años, meses y días
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
  const months = [
    { value: 0, name: 'Enero' }, { value: 1, name: 'Febrero' }, { value: 2, name: 'Marzo' },
    { value: 3, name: 'Abril' }, { value: 4, name: 'Mayo' }, { value: 5, name: 'Junio' },
    { value: 6, name: 'Julio' }, { value: 7, name: 'Agosto' }, { value: 8, name: 'Septiembre' },
    { value: 9, name: 'Octubre' }, { value: 10, name: 'Noviembre' }, { value: 11, name: 'Diciembre' }
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  // Cargar objetivos al montar el componente
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await goalAPI.getGoals();
      if (response.data.success) {
        setGoals(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando objetivos:', error);
      Alert.alert('Error', 'No se pudieron cargar los objetivos');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewGoal({
      title: '',
      type: 'loss',
      targetWeight: '',
      unit: 'kg',
      targetDate: '',
    });
    setEditingGoal(null);
    const today = new Date();
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
    
    // Establecer la fecha del objetivo en el picker
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

    try {
      setLoading(true);
      const goalData = {
        title: newGoal.title,
        type: newGoal.type,
        targetWeight: parseFloat(newGoal.targetWeight),
        unit: newGoal.unit,
        targetDate: newGoal.targetDate,
      };

      let response;
      if (editingGoal) {
        // Editar objetivo existente
        response = await goalAPI.updateGoal(editingGoal._id, goalData);
      } else {
        // Crear nuevo objetivo
        response = await goalAPI.createGoal(goalData);
      }

      if (response.data.success) {
        await loadGoals();
        setModalVisible(false);
        resetForm();
        Alert.alert('Éxito', editingGoal ? 'Objetivo actualizado' : 'Objetivo creado');
      }
    } catch (error) {
      console.error('Error guardando objetivo:', error);
      Alert.alert('Error', 'No se pudo guardar el objetivo');
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = (goal) => {
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
              const response = await goalAPI.deleteGoal(goal._id);
              if (response.data.success) {
                await loadGoals();
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
    try {
      const response = await goalAPI.updateProgress(goalId, progress);
      if (response.data.success) {
        await loadGoals();
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
              goal.progress === progress && styles.progressButtonActive
            ]}
            onPress={() => updateProgress(goal._id, progress)}
          >
            <Text style={[
              styles.progressButtonText,
              goal.progress === progress && styles.progressButtonTextActive
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
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}>
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

// Agrega estos estilos al objeto de estilos existente:
const styles = StyleSheet.create({
  // ... tus estilos existentes ...
  
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
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
});

export default HealthGoalsScreen;