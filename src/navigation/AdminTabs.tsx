import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { AdminTabParamList } from '../types/navigation.types';
import { AdminDashboardScreen } from '../screens/admin/DashboardScreen';
import { AdminUsersScreen } from '../screens/admin/UsersScreen';
import { AdminPurifiersScreen } from '../screens/admin/PurifiersScreen';
import { AdminOrdersScreen } from '../screens/admin/OrdersScreen';
import { AdminCatalogsScreen } from '../screens/admin/CatalogsScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();

function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
  return <MaterialCommunityIcons name={name} color={color} size={size} />;
}

export function AdminTabs() {
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
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{
          title: 'Usuarios',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="account-multiple" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminPurifiers"
        component={AdminPurifiersScreen}
        options={{
          title: 'Purificadoras',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="store" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminOrders"
        component={AdminOrdersScreen}
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="clipboard-list" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminCatalogs"
        component={AdminCatalogsScreen}
        options={{
          title: 'Catálogos',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="database" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
