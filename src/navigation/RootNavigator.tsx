import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { AuthStack } from './AuthStack';
import { ConsumerStack } from './ConsumerStack';
import { PurifierStack } from './PurifierStack';
import { DeliveryStack } from './DeliveryStack';
import { AdminStack } from './AdminStack';

export function RootNavigator() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const activeMode = useThemeStore((s) => s.activeMode);

  if (!isHydrated) {
    return null;
  }

  const renderAppStack = () => {
    if (activeMode === 'admin' && user?.roles.includes('admin')) return <AdminStack />;
    if (activeMode === 'purifier' && user?.roles.includes('purifier')) return <PurifierStack />;
    if (activeMode === 'delivery' && user?.roles.includes('delivery')) return <DeliveryStack />;
    return <ConsumerStack />;
  };

  return (
    <NavigationContainer>
      {!accessToken ? <AuthStack /> : renderAppStack()}
    </NavigationContainer>
  );
}
