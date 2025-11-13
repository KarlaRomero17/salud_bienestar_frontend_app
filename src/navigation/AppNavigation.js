// AppNavigation.js - VERSIÓN FINAL CON STACK ANIDADO
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Importaciones de Screens
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
// Importaciones actividad_fisica
import MenuActividadScreen from '../screens/ActividadFisica/MenuActividadScreen';
import NuevaSesionScreen from '../screens/ActividadFisica/NuevaSesionScreen';
import AgregarActividadScreen from '../screens/ActividadFisica/AgregarActividadScreen';
import EstadisticasScreen from '../screens/ActividadFisica/EstadisticasScreen';
import WeightHistoryScreen from '../screens/Progress/WeightHistoryScreen';
import PerfilScreen from '../screens/Configuraciones/PerfilScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// === 1. Stack Navigator dedicado para la pestaña "Entrenamientos" ===
function ActividadFisicaStack() {
  return (
    // headerShown: false aquí para que la cabecera sea manejada por las screens internas
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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

function MainTabs({ initialRouteName }) {
  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#64748b',

        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen}
        options={{ tabBarLabel: 'Inicio', tabBarIcon: ({ color, size }) => (<MaterialIcons name="home" color={color} size={size} />), }}
      />

      <Tab.Screen
        name="ActividadFisica"
        component={ActividadFisicaStack}
        options={{
          tabBarLabel: 'Entrenamientos',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="fitness-center" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen name="Planes de Comida" component={PlanesDeComidaScreen}
        options={{ tabBarLabel: 'Planes de Comida', tabBarIcon: ({ color, size }) => (<MaterialIcons name="restaurant-menu" color={color} size={size} />), }}
      />
      <Tab.Screen name="Foros" component={ForumScreen}
        options={{ tabBarLabel: 'Foros', tabBarIcon: ({ color, size }) => (<MaterialIcons name="forum" color={color} size={size} />), }}
      />
      <Tab.Screen name="Configuracion" component={ConfiguracionesScreen}
        options={{ tabBarLabel: 'Configuración', tabBarIcon: ({ color, size }) => (<MaterialIcons name="settings" color={color} size={size} />), }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  const { user, isNewUser } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs">
              {(props) => <MainTabs {...props} initialRouteName={isNewUser ? 'Configuracion' : 'Home'} />}
            </Stack.Screen>

            <Stack.Screen
              name="HealthGoal"
              component={HealthGoalsScreen}
              options={{ headerShown: true, title: 'Objetivos de Salud', headerBackTitle: 'Atrás' }}
            />
            {/* recordatorios */}
            <Stack.Screen
              name="Reminders"
              component={RemindersScreen}
              options={{ headerShown: true, title: 'Recordatorios', headerBackTitle: 'Atrás' }}
            />
            <Stack.Screen name="Progress" component={ProgressScreen}
              options={{ headerShown: true, title: 'Progreso', headerBackTitle: 'Atrás' }}
            />
            <Stack.Screen name="NewPublication" component={NewPublicationScreen}
              options={{ headerShown: true, title: 'Nueva Publicación', headerBackTitle: 'Atrás' }}
            />
            <Stack.Screen name="PublicationDetails" component={PublicatonDetailsScreen}
              options={{ headerShown: true, title: 'Detalles Publicación', headerBackTitle: 'Atrás' }}
            />
            <Stack.Screen
              name="WeightHistory"
              component={WeightHistoryScreen}
              options={{ headerShown: true, title: 'Historial de Peso' }}
            />
            <Stack.Screen
              name="Perfil"
              component={PerfilScreen}
              options={{ headerShown: true,  title: 'Mi Perfil' }}
            />
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