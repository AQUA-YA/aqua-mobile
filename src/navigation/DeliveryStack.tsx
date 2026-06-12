import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { DeliveryTabs } from './DeliveryTabs';
import { DeliveryActiveScreen } from '../screens/delivery/ActiveScreen';

export type DeliveryStackParamList = {
  DeliveryTabs: undefined;
  DeliveryActive: { orderId: string };
};

const Stack = createNativeStackNavigator<DeliveryStackParamList>();

export function DeliveryStack() {
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
        name="DeliveryTabs"
        component={DeliveryTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DeliveryActive"
        component={DeliveryActiveScreen}
        options={{ title: 'Pedido activo' }}
      />
    </Stack.Navigator>
  );
}
