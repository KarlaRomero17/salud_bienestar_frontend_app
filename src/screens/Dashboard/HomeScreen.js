import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Components
import PrimaryCard from '../../components/PrimaryCard';
import SectionTitle from '../../components/SectionTitle';
import Decorations from '../../components/Decorations';
import Header from '../../components/Header';

// Services
import { recordatoriosService } from '../../services/recordatoriosService';
import { AuthContext } from '../../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [todayReminders, setTodayReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const userId = user?.uid;
  // Cargar recordatorios de hoy
  const loadTodayReminders = async () => {
  try {
    setLoading(true);
    const response = await recordatoriosService.obtenerDeHoy(userId);

    // Verificar la estructura de respuesta
    if (response.exito) {
      setTodayReminders(response.datos || []);
      // console.log(`Recordatorios cargados: ${response.datos?.length || 0}`);
    } else {
      // console.log('Servicio respondió con error:', response.error);
      setTodayReminders([]);
    }
  } catch (error) {
    // console.error('Error cargando recordatorios:', error);
    setTodayReminders([]);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  // Marcar recordatorio como tomado
  const handleMarkAsTaken = async (reminderId) => {
    try {
      await recordatoriosService.marcarTomado(reminderId);
      loadTodayReminders();
    } catch (error) {
      console.error('Error marcando recordatorio:', error);
      Alert.alert('Error', 'No se pudo marcar el recordatorio');
    }
  };

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadTodayReminders();
  };

  useEffect(() => {
    if (user) {
      loadTodayReminders();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Función para formatear la hora
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Obtener icono según el tipo de recordatorio
  const getReminderIcon = (reminder) => {
    const name = reminder.name?.toLowerCase() || '';
    if (name.includes('comida') || name.includes('alimento')) return 'restaurant';
    if (name.includes('agua') || name.includes('hidrat')) return 'water';
    if (name.includes('ejercicio') || name.includes('deporte')) return 'fitness';
    if (name.includes('dormir') || name.includes('sueño')) return 'moon';
    if (name.includes('vitamina') || name.includes('suplemento')) return 'nutrition';
    return 'medical';
  };

  // Obtener color según el estado
  const getReminderColor = (reminder) => {
    if (reminder.tomado) return '#94a3b8';
    return '#2a8c4a';
  };

  const mainActions = [
    {
      title: 'Recordatorios',
      description: 'Gestiona tus alertas y notificaciones',
      icon: 'alarm',
      badge: todayReminders.length > 0 ? todayReminders.length.toString() : null,
      variant: 'primary',
      onPress: () => navigation.navigate('Reminders')
    },
    {
      title: 'Progreso',
      description: 'Revisa tu evolución y logros',
      icon: 'trending-up',
      variant: 'secondary',
      onPress: () => navigation.navigate('Progress')
    },
    {
      title: 'Objetivos',
      description: 'Gestiona tus metas de salud',
      icon: 'flag',
      variant: 'accent',
      onPress: () => navigation.navigate('HealthGoal')
    }
  ];

  if (!user) {
    return (
      <View style={styles.container}>
        <Decorations />
        <Header />
        <View style={styles.authErrorContainer}>
          <Ionicons name="lock-closed" size={64} color="#ff6b6b" />
          <Text style={styles.authErrorTitle}>No autenticado</Text>
          <Text style={styles.authErrorText}>
            Por favor, inicia sesión para ver tus recordatorios
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Decorations />
      <Header />

      {/* Recordatorios de Hoy - Versión Compacta */}
      <View style={{ ...styles.section, marginTop: 10 }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recordatorios de Hoy</Text>
          {todayReminders.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Reminders')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={20} color="#64748b" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : todayReminders.length > 0 ? (
          <View style={styles.remindersContainer}>
            {todayReminders.slice(0, 2).map((reminder, index) => {
              const reminderColor = getReminderColor(reminder);
              const reminderIcon = getReminderIcon(reminder);
              const isPending = !reminder.tomado;

              return (
                <TouchableOpacity
                  key={reminder._id || index}
                  style={[
                    styles.reminderCard,
                    { borderLeftColor: reminderColor }
                  ]}
                  onPress={() => isPending && handleMarkAsTaken(reminder._id)}
                >
                  <View style={styles.reminderContent}>
                    <View style={styles.reminderLeft}>
                      <View style={[styles.iconContainer, { backgroundColor: `${reminderColor}15` }]}>
                        <Ionicons name={reminderIcon} size={18} color={reminderColor} />
                      </View>
                      <View style={styles.reminderInfo}>
                        <Text style={[
                          styles.reminderTitle,
                          !isPending && styles.reminderTitleCompleted
                        ]}>
                          {reminder.name}
                        </Text>
                        <Text style={styles.reminderTime}>
                          {formatTime(reminder.time)}
                        </Text>
                      </View>
                    </View>

                    {isPending ? (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: reminderColor }]}
                        onPress={() => handleMarkAsTaken(reminder._id)}
                      >
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.actionButton, { backgroundColor: reminderColor }]}>
                        <Ionicons name="checkmark-done" size={16} color="#fff" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {todayReminders.length > 2 && (
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => navigation.navigate('Reminders')}
              >
                <Text style={styles.moreText}>
                  +{todayReminders.length - 2} más
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="alarm-outline" size={32} color="#cbd5e1" />
            <Text style={styles.emptyText}>Sin recordatorios hoy</Text>
          </View>
        )}
      </View>

      {/* Acciones Principales */}
      <View style={styles.mainSection}>
        <SectionTitle title="Acciones Rápidas" />
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

      <View style={styles.bottomSpace} />
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
  section: {
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  seeAllText: {
    color: '#2a8c4a',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 14,
  },
  remindersContainer: {
    gap: 12,
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  reminderTitleCompleted: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  reminderTime: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  moreText: {
    color: '#2a8c4a',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  mainSection: {
    paddingHorizontal: 25,
    paddingBottom: 10,
  },
  bottomSpace: {
    height: 30,
  },
  authErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authErrorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  authErrorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#2a8c4a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default HomeScreen;