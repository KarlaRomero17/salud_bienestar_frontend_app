import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

import HomeScreen from '../screens/Dashboard/HomeScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import LogoutScreen from '../screens/Auth/LogoutScreen';
//Importando screens relacionadas a Actividad Fisica
import TipoActividadScreen from '../screens/ActividadFisica/TipoActividadScreen';
import FuenteInformacionScreen from '../screens/ActividadFisica/FuenteInformacionScreen';
import ActividadFisicaScreen from '../screens/ActividadFisica/ActividadFisicaScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
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
        name="ActividadFisica"
        component={ActividadFisicaScreen}
        options={{
          tabBarLabel: 'Actividad',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="fitness-center" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="TipoActividad"
        component={TipoActividadScreen}
        options={{
          tabBarLabel: 'Tipos',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="FuenteInformacion"
        component={FuenteInformacionScreen}
        options={{
          tabBarLabel: 'Información',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="info" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Logout"
        component={LogoutScreen}
        options={{
          tabBarLabel: 'Cerrar Sesión',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="logout" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainTabs" component={MainTabs} />
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
