// components/UpdateWeightModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UpdateWeightModal = ({
  visible,
  onClose,
  goal,
  currentWeight,
  onUpdateWeight,
  unit = 'kg'
}) => {
  const [weight, setWeight] = useState(currentWeight?.toString() || '');
  const [bodyFat, setBodyFat] = useState('');

  const handleUpdate = () => {
    if (!weight) {
      Alert.alert('Error', 'Por favor ingresa tu peso actual');
      return;
    }

    const weightData = {
      peso_actual: parseFloat(weight),
      grasa: bodyFat ? parseFloat(bodyFat) : null,
      fecha: new Date().toISOString()
    };

    onUpdateWeight(weightData);
    setWeight('');
    setBodyFat('');
  };

  const calculateProgress = () => {
    if (!goal || !weight) return 0;

    const current = parseFloat(weight);
    const target = goal.targetWeight;
    const initial = goal.initialWeight || current;

    if (goal.type === 'loss') {
      // Progreso para pérdida de peso
      const totalToLose = initial - target;
      const currentLoss = initial - current;
      return Math.min(Math.max((currentLoss / totalToLose) * 100, 0), 100);
    } else {
      // Progreso para ganancia muscular
      const totalToGain = target - initial;
      const currentGain = current - initial;
      return Math.min(Math.max((currentGain / totalToGain) * 100, 0), 100);
    }
  };

  const progress = calculateProgress();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Actualizar Mi Peso</Text>
          
          {goal && (
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>{goal.title}</Text>
              <Text style={styles.goalTarget}>
                {goal.type === 'gain' ? 'Aumentar' : 'Reducir'} {goal.targetWeight} {goal.unit}
              </Text>
            </View>
          )}

          <Text style={styles.inputLabel}>Peso actual ({unit})</Text>
          <TextInput
            style={styles.input}
            placeholder="0.0"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />

          <Text style={styles.inputLabel}>Porcentaje de grasa (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.0"
            keyboardType="numeric"
            value={bodyFat}
            onChangeText={setBodyFat}
          />

          {goal && weight && (
            <View style={styles.progressPreview}>
              <Text style={styles.progressLabel}>Progreso calculado:</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{progress.toFixed(1)}%</Text>
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleUpdate}>
              <Text style={styles.saveButtonText}>Guardar</Text>
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 20,
    textAlign: 'center',
  },
  goalInfo: {
    backgroundColor: '#f0f8f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  goalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 5,
  },
  goalTarget: {
    fontSize: 14,
    color: '#666',
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
  progressPreview: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
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
    textAlign: 'center',
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

export default UpdateWeightModal;