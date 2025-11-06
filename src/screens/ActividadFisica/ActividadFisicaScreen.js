import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Colores de la paleta verde menta
const COLORS = {
  primary: '#2a8c4a',
  secondary: '#64c27b',
  light: '#9bfab0',
  lighter: '#d0fdd7',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  error: '#e74c3c',
};

// Datos iniciales de ejemplo
const TIPOS_ACTIVIDAD_INICIAL = [
  { id_tipo_actividad: 1, nombre: 'Caminata', descripcion: 'Actividad de caminar a ritmo moderado o rápido' },
  { id_tipo_actividad: 2, nombre: 'Correr', descripcion: 'Actividad de correr o trotar al aire libre o en caminadora' },
  { id_tipo_actividad: 3, nombre: 'Bicicleta', descripcion: 'Ciclismo en exteriores o bicicleta estática' },
  { id_tipo_actividad: 4, nombre: 'Natación', descripcion: 'Actividad acuática de natación' },
];

const FUENTES_INFORMACION_INICIAL = [
  { id_fuente_informacion: 1, nombre: 'Manual', descripcion: 'Registro manual de actividades por el usuario' },
  { id_fuente_informacion: 2, nombre: 'Smartwatch', descripcion: 'Datos sincronizados desde reloj inteligente' },
  { id_fuente_informacion: 3, nombre: 'App móvil', descripcion: 'Registro automático desde aplicación móvil' },
];

const ACTIVIDADES_INICIAL = [
  {
    id_actividad: 1,
    fecha: '2025-10-18',
    pasos: 8500,
    distancia_km: 6.2,
    calorias_quemadas: 320,
    duracion_total: '01:15:00',
    id_tipo_actividad: 1,
    fuente_informacion: 2,
  },
  {
    id_actividad: 2,
    fecha: '2025-10-17',
    pasos: 12000,
    distancia_km: 9.5,
    calorias_quemadas: 480,
    duracion_total: '01:45:00',
    id_tipo_actividad: 2,
    fuente_informacion: 2,
  },
];

