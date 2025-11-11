// components/GoalFormModal.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const GoalFormModal = ({
  visible,
  onClose,
  title,
  goal,
  onChange,
  goalTypes,
  unitTypes,
  onSave,
  onOpenDatePicker,
  isEditing = false
}) => {
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Título del objetivo"
            value={goal?.title || ''}
            onChangeText={text => onChange('title', text)}
          />

          <Text style={styles.inputLabel}>Tipo de objetivo</Text>
          <View style={styles.typeSelector}>
            {goalTypes.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  goal?.type === type.id && styles.typeButtonActive,
                ]}
                onPress={() => onChange('type', type.id)}>
                <Icon
                  name={type.icon}
                  size={20}
                  color={goal?.type === type.id ? '#ffffff' : '#2a8c4a'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    goal?.type === type.id && styles.typeButtonTextActive,
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
              value={goal?.targetWeight?.toString() || ''}
              onChangeText={text => onChange('targetWeight', text)}
            />
            <View style={styles.unitSelector}>
              {unitTypes.map(unit => (
                <TouchableOpacity
                  key={unit.id}
                  style={[
                    styles.unitButton,
                    goal?.unit === unit.id && styles.unitButtonActive,
                  ]}
                  onPress={() => onChange('unit', unit.id)}>
                  <Text
                    style={[
                      styles.unitButtonText,
                      goal?.unit === unit.id && styles.unitButtonTextActive,
                    ]}>
                    {unit.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {isEditing && (
            <>
              <Text style={styles.inputLabel}>Peso inicial</Text>
              <TextInput
                style={styles.input}
                placeholder="0.0"
                keyboardType="numeric"
                value={goal?.initialWeight?.toString() || ''}
                onChangeText={text => onChange('initialWeight', text)}
              />
            </>
          )}

          <Text style={styles.inputLabel}>Fecha objetivo</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={onOpenDatePicker}>
            <Text style={goal?.targetDate ? styles.dateButtonText : styles.dateButtonPlaceholder}>
              {goal?.targetDate ? formatDisplayDate(goal.targetDate) : 'Seleccionar fecha'}
            </Text>
            <Icon name="calendar-today" size={20} color="#2a8c4a" />
          </TouchableOpacity>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={onSave}>
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Actualizar' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    maxHeight: '80%',
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
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  dateButtonPlaceholder: {
    fontSize: 16,
    color: '#999',
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
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default GoalFormModal;