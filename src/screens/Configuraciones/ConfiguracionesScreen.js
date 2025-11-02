import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

export default function ConfiguracionesScreen() {
  const { logout, user, isNewUser, setIsNewUser } = useContext(AuthContext);

  // Mostrar alerta solo si es nuevo usuario
  useEffect(() => {
    if (isNewUser) {
      Alert.alert(
        '¡Bienvenido!',
        'Para empezar, debes configurar tus Objetivos de Salud',
        [
          {
            text: 'Entendido',
            onPress: () => {
              setIsNewUser(false); // Marcar como ya mostrado
            }
          }
        ]
      );
    }
  }, [isNewUser]);

  const handleLogout = () => {
    if (!logout) {
      Alert.alert('Error', 'La función logout no está disponible');
      return;
    }
    
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Mostrar confirmación
              Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión: ' + error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <MaterialIcons name="settings" size={60} color="#10b981" />
          <Text style={styles.title}>Configuración</Text>
          <Text style={styles.subtitle}>Administra tu cuenta y preferencias</Text>
        </View>

        {/* Información del Usuario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.infoCard}>
            <MaterialIcons name="email" size={20} color="#64748b" />
            <Text style={styles.infoText}>{user?.email || 'No disponible'}</Text>
          </View>
        </View>

        {/* Opciones de Configuración */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opciones</Text>
          
          <TouchableOpacity style={styles.optionButton}>
            <MaterialIcons name="person" size={24} color="#10b981" />
            <Text style={styles.optionText}>Editar Perfil</Text>
            <MaterialIcons name="chevron-right" size={24} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton}>
            <MaterialIcons name="notifications" size={24} color="#10b981" />
            <Text style={styles.optionText}>Notificaciones</Text>
            <MaterialIcons name="chevron-right" size={24} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton}>
            <MaterialIcons name="lock" size={24} color="#10b981" />
            <Text style={styles.optionText}>Privacidad</Text>
            <MaterialIcons name="chevron-right" size={24} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton}>
            <MaterialIcons name="help" size={24} color="#10b981" />
            <Text style={styles.optionText}>Ayuda y Soporte</Text>
            <MaterialIcons name="chevron-right" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Botón de Cerrar Sesión */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="#ffffff" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Versión 1.0.0</Text>
          <Text style={styles.footerText}>Salud y Bienestar App</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
});
