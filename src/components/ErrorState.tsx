import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  // Mensaje principal opcional; por defecto indica que el servicio falló.
  message?: string;
  // Callback de reintento (normalmente el refetch de React Query).
  onRetry?: () => void;
  // Muestra spinner en el botón mientras se reintenta.
  retrying?: boolean;
  // Si false, no envuelve en SafeAreaView (útil dentro de listas/headers).
  fullScreen?: boolean;
}

// Estado de error reutilizable para pantallas cuyos datos vienen de una API.
// Muestra un mensaje claro y un botón para reintentar, evitando que la pantalla
// quede en blanco o que la app se rompa cuando el servicio no responde.
export function ErrorState({
  message = 'El servicio no está disponible en este momento. Verifica tu conexión e inténtalo de nuevo.',
  onRetry,
  retrying = false,
  fullScreen = true,
}: Props) {
  const theme = useTheme();

  const content = (
    <View style={styles.content}>
      <Text variant="titleMedium" style={styles.title}>
        No se pudo cargar la información
      </Text>
      <Text variant="bodyMedium" style={styles.message}>
        {message}
      </Text>
      {onRetry && (
        <Button
          mode="contained"
          onPress={onRetry}
          loading={retrying}
          style={styles.button}
        >
          Reintentar
        </Button>
      )}
    </View>
  );

  if (!fullScreen) {
    return content;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  message: { textAlign: 'center', opacity: 0.7, marginBottom: 24 },
  button: { minWidth: 160 },
});
