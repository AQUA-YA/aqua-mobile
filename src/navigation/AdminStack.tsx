import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { AdminTabs } from './AdminTabs';
import { AdminKycScreen } from '../screens/admin/KycScreen';
import { AdminCommissionsScreen } from '../screens/admin/CommissionsScreen';
import { AdminPromotionsScreen } from '../screens/admin/PromotionsScreen';
import { AdminSupportScreen } from '../screens/admin/SupportScreen';
import { AdminReportsScreen } from '../screens/admin/ReportsScreen';

export type AdminStackParamList = {
  AdminTabs: undefined;
  AdminKyc: undefined;
  AdminCommissions: undefined;
  AdminPromotions: undefined;
  AdminSupport: undefined;
  AdminReports: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="AdminTabs"
        component={AdminTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminKyc"
        component={AdminKycScreen}
        options={{ title: 'Verificaciones KYC' }}
      />
      <Stack.Screen
        name="AdminCommissions"
        component={AdminCommissionsScreen}
        options={{ title: 'Comisiones' }}
      />
      <Stack.Screen
        name="AdminPromotions"
        component={AdminPromotionsScreen}
        options={{ title: 'Promociones globales' }}
      />
      <Stack.Screen
        name="AdminSupport"
        component={AdminSupportScreen}
        options={{ title: 'Soporte' }}
      />
      <Stack.Screen
        name="AdminReports"
        component={AdminReportsScreen}
        options={{ title: 'Reportes' }}
      />
    </Stack.Navigator>
  );
}
