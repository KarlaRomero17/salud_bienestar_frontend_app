import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

import HomeScreen from '../screens/Dashboard/HomeScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
//Importando screens relacionadas a Actividad Fisica
import TipoActividadScreen from '../screens/ActividadFisica/TipoActividadScreen';
import FuenteInformacionScreen from '../screens/ActividadFisica/FuenteInformacionScreen';
import ActividadFisicaScreen from '../screens/ActividadFisica/ActividadFisicaScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <Stack.Screen name="Login" component={ActividadFisicaScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
