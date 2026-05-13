import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { DeleteAccountScreen } from '../screens/DeleteAccountScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { LanguageSettingsScreen } from '../screens/LanguageSettingsScreen';
import { PlansScreen } from '../screens/PlansScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { RecoverPasswordScreen } from '../screens/RecoverPasswordScreen';
import { SupportScreen } from '../screens/SupportScreen';

const Stack = createStackNavigator();

export const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="RecoverPassword" component={RecoverPasswordScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Plans" component={PlansScreen} />
    </Stack.Navigator>
  );
};
