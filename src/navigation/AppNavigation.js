import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

import HomeScreen from '../screens/Dashboard/HomeScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import HealthGoalsScreen from '../screens/Progress/HealthGoalsScreen';
import RemindersScreen from '../screens/Progress/RemindersScreen';
import ProgressScreen from '../screens/Progress/ProgressScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <Stack.Screen name="Objetivo" component={RemindersScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
