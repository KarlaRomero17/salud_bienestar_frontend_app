// src/navigation/AppNavigation.js

import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { AuthContext } from '../context/AuthContext'; // Si lo necesitas

// Importaciones de screens (asegúrate de que las rutas son correctas)
import DashboardScreen from '../screens/Dashboard/DashboardScreen'; 
import NuevaSesionScreen from '../screens/ActividadFisica/NuevaSesionScreen'; 
import AgregarActividadScreen from '../screens/ActividadFisica/AgregarActividadScreen';
import EstadisticasScreen from '../screens/ActividadFisica/EstadisticasScreen'; 

const Stack = createNativeStackNavigator();

// Definición del color primario
const PRIMARY_COLOR = '#2a8c4a';
const WHITE_COLOR = '#ffffff';

export default function AppNavigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator 
                initialRouteName="Dashboard"
                // 💚 ESTILOS GLOBALES DE CABECERA
                screenOptions={{
                    headerStyle: {
                        backgroundColor: PRIMARY_COLOR, // Fondo verde principal
                    },
                    headerTintColor: WHITE_COLOR, // Color de la flecha de atrás y texto (blanco)
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                {/* Pantalla principal que actúa como menú */}
                <Stack.Screen 
                    name="Dashboard" 
                    component={DashboardScreen} 
                    options={{ title: 'Actividad Fisica' }} 
                />
                
                {/* Flujo de Sesiones */}
                <Stack.Screen 
                    name="NuevaSesion" 
                    component={NuevaSesionScreen}
                    options={{ title: 'Mi Sesión' }}
                />
                 <Stack.Screen 
                    name="AgregarActividad" 
                    component={AgregarActividadScreen}
                    options={{ title: 'Añadir Ejercicio / Actividad' }}
                />

                {/* Pantalla de estadísticas */}
                <Stack.Screen 
                    name="Estadisticas" 
                    component={EstadisticasScreen}
                    options={{ title: 'Mis Estadísticas' }}
                />
                
            </Stack.Navigator>
        </NavigationContainer>
    );
}