import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import axios from 'axios';
import { RootNavigator } from '../navigation/RootNavigator';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { lightTheme, darkTheme } from '../theme';
import { GlobalSnackbar } from '../components/GlobalSnackbar';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useSocketConnection } from '../hooks/useSocketEvents';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // No reintentar errores 4xx (auth, permisos, no encontrado): son
      // determinísticos y solo alargarían el spinner. Reintentar el resto
      // (red, 5xx) hasta 2 veces.
      retry: (failureCount, error) => {
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function AppContent() {
  const isDarkMode = useThemeStore(s => s.isDarkMode);
  const hydrate = useAuthStore(s => s.hydrate);

  useSocketConnection();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <PaperProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <ErrorBoundary>
        <RootNavigator />
      </ErrorBoundary>
      <GlobalSnackbar />
    </PaperProvider>
  );
}

export function AppProviders() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
