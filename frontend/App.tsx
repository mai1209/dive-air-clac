import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DiveLogsProvider } from './src/contex/DiveLogsContext';
import { LanguageProvider } from './src/i18n';
import { AppNavigator } from './src/navigation/AppNavigation';
import { AuthProvider } from './src/contex/AuthContext';

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <LanguageProvider>
        <AuthProvider>
          <DiveLogsProvider>
            <AppNavigator />
          </DiveLogsProvider>
        </AuthProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
};

export default App;