export default function ActividadFisicaScreen() {
  const [actividades, setActividades] = useState(ACTIVIDADES_INICIAL);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedActividad, setSelectedActividad] = useState(null);
  const [tiposActividad] = useState(TIPOS_ACTIVIDAD_INICIAL);
  const [fuentesInformacion] = useState(FUENTES_INFORMACION_INICIAL);
  const [nextId, setNextId] = useState(3);

  // Form states
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [pasos, setPasos] = useState('');
  const [distanciaKm, setDistanciaKm] = useState('');
  const [caloriasQuemadas, setCaloriasQuemadas] = useState('');
  const [duracionTotal, setDuracionTotal] = useState('');
  const [tipoActividadId, setTipoActividadId] = useState('');
  const [fuenteInformacionId, setFuenteInformacionId] = useState('');

  const limpiarFormulario = () => {
    setFecha(new Date().toISOString().split('T')[0]);
    setPasos('');
    setDistanciaKm('');
    setCaloriasQuemadas('');
    setDuracionTotal('');
    setTipoActividadId('');
    setFuenteInformacionId('');
    setSelectedActividad(null);
    setEditMode(false);
  };

  const abrirModalNuevo = () => {
    limpiarFormulario();
    setModalVisible(true);
  };

  const abrirModalEditar = (actividad) => {
    setSelectedActividad(actividad);
    setFecha(actividad.fecha);
    setPasos(String(actividad.pasos));
    setDistanciaKm(String(actividad.distancia_km));
    setCaloriasQuemadas(String(actividad.calorias_quemadas));
    setDuracionTotal(actividad.duracion_total);
    setTipoActividadId(String(actividad.id_tipo_actividad));
    setFuenteInformacionId(String(actividad.fuente_informacion));
    setEditMode(true);
    setModalVisible(true);
  };

  const guardarActividad = () => {
    if (!pasos || !distanciaKm || !caloriasQuemadas || !duracionTotal || !tipoActividadId || !fuenteInformacionId) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const actividadData = {
      fecha,
      pasos: parseInt(pasos),
      distancia_km: parseFloat(distanciaKm),
      calorias_quemadas: parseFloat(caloriasQuemadas),
      duracion_total: duracionTotal,
      id_tipo_actividad: parseInt(tipoActividadId),
      fuente_informacion: parseInt(fuenteInformacionId),
    };

    if (editMode) {
      // Actualizar actividad existente
      setActividades(actividades.map(act => 
        act.id_actividad === selectedActividad.id_actividad 
          ? { ...actividadData, id_actividad: selectedActividad.id_actividad }
          : act
      ));
      Alert.alert('Éxito', 'Actividad actualizada correctamente');
    } else {
      // Agregar nueva actividad
      const nuevaActividad = {
        ...actividadData,
        id_actividad: nextId,
      };
      setActividades([...actividades, nuevaActividad]);
      setNextId(nextId + 1);
      Alert.alert('Éxito', 'Actividad registrada correctamente');
    }
    
    setModalVisible(false);
    limpiarFormulario();
  };

  const eliminarActividad = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta actividad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setActividades(actividades.filter(act => act.id_actividad !== id));
            Alert.alert('Éxito', 'Actividad eliminada correctamente');
          },
        },
      ]
    );
  };

  const renderActividadItem = ({ item }) => {
    const tipoActividad = tiposActividad.find(t => t.id_tipo_actividad === item.id_tipo_actividad);
    const fuenteInfo = fuentesInformacion.find(f => f.id_fuente_informacion === item.fuente_informacion);

    return (
      <View style={styles.actividadCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>{tipoActividad?.nombre || 'Actividad'}</Text>
            <Text style={styles.cardDate}>{new Date(item.fecha).toLocaleDateString()}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => abrirModalEditar(item)}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => eliminarActividad(item.id_actividad)}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="footsteps-outline" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{item.pasos}</Text>
            <Text style={styles.statLabel}>pasos</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="navigate-outline" size={24} color={COLORS.secondary} />
            <Text style={styles.statValue}>{item.distancia_km} km</Text>
            <Text style={styles.statLabel}>distancia</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{item.calorias_quemadas}</Text>
            <Text style={styles.statLabel}>kcal</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={24} color={COLORS.secondary} />
            <Text style={styles.statValue}>{item.duracion_total}</Text>
            <Text style={styles.statLabel}>duración</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.fuenteText}>
            <Ionicons name="phone-portrait-outline" size={14} color={COLORS.textLight} />
            {' '}{fuenteInfo?.nombre || 'Fuente desconocida'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Actividad Física</Text>
        <Text style={styles.headerSubtitle}>Registra tu actividad diaria</Text>
      </View>

      {/* Lista de actividades */}
      <FlatList
        data={actividades}
        renderItem={renderActividadItem}
        keyExtractor={(item) => item.id_actividad.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="walk-outline" size={64} color={COLORS.lighter} />
            <Text style={styles.emptyText}>No hay actividades registradas</Text>
            <Text style={styles.emptySubtext}>Presiona el botón + para agregar una</Text>
          </View>
        }
      />

      {/* Botón flotante para agregar */}
      <TouchableOpacity style={styles.fab} onPress={abrirModalNuevo}>
        <Ionicons name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>

      {/* Modal para agregar/editar */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Editar Actividad' : 'Nueva Actividad'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Fecha */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fecha</Text>
                <TextInput
                  style={styles.input}
                  value={fecha}
                  onChangeText={setFecha}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>

              {/* Tipo de Actividad */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo de Actividad</Text>
                <View style={styles.pickerContainer}>
                  {tiposActividad.map((tipo) => (
                    <TouchableOpacity
                      key={tipo.id_tipo_actividad}
                      style={[
                        styles.optionButton,
                        tipoActividadId === String(tipo.id_tipo_actividad) && styles.optionButtonSelected
                      ]}
                      onPress={() => setTipoActividadId(String(tipo.id_tipo_actividad))}
                    >
                      <Text style={[
                        styles.optionText,
                        tipoActividadId === String(tipo.id_tipo_actividad) && styles.optionTextSelected
                      ]}>
                        {tipo.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Pasos */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pasos</Text>
                <TextInput
                  style={styles.input}
                  value={pasos}
                  onChangeText={setPasos}
                  placeholder="Ej: 10000"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>

              {/* Distancia */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Distancia (km)</Text>
                <TextInput
                  style={styles.input}
                  value={distanciaKm}
                  onChangeText={setDistanciaKm}
                  placeholder="Ej: 5.2"
                  keyboardType="decimal-pad"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>

              {/* Calorías */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Calorías Quemadas (kcal)</Text>
                <TextInput
                  style={styles.input}
                  value={caloriasQuemadas}
                  onChangeText={setCaloriasQuemadas}
                  placeholder="Ej: 300"
                  keyboardType="decimal-pad"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>

              {/* Duración */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duración (HH:MM:SS)</Text>
                <TextInput
                  style={styles.input}
                  value={duracionTotal}
                  onChangeText={setDuracionTotal}
                  placeholder="Ej: 01:30:00"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>

              {/* Fuente de Información */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fuente de Información</Text>
                <View style={styles.pickerContainer}>
                  {fuentesInformacion.map((fuente) => (
                    <TouchableOpacity
                      key={fuente.id_fuente_informacion}
                      style={[
                        styles.optionButton,
                        fuenteInformacionId === String(fuente.id_fuente_informacion) && styles.optionButtonSelected
                      ]}
                      onPress={() => setFuenteInformacionId(String(fuente.id_fuente_informacion))}
                    >
                      <Text style={[
                        styles.optionText,
                        fuenteInformacionId === String(fuente.id_fuente_informacion) && styles.optionTextSelected
                      ]}>
                        {fuente.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Botones */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={guardarActividad}
                >
                  <Text style={styles.saveButtonText}>
                    {editMode ? 'Actualizar' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.lighter,
    marginTop: 5,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  actividadCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lighter,
    paddingTop: 12,
  },
  fuenteText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lighter,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.lighter,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: COLORS.lighter,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lighter,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
