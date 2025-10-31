import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function LogoutScreen({ navigation }) {
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    // Cerrar sesión automáticamente cuando se accede a esta pantalla
    const handleLogout = async () => {
      await logout();
      // La navegación se manejará automáticamente por AuthContext
    };
    handleLogout();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#10b981" />
      <Text style={styles.text}>Cerrando sesión...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
});
