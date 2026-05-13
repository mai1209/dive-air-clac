import React from 'react';
import { Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CalculatorScreen } from '../screens/CalculatorScreen';
import { HistoryStackNavigator } from './HistoryStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { StatsScreen } from '../screens/StatsScreen';
import {
  Calculator,
  ChartColumn,
  UserCog,
  History,
} from 'lucide-react-native';
import { useLanguage } from '../i18n';

const Tab = createBottomTabNavigator();

const COLORS = {
  bg: '#F3F7FC',
  surface: '#FFFFFF',
  primary: '#1A56DB',
  primarySoft: '#EAF2FF',
  inactive: '#8A9AB2',
  border: '#DDE8F7',
  shadow: '#7DA7D9',
};

const IconShell = ({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) => {
  return (
    <View
      style={{
        width: focused ? 42 : 36,
        height: 32,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? COLORS.primarySoft : 'transparent',
      }}
    >
      {children}
    </View>
  );
};

const renderCalculatorIcon = ({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) => (
  <IconShell focused={focused}>
    <Calculator color={color} size={focused ? 22 : 21} strokeWidth={2.4} />
  </IconShell>
);

const renderHistoryIcon = ({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) => (
  <IconShell focused={focused}>
    <History color={color} size={focused ? 22 : 21} strokeWidth={2.4} />
  </IconShell>
);

const renderStatsIcon = ({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) => (
  <IconShell focused={focused}>
    <ChartColumn color={color} size={focused ? 22 : 21} strokeWidth={2.4} />
  </IconShell>
);

const renderProfileIcon = ({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) => (
  <IconShell focused={focused}>
    <UserCog color={color} size={focused ? 22 : 21} strokeWidth={2.4} />
  </IconShell>
);

export const TabNavigator = () => {
  const { copy } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: Platform.OS === 'ios' ? 0 : 0,
          height: Platform.OS === 'ios' ? 76 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 12 : 10,
          paddingHorizontal: 20,
          backgroundColor: COLORS.surface,
         
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.16,
          shadowRadius: 26,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          marginTop: 2,
          letterSpacing: -0.1,
        },
        tabBarItemStyle: {
          borderRadius: 22,
          paddingVertical: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        sceneStyle: {
          backgroundColor: COLORS.bg,
        },
      }}
    >
      <Tab.Screen
        name="CalculadoraTab"
        component={CalculatorScreen}
        options={{
          tabBarLabel: copy.tabs.calculator,
          tabBarIcon: renderCalculatorIcon,
        }}
      />

      <Tab.Screen
        name="HistorialTab"
        component={HistoryStackNavigator}
        options={{
          tabBarLabel: copy.tabs.history,
          tabBarIcon: renderHistoryIcon,
        }}
      />

      <Tab.Screen
        name="StatsTab"
        component={StatsScreen}
        options={{
          tabBarLabel: copy.tabs.stats,
          tabBarIcon: renderStatsIcon,
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: copy.tabs.profile,
          tabBarIcon: renderProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};