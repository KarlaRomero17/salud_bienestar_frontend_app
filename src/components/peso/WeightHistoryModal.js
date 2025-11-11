// components/WeightHistoryModal.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const WeightHistoryModal = ({ visible, onClose, historial, unit = 'kg' }) => {
  const formatFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTendencia = (index) => {
    if (index === 0 || historial.length < 2) return 'neutral';
    
    const pesoActual = historial[index].peso_actual;
    const pesoAnterior = historial[index - 1].peso_actual;
    
    if (pesoActual < pesoAnterior) return 'down';
    if (pesoActual > pesoAnterior) return 'up';
    return 'neutral';
  };

  const renderItem = ({ item, index }) => {
    const tendencia = getTendencia(index);
    
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyContent}>
          <View style={styles.weightInfo}>
            <Text style={styles.weightValue}>
              {item.peso_actual} {unit}
            </Text>
            <Text style={styles.bodyFatText}>
              {item.grasa_corporal}% grasa
            </Text>
          </View>
          <View style={styles.dateInfo}>
            <Text style={styles.dateText}>
              {formatFecha(item.fecha)}
            </Text>
            {tendencia !== 'neutral' && (
              <View style={[
                styles.tendenciaIndicator,
                tendencia === 'down' ? styles.tendenciaDown : styles.tendenciaUp
              ]}>
                <Icon 
                  name={tendencia === 'down' ? 'arrow-downward' : 'arrow-upward'} 
                  size={14} 
                  color="#ffffff" 
                />
              </View>
            )}
          </View>
        </View>
        {item.medida_cintura && (
          <Text style={styles.extraInfo}>
            Cintura: {item.medida_cintura}cm
          </Text>
        )}
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Historial de Peso</Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {historial && historial.length > 0 ? (
            <FlatList
              data={historial}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.historyList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="scale" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>
                No hay registros de peso
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Registra tu primer peso para ver el historial
              </Text>
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.closeActionButton]}
              onPress={onClose}>
              <Text style={styles.closeActionButtonText}>Cerrar</Text>
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
  historyList: {
    maxHeight: 400,
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightInfo: {
    flex: 1,
  },
  weightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bodyFatText: {
    fontSize: 14,
    color: '#666',
  },
  dateInfo: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  tendenciaIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tendenciaDown: {
    backgroundColor: '#4caf50',
  },
  tendenciaUp: {
    backgroundColor: '#f44336',
  },
  extraInfo: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
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
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  closeActionButton: {
    backgroundColor: '#2a8c4a',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeActionButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default WeightHistoryModal;