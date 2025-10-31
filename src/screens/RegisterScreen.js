import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);


  const animatedHeight = new Animated.Value(height);
  const animatedWeight = new Animated.Value(weight);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={{ fontSize: 24 }}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Registro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        keyboardType="email-address"
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Edad"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={sex}
          onValueChange={(itemValue) => setSex(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Selecciona tu género" value={null} enabled={false} />
          <Picker.Item label="Masculino" value="male" />
          <Picker.Item label="Femenino" value="female" />
          <Picker.Item label="Prefiero no decir" value="other" />
        </Picker>
      </View>


      <View style={styles.measureContainer}>
        <Text style={styles.sectionTitle}>Altura y Peso</Text>

        <View style={styles.measureRow}>
          <Text style={styles.measureLabel}>Altura: {Math.round(height)} cm</Text>
          <Slider
            style={styles.slider}
            minimumValue={100}
            maximumValue={220}
            value={height}
            onValueChange={(val) => {
              setHeight(val);
              Animated.timing(animatedHeight, { toValue: val, duration: 200, useNativeDriver: false }).start();
            }}
            minimumTrackTintColor="#34A853"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#34A853"
          />
        </View>

        <View style={styles.measureRow}>
          <Text style={styles.measureLabel}>Peso: {Math.round(weight)} kg</Text>
          <Slider
            style={styles.slider}
            minimumValue={30}
            maximumValue={150}
            value={weight}
            onValueChange={(val) => {
              setWeight(val);
              Animated.timing(animatedWeight, { toValue: val, duration: 200, useNativeDriver: false }).start();
            }}
            minimumTrackTintColor="#34A853"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#34A853"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          name && email && age && sex ? styles.buttonEnabled : styles.buttonDisabled,
        ]}
        disabled={!(name && email && age && sex)}
        onPress={() => navigation.navigate('Goals')}
      >
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F8E0',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34A853',
    marginVertical: 40,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    width: '100%',
    height: 50,
    marginBottom: 15,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    width: '100%',
    height: 50,
    marginBottom: 25,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
  },
  measureContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#CCC',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  measureRow: {
    marginVertical: 10,
  },
  measureLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  button: {
    borderRadius: 30,
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
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

export default RegisterScreen;
