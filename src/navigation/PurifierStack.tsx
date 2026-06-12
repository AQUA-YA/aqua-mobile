import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { PurifierTabs } from './PurifierTabs';

export type PurifierStackParamList = {
  PurifierTabs: undefined;
};

const Stack = createNativeStackNavigator<PurifierStackParamList>();

export function PurifierStack() {
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
        name="PurifierTabs"
        component={PurifierTabs}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
