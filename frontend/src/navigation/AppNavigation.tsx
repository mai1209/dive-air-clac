import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { LoginScreen } from '../screens/LoginScreen';
import { RecoverPasswordScreen } from '../screens/RecoverPasswordScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { TabNavigator } from './TabNavigator'; 
import { useAuth } from '../contex/AuthContext';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { token, loading } = useAuth();

if (loading) return null;

return (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="MainApp" component={TabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="RecoverPassword" component={RecoverPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  </NavigationContainer>
);
};
