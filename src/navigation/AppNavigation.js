// AppNavigation.js - VERSIÓN CORREGIDA
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

import HomeScreen from '../screens/Dashboard/HomeScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
//Importando screens para el Tab Navigator
import ActividadFisicaScreen from '../screens/ActividadFisica/ActividadFisicaScreen';
import PlanesDeComidaScreen from '../screens/PlanesDeComida/PlanesDeComidaScreen';
import ForosScreen from '../screens/Foros/ForosScreen';
import ConfiguracionesScreen from '../screens/Configuraciones/ConfiguracionesScreen';
import HealthGoalsScreen from '../screens/Progress/HealthGoalsScreen';
import RemindersScreen from '../screens/Progress/RemindersScreen';
import ProgressScreen from '../screens/Progress/ProgressScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ initialRouteName }) {
  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Entrenamientos"
        component={ActividadFisicaScreen}
        options={{
          tabBarLabel: 'Entrenamientos',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="fitness-center" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Planes de Comida"
        component={PlanesDeComidaScreen}
        options={{
          tabBarLabel: 'Planes de Comida',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="restaurant-menu" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Foros"
        component={ForosScreen}
        options={{
          tabBarLabel: 'Foros',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="forum" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Configuracion"
        component={ConfiguracionesScreen}
        options={{
          tabBarLabel: 'Configuración',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" color={color} size={size} />
          ),
        }}
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
              options={{
                headerShown: true,
                title: 'Objetivos de Salud',
                headerBackTitle: 'Atrás'
              }}
            />
            {/* recordatorios */}
            <Stack.Screen
              name="Reminders"
              component={RemindersScreen}
              options={{
                headerShown: true,
                title: 'Recordatorios',
                headerBackTitle: 'Atrás'
              }}
            />
            <Stack.Screen name="Progress" component={ProgressScreen}
              options={{
                headerShown: true,
                title: 'Progreso',
                headerBackTitle: 'Atrás'
              }} 
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