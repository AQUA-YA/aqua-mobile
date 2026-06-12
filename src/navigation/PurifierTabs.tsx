import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { Icon } from 'react-native-paper';
import type { PurifierTabParamList } from '../types/navigation.types';
import { PurifierDashboardScreen } from '../screens/purifier/DashboardScreen';
import { PurifierOrdersScreen } from '../screens/purifier/OrdersScreen';
import { BusinessScreen } from '../screens/purifier/BusinessScreen';
import { PurifierWalletScreen } from '../screens/purifier/WalletScreen';
import { PurifierProfileScreen } from '../screens/purifier/ProfileScreen';

const Tab = createBottomTabNavigator<PurifierTabParamList>();

export function PurifierTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceVariant,
        },
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        tabBarLabelStyle: { fontSize: 12 },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="PurifierDashboard"
        component={PurifierDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Icon source="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="PurifierOrders"
        component={PurifierOrdersScreen}
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }) => (
            <Icon source="clipboard-list" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Business"
        component={BusinessScreen}
        options={{
          title: 'Negocio',
          tabBarIcon: ({ color, size }) => (
            <Icon source="store" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="PurifierWallet"
        component={PurifierWalletScreen}
        options={{
          title: 'Monedero',
          tabBarIcon: ({ color, size }) => (
            <Icon source="wallet" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="PurifierProfile"
        component={PurifierProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Icon source="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
