// HealthGoalsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Layout from '../../components/Layout';

const HealthGoalsScreen = () => {
  const [goals, setGoals] = useState([
    {
      id: '1',
      title: 'Perder peso',
      type: 'weight',
      target: 70,
      current: 75,
      unit: 'kg',
      progress: 50,
    },
    {
      id: '2',
      title: 'Correr 5km',
      type: 'fitness',
      target: 5,
      current: 3.5,
      unit: 'km',
      progress: 70,
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    type: 'weight',
    target: '',
    unit: '',
  });

  const goalTypes = [
    { id: 'weight', name: 'Peso', icon: 'fitness-center' },
    { id: 'fitness', name: 'Fitness', icon: 'directions-run' },
    { id: 'nutrition', name: 'Nutrición', icon: 'restaurant' },
    { id: 'sleep', name: 'Sueño', icon: 'hotel' },
  ];

  const addGoal = () => {
    if (newGoal.title && newGoal.target) {
      const goal = {
        id: Date.now().toString(),
        ...newGoal,
        current: 0,
        progress: 0,
      };
      setGoals([...goals, goal]);
      setNewGoal({ title: '', type: 'weight', target: '', unit: '' });
      setModalVisible(false);
    }
  };

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
            Objetivo: {item.target} {item.unit}
          </Text>
        </View>
      </View>
      
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

  return (
    <Layout title="Mis Objetivos">
      <FlatList
        data={goals}
        renderItem={renderGoalItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No tienes objetivos configurados
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
            <Text style={styles.modalTitle}>Nuevo Objetivo</Text>
            
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

            <TextInput
              style={styles.input}
              placeholder="Meta"
              keyboardType="numeric"
              value={newGoal.target}
              onChangeText={text => setNewGoal({ ...newGoal, target: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Unidad (kg, km, horas, etc.)"
              value={newGoal.unit}
              onChangeText={text => setNewGoal({ ...newGoal, unit: text })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addGoal}>
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
  listContainer: {
    padding: 20,
  },
  goalCard: {
    backgroundColor: '#d0fdd7',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});

export default HealthGoalsScreen;