
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Layout from '../../components/Layout';
import objetivosService from '../../services/objetivosService';
import userService from '../../services/userService';
import GoalCard from '../../components/objetivos/GoalCard';
import GoalFormModal from '../../components/objetivos/GoalFormModal';
import UpdateWeightButton from '../../components/peso/UpdateWeightButton';
import WeightHistoryModal from '../../components/peso/WeightHistoryModal';
import DatePickerModal from '../../components/objetivos/DatePickerModal';
import { AuthContext } from '../../context/AuthContext';

const HealthGoalsScreen = ({ navigation} ) => {
  const { user } = useContext(AuthContext);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [weightHistoryVisible, setWeightHistoryVisible] = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: '',
    type: 'loss',
    targetWeight: '',
    unit: 'kg',
    targetDate: '',
    initialWeight: '',
  });

  const [editingGoal, setEditingGoal] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [userLoading, setUserLoading] = useState(true);

  const goalTypes = [
    { id: 'loss', name: 'Pérdida de peso', icon: 'fitness-center' },
    { id: 'gain', name: 'Aumento masa muscular', icon: 'directions-run' },
  ];

  const unitTypes = [
    { id: 'kg', name: 'kg' },
    { id: 'lb', name: 'lb' },
  ];

  const USER_UUID = user?.uid;

  // Cargar datos iniciales
  const fetchData = async () => {
    try {
      setLoading(true);
      setUserLoading(true);

      // console.log('UUID del usuario:', USER_UUID);

      // Cargar objetivos
      const goalsResult = await objetivosService.obtenerTodos();
      if (goalsResult.exito) {
        setGoals(goalsResult.datos);
      }

      // Cargar datos del usuario
      await loadUserData();

    } catch (error) {
      // console.error('Error fetching data:', error);
      Alert.alert('Error', error.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
      setUserLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar datos del usuario
  const loadUserData = async () => {
    try {
      // console.log('Intentando obtener perfil del usuario con UUID:', USER_UUID);

      // Intentar obtener usuario existente
      const userResult = await userService.obtenerPerfil(USER_UUID);
      // console.log('Perfil obtenido:', userResult);

      if (userResult.exito) {
        setCurrentUser(userResult.datos);

        // console.log('Cargando historial de peso...');
        // Cargar historial de peso
        const historialResult = await userService.obtenerHistorialPeso(USER_UUID);
        // console.log('Historial obtenido:', historialResult);

        if (historialResult.exito) {
          setWeightHistory(historialResult.datos || []);
        // console.log(`${historialResult.datos?.length || 0} registros cargados`);
        } else {
          // console.error('Error en respuesta del historial:', historialResult.mensaje);
        }
      }
    } catch (error) {
      // console.error('Error completo en loadUserData:', error);
      // console.error('Mensaje de error:', error.message);

      // Mostrar alerta solo si no es error 404 (usuario no existe)
      if (!error.message.includes('404') && !error.message.includes('no encontrado')) {
        Alert.alert('Error', `No se pudieron cargar los datos: ${error.message}`);
      }
    }
  };

  // Resto del código se mantiene igual...
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => {
    if (USER_UUID) {
      fetchData();
    }
  }, [USER_UUID]);

  // Manejar cambios en el formulario
  const handleGoalChange = (field, value, isEditing = false) => {
    if (isEditing) {
      setEditingGoal(prev => ({ ...prev, [field]: value }));
    } else {
      setNewGoal(prev => ({ ...prev, [field]: value }));
    }
  };

  // Crear nuevo objetivo
  const addGoal = async () => {
    if (!newGoal.title || !newGoal.targetWeight || !newGoal.targetDate) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const goalData = {
        title: newGoal.title,
        type: newGoal.type,
        targetWeight: parseFloat(newGoal.targetWeight),
        unit: newGoal.unit,
        targetDate: newGoal.targetDate,
        initialWeight: newGoal.initialWeight ? parseFloat(newGoal.initialWeight) : currentUser?.peso_actual,
        userId: USER_UUID
      };

      const result = await objetivosService.crear(goalData);

      if (result.exito) {
        setNewGoal({ title: '', type: 'loss', targetWeight: '', unit: 'kg', targetDate: '', initialWeight: '' });
        setModalVisible(false);
        fetchData();
        Alert.alert('Éxito', 'Objetivo creado correctamente');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Actualizar objetivo
  const updateGoal = async () => {
    if (!editingGoal?.title || !editingGoal?.targetWeight || !editingGoal?.targetDate) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const goalData = {
        title: editingGoal.title,
        type: editingGoal.type,
        targetWeight: parseFloat(editingGoal.targetWeight),
        unit: editingGoal.unit,
        targetDate: editingGoal.targetDate,
        initialWeight: editingGoal.initialWeight ? parseFloat(editingGoal.initialWeight) : editingGoal.initialWeight,
        progress: editingGoal.progress || 0
      };

      const result = await objetivosService.actualizar(editingGoal._id, goalData);

      if (result.exito) {
        setEditModalVisible(false);
        setEditingGoal(null);
        fetchData();
        Alert.alert('Éxito', 'Objetivo actualizado correctamente');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Actualizar peso y recalcular progresos
  const handleWeightUpdate = async (pesoData) => {
    try {
      // Preparar datos para la API
      const apiPesoData = {
        peso_actual: pesoData.peso,
        grasa_corporal: pesoData.grasa_corporal,
        altura: pesoData.altura,
        edad: pesoData.edad,
        genero: pesoData.genero,
        medida_cintura: pesoData.medida_cintura,
        unidad: pesoData.unidad
      };

      // 1. Registrar nuevo peso en el backend
      const result = await userService.registrarPeso(USER_UUID, apiPesoData);

      if (result.exito) {
        // 2. Actualizar estado local del usuario
        setCurrentUser(prev => ({
          ...prev,
          peso_actual: pesoData.peso,
          altura: pesoData.altura,
          edad: pesoData.edad,
          genero: pesoData.genero,
          unidad_peso: pesoData.unidad
        }));

        // 3. Recalcular progreso de todos los objetivos
        await recalculateAllGoalsProgress(pesoData.peso);

        // 4. Actualizar historial local
        const nuevoRegistro = {
          ...pesoData,
          fecha: new Date().toISOString()
        };
        setWeightHistory(prev => [nuevoRegistro, ...prev]);

        // 5. Recargar datos para asegurar consistencia
        fetchData();

        return result;
      }

    } catch (error) {
      Alert.alert('Error', error.message);
      throw error;
    }
  };

  // Recalcular progreso de todos los objetivos
  const recalculateAllGoalsProgress = async (currentWeight) => {
    try {
      for (const goal of goals) {
        if (!goal.completed) {
          const progress = calculateProgress(goal, currentWeight);
          await objetivosService.actualizarProgreso(goal._id, progress);
        }
      }
    } catch (error) {
      console.error('Error recalculating progress:', error);
    }
  };

  // Calcular progreso basado en peso actual
  const calculateProgress = (goal, currentWeight) => {
    const target = goal.targetWeight;
    const initial = goal.initialWeight || currentWeight;

    if (goal.type === 'loss') {
      const totalToLose = initial - target;
      const currentLoss = initial - currentWeight;
      return Math.min(Math.max((currentLoss / totalToLose) * 100, 0), 100);
    } else {
      const totalToGain = target - initial;
      const currentGain = currentWeight - initial;
      return Math.min(Math.max((currentGain / totalToGain) * 100, 0), 100);
    }
  };

  // Marcar como completado
  const markGoalAsCompleted = async (goalId) => {
    Alert.alert(
      "¡Objetivo Logrado!",
      "¿Estás seguro de que has completado este objetivo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, Completado",
          onPress: async () => {
            try {
              await objetivosService.marcarCompletado(goalId);
              fetchData();
              Alert.alert('¡Felicidades!', 'Objetivo marcado como completado');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  // Eliminar objetivo
  const deleteGoal = (goalId) => {
    Alert.alert(
      "Eliminar Objetivo",
      "¿Estás seguro de que quieres eliminar este objetivo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await objetivosService.eliminar(goalId);
              fetchData();
              Alert.alert('Éxito', 'Objetivo eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  // Editar objetivo
  const editGoal = (goal) => {
    setEditingGoal({
      ...goal,
      targetWeight: goal.targetWeight?.toString() || '',
      initialWeight: goal.initialWeight?.toString() || '',
      progress: goal.progress?.toString() || '0'
    });
    setEditModalVisible(true);
  };

  // Cargar historial de peso
  const loadWeightHistory = async () => {
    try {
      const result = await userService.obtenerHistorialPeso(USER_UUID);
      if (result.exito) {
        setWeightHistory(result.datos || []);
      }
      setWeightHistoryVisible(true);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if ((loading || userLoading) && !refreshing) {
    return (
      <Layout title="Mis Objetivos">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2a8c4a" />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout title="Mis Objetivos">
      {/* Header con botones de peso */}
      <View style={styles.weightHeader}>
        <UpdateWeightButton
          userId={USER_UUID}
          onWeightUpdate={handleWeightUpdate}
          currentWeight={currentUser?.peso_actual}
          unit={currentUser?.unidad_peso}
          userData={currentUser}
        />

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('WeightHistory')}>
          <Icon name="history" size={20} color="#2a8c4a" />
          <Text style={styles.historyButtonText}>Historial</Text>
        </TouchableOpacity>
      </View>

      {/* Información del usuario actual */}
      {currentUser?.peso_actual && (
        <View style={styles.currentWeightInfo}>
          <Text style={styles.currentWeightText}>
            Peso actual: <Text style={styles.weightValue}>{currentUser.peso_actual} {currentUser.unidad_peso}</Text>
          </Text>
          {weightHistory[0]?.grasa_corporal && (
            <Text style={styles.currentFatText}>
              Grasa: {weightHistory[0].grasa_corporal}%
            </Text>
          )}
        </View>
      )}

      {/* Lista de objetivos */}
      <FlatList
        data={goals}
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            goalTypes={goalTypes}
            onEdit={editGoal}
            onDelete={deleteGoal}
            onComplete={markGoalAsCompleted}
          />
        )}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2a8c4a']}
            tintColor="#2a8c4a"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="flag" size={50} color="#ccc" />
            <Text style={styles.emptyStateText}>
              No tienes objetivos configurados
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Presiona el botón + para crear tu primer objetivo
            </Text>
          </View>
        }
      />

      {/* Botón flotante para agregar objetivo */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Icon name="add" size={30} color="#ffffff" />
      </TouchableOpacity>

      {/* Modales */}
      <GoalFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Nuevo Objetivo"
        goal={newGoal}
        onChange={(field, value) => handleGoalChange(field, value, false)}
        goalTypes={goalTypes}
        unitTypes={unitTypes}
        onSave={addGoal}
        onOpenDatePicker={() => setDateModalVisible(true)}
        currentWeight={currentUser?.peso_actual}
      />

      <GoalFormModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setEditingGoal(null);
        }}
        title="Editar Objetivo"
        goal={editingGoal}
        onChange={(field, value) => handleGoalChange(field, value, true)}
        goalTypes={goalTypes}
        unitTypes={unitTypes}
        onSave={updateGoal}
        onOpenDatePicker={() => setDateModalVisible(true)}
        isEditing={true}
      />

      <WeightHistoryModal
        visible={weightHistoryVisible}
        onClose={() => setWeightHistoryVisible(false)}
        historial={weightHistory}
        unit={currentUser?.unidad_peso}
        userId={USER_UUID}
        onDeleteRecord={async (registroId) => {
          try {
            await userService.eliminarRegistroPeso(USER_UUID, registroId);
            fetchData(); // Recargar datos
            Alert.alert('Éxito', 'Registro eliminado correctamente');
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        }}
      />

      <DatePickerModal
        visible={dateModalVisible}
        onClose={() => setDateModalVisible(false)}
        onDateSelect={(date) => {
          const formattedDate = date.toISOString().split('T')[0];
          if (editingGoal) {
            setEditingGoal(prev => ({ ...prev, targetDate: formattedDate }));
          } else {
            setNewGoal(prev => ({ ...prev, targetDate: formattedDate }));
          }
          setDateModalVisible(false);
        }}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  weightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#2a8c4a',
    marginHorizontal: 5,
  },
  historyButtonText: {
    color: '#2a8c4a',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  currentWeightInfo: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  currentWeightText: {
    fontSize: 16,
    color: '#2a8c4a',
    fontWeight: '500',
  },
  weightValue: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  currentFatText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    marginTop: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default HealthGoalsScreen;