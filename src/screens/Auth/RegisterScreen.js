import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import firebaseAuth from '../../../src/firebaseAuth';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';
import { ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState('Masculino');
  const [idRol, setIdRol] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!nombre || !apellido || !email || !password) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return;
    }

    const profile = {
      nombre,
      apellido,
      altura: altura ? Number(altura) : null,
      peso: peso ? Number(peso) : null,
      edad: edad ? Number(edad) : null,
      sexo,
      idRol: Number(idRol)
    };

    setIsLoading(true);
    try {
      // Primero registrar el usuario
      const res = await firebaseAuth.signUpWithEmail(email, password, profile);
      if (res && res.success === false) {
        const message = getFirebaseErrorMessage(res.error);
        Alert.alert('Error', message);
        return;
      }
      
      // Registro exitoso - ahora iniciar sesión automáticamente
      const loginRes = await login(email, password, true); // true = fromRegistration
      if (loginRes && loginRes.success) {
        // Marcar que viene desde registro para mostrar configuración
        Alert.alert('¡Bienvenido!', 'Tu cuenta fue creada correctamente', [
          {
            text: 'Continuar',
            onPress: () => {
              // La navegación se manejará automáticamente por el cambio de user
            }
          }
        ]);
      } else {
        // Si falla el login automático, volver a login manual
        Alert.alert('Cuenta creada', 'Tu cuenta fue creada. Por favor inicia sesión.');
        navigation.navigate('Login');
      }
    } catch (error) {
      const message = getFirebaseErrorMessage(error);
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Crear cuenta</Text>

        <Text style={styles.label}>Nombre *</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

        <Text style={styles.label}>Apellido *</Text>
        <TextInput style={styles.input} value={apellido} onChangeText={setApellido} />

        <Text style={styles.label}>Correo electrónico *</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Contraseña *</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

        <Text style={styles.label}>Altura (m)</Text>
        <TextInput style={styles.input} value={altura} onChangeText={setAltura} keyboardType="numeric" />

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput style={styles.input} value={peso} onChangeText={setPeso} keyboardType="numeric" />

        <Text style={styles.label}>Edad</Text>
        <TextInput style={styles.input} value={edad} onChangeText={setEdad} keyboardType="numeric" />

        <Text style={styles.label}>Sexo</Text>
        <TextInput style={styles.input} value={sexo} onChangeText={setSexo} />

        <Text style={styles.label}>idRol</Text>
        <TextInput style={styles.input} value={idRol} onChangeText={setIdRol} keyboardType="numeric" />

        <TouchableOpacity style={[styles.registerButton, isLoading && styles.disabledButton]} onPress={handleRegister} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.registerButtonText}>Registrarse</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backButtonText}>Volver al login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  label: { fontSize: 14, marginTop: 8, marginBottom: 4 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  registerButton: { backgroundColor: '#10b981', padding: 14, borderRadius: 8, marginTop: 18, alignItems: 'center' },
  registerButtonText: { color: '#fff', fontWeight: '600' },
  disabledButton: { opacity: 0.6 },
  backButton: { marginTop: 12, alignItems: 'center' },
  backButtonText: { color: '#10b981', fontWeight: '600' }
});
