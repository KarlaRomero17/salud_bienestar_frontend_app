import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log('Iniciar sesión con:', identifier, password);
  };


  const isFormFilled = identifier.trim() !== '' && password.trim() !== '';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Bienestar</Text>

    
          <View style={styles.inputContainer}>
            <Icon name="user" size={20} color="#333" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Usuario o correo electrónico"
              value={identifier}
              onChangeText={setIdentifier}
              placeholderTextColor="#888"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

   
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#333" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#888"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#65C18C"
              />
            </TouchableOpacity>
          </View>

  
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isFormFilled ? '#34A853' : '#A5D6A7' },
            ]}
            onPress={handleLogin}
            disabled={!isFormFilled} 
          >
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

    
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>¿No tienes una cuenta? Regístrate</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F8E0',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#34A853',
    marginBottom: 50,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 30,
    width: '90%',
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  icon: {
    marginRight: 10,
    color: '#65C18C',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 5,
  },
  button: {
    borderRadius: 30,
    width: '90%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 30,
    color: '#34A853',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
