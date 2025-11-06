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
const TIPOS_INICIAL = [
  { id_tipo_actividad: 1, nombre: 'Caminata', descripcion: 'Actividad de caminar a ritmo moderado o rápido' },
  { id_tipo_actividad: 2, nombre: 'Correr', descripcion: 'Actividad de correr o trotar al aire libre o en caminadora' },
  { id_tipo_actividad: 3, nombre: 'Bicicleta', descripcion: 'Ciclismo en exteriores o bicicleta estática' },
  { id_tipo_actividad: 4, nombre: 'Natación', descripcion: 'Actividad acuática de natación' },
  { id_tipo_actividad: 5, nombre: 'Yoga', descripcion: 'Práctica de yoga para flexibilidad y bienestar' },
];

export default function TipoActividadScreen() {
  const [tiposActividad, setTiposActividad] = useState(TIPOS_INICIAL);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [nextId, setNextId] = useState(6);

  // Form states
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setSelectedTipo(null);
    setEditMode(false);
  };

  const abrirModalNuevo = () => {
    limpiarFormulario();
    setModalVisible(true);
  };

  const abrirModalEditar = (tipo) => {
    setSelectedTipo(tipo);
    setNombre(tipo.nombre);
    setDescripcion(tipo.descripcion);
    setEditMode(true);
    setModalVisible(true);
  };

  const guardarTipoActividad = () => {
    if (!nombre || !descripcion) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const tipoData = { nombre, descripcion };

    if (editMode) {
      // Actualizar tipo existente
      setTiposActividad(tiposActividad.map(tipo => 
        tipo.id_tipo_actividad === selectedTipo.id_tipo_actividad 
          ? { ...tipoData, id_tipo_actividad: selectedTipo.id_tipo_actividad }
          : tipo
      ));
      Alert.alert('Éxito', 'Tipo de actividad actualizado correctamente');
    } else {
      // Agregar nuevo tipo
      const nuevoTipo = {
        ...tipoData,
        id_tipo_actividad: nextId,
      };
      setTiposActividad([...tiposActividad, nuevoTipo]);
      setNextId(nextId + 1);
      Alert.alert('Éxito', 'Tipo de actividad registrado correctamente');
    }
    
    setModalVisible(false);
    limpiarFormulario();
  };

  const eliminarTipoActividad = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este tipo de actividad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setTiposActividad(tiposActividad.filter(tipo => tipo.id_tipo_actividad !== id));
            Alert.alert('Éxito', 'Tipo de actividad eliminado correctamente');
          },
        },
      ]
    );
  };

  const getIconName = (nombre) => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('caminar') || nombreLower.includes('caminata')) return 'walk-outline';
    if (nombreLower.includes('correr') || nombreLower.includes('carrera')) return 'bicycle-outline';
    if (nombreLower.includes('bicicleta') || nombreLower.includes('ciclismo')) return 'bicycle-outline';
    if (nombreLower.includes('nadar') || nombreLower.includes('natación')) return 'water-outline';
    if (nombreLower.includes('yoga')) return 'body-outline';
    if (nombreLower.includes('pesas') || nombreLower.includes('gym')) return 'barbell-outline';
    if (nombreLower.includes('escalera')) return 'trending-up-outline';
    if (nombreLower.includes('baile')) return 'musical-notes-outline';
    return 'fitness-outline';
  };

  const renderTipoItem = ({ item }) => (
    <View style={styles.tipoCard}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={getIconName(item.nombre)} size={32} color={COLORS.primary} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <Text style={styles.cardDescription}>{item.descripcion}</Text>
        </View>
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
          onPress={() => eliminarTipoActividad(item.id_tipo_actividad)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tipos de Actividad</Text>
        <Text style={styles.headerSubtitle}>Categorías de ejercicios y actividades físicas</Text>
      </View>

      {/* Lista de tipos de actividad */}
      <FlatList
        data={tiposActividad}
        renderItem={renderTipoItem}
        keyExtractor={(item) => item.id_tipo_actividad.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color={COLORS.lighter} />
            <Text style={styles.emptyText}>No hay tipos de actividad registrados</Text>
            <Text style={styles.emptySubtext}>Presiona el botón + para agregar uno</Text>
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
                {editMode ? 'Editar Tipo de Actividad' : 'Nuevo Tipo de Actividad'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Nombre */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre de la Actividad</Text>
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ej: Caminata, Correr, Bicicleta"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>

              {/* Descripción */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={descripcion}
                  onChangeText={setDescripcion}
                  placeholder="Describe el tipo de actividad física"
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Sugerencias */}
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Sugerencias Populares:</Text>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => {
                    setNombre('Caminata');
                    setDescripcion('Actividad de caminar a ritmo moderado o rápido');
                  }}
                >
                  <Ionicons name="walk-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.suggestionText}>Caminata</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => {
                    setNombre('Correr');
                    setDescripcion('Actividad de correr o trotar al aire libre o en caminadora');
                  }}
                >
                  <Ionicons name="fitness-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.suggestionText}>Correr</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => {
                    setNombre('Bicicleta');
                    setDescripcion('Ciclismo en exteriores o bicicleta estática');
                  }}
                >
                  <Ionicons name="bicycle-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.suggestionText}>Bicicleta</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => {
                    setNombre('Natación');
                    setDescripcion('Actividad acuática de natación');
                  }}
                >
                  <Ionicons name="water-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.suggestionText}>Natación</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => {
                    setNombre('Yoga');
                    setDescripcion('Práctica de yoga para flexibilidad y bienestar');
                  }}
                >
                  <Ionicons name="body-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.suggestionText}>Yoga</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => {
                    setNombre('Gimnasio');
                    setDescripcion('Entrenamiento con pesas y ejercicios de fuerza');
                  }}
                >
                  <Ionicons name="barbell-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.suggestionText}>Gimnasio</Text>
                </TouchableOpacity>
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
                  onPress={guardarTipoActividad}
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
  tipoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
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
    maxHeight: '85%',
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
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  suggestionsContainer: {
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lighter,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
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
