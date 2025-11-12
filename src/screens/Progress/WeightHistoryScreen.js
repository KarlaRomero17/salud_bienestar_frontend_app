// screens/peso/WeightHistoryScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Layout from '../../components/Layout';
import userService from '../../services/userService';
import { AuthContext } from '../../context/AuthContext';

const WeightHistoryScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);

  const USER_UUID = user?.uid;

  // Cargar historial
  const fetchHistorial = async () => {
    if (!USER_UUID) return;

    try {
      setLoading(true);
      
      // Cargar historial
      const historialResult = await userService.obtenerHistorialPeso(USER_UUID, { limite: 100 });
      if (historialResult.exito) {
        setHistorial(historialResult.datos || []);
      }

      // Cargar estadísticas
      const statsResult = await userService.obtenerEstadisticasPeso(USER_UUID, 30);
      if (statsResult.exito) {
        setEstadisticas(statsResult.datos);
      }

    } catch (error) {
      console.error('Error cargando historial:', error);
      Alert.alert('Error', 'No se pudo cargar el historial');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistorial();
  };

  useEffect(() => {
    fetchHistorial();
  }, [USER_UUID]);

  // Formatear fecha
  const formatFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return {
      fechaCorta: fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      fechaLarga: fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // Eliminar registro
  const eliminarRegistro = (registroId) => {
    Alert.alert(
      "Eliminar Registro",
      "¿Estás seguro de que quieres eliminar este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await userService.eliminarRegistroPeso(USER_UUID, registroId);
              // Actualizar lista local
              setHistorial(prev => prev.filter(registro => registro._id !== registroId));
              Alert.alert('Éxito', 'Registro eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  // Renderizar header con estadísticas
  const renderHeader = () => (
    <View style={styles.header}>
      
      {estadisticas && estadisticas.totalRegistros > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Registros</Text>
              <Text style={styles.statValue}>{estadisticas.totalRegistros}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Cambio</Text>
              <Text style={[
                styles.statValue,
                estadisticas.peso.cambio > 0 ? styles.positive : styles.negative
              ]}>
                {estadisticas.peso.cambio > 0 ? '+' : ''}{estadisticas.peso.cambio.toFixed(1)} kg
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Tendencia</Text>
              <Text style={[
                styles.statValue,
                estadisticas.tendencia === 'bajando' ? styles.positive : 
                estadisticas.tendencia === 'subiendo' ? styles.negative : styles.neutral
              ]}>
                {estadisticas.tendencia === 'bajando' ? '↓ Bajando' :
                 estadisticas.tendencia === 'subiendo' ? '↑ Subiendo' : '→ Estable'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Encabezado de la tabla */}
      <View style={styles.tableHeader}>
        <Text style={[styles.columnHeader, styles.dateColumn]}>FECHA</Text>
        <Text style={[styles.columnHeader, styles.weightColumn]}>PESO (kg)</Text>
        <Text style={[styles.columnHeader, styles.fatColumn]}>GRASA %</Text>
        <Text style={[styles.columnHeader, styles.actionsColumn]}>ACCIONES</Text>
      </View>
    </View>
  );

  // Renderizar item del historial
  const renderItem = ({ item, index }) => {
    const { fechaCorta, fechaLarga } = formatFecha(item.fecha);
    const isPrimerRegistro = index === 0;
    
    return (
      <View style={[
        styles.tableRow,
        isPrimerRegistro && styles.currentRow
      ]}>
        {/* Columna Fecha */}
        <View style={[styles.column, styles.dateColumn]}>
          <Text style={styles.dateText} numberOfLines={1}>
            {fechaCorta}
          </Text>
          <Text style={styles.timeText} numberOfLines={1}>
            {formatFecha(item.fecha).fechaLarga.split(' ')[3]} {/* Solo la hora */}
          </Text>
        </View>

        {/* Columna Peso */}
        <View style={[styles.column, styles.weightColumn]}>
          <Text style={[
            styles.weightText,
            isPrimerRegistro && styles.currentWeightText
          ]}>
            {item.peso}
          </Text>
        </View>

        {/* Columna Grasa */}
        <View style={[styles.column, styles.fatColumn]}>
          {item.grasa_corporal ? (
            <Text style={styles.fatText}>
              {item.grasa_corporal}%
            </Text>
          ) : (
            <Text style={styles.noDataText}>-</Text>
          )}
        </View>

        {/* Columna Acciones */}
        <View style={[styles.column, styles.actionsColumn]}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => eliminarRegistro(item._id)}>
            <Icon name="delete" size={18} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Renderizar empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="scale" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No hay registros</Text>
      <Text style={styles.emptyStateText}>
        Aún no has registrado tu peso.{'\n'}
        Ve a la pantalla de objetivos para agregar tu primer registro.
      </Text>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Volver a Objetivos</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <Layout title="Historial de Peso">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2a8c4a" />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout title="Historial de Peso">
      <FlatList
        data={historial}
        renderItem={renderItem}
        keyExtractor={(item, index) => item._id || index.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2a8c4a']}
            tintColor="#2a8c4a"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#f0f8f0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a8c4a',
  },
  positive: {
    color: '#4caf50',
  },
  negative: {
    color: '#f44336',
  },
  neutral: {
    color: '#ff9800',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2a8c4a',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  columnHeader: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateColumn: {
    flex: 2,
  },
  weightColumn: {
    flex: 1,
    textAlign: 'center',
  },
  fatColumn: {
    flex: 1,
    textAlign: 'center',
  },
  actionsColumn: {
    flex: 0.8,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  currentRow: {
    backgroundColor: '#e8f5e9',
    borderColor: '#2a8c4a',
    borderWidth: 2,
  },
  column: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  timeText: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  weightText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  currentWeightText: {
    fontWeight: 'bold',
    color: '#2a8c4a',
    fontSize: 18,
  },
  fatText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#ccc',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  deleteButton: {
    padding: 6,
    alignSelf: 'center',
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: '#2a8c4a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default WeightHistoryScreen;