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
const FUENTES_INICIAL = [
  { id_fuente_informacion: 1, nombre: 'Manual', descripcion: 'Registro manual de actividades por el usuario' },
  { id_fuente_informacion: 2, nombre: 'Smartwatch', descripcion: 'Datos sincronizados desde reloj inteligente' },
  { id_fuente_informacion: 3, nombre: 'App móvil', descripcion: 'Registro automático desde aplicación móvil' },
];

export default function FuenteInformacionScreen() {
  const [fuentes, setFuentes] = useState(FUENTES_INICIAL);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedFuente, setSelectedFuente] = useState(null);
  const [nextId, setNextId] = useState(4);

  // Form states
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setSelectedFuente(null);
    setEditMode(false);
  };

  const abrirModalNuevo = () => {
    limpiarFormulario();
    setModalVisible(true);
  };

  const abrirModalEditar = (fuente) => {
    setSelectedFuente(fuente);
    setNombre(fuente.nombre);
    setDescripcion(fuente.descripcion);
    setEditMode(true);
    setModalVisible(true);
  };

  const guardarFuente = () => {
    if (!nombre || !descripcion) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const fuenteData = { nombre, descripcion };

    if (editMode) {
      // Actualizar fuente existente
      setFuentes(fuentes.map(fuente => 
        fuente.id_fuente_informacion === selectedFuente.id_fuente_informacion 
          ? { ...fuenteData, id_fuente_informacion: selectedFuente.id_fuente_informacion }
          : fuente
      ));
      Alert.alert('Éxito', 'Fuente actualizada correctamente');
    } else {
      // Agregar nueva fuente
      const nuevaFuente = {
        ...fuenteData,
        id_fuente_informacion: nextId,
      };
      setFuentes([...fuentes, nuevaFuente]);
      setNextId(nextId + 1);
      Alert.alert('Éxito', 'Fuente registrada correctamente');
    }
    
    setModalVisible(false);
    limpiarFormulario();
  };

  const eliminarFuente = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta fuente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setFuentes(fuentes.filter(fuente => fuente.id_fuente_informacion !== id));
            Alert.alert('Éxito', 'Fuente eliminada correctamente');
          },
        },
      ]
    );
  };

  const getIconName = (nombre) => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('manual')) return 'create-outline';
    if (nombreLower.includes('smartwatch') || nombreLower.includes('reloj')) return 'watch-outline';
    if (nombreLower.includes('app') || nombreLower.includes('aplicación')) return 'phone-portrait-outline';
    if (nombreLower.includes('sensor')) return 'radio-outline';
    return 'information-circle-outline';
  };

  const renderFuenteItem = ({ item }) => (
    <View style={styles.fuenteCard}>
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
          onPress={() => eliminarFuente(item.id_fuente_informacion)}
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
        <Text style={styles.headerTitle}>Fuentes de Información</Text>
        <Text style={styles.headerSubtitle}>Gestiona tus dispositivos y métodos de registro</Text>
      </View>

      {/* Lista de fuentes */}
      <FlatList
        data={fuentes}
        renderItem={renderFuenteItem}
        keyExtractor={(item) => item.id_fuente_informacion.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="phone-portrait-outline" size={64} color={COLORS.lighter} />
            <Text style={styles.emptyText}>No hay fuentes registradas</Text>
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
                {editMode ? 'Editar Fuente' : 'Nueva Fuente'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Nombre */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre de la Fuente</Text>
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ej: Smartwatch, App móvil, Manual"
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
                  placeholder="Describe cómo se registra la información con esta fuente"
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Sugerencias */}
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Sugerencias:</Text>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => {
                    setNombre('Manual');
                    setDescripcion('Registro manual de actividades por el usuario');
                  }}
                >
                  <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.suggestionText}>Manual</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => {
                    setNombre('Smartwatch');
                    setDescripcion('Datos sincronizados desde reloj inteligente');
                  }}
                >
                  <Ionicons name="watch-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.suggestionText}>Smartwatch</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => {
                    setNombre('App móvil');
                    setDescripcion('Registro automático desde aplicación móvil');
                  }}
                >
                  <Ionicons name="phone-portrait-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.suggestionText}>App móvil</Text>
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
                  onPress={guardarFuente}
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
  fuenteCard: {
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
    maxHeight: '80%',
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
