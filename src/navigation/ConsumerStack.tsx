import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { ConsumerTabs } from './ConsumerTabs';
import { PurifierDetailScreen } from '../screens/consumer/PurifierDetailScreen';
import { CreateOrderScreen } from '../screens/consumer/CreateOrderScreen';
import { ActiveOrderScreen } from '../screens/consumer/ActiveOrderScreen';
import { LoyaltyScreen } from '../screens/consumer/LoyaltyScreen';
import { SubscriptionsScreen } from '../screens/consumer/SubscriptionsScreen';
import { ReferralsScreen } from '../screens/consumer/ReferralsScreen';
import { SupportScreen } from '../screens/consumer/SupportScreen';

export type ConsumerStackParamList = {
  ConsumerTabs: undefined;
  PurifierDetail: { purifierId: string };
  CreateOrder: { purifierId?: string; purifierName?: string };
  ActiveOrder: { orderId: string };
  Loyalty: undefined;
  Subscriptions: undefined;
  Referrals: undefined;
  Support: undefined;
};

const Stack = createNativeStackNavigator<ConsumerStackParamList>();

export function ConsumerStack() {
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
        name="ConsumerTabs"
        component={ConsumerTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PurifierDetail"
        component={PurifierDetailScreen}
        options={{ title: 'Purificadora' }}
      />
      <Stack.Screen
        name="CreateOrder"
        component={CreateOrderScreen}
        options={{ title: 'Nuevo pedido' }}
      />
      <Stack.Screen
        name="ActiveOrder"
        component={ActiveOrderScreen}
        options={{ title: 'Mi pedido' }}
      />
      <Stack.Screen
        name="Loyalty"
        component={LoyaltyScreen}
        options={{ title: 'Puntos y lealtad' }}
      />
      <Stack.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
        options={{ title: 'Suscripciones' }}
      />
      <Stack.Screen
        name="Referrals"
        component={ReferralsScreen}
        options={{ title: 'Referidos' }}
      />
      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={{ title: 'Soporte' }}
      />
    </Stack.Navigator>
  );
}
