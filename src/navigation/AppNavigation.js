// AppNavigation.js - VERSIÓN FINAL CON LÓGICA DE TIEMPO CONTROLADA POR LA APP

import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- Importamos AsyncStorage
import { fetchTodosLosConsejos } from '../services/consejosService';

// --- TUS IMPORTACIONES DE PANTALLAS (SIN CAMBIOS) ---
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import HomeScreen from '../screens/Dashboard/HomeScreen';
import ActividadFisicaScreen from '../screens/ActividadFisica/ActividadFisicaScreen';
import ConfiguracionesScreen from '../screens/Configuraciones/ConfiguracionesScreen';
import ForumScreen from '../screens/Forum/ForumScreen';
import NewPublicationScreen from '../screens/Forum/NewPublicationScreen';
import PublicatonDetailsScreen from '../screens/Forum/PublicationDetailsScreen';
import PlanesDeComidaScreen from '../screens/PlanesDeComida/PlanesDeComidaScreen';
import HealthGoalsScreen from '../screens/Progress/HealthGoalsScreen';
import ProgressScreen from '../screens/Progress/ProgressScreen';
import RemindersScreen from '../screens/Progress/RemindersScreen';


// --- CONFIGURACIÓN DE NOTIFICACIONES ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// TU COMPONENTE MainTabs (SIN CAMBIOS)
function MainTabs({ initialRouteName }) {
    return (
        <Tab.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
            tabBarActiveTintColor: '#10b981',
            tabBarInactiveTintColor: '#64748b',
            tabBarStyle: { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingBottom: 5, paddingTop: 5, height: 60, },
            tabBarLabelStyle: { fontSize: 12, fontWeight: '600', },
            headerShown: false,
        }}
        >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Inicio', tabBarIcon: ({ color, size }) => (<MaterialIcons name="home" color={color} size={size} />), }} />
        <Tab.Screen name="Entrenamientos" component={ActividadFisicaScreen} options={{ tabBarLabel: 'Entrenamientos', tabBarIcon: ({ color, size }) => (<MaterialIcons name="fitness-center" color={color} size={size} />), }} />
        <Tab.Screen name="Planes de Comida" component={PlanesDeComidaScreen} options={{ headerShown: true, title: 'Plan de Comida', headerBackTitle: 'Atrás', tabBarLabel: 'Planes de Comida', tabBarIcon: ({ color, size }) => (<MaterialIcons name="restaurant-menu" color={color} size={size} />), }} />
        <Tab.Screen name="Foros" component={ForumScreen} options={{ tabBarLabel: 'Foros', tabBarIcon: ({ color, size }) => (<MaterialIcons name="forum" color={color} size={size} />), }} />
        <Tab.Screen name="Configuracion" component={ConfiguracionesScreen} options={{ tabBarLabel: 'Configuración', tabBarIcon: ({ color, size }) => (<MaterialIcons name="settings" color={color} size={size} />), }} />
        </Tab.Navigator>
    );
}

// TU COMPONENTE PRINCIPAL CON LA LÓGICA CORRECTA PARA EXPO GO
export default function AppNavigation() {
  const { user, isNewUser } = useContext(AuthContext);
  
  useEffect(() => {
    const checkAndSendNotification = async () => {
      // Pedimos permiso
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      // --- LÓGICA DE COMPROBACIÓN DE TIEMPO ---
      const LAST_NOTIFICATION_TIMESTAMP_KEY = '@last_notification_timestamp';
      
      try {
        // 1. Obtenemos la fecha de la última notificación guardada
        const lastNotificationTime = await AsyncStorage.getItem(LAST_NOTIFICATION_TIMESTAMP_KEY);
        const now = new Date().getTime();

        // PARA PRUEBAS: 1 minuto (60 segundos * 1000 milisegundos)
        const TIME_BETWEEN_NOTIFICATIONS = 60 * 1000; 

        // PARA PRODUCCIÓN: 24 horas
        // const TIME_BETWEEN_NOTIFICATIONS = 24 * 60 * 60 * 1000;

        // 2. Comprobamos si ha pasado el tiempo necesario
        if (!lastNotificationTime || now - parseInt(lastNotificationTime) > TIME_BETWEEN_NOTIFICATIONS) {
          console.log("Ha pasado el tiempo necesario. Enviando una nueva notificación.");
          
          const consejos = await fetchTodosLosConsejos();
          if (!consejos || consejos.length === 0) return;

          const randomIndex = Math.floor(Math.random() * consejos.length);
          const consejoRandom = consejos[randomIndex];

          // 3. Programamos la notificación para que se dispare AHORA
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "💡 Consejo de Bienestar",
              body: consejoRandom.texto,
            },
            trigger: null, // trigger: null significa "inmediatamente"
          });

          // 4. Guardamos la nueva fecha en la memoria del teléfono
          await AsyncStorage.setItem(LAST_NOTIFICATION_TIMESTAMP_KEY, now.toString());
          console.log("Nueva fecha de notificación guardada.");

        } else {
          console.log("Aún no ha pasado el tiempo necesario para una nueva notificación.");
        }
      } catch (error) {
        console.error("Error en la lógica de notificación:", error);
      }
    };

    if (user) {
      checkAndSendNotification();
    }
  }, [user]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs">
              {(props) => <MainTabs {...props} initialRouteName={isNewUser ? 'Configuracion' : 'Home'} />}
            </Stack.Screen>
            <Stack.Screen name="HealthGoal" component={HealthGoalsScreen} options={{ headerShown: true, title: 'Objetivos de Salud', headerBackTitle: 'Atrás' }} />
            <Stack.Screen name="Reminders" component={RemindersScreen} options={{ headerShown: true, title: 'Recordatorios', headerBackTitle: 'Atrás' }} />
            <Stack.Screen name="Progress" component={ProgressScreen} options={{ headerShown: true, title: 'Progreso', headerBackTitle: 'Atrás' }} />
            <Stack.Screen name="NewPublication" component={NewPublicationScreen} options={{ headerShown: true, title: 'Nueva Publicación', headerBackTitle: 'Atrás' }} />
            <Stack.Screen name="PublicationDetails" component={PublicatonDetailsScreen} options={{ headerShown: true, title: 'Detalles Publicación', headerBackTitle: 'Atrás' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}