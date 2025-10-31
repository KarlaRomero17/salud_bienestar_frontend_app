import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const GOALS_DATA = [
  { id: '1', title: 'Perder peso' },
  { id: '2', title: 'Aumentar masa muscular' },
  { id: '3', title: 'Mejorar el sueño' },
  { id: '4', title: 'Reducir el estrés' },
  { id: '5', title: 'Aumentar energía' },
  { id: '6', title: 'Mejorar la nutrición' },
];



const GoalItem = ({ item, onPress, isSelected }) => {
  const itemStyle = isSelected ? styles.itemSelected : styles.item;
  const textStyle = isSelected ? styles.itemTextSelected : styles.itemText;
  const checkColor = isSelected ? '#FFF' : '#34A853';

  return (
    <TouchableOpacity onPress={onPress} style={itemStyle}>
      <Text style={textStyle}>{item.title}</Text>
      <View
        style={[
          styles.checkbox,
          isSelected && { backgroundColor: '#65C18C', borderColor: '#65C18C' },
        ]}
      >
        {isSelected && <Icon name="check" size={18} color={checkColor} />}
      </View>
    </TouchableOpacity>
  );
};

const GoalsScreen = ({ navigation }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleSelectGoal = (id) => {
    setSelectedGoal(id === selectedGoal ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={{ fontSize: 24 }}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>¿Cuál es tu objetivo de salud?</Text>
      <Text style={styles.subtitle}>
        Selecciona el objetivo principal que más se adapte a tus metas de
        bienestar. Esto nos ayudará a personalizar tu experiencia.
      </Text>

      <FlatList
        data={GOALS_DATA}
        renderItem={({ item }) => (
          <GoalItem
            item={item}
            onPress={() => handleSelectGoal(item.id)}
            isSelected={selectedGoal === item.id}
          />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[
          styles.button,
          selectedGoal ? styles.buttonEnabled : styles.buttonDisabled,
        ]}
        disabled={!selectedGoal}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Finalizar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F8E0',
    padding: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34A853',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    marginTop: 10,
    marginBottom: 25,
  },
  list: {
    width: '100%',
    flexGrow: 0,
  },
  item: {
    backgroundColor: '#FFF',
    padding: 18,
    marginVertical: 8,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  itemSelected: {
    backgroundColor: '#34A853',
    padding: 18,
    marginVertical: 8,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  itemTextSelected: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#34A853',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  button: {
    borderRadius: 30,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  buttonEnabled: {
    backgroundColor: '#34A853', 
  },
  buttonDisabled: {
    backgroundColor: '#A9DDBB', 
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GoalsScreen;
