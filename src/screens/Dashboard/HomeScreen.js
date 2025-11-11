import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';

// Components
import PrimaryCard from '../../components/PrimaryCard';
import SectionTitle from '../../components/SectionTitle';
import Decorations from '../../components/Decorations';
import Header from '../../components/Header';

const HomeScreen = ({ navigation }) => {
  const mainActions = [
    {
      title: 'Recordatorios',
      description: 'Gestiona tus alertas y notificaciones importantes',
      icon: 'alarm',
      badge: '3',
      variant: 'primary',
      onPress: () => navigation.navigate('Reminders')
    },
    {
      title: 'Progreso',
      description: 'Revisa tu evolución y logros alcanzados',
      icon: 'trending-up',
      badge: 'Nuevo',
      variant: 'secondary',
      onPress: () => navigation.navigate('Progress')
    },
    // {
    //   title: 'Entrenamientos',
    //   description: 'Accede a tus rutinas de ejercicio personalizadas',
    //   icon: 'fitness',
    //   variant: 'accent',
    //   onPress: () => navigation.navigate('Workouts')
    // }
  ];

  // Datos para herramientas rápidas
  const quickTools = [
    {
      title: 'Agua',
      description: 'Registro de hidratación diaria',
      icon: 'water',
      variant: 'secondary',
      size: 'small',
      onPress: () => navigation.navigate('WaterTracker')
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Decorations />
      
      {/* Header con hora y fecha */}
      <Header />

      {/* Sección Principal */}
      <View style={styles.mainSection}>
        <SectionTitle title="Acciones Principales" />
        
        {mainActions.map((action, index) => (
          <PrimaryCard 
            key={index}
            title={action.title}
            description={action.description}
            icon={action.icon}
            badge={action.badge}
            variant={action.variant}
            onPress={action.onPress}
          />
        ))}
      </View>


      {/* Sección de Estadísticas Rápidas */}
      <View style={styles.section}>
        <SectionTitle title="Tu Día en Resumen" />
        <PrimaryCard 
          title="Actividad Hoy"
          description="Has completado el 75% de tus objetivos diarios"
          icon="checkmark-circle"
          variant="primary"
          size="small"
          onPress={() => navigation.navigate('HealthGoal')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  welcomeSection: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  mainSection: {
    padding: 25,
    paddingTop: 15,
    paddingBottom: 10,
  },
  section: {
    padding: 25,
    paddingTop: 0,
    paddingBottom: 10,
  },
  quickToolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickToolWrapper: {
    width: '48%',
  },
});

export default HomeScreen;