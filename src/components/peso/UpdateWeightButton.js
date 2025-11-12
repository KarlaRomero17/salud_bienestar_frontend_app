// components/peso/UpdateWeightButton.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import userService from '../../services/userService'; 

const UpdateWeightButton = ({ userId, onWeightUpdate, currentWeight, unit = 'kg', userData }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [peso, setPeso] = useState(currentWeight?.toString() || '');
  const [altura, setAltura] = useState(userData?.altura?.toString() || '');
  const [edad, setEdad] = useState(userData?.edad?.toString() || '');
  const [genero, setGenero] = useState(userData?.genero || '');
  const [medidaCintura, setMedidaCintura] = useState('');
  const [loading, setLoading] = useState(false);


  const calcularGrasa = () => {
    if (!peso || !altura || !edad || !genero) return null;

    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    const edadNum = parseInt(edad);
    const cinturaNum = medidaCintura ? parseFloat(medidaCintura) : null;

    return userService.calcularGrasaCorporal(pesoNum, alturaNum, edadNum, genero, cinturaNum);
  };

  const handleRegistrarPeso = async () => {
    if (!peso) {
      Alert.alert('Error', 'Por favor ingresa tu peso actual');
      return;
    }

    if (!altura || !edad || !genero) {
      Alert.alert('Información requerida', 'Necesitamos tu altura, edad y género para calcular la grasa corporal');
      return;
    }

    setLoading(true);
    try {
      const grasaCorporal = calcularGrasa();
      
      const pesoData = {
        peso: parseFloat(peso),
        grasa_corporal: parseFloat(grasaCorporal),
        altura: parseFloat(altura),
        edad: parseInt(edad),
        genero: genero,
        medida_cintura: medidaCintura ? parseFloat(medidaCintura) : null,
        unidad: unit
      };

      await onWeightUpdate(pesoData);
      
      setModalVisible(false);
      
    } catch (error) {
      // El error ya se maneja en el parent component
    } finally {
      setLoading(false);
    }
  };

  const grasaCalculada = calcularGrasa();

  return (
    <>
      <TouchableOpacity
        style={styles.updateButton}
        onPress={() => setModalVisible(true)}>
        <Icon name="fitness-center" size={20} color="#ffffff" />
        <Text style={styles.updateButtonText}>Actualizar Peso</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Peso Actual</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Información Básica</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Peso actual ({unit}) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 70.5"
                  keyboardType="numeric"
                  value={peso}
                  onChangeText={setPeso}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Altura (cm) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 175"
                  keyboardType="numeric"
                  value={altura}
                  onChangeText={setAltura}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Edad *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 30"
                  keyboardType="numeric"
                  value={edad}
                  onChangeText={setEdad}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Género *</Text>
                <View style={styles.genderSelector}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      genero === 'masculino' && styles.genderButtonActive
                    ]}
                    onPress={() => setGenero('masculino')}>
                    <Text style={[
                      styles.genderButtonText,
                      genero === 'masculino' && styles.genderButtonTextActive
                    ]}>
                      Masculino
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      genero === 'femenino' && styles.genderButtonActive
                    ]}
                    onPress={() => setGenero('femenino')}>
                    <Text style={[
                      styles.genderButtonText,
                      genero === 'femenino' && styles.genderButtonTextActive
                    ]}>
                      Femenino
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Medidas Adicionales (Opcional)</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Circunferencia de cintura (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 85"
                  keyboardType="numeric"
                  value={medidaCintura}
                  onChangeText={setMedidaCintura}
                />
              </View>

              {grasaCalculada && (
                <View style={styles.resultPreview}>
                  <Text style={styles.resultTitle}>Resultado Calculado:</Text>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Grasa Corporal:</Text>
                    <Text style={styles.resultValue}>{grasaCalculada}%</Text>
                  </View>
                  <Text style={styles.resultNote}>
                    * Cálculo basado en la fórmula de Deurenberg
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={loading}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.saveButton,
                  (!peso || !altura || !edad || !genero) && styles.saveButtonDisabled
                ]}
                onPress={handleRegistrarPeso}
                disabled={loading || !peso || !altura || !edad || !genero}>
                <Text style={styles.saveButtonText}>
                  {loading ? 'Registrando...' : 'Registrar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a8c4a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  updateButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a8c4a',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  inputGroup: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fafafa',
  },
  genderButtonActive: {
    backgroundColor: '#2a8c4a',
    borderColor: '#2a8c4a',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  genderButtonTextActive: {
    color: '#ffffff',
  },
  resultPreview: {
    backgroundColor: '#f0f8f0',
    padding: 15,
    borderRadius: 8,
    margin: 20,
    marginTop: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a8c4a',
  },
  resultNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
    fontSize: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default UpdateWeightButton;