import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { ConsumerTabParamList } from '../types/navigation.types';
import { ConsumerHomeScreen } from '../screens/consumer/HomeScreen';
import { OrderHistoryScreen } from '../screens/consumer/OrderHistoryScreen';
import { ConsumerWalletScreen } from '../screens/consumer/WalletScreen';
import { ConsumerProfileScreen } from '../screens/consumer/ProfileScreen';

const Tab = createBottomTabNavigator<ConsumerTabParamList>();

function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
  return <MaterialCommunityIcons name={name} color={color} size={size} />;
}

export function ConsumerTabs() {
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
      }}
    >
      <Tab.Screen
        name="Home"
        component={ConsumerHomeScreen}
        options={{
          title: 'Inicio',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderHistoryScreen}
        options={{
          title: 'Pedidos',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="clipboard-list" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={ConsumerWalletScreen}
        options={{
          title: 'Monedero',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="wallet" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ConsumerProfileScreen}
        options={{
          title: 'Perfil',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
