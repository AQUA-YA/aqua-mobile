import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { DeliveryTabParamList } from '../types/navigation.types';
import { AvailableScreen } from '../screens/delivery/AvailableScreen';
import { DeliveryActiveScreen } from '../screens/delivery/ActiveScreen';
import { DeliveryHistoryScreen } from '../screens/delivery/HistoryScreen';
import { DeliveryWalletScreen } from '../screens/delivery/WalletScreen';
import { DeliveryProfileScreen } from '../screens/delivery/ProfileScreen';

const Tab = createBottomTabNavigator<DeliveryTabParamList>();

function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
  return <MaterialCommunityIcons name={name} color={color} size={size} />;
}

export function DeliveryTabs() {
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
        name="Available"
        component={AvailableScreen}
        options={{
          title: 'Disponibles',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="clipboard-list" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Active"
        component={DeliveryActiveScreen}
        options={{
          title: 'Activo',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="bike" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="DeliveryHistory"
        component={DeliveryHistoryScreen}
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="history" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="DeliveryWallet"
        component={DeliveryWalletScreen}
        options={{
          title: 'Monedero',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="wallet" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="DeliveryProfile"
        component={DeliveryProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
