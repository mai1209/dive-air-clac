import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DiveDetailScreen } from '../screens/DiveDetailScreen';
import { DiveGalleryScreen } from '../screens/DiveGalleryScreen';
import { HistoryScreen } from '../screens/HistoryScreen';

const Stack = createStackNavigator();

export const HistoryStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HistoryList" component={HistoryScreen} />
      <Stack.Screen name="DiveDetail" component={DiveDetailScreen} />
      <Stack.Screen name="DiveGallery" component={DiveGalleryScreen} />
    </Stack.Navigator>
  );
};
