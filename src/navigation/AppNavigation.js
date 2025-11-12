// AppNavigation.js - VERSIÓN FUSIONADA Y CORREGIDA

import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

// --- IMPORTACIONES PARA NOTIFICACIONES ---
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTodosLosConsejos } from '../services/consejosService';

// --- IMPORTACIONES DE PANTALLAS (Fusionadas) ---
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import HomeScreen from '../screens/Dashboard/HomeScreen';
import ConfiguracionesScreen from '../screens/Configuraciones/ConfiguracionesScreen';
import ForumScreen from '../screens/Forum/ForumScreen';
import NewPublicationScreen from '../screens/Forum/NewPublicationScreen';
import PublicatonDetailsScreen from '../screens/Forum/PublicationDetailsScreen';
import PlanesDeComidaScreen from '../screens/PlanesDeComida/PlanesDeComidaScreen';
import HealthGoalsScreen from '../screens/Progress/HealthGoalsScreen';
import ProgressScreen from '../screens/Progress/ProgressScreen';
import RemindersScreen from '../screens/Progress/RemindersScreen';
// Importaciones nuevas de actividad_fisica
import MenuActividadScreen from '../screens/ActividadFisica/MenuActividadScreen';
import NuevaSesionScreen from '../screens/ActividadFisica/NuevaSesionScreen';
import AgregarActividadScreen from '../screens/ActividadFisica/AgregarActividadScreen';
import EstadisticasScreen from '../screens/ActividadFisica/EstadisticasScreen';


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

// STACK NAVIGATOR PARA LA SECCIÓN DE ACTIVIDAD FÍSICA
function ActividadFisicaStack() {
  return (
    <Stack.Navigator> 
      <Stack.Screen 
        name="MenuActividad" 
        component={MenuActividadScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="NuevaSesion" 
        component={NuevaSesionScreen}
        options={{
          headerShown: true, 
          title: 'Nueva Sesión',
          headerBackTitle: 'Atrás'
        }}
      />
      <Stack.Screen 
        name="AgregarActividad" 
        component={AgregarActividadScreen}
        options={{
          headerShown: true,
          title: 'Agregar Actividad',
          headerBackTitle: 'Atrás'
        }}
      />
      <Stack.Screen 
        name="Estadisticas" 
        component={EstadisticasScreen}
        options={{
          headerShown: true,
          title: 'Estadísticas de Actividad',
          headerBackTitle: 'Atrás'
        }}
      />
    </Stack.Navigator>
  );
}

// ÚNICA Y CORRECTA VERSIÓN DEL TAB NAVIGATOR (MainTabs)
function MainTabs({ initialRouteName }) {
  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingBottom: 5, paddingTop: 5, height: 60 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} 
        options={{ 
          headerShown: false,
          tabBarLabel: 'Inicio', 
          tabBarIcon: ({ color, size }) => (<MaterialIcons name="home" color={color} size={size} />), 
        }}
      />
      <Tab.Screen
        name="ActividadFisica" 
        component={ActividadFisicaStack} // Usamos el Stack para la navegación interna
        options={{
          headerShown: false, // El header lo manejará el Stack interno
          tabBarLabel: 'Entrenamientos',
          tabBarIcon: ({ color, size }) => ( <MaterialIcons name="fitness-center" color={color} size={size} /> ),
        }}
      />
      <Tab.Screen name="PlanesDeComida" component={PlanesDeComidaScreen} 
        options={{ 
          // Re-aplicamos las opciones de header que teníamos para esta pantalla específica
          headerShown: true, 
          title: 'Plan de Comida',
          headerBackTitle: 'Atrás',
          tabBarLabel: 'Planes', 
          tabBarIcon: ({ color, size }) => (<MaterialIcons name="restaurant-menu" color={color} size={size} />),
        }}
      />
      <Tab.Screen name="Foros" component={ForumScreen} 
        options={{ 
          headerShown: false,
          tabBarLabel: 'Foros', 
          tabBarIcon: ({ color, size }) => (<MaterialIcons name="forum" color={color} size={size} />), 
        }}
      />
      <Tab.Screen name="Configuracion" component={ConfiguracionesScreen} 
        options={{ 
          headerShown: false,
          tabBarLabel: 'Configuración', 
          tabBarIcon: ({ color, size }) => (<MaterialIcons name="settings" color={color} size={size} />), 
        }}
      />
    </Tab.Navigator>
  );
}

// COMPONENTE PRINCIPAL CON LA LÓGICA DE NOTIFICACIONES
export default function AppNavigation() {
  const { user, isNewUser } = useContext(AuthContext);
  
  useEffect(() => {
    const checkAndSendNotification = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      const LAST_NOTIFICATION_TIMESTAMP_KEY = '@last_notification_timestamp';
      try {
        const lastNotificationTime = await AsyncStorage.getItem(LAST_NOTIFICATION_TIMESTAMP_KEY);
        const now = new Date().getTime();
        const TIME_BETWEEN_NOTIFICATIONS = 60 * 1000; // 1 minuto para pruebas

        if (!lastNotificationTime || now - parseInt(lastNotificationTime) > TIME_BETWEEN_NOTIFICATIONS) {
          console.log("Enviando una nueva notificación de consejo.");
          const consejos = await fetchTodosLosConsejos();
          if (!consejos || consejos.length === 0) return;

          const randomIndex = Math.floor(Math.random() * consejos.length);
          const consejoRandom = consejos[randomIndex];

          await Notifications.scheduleNotificationAsync({
            content: { title: "💡 Consejo de Bienestar", body: consejoRandom.texto },
            trigger: null,
          });

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