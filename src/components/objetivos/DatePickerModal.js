// components/DatePickerModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DatePickerModal = ({ visible, onClose, onDateSelect }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
  const months = [
    { value: 0, name: 'Enero' }, { value: 1, name: 'Febrero' }, { value: 2, name: 'Marzo' },
    { value: 3, name: 'Abril' }, { value: 4, name: 'Mayo' }, { value: 5, name: 'Junio' },
    { value: 6, name: 'Julio' }, { value: 7, name: 'Agosto' }, { value: 8, name: 'Septiembre' },
    { value: 9, name: 'Octubre' }, { value: 10, name: 'Noviembre' }, { value: 11, name: 'Diciembre' }
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  const DatePickerColumn = ({ data, selectedValue, onValueChange, style }) => (
    <ScrollView style={[styles.pickerColumn, style]} showsVerticalScrollIndicator={false}>
      {data.map((item, index) => {
        const value = typeof item === 'object' ? item.value : item;
        const label = typeof item === 'object' ? item.name || item.label : item;
        const isSelected = value === selectedValue;
        
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.pickerItem,
              isSelected && styles.pickerItemSelected
            ]}
            onPress={() => onValueChange(value)}>
            <Text style={[
              styles.pickerItemText,
              isSelected && styles.pickerItemTextSelected
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleConfirm = () => {
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    onDateSelect(selectedDate);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, styles.dateModalContent]}>
          <Text style={styles.modalTitle}>Seleccionar Fecha</Text>
          
          <View style={styles.datePickerContainer}>
            <DatePickerColumn
              data={days}
              selectedValue={selectedDay}
              onValueChange={setSelectedDay}
              style={styles.dayColumn}
            />
            <DatePickerColumn
              data={months}
              selectedValue={selectedMonth}
              onValueChange={(month) => {
                setSelectedMonth(month);
                const daysInNewMonth = getDaysInMonth(selectedYear, month);
                if (selectedDay > daysInNewMonth) {
                  setSelectedDay(daysInNewMonth);
                }
              }}
              style={styles.monthColumn}
            />
            <DatePickerColumn
              data={years}
              selectedValue={selectedYear}
              onValueChange={(year) => {
                setSelectedYear(year);
                const daysInNewMonth = getDaysInMonth(year, selectedMonth);
                if (selectedDay > daysInNewMonth) {
                  setSelectedDay(daysInNewMonth);
                }
              }}
              style={styles.yearColumn}
            />
          </View>

          <View style={styles.selectedDatePreview}>
            <Text style={styles.selectedDateText}>
              Fecha seleccionada: {formatDisplayDate(new Date(selectedYear, selectedMonth, selectedDay))}
            </Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleConfirm}>
              <Text style={styles.saveButtonText}>Confirmar</Text>
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
  dateModalContent: {
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 20,
    textAlign: 'center',
  },
  datePickerContainer: {
    flexDirection: 'row',
    height: 200,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  pickerColumn: {
    flex: 1,
  },
  dayColumn: {
    flex: 1,
  },
  monthColumn: {
    flex: 1.5,
  },
  yearColumn: {
    flex: 1,
  },
  pickerItem: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#2a8c4a',
    borderRadius: 6,
    margin: 2,
  },
  pickerItemText: {
    fontSize: 16,
    color: '#666',
  },
  pickerItemTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  selectedDatePreview: {
    padding: 15,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: 16,
    color: '#2a8c4a',
    fontWeight: '500',
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

export default DatePickerModal;